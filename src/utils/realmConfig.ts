import { EntityType, RealmModuleConfig, WorldData } from '../types';

export const ALL_ENTITY_TYPES: EntityType[] = [
  'chapter', 'note', 'myth',
  'character', 'location', 'event', 'species', 'language', 'culture',
  'political', 'religious', 'organization', 'magic', 'science', 'tech',
  'ability', 'item', 'occupation', 'condition', 'resource', 'currency'
];

export const DEFAULT_REALM_MODULES: Required<RealmModuleConfig> = {
  combatStats: true,
  magicSystems: true,
  techSystems: true,
  factionMatrix: true,
  atlasCoordinates: true,
};

/**
 * Checks whether an EntityType is active within the realm.
 * Defaults to true if activeEntityTypes is omitted, null, or empty.
 */
export function isEntityTypeActive(world: WorldData | undefined, type: EntityType): boolean {
  if (!world || !world.activeEntityTypes || world.activeEntityTypes.length === 0) {
    return true;
  }
  return world.activeEntityTypes.includes(type);
}

/**
 * Checks whether an engine module is active within the realm.
 * Defaults to true if activeModules or the specific module key is undefined.
 */
export function isModuleActive(world: WorldData | undefined, moduleKey: keyof RealmModuleConfig): boolean {
  if (!world || !world.activeModules) {
    return true;
  }
  return world.activeModules[moduleKey] !== false;
}

/**
 * Returns the resolved array of active entity types for a realm.
 */
export function getActiveEntityTypes(world: WorldData | undefined): EntityType[] {
  if (!world || !world.activeEntityTypes || world.activeEntityTypes.length === 0) {
    return ALL_ENTITY_TYPES;
  }
  return world.activeEntityTypes;
}

/**
 * Returns the resolved active module configurations for a realm.
 */
export function getActiveModules(world: WorldData | undefined): Required<RealmModuleConfig> {
  return {
    ...DEFAULT_REALM_MODULES,
    ...(world?.activeModules || {}),
  };
}

export interface RealmPreset {
  id: string;
  label: string;
  icon: string;
  description: string;
  activeEntityTypes: EntityType[];
  activeModules: Required<RealmModuleConfig>;
}

export const REALM_PRESETS: RealmPreset[] = [
  {
    id: 'all',
    label: 'All Blueprints (Full Codex)',
    icon: '✨',
    description: 'Enables all 21 blueprints and all 5 engine modules for complete creative freedom.',
    activeEntityTypes: ALL_ENTITY_TYPES,
    activeModules: {
      combatStats: true,
      magicSystems: true,
      techSystems: true,
      factionMatrix: true,
      atlasCoordinates: true,
    },
  },
  {
    id: 'fantasy',
    label: 'High Fantasy & Myth',
    icon: '⚔️',
    description: 'Focuses on magic schools, ancient myths, species, and RPG combat stats. Technology disabled.',
    activeEntityTypes: [
      'chapter', 'note', 'myth',
      'character', 'location', 'event', 'species', 'language', 'culture',
      'political', 'religious', 'organization', 'magic',
      'ability', 'item', 'occupation', 'condition', 'resource', 'currency'
    ],
    activeModules: {
      combatStats: true,
      magicSystems: true,
      techSystems: false,
      factionMatrix: true,
      atlasCoordinates: true,
    },
  },
  {
    id: 'scifi',
    label: 'Sci-Fi & Cyberpunk',
    icon: '🚀',
    description: 'Focuses on tech divisions, sciences, cybernetics, and tension matrix. Magic & myths disabled.',
    activeEntityTypes: [
      'chapter', 'note',
      'character', 'location', 'event', 'species', 'language', 'culture',
      'political', 'organization', 'science', 'tech',
      'ability', 'item', 'occupation', 'condition', 'resource', 'currency'
    ],
    activeModules: {
      combatStats: true,
      magicSystems: false,
      techSystems: true,
      factionMatrix: true,
      atlasCoordinates: true,
    },
  },
  {
    id: 'modern',
    label: 'Modern Slice-of-Life & Drama',
    icon: '☕',
    description: 'Grounds worldbuilding in people, places, events, and organizations. Combat stats, magic, and fantasy tropes disabled.',
    activeEntityTypes: [
      'chapter', 'note',
      'character', 'location', 'event', 'culture',
      'political', 'organization',
      'item', 'occupation', 'currency'
    ],
    activeModules: {
      combatStats: false,
      magicSystems: false,
      techSystems: false,
      factionMatrix: false,
      atlasCoordinates: true,
    },
  },
  {
    id: 'alien_invasion',
    label: 'Alien Invasion & Thriller',
    icon: '🛸',
    description: 'Modern Earth facing extraterrestrial species, sciences, tech weaponry, and geopolitical tension.',
    activeEntityTypes: [
      'chapter', 'note',
      'character', 'location', 'event', 'species',
      'political', 'organization', 'science', 'tech',
      'ability', 'item', 'occupation', 'condition', 'resource', 'currency'
    ],
    activeModules: {
      combatStats: true,
      magicSystems: false,
      techSystems: true,
      factionMatrix: true,
      atlasCoordinates: true,
    },
  },
  {
    id: 'grimdark_horror',
    label: 'Cosmic Horror & Mystery',
    icon: '👁️',
    description: 'Characters, occult myths, investigators, afflictions, and forbidden relics. Cybernetics & high tech disabled.',
    activeEntityTypes: [
      'chapter', 'note', 'myth',
      'character', 'location', 'event', 'language', 'culture',
      'religious', 'organization', 'magic',
      'item', 'occupation', 'condition', 'resource'
    ],
    activeModules: {
      combatStats: true,
      magicSystems: true,
      techSystems: false,
      factionMatrix: true,
      atlasCoordinates: true,
    },
  },
];
