import React from 'react';
import { Species, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';

interface Props {
    entity: Species;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
    backlinks?: any;
}

export const SpeciesSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, isWikiMode, backlinks }) => {
    return (
        <div className="space-y-8">
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Connections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Strengths" value={entity.strengths} isWikiMode={isWikiMode} />
                    <FieldRow label="Weaknesses" value={entity.weaknesses} isWikiMode={isWikiMode} />
                    <FieldRow label="Common names among the Species/Races/Flora/Fauna" value={entity.commonNames} isWikiMode={isWikiMode} />
                    <FieldRow label="Description & History" value={entity.description} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Related Species/Races/Flora/Fauna" ids={entity.relatedRaces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Evolved into Species/Races/Flora/Fauna" ids={entity.evolvedIntoRaces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Evolved from Species/Races/Flora/Fauna" ids={entity.evolvedFromRaces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Characters of Species/Races/Flora/Fauna" ids={entity.pairedCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Inhabited Locations" ids={entity.pairedConnectedPlaces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Common Occupations/Classes" ids={entity.commonProfessions || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Affected by Boons" ids={entity.pairedConditionsPositive || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Affected by Afflictions" ids={entity.pairedConditionsNegative || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Affected by Other conditions" ids={entity.pairedConditionsOther || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to important Events" ids={entity.connectedEvents || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Vital Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Estimated population" value={entity.memberCount} isWikiMode={isWikiMode} />
                    <FieldRow label="Average lifespan" value={entity.age} isWikiMode={isWikiMode} />
                    <FieldRow label="Average adulthood" value={entity.ageAdult} isWikiMode={isWikiMode} />
                    <FieldRow label="Oldest known" value={entity.ageOldest} isWikiMode={isWikiMode} />
                    <FieldRow label="Average size" value={entity.height} isWikiMode={isWikiMode} />
                    <FieldRow label="Average weight" value={entity.weight} isWikiMode={isWikiMode} />
                    <FieldRow label="Type of being" value={entity.beingType} isWikiMode={isWikiMode} />
                    <FieldRow label="Common Family/Clan names among the Species/Races/Flora/Fauna" value={entity.commonFamilyNames} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Commonly spoken Languages" ids={entity.localLanguages || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Myths, legends and stories" ids={entity.pairedConnectedMyths || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            {entity.traits && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Defining Features & Traits</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.traits}</p>
                </div>
            )}
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Traits & Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Level of sapience" value={entity.sentience} isWikiMode={isWikiMode} />
                </div>
            </div>
            {entity.traditions && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Traditions & Customs</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.traditions}</p>
                </div>
            )}
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Traditions & Customs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-2">
                        <LinksDisplay label="Connected to Culture/Art" ids={entity.relatedCultures || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Inventory & Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Commonly used Currencies" ids={entity.localCurrencies || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Resources/Materials produced from the Species/Race/Flora/Fauna" ids={entity.pairedProducedFromResources || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Resources/Materials used by Species/Race/Flora/Fauna" ids={entity.pairedUsedResourcesResources || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Items" ids={entity.pairedConnectedItems || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Resources/Materials" ids={entity.pairedConnectedResources || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Stats & Knowledge</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Stats/Attributes" value={entity.statsList} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Common Skills/Spells/Other" ids={entity.pairedSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Governance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Common in Ideologies/Political groups" ids={entity.commonInPoliticalGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Common in Organizations/Other groups" ids={entity.commonInOtherGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Common in Teachings/Religious groups" ids={entity.commonInReligiousGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Common in Magical groups" ids={entity.commonInMagicGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Common in Sciencific/Technological groups" ids={entity.commonInTechGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
        </div>
    );
};
