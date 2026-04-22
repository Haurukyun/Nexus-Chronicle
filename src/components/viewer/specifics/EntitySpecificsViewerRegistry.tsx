import React from 'react';
import { WorldEntity } from '../../../types';
import * as Specifics from './index';

interface RegistryProps {
    entity: WorldEntity;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
}

export const EntitySpecificsViewerRegistry: React.FC<RegistryProps> = ({ entity, allEntities, onNavigate, isWikiMode }) => {
    switch (entity.type) {
        case 'chapter': return <Specifics.ChapterSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'character': return <Specifics.CharacterSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'condition': return <Specifics.ConditionSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'culture': return <Specifics.CultureSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'currency': return <Specifics.CurrencySpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'event': return <Specifics.EventSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'organization': return <Specifics.OrganizationSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'item': return <Specifics.ItemSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'language': return <Specifics.LanguageSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'note': return <Specifics.NoteSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'magic': return <Specifics.MagicSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'myth': return <Specifics.MythSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'political': return <Specifics.PoliticalGroupSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'occupation': return <Specifics.OccupationSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'species': return <Specifics.SpeciesSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'religious': return <Specifics.ReligionSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'resource': return <Specifics.ResourceSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'tech': return <Specifics.TechSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        case 'ability': return <Specifics.AbilitySpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />;
        default: return null;
    }
};
