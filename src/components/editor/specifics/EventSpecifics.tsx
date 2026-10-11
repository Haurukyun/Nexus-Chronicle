import React from 'react';
import { Event, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { useTheme } from '../../../theme';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { Anchor, Gem, Globe, Info, Scroll, Tent, Zap } from 'lucide-react';

interface Props {
    entity: Event;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Event>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
}

export const EventSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew }) => {
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
            <EditorGroup title="Basic" icon={Info}>
                <FormInput label="Event type" value={entity.eventType || ""} onChange={(v: string) => onUpdate({ ...entity, eventType: v })} />
                <FormInput label="Start date" value={entity.startDate || ""} onChange={(v: string) => onUpdate({ ...entity, startDate: v })} />
                <FormInput label="End date" value={entity.endDate || ""} onChange={(v: string) => onUpdate({ ...entity, endDate: v })} />
                <SmartSelect label="Connected to Myths, legends and stories" ids={entity.pairedMyths || []} type="myth" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedMyths: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Details" icon={Scroll}>
                <FormInput label="Amount of participants" value={entity.participants || ""} onChange={(v: string) => onUpdate({ ...entity, participants: v })} />
                <div className="lg:col-span-3">
                    <label className={labelClass}>Description & History</label>
                    <textarea className={`${textareaClass} h-32`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                </div>
                <div className="lg:col-span-3">
                    <label className={labelClass}>Secrets/Spoilers/DM notes</label>
                    <textarea className={`${textareaClass} h-32`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Connections" icon={Globe}>
                <SmartSelect label="Prominent Actors" ids={entity.pairedCharacter || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Locations" ids={entity.pairedLocations || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedLocations: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to other Events" ids={entity.pairedEvents || []} type="event" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedEvents: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affected or involved Species/Races/Flora/Fauna" ids={entity.pairedRaces || []} type="species" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedRaces: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="note" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Involved Organizations/Other groups" ids={entity.connectedOtherGroups || []} type="organization" all={allEntities} onChange={(ids) => onUpdate({ ...entity, connectedOtherGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Boons" ids={entity.pairedConditionsPositive || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConditionsPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Afflictions" ids={entity.pairedConditionsNegative || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConditionsNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Other conditions" ids={entity.pairedConditionsOther || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConditionsOther: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Possessions" icon={Gem}>
                <SmartSelect label="Connected to Items" ids={entity.pairedItems || []} type="item" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedItems: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Traditions" icon={Tent}>
                <SmartSelect label="Connected to Cultures/Art" ids={entity.relatedCultures || []} type="culture" all={allEntities} onChange={(ids) => onUpdate({ ...entity, relatedCultures: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Governance" icon={Anchor}>
                <SmartSelect label="Involved Ideologies/Political groups" ids={entity.connectedPolitical || []} type="political" all={allEntities} onChange={(ids) => onUpdate({ ...entity, connectedPolitical: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Involved Teachings/Religious groups" ids={entity.connectedReligious || []} type="religious" all={allEntities} onChange={(ids) => onUpdate({ ...entity, connectedReligious: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Involved Schools of Magic/Magical groups" ids={entity.connectedMagical || []} type="magic" all={allEntities} onChange={(ids) => onUpdate({ ...entity, connectedMagical: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Involved Sciences/Technological groups" ids={entity.connectedTech || []} type="tech" all={allEntities} onChange={(ids) => onUpdate({ ...entity, connectedTech: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Stats" icon={Zap}>
                <SmartSelect label="Skills/Other connected to the Event" ids={entity.pairedSkills || []} type="event" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedSkills: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Spells connected to the Event" ids={entity.pairedSpells || []} type="event" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedSpells: ids })} onCreate={onCreateNew} />
            </EditorGroup>
        </>
    );
};
