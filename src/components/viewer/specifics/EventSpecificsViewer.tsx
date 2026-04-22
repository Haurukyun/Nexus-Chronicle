import React from 'react';
import { Event, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';

interface Props {
    entity: Event;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
}

export const EventSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, isWikiMode }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-2 col-span-full tracking-widest text-[#fef08a] border-b border-slate-800/60 pb-3">Event Intelligence</h3>
            <FieldRow label="Event type" value={entity.eventType || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Start date" value={entity.startDate || ""} isWikiMode={isWikiMode} />
            <FieldRow label="End date" value={entity.endDate || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Amount of participants" value={entity.participants || ""} isWikiMode={isWikiMode} />
            <LinksDisplay label="Prominent Actors" ids={entity.pairedCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Locations" ids={entity.pairedLocations || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to other Events" ids={entity.pairedEvents || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Items" ids={entity.pairedItems || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Affected or involved Species/Races/Flora/Fauna" ids={entity.pairedRaces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Cultures/Art" ids={entity.relatedCultures || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Myths, legends and stories" ids={entity.pairedMyths || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Involved Ideologies/Political groups" ids={entity.connectedPolitical || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Involved Organizations/Other groups" ids={entity.connectedOtherGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Involved Teachings/Religious groups" ids={entity.connectedReligious || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Involved Schools of Magic/Magical groups" ids={entity.connectedMagical || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Involved Sciences/Technological groups" ids={entity.connectedTech || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Skills/Other connected to the Event" ids={entity.pairedSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Spells connected to the Event" ids={entity.pairedSpells || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Boons" ids={entity.pairedConditionsPositive || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Afflictions" ids={entity.pairedConditionsNegative || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Other conditions" ids={entity.pairedConditionsOther || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            </div>
            {entity.description && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Description & History</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.description}</p>
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
