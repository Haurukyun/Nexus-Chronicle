import { describe, it, expect } from 'vitest';
import { 
    isFieldVisible, 
    toggleFieldHidden, 
    isFieldValueEmpty, 
    shouldHideEmptyFields,
    CONFIGURABLE_FIELDS 
} from './fieldVisibilityUtils';
import { WorldData, WorldEntity } from '../types';

describe('fieldVisibilityUtils', () => {
    const mockWorld: WorldData = {
        name: 'Test World',
        entities: [],
        trash: [],
        mapConnections: [],
        worldPhase: 'creation',
        hiddenFields: {
            character: ['weight', 'powerLevel']
        },
        hideEmptyFieldsDefault: true
    };

    it('determines field visibility properly', () => {
        expect(isFieldVisible(mockWorld, 'character', 'weight')).toBe(false);
        expect(isFieldVisible(mockWorld, 'character', 'powerLevel')).toBe(false);
        expect(isFieldVisible(mockWorld, 'character', 'age')).toBe(true);
        expect(isFieldVisible(undefined, 'character', 'weight')).toBe(true);
    });

    it('toggles field visibility cleanly', () => {
        let hidden = mockWorld.hiddenFields;
        hidden = toggleFieldHidden(hidden, 'character', 'age');
        expect(hidden.character).toContain('age');

        hidden = toggleFieldHidden(hidden, 'character', 'age');
        expect(hidden.character).not.toContain('age');
    });

    it('detects empty field values accurately', () => {
        expect(isFieldValueEmpty(undefined)).toBe(true);
        expect(isFieldValueEmpty(null)).toBe(true);
        expect(isFieldValueEmpty('')).toBe(true);
        expect(isFieldValueEmpty('   ')).toBe(true);
        expect(isFieldValueEmpty([])).toBe(true);
        expect(isFieldValueEmpty({})).toBe(true);
        expect(isFieldValueEmpty('Hero')).toBe(false);
        expect(isFieldValueEmpty(['item-1'])).toBe(false);
        expect(isFieldValueEmpty({ strength: '14' })).toBe(false);
    });

    it('resolves hideEmptyFields priority between entity override and world default', () => {
        expect(shouldHideEmptyFields(mockWorld)).toBe(true);

        const entityWithOverrideTrue: WorldEntity = {
            id: '1',
            name: 'Test',
            type: 'character',
            hideEmptyFieldsOverride: false
        } as any;
        expect(shouldHideEmptyFields(mockWorld, entityWithOverrideTrue)).toBe(false);

        const entityNoOverride: WorldEntity = {
            id: '2',
            name: 'Test',
            type: 'character'
        } as any;
        expect(shouldHideEmptyFields(mockWorld, entityNoOverride)).toBe(true);
    });

    it('has configurable field definitions for key types', () => {
        expect(CONFIGURABLE_FIELDS.character?.length).toBeGreaterThan(5);
        expect(CONFIGURABLE_FIELDS.location?.length).toBeGreaterThan(2);
        expect(CONFIGURABLE_FIELDS.item?.length).toBeGreaterThan(2);
    });
});
