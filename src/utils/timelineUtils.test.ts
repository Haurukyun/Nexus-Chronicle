import { describe, it, expect } from 'vitest';
import {
    extractYear,
    findEraForYear,
    formatYearWithEra,
    packTimelineLanes,
    DEFAULT_ERA_PRESETS
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
        it('includes mythic, tolkien, and classical era presets', () => {
            expect(DEFAULT_ERA_PRESETS.mythic.eras.length).toBeGreaterThan(0);
            expect(DEFAULT_ERA_PRESETS.tolkien.eras.length).toBe(4);
            expect(DEFAULT_ERA_PRESETS.classical.eras.length).toBe(2);
        });
    });
});
