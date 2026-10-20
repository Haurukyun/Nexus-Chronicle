import { FantasyEra, MilestonePin, FantasyCalendar, FantasyMonth, FantasyLeapRule } from '../types';

export const DEFAULT_ERA_KEY = 'bc_ac';

/**
 * Standard fantasy era presets that worldbuilders can load with one click.
 */
export const DEFAULT_ERA_PRESETS: Record<string, { label: string; description: string; eras: FantasyEra[] }> = {
    bc_ac: {
        label: 'Christian Era (B.C. / A.C.)',
        description: 'Chronology centered on the incarnation: B.C. (Before Christ) and A.C. (After Christ).',
        eras: [
            { id: 'era-bc', name: 'Before Christ', abbreviation: 'B.C.', startYear: -4000, endYear: 0, color: '#a78bfa', description: 'Events and epochs prior to the incarnation of Christ.' },
            { id: 'era-ac', name: 'After Christ', abbreviation: 'A.C.', startYear: 0, endYear: 3000, color: '#38bdf8', description: 'Events and historical annals following the incarnation of Christ.' }
        ]
    },
    mythic: {
        label: 'Mythic Chronicle (Ages of Power)',
        description: 'Four grand cosmological eras based on the World Phases.',
        eras: [
            { id: 'era-genesis', name: 'Age of Genesis', abbreviation: 'AG', startYear: 0, endYear: 500, color: '#c084fc', description: 'Creation of ancient leylines and primordials.' },
            { id: 'era-zenith', name: 'Golden Zenith', abbreviation: 'GZ', startYear: 501, endYear: 1200, color: '#fef08a', description: 'Prosperity of great kingdoms and grand spires.' },
            { id: 'era-gloom', name: 'Twilit Gloom', abbreviation: 'TG', startYear: 1201, endYear: 1750, color: '#818cf8', description: 'Shadow fall, betrayal, and fracturing alliances.' },
            { id: 'era-eclipse', name: 'Blood Eclipse', abbreviation: 'BE', startYear: 1751, endYear: 2500, color: '#f87171', description: 'Current tumultuous epoch of warring guilds.' }
        ]
    },
    tolkien: {
        label: 'High Fantasy Ages (1st – 4th Age)',
        description: 'Sequential historic ages modeled after epic high-fantasy sagas.',
        eras: [
            { id: 'era-1a', name: 'First Age', abbreviation: '1A', startYear: 1, endYear: 1000, color: '#38bdf8', description: 'Dawn of magic and founding of the ancient realms.' },
            { id: 'era-2a', name: 'Second Age', abbreviation: '2A', startYear: 1001, endYear: 2200, color: '#fbbf24', description: 'Great expansion, naval empires, and forged relics.' },
            { id: 'era-3a', name: 'Third Age', abbreviation: '3A', startYear: 2201, endYear: 3200, color: '#f87171', description: 'The War of the Rings and downfall of shadow lords.' },
            { id: 'era-4a', name: 'Fourth Age', abbreviation: '4A', startYear: 3201, endYear: 4000, color: '#4ade80', description: 'The Age of Mortals and renewal of the world.' }
        ]
    },
    classical: {
        label: 'Classical Antiquity (B.C.E. / C.E.)',
        description: 'Chronology anchored to an imperial epoch dividing negative antiquity from common era.',
        eras: [
            { id: 'era-bce', name: 'Before Common Era', abbreviation: 'BCE', startYear: -2000, endYear: 0, color: '#a78bfa', description: 'Antiquity and pre-imperial city-states.' },
            { id: 'era-ce', name: 'Common Era', abbreviation: 'CE', startYear: 0, endYear: 2000, color: '#34d399', description: 'The Imperial Empire and modern annals.' }
        ]
    }
};

/**
 * Extracts a numeric year from a date string.
 * Supports:
 * - "1452" -> 1452
 * - "-500" -> -500
 * - "500 BCE", "300 BC", "50 B.C.", "1200 Before Christ" -> -500, -300, -50, -1200
 * - "120 AG", "Year 450", "450 3A", "2026 AC", "1492 A.C." -> 120, 450, 450, 2026, 1492
 * - "1452-05-12" -> 1452
 */
export function extractYear(dateStr?: string | null): number | null {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const trimmed = dateStr.trim();
    if (!trimmed) return null;

    // Check for BC / BCE suffix
    const isBce = /(?:^|\s|\d)(b\.?c\.?(?:e\.?)?|before\s+christ|before\s+common\s+era)(?:\s|$|\b)/i.test(trimmed);

    // If ISO date like "1452-05-12", grab the first number
    if (/^-?\d{3,5}-\d{1,2}/.test(trimmed)) {
        const isoMatch = trimmed.match(/^-?\d+/);
        if (isoMatch) return parseInt(isoMatch[0], 10);
    }

    // Look for all numbers in the string
    const numberMatches = trimmed.match(/-?\d+/g);
    if (!numberMatches || numberMatches.length === 0) return null;

    let year: number;
    if (numberMatches.length === 1) {
        year = parseInt(numberMatches[0], 10);
    } else {
        // Multiple numbers: find one that is likely a year (>= 100 or >= 3 digits)
        const multiDigit = numberMatches.find(n => Math.abs(parseInt(n, 10)) >= 100);
        if (multiDigit) {
            year = parseInt(multiDigit, 10);
        } else {
            // Priority 2: The last number in the string (e.g. "Day 12, Year 50")
            year = parseInt(numberMatches[numberMatches.length - 1], 10);
        }
    }

    if (isNaN(year)) return null;

    if (isBce && year > 0) {
        year = -year;
    }

    return year;
}

/**
 * Finds the corresponding Fantasy Era that encompasses a given numeric year.
 */
export function findEraForYear(year: number, eras: FantasyEra[] = []): FantasyEra | null {
    if (!eras || eras.length === 0) return null;
    return eras.find(era => {
        const start = era.startYear;
        const end = era.endYear !== undefined ? era.endYear : Infinity;
        return year >= start && year <= end;
    }) || null;
}

/**
 * Formats a year relative to an optional fantasy era.
 * E.g. (year=650, era={name: 'Golden Zenith', startYear: 501}) -> "GZ 150 (Year 650)"
 */
export function formatYearWithEra(year: number, eras: FantasyEra[] = []): string {
    const era = findEraForYear(year, eras);
    if (!era) {
        if (year < 0) return `${Math.abs(year)} BCE`;
        return `${year}`;
    }

    const relYear = year - era.startYear + 1;
    const tag = era.abbreviation || era.name;
    return `${tag} ${relYear} (Yr ${year})`;
}

export interface PackedTimelineItem<T> {
    item: T;
    lane: number;
}

/**
 * Packs timeline ribbons into optimal horizontal visual lanes using greedy interval scheduling.
 * Guarantees ribbons in the same lane do not overlap horizontally.
 */
export function packTimelineLanes<T extends { start: number; end: number }>(
    items: T[],
    laneGap: number = 5
): PackedTimelineItem<T>[] {
    if (!items || items.length === 0) return [];

    // Sort by start year ascending, then by duration descending
    const sorted = [...items].sort((a, b) => {
        if (a.start !== b.start) return a.start - b.start;
        return (b.end - b.start) - (a.end - a.start);
    });

    const lanesEnd: number[] = [];
    const packed: PackedTimelineItem<T>[] = [];

    for (const item of sorted) {
        let placedLane = -1;

        for (let l = 0; l < lanesEnd.length; l++) {
            if (item.start >= lanesEnd[l] + laneGap) {
                placedLane = l;
                lanesEnd[l] = item.end;
                break;
            }
        }

        if (placedLane === -1) {
            placedLane = lanesEnd.length;
            lanesEnd.push(item.end);
        }

        packed.push({ item, lane: placedLane });
    }

    return packed;
}

export const DEFAULT_CALENDAR_KEY = 'solar';

/**
 * Standard fantasy calendar presets.
 */
export const DEFAULT_CALENDAR_PRESETS: Record<string, { label: string; description: string; calendar: FantasyCalendar }> = {
    solar: {
        label: 'Solar Standard (Gregorian)',
        description: 'Standard 12-month solar cycle with 365 days and leap day on February 29th every 4 years.',
        calendar: {
            id: 'cal-solar',
            name: 'Solar Standard',
            description: 'Common solar calendar dividing 365.25 days into 12 uneven months.',
            yearSuffix: 'CE',
            daysPerWeek: 7,
            weekDayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            months: [
                { id: 'm-1', name: 'January', days: 31, abbreviation: 'Jan', season: 'winter' },
                { id: 'm-2', name: 'February', days: 28, abbreviation: 'Feb', season: 'winter' },
                { id: 'm-3', name: 'March', days: 31, abbreviation: 'Mar', season: 'spring' },
                { id: 'm-4', name: 'April', days: 30, abbreviation: 'Apr', season: 'spring' },
                { id: 'm-5', name: 'May', days: 31, abbreviation: 'May', season: 'spring' },
                { id: 'm-6', name: 'June', days: 30, abbreviation: 'Jun', season: 'summer' },
                { id: 'm-7', name: 'July', days: 31, abbreviation: 'Jul', season: 'summer' },
                { id: 'm-8', name: 'August', days: 31, abbreviation: 'Aug', season: 'summer' },
                { id: 'm-9', name: 'September', days: 30, abbreviation: 'Sep', season: 'autumn' },
                { id: 'm-10', name: 'October', days: 31, abbreviation: 'Oct', season: 'autumn' },
                { id: 'm-11', name: 'November', days: 30, abbreviation: 'Nov', season: 'autumn' },
                { id: 'm-12', name: 'December', days: 31, abbreviation: 'Dec', season: 'winter' }
            ],
            leapRule: {
                frequency: 4,
                extraDays: 1,
                targetMonthId: 'm-2',
                leapDayName: 'February 29'
            }
        }
    },
    tamriel: {
        label: 'Tamrielic Calendar (The Elder Scrolls)',
        description: 'Standard 12-month calendar of Tamriel with 365 days, 7-day weeks (Sundas to Loredas), and quadrennial leap day in Sun\'s Dawn.',
        calendar: {
            id: 'cal-tamriel',
            name: 'Calendar of Tamriel',
            description: 'The official calendar used throughout the Empire of Tamriel across Cyrodiil, Skyrim, Morrowind, and High Rock.',
            yearSuffix: '4E',
            daysPerWeek: 7,
            weekDayNames: ['Sundas', 'Morndas', 'Tirdas', 'Middas', 'Turdas', 'Fredas', 'Loredas'],
            months: [
                { id: 'm-1', name: 'Morning Star', days: 31, abbreviation: 'Morn', season: 'winter' },
                { id: 'm-2', name: "Sun's Dawn", days: 28, abbreviation: 'SDaw', season: 'winter' },
                { id: 'm-3', name: 'First Seed', days: 31, abbreviation: 'FSee', season: 'spring' },
                { id: 'm-4', name: "Rain's Hand", days: 30, abbreviation: 'RHan', season: 'spring' },
                { id: 'm-5', name: 'Second Seed', days: 31, abbreviation: 'SSee', season: 'spring' },
                { id: 'm-6', name: 'Mid Year', days: 30, abbreviation: 'MidY', season: 'summer' },
                { id: 'm-7', name: "Sun's Height", days: 31, abbreviation: 'SHgt', season: 'summer' },
                { id: 'm-8', name: 'Last Seed', days: 31, abbreviation: 'LSee', season: 'summer' },
                { id: 'm-9', name: 'Hearthfire', days: 30, abbreviation: 'Hfir', season: 'autumn' },
                { id: 'm-10', name: 'Frostfall', days: 31, abbreviation: 'Ffal', season: 'autumn' },
                { id: 'm-11', name: "Sun's Dusk", days: 30, abbreviation: 'SDus', season: 'autumn' },
                { id: 'm-12', name: 'Evening Star', days: 31, abbreviation: 'Even', season: 'winter' }
            ],
            leapRule: {
                frequency: 4,
                extraDays: 1,
                targetMonthId: 'm-2',
                leapDayName: "Sun's Dawn Leap Day"
            }
        }
    },
    harptos: {
        label: 'Calendar of Harptos (Faerûn / D&D)',
        description: '12 months of 30 days, plus 5 seasonal festival days and a quadrennial Shieldmeet leap day. 10-day Tendays.',
        calendar: {
            id: 'cal-harptos',
            name: 'Calendar of Harptos',
            description: 'The standard reckoning of Faerûn, dividing the solar year into 12 months of 30 days with 5 intercalary festivals.',
            yearSuffix: 'DR',
            daysPerWeek: 10,
            weekDayNames: ['Firstday', 'Secondday', 'Thirdday', 'Fourthday', 'Fifthday', 'Sixthday', 'Seventhday', 'Eighthday', 'Ninthday', 'Ride'],
            months: [
                { id: 'm-1', name: 'Hammer', days: 30, abbreviation: 'Ham', season: 'winter' },
                { id: 'f-1', name: 'Midwinter', days: 1, abbreviation: 'MidW', season: 'winter', isIntercalary: true },
                { id: 'm-2', name: 'Alturiak', days: 30, abbreviation: 'Alt', season: 'winter' },
                { id: 'm-3', name: 'Ches', days: 30, abbreviation: 'Ches', season: 'spring' },
                { id: 'm-4', name: 'Tarsakh', days: 30, abbreviation: 'Tar', season: 'spring' },
                { id: 'f-2', name: 'Greengrass', days: 1, abbreviation: 'Ggrs', season: 'spring', isIntercalary: true },
                { id: 'm-5', name: 'Mirtul', days: 30, abbreviation: 'Mir', season: 'spring' },
                { id: 'm-6', name: 'Kythorn', days: 30, abbreviation: 'Kyt', season: 'summer' },
                { id: 'm-7', name: 'Flamerule', days: 30, abbreviation: 'Fla', season: 'summer' },
                { id: 'f-3', name: 'Midsummer', days: 1, abbreviation: 'MidS', season: 'summer', isIntercalary: true },
                { id: 'm-8', name: 'Eleasis', days: 30, abbreviation: 'Elea', season: 'summer' },
                { id: 'm-9', name: 'Eleint', days: 30, abbreviation: 'Elei', season: 'autumn' },
                { id: 'f-4', name: 'Highharvestide', days: 1, abbreviation: 'Hhar', season: 'autumn', isIntercalary: true },
                { id: 'm-10', name: 'Marpenoth', days: 30, abbreviation: 'Mar', season: 'autumn' },
                { id: 'm-11', name: 'Uktar', days: 30, abbreviation: 'Ukt', season: 'autumn' },
                { id: 'f-5', name: 'The Feast of the Moon', days: 1, abbreviation: 'Moon', season: 'autumn', isIntercalary: true },
                { id: 'm-12', name: 'Nightal', days: 30, abbreviation: 'Nigh', season: 'winter' }
            ],
            leapRule: {
                frequency: 4,
                extraDays: 1,
                targetMonthId: 'f-3',
                leapDayName: 'Shieldmeet'
            }
        }
    },
    golarion: {
        label: 'Absalom Reckoning (Golarion / Pathfinder)',
        description: '12 months modeled after the astrological zodiac with 52 seven-day weeks and a leap year in Calistril.',
        calendar: {
            id: 'cal-golarion',
            name: 'Absalom Reckoning',
            description: 'The most widespread calendar on Golarion, dating from the founding of Absalom by Aroden in 1 AR.',
            yearSuffix: 'AR',
            daysPerWeek: 7,
            weekDayNames: ['Moonday', 'Toilday', 'Wealday', 'Oathday', 'Fireday', 'Starday', 'Sunday'],
            months: [
                { id: 'm-1', name: 'Abadius', days: 31, abbreviation: 'Aba', season: 'winter' },
                { id: 'm-2', name: 'Calistril', days: 28, abbreviation: 'Cal', season: 'winter' },
                { id: 'm-3', name: 'Pharast', days: 31, abbreviation: 'Pha', season: 'spring' },
                { id: 'm-4', name: 'Gozran', days: 30, abbreviation: 'Goz', season: 'spring' },
                { id: 'm-5', name: 'Sarenith', days: 31, abbreviation: 'Sar', season: 'spring' },
                { id: 'm-6', name: 'Erastus', days: 31, abbreviation: 'Era', season: 'summer' },
                { id: 'm-7', name: 'Arodus', days: 31, abbreviation: 'Aro', season: 'summer' },
                { id: 'm-8', name: 'Rova', days: 30, abbreviation: 'Rov', season: 'autumn' },
                { id: 'm-9', name: 'Lamashan', days: 31, abbreviation: 'Lam', season: 'autumn' },
                { id: 'm-10', name: 'Neth', days: 30, abbreviation: 'Net', season: 'autumn' },
                { id: 'm-11', name: 'Kuthona', days: 31, abbreviation: 'Kut', season: 'winter' }
            ],
            leapRule: {
                frequency: 4,
                extraDays: 1,
                targetMonthId: 'm-2',
                leapDayName: 'Calistril Leap Day'
            }
        }
    },
    tolkien: {
        label: "Kings' Reckoning (Middle-earth / Tolkien)",
        description: '12 months of 30 days, flanked by 3 festive holiday days (Yestarë, Loëndë, Mettarë) and double Enderi in leap years.',
        calendar: {
            id: 'cal-tolkien',
            name: "Kings' Reckoning",
            description: 'The ancient Númenórean calendar later adopted by Arnor and Gondor.',
            yearSuffix: 'TA',
            daysPerWeek: 7,
            weekDayNames: ['Elenya', 'Anarya', 'Isilya', 'Aldúya', 'Menelya', 'Valanya', 'Tarion'],
            months: [
                { id: 'f-1', name: 'Yestarë', days: 1, abbreviation: 'Yest', season: 'winter', isIntercalary: true },
                { id: 'm-1', name: 'Narvinyë', days: 30, abbreviation: 'Nar', season: 'winter' },
                { id: 'm-2', name: 'Nénimë', days: 30, abbreviation: 'Nén', season: 'winter' },
                { id: 'm-3', name: 'Súlimë', days: 30, abbreviation: 'Súl', season: 'spring' },
                { id: 'm-4', name: 'Viressë', days: 30, abbreviation: 'Vir', season: 'spring' },
                { id: 'm-5', name: 'Lótessë', days: 30, abbreviation: 'Lót', season: 'spring' },
                { id: 'm-6', name: 'Nárië', days: 30, abbreviation: 'Nár', season: 'summer' },
                { id: 'f-2', name: 'Loëndë', days: 1, abbreviation: 'Loën', season: 'summer', isIntercalary: true },
                { id: 'm-7', name: 'Cermië', days: 30, abbreviation: 'Cer', season: 'summer' },
                { id: 'm-8', name: 'Urimë', days: 30, abbreviation: 'Uri', season: 'summer' },
                { id: 'm-9', name: 'Yavannië', days: 30, abbreviation: 'Yav', season: 'autumn' },
                { id: 'm-10', name: 'Narquelië', days: 30, abbreviation: 'Narq', season: 'autumn' },
                { id: 'm-11', name: 'Hísimë', days: 30, abbreviation: 'Hís', season: 'autumn' },
                { id: 'm-12', name: 'Ringarë', days: 30, abbreviation: 'Ring', season: 'winter' },
                { id: 'f-3', name: 'Mettarë', days: 1, abbreviation: 'Mett', season: 'winter', isIntercalary: true }
            ],
            leapRule: {
                frequency: 4,
                extraDays: 1,
                targetMonthId: 'f-2',
                leapDayName: 'Enderi (Middle-days)'
            }
        }
    }
};

/**
 * Checks whether a given year qualifies as a leap year according to the calendar rules.
 */
export function isLeapYear(year: number, cal?: FantasyCalendar): boolean {
    if (!cal?.leapRule || !cal.leapRule.frequency || cal.leapRule.frequency <= 0) return false;
    return Math.abs(year) % cal.leapRule.frequency === 0;
}

/**
 * Calculates the total number of days in a year for a given calendar.
 */
export function getDaysInYear(year: number, cal?: FantasyCalendar): number {
    if (!cal || !cal.months || cal.months.length === 0) return 365;
    const baseDays = cal.months.reduce((sum, m) => sum + (m.days || 0), 0);
    if (isLeapYear(year, cal) && cal.leapRule) {
        return baseDays + (cal.leapRule.extraDays || 0);
    }
    return baseDays;
}

export interface EffectiveMonth {
    id: string;
    name: string;
    days: number;
    abbreviation?: string;
    season?: string;
    isIntercalary?: boolean;
    startDayOfYear: number;
    endDayOfYear: number;
}

/**
 * Resolves the list of months for a specific year, including any leap day adjustments.
 */
export function getEffectiveMonthsForYear(year: number, cal: FantasyCalendar): EffectiveMonth[] {
    const isLeap = isLeapYear(year, cal);
    let runningDay = 1;

    return cal.months.map(m => {
        let days = m.days || 1;
        if (isLeap && cal.leapRule && (cal.leapRule.targetMonthId === m.id || (!cal.leapRule.targetMonthId && m.name === 'February'))) {
            days += (cal.leapRule.extraDays || 0);
        }
        const startDayOfYear = runningDay;
        const endDayOfYear = runningDay + days - 1;
        runningDay += days;

        return {
            ...m,
            days,
            startDayOfYear,
            endDayOfYear
        };
    });
}

/**
 * Converts a floating-point year representation (e.g. 1372.45) into an exact fantasy date.
 */
export function yearFractionToCalendar(yearWithFrac: number, cal: FantasyCalendar) {
    const year = Math.floor(yearWithFrac);
    let frac = yearWithFrac - year;
    if (frac < 0) frac += 1;

    const totalDays = getDaysInYear(year, cal);
    const dayOfYear = Math.min(totalDays, Math.max(1, Math.floor(frac * totalDays) + 1));
    const effectiveMonths = getEffectiveMonthsForYear(year, cal);

    let matchedMonth = effectiveMonths[0];
    let dayInMonth = 1;

    for (const m of effectiveMonths) {
        if (dayOfYear >= m.startDayOfYear && dayOfYear <= m.endDayOfYear) {
            matchedMonth = m;
            dayInMonth = dayOfYear - m.startDayOfYear + 1;
            break;
        }
    }

    // Calculate weekday name if defined
    let weekdayName: string | undefined;
    if (cal.daysPerWeek > 0 && cal.weekDayNames && cal.weekDayNames.length > 0) {
        const weekdayIndex = (dayOfYear - 1) % cal.daysPerWeek;
        weekdayName = cal.weekDayNames[weekdayIndex] || `Day ${weekdayIndex + 1}`;
    }

    return {
        year,
        dayOfYear,
        totalDays,
        monthName: matchedMonth.name,
        monthAbbreviation: matchedMonth.abbreviation || matchedMonth.name.substring(0, 3),
        day: dayInMonth,
        isIntercalary: Boolean(matchedMonth.isIntercalary),
        season: matchedMonth.season,
        weekdayName
    };
}

/**
 * Parses any fantasy date string against a calendar (supports "14 Ches, 1372", "1372-04-14", "Midsummer 1372", etc.)
 */
export function parseFantasyDate(dateStr?: string | null, cal?: FantasyCalendar) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const trimmed = dateStr.trim();
    if (!trimmed) return null;

    const year = extractYear(trimmed);
    if (year === null) return null;

    if (!cal || !cal.months || cal.months.length === 0) {
        return { year, raw: trimmed };
    }

    const lower = trimmed.toLowerCase();
    
    // Check if an intercalary festival or month name is mentioned
    let matchedMonth: FantasyMonth | null = null;
    let matchedMonthIdx = -1;

    for (let i = 0; i < cal.months.length; i++) {
        const m = cal.months[i];
        const mLower = m.name.toLowerCase();
        const abbrLower = m.abbreviation?.toLowerCase();

        if (lower.includes(mLower) || (abbrLower && new RegExp(`\\b${abbrLower}\\b`, 'i').test(lower))) {
            matchedMonth = m;
            matchedMonthIdx = i;
            break;
        }
    }

    // Look for day number
    let day: number | undefined;
    const dayMatches = trimmed.match(/\b([1-9]|[12]\d|3[01])\b/g);
    if (dayMatches && dayMatches.length > 0) {
        // Find match that is NOT the year
        const yearStr = Math.abs(year).toString();
        const nonYearMatch = dayMatches.find(m => m !== yearStr);
        if (nonYearMatch) {
            day = parseInt(nonYearMatch, 10);
        }
    }

    return {
        year,
        monthIndex: matchedMonthIdx >= 0 ? matchedMonthIdx : undefined,
        monthName: matchedMonth?.name,
        day,
        isIntercalary: matchedMonth?.isIntercalary,
        raw: trimmed
    };
}

/**
 * Formats a calendar date into a rich lore string.
 */
export function formatFantasyDate(
    year: number,
    monthName?: string,
    day?: number,
    isIntercalary?: boolean,
    cal?: FantasyCalendar
): string {
    const suffix = cal?.yearSuffix ? ` ${cal.yearSuffix}` : '';
    if (isIntercalary && monthName) {
        return `${monthName}, ${year}${suffix}`;
    }
    if (monthName && day !== undefined) {
        return `${day} ${monthName}, ${year}${suffix}`;
    }
    if (monthName) {
        return `${monthName}, ${year}${suffix}`;
    }
    return `${year}${suffix}`;
}

/**
 * Formats a hovering scrubber decimal year taking into account the active calendar.
 */
export function formatHoveredYearWithCalendar(
    decimalYear: number,
    eras: FantasyEra[] = [],
    cal?: FantasyCalendar
): string {
    const yearInt = Math.floor(decimalYear);
    const eraStr = formatYearWithEra(yearInt, eras);

    if (!cal || !cal.months || cal.months.length === 0) {
        return eraStr;
    }

    const dateDetails = yearFractionToCalendar(decimalYear, cal);
    const suffix = cal.yearSuffix ? ` ${cal.yearSuffix}` : '';

    if (dateDetails.isIntercalary) {
        return `${eraStr}${suffix} · ${dateDetails.monthName} (Festival Day ${dateDetails.dayOfYear}/${dateDetails.totalDays})`;
    }

    const weekdayPart = dateDetails.weekdayName ? ` · ${dateDetails.weekdayName}` : '';
    return `${eraStr}${suffix} · ${dateDetails.monthName} ${dateDetails.day} (Day ${dateDetails.dayOfYear}/${dateDetails.totalDays})${weekdayPart}`;
}

/**
 * Calculates optimal step size for timeline ticks based on year span and pixel width.
 * Aims to keep tick labels at least minPixelGap apart (default ~65px).
 * Candidate steps: 1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000...
 */
export function calculateDynamicTickStep(yearSpan: number, canvasWidth: number, minPixelGap = 65): number {
    const pxPerYear = canvasWidth / Math.max(yearSpan, 1);
    const candidateSteps = [
        1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500,
        1000, 2000, 2500, 5000, 10000, 25000, 50000, 100000
    ];
    for (const step of candidateSteps) {
        if (step * pxPerYear >= minPixelGap) {
            return step;
        }
    }
    return 100000;
}

export interface TimelineTick {
    year: number;
    pct: number;
    isMajor: boolean;
}

/**
 * Generates an array of timeline ticks with computed percentages and major/minor designation.
 */
export function generateTimelineTicks(
    minYear: number,
    maxYear: number,
    yearSpan: number,
    step: number
): TimelineTick[] {
    const ticks: TimelineTick[] = [];
    if (yearSpan <= 0 || step <= 0) return ticks;

    const start = Math.ceil(minYear / step) * step;
    const end = Math.floor(maxYear / step) * step;

    let majorFactor = 5;
    if (step === 1) majorFactor = 10; // major diamond every 10 years on annual zoom
    else if (step === 2) majorFactor = 5;
    else if (step === 5) majorFactor = 5; // major every 25
    else if (step === 10) majorFactor = 5; // major every 50
    else if (step === 20 || step === 25) majorFactor = 4; // major every 100
    else if (step === 50) majorFactor = 5; // major every 250
    else if (step === 100) majorFactor = 5; // major every 500
    else majorFactor = 5;

    for (let y = start; y <= end; y += step) {
        const pct = ((y - minYear) / yearSpan) * 100;
        const isMajor = Math.abs(y % (step * majorFactor)) < 0.001 || y === 0;
        ticks.push({ year: y, pct, isMajor });
    }

    return ticks;
}

