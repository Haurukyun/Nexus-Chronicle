import React from 'react';
import { Location, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { FileText } from 'lucide-react';

interface Props {
    entity: Location;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Location>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const LocationSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <EditorGroup title="Location Specifics" icon={FileText} isWikiMode={isWikiMode}>
            <FormInput label="Characters originated from the location (legacy)" value={entity.pairedOriginCharacters || ""} onChange={(v: string) => onUpdate({ ...entity, pairedOriginCharacters: v })} isWikiMode={isWikiMode} />
            <FormInput label="Characters currently living in the location (legacy)" value={entity.pairedCurrentCharacters || ""} onChange={(v: string) => onUpdate({ ...entity, pairedCurrentCharacters: v })} isWikiMode={isWikiMode} />
            <FormInput label="Characters deceased at the location (legacy)" value={entity.pairedDemiseCharacters || ""} onChange={(v: string) => onUpdate({ ...entity, pairedDemiseCharacters: v })} isWikiMode={isWikiMode} />
            <SmartSelect label="Succeeding Locations/Geography" ids={entity.succedingLocations || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, succedingLocations: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Preceding Locations/Geography" ids={entity.preceedingLocations || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, preceedingLocations: ids })} onCreate={onCreateNew} />
            <FormInput label="Date of creation" value={entity.creationTime || ""} onChange={(v: string) => onUpdate({ ...entity, creationTime: v })} isWikiMode={isWikiMode} />
            <FormInput label="Date of end" value={entity.endTIme || ""} onChange={(v: string) => onUpdate({ ...entity, endTIme: v })} isWikiMode={isWikiMode} />
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Unusual features/Traits</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traits || ''} onChange={e => onUpdate({ ...entity, traits: e.target.value })} />
            </div>
            <FormInput label="Location type" value={entity.locationType || ""} onChange={(v: string) => onUpdate({ ...entity, locationType: v })} isWikiMode={isWikiMode} />
            <FormInput label="Population" value={entity.population || ""} onChange={(v: string) => onUpdate({ ...entity, population: v })} isWikiMode={isWikiMode} />
            <FormInput label="Size" value={entity.size || ""} onChange={(v: string) => onUpdate({ ...entity, size: v })} isWikiMode={isWikiMode} />
            <SmartSelect label="Local Languages" ids={entity.pairedLanguages || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedLanguages: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Local Currencies" ids={entity.pairedCurrencies || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCurrencies: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Local Cultures/Art" ids={entity.relatedCultures || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedCultures: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Common Occupations/Classes" ids={entity.connectedProfessions || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedProfessions: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Local Resources/Materials" ids={entity.connectedResources || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedResources: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Neighbouring Locations" ids={entity.neighbourLocations || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, neighbourLocations: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Other connected Locations" ids={entity.connectedLocations || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedLocations: ids })} onCreate={onCreateNew} />
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
            </div>
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Traditions & Customs</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traditions || ''} onChange={e => onUpdate({ ...entity, traditions: e.target.value })} />
            </div>
            <SmartSelect label="Characters originated from the location" ids={entity.pairedOriginCharactersNew || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedOriginCharactersNew: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Characters currently living in the location" ids={entity.pairedCurrentCharactersNew || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCurrentCharactersNew: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Characters deceased at the location" ids={entity.pairedDemiseCharactersNew || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedDemiseCharactersNew: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Other connected Characters" ids={entity.pairedConnectedCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedCharacter: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Local Species/Races/Flora/Fauna" ids={entity.pairedConnectedRaces || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedRaces: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Myths, legends and stories" ids={entity.pairedConnectedMyths || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMyths: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Events" ids={entity.pairedEvent || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEvent: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Skills/Spells/Other" ids={entity.pairedSkills || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkills: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Items" ids={entity.pairedConnectedItems || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedItems: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Affected by Boons" ids={entity.pairedConditionsPositive || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsPositive: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Affected by Afflictions" ids={entity.pairedConditionsNegative || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsNegative: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Affected by Other conditions" ids={entity.pairedConditionsOther || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsOther: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Governing Ideologies/Political groups" ids={entity.governPolitical || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, governPolitical: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected Ideologies/Political groups" ids={entity.connectedPolitical || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedPolitical: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Governing Organizations/Other groups" ids={entity.governOther || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, governOther: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected Organizations/Other groups" ids={entity.connectedOther || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedOther: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Governing Teachings/Religious groups" ids={entity.governReligious || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, governReligious: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected Teachings/Religious groups" ids={entity.connectedReligious || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedReligious: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Governing Schools of Magic/Magical groups" ids={entity.governMagical || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, governMagical: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected Schools of Magic/Magical groups" ids={entity.connectedMagical || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedMagical: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Governing Sciences/Technological groups" ids={entity.governTech || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, governTech: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected Sciences/Technological groups" ids={entity.connectedTech || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedTech: ids })} onCreate={onCreateNew} />
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Secrets/Spoilers/DM notes</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
            </div>
        </EditorGroup>
    );
};
