import { EntityType, WorldEntity } from '../types';

export interface RelationPairDef {
    typeA: EntityType | '*';
    fieldA: string;
    legacyFieldA?: string;
    typeB: EntityType | '*';
    fieldB: string;
    legacyFieldB?: string;
}

// Exhaustive table of bidirectional relation pairs across all entity types
export const RELATION_PAIRS: RelationPairDef[] = [
    // 1. Character <-> Character
    { typeA: 'character', fieldA: 'childOfCharacter', legacyFieldA: 'childrenIds', typeB: 'character', fieldB: 'parentsOfCharacter', legacyFieldB: 'parentIds' },
    { typeA: 'character', fieldA: 'parentsOfCharacter', legacyFieldA: 'parentIds', typeB: 'character', fieldB: 'childOfCharacter', legacyFieldB: 'childrenIds' },
    { typeA: 'character', fieldA: 'relativesOfCharacter', legacyFieldA: 'relativeIds', typeB: 'character', fieldB: 'relativesOfCharacter', legacyFieldB: 'relativeIds' },
    { typeA: 'character', fieldA: 'allyResCharacter', legacyFieldA: 'friendIds', typeB: 'character', fieldB: 'allyResCharacter', legacyFieldB: 'friendIds' },
    { typeA: 'character', fieldA: 'enemydResCharacter', legacyFieldA: 'enemyIds', typeB: 'character', fieldB: 'enemydResCharacter', legacyFieldB: 'enemyIds' },
    { typeA: 'character', fieldA: 'complicatedResCharacter', legacyFieldA: 'complicatedWithIds', typeB: 'character', fieldB: 'complicatedResCharacter', legacyFieldB: 'complicatedWithIds' },

    // 2. Character <-> Condition (Boons, Afflictions, Other)
    { typeA: 'character', fieldA: 'pairedConditionsPositive', typeB: 'condition', fieldB: 'pairedCharactersPositive' },
    { typeA: 'character', fieldA: 'pairedConditionsNegative', typeB: 'condition', fieldB: 'pairedCharactersNegative' },
    { typeA: 'character', fieldA: 'pairedConditionsOther', typeB: 'condition', fieldB: 'pairedCharactersOther' },
    { typeA: 'character', fieldA: 'pairedConditionsConnected', typeB: 'condition', fieldB: 'pairedCharactersConnected' },

    // 3. Character <-> Location
    { typeA: 'character', fieldA: 'pairedCurrentLocationNew', legacyFieldA: 'placeOfResidenceId', typeB: 'location', fieldB: 'pairedCurrentCharactersNew', legacyFieldB: 'livingCharacterIds' },
    { typeA: 'character', fieldA: 'pairedOriginLocationNew', legacyFieldA: 'placeOfOriginId', typeB: 'location', fieldB: 'pairedOriginCharactersNew', legacyFieldB: 'originatedCharacterIds' },
    { typeA: 'character', fieldA: 'pairedDemiseLocationNew', legacyFieldA: 'placeOfDemiseId', typeB: 'location', fieldB: 'pairedDemiseCharactersNew', legacyFieldB: 'deceasedCharacterIds' },
    { typeA: 'character', fieldA: 'pairedConnectedPlaces', legacyFieldA: 'locationIds', typeB: 'location', fieldB: 'pairedConnectedCharacter', legacyFieldB: 'connectedCharacterIds' },

    // 4. Character <-> Event
    { typeA: 'character', fieldA: 'pairedEvent', legacyFieldA: 'eventIds', typeB: 'event', fieldB: 'pairedCharacter' },

    // 5. Character <-> Species
    { typeA: 'character', fieldA: 'pairedRace', legacyFieldA: 'speciesIds', typeB: 'species', fieldB: 'pairedCharacter' },

    // 6. Character <-> Occupation
    { typeA: 'character', fieldA: 'pairedProfession', legacyFieldA: 'occupationIds', typeB: 'occupation', fieldB: 'pairedCharacter' },

    // 7. Character <-> Ability / Skill
    { typeA: 'character', fieldA: 'pairedSkills', legacyFieldA: 'skillIds', typeB: 'ability', fieldB: 'pairedCharacterSkills' },

    // 8. Character <-> Item
    { typeA: 'character', fieldA: 'pairedConnectedItems', legacyFieldA: 'equipmentIds', typeB: 'item', fieldB: 'pairedConnectedCharacter' },

    // 9. Character <-> Resource
    { typeA: 'character', fieldA: 'pairedResources', typeB: 'resource', fieldB: 'pairedCharacter' },

    // 10. Character <-> Language
    { typeA: 'character', fieldA: 'pairedLanguage', typeB: 'language', fieldB: 'pairedCharacter' },

    // 11. Character <-> Culture
    { typeA: 'character', fieldA: 'relatedCultures', legacyFieldA: 'cultureIds', typeB: 'culture', fieldB: 'relatedCharacters' },

    // 12. Character <-> Political Group
    { typeA: 'character', fieldA: 'leadingPoliticalLeaders', typeB: 'political', fieldB: 'leadingCharacters' },
    { typeA: 'character', fieldA: 'pairedConnectionPolGroup', typeB: 'political', fieldB: 'pairedConnectionCharacter' },
    { typeA: 'character', fieldA: 'pairedBelongingPolGroup', typeB: 'political', fieldB: 'pairedBelongingCharacter' },
    { typeA: 'character', fieldA: 'pairedAllyPolGroup', typeB: 'political', fieldB: 'pairedAllyCharacter' },
    { typeA: 'character', fieldA: 'pairedEnemyPolGroup', typeB: 'political', fieldB: 'pairedEnemyCharacter' },

    // 13. Character <-> Organization
    { typeA: 'character', fieldA: 'leadingOtherLeaders', typeB: 'organization', fieldB: 'leadingCharacters' },
    { typeA: 'character', fieldA: 'pairedConnectionOtherGroups', typeB: 'organization', fieldB: 'pairedConnectionCharacter' },
    { typeA: 'character', fieldA: 'pairedBelongingOtherGroups', typeB: 'organization', fieldB: 'pairedBelongingCharacter' },
    { typeA: 'character', fieldA: 'pairedAllyOtherGroups', typeB: 'organization', fieldB: 'pairedAllyCharacter' },
    { typeA: 'character', fieldA: 'pairedEnemyOtherGroups', typeB: 'organization', fieldB: 'pairedEnemyCharacter' },

    // 14. Character <-> Religion
    { typeA: 'character', fieldA: 'leadingReligiousLeaders', typeB: 'religious', fieldB: 'leadingCharacters' },
    { typeA: 'character', fieldA: 'pairedConnectionRelGroup', typeB: 'religious', fieldB: 'pairedConnectionCharacter' },
    { typeA: 'character', fieldA: 'pairedBelongingRelGroup', typeB: 'religious', fieldB: 'pairedBelongingCharacter' },
    { typeA: 'character', fieldA: 'pairedAllyRelGroup', typeB: 'religious', fieldB: 'pairedAllyCharacter' },
    { typeA: 'character', fieldA: 'pairedEnemyRelGroup', typeB: 'religious', fieldB: 'pairedEnemyCharacter' },

    // 15. Character <-> Magic
    { typeA: 'character', fieldA: 'leadingMagicalLeaders', typeB: 'magic', fieldB: 'leadingCharacters' },
    { typeA: 'character', fieldA: 'pairedConnectionMagicGroup', typeB: 'magic', fieldB: 'pairedConnectionCharacter' },
    { typeA: 'character', fieldA: 'pairedBelongingMagicGroup', typeB: 'magic', fieldB: 'pairedBelongingCharacter' },
    { typeA: 'character', fieldA: 'pairedAllyMagicGroup', typeB: 'magic', fieldB: 'pairedAllyCharacter' },
    { typeA: 'character', fieldA: 'pairedEnemyMagicGroup', typeB: 'magic', fieldB: 'pairedEnemyCharacter' },
    { typeA: 'character', fieldA: 'pairedMagic', typeB: 'magic', fieldB: 'pairedCharacter' },

    // 16. Character <-> Tech / Science
    { typeA: 'character', fieldA: 'leadingTechLeaders', typeB: 'tech', fieldB: 'leadingCharacters' },
    { typeA: 'character', fieldA: 'pairedConnectionTechGroup', typeB: 'tech', fieldB: 'pairedConnectionCharacter' },
    { typeA: 'character', fieldA: 'pairedBelongingTechGroup', typeB: 'tech', fieldB: 'pairedBelongingCharacter' },
    { typeA: 'character', fieldA: 'pairedAllyTechGroup', typeB: 'tech', fieldB: 'pairedAllyCharacter' },
    { typeA: 'character', fieldA: 'pairedEnemyTechGroup', typeB: 'tech', fieldB: 'pairedEnemyCharacter' },
    { typeA: 'character', fieldA: 'pairedTech', typeB: 'tech', fieldB: 'pairedCharacter' },
    { typeA: 'character', fieldA: 'pairedTech', typeB: 'science', fieldB: 'pairedCharacter' },

    // 17. Condition <-> Location
    { typeA: 'condition', fieldA: 'pairedLocationsPositive', typeB: 'location', fieldB: 'pairedConditionsPositive' },
    { typeA: 'condition', fieldA: 'pairedLocationsNegative', typeB: 'location', fieldB: 'pairedConditionsNegative' },
    { typeA: 'condition', fieldA: 'pairedLocationsOther', typeB: 'location', fieldB: 'pairedConditionsOther' },

    // 18. Condition <-> Event
    { typeA: 'condition', fieldA: 'pairedEventsPositive', typeB: 'event', fieldB: 'pairedConditionsPositive' },
    { typeA: 'condition', fieldA: 'pairedEventsNegative', typeB: 'event', fieldB: 'pairedConditionsNegative' },
    { typeA: 'condition', fieldA: 'pairedEventsOther', typeB: 'event', fieldB: 'pairedConditionsOther' },

    // 19. Condition <-> Species
    { typeA: 'condition', fieldA: 'pairedRacesPositive', typeB: 'species', fieldB: 'pairedConditionsPositive' },
    { typeA: 'condition', fieldA: 'pairedRacesNegative', typeB: 'species', fieldB: 'pairedConditionsNegative' },
    { typeA: 'condition', fieldA: 'pairedRacesOther', typeB: 'species', fieldB: 'pairedConditionsOther' },

    // 20. Condition <-> Item
    { typeA: 'condition', fieldA: 'pairedItemsPositive', typeB: 'item', fieldB: 'pairedConditionsPositive' },
    { typeA: 'condition', fieldA: 'pairedItemsNegative', typeB: 'item', fieldB: 'pairedConditionsNegative' },
    { typeA: 'condition', fieldA: 'pairedItemsOther', typeB: 'item', fieldB: 'pairedConditionsOther' },
    { typeA: 'condition', fieldA: 'pairedItemsAfflicting', typeB: 'item', fieldB: 'pairedConditionsAfflicting' },

    // 21. Condition <-> Ability
    { typeA: 'condition', fieldA: 'pairedSkillsPositive', typeB: 'ability', fieldB: 'pairedConditionsPositive' },
    { typeA: 'condition', fieldA: 'pairedSkillsNegative', typeB: 'ability', fieldB: 'pairedConditionsNegative' },
    { typeA: 'condition', fieldA: 'pairedSkillsOther', typeB: 'ability', fieldB: 'pairedConditionsOther' },

    // 22. Condition <-> Resource
    { typeA: 'condition', fieldA: 'pairedResourcesPositive', typeB: 'resource', fieldB: 'pairedConditionsPositive' },
    { typeA: 'condition', fieldA: 'pairedResourcesNegative', typeB: 'resource', fieldB: 'pairedConditionsNegative' },
    { typeA: 'condition', fieldA: 'pairedResourcesOther', typeB: 'resource', fieldB: 'pairedConditionsOther' },

    // 23. Condition <-> Condition (Symmetric)
    { typeA: 'condition', fieldA: 'pairedConnectedConditionsPositive', typeB: 'condition', fieldB: 'pairedConnectedConditionsPositive' },
    { typeA: 'condition', fieldA: 'pairedConnectedConditionsNegative', typeB: 'condition', fieldB: 'pairedConnectedConditionsNegative' },
    { typeA: 'condition', fieldA: 'pairedConnectedConditionsOther', typeB: 'condition', fieldB: 'pairedConnectedConditionsOther' },

    // 24. Location <-> Location
    { typeA: 'location', fieldA: 'succedingLocations', typeB: 'location', fieldB: 'preceedingLocations' },
    { typeA: 'location', fieldA: 'preceedingLocations', typeB: 'location', fieldB: 'succedingLocations' },
    { typeA: 'location', fieldA: 'neighbourLocations', typeB: 'location', fieldB: 'neighbourLocations' },
    { typeA: 'location', fieldA: 'connectedLocations', typeB: 'location', fieldB: 'connectedLocations' },

    // 25. Location <-> Species
    { typeA: 'location', fieldA: 'pairedConnectedRaces', typeB: 'species', fieldB: 'pairedConnectedPlaces' },

    // 26. Location <-> Language
    { typeA: 'location', fieldA: 'pairedLanguages', typeB: 'language', fieldB: 'pairedLocations' },

    // 27. Location <-> Culture
    { typeA: 'location', fieldA: 'relatedCultures', typeB: 'culture', fieldB: 'relatedLocations' },

    // 28. Location <-> Occupation
    { typeA: 'location', fieldA: 'connectedProfessions', typeB: 'occupation', fieldB: 'connectedLocations' },

    // 29. Location <-> Resource
    { typeA: 'location', fieldA: 'connectedResources', typeB: 'resource', fieldB: 'connectedLocations' },

    // 30. Location <-> Event
    { typeA: 'location', fieldA: 'pairedEvent', typeB: 'event', fieldB: 'pairedLocations' },

    // 31. Location <-> Item
    { typeA: 'location', fieldA: 'pairedConnectedItems', typeB: 'item', fieldB: 'pairedConnectedLocations' },

    // 32. Location <-> Groups
    { typeA: 'location', fieldA: 'governPolitical', typeB: 'political', fieldB: 'governLocations' },
    { typeA: 'location', fieldA: 'connectedPolitical', typeB: 'political', fieldB: 'connectedLocations' },
    { typeA: 'location', fieldA: 'governOther', typeB: 'organization', fieldB: 'governLocations' },
    { typeA: 'location', fieldA: 'connectedOther', typeB: 'organization', fieldB: 'connectedLocations' },
    { typeA: 'location', fieldA: 'governReligious', typeB: 'religious', fieldB: 'governLocations' },
    { typeA: 'location', fieldA: 'connectedReligious', typeB: 'religious', fieldB: 'collectedLocations' },
    { typeA: 'location', fieldA: 'governMagical', typeB: 'magic', fieldB: 'governLocations' },
    { typeA: 'location', fieldA: 'connectedMagical', typeB: 'magic', fieldB: 'connectedLocations' },
    { typeA: 'location', fieldA: 'governTech', typeB: 'tech', fieldB: 'governLocations' },
    { typeA: 'location', fieldA: 'connectedTech', typeB: 'tech', fieldB: 'connectedLocations' },

    // 33. Event <-> Event
    { typeA: 'event', fieldA: 'pairedEvents', typeB: 'event', fieldB: 'pairedEvents' },

    // 34. Event <-> Item
    { typeA: 'event', fieldA: 'pairedItems', typeB: 'item', fieldB: 'pairedEvents' },

    // 35. Event <-> Species
    { typeA: 'event', fieldA: 'pairedRaces', typeB: 'species', fieldB: 'connectedEvents' },

    // 36. Event <-> Culture
    { typeA: 'event', fieldA: 'relatedCultures', typeB: 'culture', fieldB: 'pairedEvents' },

    // 37. Event <-> Ability
    { typeA: 'event', fieldA: 'pairedSkills', typeB: 'ability', fieldB: 'pairedEventSkills' },
    { typeA: 'event', fieldA: 'pairedSpells', typeB: 'ability', fieldB: 'pairedEventSpells' },

    // 38. Event <-> Groups
    { typeA: 'event', fieldA: 'connectedPolitical', typeB: 'political', fieldB: 'connectedEvents' },
    { typeA: 'event', fieldA: 'connectedOtherGroups', typeB: 'organization', fieldB: 'connectedEvents' },
    { typeA: 'event', fieldA: 'connectedReligious', typeB: 'religious', fieldB: 'connectedEvents' },
    { typeA: 'event', fieldA: 'connectedMagical', typeB: 'magic', fieldB: 'connectedEvents' },
    { typeA: 'event', fieldA: 'connectedTech', typeB: 'tech', fieldB: 'connectedEvents' },

    // 39. Species <-> Species
    { typeA: 'species', fieldA: 'relatedRaces', typeB: 'species', fieldB: 'relatedRaces' },
    { typeA: 'species', fieldA: 'evolvedIntoRaces', typeB: 'species', fieldB: 'evolvedFromRaces' },
    { typeA: 'species', fieldA: 'evolvedFromRaces', typeB: 'species', fieldB: 'evolvedIntoRaces' },

    // 40. Species <-> Culture
    { typeA: 'species', fieldA: 'relatedCultures', typeB: 'culture', fieldB: 'relatedRaces' },

    // 41. Species <-> Language
    { typeA: 'species', fieldA: 'localLanguages', typeB: 'language', fieldB: 'usedByRaces' },

    // 42. Species <-> Occupation
    { typeA: 'species', fieldA: 'commonProfessions', typeB: 'occupation', fieldB: 'commonRaces' },

    // 43. Species <-> Item
    { typeA: 'species', fieldA: 'pairedConnectedItems', typeB: 'item', fieldB: 'pairedConnectedRaces' },

    // 44. Species <-> Resource
    { typeA: 'species', fieldA: 'pairedProducedFromResources', typeB: 'resource', fieldB: 'pairedProducedFromRaces' },
    { typeA: 'species', fieldA: 'pairedUsedResourcesResources', typeB: 'resource', fieldB: 'pairedUsedResourcesRaces' },
    { typeA: 'species', fieldA: 'pairedConnectedResources', typeB: 'resource', fieldB: 'pairedConnectedRaces' },

    // 45. Species <-> Ability
    { typeA: 'species', fieldA: 'pairedSkills', typeB: 'ability', fieldB: 'pairedRacesSkills' },

    // 46. Species <-> Groups
    { typeA: 'species', fieldA: 'commonInPoliticalGroups', typeB: 'political', fieldB: 'connectedRaces' },
    { typeA: 'species', fieldA: 'commonInOtherGroups', typeB: 'organization', fieldB: 'connectedRaces' },
    { typeA: 'species', fieldA: 'commonInReligiousGroups', typeB: 'religious', fieldB: 'connectedRaces' },
    { typeA: 'species', fieldA: 'commonInMagicGroups', typeB: 'magic', fieldB: 'connectedRaces' },
    { typeA: 'species', fieldA: 'commonInTechGroups', typeB: 'tech', fieldB: 'connectedRaces' },

    // 47. Culture <-> Culture
    { typeA: 'culture', fieldA: 'succedingCultures', typeB: 'culture', fieldB: 'preceedingCultures' },
    { typeA: 'culture', fieldA: 'preceedingCultures', typeB: 'culture', fieldB: 'succedingCultures' },

    // 48. Culture <-> Ability
    { typeA: 'culture', fieldA: 'pairedSkills', typeB: 'ability', fieldB: 'relatedCultures' },

    // 49. Culture <-> Item
    { typeA: 'culture', fieldA: 'pairedItems', typeB: 'item', fieldB: 'relatedCultures' },

    // 50. Culture <-> Occupation
    { typeA: 'culture', fieldA: 'relatedProfessions', typeB: 'occupation', fieldB: 'relatedCultures' },

    // 51. Culture <-> Resource
    { typeA: 'culture', fieldA: 'relatedResouces', typeB: 'resource', fieldB: 'relatedCultures' },

    // 52. Culture <-> Groups
    { typeA: 'culture', fieldA: 'pairedConnectedPolGroups', typeB: 'political', fieldB: 'pairedConnectedCultures' },
    { typeA: 'culture', fieldA: 'pairedConnectedOtherGroups', typeB: 'organization', fieldB: 'pairedConnectedCultures' },
    { typeA: 'culture', fieldA: 'pairedConnectedReligiousGroups', typeB: 'religious', fieldB: 'pairedConnectedCultures' },
    { typeA: 'culture', fieldA: 'pairedConnectedMagicGroups', typeB: 'magic', fieldB: 'pairedConnectedCultures' },
    { typeA: 'culture', fieldA: 'pairedConnectedTechGroups', typeB: 'tech', fieldB: 'pairedConnectedCultures' },

    // 53. Language <-> Language
    { typeA: 'language', fieldA: 'predecessorLanguages', typeB: 'language', fieldB: 'followingLanguages' },
    { typeA: 'language', fieldA: 'followingLanguages', typeB: 'language', fieldB: 'predecessorLanguages' },

    // 54. Language <-> Occupation
    { typeA: 'language', fieldA: 'pairedConnectedProfessions', typeB: 'occupation', fieldB: 'localLanguages' },

    // 55. Language <-> Groups
    { typeA: 'language', fieldA: 'usedInPoliticalGroups', typeB: 'political', fieldB: 'localLanguages' },
    { typeA: 'language', fieldA: 'usedInOtherGroups', typeB: 'organization', fieldB: 'localLanguages' },
    { typeA: 'language', fieldA: 'usedInReligiousGroups', typeB: 'religious', fieldB: 'localLanguages' },
    { typeA: 'language', fieldA: 'usedInMagicalGroups', typeB: 'magic', fieldB: 'localLanguages' },
    { typeA: 'language', fieldA: 'usedInTechGroups', typeB: 'tech', fieldB: 'localLanguages' },

    // 56. Item <-> Item
    { typeA: 'item', fieldA: 'pairedItems', typeB: 'item', fieldB: 'pairedItems' },

    // 57. Item <-> Resource
    { typeA: 'item', fieldA: 'pairedResourcesMade', typeB: 'resource', fieldB: 'pairedItemMade' },
    { typeA: 'item', fieldA: 'pairedResourcesProduced', typeB: 'resource', fieldB: 'pairedItemProduced' },

    // 58. Item <-> Ability
    { typeA: 'item', fieldA: 'pairedSkillsUsing', typeB: 'ability', fieldB: 'pairedItemsUsing' },
    { typeA: 'item', fieldA: 'pairedSkillsCommon', typeB: 'ability', fieldB: 'pairedItemsCommon' },
    { typeA: 'item', fieldA: 'pairedSkillsCreate', typeB: 'ability', fieldB: 'pairedItemsCreate' },
    { typeA: 'item', fieldA: 'pairedSkillsRequire', typeB: 'ability', fieldB: 'pairedItemsRequire' },

    // 59. Item <-> Occupation
    { typeA: 'item', fieldA: 'pairedConnectedProfessions', typeB: 'occupation', fieldB: 'pairedConnectedItems' },

    // 60. Item <-> Groups
    { typeA: 'item', fieldA: 'pairedConnectedPolGroups', typeB: 'political', fieldB: 'pairedConnectedItems' },
    { typeA: 'item', fieldA: 'pairedConnectedOtherGroups', typeB: 'organization', fieldB: 'pairedConnectedItems' },
    { typeA: 'item', fieldA: 'pairedConnectedRelGroups', typeB: 'religious', fieldB: 'pairedConnectedItems' },
    { typeA: 'item', fieldA: 'pairedConnectedMagicGroups', typeB: 'magic', fieldB: 'pairedConnectedItems' },
    { typeA: 'item', fieldA: 'pairedConnectedTechGroups', typeB: 'tech', fieldB: 'pairedConnectedItems' },

    // 61. Occupation <-> Occupation
    { typeA: 'occupation', fieldA: 'relatedProfessions', typeB: 'occupation', fieldB: 'relatedProfessions' },

    // 62. Occupation <-> Resource
    { typeA: 'occupation', fieldA: 'usedResources', typeB: 'resource', fieldB: 'usedProfessions' },
    { typeA: 'occupation', fieldA: 'producedResources', typeB: 'resource', fieldB: 'producedProfessions' },

    // 63. Occupation <-> Ability
    { typeA: 'occupation', fieldA: 'pairedConnectedSkills', typeB: 'ability', fieldB: 'pairedConnectedProfessions' },

    // 64. Occupation <-> Groups
    { typeA: 'occupation', fieldA: 'pairedConnectedPolGroups', typeB: 'political', fieldB: 'pairedConnectedProfessions' },
    { typeA: 'occupation', fieldA: 'pairedConnectedOtherGroups', typeB: 'organization', fieldB: 'pairedConnectedProfessions' },
    { typeA: 'occupation', fieldA: 'pairedConnectedReligiousGroups', typeB: 'religious', fieldB: 'pairedConnectedProfessions' },
    { typeA: 'occupation', fieldA: 'pairedConnectedMagicGroups', typeB: 'magic', fieldB: 'pairedConnectedProfessions' },
    { typeA: 'occupation', fieldA: 'pairedConnectedTechGroups', typeB: 'tech', fieldB: 'pairedConnectedProfessions' },

    // 65. Resource <-> Resource
    { typeA: 'resource', fieldA: 'relatedResources', typeB: 'resource', fieldB: 'relatedResources' },
    { typeA: 'resource', fieldA: 'madeIntoResources', typeB: 'resource', fieldB: 'madeFromResources' },
    { typeA: 'resource', fieldA: 'madeFromResources', typeB: 'resource', fieldB: 'madeIntoResources' },

    // 66. Resource <-> Ability
    { typeA: 'resource', fieldA: 'pairedResourcesRequire', typeB: 'ability', fieldB: 'pairedResourcesRequire' },
    { typeA: 'resource', fieldA: 'pairedResourcesCreate', typeB: 'ability', fieldB: 'pairedResourcesCreate' },

    // 67. Resource <-> Groups
    { typeA: 'resource', fieldA: 'pairedConnectedPoliticalGroups', typeB: 'political', fieldB: 'pairedConnectedResources' },
    { typeA: 'resource', fieldA: 'pairedConnectedOtherGroups', typeB: 'organization', fieldB: 'pairedConnectedResources' },
    { typeA: 'resource', fieldA: 'pairedConnectedReligiousGroups', typeB: 'religious', fieldB: 'pairedConnectedResources' },
    { typeA: 'resource', fieldA: 'pairedConnectedMagicGroups', typeB: 'magic', fieldB: 'pairedConnectedResources' },
    { typeA: 'resource', fieldA: 'pairedConnectedTechGroups', typeB: 'tech', fieldB: 'pairedConnectedResources' },

    // 68. Ability <-> Ability
    { typeA: 'ability', fieldA: 'pairedSkills', typeB: 'ability', fieldB: 'pairedSkills' },
    { typeA: 'ability', fieldA: 'prerequisiteSkills', typeB: 'ability', fieldB: 'postrequisiteSkills' },
    { typeA: 'ability', fieldA: 'postrequisiteSkills', typeB: 'ability', fieldB: 'prerequisiteSkills' },

    // 69. Ability <-> Groups
    { typeA: 'ability', fieldA: 'pairedPoliticalGroupsSkills', typeB: 'political', fieldB: 'pairedSkills' },
    { typeA: 'ability', fieldA: 'pairedOtherGroupsSkills', typeB: 'organization', fieldB: 'pairedSkills' },
    { typeA: 'ability', fieldA: 'pairedReligiousGroupsSkills', typeB: 'religious', fieldB: 'pairedSkills' },
    { typeA: 'ability', fieldA: 'pairedMagicGroupsSkills', typeB: 'magic', fieldB: 'pairedSkills' },
    { typeA: 'ability', fieldA: 'pairedTechGroupsSkills', typeB: 'tech', fieldB: 'pairedSkills' },

    // 70. Notes & Myths <-> Various
    { typeA: 'note', fieldA: 'pairedConnectedNote', typeB: 'note', fieldB: 'pairedConnectedNote' },
    { typeA: 'myth', fieldA: 'pairedOtherMyths', typeB: 'myth', fieldB: 'pairedOtherMyths' },
    { typeA: 'note', fieldA: 'pairedConnectedChapters', typeB: 'chapter', fieldB: 'pairedConnectedNotes' },
    { typeA: 'note', fieldA: 'pairedConnectedMyths', typeB: 'myth', fieldB: 'pairedConnectedNotes' },
    { typeA: 'note', fieldA: 'pairedConnectedCharacter', typeB: 'character', fieldB: 'pairedConnectedNotes' },
    { typeA: 'myth', fieldA: 'pairedConnectedCharacter', typeB: 'character', fieldB: 'pairedConnectedMyths' },
    { typeA: 'note', fieldA: 'pairedConnectedLocation', typeB: 'location', fieldB: 'pairedConnectedNotes' },
    { typeA: 'myth', fieldA: 'pairedConnectedLocations', typeB: 'location', fieldB: 'pairedConnectedMyths' },
    { typeA: 'note', fieldA: 'pairedConnectedEvents', typeB: 'event', fieldB: 'pairedConnectedNotes' },
    { typeA: 'myth', fieldA: 'pairedEvents', typeB: 'event', fieldB: 'pairedMyths' },
    { typeA: 'note', fieldA: 'pairedConnectedRaces', typeB: 'species', fieldB: 'pairedConnectedNotes' },
    { typeA: 'myth', fieldA: 'pairedConnectedRaces', typeB: 'species', fieldB: 'pairedConnectedMyths' },
    { typeA: 'note', fieldA: 'pairedConnectedCultures', typeB: 'culture', fieldB: 'pairedConnectedNotes' },
    { typeA: 'myth', fieldA: 'pairedCultures', typeB: 'culture', fieldB: 'pairedOtherMyths' },
    { typeA: 'note', fieldA: 'pairedConnectedConditions', typeB: 'condition', fieldB: 'pairedConnectedNotes' },
    { typeA: 'myth', fieldA: 'pairedConditions', typeB: 'condition', fieldB: 'pairedMyths' },
    { typeA: 'note', fieldA: 'pairedConnectedSkills', typeB: 'ability', fieldB: 'pairedConnectedNotes' },
    { typeA: 'myth', fieldA: 'pairedSkills', typeB: 'ability', fieldB: 'pairedMyths' },
    { typeA: 'note', fieldA: 'pairedConnectedItems', typeB: 'item', fieldB: 'pairedConnectedNotes' },
    { typeA: 'myth', fieldA: 'pairedItems', typeB: 'item', fieldB: 'pairedMyths' },
    { typeA: 'note', fieldA: 'pairedConnectedProfessions', typeB: 'occupation', fieldB: 'pairedConnectedNotes' },
    { typeA: 'myth', fieldA: 'pairedProfessions', typeB: 'occupation', fieldB: 'pairedMyths' },
    { typeA: 'note', fieldA: 'pairedConnectedResources', typeB: 'resource', fieldB: 'pairedConnectedNotes' },
    { typeA: 'myth', fieldA: 'pairedResources', typeB: 'resource', fieldB: 'pairedMyths' },

    // 71. Group Historical Succession Lineage
    { typeA: 'political', fieldA: 'succedingPolGroup', typeB: 'political', fieldB: 'preceedingPolGroup' },
    { typeA: 'political', fieldA: 'preceedingPolGroup', typeB: 'political', fieldB: 'succedingPolGroup' },
    { typeA: 'organization', fieldA: 'succedingOtherGroup', typeB: 'organization', fieldB: 'preceedingOtherGroup' },
    { typeA: 'organization', fieldA: 'preceedingOtherGroup', typeB: 'organization', fieldB: 'succedingOtherGroup' },
    { typeA: 'religious', fieldA: 'succedingRelGroup', typeB: 'religious', fieldB: 'preceedingRelGroup' },
    { typeA: 'religious', fieldA: 'preceedingRelGroup', typeB: 'religious', fieldB: 'succedingRelGroup' },
    { typeA: 'magic', fieldA: 'succedingMagicGroup', typeB: 'magic', fieldB: 'preceedingMagicGroup' },
    { typeA: 'magic', fieldA: 'preceedingMagicGroup', typeB: 'magic', fieldB: 'succedingMagicGroup' },
    { typeA: 'tech', fieldA: 'succedingTechGroup', typeB: 'tech', fieldB: 'preceedingTechGroup' },
    { typeA: 'tech', fieldA: 'preceedingTechGroup', typeB: 'tech', fieldB: 'succedingTechGroup' },
    { typeA: 'science', fieldA: 'succedingTechGroup', typeB: 'science', fieldB: 'preceedingTechGroup' },
    { typeA: 'science', fieldA: 'preceedingTechGroup', typeB: 'science', fieldB: 'succedingTechGroup' }
];

export interface DirectedRelationRule {
    sourceType: EntityType | '*';
    sourceField: string;
    sourceLegacyField?: string;
    targetType: EntityType | '*';
    targetField: string;
    targetLegacyField?: string;
}

// Build index mapping "sourceType:sourceField" -> DirectedRelationRule[]
const DIRECTED_RULES: Map<string, DirectedRelationRule[]> = new Map();

function addDirectedRule(rule: DirectedRelationRule) {
    const key = `${rule.sourceType}:${rule.sourceField}`;
    const list = DIRECTED_RULES.get(key) || [];
    list.push(rule);
    DIRECTED_RULES.set(key, list);

    if (rule.sourceLegacyField) {
        const legacyKey = `${rule.sourceType}:${rule.sourceLegacyField}`;
        const legacyList = DIRECTED_RULES.get(legacyKey) || [];
        legacyList.push({
            ...rule,
            sourceField: rule.sourceLegacyField
        });
        DIRECTED_RULES.set(legacyKey, legacyList);
    }
}

// Populate directed rules in both directions
RELATION_PAIRS.forEach(pair => {
    // Forward direction: A -> B
    addDirectedRule({
        sourceType: pair.typeA,
        sourceField: pair.fieldA,
        sourceLegacyField: pair.legacyFieldA,
        targetType: pair.typeB,
        targetField: pair.fieldB,
        targetLegacyField: pair.legacyFieldB
    });

    // Backward direction: B -> A
    // (Only add if distinct from A -> B to avoid redundant duplicate checks)
    if (pair.typeA !== pair.typeB || pair.fieldA !== pair.fieldB) {
        addDirectedRule({
            sourceType: pair.typeB,
            sourceField: pair.fieldB,
            sourceLegacyField: pair.legacyFieldB,
            targetType: pair.typeA,
            targetField: pair.fieldA,
            targetLegacyField: pair.legacyFieldA
        });
    }
});

/**
 * Normalizes an entity field to an array of ID strings.
 */
function getIdsFromField(entity: any, field: string): string[] {
    const val = entity[field];
    if (Array.isArray(val)) {
        return val.filter(id => typeof id === 'string' && id.trim().length > 0);
    }
    if (typeof val === 'string' && val.trim().length > 0) {
        return [val.trim()];
    }
    return [];
}

/**
 * Adds an ID to an entity's array field immutably if not present.
 */
function addIdToField(target: any, field: string, idToAdd: string): boolean {
    const current = getIdsFromField(target, field);
    if (!current.includes(idToAdd)) {
        target[field] = [...current, idToAdd];
        return true;
    }
    return false;
}

/**
 * Removes an ID from an entity's array field immutably if present.
 */
function removeIdFromField(target: any, field: string, idToRemove: string): boolean {
    const current = getIdsFromField(target, field);
    if (current.includes(idToRemove)) {
        target[field] = current.filter(id => id !== idToRemove);
        return true;
    }
    return false;
}

/**
 * Synchronizes bidirectional relationships between a saved entity and all referenced entities.
 * 
 * - When entity A adds entity B to a relation field, entity B's reverse field gets entity A added.
 * - When entity A removes entity B from a relation field, entity B's reverse field gets entity A removed.
 * - Also updates any active drafts in `drafts` so open tabs do not overwrite the sync.
 */
export function applyBidirectionalSync(
    savedEntity: WorldEntity,
    prevEntity: WorldEntity | undefined,
    allEntities: WorldEntity[],
    drafts?: Record<string, WorldEntity>
): { entities: WorldEntity[]; drafts?: Record<string, WorldEntity> } {
    const entityMap = new Map<string, any>();
    allEntities.forEach(e => entityMap.set(e.id, { ...e }));

    // Ensure savedEntity is in the map
    entityMap.set(savedEntity.id, { ...savedEntity });

    const newDrafts = drafts ? { ...drafts } : undefined;
    const modifiedTargetIds = new Set<string>();

    // Scan all properties on savedEntity
    const candidateFields = new Set([
        ...Object.keys(savedEntity),
        ...(prevEntity ? Object.keys(prevEntity) : [])
    ]);

    candidateFields.forEach(field => {
        const key = `${savedEntity.type}:${field}`;
        const wildcardKey = `*:${field}`;
        const rules = [...(DIRECTED_RULES.get(key) || []), ...(DIRECTED_RULES.get(wildcardKey) || [])];

        if (rules.length === 0) return;

        const oldIds = prevEntity ? getIdsFromField(prevEntity, field) : [];
        const newIds = getIdsFromField(savedEntity, field);

        const addedIds = newIds.filter(id => !oldIds.includes(id));
        const removedIds = oldIds.filter(id => !newIds.includes(id));

        rules.forEach(rule => {
            // Apply ADDED relationships to target entities
            addedIds.forEach(targetId => {
                if (targetId === savedEntity.id) return; // Prevent self-referential cycles
                const target = entityMap.get(targetId);
                if (!target) return;
                if (rule.targetType !== '*' && target.type !== rule.targetType) return;

                let changed = addIdToField(target, rule.targetField, savedEntity.id);
                if (rule.targetLegacyField) {
                    changed = addIdToField(target, rule.targetLegacyField, savedEntity.id) || changed;
                }

                if (changed) {
                    target.lastModified = Date.now();
                    modifiedTargetIds.add(targetId);

                    // Sync into open draft if present
                    if (newDrafts && newDrafts[targetId]) {
                        newDrafts[targetId] = { ...target };
                    }
                }
            });

            // Apply REMOVED relationships to target entities
            removedIds.forEach(targetId => {
                if (targetId === savedEntity.id) return;
                const target = entityMap.get(targetId);
                if (!target) return;
                if (rule.targetType !== '*' && target.type !== rule.targetType) return;

                let changed = removeIdFromField(target, rule.targetField, savedEntity.id);
                if (rule.targetLegacyField) {
                    changed = removeIdFromField(target, rule.targetLegacyField, savedEntity.id) || changed;
                }

                if (changed) {
                    target.lastModified = Date.now();
                    modifiedTargetIds.add(targetId);

                    // Sync into open draft if present
                    if (newDrafts && newDrafts[targetId]) {
                        newDrafts[targetId] = { ...target };
                    }
                }
            });
        });
    });

    const updatedEntities = Array.from(entityMap.values());
    return {
        entities: updatedEntities,
        drafts: newDrafts
    };
}

/**
 * Cleans up references to a deleted entity from all relation arrays across all surviving entities.
 */
export function removeEntityRelationsOnDelete(
    deletedId: string,
    allEntities: WorldEntity[],
    drafts?: Record<string, WorldEntity>
): { entities: WorldEntity[]; drafts?: Record<string, WorldEntity> } {
    const newDrafts = drafts ? { ...drafts } : undefined;

    const updatedEntities = allEntities.map(entity => {
        let changed = false;
        const e = { ...entity } as any;

        // Check all fields on entity
        Object.keys(e).forEach(k => {
            if (Array.isArray(e[k]) && e[k].includes(deletedId)) {
                e[k] = e[k].filter((id: any) => id !== deletedId);
                changed = true;
            }
        });

        if (changed) {
            e.lastModified = Date.now();
            if (newDrafts && newDrafts[e.id]) {
                newDrafts[e.id] = { ...e };
            }
        }
        return e as WorldEntity;
    });

    return {
        entities: updatedEntities,
        drafts: newDrafts
    };
}

/**
 * Scans all entities in a world and enforces two-way links for any existing one-way relations.
 * Safe to run on realm load or migration to heal legacy data.
 */
export function reconcileAllBidirectionalRelations(entities: WorldEntity[]): WorldEntity[] {
    const entityMap = new Map<string, any>();
    entities.forEach(e => entityMap.set(e.id, { ...e }));

    let hasAnyChanges = false;

    entities.forEach(source => {
        Object.keys(source).forEach(field => {
            const key = `${source.type}:${field}`;
            const wildcardKey = `*:${field}`;
            const rules = [...(DIRECTED_RULES.get(key) || []), ...(DIRECTED_RULES.get(wildcardKey) || [])];
            if (rules.length === 0) return;

            const targetIds = getIdsFromField(source, field);
            targetIds.forEach(targetId => {
                if (targetId === source.id) return;
                const target = entityMap.get(targetId);
                if (!target) return;

                rules.forEach(rule => {
                    if (rule.targetType !== '*' && target.type !== rule.targetType) return;
                    let changed = addIdToField(target, rule.targetField, source.id);
                    if (rule.targetLegacyField) {
                        changed = addIdToField(target, rule.targetLegacyField, source.id) || changed;
                    }
                    if (changed) {
                        hasAnyChanges = true;
                    }
                });
            });
        });
    });

    return hasAnyChanges ? Array.from(entityMap.values()) : entities;
}
