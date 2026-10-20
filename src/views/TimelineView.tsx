import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { 
    Calendar, History, ArrowLeft, ArrowRight, Bookmark,
    Sparkles, Filter, Search, X, User, Plus, RotateCcw,
    Layers, Compass, Clock, Award, CalendarDays,
    ZoomIn, ZoomOut, Edit3, Flag, ChevronLeft, ChevronRight, Navigation
} from 'lucide-react';
import { WorldData, WorldEntity, Character, Event, FantasyEra, MilestonePin, FantasyCalendar } from '../types';
import { useWorldStore } from '../store/useWorldStore';
import { useTheme } from '../theme';
import { 
    extractYear, findEraForYear, formatYearWithEra, 
    packTimelineLanes, DEFAULT_ERA_PRESETS,
    formatHoveredYearWithCalendar,
    calculateDynamicTickStep,
    generateTimelineTicks
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
    const [canvasWidth, setCanvasWidth] = useState<number>(3400);
    
    // Interactive mouse hover cursor along timeline
    const [hoveredYear, setHoveredYear] = useState<number | null>(null);
    const [hoveredPosPct, setHoveredPosPct] = useState<number | null>(null);

    // Ribbon hover preview tooltip
    const [hoveredRibbonItem, setHoveredRibbonItem] = useState<{
        item: ProcessedTimelineItem;
        clientX: number;
        clientY: number;
    } | null>(null);

    // Current in-world year playhead
    const currentYear = world.timelineCurrentYear ?? 0;
    const [isEditingCurrentYear, setIsEditingCurrentYear] = useState(false);
    const [currentYearInput, setCurrentYearInput] = useState('');

    // Quick-add on the rail
    const [quickAddMenu, setQuickAddMenu] = useState<{
        year: number;
        clientX: number;
        clientY: number;
    } | null>(null);
    const [quickAddYear, setQuickAddYear] = useState<number | undefined>(undefined);

    // Animated era transitions on jump
    const [activeJumpEraId, setActiveJumpEraId] = useState<string | null>(null);
    const [jumpNotification, setJumpNotification] = useState<{
        eraName: string;
        year: number;
    } | null>(null);

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

    // Viewport scroll tracking (for edge overflow indicators)
    const [viewport, setViewport] = useState<{ scrollLeft: number; clientWidth: number }>({
        scrollLeft: 0,
        clientWidth: 0
    });
    const canvasWidthRef = useRef(canvasWidth);
    canvasWidthRef.current = canvasWidth;

    // Canvas click-and-drag horizontal panning
    const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
    const dragStartXRef = useRef<number>(0);
    const dragStartYRef = useRef<number>(0);
    const dragStartScrollLeftRef = useRef<number>(0);
    const dragStartScrollTopRef = useRef<number>(0);
    const hasDraggedRef = useRef<boolean>(false);

    // Frame-accumulated wheel delta for ultra-smooth 60fps zooming without stutter or dropped frames
    const wheelAccumulatorRef = useRef<{
        deltaY: number;
        clientX?: number;
        isDezoom: boolean;
        rafId: number | null;
    }>({
        deltaY: 0,
        clientX: undefined,
        isDezoom: false,
        rafId: null
    });
    const pendingScrollLeftRef = useRef<number | null>(null);
    // Tracks whether a wheel-zoom gesture is actively in-flight (suppresses extraneous state updates)
    const isZoomingRef = useRef(false);
    const zoomSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Locks the invariant focal anchor (ratio across canvas width) during continuous zoom gestures
    const zoomFocalAnchorRef = useRef<{
        ratio: number;
        anchorViewportX: number;
    } | null>(null);

    // Effective eras (fallback to B.C. / A.C. preset if not defined)
    const eras: FantasyEra[] = useMemo(() => {
        if (world.timelineEras && world.timelineEras.length > 0) {
            return world.timelineEras;
        }
        return DEFAULT_ERA_PRESETS.bc_ac.eras;
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

    // Save Custom Calendar Presets Handler
    const handleSaveCustomCalendarPresets = (presets: FantasyCalendar[]) => {
        setWorld(prev => ({
            ...prev,
            customCalendarPresets: presets
        }));
        try {
            localStorage.setItem('nexus_custom_calendar_presets', JSON.stringify(presets));
        } catch (e) {
            console.error('Failed to save presets to localStorage', e);
        }
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
        if (hasDraggedRef.current) return;
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
        if (hasDraggedRef.current) return;
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

    // Dynamic tick step & ticks calculation (adapts down to 5-year gap timeline)
    const minCanvasWidth = 1800;
    const maxCanvasWidth = Math.min(60000, Math.max(24000, Math.ceil(yearSpan * 18)));

    const dynamicStep = useMemo(() => {
        return calculateDynamicTickStep(yearSpan, canvasWidth, 65);
    }, [yearSpan, canvasWidth]);

    const timelineTicks = useMemo(() => {
        return generateTimelineTicks(minYear, maxYear, yearSpan, dynamicStep);
    }, [minYear, maxYear, yearSpan, dynamicStep]);

    // Set Current Year playhead
    const handleSetCurrentYear = (newYear: number) => {
        setWorld(prev => ({
            ...prev,
            timelineCurrentYear: newYear
        }));
        setIsEditingCurrentYear(false);
    };

    // Quick-create an event at a given year
    const handleQuickCreateEvent = (year: number) => {
        const id = handleCreate('event', `Event of Year ${year}`, true);
        if (id) {
            setWorld(prev => ({
                ...prev,
                entities: prev.entities.map(e => {
                    if (e.id === id) {
                        return {
                            ...e,
                            date: String(year),
                            startDate: String(year)
                        } as Event;
                    }
                    return e;
                })
            }));
        }
        setQuickAddMenu(null);
    };

    // Jump scroll to specific year with optional animated era traversal
    const handleJumpToYear = (targetYear: number, eraId?: string) => {
        if (hasDraggedRef.current) return;
        if (!scrollContainerRef.current) return;
        const totalWidth = canvasWidth;
        const CANVAS_PADDING_LEFT = 24;
        const ratio = (targetYear - minYear) / yearSpan;
        const scrollTarget = Math.max(0, (ratio * totalWidth + CANVAS_PADDING_LEFT) - scrollContainerRef.current.clientWidth / 2);
        scrollContainerRef.current.scrollTo({
            left: scrollTarget,
            behavior: 'smooth'
        });
        setViewport({
            scrollLeft: scrollTarget,
            clientWidth: scrollContainerRef.current.clientWidth
        });

        if (eraId) {
            setActiveJumpEraId(eraId);
            const matchedEra = eras.find(e => e.id === eraId);
            if (matchedEra) {
                setJumpNotification({ eraName: matchedEra.name, year: targetYear });
            }
            setTimeout(() => {
                setActiveJumpEraId(null);
                setJumpNotification(null);
            }, 2200);
        }
    };

    // Track scroll position to compute edge overflow indicators
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        let rafId: number | null = null;
        const updateBounds = () => {
            // Do not allow asynchronous native scroll events to overwrite synchronous zoom viewport state
            if (isZoomingRef.current) return;
            setViewport({
                scrollLeft: container.scrollLeft,
                clientWidth: container.clientWidth
            });
        };

        const onScroll = () => {
            if (isZoomingRef.current) return;
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                updateBounds();
            });
        };

        const onResize = () => updateBounds();

        container.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);

        // Initial capture
        updateBounds();

        return () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            container.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onResize);
        };
    }, [mainViewMode]);

    // Synchronize scroll position immediately after canvas width updates in the DOM (safety fallback)
    useLayoutEffect(() => {
        if (pendingScrollLeftRef.current !== null && scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = pendingScrollLeftRef.current;
            pendingScrollLeftRef.current = null;
        }
    }, [canvasWidth]);

    // Zoom canvas width with mathematically exact anchored focal point:
    // When dezooming, ALWAYS anchors strictly to the center of the screen (clientWidth / 2).
    // When zooming in, anchors to cursor clientX.
    // Both canvasWidth and viewport state are updated synchronously in the same batch,
    // guaranteeing that edge indicators and canvas ribbons are 100% aligned with zero stale drift.
    const zoomTimeline = (
        getNextWidth: number | ((prev: number) => number),
        anchorMode: 'center' | 'cursor' = 'center',
        clientX?: number
    ) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const currentW = canvasWidthRef.current;
        const targetWidth = typeof getNextWidth === 'function' ? getNextWidth(currentW) : getNextWidth;
        const nextWidth = Math.min(maxCanvasWidth, Math.max(minCanvasWidth, Math.round(targetWidth)));
        if (nextWidth === currentW) return;

        const containerWidth = container.clientWidth || 1200;
        const CANVAS_PADDING_LEFT = 24;

        // If a focal anchor is already locked for the active gesture, reuse it.
        // Otherwise, establish the invariant anchor based on cursor clientX or container center.
        let anchor = zoomFocalAnchorRef.current;
        if (!anchor) {
            let anchorViewportX = containerWidth / 2;
            if (anchorMode === 'cursor' && clientX !== undefined) {
                const rect = container.getBoundingClientRect();
                anchorViewportX = Math.max(0, Math.min(containerWidth, clientX - rect.left));
            }
            const currentScroll = pendingScrollLeftRef.current !== null ? pendingScrollLeftRef.current : container.scrollLeft;
            const contentXInCanvas = currentScroll + anchorViewportX - CANVAS_PADDING_LEFT;
            const ratio = Math.max(0, Math.min(1, contentXInCanvas / currentW));
            anchor = { ratio, anchorViewportX };

            // Lock focal anchor for the duration of continuous multi-frame wheel gestures
            if (isZoomingRef.current) {
                zoomFocalAnchorRef.current = anchor;
            }
        }

        // Canonical invariant: anchor ratio of canvas width remains pinned at anchorViewportX
        const targetScrollLeft = Math.max(0, Math.round(anchor.ratio * nextWidth + CANVAS_PADDING_LEFT - anchor.anchorViewportX));

        pendingScrollLeftRef.current = targetScrollLeft;
        canvasWidthRef.current = nextWidth;

        // 1. Immediately update canvas DOM width FIRST to prevent the browser from clamping targetScrollLeft
        if (canvasInnerRef.current) {
            canvasInnerRef.current.style.width = `${nextWidth}px`;
        }

        // 2. Immediately apply scroll to DOM container
        container.scrollLeft = targetScrollLeft;

        // 3. Synchronously batch React state updates (canvasWidth + viewport) together in the same render
        setCanvasWidth(nextWidth);
        setViewport({
            scrollLeft: targetScrollLeft,
            clientWidth: containerWidth
        });
    };

    // Scroll to zoom (no modifier needed), Shift + wheel to pan horizontally
    // Uses requestAnimationFrame delta accumulation for silky, stutter-free 60fps zooming
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            const target = e.target as HTMLElement | null;
            // Don't intercept scroll inside inspector card or inputs/modals
            if (target?.closest('.timeline-inspector-card') || target?.closest('.modal-content') || target?.closest('input') || target?.closest('textarea')) {
                return;
            }

            // Horizontal panning via Shift + wheel
            if (e.shiftKey) {
                e.preventDefault();
                container.scrollLeft += (e.deltaY || e.deltaX);
                setViewport({
                    scrollLeft: container.scrollLeft,
                    clientWidth: container.clientWidth
                });
                return;
            }

            // Trackpad horizontal swipe
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 3) {
                return;
            }

            // Vertical wheel scroll: smooth, predictable proportional scaling via requestAnimationFrame
            if (e.deltaY !== 0) {
                e.preventDefault();
                const acc = wheelAccumulatorRef.current;
                acc.deltaY += e.deltaY;
                acc.isDezoom = acc.deltaY > 0;
                acc.clientX = e.clientX;

                // Dismiss any lingering hover ribbon tooltip during zoom
                setHoveredRibbonItem(null);

                // Mark zoom gesture as active and schedule settle detection
                isZoomingRef.current = true;
                if (zoomSettleTimerRef.current !== null) {
                    clearTimeout(zoomSettleTimerRef.current);
                }
                zoomSettleTimerRef.current = setTimeout(() => {
                    isZoomingRef.current = false;
                    zoomSettleTimerRef.current = null;
                    zoomFocalAnchorRef.current = null; // Release locked anchor when wheel gesture settles
                    if (scrollContainerRef.current) {
                        setViewport({
                            scrollLeft: scrollContainerRef.current.scrollLeft,
                            clientWidth: scrollContainerRef.current.clientWidth
                        });
                    }
                }, 150);

                if (acc.rafId === null) {
                    acc.rafId = requestAnimationFrame(() => {
                        acc.rafId = null;
                        const delta = acc.deltaY;
                        acc.deltaY = 0;
                        if (delta === 0) return;

                        // Clamped delta per display frame provides smooth, predictable, silky zooming
                        const clampedDelta = Math.max(-120, Math.min(120, delta));
                        const factor = Math.exp(-clampedDelta * 0.0015);
                        const isDezoom = delta > 0;

                        zoomTimeline(
                            prev => prev * factor,
                            isDezoom ? 'center' : 'cursor',
                            isDezoom ? undefined : acc.clientX
                        );
                    });
                }
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheel);
            if (wheelAccumulatorRef.current.rafId !== null) {
                cancelAnimationFrame(wheelAccumulatorRef.current.rafId);
                wheelAccumulatorRef.current.rafId = null;
            }
        };
    }, [mainViewMode]);

    // Handle click-and-drag horizontal canvas panning
    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return; // Only primary/left mouse button
        const target = e.target as HTMLElement;
        // Don't initiate drag if clicking on buttons, inputs, modals, or inspector card
        if (target.closest('.timeline-inspector-card, .modal-content, input, textarea, button, [role="button"]')) {
            return;
        }
        const container = scrollContainerRef.current;
        if (!container) return;

        dragStartXRef.current = e.clientX;
        dragStartYRef.current = e.clientY;
        dragStartScrollLeftRef.current = container.scrollLeft;
        dragStartScrollTopRef.current = container.scrollTop;
        hasDraggedRef.current = false;
        if (wheelAccumulatorRef.current.rafId !== null) {
            cancelAnimationFrame(wheelAccumulatorRef.current.rafId);
            wheelAccumulatorRef.current.rafId = null;
            wheelAccumulatorRef.current.deltaY = 0;
        }
        setIsDraggingCanvas(true);
    };

    useEffect(() => {
        if (!isDraggingCanvas) return;

        const handleWindowMouseMove = (e: MouseEvent) => {
            const container = scrollContainerRef.current;
            if (!container) return;
            const dx = e.clientX - dragStartXRef.current;
            const dy = e.clientY - dragStartYRef.current;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                hasDraggedRef.current = true;
            }
            if (hasDraggedRef.current) {
                e.preventDefault();
                container.scrollLeft = dragStartScrollLeftRef.current - dx;
                container.scrollTop = dragStartScrollTopRef.current - dy;
                setViewport({
                    scrollLeft: container.scrollLeft,
                    clientWidth: container.clientWidth
                });
            }
        };

        const handleWindowMouseUp = () => {
            setIsDraggingCanvas(false);
            if (hasDraggedRef.current) {
                // Intercept and swallow subsequent click event triggered by mouseup
                const handleClickCapture = (captureEvent: MouseEvent) => {
                    captureEvent.stopPropagation();
                    captureEvent.preventDefault();
                    window.removeEventListener('click', handleClickCapture, true);
                };
                window.addEventListener('click', handleClickCapture, true);
                setTimeout(() => {
                    window.removeEventListener('click', handleClickCapture, true);
                    hasDraggedRef.current = false;
                }, 60);
            }
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [isDraggingCanvas]);

    // Initial camera centering on Year 0 (or Current Year) on mount / realm load
    const initialCenteringDoneRef = useRef(false);
    useEffect(() => {
        if (initialCenteringDoneRef.current) return;
        const container = scrollContainerRef.current;
        if (!container) return;

        const totalWidth = canvasWidth;
        const targetYear = Math.max(minYear, Math.min(maxYear, currentYear));
        const ratio = (targetYear - minYear) / yearSpan;
        const CANVAS_PADDING_LEFT = 24;
        const scrollTarget = Math.max(0, (ratio * totalWidth + CANVAS_PADDING_LEFT) - container.clientWidth / 2);

        requestAnimationFrame(() => {
            if (scrollContainerRef.current) {
                const target = Math.max(0, scrollTarget);
                scrollContainerRef.current.scrollTo({
                    left: target,
                    behavior: 'auto'
                });
                setViewport({
                    scrollLeft: target,
                    clientWidth: scrollContainerRef.current.clientWidth
                });
                initialCenteringDoneRef.current = true;
            }
        });
    }, [canvasWidth, minYear, maxYear, yearSpan, currentYear]);

    // Scroll to the nearest visible timeline item to current viewport center
    const handleGoToNearestEvent = () => {
        const container = scrollContainerRef.current;
        if (!container || filteredItems.length === 0) return;
        const CANVAS_PADDING_LEFT = 24;
        const viewCenterRatio = Math.max(0, Math.min(1, (container.scrollLeft - CANVAS_PADDING_LEFT + container.clientWidth / 2) / canvasWidth));
        const viewCenterYear = minYear + viewCenterRatio * yearSpan;
        let closest = filteredItems[0];
        let closestDist = Math.abs(((closest.start + closest.end) / 2) - viewCenterYear);
        for (const item of filteredItems) {
            const mid = (item.start + item.end) / 2;
            const dist = Math.abs(mid - viewCenterYear);
            if (dist < closestDist) { closestDist = dist; closest = item; }
        }
        const mid = (closest.start + closest.end) / 2;
        const ratio = (mid - minYear) / yearSpan;
        const scrollTarget = Math.max(0, (ratio * canvasWidth + CANVAS_PADDING_LEFT) - container.clientWidth / 2);
        container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
        setViewport({
            scrollLeft: scrollTarget,
            clientWidth: container.clientWidth
        });
        setInspectedItem({
            type: closest.type,
            id: closest.id,
            name: closest.name,
            startYear: closest.start,
            endYear: closest.end,
            rawDate: (closest.entity as any)?.birthDate || (closest.entity as any)?.startDate || (closest.entity as any)?.date,
            isDead: closest.isDead,
            description: closest.description,
            color: closest.color,
            eventType: closest.eventType
        });
    };

    // Compute the nearest off-screen items on each edge (left = before viewport, right = after viewport)
    // Synchronously checks exact rendered ribbon bounds (including minWidth: 220px and p-6 24px padding).
    // An item is NEVER flagged as off-screen if its badge or ribbon is even partially visible.
    const edgeItems = useMemo(() => {
        const viewLeft = viewport.scrollLeft;
        const viewRight = viewport.scrollLeft + viewport.clientWidth;

        // If viewport has not been measured yet, don't show edge indicators
        if (viewport.clientWidth <= 0) {
            return { left: null, leftCount: 0, right: null, rightCount: 0 };
        }

        const leftOffscreen: ProcessedTimelineItem[] = [];
        const rightOffscreen: ProcessedTimelineItem[] = [];
        const CANVAS_PADDING_LEFT = 24;

        for (const item of filteredItems) {
            const rawLeft = ((item.start - minYear) / yearSpan) * canvasWidth;
            const rawWidth = ((item.end - item.start) / yearSpan) * canvasWidth;
            const itemWidthPx = Math.max(rawWidth, 220); // 220px minWidth for badge

            const itemLeftInContainer = CANVAS_PADDING_LEFT + rawLeft;
            const itemRightInContainer = itemLeftInContainer + itemWidthPx;

            // An item is visible if its rendered bounds intersect the visible viewport.
            // Generous 16px buffer ensures items on screen are never mistakenly treated as off-screen.
            const isVisible = itemRightInContainer >= (viewLeft - 16) && itemLeftInContainer <= (viewRight + 16);
            if (isVisible) {
                continue;
            }

            if (itemRightInContainer < (viewLeft - 16)) {
                leftOffscreen.push(item);
            } else if (itemLeftInContainer > (viewRight + 16)) {
                rightOffscreen.push(item);
            }
        }

        // Nearest to the left view edge (closest to viewLeft, i.e. largest itemRightInContainer)
        const leftNearest = leftOffscreen.length > 0
            ? leftOffscreen.reduce((prev, curr) => {
                const prevEnd = CANVAS_PADDING_LEFT + ((prev.start - minYear) / yearSpan) * canvasWidth + Math.max(((prev.end - prev.start) / yearSpan) * canvasWidth, 220);
                const currEnd = CANVAS_PADDING_LEFT + ((curr.start - minYear) / yearSpan) * canvasWidth + Math.max(((curr.end - curr.start) / yearSpan) * canvasWidth, 220);
                return currEnd > prevEnd ? curr : prev;
            }) : null;

        // Nearest to the right view edge (closest to viewRight, i.e. smallest itemLeftInContainer)
        const rightNearest = rightOffscreen.length > 0
            ? rightOffscreen.reduce((prev, curr) => {
                const prevStart = CANVAS_PADDING_LEFT + ((prev.start - minYear) / yearSpan) * canvasWidth;
                const currStart = CANVAS_PADDING_LEFT + ((curr.start - minYear) / yearSpan) * canvasWidth;
                return currStart < prevStart ? curr : prev;
            }) : null;

        return {
            left: leftNearest,
            leftCount: leftOffscreen.length,
            right: rightNearest,
            rightCount: rightOffscreen.length
        };
    }, [filteredItems, viewport, canvasWidth, minYear, yearSpan]);

    // Scroll to an edge item
    const scrollToEdgeItem = (item: ProcessedTimelineItem) => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const CANVAS_PADDING_LEFT = 24;
        const mid = (item.start + item.end) / 2;
        const ratio = (mid - minYear) / yearSpan;
        const scrollTarget = Math.max(0, (ratio * canvasWidth + CANVAS_PADDING_LEFT) - container.clientWidth / 2);
        container.scrollTo({ left: scrollTarget, behavior: 'smooth' });
        setViewport({
            scrollLeft: scrollTarget,
            clientWidth: container.clientWidth
        });
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

    // Interactive mouse hover tracking on timeline canvas
    // Suppressed during active zoom gestures to eliminate extraneous re-renders
    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isDraggingCanvas || isZoomingRef.current) {
            return;
        }
        if (!canvasInnerRef.current) return;
        const rect = canvasInnerRef.current.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const totalW = canvasWidth;
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

    // Click on ruler rail to open quick-add action menu
    const handleRailClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (hasDraggedRef.current) return;
        if ((e.target as HTMLElement).closest('button, .milestone-pin-marker, .playhead-cap-marker')) return;
        if (hoveredYear === null) return;
        setQuickAddMenu({
            year: hoveredYear,
            clientX: e.clientX,
            clientY: e.clientY
        });
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
                                        <button 
                                            key={era.id} 
                                            onClick={() => handleJumpToYear(era.startYear, era.id)}
                                            className="w-2.5 h-2.5 rounded-full inline-block shadow-sm hover:scale-125 transition-transform"
                                            style={{ backgroundColor: era.color || '#38bdf8' }}
                                            title={`${era.name} (Starts Yr ${era.startYear}) — Click to jump`}
                                        />
                                    ))}
                                    <span className="font-bold ml-1">{eras.length} Eras</span>
                                </span>
                                <span className="opacity-30">•</span>
                                <button
                                    onClick={() => handleJumpToYear(currentYear)}
                                    className={`flex items-center gap-1 font-bold transition-all hover:scale-105 ${
                                        isLightCanvas ? 'text-emerald-800' : 'text-emerald-400'
                                    }`}
                                    title={`Current In-World Year: ${currentYear} (Click to jump camera)`}
                                >
                                    <Clock size={11} className="animate-spin-slow" />
                                    <span>Yr {currentYear}</span>
                                </button>
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

                {/* Right controls: Go to Nearest + Search + Zoom Level */}
                <div className="flex items-center gap-3">
                    {/* Go to Nearest Event */}
                    {filteredItems.length > 0 && (
                        <button
                            onClick={handleGoToNearestEvent}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap shadow-sm ${
                                isRoyal ? 'border-[#c8a96e]/50 text-[#70121e] hover:bg-[#70121e]/10 bg-[#f4efe4]'
                                : isWiki ? 'border-[#d4c8af] text-[#881337] hover:bg-[#881337]/10 bg-white'
                                : isVoyager ? 'border-[#2dd4bf]/30 text-[#2dd4bf] hover:bg-[#2dd4bf]/10 bg-[#0d344d]/30'
                                : 'border-[#fef08a]/20 text-[#fef08a]/70 hover:text-[#fef08a] hover:bg-[#fef08a]/5 bg-transparent'
                            }`}
                            title="Scroll to the nearest event or lifespan closest to your current view center"
                        >
                            <Navigation size={11} />
                            <span>Nearest</span>
                        </button>
                    )}

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

                    {/* Zoom Scale Selector & Dynamic Precision Bar */}
                    <div className={`flex items-center gap-1.5 border rounded-xl p-1 ${
                        isLightCanvas ? 'bg-[#f4efe4] border-[#d4c8af]' : 'bg-black/30 border-current/15'
                    }`}>
                        {/* Zoom out button */}
                        <button
                            onClick={() => {
                                zoomTimeline(prev => prev * 0.82, 'center');
                            }}
                            className={`p-1 rounded-lg transition-all ${
                                isLightCanvas ? 'hover:bg-black/5 text-[#2b1810]' : 'hover:bg-white/10 opacity-70 hover:opacity-100'
                            }`}
                            title="Zoom Out (Scroll Down)"
                        >
                            <ZoomOut size={12} />
                        </button>

                        {/* Slider */}
                        <input
                            type="range"
                            min={minCanvasWidth}
                            max={maxCanvasWidth}
                            step={150}
                            value={canvasWidth}
                            onChange={(e) => {
                                const nextW = Number(e.target.value);
                                zoomTimeline(nextW, 'center');
                            }}
                            className="w-16 sm:w-24 h-1.5 accent-amber-500 rounded-lg cursor-pointer"
                            title={`Canvas Width: ${canvasWidth}px (${dynamicStep}y step)`}
                        />

                        {/* Zoom in button */}
                        <button
                            onClick={() => {
                                zoomTimeline(prev => prev * 1.22, 'center');
                            }}
                            className={`p-1 rounded-lg transition-all ${
                                isLightCanvas ? 'hover:bg-black/5 text-[#2b1810]' : 'hover:bg-white/10 opacity-70 hover:opacity-100'
                            }`}
                            title="Zoom In (Scroll Up)"
                        >
                            <ZoomIn size={12} />
                        </button>

                        {/* Quick Presets */}
                        <div className="flex items-center gap-0.5 ml-1 border-l border-current/15 pl-1">
                            {[
                                { label: '2K', width: 2000, level: 'compact' },
                                { label: '3.4K', width: 3400, level: 'standard' },
                                { label: '5.2K', width: 5200, level: 'epic' },
                                { label: '8K', width: 8000, level: 'panoramic' }
                            ].map(preset => (
                                <button
                                    key={preset.label}
                                    onClick={() => {
                                        zoomTimeline(preset.width, 'center');
                                        setZoomLevel(preset.level as ZoomLevel);
                                    }}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                        Math.abs(canvasWidth - preset.width) < 300
                                            ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] shadow-sm'
                                              : isWiki ? 'bg-red-700 text-white shadow-sm'
                                              : 'bg-current/25 opacity-100 shadow-sm border border-current/20' 
                                            : isLightCanvas ? 'text-[#2b1810]/70 hover:text-[#2b1810] hover:bg-white/70' : 'opacity-40 hover:opacity-85'
                                    }`}
                                    title={`Set scale to ${preset.width}px`}
                                >
                                    {preset.label}
                                </button>
                            ))}

                            {/* Dedicated 5-Year Precision Focus Preset */}
                            <button
                                onClick={() => {
                                    const target5y = Math.min(maxCanvasWidth, Math.max(2000, Math.ceil(yearSpan * 15)));
                                    zoomTimeline(target5y, 'center');
                                }}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                                    dynamicStep <= 5
                                        ? 'bg-amber-500/25 text-amber-500 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)] font-black'
                                        : isLightCanvas ? 'text-[#2b1810]/70 hover:text-[#2b1810] hover:bg-white/70' : 'opacity-40 hover:opacity-85'
                                }`}
                                title="Zoom to 5-Year Gap Precision (2000 > 2005 > 2010...)"
                            >
                                <Sparkles size={10} className={dynamicStep <= 5 ? "animate-pulse" : ""} />
                                <span>5Y Gap</span>
                            </button>
                        </div>

                        {/* Step Readout Badge */}
                        <div className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold ml-1 ${
                            dynamicStep <= 5
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                                : isLightCanvas ? 'bg-black/5 text-[#2b1810]/70' : 'bg-white/5 opacity-60'
                        }`}>
                            {dynamicStep <= 5 ? '5y Gap' : `${dynamicStep}y`}
                        </div>
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
            {mainViewMode === 'chronos' && (
                <div 
                    className={`flex-1 relative rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${canvasGlass}`}
                    style={{
                        backgroundImage: isSovereign 
                            ? 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(254,240,138,0.06), transparent 70%)'
                            : isVoyager
                            ? 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(45,212,191,0.06), transparent 70%)'
                            : undefined
                    }}
                >
                    <div 
                        ref={scrollContainerRef}
                        onMouseDown={handleCanvasMouseDown}
                        className={`flex-1 relative overflow-auto custom-scrollbar p-6 ${isDraggingCanvas ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                    >
                <div 
                    ref={canvasInnerRef}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseLeave={handleCanvasMouseLeave}
                    className={`relative pb-28 ${isDraggingCanvas ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                    style={{ width: `${canvasWidth}px` }}
                >
                    {/* Floating Traversal Notification */}
                    {jumpNotification && (
                        <div className="sticky top-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex justify-center mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className={`px-4 py-1.5 rounded-full border shadow-2xl backdrop-blur-2xl flex items-center gap-2 font-serif font-black text-xs tracking-wider ${
                                isLightCanvas
                                    ? 'bg-amber-100/95 border-amber-400 text-[#3d0a10]'
                                    : isVoyager
                                    ? 'bg-[#180c04]/95 border-[#2dd4bf]/70 text-[#2dd4bf]'
                                    : 'bg-slate-900/95 border-[#fef08a]/70 text-[#fef08a]'
                            }`}>
                                <Sparkles size={14} className="animate-spin-slow" />
                                <span>Traversed to {jumpNotification.eraName} (Yr {jumpNotification.year})</span>
                            </div>
                        </div>
                    )}

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

                    {/* 1. ERA BANDS ALONG TOP AXIS WITH ANIMATED JUMP TRANSITION */}
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
                            const isJumping = activeJumpEraId === era.id;

                            return (
                                <div
                                    key={era.id}
                                    onClick={() => handleJumpToYear(era.startYear, era.id)}
                                    className={`absolute h-12 top-1 rounded-2xl border flex flex-col justify-center px-3.5 cursor-pointer group transition-[box-shadow,border-color,transform] duration-300 shadow-md backdrop-blur-md ${
                                        isJumping 
                                            ? 'scale-[1.04] ring-4 ring-white/90 z-30 animate-pulse' 
                                            : 'hover:scale-[1.01]'
                                    } ${isLightCanvas ? 'border-2' : ''}`}
                                    style={{
                                        left: `${leftPct}%`,
                                        width: `${widthPct}%`,
                                        background: isLightCanvas
                                            ? `linear-gradient(135deg, ${eraColor}35 0%, ${eraColor}18 100%)`
                                            : `linear-gradient(135deg, ${eraColor}22 0%, ${eraColor}09 100%)`,
                                        borderColor: isJumping ? '#ffffff' : isLightCanvas ? `${eraColor}` : `${eraColor}40`,
                                        boxShadow: isJumping 
                                            ? `0 0 35px 8px ${eraColor}90, inset 0 0 15px rgba(255,255,255,0.6)`
                                            : isLightCanvas ? `0 2px 8px ${eraColor}25` : `0 4px 18px ${eraColor}15, inset 0 1px 0 0 ${eraColor}45`
                                    }}
                                    title={`${era.name} (${era.startYear} – ${era.endYear ?? 'Present'})\n${era.description || ''}\nClick to jump`}
                                >
                                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                                        <div className="flex items-center gap-2 truncate">
                                            {/* Glowing Dot Beacon */}
                                            <span 
                                                className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${isJumping ? 'animate-ping' : ''}`}
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

                    {/* 2. PRECISION CHRONOLOGICAL TIME AXIS & DYNAMIC TICK MARKS */}
                    <div 
                        onClick={handleRailClick}
                        className="chronos-ruler-track relative h-10 w-full mb-10 flex items-center z-10 cursor-pointer"
                        title="Chronos Time Axis — Click anywhere to Quick-Add, or scroll to zoom dynamically"
                    >
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

                        {/* Dynamic Scaled Axis Ticks (Scales down to 5-year gaps: 2000 > 2005 > 2010...) */}
                        {timelineTicks.map(tick => {
                            const eraMatch = findEraForYear(tick.year, eras);
                            const eraLabel = eraMatch ? (eraMatch.abbreviation || eraMatch.name) : (tick.year < 0 ? 'BCE' : 'CE');
                            const isStep5 = dynamicStep <= 5;

                            return (
                                <div 
                                    key={tick.year} 
                                    className="absolute top-1/2 flex flex-col items-center -translate-x-1/2 pointer-events-none"
                                    style={{ left: `${tick.pct}%` }}
                                >
                                    {/* Tick pip */}
                                    <div 
                                        className={`-translate-y-1/2 ${
                                            tick.isMajor 
                                                ? 'w-2.5 h-2.5 rotate-45 border shadow-sm' 
                                                : isStep5
                                                ? 'w-0.5 h-2.5 rounded-full'
                                                : 'w-px h-3.5'
                                        }`}
                                        style={{
                                            backgroundColor: tick.isMajor 
                                                ? (isRoyal ? '#70121e' : isWiki ? '#b91c1c' : isSovereign ? '#fef08a' : '#2dd4bf')
                                                : (isLightCanvas ? '#1c140d' : 'currentColor'),
                                            borderColor: tick.isMajor
                                                ? (isRoyal ? '#70121e' : isWiki ? '#b91c1c' : isSovereign ? '#fef08a' : '#2dd4bf')
                                                : undefined,
                                            opacity: tick.isMajor ? 1 : (isLightCanvas ? 0.45 : 0.4)
                                        }}
                                    />

                                    {/* Dynamic Year Readout */}
                                    <div className="flex flex-col items-center mt-3">
                                        <span className={`font-mono tracking-tight leading-none ${
                                            tick.isMajor 
                                                ? (isLightCanvas ? 'text-xs font-black text-[#1c140d]' : 'text-xs font-bold opacity-90') 
                                                : (isLightCanvas ? 'text-[10px] font-bold text-[#1c140d]/75' : 'text-[10px] opacity-60')
                                        }`}>
                                            {tick.year}
                                        </span>
                                        {/* Display Era label on major ticks or when ticks are spaced out */}
                                        {(tick.isMajor || dynamicStep >= 25) && (
                                            <span className={`text-[9px] font-sans font-bold uppercase mt-0.5 ${
                                                isLightCanvas ? (isRoyal ? 'text-[#70121e]' : 'text-[#b91c1c]') : 'opacity-45'
                                            }`}>
                                                {eraLabel}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Explicit Epoch Year 0 Landmark */}
                        {minYear <= 0 && maxYear >= 0 && (
                            <div 
                                className="absolute top-1/2 flex flex-col items-center -translate-x-1/2 pointer-events-none z-20"
                                style={{ left: `${((0 - minYear) / yearSpan) * 100}%` }}
                            >
                                <div 
                                    className="w-3.5 h-3.5 rotate-45 border-2 shadow-lg -translate-y-1/2"
                                    style={{
                                        backgroundColor: isRoyal ? '#70121e' : isWiki ? '#b91c1c' : isSovereign ? '#fef08a' : '#2dd4bf',
                                        borderColor: '#ffffff',
                                        boxShadow: isSovereign ? '0 0 12px rgba(254,240,138,0.8)' : isVoyager ? '0 0 12px rgba(45,212,191,0.8)' : '0 2px 8px rgba(0,0,0,0.3)'
                                    }}
                                />
                                <div className="flex flex-col items-center mt-3">
                                    <span className={`font-mono font-black text-xs px-2 py-0.5 rounded-md shadow-md border ${
                                        isLightCanvas 
                                            ? 'bg-amber-100/90 text-[#1c140d] border-amber-300' 
                                            : 'bg-white/10 text-white border-white/20 backdrop-blur-md'
                                    }`}>
                                        Year 0
                                    </span>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                                        isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#b91c1c]' : isVoyager ? 'text-[#2dd4bf]' : 'text-[#fef08a]'
                                    }`}>
                                        Epoch Origin
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ── CURRENT YEAR PLAYHEAD BEAM & CAP MARKER ── */}
                        {currentYear >= minYear && currentYear <= maxYear && (
                            <div 
                                className="playhead-cap-marker absolute -top-6 -translate-x-1/2 flex flex-col items-center pointer-events-auto z-25 cursor-pointer group"
                                style={{ left: `${((currentYear - minYear) / yearSpan) * 100}%` }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentYearInput(String(currentYear));
                                    setIsEditingCurrentYear(true);
                                }}
                                title={`Current In-World Year: ${currentYear} (Click to edit)`}
                            >
                                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-mono font-bold tracking-tight shadow-sm transition-all group-hover:scale-105 ${
                                    isLightCanvas
                                        ? 'bg-emerald-50/95 border-emerald-400/60 text-emerald-800'
                                        : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 backdrop-blur-sm'
                                }`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                    <span>Yr {currentYear}</span>
                                </div>
                                <div className="w-px h-1.5 bg-emerald-400/50" />
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 -mt-0.5" />
                            </div>
                        )}
                    </div>

                    {/* CURRENT YEAR SUBTLE VERTICAL REFERENCE LINE */}
                    {currentYear >= minYear && currentYear <= maxYear && (
                        <div 
                            className="absolute top-10 bottom-0 pointer-events-none z-10"
                            style={{ left: `${((currentYear - minYear) / yearSpan) * 100}%` }}
                        >
                            <div 
                                className="w-px h-full -translate-x-1/2 opacity-40"
                                style={{
                                    background: isLightCanvas
                                        ? 'linear-gradient(180deg, rgba(16,185,129,0.5) 0%, rgba(16,185,129,0.2) 30%, transparent 80%)'
                                        : 'linear-gradient(180deg, rgba(52,211,153,0.45) 0%, rgba(52,211,153,0.15) 30%, transparent 80%)'
                                }}
                            />
                        </div>
                    )}

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
                                    className="absolute top-0 bottom-0 w-px -translate-x-1/2 transition-[width] group-hover:w-0.5"
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
                                        className="w-5 h-5 rotate-45 rounded-sm border-2 shadow-2xl flex items-center justify-center transition-[transform,box-shadow] group-hover:rotate-90 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
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
                                    onMouseEnter={(e) => {
                                        setHoveredRibbonItem({
                                            item,
                                            clientX: e.clientX,
                                            clientY: e.clientY
                                        });
                                    }}
                                    onMouseMove={(e) => {
                                        setHoveredRibbonItem(prev => prev ? { ...prev, clientX: e.clientX, clientY: e.clientY } : { item, clientX: e.clientX, clientY: e.clientY });
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredRibbonItem(null);
                                    }}
                                    className={`absolute cursor-pointer group hover:z-40 ${
                                        isInspected ? 'z-30' : 'z-10'
                                    }`}
                                    style={{
                                        left: `${leftPct}%`,
                                        width: `${widthPct}%`,
                                        minWidth: '220px',
                                        top: `${topPx}px`,
                                        height: '36px'
                                    }}
                                >
                                    {isEvent ? (
                                        /* Historical Event Ribbon */
                                        <div 
                                            className="h-full rounded-xl border flex items-center px-3 gap-2 transition-[box-shadow,border-color,filter,transform] group-hover:scale-[1.01] group-hover:brightness-125 overflow-hidden backdrop-blur-md shadow-md"
                                            style={{
                                                background: isLightCanvas 
                                                    ? `linear-gradient(90deg, ${itemColor}25 0%, #ffffff 100%)` 
                                                    : `linear-gradient(90deg, ${itemColor}25 0%, ${itemColor}12 100%)`,
                                                borderColor: isInspected
                                                    ? (isLightCanvas ? '#0f172a' : '#f8fafc')
                                                    : (isLightCanvas ? `${itemColor}` : `${itemColor}55`),
                                                borderWidth: isInspected ? '1.5px' : '1px',
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
                                            className={`h-full rounded-full border flex items-center px-3.5 gap-2 transition-[box-shadow,border-color,filter,transform] group-hover:scale-[1.01] group-hover:brightness-125 overflow-hidden backdrop-blur-md shadow-md ${
                                                item.isDead ? 'opacity-75' : 'opacity-100'
                                            }`}
                                            style={{
                                                background: isLightCanvas 
                                                    ? `linear-gradient(90deg, ${itemColor}25 0%, #ffffff 100%)` 
                                                    : `linear-gradient(90deg, ${itemColor}20 0%, ${itemColor}0e 100%)`,
                                                borderColor: isInspected
                                                    ? (isLightCanvas ? '#0f172a' : '#f8fafc')
                                                    : (isLightCanvas ? `${itemColor}` : `${itemColor}45`),
                                                borderWidth: isInspected ? '1.5px' : '1px',
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
            </div>

            {/* ── Edge Overflow Indicator: Left (Prior Events Off-Screen) ──── */}
            {edgeItems.left && (
                <button
                    onClick={() => scrollToEdgeItem(edgeItems.left!)}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full border shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 group cursor-pointer ${
                        isRoyal
                            ? 'bg-[#f4efe4]/95 border-[#c8a96e]/70 text-[#70121e] hover:border-[#70121e] shadow-[#70121e]/10'
                            : isWiki
                            ? 'bg-white/95 border-[#d4c8af] text-[#881337] hover:border-[#881337] shadow-black/5'
                            : isVoyager
                            ? 'bg-[#180c04]/90 border-[#2dd4bf]/40 text-[#2dd4bf] hover:border-[#2dd4bf] shadow-[#2dd4bf]/10'
                            : isSovereign
                            ? 'bg-slate-950/90 border-[#fef08a]/35 text-[#fef08a] hover:border-[#fef08a] shadow-[#fef08a]/10'
                            : 'bg-slate-900/90 border-white/20 text-white/90 hover:border-white/50 shadow-black/20'
                    }`}
                    title={`Jump to nearest prior item: ${edgeItems.left.name} (${edgeItems.left.start})${edgeItems.leftCount > 1 ? ` — ${edgeItems.leftCount} off-screen to the left` : ''}`}
                >
                    <ChevronLeft size={13} className="shrink-0 transition-transform group-hover:-translate-x-0.5" />
                    <span 
                        className="w-1.5 h-1.5 rounded-full shrink-0" 
                        style={{ 
                            backgroundColor: edgeItems.left.color || (edgeItems.left.type === 'event' ? '#f59e0b' : '#38bdf8'),
                            boxShadow: `0 0 6px ${edgeItems.left.color || (edgeItems.left.type === 'event' ? '#f59e0b' : '#38bdf8')}`
                        }} 
                    />
                    <span className="text-[10px] font-bold tracking-tight max-w-[85px] sm:max-w-[110px] truncate">
                        {edgeItems.left.name}
                    </span>
                    {edgeItems.leftCount > 1 && (
                        <span className={`text-[9px] font-mono px-1 rounded font-semibold ${
                            isLightCanvas ? 'bg-black/5 text-[#2b1810]/70' : 'bg-white/10 text-white/70'
                        }`}>
                            +{edgeItems.leftCount - 1}
                        </span>
                    )}
                </button>
            )}

            {/* ── Edge Overflow Indicator: Right (Upcoming Events Off-Screen) ─── */}
            {edgeItems.right && (
                <button
                    onClick={() => scrollToEdgeItem(edgeItems.right!)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full border shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 group cursor-pointer ${
                        isRoyal
                            ? 'bg-[#f4efe4]/95 border-[#c8a96e]/70 text-[#70121e] hover:border-[#70121e] shadow-[#70121e]/10'
                            : isWiki
                            ? 'bg-white/95 border-[#d4c8af] text-[#881337] hover:border-[#881337] shadow-black/5'
                            : isVoyager
                            ? 'bg-[#180c04]/90 border-[#2dd4bf]/40 text-[#2dd4bf] hover:border-[#2dd4bf] shadow-[#2dd4bf]/10'
                            : isSovereign
                            ? 'bg-slate-950/90 border-[#fef08a]/35 text-[#fef08a] hover:border-[#fef08a] shadow-[#fef08a]/10'
                            : 'bg-slate-900/90 border-white/20 text-white/90 hover:border-white/50 shadow-black/20'
                    }`}
                    title={`Jump to nearest upcoming item: ${edgeItems.right.name} (${edgeItems.right.start})${edgeItems.rightCount > 1 ? ` — ${edgeItems.rightCount} off-screen to the right` : ''}`}
                >
                    {edgeItems.rightCount > 1 && (
                        <span className={`text-[9px] font-mono px-1 rounded font-semibold ${
                            isLightCanvas ? 'bg-black/5 text-[#2b1810]/70' : 'bg-white/10 text-white/70'
                        }`}>
                            +{edgeItems.rightCount - 1}
                        </span>
                    )}
                    <span className="text-[10px] font-bold tracking-tight max-w-[85px] sm:max-w-[110px] truncate">
                        {edgeItems.right.name}
                    </span>
                    <span 
                        className="w-1.5 h-1.5 rounded-full shrink-0" 
                        style={{ 
                            backgroundColor: edgeItems.right.color || (edgeItems.right.type === 'event' ? '#f59e0b' : '#38bdf8'),
                            boxShadow: `0 0 6px ${edgeItems.right.color || (edgeItems.right.type === 'event' ? '#f59e0b' : '#38bdf8')}`
                        }} 
                    />
                    <ChevronRight size={13} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
            )}

            {/* ── In-Canvas Floating Inspector in the Large Empty Gap ────────── */}
            {inspectedItem && (
                <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 max-w-xl w-full px-4 z-40 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
                    <div className="pointer-events-auto timeline-inspector-card">
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
                </div>
            )}
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
                initialYear={quickAddYear}
                existingEntities={world.entities}
                onSaveMilestone={handleSaveMilestone}
                onDeleteMilestone={handleDeleteMilestone}
                onClose={() => {
                    setIsAddMilestoneOpen(false);
                    setEditingMilestone(null);
                    setQuickAddYear(undefined);
                }}
            />

            {/* ── Manage Calendar Modal ─────────────────────────────────────── */}
            <ManageCalendarModal
                isOpen={isManageCalendarOpen}
                calendar={calendar}
                customPresets={world.customCalendarPresets}
                onSaveCalendar={handleSaveCalendar}
                onSaveCustomPresets={handleSaveCustomCalendarPresets}
                onClose={() => setIsManageCalendarOpen(false)}
            />

            {/* ── Ribbon Hover Tooltip Preview ──────────────────────────────── */}
            {hoveredRibbonItem && !inspectedItem && (
                <div 
                    className="fixed pointer-events-none z-50 transition-all duration-75 transform -translate-x-1/2 -translate-y-full mb-3 shadow-2xl"
                    style={{
                        left: `${Math.max(160, Math.min(window.innerWidth - 160, hoveredRibbonItem.clientX))}px`,
                        top: `${Math.max(70, hoveredRibbonItem.clientY - 12)}px`,
                        maxWidth: '340px'
                    }}
                >
                    <div className={`p-3.5 rounded-2xl border backdrop-blur-2xl shadow-2xl ${
                        isLightCanvas
                            ? 'bg-white/95 border-[#c8a96e]/70 text-[#2b1810]'
                            : isVoyager
                            ? 'bg-[#180c04]/95 border-[#2dd4bf]/50 text-[#f0dca8]'
                            : 'bg-slate-900/95 border-slate-700/80 text-slate-100'
                    }`}>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span 
                                className="text-[9px] uppercase px-2 py-0.5 rounded-full font-bold tracking-wider"
                                style={{
                                    backgroundColor: `${hoveredRibbonItem.item.color || '#38bdf8'}25`,
                                    color: hoveredRibbonItem.item.color || '#38bdf8',
                                    border: `1px solid ${hoveredRibbonItem.item.color || '#38bdf8'}60`
                                }}
                            >
                                {hoveredRibbonItem.item.type === 'event'
                                    ? (hoveredRibbonItem.item.eventType || 'Event')
                                    : hoveredRibbonItem.item.isDead ? 'Character • Deceased (†)' : 'Character • Living'}
                            </span>
                            <span className="text-[10px] font-mono font-bold opacity-60">
                                {hoveredRibbonItem.item.end - hoveredRibbonItem.item.start} yrs span
                            </span>
                        </div>

                        <h4 className="font-serif font-black text-sm tracking-wide truncate mb-1">
                            {hoveredRibbonItem.item.name}
                        </h4>

                        <div className="text-[11px] font-mono font-semibold mb-2 flex items-center gap-2 opacity-80">
                            <span>Yr {hoveredRibbonItem.item.start} — {hoveredRibbonItem.item.isDead ? `${hoveredRibbonItem.item.end} (†)` : hoveredRibbonItem.item.type === 'character' ? 'Living' : hoveredRibbonItem.item.end}</span>
                            {findEraForYear(hoveredRibbonItem.item.start, eras) && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-white/10">
                                    {findEraForYear(hoveredRibbonItem.item.start, eras)?.abbreviation || findEraForYear(hoveredRibbonItem.item.start, eras)?.name}
                                </span>
                            )}
                        </div>

                        {hoveredRibbonItem.item.description && (
                            <p className="text-[11px] leading-relaxed line-clamp-2 opacity-70 italic font-sans mb-2">
                                {hoveredRibbonItem.item.description}
                            </p>
                        )}

                        <div className="pt-2 border-t border-current/10 flex items-center justify-between text-[9px] uppercase font-bold tracking-wider opacity-50">
                            <span>Click ribbon to inspect in Chronos</span>
                            <ArrowRight size={10} />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Quick-Add On Rail Action Menu ─────────────────────────────── */}
            {quickAddMenu && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => setQuickAddMenu(null)}
                >
                    <div 
                        className={`w-full max-w-sm p-5 rounded-3xl border shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-150 ${
                            isLightCanvas
                                ? 'bg-[#fcfaf5] border-[#c8a96e] text-[#2b1810]'
                                : isVoyager
                                ? 'bg-[#180c04]/95 border-[#2dd4bf]/40 text-[#f0dca8]'
                                : 'bg-slate-900/95 border-slate-700 text-white'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-current/15 mb-3">
                            <div className="flex items-center gap-2">
                                <Compass size={16} className={isVoyager ? 'text-[#2dd4bf]' : isRoyal ? 'text-[#70121e]' : 'text-[#fef08a]'} />
                                <h3 className="font-serif font-black text-sm uppercase tracking-wider">
                                    Chronos Rail • Year {quickAddMenu.year}
                                </h3>
                            </div>
                            <button
                                onClick={() => setQuickAddMenu(null)}
                                className="p-1 rounded-lg hover:bg-current/10 transition-colors opacity-60 hover:opacity-100"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <p className="text-xs opacity-75 mb-4 font-sans leading-relaxed">
                            Fast-action temporal weaver for Year <strong className="font-mono text-amber-500">{quickAddMenu.year}</strong> ({formatYearWithEra(quickAddMenu.year, eras)}):
                        </p>

                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    setEditingMilestone(null);
                                    setQuickAddYear(quickAddMenu.year);
                                    setIsAddMilestoneOpen(true);
                                    setQuickAddMenu(null);
                                }}
                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                                    isLightCanvas
                                        ? 'bg-white border-[#d4c8af] hover:border-[#70121e] hover:bg-amber-50/60'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                                }`}
                            >
                                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                                    <Bookmark size={14} />
                                </div>
                                <div>
                                    <div className="font-bold">Add Milestone Pin</div>
                                    <div className="text-[10px] opacity-60">Plant a pivotal diamond marker at Year {quickAddMenu.year}</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleQuickCreateEvent(quickAddMenu.year)}
                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                                    isLightCanvas
                                        ? 'bg-white border-[#d4c8af] hover:border-[#70121e] hover:bg-amber-50/60'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                                }`}
                            >
                                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">
                                    <Sparkles size={14} />
                                </div>
                                <div>
                                    <div className="font-bold">Record Historical Event</div>
                                    <div className="text-[10px] opacity-60">Create event entity starting Year {quickAddMenu.year}</div>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    handleSetCurrentYear(quickAddMenu.year);
                                    setQuickAddMenu(null);
                                }}
                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                                    isLightCanvas
                                        ? 'bg-white border-[#d4c8af] hover:border-[#047857] hover:bg-emerald-50/60'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-500/40'
                                }`}
                            >
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                                    <Clock size={14} />
                                </div>
                                <div>
                                    <div className="font-bold">Set Current Year Playhead</div>
                                    <div className="text-[10px] opacity-60">Move "The Present" playhead to Year {quickAddMenu.year}</div>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    handleJumpToYear(quickAddMenu.year);
                                    setQuickAddMenu(null);
                                }}
                                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-left opacity-75 hover:opacity-100 hover:bg-current/5"
                            >
                                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                                    <Compass size={14} />
                                </div>
                                <span>Center Camera View Here</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit Current Year Playhead Modal ───────────────────────────── */}
            {isEditingCurrentYear && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => setIsEditingCurrentYear(false)}
                >
                    <div 
                        className={`w-full max-w-sm p-5 rounded-3xl border shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-150 ${
                            isLightCanvas
                                ? 'bg-[#fcfaf5] border-[#c8a96e] text-[#2b1810]'
                                : isVoyager
                                ? 'bg-[#180c04]/95 border-[#2dd4bf]/40 text-[#f0dca8]'
                                : 'bg-slate-900/95 border-slate-700 text-white'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-current/15 mb-3">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-emerald-400" />
                                <h3 className="font-serif font-black text-sm uppercase tracking-wider">
                                    Set Current Year Playhead
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsEditingCurrentYear(false)}
                                className="p-1 rounded-lg hover:bg-current/10 transition-colors opacity-60 hover:opacity-100"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <p className="text-xs opacity-70 mb-3 font-sans leading-relaxed">
                            Anchors the in-world present year marker across the Chronos timeline and campaign journals.
                        </p>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const num = parseInt(currentYearInput, 10);
                                if (!isNaN(num)) {
                                    handleSetCurrentYear(num);
                                }
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="text-[10px] uppercase font-bold tracking-wider opacity-60 block mb-1">
                                    In-World Year (Numeric)
                                </label>
                                <input
                                    type="number"
                                    value={currentYearInput}
                                    onChange={(e) => setCurrentYearInput(e.target.value)}
                                    placeholder="e.g. 1492"
                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono font-bold focus:outline-none ${
                                        isLightCanvas
                                            ? 'bg-white border-[#c8a96e] text-[#2b1810]'
                                            : 'bg-slate-950 border-slate-700 text-white'
                                    }`}
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingCurrentYear(false)}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase opacity-60 hover:opacity-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors"
                                >
                                    Save Playhead
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
