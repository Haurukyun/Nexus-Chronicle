import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, Plus, Trash2, Sparkles, Check, Calendar, ArrowUp, ArrowDown, 
    RotateCcw, Sun, Moon, Clock, Compass, HelpCircle, Layers, CalendarDays
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
        return JSON.parse(JSON.stringify(DEFAULT_CALENDAR_PRESETS.harptos.calendar));
    });

    const [activeTab, setActiveTab] = useState<'months' | 'settings' | 'leap' | 'preview'>('months');

    // Date test playground state
    const [testYear, setTestYear] = useState<number>(1372);
    const [testMonthIdx, setTestMonthIdx] = useState<number>(0);
    const [testDay, setTestDay] = useState<number>(1);

    if (!isOpen) return null;

    const handleApplyPreset = (presetKey: string) => {
        const preset = DEFAULT_CALENDAR_PRESETS[presetKey];
        if (preset) {
            setLocalCal(JSON.parse(JSON.stringify(preset.calendar)));
        }
    };

    const handleAddMonth = (isIntercalary: boolean = false) => {
        const id = crypto.randomUUID();
        const newMonth: FantasyMonth = {
            id,
            name: isIntercalary ? `Festival of the Sun` : `Month ${localCal.months.length + 1}`,
            days: isIntercalary ? 1 : 30,
            abbreviation: isIntercalary ? 'Fest' : `M${localCal.months.length + 1}`,
            season: isIntercalary ? 'summer' : 'spring',
            isIntercalary
        };
        setLocalCal({
            ...localCal,
            months: [...localCal.months, newMonth]
        });
    };

    const handleUpdateMonth = (id: string, updates: Partial<FantasyMonth>) => {
        setLocalCal({
            ...localCal,
            months: localCal.months.map(m => m.id === id ? { ...m, ...updates } : m)
        });
    };

    const handleDeleteMonth = (id: string) => {
        if (localCal.months.length <= 1) return;
        setLocalCal({
            ...localCal,
            months: localCal.months.filter(m => m.id !== id)
        });
    };

    const handleMoveMonth = (idx: number, direction: 'up' | 'down') => {
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= localCal.months.length) return;
        const newMonths = [...localCal.months];
        const [moved] = newMonths.splice(idx, 1);
        newMonths.splice(targetIdx, 0, moved);
        setLocalCal({
            ...localCal,
            months: newMonths
        });
    };

    const handleSave = () => {
        onSaveCalendar(localCal);
        onClose();
    };

    // Derived statistics
    const standardYearDays = getDaysInYear(1001, localCal);
    const leapYearDays = getDaysInYear(1000, localCal);
    const regularMonthsCount = localCal.months.filter(m => !m.isIntercalary).length;
    const intercalaryCount = localCal.months.filter(m => m.isIntercalary).length;

    const isSovereign = themeId === 'sovereign';
    const isVoyager   = themeId === 'grand-voyager';
    const isRoyal     = themeId === 'royal-codex';
    const isWiki      = layoutMode === 'wiki';
    const isLightModal = isWiki || isRoyal;

    const modalCard = isVoyager
        ? 'bg-[#180c04]/90 border-[#3d2617]/90 text-[#f0dca8] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-[#2dd4bf]/20'
        : isRoyal
        ? 'bg-[#fcfaf2] border-2 border-[#c8a96e]/80 text-[#2b1810] shadow-[0_25px_60px_-15px_rgba(60,30,10,0.4)] font-serif'
        : isWiki
        ? 'bg-[#fcfbf9]/95 border-[#d4c8af] text-[#2b1810] shadow-[0_25px_60px_-15px_rgba(80,50,20,0.2)]'
        : 'bg-slate-900/85 border-slate-700/60 text-slate-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/10';

    const iconAccent = isVoyager ? 'bg-[#2dd4bf]/15 text-[#2dd4bf]'
                     : isRoyal   ? 'bg-[#70121e]/10 text-[#70121e]'
                     : isWiki    ? 'bg-red-500/10 text-red-600'
                     :             'bg-[#fef08a]/10 text-[#fef08a]';

    const inputCls = isVoyager ? 'bg-[#241208]/90 border-[#3d2617]/80 text-[#f0dca8] focus:border-[#2dd4bf]/50 focus:ring-1 focus:ring-[#2dd4bf]/30'
                   : isRoyal   ? 'bg-[#ffffff] border-2 border-[#c8a96e]/60 text-[#2b1810] placeholder:text-[#2b1810]/40 focus:border-[#70121e] focus:ring-1 focus:ring-[#70121e]/30 shadow-xs'
                   : isWiki    ? 'bg-white border-[#d4c8af] text-[#2b1810] placeholder:text-stone-400 focus:border-red-500 focus:ring-1 focus:ring-red-400 shadow-xs'
                   :             'bg-slate-800/80 border-slate-700/60 text-slate-100 focus:border-[#fef08a]/50 focus:ring-1 focus:ring-[#fef08a]/25';

    const tabActiveCls = isVoyager ? 'bg-[#2dd4bf]/20 text-[#2dd4bf] border-[#2dd4bf]/50 shadow-[0_0_12px_rgba(45,212,191,0.2)]'
                       : isRoyal   ? 'bg-[#70121e] text-[#fff8e7] border-[#70121e] shadow-sm'
                       : isWiki    ? 'bg-red-700 text-white shadow-sm'
                       :             'bg-[#fef08a]/20 text-[#fef08a] border-[#fef08a]/50 shadow-[0_0_12px_rgba(254,240,138,0.2)]';

    const saveBtnCls = isVoyager ? 'bg-[#2dd4bf] text-[#090d08] hover:bg-[#14b8a6] shadow-[0_0_20px_rgba(45,212,191,0.35)]'
                     : isRoyal   ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#851624] shadow-[0_0_20px_rgba(112,18,30,0.35)]'
                     : isWiki    ? 'bg-red-700 text-white hover:bg-red-800 shadow-sm'
                     :             'bg-[#fef08a] text-slate-950 hover:bg-[#fde047] shadow-[0_0_20px_rgba(254,240,138,0.35)]';

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
            <div 
                className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-2xl ${modalCard}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`p-6 border-b flex items-center justify-between shrink-0 ${
                    isRoyal ? 'border-[#c8a96e]/40 bg-[#f4efe4]/30' : isWiki ? 'border-[#d4c8af]' : 'border-white/10'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${iconAccent} ${
                            isRoyal ? 'border-[#70121e]/30' : isWiki ? 'border-red-500/20' : 'border-current/20'
                        }`}>
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h2 className={`text-xl font-bold uppercase tracking-wider font-serif ${
                                isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#881337]' : ''
                            }`}>
                                Custom Fantasy Calendar
                            </h2>
                            <p className={`text-xs font-sans ${isLightModal ? 'text-[#2b1810]/70' : 'opacity-60'}`}>
                                Configure fantasy reckoning, unique months, festival holidays, and epoch leap cycles
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-xl transition-colors ${
                            isLightModal ? 'text-[#2b1810] hover:bg-black/10' : 'hover:bg-white/10 opacity-70 hover:opacity-100'
                        }`}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Preset Banner */}
                <div className={`px-6 py-3 border-b flex items-center gap-2 flex-wrap text-xs ${
                    isRoyal ? 'bg-[#f4efe4] border-[#c8a96e]/40' : isWiki ? 'bg-[#f4efe4] border-[#d4c8af]' : 'bg-black/25 border-white/5'
                }`}>
                    <span className={`font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5 mr-1 ${
                        isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#881337]' : 'opacity-70'
                    }`}>
                        <Sparkles size={12} /> Presets:
                    </span>
                    {Object.entries(DEFAULT_CALENDAR_PRESETS).map(([key, p]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => handleApplyPreset(key)}
                            title={p.description}
                            className={`px-3 py-1 rounded-lg border text-xs font-medium transition-all ${
                                isVoyager ? 'border-[#3d2617] hover:border-[#2dd4bf]/40 hover:bg-[#2dd4bf]/10'
                                : isRoyal ? 'border-[#c8a96e]/50 bg-white text-[#2b1810] hover:border-[#70121e] hover:bg-[#70121e]/5 shadow-xs font-serif'
                                : isWiki ? 'border-[#d4c8af] bg-white text-[#2b1810] hover:border-red-400 hover:bg-red-50'
                                : 'border-slate-700 hover:border-[#fef08a]/40 hover:bg-white/5'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Sub-navigation tabs & summary stats */}
                <div className={`px-6 py-3 border-b flex items-center justify-between gap-4 flex-wrap shrink-0 ${
                    isRoyal ? 'border-[#c8a96e]/40' : isWiki ? 'border-[#d4c8af]' : 'border-white/10'
                }`}>
                    <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs font-semibold backdrop-blur-md ${
                        isRoyal ? 'bg-[#ede5d3] border-[#c8a96e]/60'
                        : isWiki ? 'bg-[#eee7d8] border-[#d4c8af]'
                        : isVoyager ? 'bg-black/40 border-[#3d2617]/80'
                        : 'bg-slate-950/50 border-white/10'
                    }`}>
                        <button
                            type="button"
                            onClick={() => setActiveTab('months')}
                            className={`px-3.5 py-1.5 rounded-lg border border-transparent transition-all ${
                                activeTab === 'months' 
                                    ? tabActiveCls 
                                    : isLightModal 
                                    ? 'text-[#2b1810]/70 hover:text-[#2b1810] hover:bg-black/5' 
                                    : 'opacity-70 hover:opacity-100'
                            }`}
                        >
                            Months &amp; Festivals ({localCal.months.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('settings')}
                            className={`px-3.5 py-1.5 rounded-lg border border-transparent transition-all ${
                                activeTab === 'settings' 
                                    ? tabActiveCls 
                                    : isLightModal 
                                    ? 'text-[#2b1810]/70 hover:text-[#2b1810] hover:bg-black/5' 
                                    : 'opacity-70 hover:opacity-100'
                            }`}
                        >
                            Weekdays &amp; General
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('leap')}
                            className={`px-3.5 py-1.5 rounded-lg border border-transparent transition-all ${
                                activeTab === 'leap' 
                                    ? tabActiveCls 
                                    : isLightModal 
                                    ? 'text-[#2b1810]/70 hover:text-[#2b1810] hover:bg-black/5' 
                                    : 'opacity-70 hover:opacity-100'
                            }`}
                        >
                            Leap Epoch Rules
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('preview')}
                            className={`px-3.5 py-1.5 rounded-lg border border-transparent transition-all ${
                                activeTab === 'preview' 
                                    ? tabActiveCls 
                                    : isLightModal 
                                    ? 'text-[#2b1810]/70 hover:text-[#2b1810] hover:bg-black/5' 
                                    : 'opacity-70 hover:opacity-100'
                            }`}
                        >
                            Date Playground
                        </button>
                    </div>

                    {/* Quick Calendar Summary Pill */}
                    <div className="flex items-center gap-2 text-xs font-mono opacity-85">
                        <span className={`px-2.5 py-1 rounded-lg border backdrop-blur-sm ${
                            isRoyal ? 'bg-white border-[#c8a96e]/60 text-[#2b1810] font-bold shadow-xs' 
                            : isWiki ? 'bg-white/90 border-[#d4c8af] text-[#2b1810]' 
                            : 'bg-white/5 border-white/10'
                        }`}>
                            {standardYearDays} Days/Year
                        </span>
                        {localCal.leapRule && (
                            <span className={`px-2.5 py-1 rounded-lg border backdrop-blur-sm font-semibold ${
                                isRoyal ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs'
                                : isWiki ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            }`}>
                                {leapYearDays}d Leap
                            </span>
                        )}
                        <span className={`px-2.5 py-1 rounded-lg border backdrop-blur-sm ${
                            isRoyal ? 'bg-white border-[#c8a96e]/60 text-[#2b1810] font-bold shadow-xs'
                            : isWiki ? 'bg-white/90 border-[#d4c8af] text-[#2b1810]' 
                            : 'bg-white/5 border-white/10'
                        }`}>
                            {regularMonthsCount}m + {intercalaryCount}f
                        </span>
                    </div>
                </div>

                {/* Content body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* TAB 1: MONTHS & FESTIVALS */}
                    {activeTab === 'months' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider">
                                        Annual Months &amp; Intercalary Festival Days
                                    </h3>
                                    <p className="text-xs opacity-60">
                                        Arrange chronological months and special holiday days placed between months
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleAddMonth(false)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                            isRoyal ? 'border-[#c8a96e]/60 text-[#70121e] bg-white hover:bg-[#70121e]/10 shadow-xs'
                                            : isWiki ? 'border-red-400 text-red-700 bg-red-50 hover:bg-red-100' 
                                            : 'border-white/20 hover:bg-white/10'
                                        }`}
                                    >
                                        <Plus size={14} /> Add Month
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAddMonth(true)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                            isVoyager ? 'border-[#2dd4bf]/40 text-[#2dd4bf] bg-[#2dd4bf]/10 hover:bg-[#2dd4bf]/20'
                                            : isRoyal ? 'border-2 border-[#c8a96e] text-[#70121e] bg-[#fff7e6] hover:bg-[#ffeed0] shadow-xs'
                                            : isWiki ? 'border-amber-400 text-amber-800 bg-amber-50 hover:bg-amber-100'
                                            : 'border-[#fef08a]/40 text-[#fef08a] bg-[#fef08a]/10 hover:bg-[#fef08a]/20'
                                        }`}
                                        title="Add a standalone holiday day that falls between months (e.g. Midwinter, Midsummer)"
                                    >
                                        <Sun size={14} /> Add Festival Day
                                    </button>
                                </div>
                            </div>

                            {/* Months List */}
                            <div className="space-y-2">
                                {localCal.months.map((m, idx) => (
                                    <div
                                        key={m.id}
                                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                                            m.isIntercalary
                                                ? isVoyager ? 'bg-[#2dd4bf]/10 border-[#2dd4bf]/30'
                                                  : isRoyal ? 'bg-[#fffbf0] border-2 border-[#c8a96e] text-[#2b1810] shadow-sm'
                                                  : isWiki ? 'bg-amber-50/70 border-amber-300 text-[#2b1810]'
                                                  : 'bg-[#fef08a]/10 border-[#fef08a]/30'
                                                : isRoyal ? 'bg-white border border-[#c8a96e]/60 text-[#2b1810] shadow-xs'
                                                : isWiki ? 'bg-white border-[#d4c8af] text-[#2b1810]' 
                                                : 'bg-black/20 border-white/10'
                                        }`}
                                    >
                                        <div className="flex flex-col gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleMoveMonth(idx, 'up')}
                                                disabled={idx === 0}
                                                className={`p-1 rounded ${isLightModal ? 'hover:bg-black/5 text-[#2b1810]' : 'hover:bg-white/10'} disabled:opacity-20 transition-opacity`}
                                                title="Move earlier in the year"
                                            >
                                                <ArrowUp size={12} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleMoveMonth(idx, 'down')}
                                                disabled={idx === localCal.months.length - 1}
                                                className={`p-1 rounded ${isLightModal ? 'hover:bg-black/5 text-[#2b1810]' : 'hover:bg-white/10'} disabled:opacity-20 transition-opacity`}
                                                title="Move later in the year"
                                            >
                                                <ArrowDown size={12} />
                                            </button>
                                        </div>

                                        <span className={`w-6 text-center font-mono text-xs shrink-0 font-bold ${isLightModal ? 'text-[#2b1810]/70' : 'opacity-50'}`}>
                                            #{idx + 1}
                                        </span>

                                        {/* Name input */}
                                        <div className="flex-1 min-w-[140px]">
                                            <input
                                                type="text"
                                                value={m.name}
                                                onChange={e => handleUpdateMonth(m.id, { name: e.target.value })}
                                                placeholder={m.isIntercalary ? "Festival Name (e.g. Midsummer)" : "Month Name (e.g. Ches)"}
                                                className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold ${inputCls}`}
                                            />
                                        </div>

                                        {/* Days input */}
                                        <div className="w-20 shrink-0">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    value={m.days}
                                                    onChange={e => handleUpdateMonth(m.id, { days: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                                                    className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-mono text-center ${inputCls}`}
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] opacity-40 pointer-events-none">d</span>
                                            </div>
                                        </div>

                                        {/* Abbreviation */}
                                        <div className="w-16 shrink-0">
                                            <input
                                                type="text"
                                                maxLength={5}
                                                value={m.abbreviation || ''}
                                                onChange={e => handleUpdateMonth(m.id, { abbreviation: e.target.value })}
                                                placeholder="Abbr"
                                                className={`w-full px-2 py-1.5 rounded-xl border text-xs font-mono text-center ${inputCls}`}
                                                title="Abbreviation used on compact calendars"
                                            />
                                        </div>

                                        {/* Season dropdown */}
                                        <div className="w-28 shrink-0">
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

                                        {/* Intercalary toggle badge */}
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateMonth(m.id, { isIntercalary: !m.isIntercalary })}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shrink-0 transition-all ${
                                                m.isIntercalary
                                                    ? isRoyal ? 'bg-[#c8a96e]/25 text-[#70121e] border-2 border-[#c8a96e]'
                                                      : isWiki ? 'bg-amber-100 text-amber-900 border-amber-300'
                                                      : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                                    : isRoyal ? 'border-[#c8a96e]/50 text-[#2b1810]/70 hover:text-[#2b1810] hover:bg-black/5'
                                                    : isWiki ? 'border-[#d4c8af] text-[#2b1810]/70 hover:text-[#2b1810] hover:bg-black/5'
                                                    : 'border-white/10 opacity-50 hover:opacity-100'
                                            }`}
                                            title="Toggle whether this is a festival day that stands outside normal month counts"
                                        >
                                            {m.isIntercalary ? '★ Festival' : 'Month'}
                                        </button>

                                        {/* Delete button */}
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteMonth(m.id)}
                                            disabled={localCal.months.length <= 1}
                                            className="p-1.5 rounded-xl hover:bg-red-500/20 text-red-400 disabled:opacity-20 transition-all shrink-0"
                                            title="Delete Month"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 2: WEEKDAYS & GENERAL */}
                    {activeTab === 'settings' && (
                        <div className="space-y-6">
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
                                        placeholder="e.g. DR, AR, TA, CE, Yr"
                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold ${inputCls}`}
                                    />
                                    <p className="text-[10px] opacity-50">Appears after year numbers (e.g. 1372 DR)</p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                                    Chronicle Description / Lore
                                </label>
                                <textarea
                                    rows={2}
                                    value={localCal.description || ''}
                                    onChange={e => setLocalCal({ ...localCal, description: e.target.value })}
                                    placeholder="Historical origins, cultural adoption, or astronomical basis of this reckoning..."
                                    className={`w-full px-3.5 py-2 rounded-xl border text-xs ${inputCls}`}
                                />
                            </div>

                            <div className="border-t pt-4 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                                        Days per Week Cycle (Tenday / Standard)
                                    </label>
                                    <div className="flex items-center gap-3">
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
                                        <span className="text-xs opacity-60">
                                            {localCal.daysPerWeek === 10 ? 'Standard 10-day Tenday (Faerûn)' : `${localCal.daysPerWeek}-day week cycle`}
                                        </span>
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
                                        placeholder="Firstday, Secondday, Thirdday, ..."
                                        className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono ${inputCls}`}
                                    />
                                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                        {(localCal.weekDayNames || []).map((name, i) => (
                                            <span 
                                                key={i} 
                                                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono"
                                            >
                                                {i + 1}: {name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: LEAP EPOCH RULES */}
                    {activeTab === 'leap' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider">
                                    Astronomical Leap Cycle &amp; Intercalary Adjustment
                                </h3>
                                <p className="text-xs opacity-60">
                                    Define quadrennial or periodic leap days to prevent seasonal drift across long ages
                                </p>
                            </div>

                            <div className={`p-5 rounded-2xl border space-y-4 backdrop-blur-md ${
                                isRoyal ? 'bg-[#f4efe4] border-2 border-[#c8a96e]/60 text-[#2b1810]'
                                : isWiki ? 'bg-[#f4efe4]/80 border-[#d4c8af] text-[#2b1810]'
                                : isVoyager ? 'bg-[#241208]/60 border-[#3d2617]/80'
                                : 'bg-slate-800/40 border-slate-700/50'
                            }`}>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(localCal.leapRule)}
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setLocalCal({
                                                    ...localCal,
                                                    leapRule: {
                                                        frequency: 4,
                                                        extraDays: 1,
                                                        leapDayName: 'Shieldmeet'
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
                                        Enable Leap Year Cycle
                                    </span>
                                </label>

                                {localCal.leapRule && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
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
                                                placeholder="e.g. Shieldmeet, Enderi"
                                                className={`w-full px-3.5 py-2 rounded-xl border text-sm font-semibold ${inputCls}`}
                                            />
                                            <p className="text-[10px] opacity-50">Name of the bonus day</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: DATE PLAYGROUND */}
                    {activeTab === 'preview' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider">
                                    Interactive Date Playground &amp; Conversion Validator
                                </h3>
                                <p className="text-xs opacity-60">
                                    Test how dates in your custom calendar resolve, format, and calculate leap cycles
                                </p>
                            </div>

                            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl border backdrop-blur-md ${
                                isRoyal ? 'bg-[#f4efe4] border-2 border-[#c8a96e]/60 text-[#2b1810]'
                                : isWiki ? 'bg-[#f4efe4]/80 border-[#d4c8af] text-[#2b1810]'
                                : isVoyager ? 'bg-[#241208]/60 border-[#3d2617]/80'
                                : 'bg-slate-800/40 border-slate-700/50'
                            }`}>
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

                {/* Footer Controls */}
                <div className={`p-4 border-t flex items-center justify-between gap-3 shrink-0 ${
                    isRoyal ? 'border-[#c8a96e]/40 bg-[#f4efe4]/60'
                    : isWiki ? 'border-[#d4c8af] bg-[#fcfbf9]' 
                    : 'border-white/10'
                }`}>
                    <button
                        type="button"
                        onClick={() => handleApplyPreset('harptos')}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition-all font-sans ${
                            isRoyal ? 'border-[#c8a96e]/60 text-[#2b1810] hover:bg-black/5 bg-white font-serif'
                            : isWiki ? 'border-[#d4c8af] text-[#2b1810] hover:bg-black/5' 
                            : 'border-white/10 hover:bg-white/5 opacity-70 hover:opacity-100 text-inherit'
                        }`}
                    >
                        <RotateCcw size={13} /> Reset to Faerûn
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
        </div>,
        document.body
    );
};
