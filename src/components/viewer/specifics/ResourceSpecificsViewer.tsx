import React from 'react';
import { Resource, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';

interface Props {
    entity: Resource;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
}

export const ResourceSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, isWikiMode }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-2 col-span-full tracking-widest text-[#fef08a] border-b border-slate-800/60 pb-3">Resource Intelligence</h3>
            <FieldRow label="Prominent features" value={entity.features || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Price in Currencies" value={entity.priceCurrencies || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Density" value={entity.density || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Hardness" value={entity.hardness || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Found in biomes" value={entity.biomeType || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Rarity" value={entity.rarity || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Resources/Materials type" value={entity.resourceType || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Other material physical properties" value={entity.otherStats || ""} isWikiMode={isWikiMode} />
            <LinksDisplay label="Related Resources/Materials" ids={entity.relatedResources || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Made into Resources/Materials" ids={entity.madeIntoResources || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Created from Resources/Materials" ids={entity.madeFromResources || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Found in Locations" ids={entity.connectedLocations || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Cultures/Art" ids={entity.relatedCultures || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Used by Occupations/Classes" ids={entity.usedProfessions || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Produced by Occupations/Classes" ids={entity.producedProfessions || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Required by Skills/Spells/Other" ids={entity.pairedResourcesRequire || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Created by Skills/Spells/Other" ids={entity.pairedResourcesCreate || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Resource/Material used to make Items" ids={entity.pairedItemMade || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Resource/Material produced by Items" ids={entity.pairedItemProduced || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Produced from Species/Races/Flora/Fauna" ids={entity.pairedProducedFromRaces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Used by Species/Races/Flora/Fauna" ids={entity.pairedUsedResourcesRaces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Myths/Legends/Stories" ids={entity.pairedMyths || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Characters" ids={entity.pairedCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Species/Races/Flora/Fauna" ids={entity.pairedConnectedRaces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Causing Boons" ids={entity.pairedConditionsPositive || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Causing Afflictions" ids={entity.pairedConditionsNegative || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Causing Other conditions" ids={entity.pairedConditionsOther || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Ideologies/Political groups" ids={entity.pairedConnectedPoliticalGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Teachings/Religious groups" ids={entity.pairedConnectedReligiousGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Sciences/Technological groups" ids={entity.pairedConnectedTechGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            </div>
            {entity.description && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Description & History</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.description}</p>
                </div>
            )}
            {entity.traditions && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Traditions & customs connected to the item</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.traditions}</p>
                </div>
            )}
            {entity.spoilerNotes && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Secrets/Spoilers/DM notes</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.spoilerNotes}</p>
                </div>
            )}
        </div>
    );
};
