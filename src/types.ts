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
  belongsUnderId?: string;
  textColor?: string;
  backgroundColor?: string;
  isReadOnly?: boolean;
  isMinorDocument?: boolean;
  isDead?: boolean;
  status?: string;
  isCategory?: boolean;
  isFinished?: boolean;
  orderNumber?: string;
  documentTemplate?: string;
  extraHtmlClasses?: string;
  otherNamesAndEpithets?: string;
  tags: string[];
  otherNames?: string; // Kept for backward compatibility if needed, but UI will use nameAndEpithets
  description: string;
  type: EntityType;
  lastModified: number;
  privateNotes?: string;
  coordinates?: { x: number; y: number };
  parentIds: string[];
  childrenIds: string[];
  relativeIds: string[];
  friendIds: string[];
  enemyIds: string[];
  complicatedWithIds: string[];
  loreNoteIds: string[];
  mythIds: string[];
  eventIds: string[];
  locationIds: string[];
  cultureIds: string[];
  groupConnections: {
    political: GroupRoleLinks;
    organization: GroupRoleLinks;
    religious: GroupRoleLinks;
    magic: GroupRoleLinks;
    science: GroupRoleLinks;
  };
  detailSkillIds: string[];
  detailItemIds: string[];
  detailConditionIds: string[];
  detailResourceIds: string[];
}

export interface Character extends BaseEntity {
  type: 'character';
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
  placeOfResidenceId?: string[];
  placeOfOriginId?: string[];
  placeOfDemiseId?: string[];
  affectedByBoonsIds: string[];
  affectedByAfflictionsIds: string[];
  affectedByOtherConditionsIds: string[];
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
  equipmentIds: string[];
  wealthIds: string[];
  skillIds: string[];
  spellIds: string[];
  languageIds: string[];
  magicalTeachingIds: string[];
  technologyIds: string[];
}

export interface Location extends BaseEntity {
  type: 'location';
}

export interface Event extends BaseEntity {
  type: 'event';
  date?: string;
  duration?: string;
  locationId?: string;
  involvedEntityIds: string[];
}

export interface WorldEra extends BaseEntity {
  type: 'note';
  startDate?: string;
  endDate?: string;
}

export type WorldEntity = Character | Location | Event | BaseEntity;

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
}

export interface FormToggleProps {
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
    isWikiMode: boolean;
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
