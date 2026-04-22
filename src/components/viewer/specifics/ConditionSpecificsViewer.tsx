import React from 'react';
import { Condition, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';

interface Props {
    entity: Condition;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
}

export const ConditionSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, isWikiMode }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-2 col-span-full tracking-widest text-[#fef08a] border-b border-slate-800/60 pb-3">Condition Intelligence</h3>
            <FieldRow label="Prominent features" value={entity.features || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Duration" value={entity.duration || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Affliction/Boon/Condition type" value={entity.conditionType || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Ways of attaining" value={entity.meansOfAttaining || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Ways of removing" value={entity.meansOfRemoving || ""} isWikiMode={isWikiMode} />
            <LinksDisplay label="Related Boons" ids={entity.pairedConnectedConditionsPositive || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Related Afflictions" ids={entity.pairedConnectedConditionsNegative || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Related Other conditions" ids={entity.pairedConnectedConditionsOther || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <FieldRow label="Stats/Attributes modifiers" value={entity.statsListRequired || ""} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Myths/Legends/Stories" ids={entity.pairedMyths || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Affecting Characters positively" ids={entity.pairedCharactersPositive || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Affecting Characters negatively" ids={entity.pairedCharactersNegative || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Affecting Characters in other ways" ids={entity.pairedCharactersOther || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Characters" ids={entity.pairedCharactersConnected || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Affecting Locations/Geography positively" ids={entity.pairedLocationsPositive || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Affecting Locations/Geography negatively" ids={entity.pairedLocationsNegative || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Affecting Locations/Geography in other ways" ids={entity.pairedLocationsOther || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Affecting Events positively" ids={entity.pairedEventsPositive || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Affecting Events negatively" ids={entity.pairedEventsNegative || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Affecting Events in other ways" ids={entity.pairedEventsOther || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Affecting Species/Races/Flora/Fauna positively" ids={entity.pairedRacesPositive || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Affecting Species/Races/Flora/Fauna negatively" ids={entity.pairedRacesNegative || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Affecting Species/Races/Flora/Fauna in other ways" ids={entity.pairedRacesOther || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Ideologies/Political groups" ids={entity.pairedRacesPoliticalGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Teachings/Religious groups" ids={entity.pairedReligiousGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Organizations/Other groups" ids={entity.pairedOtherGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Schools of Magic/Magical groups" ids={entity.pairedMagicGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Sciences/Technological groups" ids={entity.pairedTechGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Caused by positive Skills/Spells/Other" ids={entity.pairedSkillsPositive || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Caused by negative Skills/Spells/Other" ids={entity.pairedSkillsNegative || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Caused by neutral/other Skills/Spells/Other" ids={entity.pairedSkillsOther || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Boon caused by Items" ids={entity.pairedItemsPositive || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Affliction caused by Items" ids={entity.pairedItemsNegative || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Other Condition caused by Items" ids={entity.pairedItemsOther || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Affecting the following Items" ids={entity.pairedItemsAfflicting || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Caused by positive Resources/Materials" ids={entity.pairedResourcesPositive || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Caused by negative Resources/Materials" ids={entity.pairedResourcesNegative || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Caused by neutral/other Resources/Materials" ids={entity.pairedResourcesOther || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            </div>
            {entity.description && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Description & History</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.description}</p>
                </div>
            )}
            {entity.traditions && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Traditions & customs connected to the item</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.traditions}</p>
                </div>
            )}
            {entity.spoilerNotes && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Secrets/Spoilers/DM notes</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.spoilerNotes}</p>
                </div>
            )}
        </div>
    );
};
