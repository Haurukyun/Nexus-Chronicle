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

    it('synchronizes character pairedMagic with magic group pairedCharacter', () => {
        const prevChar: any = {
            id: 'char-merlin',
            type: 'character',
            name: 'Merlin',
            pairedMagic: [],
        };
        const char: any = {
            ...prevChar,
            pairedMagic: ['magic-pyro'],
        };
        const magicGroup: any = {
            id: 'magic-pyro',
            type: 'magic',
            name: 'Pyromancy Guild',
            pairedCharacter: [],
        };

        const result = applyBidirectionalSync(char, prevChar, [prevChar, magicGroup]);
        const updatedMagic = result.entities.find(e => e.id === 'magic-pyro') as any;
        expect(updatedMagic).toBeDefined();
        expect(updatedMagic.pairedCharacter).toContain('char-merlin');
    });

    it('synchronizes political group succeeding and preceding lineage', () => {
        const prevPol: any = {
            id: 'pol-old-empire',
            type: 'political',
            name: 'Old Empire',
            succedingPolGroup: [],
        };
        const pol: any = {
            ...prevPol,
            succedingPolGroup: ['pol-new-republic'],
        };
        const republic: any = {
            id: 'pol-new-republic',
            type: 'political',
            name: 'New Republic',
            preceedingPolGroup: [],
        };

        const result = applyBidirectionalSync(pol, prevPol, [prevPol, republic]);
        const updatedRep = result.entities.find(e => e.id === 'pol-new-republic') as any;
        expect(updatedRep).toBeDefined();
        expect(updatedRep.preceedingPolGroup).toContain('pol-old-empire');
    });
});
