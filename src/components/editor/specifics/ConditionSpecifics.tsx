import React from 'react';
import { Condition, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { useTheme } from '../../../theme';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { Anchor, Gem, Globe, Info, Scroll, Sparkles, Tent, Zap } from 'lucide-react';

interface Props {
    entity: Condition;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Condition>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
}

export const ConditionSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew }) => {
    const { layoutMode, themeId } = useTheme();
    const isWiki = layoutMode === 'wiki';
    const isRoyal = themeId === 'royal-codex';

    const textareaClass = isRoyal
        ? 'w-full bg-[#fbf8ef] border border-[#c8a96e]/60 rounded-xl px-4 py-3 outline-none resize-none text-sm shadow-inner text-[#2b1810] font-serif focus:ring-1 focus:ring-[#70121e]'
        : isWiki
            ? 'w-full bg-white border border-[#d4c8af] rounded-xl px-4 py-3 outline-none resize-none text-sm shadow-sm'
            : 'w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-3 outline-none resize-none text-sm shadow-sm';

    const labelClass = `text-[10px] uppercase tracking-widest pl-1 mb-1 block ${
        isRoyal ? 'text-[#451a03] font-serif font-bold' : isWiki ? 'text-[#854d0e] font-black' : 'text-slate-500 font-black'
    }`;
    return (
        <>
            <EditorGroup title="Traits" icon={Sparkles}>
                <div className="lg:col-span-3">
                    <label className={labelClass}>Prominent features</label>
                    <textarea className={`${textareaClass} h-32`} value={entity.features || ''} onChange={e => onUpdate({ ...entity, features: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Details" icon={Scroll}>
                <FormInput label="Duration" value={entity.duration || ""} onChange={(v: string) => onUpdate({ ...entity, duration: v })} />
                <FormInput label="Ways of attaining" value={entity.meansOfAttaining || ""} onChange={(v: string) => onUpdate({ ...entity, meansOfAttaining: v })} />
                <FormInput label="Ways of removing" value={entity.meansOfRemoving || ""} onChange={(v: string) => onUpdate({ ...entity, meansOfRemoving: v })} />
                <div className="lg:col-span-3">
                    <label className={labelClass}>Description & History</label>
                    <textarea className={`${textareaClass} h-32`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                </div>
                <div className="lg:col-span-3">
                    <label className={labelClass}>Secrets/Spoilers/DM notes</label>
                    <textarea className={`${textareaClass} h-32`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Basic" icon={Info}>
                <FormInput label="Affliction/Boon/Condition type" value={entity.conditionType || ""} onChange={(v: string) => onUpdate({ ...entity, conditionType: v })} />
                <SmartSelect label="Connected to Myths/Legends/Stories" ids={entity.pairedMyths || []} type="myth" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedMyths: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Connections" icon={Globe}>
                <SmartSelect label="Related Boons" ids={entity.pairedConnectedConditionsPositive || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedConditionsPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Related Afflictions" ids={entity.pairedConnectedConditionsNegative || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedConditionsNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Related Other conditions" ids={entity.pairedConnectedConditionsOther || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedConditionsOther: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="note" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Characters positively" ids={entity.pairedCharactersPositive || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedCharactersPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Characters negatively" ids={entity.pairedCharactersNegative || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedCharactersNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Characters in other ways" ids={entity.pairedCharactersOther || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedCharactersOther: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Characters" ids={entity.pairedCharactersConnected || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedCharactersConnected: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Locations/Geography positively" ids={entity.pairedLocationsPositive || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedLocationsPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Locations/Geography negatively" ids={entity.pairedLocationsNegative || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedLocationsNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Locations/Geography in other ways" ids={entity.pairedLocationsOther || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedLocationsOther: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Events positively" ids={entity.pairedEventsPositive || []} type="event" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedEventsPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Events negatively" ids={entity.pairedEventsNegative || []} type="event" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedEventsNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Events in other ways" ids={entity.pairedEventsOther || []} type="event" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedEventsOther: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Species/Races/Flora/Fauna positively" ids={entity.pairedRacesPositive || []} type="species" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedRacesPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Species/Races/Flora/Fauna negatively" ids={entity.pairedRacesNegative || []} type="species" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedRacesNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting Species/Races/Flora/Fauna in other ways" ids={entity.pairedRacesOther || []} type="species" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedRacesOther: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Organizations/Other groups" ids={entity.pairedOtherGroups || []} type="organization" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedOtherGroups: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Stats" icon={Zap}>
                <FormInput label="Stats/Attributes modifiers" value={entity.statsListRequired || ""} onChange={(v: string) => onUpdate({ ...entity, statsListRequired: v })} />
                <SmartSelect label="Caused by positive Skills/Spells/Other" ids={entity.pairedSkillsPositive || []} type="ability" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedSkillsPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Caused by negative Skills/Spells/Other" ids={entity.pairedSkillsNegative || []} type="ability" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedSkillsNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Caused by neutral/other Skills/Spells/Other" ids={entity.pairedSkillsOther || []} type="ability" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedSkillsOther: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Traditions" icon={Tent}>
                <div className="lg:col-span-3">
                    <label className={labelClass}>Traditions & customs connected to the item</label>
                    <textarea className={`${textareaClass} h-32`} value={entity.traditions || ''} onChange={e => onUpdate({ ...entity, traditions: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Governance" icon={Anchor}>
                <SmartSelect label="Connected to Ideologies/Political groups" ids={entity.pairedRacesPoliticalGroups || []} type="political" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedRacesPoliticalGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Teachings/Religious groups" ids={entity.pairedReligiousGroups || []} type="religious" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedReligiousGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Schools of Magic/Magical groups" ids={entity.pairedMagicGroups || []} type="magic" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedMagicGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Sciences/Technological groups" ids={entity.pairedTechGroups || []} type="tech" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedTechGroups: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Possessions" icon={Gem}>
                <SmartSelect label="Boon caused by Items" ids={entity.pairedItemsPositive || []} type="item" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedItemsPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affliction caused by Items" ids={entity.pairedItemsNegative || []} type="item" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedItemsNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Other Condition caused by Items" ids={entity.pairedItemsOther || []} type="item" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedItemsOther: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affecting the following Items" ids={entity.pairedItemsAfflicting || []} type="item" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedItemsAfflicting: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Caused by positive Resources/Materials" ids={entity.pairedResourcesPositive || []} type="resource" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedResourcesPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Caused by negative Resources/Materials" ids={entity.pairedResourcesNegative || []} type="resource" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedResourcesNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Caused by neutral/other Resources/Materials" ids={entity.pairedResourcesOther || []} type="resource" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedResourcesOther: ids })} onCreate={onCreateNew} />
            </EditorGroup>
        </>
    );
};
