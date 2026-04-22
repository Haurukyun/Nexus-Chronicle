import React from 'react';
import { Ability, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { Anchor, Gem, Globe, Info, Scroll, Sparkles, Tent, Zap } from 'lucide-react';

interface Props {
    entity: Ability;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Ability>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const AbilitySpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <>
            <EditorGroup title="Stats" icon={Zap} isWikiMode={isWikiMode}>
                <FormInput label="Stats/Attributes required" value={entity.statsListRequired || ""} onChange={(v: string) => onUpdate({ ...entity, statsListRequired: v })} isWikiMode={isWikiMode} />
                <FormInput label="Stats/Attributes provided" value={entity.statsListProvided || ""} onChange={(v: string) => onUpdate({ ...entity, statsListProvided: v })} isWikiMode={isWikiMode} />
                <FormInput label="Complexity to use" value={entity.levelSkill || ""} onChange={(v: string) => onUpdate({ ...entity, levelSkill: v })} isWikiMode={isWikiMode} />
                <SmartSelect label="Related Skills/Spells/Other" ids={entity.pairedSkills || []} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkills: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Prerequisites Skills/Spells/Other" ids={entity.prerequisiteSkills || []} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, prerequisiteSkills: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Required by Skills/Spells/Other" ids={entity.postrequisiteSkills || []} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, postrequisiteSkills: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Items capable of using this Skills/Spells/Other" ids={entity.pairedItemsUsing || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedItemsUsing: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Characters" ids={entity.pairedCharacterSkills || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCharacterSkills: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Locations/Geography" ids={entity.pairedLocationsSkills || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedLocationsSkills: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Species/Races/Flora/Fauna" ids={entity.pairedRacesSkills || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedRacesSkills: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Skills/Other connected to Events" ids={entity.pairedEventSkills || []} type="event" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEventSkills: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Spells connected to Events" ids={entity.pairedEventSpells || []} type="event" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEventSpells: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Organizations/Other groups" ids={entity.pairedOtherGroupsSkills || []} type="organization" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedOtherGroupsSkills: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Traits" icon={Sparkles} isWikiMode={isWikiMode}>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Unique/Defining Features</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traits || ''} onChange={e => onUpdate({ ...entity, traits: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Basic" icon={Info} isWikiMode={isWikiMode}>
                <FormInput label="Type" value={entity.typeSkill || ""} onChange={(v: string) => onUpdate({ ...entity, typeSkill: v })} isWikiMode={isWikiMode} />
                <SmartSelect label="Connected to Myths/Legends/Stories" ids={entity.pairedMyths || []} type="myth" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedMyths: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Possessions" icon={Gem} isWikiMode={isWikiMode}>
                <SmartSelect label="Commonly used with Items" ids={entity.pairedItemsCommon || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedItemsCommon: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Required Items" ids={entity.pairedItemsRequire || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedItemsRequire: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Created Items" ids={entity.pairedItemsCreate || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedItemsCreate: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Required Resources/Materials" ids={entity.pairedResourcesRequire || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedResourcesRequire: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Created Resources/Materials" ids={entity.pairedResourcesCreate || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedResourcesCreate: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Connections" icon={Globe} isWikiMode={isWikiMode}>
                <SmartSelect label="Commonly used by Occupations/Classes" ids={entity.pairedConnectedProfessions || []} type="occupation" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedProfessions: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Causing following Boons" ids={entity.pairedConditionsPositive || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Causing following Afflictions" ids={entity.pairedConditionsNegative || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Causing following Other conditions" ids={entity.pairedConditionsOther || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsOther: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="note" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Traditions" icon={Tent} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Cultures/Art" ids={entity.relatedCultures || []} type="culture" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedCultures: ids })} onCreate={onCreateNew} />
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Traditions & customs connected to the Skill/Spell/other</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traditions || ''} onChange={e => onUpdate({ ...entity, traditions: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Details" icon={Scroll} isWikiMode={isWikiMode}>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                </div>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Secrets/Spoilers/DM notes</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Governance" icon={Anchor} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Ideologies/Political groups" ids={entity.pairedPoliticalGroupsSkills || []} type="political" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedPoliticalGroupsSkills: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Teachings/Religious groups" ids={entity.pairedReligiousGroupsSkills || []} type="religious" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedReligiousGroupsSkills: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Schools of Magic/Magical groups" ids={entity.pairedMagicGroupsSkills || []} type="magic" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedMagicGroupsSkills: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Sciences/Technological groups" ids={entity.pairedTechGroupsSkills || []} type="tech" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedTechGroupsSkills: ids })} onCreate={onCreateNew} />
            </EditorGroup>
        </>
    );
};
