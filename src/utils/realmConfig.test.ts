import { describe, it, expect } from 'vitest';
import {
  ALL_ENTITY_TYPES,
  DEFAULT_REALM_MODULES,
  isEntityTypeActive,
  isModuleActive,
  getActiveEntityTypes,
  getActiveModules,
  REALM_PRESETS
} from './realmConfig';
import { WorldData } from '../types';

describe('realmConfig utilities', () => {
  const baseWorld: WorldData = {
    name: 'Test Realm',
    entities: [],
    trash: [],
    mapConnections: [],
    worldPhase: 'golden'
  };

  it('defaults to active for all entity types when activeEntityTypes is undefined or empty', () => {
    expect(isEntityTypeActive(undefined, 'magic')).toBe(true);
    expect(isEntityTypeActive(baseWorld, 'magic')).toBe(true);
    expect(isEntityTypeActive({ ...baseWorld, activeEntityTypes: [] }, 'tech')).toBe(true);
    expect(getActiveEntityTypes(baseWorld)).toEqual(ALL_ENTITY_TYPES);
  });

  it('respects activeEntityTypes whitelist when specified', () => {
    const modernWorld: WorldData = {
      ...baseWorld,
      activeEntityTypes: ['character', 'location', 'chapter']
    };
    expect(isEntityTypeActive(modernWorld, 'character')).toBe(true);
    expect(isEntityTypeActive(modernWorld, 'location')).toBe(true);
    expect(isEntityTypeActive(modernWorld, 'chapter')).toBe(true);
    expect(isEntityTypeActive(modernWorld, 'magic')).toBe(false);
    expect(isEntityTypeActive(modernWorld, 'tech')).toBe(false);
    expect(isEntityTypeActive(modernWorld, 'species')).toBe(false);
  });

  it('defaults to true for all modules when activeModules is undefined', () => {
    expect(isModuleActive(undefined, 'combatStats')).toBe(true);
    expect(isModuleActive(baseWorld, 'combatStats')).toBe(true);
    expect(isModuleActive(baseWorld, 'magicSystems')).toBe(true);
    expect(isModuleActive(baseWorld, 'techSystems')).toBe(true);
    expect(isModuleActive(baseWorld, 'factionMatrix')).toBe(true);
    expect(isModuleActive(baseWorld, 'atlasCoordinates')).toBe(true);
    expect(getActiveModules(baseWorld)).toEqual(DEFAULT_REALM_MODULES);
  });

  it('correctly disables specific modules when configured as false', () => {
    const sliceOfLifeWorld: WorldData = {
      ...baseWorld,
      activeModules: {
        combatStats: false,
        magicSystems: false,
        techSystems: false,
        factionMatrix: false,
        atlasCoordinates: true
      }
    };
    expect(isModuleActive(sliceOfLifeWorld, 'combatStats')).toBe(false);
    expect(isModuleActive(sliceOfLifeWorld, 'magicSystems')).toBe(false);
    expect(isModuleActive(sliceOfLifeWorld, 'techSystems')).toBe(false);
    expect(isModuleActive(sliceOfLifeWorld, 'factionMatrix')).toBe(false);
    expect(isModuleActive(sliceOfLifeWorld, 'atlasCoordinates')).toBe(true);
  });

  it('presets contain valid entity types and module states', () => {
    REALM_PRESETS.forEach(preset => {
      expect(preset.activeEntityTypes.length).toBeGreaterThan(0);
      preset.activeEntityTypes.forEach(type => {
        expect(ALL_ENTITY_TYPES).toContain(type);
      });
      expect(typeof preset.activeModules.combatStats).toBe('boolean');
      expect(typeof preset.activeModules.magicSystems).toBe('boolean');
      expect(typeof preset.activeModules.techSystems).toBe('boolean');
      expect(typeof preset.activeModules.factionMatrix).toBe('boolean');
      expect(typeof preset.activeModules.atlasCoordinates).toBe('boolean');
    });
  });
});
