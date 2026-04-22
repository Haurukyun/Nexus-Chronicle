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
    isWikiMode: boolean;
}

export const EntitySpecificsRegistry: React.FC<RegistryProps> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    // Character and Location are skipped from this registry since they have extensive custom manual layouts in EntityEditor directly for now,
    // OR we can route them here if we port them over.
    switch (entity.type) {
        case 'chapter': return <ChapterSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'character': return <CharacterSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'condition': return <ConditionSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'culture': return <CultureSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'currency': return <CurrencySpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'event': return <EventSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'organization': return <OrganizationSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'item': return <ItemSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'language': return <LanguageSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'location': return <LocationSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'note': return <NoteSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'magic': return <MagicSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'myth': return <MythSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'political': return <PoliticalGroupSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'occupation': return <OccupationSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'species': return <SpeciesSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'religious': return <ReligionSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'resource': return <ResourceSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'tech': return <TechSpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        case 'ability': return <AbilitySpecifics entity={entity as any} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />;
        default: return null;
    }
};
