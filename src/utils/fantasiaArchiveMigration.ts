import { unzipSync, strFromU8 } from 'fflate';
import { EntityType, WorldData, WorldEntity } from '../types';
import { createDefaultEntity } from './entityDefaults';
import { reconcileAllBidirectionalRelations } from './bidirectionalSync';

/**
 * Mapping table from Fantasia Archive v1 blueprint identifiers to Nexus Chronicle EntityTypes.
 * Supports both plural database names and singular variants.
 */
export const FA_TYPE_MAP: Record<string, EntityType> = {
    // Plural (FA database file names)
    characters: 'character',
    locations: 'location',
    events: 'event',
    races: 'species',
    items: 'item',
    skills: 'ability',
    professions: 'occupation',
    conditions: 'condition',
    resources: 'resource',
    currencies: 'resource',
    magic: 'magic',
    scienceTechnology: 'science',
    politicalGroups: 'political',
    religions: 'religious',
    guilds: 'organization',
    languages: 'language',
    culture: 'culture',
    loreNotes: 'note',
    myths: 'myth',
    chapters: 'chapter',

    // Singular
    character: 'character',
    location: 'location',
    event: 'event',
    race: 'species',
    species: 'species',
    item: 'item',
    skill: 'ability',
    ability: 'ability',
    profession: 'occupation',
    occupation: 'occupation',
    condition: 'condition',
    resource: 'resource',
    currency: 'resource',
    science: 'science',
    political: 'political',
    politicalGroup: 'political',
    religion: 'religious',
    religious: 'religious',
    guild: 'organization',
    organization: 'organization',
    language: 'language',
    loreNote: 'note',
    note: 'note',
    myth: 'myth',
    chapter: 'chapter'
};

export interface FaInputFile {
    name: string;
    content: string | Uint8Array;
}

export interface FaImportResult {
    success: boolean;
    message: string;
    realmName: string;
    world?: WorldData;
    entities: WorldEntity[];
    stats: {
        total: number;
        byType: Record<string, number>;
        relationshipsCount: number;
        notesCount: number;
    };
    warnings: string[];
}

/**
 * Extracts pure string value.
 */
function extractString(val: any): string {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object' && typeof val.value === 'string') return val.value;
    return '';
}

/**
 * Extracts boolean value.
 */
function extractBoolean(val: any): boolean {
    if (typeof val === 'boolean') return val;
    if (val === 'true' || val === 1) return true;
    if (typeof val === 'object' && typeof val.value === 'boolean') return val.value;
    return false;
}

/**
 * Extracts array of strings.
 */
function extractStringArray(val: any): string[] {
    if (!val) return [];
    if (Array.isArray(val)) {
        return val.map(item => {
            if (typeof item === 'string') return item.trim();
            if (typeof item === 'object' && typeof item.value === 'string') return item.value.trim();
            return '';
        }).filter(Boolean);
    }
    if (typeof val === 'string') {
        return val.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
}

/**
 * Unpacks Fantasia Archive single/multi relationship field value.
 * In FA, relationship fields can be:
 *   - `{ value: [ { _id: "abc", notes: "...", ... } ], addedValues: "..." }`
 *   - `[ { _id: "abc", notes: "..." } ]`
 *   - `[ "id1", "id2" ]`
 *   - `{ value: { _id: "abc" }, addedValues: "..." }`
 *   - `{ _id: "abc" }`
 *   - `"abc"`
 */
function extractRelationship(val: any, fieldId: string): { ids: string[]; notes: Record<string, string> } {
    const ids: string[] = [];
    const notes: Record<string, string> = {};

    if (!val) return { ids, notes };

    const rawList: any[] = [];
    let generalNote = '';

    if (typeof val === 'object' && val !== null) {
        if (typeof val.addedValues === 'string' && val.addedValues.trim()) {
            generalNote = val.addedValues.trim();
        }
        if (Array.isArray(val.value)) {
            rawList.push(...val.value);
        } else if (val.value && typeof val.value === 'object') {
            rawList.push(val.value);
        } else if (typeof val.value === 'string' && val.value.trim()) {
            rawList.push(val.value.trim());
        } else if (Array.isArray(val)) {
            rawList.push(...val);
        } else if (val._id) {
            rawList.push(val);
        }
    } else if (typeof val === 'string' && val.trim()) {
        rawList.push(val.trim());
    }

    for (const item of rawList) {
        let targetId = '';
        let itemNote = '';

        if (typeof item === 'string') {
            targetId = item.trim();
        } else if (typeof item === 'object' && item !== null) {
            targetId = item._id || item.id || item.value || '';
            if (typeof item.notes === 'string') itemNote = item.notes.trim();
            else if (typeof item.annotation === 'string') itemNote = item.annotation.trim();
            else if (typeof item.note === 'string') itemNote = item.note.trim();
        }

        if (targetId) {
            ids.push(targetId);
            const chosenNote = itemNote || generalNote;
            if (chosenNote) {
                notes[`${fieldId}:${targetId}`] = chosenNote;
            }
        }
    }

    return {
        ids: [...new Set(ids)],
        notes
    };
}

/**
 * Parses raw input files (ZIP bytes, multi-file text, or JSON) into raw Fantasia Archive document records.
 */
export function parseFaRawFiles(files: FaInputFile[]): { docs: any[]; projectName: string; warnings: string[] } {
    const docs: any[] = [];
    let projectName = '';
    const warnings: string[] = [];

    // Helper to process text content
    const processText = (text: string, sourceName: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        // Try standard JSON first
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                parsed.forEach(item => {
                    if (item && typeof item === 'object') docs.push(item);
                });
                return;
            }
            if (parsed && typeof parsed === 'object') {
                if (Array.isArray(parsed.docs)) {
                    parsed.docs.forEach((d: any) => docs.push(d));
                    return;
                }
                if (Array.isArray(parsed.documents)) {
                    parsed.documents.forEach((d: any) => docs.push(d));
                    return;
                }
                if (Array.isArray(parsed.rows)) {
                    parsed.rows.forEach((r: any) => {
                        if (r?.doc) docs.push(r.doc);
                    });
                    return;
                }
                if (parsed.projectName && typeof parsed.projectName === 'string') {
                    projectName = parsed.projectName;
                }
                if (parsed._id && parsed.extraFields) {
                    docs.push(parsed);
                    return;
                }
                // Check if keys are entity types (e.g. { characters: [...], locations: [...] })
                let hasTypeArrays = false;
                for (const [key, value] of Object.entries(parsed)) {
                    if (Array.isArray(value) && FA_TYPE_MAP[key]) {
                        hasTypeArrays = true;
                        value.forEach((d: any) => {
                            if (d && typeof d === 'object') {
                                if (!d.type) d.type = key;
                                docs.push(d);
                            }
                        });
                    }
                }
                if (hasTypeArrays) return;
            }
        } catch {
            // Not standard single JSON object — fallback to NDJSON / PouchDB replication stream
        }

        // Parse line by line (PouchDB replication dump)
        const lines = trimmed.split(/\r?\n/);
        for (const line of lines) {
            const lineTrim = line.trim();
            if (!lineTrim) continue;
            try {
                const parsedLine = JSON.parse(lineTrim);
                if (parsedLine?.projectName) {
                    projectName = parsedLine.projectName;
                }
                if (parsedLine?.doc) {
                    docs.push(parsedLine.doc);
                } else if (parsedLine?._id && (parsedLine?.extraFields || parsedLine?.type)) {
                    docs.push(parsedLine);
                }
            } catch {
                // Ignore non-JSON header lines (e.g. metadata or stream delimiters)
            }
        }
    };

    // Unpack ZIP archives or process files directly
    for (const file of files) {
        const isZip = file.name.toLowerCase().endsWith('.zip') || (file.content instanceof Uint8Array && file.content[0] === 0x50 && file.content[1] === 0x4b);

        if (isZip) {
            try {
                const bytes = file.content instanceof Uint8Array ? file.content : new Uint8Array(file.content as any);
                const unzipped = unzipSync(bytes);
                for (const [relativePath, fileBytes] of Object.entries(unzipped)) {
                    if (relativePath.endsWith('/') || relativePath.startsWith('__MACOSX')) continue;
                    const cleanName = relativePath.split('/').pop() || relativePath;
                    const textContent = strFromU8(fileBytes);
                    processText(textContent, cleanName);
                }
            } catch (err: any) {
                warnings.push(`Failed to extract ZIP file "${file.name}": ${err?.message || 'Invalid archive'}`);
            }
        } else {
            const text = typeof file.content === 'string' ? file.content : strFromU8(file.content);
            processText(text, file.name);
        }
    }

    return { docs, projectName, warnings };
}

/**
 * Converts a raw Fantasia Archive document to a Nexus Chronicle WorldEntity.
 */
export function convertFaDocToEntity(doc: any, fallbackType: EntityType = 'note'): WorldEntity {
    const rawType = (doc.type || '').toString().toLowerCase();
    const entityType: EntityType = FA_TYPE_MAP[rawType] || fallbackType;
    const docId = doc._id || doc.id || crypto.randomUUID();

    // Find document name from extraFields or top-level properties
    let name = '';
    const extraFields: any[] = Array.isArray(doc.extraFields) ? doc.extraFields : [];

    const nameField = extraFields.find(f => f.id === 'name');
    if (nameField) {
        name = extractString(nameField.value);
    }
    if (!name && typeof doc.label === 'string') name = doc.label.trim();
    if (!name && typeof doc.name === 'string') name = doc.name.trim();
    if (!name) name = `Imported ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`;

    // Create 100% compliant baseline entity
    const entity: any = createDefaultEntity(entityType, docId, name);

    // Group connection ID collector
    const groupConnections = entity.groupConnections;

    // Process every field in extraFields
    for (const field of extraFields) {
        const fieldId = field.id;
        const val = field.value;

        switch (fieldId) {
            case 'name':
                // Already captured
                break;

            case 'parentDoc': {
                const { ids } = extractRelationship(val, fieldId);
                const parentId = ids[0] || null;
                if (parentId && parentId !== docId) {
                    entity.parentId = parentId;
                }
                break;
            }

            case 'description':
                entity.description = extractString(val);
                break;

            case 'spoilerNotes':
            case 'privateNotes': {
                const notesText = extractString(val);
                entity.spoilerNotes = notesText;
                entity.privateNotes = notesText;
                break;
            }

            case 'documentColor':
                entity.documentColor = extractString(val) || undefined;
                break;

            case 'documentBackgroundColor':
                entity.documentBackgroundColor = extractString(val) || undefined;
                break;

            case 'categorySwitch': {
                const isCat = extractBoolean(val);
                entity.categorySwitch = isCat;
                entity.isCategory = isCat;
                break;
            }

            case 'deadSwitch': {
                const isDead = extractBoolean(val);
                entity.deadSwitch = isDead;
                entity.isDead = isDead;
                break;
            }

            case 'finishedSwitch': {
                const isFin = extractBoolean(val);
                entity.finishedSwitch = isFin;
                entity.isFinished = isFin;
                break;
            }

            case 'minorSwitch': {
                const isMin = extractBoolean(val);
                entity.minorSwitch = isMin;
                entity.isMinorDocument = isMin;
                break;
            }

            case 'tags': {
                const tags = extractStringArray(val);
                entity.tags = tags;
                break;
            }

            case 'otherNames':
            case 'otherNamesAndEpithets': {
                if (Array.isArray(val)) {
                    entity.otherNames = extractStringArray(val);
                    entity.otherNamesAndEpithets = entity.otherNames.join(', ');
                } else if (typeof val === 'string') {
                    entity.otherNamesAndEpithets = val;
                    entity.otherNames = val.split(',').map(s => s.trim()).filter(Boolean);
                }
                break;
            }

            // Group relations: Political
            case 'leadingPoliticalLeaders': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.political.leadingFigureOf = ids;
                entity.leadingPoliticalLeaders = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedConnectionPolGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.political.connectedTo = ids;
                entity.pairedConnectionPolGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedBelongingPolGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.political.memberOf = ids;
                entity.pairedBelongingPolGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedAllyPolGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.political.allyOf = ids;
                entity.pairedAllyPolGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedEnemyPolGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.political.enemyOf = ids;
                entity.pairedEnemyPolGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }

            // Group relations: Organizations / Guilds
            case 'leadingOtherLeaders': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.organization.leadingFigureOf = ids;
                entity.leadingOtherLeaders = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedConnectionOtherGroups': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.organization.connectedTo = ids;
                entity.pairedConnectionOtherGroups = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedBelongingOtherGroups': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.organization.memberOf = ids;
                entity.pairedBelongingOtherGroups = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedAllyOtherGroups': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.organization.allyOf = ids;
                entity.pairedAllyOtherGroups = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedEnemyOtherGroups': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.organization.enemyOf = ids;
                entity.pairedEnemyOtherGroups = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }

            // Group relations: Religious / Teachings
            case 'leadingReligiousLeaders': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.religious.leadingFigureOf = ids;
                entity.leadingReligiousLeaders = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedConnectionRelGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.religious.connectedTo = ids;
                entity.pairedConnectionRelGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedBelongingRelGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.religious.memberOf = ids;
                entity.pairedBelongingRelGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedAllyRelGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.religious.allyOf = ids;
                entity.pairedAllyRelGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedEnemyRelGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.religious.enemyOf = ids;
                entity.pairedEnemyRelGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }

            // Group relations: Magic Circles
            case 'leadingMagicalLeaders': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.magic.leadingFigureOf = ids;
                entity.leadingMagicalLeaders = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedConnectionMagicGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.magic.connectedTo = ids;
                entity.pairedConnectionMagicGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedBelongingMagicGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.magic.memberOf = ids;
                entity.pairedBelongingMagicGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedAllyMagicGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.magic.allyOf = ids;
                entity.pairedAllyMagicGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedEnemyMagicGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.magic.enemyOf = ids;
                entity.pairedEnemyMagicGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }

            // Group relations: Science / Academies
            case 'leadingTechLeaders': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.science.leadingFigureOf = ids;
                entity.leadingTechLeaders = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedConnectionTechGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.science.connectedTo = ids;
                entity.pairedConnectionTechGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedBelongingTechGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.science.memberOf = ids;
                entity.pairedBelongingTechGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedAllyTechGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.science.allyOf = ids;
                entity.pairedAllyTechGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }
            case 'pairedEnemyTechGroup': {
                const { ids, notes } = extractRelationship(val, fieldId);
                groupConnections.science.enemyOf = ids;
                entity.pairedEnemyTechGroup = ids;
                Object.assign(entity.relationalNotes, notes);
                break;
            }

            // Character RPG stats
            case 'stats': {
                if (typeof val === 'object' && val !== null) {
                    entity.stats = {
                        strength: String(val.strength || '10'),
                        dexterity: String(val.dexterity || '10'),
                        constitution: String(val.constitution || '10'),
                        intelligence: String(val.intelligence || '10'),
                        wisdom: String(val.wisdom || '10'),
                        charisma: String(val.charisma || '10')
                    };
                }
                break;
            }

            // General relationship arrays (fields starting with paired* or *OfCharacter / etc.)
            default: {
                if (fieldId.startsWith('paired') || fieldId.endsWith('Ids') || fieldId.includes('Character') || fieldId.includes('Location')) {
                    const { ids, notes } = extractRelationship(val, fieldId);
                    if (ids.length > 0) {
                        entity[fieldId] = ids;
                        Object.assign(entity.relationalNotes, notes);
                    }
                } else if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
                    entity[fieldId] = val;
                } else if (Array.isArray(val)) {
                    entity[fieldId] = val;
                }
                break;
            }
        }
    }

    return entity as WorldEntity;
}

/**
 * High-level project migrator.
 * Translates any collection of Fantasia Archive files into a complete, bidirectionally synchronized
 * Nexus Chronicle WorldData realm.
 */
export function importFantasiaArchiveProject(
    files: FaInputFile[],
    defaultRealmName: string = 'Fantasia Chronicle'
): FaImportResult {
    const { docs, projectName, warnings } = parseFaRawFiles(files);

    if (docs.length === 0) {
        return {
            success: false,
            message: 'No Fantasia Archive documents found in provided files.',
            realmName: defaultRealmName,
            entities: [],
            stats: { total: 0, byType: {}, relationshipsCount: 0, notesCount: 0 },
            warnings
        };
    }

    const finalRealmName = projectName.trim() || defaultRealmName;
    const rawEntityMap = new Map<string, WorldEntity>();

    // 1. Convert all documents to WorldEntity objects
    docs.forEach(doc => {
        if (!doc) return;
        const entity = convertFaDocToEntity(doc);
        rawEntityMap.set(entity.id, entity);
    });

    let entities = Array.from(rawEntityMap.values());

    // 2. Prevent circular ancestry loops on parentId
    const entityIdSet = new Set(entities.map(e => e.id));
    entities = entities.map(e => {
        if (!e.parentId) return e;
        // Dangling parent check
        if (!entityIdSet.has(e.parentId)) {
            return { ...e, parentId: null };
        }
        // Self-parent check
        if (e.parentId === e.id) {
            return { ...e, parentId: null };
        }
        // Circular reference detection
        const visited = new Set<string>([e.id]);
        let currId: string | null = e.parentId;
        let isCycle = false;
        while (currId) {
            if (visited.has(currId)) {
                isCycle = true;
                break;
            }
            visited.add(currId);
            const parent = rawEntityMap.get(currId);
            currId = parent?.parentId || null;
        }
        if (isCycle) {
            warnings.push(`Resolved circular parent loop on "${e.name}" (${e.id})`);
            return { ...e, parentId: null };
        }
        return e;
    });

    // 3. Reconcile bidirectional relationships across the entire imported codex
    entities = reconcileAllBidirectionalRelations(entities);

    // 4. Compute statistics
    const byType: Record<string, number> = {};
    let relationshipsCount = 0;
    let notesCount = 0;

    entities.forEach(e => {
        byType[e.type] = (byType[e.type] || 0) + 1;
        notesCount += Object.keys(e.relationalNotes || {}).length;

        Object.entries(e).forEach(([key, val]) => {
            if (Array.isArray(val) && (key.startsWith('paired') || key.endsWith('Ids'))) {
                relationshipsCount += val.length;
            }
        });
        if (e.groupConnections) {
            Object.values(e.groupConnections).forEach((g: any) => {
                Object.values(g).forEach((roleList: any) => {
                    if (Array.isArray(roleList)) relationshipsCount += roleList.length;
                });
            });
        }
    });

    // 5. Construct complete WorldData
    const world: WorldData = {
        id: crypto.randomUUID(),
        name: finalRealmName,
        description: `Imported from Fantasia Archive. Contains ${entities.length} codex entries and ${relationshipsCount} interconnected links.`,
        createdAt: Date.now(),
        lastModified: Date.now(),
        entities,
        trash: [],
        mapImage: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000',
        mapConnections: [],
        worldPhase: 'golden'
    };

    return {
        success: true,
        message: `Successfully migrated ${entities.length} entries into realm "${finalRealmName}".`,
        realmName: finalRealmName,
        world,
        entities,
        stats: {
            total: entities.length,
            byType,
            relationshipsCount,
            notesCount
        },
        warnings
    };
}
