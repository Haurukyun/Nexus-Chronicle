import React from 'react';
import { WorldEntity, EntityType } from '../../../types';
import {
    ChapterSpecifics, CharacterSpecifics, ConditionSpecifics, CultureSpecifics,
    CurrencySpecifics, EventSpecifics, OrganizationSpecifics, ItemSpecifics,
    LanguageSpecifics, LocationSpecifics, NoteSpecifics, MagicSpecifics,
    MythSpecifics, PoliticalGroupSpecifics, OccupationSpecifics, SpeciesSpecifics,
    ReligionSpecifics, ResourceSpecifics, TechSpecifics, AbilitySpecifics
} from './index';

interface RegistryProps {
    entity: WorldEntity;
    allEntities: WorldEntity[];
    onUpdate: (data: any) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
}

export const EntitySpecificsRegistry: React.FC<RegistryProps> = ({ entity, allEntities, onUpdate, onCreateNew}) => {
    // Character and Location are skipped from this registry since they have extensive custom manual layouts in EntityEditor directly for now,
    // OR we can route them here if we port them over.
    switch (entity.type) {
        case 'chapter': return <ChapterSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'character': return <CharacterSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'condition': return <ConditionSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'culture': return <CultureSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'currency': return <CurrencySpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'event': return <EventSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'organization': return <OrganizationSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'item': return <ItemSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'language': return <LanguageSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'location': return <LocationSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'note': return <NoteSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'magic': return <MagicSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'myth': return <MythSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'political': return <PoliticalGroupSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'occupation': return <OccupationSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'species': return <SpeciesSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'religious': return <ReligionSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'resource': return <ResourceSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'tech': return <TechSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        case 'ability': return <AbilitySpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />;
        default: return null;
    }
};
