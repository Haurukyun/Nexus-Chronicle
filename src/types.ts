import React from 'react';

export type EntityType =
  | 'chapter' | 'note' | 'myth'
  | 'character' | 'location' | 'event' | 'species' | 'language' | 'culture'
  | 'political' | 'religious' | 'organization' | 'magic' | 'science'
  | 'ability' | 'item' | 'occupation' | 'condition' | 'resource';

export type WorldPhase = 'creation' | 'golden' | 'shadow' | 'eclipse' | 'ruin';

export interface MapConnection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'trade' | 'magic' | 'diplomatic' | 'war';
  label?: string;
}

export interface GroupRoleLinks {
  leadingFigureOf: string[];
  connectedTo: string[];
  memberOf: string[];
  allyOf: string[];
  enemyOf: string[];
}

export interface BaseEntity {
  id: string;
  name: string;
  type: EntityType;
  tags: string[];
  description: string;
  lastModified: number;
  
  // Universal document settings from blueprints
  parentId?: string | null; // ID of the parent entity (for hierarchical tree)
  parentDoc?: string[]; // Belongs under (legacy array format)
  documentColor?: string; // Text color
  documentBackgroundColor?: string; // Background color
  finishedSwitch?: boolean; // Is finished
  minorSwitch?: boolean; // Is a minor document
  deadSwitch?: boolean; // Is Dead/Gone/Destroyed
  categorySwitch?: boolean; // Is a category
  order?: string; // Order number
  docTemplate?: string[]; // Document Template
  extraClasses?: string; // Extra HTML classes
  otherNames?: string[]; // Other Names & Epithets
  categoryDescription?: string; // Category description

  // These were from the previous manual BaseEntity
  isReadOnly?: boolean;
  privateNotes?: string;
  coordinates?: { x: number; y: number };
}

// --- GENERATED SPECIFIC INTERFACES ---

export interface Chapter extends BaseEntity {
  type: 'chapter';
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  content?: string; // Chapter content
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Character extends BaseEntity {
  type: 'character';
  pairedCurrentLocation?: string; // Place of residence (legacy)
  pairedOriginLocation?: string; // Place of origin (legacy)
  pairedDemiseLocation?: string; // Place of demise (legacy)
  pairedMagic?: string[]; // Known Magic/Spells (legacy)
  pairedTech?: string[]; // Known Technologies/Sciences (legacy)
  skills?: string; // Skills (legacy)
  titles?: string; // Titles
  sex?: string; // Sex
  age?: string; // Age
  height?: string; // Height
  weight?: string; // Weight
  birthDate?: string; // Date of birth
  deathDate?: string; // Date of death
  pairedRace?: string[]; // Species/Races
  pairedProfession?: string[]; // Occupation/Class
  ethnicity?: string; // Ethnicity
  powerLevel?: string; // Combat rating
  pairedCurrentLocationNew?: string[]; // Place of residence
  pairedOriginLocationNew?: string[]; // Place of origin
  pairedDemiseLocationNew?: string[]; // Place of demise
  pairedConditionsPositive?: string[]; // Affected by Boons
  pairedConditionsNegative?: string[]; // Affected by Afflictions
  pairedConditionsOther?: string[]; // Affected by Other conditions
  description?: string; // Description & History
  personalityTraits?: string; // Traits & Characteristics
  traits?: string; // Unique/Unusual Features
  statsList?: string; // Stats/Attributes (legacy string)
  stats?: { strength: string; dexterity: string; constitution: string; intelligence: string; wisdom: string; charisma: string; }; // Custom stat block
  possessedItems?: string; // Equipment/Owned Items
  possessedCurrencies?: string; // Wealth/Owned Currencies
  knownSkills?: string; // Known Skills/Abilities
  knownSpells?: string; // Known Spells
  knownLanguage?: string; // Known Languages
  knownMagic?: string; // Known Magical teachings
  knownTech?: string; // Known Technologies/Sciences
  parentsOfCharacter?: string[]; // Parents of the Character
  childOfCharacter?: string[]; // Children of the Character
  relativesOfCharacter?: string[]; // Other relatives of the Character
  allyResCharacter?: string[]; // Friends/Allies
  enemydResCharacter?: string[]; // Enemies
  complicatedResCharacter?: string[]; // Complicated relationship with
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedConnectedMyths?: string[]; // Connected to Myths, legends and stories
  pairedEvent?: string[]; // Took part in Events
  pairedConnectedPlaces?: string[]; // Connected to Locations
  pairedLanguage?: string[]; // Connected to Languages
  relatedCultures?: string[]; // Connected Cultures/Art
  leadingPoliticalLeaders?: string[]; // Leading Figure of Ideologies/Political groups
  pairedConnectionPolGroup?: string[]; // Connected to Ideologies/Political groups
  pairedBelongingPolGroup?: string[]; // Member of Ideologies/Political groups
  pairedAllyPolGroup?: string[]; // Ally of Ideologies/Political groups
  pairedEnemyPolGroup?: string[]; // Enemy of Ideologies/Political groups
  leadingOtherLeaders?: string[]; // Leading Figure of Organizations/Other groups
  pairedConnectionOtherGroups?: string[]; // Connected to Organizations/Other groups
  pairedBelongingOtherGroups?: string[]; // Member of Organizations/Other groups
  pairedAllyOtherGroups?: string[]; // Ally of Organizations/Other groups
  pairedEnemyOtherGroups?: string[]; // Enemy of Organizations/Other groups
  leadingReligiousLeaders?: string[]; // Leading Figure of Teachings/Religious groups
  pairedConnectionRelGroup?: string[]; // Connected to Teachings/Religious groups
  pairedBelongingRelGroup?: string[]; // Member of Teachings/Religious groups
  pairedAllyRelGroup?: string[]; // Ally of Teachings/Religious groups
  pairedEnemyRelGroup?: string[]; // Enemy of Teachings/Religious groups
  leadingMagicalLeaders?: string[]; // Leading Figure of Schools of Magic/Magical groups
  pairedConnectionMagicGroup?: string[]; // Connected to Schools of Magic/Magical groups
  pairedBelongingMagicGroup?: string[]; // Member of Schools of Magic/Magical groups
  pairedAllyMagicGroup?: string[]; // Ally of Schools of Magic/Magical groups
  pairedEnemyMagicGroup?: string[]; // Enemy of Schools of Magic/Magical groups
  leadingTechLeaders?: string[]; // Leading Figure of Sciences/Technological groups
  pairedConnectionTechGroup?: string[]; // Connected to Sciences/Technological groups
  pairedBelongingTechGroup?: string[]; // Member of Sciences/Technological groups
  pairedAllyTechGroup?: string[]; // Ally of Sciences/Technological groups
  pairedEnemyTechGroup?: string[]; // Enemy of Sciences/Technological groups
  pairedSkills?: string[]; // Connected to Skills/Spells/Other
  pairedConnectedItems?: string[]; // Connected to Items
  pairedConditionsConnected?: string[]; // Connected to Afflictions/Boons/Conditions
  pairedResources?: string[]; // Connected to Resources/Materials
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Condition extends BaseEntity {
  type: 'condition';
  features?: string; // Prominent features
  duration?: string; // Duration
  conditionType?: string; // Affliction/Boon/Condition type
  meansOfAttaining?: string; // Ways of attaining
  meansOfRemoving?: string; // Ways of removing
  pairedConnectedConditionsPositive?: string[]; // Related Boons
  pairedConnectedConditionsNegative?: string[]; // Related Afflictions
  pairedConnectedConditionsOther?: string[]; // Related Other conditions
  statsListRequired?: string; // Stats/Attributes modifiers
  description?: string; // Description & History
  traditions?: string; // Traditions & customs connected to the item
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedMyths?: string[]; // Connected to Myths/Legends/Stories
  pairedCharactersPositive?: string[]; // Affecting Characters positively
  pairedCharactersNegative?: string[]; // Affecting Characters negatively
  pairedCharactersOther?: string[]; // Affecting Characters in other ways
  pairedCharactersConnected?: string[]; // Connected to Characters
  pairedLocationsPositive?: string[]; // Affecting Locations/Geography positively
  pairedLocationsNegative?: string[]; // Affecting Locations/Geography negatively
  pairedLocationsOther?: string[]; // Affecting Locations/Geography in other ways
  pairedEventsPositive?: string[]; // Affecting Events positively
  pairedEventsNegative?: string[]; // Affecting Events negatively
  pairedEventsOther?: string[]; // Affecting Events in other ways
  pairedRacesPositive?: string[]; // Affecting Species/Races/Flora/Fauna positively
  pairedRacesNegative?: string[]; // Affecting Species/Races/Flora/Fauna negatively
  pairedRacesOther?: string[]; // Affecting Species/Races/Flora/Fauna in other ways
  pairedRacesPoliticalGroups?: string[]; // Connected to Ideologies/Political groups
  pairedReligiousGroups?: string[]; // Connected to Teachings/Religious groups
  pairedOtherGroups?: string[]; // Connected to Organizations/Other groups
  pairedMagicGroups?: string[]; // Connected to Schools of Magic/Magical groups
  pairedTechGroups?: string[]; // Connected to Sciences/Technological groups
  pairedSkillsPositive?: string[]; // Caused by positive Skills/Spells/Other
  pairedSkillsNegative?: string[]; // Caused by negative Skills/Spells/Other
  pairedSkillsOther?: string[]; // Caused by neutral/other Skills/Spells/Other
  pairedItemsPositive?: string[]; // Boon caused by Items
  pairedItemsNegative?: string[]; // Affliction caused by Items
  pairedItemsOther?: string[]; // Other Condition caused by Items
  pairedItemsAfflicting?: string[]; // Affecting the following Items
  pairedResourcesPositive?: string[]; // Caused by positive Resources/Materials
  pairedResourcesNegative?: string[]; // Caused by negative Resources/Materials
  pairedResourcesOther?: string[]; // Caused by neutral/other Resources/Materials
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Culture extends BaseEntity {
  type: 'culture';
  succedingCultures?: string[]; // Succeeding Cultures/Art
  preceedingCultures?: string[]; // Preceding Cultures/Art
  creationTime?: string; // Date of creation
  endTIme?: string; // Date of end
  traits?: string; // Unique/Defining Features
  population?: string; // Estimated population
  typeCulture?: string; // Type
  relatedCharacters?: string[]; // Connected Characters
  relatedRaces?: string[]; // Common among Species/Races/Flora/Fauna
  relatedLocations?: string[]; // Common in Locations
  pairedEvents?: string[]; // Connected to Events
  pairedSkills?: string[]; // Related Skills/Spells/Other
  pairedItems?: string[]; // Important Items
  relatedProfessions?: string[]; // Common Occupations/Classes
  relatedResouces?: string[]; // Important Resources/Materials
  description?: string; // Description & History
  traditions?: string; // Connected Traditions & Customs to the Culture/Art
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedOtherMyths?: string[]; // Connected to Myths, legends and stories
  pairedConnectedPolGroups?: string[]; // Connected to Ideologies/Political groups
  pairedConnectedReligiousGroups?: string[]; // Connected to Teachings/Religious groups
  pairedConnectedOtherGroups?: string[]; // Connected to Organizations/Other groups
  pairedConnectedMagicGroups?: string[]; // Connected to Schools of Magic/Magical groups
  pairedConnectedTechGroups?: string[]; // Connected to Sciences/Technological groups
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Currency extends BaseEntity {
  type: 'currency';
  pairedItems?: string[]; // Connected to Items
  traits?: string; // Defining Features/Traits
  priceCurrencies?: string; // Exchange rates to other Currencies
  madeFromResources?: string; // Made from Resources/Materials
  pairedLocations?: string[]; // Used in Locations
  usedByRaces?: string[]; // Used by Races
  usedInPoliticalGroups?: string[]; // Used by Ideologies/Political groups
  usedInOtherGroups?: string[]; // Used by Organizations/Other groups
  description?: string; // Description & History
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Event extends BaseEntity {
  type: 'event';
  eventType?: string; // Event type
  startDate?: string; // Start date
  endDate?: string; // End date
  participants?: string; // Amount of participants
  pairedCharacter?: string[]; // Prominent Actors
  pairedLocations?: string[]; // Connected to Locations
  pairedEvents?: string[]; // Connected to other Events
  pairedItems?: string[]; // Connected to Items
  pairedRaces?: string[]; // Affected or involved Species/Races/Flora/Fauna
  relatedCultures?: string[]; // Connected to Cultures/Art
  description?: string; // Description & History
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedMyths?: string[]; // Connected to Myths, legends and stories
  connectedPolitical?: string[]; // Involved Ideologies/Political groups
  connectedOtherGroups?: string[]; // Involved Organizations/Other groups
  connectedReligious?: string[]; // Involved Teachings/Religious groups
  connectedMagical?: string[]; // Involved Schools of Magic/Magical groups
  connectedTech?: string[]; // Involved Sciences/Technological groups
  pairedSkills?: string[]; // Skills/Other connected to the Event
  pairedSpells?: string[]; // Spells connected to the Event
  pairedConditionsPositive?: string[]; // Connected to Boons
  pairedConditionsNegative?: string[]; // Connected to Afflictions
  pairedConditionsOther?: string[]; // Connected to Other conditions
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Organization extends BaseEntity {
  type: 'organization';
  leaders?: string; // Leading Figures (legacy)
  succedingOtherGroup?: string[]; // Succeeding Organizations/Other groups
  preceedingOtherGroup?: string[]; // Preceding Organizations/Other groups
  creationTime?: string; // Date of creation
  endTIme?: string; // Date of end
  headquarters?: string[]; // Headquarters
  followerName?: string; // Name for members/followers
  population?: string; // Member count
  followers?: string; // Follower/Subject count
  leadingCharacters?: string[]; // Leading Figures
  groupType?: string; // Type of group
  localLanguages?: string[]; // Used Languages
  connectedRaces?: string[]; // Common Species/Races/Flora/Fauna
  localCurrencies?: string[]; // Used Currencies
  pairedConnectedResources?: string[]; // Important Resources/Materials
  description?: string; // Description & History
  traditions?: string; // Traditions & Customs
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedConnectedMyths?: string[]; // Connected to Myths, legends and stories
  governLocations?: string[]; // Ruled/Influenced Locations
  connectedLocations?: string[]; // Connected Locations
  connectedEvents?: string[]; // Connected Events
  pairedConnectedCultures?: string[]; // Connected to Cultures/Art
  pairedConnectionCharacter?: string[]; // Connected Characters
  pairedBelongingCharacter?: string[]; // Prominent Members
  pairedAllyCharacter?: string[]; // Prominent Allies
  pairedEnemyCharacter?: string[]; // Prominent Enemies
  pairedConnectedPolGroups?: string[]; // Connected Ideologies/Political groups
  pairedAllyPolGroups?: string[]; // Allied Ideologies/Political groups
  pairedEnemyPolGroups?: string[]; // Enemy Ideologies/Political groups
  pairedConnectedOtherGroups?: string[]; // Connected Organizations/Other groups
  pairedAllyOtherGroups?: string[]; // Allied Organizations/Other groups
  pairedEnemyOtherGroups?: string[]; // Enemy Organizations/Other groups
  pairedConnectedReligiousGroups?: string[]; // Connected Teachings/Religious groups
  pairedAllyReligiousGroups?: string[]; // Allied Teachings/Religious groups
  pairedEnemyReligiousGroups?: string[]; // Enemy Teachings/Religious groups
  pairedConnectedMagicalGroups?: string[]; // Connected Schools of Magic/Magical groups
  pairedAllyMagicalGroups?: string[]; // Allied Schools of Magic/Magical groups
  pairedEnemyMagicalGroups?: string[]; // Enemy Schools of Magic/Magical groups
  pairedConnectedTechGroups?: string[]; // Connected Sciences/Technological groups
  pairedAllyTechGroups?: string[]; // Allied Sciences/Technological groups
  pairedEnemyTechGroups?: string[]; // Enemy Sciences/Technological groups
  pairedSkills?: string[]; // Connected to Skills/Spells/Other
  pairedConnectedItems?: string[]; // Connected to Items
  pairedConnectedProfessions?: string[]; // Connected to Occupations/Classes
  pairedConditions?: string[]; // Connected to Afflictions/Boons/Conditions
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Item extends BaseEntity {
  type: 'item';
  pairedMagic?: string[]; // Capable of utilizing Spells/Magic
  pairedCurrencies?: string[]; // Connected to Currencies
  features?: string; // Prominent features
  pairedItems?: string[]; // Related to other Items
  relatedCultures?: string[]; // Connected to Cultures/Art
  pairedEvents?: string[]; // Involved in Events
  pairedMyths?: string[]; // Involved in Myths, legends and stories
  priceInCurrencies?: string; // Cost in different Currencies
  pairedResourcesMade?: string[]; // Resources/Materials the Item is made of
  pairedResourcesProduced?: string[]; // Resources/Materials the Item produces
  description?: string; // Description & History
  traditions?: string; // Traditions & customs connected to the item
  statsListRequired?: string; // Stats/Attributes required
  statsList?: string; // Stats/Attributes provided
  pairedSkillsUsing?: string[]; // Allows for usage of Skills/Spells/Other
  pairedSkillsCommon?: string[]; // Commonly used with Skills/Spells/Other
  pairedSkillsCreate?: string[]; // Created by Skills/Spells/Other
  pairedSkillsRequire?: string[]; // Skills/Spells/Other requiring this Item
  pairedConditionsPositive?: string[]; // Causing Boons
  pairedConditionsNegative?: string[]; // Causing Afflictions
  pairedConditionsOther?: string[]; // Causing Other conditions
  pairedConditionsAfflicting?: string[]; // Affected by Afflictions/Boons/Conditions
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedConnectedCharacter?: string[]; // Connected to Characters
  pairedConnectedLocations?: string[]; // Connected to Locations
  pairedConnectedRaces?: string[]; // Connected to Species/Races/Flora/Fauna
  pairedConnectedProfessions?: string[]; // Connected to by Occupations/Classes
  pairedConnectedPolGroups?: string[]; // Connected to Ideologies/Political groups
  pairedConnectedOtherGroups?: string[]; // Connected to Organizations/Other groups
  pairedConnectedRelGroups?: string[]; // Connected to Teachings/Religious groups
  pairedConnectedMagicGroups?: string[]; // Connected to Schools of Magic/Magical groups
  pairedConnectedTechGroups?: string[]; // Connected to Sciences/Technological groups
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Language extends BaseEntity {
  type: 'language';
  languageFamily?: string[]; // Language family
  speakerCount?: string; // Estimated speaker count
  predecessorLanguages?: string[]; // Predecessor Languages
  followingLanguages?: string[]; // Evolved into Languages
  description?: string; // History & Contemporary situation
  traditions?: string; // Traditions & Customs connected to the language
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedConnectedProfessions?: string[]; // Spoken by Occupations/Classes
  pairedCharacter?: string[]; // Connected to Characters
  pairedLocations?: string[]; // Connected to Locations
  usedByRaces?: string[]; // Connected to Species/Races/Flora/Fauna
  usedInPoliticalGroups?: string[]; // Spoken in Ideologies/Political groups
  usedInOtherGroups?: string[]; // Used by Organizations/Other groups
  usedInReligiousGroups?: string[]; // Spoken in Teachings/Religious groups
  usedInMagicalGroups?: string[]; // Spoken in Magical groups
  usedInTechGroups?: string[]; // Spoken in Science/Technology groups
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Location extends BaseEntity {
  type: 'location';
  pairedOriginCharacters?: string; // Characters originated from the location (legacy)
  pairedCurrentCharacters?: string; // Characters currently living in the location (legacy)
  pairedDemiseCharacters?: string; // Characters deceased at the location (legacy)
  succedingLocations?: string[]; // Succeeding Locations/Geography
  preceedingLocations?: string[]; // Preceding Locations/Geography
  creationTime?: string; // Date of creation
  endTIme?: string; // Date of end
  traits?: string; // Unusual features/Traits
  locationType?: string; // Location type
  population?: string; // Population
  size?: string; // Size
  pairedLanguages?: string[]; // Local Languages
  pairedCurrencies?: string[]; // Local Currencies
  relatedCultures?: string[]; // Local Cultures/Art
  connectedProfessions?: string[]; // Common Occupations/Classes
  connectedResources?: string[]; // Local Resources/Materials
  neighbourLocations?: string[]; // Neighbouring Locations
  connectedLocations?: string[]; // Other connected Locations
  description?: string; // Description & History
  traditions?: string; // Traditions & Customs
  pairedOriginCharactersNew?: string[]; // Characters originated from the location
  pairedCurrentCharactersNew?: string[]; // Characters currently living in the location
  pairedDemiseCharactersNew?: string[]; // Characters deceased at the location
  pairedConnectedCharacter?: string[]; // Other connected Characters
  pairedConnectedRaces?: string[]; // Local Species/Races/Flora/Fauna
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedConnectedMyths?: string[]; // Connected to Myths, legends and stories
  pairedEvent?: string[]; // Connected to Events
  pairedSkills?: string[]; // Connected to Skills/Spells/Other
  pairedConnectedItems?: string[]; // Connected to Items
  pairedConditionsPositive?: string[]; // Affected by Boons
  pairedConditionsNegative?: string[]; // Affected by Afflictions
  pairedConditionsOther?: string[]; // Affected by Other conditions
  governPolitical?: string[]; // Governing Ideologies/Political groups
  connectedPolitical?: string[]; // Connected Ideologies/Political groups
  governOther?: string[]; // Governing Organizations/Other groups
  connectedOther?: string[]; // Connected Organizations/Other groups
  governReligious?: string[]; // Governing Teachings/Religious groups
  connectedReligious?: string[]; // Connected Teachings/Religious groups
  governMagical?: string[]; // Governing Schools of Magic/Magical groups
  connectedMagical?: string[]; // Connected Schools of Magic/Magical groups
  governTech?: string[]; // Governing Sciences/Technological groups
  connectedTech?: string[]; // Connected Sciences/Technological groups
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Note extends BaseEntity {
  type: 'note';
  notes?: string; // Note list
  textNote?: string; // Free-form notes
  pairedConnectedChapters?: string[]; // Connected to Chapters
  pairedConnectedNote?: string[]; // Connected to Lore notes/Other notes
  pairedConnectedMyths?: string[]; // Connected to Myths/Legends/Stories
  pairedConnectedCharacter?: string[]; // Connected to Characters
  pairedConnectedLocation?: string[]; // Connected to Locations/Geography
  pairedConnectedEvents?: string[]; // Connected to Events
  pairedConnectedRaces?: string[]; // Connected to Species/Races/Flora/Fauna
  localLanguages?: string[]; // Connected to Languages
  pairedConnectedCultures?: string[]; // Connected to Culture/Art
  pairedConnectedPolGroups?: string[]; // Connected to Ideologies/Political groups
  pairedConnectedOtherGroups?: string[]; // Connected to Organizations/Other groups
  pairedConnectedRelGroups?: string[]; // Connected to Teachings/Religious groups
  pairedConnectedMagicGroups?: string[]; // Connected to Schools of Magic/Magical groups
  pairedConnectedTechGroups?: string[]; // Connected to Sciences/Technological groups
  pairedConnectedSkills?: string[]; // Connected to Skills/Spells/Other
  pairedConnectedItems?: string[]; // Connected to Items
  pairedConnectedProfessions?: string[]; // Connected to Occupations/Classes
  pairedConnectedConditions?: string[]; // Connected to Afflictions/Boons/Conditions
  pairedConnectedResources?: string[]; // Connected to Resources/Materials
  localCurrencies?: string[]; // Connected to Currencies
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Magic extends BaseEntity {
  type: 'magic';
  leaders?: string; // Leading Figures
  pairedCharacter?: string[]; // Magic/Spell Users
  pairedItems?: string[]; // Important items
  succedingMagicGroup?: string[]; // Succeeding Schools of Magic/Magical groups
  preceedingMagicGroup?: string[]; // Preceding Schools of Magic/Magical groups
  creationTime?: string; // Date of creation
  endTIme?: string; // Date of end
  headquarters?: string[]; // Headquarters
  followerName?: string; // Name for members/followers
  users?: string; // Member/User count
  followers?: string; // Follower/Subject count
  leadingCharacters?: string[]; // Leading Figures
  typeMagic?: string; // Type
  formMagic?: string; // General schools of magic
  pairedSpells?: string[]; // Related Schools of Magic
  pairedSkills?: string[]; // Connected to Skills/Spells/Other
  pairedConditions?: string[]; // Connected to Afflictions/Boons/Conditions
  pairedConnectedResources?: string[]; // Important Resources/Materials
  connectedRaces?: string[]; // Common Species/Races/Flora/Fauna
  localLanguages?: string[]; // Common Languages
  description?: string; // Description & History
  traditions?: string; // Traditions & Customs
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedConnectedMyths?: string[]; // Connected to Myths, legends and stories
  governLocations?: string[]; // Ruled/Influenced Locations
  connectedLocations?: string[]; // Connected Locations
  connectedEvents?: string[]; // Connected Events
  pairedConnectedCultures?: string[]; // Connected to Cultures/Art
  pairedConnectionCharacter?: string[]; // Connected Characters
  pairedBelongingCharacter?: string[]; // Prominent Members
  pairedAllyCharacter?: string[]; // Prominent Allies
  pairedEnemyCharacter?: string[]; // Prominent Enemies
  pairedConnectedPolGroups?: string[]; // Connected Political groups
  pairedAllyPolGroups?: string[]; // Allied Political groups
  pairedEnemyPolGroups?: string[]; // Enemy Political groups
  pairedConnectedOtherGroups?: string[]; // Connected Organizations/Other groups
  pairedAllyOtherGroups?: string[]; // Allied Organizations/Other groups
  pairedEnemyOtherGroups?: string[]; // Enemy Organizations/Other groups
  pairedConnectedReligiousGroups?: string[]; // Connected Teachings/Religious groups
  pairedAllyReligiousGroups?: string[]; // Allied Teachings/Religious groups
  pairedEnemyReligiousGroups?: string[]; // Enemy Teachings/Religious groups
  pairedConnectedMagicalGroups?: string[]; // Connected Schools of Magic/Magical groups
  pairedAllyMagicalGroups?: string[]; // Allied Schools of Magic/Magical groups
  pairedEnemyMagicalGroups?: string[]; // Enemy Schools of Magic/Magical groups
  pairedConnectedTechGroups?: string[]; // Connected Sciences/Technological groups
  pairedAllyTechGroups?: string[]; // Allied Sciences/Technological groups
  pairedEnemyTechGroups?: string[]; // Enemy Sciences/Technological groups
  pairedConnectedItems?: string[]; // Connected to Items
  pairedConnectedProfessions?: string[]; // Connected to Occupations/Classes
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Myth extends BaseEntity {
  type: 'myth';
  description?: string; // Description & History
  traditions?: string; // Connected Traditions & Customs to the myth, legend or story
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedOtherMyths?: string[]; // Connected to other Myths, legends and stories
  pairedConnectedCharacter?: string[]; // Connected Characters
  pairedConnectedLocations?: string[]; // Connected Locations
  pairedEvents?: string[]; // Connected to Events
  pairedConnectedRaces?: string[]; // Connected to Species/Races/Flora/Fauna
  pairedCultures?: string[]; // Connected to Cultures/Art
  pairedConnectedPolGroups?: string[]; // Connected to Ideologies/Political groups
  pairedConnectedOtherGroups?: string[]; // Connected to Organizations/Other groups
  pairedConnectedRelGroups?: string[]; // Connected to Teachings/Religious groups
  pairedConnectedMagicGroups?: string[]; // Connected to Schools of Magic/Magical groups
  pairedConnectedTechGroups?: string[]; // Connected to Technologies/Sciences
  pairedSkills?: string[]; // Connected to Skills/Spells/Other
  pairedItems?: string[]; // Connected to Items
  pairedProfessions?: string[]; // Connected to Occupations/Classes
  pairedConditions?: string[]; // Connected to Afflictions/Boons/Conditions
  pairedResources?: string[]; // Connected to Resources/Materials
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface PoliticalGroup extends BaseEntity {
  type: 'political';
  leaders?: string; // Leading Figures (legacy)
  succedingPolGroup?: string[]; // Succeeding Ideologies/Political groups
  preceedingPolGroup?: string[]; // Preceding Ideologies/Political groups
  creationTime?: string; // Date of creation
  endTIme?: string; // Date of end
  headquarters?: string[]; // Headquarters
  followerName?: string; // Name for members/followers
  population?: string; // Member count
  followers?: string; // Follower/Subject count
  leadingCharacters?: string[]; // Leading Figures
  formGovernment?: string; // Form of government
  realedTeachings?: string[]; // Related Ideologies
  localLanguages?: string[]; // Used Languages
  connectedRaces?: string[]; // Common Species/Races/Flora/Fauna
  localCurrencies?: string[]; // Used Currencies
  pairedConnectedResources?: string[]; // Important Resources/Materials
  description?: string; // Description & History
  traditions?: string; // Traditions & Customs
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedConnectedMyths?: string[]; // Connected to Myths, legends and stories
  governLocations?: string[]; // Ruled/Influenced Locations
  connectedLocations?: string[]; // Connected Locations
  connectedEvents?: string[]; // Connected Events
  pairedConnectedCultures?: string[]; // Connected to Cultures/Art
  pairedConnectionCharacter?: string[]; // Connected Characters
  pairedBelongingCharacter?: string[]; // Prominent Members
  pairedAllyCharacter?: string[]; // Prominent Allies
  pairedEnemyCharacter?: string[]; // Prominent Enemies
  pairedConnectedPolGroups?: string[]; // Connected Ideologies/Political groups
  pairedAllyPolGroups?: string[]; // Allied Ideologies/Political groups
  pairedEnemyPolGroups?: string[]; // Enemy Ideologies/Political groups
  pairedConnectedOtherGroups?: string[]; // Connected Organizations/Other groups
  pairedAllyOtherGroups?: string[]; // Allied Organizations/Other groups
  pairedEnemyOtherGroups?: string[]; // Enemy Organizations/Other groups
  pairedConnectedReligiousGroups?: string[]; // Connected Teachings/Religious groups
  pairedAllyReligiousGroups?: string[]; // Allied Teachings/Religious groups
  pairedEnemyReligiousGroups?: string[]; // Enemy Teachings/Religious groups
  pairedConnectedMagicalGroups?: string[]; // Connected Schools of Magic/Magical groups
  pairedAllyMagicalGroups?: string[]; // Allied Schools of Magic/Magical groups
  pairedEnemyMagicalGroups?: string[]; // Enemy Schools of Magic/Magical groups
  pairedConnectedTechGroups?: string[]; // Connected Sciences/Technological groups
  pairedAllyTechGroups?: string[]; // Allied Sciences/Technological groups
  pairedEnemyTechGroups?: string[]; // Enemy Sciences/Technological groups
  pairedSkills?: string[]; // Connected to Skills/Spells/Other
  pairedConnectedItems?: string[]; // Connected to Items
  pairedConnectedProfessions?: string[]; // Connected to Occupations/Classes
  pairedConditions?: string[]; // Connected to Afflictions/Boons/Conditions
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Occupation extends BaseEntity {
  type: 'occupation';
  titles?: string; // Titles & Ranks
  features?: string; // Prominent features
  professionType?: string; // Occupation/Class type
  relatedProfessions?: string[]; // Related Occupations/Classes
  pairedCharacter?: string[]; // Characters of the Occupation/Class
  relatedCultures?: string[]; // Connected to Cultures/Art
  pairedUsedSkills?: string; // Commonly used Skills/Spells/Other
  pairedUsedItems?: string; // Commonly used Items
  commonRaces?: string[]; // Common Species/Races/Flora/Fauna
  usedResources?: string[]; // Used Resources/Materials
  producedResources?: string[]; // Produced Resources/Materials
  statsList?: string; // Stats/Attributes
  description?: string; // Description & History
  traditions?: string; // Traditions & customs connected to the item
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedMyths?: string[]; // Connected to Myths/Legends/Stories
  connectedLocations?: string[]; // Connected to Locations/Geography
  localLanguages?: string[]; // Languages
  pairedConnectedPolGroups?: string[]; // Connected to Ideologies/Political groups
  pairedConnectedReligiousGroups?: string[]; // Connected to Teachings/Religious groups
  pairedConnectedOtherGroups?: string[]; // Connected to Organizations/Other groups
  pairedConnectedMagicGroups?: string[]; // Connected to Schools of Magic/Magical groups
  pairedConnectedTechGroups?: string[]; // Connected to Sciences/Technological groups
  pairedConnectedSkills?: string[]; // Connected to Skills/Spells/Other
  pairedConnectedItems?: string[]; // Connected to Items
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Species extends BaseEntity {
  type: 'species';
  relatedRaces?: string[]; // Related Species/Races/Flora/Fauna
  evolvedIntoRaces?: string[]; // Evolved into Species/Races/Flora/Fauna
  evolvedFromRaces?: string[]; // Evolved from Species/Races/Flora/Fauna
  memberCount?: string; // Estimated population
  age?: string; // Average lifespan
  ageAdult?: string; // Average adulthood
  ageOldest?: string; // Oldest known
  height?: string; // Average size
  weight?: string; // Average weight
  beingType?: string; // Type of being
  sentience?: string; // Level of sapience
  pairedCharacter?: string[]; // Characters of Species/Races/Flora/Fauna
  pairedConnectedPlaces?: string[]; // Inhabited Locations
  relatedCultures?: string[]; // Connected to Culture/Art
  localCurrencies?: string[]; // Commonly used Currencies
  localLanguages?: string[]; // Commonly spoken Languages
  pairedSkills?: string[]; // Common Skills/Spells/Other
  commonProfessions?: string[]; // Common Occupations/Classes
  pairedProducedFromResources?: string[]; // Resources/Materials produced from the Species/Race/Flora/Fauna
  pairedUsedResourcesResources?: string[]; // Resources/Materials used by Species/Race/Flora/Fauna
  statsList?: string; // Stats/Attributes
  strengths?: string; // Strengths
  weaknesses?: string; // Weaknesses
  traits?: string; // Defining Features & Traits
  pairedConditionsPositive?: string[]; // Affected by Boons
  pairedConditionsNegative?: string[]; // Affected by Afflictions
  pairedConditionsOther?: string[]; // Affected by Other conditions
  commonNames?: string; // Common names among the Species/Races/Flora/Fauna
  commonFamilyNames?: string; // Common Family/Clan names among the Species/Races/Flora/Fauna
  description?: string; // Description & History
  traditions?: string; // Traditions & Customs
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedConnectedMyths?: string[]; // Connected to Myths, legends and stories
  connectedEvents?: string[]; // Connected to important Events
  pairedConnectedItems?: string[]; // Connected to Items
  pairedConnectedResources?: string[]; // Connected to Resources/Materials
  commonInPoliticalGroups?: string[]; // Common in Ideologies/Political groups
  commonInOtherGroups?: string[]; // Common in Organizations/Other groups
  commonInReligiousGroups?: string[]; // Common in Teachings/Religious groups
  commonInMagicGroups?: string[]; // Common in Magical groups
  commonInTechGroups?: string[]; // Common in Sciencific/Technological groups
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Religion extends BaseEntity {
  type: 'religious';
  leaders?: string; // Leading Figures (legacy)
  succedingRelGroup?: string[]; // Succeeding Teachings/Religious groups
  preceedingRelGroup?: string[]; // Preceding Teachings/Religious groups
  creationTime?: string; // Date of creation
  endTIme?: string; // Date of end
  headquarters?: string[]; // Headquarters
  followerName?: string; // Name for members/followers
  population?: string; // Member count
  followers?: string; // Follower/Subject count
  leadingCharacters?: string[]; // Leading Figures
  formReligion?: string; // Form of religion
  typeReligion?: string; // Type of religion
  relatedReligions?: string[]; // Related Religions
  localLanguages?: string[]; // Used Languages
  connectedRaces?: string[]; // Common Species/Races/Flora/Fauna
  pairedConnectedResources?: string[]; // Important Resources/Materials
  description?: string; // Description & History
  traditions?: string; // Traditions & Customs
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedConnectedMyths?: string[]; // Connected to Myths, legends and stories
  governLocations?: string[]; // Ruled/Influenced Locations
  collectedLocations?: string[]; // Connected Locations
  connectedEvents?: string[]; // Connected Events
  pairedConnectedCultures?: string[]; // Connected to Cultures/Art
  pairedConnectionCharacter?: string[]; // Connected Characters
  pairedBelongingCharacter?: string[]; // Prominent Members
  pairedAllyCharacter?: string[]; // Prominent Allies
  pairedEnemyCharacter?: string[]; // Prominent Enemies
  pairedConnectedPolGroups?: string[]; // Connected Ideologies/Political groups
  pairedAllyPolGroups?: string[]; // Allied Ideologies/Political groups
  pairedEnemyPolGroups?: string[]; // Enemy Ideologies/Political groups
  pairedConnectedOtherGroups?: string[]; // Connected Organizations/Other groups
  pairedAllyOtherGroups?: string[]; // Allied Organizations/Other groups
  pairedEnemyOtherGroups?: string[]; // Enemy Organizations/Other groups
  pairedConnectedReligiousGroups?: string[]; // Connected Teachings/Religious groups
  pairedAllyReligoiusGroups?: string[]; // Allied Teachings/Religious groups
  pairedEnemyReligiousGroups?: string[]; // Enemy Teachings/Religious groups
  pairedConnectedMagicGroups?: string[]; // Connected Schools of Magic/Magical groups
  pairedAllyMagicGroups?: string[]; // Allied Schools of Magic/Magical groups
  pairedEnemyMagicGroups?: string[]; // Enemy Schools of Magic/Magical groups
  pairedConnectedTechGroups?: string[]; // Connected Sciences/Technological groups
  pairedAllyTechGroups?: string[]; // Allied Sciences/Technological groups
  pairedEnemyTechGroups?: string[]; // Enemy Sciences/Technological groups
  pairedSkills?: string[]; // Connected to Skills/Spells/Other
  pairedConnectedItems?: string[]; // Connected to Items
  pairedConnectedProfessions?: string[]; // Connected to Occupations/Classes
  pairedConditions?: string[]; // Connected to Afflictions/Boons/Conditions
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Resource extends BaseEntity {
  type: 'resource';
  features?: string; // Prominent features
  priceCurrencies?: string; // Price in Currencies
  density?: string; // Density
  hardness?: string; // Hardness
  biomeType?: string; // Found in biomes
  rarity?: string; // Rarity
  resourceType?: string; // Resources/Materials type
  otherStats?: string; // Other material physical properties
  relatedResources?: string[]; // Related Resources/Materials
  madeIntoResources?: string[]; // Made into Resources/Materials
  madeFromResources?: string[]; // Created from Resources/Materials
  connectedLocations?: string[]; // Found in Locations
  relatedCultures?: string[]; // Connected to Cultures/Art
  usedProfessions?: string[]; // Used by Occupations/Classes
  producedProfessions?: string[]; // Produced by Occupations/Classes
  pairedResourcesRequire?: string[]; // Required by Skills/Spells/Other
  pairedResourcesCreate?: string[]; // Created by Skills/Spells/Other
  pairedItemMade?: string[]; // Resource/Material used to make Items
  pairedItemProduced?: string[]; // Resource/Material produced by Items
  pairedProducedFromRaces?: string[]; // Produced from Species/Races/Flora/Fauna
  pairedUsedResourcesRaces?: string[]; // Used by Species/Races/Flora/Fauna
  description?: string; // Description & History
  traditions?: string; // Traditions & customs connected to the item
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedMyths?: string[]; // Connected to Myths/Legends/Stories
  pairedCharacter?: string[]; // Connected to Characters
  pairedConnectedRaces?: string[]; // Connected to Species/Races/Flora/Fauna
  pairedConditionsPositive?: string[]; // Causing Boons
  pairedConditionsNegative?: string[]; // Causing Afflictions
  pairedConditionsOther?: string[]; // Causing Other conditions
  pairedConnectedPoliticalGroups?: string[]; // Connected to Ideologies/Political groups
  pairedConnectedReligiousGroups?: string[]; // Connected to Teachings/Religious groups
  pairedConnectedOtherGroups?: string[]; // Connected to Organizations/Other groups
  pairedConnectedMagicGroups?: string[]; // Connected to Schools of Magic/Magical groups
  pairedConnectedTechGroups?: string[]; // Connected to Sciences/Technological groups
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Tech extends BaseEntity {
  type: 'tech';
  leaders?: string; // Leading figures (legacy)
  pairedCharacter?: string[]; // Technology/Science Users
  succedingTechGroup?: string[]; // Succeeding Sciences/Technological groups
  preceedingTechGroup?: string[]; // Preceding Sciences/Technological groups
  creationTime?: string; // Date of creation
  endTIme?: string; // Date of end
  headquarters?: string[]; // Headquarters
  followerName?: string; // Name for members/followers
  population?: string; // Member/User count
  followers?: string; // Follower/Subject count
  leadingCharacters?: string[]; // Leading Figures
  typeTech?: string; // Type
  formTech?: string; // Scientific branches
  pairedTech?: string[]; // Related Technologies/Sciences
  pairedSkills?: string[]; // Connected to Skills/Spells/Other
  pairedConditions?: string[]; // Connected to Afflictions/Boons/Conditions
  pairedConnectedResources?: string[]; // Important Resources/Materials
  connectedRaces?: string[]; // Common Species/Races/Flora/Fauna
  localLanguages?: string[]; // Common languages
  description?: string; // Description & History
  traditions?: string; // Traditions & Customs
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedConnectedMyths?: string[]; // Connected to Myths, legends and stories
  governLocations?: string[]; // Ruled/Influenced Locations
  connectedLocations?: string[]; // Connected Locations
  connectedEvents?: string[]; // Connected Events
  pairedConnectedCultures?: string[]; // Connected to Cultures/Art
  pairedConnectionCharacter?: string[]; // Connected Characters
  pairedBelongingCharacter?: string[]; // Prominent Members
  pairedAllyCharacter?: string[]; // Prominent Allies
  pairedEnemyCharacter?: string[]; // Prominent Enemies
  pairedConnectedPolGroups?: string[]; // Connected Ideologies/Political groups
  pairedAllyPolGroups?: string[]; // Allied Ideologies/Political groups
  pairedEnemyPolGroups?: string[]; // Enemy Ideologies/Political groups
  pairedConnectedOtherGroups?: string[]; // Connected Organizations/Other groups
  pairedAllyOtherGroups?: string[]; // Allied Organizations/Other groups
  pairedEnemyOtherGroups?: string[]; // Enemy Organizations/Other groups
  pairedConnectedReligiousGroups?: string[]; // Connected Teachings/Religious groups
  pairedAllyReligiousGroups?: string[]; // Allied Teachings/Religious groups
  pairedEnemyReligiousGroups?: string[]; // Enemy Teachings/Religious groups
  pairedConnectedMagicalGroups?: string[]; // Connected Schools of Magic/Magical groups
  pairedAllyMagicalGroups?: string[]; // Allied Schools of Magic/Magical groups
  pairedEnemyMagicalGroups?: string[]; // Enemy Schools of Magic/Magical groups
  pairedConnectedTechGroups?: string[]; // Connected Sciences/Technological groups
  pairedAllyTechGroups?: string[]; // Allied Sciences/Technological groups
  pairedEnemyTechGroups?: string[]; // Enemy Sciences/Technological groups
  pairedConnectedItems?: string[]; // Connected to Items
  pairedConnectedProfessions?: string[]; // Connected to Occupations/Classes
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}

export interface Ability extends BaseEntity {
  type: 'ability';
  statsListRequired?: string; // Stats/Attributes required
  statsListProvided?: string; // Stats/Attributes provided
  traits?: string; // Unique/Defining Features
  levelSkill?: string; // Complexity to use
  typeSkill?: string; // Type
  pairedSkills?: string[]; // Related Skills/Spells/Other
  prerequisiteSkills?: string[]; // Prerequisites Skills/Spells/Other
  postrequisiteSkills?: string[]; // Required by Skills/Spells/Other
  pairedItemsCommon?: string[]; // Commonly used with Items
  pairedItemsUsing?: string[]; // Items capable of using this Skills/Spells/Other
  pairedItemsRequire?: string[]; // Required Items
  pairedItemsCreate?: string[]; // Created Items
  pairedConnectedProfessions?: string[]; // Commonly used by Occupations/Classes
  relatedCultures?: string[]; // Connected to Cultures/Art
  pairedResourcesRequire?: string[]; // Required Resources/Materials
  pairedResourcesCreate?: string[]; // Created Resources/Materials
  pairedConditionsPositive?: string[]; // Causing following Boons
  pairedConditionsNegative?: string[]; // Causing following Afflictions
  pairedConditionsOther?: string[]; // Causing following Other conditions
  description?: string; // Description & History
  traditions?: string; // Traditions & customs connected to the Skill/Spell/other
  pairedConnectedNotes?: string[]; // Connected to Lore notes/Other notes
  pairedMyths?: string[]; // Connected to Myths/Legends/Stories
  pairedCharacterSkills?: string[]; // Connected to Characters
  pairedLocationsSkills?: string[]; // Connected to Locations/Geography
  pairedRacesSkills?: string[]; // Connected to Species/Races/Flora/Fauna
  pairedEventSkills?: string[]; // Skills/Other connected to Events
  pairedEventSpells?: string[]; // Spells connected to Events
  pairedPoliticalGroupsSkills?: string[]; // Connected to Ideologies/Political groups
  pairedReligiousGroupsSkills?: string[]; // Connected to Teachings/Religious groups
  pairedOtherGroupsSkills?: string[]; // Connected to Organizations/Other groups
  pairedMagicGroupsSkills?: string[]; // Connected to Schools of Magic/Magical groups
  pairedTechGroupsSkills?: string[]; // Connected to Sciences/Technological groups
  spoilerNotes?: string; // Secrets/Spoilers/DM notes
}




// --- END SPECIFIC INTERFACES ---

export type WorldEntity = Chapter | Note | Myth | Character | Location | Event | Species | Language | Culture | PoliticalGroup | Religion | Organization | Magic | ScienceTechnology | Ability | Item | Occupation | Condition | Resource | BaseEntity;

export interface WorldData {
  name: string;
  entities: WorldEntity[];
  trash: WorldEntity[];
  mapImage?: string;
  mapConnections: MapConnection[];
  worldPhase: WorldPhase;
}

export interface EntityEditorProps {
    entity: any;
    allEntities: WorldEntity[];
    onSave: () => void;
    onCancel: () => void;
    onUpdate: (data: any) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export interface EntityViewerProps {
    entity: WorldEntity;
    allEntities: WorldEntity[];
    onEdit: () => void;
    onDelete: () => void;
    onNavigate: (id: string) => void;
    onFocusMap: () => void;
    isWikiMode: boolean;
}

export interface LinksDisplayProps {
    label: string;
    ids: string[];
    all: WorldEntity[];
    onNav: (id: string) => void;
    isWikiMode: boolean;
    wikiStyle?: 'tag' | 'inline';
}

export interface FormInputProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: string;
    isWikiMode: boolean;
    gridSpan?: number;
}

export interface FormToggleProps {
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
    isWikiMode: boolean;
    gridSpan?: number;
}

export interface SmartSelectProps {
    label: string;
    ids: string[];
    type: EntityType;
    all: WorldEntity[];
    onChange: (ids: string[]) => void;
    onCreate: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
    disabled?: boolean;
    gridSpan?: number;
}

export interface FieldRowProps {
    label: string;
    value?: string | string[];
    isWikiMode: boolean;
}

export interface TrashViewProps {
    trash: WorldEntity[];
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
    isWikiMode: boolean;
}

export interface OptionsViewProps {
    world: WorldData;
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
    isWikiMode: boolean;
    setIsWikiMode: (mode: boolean) => void;
}

export interface WorldMapProps {
    world: WorldData;
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
}
