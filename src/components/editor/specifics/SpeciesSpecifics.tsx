import React from 'react';
import { Species, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { Anchor, Gem, Globe, Info, Scroll, Sparkles, Tent, Zap } from 'lucide-react';

interface Props {
    entity: Species;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Species>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const SpeciesSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <>
            <EditorGroup title="Connections" icon={Globe} isWikiMode={isWikiMode}>
                <SmartSelect label="Related Species/Races/Flora/Fauna" ids={entity.relatedRaces || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedRaces: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Characters of Species/Races/Flora/Fauna" ids={entity.pairedCharacter || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Inhabited Locations" ids={entity.pairedConnectedPlaces || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedPlaces: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affected by Boons" ids={entity.pairedConditionsPositive || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affected by Afflictions" ids={entity.pairedConditionsNegative || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affected by Other conditions" ids={entity.pairedConditionsOther || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsOther: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="note" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to important Events" ids={entity.connectedEvents || []} type="event" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedEvents: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Details" icon={Scroll} isWikiMode={isWikiMode}>
                <SmartSelect label="Evolved into Species/Races/Flora/Fauna" ids={entity.evolvedIntoRaces || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, evolvedIntoRaces: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Evolved from Species/Races/Flora/Fauna" ids={entity.evolvedFromRaces || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, evolvedFromRaces: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Common Occupations/Classes" ids={entity.commonProfessions || []} type="occupation" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, commonProfessions: ids })} onCreate={onCreateNew} />
                <FormInput label="Strengths" value={entity.strengths || ""} onChange={(v: string) => onUpdate({ ...entity, strengths: v })} isWikiMode={isWikiMode} />
                <FormInput label="Weaknesses" value={entity.weaknesses || ""} onChange={(v: string) => onUpdate({ ...entity, weaknesses: v })} isWikiMode={isWikiMode} />
                <FormInput label="Common names among the Species/Races/Flora/Fauna" value={entity.commonNames || ""} onChange={(v: string) => onUpdate({ ...entity, commonNames: v })} isWikiMode={isWikiMode} />
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                </div>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Secrets/Spoilers/DM notes</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Basic" icon={Info} isWikiMode={isWikiMode}>
                <FormInput label="Estimated population" value={entity.memberCount || ""} onChange={(v: string) => onUpdate({ ...entity, memberCount: v })} isWikiMode={isWikiMode} />
                <FormInput label="Average lifespan" value={entity.age || ""} onChange={(v: string) => onUpdate({ ...entity, age: v })} isWikiMode={isWikiMode} />
                <FormInput label="Average adulthood" value={entity.ageAdult || ""} onChange={(v: string) => onUpdate({ ...entity, ageAdult: v })} isWikiMode={isWikiMode} />
                <FormInput label="Oldest known" value={entity.ageOldest || ""} onChange={(v: string) => onUpdate({ ...entity, ageOldest: v })} isWikiMode={isWikiMode} />
                <FormInput label="Average size" value={entity.height || ""} onChange={(v: string) => onUpdate({ ...entity, height: v })} isWikiMode={isWikiMode} />
                <FormInput label="Average weight" value={entity.weight || ""} onChange={(v: string) => onUpdate({ ...entity, weight: v })} isWikiMode={isWikiMode} />
                <FormInput label="Type of being" value={entity.beingType || ""} onChange={(v: string) => onUpdate({ ...entity, beingType: v })} isWikiMode={isWikiMode} />
                <SmartSelect label="Commonly spoken Languages" ids={entity.localLanguages || []} type="language" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, localLanguages: ids })} onCreate={onCreateNew} />
                <FormInput label="Common Family/Clan names among the Species/Races/Flora/Fauna" value={entity.commonFamilyNames || ""} onChange={(v: string) => onUpdate({ ...entity, commonFamilyNames: v })} isWikiMode={isWikiMode} />
                <SmartSelect label="Connected to Myths, legends and stories" ids={entity.pairedConnectedMyths || []} type="myth" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMyths: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Traits" icon={Sparkles} isWikiMode={isWikiMode}>
                <FormInput label="Level of sapience" value={entity.sentience || ""} onChange={(v: string) => onUpdate({ ...entity, sentience: v })} isWikiMode={isWikiMode} />
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Defining Features & Traits</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traits || ''} onChange={e => onUpdate({ ...entity, traits: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Traditions" icon={Tent} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Culture/Art" ids={entity.relatedCultures || []} type="culture" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedCultures: ids })} onCreate={onCreateNew} />
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Traditions & Customs</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traditions || ''} onChange={e => onUpdate({ ...entity, traditions: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Possessions" icon={Gem} isWikiMode={isWikiMode}>
                <SmartSelect label="Commonly used Currencies" ids={entity.localCurrencies || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, localCurrencies: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Resources/Materials produced from the Species/Race/Flora/Fauna" ids={entity.pairedProducedFromResources || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedProducedFromResources: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Resources/Materials used by Species/Race/Flora/Fauna" ids={entity.pairedUsedResourcesResources || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedUsedResourcesResources: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Items" ids={entity.pairedConnectedItems || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedItems: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Resources/Materials" ids={entity.pairedConnectedResources || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedResources: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Stats" icon={Zap} isWikiMode={isWikiMode}>
                <SmartSelect label="Common Skills/Spells/Other" ids={entity.pairedSkills || []} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkills: ids })} onCreate={onCreateNew} />
                <FormInput label="Stats/Attributes" value={entity.statsList || ""} onChange={(v: string) => onUpdate({ ...entity, statsList: v })} isWikiMode={isWikiMode} />
            </EditorGroup>
            <EditorGroup title="Governance" icon={Anchor} isWikiMode={isWikiMode}>
                <SmartSelect label="Common in Ideologies/Political groups" ids={entity.commonInPoliticalGroups || []} type="political" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, commonInPoliticalGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Common in Organizations/Other groups" ids={entity.commonInOtherGroups || []} type="organization" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, commonInOtherGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Common in Teachings/Religious groups" ids={entity.commonInReligiousGroups || []} type="religious" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, commonInReligiousGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Common in Magical groups" ids={entity.commonInMagicGroups || []} type="magic" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, commonInMagicGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Common in Sciencific/Technological groups" ids={entity.commonInTechGroups || []} type="tech" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, commonInTechGroups: ids })} onCreate={onCreateNew} />
            </EditorGroup>
        </>
    );
};
