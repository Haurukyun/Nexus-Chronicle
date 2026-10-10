import { describe, it, expect } from 'vitest';
import {
    makeRelationalKey,
    parseRelationalKey,
    getRelationalNote,
    getEntityRelationshipSummary,
    setRelationalNote,
    removeRelationalNotesForTarget,
    formatFieldLabel,
} from './relationalNotesUtils';

describe('relationalNotesUtils', () => {
    it('creates and parses composite keys correctly', () => {
        const key = makeRelationalKey('allyResCharacter', 'char_marcus');
        expect(key).toBe('allyResCharacter:char_marcus');

        const parsed = parseRelationalKey(key);
        expect(parsed.field).toBe('allyResCharacter');
        expect(parsed.targetId).toBe('char_marcus');

        const legacy = parseRelationalKey('char_marcus');
        expect(legacy.field).toBe('general');
        expect(legacy.targetId).toBe('char_marcus');
    });

    it('retrieves notes with field-specific precision and fallback', () => {
        const notes: Record<string, string> = {
            'allyResCharacter:char_marcus': 'Swore allegiance at Sol',
            'enemydResCharacter:char_marcus': 'Betrayed during siege',
            'char_valeria': 'Childhood companion',
        };

        expect(getRelationalNote(notes, 'allyResCharacter', 'char_marcus')).toBe('Swore allegiance at Sol');
        expect(getRelationalNote(notes, 'enemydResCharacter', 'char_marcus')).toBe('Betrayed during siege');
        expect(getRelationalNote(notes, 'parentsOfCharacter', 'char_valeria')).toBe('Childhood companion');
        expect(getRelationalNote(notes, 'parentsOfCharacter', 'char_unknown')).toBe('');
    });

    it('aggregates relationship summary for graph and overview views', () => {
        const notes: Record<string, string> = {
            'allyResCharacter:char_vane': 'Mentored swordsmanship',
            'enemydResCharacter:char_vane': 'Political adversary',
            'creditors:char_vane': 'Owes 500 gold',
            'allyResCharacter:char_other': 'Unrelated ally',
        };

        const summary = getEntityRelationshipSummary('char_vane', notes);
        expect(summary).toHaveLength(3);
        expect(summary.map(s => s.field)).toEqual(['allyResCharacter', 'enemydResCharacter', 'creditors']);
        expect(summary.find(s => s.field === 'allyResCharacter')?.note).toBe('Mentored swordsmanship');
        expect(summary.find(s => s.field === 'creditors')?.note).toBe('Owes 500 gold');
    });

    it('updates and removes field-specific notes non-destructively', () => {
        let notes: Record<string, string> = {
            'allyResCharacter:char_vane': 'Taught swordsmanship',
            'enemydResCharacter:char_vane': 'Political adversary',
        };

        // Update existing note
        notes = setRelationalNote(notes, 'allyResCharacter', 'char_vane', 'Taught swordsmanship in youth');
        expect(notes['allyResCharacter:char_vane']).toBe('Taught swordsmanship in youth');
        expect(notes['enemydResCharacter:char_vane']).toBe('Political adversary');

        // Clear one field note without destroying the other
        notes = setRelationalNote(notes, 'enemydResCharacter', 'char_vane', '');
        expect(notes['enemydResCharacter:char_vane']).toBeUndefined();
        expect(notes['allyResCharacter:char_vane']).toBe('Taught swordsmanship in youth');
    });

    it('removes all notes referencing target upon entity deletion', () => {
        const notes: Record<string, string> = {
            'allyResCharacter:char_target': 'Note 1',
            'enemydResCharacter:char_target': 'Note 2',
            'char_target': 'Unscoped note',
            'allyResCharacter:char_survivor': 'Survivor note',
        };

        const cleaned = removeRelationalNotesForTarget(notes, 'char_target');
        expect(cleaned['allyResCharacter:char_target']).toBeUndefined();
        expect(cleaned['enemydResCharacter:char_target']).toBeUndefined();
        expect(cleaned['char_target']).toBeUndefined();
        expect(cleaned['allyResCharacter:char_survivor']).toBe('Survivor note');
    });

    it('formats human-friendly labels for known and generic fields', () => {
        expect(formatFieldLabel('allyResCharacter')).toBe('Ally');
        expect(formatFieldLabel('enemydResCharacter')).toBe('Enemy');
        expect(formatFieldLabel('parentsOfCharacter')).toBe('Parent');
        expect(formatFieldLabel('pairedConditionsPositive')).toBe('Boon');
        expect(formatFieldLabel('customMentorRole')).toBe('Custom Mentor Role');
    });
});
