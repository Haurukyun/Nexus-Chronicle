import { describe, it, expect } from 'vitest';
import { applyBidirectionalSync } from './bidirectionalSync';
import { Character, Condition, WorldEntity } from '../types';

describe('bidirectionalSync', () => {
    it('synchronizes character condition links with condition pairedCharactersNegative', () => {
        const prevChar: Character = {
            id: 'char-1',
            type: 'character',
            name: 'Aurelius',
            status: 'draft',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            description: '',
            isReadOnly: false,
            pairedConditionsNegative: [],
        } as unknown as Character;

        const char: Character = {
            ...prevChar,
            pairedConditionsNegative: ['cond-1'],
        };

        const condition: Condition = {
            id: 'cond-1',
            type: 'condition',
            name: 'Curse of Tigre',
            status: 'draft',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            description: '',
            isReadOnly: false,
            pairedCharactersNegative: [],
        } as unknown as Condition;

        const allEntities: WorldEntity[] = [prevChar, condition];
        const result = applyBidirectionalSync(char, prevChar, allEntities);

        const updatedCond = result.entities.find(e => e.id === 'cond-1') as Condition;
        expect(updatedCond).toBeDefined();
        expect(updatedCond.pairedCharactersNegative).toContain('char-1');
    });

    it('removes character when condition is unlinked', () => {
        const prevChar: Character = {
            id: 'char-1',
            type: 'character',
            name: 'Aurelius',
            status: 'draft',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            description: '',
            isReadOnly: false,
            pairedConditionsNegative: ['cond-1'],
        } as unknown as Character;

        const char: Character = {
            ...prevChar,
            pairedConditionsNegative: [], // Removed cond-1
        };

        const condition: Condition = {
            id: 'cond-1',
            type: 'condition',
            name: 'Curse of Tigre',
            status: 'draft',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            description: '',
            isReadOnly: false,
            pairedCharactersNegative: ['char-1'],
        } as unknown as Condition;

        const allEntities: WorldEntity[] = [prevChar, condition];
        const result = applyBidirectionalSync(char, prevChar, allEntities);

        const updatedCond = result.entities.find(e => e.id === 'cond-1') as Condition;
        expect(updatedCond).toBeDefined();
        expect(updatedCond.pairedCharactersNegative).not.toContain('char-1');
    });
});
