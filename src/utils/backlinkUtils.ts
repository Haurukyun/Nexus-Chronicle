import { WorldEntity, Character } from '../types';

export interface CategorizedBacklinks {
    // Relationships
    parents: string[];      // Entities that listed target as a child
    children: string[];     // Entities that listed target as a parent
    friends: string[];      // Entities that listed target as a friend
    enemies: string[];      // Entities that listed target as an enemy
    relatives: string[];    // Entities that listed target as a relative
    complicated: string[];  // Entities that listed target as complicated
    
    // World Connections
    lore: string[];
    myths: string[];
    events: string[];
    locations: string[];    // Sub-locations or related entities
    cultures: string[];
    
    // Character Specific / Complements
    residents: string[];    // Entries that listed target (Location) as Residence
    natives: string[];      // Entries that listed target (Location) as Origin
    passedHere: string[];   // Entries that listed target (Location) as Place of Demise
    
    practitioners: string[]; // Entries that listed target (Occupation/Skill) as theirs
    members: string[];       // Entries that listed target (Species/Group) as theirs
    
    containedIn: string[];   // Entities that listed target as a tag or "belongsUnder"
    referencedIn: string[];  // General fallback
}

export function getCategorizedBacklinks(targetId: string, allEntities: WorldEntity[]): CategorizedBacklinks {
    const results: CategorizedBacklinks = {
        parents: [], children: [], friends: [], enemies: [], relatives: [], complicated: [],
        lore: [], myths: [], events: [], locations: [], cultures: [],
        residents: [], natives: [], passedHere: [], 
        practitioners: [], members: [],
        containedIn: [], referencedIn: []
    };

    if (!targetId) return results;

    allEntities.forEach(entity => {
        if (entity.id === targetId) return;

        // Symmetric and basic complementary logic
        if (entity.parentIds?.includes(targetId)) results.children.push(entity.id);
        if (entity.childrenIds?.includes(targetId)) results.parents.push(entity.id);
        if (entity.friendIds?.includes(targetId)) results.friends.push(entity.id);
        if (entity.enemyIds?.includes(targetId)) results.enemies.push(entity.id);
        if (entity.relativeIds?.includes(targetId)) results.relatives.push(entity.id);
        if (entity.complicatedWithIds?.includes(targetId)) results.complicated.push(entity.id);
        
        if (entity.loreNoteIds?.includes(targetId)) results.lore.push(entity.id);
        if (entity.mythIds?.includes(targetId)) results.myths.push(entity.id);
        if (entity.eventIds?.includes(targetId)) results.events.push(entity.id);
        if (entity.locationIds?.includes(targetId)) results.locations.push(entity.id);
        if (entity.cultureIds?.includes(targetId)) results.cultures.push(entity.id);

        if (entity.belongsUnderId === targetId) results.containedIn.push(entity.id);

        // Character specific
        if (entity.type === 'character') {
            const char = entity as Character;
            if (Array.isArray(char.placeOfResidenceId) && char.placeOfResidenceId.includes(targetId)) results.residents.push(entity.id);
            if (Array.isArray(char.placeOfOriginId) && char.placeOfOriginId.includes(targetId)) results.natives.push(entity.id);
            if (Array.isArray(char.placeOfDemiseId) && char.placeOfDemiseId.includes(targetId)) results.passedHere.push(entity.id);
            
            if (Array.isArray(char.occupationIds) && char.occupationIds.includes(targetId)) results.practitioners.push(entity.id);
            if (Array.isArray(char.speciesIds) && char.speciesIds.includes(targetId)) results.members.push(entity.id);
            
            if ((Array.isArray(char.skillIds) && char.skillIds.includes(targetId)) || (Array.isArray(char.spellIds) && char.spellIds.includes(targetId))) results.practitioners.push(entity.id);
            if ((Array.isArray(char.equipmentIds) && char.equipmentIds.includes(targetId)) || (Array.isArray(char.wealthIds) && char.wealthIds.includes(targetId))) results.referencedIn.push(entity.id);
        }

        // Group Connections (Deep scan)
        if (entity.groupConnections && typeof entity.groupConnections === 'object') {
            try {
                Object.entries(entity.groupConnections).forEach(([groupType, roles]) => {
                    if (roles && typeof roles === 'object') {
                        Object.entries(roles as any).forEach(([role, ids]) => {
                            if (Array.isArray(ids) && ids.includes(targetId)) {
                                if (role === 'memberOf' || role === 'leadingFigureOf') results.members.push(entity.id);
                                else results.referencedIn.push(entity.id);
                            }
                        });
                    }
                });
            } catch (e) {
                // Ignore corrupt groupConnections
            }
        }

        
        // Event specific
        if ((entity as any).involvedEntityIds?.includes(targetId)) results.events.push(entity.id);
        if ((entity as any).locationId === targetId) results.locations.push(entity.id);
    });

    // Deduplicate
    Object.keys(results).forEach(key => {
        results[key as keyof CategorizedBacklinks] = [...new Set(results[key as keyof CategorizedBacklinks])];
    });

    return results;
}
