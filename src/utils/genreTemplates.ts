import { WorldData, WorldEntity } from '../types';

export type GenreTemplateId = 'universal' | 'fantasy' | 'scifi' | 'modern' | 'horror';

export interface GenreTemplateConfig {
    id: GenreTemplateId;
    label: string;
    tagline: string;
    description: string;
    icon: string;
    fieldLabelOverrides: Record<string, string>;
    suggestedHiddenFields?: Partial<Record<string, string[]>>;
    recommendedStats: Array<{ id: string; label: string; value: string; max?: string }>;
}

export const GENRE_TEMPLATES: Record<GenreTemplateId, GenreTemplateConfig> = {
    universal: {
        id: 'universal',
        label: 'Universal / Sandbox',
        tagline: 'Standard multi-genre codex schema',
        description: 'Neutral field titles and balanced default settings suitable for any campaign, cross-genre setting, or freeform worldbuilding.',
        icon: 'Globe',
        fieldLabelOverrides: {},
        recommendedStats: [
            { id: 'hp', label: 'Health', value: '100', max: '100' },
            { id: 'stamina', label: 'Stamina', value: '50', max: '50' }
        ]
    },
    fantasy: {
        id: 'fantasy',
        label: 'High & Dark Fantasy',
        tagline: 'Arcane lore, lineages, and spellcraft',
        description: 'Prioritizes lineage, magical academies, enchanted relics, divine pantheons, and chivalric/feudal hierarchies.',
        icon: 'Sparkles',
        fieldLabelOverrides: {
            powerLevel: 'Arcane / Combat Tier',
            pairedRace: 'Species & Kinship',
            possessedItems: 'Inventory & Relics',
            possessedCurrencies: 'Coinage & Treasures',
            knownMagic: 'Schools of Magic & Spells',
            conditions: 'Boons, Curses & Afflictions'
        },
        suggestedHiddenFields: {
            character: ['knownTech']
        },
        recommendedStats: [
            { id: 'hp', label: 'Vitality', value: '100', max: '100' },
            { id: 'mana', label: 'Mana / Aether', value: '60', max: '60' },
            { id: 'resolve', label: 'Resolve', value: '15', max: '20' }
        ]
    },
    scifi: {
        id: 'scifi',
        label: 'Sci-Fi & Cyberpunk',
        tagline: 'Cyberware, orbital factions, and star systems',
        description: 'Tailored for space opera, cyberpunk, and transhumanist fiction with threat ratings, synthetic models, and neural implants.',
        icon: 'Cpu',
        fieldLabelOverrides: {
            powerLevel: 'Threat Level / Rating',
            pairedRace: 'Species & Model / Frame',
            pairedProfession: 'Role / Syndicate Specialty',
            possessedItems: 'Hardware & Loadout',
            possessedCurrencies: 'Credits & Cryptos',
            knownTech: 'Cyberware & Neural Wetware',
            knownMagic: 'Psionics & Nanite Protocols',
            conditions: 'Status & System Glitches'
        },
        suggestedHiddenFields: {
            character: ['knownMagic']
        },
        recommendedStats: [
            { id: 'shields', label: 'Energy Shields', value: '150', max: '150' },
            { id: 'cyberware', label: 'Cyberware Strain', value: '35', max: '100' },
            { id: 'credits', label: 'Creds', value: '5200' }
        ]
    },
    modern: {
        id: 'modern',
        label: 'Modern & Urban Mystery',
        tagline: 'Social spheres, careers, and investigative records',
        description: 'Emphasizes social backgrounds, professional careers, institutional affiliations, and realistic asset tracking.',
        icon: 'MapPin',
        fieldLabelOverrides: {
            powerLevel: 'Physical & Social Standing',
            pairedRace: 'Ethnicity & Heritage',
            pairedProfession: 'Occupation & Career',
            possessedItems: 'Personal Belongings',
            possessedCurrencies: 'Bank Accounts & Assets',
            conditions: 'Injuries & Psychological Status'
        },
        suggestedHiddenFields: {
            character: ['knownMagic', 'knownTech']
        },
        recommendedStats: [
            { id: 'stamina', label: 'Stamina', value: '100', max: '100' },
            { id: 'sanity', label: 'Mental Composure', value: '80', max: '100' },
            { id: 'cred', label: 'Reputation', value: '4', max: '10' }
        ]
    },
    horror: {
        id: 'horror',
        label: 'Gothic & Cosmic Horror',
        tagline: 'Sanity, occult grim lore, and lingering traumas',
        description: 'Focuses on vulnerability, psychological stress, eldritch encounters, taboo rites, and lingering physical/mental afflictions.',
        icon: 'Skull',
        fieldLabelOverrides: {
            powerLevel: 'Threat Level / Vulnerability',
            pairedRace: 'Lineage & True Nature',
            possessedItems: 'Trinkets & Warded Tools',
            possessedCurrencies: 'Keepsakes & Currency',
            knownMagic: 'Occult Rites & Grimoires',
            conditions: 'Traumas, Dread & Scars'
        },
        recommendedStats: [
            { id: 'sanity', label: 'Sanity', value: '45', max: '100' },
            { id: 'dread', label: 'Dread Level', value: '2', max: '10' },
            { id: 'vitality', label: 'Physical Vitality', value: '70', max: '100' }
        ]
    }
};

export const GENRE_TEMPLATE_LIST: GenreTemplateConfig[] = Object.values(GENRE_TEMPLATES);

/**
 * Resolves the active genre template for a given entity or the world default.
 */
export function getActiveGenreTemplate(world?: WorldData, entity?: WorldEntity): GenreTemplateId {
    if (entity?.entityTemplate && entity.entityTemplate !== 'inherit') {
        return entity.entityTemplate;
    }
    return world?.genreTemplate || 'universal';
}

/**
 * Gets the genre-customized label for an entity field, falling back to defaultLabel.
 */
export function getGenreFieldLabel(
    genre: GenreTemplateId,
    fieldKey: string,
    defaultLabel: string
): string {
    const template = GENRE_TEMPLATES[genre];
    if (!template) return defaultLabel;
    return template.fieldLabelOverrides[fieldKey] || defaultLabel;
}

/**
 * Applies a genre template to a world: sets world.genreTemplate and optionally merges recommended hidden fields.
 */
export function applyGenreTemplateToWorld(
    world: WorldData,
    genreId: GenreTemplateId,
    applyHiddenDefaults: boolean = false
): WorldData {
    const template = GENRE_TEMPLATES[genreId];
    if (!template) return world;

    let updatedHiddenFields = world.hiddenFields ? { ...world.hiddenFields } : {};
    if (applyHiddenDefaults && template.suggestedHiddenFields) {
        for (const [type, fields] of Object.entries(template.suggestedHiddenFields)) {
            const current = updatedHiddenFields[type as keyof typeof updatedHiddenFields] || [];
            const merged = Array.from(new Set([...current, ...(fields || [])]));
            updatedHiddenFields = {
                ...updatedHiddenFields,
                [type]: merged
            };
        }
    }

    return {
        ...world,
        genreTemplate: genreId,
        hiddenFields: updatedHiddenFields
    };
}
