import { Library, Globe, Swords, Scroll } from 'lucide-react';
import { EntityType } from './types';

export const TYPE_LABELS: Record<EntityType, string> = {
    chapter: 'Chapters',
    note: 'Lore Notes',
    myth: 'Myths/Legends',
    character: 'Characters',
    location: 'Locations',
    event: 'Events',
    species: 'Species/Races',
    language: 'Languages',
    culture: 'Cultures/Arts',
    political: 'Political Groups',
    religious: 'Religious Groups',
    organization: 'Organizations',
    magic: 'Magical Groups',
    science: 'Technological Groups',
    ability: 'Skills/Spells',
    item: 'Items',
    occupation: 'Occupations',
    condition: 'Conditions',
    resource: 'Materials'
};

export const HIERARCHY_CONFIG = [
    { id: 'story', label: 'Story/Lore', icon: Library, types: ['chapter', 'note', 'myth'] as EntityType[] },
    { id: 'world', label: 'World', icon: Globe, types: ['character', 'location', 'event', 'species', 'language', 'culture'] as EntityType[] },
    { id: 'groups', label: 'Groups/Teachings', icon: Swords, types: ['political', 'religious', 'organization', 'magic', 'science'] as EntityType[] },
    { id: 'details', label: 'Details', icon: Scroll, types: ['ability', 'item', 'occupation', 'condition', 'resource'] as EntityType[] }
];
