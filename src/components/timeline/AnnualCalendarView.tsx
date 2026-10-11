import React, { useState, useMemo } from 'react';
import {
    CalendarDays, Star, Sun, Cloud, Leaf, Snowflake,
    Sparkles, Info, ChevronLeft, ChevronRight
} from 'lucide-react';
import { FantasyCalendar, FantasyMonth } from '../../types';
import { getEffectiveMonthsForYear, isLeapYear, EffectiveMonth } from '../../utils/timelineUtils';
import { useTheme } from '../../theme';

// ─── Season helpers ────────────────────────────────────────────────────────
type SeasonCfg = { icon: React.ReactNode; label: string };
const SEASON_CFGS: Record<string, SeasonCfg> = {
    spring: { icon: <Leaf size={12} />, label: 'Spring' },
    summer: { icon: <Sun size={12} />, label: 'Summer' },
    autumn: { icon: <Cloud size={12} />, label: 'Autumn' },
    winter: { icon: <Snowflake size={12} />, label: 'Winter' },
};
function getSeasonCfg(season?: string): SeasonCfg | null {
    if (!season) return null;
    return SEASON_CFGS[season.toLowerCase()] || null;
}

// ─── Week grid builder ─────────────────────────────────────────────────────
function buildWeekGrid(month: EffectiveMonth, daysPerWeek: number): number[][] {
    const dpw = Math.max(1, daysPerWeek);
    const weeks: number[][] = [];
    let week: number[] = [];
    for (let d = 1; d <= month.days; d++) {
        week.push(d);
        if (week.length === dpw) { weeks.push(week); week = []; }
    }
    if (week.length > 0) weeks.push(week);
    return weeks;
}

// ─── Props ─────────────────────────────────────────────────────────────────
export interface AnnualCalendarViewProps {
    calendar: FantasyCalendar;
    displayYear?: number;
    onYearChange?: (year: number) => void;
}

type CalTab = 'months' | 'festivals';

// ─── Main Component ────────────────────────────────────────────────────────
export const AnnualCalendarView: React.FC<AnnualCalendarViewProps> = ({
    calendar,
    displayYear = 1,
    onYearChange,
}) => {
    const { themeId, layoutMode } = useTheme();
    const [activeTab, setActiveTab] = useState<CalTab>('months');
    const [localYear, setLocalYear] = useState(displayYear);

    const year = localYear;
    const leap = isLeapYear(year, calendar);
    const effectiveMonths = useMemo(() => getEffectiveMonthsForYear(year, calendar), [year, calendar]);
    const regularMonths = useMemo(() => effectiveMonths.filter(m => !m.isIntercalary), [effectiveMonths]);
    const festivals = useMemo(() => effectiveMonths.filter(m => m.isIntercalary), [effectiveMonths]);
    const leapFestivalId = calendar.leapRule?.targetMonthId;

    // ── Theme tokens ──────────────────────────────────────────────────────
    const isRoyal   = themeId === 'royal-codex';
    const isVoyager = themeId === 'grand-voyager';
    const isWiki    = layoutMode === 'wiki';
    const isLight   = isRoyal || isWiki;

    const accentColor = isVoyager ? '#2dd4bf' : isRoyal ? '#70121e' : isWiki ? '#b91c1c' : '#fef08a';
    const accentTextCls = isVoyager ? 'text-[#2dd4bf]' : isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#881337]' : 'text-[#fef08a]';

    const wrapCls = isVoyager  ? 'bg-[#0d0906]/90 border-[#3d2617]/70 text-[#f0dca8]'
                  : isRoyal   ? 'bg-[#fbf7eb] border-[#c8a96e]/50 text-[#2b1810]'
                  : isWiki    ? 'bg-white border-[#d4c8af] text-[#2b1810]'
                  :             'bg-slate-950/80 border-slate-800/80 text-slate-100';

    const headerBgCls = isVoyager  ? 'border-[#3d2617]/60 bg-[#180c04]/50'
                      : isRoyal   ? 'border-[#c8a96e]/30 bg-[#fdf5e6]/60'
                      : isWiki    ? 'border-[#d4c8af] bg-[#f8f5ef]/70'
                      :             'border-slate-800/60 bg-slate-950/40';

    const titleCls = isVoyager  ? 'text-[#f0dca8]'
                   : isRoyal   ? 'text-[#3d0a10]'
                   : isWiki    ? 'text-[#881337]'
                   :             'text-[#fef08a]';

    const tabBarBorderCls = isRoyal ? 'border-[#c8a96e]/30' : isWiki ? 'border-[#d4c8af]' : 'border-white/[0.07]';

    const tabActiveCls = isVoyager  ? 'bg-[#2dd4bf]/20 text-[#2dd4bf] border-b-2 border-[#2dd4bf]'
                       : isRoyal   ? 'bg-[#70121e]/10 text-[#70121e] border-b-2 border-[#70121e] font-bold font-serif'
                       : isWiki    ? 'bg-red-700/10 text-red-800 border-b-2 border-red-700 font-bold'
                       :             'bg-[#fef08a]/15 text-[#fef08a] border-b-2 border-[#fef08a]';

    const tabInactiveCls = isLight
        ? 'text-[#2b1810]/60 hover:text-[#2b1810] hover:bg-black/5'
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5';

    const yearNavCls = isVoyager  ? 'border-[#2dd4bf]/30 text-[#2dd4bf] hover:bg-[#2dd4bf]/15'
                     : isRoyal   ? 'border-[#70121e]/30 text-[#70121e] hover:bg-[#70121e]/10 font-serif font-bold'
                     : isWiki    ? 'border-red-700/30 text-red-800 hover:bg-red-50'
                     :             'border-[#fef08a]/25 text-[#fef08a] hover:bg-[#fef08a]/10';

    const yearLabelCls = isVoyager  ? 'text-[#f0dca8] font-bold'
                       : isRoyal   ? 'text-[#3d0a10] font-serif font-black'
                       : isWiki    ? 'text-[#881337] font-black'
                       :             'text-[#fef08a] font-black';

    const monthCardCls = isVoyager  ? 'bg-[#180c04]/70 border-[#3d2617] hover:border-[#2dd4bf]/40'
                       : isRoyal   ? 'bg-[#fdf8f0] border-[#c8a96e]/40 hover:border-[#70121e]/40 hover:shadow-md'
                       : isWiki    ? 'bg-[#f8f5ef] border-[#d4c8af] hover:border-[#881337]/40 hover:shadow-sm'
                       :             'bg-slate-900/60 border-slate-800/80 hover:border-slate-600/70';

    const monthHeaderCls = isVoyager  ? 'bg-[#2dd4bf]/10 border-b border-[#2dd4bf]/15'
                         : isRoyal   ? 'bg-[#70121e]/8 border-b border-[#c8a96e]/30'
                         : isWiki    ? 'bg-red-700/6 border-b border-[#d4c8af]'
                         :             'bg-[#fef08a]/6 border-b border-[#fef08a]/10';

    const monthTitleCls = isVoyager  ? 'text-[#2dd4bf] font-bold'
                        : isRoyal   ? 'text-[#70121e] font-serif font-bold'
                        : isWiki    ? 'text-[#881337] font-bold'
                        :             'text-[#fef08a] font-bold';

    const dayNumCls = isLight
        ? 'text-[#2b1810] hover:bg-black/8 rounded'
        : 'text-slate-300 hover:bg-white/10 rounded';

    const weekdayHdrCls = isVoyager  ? 'text-[#2dd4bf]/60'
                        : isRoyal   ? 'text-[#70121e]/60 font-serif'
                        : isWiki    ? 'text-[#881337]/60'
                        :             'text-[#fef08a]/50';

    const seasonTagCls = isLight
        ? 'bg-black/5 text-[#2b1810]/70 border border-black/8'
        : 'bg-white/5 text-slate-300 border border-white/10';

    const festCardCls = isVoyager  ? 'bg-gradient-to-br from-[#1a0f06] to-[#0d0704] border-[#2dd4bf]/30 shadow-[0_0_30px_rgba(45,212,191,0.12)]'
                      : isRoyal   ? 'bg-gradient-to-br from-[#fdf3e3] to-[#fcf5e9] border-[#c8a96e]/60 shadow-md'
                      : isWiki    ? 'bg-gradient-to-br from-[#fff9f3] to-[#fff4ec] border-[#d4c8af] shadow-sm'
                      :             'bg-gradient-to-br from-[#1e1a0e] to-[#0f0d06] border-[#fef08a]/25 shadow-[0_0_30px_rgba(254,240,138,0.08)]';

    const festNameCls = isVoyager  ? 'text-[#2dd4bf] font-bold text-xl'
                      : isRoyal   ? 'text-[#70121e] font-serif font-bold text-xl'
                      : isWiki    ? 'text-[#881337] font-bold text-xl'
                      :             'text-[#fef08a] font-bold text-xl';

    const mutedCls = isLight ? 'text-[#2b1810]/55' : 'text-current/50';

    const pillCls = isLight
        ? 'bg-black/5 border border-black/10 text-[#2b1810]/70'
        : 'bg-white/5 border border-white/10 text-current/70';

    // Summary
    const totalDays = effectiveMonths.reduce((s, m) => s + m.days, 0);
    const weeks = calendar.daysPerWeek > 0 ? Math.floor(totalDays / calendar.daysPerWeek) : 0;

    const handlePrevYear = () => { const ny = year - 1; setLocalYear(ny); onYearChange?.(ny); };
    const handleNextYear = () => { const ny = year + 1; setLocalYear(ny); onYearChange?.(ny); };

    const daysPerWeek = Math.max(1, calendar.daysPerWeek || 7);
    const weekdayNames = calendar.weekDayNames || [];

    return (
        <div className={`flex flex-col h-full rounded-2xl border overflow-hidden backdrop-blur-xl ${wrapCls}`}>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className={`px-5 py-4 shrink-0 border-b ${headerBgCls}`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Title block */}
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isVoyager ? 'bg-[#2dd4bf]/10 border-[#2dd4bf]/30 text-[#2dd4bf]'
                            : isRoyal ? 'bg-[#70121e]/10 border-[#70121e]/30 text-[#70121e]'
                            : isWiki  ? 'bg-red-700/10 border-red-700/30 text-red-700'
                            : 'bg-[#fef08a]/10 border-[#fef08a]/30 text-[#fef08a]'
                        }`}>
                            <CalendarDays size={20} />
                        </div>
                        <div>
                            <h2 className={`text-lg font-serif font-black uppercase tracking-wider ${titleCls}`}>
                                {calendar.name}
                            </h2>
                            <p className={`text-[11px] font-mono uppercase tracking-widest ${mutedCls}`}>
                                Annual Calendar &nbsp;·&nbsp; {totalDays} days &nbsp;·&nbsp; {daysPerWeek}-day week &nbsp;·&nbsp; {weeks} weeks &nbsp;·&nbsp; {festivals.length} festivals
                            </p>
                        </div>
                    </div>

                    {/* Year Navigator */}
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrevYear}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${yearNavCls}`}>
                            <ChevronLeft size={16} />
                        </button>
                        <div className="text-center min-w-[110px]">
                            <div className={`text-base ${yearLabelCls}`}>
                                Year {year}{calendar.yearSuffix ? ` ${calendar.yearSuffix}` : ''}
                            </div>
                            {leap && (
                                <div className={`text-[10px] font-bold uppercase tracking-widest ${accentTextCls}`}>
                                    ✦ Leap Year
                                </div>
                            )}
                        </div>
                        <button onClick={handleNextYear}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all ${yearNavCls}`}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Tab Bar */}
                <div className={`flex items-center gap-0 mt-4 border-b ${tabBarBorderCls}`}>
                    {([
                        { id: 'months' as CalTab, label: 'Months', icon: <CalendarDays size={14} />, count: regularMonths.length },
                        { id: 'festivals' as CalTab, label: 'Festivals & Intercalary Days', icon: <Star size={14} />, count: festivals.length },
                    ]).map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                                activeTab === tab.id ? tabActiveCls : tabInactiveCls
                            }`}
                        >
                            {tab.icon} {tab.label}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                                activeTab === tab.id
                                    ? (isLight ? 'bg-black/15' : 'bg-black/30')
                                    : 'opacity-45'
                            }`}>{tab.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content ────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5">

                {/* MONTHS TAB */}
                {activeTab === 'months' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {regularMonths.map((month, idx) => {
                            const seasonCfg = getSeasonCfg(month.season);
                            const weekGrid = buildWeekGrid(month, daysPerWeek);
                            const displayCols = Math.min(daysPerWeek, 10);

                            return (
                                <div key={month.id}
                                    className={`rounded-xl border overflow-hidden transition-all duration-200 shadow-sm ${monthCardCls}`}>
                                    {/* Month header */}
                                    <div className={`px-3 py-2.5 ${monthHeaderCls}`}>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-[11px] font-mono opacity-35 shrink-0">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </span>
                                                <span className={`text-sm truncate ${monthTitleCls}`}>{month.name}</span>
                                                {month.abbreviation && (
                                                    <span className="text-[10px] opacity-35 font-mono shrink-0">({month.abbreviation})</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {seasonCfg && (
                                                    <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-semibold ${seasonTagCls}`}>
                                                        {seasonCfg.icon}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[10px] font-mono ${mutedCls}`}>{month.days} days</span>
                                            {seasonCfg && <span className={`text-[10px] ${mutedCls}`}>· {seasonCfg.label}</span>}
                                        </div>
                                    </div>

                                    {/* Weekday headers */}
                                    <div className="px-2 pt-2">
                                        <div className="grid gap-0.5 mb-1"
                                            style={{ gridTemplateColumns: `repeat(${displayCols}, minmax(0, 1fr))` }}>
                                            {Array.from({ length: displayCols }).map((_, wi) => (
                                                <div key={wi}
                                                    className={`text-center text-[9px] font-bold uppercase tracking-tight ${weekdayHdrCls}`}>
                                                    {weekdayNames[wi]
                                                        ? weekdayNames[wi].substring(0, displayCols > 7 ? 2 : 3)
                                                        : `D${wi + 1}`}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Day grid */}
                                    <div className="px-2 pb-3 space-y-0.5">
                                        {weekGrid.map((week, wi) => (
                                            <div key={wi} className="grid gap-0.5"
                                                style={{ gridTemplateColumns: `repeat(${displayCols}, minmax(0, 1fr))` }}>
                                                {week.map(day => (
                                                    <div key={day}
                                                        className={`text-center text-[11px] py-0.5 cursor-default transition-colors ${dayNumCls}`}>
                                                        {day}
                                                    </div>
                                                ))}
                                                {week.length < displayCols && Array.from({ length: displayCols - week.length }).map((_, pi) => (
                                                    <div key={`pad-${pi}`} />
                                                ))}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Day-of-year footer */}
                                    <div className={`px-3 py-1.5 text-[10px] font-mono border-t ${
                                        isLight ? 'border-black/8 text-[#2b1810]/35' : 'border-white/8 text-current/30'
                                    }`}>
                                        Day {month.startDayOfYear} – {month.endDayOfYear}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* FESTIVALS TAB */}
                {activeTab === 'festivals' && (
                    <div className="space-y-5">
                        {/* Summary strip */}
                        <div className={`flex flex-wrap gap-4 px-4 py-3 rounded-xl border text-sm ${pillCls}`}>
                            <span className="flex items-center gap-2">
                                <Star size={13} className={accentTextCls} />
                                <strong>{festivals.length}</strong> intercalary festivals
                            </span>
                            <span className="flex items-center gap-2">
                                <CalendarDays size={13} className={accentTextCls} />
                                <strong>{festivals.reduce((s, f) => s + f.days, 0)}</strong> total festival days
                            </span>
                            {leap && calendar.leapRule?.leapDayName && (
                                <span className="flex items-center gap-2">
                                    <Sparkles size={13} className={accentTextCls} />
                                    Leap day: <strong className={accentTextCls}>{calendar.leapRule.leapDayName}</strong>
                                </span>
                            )}
                        </div>

                        {festivals.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                                <Star size={40} className="opacity-30" />
                                <div className="text-center">
                                    <p className="font-bold text-lg">No Intercalary Festivals</p>
                                    <p className="text-sm opacity-70 mt-1">This calendar has no standalone festival days outside normal months.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {festivals.map((fest, idx) => {
                                    const isLeapFest = leap && leapFestivalId === fest.id;
                                    const seasonCfg = getSeasonCfg(fest.season);
                                    const allCal = calendar.months as FantasyMonth[];
                                    const festCalIdx = allCal.findIndex(m => m.id === fest.id);
                                    const prevMonth = festCalIdx > 0 ? allCal[festCalIdx - 1] : null;
                                    const nextMonth = festCalIdx < allCal.length - 1 ? allCal[festCalIdx + 1] : null;

                                    return (
                                        <div key={fest.id}
                                            className={`rounded-2xl border overflow-hidden transition-all duration-200 ${festCardCls}`}>
                                            {/* Accent top bar */}
                                            <div className="h-1.5" style={{
                                                background: `linear-gradient(to right, ${accentColor}90, ${accentColor}25, transparent)`
                                            }} />

                                            <div className="p-5">
                                                {/* Name + ordinal */}
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Star size={14} className={accentTextCls} fill="currentColor" />
                                                            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${accentTextCls} opacity-70`}>
                                                                Festival {String(idx + 1).padStart(2, '0')}
                                                            </span>
                                                        </div>
                                                        <h3 className={`leading-tight break-words ${festNameCls}`}>{fest.name}</h3>
                                                        {fest.abbreviation && (
                                                            <span className={`text-xs font-mono ${mutedCls}`}>({fest.abbreviation})</span>
                                                        )}
                                                    </div>
                                                    {seasonCfg && (
                                                        <span className={`text-xs px-2.5 py-1.5 rounded-full font-bold border shrink-0 flex items-center gap-1 ${pillCls}`}>
                                                            {seasonCfg.icon} {seasonCfg.label}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Days count + leap badge */}
                                                <div className="flex items-center gap-2 flex-wrap mb-3">
                                                    <span className={`text-sm font-bold px-3 py-1 rounded-lg border ${pillCls}`}>
                                                        {fest.days} day{fest.days !== 1 ? 's' : ''}
                                                    </span>
                                                    {isLeapFest && (
                                                        <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${
                                                            isLight ? 'border-amber-500/40 text-amber-700 bg-amber-50/80' : 'border-[#fef08a]/40 text-[#fef08a] bg-[#fef08a]/8'
                                                        }`}>
                                                            <Sparkles size={11} />
                                                            Leap: +{calendar.leapRule?.extraDays || 1}d
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Leap day name box */}
                                                {isLeapFest && calendar.leapRule?.leapDayName && (
                                                    <div className={`mb-3 px-3 py-2 rounded-lg border text-sm ${
                                                        isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-[#fef08a]/8 border-[#fef08a]/25 text-[#fef08a]'
                                                    }`}>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">Leap Day Name</p>
                                                        <p className="font-bold">{calendar.leapRule.leapDayName}</p>
                                                    </div>
                                                )}

                                                {/* Position in year */}
                                                <div className={`text-xs px-3 py-2 rounded-lg border ${pillCls}`}>
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <Info size={11} className={accentTextCls} />
                                                        <span>Day {fest.startDayOfYear}</span>
                                                        {prevMonth && <span className="opacity-55">· after <em>{prevMonth.name}</em></span>}
                                                        {nextMonth && <span className="opacity-55">· before <em>{nextMonth.name}</em></span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Named weekdays */}
                        {calendar.weekDayNames && calendar.weekDayNames.length > 0 && (
                            <div className={`mt-4 px-4 py-4 rounded-xl border ${pillCls}`}>
                                <h4 className={`text-xs font-bold uppercase tracking-widest mb-2.5 ${accentTextCls}`}>
                                    Named Days of the Week ({daysPerWeek}-day cycle)
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {calendar.weekDayNames.map((day, i) => (
                                        <span key={i}
                                            className={`text-xs px-2.5 py-1 rounded-lg border font-mono ${pillCls}`}>
                                            {i + 1}. {day}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
