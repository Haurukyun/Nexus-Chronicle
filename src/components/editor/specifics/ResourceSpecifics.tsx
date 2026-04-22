import React from 'react';
import { Resource, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { FileText } from 'lucide-react';

interface Props {
    entity: Resource;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Resource>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const ResourceSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <EditorGroup title="Resource Specifics" icon={FileText} isWikiMode={isWikiMode}>
            <FormInput label="Prominent features" value={entity.features || ""} onChange={(v: string) => onUpdate({ ...entity, features: v })} isWikiMode={isWikiMode} />
            <FormInput label="Price in Currencies" value={entity.priceCurrencies || ""} onChange={(v: string) => onUpdate({ ...entity, priceCurrencies: v })} isWikiMode={isWikiMode} />
            <FormInput label="Density" value={entity.density || ""} onChange={(v: string) => onUpdate({ ...entity, density: v })} isWikiMode={isWikiMode} />
            <FormInput label="Hardness" value={entity.hardness || ""} onChange={(v: string) => onUpdate({ ...entity, hardness: v })} isWikiMode={isWikiMode} />
            <FormInput label="Found in biomes" value={entity.biomeType || ""} onChange={(v: string) => onUpdate({ ...entity, biomeType: v })} isWikiMode={isWikiMode} />
            <FormInput label="Rarity" value={entity.rarity || ""} onChange={(v: string) => onUpdate({ ...entity, rarity: v })} isWikiMode={isWikiMode} />
            <FormInput label="Resources/Materials type" value={entity.resourceType || ""} onChange={(v: string) => onUpdate({ ...entity, resourceType: v })} isWikiMode={isWikiMode} />
            <FormInput label="Other material physical properties" value={entity.otherStats || ""} onChange={(v: string) => onUpdate({ ...entity, otherStats: v })} isWikiMode={isWikiMode} />
            <SmartSelect label="Related Resources/Materials" ids={entity.relatedResources || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedResources: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Made into Resources/Materials" ids={entity.madeIntoResources || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, madeIntoResources: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Created from Resources/Materials" ids={entity.madeFromResources || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, madeFromResources: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Found in Locations" ids={entity.connectedLocations || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedLocations: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Cultures/Art" ids={entity.relatedCultures || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedCultures: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Used by Occupations/Classes" ids={entity.usedProfessions || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, usedProfessions: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Produced by Occupations/Classes" ids={entity.producedProfessions || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, producedProfessions: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Required by Skills/Spells/Other" ids={entity.pairedResourcesRequire || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedResourcesRequire: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Created by Skills/Spells/Other" ids={entity.pairedResourcesCreate || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedResourcesCreate: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Resource/Material used to make Items" ids={entity.pairedItemMade || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedItemMade: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Resource/Material produced by Items" ids={entity.pairedItemProduced || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedItemProduced: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Produced from Species/Races/Flora/Fauna" ids={entity.pairedProducedFromRaces || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedProducedFromRaces: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Used by Species/Races/Flora/Fauna" ids={entity.pairedUsedResourcesRaces || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedUsedResourcesRaces: ids })} onCreate={onCreateNew} />
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
            </div>
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Traditions & customs connected to the item</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traditions || ''} onChange={e => onUpdate({ ...entity, traditions: e.target.value })} />
            </div>
            <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Myths/Legends/Stories" ids={entity.pairedMyths || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedMyths: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Characters" ids={entity.pairedCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCharacter: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Species/Races/Flora/Fauna" ids={entity.pairedConnectedRaces || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedRaces: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Causing Boons" ids={entity.pairedConditionsPositive || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsPositive: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Causing Afflictions" ids={entity.pairedConditionsNegative || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsNegative: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Causing Other conditions" ids={entity.pairedConditionsOther || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsOther: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Ideologies/Political groups" ids={entity.pairedConnectedPoliticalGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedPoliticalGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Teachings/Religious groups" ids={entity.pairedConnectedReligiousGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedReligiousGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedOtherGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMagicGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Sciences/Technological groups" ids={entity.pairedConnectedTechGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedTechGroups: ids })} onCreate={onCreateNew} />
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Secrets/Spoilers/DM notes</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
            </div>
        </EditorGroup>
    );
};
