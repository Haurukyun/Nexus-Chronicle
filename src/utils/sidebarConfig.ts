import { HIERARCHY_CONFIG } from '../constants';

export const DEFAULT_GROUP_ORDER: string[] = ['story', 'world', 'groups', 'details'];

/**
 * Returns HIERARCHY_CONFIG sorted by the given group order.
 * Any groups not explicitly included in `order` are safely appended at the end in default order.
 */
export function getOrderedHierarchy(order?: string[]): typeof HIERARCHY_CONFIG {
    if (!order || !Array.isArray(order) || order.length === 0) {
        return [...HIERARCHY_CONFIG];
    }

    const groupMap = new Map(HIERARCHY_CONFIG.map(g => [g.id, g]));
    const result: typeof HIERARCHY_CONFIG = [];
    const seen = new Set<string>();

    for (const id of order) {
        const group = groupMap.get(id);
        if (group && !seen.has(id)) {
            result.push(group);
            seen.add(id);
        }
    }

    // Append any omitted groups to ensure no category is ever lost
    for (const group of HIERARCHY_CONFIG) {
        if (!seen.has(group.id)) {
            result.push(group);
            seen.add(group.id);
        }
    }

    return result;
}

/**
 * Move a group up or down within the order array.
 */
export function reorderGroups(currentOrder: string[] | undefined, groupId: string, direction: 'up' | 'down'): string[] {
    const list = currentOrder && currentOrder.length > 0 
        ? [...currentOrder] 
        : [...DEFAULT_GROUP_ORDER];

    // Ensure all 4 groups exist in list
    for (const defId of DEFAULT_GROUP_ORDER) {
        if (!list.includes(defId)) {
            list.push(defId);
        }
    }

    const idx = list.indexOf(groupId);
    if (idx === -1) return list;

    if (direction === 'up' && idx > 0) {
        const temp = list[idx - 1];
        list[idx - 1] = list[idx];
        list[idx] = temp;
    } else if (direction === 'down' && idx < list.length - 1) {
        const temp = list[idx + 1];
        list[idx + 1] = list[idx];
        list[idx] = temp;
    }

    return list;
}

/**
 * Moves a group from one index to another (drag-and-drop support).
 */
export function moveGroup(currentOrder: string[] | undefined, fromIndex: number, toIndex: number): string[] {
    const list = currentOrder && currentOrder.length > 0 
        ? [...currentOrder] 
        : [...DEFAULT_GROUP_ORDER];

    for (const defId of DEFAULT_GROUP_ORDER) {
        if (!list.includes(defId)) {
            list.push(defId);
        }
    }

    if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) {
        return list;
    }

    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    return list;
}
