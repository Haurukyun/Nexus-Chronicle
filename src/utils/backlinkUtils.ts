import { WorldEntity, Character } from '../types';

export interface CategorizedBacklinks {
    // Relationships
    parents: string[];      // Entities that listed target as a child
    children: string[];     // Entities that listed target as a parent
    friends: string[];      // Entities that listed target as a friend
    allies: string[];       // Alias for friends
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
        parents: [], children: [], friends: [], allies: [], enemies: [], relatives: [], complicated: [],
        lore: [], myths: [], events: [], locations: [], cultures: [],
        residents: [], natives: [], passedHere: [], 
        practitioners: [], members: [],
        containedIn: [], referencedIn: []
    };

    if (!targetId) return results;

    allEntities.forEach(entity => {
        if (entity.id === targetId) return;

        // Symmetric and basic complementary logic
        const asAny = entity as any;
        if (entity.parentIds?.includes(targetId) || asAny.parentsOfCharacter?.includes(targetId)) results.children.push(entity.id);
        if (entity.childrenIds?.includes(targetId) || asAny.childOfCharacter?.includes(targetId)) results.parents.push(entity.id);
        if (entity.friendIds?.includes(targetId) || asAny.allyResCharacter?.includes(targetId)) results.friends.push(entity.id);
        if (entity.enemyIds?.includes(targetId) || asAny.enemydResCharacter?.includes(targetId)) results.enemies.push(entity.id);
        if (entity.relativeIds?.includes(targetId) || asAny.relativesOfCharacter?.includes(targetId)) results.relatives.push(entity.id);
        if (entity.complicatedWithIds?.includes(targetId) || asAny.complicatedResCharacter?.includes(targetId)) results.complicated.push(entity.id);
        
        if (entity.loreNoteIds?.includes(targetId) || asAny.pairedConnectedNotes?.includes(targetId)) results.lore.push(entity.id);
        if (entity.mythIds?.includes(targetId) || asAny.pairedConnectedMyths?.includes(targetId) || asAny.pairedMyths?.includes(targetId)) results.myths.push(entity.id);
        if (entity.eventIds?.includes(targetId) || asAny.pairedEvent?.includes(targetId) || asAny.pairedEvents?.includes(targetId)) results.events.push(entity.id);
        if (entity.locationIds?.includes(targetId) || asAny.pairedConnectedPlaces?.includes(targetId) || asAny.pairedLocations?.includes(targetId)) results.locations.push(entity.id);
        if (entity.cultureIds?.includes(targetId) || asAny.relatedCultures?.includes(targetId)) results.cultures.push(entity.id);

        if (entity.parentId === targetId || entity.belongsUnderId === targetId || entity.parentDoc?.includes(targetId)) results.containedIn.push(entity.id);

        // Character specific
        if (entity.type === 'character') {
            const char = entity as Character;
            const res = char.pairedCurrentLocationNew || char.placeOfResidenceId || [];
            if (res.includes(targetId) || char.pairedCurrentLocation === targetId) results.residents.push(entity.id);

            const orig = char.pairedOriginLocationNew || char.placeOfOriginId || [];
            if (orig.includes(targetId) || char.pairedOriginLocation === targetId) results.natives.push(entity.id);

            const dem = char.pairedDemiseLocationNew || char.placeOfDemiseId || [];
            if (dem.includes(targetId) || char.pairedDemiseLocation === targetId) results.passedHere.push(entity.id);
            
            const prof = char.pairedProfession || char.occupationIds || [];
            if (prof.includes(targetId)) results.practitioners.push(entity.id);

            const race = char.pairedRace || char.speciesIds || [];
            if (race.includes(targetId)) results.members.push(entity.id);
            
            const skills = char.pairedSkills || char.skillIds || char.spellIds || [];
            if (skills.includes(targetId)) results.practitioners.push(entity.id);

            const items = char.pairedConnectedItems || char.equipmentIds || char.wealthIds || [];
            if (items.includes(targetId)) results.referencedIn.push(entity.id);

            if (char.pairedResources?.includes(targetId)) results.referencedIn.push(entity.id);
            if (char.pairedLanguage?.includes(targetId)) results.referencedIn.push(entity.id);

            // Character group connections
            const charMembers = [
                ...(char.leadingPoliticalLeaders || []),
                ...(char.leadingOtherLeaders || []),
                ...(char.leadingReligiousLeaders || []),
                ...(char.leadingMagicalLeaders || []),
                ...(char.leadingTechLeaders || []),
                ...(char.pairedBelongingPolGroup || []),
                ...(char.pairedBelongingOtherGroups || []),
                ...(char.pairedBelongingRelGroup || []),
                ...(char.pairedBelongingMagicGroup || []),
                ...(char.pairedBelongingTechGroup || []),
            ];
            if (charMembers.includes(targetId)) results.members.push(entity.id);

            const charAllies = [
                ...(char.pairedAllyPolGroup || []),
                ...(char.pairedAllyOtherGroups || []),
                ...(char.pairedAllyRelGroup || []),
                ...(char.pairedAllyMagicGroup || []),
                ...(char.pairedAllyTechGroup || []),
            ];
            if (charAllies.includes(targetId)) results.friends.push(entity.id);

            const charEnemies = [
                ...(char.pairedEnemyPolGroup || []),
                ...(char.pairedEnemyOtherGroups || []),
                ...(char.pairedEnemyRelGroup || []),
                ...(char.pairedEnemyMagicGroup || []),
                ...(char.pairedEnemyTechGroup || []),
            ];
            if (charEnemies.includes(targetId)) results.enemies.push(entity.id);

            const charConnected = [
                ...(char.pairedConnectionPolGroup || []),
                ...(char.pairedConnectionOtherGroups || []),
                ...(char.pairedConnectionRelGroup || []),
                ...(char.pairedConnectionMagicGroup || []),
                ...(char.pairedConnectionTechGroup || []),
            ];
            if (charConnected.includes(targetId)) results.referencedIn.push(entity.id);
        }

        // Group Connections (Deep scan across standard structure)
        if (entity.groupConnections && typeof entity.groupConnections === 'object') {
            try {
                Object.entries(entity.groupConnections).forEach(([_, roles]) => {
                    if (roles && typeof roles === 'object') {
                        Object.entries(roles as any).forEach(([role, ids]) => {
                            if (Array.isArray(ids) && ids.includes(targetId)) {
                                if (role === 'memberOf' || role === 'leadingFigureOf') results.members.push(entity.id);
                                else if (role === 'allyOf') results.friends.push(entity.id);
                                else if (role === 'enemyOf') results.enemies.push(entity.id);
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
        if ((entity as any).involvedEntityIds?.includes(targetId) || (entity as any).pairedCharacter?.includes(targetId)) results.events.push(entity.id);
        if ((entity as any).locationId === targetId || (entity as any).pairedLocations?.includes(targetId)) results.locations.push(entity.id);
    });

    results.allies = [...results.friends];

    // Deduplicate
    Object.keys(results).forEach(key => {
        results[key as keyof CategorizedBacklinks] = [...new Set(results[key as keyof CategorizedBacklinks])];
    });

    return results;
}
