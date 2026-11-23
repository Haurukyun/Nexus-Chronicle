import { EntityType, WorldData, WorldEntity } from '../types';

export interface ConfigurableField {
    key: string;
    label: string;
    description?: string;
}

export const CONFIGURABLE_FIELDS: Partial<Record<EntityType, ConfigurableField[]>> = {
    character: [
        { key: 'titles', label: 'Titles & Honorifics' },
        { key: 'sex', label: 'Sex / Gender' },
        { key: 'age', label: 'Age' },
        { key: 'height', label: 'Height' },
        { key: 'weight', label: 'Weight' },
        { key: 'ethnicity', label: 'Ethnicity / Sub-race' },
        { key: 'powerLevel', label: 'Combat Rating / Power Level' },
        { key: 'demise', label: 'Place & Date of Demise' },
        { key: 'knownLanguage', label: 'Known Languages' },
        { key: 'knownMagic', label: 'Known Magic & Spells' },
        { key: 'knownTech', label: 'Known Technologies / Cybernetics' },
        { key: 'possessedItems', label: 'Equipment & Possessions' },
        { key: 'possessedCurrencies', label: 'Wealth & Currencies' },
        { key: 'traits', label: 'Unique / Unusual Features' },
        { key: 'personalityTraits', label: 'Traits & Quirks' },
        { key: 'conditions', label: 'Boons, Afflictions & Conditions' },
    ],
    location: [
        { key: 'climateNotes', label: 'Climate & Atmosphere' },
        { key: 'notableLandmarks', label: 'Notable Landmarks' },
        { key: 'defenses', label: 'Defenses & Fortifications' },
        { key: 'hazards', label: 'Hazards & Dangers' },
        { key: 'coordinates', label: 'Atlas Coordinates' },
    ],
    item: [
        { key: 'priceInCurrencies', label: 'Price & Cost in Currencies' },
        { key: 'traditions', label: 'Traditions & Customs' },
        { key: 'statsListRequired', label: 'Required Attributes' },
        { key: 'statsList', label: 'Provided Attributes' },
        { key: 'resources', label: 'Crafting Materials & Production' },
    ],
    organization: [
        { key: 'hierarchyRanks', label: 'Hierarchy & Leadership Ranks' },
        { key: 'coreTenets', label: 'Core Creed & Tenets' },
        { key: 'factionAssets', label: 'Faction Assets & Strongholds' },
    ],
    political: [
        { key: 'hierarchyRanks', label: 'Government Positions & Titles' },
        { key: 'coreTenets', label: 'Political Ideology & Decrees' },
        { key: 'factionAssets', label: 'State Assets & Fleets' },
    ],
    religious: [
        { key: 'hierarchyRanks', label: 'Priesthood & Clergy Orders' },
        { key: 'coreTenets', label: 'Sacred Dogma & Commandments' },
        { key: 'factionAssets', label: 'Holy Relics, Shrines & Temples' },
    ],
};

/**
 * Checks if a specific field is visible according to world configuration.
 */
export function isFieldVisible(world: WorldData | undefined, type: EntityType, fieldKey: string): boolean {
    if (!world?.hiddenFields?.[type]) return true;
    return !world.hiddenFields[type]!.includes(fieldKey);
}

/**
 * Toggles a field's hidden status in world.hiddenFields.
 */
export function toggleFieldHidden(
    hiddenFields: Partial<Record<EntityType, string[]>> | undefined,
    type: EntityType,
    fieldKey: string
): Partial<Record<EntityType, string[]>> {
    const copy: Partial<Record<EntityType, string[]>> = { ...hiddenFields };
    const currentList = copy[type] ? [...copy[type]!] : [];

    if (currentList.includes(fieldKey)) {
        copy[type] = currentList.filter(k => k !== fieldKey);
    } else {
        copy[type] = [...currentList, fieldKey];
    }

    return copy;
}

/**
 * Checks if a value is consider empty (empty string, null, undefined, empty array).
 */
export function isFieldValueEmpty(val: any): boolean {
    if (val === undefined || val === null) return true;
    if (typeof val === 'string') return val.trim().length === 0;
    if (Array.isArray(val)) return val.length === 0;
    if (typeof val === 'object') {
        const keys = Object.keys(val);
        if (keys.length === 0) return true;
        return keys.every(k => isFieldValueEmpty(val[k]));
    }
    return false;
}

/**
 * Determines whether empty fields should be auto-hidden for an entity in viewer mode.
 */
export function shouldHideEmptyFields(world: WorldData | undefined, entity?: WorldEntity): boolean {
    if (entity?.hideEmptyFieldsOverride !== undefined) {
        return entity.hideEmptyFieldsOverride;
    }
    return Boolean(world?.hideEmptyFieldsDefault);
}
