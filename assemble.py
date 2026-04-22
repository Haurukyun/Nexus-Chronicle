import os

with open('scratch/generated_interfaces.ts', 'r', encoding='utf-8') as f:
    gen = f.read()
    
interfaces_part = gen.split('// DEFAULTS FOR STORE:')[0]

types_content = f"""import React from 'react';

export type EntityType =
  | 'chapter' | 'note' | 'myth'
  | 'character' | 'location' | 'event' | 'species' | 'language' | 'culture'
  | 'political' | 'religious' | 'organization' | 'magic' | 'science'
  | 'ability' | 'item' | 'occupation' | 'condition' | 'resource';

export type WorldPhase = 'creation' | 'golden' | 'shadow' | 'eclipse' | 'ruin';

export interface MapConnection {{
  id: string;
  sourceId: string;
  targetId: string;
  type: 'trade' | 'magic' | 'diplomatic' | 'war';
  label?: string;
}}

export interface GroupRoleLinks {{
  leadingFigureOf: string[];
  connectedTo: string[];
  memberOf: string[];
  allyOf: string[];
  enemyOf: string[];
}}

export interface BaseEntity {{
  id: string;
  name: string;
  type: EntityType;
  tags: string[];
  description: string;
  lastModified: number;
  
  // Universal document settings from blueprints
  parentDoc?: string[]; // Belongs under (often singleToNoneRelationship, but modeled as array for simplicity)
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
  coordinates?: {{ x: number; y: number }};
}}

// --- GENERATED SPECIFIC INTERFACES ---

{interfaces_part}

// --- END SPECIFIC INTERFACES ---

export type WorldEntity = Chapter | Note | Myth | Character | Location | Event | Species | Language | Culture | PoliticalGroup | Religion | Organization | Magic | ScienceTechnology | Ability | Item | Occupation | Condition | Resource | BaseEntity;

export interface WorldData {{
  name: string;
  entities: WorldEntity[];
  trash: WorldEntity[];
  mapImage?: string;
  mapConnections: MapConnection[];
  worldPhase: WorldPhase;
}}

export interface EntityEditorProps {{
    entity: any;
    allEntities: WorldEntity[];
    onSave: () => void;
    onCancel: () => void;
    onUpdate: (data: any) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}}

export interface EntityViewerProps {{
    entity: WorldEntity;
    allEntities: WorldEntity[];
    onEdit: () => void;
    onDelete: () => void;
    onNavigate: (id: string) => void;
    onFocusMap: () => void;
    isWikiMode: boolean;
}}

export interface LinksDisplayProps {{
    label: string;
    ids: string[];
    all: WorldEntity[];
    onNav: (id: string) => void;
    isWikiMode: boolean;
    wikiStyle?: 'tag' | 'inline';
}}

export interface FormInputProps {{
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: string;
    isWikiMode: boolean;
}}

export interface FormToggleProps {{
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
    isWikiMode: boolean;
}}

export interface SmartSelectProps {{
    label: string;
    ids: string[];
    type: EntityType;
    all: WorldEntity[];
    onChange: (ids: string[]) => void;
    onCreate: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
    disabled?: boolean;
}}

export interface FieldRowProps {{
    label: string;
    value?: string | string[];
    isWikiMode: boolean;
}}

export interface TrashViewProps {{
    trash: WorldEntity[];
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
    isWikiMode: boolean;
}}

export interface OptionsViewProps {{
    world: WorldData;
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
    isWikiMode: boolean;
    setIsWikiMode: (mode: boolean) => void;
}}

export interface WorldMapProps {{
    world: WorldData;
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
}}
"""

with open('src/types.ts', 'w', encoding='utf-8') as f:
    f.write(types_content)
