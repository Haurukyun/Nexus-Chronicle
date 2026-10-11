import { describe, it, expect } from 'vitest';
import {
    extractYear,
    findEraForYear,
    formatYearWithEra,
    packTimelineLanes,
    DEFAULT_ERA_PRESETS,
    DEFAULT_CALENDAR_PRESETS,
    isLeapYear,
    getDaysInYear,
    parseFantasyDate,
    formatFantasyDate,
    yearFractionToCalendar,
    formatHoveredYearWithCalendar
} from './timelineUtils';
import { FantasyEra } from '../types';

describe('Timeline Utilities & Fantasy Eras', () => {
    describe('extractYear', () => {
        it('extracts positive and negative standard years', () => {
            expect(extractYear('1452')).toBe(1452);
            expect(extractYear('-500')).toBe(-500);
            expect(extractYear('Year 450')).toBe(450);
            expect(extractYear('0')).toBe(0);
        });

        it('handles BC and BCE notations by converting to negative values', () => {
            expect(extractYear('500 BCE')).toBe(-500);
            expect(extractYear('323 BC')).toBe(-323);
            expect(extractYear('44 B.C.')).toBe(-44);
            expect(extractYear('1200 Before Common Era')).toBe(-1200);
        });

        it('handles date strings with suffixes or ISO formats', () => {
            expect(extractYear('1452-05-12')).toBe(1452);
            expect(extractYear('120 AG')).toBe(120);
            expect(extractYear('3021 3A')).toBe(3021);
            expect(extractYear(null)).toBeNull();
            expect(extractYear('')).toBeNull();
            expect(extractYear('Unknown Era')).toBeNull();
        });
    });

    describe('findEraForYear & formatYearWithEra', () => {
        const testEras: FantasyEra[] = [
            { id: '1', name: 'Dawn Era', abbreviation: 'DE', startYear: 0, endYear: 500 },
            { id: '2', name: 'Golden Zenith', abbreviation: 'GZ', startYear: 501, endYear: 1200 },
            { id: '3', name: 'Twilight War', abbreviation: 'TW', startYear: 1201, endYear: 2000 }
        ];

        it('identifies the encompassing era correctly', () => {
            expect(findEraForYear(250, testEras)?.name).toBe('Dawn Era');
            expect(findEraForYear(501, testEras)?.name).toBe('Golden Zenith');
            expect(findEraForYear(1500, testEras)?.name).toBe('Twilight War');
            expect(findEraForYear(2500, testEras)).toBeNull();
            expect(findEraForYear(-100, testEras)).toBeNull();
        });

        it('formats years relative to their era baseline', () => {
            // Year 650 is 150 years into Golden Zenith (starts 501)
            expect(formatYearWithEra(650, testEras)).toBe('GZ 150 (Yr 650)');
            // Year 2500 has no era
            expect(formatYearWithEra(2500, testEras)).toBe('2500');
            // Negative year has no era
            expect(formatYearWithEra(-450, testEras)).toBe('450 BCE');
        });
    });

    describe('packTimelineLanes', () => {
        it('distributes non-overlapping intervals across minimal lanes', () => {
            const items = [
                { id: 'a', start: 100, end: 200 },
                { id: 'b', start: 150, end: 250 }, // overlaps with 'a'
                { id: 'c', start: 220, end: 300 }, // can share lane with 'a'
                { id: 'd', start: 120, end: 180 }, // overlaps with 'a' and 'b'
            ];

            const packed = packTimelineLanes(items, 5);
            expect(packed).toHaveLength(4);

            // 'a' and 'c' do not overlap (100-200 and 220-300), so 'c' should reuse lane of 'a'
            const itemA = packed.find(p => p.item.id === 'a')!;
            const itemC = packed.find(p => p.item.id === 'c')!;
            expect(itemA.lane).toBe(itemC.lane);

            // 'b' overlaps with 'a', so it must be in a different lane
            const itemB = packed.find(p => p.item.id === 'b')!;
            expect(itemB.lane).not.toBe(itemA.lane);
        });
    });

    describe('DEFAULT_ERA_PRESETS', () => {
        it('includes bc_ac, mythic, tolkien, and classical era presets', () => {
            expect(DEFAULT_ERA_PRESETS.bc_ac.eras.length).toBe(2);
            expect(DEFAULT_ERA_PRESETS.bc_ac.eras[0].abbreviation).toBe('B.C.');
            expect(DEFAULT_ERA_PRESETS.bc_ac.eras[1].abbreviation).toBe('A.C.');
            expect(DEFAULT_ERA_PRESETS.mythic.eras.length).toBeGreaterThan(0);
            expect(DEFAULT_ERA_PRESETS.tolkien.eras.length).toBe(4);
            expect(DEFAULT_ERA_PRESETS.classical.eras.length).toBe(2);
        });
    });

    describe('Fantasy Calendar System', () => {
        const harptos = DEFAULT_CALENDAR_PRESETS.harptos.calendar;
        const solar = DEFAULT_CALENDAR_PRESETS.solar.calendar;
        const tamriel = DEFAULT_CALENDAR_PRESETS.tamriel.calendar;

        it('calculates standard and leap year days correctly', () => {
            // Harptos: 12 * 30 = 360 + 5 festivals = 365 days
            expect(getDaysInYear(1371, harptos)).toBe(365);
            expect(isLeapYear(1371, harptos)).toBe(false);

            // Year 1372 is divisible by 4 -> Shieldmeet leap day added -> 366 days
            expect(isLeapYear(1372, harptos)).toBe(true);
            expect(getDaysInYear(1372, harptos)).toBe(366);

            // Solar Standard (Gregorian)
            expect(getDaysInYear(2023, solar)).toBe(365);
            expect(getDaysInYear(2024, solar)).toBe(366);

            // The Elder Scrolls (Tamriel)
            expect(getDaysInYear(201, tamriel)).toBe(365);
            expect(getDaysInYear(200, tamriel)).toBe(366);
            expect(tamriel.months).toHaveLength(12);
            expect(tamriel.weekDayNames).toHaveLength(7);
        });

        it('parses fantasy dates with month names, day numbers, and festival days', () => {
            const parsed1 = parseFantasyDate('14 Ches, 1372 DR', harptos);
            expect(parsed1?.year).toBe(1372);
            expect(parsed1?.monthName).toBe('Ches');
            expect(parsed1?.day).toBe(14);
            expect(parsed1?.isIntercalary).toBeFalsy();

            const parsedFestival = parseFantasyDate('Midsummer, 1372', harptos);
            expect(parsedFestival?.year).toBe(1372);
            expect(parsedFestival?.monthName).toBe('Midsummer');
            expect(parsedFestival?.isIntercalary).toBe(true);
        });

        it('formats rich fantasy dates properly', () => {
            expect(formatFantasyDate(1372, 'Ches', 14, false, harptos)).toBe('14 Ches, 1372 DR');
            expect(formatFantasyDate(1372, 'Midsummer', undefined, true, harptos)).toBe('Midsummer, 1372 DR');
            expect(formatFantasyDate(1452, undefined, undefined, false, harptos)).toBe('1452 DR');
        });

        it('converts year fractions to exact fantasy calendar date breakdown', () => {
            // Beginning of year in Harptos: Hammer 1
            const start = yearFractionToCalendar(1372.0, harptos);
            expect(start.year).toBe(1372);
            expect(start.monthName).toBe('Hammer');
            expect(start.day).toBe(1);
            expect(start.weekdayName).toBe('Firstday');

            // Day 31 in Harptos is Midwinter (festival)
            // 31 / 366 ≈ 0.083
            const midwinter = yearFractionToCalendar(1372.083, harptos);
            expect(midwinter.monthName).toBe('Midwinter');
            expect(midwinter.isIntercalary).toBe(true);
        });

        it('formats temporal scrubber hover string with era and calendar details', () => {
            const eras = [
                { id: '1', name: 'Golden Zenith', abbreviation: 'GZ', startYear: 1000, endYear: 2000 }
            ];
            const hovered = formatHoveredYearWithCalendar(1372.0, eras, harptos);
            expect(hovered).toContain('GZ 373 (Yr 1372) DR');
            expect(hovered).toContain('Hammer 1');
        });

        it('supports exporting, importing and cloning custom calendar presets', () => {
            const customPreset = {
                ...tamriel,
                id: 'custom_preset_1',
                name: 'Cyrodiil Imperial Reckoning',
                description: 'Custom Imperial preset for worldbuilding'
            };
            const json = JSON.stringify(customPreset, null, 2);
            const imported = JSON.parse(json);
            expect(imported.name).toBe('Cyrodiil Imperial Reckoning');
            expect(imported.months).toHaveLength(12);
            expect(getDaysInYear(201, imported)).toBe(365);
        });
    });
});
