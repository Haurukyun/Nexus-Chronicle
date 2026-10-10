import { FantasyEra, MilestonePin } from '../types';

/**
 * Standard fantasy era presets that worldbuilders can load with one click.
 */
export const DEFAULT_ERA_PRESETS: Record<string, { label: string; description: string; eras: FantasyEra[] }> = {
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
            { id: 'era-ce', name: 'Common Era', abbreviation: 'CE', startYear: 1, endYear: 2000, color: '#34d399', description: 'The Imperial Empire and modern annals.' }
        ]
    }
};

/**
 * Extracts a numeric year from a date string.
 * Supports:
 * - "1452" -> 1452
 * - "-500" -> -500
 * - "500 BCE", "300 BC", "50 B.C." -> -500, -300, -50
 * - "120 AG", "Year 450", "450 3A" -> 120, 450, 450
 * - "1452-05-12" -> 1452
 */
export function extractYear(dateStr?: string | null): number | null {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const trimmed = dateStr.trim();
    if (!trimmed) return null;

    // Check for BC / BCE suffix
    const isBce = /\b(b\.?c\.?e?|before\s+common\s+era)\b/i.test(trimmed);

    // Look for numbers (optional leading minus)
    const match = trimmed.match(/-?\d+/);
    if (!match) return null;

    let year = parseInt(match[0], 10);
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
