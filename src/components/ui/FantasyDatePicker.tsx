/**
 * FantasyDatePicker / Date Composer
 * 
 * A compact, premium date composer and calendar system converter.
 * Replaces the legacy month-chip helper with a unified, elegant container
 * supporting Day, Month, and Year controls, plus a rich detailed modal
 * to switch or convert date formats between fantasy calendars (Skyrim, Faerûn, Tolkien, etc.).
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FantasyCalendar, FantasyMonth } from '../../types';
import { DEFAULT_CALENDAR_PRESETS } from '../../utils/timelineUtils';
import { useTheme } from '../../theme';
import { useWorldStore } from '../../store/useWorldStore';
import { Calendar, ArrowRightLeft, Check, X, Sparkles, ChevronLeft, ChevronRight, Globe2 } from 'lucide-react';

interface CalendarOption {
    id: string;
    key: string;
    label: string;
    tag: string;
    description: string;
    yearSuffix?: string;
    calendar: FantasyCalendar;
    isCustom?: boolean;
}

export interface FantasyDatePickerProps {
    startDate?: string;
    endDate?: string;
    onChangeStartDate?: (date: string) => void;
    onChangeEndDate?: (date: string) => void;
    // Fallback single-date API for compatibility
    value?: string;
    onChange?: (date: string) => void;
    label?: string;
    activeCalendar?: FantasyCalendar;
    customPresets?: FantasyCalendar[];
}

/** Predefined universe / lore tags for standard presets */
const PRESET_TAGS: Record<string, { tag: string; description: string }> = {
    solar: {
        tag: 'Earth / Real World',
        description: 'Standard 12-month Gregorian calendar (365 days, leap year in February).'
    },
    tamriel: {
        tag: 'The Elder Scrolls (Skyrim, Cyrodiil)',
        description: 'Imperial calendar of Tamriel with 12 months (Morning Star to Evening Star) and 7-day weeks (Sundas to Loredas).'
    },
    harptos: {
        tag: 'Forgotten Realms (Faerûn / D&D)',
        description: 'Standard reckoning of Toril with 12 months of 30 days, 10-day Tendays, and 5 seasonal intercalary festivals.'
    },
    tolkien: {
        tag: 'Middle-earth (Númenor, Arnor & Gondor)',
        description: "Kings' Reckoning with 12 months of 30 days and 3 festive mid-year days (Yestarë, Loëndë, Mettarë)."
    },
    golarion: {
        tag: 'Pathfinder (Inner Sea Region)',
        description: 'Absalom Reckoning with 12 astrological months (Abadius to Kuthona) and 7-day weeks.'
    }
};

/** Build list of all available calendars */
function getAvailableCalendars(active?: FantasyCalendar, custom?: FantasyCalendar[]): CalendarOption[] {
    const list: CalendarOption[] = [];

    // Built-in presets
    for (const [key, p] of Object.entries(DEFAULT_CALENDAR_PRESETS)) {
        const meta = PRESET_TAGS[key] || { tag: 'Fantasy Setting', description: p.description };
        list.push({
            id: p.calendar.id,
            key,
            label: p.label,
            tag: meta.tag,
            description: meta.description,
            yearSuffix: p.calendar.yearSuffix,
            calendar: p.calendar
        });
    }

    // Active calendar if custom and not in default presets
    if (active && !list.some(c => c.id === active.id)) {
        list.unshift({
            id: active.id,
            key: 'active-custom',
            label: active.name,
            tag: 'Active World Setting',
            description: active.description || 'Active custom world calendar for this realm.',
            yearSuffix: active.yearSuffix,
            calendar: active
        });
    }

    // Custom user presets
    if (custom && custom.length > 0) {
        for (const c of custom) {
            if (!list.some(existing => existing.id === c.id)) {
                list.push({
                    id: c.id,
                    key: `custom-${c.id}`,
                    label: c.name,
                    tag: 'Custom World Preset',
                    description: c.description || 'Custom calendar preset created in this world.',
                    yearSuffix: c.yearSuffix,
                    calendar: c,
                    isCustom: true
                });
            }
        }
    }

    return list;
}

/** Detect which calendar best matches a date string */
function detectCalendarForDate(
    dateStr: string,
    calendars: CalendarOption[],
    defaultCal: FantasyCalendar
): FantasyCalendar {
    if (!dateStr || !dateStr.trim() || !defaultCal) return defaultCal;
    const lower = dateStr.toLowerCase();

    // 1. If currently selected/default calendar already matches, do NOT switch away
    if (defaultCal.months) {
        for (const m of defaultCal.months) {
            if (lower.includes(m.name.toLowerCase()) || 
                (m.abbreviation && new RegExp(`\\b${m.abbreviation}\\b`, 'i').test(lower))) {
                return defaultCal;
            }
        }
    }

    // 2. Otherwise search across other calendars
    for (const opt of calendars) {
        for (const m of opt.calendar.months) {
            if (lower.includes(m.name.toLowerCase()) || 
                (m.abbreviation && new RegExp(`\\b${m.abbreviation}\\b`, 'i').test(lower))) {
                return opt.calendar;
            }
        }
    }
    return defaultCal;
}

/** Parse date string into day, month index, and year */
function parseDateComponents(dateStr: string, cal: FantasyCalendar) {
    if (!dateStr || !dateStr.trim() || !cal.months || cal.months.length === 0) {
        return { day: 1, monthIndex: 0, year: 1, isIntercalary: false };
    }

    const trimmed = dateStr.trim();
    const lower = trimmed.toLowerCase();

    // Year: extract numbers
    const numMatches = (trimmed.match(/\b\d{1,6}\b/g) || []).map(Number);
    let year = 1;
    if (numMatches.length > 0) {
        // Largest number or last number is typically the year
        const sorted = [...numMatches].sort((a, b) => b - a);
        year = sorted[0];
    }

    // Month
    let monthIndex = 0;
    let matchedMonth: FantasyMonth = cal.months[0];
    for (let i = 0; i < cal.months.length; i++) {
        const m = cal.months[i];
        if (lower.includes(m.name.toLowerCase()) || 
            (m.abbreviation && new RegExp(`\\b${m.abbreviation}\\b`, 'i').test(lower))) {
            monthIndex = i;
            matchedMonth = m;
            break;
        }
    }

    // Day
    let day = 1;
    const dayMatches = trimmed.match(/\b([1-9]|[12]\d|3[01])\b/g);
    if (dayMatches && dayMatches.length > 0) {
        const yearStr = Math.abs(year).toString();
        const nonYear = dayMatches.find(m => m !== yearStr && parseInt(m, 10) !== year);
        if (nonYear) {
            day = parseInt(nonYear, 10);
        }
    }

    const maxDay = matchedMonth.isIntercalary ? 1 : (matchedMonth.days || 30);
    day = Math.max(1, Math.min(day, maxDay));

    return {
        day,
        monthIndex,
        year,
        isIntercalary: Boolean(matchedMonth.isIntercalary)
    };
}

/** Serialize day, month, and year into canonical lore string */
function serializeFantasyDate(day: number, month: FantasyMonth, year: number, cal: FantasyCalendar): string {
    const suffix = cal.yearSuffix ? ` ${cal.yearSuffix}` : '';
    if (month.isIntercalary) {
        return `${month.name}, ${year}${suffix}`;
    }
    return `${day} ${month.name}, ${year}${suffix}`;
}

/** Convert a date components structure from one calendar into another */
function convertDateComponents(
    components: { day: number; monthIndex: number; year: number; isIntercalary: boolean },
    sourceCal: FantasyCalendar,
    targetCal: FantasyCalendar
): string {
    // If target has no months, fallback to year
    if (!targetCal.months || targetCal.months.length === 0) {
        return `${components.year}${targetCal.yearSuffix ? ` ${targetCal.yearSuffix}` : ''}`;
    }

    // Match regular month by index ratio or absolute index
    const sourceRegularMonths = sourceCal.months.filter(m => !m.isIntercalary);
    const targetRegularMonths = targetCal.months.filter(m => !m.isIntercalary);

    let targetMonth: FantasyMonth;

    if (components.isIntercalary) {
        // If source was an intercalary festival, try finding a festival in target or fallback to regular month
        const targetFestivals = targetCal.months.filter(m => m.isIntercalary);
        if (targetFestivals.length > 0) {
            targetMonth = targetFestivals[0];
        } else {
            targetMonth = targetRegularMonths[0] || targetCal.months[0];
        }
    } else {
        // Find which regular month this was in source
        const sourceCurrent = sourceCal.months[components.monthIndex];
        const regularIndex = Math.max(0, sourceRegularMonths.indexOf(sourceCurrent));

        // Map to target regular month
        const mappedRegularIndex = Math.min(regularIndex, targetRegularMonths.length - 1);
        targetMonth = targetRegularMonths[mappedRegularIndex] || targetCal.months[0];
    }

    const maxDays = targetMonth.isIntercalary ? 1 : (targetMonth.days || 30);
    const clampedDay = Math.max(1, Math.min(components.day, maxDays));

    return serializeFantasyDate(clampedDay, targetMonth, components.year, targetCal);
}

export const FantasyDatePicker: React.FC<FantasyDatePickerProps> = ({
    startDate = '',
    endDate = '',
    onChangeStartDate,
    onChangeEndDate,
    value,
    onChange,
    label,
    activeCalendar,
    customPresets
}) => {
    const { themeId, layoutMode } = useTheme();
    const setWorld = useWorldStore(state => state.setWorld);

    const isLight = layoutMode === 'wiki' || themeId === 'royal-codex';
    const isRoyal = themeId === 'royal-codex';
    const isVoyager = themeId === 'grand-voyager';

    const accentColor = isRoyal 
        ? '#70121e' 
        : isVoyager 
        ? '#2dd4bf' 
        : layoutMode === 'wiki' 
        ? '#b91c1c' 
        : '#f59e0b'; // Sovereign amber

    // Available calendar options
    const calendarOptions = useMemo(() => 
        getAvailableCalendars(activeCalendar, customPresets), 
        [activeCalendar, customPresets]
    );

    const defaultCalendar = activeCalendar || calendarOptions[0]?.calendar;

    // Single-date fallback compatibility
    const isDualDate = typeof onChangeStartDate === 'function';
    const [activeTarget, setActiveTarget] = useState<'start' | 'end'>('start');

    const effectiveTargetDate = isDualDate 
        ? (activeTarget === 'start' ? startDate : endDate)
        : (value || '');

    const handleUpdateTargetDate = (newDate: string) => {
        if (isDualDate) {
            if (activeTarget === 'start') {
                onChangeStartDate?.(newDate);
            } else {
                onChangeEndDate?.(newDate);
            }
        } else {
            onChange?.(newDate);
        }
    };

    // Active calendar used for composing
    const [selectedCalendarId, setSelectedCalendarId] = useState<string>(defaultCalendar.id);
    const activeCalOption = calendarOptions.find(c => c.id === selectedCalendarId) || calendarOptions[0];
    const currentCal = activeCalOption.calendar;

    // Detect calendar whenever target date changes if it clearly belongs to another system
    useEffect(() => {
        if (effectiveTargetDate && effectiveTargetDate.trim()) {
            const detected = detectCalendarForDate(effectiveTargetDate, calendarOptions, currentCal);
            if (detected.id !== selectedCalendarId) {
                setSelectedCalendarId(detected.id);
            }
        }
    }, [effectiveTargetDate]);

    // Parse components
    const dateComponents = useMemo(() => 
        parseDateComponents(effectiveTargetDate, currentCal),
        [effectiveTargetDate, currentCal]
    );

    const { day, monthIndex, year, isIntercalary } = dateComponents;
    const currentMonth = currentCal.months[monthIndex] || currentCal.months[0];
    const maxDay = currentMonth.isIntercalary ? 1 : (currentMonth.days || 30);

    // Modal state for detailed calendar system switcher
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    const [alsoUpdateWorldCalendar, setAlsoUpdateWorldCalendar] = useState(false);

    // Handlers for Day, Month, Year
    const handleDayChange = (newDay: number) => {
        const clamped = Math.max(1, Math.min(newDay, maxDay));
        const formatted = serializeFantasyDate(clamped, currentMonth, year, currentCal);
        handleUpdateTargetDate(formatted);
    };

    const handleMonthChange = (newMonthIdx: number) => {
        const targetMonth = currentCal.months[newMonthIdx] || currentCal.months[0];
        const targetMaxDay = targetMonth.isIntercalary ? 1 : (targetMonth.days || 30);
        const clampedDay = Math.max(1, Math.min(day, targetMaxDay));
        const formatted = serializeFantasyDate(clampedDay, targetMonth, year, currentCal);
        handleUpdateTargetDate(formatted);
    };

    const handleYearChange = (newYear: number) => {
        const formatted = serializeFantasyDate(day, currentMonth, newYear, currentCal);
        handleUpdateTargetDate(formatted);
    };

    // Calendar Switch Action
    const handleSwitchCalendarFormat = (targetOption: CalendarOption) => {
        const targetCal = targetOption.calendar;
        setSelectedCalendarId(targetCal.id);

        // Convert current target date
        const convertedTarget = convertDateComponents(dateComponents, currentCal, targetCal);
        handleUpdateTargetDate(convertedTarget);

        // Optionally convert the other date as well if dual mode
        if (isDualDate) {
            const otherDate = activeTarget === 'start' ? endDate : startDate;
            if (otherDate && otherDate.trim()) {
                const otherComp = parseDateComponents(otherDate, currentCal);
                const convertedOther = convertDateComponents(otherComp, currentCal, targetCal);
                if (activeTarget === 'start') {
                    onChangeEndDate?.(convertedOther);
                } else {
                    onChangeStartDate?.(convertedOther);
                }
            }
        }

        // Optionally update world active calendar
        if (alsoUpdateWorldCalendar) {
            setWorld(prev => ({
                ...prev,
                timelineCalendar: targetCal
            }));
        }

        setIsSwitcherOpen(false);
    };

    // Separate regular months and intercalary festival days
    const regularMonths = useMemo(() => currentCal.months.filter(m => !m.isIntercalary), [currentCal]);
    const festivalMonths = useMemo(() => currentCal.months.filter(m => m.isIntercalary), [currentCal]);

    return (
        <div className="col-span-12 -mt-1 mb-2">
            {/* ── Sleek Compact Date Composer Container ── */}
            <div 
                className="rounded-2xl p-3 border shadow-md transition-all backdrop-blur-md flex flex-col gap-2.5"
                style={{
                    backgroundColor: isLight 
                        ? (isRoyal ? '#fbf8ef' : '#faf7f2')
                        : 'rgba(10, 15, 26, 0.75)',
                    borderColor: isLight 
                        ? (isRoyal ? 'rgba(200, 169, 110, 0.5)' : '#d4c8af')
                        : `${accentColor}30`,
                    boxShadow: isLight
                        ? '0 2px 8px rgba(0,0,0,0.04)'
                        : `0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`
                }}
            >
                {/* ── Top Header Bar: Active Calendar + Switcher Button + Target Toggle ── */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2" style={{ borderColor: `${accentColor}18` }}>
                    {/* Left: Active Calendar System Badge + Switcher Button */}
                    <div className="flex items-center gap-2">
                        <div 
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border shadow-sm"
                            style={{
                                backgroundColor: `${accentColor}12`,
                                borderColor: `${accentColor}35`,
                                color: isLight ? '#1c140d' : '#f8fafc'
                            }}
                        >
                            <Calendar size={13} style={{ color: accentColor }} />
                            <span className="font-bold tracking-wide">{activeCalOption.label}</span>
                            {activeCalOption.yearSuffix && (
                                <span 
                                    className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold"
                                    style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
                                >
                                    {activeCalOption.yearSuffix}
                                </span>
                            )}
                        </div>

                        {/* Switch Calendar System Button */}
                        <button
                            type="button"
                            onClick={() => setIsSwitcherOpen(true)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] border cursor-pointer shadow-sm group"
                            style={{
                                backgroundColor: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.06)',
                                borderColor: `${accentColor}40`,
                                color: accentColor
                            }}
                            title="Switch calendar system format (e.g. Skyrim, Faerûn, Solar, Middle-earth)"
                        >
                            <ArrowRightLeft size={12} className="transition-transform group-hover:rotate-180 duration-300" />
                            <span>Switch Calendar</span>
                        </button>
                    </div>

                    {/* Right: Target Date Segmented Toggle (Start vs End) */}
                    {isDualDate && (
                        <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl border border-white/5">
                            <button
                                type="button"
                                onClick={() => setActiveTarget('start')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    activeTarget === 'start' ? 'shadow-md scale-[1.02]' : 'opacity-60 hover:opacity-100'
                                }`}
                                style={{
                                    backgroundColor: activeTarget === 'start' ? accentColor : 'transparent',
                                    color: activeTarget === 'start' ? (isLight ? '#ffffff' : '#000000') : (isLight ? '#475569' : '#cbd5e1')
                                }}
                            >
                                <span>Target: Start</span>
                                {startDate && (
                                    <span className="text-[10px] font-mono opacity-80 max-w-[100px] truncate">
                                        ({startDate})
                                    </span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTarget('end')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    activeTarget === 'end' ? 'shadow-md scale-[1.02]' : 'opacity-60 hover:opacity-100'
                                }`}
                                style={{
                                    backgroundColor: activeTarget === 'end' ? accentColor : 'transparent',
                                    color: activeTarget === 'end' ? (isLight ? '#ffffff' : '#000000') : (isLight ? '#475569' : '#cbd5e1')
                                }}
                            >
                                <span>Target: End</span>
                                {endDate && (
                                    <span className="text-[10px] font-mono opacity-80 max-w-[100px] truncate">
                                        ({endDate})
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Active Target Date Direct Input / Clear Bar ── */}
                <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 shrink-0">
                        {isDualDate ? (activeTarget === 'start' ? 'Start Date:' : 'End Date:') : 'Date:'}
                    </span>
                    <div className="relative flex-1 flex items-center">
                        <input
                            type="text"
                            value={effectiveTargetDate}
                            placeholder={isDualDate && activeTarget === 'end' ? "e.g. 20 Morning Star, 1495 (leave blank for single-point event)" : "e.g. 15 Morning Star, 1492"}
                            onChange={(e) => handleUpdateTargetDate(e.target.value)}
                            className="w-full text-xs font-mono font-semibold px-3 py-1.5 pr-8 rounded-xl border bg-black/10 focus:outline-none transition-all"
                            style={{
                                borderColor: `${accentColor}30`,
                                color: isLight ? '#1c140d' : '#f8fafc'
                            }}
                        />
                        {effectiveTargetDate && (
                            <button
                                type="button"
                                onClick={() => handleUpdateTargetDate('')}
                                className="absolute right-2 text-slate-400 hover:text-rose-400 p-0.5 rounded cursor-pointer transition-colors"
                                title={isDualDate && activeTarget === 'end' ? "Clear end date (converts back to single point event)" : "Clear date"}
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Middle Controls: Day Stepper + Year Stepper + Month Chips ── */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                    
                    {/* Day & Year Controls Block */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Day Stepper */}
                        <div 
                            className="flex flex-col items-center p-1.5 rounded-xl border bg-black/10 min-w-[80px]"
                            style={{ borderColor: `${accentColor}25` }}
                        >
                            <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 mb-1">
                                {isIntercalary ? 'Festival' : 'Day'}
                            </span>
                            {isIntercalary ? (
                                <span className="text-xs font-mono font-bold py-1 px-2 text-amber-400">
                                    ✦ 1 Day
                                </span>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleDayChange(day - 1)}
                                        className="w-6 h-6 flex items-center justify-center rounded-lg border hover:bg-white/10 transition-colors cursor-pointer"
                                        style={{ borderColor: `${accentColor}30`, color: accentColor }}
                                    >
                                        <ChevronLeft size={13} />
                                    </button>
                                    <input
                                        type="number"
                                        value={day}
                                        min={1}
                                        max={maxDay}
                                        onChange={(e) => {
                                            const v = parseInt(e.target.value, 10);
                                            if (!isNaN(v)) handleDayChange(v);
                                        }}
                                        className="w-10 text-center font-mono font-bold text-xs bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        style={{ color: isLight ? '#1c140d' : '#f8fafc' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleDayChange(day + 1)}
                                        className="w-6 h-6 flex items-center justify-center rounded-lg border hover:bg-white/10 transition-colors cursor-pointer"
                                        style={{ borderColor: `${accentColor}30`, color: accentColor }}
                                    >
                                        <ChevronRight size={13} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Year Stepper */}
                        <div 
                            className="flex flex-col items-center p-1.5 rounded-xl border bg-black/10 min-w-[110px]"
                            style={{ borderColor: `${accentColor}25` }}
                        >
                            <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 mb-1">
                                Year {currentCal.yearSuffix ? `(${currentCal.yearSuffix})` : ''}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => handleYearChange(year - 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded-lg border hover:bg-white/10 transition-colors cursor-pointer"
                                    style={{ borderColor: `${accentColor}30`, color: accentColor }}
                                >
                                    <ChevronLeft size={13} />
                                </button>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => {
                                        const v = parseInt(e.target.value, 10);
                                        if (!isNaN(v)) handleYearChange(v);
                                    }}
                                    className="w-14 text-center font-mono font-bold text-xs bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    style={{ color: isLight ? '#1c140d' : '#f8fafc' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleYearChange(year + 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded-lg border hover:bg-white/10 transition-colors cursor-pointer"
                                    style={{ borderColor: `${accentColor}30`, color: accentColor }}
                                >
                                    <ChevronRight size={13} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Month Pills Ribbon */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] uppercase font-bold tracking-wider opacity-60">
                                Months ({regularMonths.length}):
                            </span>
                            <span className="text-[10px] font-medium opacity-80" style={{ color: accentColor }}>
                                {currentMonth.name} {currentMonth.season ? `(${currentMonth.season})` : ''} · {currentMonth.days} days
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {regularMonths.map((m) => {
                                const realIdx = currentCal.months.indexOf(m);
                                const isSelected = realIdx === monthIndex;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => handleMonthChange(realIdx)}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                            isSelected 
                                                ? 'shadow-md scale-105 font-bold' 
                                                : 'opacity-70 hover:opacity-100 hover:scale-102'
                                        }`}
                                        style={{
                                            backgroundColor: isSelected 
                                                ? accentColor 
                                                : isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                                            color: isSelected 
                                                ? (isLight ? '#ffffff' : '#000000') 
                                                : (isLight ? '#1c140d' : '#e2e8f0'),
                                            border: `1px solid ${isSelected ? accentColor : (isLight ? '#d4c8af' : 'rgba(255,255,255,0.1)')}`,
                                            boxShadow: isSelected ? `0 0 10px ${accentColor}80` : undefined
                                        }}
                                        title={`${m.name} (${m.days} days)`}
                                    >
                                        {m.abbreviation || m.name}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Intercalary Festival Pills if calendar defines any */}
                        {festivalMonths.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 mt-0.5 pt-1 border-t border-dashed border-white/10">
                                <span className="text-[8px] uppercase tracking-wider font-bold opacity-50 mr-1 flex items-center gap-0.5">
                                    <Sparkles size={9} /> Festivals:
                                </span>
                                {festivalMonths.map((m) => {
                                    const realIdx = currentCal.months.indexOf(m);
                                    const isSelected = realIdx === monthIndex;
                                    return (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => handleMonthChange(realIdx)}
                                            className={`px-2 py-0.5 rounded-md text-[9px] font-semibold italic transition-all cursor-pointer whitespace-nowrap ${
                                                isSelected 
                                                    ? 'shadow-md scale-105 font-bold ring-1 ring-white/50' 
                                                    : 'opacity-70 hover:opacity-100'
                                            }`}
                                            style={{
                                                backgroundColor: isSelected 
                                                    ? `${accentColor}35` 
                                                    : isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                                                color: isSelected 
                                                    ? accentColor 
                                                    : (isLight ? '#475569' : '#cbd5e1'),
                                                border: `1px dashed ${isSelected ? accentColor : `${accentColor}40`}`
                                            }}
                                        >
                                            ✦ {m.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── DETAILED CALENDAR SYSTEM SWITCHER MODAL (Portaled) ── */}
            {isSwitcherOpen && createPortal(
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
                    onClick={() => setIsSwitcherOpen(false)}
                >
                    <div 
                        className="w-full max-w-3xl max-h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
                        style={{
                            backgroundColor: isLight ? '#ffffff' : '#080d1a',
                            borderColor: isLight ? '#d4c8af' : `${accentColor}40`,
                            boxShadow: `0 25px 70px rgba(0,0,0,0.8), 0 0 40px ${accentColor}20`
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div 
                            className="p-5 border-b flex items-center justify-between gap-4"
                            style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)' }}
                        >
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner"
                                    style={{
                                        backgroundColor: `${accentColor}20`,
                                        borderColor: `${accentColor}40`,
                                        color: accentColor
                                    }}
                                >
                                    <Globe2 size={20} />
                                </div>
                                <div>
                                    <h3 
                                        className="text-base font-bold tracking-tight"
                                        style={{ color: isLight ? '#0f172a' : '#f8fafc' }}
                                    >
                                        Switch Calendar System & Format
                                    </h3>
                                    <p className="text-xs opacity-60">
                                        Convert and format event dates between world reckonings (Skyrim, Faerûn, Solar, Middle-earth, etc.).
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSwitcherOpen(false)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Active Date Context Banner */}
                        <div 
                            className="px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs"
                            style={{ 
                                backgroundColor: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)',
                                borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.06)'
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="opacity-60 font-semibold">Active Date:</span>
                                <span 
                                    className="font-mono font-bold px-2 py-0.5 rounded-lg border"
                                    style={{
                                        backgroundColor: `${accentColor}15`,
                                        borderColor: `${accentColor}30`,
                                        color: accentColor
                                    }}
                                >
                                    {effectiveTargetDate || 'No date set'}
                                </span>
                                <span className="opacity-50 text-[11px]">
                                    (Day {day}, Month {monthIndex + 1}: {currentMonth.name}, Year {year})
                                </span>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] font-semibold opacity-90">
                                <input
                                    type="checkbox"
                                    checked={alsoUpdateWorldCalendar}
                                    onChange={(e) => setAlsoUpdateWorldCalendar(e.target.checked)}
                                    className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                                />
                                <span>Also set as Realm Timeline Calendar</span>
                            </label>
                        </div>

                        {/* Calendar Cards List */}
                        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3.5">
                            {calendarOptions.map((opt) => {
                                const isCurrent = opt.id === currentCal.id;
                                const previewConverted = convertDateComponents(dateComponents, currentCal, opt.calendar);

                                return (
                                    <div
                                        key={opt.id}
                                        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                                            isCurrent 
                                                ? 'ring-2 shadow-lg' 
                                                : 'hover:border-current/40 hover:bg-white/[0.02]'
                                        }`}
                                        style={{
                                            backgroundColor: isCurrent 
                                                ? `${accentColor}0a` 
                                                : isLight ? '#ffffff' : 'rgba(255,255,255,0.02)',
                                            borderColor: isCurrent 
                                                ? accentColor 
                                                : isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)',
                                            boxShadow: isCurrent ? `0 0 20px ${accentColor}25` : undefined
                                        }}
                                    >
                                        {/* Left Info */}
                                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 
                                                    className="font-bold text-sm"
                                                    style={{ color: isLight ? '#0f172a' : '#f8fafc' }}
                                                >
                                                    {opt.label}
                                                </h4>
                                                <span 
                                                    className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border"
                                                    style={{
                                                        backgroundColor: `${accentColor}15`,
                                                        borderColor: `${accentColor}30`,
                                                        color: accentColor
                                                    }}
                                                >
                                                    {opt.tag}
                                                </span>
                                                {opt.yearSuffix && (
                                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 font-bold opacity-80">
                                                        Suffix: {opt.yearSuffix}
                                                    </span>
                                                )}
                                                {isCurrent && (
                                                    <span 
                                                        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                                                        style={{ backgroundColor: accentColor, color: isLight ? '#fff' : '#000' }}
                                                    >
                                                        <Check size={11} strokeWidth={3} /> Current
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs opacity-70 leading-relaxed max-w-xl">
                                                {opt.description}
                                            </p>

                                            {/* Months preview row */}
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {opt.calendar.months.slice(0, 12).map((m) => (
                                                    <span 
                                                        key={m.id}
                                                        className="text-[9px] px-1.5 py-0.5 rounded border opacity-70"
                                                        style={{
                                                            backgroundColor: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.04)',
                                                            borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.06)'
                                                        }}
                                                    >
                                                        {m.abbreviation || m.name}
                                                    </span>
                                                ))}
                                                {opt.calendar.months.length > 12 && (
                                                    <span className="text-[9px] px-1.5 py-0.5 opacity-50">
                                                        +{opt.calendar.months.length - 12} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Action & Conversion Preview */}
                                        <div className="flex flex-col items-start md:items-end gap-2 shrink-0 w-full md:w-auto">
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-50 block">
                                                    Converts To:
                                                </span>
                                                <span 
                                                    className="text-xs font-mono font-bold block"
                                                    style={{ color: accentColor }}
                                                >
                                                    {previewConverted}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleSwitchCalendarFormat(opt)}
                                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm w-full md:w-auto justify-center ${
                                                    isCurrent 
                                                        ? 'opacity-80 hover:opacity-100' 
                                                        : 'hover:scale-[1.02]'
                                                }`}
                                                style={{
                                                    backgroundColor: isCurrent ? 'rgba(255,255,255,0.08)' : accentColor,
                                                    color: isCurrent ? (isLight ? '#0f172a' : '#ffffff') : (isLight ? '#ffffff' : '#000000'),
                                                    border: isCurrent ? `1px solid ${accentColor}40` : undefined
                                                }}
                                            >
                                                <ArrowRightLeft size={12} />
                                                <span>{isCurrent ? 'Re-Apply Format' : `Switch to ${opt.label.split(' ')[0]}`}</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
