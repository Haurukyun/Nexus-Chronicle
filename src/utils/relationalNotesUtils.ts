/**
 * Nexus Chronicle - Relational Context & Annotated Link Notes Utilities
 * 
 * Provides hybrid field-scoped and entity-aggregated relationship notes.
 * Internal storage format on BaseEntity.relationalNotes:
 *   {
 *     "allyResCharacter:entity_123": "Swore blood-oath at the Siege of Sol",
 *     "parentsOfCharacter:entity_456": "Adoptive father and mentor"
 *   }
 */

import { RelationalNoteEntry } from '../types';

/**
 * Builds the composite storage key for field-scoped relationship notes.
 */
export function makeRelationalKey(field: string, targetId: string): string {
    return `${field}:${targetId}`;
}

/**
 * Parses a composite key into its field name and target entity ID.
 * Supports legacy or unscoped keys (falling back to field: 'general').
 */
export function parseRelationalKey(key: string): { field: string; targetId: string } {
    const colonIndex = key.indexOf(':');
    if (colonIndex === -1) {
        return { field: 'general', targetId: key };
    }
    return {
        field: key.slice(0, colonIndex),
        targetId: key.slice(colonIndex + 1),
    };
}

/**
 * Retrieves the context note for a specific field and target entity.
 * Falls back to an unscoped note on the target entity if present.
 */
export function getRelationalNote(
    relationalNotes: Record<string, string> | undefined,
    field: string,
    targetId: string
): string {
    if (!relationalNotes) return '';
    // 1. Direct field-scoped key lookup
    const scopedKey = makeRelationalKey(field, targetId);
    if (relationalNotes[scopedKey]) {
        return relationalNotes[scopedKey];
    }
    // 2. Fallback to unscoped entity key (if migrated or general)
    if (relationalNotes[targetId]) {
        return relationalNotes[targetId];
    }
    return '';
}

/**
 * Aggregates all relational context notes linked to a target entity across all fields.
 * Useful for graph inspectors, hover cards, and relationship overviews.
 */
export function getEntityRelationshipSummary(
    targetId: string,
    relationalNotes: Record<string, string> | undefined
): RelationalNoteEntry[] {
    if (!relationalNotes) return [];
    const entries: RelationalNoteEntry[] = [];

    for (const [key, note] of Object.entries(relationalNotes)) {
        if (!note || typeof note !== 'string' || !note.trim()) continue;

        if (key === targetId) {
            entries.push({ field: 'general', targetId, note: note.trim() });
        } else if (key.endsWith(`:${targetId}`)) {
            const field = key.slice(0, key.length - targetId.length - 1);
            entries.push({ field, targetId, note: note.trim() });
        }
    }

    return entries;
}

/**
 * Updates or removes a field-scoped relational note.
 * Returns a new clean Record<string, string>.
 */
export function setRelationalNote(
    relationalNotes: Record<string, string> | undefined,
    field: string,
    targetId: string,
    note: string
): Record<string, string> {
    const next: Record<string, string> = { ...(relationalNotes || {}) };
    const key = makeRelationalKey(field, targetId);

    const trimmed = (note || '').trim();
    if (trimmed) {
        next[key] = trimmed;
    } else {
        delete next[key];
        // Also remove unscoped key if it matches to avoid ghost notes
        if (next[targetId] && field === 'general') {
            delete next[targetId];
        }
    }

    return next;
}

/**
 * Cleans up all notes referencing a specific target entity (e.g. upon deletion or unlinking).
 */
export function removeRelationalNotesForTarget(
    relationalNotes: Record<string, string> | undefined,
    targetId: string
): Record<string, string> {
    if (!relationalNotes) return {};
    const next: Record<string, string> = {};

    for (const [key, note] of Object.entries(relationalNotes)) {
        if (key === targetId || key.endsWith(`:${targetId}`)) {
            continue; // Skip this target
        }
        next[key] = note;
    }

    return next;
}

/**
 * Formats camelCase or schema field names into human-readable relationship labels.
 */
export function formatFieldLabel(field: string): string {
    const knownLabels: Record<string, string> = {
        allyResCharacter: 'Ally',
        enemydResCharacter: 'Enemy',
        parentsOfCharacter: 'Parent',
        childOfCharacter: 'Child',
        relativesOfCharacter: 'Relative',
        complicatedResCharacter: 'Complicated',
        pairedRace: 'Species / Race',
        pairedProfession: 'Occupation / Class',
        pairedOriginLocationNew: 'Origin Location',
        pairedCurrentLocationNew: 'Current Residence',
        pairedDemiseLocationNew: 'Place of Demise',
        pairedConditionsPositive: 'Boon',
        pairedConditionsNegative: 'Affliction',
        pairedConditionsOther: 'Condition',
        pairedConnectedItems: 'Equipment / Item',
        pairedResources: 'Wealth / Currency',
        pairedSkills: 'Ability / Skill',
        pairedLanguage: 'Language',
        pairedMagic: 'Magic Teaching',
        pairedTech: 'Science / Technology',
        pairedEvent: 'Event',
        relatedCultures: 'Culture',
        pairedConnectedPlaces: 'Connected Place',
        pairedConnectedNotes: 'Connected Note',
        pairedConnectedMyths: 'Connected Myth',
        leadingPoliticalLeaders: 'Political Leader',
        pairedConnectionPolGroup: 'Political Connection',
        pairedBelongingPolGroup: 'Political Member',
        pairedAllyPolGroup: 'Political Ally',
        pairedEnemyPolGroup: 'Political Enemy',
        leadingOtherLeaders: 'Organization Leader',
        pairedConnectionOtherGroups: 'Organization Connection',
        pairedBelongingOtherGroups: 'Organization Member',
        pairedAllyOtherGroups: 'Organization Ally',
        pairedEnemyOtherGroups: 'Organization Enemy',
        leadingReligiousLeaders: 'Religious Leader',
        pairedConnectionRelGroup: 'Religious Connection',
        pairedBelongingRelGroup: 'Religious Member',
        pairedAllyRelGroup: 'Religious Ally',
        pairedEnemyRelGroup: 'Religious Enemy',
        leadingMagicalLeaders: 'Magic Circle Leader',
        pairedConnectionMagicGroup: 'Magic Connection',
        pairedBelongingMagicGroup: 'Magic Member',
        pairedAllyMagicGroup: 'Magic Ally',
        pairedEnemyMagicGroup: 'Magic Enemy',
        leadingTechLeaders: 'Academy Leader',
        pairedConnectionTechGroup: 'Academy Connection',
        pairedBelongingTechGroup: 'Academy Member',
        pairedAllyTechGroup: 'Academy Ally',
        pairedEnemyTechGroup: 'Academy Enemy',
        general: 'Connection',
    };

    if (knownLabels[field]) return knownLabels[field];

    // Generic fallback: decamelize string
    return field
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
}
