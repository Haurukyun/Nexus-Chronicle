import { describe, it, expect } from 'vitest';
import { getOrderedHierarchy, reorderGroups, moveGroup, DEFAULT_GROUP_ORDER } from './sidebarConfig';
import { HIERARCHY_CONFIG } from '../constants';

describe('sidebarConfig', () => {
    it('returns default hierarchy when no order is provided', () => {
        const hierarchy = getOrderedHierarchy();
        expect(hierarchy.map(g => g.id)).toEqual(['story', 'world', 'groups', 'details']);
    });

    it('orders hierarchy by custom order correctly', () => {
        const hierarchy = getOrderedHierarchy(['world', 'groups', 'story', 'details']);
        expect(hierarchy.map(g => g.id)).toEqual(['world', 'groups', 'story', 'details']);
    });

    it('safely appends omitted groups without losing any', () => {
        const hierarchy = getOrderedHierarchy(['groups']);
        expect(hierarchy.map(g => g.id)).toEqual(['groups', 'story', 'world', 'details']);
    });

    it('reorders groups up and down', () => {
        const initial = ['story', 'world', 'groups', 'details'];
        const afterUp = reorderGroups(initial, 'world', 'up');
        expect(afterUp).toEqual(['world', 'story', 'groups', 'details']);

        const afterDown = reorderGroups(afterUp, 'world', 'down');
        expect(afterDown).toEqual(['story', 'world', 'groups', 'details']);
    });

    it('moves groups by index', () => {
        const moved = moveGroup(['story', 'world', 'groups', 'details'], 0, 3);
        expect(moved).toEqual(['world', 'groups', 'details', 'story']);
    });
});
