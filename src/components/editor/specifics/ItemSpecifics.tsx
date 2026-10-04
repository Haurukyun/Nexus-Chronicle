import React from 'react';
import { Item, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { useTheme } from '../../../theme';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { Anchor, Gem, Globe, Info, Scroll, Sparkles, Tent, Zap } from 'lucide-react';

interface Props {
    entity: Item;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Item>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
}

export const ItemSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew }) => {
    const { layoutMode, themeId } = useTheme();
    return (
        <>
            <EditorGroup title="Governance" icon={Anchor}>
                <SmartSelect label="Capable of utilizing Spells/Magic" ids={entity.pairedMagic || []} type="magic" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedMagic: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Ideologies/Political groups" ids={entity.pairedConnectedPolGroups || []} type="political" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedPolGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Teachings/Religious groups" ids={entity.pairedConnectedRelGroups || []} type="religious" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedRelGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicGroups || []} type="magic" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMagicGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Sciences/Technological groups" ids={entity.pairedConnectedTechGroups || []} type="tech" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedTechGroups: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Possessions" icon={Gem}>
                <SmartSelect label="Connected to Currencies" ids={entity.pairedCurrencies || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedCurrencies: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Related to other Items" ids={entity.pairedItems || []} type="item" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedItems: ids })} onCreate={onCreateNew} />
                <FormInput label="Cost in different Currencies" value={entity.priceInCurrencies || ""} onChange={(v: string) => onUpdate({ ...entity, priceInCurrencies: v })} />
                <SmartSelect label="Resources/Materials the Item is made of" ids={entity.pairedResourcesMade || []} type="item" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedResourcesMade: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Resources/Materials the Item produces" ids={entity.pairedResourcesProduced || []} type="item" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedResourcesProduced: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Traits" icon={Sparkles}>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Prominent features</label>
                    <textarea className={`w-full ${(layoutMode === 'wiki') ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.features || ''} onChange={e => onUpdate({ ...entity, features: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Traditions" icon={Tent}>
                <SmartSelect label="Connected to Cultures/Art" ids={entity.relatedCultures || []} type="culture" all={allEntities} onChange={(ids) => onUpdate({ ...entity, relatedCultures: ids })} onCreate={onCreateNew} />
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Traditions & customs connected to the item</label>
                    <textarea className={`w-full ${(layoutMode === 'wiki') ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traditions || ''} onChange={e => onUpdate({ ...entity, traditions: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Connections" icon={Globe}>
                <SmartSelect label="Involved in Events" ids={entity.pairedEvents || []} type="event" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedEvents: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Causing Boons" ids={entity.pairedConditionsPositive || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConditionsPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Causing Afflictions" ids={entity.pairedConditionsNegative || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConditionsNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Causing Other conditions" ids={entity.pairedConditionsOther || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConditionsOther: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affected by Afflictions/Boons/Conditions" ids={entity.pairedConditionsAfflicting || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConditionsAfflicting: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="note" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Characters" ids={entity.pairedConnectedCharacter || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Locations" ids={entity.pairedConnectedLocations || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedLocations: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Species/Races/Flora/Fauna" ids={entity.pairedConnectedRaces || []} type="species" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedRaces: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to by Occupations/Classes" ids={entity.pairedConnectedProfessions || []} type="occupation" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedProfessions: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} type="organization" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedOtherGroups: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Basic" icon={Info}>
                <SmartSelect label="Involved in Myths, legends and stories" ids={entity.pairedMyths || []} type="myth" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedMyths: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Allows for usage of Skills/Spells/Other" ids={entity.pairedSkillsUsing || []} type="ability" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedSkillsUsing: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Details" icon={Scroll}>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                    <textarea className={`w-full ${(layoutMode === 'wiki') ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                </div>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Secrets/Spoilers/DM notes</label>
                    <textarea className={`w-full ${(layoutMode === 'wiki') ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Stats" icon={Zap}>
                <FormInput label="Stats/Attributes required" value={entity.statsListRequired || ""} onChange={(v: string) => onUpdate({ ...entity, statsListRequired: v })} />
                <FormInput label="Stats/Attributes provided" value={entity.statsList || ""} onChange={(v: string) => onUpdate({ ...entity, statsList: v })} />
                <SmartSelect label="Commonly used with Skills/Spells/Other" ids={entity.pairedSkillsCommon || []} type="ability" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedSkillsCommon: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Created by Skills/Spells/Other" ids={entity.pairedSkillsCreate || []} type="ability" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedSkillsCreate: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Skills/Spells/Other requiring this Item" ids={entity.pairedSkillsRequire || []} type="item" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedSkillsRequire: ids })} onCreate={onCreateNew} />
            </EditorGroup>
        </>
    );
};
