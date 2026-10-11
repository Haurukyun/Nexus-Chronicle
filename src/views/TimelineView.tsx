import React, { useState, useMemo, useRef } from 'react';
import { 
    Calendar, History, ArrowLeft, ArrowRight, Bookmark,
    Sparkles, Filter, Search, X, User, Plus, RotateCcw,
    Layers, Compass, Clock, Award, CalendarDays
} from 'lucide-react';
import { WorldData, WorldEntity, Character, Event, FantasyEra, MilestonePin, FantasyCalendar } from '../types';
import { useWorldStore } from '../store/useWorldStore';
import { useTheme } from '../theme';
import { 
    extractYear, findEraForYear, formatYearWithEra, 
    packTimelineLanes, DEFAULT_ERA_PRESETS,
    formatHoveredYearWithCalendar
} from '../utils/timelineUtils';
import { isEntityDeceased } from '../utils/documentModeUtils';
import { ManageErasModal } from '../components/timeline/ManageErasModal';
import { AddMilestoneModal } from '../components/timeline/AddMilestoneModal';
import { ManageCalendarModal } from '../components/timeline/ManageCalendarModal';
import { TimelineInspectorCard, InspectedTimelineItem } from '../components/timeline/TimelineInspectorCard';
import { AnnualCalendarView } from '../components/timeline/AnnualCalendarView';

interface TimelineViewProps {
    world: WorldData;
    setWorld?: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
    onNavigate: (id: string) => void;
}

type CategoryFilter = 'all' | 'events' | 'characters' | 'milestones';
type LifeStatusFilter = 'all' | 'living' | 'deceased';
type ZoomLevel = 'compact' | 'standard' | 'epic' | 'panoramic';

const ZOOM_CONFIGS: Record<ZoomLevel, { width: number; label: string }> = {
    compact: { width: 2000, label: 'Compact (2k)' },
    standard: { width: 3400, label: 'Standard (3.4k)' },
    epic: { width: 5200, label: 'Epic (5.2k)' },
    panoramic: { width: 8000, label: 'Panoramic (8k)' }
};

interface ProcessedTimelineItem {
    id: string;
    entityId?: string;
    name: string;
    type: 'character' | 'event';
    start: number;
    end: number;
    isDead?: boolean;
    eventType?: string;
    description?: string;
    color?: string;
    entity?: WorldEntity;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ 
    world, 
    setWorld: propSetWorld, 
    onNavigate 
}) => {
    const { themeId, layoutMode } = useTheme();
    const storeSetWorld = useWorldStore(state => state.setWorld);
    const handleCreate = useWorldStore(state => state.handleCreate);
    const setWorld = propSetWorld || storeSetWorld;

    // View mode: 'chronos' = big-picture timeline, 'annual' = full-year calendar
    type MainViewMode = 'chronos' | 'annual';
    const [mainViewMode, setMainViewMode] = useState<MainViewMode>('chronos');

    // View state
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [selectedEventType, setSelectedEventType] = useState<string>('all');
    const [lifeStatusFilter, setLifeStatusFilter] = useState<LifeStatusFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('standard');
    
    // Interactive mouse hover cursor along timeline
    const [hoveredYear, setHoveredYear] = useState<number | null>(null);
    const [hoveredPosPct, setHoveredPosPct] = useState<number | null>(null);

    // Modal states
    const [isManageErasOpen, setIsManageErasOpen] = useState(false);
    const [isManageCalendarOpen, setIsManageCalendarOpen] = useState(false);
    const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<MilestonePin | null>(null);

    // Selected item for Inspector
    const [inspectedItem, setInspectedItem] = useState<InspectedTimelineItem | null>(null);

    // Timeline scroll container ref
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const canvasInnerRef = useRef<HTMLDivElement>(null);

    // Effective eras (fallback to mythic preset if not defined)
    const eras: FantasyEra[] = useMemo(() => {
        if (world.timelineEras && world.timelineEras.length > 0) {
            return world.timelineEras;
        }
        return DEFAULT_ERA_PRESETS.mythic.eras;
    }, [world.timelineEras]);

    // Active fantasy calendar (optional)
    const calendar: FantasyCalendar | undefined = useMemo(() => {
        return world.timelineCalendar;
    }, [world.timelineCalendar]);

    // Milestone pins
    const milestonePins: MilestonePin[] = useMemo(() => {
        return world.milestonePins || [];
    }, [world.milestonePins]);

    // Extract unique event types for sub-filter
    const availableEventTypes = useMemo(() => {
        const set = new Set<string>();
        world.entities.forEach(e => {
            if (e.type === 'event') {
                const evt = e as Event;
                if (evt.eventType && evt.eventType.trim()) {
                    set.add(evt.eventType.trim());
                }
            }
        });
        return Array.from(set).sort();
    }, [world.entities]);

    // Extract all timeline items and bounds
    const { 
        rawItems, 
        minYear, 
        maxYear, 
        yearSpan 
    } = useMemo(() => {
        const items: ProcessedTimelineItem[] = [];
        let calculatedMin = Infinity;
        let calculatedMax = -Infinity;

        world.entities.forEach(e => {
            if (e.type === 'character') {
                const char = e as Character;
                const birth = extractYear(char.birthDate || char.dateOfBirth);
                const death = extractYear(char.deathDate || char.dateOfDeath);
                const deceased = isEntityDeceased(char);

                if (birth !== null) {
                    const fallbackEnd = birth + 60;
                    const end = death !== null ? death : fallbackEnd;

                    items.push({
                        id: e.id,
                        name: e.name,
                        type: 'character',
                        start: birth,
                        end: Math.max(end, birth + 1),
                        isDead: deceased,
                        description: char.description,
                        color: deceased ? '#94a3b8' : '#38bdf8',
                        entity: e
                    });

                    calculatedMin = Math.min(calculatedMin, birth);
                    calculatedMax = Math.max(calculatedMax, end);
                }
            } else if (e.type === 'event') {
                const evt = e as Event;
                const start = extractYear(evt.startDate || evt.date);
                const rawEnd = extractYear(evt.endDate);
                const end = rawEnd !== null ? rawEnd : (start !== null ? start + 3 : null);

                if (start !== null && end !== null) {
                    items.push({
                        id: e.id,
                        name: e.name,
                        type: 'event',
                        start,
                        end: Math.max(end, start + 2),
                        eventType: evt.eventType,
                        description: evt.description,
                        color: '#f59e0b',
                        entity: e
                    });

                    calculatedMin = Math.min(calculatedMin, start);
                    calculatedMax = Math.max(calculatedMax, end);
                }
            }
        });

        // Also factor in milestone pins for timeline bounds
        milestonePins.forEach(pin => {
            calculatedMin = Math.min(calculatedMin, pin.year);
            calculatedMax = Math.max(calculatedMax, pin.year);
        });

        // Also factor in eras bounds
        eras.forEach(era => {
            calculatedMin = Math.min(calculatedMin, era.startYear);
            if (era.endYear !== undefined) {
                calculatedMax = Math.max(calculatedMax, era.endYear);
            }
        });

        if (calculatedMin === Infinity) {
            calculatedMin = 0;
            calculatedMax = 2000;
        }

        // Add padding around boundaries
        const padding = Math.max(Math.round((calculatedMax - calculatedMin) * 0.05), 30);
        const paddedMin = calculatedMin - padding;
        const paddedMax = calculatedMax + padding;

        return {
            rawItems: items,
            minYear: paddedMin,
            maxYear: paddedMax,
            yearSpan: paddedMax - paddedMin || 100
        };
    }, [world.entities, milestonePins, eras]);

    // Live counts for category buttons
    const categoryCounts = useMemo(() => {
        let events = 0;
        let characters = 0;
        rawItems.forEach(i => {
            if (i.type === 'event') events++;
            if (i.type === 'character') characters++;
        });
        return {
            all: rawItems.length,
            events,
            characters,
            milestones: milestonePins.length
        };
    }, [rawItems, milestonePins]);

    // Filter items based on active toolbar filters
    const filteredItems = useMemo(() => {
        return rawItems.filter(item => {
            // Category filter
            if (categoryFilter === 'events' && item.type !== 'event') return false;
            if (categoryFilter === 'characters' && item.type !== 'character') return false;
            if (categoryFilter === 'milestones') return false; // Milestones handled separately

            // Sub-filters
            if (item.type === 'event' && selectedEventType !== 'all') {
                if (item.eventType !== selectedEventType) return false;
            }
            if (item.type === 'character' && lifeStatusFilter !== 'all') {
                if (lifeStatusFilter === 'living' && item.isDead) return false;
                if (lifeStatusFilter === 'deceased' && !item.isDead) return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchesName = item.name.toLowerCase().includes(q);
                const matchesDesc = item.description?.toLowerCase().includes(q);
                const matchesType = item.eventType?.toLowerCase().includes(q);
                if (!matchesName && !matchesDesc && !matchesType) return false;
            }

            return true;
        });
    }, [rawItems, categoryFilter, selectedEventType, lifeStatusFilter, searchQuery]);

    // Pack filtered items into visual lanes so ribbons never overlap
    const packedItems = useMemo(() => {
        return packTimelineLanes(filteredItems, 4);
    }, [filteredItems]);

    // Calculate maximum lane number
    const maxLane = useMemo(() => {
        return packedItems.reduce((acc, curr) => Math.max(acc, curr.lane), 0);
    }, [packedItems]);

    // Dynamic timeline ribbon canvas height
    const laneHeightPx = 48;
    const ribbonCanvasHeight = Math.max((maxLane + 1) * laneHeightPx + 160, 360);

    // Save Eras Handler
    const handleSaveEras = (newEras: FantasyEra[]) => {
        setWorld(prev => ({
            ...prev,
            timelineEras: newEras
        }));
    };

    // Save Calendar Handler
    const handleSaveCalendar = (newCalendar: FantasyCalendar) => {
        setWorld(prev => ({
            ...prev,
            timelineCalendar: newCalendar
        }));
    };

    // Save Milestone Handler
    const handleSaveMilestone = (milestone: MilestonePin) => {
        setWorld(prev => {
            const currentPins = prev.milestonePins || [];
            const exists = currentPins.some(p => p.id === milestone.id);
            const updatedPins = exists
                ? currentPins.map(p => p.id === milestone.id ? milestone : p)
                : [...currentPins, milestone];
            return {
                ...prev,
                milestonePins: updatedPins
            };
        });
    };

    // Delete Milestone Handler
    const handleDeleteMilestone = (milestoneId: string) => {
        setWorld(prev => ({
            ...prev,
            milestonePins: (prev.milestonePins || []).filter(p => p.id !== milestoneId)
        }));
        if (inspectedItem?.id === milestoneId) {
            setInspectedItem(null);
        }
    };

    // Click handler for inspectable ribbons
    const handleSelectRibbon = (item: ProcessedTimelineItem) => {
        setInspectedItem({
            type: item.type,
            id: item.id,
            name: item.name,
            startYear: item.start,
            endYear: item.end,
            rawDate: (item.entity as any)?.birthDate || (item.entity as any)?.startDate || (item.entity as any)?.date,
            isDead: item.isDead,
            description: item.description,
            color: item.color,
            eventType: item.eventType
        });
    };

    // Click handler for milestone pins
    const handleSelectMilestone = (milestone: MilestonePin) => {
        setInspectedItem({
            type: 'milestone',
            id: milestone.id,
            name: milestone.name,
            startYear: milestone.year,
            description: milestone.description,
            color: milestone.color,
            entityId: milestone.entityId,
            rawMilestone: milestone
        });
    };

    // Jump scroll to specific year
    const handleJumpToYear = (targetYear: number) => {
        if (!scrollContainerRef.current) return;
        const totalWidth = ZOOM_CONFIGS[zoomLevel].width;
        const ratio = (targetYear - minYear) / yearSpan;
        const scrollTarget = ratio * totalWidth - scrollContainerRef.current.clientWidth / 2;
        scrollContainerRef.current.scrollTo({
            left: Math.max(0, scrollTarget),
            behavior: 'smooth'
        });
    };

    // Interactive mouse hover tracking on timeline canvas
    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!canvasInnerRef.current) return;
        const rect = canvasInnerRef.current.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const totalW = ZOOM_CONFIGS[zoomLevel].width;
        const clampedX = Math.max(0, Math.min(clientX, totalW));
        const pct = (clampedX / totalW) * 100;
        const year = Math.round(minYear + (yearSpan * (pct / 100)));
        setHoveredPosPct(pct);
        setHoveredYear(year);
    };

    const handleCanvasMouseLeave = () => {
        setHoveredYear(null);
        setHoveredPosPct(null);
    };

    // ── Theme tokens ──────────────────────────────────────────────────────────
    const isSovereign = themeId === 'sovereign';
    const isVoyager   = themeId === 'grand-voyager';
    const isRoyal     = themeId === 'royal-codex';
    const isWiki      = layoutMode === 'wiki';
    const isLightCanvas = isWiki || isRoyal;

    const titleGradient = isVoyager ? 'bg-gradient-to-r from-[#2dd4bf] via-[#5eead4] to-[#14b8a6] bg-clip-text text-transparent'
                        : isRoyal   ? 'text-[#3d0a10]'
                        : isWiki    ? 'text-[#881337]'
                        :             'bg-gradient-to-r from-[#fef08a] via-[#fde047] to-[#eab308] bg-clip-text text-transparent';

    const toolbarGlass = isVoyager ? 'bg-[#180c04]/90 border-[#3d2617] text-[#f0dca8] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
                       : isRoyal   ? 'bg-[#f4efe4] border-2 border-[#c8a96e]/60 text-[#2b1810] shadow-md'
                       : isWiki    ? 'bg-white border border-[#d4c8af] text-[#2b1810] shadow-sm'
                       :             'bg-slate-900/80 border-slate-700/60 text-slate-100 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]';

    const canvasGlass  = isVoyager ? 'bg-[#0a0502]/85 border-[#3d2617]/80 text-[#f0dca8] backdrop-blur-xl'
                       : isRoyal   ? 'bg-[#fbf7eb] border-2 border-[#c8a96e]/60 text-[#2b1810] shadow-inner'
                       : isWiki    ? 'bg-[#ffffff] border border-[#d4c8af] text-[#2b1810] shadow-sm'
                       :             'bg-slate-950/75 border-slate-800/80 text-slate-100 backdrop-blur-xl';

    const erasBtnCls = isVoyager ? 'border-[#2dd4bf]/40 text-[#2dd4bf] hover:bg-[#2dd4bf]/15 hover:border-[#2dd4bf]/80 shadow-[0_0_12px_rgba(45,212,191,0.15)]'
                     : isRoyal   ? 'border-[#70121e]/50 text-[#70121e] bg-[#70121e]/5 hover:bg-[#70121e]/15 shadow-sm font-serif font-bold'
                     : isWiki    ? 'border-red-700/40 text-red-800 bg-red-50/60 hover:bg-red-100/80 shadow-sm font-bold'
                     :             'border-[#fef08a]/35 text-[#fef08a] hover:bg-[#fef08a]/15 hover:border-[#fef08a]/70 shadow-[0_0_15px_rgba(254,240,138,0.15)]';

    const calendarBtnCls = isVoyager ? 'border-[#2dd4bf]/40 text-[#2dd4bf] hover:bg-[#2dd4bf]/15 hover:border-[#2dd4bf]/80 shadow-[0_0_12px_rgba(45,212,191,0.15)]'
                         : isRoyal   ? 'border-[#70121e]/50 text-[#70121e] bg-[#70121e]/5 hover:bg-[#70121e]/15 shadow-sm font-serif font-bold'
                         : isWiki    ? 'border-[#d4c8af] text-[#2b1810] bg-white hover:bg-[#f4efe4] shadow-sm font-semibold'
                         :             'border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800/60 hover:border-slate-600 shadow-[0_0_15px_rgba(255,255,255,0.05)]';

    const milestoneBtnCls = isVoyager ? 'bg-gradient-to-r from-[#14b8a6] to-[#2dd4bf] text-[#180c04] hover:brightness-110 shadow-[0_0_24px_rgba(45,212,191,0.35)]'
                          : isRoyal   ? 'bg-gradient-to-r from-[#70121e] to-[#991b1b] text-[#fff8e7] hover:brightness-110 shadow-[0_0_24px_rgba(112,18,30,0.35)] font-serif font-bold'
                          : isWiki    ? 'bg-red-700 text-white hover:bg-red-800 shadow-sm font-bold'
                          :             'bg-gradient-to-r from-[#fef08a] via-[#fde047] to-[#eab308] text-slate-950 hover:brightness-110 shadow-[0_0_24px_rgba(254,240,138,0.35)]';

    const activePill = isVoyager ? 'bg-[#2dd4bf]/25 text-[#2dd4bf] border border-[#2dd4bf]/50 shadow-[0_0_12px_rgba(45,212,191,0.25)]'
                     : isRoyal   ? 'bg-[#70121e] text-[#fff8e7] border border-[#70121e] shadow-sm font-bold'
                     : isWiki    ? 'bg-red-700 text-white shadow-sm font-bold'
                     :             'bg-[#fef08a]/20 text-[#fef08a] border border-[#fef08a]/45 shadow-[0_0_14px_rgba(254,240,138,0.22)]';

    return (
        <div className="h-full flex flex-col space-y-3.5 p-4 md:p-6 select-none overflow-hidden">
            {/* ── Top Header Bar ─────────────────────────────────────────────── */}
            <header className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3.5 border-b shrink-0 ${
                isWiki ? 'border-[#d4c8af]' : isRoyal ? 'border-[#c8a96e]/40' : 'border-white/[0.08]'
            }`}>
                <div className="flex items-center gap-3.5">
                    {/* Glowing Chronos Astrolabe Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border relative overflow-hidden shadow-xl ${
                        isSovereign ? 'bg-[#fef08a]/10 border-[#fef08a]/30 text-[#fef08a] shadow-[0_0_25px_rgba(254,240,138,0.18)]'
                        : isVoyager ? 'bg-[#2dd4bf]/10 border-[#2dd4bf]/30 text-[#2dd4bf] shadow-[0_0_25px_rgba(45,212,191,0.18)]'
                        : isRoyal   ? 'bg-[#70121e]/10 border-[#70121e]/30 text-[#70121e] shadow-md'
                        : isWiki    ? 'bg-red-700/10 border-red-700/30 text-red-700'
                        :             'bg-white/5 border-white/20 text-current'
                    }`}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                        <Compass className="animate-spin-slow" size={24} />
                    </div>

                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className={`text-2xl md:text-4xl font-serif font-black uppercase tracking-wider ${titleGradient}`}
                            style={isSovereign ? { filter: 'drop-shadow(0 2px 10px rgba(254,240,138,0.25))' } : undefined}
                            >
                                Chronos Timeline
                            </h1>

                            {/* Epochs & Records Micro Capsule */}
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono shadow-sm ${
                                isSovereign ? 'border-[#fef08a]/20 bg-[#fef08a]/5 text-[#fef08a]/80'
                                : isVoyager ? 'border-[#2dd4bf]/20 bg-[#2dd4bf]/5 text-[#2dd4bf]/80'
                                : isRoyal   ? 'border-[#70121e]/30 bg-[#70121e]/5 text-[#70121e] font-serif font-bold'
                                : isWiki    ? 'border-red-700/30 bg-red-700/5 text-red-800 font-bold'
                                :             'border-current/20 opacity-70'
                            }`}>
                                <span className="flex items-center gap-1">
                                    {eras.slice(0, 4).map(era => (
                                        <span 
                                            key={era.id} 
                                            className="w-2 h-2 rounded-full inline-block shadow-sm"
                                            style={{ backgroundColor: era.color || '#38bdf8' }}
                                            title={era.name}
                                        />
                                    ))}
                                    <span className="font-bold ml-1">{eras.length} Eras</span>
                                </span>
                                <span className="opacity-30">•</span>
                                <span className="font-semibold">{rawItems.length} Ribbons</span>
                                {milestonePins.length > 0 && (
                                    <>
                                        <span className="opacity-30">•</span>
                                        <span className="font-semibold">{milestonePins.length} Milestones</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <p className={`text-[11px] tracking-[0.28em] uppercase mt-1 italic font-serif flex items-center gap-2 ${
                            isRoyal ? 'text-[#70121e]/80 font-bold' : isWiki ? 'text-[#881337]/80 font-bold' : 'opacity-50'
                        }`}>
                            <span>The Flow of Historical Paradoxes &amp; Temporal Eras</span>
                        </p>
                    </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* ── View Mode Toggle ────────────────────────────── */}
                    <div className={`flex items-center rounded-xl border overflow-hidden text-xs font-bold uppercase tracking-wider ${
                        isRoyal ? 'border-[#c8a96e]/50' : isWiki ? 'border-[#d4c8af]' : isVoyager ? 'border-[#3d2617]' : 'border-slate-700/60'
                    }`}>
                        <button
                            onClick={() => setMainViewMode('chronos')}
                            title="Big-picture Chronos Timeline (eras, character lifespans, events)"
                            className={`flex items-center gap-1.5 px-3.5 py-2.5 transition-all ${
                                mainViewMode === 'chronos'
                                    ? (isVoyager ? 'bg-[#2dd4bf]/20 text-[#2dd4bf]' : isRoyal ? 'bg-[#70121e] text-[#fff8e7]' : isWiki ? 'bg-red-700 text-white' : 'bg-[#fef08a]/20 text-[#fef08a]')
                                    : (isLightCanvas ? 'bg-transparent text-[#2b1810]/55 hover:text-[#2b1810] hover:bg-black/5' : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5')
                            }`}
                        >
                            <History size={13} /> Chronos
                        </button>
                        <button
                            onClick={() => setMainViewMode('annual')}
                            title="Annual Calendar — full-year month grid & festivals"
                            disabled={!calendar}
                            className={`flex items-center gap-1.5 px-3.5 py-2.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                                mainViewMode === 'annual'
                                    ? (isVoyager ? 'bg-[#2dd4bf]/20 text-[#2dd4bf]' : isRoyal ? 'bg-[#70121e] text-[#fff8e7]' : isWiki ? 'bg-red-700 text-white' : 'bg-[#fef08a]/20 text-[#fef08a]')
                                    : (isLightCanvas ? 'bg-transparent text-[#2b1810]/55 hover:text-[#2b1810] hover:bg-black/5' : 'bg-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5')
                            }`}
                        >
                            <CalendarDays size={13} /> Annual
                        </button>
                    </div>

                    <button
                        onClick={() => setIsManageErasOpen(true)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all backdrop-blur-md ${erasBtnCls}`}
                        title="Configure Fantasy Eras, Epochs & Aura Colors"
                    >
                        <Sparkles size={14} className="animate-pulse" /> Manage Eras
                    </button>

                    <button
                        onClick={() => setIsManageCalendarOpen(true)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all backdrop-blur-md ${calendarBtnCls}`}
                        title="Configure Custom Fantasy Calendar: months, festivals, weekdays, leap cycles"
                    >
                        <Calendar size={14} className={calendar ? (isVoyager ? 'text-[#2dd4bf]' : isRoyal ? 'text-[#c8a96e]' : isWiki ? 'text-red-700' : 'text-[#fef08a]') : 'opacity-60'} />
                        <span>{calendar ? calendar.name : 'Calendar System'}</span>
                    </button>

                    <button
                        onClick={() => {
                            setEditingMilestone(null);
                            setIsAddMilestoneOpen(true);
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all font-sans ${milestoneBtnCls}`}
                        title="Plant a Pivotal Milestone Pin on the Chronos ribbons"
                    >
                        <Bookmark size={14} /> Add Milestone Pin
                    </button>
                </div>
            </header>

            {/* ── Filter & Zoom Floating Island Toolbar ─────────────────────── */}
            <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border shrink-0 text-xs shadow-xl ${toolbarGlass}`}>
                {/* Category Filter Pills with LIVE COUNTS */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[11px] font-bold uppercase mr-1 flex items-center gap-1 ${
                        isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#881337]' : 'opacity-50'
                    }`}>
                        <Filter size={12} /> Scope:
                    </span>

                    {(['all', 'events', 'characters', 'milestones'] as CategoryFilter[]).map(cat => {
                        const count = cat === 'all' ? categoryCounts.all :
                                      cat === 'events' ? categoryCounts.events :
                                      cat === 'characters' ? categoryCounts.characters :
                                      categoryCounts.milestones;
                        const label = cat === 'all' ? 'All Entries' : cat === 'characters' ? 'Lifespans' : cat;

                        return (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-all text-[11px] ${
                                    categoryFilter === cat
                                        ? activePill
                                        : isLightCanvas
                                        ? 'border border-[#d4c8af] text-[#2b1810] hover:bg-[#f4efe4] bg-white/80 shadow-sm'
                                        : 'border border-current/15 opacity-60 hover:opacity-100 hover:bg-current/10'
                                }`}
                            >
                                <span>{label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                    categoryFilter === cat
                                        ? (isRoyal || isWiki ? 'bg-white/25 text-white' : 'bg-black/30 text-current')
                                        : isLightCanvas
                                        ? 'bg-black/5 text-[#2b1810]'
                                        : 'bg-current/10 opacity-70'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}

                    {/* Sub-filters for Events */}
                    {categoryFilter === 'events' && availableEventTypes.length > 0 && (
                        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-current/15">
                            <span className={`text-[10px] uppercase font-bold ${isLightCanvas ? 'text-[#2b1810]' : 'opacity-50'}`}>Kind:</span>
                            <select
                                value={selectedEventType}
                                onChange={e => setSelectedEventType(e.target.value)}
                                className={`px-2.5 py-1 rounded-xl border text-xs focus:outline-none ${
                                    isRoyal ? 'bg-white border-[#c8a96e] text-[#2b1810]'
                                    : isWiki ? 'bg-white border-[#d4c8af] text-[#2b1810]'
                                    : isVoyager ? 'bg-[#180c04] border-[#2dd4bf]/20 text-[#2dd4bf]'
                                    : 'bg-slate-900 border-slate-700 text-slate-100'
                                }`}
                            >
                                <option value="all">All Event Kinds</option>
                                {availableEventTypes.map(type => (
                                    <option key={type} value={type} className={isLightCanvas ? "text-[#2b1810] bg-white" : "text-slate-100 bg-slate-900"}>{type}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Sub-filters for Lifespans */}
                    {categoryFilter === 'characters' && (
                        <div className="ml-2 pl-2 border-l border-current/15 flex items-center gap-1">
                            <span className={`text-[10px] uppercase font-bold ${isLightCanvas ? 'text-[#2b1810]' : 'opacity-50'}`}>Vitals:</span>
                            <div className={`flex items-center gap-0.5 border rounded-xl p-0.5 ${
                                isLightCanvas ? 'border-[#d4c8af] bg-[#f4efe4]' : 'border-current/15 bg-black/20'
                            }`}>
                                {(['all', 'living', 'deceased'] as LifeStatusFilter[]).map(st => (
                                    <button
                                        key={st}
                                        onClick={() => setLifeStatusFilter(st)}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                                            lifeStatusFilter === st 
                                                ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] shadow-sm'
                                                  : isWiki ? 'bg-red-700 text-white shadow-sm'
                                                  : 'bg-current/25 opacity-100 shadow-sm' 
                                                : isLightCanvas ? 'text-[#2b1810]/70 hover:text-[#2b1810]' : 'opacity-40 hover:opacity-85'
                                        }`}
                                    >
                                        {st === 'living' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                        {st === 'deceased' && <span className="opacity-60">†</span>}
                                        <span>{st}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right controls: Search & Zoom Level */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Filter timeline..."
                            className={`pl-7 pr-7 py-1.5 rounded-xl border text-xs focus:outline-none w-36 sm:w-48 shadow-sm transition-all ${
                                isRoyal ? 'border-[#c8a96e] bg-white text-[#2b1810] placeholder:text-[#2b1810]/40 focus:border-[#70121e] focus:ring-1 focus:ring-[#70121e]/30'
                                : isWiki ? 'border-[#d4c8af] bg-white text-[#2b1810] placeholder:text-[#2b1810]/40 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                                : isVoyager ? 'border-[#3d2617] bg-[#180c04] text-[#f0dca8] placeholder:text-[#f0dca8]/40 focus:border-[#2dd4bf]/60'
                                : 'border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-[#fef08a]/60'
                            }`}
                        />
                        <Search size={12} className={`absolute left-2.5 top-2.5 ${isLightCanvas ? 'text-[#2b1810]/50' : 'opacity-40'}`} />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className={`absolute right-2 top-2 transition-opacity ${isLightCanvas ? 'text-[#2b1810]/70 hover:text-[#2b1810]' : 'opacity-50 hover:opacity-100'}`}
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Zoom Scale Selector */}
                    <div className={`flex items-center gap-1 border rounded-xl p-0.5 ${
                        isLightCanvas ? 'bg-[#f4efe4] border-[#d4c8af]' : 'bg-black/30 border-current/15'
                    }`}>
                        <span className={`text-[9px] uppercase font-bold px-1.5 ${isLightCanvas ? 'text-[#2b1810]/60' : 'opacity-35'}`}>Zoom:</span>
                        {(['compact', 'standard', 'epic', 'panoramic'] as ZoomLevel[]).map(z => (
                            <button
                                key={z}
                                onClick={() => setZoomLevel(z)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                    zoomLevel === z 
                                        ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] shadow-sm'
                                          : isWiki ? 'bg-red-700 text-white shadow-sm'
                                          : 'bg-current/25 opacity-100 shadow-sm border border-current/20' 
                                        : isLightCanvas ? 'text-[#2b1810]/70 hover:text-[#2b1810] hover:bg-white/70' : 'opacity-40 hover:opacity-85'
                                }`}
                                title={`Scale: ${ZOOM_CONFIGS[z].label}`}
                            >
                                {z === 'compact' ? '2K' : z === 'standard' ? '3.4K' : z === 'epic' ? '5.2K' : '8K'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Annual Calendar View (shown when mainViewMode === 'annual') ─── */}
            {mainViewMode === 'annual' && calendar && (
                <div className="flex-1 min-h-0">
                    <AnnualCalendarView calendar={calendar} />
                </div>
            )}

            {/* ── No Calendar Warning (annual mode, no calendar set) ──────────── */}
            {mainViewMode === 'annual' && !calendar && (
                <div className={`flex-1 flex flex-col items-center justify-center gap-4 rounded-3xl border ${canvasGlass}`}>
                    <CalendarDays size={48} className="opacity-30" />
                    <div className="text-center">
                        <p className={`font-bold text-xl font-serif ${isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#881337]' : 'opacity-70'}`}>No Calendar Configured</p>
                        <p className="text-sm opacity-60 mt-1">Set up a Fantasy Calendar first to access the Annual Calendar view.</p>
                        <button
                            onClick={() => setIsManageCalendarOpen(true)}
                            className={`mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all mx-auto ${calendarBtnCls}`}
                        >
                            <Calendar size={15} /> Set Up Calendar
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main Interactive Timeline Canvas ──────────────────────────── */}
            {mainViewMode === 'chronos' && <div 
                ref={scrollContainerRef}
                className={`flex-1 relative overflow-auto custom-scrollbar rounded-3xl border shadow-2xl p-6 transition-all ${canvasGlass}`}
                style={{
                    backgroundImage: isSovereign 
                        ? 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(254,240,138,0.06), transparent 70%)'
                        : isVoyager
                        ? 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(45,212,191,0.06), transparent 70%)'
                        : undefined
                }}
            >
                <div 
                    ref={canvasInnerRef}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseLeave={handleCanvasMouseLeave}
                    className="relative pb-28 cursor-crosshair"
                    style={{ width: `${ZOOM_CONFIGS[zoomLevel].width}px` }}
                >
                    {/* BACKGROUND ERA AURA COLUMNS (Vertical visual territory for each era) */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                        {eras.map(era => {
                            const eraStart = era.startYear;
                            const eraEnd = era.endYear !== undefined ? era.endYear : maxYear;
                            const clampedStart = Math.max(eraStart, minYear);
                            const clampedEnd = Math.min(eraEnd, maxYear);
                            if (clampedEnd < minYear || clampedStart > maxYear) return null;

                            const leftPct = ((clampedStart - minYear) / yearSpan) * 100;
                            const widthPct = Math.max(((clampedEnd - clampedStart) / yearSpan) * 100, 1);
                            const eraColor = era.color || '#38bdf8';

                            return (
                                <div
                                    key={`col-${era.id}`}
                                    className="absolute top-0 bottom-0 border-r border-dashed"
                                    style={{
                                        left: `${leftPct}%`,
                                        width: `${widthPct}%`,
                                        background: `linear-gradient(180deg, ${eraColor}09 0%, ${eraColor}02 40%, transparent 100%)`,
                                        borderColor: `${eraColor}20`
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* 1. ERA BANDS ALONG TOP AXIS */}
                    <div className="relative h-14 w-full mb-6 flex items-center z-10">
                        {eras.map(era => {
                            const eraStart = era.startYear;
                            const eraEnd = era.endYear !== undefined ? era.endYear : maxYear;
                            const clampedStart = Math.max(eraStart, minYear);
                            const clampedEnd = Math.min(eraEnd, maxYear);

                            if (clampedEnd < minYear || clampedStart > maxYear) return null;

                            const leftPct = ((clampedStart - minYear) / yearSpan) * 100;
                            const widthPct = Math.max(((clampedEnd - clampedStart) / yearSpan) * 100, 1.2);
                            const eraColor = era.color || '#38bdf8';

                            return (
                                <div
                                    key={era.id}
                                    onClick={() => handleJumpToYear(era.startYear)}
                                    className={`absolute h-12 top-1 rounded-2xl border flex flex-col justify-center px-3.5 cursor-pointer group transition-all hover:scale-[1.01] shadow-md backdrop-blur-md ${
                                        isLightCanvas ? 'border-2' : ''
                                    }`}
                                    style={{
                                        left: `${leftPct}%`,
                                        width: `${widthPct}%`,
                                        background: isLightCanvas
                                            ? `linear-gradient(135deg, ${eraColor}35 0%, ${eraColor}18 100%)`
                                            : `linear-gradient(135deg, ${eraColor}22 0%, ${eraColor}09 100%)`,
                                        borderColor: isLightCanvas ? `${eraColor}` : `${eraColor}40`,
                                        boxShadow: isLightCanvas ? `0 2px 8px ${eraColor}25` : `0 4px 18px ${eraColor}15, inset 0 1px 0 0 ${eraColor}45`
                                    }}
                                    title={`${era.name} (${era.startYear} – ${era.endYear ?? 'Present'})\n${era.description || ''}\nClick to jump`}
                                >
                                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                                        <div className="flex items-center gap-2 truncate">
                                            {/* Glowing Dot Beacon */}
                                            <span 
                                                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                                                style={{ 
                                                    backgroundColor: eraColor, 
                                                    boxShadow: `0 0 8px ${eraColor}` 
                                                }} 
                                            />
                                            {/* Abbreviation Badge */}
                                            {era.abbreviation && (
                                                <span 
                                                    className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0"
                                                    style={{ 
                                                        backgroundColor: isLightCanvas ? `${eraColor}40` : `${eraColor}28`,
                                                        color: isLightCanvas ? '#1c140d' : eraColor 
                                                    }}
                                                >
                                                    {era.abbreviation}
                                                </span>
                                            )}
                                            <span className={`font-serif font-black text-xs md:text-sm tracking-wide truncate ${
                                                isLightCanvas ? 'text-[#1c140d]' : 'text-white drop-shadow-sm'
                                            }`}>
                                                {era.name}
                                            </span>
                                        </div>

                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border shrink-0 font-bold ${
                                            isLightCanvas 
                                                ? 'bg-white/90 border-[#c8a96e]/60 text-[#1c140d] shadow-sm'
                                                : 'bg-black/30 border-white/10 opacity-75'
                                        }`}>
                                            {era.startYear} — {era.endYear ?? '∞'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 2. PRECISION CHRONOLOGICAL TIME AXIS & TICK MARKS */}
                    <div className="relative h-10 w-full mb-10 flex items-center z-10">
                        {/* Glowing Rail Line */}
                        <div 
                            className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
                            style={{
                                background: isRoyal 
                                    ? 'linear-gradient(90deg, rgba(112,18,30,0.3) 0%, rgba(112,18,30,0.8) 50%, rgba(112,18,30,0.3) 100%)'
                                    : isWiki
                                    ? 'linear-gradient(90deg, rgba(185,28,28,0.3) 0%, rgba(185,28,28,0.8) 50%, rgba(185,28,28,0.3) 100%)'
                                    : isSovereign 
                                    ? 'linear-gradient(90deg, rgba(254,240,138,0.2) 0%, rgba(254,240,138,0.6) 50%, rgba(254,240,138,0.2) 100%)'
                                    : 'linear-gradient(90deg, rgba(45,212,191,0.2) 0%, rgba(45,212,191,0.6) 50%, rgba(45,212,191,0.2) 100%)',
                                boxShadow: isSovereign ? '0 0 10px rgba(254,240,138,0.3)' : undefined
                            }}
                        />

                        {/* Major Axis Ticks */}
                        {Array.from({ length: 25 }).map((_, i) => {
                            const tickYear = Math.round(minYear + (yearSpan * (i / 24)));
                            const leftPct = (i / 24) * 100;
                            const eraMatch = findEraForYear(tickYear, eras);
                            const eraLabel = eraMatch ? (eraMatch.abbreviation || eraMatch.name) : (tickYear < 0 ? 'BCE' : 'CE');
                            const isMajor = i % 4 === 0;

                            return (
                                <div 
                                    key={i} 
                                    className="absolute top-1/2 flex flex-col items-center -translate-x-1/2 pointer-events-none"
                                    style={{ left: `${leftPct}%` }}
                                >
                                    {/* Tick pip */}
                                    <div 
                                        className={`-translate-y-1/2 transition-all ${
                                            isMajor 
                                                ? 'w-2.5 h-2.5 rotate-45 border shadow-sm' 
                                                : 'w-px h-3.5'
                                        }`}
                                        style={{
                                            backgroundColor: isMajor 
                                                ? (isRoyal ? '#70121e' : isWiki ? '#b91c1c' : isSovereign ? '#fef08a' : '#2dd4bf')
                                                : (isLightCanvas ? '#1c140d' : 'currentColor'),
                                            borderColor: isMajor
                                                ? (isRoyal ? '#70121e' : isWiki ? '#b91c1c' : isSovereign ? '#fef08a' : '#2dd4bf')
                                                : undefined,
                                            opacity: isMajor ? 1 : (isLightCanvas ? 0.35 : 0.4)
                                        }}
                                    />

                                    {/* Year Readout */}
                                    <div className="flex flex-col items-center mt-3">
                                        <span className={`font-mono tracking-tight leading-none ${
                                            isMajor 
                                                ? (isLightCanvas ? 'text-xs font-black text-[#1c140d]' : 'text-xs font-bold opacity-80') 
                                                : (isLightCanvas ? 'text-[10px] font-bold text-[#1c140d]/70' : 'text-[10px] opacity-40')
                                        }`}>
                                            {tickYear}
                                        </span>
                                        <span className={`text-[9px] font-sans font-bold uppercase mt-0.5 ${
                                            isLightCanvas ? (isRoyal ? 'text-[#70121e]' : 'text-[#b91c1c]') : 'opacity-45'
                                        }`}>
                                            {eraLabel}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* INTERACTIVE MOUSE TEMPORAL SCRUBBER CURSOR */}
                    {hoveredPosPct !== null && hoveredYear !== null && (
                        <div 
                            className="absolute top-0 bottom-0 pointer-events-none z-30 transition-opacity duration-75"
                            style={{ left: `${hoveredPosPct}%` }}
                        >
                            {/* Vertical Laser Beam */}
                            <div 
                                className="w-px h-full -translate-x-1/2"
                                style={{
                                    background: isSovereign 
                                        ? 'linear-gradient(180deg, rgba(254,240,138,0.95) 0%, rgba(254,240,138,0.4) 60%, transparent 100%)'
                                        : isVoyager
                                        ? 'linear-gradient(180deg, rgba(45,212,191,0.95) 0%, rgba(45,212,191,0.4) 60%, transparent 100%)'
                                        : isRoyal
                                        ? 'linear-gradient(180deg, rgba(200,169,110,0.95) 0%, rgba(200,169,110,0.4) 60%, transparent 100%)'
                                        : isWiki
                                        ? 'linear-gradient(180deg, rgba(185,28,28,0.95) 0%, rgba(185,28,28,0.4) 60%, transparent 100%)'
                                        : 'linear-gradient(180deg, rgba(56,189,248,0.95) 0%, rgba(56,189,248,0.4) 60%, transparent 100%)',
                                    boxShadow: isSovereign ? '0 0 10px rgba(254,240,138,0.7)'
                                             : isVoyager ? '0 0 10px rgba(45,212,191,0.7)'
                                             : isRoyal ? '0 0 10px rgba(200,169,110,0.7)'
                                             : isWiki ? '0 0 8px rgba(185,28,28,0.5)'
                                             : '0 0 8px rgba(56,189,248,0.6)'
                                }}
                            />

                            {/* Floating Cursor Tooltip */}
                            <div 
                                className="absolute top-16 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-mono font-bold whitespace-nowrap shadow-2xl border backdrop-blur-2xl ring-1"
                                style={{
                                    backgroundColor: isSovereign ? 'rgba(15, 23, 42, 0.92)' 
                                                   : isVoyager ? 'rgba(24, 12, 4, 0.95)' 
                                                   : isRoyal ? 'rgba(28, 20, 13, 0.95)' 
                                                   : isWiki ? 'rgba(255, 255, 255, 0.96)' 
                                                   : 'rgba(2, 6, 23, 0.92)',
                                    borderColor: isSovereign ? 'rgba(254, 240, 138, 0.5)' 
                                               : isVoyager ? 'rgba(45, 212, 191, 0.5)' 
                                               : isRoyal ? 'rgba(200, 169, 110, 0.5)' 
                                               : isWiki ? 'rgba(212, 200, 175, 1)' 
                                               : 'rgba(56, 189, 248, 0.5)',
                                    color: isSovereign ? '#fef08a' 
                                         : isVoyager ? '#2dd4bf' 
                                         : isRoyal ? '#fff8e7' 
                                         : isWiki ? '#881337' 
                                         : '#38bdf8',
                                    boxShadow: isWiki ? '0 4px 16px rgba(0,0,0,0.12)' : '0 8px 24px rgba(0,0,0,0.75)'
                                }}
                            >
                                {formatHoveredYearWithCalendar(hoveredYear, eras, calendar)}
                            </div>
                        </div>
                    )}

                    {/* 3. VERTICAL BEAMS FOR MILESTONE PINS */}
                    {milestonePins.map(pin => {
                        const leftPct = ((pin.year - minYear) / yearSpan) * 100;
                        if (leftPct < 0 || leftPct > 100) return null;
                        const pinColor = pin.color || '#f59e0b';

                        return (
                            <div
                                key={pin.id}
                                className="absolute top-14 bottom-0 pointer-events-auto z-20 group"
                                style={{ left: `${leftPct}%` }}
                            >
                                {/* Vertical Light Beam */}
                                <div 
                                    className="absolute top-0 bottom-0 w-px -translate-x-1/2 transition-all group-hover:w-0.5"
                                    style={{ 
                                        background: `linear-gradient(180deg, ${pinColor}95 0%, ${pinColor}40 60%, transparent 100%)`,
                                        filter: `drop-shadow(0 0 4px ${pinColor}70)`
                                    }}
                                />

                                {/* Top Diamond Pin Badge */}
                                <div
                                    onClick={() => handleSelectMilestone(pin)}
                                    className="absolute -top-6 -translate-x-1/2 cursor-pointer transition-transform hover:scale-125 z-30 flex flex-col items-center"
                                >
                                    <div 
                                        className="w-5 h-5 rotate-45 rounded-sm border-2 shadow-2xl flex items-center justify-center transition-all group-hover:rotate-90 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                                        style={{ 
                                            backgroundColor: pinColor,
                                            borderColor: '#ffffff',
                                            boxShadow: `0 0 14px ${pinColor}80`
                                        }}
                                    >
                                        <Bookmark size={11} className="text-black -rotate-45" />
                                    </div>

                                    {/* Tooltip / Label */}
                                    <div 
                                        className="mt-2 px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider whitespace-nowrap shadow-xl border backdrop-blur-xl"
                                        style={{ 
                                            backgroundColor: isLightCanvas ? '#ffffff' : `${pinColor}25`, 
                                            borderColor: isLightCanvas ? `${pinColor}90` : `${pinColor}60`,
                                            color: isLightCanvas ? '#1c140d' : '#ffffff',
                                            boxShadow: isLightCanvas ? '0 4px 12px rgba(0,0,0,0.1)' : undefined
                                        }}
                                    >
                                        {pin.name} ({pin.year})
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* 4. PACKED MULTI-LANE RIBBONS */}
                    <div 
                        className="relative w-full"
                        style={{ height: `${ribbonCanvasHeight}px` }}
                    >
                        {/* Horizontal Lane Rails */}
                        {Array.from({ length: Math.max(maxLane + 1, 4) }).map((_, l) => (
                            <div 
                                key={`lane-${l}`}
                                className={`absolute left-0 right-0 h-px pointer-events-none ${
                                    isLightCanvas ? 'border-b border-black/[0.06]' : 'border-b border-white/[0.04]'
                                }`}
                                style={{ top: `${l * laneHeightPx + 24}px` }}
                            />
                        ))}

                        {packedItems.map(({ item, lane }) => {
                            const leftPct = ((item.start - minYear) / yearSpan) * 100;
                            const widthPct = Math.max(((item.end - item.start) / yearSpan) * 100, 1.0);
                            const topPx = lane * laneHeightPx + 14;
                            const isEvent = item.type === 'event';
                            const isInspected = inspectedItem?.id === item.id;
                            const itemColor = item.color || (isEvent ? '#f59e0b' : '#38bdf8');

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelectRibbon(item)}
                                    className={`absolute transition-all cursor-pointer group hover:z-40 ${
                                        isInspected ? 'z-30 ring-2 ring-white/60 scale-[1.02]' : 'z-10'
                                    }`}
                                    style={{
                                        left: `${leftPct}%`,
                                        width: `${widthPct}%`,
                                        top: `${topPx}px`,
                                        height: '36px'
                                    }}
                                >
                                    {isEvent ? (
                                        /* Historical Event Ribbon */
                                        <div 
                                            className="h-full rounded-xl border flex items-center px-3 gap-2 transition-all group-hover:scale-[1.01] group-hover:brightness-125 overflow-hidden backdrop-blur-md shadow-md"
                                            style={{
                                                background: isLightCanvas 
                                                    ? `linear-gradient(90deg, ${itemColor}25 0%, #ffffff 100%)` 
                                                    : `linear-gradient(90deg, ${itemColor}25 0%, ${itemColor}12 100%)`,
                                                borderColor: isLightCanvas ? `${itemColor}` : `${itemColor}55`,
                                                boxShadow: isInspected 
                                                    ? `0 0 16px ${itemColor}60, inset 0 1px 0 0 rgba(255,255,255,0.4)` 
                                                    : isLightCanvas 
                                                    ? `0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 0 rgba(255,255,255,0.8)`
                                                    : `0 2px 10px ${itemColor}15, inset 0 1px 0 0 rgba(255,255,255,0.08)`
                                            }}
                                        >
                                            <div 
                                                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                                                style={{ backgroundColor: itemColor, boxShadow: `0 0 8px ${itemColor}` }}
                                            />
                                            <span className={`font-bold text-xs truncate ${isLightCanvas ? 'text-[#1c140d]' : 'text-white drop-shadow-sm'}`}>
                                                {item.name}
                                            </span>
                                            {item.eventType && (
                                                <span 
                                                    className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold shrink-0 shadow-sm"
                                                    style={{ 
                                                        backgroundColor: isLightCanvas ? `${itemColor}20` : `${itemColor}30`, 
                                                        color: isLightCanvas ? (isRoyal ? '#70121e' : '#881337') : itemColor,
                                                        border: isLightCanvas ? `1px solid ${itemColor}60` : undefined
                                                    }}
                                                >
                                                    {item.eventType}
                                                </span>
                                            )}
                                            <span className={`text-[10px] font-mono ml-auto shrink-0 font-bold ${isLightCanvas ? 'text-[#1c140d]/70' : 'opacity-60 text-white'}`}>
                                                {item.start} {item.end > item.start + 2 ? `– ${item.end}` : ''}
                                            </span>
                                        </div>
                                    ) : (
                                        /* Character Lifespan Ribbon */
                                        <div 
                                            className={`h-full rounded-full border flex items-center px-3.5 gap-2 transition-all group-hover:scale-[1.01] group-hover:brightness-125 overflow-hidden backdrop-blur-md shadow-md ${
                                                item.isDead ? 'opacity-75' : 'opacity-100'
                                            }`}
                                            style={{
                                                background: isLightCanvas 
                                                    ? `linear-gradient(90deg, ${itemColor}25 0%, #ffffff 100%)` 
                                                    : `linear-gradient(90deg, ${itemColor}20 0%, ${itemColor}0e 100%)`,
                                                borderColor: isLightCanvas ? `${itemColor}` : `${itemColor}45`,
                                                boxShadow: isInspected 
                                                    ? `0 0 16px ${itemColor}50, inset 0 1px 0 0 rgba(255,255,255,0.4)` 
                                                    : isLightCanvas
                                                    ? `0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 0 rgba(255,255,255,0.8)`
                                                    : `0 2px 8px ${itemColor}10, inset 0 1px 0 0 rgba(255,255,255,0.05)`
                                            }}
                                        >
                                            <div 
                                                className={`w-2 h-2 rounded-full shrink-0 ${!item.isDead ? 'animate-pulse' : ''}`}
                                                style={{ 
                                                    backgroundColor: item.isDead ? '#64748b' : itemColor,
                                                    boxShadow: !item.isDead ? `0 0 6px ${itemColor}` : undefined
                                                }}
                                            />
                                            <span className={`font-semibold text-xs truncate ${isLightCanvas ? 'text-[#1c140d]' : 'text-white drop-shadow-sm'}`}>
                                                {item.name}
                                            </span>
                                            <span className={`text-[10px] font-mono ml-auto shrink-0 font-bold ${isLightCanvas ? 'text-[#1c140d]/70' : 'opacity-60 text-white'}`}>
                                                {item.start} — {item.isDead ? `${item.end} †` : 'Living'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* ── Magnificent Empty State (When no records match) ──── */}
                        {packedItems.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center p-6">
                                <div className={`max-w-lg w-full p-8 rounded-3xl border text-center shadow-2xl backdrop-blur-2xl transition-all ${
                                    isSovereign ? 'bg-slate-900/80 border-[#fef08a]/20 shadow-[0_20px_50px_rgba(0,0,0,0.7)]'
                                    : isVoyager ? 'bg-[#180c04]/85 border-[#2dd4bf]/20 shadow-[0_20px_50px_rgba(0,0,0,0.7)]'
                                    : isRoyal   ? 'bg-[#f4efe4] border-2 border-[#c8a96e]/60 text-[#2b1810] shadow-xl'
                                    : isWiki    ? 'bg-white/95 border border-[#d4c8af] text-[#2b1810] shadow-xl'
                                    :             'bg-slate-900/80 border-slate-700/50'
                                }`}>
                                    {/* Ornate Chronos Altar Icon */}
                                    <div className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center border shadow-xl relative ${
                                        isSovereign ? 'bg-[#fef08a]/10 border-[#fef08a]/30 text-[#fef08a]'
                                        : isVoyager ? 'bg-[#2dd4bf]/10 border-[#2dd4bf]/30 text-[#2dd4bf]'
                                        : isRoyal   ? 'bg-[#70121e]/10 border-[#70121e]/30 text-[#70121e]'
                                        :             'bg-red-700/10 border-red-700/30 text-red-700'
                                    }`}>
                                        <History size={30} className="animate-pulse" />
                                    </div>

                                    {rawItems.length === 0 ? (
                                        <>
                                            <h3 className={`text-xl font-serif font-black uppercase tracking-wider mb-2 ${
                                                isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#881337]' : `${titleGradient} bg-clip-text text-transparent`
                                            }`}>
                                                The Chronos Tapestry is Unwritten
                                            </h3>
                                            <p className={`text-xs leading-relaxed mb-6 font-sans ${isLightCanvas ? 'text-[#2b1810]/70' : 'opacity-60'}`}>
                                                No dated events or character lifespans are recorded in this realm yet. Inscribe your first historic turning point or assign dates to existing entities to weave the timeline.
                                            </p>

                                            <div className="flex items-center justify-center gap-3 flex-wrap">
                                                <button
                                                    onClick={() => handleCreate('event', 'The Great Convergence', true)}
                                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${milestoneBtnCls}`}
                                                >
                                                    <Plus size={14} /> Record First Event
                                                </button>

                                                <button
                                                    onClick={() => handleCreate('character', 'First Chronos Lorekeeper', true)}
                                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${erasBtnCls}`}
                                                >
                                                    <User size={14} /> Inscribe Character
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className={`text-xl font-serif font-black uppercase tracking-wider mb-2 ${
                                                isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#881337]' : `${titleGradient} bg-clip-text text-transparent`
                                            }`}>
                                                No Records Match Active Filter
                                            </h3>
                                            <p className={`text-xs leading-relaxed mb-6 font-sans ${isLightCanvas ? 'text-[#2b1810]/70' : 'opacity-60'}`}>
                                                There are <span className={`font-bold ${isLightCanvas ? 'text-[#70121e]' : 'text-white'}`}>{rawItems.length}</span> ribbons recorded in other categories, but none currently match <span className="uppercase font-bold underline">"{categoryFilter}"</span>.
                                            </p>

                                            <button
                                                onClick={() => {
                                                    setCategoryFilter('all');
                                                    setSelectedEventType('all');
                                                    setLifeStatusFilter('all');
                                                    setSearchQuery('');
                                                }}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider mx-auto transition-all ${milestoneBtnCls}`}
                                            >
                                                <RotateCcw size={14} /> Show All {rawItems.length} Records
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>}

            {/* ── Docked Inspector Card ─────────────────────────────────────── */}
            {inspectedItem && (
                <div className="shrink-0 max-w-xl mx-auto w-full z-40 animate-in fade-in slide-in-from-bottom-3 duration-200">
                    <TimelineInspectorCard
                        item={inspectedItem}
                        eras={eras}
                        calendar={calendar}
                        onClose={() => setInspectedItem(null)}
                        onNavigate={onNavigate}
                        onEditMilestone={milestone => {
                            setEditingMilestone(milestone);
                            setIsAddMilestoneOpen(true);
                        }}
                    />
                </div>
            )}

            {/* ── Footer Legend Bar ─────────────────────────────────────────── */}
            <footer className={`flex flex-wrap justify-between items-center text-[10px] uppercase font-bold tracking-widest px-2 shrink-0 pt-1 ${
                isRoyal ? 'text-[#70121e]/85' 
                : isWiki ? 'text-[#881337]/85'
                : 'opacity-50 text-white'
            }`}>
                <div className={`flex items-center gap-2 ${isLightCanvas ? 'text-[#1c140d]/80' : ''}`}>
                    <ArrowLeft size={12} className={isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#881337]' : ''} /> Antiquity ({minYear})
                </div>

                <div className={`flex items-center gap-5 ${isLightCanvas ? 'text-[#1c140d]/80' : ''}`}>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b] shadow-[0_0_5px_#f59e0b]" /> Events
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] shadow-[0_0_5px_#0284c7]" /> Living Lifespans
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" /> Deceased (†)
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rotate-45 bg-[#f59e0b]" /> Milestone Pin
                    </span>
                </div>

                <div className={`flex items-center gap-2 ${isLightCanvas ? 'text-[#1c140d]/80' : ''}`}>
                    Future Horizons ({maxYear}) <ArrowRight size={12} className={isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#881337]' : ''} />
                </div>
            </footer>


            {/* ── Manage Eras Modal ─────────────────────────────────────────── */}
            <ManageErasModal
                isOpen={isManageErasOpen}
                eras={eras}
                onSaveEras={handleSaveEras}
                onClose={() => setIsManageErasOpen(false)}
            />

            {/* ── Add / Edit Milestone Pin Modal ────────────────────────────── */}
            <AddMilestoneModal
                isOpen={isAddMilestoneOpen}
                initialMilestone={editingMilestone}
                existingEntities={world.entities}
                onSaveMilestone={handleSaveMilestone}
                onDeleteMilestone={handleDeleteMilestone}
                onClose={() => {
                    setIsAddMilestoneOpen(false);
                    setEditingMilestone(null);
                }}
            />
            {/* ── Manage Calendar Modal ─────────────────────────────────────── */}
            <ManageCalendarModal
                isOpen={isManageCalendarOpen}
                calendar={calendar}
                onSaveCalendar={handleSaveCalendar}
                onClose={() => setIsManageCalendarOpen(false)}
            />
        </div>
    );
};
