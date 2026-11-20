import { describe, it, expect } from 'vitest';
import { generateCharacterSheetHtml, generateRelationSheetHtml } from './characterSheetUtils';
import { Character, WorldEntity } from '../types';

describe('characterSheetUtils', () => {
    const mockCharacter: Character = {
        id: 'char-1',
        name: 'Aragorn II Elessar',
        type: 'character',
        sex: 'Male',
        age: '87',
        birthDate: 'TA 2931',
        description: 'Heir of Isildur, Chieftain of the Dúnedain of the North.',
        tags: ['ranger', 'king', 'fellowship'],
        pairedRace: ['species-1'],
        pairedProfession: ['occ-1'],
        customAttributes: {
            'Might': '18',
            'Leadership': '20',
        },
        lastModified: Date.now(),
    };

    const mockEntities: WorldEntity[] = [
        mockCharacter,
        {
            id: 'species-1',
            name: 'Dúnedain',
            type: 'species',
            description: 'Men of the West',
            tags: [],
            lastModified: Date.now(),
        },
        {
            id: 'occ-1',
            name: 'Ranger of the North',
            type: 'occupation',
            description: 'Protectors of Eriador',
            tags: [],
            lastModified: Date.now(),
        },
    ];

    it('generates standalone HTML document with character vitals and attributes', () => {
        const html = generateCharacterSheetHtml(mockCharacter, mockEntities, { includeDmNotes: true });
        
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('Aragorn II Elessar');
        expect(html).toContain('Dúnedain');
        expect(html).toContain('Ranger of the North');
        expect(html).toContain('TA 2931');
        expect(html).toContain('87 years');
        expect(html).toContain('Might');
        expect(html).toContain('18');
        expect(html).toContain('Leadership');
        expect(html).toContain('20');
        expect(html).toContain('@media print');
    });

    it('handles deceased characters with deceased indicator badge', () => {
        const fallenChar: Character = {
            ...mockCharacter,
            id: 'char-2',
            name: 'Boromir',
            deathDate: 'TA 3019',
        };

        const html = generateCharacterSheetHtml(fallenChar, mockEntities);
        expect(html).toContain('Fallen / Deceased †');
        expect(html).toContain('TA 3019');
    });

    it('generates standalone relationship web and kinship sheet', () => {
        const charWithKin: Character = {
            ...mockCharacter,
            parentsOfCharacter: ['char-parent'],
            childOfCharacter: ['char-child'],
            allyResCharacter: ['char-ally'],
            relationalNotes: {
                'parentsOfCharacter:char-parent': 'Adoptive foster father',
                'allyResCharacter:char-ally': 'Sworn brother in arms',
            },
        };

        const extraEntities: WorldEntity[] = [
            ...mockEntities,
            { id: 'char-parent', name: 'Elrond Half-elven', type: 'character', tags: [], lastModified: Date.now() },
            { id: 'char-child', name: 'Eldarion', type: 'character', tags: [], lastModified: Date.now() },
            { id: 'char-ally', name: 'Legolas Greenleaf', type: 'character', tags: [], lastModified: Date.now() },
        ];

        const html = generateRelationSheetHtml(charWithKin, extraEntities, { realmName: 'Middle-earth' });
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('Relationship Web & Kinship Sheet');
        expect(html).toContain('Elrond Half-elven');
        expect(html).toContain('Adoptive foster father');
        expect(html).toContain('Eldarion');
        expect(html).toContain('Legolas Greenleaf');
        expect(html).toContain('Sworn brother in arms');
        expect(html).toContain('@media print');
    });
});
