import { describe, it, expect } from 'vitest';
import {
    isEntityDeceased,
    isEntityCategory,
    isEntityFinished,
    isEntityMinor,
    getEntityAliases,
} from './documentModeUtils';

describe('documentModeUtils', () => {
    describe('isEntityDeceased', () => {
        it('returns true when deadSwitch is true', () => {
            expect(isEntityDeceased({ deadSwitch: true })).toBe(true);
        });

        it('returns true when isDead legacy flag is true', () => {
            expect(isEntityDeceased({ isDead: true })).toBe(true);
        });

        it('returns true when deathDate is non-empty string', () => {
            expect(isEntityDeceased({ deathDate: 'Year 452 of the Second Age' })).toBe(true);
        });

        it('returns true when dateOfDeath is non-empty string', () => {
            expect(isEntityDeceased({ dateOfDeath: '1420' })).toBe(true);
        });

        it('returns false when alive or empty fields', () => {
            expect(isEntityDeceased(null)).toBe(false);
            expect(isEntityDeceased({})).toBe(false);
            expect(isEntityDeceased({ deadSwitch: false, deathDate: '   ' })).toBe(false);
        });
    });

    describe('isEntityCategory', () => {
        it('detects category switch and legacy alias', () => {
            expect(isEntityCategory({ categorySwitch: true })).toBe(true);
            expect(isEntityCategory({ isCategory: true })).toBe(true);
            expect(isEntityCategory({ categorySwitch: false })).toBe(false);
            expect(isEntityCategory(null)).toBe(false);
        });
    });

    describe('isEntityFinished', () => {
        it('detects finished switch and legacy alias', () => {
            expect(isEntityFinished({ finishedSwitch: true })).toBe(true);
            expect(isEntityFinished({ isFinished: true })).toBe(true);
            expect(isEntityFinished({ finishedSwitch: false })).toBe(false);
            expect(isEntityFinished(null)).toBe(false);
        });
    });

    describe('isEntityMinor', () => {
        it('detects minor document switch and legacy alias', () => {
            expect(isEntityMinor({ minorSwitch: true })).toBe(true);
            expect(isEntityMinor({ isMinorDocument: true })).toBe(true);
            expect(isEntityMinor({ minorSwitch: false })).toBe(false);
            expect(isEntityMinor(null)).toBe(false);
        });
    });

    describe('getEntityAliases', () => {
        it('aggregates otherNames array and comma-separated otherNamesAndEpithets with deduplication', () => {
            const entity = {
                otherNames: ['The Iron Lord', 'Bane of Wolves'],
                otherNamesAndEpithets: 'The Iron Lord, Master of the North, Old Man',
            };
            const aliases = getEntityAliases(entity);
            expect(aliases).toEqual([
                'The Iron Lord',
                'Bane of Wolves',
                'Master of the North',
                'Old Man',
            ]);
        });

        it('handles null and empty records gracefully', () => {
            expect(getEntityAliases(null)).toEqual([]);
            expect(getEntityAliases({})).toEqual([]);
        });
    });
});
