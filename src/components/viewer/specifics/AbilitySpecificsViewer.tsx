import React from 'react';
import { Ability, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';

interface Props {
    entity: Ability;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
    backlinks?: any;
}

export const AbilitySpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, isWikiMode, backlinks }) => {
    return (
        <div className="space-y-8">
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Stats & Knowledge</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Stats/Attributes required" value={entity.statsListRequired} isWikiMode={isWikiMode} />
                    <FieldRow label="Stats/Attributes provided" value={entity.statsListProvided} isWikiMode={isWikiMode} />
                    <FieldRow label="Complexity to use" value={entity.levelSkill} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Related Skills/Spells/Other" ids={entity.pairedSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Prerequisites Skills/Spells/Other" ids={entity.prerequisiteSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Required by Skills/Spells/Other" ids={entity.postrequisiteSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Items capable of using this Skills/Spells/Other" ids={entity.pairedItemsUsing || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Characters" ids={entity.pairedCharacterSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Locations/Geography" ids={entity.pairedLocationsSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Species/Races/Flora/Fauna" ids={entity.pairedRacesSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Skills/Other connected to Events" ids={entity.pairedEventSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Spells connected to Events" ids={entity.pairedEventSpells || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Organizations/Other groups" ids={entity.pairedOtherGroupsSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            {entity.traits && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Unique/Defining Features</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.traits}</p>
                </div>
            )}
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Vital Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Type" value={entity.typeSkill} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Myths/Legends/Stories" ids={entity.pairedMyths || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Inventory & Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Commonly used with Items" ids={entity.pairedItemsCommon || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Required Items" ids={entity.pairedItemsRequire || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Created Items" ids={entity.pairedItemsCreate || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Required Resources/Materials" ids={entity.pairedResourcesRequire || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Created Resources/Materials" ids={entity.pairedResourcesCreate || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Connections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Description & History" value={entity.description} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Commonly used by Occupations/Classes" ids={entity.pairedConnectedProfessions || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Causing following Boons" ids={entity.pairedConditionsPositive || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Causing following Afflictions" ids={entity.pairedConditionsNegative || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Causing following Other conditions" ids={entity.pairedConditionsOther || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            {entity.traditions && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Traditions & customs connected to the Skill/Spell/other</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.traditions}</p>
                </div>
            )}
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Traditions & Customs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-2">
                        <LinksDisplay label="Connected to Cultures/Art" ids={entity.relatedCultures || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Governance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Ideologies/Political groups" ids={entity.pairedPoliticalGroupsSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Teachings/Religious groups" ids={entity.pairedReligiousGroupsSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Schools of Magic/Magical groups" ids={entity.pairedMagicGroupsSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Sciences/Technological groups" ids={entity.pairedTechGroupsSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
        </div>
    );
};
