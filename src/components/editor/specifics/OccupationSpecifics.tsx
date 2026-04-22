import React from 'react';
import { Occupation, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { Anchor, Gem, Globe, Info, Scroll, Sparkles, Tent, Zap } from 'lucide-react';

interface Props {
    entity: Occupation;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Occupation>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const OccupationSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <>
            <EditorGroup title="Details" icon={Scroll} isWikiMode={isWikiMode}>
                <FormInput label="Titles & Ranks" value={entity.titles || ""} onChange={(v: string) => onUpdate({ ...entity, titles: v })} isWikiMode={isWikiMode} />
                <SmartSelect label="Common Species/Races/Flora/Fauna" ids={entity.commonRaces || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, commonRaces: ids })} onCreate={onCreateNew} />
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                </div>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Secrets/Spoilers/DM notes</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Traits" icon={Sparkles} isWikiMode={isWikiMode}>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Prominent features</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.features || ''} onChange={e => onUpdate({ ...entity, features: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Basic" icon={Info} isWikiMode={isWikiMode}>
                <FormInput label="Occupation/Class type" value={entity.professionType || ""} onChange={(v: string) => onUpdate({ ...entity, professionType: v })} isWikiMode={isWikiMode} />
                <SmartSelect label="Connected to Myths/Legends/Stories" ids={entity.pairedMyths || []} type="myth" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedMyths: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Languages" ids={entity.localLanguages || []} type="language" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, localLanguages: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Connections" icon={Globe} isWikiMode={isWikiMode}>
                <SmartSelect label="Related Occupations/Classes" ids={entity.relatedProfessions || []} type="occupation" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedProfessions: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Characters of the Occupation/Class" ids={entity.pairedCharacter || []} type="occupation" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="note" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Locations/Geography" ids={entity.connectedLocations || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedLocations: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} type="organization" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedOtherGroups: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Traditions" icon={Tent} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Cultures/Art" ids={entity.relatedCultures || []} type="culture" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedCultures: ids })} onCreate={onCreateNew} />
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Traditions & customs connected to the item</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traditions || ''} onChange={e => onUpdate({ ...entity, traditions: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Stats" icon={Zap} isWikiMode={isWikiMode}>
                <FormInput label="Commonly used Skills/Spells/Other" value={entity.pairedUsedSkills || ""} onChange={(v: string) => onUpdate({ ...entity, pairedUsedSkills: v })} isWikiMode={isWikiMode} />
                <FormInput label="Stats/Attributes" value={entity.statsList || ""} onChange={(v: string) => onUpdate({ ...entity, statsList: v })} isWikiMode={isWikiMode} />
                <SmartSelect label="Connected to Skills/Spells/Other" ids={entity.pairedConnectedSkills || []} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedSkills: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Possessions" icon={Gem} isWikiMode={isWikiMode}>
                <FormInput label="Commonly used Items" value={entity.pairedUsedItems || ""} onChange={(v: string) => onUpdate({ ...entity, pairedUsedItems: v })} isWikiMode={isWikiMode} />
                <SmartSelect label="Used Resources/Materials" ids={entity.usedResources || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, usedResources: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Produced Resources/Materials" ids={entity.producedResources || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, producedResources: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Items" ids={entity.pairedConnectedItems || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedItems: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Governance" icon={Anchor} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Ideologies/Political groups" ids={entity.pairedConnectedPolGroups || []} type="political" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedPolGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Teachings/Religious groups" ids={entity.pairedConnectedReligiousGroups || []} type="religious" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedReligiousGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicGroups || []} type="magic" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMagicGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Sciences/Technological groups" ids={entity.pairedConnectedTechGroups || []} type="tech" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedTechGroups: ids })} onCreate={onCreateNew} />
            </EditorGroup>
        </>
    );
};
