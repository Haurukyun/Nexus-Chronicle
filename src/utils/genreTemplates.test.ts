import { describe, it, expect } from 'vitest';
import {
    getActiveGenreTemplate,
    getGenreFieldLabel,
    applyGenreTemplateToWorld,
    GENRE_TEMPLATES
} from './genreTemplates';
import { WorldData, WorldEntity } from '../types';

describe('genreTemplates', () => {
    const baseWorld: WorldData = {
        name: 'Genre World',
        entities: [],
        trash: [],
        mapConnections: [],
        worldPhase: 'creation'
    };

    it('resolves active genre correctly with fallback to universal', () => {
        expect(getActiveGenreTemplate(baseWorld)).toBe('universal');
        expect(getActiveGenreTemplate(undefined)).toBe('universal');

        const scifiWorld: WorldData = { ...baseWorld, genreTemplate: 'scifi' };
        expect(getActiveGenreTemplate(scifiWorld)).toBe('scifi');

        const entityWithOverride: Partial<WorldEntity> = {
            id: '1',
            name: 'Hero',
            type: 'character',
            entityTemplate: 'horror'
        };
        expect(getActiveGenreTemplate(scifiWorld, entityWithOverride as WorldEntity)).toBe('horror');

        const entityInheriting: Partial<WorldEntity> = {
            id: '2',
            name: 'Sidekick',
            type: 'character',
            entityTemplate: 'inherit'
        };
        expect(getActiveGenreTemplate(scifiWorld, entityInheriting as WorldEntity)).toBe('scifi');
    });

    it('returns custom genre field labels when defined', () => {
        expect(getGenreFieldLabel('scifi', 'powerLevel', 'Combat Rating')).toBe('Threat Level / Rating');
        expect(getGenreFieldLabel('fantasy', 'powerLevel', 'Combat Rating')).toBe('Arcane / Combat Tier');
        expect(getGenreFieldLabel('universal', 'powerLevel', 'Combat Rating')).toBe('Combat Rating');
        expect(getGenreFieldLabel('horror', 'unknownKey', 'Default')).toBe('Default');
    });

    it('applies genre template to world data and merges hidden fields when requested', () => {
        const applied = applyGenreTemplateToWorld(baseWorld, 'fantasy', true);
        expect(applied.genreTemplate).toBe('fantasy');
        expect(applied.hiddenFields?.character).toContain('knownTech');

        const scifiApplied = applyGenreTemplateToWorld(applied, 'scifi', true);
        expect(scifiApplied.genreTemplate).toBe('scifi');
        expect(scifiApplied.hiddenFields?.character).toContain('knownMagic');
        expect(scifiApplied.hiddenFields?.character).toContain('knownTech');
    });
});
