import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CharacterStatBlock } from '../components/viewer/CharacterStatBlock';
import { Character } from '../types';

describe('Flexible Stat Block Engine (Approach 4)', () => {
    const baseChar: Character = {
        id: 'char-test-1',
        name: 'Vaelin Al Sorna',
        type: 'character',
        lastModified: 2000,
        tags: [],
        stats: {
            strength: '16',
            dexterity: '14',
            constitution: '15',
            intelligence: '12',
            wisdom: '14',
            charisma: '10'
        }
    };

    it('returns null when statBlockMode is "none"', () => {
        const narrativeChar: Character = {
            ...baseChar,
            statBlockMode: 'none'
        };
        const html = renderToString(
            <CharacterStatBlock entity={narrativeChar} allEntities={[narrativeChar]} onNavigate={() => {}} />
        );
        expect(html).toBe('');
    });

    it('renders custom stats and gauge bars when statBlockMode is "custom"', () => {
        const sciFiChar: Character = {
            ...baseChar,
            statBlockMode: 'custom',
            customStats: [
                { id: 'st-1', label: 'Cyberware Capacity', value: '8', max: '12' },
                { id: 'st-2', label: 'Street Cred', value: '5' },
                { id: 'st-3', label: 'Sanity', value: '45', max: '100' }
            ]
        };
        const html = renderToString(
            <CharacterStatBlock entity={sciFiChar} allEntities={[sciFiChar]} onNavigate={() => {}} />
        );
        expect(html).toContain('Cyberware Capacity');
        expect(html).toContain('Street Cred');
        expect(html).toContain('Sanity');
        expect(html).toContain('8');
        expect(html).toContain('12');
        expect(html).toContain('45');
    });

    it('renders standard D20 radar and attributes by default when statBlockMode is undefined or "rpg-d20"', () => {
        const html = renderToString(
            <CharacterStatBlock entity={baseChar} allEntities={[baseChar]} onNavigate={() => {}} />
        );
        expect(html).toContain('STR');
        expect(html).toContain('DEX');
        expect(html).toContain('CON');
        expect(html).toContain('INT');
        expect(html).toContain('WIS');
        expect(html).toContain('CHA');
    });
});
