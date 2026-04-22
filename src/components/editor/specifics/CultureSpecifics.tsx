import React from 'react';
import { Culture, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { FileText } from 'lucide-react';

interface Props {
    entity: Culture;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Culture>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const CultureSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <EditorGroup title="Culture Specifics" icon={FileText} isWikiMode={isWikiMode}>
            <SmartSelect label="Succeeding Cultures/Art" ids={entity.succedingCultures || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, succedingCultures: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Preceding Cultures/Art" ids={entity.preceedingCultures || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, preceedingCultures: ids })} onCreate={onCreateNew} />
            <FormInput label="Date of creation" value={entity.creationTime || ""} onChange={(v: string) => onUpdate({ ...entity, creationTime: v })} isWikiMode={isWikiMode} />
            <FormInput label="Date of end" value={entity.endTIme || ""} onChange={(v: string) => onUpdate({ ...entity, endTIme: v })} isWikiMode={isWikiMode} />
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Unique/Defining Features</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traits || ''} onChange={e => onUpdate({ ...entity, traits: e.target.value })} />
            </div>
            <FormInput label="Estimated population" value={entity.population || ""} onChange={(v: string) => onUpdate({ ...entity, population: v })} isWikiMode={isWikiMode} />
            <FormInput label="Type" value={entity.typeCulture || ""} onChange={(v: string) => onUpdate({ ...entity, typeCulture: v })} isWikiMode={isWikiMode} />
            <SmartSelect label="Connected Characters" ids={entity.relatedCharacters || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedCharacters: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Common among Species/Races/Flora/Fauna" ids={entity.relatedRaces || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedRaces: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Common in Locations" ids={entity.relatedLocations || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedLocations: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Events" ids={entity.pairedEvents || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEvents: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Related Skills/Spells/Other" ids={entity.pairedSkills || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkills: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Important Items" ids={entity.pairedItems || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedItems: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Common Occupations/Classes" ids={entity.relatedProfessions || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedProfessions: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Important Resources/Materials" ids={entity.relatedResouces || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedResouces: ids })} onCreate={onCreateNew} />
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
            </div>
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Connected Traditions & Customs to the Culture/Art</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traditions || ''} onChange={e => onUpdate({ ...entity, traditions: e.target.value })} />
            </div>
            <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Myths, legends and stories" ids={entity.pairedOtherMyths || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedOtherMyths: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Ideologies/Political groups" ids={entity.pairedConnectedPolGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedPolGroups: ids })} onCreate={onCreateNew} />
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
