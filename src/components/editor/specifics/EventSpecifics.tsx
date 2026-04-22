import React from 'react';
import { Event, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { FileText } from 'lucide-react';

interface Props {
    entity: Event;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Event>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const EventSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <EditorGroup title="Event Specifics" icon={FileText} isWikiMode={isWikiMode}>
            <FormInput label="Event type" value={entity.eventType || ""} onChange={(v: string) => onUpdate({ ...entity, eventType: v })} isWikiMode={isWikiMode} />
            <FormInput label="Start date" value={entity.startDate || ""} onChange={(v: string) => onUpdate({ ...entity, startDate: v })} isWikiMode={isWikiMode} />
            <FormInput label="End date" value={entity.endDate || ""} onChange={(v: string) => onUpdate({ ...entity, endDate: v })} isWikiMode={isWikiMode} />
            <FormInput label="Amount of participants" value={entity.participants || ""} onChange={(v: string) => onUpdate({ ...entity, participants: v })} isWikiMode={isWikiMode} />
            <SmartSelect label="Prominent Actors" ids={entity.pairedCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCharacter: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Locations" ids={entity.pairedLocations || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedLocations: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to other Events" ids={entity.pairedEvents || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEvents: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Items" ids={entity.pairedItems || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedItems: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Affected or involved Species/Races/Flora/Fauna" ids={entity.pairedRaces || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedRaces: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Cultures/Art" ids={entity.relatedCultures || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedCultures: ids })} onCreate={onCreateNew} />
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
            </div>
            <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Myths, legends and stories" ids={entity.pairedMyths || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedMyths: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Involved Ideologies/Political groups" ids={entity.connectedPolitical || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedPolitical: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Involved Organizations/Other groups" ids={entity.connectedOtherGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedOtherGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Involved Teachings/Religious groups" ids={entity.connectedReligious || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedReligious: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Involved Schools of Magic/Magical groups" ids={entity.connectedMagical || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedMagical: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Involved Sciences/Technological groups" ids={entity.connectedTech || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedTech: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Skills/Other connected to the Event" ids={entity.pairedSkills || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkills: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Spells connected to the Event" ids={entity.pairedSpells || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSpells: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Boons" ids={entity.pairedConditionsPositive || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsPositive: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Afflictions" ids={entity.pairedConditionsNegative || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsNegative: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Other conditions" ids={entity.pairedConditionsOther || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsOther: ids })} onCreate={onCreateNew} />
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Secrets/Spoilers/DM notes</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
            </div>
        </EditorGroup>
    );
};
