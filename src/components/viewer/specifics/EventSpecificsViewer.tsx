import React from 'react';
import { History, CalendarDays } from 'lucide-react';
import { Event, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';
import { useTheme } from '../../../theme';
import { useWorldStore } from '../../../store/useWorldStore';
import { extractYear, findEraForYear } from '../../../utils/timelineUtils';

interface Props {
    entity: Event;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    backlinks?: any;
}

export const EventSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, backlinks }) => {
    const { t, themeId } = useTheme();
    const focusTimelineEvent = useWorldStore(state => state.focusTimelineEvent);
    const calendar = useWorldStore(state => state.world.timelineCalendar);
    const eras = useWorldStore(state => state.world.timelineEras);
    const isWiki = themeId === 'wiki';
    const isRoyal = themeId === 'royal-codex';
    const isVoyager = themeId === 'grand-voyager';

    // Check if this event has timeline-visible dates
    const hasTimelineDate = !!(entity.startDate || entity.date);
    const startYr = extractYear(entity.startDate || entity.date);
    const endYr = extractYear(entity.endDate);
    const isSpan = hasTimelineDate && endYr !== null && endYr !== startYr;
    const eraMatch = startYr !== null ? findEraForYear(startYr, eras || []) : null;

    const timelineBannerCls = isVoyager
        ? 'bg-[#180c04]/80 border-[#2dd4bf]/40 text-[#f0dca8] shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(45,212,191,0.15)]'
        : isRoyal
        ? 'bg-[#fbf7eb] border-2 border-[#c8a96e]/70 text-[#2b1810] shadow-md font-serif'
        : isWiki
        ? 'bg-[#fdfcf9] border border-[#d4c8af] text-[#2b1810] shadow-sm'
        : 'bg-slate-950/70 border border-[#fef08a]/30 text-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(254,240,138,0.1)]';

    const actionBtnCls = isVoyager
        ? 'bg-[#2dd4bf]/20 border-[#2dd4bf]/50 text-[#2dd4bf] hover:bg-[#2dd4bf]/35 hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(45,212,191,0.2)]'
        : isRoyal
        ? 'bg-[#70121e] border-[#70121e] text-[#fff8e7] hover:bg-[#881337] hover:scale-105 active:scale-95 shadow-md'
        : isWiki
        ? 'bg-red-700 border-red-700 text-white hover:bg-red-800 hover:scale-105 active:scale-95 shadow-sm'
        : 'bg-[#fef08a]/20 border-[#fef08a]/50 text-[#fef08a] hover:bg-[#fef08a]/35 hover:scale-105 active:scale-95 shadow-[0_0_14px_rgba(254,240,138,0.25)]';

    return (
        <div className="space-y-8">
            {/* ── Chronos Timeline & Annual Calendar Smart Navigation Banner ── */}
            {hasTimelineDate && (
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border backdrop-blur-xl transition-all ${timelineBannerCls}`}>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isVoyager ? 'bg-[#2dd4bf]/15 border-[#2dd4bf]/40 text-[#2dd4bf]'
                            : isRoyal ? 'bg-[#70121e]/15 border-[#70121e]/40 text-[#70121e]'
                            : isWiki ? 'bg-red-700/10 border-red-700/30 text-red-700'
                            : 'bg-[#fef08a]/15 border-[#fef08a]/40 text-[#fef08a]'
                        }`}>
                            <History size={18} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold uppercase tracking-wider">Historical Chronicle Record</span>
                                {eraMatch && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/10 border border-current/20">
                                        {eraMatch.name}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] opacity-75 mt-0.5 font-mono">
                                {isSpan
                                    ? `Yr ${startYr} — ${endYr} (${(endYr! - startYr!)} yr span)`
                                    : startYr !== null
                                    ? `Yr ${startYr} · Point in Time`
                                    : entity.startDate || entity.date}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                            onClick={() => focusTimelineEvent(entity.id, 'chronos')}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${actionBtnCls}`}
                            title="Jump to this event on the Chronos Timeline and open its inspector"
                        >
                            <History size={13} />
                            <span>View on Timeline</span>
                        </button>

                        {calendar && (
                            <button
                                onClick={() => focusTimelineEvent(entity.id, 'annual')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-current/30 text-[11px] font-bold uppercase tracking-wider hover:bg-white/10 hover:border-current/60 hover:scale-105 active:scale-95 transition-all cursor-pointer opacity-80 hover:opacity-100"
                                title={`Open Annual Calendar for Year ${startYr ?? ''}`}
                            >
                                <CalendarDays size={13} />
                                <span>Annual Calendar</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

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
