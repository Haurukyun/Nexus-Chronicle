
export type EntityType =
  | 'chapter' | 'note' | 'myth'
  | 'character' | 'location' | 'event' | 'species' | 'language' | 'culture'
  | 'political' | 'religious' | 'organization' | 'magic' | 'science'
  | 'ability' | 'item' | 'occupation' | 'condition' | 'resource';

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
  belongsUnderId?: string;
  textColor?: string;
  backgroundColor?: string;
  isReadOnly?: boolean;
  isMinorDocument?: boolean;
  isDead?: boolean;
  isCategory?: boolean;
  tags: string[];
  otherNames?: string;
  description: string;
  type: EntityType;
  lastModified: number;
  privateNotes?: string;
}

export interface Character extends BaseEntity {
  type: 'character';
  // Basic Information
  titles?: string;
  sex?: string;
  otherBasicInfo?: string;
  age?: string;
  height?: string;
  weight?: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  speciesIds: string[];
  occupationIds: string[];
  ethnicity?: string;
  combatRating?: string;
  placeOfResidenceId?: string;
  placeOfOriginId?: string;
  placeOfDemiseId?: string;
  affectedByBoonsIds: string[];
  affectedByAfflictionsIds: string[];
  affectedByOtherConditionsIds: string[];

  // Description & History
  traitsAndCharacteristics?: string;
  unusualFeatures?: string;
  stats?: {
    strength?: string;
    dexterity?: string;
    constitution?: string;
    intelligence?: string;
    wisdom?: string;
    charisma?: string;
  };
  equipment?: string;
  wealth?: string;
  skillIds: string[];
  spellIds: string[];
  languageIds: string[];
  magicalTeachingIds: string[];
  technologyIds: string[];

  // Relationships
  parentIds: string[];
  childrenIds: string[];
  relativeIds: string[];
  friendIds: string[];
  enemyIds: string[];
  complicatedWithIds: string[];

  // Connections - Lore
  loreNoteIds: string[];
  mythIds: string[];

  // Connections - World
  eventIds: string[];
  locationIds: string[];
  cultureIds: string[];

  // Connections - Groups
  groupConnections: {
    political: GroupRoleLinks;
    organization: GroupRoleLinks;
    religious: GroupRoleLinks;
    magic: GroupRoleLinks;
    science: GroupRoleLinks;
  };

  // Connections - Details
  detailSkillIds: string[];
  detailItemIds: string[];
  detailConditionIds: string[];
  detailResourceIds: string[];
}

export interface Location extends BaseEntity {
  type: 'location';
  coordinates?: { x: number; y: number };
}

export type WorldEntity = Character | Location | BaseEntity;

export interface WorldData {
  name: string;
  entities: WorldEntity[];
  trash: WorldEntity[];
  mapImage?: string;
}
