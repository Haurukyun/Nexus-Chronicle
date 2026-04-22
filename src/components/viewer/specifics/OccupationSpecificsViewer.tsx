import React from 'react';
import { Occupation, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';

interface Props {
    entity: Occupation;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
}

export const OccupationSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, isWikiMode }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-2 col-span-full tracking-widest text-[#fef08a] border-b border-slate-800/60 pb-3">Occupation Intelligence</h3>
            <FieldRow label="Titles & Ranks" value={entity.titles || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Prominent features" value={entity.features || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Occupation/Class type" value={entity.professionType || ""} isWikiMode={isWikiMode} />
            <LinksDisplay label="Related Occupations/Classes" ids={entity.relatedProfessions || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Characters of the Occupation/Class" ids={entity.pairedCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Cultures/Art" ids={entity.relatedCultures || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <FieldRow label="Commonly used Skills/Spells/Other" value={entity.pairedUsedSkills || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Commonly used Items" value={entity.pairedUsedItems || ""} isWikiMode={isWikiMode} />
            <LinksDisplay label="Common Species/Races/Flora/Fauna" ids={entity.commonRaces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Used Resources/Materials" ids={entity.usedResources || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Produced Resources/Materials" ids={entity.producedResources || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <FieldRow label="Stats/Attributes" value={entity.statsList || ""} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Myths/Legends/Stories" ids={entity.pairedMyths || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Locations/Geography" ids={entity.connectedLocations || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Languages" ids={entity.localLanguages || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Ideologies/Political groups" ids={entity.pairedConnectedPolGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Teachings/Religious groups" ids={entity.pairedConnectedReligiousGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Sciences/Technological groups" ids={entity.pairedConnectedTechGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Skills/Spells/Other" ids={entity.pairedConnectedSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Items" ids={entity.pairedConnectedItems || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
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
