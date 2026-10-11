import React, { useState, useMemo, useRef } from 'react';
import { 
    Calendar, History, ArrowLeft, ArrowRight, Bookmark,
    Sparkles, Filter, Search, X, User
} from 'lucide-react';
import { WorldData, WorldEntity, Character, Event, FantasyEra, MilestonePin } from '../types';
import { useWorldStore } from '../store/useWorldStore';
import { useTheme } from '../theme';
import { 
    extractYear, findEraForYear, formatYearWithEra, 
    packTimelineLanes, DEFAULT_ERA_PRESETS 
} from '../utils/timelineUtils';
import { isEntityDeceased } from '../utils/documentModeUtils';
import { ManageErasModal } from '../components/timeline/ManageErasModal';
import { AddMilestoneModal } from '../components/timeline/AddMilestoneModal';
import { TimelineInspectorCard, InspectedTimelineItem } from '../components/timeline/TimelineInspectorCard';

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
    const setWorld = propSetWorld || storeSetWorld;

    // View state
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [selectedEventType, setSelectedEventType] = useState<string>('all');
    const [lifeStatusFilter, setLifeStatusFilter] = useState<LifeStatusFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('standard');
    
    // Modal states
    const [isManageErasOpen, setIsManageErasOpen] = useState(false);
    const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState<MilestonePin | null>(null);

    // Selected item for Inspector
    const [inspectedItem, setInspectedItem] = useState<InspectedTimelineItem | null>(null);

    // Timeline scroll container ref
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Effective eras (fallback to mythic preset if not defined)
    const eras: FantasyEra[] = useMemo(() => {
        if (world.timelineEras && world.timelineEras.length > 0) {
            return world.timelineEras;
        }
        return DEFAULT_ERA_PRESETS.mythic.eras;
    }, [world.timelineEras]);

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
        const padding = Math.max(Math.round((calculatedMax - calculatedMin) * 0.05), 20);
        const paddedMin = calculatedMin - padding;
        const paddedMax = calculatedMax + padding;

        return {
            rawItems: items,
            minYear: paddedMin,
            maxYear: paddedMax,
            yearSpan: paddedMax - paddedMin || 100
        };
    }, [world.entities, milestonePins, eras]);

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
    const laneHeightPx = 42;
    const ribbonCanvasHeight = Math.max((maxLane + 1) * laneHeightPx + 140, 320);

    // Save Eras Handler
    const handleSaveEras = (newEras: FantasyEra[]) => {
        setWorld(prev => ({
            ...prev,
            timelineEras: newEras
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

    // ── Theme tokens ──────────────────────────────────────────────────────────
    const isSovereign = themeId === 'sovereign';
    const isVoyager   = themeId === 'grand-voyager';
    const isRoyal     = themeId === 'royal-codex';
    const isWiki      = layoutMode === 'wiki';

    const accentText = isVoyager ? 'text-[#2dd4bf]' : isRoyal ? 'text-[#c8a96e]' : isWiki ? 'text-red-700' : 'text-[#fef08a]';

    const toolbarGlass = isVoyager ? 'bg-[#1a0e06]/60 border-[#3d2617]/60 backdrop-blur-lg'
                       : isRoyal   ? 'bg-[#16100b]/60 border-[#c8a96e]/15 backdrop-blur-lg'
                       : isWiki    ? 'bg-white/70 border-[#d4c8af]/70'
                       :             'bg-slate-800/50 border-slate-700/40 backdrop-blur-lg';

    const canvasGlass  = isVoyager ? 'bg-[#0e0702]/50 border-[#3d2617]/40 backdrop-blur-md'
                       : isRoyal   ? 'bg-[#100c08]/50 border-[#c8a96e]/15 backdrop-blur-md'
                       : isWiki    ? 'bg-[#f9f6f0]/80 border-[#d4c8af]/60'
                       :             'bg-slate-900/40 border-slate-800/50 backdrop-blur-md';

    const erasBtnCls = isVoyager ? 'border-[#2dd4bf]/30 text-[#2dd4bf] hover:bg-[#2dd4bf]/10 hover:border-[#2dd4bf]/60'
                     : isRoyal   ? 'border-[#c8a96e]/30 text-[#c8a96e] hover:bg-[#c8a96e]/10'
                     : isWiki    ? 'border-red-700/30 text-red-700 hover:bg-red-700/10'
                     :             'border-[#fef08a]/25 text-[#fef08a] hover:bg-[#fef08a]/10 hover:border-[#fef08a]/50';

    const milestoneBtnCls = isVoyager ? 'bg-[#2dd4bf] text-[#180c04] hover:bg-[#2dd4bf]/90 shadow-[0_0_16px_rgba(45,212,191,0.3)]'
                          : isRoyal   ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#851624] shadow-[0_0_16px_rgba(112,18,30,0.3)]'
                          : isWiki    ? 'bg-red-700 text-white hover:bg-red-800'
                          :             'bg-[#fef08a] text-slate-950 hover:bg-yellow-300 shadow-[0_0_18px_rgba(254,240,138,0.30)]';

    const activePill = isVoyager ? 'bg-[#2dd4bf]/20 text-[#2dd4bf]'
                     : isRoyal   ? 'bg-[#c8a96e]/20 text-[#c8a96e]'
                     : isWiki    ? 'bg-red-700 text-white'
                     :             'bg-[#fef08a]/20 text-[#fef08a] shadow-[inset_0_0_8px_rgba(254,240,138,0.08)]';

    return (
        <div className="h-full flex flex-col space-y-3 p-4 md:p-7 select-none overflow-hidden">
            {/* ── Top Header Bar ─────────────────────────────────────────────── */}
            <header className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b shrink-0 ${
                isWiki ? 'border-[#d4c8af]' : 'border-white/[0.06]'
            }`}>
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1
                            className={`text-3xl md:text-5xl font-serif font-black uppercase tracking-tight ${accentText}`}
                            style={isSovereign ? { textShadow: '0 0 40px rgba(254,240,138,0.20)' } : undefined}
                        >
                            Chronos Timeline
                        </h1>
                        <span className={`text-xs px-3 py-1 rounded-full border font-mono ${
                            isSovereign ? 'border-[#fef08a]/20 text-[#fef08a]/55 bg-[#fef08a]/5'
                            : isVoyager ? 'border-[#2dd4bf]/20 text-[#2dd4bf]/55 bg-[#2dd4bf]/5'
                            : isRoyal   ? 'border-[#c8a96e]/20 text-[#c8a96e]/60'
                            : isWiki    ? 'border-red-700/20 text-red-700/60'
                            :             'border-current/20 opacity-60'
                        }`}>
                            {rawItems.length} Records • {eras.length} Eras
                        </span>
                    </div>
                    <p className="opacity-40 text-xs tracking-[0.25em] uppercase mt-1 italic font-serif">
                        The Flow of Historical Paradoxes &amp; Temporal Eras
                    </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        onClick={() => setIsManageErasOpen(true)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all backdrop-blur-sm ${erasBtnCls}`}
                        title="Configure Fantasy Eras, Epochs & Aura Colors"
                    >
                        <Sparkles size={13} /> Manage Eras
                    </button>

                    <button
                        onClick={() => {
                            setEditingMilestone(null);
                            setIsAddMilestoneOpen(true);
                        }}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${milestoneBtnCls}`}
                        title="Plant a Pivotal Milestone Pin on the Chronos ribbons"
                    >
                        <Bookmark size={13} /> Add Milestone Pin
                    </button>
                </div>
            </header>

            {/* ── Filter & Zoom Toolbar ────────────────────────────────────── */}
            <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl border shrink-0 text-xs ${toolbarGlass}`}>
                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold uppercase opacity-45 mr-1 flex items-center gap-1">
                        <Filter size={11} /> Filter:
                    </span>
                    {(['all', 'events', 'characters', 'milestones'] as CategoryFilter[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-all text-[11px] ${
                                categoryFilter === cat
                                    ? activePill
                                    : 'border border-current/10 opacity-50 hover:opacity-90 hover:bg-current/5'
                            }`}
                        >
                            {cat === 'all' ? 'All Entries' : cat === 'characters' ? 'Lifespans' : cat}
                        </button>
                    ))}

                    {/* Sub-filters for Events */}
                    {categoryFilter === 'events' && availableEventTypes.length > 0 && (
                        <select
                            value={selectedEventType}
                            onChange={e => setSelectedEventType(e.target.value)}
                            className={`ml-2 px-2.5 py-1.5 rounded-xl border bg-transparent text-xs focus:outline-none ${
                                isSovereign ? 'border-[#fef08a]/20' : isVoyager ? 'border-[#2dd4bf]/20' : 'border-current/20'
                            }`}
                        >
                            <option value="all">All Event Types</option>
                            {availableEventTypes.map(type => (
                                <option key={type} value={type} className="text-slate-900">{type}</option>
                            ))}
                        </select>
                    )}

                    {/* Sub-filters for Lifespans */}
                    {categoryFilter === 'characters' && (
                        <div className={`ml-2 flex items-center gap-0.5 border rounded-xl p-0.5 ${
                            isSovereign ? 'border-[#fef08a]/15' : 'border-current/15'
                        }`}>
                            {(['all', 'living', 'deceased'] as LifeStatusFilter[]).map(st => (
                                <button
                                    key={st}
                                    onClick={() => setLifeStatusFilter(st)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                        lifeStatusFilter === st ? 'bg-current/20 opacity-100' : 'opacity-40 hover:opacity-80'
                                    }`}
                                >
                                    {st}
                                </button>
                            ))}
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
                            placeholder="Search ribbons..."
                            className={`pl-7 pr-3 py-1.5 rounded-xl border bg-black/20 text-xs focus:outline-none w-36 sm:w-44 ${
                                isSovereign ? 'border-[#fef08a]/15 text-white placeholder:text-slate-500 focus:border-[#fef08a]/40'
                                : isVoyager ? 'border-[#2dd4bf]/15 text-[#f0dca8] placeholder:text-[#f0dca8]/40 focus:border-[#2dd4bf]/40'
                                : isRoyal   ? 'border-[#c8a96e]/20 text-[#fff8e7] placeholder:text-[#fff8e7]/40 focus:border-[#c8a96e]/40'
                                : isWiki    ? 'border-[#d4c8af] bg-white text-[#2b1810] placeholder:text-slate-400 focus:border-red-400'
                                :             'border-current/20'
                            }`}
                        />
                        <Search size={11} className="absolute left-2.5 top-2.5 opacity-40" />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-2 opacity-40 hover:opacity-100 transition-opacity"
                            >
                                <X size={11} />
                            </button>
                        )}
                    </div>

                    {/* Zoom Buttons */}
                    <div className={`flex items-center gap-0.5 border rounded-xl p-0.5 ${
                        isSovereign ? 'border-[#fef08a]/15' : 'border-current/15'
                    }`}>
                        {(['compact', 'standard', 'epic', 'panoramic'] as ZoomLevel[]).map(z => (
                            <button
                                key={z}
                                onClick={() => setZoomLevel(z)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                    zoomLevel === z ? 'bg-current/20 opacity-100' : 'opacity-35 hover:opacity-75'
                                }`}
                                title={`Zoom: ${ZOOM_CONFIGS[z].label}`}
                            >
                                {z[0].toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main Interactive Timeline Workspace ───────────────────────── */}
            <div 
                ref={scrollContainerRef}
                className={`flex-1 relative overflow-auto custom-scrollbar rounded-2xl border p-6 shadow-inner ${canvasGlass}`}
            >
                <div 
                    className="relative pb-24"
                    style={{ width: `${ZOOM_CONFIGS[zoomLevel].width}px` }}
                >
                    {/* 1. ERA BANDS ALONG TOP AXIS */}
                    <div className="relative h-12 w-full mb-6 border-b border-current/10 flex items-center">
                        {eras.map(era => {
                            const eraStart = era.startYear;
                            const eraEnd = era.endYear !== undefined ? era.endYear : maxYear;
                            
                            // Clip era to timeline view bounds
                            const clampedStart = Math.max(eraStart, minYear);
                            const clampedEnd = Math.min(eraEnd, maxYear);

                            if (clampedEnd < minYear || clampedStart > maxYear) return null;

                            const leftPct = ((clampedStart - minYear) / yearSpan) * 100;
                            const widthPct = Math.max(((clampedEnd - clampedStart) / yearSpan) * 100, 1);
                            const eraColor = era.color || '#38bdf8';

                            return (
                                <div
                                    key={era.id}
                                    onClick={() => handleJumpToYear(era.startYear)}
                                    className="absolute h-10 top-1 rounded-xl border flex flex-col justify-center px-3 cursor-pointer group transition-all hover:brightness-125 shadow-sm"
                                    style={{
                                        left: `${leftPct}%`,
                                        width: `${widthPct}%`,
                                        backgroundColor: `${eraColor}12`,
                                        borderColor: `${eraColor}30`,
                                        boxShadow: `inset 0 0 0 1px ${eraColor}10`
                                    }}
                                    title={`${era.name} (${era.startYear} – ${era.endYear ?? 'Present'})\n${era.description || ''}\nClick to jump to Era`}
                                >
                                    <div className="flex items-center justify-between gap-1 overflow-hidden">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <span 
                                                className="w-1.5 h-1.5 rounded-full shrink-0" 
                                                style={{ backgroundColor: eraColor, boxShadow: `0 0 5px ${eraColor}` }} 
                                            />
                                            <span className="font-bold text-xs truncate opacity-80">
                                                {era.abbreviation ? `${era.abbreviation} • ` : ''}{era.name}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-mono opacity-35 shrink-0">
                                            {era.startYear} — {era.endYear ?? '∞'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 2. CHRONOLOGICAL TIME AXIS & TICK MARKS */}
                    <div className="relative h-8 w-full border-b border-current/15 mb-8 flex items-center">
                        {Array.from({ length: 21 }).map((_, i) => {
                            const tickYear = Math.round(minYear + (yearSpan * (i / 20)));
                            const leftPct = (i / 20) * 100;
                            const eraMatch = findEraForYear(tickYear, eras);
                            const eraLabel = eraMatch ? (eraMatch.abbreviation || eraMatch.name) : (tickYear < 0 ? 'BCE' : 'CE');

                            return (
                                <div 
                                    key={i} 
                                    className="absolute top-0 flex flex-col items-center -translate-x-1/2 pointer-events-none"
                                    style={{ left: `${leftPct}%` }}
                                >
                                    <div className="w-px h-3 bg-current/30" />
                                    <span className="text-[10px] font-mono opacity-35 mt-1">
                                        {tickYear} <span className="opacity-60 text-[9px]">{eraLabel}</span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 3. VERTICAL BEAMS FOR MILESTONE PINS */}
                    {milestonePins.map(pin => {
                        const leftPct = ((pin.year - minYear) / yearSpan) * 100;
                        if (leftPct < 0 || leftPct > 100) return null;
                        const pinColor = pin.color || '#f59e0b';

                        return (
                            <div
                                key={pin.id}
                                className="absolute top-12 bottom-0 pointer-events-auto z-20 group"
                                style={{ left: `${leftPct}%` }}
                            >
                                {/* Vertical Light Beam */}
                                <div 
                                    className="absolute top-0 bottom-0 w-px -translate-x-1/2 border-l border-dashed transition-all group-hover:border-solid"
                                    style={{ 
                                        borderColor: `${pinColor}70`,
                                        filter: `drop-shadow(0 0 3px ${pinColor}50)`
                                    }}
                                />

                                {/* Top Diamond Pin Badge */}
                                <div
                                    onClick={() => handleSelectMilestone(pin)}
                                    className="absolute -top-6 -translate-x-1/2 cursor-pointer transition-transform hover:scale-125 z-30 flex flex-col items-center"
                                >
                                    <div 
                                        className="w-5 h-5 rotate-45 rounded-sm border-2 shadow-xl flex items-center justify-center transition-all group-hover:rotate-90"
                                        style={{ 
                                            backgroundColor: pinColor,
                                            borderColor: 'rgba(255,255,255,0.5)',
                                            boxShadow: `0 0 10px ${pinColor}55`
                                        }}
                                    >
                                        <Bookmark size={10} className="text-black -rotate-45" />
                                    </div>

                                    {/* Tooltip / Label */}
                                    <div 
                                        className="mt-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider whitespace-nowrap shadow-xl border backdrop-blur-md"
                                        style={{ backgroundColor: `${pinColor}20`, borderColor: `${pinColor}30` }}
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
                        {packedItems.map(({ item, lane }) => {
                            const leftPct = ((item.start - minYear) / yearSpan) * 100;
                            const widthPct = Math.max(((item.end - item.start) / yearSpan) * 100, 0.8);
                            const topPx = lane * laneHeightPx + 20;
                            const isEvent = item.type === 'event';
                            const isInspected = inspectedItem?.id === item.id;
                            const itemColor = item.color || (isEvent ? '#f59e0b' : '#38bdf8');

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelectRibbon(item)}
                                    className={`absolute transition-all cursor-pointer group hover:z-40 ${
                                        isInspected ? 'z-30 ring-2 ring-white/40 scale-[1.02]' : 'z-10'
                                    }`}
                                    style={{
                                        left: `${leftPct}%`,
                                        width: `${widthPct}%`,
                                        top: `${topPx}px`,
                                        height: '32px'
                                    }}
                                >
                                    {isEvent ? (
                                        /* Historical Event Ribbon */
                                        <div 
                                            className="h-full rounded-xl border flex items-center px-3 gap-2 transition-all group-hover:brightness-125 overflow-hidden backdrop-blur-sm"
                                            style={{
                                                backgroundColor: `${itemColor}16`,
                                                borderColor: `${itemColor}45`,
                                                boxShadow: isInspected ? `0 0 10px ${itemColor}35` : undefined
                                            }}
                                        >
                                            <div 
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: itemColor, boxShadow: `0 0 5px ${itemColor}70` }}
                                            />
                                            <span className="font-bold text-xs truncate">
                                                {item.name}
                                            </span>
                                            {item.eventType && (
                                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md opacity-55 bg-current/10 shrink-0">
                                                    {item.eventType}
                                                </span>
                                            )}
                                            <span className="text-[10px] font-mono opacity-35 ml-auto shrink-0">
                                                {item.start}
                                            </span>
                                        </div>
                                    ) : (
                                        /* Character Lifespan Ribbon */
                                        <div 
                                            className={`h-full rounded-full border flex items-center px-3 gap-2 transition-all group-hover:brightness-125 overflow-hidden backdrop-blur-sm ${
                                                item.isDead ? 'opacity-55' : 'opacity-90'
                                            }`}
                                            style={{
                                                backgroundColor: `${itemColor}12`,
                                                borderColor: `${itemColor}38`,
                                                boxShadow: isInspected ? `0 0 8px ${itemColor}30` : undefined
                                            }}
                                        >
                                            <div 
                                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                                style={{ backgroundColor: itemColor }}
                                            />
                                            <span className="font-semibold text-xs truncate">
                                                {item.name}
                                            </span>
                                            <span className="text-[10px] font-mono opacity-35 ml-auto shrink-0">
                                                {item.start} — {item.isDead ? item.end : 'Living'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Empty state if no ribbons match */}
                        {packedItems.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 text-center">
                                <History size={40} className="mb-2" />
                                <p className="text-sm font-semibold uppercase tracking-wider">No Chronos Ribbons Match Filter</p>
                                <p className="text-xs mt-1">Adjust filters or create new Events &amp; Characters with date fields.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Docked Inspector Card ─────────────────────────────────────── */}
            {inspectedItem && (
                <div className="shrink-0 max-w-xl mx-auto w-full">
                    <TimelineInspectorCard
                        item={inspectedItem}
                        eras={eras}
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
            <footer className="flex flex-wrap justify-between items-center opacity-30 text-[10px] uppercase font-bold tracking-widest px-2 shrink-0 pt-1">
                <div className="flex items-center gap-2">
                    <ArrowLeft size={11} /> Antiquity ({minYear})
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Events
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-1.5 rounded-full bg-sky-400" /> Living Lifespans
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-1.5 rounded-full bg-slate-400" /> Deceased
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rotate-45 border border-amber-500 bg-amber-400" /> Milestone Pin
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    Future Horizons ({maxYear}) <ArrowRight size={11} />
                </div>
            </footer>

            {/* ── Modals ────────────────────────────────────────────────────── */}
            <ManageErasModal
                isOpen={isManageErasOpen}
                onClose={() => setIsManageErasOpen(false)}
                eras={eras}
                onSaveEras={handleSaveEras}
            />

            <AddMilestoneModal
                isOpen={isAddMilestoneOpen}
                onClose={() => {
                    setIsAddMilestoneOpen(false);
                    setEditingMilestone(null);
                }}
                onSaveMilestone={handleSaveMilestone}
                onDeleteMilestone={handleDeleteMilestone}
                initialMilestone={editingMilestone}
                existingEntities={world.entities}
            />
        </div>
    );
};
