import React from 'react';
import { Event, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';
import { useTheme } from '../../../theme';

interface Props {
    entity: Event;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    backlinks?: any;
}

export const EventSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, backlinks }) => {
    const { t } = useTheme();
    return (
        <div className="space-y-8">
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Vital Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Event type" value={entity.eventType} />
                    <FieldRow label="Start date" value={entity.startDate} />
                    <FieldRow label="End date" value={entity.endDate} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Myths, legends and stories" ids={entity.pairedMyths || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Connections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Amount of participants" value={entity.participants} />
                    <FieldRow label="Description & History" value={entity.description} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Prominent Actors" ids={entity.pairedCharacter || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Locations" ids={entity.pairedLocations || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to other Events" ids={entity.pairedEvents || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Boons" ids={entity.pairedConditionsPositive || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Afflictions" ids={entity.pairedConditionsNegative || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Other conditions" ids={entity.pairedConditionsOther || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Inventory & Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Items" ids={entity.pairedItems || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Interpersonal Web</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Affected or involved Species/Races/Flora/Fauna" ids={entity.pairedRaces || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Traditions & Customs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-2">
                        <LinksDisplay label="Connected to Cultures/Art" ids={entity.relatedCultures || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Governance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Involved Ideologies/Political groups" ids={entity.connectedPolitical || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Involved Organizations/Other groups" ids={entity.connectedOtherGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Involved Teachings/Religious groups" ids={entity.connectedReligious || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Involved Schools of Magic/Magical groups" ids={entity.connectedMagical || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Involved Sciences/Technological groups" ids={entity.connectedTech || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Stats & Knowledge</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Skills/Other connected to the Event" ids={entity.pairedSkills || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Spells connected to the Event" ids={entity.pairedSpells || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
        </div>
    );
};
