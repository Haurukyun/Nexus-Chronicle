import { describe, it, expect } from 'vitest';
import { getCategorizedBacklinks } from './backlinkUtils';
import { WorldEntity, Character, Location, Species, Occupation, Event } from '../types';

describe('backlinkUtils - getCategorizedBacklinks', () => {
    it('correctly categorizes residents, natives, and demise for locations', () => {
        const locationId = 'loc-1';
        const character: Character = {
            id: 'char-1',
            name: 'Hero',
            type: 'character',
            tags: [],
            lastModified: Date.now(),
            pairedCurrentLocationNew: [locationId],
            pairedOriginLocationNew: ['loc-2'],
            pairedDemiseLocationNew: ['loc-3'],
            pairedRace: ['species-elf'],
            pairedProfession: ['occ-mage']
        };

        const entities: WorldEntity[] = [character];
        const backlinks = getCategorizedBacklinks(locationId, entities);

        expect(backlinks.residents).toContain('char-1');
        expect(backlinks.natives).not.toContain('char-1');
        expect(backlinks.passedHere).not.toContain('char-1');
    });

    it('correctly categorizes species members and occupation practitioners', () => {
        const character: Character = {
            id: 'char-2',
            name: 'Legolas',
            type: 'character',
            tags: [],
            lastModified: Date.now(),
            pairedRace: ['species-wood-elf'],
            pairedProfession: ['occ-archer'],
            pairedSkills: ['skill-archery']
        };

        const entities: WorldEntity[] = [character];

        const speciesBacklinks = getCategorizedBacklinks('species-wood-elf', entities);
        expect(speciesBacklinks.members).toContain('char-2');

        const occBacklinks = getCategorizedBacklinks('occ-archer', entities);
        expect(occBacklinks.practitioners).toContain('char-2');

        const abilityBacklinks = getCategorizedBacklinks('skill-archery', entities);
        expect(abilityBacklinks.practitioners).toContain('char-2');
    });

    it('does NOT misclassify species or occupations as events when referencing a character', () => {
        const characterId = 'char-3';
        const species: Species = {
            id: 'species-dwarf',
            name: 'Dwarf',
            type: 'species',
            tags: [],
            lastModified: Date.now(),
            pairedCharacter: [characterId]
        };

        const event: Event = {
            id: 'event-battle',
            name: 'Battle of Five Armies',
            type: 'event',
            tags: [],
            lastModified: Date.now(),
            pairedCharacter: [characterId]
        };

        const entities: WorldEntity[] = [species, event];
        const backlinks = getCategorizedBacklinks(characterId, entities);

        // Species should be under members, NOT events!
        expect(backlinks.members).toContain('species-dwarf');
        expect(backlinks.events).not.toContain('species-dwarf');

        // Event should be under events
        expect(backlinks.events).toContain('event-battle');
    });

    it('supports location-to-location succession and containment', () => {
        const parentLocId = 'kingdom-1';
        const childLoc: Location = {
            id: 'city-1',
            name: 'Capital City',
            type: 'location',
            tags: [],
            lastModified: Date.now(),
            parentId: parentLocId,
            succeedingLocationIds: ['future-city']
        };

        const backlinks = getCategorizedBacklinks(parentLocId, [childLoc]);
        expect(backlinks.containedIn).toContain('city-1');

        const succBacklinks = getCategorizedBacklinks('future-city', [childLoc]);
        expect(succBacklinks.predecessors).toContain('city-1');
    });
});
