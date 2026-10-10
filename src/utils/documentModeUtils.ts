import { BaseEntity } from '../types';

/**
 * Checks if an entity is marked as deceased, destroyed, or fallen.
 * Unifies deathDate, dateOfDeath, deadSwitch, and isDead.
 */
export function isEntityDeceased(entity: BaseEntity | any): boolean {
    if (!entity) return false;
    return Boolean(
        entity.deadSwitch ||
        entity.isDead ||
        (typeof entity.deathDate === 'string' && entity.deathDate.trim().length > 0) ||
        (typeof entity.dateOfDeath === 'string' && entity.dateOfDeath.trim().length > 0)
    );
}

/**
 * Checks if an entity is acting as a Folder / Category container.
 */
export function isEntityCategory(entity: BaseEntity | any): boolean {
    if (!entity) return false;
    return Boolean(entity.categorySwitch || entity.isCategory);
}

/**
 * Checks if an entity is marked as finished (Clean Codex Reader mode).
 */
export function isEntityFinished(entity: BaseEntity | any): boolean {
    if (!entity) return false;
    return Boolean(entity.finishedSwitch || entity.isFinished);
}

/**
 * Checks if an entity is a minor background entry.
 */
export function isEntityMinor(entity: BaseEntity | any): boolean {
    if (!entity) return false;
    return Boolean(entity.minorSwitch || entity.isMinorDocument);
}

/**
 * Extracts all unique aliases and epithets for an entity.
 */
export function getEntityAliases(entity: BaseEntity | any): string[] {
    if (!entity) return [];
    const list: string[] = [];
    if (Array.isArray(entity.otherNames)) {
        list.push(...entity.otherNames.filter((s: any) => typeof s === 'string' && s.trim().length > 0));
    }
    if (typeof entity.otherNamesAndEpithets === 'string' && entity.otherNamesAndEpithets.trim().length > 0) {
        list.push(...entity.otherNamesAndEpithets.split(',').map((s: string) => s.trim()).filter(Boolean));
    }
    return [...new Set(list)];
}
