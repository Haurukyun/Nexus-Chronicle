import { describe, it, expect } from 'vitest';
import { buildInMemoryWorldGraph } from './graphSqliteVerification';
import { Character, WorldEntity } from '../types';

describe('graphSqliteVerification', () => {
    it('detects circular parent references via Recursive CTE', () => {
        const charA: Partial<Character> = {
            id: 'char-a',
            type: 'character',
            name: 'Aurelius',
            parentId: 'char-b',
        };
        const charB: Partial<Character> = {
            id: 'char-b',
            type: 'character',
            name: 'Bébé Tigre',
            parentId: 'char-a', // Cycle!
        };

        const graph = buildInMemoryWorldGraph([charA, charB] as WorldEntity[]);
        const cycles = graph.findParentCycles();
        expect(cycles.length).toBeGreaterThan(0);
        graph.close();
    });

    it('detects dangling relation pointers', () => {
        const charA: Partial<Character> = {
            id: 'char-a',
            type: 'character',
            name: 'Aurelius',
            pairedRace: ['ghost-species-id'], // Does not exist
        };

        const graph = buildInMemoryWorldGraph([charA] as WorldEntity[]);
        const dangling = graph.findDanglingPointers();
        expect(dangling.length).toBe(1);
        expect((dangling[0] as any).target_id).toBe('ghost-species-id');
        graph.close();
    });
});
