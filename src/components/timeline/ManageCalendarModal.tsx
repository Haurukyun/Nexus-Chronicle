import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, Plus, Trash2, Sparkles, Check, Calendar, ArrowUp, ArrowDown, 
    RotateCcw, Sun, Moon, Clock, Compass, HelpCircle, Layers, CalendarDays,
    Star, Snowflake, Leaf, Cloud, AlertCircle, Info
} from 'lucide-react';
import { FantasyCalendar, FantasyMonth, FantasyLeapRule } from '../../types';
import { DEFAULT_CALENDAR_PRESETS, getDaysInYear, isLeapYear, formatFantasyDate } from '../../utils/timelineUtils';
import { useTheme } from '../../theme';

interface ManageCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    calendar?: FantasyCalendar;
    onSaveCalendar: (calendar: FantasyCalendar) => void;
}

type TabType = 'months' | 'festivals' | 'settings' | 'leap' | 'preview';

function getFestivalPosition(festivalId: string, months: FantasyMonth[]): string {
    const idx = months.findIndex(m => m.id === festivalId);
    if (idx <= 0) return 'start';
    for (let i = idx - 1; i >= 0; i--) {
        if (!months[i].isIntercalary) {
            return `after:${months[i].id}`;
        }
    }
    return 'start';
}

function moveFestivalToPosition(
    festivalId: string, 
    targetPos: string, 
    months: FantasyMonth[]
): FantasyMonth[] {
    const fest = months.find(m => m.id === festivalId);
    if (!fest) return months;
    const remaining = months.filter(m => m.id !== festivalId);
    
    if (targetPos === 'start') {
        return [fest, ...remaining];
    } else if (targetPos === 'end') {
        return [...remaining, fest];
    } else if (targetPos.startsWith('after:')) {
        const afterMonthId = targetPos.replace('after:', '');
        const targetIdx = remaining.findIndex(m => m.id === afterMonthId);
        if (targetIdx === -1) {
            return [...remaining, fest];
        }
        const updated = [...remaining];
        updated.splice(targetIdx + 1, 0, fest);
        return updated;
    }
    return months;
}

function moveRegularMonth(
    monthId: string,
    direction: 'up' | 'down',
    months: FantasyMonth[]
): FantasyMonth[] {
    const regular = months.filter(m => !m.isIntercalary);
    const regIdx = regular.findIndex(m => m.id === monthId);
    if (regIdx === -1) return months;
    const swapRegIdx = direction === 'up' ? regIdx - 1 : regIdx + 1;
    if (swapRegIdx < 0 || swapRegIdx >= regular.length) return months;
    
    const targetSwapMonth = regular[swapRegIdx];
    const idxA = months.findIndex(m => m.id === monthId);
    if (idxA === -1) return months;

    const copy = [...months];
    const [itemA] = copy.splice(idxA, 1);
    const newIdxB = copy.findIndex(m => m.id === targetSwapMonth.id);
    if (newIdxB === -1) return months;

    if (direction === 'up') {
        copy.splice(newIdxB, 0, itemA);
    } else {
        copy.splice(newIdxB + 1, 0, itemA);
    }
    return copy;
}

export const ManageCalendarModal: React.FC<ManageCalendarModalProps> = ({
    isOpen,
    onClose,
    calendar,
    onSaveCalendar
}) => {
    const { themeId, layoutMode } = useTheme();

    const [localCal, setLocalCal] = useState<FantasyCalendar>(() => {
        if (calendar && calendar.months && calendar.months.length > 0) {
            return JSON.parse(JSON.stringify(calendar));
        }
        return JSON.parse(JSON.stringify(DEFAULT_CALENDAR_PRESETS.solar.calendar));
    });

    const [activeTab, setActiveTab] = useState<TabType>('months');
    const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

    // Date test playground state
    const [testYear, setTestYear] = useState<number>(2026);
    const [testMonthIdx, setTestMonthIdx] = useState<number>(0);
    const [testDay, setTestDay] = useState<number>(1);

    if (!isOpen) return null;

    const handleApplyPreset = (presetKey: string) => {
        const preset = DEFAULT_CALENDAR_PRESETS[presetKey];
        if (preset) {
            setLocalCal(JSON.parse(JSON.stringify(preset.calendar)));
            setTestMonthIdx(0);
            setTestDay(1);
        }
    };

    const handleAddRegularMonth = () => {
        const regMonths = localCal.months.filter(m => !m.isIntercalary);
        const newMonth: FantasyMonth = {
            id: crypto.randomUUID(),
            name: `Month ${regMonths.length + 1}`,
            days: 30,
            abbreviation: `M${regMonths.length + 1}`,
            season: 'spring',
            isIntercalary: false
        };
        setLocalCal({
            ...localCal,
            months: [...localCal.months, newMonth]
        });
    };

    const handleAddFestival = () => {
        const newFestival: FantasyMonth = {
            id: crypto.randomUUID(),
            name: `Festival of the Solstice`,
            days: 1,
            abbreviation: `Fest`,
            season: 'summer',
            isIntercalary: true
        };
        setLocalCal({
            ...localCal,
            months: [...localCal.months, newFestival]
        });
        setActiveTab('festivals');
    };

    const handleUpdateMonth = (id: string, updates: Partial<FantasyMonth>) => {
        setLocalCal({
            ...localCal,
            months: localCal.months.map(m => m.id === id ? { ...m, ...updates } : m)
        });
    };

    const handleDeleteMonth = (id: string) => {
        const mToDelete = localCal.months.find(m => m.id === id);
        if (!mToDelete) return;
        if (!mToDelete.isIntercalary && regularMonths.length <= 1) return;

        setLocalCal({
            ...localCal,
            months: localCal.months.filter(m => m.id !== id),
            leapRule: localCal.leapRule?.targetMonthId === id 
                ? { ...localCal.leapRule, targetMonthId: undefined } 
                : localCal.leapRule
        });
    };

    const handleSave = () => {
        onSaveCalendar(localCal);
        onClose();
    };

    // Derived statistics & lists
    const regularMonths = localCal.months.filter(m => !m.isIntercalary);
    const festivals = localCal.months.filter(m => m.isIntercalary);
    const standardYearDays = getDaysInYear(1001, localCal);
    const leapYearDays = getDaysInYear(1000, localCal);

    // Theme tokens
    const isSovereign = themeId === 'sovereign';
    const isVoyager   = themeId === 'grand-voyager';
    const isRoyal     = themeId === 'royal-codex';
    const isWiki      = layoutMode === 'wiki';
    const isLightModal = isWiki || isRoyal;

    const modalCard = isVoyager
        ? 'bg-[#140b05]/95 border-[#3d2617] text-[#f0dca8] shadow-[0_30px_90px_rgba(0,0,0,0.95)] ring-1 ring-[#2dd4bf]/25'
        : isRoyal
        ? 'bg-[#fbf7ee] border-2 border-[#c8a96e] text-[#2b1810] shadow-[0_30px_90px_rgba(60,30,10,0.45)] ring-1 ring-[#c8a96e]/40 font-serif'
        : isWiki
        ? 'bg-[#fdfcf9]/95 border-[#d4c8af] text-[#2b1810] shadow-[0_30px_80px_rgba(70,50,30,0.18)]'
        : 'bg-slate-950/90 border-slate-700/60 text-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.9)] ring-1 ring-amber-400/20';

    const headerBg = isVoyager ? 'border-[#3d2617] bg-[#1a0f07]/80'
                   : isRoyal   ? 'border-[#c8a96e]/40 bg-[#f4efe4]/60'
                   : isWiki    ? 'border-[#d4c8af] bg-[#f7f3eb]/70'
                   :             'border-slate-800/80 bg-slate-900/50';

    const iconAccent = isVoyager ? 'bg-[#2dd4bf]/15 text-[#2dd4bf] border-[#2dd4bf]/30'
                     : isRoyal   ? 'bg-[#70121e]/10 text-[#70121e] border-[#70121e]/30'
                     : isWiki    ? 'bg-red-700/10 text-red-700 border-red-700/30'
                     :             'bg-[#fef08a]/10 text-[#fef08a] border-[#fef08a]/30';

    const inputCls = isVoyager ? 'bg-[#241208]/90 border-[#3d2617] text-[#f0dca8] focus:border-[#2dd4bf]/60 focus:ring-2 focus:ring-[#2dd4bf]/25 placeholder:text-[#f0dca8]/30'
                   : isRoyal   ? 'bg-white border-2 border-[#c8a96e]/60 text-[#2b1810] placeholder:text-[#2b1810]/40 focus:border-[#70121e] focus:ring-2 focus:ring-[#70121e]/20 shadow-xs'
                   : isWiki    ? 'bg-white border border-[#d4c8af] text-[#2b1810] placeholder:text-stone-400 focus:border-red-600 focus:ring-2 focus:ring-red-500/20 shadow-xs'
                   :             'bg-slate-900/80 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-[#fef08a]/60 focus:ring-2 focus:ring-[#fef08a]/20';

    const tabActiveCls = isVoyager ? 'bg-[#2dd4bf]/20 text-[#2dd4bf] border-[#2dd4bf]/60 shadow-[0_0_15px_rgba(45,212,191,0.25)] font-bold'
                       : isRoyal   ? 'bg-[#70121e] text-[#fff8e7] border-[#70121e] shadow-md font-bold font-serif'
                       : isWiki    ? 'bg-red-700 text-white border-red-700 shadow-sm font-bold'
                       :             'bg-[#fef08a]/20 text-[#fef08a] border-[#fef08a]/60 shadow-[0_0_15px_rgba(254,240,138,0.25)] font-bold';

    const saveBtnCls = isVoyager ? 'bg-[#2dd4bf] text-[#090d08] hover:bg-[#14b8a6] shadow-[0_0_20px_rgba(45,212,191,0.4)]'
                     : isRoyal   ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#851624] shadow-[0_0_20px_rgba(112,18,30,0.4)] font-serif'
                     : isWiki    ? 'bg-red-700 text-white hover:bg-red-800 shadow-sm'
                     :             'bg-[#fef08a] text-slate-950 hover:bg-[#fde047] shadow-[0_0_20px_rgba(254,240,138,0.4)] font-bold';

    const cardBgCls = isVoyager ? 'bg-[#180c04]/70 border-[#3d2617]'
                    : isRoyal   ? 'bg-white border border-[#c8a96e]/60 text-[#2b1810] shadow-xs'
                    : isWiki    ? 'bg-white border-[#d4c8af] text-[#2b1810]'
                    :             'bg-slate-900/60 border-slate-800/80';

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div 
                className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-2xl ${modalCard}`}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className={`p-6 border-b flex items-center justify-between shrink-0 ${headerBg}`}>
                    <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${iconAccent}`}>
                            <Calendar size={22} />
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold uppercase tracking-wider font-serif ${
                                isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#881337]' : isVoyager ? 'text-[#f0dca8]' : 'text-[#fef08a]'
                            }`}>
                                Custom Fantasy Calendar
                            </h2>
                            <p className={`text-xs font-sans mt-0.5 ${isLightModal ? 'text-[#2b1810]/70' : 'opacity-65'}`}>
                                Configure fantasy reckoning, unique months, festival holidays, and epoch leap cycles
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-xl transition-all ${
                            isLightModal ? 'text-[#2b1810] hover:bg-black/10' : 'hover:bg-white/10 opacity-70 hover:opacity-100 text-inherit'
                        }`}
                        title="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── Preset Banner ────────────────────────────────────────── */}
                <div className={`px-6 py-3 border-b flex items-center gap-2 flex-wrap text-xs ${
                    isRoyal ? 'bg-[#f4efe4] border-[#c8a96e]/40' : isWiki ? 'bg-[#f4efe4] border-[#d4c8af]' : 'bg-black/30 border-white/5'
                }`}>
                    <span className={`font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 mr-1.5 ${
                        isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#881337]' : isVoyager ? 'text-[#2dd4bf]' : 'text-[#fef08a]'
                    }`}>
                        <Sparkles size={13} /> Presets:
                    </span>
                    {Object.entries(DEFAULT_CALENDAR_PRESETS).map(([key, p]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => handleApplyPreset(key)}
                            title={p.description}
                            className={`px-3 py-1 rounded-xl border text-xs font-medium transition-all ${
                                isVoyager ? 'border-[#3d2617] bg-[#241208]/70 hover:border-[#2dd4bf]/50 hover:bg-[#2dd4bf]/15 text-[#f0dca8]'
                                : isRoyal ? 'border-[#c8a96e]/60 bg-white text-[#2b1810] hover:border-[#70121e] hover:bg-[#70121e]/5 shadow-xs font-serif'
                                : isWiki ? 'border-[#d4c8af] bg-white text-[#2b1810] hover:border-red-400 hover:bg-red-50'
                                : 'border-slate-800 bg-slate-900/60 hover:border-[#fef08a]/40 hover:bg-white/5 text-slate-200'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* ── Navigation Tabs & Summary Strip ───────────────────────── */}
                <div className={`px-6 py-3.5 border-b flex items-center justify-between gap-4 flex-wrap shrink-0 ${
                    isRoyal ? 'border-[#c8a96e]/40' : isWiki ? 'border-[#d4c8af]' : 'border-white/10'
                }`}>
                    <div className={`flex items-center gap-1.5 p-1 rounded-2xl border text-xs font-semibold backdrop-blur-md ${
                        isRoyal ? 'bg-[#ede4d2] border-[#c8a96e]/60'
                        : isWiki ? 'bg-[#eee7d8] border-[#d4c8af]'
                        : isVoyager ? 'bg-black/50 border-[#3d2617]'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}>
                        <button
                            type="button"
                            onClick={() => setActiveTab('months')}
                            className={`px-3.5 py-1.5 rounded-xl border border-transparent transition-all flex items-center gap-1.5 ${
                                activeTab === 'months' 
                                    ? tabActiveCls 
                                    : isLightModal 
                                    ? 'text-[#2b1810]/70 hover:text-[#2b1810] hover:bg-black/5' 
                                    : 'opacity-70 hover:opacity-100 text-inherit'
                            }`}
                        >
                            <CalendarDays size={13} /> Months ({regularMonths.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('festivals')}
                            className={`px-3.5 py-1.5 rounded-xl border border-transparent transition-all flex items-center gap-1.5 ${
                                activeTab === 'festivals' 
                                    ? tabActiveCls 
                                    : isLightModal 
                                    ? 'text-[#2b1810]/70 hover:text-[#2b1810] hover:bg-black/5' 
                                    : 'opacity-70 hover:opacity-100 text-inherit'
                            }`}
                        >
                            <Star size={13} /> Festivals &amp; Intercalary ({festivals.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('settings')}
                            className={`px-3.5 py-1.5 rounded-xl border border-transparent transition-all flex items-center gap-1.5 ${
                                activeTab === 'settings' 
                                    ? tabActiveCls 
                                    : isLightModal 
                                    ? 'text-[#2b1810]/70 hover:text-[#2b1810] hover:bg-black/5' 
                                    : 'opacity-70 hover:opacity-100 text-inherit'
                            }`}
                        >
                            <Compass size={13} /> Weekdays &amp; General
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('leap')}
                            className={`px-3.5 py-1.5 rounded-xl border border-transparent transition-all flex items-center gap-1.5 ${
                                activeTab === 'leap' 
                                    ? tabActiveCls 
                                    : isLightModal 
                                    ? 'text-[#2b1810]/70 hover:text-[#2b1810] hover:bg-black/5' 
                                    : 'opacity-70 hover:opacity-100 text-inherit'
                            }`}
                        >
                            <Clock size={13} /> Leap Epoch Rules
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('preview')}
                            className={`px-3.5 py-1.5 rounded-xl border border-transparent transition-all flex items-center gap-1.5 ${
                                activeTab === 'preview' 
                                    ? tabActiveCls 
                                    : isLightModal 
                                    ? 'text-[#2b1810]/70 hover:text-[#2b1810] hover:bg-black/5' 
                                    : 'opacity-70 hover:opacity-100 text-inherit'
                            }`}
                        >
                            <Sparkles size={13} /> Date Playground
                        </button>
                    </div>

                    {/* Quick Summary Badges */}
                    <div className="flex items-center gap-2 text-xs font-mono">
                        <span className={`px-2.5 py-1 rounded-xl border backdrop-blur-sm ${
                            isRoyal ? 'bg-white border-[#c8a96e]/60 text-[#2b1810] font-bold shadow-xs' 
                            : isWiki ? 'bg-white/90 border-[#d4c8af] text-[#2b1810]' 
                            : isVoyager ? 'bg-[#241208]/80 border-[#3d2617] text-[#f0dca8]'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300'
                        }`}>
                            {standardYearDays} Days/Year
                        </span>
                        {localCal.leapRule && (
                            <span className={`px-2.5 py-1 rounded-xl border backdrop-blur-sm font-semibold ${
                                isRoyal ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs'
                                : isWiki ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            }`}>
                                {leapYearDays}d Leap
                            </span>
                        )}
                        <span className={`px-2.5 py-1 rounded-xl border backdrop-blur-sm ${
                            isRoyal ? 'bg-white border-[#c8a96e]/60 text-[#2b1810] font-bold shadow-xs'
                            : isWiki ? 'bg-white/90 border-[#d4c8af] text-[#2b1810]' 
                            : isVoyager ? 'bg-[#241208]/80 border-[#3d2617] text-[#f0dca8]'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300'
                        }`}>
                            {regularMonths.length}m + {festivals.length}f
                        </span>
                    </div>
                </div>

                {/* ── Content Body ─────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* TAB 1: MONTHS */}
                    {activeTab === 'months' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div>
                                    <h3 className={`text-sm font-bold uppercase tracking-wider font-serif ${
                                        isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#881337]' : isVoyager ? 'text-[#f0dca8]' : 'text-slate-100'
                                    }`}>
                                        Annual Calendar Months
                                    </h3>
                                    <p className={`text-xs ${isLightModal ? 'text-[#2b1810]/70' : 'opacity-60'}`}>
                                        Arrange chronological months, assign number of days, and set seasonal alignment
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddRegularMonth}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                        isRoyal ? 'border-[#c8a96e]/70 text-[#70121e] bg-white hover:bg-[#70121e]/10 shadow-xs font-serif font-bold'
                                        : isWiki ? 'border-red-400 text-red-700 bg-red-50 hover:bg-red-100 font-bold' 
                                        : isVoyager ? 'border-[#2dd4bf]/40 text-[#2dd4bf] bg-[#2dd4bf]/10 hover:bg-[#2dd4bf]/20'
                                        : 'border-[#fef08a]/40 text-[#fef08a] bg-[#fef08a]/10 hover:bg-[#fef08a]/20'
                                    }`}
                                >
                                    <Plus size={14} /> Add Month
                                </button>
                            </div>

                            {/* Months Table List */}
                            <div className="space-y-2.5">
                                {regularMonths.map((m, idx) => (
                                    <div
                                        key={m.id}
                                        className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${cardBgCls}`}
                                    >
                                        <div className="flex flex-col gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = moveRegularMonth(m.id, 'up', localCal.months);
                                                    setLocalCal({ ...localCal, months: updated });
                                                }}
                                                disabled={idx === 0}
                                                className={`p-1 rounded ${isLightModal ? 'hover:bg-black/5 text-[#2b1810]' : 'hover:bg-white/10'} disabled:opacity-20 transition-opacity`}
                                                title="Move month earlier"
                                            >
                                                <ArrowUp size={12} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = moveRegularMonth(m.id, 'down', localCal.months);
                                                    setLocalCal({ ...localCal, months: updated });
                                                }}
                                                disabled={idx === regularMonths.length - 1}
                                                className={`p-1 rounded ${isLightModal ? 'hover:bg-black/5 text-[#2b1810]' : 'hover:bg-white/10'} disabled:opacity-20 transition-opacity`}
                                                title="Move month later"
                                            >
                                                <ArrowDown size={12} />
                                            </button>
                                        </div>

                                        <span className={`w-8 text-center font-mono text-xs shrink-0 font-bold ${
                                            isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#881337]' : isVoyager ? 'text-[#2dd4bf]' : 'text-[#fef08a]'
                                        }`}>
                                            #{String(idx + 1).padStart(2, '0')}
                                        </span>

                                        {/* Month Name */}
                                        <div className="flex-1 min-w-[140px]">
                                            <input
                                                type="text"
                                                value={m.name}
                                                onChange={e => handleUpdateMonth(m.id, { name: e.target.value })}
                                                placeholder="Month Name (e.g. Ches, Morning Star)"
                                                className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold ${inputCls}`}
                                            />
                                        </div>

                                        {/* Days Input */}
                                        <div className="w-24 shrink-0">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    value={m.days}
                                                    onChange={e => handleUpdateMonth(m.id, { days: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                                                    className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono text-center pr-6 ${inputCls}`}
                                                />
                                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono opacity-50 pointer-events-none">days</span>
                                            </div>
                                        </div>

                                        {/* Abbreviation */}
                                        <div className="w-20 shrink-0">
                                            <input
                                                type="text"
                                                maxLength={5}
                                                value={m.abbreviation || ''}
                                                onChange={e => handleUpdateMonth(m.id, { abbreviation: e.target.value })}
                                                placeholder="Abbr"
                                                className={`w-full px-2 py-1.5 rounded-xl border text-xs font-mono text-center ${inputCls}`}
                                                title="Short abbreviation used on compact cards"
                                            />
                                        </div>

                                        {/* Season dropdown */}
                                        <div className="w-32 shrink-0">
                                            <select
                                                value={m.season || 'neutral'}
                                                onChange={e => handleUpdateMonth(m.id, { season: e.target.value })}
                                                className={`w-full px-2.5 py-1.5 rounded-xl border text-xs ${inputCls}`}
                                            >
                                                <option value="spring">Spring 🌱</option>
                                                <option value="summer">Summer ☀️</option>
                                                <option value="autumn">Autumn 🍂</option>
                                                <option value="winter">Winter ❄️</option>
                                                <option value="neutral">Neutral ✨</option>
                                            </select>
                                        </div>

                                        {/* Delete Month */}
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteMonth(m.id)}
                                            disabled={regularMonths.length <= 1}
                                            className="p-2 rounded-xl hover:bg-red-500/20 text-red-500 disabled:opacity-20 transition-all shrink-0"
                                            title="Delete Month"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: FESTIVALS & INTERCALARY DAYS */}
                    {activeTab === 'festivals' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div>
                                    <h3 className={`text-sm font-bold uppercase tracking-wider font-serif ${
                                        isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#881337]' : isVoyager ? 'text-[#2dd4bf]' : 'text-[#fef08a]'
                                    }`}>
                                        Festivals &amp; Intercalary Days
                                    </h3>
                                    <p className={`text-xs ${isLightModal ? 'text-[#2b1810]/70' : 'opacity-60'}`}>
                                        Standalone sacred holidays and seasonal festivals that sit outside normal month day numbering
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddFestival}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                        isVoyager ? 'border-[#2dd4bf]/40 text-[#2dd4bf] bg-[#2dd4bf]/10 hover:bg-[#2dd4bf]/20'
                                        : isRoyal ? 'border-2 border-[#c8a96e] text-[#70121e] bg-[#fff7e6] hover:bg-[#ffeed0] shadow-xs font-serif font-bold'
                                        : isWiki ? 'border-amber-400 text-amber-800 bg-amber-50 hover:bg-amber-100 font-bold'
                                        : 'border-[#fef08a]/40 text-[#fef08a] bg-[#fef08a]/10 hover:bg-[#fef08a]/20'
                                    }`}
                                >
                                    <Sun size={14} /> Add Festival Day
                                </button>
                            </div>

                            {festivals.length === 0 ? (
                                <div className={`p-8 rounded-3xl border text-center space-y-3 ${
                                    isRoyal ? 'bg-[#fffdfa] border-[#c8a96e]/50'
                                    : isWiki ? 'bg-amber-50/50 border-[#d4c8af]'
                                    : 'bg-slate-900/40 border-slate-800'
                                }`}>
                                    <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center border ${iconAccent}`}>
                                        <Star size={24} />
                                    </div>
                                    <div className="max-w-md mx-auto space-y-1">
                                        <p className="font-bold text-sm">No Standalone Festivals Configured</p>
                                        <p className={`text-xs ${isLightModal ? 'text-[#2b1810]/70' : 'opacity-60'}`}>
                                            Intercalary days are standalone holiday days between months (such as Midsummer, Shieldmeet, or Greengrass in Harptos). Click the button below to add your first festival day.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddFestival}
                                        className={`mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                                            isRoyal ? 'bg-[#70121e] text-[#fff8e7] border-[#70121e] hover:bg-[#851624]'
                                            : isWiki ? 'bg-red-700 text-white hover:bg-red-800'
                                            : isVoyager ? 'bg-[#2dd4bf] text-black hover:bg-[#14b8a6]'
                                            : 'bg-[#fef08a] text-black hover:bg-[#fde047]'
                                        }`}
                                    >
                                        <Plus size={14} /> Add First Festival Day
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {festivals.map(fest => {
                                        const curPos = getFestivalPosition(fest.id, localCal.months);
                                        const isLeapTarget = localCal.leapRule?.targetMonthId === fest.id;

                                        return (
                                            <div
                                                key={fest.id}
                                                className={`p-4 rounded-2xl border space-y-3 transition-all ${
                                                    isVoyager ? 'bg-[#241208]/70 border-[#2dd4bf]/30 shadow-[0_0_20px_rgba(45,212,191,0.08)]'
                                                    : isRoyal ? 'bg-[#fffcf5] border-2 border-[#c8a96e] text-[#2b1810] shadow-sm'
                                                    : isWiki ? 'bg-amber-50/60 border-amber-300 text-[#2b1810]'
                                                    : 'bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-slate-900/60 border-[#fef08a]/30'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <div className={`p-2 rounded-xl border shrink-0 ${iconAccent}`}>
                                                        <Star size={16} />
                                                    </div>

                                                    {/* Festival Name */}
                                                    <div className="flex-1 min-w-[160px]">
                                                        <input
                                                            type="text"
                                                            value={fest.name}
                                                            onChange={e => handleUpdateMonth(fest.id, { name: e.target.value })}
                                                            placeholder="Festival Name (e.g. Midsummer, Yestarë)"
                                                            className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold ${inputCls}`}
                                                        />
                                                    </div>

                                                    {/* Days */}
                                                    <div className="w-24 shrink-0">
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="30"
                                                                value={fest.days}
                                                                onChange={e => handleUpdateMonth(fest.id, { days: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                                                                className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono text-center pr-6 ${inputCls}`}
                                                            />
                                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono opacity-50 pointer-events-none">d</span>
                                                        </div>
                                                    </div>

                                                    {/* Abbreviation */}
                                                    <div className="w-20 shrink-0">
                                                        <input
                                                            type="text"
                                                            maxLength={5}
                                                            value={fest.abbreviation || ''}
                                                            onChange={e => handleUpdateMonth(fest.id, { abbreviation: e.target.value })}
                                                            placeholder="Abbr"
                                                            className={`w-full px-2 py-1.5 rounded-xl border text-xs font-mono text-center ${inputCls}`}
                                                        />
                                                    </div>

                                                    {/* Season */}
                                                    <div className="w-32 shrink-0">
                                                        <select
                                                            value={fest.season || 'summer'}
                                                            onChange={e => handleUpdateMonth(fest.id, { season: e.target.value })}
                                                            className={`w-full px-2.5 py-1.5 rounded-xl border text-xs ${inputCls}`}
                                                        >
                                                            <option value="spring">Spring 🌱</option>
                                                            <option value="summer">Summer ☀️</option>
                                                            <option value="autumn">Autumn 🍂</option>
                                                            <option value="winter">Winter ❄️</option>
                                                            <option value="neutral">Neutral ✨</option>
                                                        </select>
                                                    </div>

                                                    {/* Delete */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteMonth(fest.id)}
                                                        className="p-2 rounded-xl hover:bg-red-500/20 text-red-500 transition-all shrink-0"
                                                        title="Delete Festival Day"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                {/* Position in Calendar Selector & Leap Association */}
                                                <div className={`pt-2.5 border-t flex items-center justify-between gap-4 flex-wrap text-xs ${
                                                    isRoyal ? 'border-[#c8a96e]/30' : isWiki ? 'border-amber-200' : 'border-white/10'
                                                }`}>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${
                                                            isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#881337]' : isVoyager ? 'text-[#2dd4bf]' : 'text-[#fef08a]'
                                                        }`}>
                                                            Calendar Sequence Position:
                                                        </span>
                                                        <select
                                                            value={curPos}
                                                            onChange={e => {
                                                                const updated = moveFestivalToPosition(fest.id, e.target.value, localCal.months);
                                                                setLocalCal({ ...localCal, months: updated });
                                                            }}
                                                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${inputCls}`}
                                                        >
                                                            <option value="start">At Start of Year (Before First Month)</option>
                                                            {regularMonths.map(m => (
                                                                <option key={m.id} value={`after:${m.id}`}>
                                                                    Celebrated after {m.name}
                                                                </option>
                                                            ))}
                                                            <option value="end">At End of Year (After Last Month)</option>
                                                        </select>
                                                    </div>

                                                    {/* Leap day association chip */}
                                                    <div className="flex items-center gap-2">
                                                        {isLeapTarget ? (
                                                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                                ✦ Quadrennial Leap Target (+{localCal.leapRule?.extraDays}d)
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setLocalCal({
                                                                        ...localCal,
                                                                        leapRule: {
                                                                            frequency: localCal.leapRule?.frequency || 4,
                                                                            extraDays: localCal.leapRule?.extraDays || 1,
                                                                            targetMonthId: fest.id,
                                                                            leapDayName: fest.name
                                                                        }
                                                                    });
                                                                }}
                                                                className={`px-2 py-1 rounded-lg border text-[10px] font-semibold transition-all ${
                                                                    isLightModal ? 'border-black/10 hover:bg-black/5 text-[#2b1810]/70' : 'border-white/10 hover:bg-white/5 opacity-70 hover:opacity-100 text-inherit'
                                                                }`}
                                                                title="Set this festival as the target that receives extra days during leap years"
                                                            >
                                                                Set as Leap Festival
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: WEEKDAYS & GENERAL */}
                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            {/* Card 1: Chronicle Lore & Epoch Identity */}
                            <div className={`p-5 rounded-2xl border space-y-4 backdrop-blur-md ${cardBgCls}`}>
                                <h4 className={`text-xs font-bold uppercase tracking-wider font-serif ${
                                    isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#881337]' : isVoyager ? 'text-[#2dd4bf]' : 'text-[#fef08a]'
                                }`}>
                                    Chronicle Lore &amp; Epoch Identity
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                                            Calendar Name
                                        </label>
                                        <input
                                            type="text"
                                            value={localCal.name}
                                            onChange={e => setLocalCal({ ...localCal, name: e.target.value })}
                                            placeholder="e.g. Calendar of Harptos, Imperial Sol"
                                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold ${inputCls}`}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                                            Year Epoch Suffix
                                        </label>
                                        <input
                                            type="text"
                                            value={localCal.yearSuffix || ''}
                                            onChange={e => setLocalCal({ ...localCal, yearSuffix: e.target.value })}
                                            placeholder="e.g. DR, AR, TA, CE, 4E"
                                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold ${inputCls}`}
                                        />
                                        <p className="text-[10px] opacity-50">Appears after year numbers (e.g. 1372 DR, 4E 201)</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                                        Chronicle Lore Description
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={localCal.description || ''}
                                        onChange={e => setLocalCal({ ...localCal, description: e.target.value })}
                                        placeholder="Historical origins, cultural adoption, or astronomical basis of this reckoning..."
                                        className={`w-full px-3.5 py-2 rounded-xl border text-xs ${inputCls}`}
                                    />
                                </div>
                            </div>

                            {/* Card 2: Planetary Weekday Cycle */}
                            <div className={`p-5 rounded-2xl border space-y-4 backdrop-blur-md ${cardBgCls}`}>
                                <h4 className={`text-xs font-bold uppercase tracking-wider font-serif ${
                                    isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#881337]' : isVoyager ? 'text-[#2dd4bf]' : 'text-[#fef08a]'
                                }`}>
                                    Planetary Weekday Cycle
                                </h4>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                                        Days per Week Cycle (Tenday / Standard)
                                    </label>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <input
                                            type="number"
                                            min="1"
                                            max="30"
                                            value={localCal.daysPerWeek}
                                            onChange={e => {
                                                const d = Math.max(1, parseInt(e.target.value, 10) || 7);
                                                setLocalCal({ ...localCal, daysPerWeek: d });
                                            }}
                                            className={`w-24 px-3.5 py-2 rounded-xl border text-sm font-mono text-center ${inputCls}`}
                                        />
                                        <div className="flex items-center gap-2">
                                            {[
                                                { label: '7-Day Week', count: 7 },
                                                { label: '10-Day Tenday', count: 10 },
                                                { label: '8-Day Octan', count: 8 },
                                                { label: '5-Day Pentad', count: 5 }
                                            ].map(opt => (
                                                <button
                                                    key={opt.count}
                                                    type="button"
                                                    onClick={() => setLocalCal({ ...localCal, daysPerWeek: opt.count })}
                                                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                                                        localCal.daysPerWeek === opt.count
                                                            ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] border-[#70121e]'
                                                              : isWiki ? 'bg-red-700 text-white border-red-700'
                                                              : isVoyager ? 'bg-[#2dd4bf]/20 text-[#2dd4bf] border-[#2dd4bf]'
                                                              : 'bg-[#fef08a]/20 text-[#fef08a] border-[#fef08a]'
                                                            : isLightModal ? 'border-black/10 hover:bg-black/5 text-[#2b1810]/70'
                                                            : 'border-white/10 hover:bg-white/5 opacity-70 hover:opacity-100 text-inherit'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                                        Weekday Names (Comma Separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={(localCal.weekDayNames || []).join(', ')}
                                        onChange={e => {
                                            const names = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                            setLocalCal({ ...localCal, weekDayNames: names });
                                        }}
                                        placeholder="Sunday, Monday, Tuesday, ... or Moonday, Toilday, Wealday, ..."
                                        className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono ${inputCls}`}
                                    />
                                    <div className="flex items-center gap-2 flex-wrap pt-2">
                                        {(localCal.weekDayNames || []).map((name, i) => (
                                            <span 
                                                key={i} 
                                                className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 ${
                                                    isRoyal ? 'bg-white border-[#c8a96e]/60 text-[#2b1810] shadow-xs'
                                                    : isWiki ? 'bg-white border-[#d4c8af] text-[#2b1810]'
                                                    : isVoyager ? 'bg-[#180c04] border-[#3d2617] text-[#f0dca8]'
                                                    : 'bg-slate-900 border-slate-800 text-slate-200'
                                                }`}
                                            >
                                                <span className={`text-[10px] font-bold ${
                                                    isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#881337]' : isVoyager ? 'text-[#2dd4bf]' : 'text-[#fef08a]'
                                                }`}>
                                                    {i + 1}:
                                                </span>
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: LEAP EPOCH RULES */}
                    {activeTab === 'leap' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className={`text-sm font-bold uppercase tracking-wider font-serif ${
                                    isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#881337]' : isVoyager ? 'text-[#2dd4bf]' : 'text-slate-100'
                                }`}>
                                    Astronomical Leap Cycle &amp; Intercalary Adjustment
                                </h3>
                                <p className={`text-xs ${isLightModal ? 'text-[#2b1810]/70' : 'opacity-60'}`}>
                                    Define quadrennial or periodic leap days to prevent seasonal drift across long world eras
                                </p>
                            </div>

                            <div className={`p-5 rounded-2xl border space-y-4 backdrop-blur-md ${cardBgCls}`}>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(localCal.leapRule)}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                const defaultTarget = festivals.length > 0 ? festivals[0].id : regularMonths[1]?.id;
                                                setLocalCal({
                                                    ...localCal,
                                                    leapRule: {
                                                        frequency: 4,
                                                        extraDays: 1,
                                                        targetMonthId: defaultTarget,
                                                        leapDayName: 'Leap Day'
                                                    }
                                                });
                                            } else {
                                                setLocalCal({
                                                    ...localCal,
                                                    leapRule: undefined
                                                });
                                            }
                                        }}
                                        className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                                    />
                                    <span className="text-xs font-bold uppercase tracking-wide">
                                        Enable Astronomical Leap Year Cycle
                                    </span>
                                </label>

                                {localCal.leapRule && (
                                    <div className="space-y-4 pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                                                    Frequency (Every N Years)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="1000"
                                                    value={localCal.leapRule.frequency}
                                                    onChange={e => {
                                                        const freq = Math.max(1, parseInt(e.target.value, 10) || 4);
                                                        setLocalCal({
                                                            ...localCal,
                                                            leapRule: { ...localCal.leapRule!, frequency: freq }
                                                        });
                                                    }}
                                                    className={`w-full px-3.5 py-2 rounded-xl border text-sm font-mono text-center ${inputCls}`}
                                                />
                                                <p className="text-[10px] opacity-50">e.g. Every 4 years</p>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                                                    Extra Days Added
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="30"
                                                    value={localCal.leapRule.extraDays}
                                                    onChange={e => {
                                                        const days = Math.max(1, parseInt(e.target.value, 10) || 1);
                                                        setLocalCal({
                                                            ...localCal,
                                                            leapRule: { ...localCal.leapRule!, extraDays: days }
                                                        });
                                                    }}
                                                    className={`w-full px-3.5 py-2 rounded-xl border text-sm font-mono text-center ${inputCls}`}
                                                />
                                                <p className="text-[10px] opacity-50">Usually 1 extra day</p>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                                                    Leap Day / Festival Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={localCal.leapRule.leapDayName || ''}
                                                    onChange={e => {
                                                        setLocalCal({
                                                            ...localCal,
                                                            leapRule: { ...localCal.leapRule!, leapDayName: e.target.value }
                                                        });
                                                    }}
                                                    placeholder="e.g. Shieldmeet, February 29"
                                                    className={`w-full px-3.5 py-2 rounded-xl border text-sm font-semibold ${inputCls}`}
                                                />
                                                <p className="text-[10px] opacity-50">Name of the bonus day</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                                                Target Month or Festival Receiving Extra Days
                                            </label>
                                            <select
                                                value={localCal.leapRule.targetMonthId || ''}
                                                onChange={e => {
                                                    setLocalCal({
                                                        ...localCal,
                                                        leapRule: { ...localCal.leapRule!, targetMonthId: e.target.value || undefined }
                                                    });
                                                }}
                                                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold ${inputCls}`}
                                            >
                                                <optgroup label="Festivals & Intercalary Days">
                                                    {festivals.map(f => (
                                                        <option key={f.id} value={f.id}>
                                                            ★ {f.name} (Festival)
                                                        </option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Regular Calendar Months">
                                                    {regularMonths.map(m => (
                                                        <option key={m.id} value={m.id}>
                                                            {m.name} ({m.days} days)
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 5: DATE PLAYGROUND */}
                    {activeTab === 'preview' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className={`text-sm font-bold uppercase tracking-wider font-serif ${
                                    isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#881337]' : isVoyager ? 'text-[#2dd4bf]' : 'text-slate-100'
                                }`}>
                                    Interactive Date Playground &amp; Conversion Validator
                                </h3>
                                <p className={`text-xs ${isLightModal ? 'text-[#2b1810]/70' : 'opacity-60'}`}>
                                    Test how dates in your custom calendar resolve, format, and calculate leap cycles
                                </p>
                            </div>

                            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl border backdrop-blur-md ${cardBgCls}`}>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                                        Test Year
                                    </label>
                                    <input
                                        type="number"
                                        value={testYear}
                                        onChange={e => setTestYear(parseInt(e.target.value, 10) || 0)}
                                        className={`w-full px-3.5 py-2 rounded-xl border text-sm font-mono text-center ${inputCls}`}
                                    />
                                    <div className="text-[10px] font-mono mt-1">
                                        {isLeapYear(testYear, localCal) ? (
                                            <span className="text-emerald-600 font-bold">✓ Leap Year ({getDaysInYear(testYear, localCal)} days)</span>
                                        ) : (
                                            <span className={`${isLightModal ? 'text-[#2b1810]/70' : 'opacity-60'}`}>Standard Year ({getDaysInYear(testYear, localCal)} days)</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                                        Test Month / Holiday
                                    </label>
                                    <select
                                        value={testMonthIdx}
                                        onChange={e => setTestMonthIdx(parseInt(e.target.value, 10))}
                                        className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold ${inputCls}`}
                                    >
                                        {localCal.months.map((m, idx) => (
                                            <option key={m.id} value={idx}>
                                                {m.name} ({m.days}d) {m.isIntercalary ? '★ Festival' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                                        Test Day
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={localCal.months[testMonthIdx]?.days || 30}
                                        value={testDay}
                                        onChange={e => setTestDay(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                        className={`w-full px-3.5 py-2 rounded-xl border text-sm font-mono text-center ${inputCls}`}
                                    />
                                </div>
                            </div>

                            {/* Live Result Display */}
                            <div className={`p-6 rounded-3xl border text-center space-y-2 backdrop-blur-md shadow-inner ${
                                isRoyal ? 'bg-[#fffdfa] border-2 border-[#c8a96e]/70 shadow-md text-[#2b1810]'
                                : isWiki ? 'bg-gradient-to-b from-[#f4efe4] to-white border-[#d4c8af]'
                                : isVoyager ? 'bg-gradient-to-b from-[#241208]/80 to-[#180c04]/80 border-[#2dd4bf]/25'
                                : 'bg-gradient-to-b from-slate-800/50 to-slate-900/60 border-slate-700/50'
                            }`}>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isLightModal ? 'text-[#2b1810]/60' : 'opacity-50'}`}>
                                    Chronicle Lore Output
                                </span>
                                <div className={`text-2xl font-serif font-black tracking-wide ${
                                    isRoyal ? 'text-[#3d0a10]'
                                    : isWiki ? 'text-[#881337]'
                                    : isVoyager ? 'text-[#2dd4bf]'
                                    : 'text-[#fef08a]'
                                }`}>
                                    {formatFantasyDate(
                                        testYear,
                                        localCal.months[testMonthIdx]?.name,
                                        localCal.months[testMonthIdx]?.isIntercalary ? undefined : testDay,
                                        localCal.months[testMonthIdx]?.isIntercalary,
                                        localCal
                                    )}
                                </div>
                                <p className={`text-xs font-mono ${isLightModal ? 'text-[#2b1810]/70' : 'opacity-60'}`}>
                                    Season: {localCal.months[testMonthIdx]?.season || 'Neutral'} · 
                                    {localCal.months[testMonthIdx]?.isIntercalary ? ' Intercalary Festival Day' : ` Month ${testMonthIdx + 1}`}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Footer Controls ──────────────────────────────────────── */}
                <div className={`p-4 border-t flex items-center justify-between gap-3 shrink-0 ${
                    isRoyal ? 'border-[#c8a96e]/40 bg-[#f4efe4]/60'
                    : isWiki ? 'border-[#d4c8af] bg-[#fcfbf9]' 
                    : isVoyager ? 'border-[#3d2617] bg-[#1a0f07]/80'
                    : 'border-white/10 bg-slate-950/40'
                }`}>
                    <button
                        type="button"
                        onClick={() => setIsConfirmResetOpen(true)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition-all font-sans ${
                            isRoyal ? 'border-[#c8a96e]/60 text-[#2b1810] hover:bg-black/5 bg-white font-serif'
                            : isWiki ? 'border-[#d4c8af] text-[#2b1810] hover:bg-black/5' 
                            : 'border-white/10 hover:bg-white/5 opacity-70 hover:opacity-100 text-inherit'
                        }`}
                        title="Reset calendar to default Solar Standard (Gregorian)"
                    >
                        <RotateCcw size={13} /> Reset to Default
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all font-sans ${
                                isRoyal ? 'border-[#c8a96e]/60 text-[#2b1810] hover:bg-black/5 bg-white font-serif'
                                : isWiki ? 'border-[#d4c8af] text-[#2b1810] hover:bg-black/5' 
                                : 'border-white/15 hover:bg-white/5 text-inherit'
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all font-sans ${saveBtnCls}`}
                        >
                            <Check size={14} /> Save Calendar System
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Confirmation Prompt for Reset to Default ─────────────── */}
            {isConfirmResetOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl backdrop-blur-2xl space-y-4 ${modalCard}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-2xl border ${
                                isRoyal ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : isWiki ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}>
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h3 className={`text-base font-bold uppercase tracking-wider font-serif ${
                                    isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#881337]' : isVoyager ? 'text-[#f0dca8]' : 'text-slate-100'
                                }`}>
                                    Reset Calendar to Default?
                                </h3>
                                <p className={`text-xs ${isLightModal ? 'text-[#2b1810]/70' : 'opacity-60'}`}>
                                    Restore Solar Standard (Gregorian)
                                </p>
                            </div>
                        </div>

                        <p className={`text-xs leading-relaxed ${isLightModal ? 'text-[#2b1810]/80' : 'opacity-75'}`}>
                            This will replace all configured months, festivals, weekly cycles, and leap rules with the default 12-month Solar Standard (Gregorian) calendar. Unsaved customizations will be lost.
                        </p>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsConfirmResetOpen(false)}
                                className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                                    isRoyal ? 'border-[#c8a96e]/60 text-[#2b1810] hover:bg-black/5 bg-white'
                                    : isWiki ? 'border-[#d4c8af] text-[#2b1810] hover:bg-black/5'
                                    : 'border-white/10 hover:bg-white/5 opacity-80 hover:opacity-100 text-inherit'
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleApplyPreset('solar');
                                    setIsConfirmResetOpen(false);
                                    setActiveTab('months');
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                    isRoyal ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#851624] shadow-md font-serif'
                                    : isWiki ? 'bg-red-700 text-white hover:bg-red-800'
                                    : isVoyager ? 'bg-[#2dd4bf] text-black hover:bg-[#14b8a6]'
                                    : 'bg-amber-400 text-black hover:bg-amber-300'
                                }`}
                            >
                                Confirm Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
};
