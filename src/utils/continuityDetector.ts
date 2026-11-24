import { WorldData, WorldEntity, EntityType, Character, Event as WorldEvent, Location } from '../types';
import { extractYear } from './timelineUtils';
import { isEntityDeceased } from './documentModeUtils';

export type ContinuitySeverity = 'critical' | 'warning' | 'info';

export type ContinuityCategory = 
    | 'chronology'
    | 'lifespan'
    | 'event'
    | 'ancestry'
    | 'relation'
    | 'broken_link';

export interface ContinuityIssue {
    id: string;
    entityId: string;
    entityName: string;
    entityType: EntityType;
    relatedEntityId?: string;
    relatedEntityName?: string;
    relatedEntityType?: EntityType;
    severity: ContinuitySeverity;
    category: ContinuityCategory;
    title: string;
    description: string;
    suggestedFix?: string;
}

export interface ContinuitySummary {
    total: number;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
    byCategory: Record<ContinuityCategory, number>;
}

/**
 * Scans all entities in a world and returns any chronological, relational,
 * or logical continuity conflicts.
 */
export function detectContinuityIssues(world: WorldData): ContinuityIssue[] {
    if (!world || !world.entities || world.entities.length === 0) {
        return [];
    }

    const issues: ContinuityIssue[] = [];
    const entities = world.entities;
    const entitiesMap = new Map<string, WorldEntity>();

    for (const e of entities) {
        if (e && e.id) {
            entitiesMap.set(e.id, e);
        }
    }

    // ─── 1. Character Lifespan & Kinship Checks ──────────────────────────
    for (const entity of entities) {
        if (!entity || !entity.id) continue;

        // 1.1 Inverted Lifespan (Birth after Demise)
        if (entity.type === 'character') {
            const char = entity as Character;
            const birthYear = extractYear(char.birthDate);
            const deathYear = extractYear(char.deathDate);

            if (birthYear !== null && deathYear !== null && birthYear > deathYear) {
                issues.push({
                    id: `inverted-lifespan-${char.id}`,
                    entityId: char.id,
                    entityName: char.name || 'Unnamed Character',
                    entityType: 'character',
                    severity: 'critical',
                    category: 'lifespan',
                    title: 'Inverted Lifespan (Born After Demise)',
                    description: `Recorded as born in "${char.birthDate}" (Year ${birthYear}), but demise is recorded earlier in "${char.deathDate}" (Year ${deathYear}).`,
                    suggestedFix: 'Adjust the birth date or demise date so birth precedes demise.'
                });
            }

            // 1.2 Self-Referential Kinship Paradox
            const relationalLists: { key: keyof Character; label: string }[] = [
                { key: 'parentsOfCharacter', label: 'parent' },
                { key: 'childOfCharacter', label: 'child' },
                { key: 'relativesOfCharacter', label: 'relative' },
                { key: 'allyResCharacter', label: 'ally' },
                { key: 'enemydResCharacter', label: 'enemy' },
                { key: 'complicatedResCharacter', label: 'complicated relationship' }
            ];

            for (const rel of relationalLists) {
                const list = char[rel.key] as string[] | undefined;
                if (Array.isArray(list) && list.includes(char.id)) {
                    issues.push({
                        id: `self-ref-${rel.label}-${char.id}`,
                        entityId: char.id,
                        entityName: char.name || 'Unnamed Character',
                        entityType: 'character',
                        severity: 'critical',
                        category: 'relation',
                        title: `Self-Referential ${rel.label.toUpperCase()} Paradox`,
                        description: `${char.name} is recorded as their own ${rel.label}.`,
                        suggestedFix: `Remove ${char.name} from their own ${rel.label} list.`
                    });
                }
            }

            // 1.3 Parent-Child Chronological Conflicts
            const parentIds = Array.isArray(char.parentsOfCharacter) ? char.parentsOfCharacter : [];
            for (const pid of parentIds) {
                const parent = entitiesMap.get(pid) as Character | undefined;
                if (!parent) continue;

                const parentBirthYear = extractYear(parent.birthDate);
                const parentDeathYear = extractYear(parent.deathDate);

                if (birthYear !== null && parentBirthYear !== null) {
                    if (parentBirthYear >= birthYear) {
                        issues.push({
                            id: `parent-born-after-child-${char.id}-${parent.id}`,
                            entityId: char.id,
                            entityName: char.name || 'Unnamed Character',
                            entityType: 'character',
                            relatedEntityId: parent.id,
                            relatedEntityName: parent.name,
                            relatedEntityType: 'character',
                            severity: 'critical',
                            category: 'ancestry',
                            title: 'Parent Born Concurrently or After Child',
                            description: `Parent ${parent.name} was born in Year ${parentBirthYear}, which is not before child ${char.name}'s birth in Year ${birthYear}.`,
                            suggestedFix: `Ensure parent ${parent.name}'s birth year precedes ${char.name}'s birth year.`
                        });
                    }
                }

                if (birthYear !== null && parentDeathYear !== null) {
                    // Allow 1-year posthumous birth for gestational leeway
                    if (parentDeathYear < birthYear - 1) {
                        issues.push({
                            id: `posthumous-child-${char.id}-${parent.id}`,
                            entityId: char.id,
                            entityName: char.name || 'Unnamed Character',
                            entityType: 'character',
                            relatedEntityId: parent.id,
                            relatedEntityName: parent.name,
                            relatedEntityType: 'character',
                            severity: 'warning',
                            category: 'ancestry',
                            title: 'Child Born Long After Parent Demise',
                            description: `${char.name} was born in Year ${birthYear}, more than a year after parent ${parent.name} passed away in Year ${parentDeathYear}.`,
                            suggestedFix: `Verify birth dates or verify if magical / divine conception was intended.`
                        });
                    }
                }
            }
        }

        // ─── 2. Event Duration & Chronological Participation ─────────────
        if (entity.type === 'event') {
            const ev = entity as WorldEvent;
            const startYear = extractYear(ev.startDate || ev.date);
            const endYear = extractYear(ev.endDate);

            // 2.1 Inverted Event Duration
            if (startYear !== null && endYear !== null && startYear > endYear) {
                issues.push({
                    id: `inverted-event-duration-${ev.id}`,
                    entityId: ev.id,
                    entityName: ev.name || 'Unnamed Event',
                    entityType: 'event',
                    severity: 'critical',
                    category: 'event',
                    title: 'Inverted Event Duration (End Before Start)',
                    description: `Event start date "${ev.startDate || ev.date}" (Year ${startYear}) occurs after end date "${ev.endDate}" (Year ${endYear}).`,
                    suggestedFix: 'Adjust the start or end date so start occurs before or concurrently with end.'
                });
            }

            // 2.2 Event Participants (Posthumous or Pre-Natal Participation)
            const eventYear = startYear !== null ? startYear : endYear;
            const participants = Array.isArray(ev.pairedCharacter) ? ev.pairedCharacter : [];

            if (eventYear !== null) {
                for (const charId of participants) {
                    const char = entitiesMap.get(charId) as Character | undefined;
                    if (!char || char.type !== 'character') continue;

                    const charBirthYear = extractYear(char.birthDate);
                    const charDeathYear = extractYear(char.deathDate);

                    // Posthumous participation
                    if (charDeathYear !== null && eventYear > charDeathYear) {
                        issues.push({
                            id: `posthumous-event-part-${ev.id}-${char.id}`,
                            entityId: ev.id,
                            entityName: ev.name || 'Unnamed Event',
                            entityType: 'event',
                            relatedEntityId: char.id,
                            relatedEntityName: char.name,
                            relatedEntityType: 'character',
                            severity: 'warning',
                            category: 'chronology',
                            title: 'Posthumous Event Participation',
                            description: `${char.name} passed away in "${char.deathDate}" (Year ${charDeathYear}), but is recorded as an active participant in "${ev.name}" in Year ${eventYear}.`,
                            suggestedFix: `Check if ${char.name} attended via ghost, prophecy, or if the event took place during their lifetime.`
                        });
                    }

                    // Pre-natal participation
                    if (charBirthYear !== null && eventYear < charBirthYear) {
                        issues.push({
                            id: `prenatal-event-part-${ev.id}-${char.id}`,
                            entityId: ev.id,
                            entityName: ev.name || 'Unnamed Event',
                            entityType: 'event',
                            relatedEntityId: char.id,
                            relatedEntityName: char.name,
                            relatedEntityType: 'character',
                            severity: 'warning',
                            category: 'chronology',
                            title: 'Pre-Natal Event Participation',
                            description: `${char.name} was born in "${char.birthDate}" (Year ${charBirthYear}), but is recorded as participating in "${ev.name}" in Year ${eventYear}.`,
                            suggestedFix: `Check if ${char.name}'s ancestor or predecessor was meant instead.`
                        });
                    }
                }
            }
        }

        // ─── 3. Location & Resident Demise Checks ─────────────────────────
        if (entity.type === 'location') {
            const loc = entity as Location;
            const livingResidents = Array.isArray(loc.pairedCurrentCharactersNew) ? loc.pairedCurrentCharactersNew : [];

            for (const charId of livingResidents) {
                const char = entitiesMap.get(charId) as Character | undefined;
                if (!char) continue;

                if (isEntityDeceased(char)) {
                    issues.push({
                        id: `deceased-current-resident-${loc.id}-${char.id}`,
                        entityId: loc.id,
                        entityName: loc.name || 'Unnamed Location',
                        entityType: 'location',
                        relatedEntityId: char.id,
                        relatedEntityName: char.name,
                        relatedEntityType: 'character',
                        severity: 'info',
                        category: 'lifespan',
                        title: 'Deceased Character Listed as Active Resident',
                        description: `${char.name} is marked as deceased, but remains listed as an active current resident of ${loc.name}.`,
                        suggestedFix: `Move ${char.name} from Current Residents to Deceased / Demise residents.`
                    });
                }
            }
        }

        // ─── 4. Broken / Dangling References ─────────────────────────────
        const anyEnt = entity as any;
        const arrayProps = [
            'pairedCharacter', 'pairedLocations', 'pairedEvents', 'pairedItems',
            'pairedRace', 'pairedProfession', 'pairedSkills', 'parentsOfCharacter',
            'childOfCharacter', 'allyResCharacter', 'enemydResCharacter',
            'pairedCurrentLocationNew', 'pairedOriginLocationNew', 'pairedDemiseLocationNew'
        ];

        for (const prop of arrayProps) {
            const ids = anyEnt[prop];
            if (Array.isArray(ids)) {
                for (const targetId of ids) {
                    if (typeof targetId === 'string' && targetId.trim() && !entitiesMap.has(targetId)) {
                        issues.push({
                            id: `dangling-ref-${entity.id}-${prop}-${targetId}`,
                            entityId: entity.id,
                            entityName: entity.name || 'Unnamed Entity',
                            entityType: entity.type,
                            severity: 'info',
                            category: 'broken_link',
                            title: 'Dangling Link to Missing Record',
                            description: `References ID "${targetId}" in ${prop}, which does not exist in the current realm codex.`,
                            suggestedFix: 'Remove or update the reference to point to an active entity.'
                        });
                    }
                }
            }
        }
    }

    // ─── 5. Ancestry Cycle Detection (DFS) ───────────────────────────────
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const checkAncestryCycle = (currId: string, path: string[]): string[] | null => {
        visited.add(currId);
        recStack.add(currId);

        const currChar = entitiesMap.get(currId) as Character | undefined;
        if (currChar && Array.isArray(currChar.parentsOfCharacter)) {
            for (const parentId of currChar.parentsOfCharacter) {
                if (!visited.has(parentId)) {
                    const cycle = checkAncestryCycle(parentId, [...path, parentId]);
                    if (cycle) return cycle;
                } else if (recStack.has(parentId)) {
                    return [...path, parentId];
                }
            }
        }

        recStack.delete(currId);
        return null;
    };

    for (const entity of entities) {
        if (entity.type === 'character' && !visited.has(entity.id)) {
            const cycle = checkAncestryCycle(entity.id, [entity.id]);
            if (cycle && cycle.length >= 2) {
                const names = cycle.map(id => entitiesMap.get(id)?.name || id).join(' → ');
                issues.push({
                    id: `ancestry-cycle-${cycle[0]}`,
                    entityId: cycle[0],
                    entityName: entitiesMap.get(cycle[0])?.name || 'Character',
                    entityType: 'character',
                    severity: 'critical',
                    category: 'ancestry',
                    title: 'Circular Ancestry Lineage Detected',
                    description: `A circular ancestry loop was detected: ${names}. An individual cannot be their own ancestor.`,
                    suggestedFix: 'Review and remove the cyclical parent linkage.'
                });
            }
        }
    }

    return issues;
}

/**
 * Filters continuity issues that involve a specific entity (as the source or related target).
 */
export function getEntityContinuityIssues(entityId: string, world: WorldData): ContinuityIssue[] {
    if (!entityId || !world) return [];
    const all = detectContinuityIssues(world);
    return all.filter(issue => issue.entityId === entityId || issue.relatedEntityId === entityId);
}

/**
 * Computes high-level diagnostic summary metrics across all detected continuity issues.
 */
export function getContinuitySummary(issues: ContinuityIssue[]): ContinuitySummary {
    const summary: ContinuitySummary = {
        total: issues.length,
        criticalCount: 0,
        warningCount: 0,
        infoCount: 0,
        byCategory: {
            chronology: 0,
            lifespan: 0,
            event: 0,
            ancestry: 0,
            relation: 0,
            broken_link: 0
        }
    };

    for (const issue of issues) {
        if (issue.severity === 'critical') summary.criticalCount++;
        else if (issue.severity === 'warning') summary.warningCount++;
        else if (issue.severity === 'info') summary.infoCount++;

        if (summary.byCategory[issue.category] !== undefined) {
            summary.byCategory[issue.category]++;
        }
    }

    return summary;
}
