import React from 'react';
import { Condition, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { Anchor, Gem, Globe, Info, Scroll, Sparkles, Tent, Zap } from 'lucide-react';

interface Props {
    entity: Condition;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Condition>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const ConditionSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <>
            <EditorGroup title="Traits" icon={Sparkles} isWikiMode={isWikiMode}>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Prominent features</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.features || ''} onChange={e => onUpdate({ ...entity, features: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Details" icon={Scroll} isWikiMode={isWikiMode}>
                <FormInput label="Duration" value={entity.duration || ""} onChange={(v: string) => onUpdate({ ...entity, duration: v })} isWikiMode={isWikiMode} />
                <FormInput label="Ways of attaining" value={entity.meansOfAttaining || ""} onChange={(v: string) => onUpdate({ ...entity, meansOfAttaining: v })} isWikiMode={isWikiMode} />
                <FormInput label="Ways of removing" value={entity.meansOfRemoving || ""} onChange={(v: string) => onUpdate({ ...entity, meansOfRemoving: v })} isWikiMode={isWikiMode} />
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
                <FormInput label="Affliction/Boon/Condition type" value={entity.conditionType || ""} onChange={(v: string) => onUpdate({ ...entity, conditionType: v })} isWikiMode={isWikiMode} />
                <SmartSelect label="Connected to Myths/Legends/Stories" ids={entity.pairedMyths || []} type="myth" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedMyths: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Connections" icon={Globe} isWikiMode={isWikiMode}>
                <SmartSelect label="Related Boons" ids={entity.pairedConnectedConditionsPositive || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedConditionsPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Related Afflictions" ids={entity.pairedConnectedConditionsNegative || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedConditionsNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Related Other conditions" ids={entity.pairedConnectedConditionsOther || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedConditionsOther: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="note" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Characters positively" ids={entity.pairedCharactersPositive || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCharactersPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Characters negatively" ids={entity.pairedCharactersNegative || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCharactersNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Characters in other ways" ids={entity.pairedCharactersOther || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCharactersOther: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Characters" ids={entity.pairedCharactersConnected || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCharactersConnected: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Locations/Geography positively" ids={entity.pairedLocationsPositive || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedLocationsPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Locations/Geography negatively" ids={entity.pairedLocationsNegative || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedLocationsNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Locations/Geography in other ways" ids={entity.pairedLocationsOther || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedLocationsOther: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Events positively" ids={entity.pairedEventsPositive || []} type="event" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEventsPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Events negatively" ids={entity.pairedEventsNegative || []} type="event" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEventsNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Events in other ways" ids={entity.pairedEventsOther || []} type="event" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEventsOther: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Species/Races/Flora/Fauna positively" ids={entity.pairedRacesPositive || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedRacesPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Species/Races/Flora/Fauna negatively" ids={entity.pairedRacesNegative || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedRacesNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Species/Races/Flora/Fauna in other ways" ids={entity.pairedRacesOther || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedRacesOther: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Organizations/Other groups" ids={entity.pairedOtherGroups || []} type="organization" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedOtherGroups: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Stats" icon={Zap} isWikiMode={isWikiMode}>
                <FormInput label="Stats/Attributes modifiers" value={entity.statsListRequired || ""} onChange={(v: string) => onUpdate({ ...entity, statsListRequired: v })} isWikiMode={isWikiMode} />
                <SmartSelect label="Caused by positive Skills/Spells/Other" ids={entity.pairedSkillsPositive || []} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkillsPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Caused by negative Skills/Spells/Other" ids={entity.pairedSkillsNegative || []} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkillsNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Caused by neutral/other Skills/Spells/Other" ids={entity.pairedSkillsOther || []} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkillsOther: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Traditions" icon={Tent} isWikiMode={isWikiMode}>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Traditions & customs connected to the item</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traditions || ''} onChange={e => onUpdate({ ...entity, traditions: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Governance" icon={Anchor} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Ideologies/Political groups" ids={entity.pairedRacesPoliticalGroups || []} type="political" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedRacesPoliticalGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Teachings/Religious groups" ids={entity.pairedReligiousGroups || []} type="religious" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedReligiousGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Schools of Magic/Magical groups" ids={entity.pairedMagicGroups || []} type="magic" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedMagicGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Sciences/Technological groups" ids={entity.pairedTechGroups || []} type="tech" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedTechGroups: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Possessions" icon={Gem} isWikiMode={isWikiMode}>
                <SmartSelect label="Boon caused by Items" ids={entity.pairedItemsPositive || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedItemsPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affliction caused by Items" ids={entity.pairedItemsNegative || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedItemsNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Other Condition caused by Items" ids={entity.pairedItemsOther || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedItemsOther: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting the following Items" ids={entity.pairedItemsAfflicting || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedItemsAfflicting: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Caused by positive Resources/Materials" ids={entity.pairedResourcesPositive || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedResourcesPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Caused by negative Resources/Materials" ids={entity.pairedResourcesNegative || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedResourcesNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Caused by neutral/other Resources/Materials" ids={entity.pairedResourcesOther || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedResourcesOther: ids })} onCreate={onCreateNew} />
            </EditorGroup>
        </>
    );
};
