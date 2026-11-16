/**
 * FantasyDatePicker
 * 
 * A three-column structured date picker (Day · Month · Year) that supports
 * any FantasyCalendar preset. Each column has an independent "Switch Calendar"
 * dropdown so the user can compose a date using different calendar systems
 * per field — or use the same system across all three.
 * 
 * The resolved date is serialized as a canonical fantasy date string:
 *   e.g. "15 Hammer, 1372 DR" or "3 Hearthfire, 4E 201"
 * 
 * This feeds directly into event.startDate / event.endDate which are parsed
 * by parseFantasyDate() and displayed on both AnnualCalendarView and Chronos.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FantasyCalendar, FantasyMonth } from '../../types';
import { DEFAULT_CALENDAR_PRESETS } from '../../utils/timelineUtils';
import { useTheme } from '../../theme';
import { ChevronDown, ChevronUp, RefreshCw, Calendar, ArrowRightLeft } from 'lucide-react';

interface AvailableCalendar {
    id: string;
    name: string;
    yearSuffix?: string;
    calendar: FantasyCalendar;
}

interface ParsedDate {
    day: number;
    monthIndex: number;  // index into the selected month-calendar's months[]
    year: number;
}

interface Props {
    /** The raw date string to parse and display */
    value: string;
    /** Called whenever the user changes the date */
    onChange: (dateString: string) => void;
    /** Label displayed above the picker (e.g. "Start Date") */
    label: string;
    /** The world's active timeline calendar (default calendar system) */
    activeCalendar?: FantasyCalendar;
    /** User-created custom calendar presets */
    customPresets?: FantasyCalendar[];
}

/** All calendars available to the user (built-in + custom presets) */
function buildCalendarOptions(
    activeCalendar?: FantasyCalendar,
    customPresets?: FantasyCalendar[]
): AvailableCalendar[] {
    const options: AvailableCalendar[] = [];

    // Active calendar first (if set and not already in presets)
    if (activeCalendar) {
        options.push({
            id: activeCalendar.id,
            name: activeCalendar.name,
            yearSuffix: activeCalendar.yearSuffix,
            calendar: activeCalendar
        });
    }

    // Built-in presets
    for (const [, preset] of Object.entries(DEFAULT_CALENDAR_PRESETS)) {
        if (!options.find(o => o.id === preset.calendar.id)) {
            options.push({
                id: preset.calendar.id,
                name: preset.label,
                yearSuffix: preset.calendar.yearSuffix,
                calendar: preset.calendar
            });
        }
    }

    // Custom presets
    if (customPresets) {
        for (const cal of customPresets) {
            if (!options.find(o => o.id === cal.id)) {
                options.push({
                    id: cal.id,
                    name: cal.name,
                    yearSuffix: cal.yearSuffix,
                    calendar: cal
                });
            }
        }
    }

    return options;
}

/** Parse a date string into { day, monthIndex, year } for a given calendar */
function parseDateForCalendar(raw: string, cal: FantasyCalendar): ParsedDate {
    const defaultDate = { day: 1, monthIndex: 0, year: 1 };
    if (!raw || !cal.months?.length) return defaultDate;

    const trimmed = raw.trim();

    // Extract year
    const yearMatch = trimmed.match(/\b(\d{1,6})\b/g);
    let year = 1;
    if (yearMatch) {
        // Largest number is the year
        const nums = yearMatch.map(Number).sort((a, b) => b - a);
        year = nums[0] || 1;
    }

    // Find month by name
    const lower = trimmed.toLowerCase();
    let monthIndex = 0;
    for (let i = 0; i < cal.months.length; i++) {
        const m = cal.months[i];
        if (lower.includes(m.name.toLowerCase()) ||
            (m.abbreviation && lower.includes(m.abbreviation.toLowerCase()))) {
            monthIndex = i;
            break;
        }
    }

    // Extract day — smallest number that isn't the year
    let day = 1;
    const dayMatches = trimmed.match(/\b([1-9]|[12]\d|3[01])\b/g);
    if (dayMatches) {
        const yearStr = year.toString();
        const non = dayMatches.find(m => m !== yearStr && parseInt(m) !== year);
        if (non) day = parseInt(non, 10);
    }

    // Clamp day to month bounds
    const monthDays = cal.months[monthIndex]?.days || 30;
    day = Math.max(1, Math.min(day, monthDays));

    return { day, monthIndex, year };
}

/** Serialize picker state back to a canonical date string */
function serializeDate(day: number, month: FantasyMonth, year: number, cal: FantasyCalendar): string {
    const suffix = cal.yearSuffix ? ` ${cal.yearSuffix}` : '';
    if (month.isIntercalary) return `${month.name}, ${year}${suffix}`;
    return `${day} ${month.name}, ${year}${suffix}`;
}

/** A compact spinner-style number stepper */
const Stepper: React.FC<{
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
    label: string;
    isLight: boolean;
    accentColor: string;
}> = ({ value, min, max, onChange, label, isLight, accentColor }) => {
    const inc = () => onChange(value >= max ? min : value + 1);
    const dec = () => onChange(value <= min ? max : value - 1);

    // Allow typing directly
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = parseInt(e.target.value, 10);
        if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
    };

    return (
        <div className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] uppercase tracking-widest font-bold mb-1"
                style={{ color: isLight ? '#6b7280' : '#94a3b8' }}>
                {label}
            </span>
            <button
                type="button"
                onClick={inc}
                className="w-7 h-5 flex items-center justify-center rounded-t-md transition-colors hover:opacity-80"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
                <ChevronUp size={12} />
            </button>
            <input
                type="number"
                value={value}
                min={min}
                max={max}
                onChange={handleInput}
                className="w-14 h-8 text-center text-sm font-mono font-bold rounded-none outline-none border-y transition-colors"
                style={{
                    backgroundColor: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(8,12,22,0.7)',
                    borderColor: `${accentColor}40`,
                    color: isLight ? '#1c1917' : '#f1f5f9',
                    MozAppearance: 'textfield'
                }}
                onWheel={(e) => {
                    e.preventDefault();
                    if (e.deltaY < 0) inc();
                    else dec();
                }}
            />
            <button
                type="button"
                onClick={dec}
                className="w-7 h-5 flex items-center justify-center rounded-b-md transition-colors hover:opacity-80"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
                <ChevronDown size={12} />
            </button>
        </div>
    );
};

/** Calendar system switcher dropdown */
const CalendarSwitch: React.FC<{
    calendars: AvailableCalendar[];
    activeId: string;
    onSelect: (cal: FantasyCalendar) => void;
    isLight: boolean;
    accentColor: string;
}> = ({ calendars, activeId, onSelect, isLight, accentColor }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const active = calendars.find(c => c.id === activeId);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wide transition-all hover:opacity-90"
                style={{
                    backgroundColor: `${accentColor}18`,
                    border: `1px solid ${accentColor}40`,
                    color: accentColor
                }}
            >
                <ArrowRightLeft size={9} />
                <span className="max-w-[80px] truncate">{active?.name ?? 'Switch'}</span>
                <ChevronDown size={9} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div
                    className="absolute z-50 mt-1 left-0 min-w-[180px] rounded-xl border shadow-2xl overflow-hidden"
                    style={{
                        backgroundColor: isLight ? '#ffffff' : '#0d1526',
                        borderColor: `${accentColor}40`,
                        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}20`
                    }}
                >
                    {calendars.map(cal => (
                        <button
                            key={cal.id}
                            type="button"
                            onClick={() => { onSelect(cal.calendar); setOpen(false); }}
                            className="w-full text-left px-3 py-2 text-[10px] font-medium transition-colors hover:opacity-80 flex items-center justify-between gap-2"
                            style={{
                                backgroundColor: cal.id === activeId
                                    ? `${accentColor}20`
                                    : 'transparent',
                                color: cal.id === activeId
                                    ? (isLight ? '#1c1917' : '#f1f5f9')
                                    : (isLight ? '#374151' : '#94a3b8'),
                                borderBottom: `1px solid ${accentColor}10`
                            }}
                        >
                            <span className="font-semibold">{cal.name}</span>
                            {cal.yearSuffix && (
                                <span
                                    className="text-[8px] px-1 py-0.5 rounded font-mono shrink-0"
                                    style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                                >
                                    {cal.yearSuffix}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/** Month picker — a grid of month pills */
const MonthGrid: React.FC<{
    months: FantasyMonth[];
    selectedIndex: number;
    onSelect: (idx: number) => void;
    isLight: boolean;
    accentColor: string;
}> = ({ months, selectedIndex, onSelect, isLight, accentColor }) => {
    // Separate regular months from intercalary days
    const regular = months.filter(m => !m.isIntercalary);
    const intercalary = months.filter(m => m.isIntercalary);

    return (
        <div className="flex flex-col gap-1.5">
            {/* Regular months grid */}
            <div className="flex flex-wrap gap-1">
                {regular.map((m) => {
                    const idx = months.indexOf(m);
                    const isSelected = idx === selectedIndex;
                    return (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => onSelect(idx)}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-all hover:scale-105"
                            style={{
                                backgroundColor: isSelected
                                    ? accentColor
                                    : isLight ? `${accentColor}15` : `${accentColor}18`,
                                border: `1px solid ${isSelected ? accentColor : `${accentColor}30`}`,
                                color: isSelected
                                    ? (isLight ? '#ffffff' : '#000000')
                                    : (isLight ? '#374151' : '#cbd5e1'),
                                boxShadow: isSelected ? `0 0 10px ${accentColor}60` : undefined
                            }}
                        >
                            {m.abbreviation || m.name.substring(0, 4)}
                        </button>
                    );
                })}
            </div>

            {/* Intercalary festivals (if any) */}
            {intercalary.length > 0 && (
                <>
                    <div className="text-[8px] uppercase tracking-widest font-bold opacity-50 pl-0.5">
                        Festivals
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {intercalary.map((m) => {
                            const idx = months.indexOf(m);
                            const isSelected = idx === selectedIndex;
                            return (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => onSelect(idx)}
                                    className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-all hover:scale-105 italic"
                                    style={{
                                        backgroundColor: isSelected
                                            ? accentColor
                                            : isLight ? `${accentColor}10` : `${accentColor}12`,
                                        border: `1px dashed ${isSelected ? accentColor : `${accentColor}40`}`,
                                        color: isSelected
                                            ? (isLight ? '#ffffff' : '#000000')
                                            : (isLight ? '#6b7280' : '#94a3b8'),
                                    }}
                                >
                                    ✦ {m.name}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const FantasyDatePicker: React.FC<Props> = ({
    value,
    onChange,
    label,
    activeCalendar,
    customPresets
}) => {
    const { themeId, layoutMode } = useTheme();
    const isLight = layoutMode === 'wiki' || themeId === 'royal-codex';
    const isRoyal = themeId === 'royal-codex';
    const isSovereign = themeId === 'sovereign';
    const isVoyager = themeId === 'grand-voyager';

    const accentColor = isRoyal
        ? '#70121e'
        : isVoyager
            ? '#2dd4bf'
            : layoutMode === 'wiki'
                ? '#b91c1c'
                : '#f59e0b'; // sovereign default

    const calendarOptions = buildCalendarOptions(activeCalendar, customPresets);

    // Each "section" (day, month, year) independently tracks which calendar it uses
    const defaultCalId = activeCalendar?.id ?? calendarOptions[0]?.id ?? 'cal-solar';

    const [monthCalId, setMonthCalId] = useState(defaultCalId);
    const [yearCalId, setYearCalId] = useState(defaultCalId);

    const getCalById = useCallback((id: string) =>
        calendarOptions.find(c => c.id === id)?.calendar ?? calendarOptions[0]?.calendar,
        [calendarOptions]
    );

    const monthCal = getCalById(monthCalId);
    const yearCal = getCalById(yearCalId);

    // Parse current value using the month calendar
    const parsed = monthCal
        ? parseDateForCalendar(value, monthCal)
        : { day: 1, monthIndex: 0, year: 1 };

    const [day, setDay] = useState(parsed.day);
    const [monthIndex, setMonthIndex] = useState(parsed.monthIndex);
    const [year, setYear] = useState(parsed.year);

    // Keep state in sync when external `value` changes
    const prevValue = useRef(value);
    useEffect(() => {
        if (value !== prevValue.current && value !== '') {
            prevValue.current = value;
            const p = monthCal ? parseDateForCalendar(value, monthCal) : { day: 1, monthIndex: 0, year: 1 };
            setDay(p.day);
            setMonthIndex(p.monthIndex);
            setYear(p.year);
        }
    }, [value, monthCal]);

    // Clamp day when month changes
    const selectedMonth = monthCal?.months[monthIndex] ?? monthCal?.months[0];
    const maxDay = selectedMonth?.days ?? 30;
    const effectiveDay = selectedMonth?.isIntercalary ? 1 : Math.min(day, maxDay);

    // Emit changes
    const emit = useCallback((d: number, mIdx: number, yr: number, mCal: FantasyCalendar, yCal: FantasyCalendar) => {
        const month = mCal.months[mIdx] ?? mCal.months[0];
        if (!month) return;
        // Use year suffix from yearCal (can differ from monthCal)
        const calWithSuffix = { ...mCal, yearSuffix: yCal.yearSuffix ?? mCal.yearSuffix };
        const result = serializeDate(d, month, yr, calWithSuffix);
        onChange(result);
    }, [onChange]);

    const handleDayChange = (d: number) => {
        setDay(d);
        emit(d, monthIndex, year, monthCal!, yearCal!);
    };

    const handleMonthChange = (idx: number) => {
        setMonthIndex(idx);
        const m = monthCal?.months[idx];
        const clampedDay = m?.isIntercalary ? 1 : Math.min(day, m?.days ?? 30);
        setDay(clampedDay);
        emit(clampedDay, idx, year, monthCal!, yearCal!);
    };

    const handleYearChange = (yr: number) => {
        setYear(yr);
        emit(effectiveDay, monthIndex, yr, monthCal!, yearCal!);
    };

    const handleMonthCalSwitch = (cal: FantasyCalendar) => {
        setMonthCalId(cal.id);
        // Reset month to first month of new calendar
        setMonthIndex(0);
        const clampedDay = Math.min(day, cal.months[0]?.days ?? 30);
        setDay(clampedDay);
        emit(clampedDay, 0, year, cal, yearCal!);
    };

    const handleYearCalSwitch = (cal: FantasyCalendar) => {
        setYearCalId(cal.id);
        emit(effectiveDay, monthIndex, year, monthCal!, cal);
    };

    const handleReset = () => {
        setDay(1);
        setMonthIndex(0);
        setYear(1);
        const cal = monthCal!;
        emit(1, 0, 1, cal, yearCal!);
    };

    if (!monthCal || !yearCal) return null;

    // ── Preview of the serialized date ──
    const previewMonth = monthCal.months[monthIndex] ?? monthCal.months[0];
    const previewDate = previewMonth
        ? serializeDate(effectiveDay, previewMonth, year, { ...monthCal, yearSuffix: yearCal.yearSuffix ?? monthCal.yearSuffix })
        : '';

    // Container styling
    const containerBg = isLight
        ? 'rgba(255,255,255,0.7)'
        : 'rgba(6,10,20,0.6)';
    const borderColor = `${accentColor}30`;

    return (
        <div
            className="col-span-full rounded-2xl p-3 flex flex-col gap-3"
            style={{
                backgroundColor: containerBg,
                border: `1px solid ${borderColor}`,
                backdropFilter: 'blur(8px)'
            }}
        >
            {/* ── Header: label + preview + reset ── */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Calendar size={12} style={{ color: accentColor }} />
                    <span
                        className="text-[10px] uppercase tracking-widest font-bold"
                        style={{ color: isLight ? '#6b7280' : '#94a3b8' }}
                    >
                        {label}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Live preview of the resulting date string */}
                    {previewDate && (
                        <span
                            className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg border"
                            style={{
                                borderColor: `${accentColor}40`,
                                backgroundColor: `${accentColor}12`,
                                color: isLight ? '#1c1917' : '#f1f5f9'
                            }}
                        >
                            {previewDate}
                        </span>
                    )}

                    {/* Reset */}
                    <button
                        type="button"
                        onClick={handleReset}
                        className="p-1 rounded-lg transition-colors hover:opacity-80"
                        style={{ color: `${accentColor}80` }}
                        title="Reset to Day 1, Month 1, Year 1"
                    >
                        <RefreshCw size={11} />
                    </button>
                </div>
            </div>

            {/* ── Three columns: Day | Month | Year ── */}
            <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-start">

                {/* ── Day column ── */}
                <div
                    className="flex flex-col items-center gap-2 p-2 rounded-xl"
                    style={{
                        backgroundColor: isLight ? `${accentColor}08` : `${accentColor}08`,
                        border: `1px solid ${accentColor}20`
                    }}
                >
                    {selectedMonth?.isIntercalary ? (
                        <div className="flex flex-col items-center gap-1 w-14">
                            <span className="text-[9px] uppercase tracking-widest font-bold mb-1"
                                style={{ color: isLight ? '#6b7280' : '#94a3b8' }}>
                                Day
                            </span>
                            <span
                                className="text-xs font-mono text-center w-full italic opacity-60 py-2"
                                style={{ color: isLight ? '#374151' : '#94a3b8' }}
                            >
                                Festival
                            </span>
                        </div>
                    ) : (
                        <Stepper
                            value={effectiveDay}
                            min={1}
                            max={maxDay}
                            onChange={handleDayChange}
                            label="Day"
                            isLight={isLight}
                            accentColor={accentColor}
                        />
                    )}
                </div>

                {/* ── Month column ── */}
                <div
                    className="flex flex-col gap-2 p-2 rounded-xl"
                    style={{
                        backgroundColor: isLight ? `${accentColor}05` : `${accentColor}06`,
                        border: `1px solid ${accentColor}20`
                    }}
                >
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] uppercase tracking-widest font-bold"
                            style={{ color: isLight ? '#6b7280' : '#94a3b8' }}>
                            Month
                        </span>
                        <CalendarSwitch
                            calendars={calendarOptions}
                            activeId={monthCalId}
                            onSelect={handleMonthCalSwitch}
                            isLight={isLight}
                            accentColor={accentColor}
                        />
                    </div>
                    <MonthGrid
                        months={monthCal.months}
                        selectedIndex={monthIndex}
                        onSelect={handleMonthChange}
                        isLight={isLight}
                        accentColor={accentColor}
                    />
                    {/* Full month name readout */}
                    {previewMonth && (
                        <div
                            className="text-[10px] font-semibold truncate opacity-70 mt-0.5"
                            style={{ color: isLight ? '#374151' : '#cbd5e1' }}
                        >
                            {previewMonth.isIntercalary ? '✦ ' : ''}{previewMonth.name}
                            {previewMonth.season && (
                                <span className="ml-1 opacity-50 font-normal">({previewMonth.season})</span>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Year column ── */}
                <div
                    className="flex flex-col items-center gap-2 p-2 rounded-xl"
                    style={{
                        backgroundColor: isLight ? `${accentColor}08` : `${accentColor}08`,
                        border: `1px solid ${accentColor}20`
                    }}
                >
                    <Stepper
                        value={year}
                        min={-9999}
                        max={99999}
                        onChange={handleYearChange}
                        label={yearCal.yearSuffix ? `Year (${yearCal.yearSuffix})` : 'Year'}
                        isLight={isLight}
                        accentColor={accentColor}
                    />
                    <CalendarSwitch
                        calendars={calendarOptions}
                        activeId={yearCalId}
                        onSelect={handleYearCalSwitch}
                        isLight={isLight}
                        accentColor={accentColor}
                    />
                </div>
            </div>
        </div>
    );
};
