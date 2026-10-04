import React from 'react';
import { WorldEntity } from '../../../types';
import * as Specifics from './index';

interface RegistryProps {
    entity: WorldEntity;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    backlinks: any;
}

export const EntitySpecificsViewerRegistry: React.FC<RegistryProps> = ({ entity, allEntities, onNavigate, backlinks }) => {
    switch (entity.type) {
        case 'chapter': return <Specifics.ChapterSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'character': return <Specifics.CharacterSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'condition': return <Specifics.ConditionSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'culture': return <Specifics.CultureSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'currency': return <Specifics.CurrencySpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'event': return <Specifics.EventSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'organization': return <Specifics.OrganizationSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'item': return <Specifics.ItemSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'language': return <Specifics.LanguageSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'note': return <Specifics.NoteSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'magic': return <Specifics.MagicSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'myth': return <Specifics.MythSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'political': return <Specifics.PoliticalGroupSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'occupation': return <Specifics.OccupationSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'species': return <Specifics.SpeciesSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'religious': return <Specifics.ReligionSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'resource': return <Specifics.ResourceSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'location': return <Specifics.LocationSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'tech': return <Specifics.TechSpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        case 'ability': return <Specifics.AbilitySpecificsViewer entity={entity as any} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />;
        default: return null;
    }
};
