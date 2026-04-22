import React from 'react';
import { Item, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { FileText } from 'lucide-react';

interface Props {
    entity: Item;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Item>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const ItemSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <EditorGroup title="Item Specifics" icon={FileText} isWikiMode={isWikiMode}>
            <SmartSelect label="Capable of utilizing Spells/Magic" ids={entity.pairedMagic || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedMagic: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Currencies" ids={entity.pairedCurrencies || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCurrencies: ids })} onCreate={onCreateNew} />
            <FormInput label="Prominent features" value={entity.features || ""} onChange={(v: string) => onUpdate({ ...entity, features: v })} isWikiMode={isWikiMode} />
            <SmartSelect label="Related to other Items" ids={entity.pairedItems || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedItems: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Cultures/Art" ids={entity.relatedCultures || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedCultures: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Involved in Events" ids={entity.pairedEvents || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEvents: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Involved in Myths, legends and stories" ids={entity.pairedMyths || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedMyths: ids })} onCreate={onCreateNew} />
            <FormInput label="Cost in different Currencies" value={entity.priceInCurrencies || ""} onChange={(v: string) => onUpdate({ ...entity, priceInCurrencies: v })} isWikiMode={isWikiMode} />
            <SmartSelect label="Resources/Materials the Item is made of" ids={entity.pairedResourcesMade || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedResourcesMade: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Resources/Materials the Item produces" ids={entity.pairedResourcesProduced || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedResourcesProduced: ids })} onCreate={onCreateNew} />
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
            </div>
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Traditions & customs connected to the item</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traditions || ''} onChange={e => onUpdate({ ...entity, traditions: e.target.value })} />
            </div>
            <FormInput label="Stats/Attributes required" value={entity.statsListRequired || ""} onChange={(v: string) => onUpdate({ ...entity, statsListRequired: v })} isWikiMode={isWikiMode} />
            <FormInput label="Stats/Attributes provided" value={entity.statsList || ""} onChange={(v: string) => onUpdate({ ...entity, statsList: v })} isWikiMode={isWikiMode} />
            <SmartSelect label="Allows for usage of Skills/Spells/Other" ids={entity.pairedSkillsUsing || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkillsUsing: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Commonly used with Skills/Spells/Other" ids={entity.pairedSkillsCommon || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkillsCommon: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Created by Skills/Spells/Other" ids={entity.pairedSkillsCreate || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkillsCreate: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Skills/Spells/Other requiring this Item" ids={entity.pairedSkillsRequire || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkillsRequire: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Causing Boons" ids={entity.pairedConditionsPositive || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsPositive: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Causing Afflictions" ids={entity.pairedConditionsNegative || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsNegative: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Causing Other conditions" ids={entity.pairedConditionsOther || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsOther: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Affected by Afflictions/Boons/Conditions" ids={entity.pairedConditionsAfflicting || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsAfflicting: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Characters" ids={entity.pairedConnectedCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedCharacter: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Locations" ids={entity.pairedConnectedLocations || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedLocations: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Species/Races/Flora/Fauna" ids={entity.pairedConnectedRaces || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedRaces: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to by Occupations/Classes" ids={entity.pairedConnectedProfessions || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedProfessions: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Ideologies/Political groups" ids={entity.pairedConnectedPolGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedPolGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedOtherGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Teachings/Religious groups" ids={entity.pairedConnectedRelGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedRelGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMagicGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Sciences/Technological groups" ids={entity.pairedConnectedTechGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedTechGroups: ids })} onCreate={onCreateNew} />
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Secrets/Spoilers/DM notes</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
            </div>
        </EditorGroup>
    );
};
