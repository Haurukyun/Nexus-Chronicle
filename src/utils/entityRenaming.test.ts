import { describe, it, expect } from 'vitest';
import { renameEntityInWorld } from './entityRenaming';
import { WorldData, WorldEntity } from '../types';

describe('renameEntityInWorld', () => {
    it('renames target entity and propagates wikilinks across world descriptions', () => {
        const char: WorldEntity = {
            id: 'char-1',
            name: 'Aethelgard The Great',
            type: 'character',
            tags: ['hero'],
            description: 'A champion born in [[Aethelgard The Great]] fame.',
            lastModified: 1000,
        };

        const loc: WorldEntity = {
            id: 'loc-1',
            name: 'Sunken Citadel',
            type: 'location',
            tags: ['ruin'],
            description: 'Guarded by [[Aethelgard The Great]] and [[Aethelgard The Great|The Champion]].',
            notes: 'Mentions [[Aethelgard The Great]] in private notes.',
            lastModified: 1000,
        };

        const world: WorldData = {
            name: 'Test World',
            entities: [char, loc],
            trash: [],
            mapConnections: [],
            worldPhase: 'golden',
        };

        const result = renameEntityInWorld(world, 'char-1', 'Aethelgard Dawnseeker');

        expect(result.occurrencesPatched).toBeGreaterThanOrEqual(2);
        expect(result.entitiesAffected).toContain('Sunken Citadel');

        const updatedChar = result.updatedWorld.entities.find(e => e.id === 'char-1');
        const updatedLoc = result.updatedWorld.entities.find(e => e.id === 'loc-1');

        expect(updatedChar?.name).toBe('Aethelgard Dawnseeker');
        expect(updatedLoc?.description).toContain('[[Aethelgard Dawnseeker]]');
        expect(updatedLoc?.description).toContain('[[Aethelgard Dawnseeker|The Champion]]');
        expect(updatedLoc?.notes).toContain('[[Aethelgard Dawnseeker]]');
    });

    it('returns unchanged world when new name is identical', () => {
        const char: WorldEntity = {
            id: 'char-1',
            name: 'Same Name',
            type: 'character',
            tags: [],
            lastModified: 1000,
        };

        const world: WorldData = {
            name: 'Test World',
            entities: [char],
            trash: [],
            mapConnections: [],
            worldPhase: 'golden',
        };

        const result = renameEntityInWorld(world, 'char-1', 'Same Name');
        expect(result.occurrencesPatched).toBe(0);
        expect(result.entitiesAffected.length).toBe(0);
    });
});
