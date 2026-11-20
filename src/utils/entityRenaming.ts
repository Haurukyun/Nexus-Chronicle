import { WorldData, WorldEntity } from '../types';

/** Replace [[OldName]] and [[OldName|alias]] with [[NewName]] and [[NewName|alias]] in a text string */
function replaceWikilinks(text: string, oldName: string, newName: string): string {
  if (!text) return text;
  // [[OldName|alias]] -> [[NewName|alias]]
  const escaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text
    .replace(new RegExp(`\\[\\[${escaped}\\|`, 'g'), `[[${newName}|`)
    .replace(new RegExp(`\\[\\[${escaped}\\]\\]`, 'g'), `[[${newName}]]`);
}

/** Update a single entity's text fields */
function patchEntityText(entity: WorldEntity, oldName: string, newName: string): { entity: WorldEntity; count: number } {
  let count = 0;
  const patch: Partial<WorldEntity> = {};
  const textFields: (keyof WorldEntity)[] = ['description', 'privateNotes', 'loreNotes', 'notes'] as (keyof WorldEntity)[];
  for (const field of textFields) {
    const val = (entity as any)[field];
    if (typeof val === 'string') {
      const replaced = replaceWikilinks(val, oldName, newName);
      if (replaced !== val) {
        (patch as any)[field] = replaced;
        count += (replaced.match(/\[\[/g) || []).length;
      }
    }
  }
  // Also patch relationalNotes object values
  if ((entity as any).relationalNotes) {
    const rn = { ...(entity as any).relationalNotes };
    for (const key of Object.keys(rn)) {
      if (typeof rn[key] === 'string') {
        const replaced = replaceWikilinks(rn[key], oldName, newName);
        if (replaced !== rn[key]) { rn[key] = replaced; count++; }
      }
    }
    patch.relationalNotes = rn;
  }
  return { entity: { ...entity, ...patch }, count };
}

export interface RenameResult {
  updatedWorld: WorldData;
  occurrencesPatched: number;
  entitiesAffected: string[]; // names of entities with patched text
}

export function renameEntityInWorld(world: WorldData, entityId: string, newName: string): RenameResult {
  const target = world.entities.find(e => e.id === entityId);
  if (!target) return { updatedWorld: world, occurrencesPatched: 0, entitiesAffected: [] };
  const oldName = target.name;
  if (oldName === newName) return { updatedWorld: world, occurrencesPatched: 0, entitiesAffected: [] };

  let totalCount = 0;
  const affected: string[] = [];
  const updatedEntities = world.entities.map(e => {
    if (e.id === entityId) return { ...e, name: newName };
    const { entity: patched, count } = patchEntityText(e, oldName, newName);
    if (count > 0) { totalCount += count; affected.push(e.name); }
    return count > 0 ? patched : e;
  });
  return {
    updatedWorld: { ...world, entities: updatedEntities },
    occurrencesPatched: totalCount,
    entitiesAffected: affected,
  };
}
