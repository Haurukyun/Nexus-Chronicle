import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
    MapPin, Globe, Link2, Trash2, X, Plus, Sparkles, Shield, Swords, 
    Compass, Search, AlertTriangle, CheckCircle2, ZoomIn, ZoomOut, 
    RotateCcw, Maximize2, ExternalLink, Edit3, Grid, Filter, 
    Navigation, Eye, Layers, ChevronRight
} from 'lucide-react';
import { WorldData, WorldEntity, MapConnection, Location, EntityType } from '../types';
import { useWorldStore } from '../store/useWorldStore';
import { useTheme } from '../theme';
import { NexusImage } from '../components/ui/NexusImage';

interface WorldMapProps {
    world: WorldData;
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
    onNavigate: (id: string) => void;
}

type AnchorMode = 'existing' | 'new';
type ConnectionType = 'trade' | 'magic' | 'diplomatic' | 'war';

const CONNECTION_META: Record<ConnectionType, { label: string; color: string; icon: any; strokeDash?: string }> = {
    trade: { label: 'Trade Routes', color: '#fbbf24', icon: Compass, strokeDash: '6,6' },
    magic: { label: 'Arcane Ley-Lines', color: '#818cf8', icon: Sparkles },
    diplomatic: { label: 'Diplomatic Envoys', color: '#4ade80', icon: Shield },
    war: { label: 'Warpaths', color: '#f87171', icon: Swords },
};

export const WorldMap: React.FC<WorldMapProps> = ({ world, setWorld, onNavigate }) => {
    const { themeId, layoutMode } = useTheme();
    const isRoyal = themeId === 'royal-codex';
    const isWiki = layoutMode === 'wiki';
    const isVoyager = themeId === 'grand-voyager';

    const handleToggleEdit = useWorldStore(state => state.handleToggleEdit);
    const focusMapLocationId = useWorldStore(state => state.focusMapLocationId);
    const clearFocusMapLocation = useWorldStore(state => state.clearFocusMapLocation);

    // Edit Modes & Link Building
    const [editMode, setEditMode] = useState<'marker' | 'link' | 'pan'>('marker');
    const [linkSource, setLinkSource] = useState<string | null>(null);

    // Zoom & Pan state
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState<number>(1);
    const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [dragStart, setDragStart] = useState<{ clientX: number; clientY: number; panX: number; panY: number }>({ clientX: 0, clientY: 0, panX: 0, panY: 0 });
    const [hasDragged, setHasDragged] = useState(false);

    // Beacon & Smart Focus
    const [activeBeaconId, setActiveBeaconId] = useState<string | null>(null);
    const beaconTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Search drawer & pin focus
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Ley-Line route filters
    const [routeFilters, setRouteFilters] = useState<Record<ConnectionType, boolean>>({
        trade: true,
        magic: true,
        diplomatic: true,
        war: true,
    });
    const [showFiltersMenu, setShowFiltersMenu] = useState(false);
    const [showGrid, setShowGrid] = useState(false);

    // Selected / Hovered Location for Dossier Card
    const [dossierLocationId, setDossierLocationId] = useState<string | null>(null);

    // Modal state for placing/assigning a location marker
    const [pendingMarkerPos, setPendingMarkerPos] = useState<{ x: number; y: number } | null>(null);
    const [anchorMode, setAnchorMode] = useState<AnchorMode>('existing');
    const [markerNameInput, setMarkerNameInput] = useState('');
    const [selectedExistingId, setSelectedExistingId] = useState('');
    const [locationSearch, setLocationSearch] = useState('');
    const [duplicateError, setDuplicateError] = useState('');
    const [replaceConfirm, setReplaceConfirm] = useState(false);

    // Modal state for creating a new connection
    const [pendingConnection, setPendingConnection] = useState<{ sourceId: string; targetId: string } | null>(null);
    const [selectedConnectionType, setSelectedConnectionType] = useState<ConnectionType>('trade');

    // All location entities
    const allLocations = useMemo(() =>
        world.entities.filter(e => e.type === 'location') as Location[],
        [world.entities]
    );

    const anchoredLocations = useMemo(() =>
        allLocations.filter(l => l.coordinates),
        [allLocations]
    );

    // Search bar filtering
    const searchResults = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return [];
        return allLocations.filter(l => l.name.toLowerCase().includes(q));
    }, [allLocations, searchQuery]);

    // Active dossier entity
    const dossierEntity = useMemo(() =>
        dossierLocationId ? allLocations.find(l => l.id === dossierLocationId) : null,
        [allLocations, dossierLocationId]
    );

    // Connection counts
    const connectionCounts = useMemo(() => {
        const counts: Record<ConnectionType, number> = { trade: 0, magic: 0, diplomatic: 0, war: 0 };
        (world.mapConnections || []).forEach(conn => {
            const t = (conn.type as ConnectionType) || 'trade';
            if (counts[t] !== undefined) counts[t]++;
        });
        return counts;
    }, [world.mapConnections]);

    // Zoom Helpers
    const zoomIn = () => setZoom(z => Math.min(4.0, Math.round((z + 0.3) * 100) / 100));
    const zoomOut = () => setZoom(z => Math.max(0.5, Math.round((z - 0.3) * 100) / 100));
    const resetZoom = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // Center map on specific location coordinates
    const focusOnCoordinates = useCallback((xPercent: number, yPercent: number, targetZoom = 1.8) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // In container space, (xPercent / 100) * rect.width is point's position from top-left.
        // We want this point to shift to the container center (rect.width / 2).
        // targetPanX = (0.5 - xPercent / 100) * rect.width * targetZoom
        const targetPanX = (0.5 - xPercent / 100) * rect.width * targetZoom;
        const targetPanY = (0.5 - yPercent / 100) * rect.height * targetZoom;

        setZoom(targetZoom);
        setPan({ x: targetPanX, y: targetPanY });
    }, []);

    // Watch for global focusMapLocationId trigger
    useEffect(() => {
        if (!focusMapLocationId) return;
        const targetLoc = allLocations.find(l => l.id === focusMapLocationId);
        if (targetLoc && targetLoc.coordinates) {
            focusOnCoordinates(targetLoc.coordinates.x, targetLoc.coordinates.y, 2.0);
            setActiveBeaconId(targetLoc.id);
            setDossierLocationId(targetLoc.id);

            if (beaconTimerRef.current) clearTimeout(beaconTimerRef.current);
            beaconTimerRef.current = setTimeout(() => {
                setActiveBeaconId(null);
            }, 6000);
        }
        clearFocusMapLocation();
    }, [focusMapLocationId, allLocations, focusOnCoordinates, clearFocusMapLocation]);

    // Wheel zoom handling with passive: false to prevent browser page scrolling
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const rect = container.getBoundingClientRect();
            const cursorX = e.clientX - rect.left - rect.width / 2;
            const cursorY = e.clientY - rect.top - rect.height / 2;

            const delta = e.deltaY < 0 ? 1.15 : 1 / 1.15;
            setZoom(prevZoom => {
                const nextZoom = Math.min(Math.max(prevZoom * delta, 0.5), 4.0);
                setPan(prevPan => {
                    // Keep cursor stationary in world space
                    const nextPanX = cursorX - ((cursorX - prevPan.x) / prevZoom) * nextZoom;
                    const nextPanY = cursorY - ((cursorY - prevPan.y) / prevZoom) * nextZoom;
                    return { x: nextPanX, y: nextPanY };
                });
                return nextZoom;
            });
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    // Mouse drag pan handling
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return; // Only primary button
        setIsPanning(true);
        setHasDragged(false);
        setDragStart({
            clientX: e.clientX,
            clientY: e.clientY,
            panX: pan.x,
            panY: pan.y
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPanning) return;
        const dx = e.clientX - dragStart.clientX;
        const dy = e.clientY - dragStart.clientY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
            setHasDragged(true);
        }
        setPan({
            x: dragStart.panX + dx,
            y: dragStart.panY + dy
        });
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isPanning) return;
        setIsPanning(false);

        // If user simply clicked without dragging, and is in marker mode:
        if (!hasDragged && editMode === 'marker') {
            handleCanvasClick(e);
        }
    };

    // Transform click to accurate 0-100% map coordinates
    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        const offX = e.clientX - (rect.left + rect.width / 2);
        const offY = e.clientY - (rect.top + rect.height / 2);

        const worldX = (offX - pan.x) / zoom + rect.width / 2;
        const worldY = (offY - pan.y) / zoom + rect.height / 2;

        const pctX = Math.max(0, Math.min(100, Math.round(((worldX / rect.width) * 100) * 10) / 10));
        const pctY = Math.max(0, Math.min(100, Math.round(((worldY / rect.height) * 100) * 10) / 10));

        setPendingMarkerPos({ x: pctX, y: pctY });
        setAnchorMode('existing');
        setMarkerNameInput('');
        setSelectedExistingId('');
        setLocationSearch('');
        setDuplicateError('');
        setReplaceConfirm(false);
    };

    const cancelModal = () => {
        setPendingMarkerPos(null);
        setDuplicateError('');
        setReplaceConfirm(false);
    };

    const handleMarkerClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (editMode === 'link') {
            if (!linkSource) {
                setLinkSource(id);
            } else if (linkSource !== id) {
                setPendingConnection({ sourceId: linkSource, targetId: id });
            } else {
                setLinkSource(null);
            }
        } else {
            // Open Dossier Card on pin click
            setDossierLocationId(id);
        }
    };

    // Plant or assign anchor
    const handleConfirmAnchor = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!pendingMarkerPos) return;

        if (anchorMode === 'existing') {
            if (!selectedExistingId) return;
            const target = allLocations.find(l => l.id === selectedExistingId);
            if (target?.coordinates && !replaceConfirm) {
                setReplaceConfirm(true);
                return;
            }
            setWorld(prev => ({
                ...prev,
                entities: prev.entities.map(ent =>
                    ent.id === selectedExistingId
                        ? { ...ent, coordinates: pendingMarkerPos }
                        : ent
                )
            }));
            setPendingMarkerPos(null);
            setReplaceConfirm(false);
        } else {
            const name = markerNameInput.trim();
            if (!name) return;

            const nameLower = name.toLowerCase();
            const duplicate = world.entities.find(ent =>
                ent.name.trim().toLowerCase() === nameLower
            );
            if (duplicate) {
                setDuplicateError(
                    duplicate.type === 'location'
                        ? `A Location named "${duplicate.name}" already exists. Select it from "Pin Existing Location".`
                        : `An entry named "${name}" already exists (${duplicate.type}). Choose a different name.`
                );
                return;
            }

            const id = useWorldStore.getState().handleCreate('location', name, false);
            setWorld(prev => ({
                ...prev,
                entities: prev.entities.map(ent =>
                    ent.id === id ? { ...ent, coordinates: pendingMarkerPos } : ent
                )
            }));

            setPendingMarkerPos(null);
            setMarkerNameInput('');
            setDuplicateError('');
        }
    };

    const handleConfirmConnection = () => {
        if (!pendingConnection) return;
        const newConn: MapConnection = {
            id: crypto.randomUUID(),
            sourceId: pendingConnection.sourceId,
            targetId: pendingConnection.targetId,
            type: selectedConnectionType
        };
        setWorld(prev => ({
            ...prev,
            mapConnections: [...(prev.mapConnections || []), newConn]
        }));
        setPendingConnection(null);
        setLinkSource(null);
    };

    const deleteConnection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setWorld(prev => ({
            ...prev,
            mapConnections: (prev.mapConnections || []).filter(c => c.id !== id)
        }));
    };

    const sourceEntity = useMemo(() =>
        pendingConnection ? world.entities.find(e => e.id === pendingConnection.sourceId) : null
    , [pendingConnection, world.entities]);

    const targetEntity = useMemo(() =>
        pendingConnection ? world.entities.find(e => e.id === pendingConnection.targetId) : null
    , [pendingConnection, world.entities]);

    // Theme color tokens
    const accent = isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#b91c1c]' : isVoyager ? 'text-[#2dd4bf]' : 'text-[#fef08a]';
    const bgCard = isRoyal ? 'bg-[#f7f0e1]' : isWiki ? 'bg-[#fbf6ea]' : isVoyager ? 'bg-[#0f172a]' : 'bg-slate-900';
    const borderCard = isRoyal ? 'border-[#c8a96e]/50' : isWiki ? 'border-[#d4c8af]' : isVoyager ? 'border-[#2dd4bf]/30' : 'border-slate-800/80';
    const textPrimary = isRoyal ? 'text-[#2b1810]' : isWiki ? 'text-[#1a1a1a]' : isVoyager ? 'text-[#f1f5f9]' : 'text-slate-100';
    const inputCls = isRoyal
        ? 'bg-[#fbf8ef] border-[#c8a96e]/60 text-[#2b1810] placeholder:text-[#8c6d48]/60 focus:ring-1 focus:ring-[#70121e]'
        : isWiki
        ? 'bg-white border-[#d4c8af] text-[#2b1810] placeholder:text-[#b0a090] focus:ring-1 focus:ring-[#b91c1c]'
        : 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#fef08a]';

    return (
        <div className="w-full h-full flex flex-col animate-in fade-in duration-500 p-6 md:p-8 space-y-4 relative select-none">
            {/* Top Atlas Header & Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-20">
                <div className="flex items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className={`text-4xl md:text-5xl font-serif font-black uppercase tracking-tight ${isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#b91c1c]' : isVoyager ? 'text-[#2dd4bf]' : 'text-[#fef08a]'}`}>
                                {world.name} Atlas
                            </h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest border ${
                                isRoyal ? 'border-[#c8a96e]/40 bg-[#ede2cc]/60 text-[#70121e] font-bold' : 'border-current/20 bg-black/20 opacity-70'
                            }`}>
                                {anchoredLocations.length} Anchors
                            </span>
                        </div>
                        <p className={`text-[10px] tracking-[0.3em] uppercase italic mt-0.5 opacity-60 ${textPrimary}`}>
                            Cartographic Navigation &amp; Ley-Line Overlays
                        </p>
                    </div>
                </div>

                {/* Right Header: Search Bar + Mode Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Fast Search Pin Bar */}
                    <div className="relative">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border ${
                            isRoyal ? 'bg-[#fbf8ef] border-[#c8a96e]/60' : isWiki ? 'bg-white border-[#d4c8af]' : 'bg-slate-900/90 border-slate-700'
                        } shadow-sm transition-all focus-within:ring-2 ${isRoyal ? 'focus-within:ring-[#70121e]' : 'focus-within:ring-yellow-400'}`}>
                            <Search size={14} className="opacity-40" />
                            <input
                                type="text"
                                placeholder="Find sanctuary or pin..."
                                value={searchQuery}
                                onChange={e => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
                                onFocus={() => setIsSearchOpen(true)}
                                className="bg-transparent border-none outline-none text-xs w-36 md:w-52 placeholder:opacity-40"
                            />
                            {searchQuery && (
                                <button type="button" onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} className="opacity-40 hover:opacity-100">
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        {/* Search Suggestions Dropdown */}
                        {isSearchOpen && searchResults.length > 0 && (
                            <div className={`absolute top-full left-0 w-72 mt-2 rounded-2xl border shadow-2xl z-50 overflow-hidden divide-y ${
                                isRoyal ? 'bg-[#fbf8ef] border-[#c8a96e] divide-[#c8a96e]/30' : isWiki ? 'bg-white border-[#d4c8af] divide-[#d4c8af]' : 'bg-slate-900 border-slate-700 divide-slate-800'
                            }`}>
                                <div className="max-h-60 overflow-y-auto">
                                    {searchResults.map(loc => {
                                        const hasCoords = Boolean(loc.coordinates);
                                        return (
                                            <button
                                                key={loc.id}
                                                type="button"
                                                onClick={() => {
                                                    if (loc.coordinates) {
                                                        focusOnCoordinates(loc.coordinates.x, loc.coordinates.y, 2.0);
                                                        setActiveBeaconId(loc.id);
                                                        setDossierLocationId(loc.id);
                                                    } else {
                                                        // Unanchored - open anchor modal for this location
                                                        setAnchorMode('existing');
                                                        setSelectedExistingId(loc.id);
                                                        setPendingMarkerPos({ x: 50, y: 50 });
                                                    }
                                                    setIsSearchOpen(false);
                                                }}
                                                className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                                                    isRoyal ? 'hover:bg-[#881337] hover:text-[#fff8e7]' : 'hover:bg-white/10'
                                                }`}
                                            >
                                                <div className="flex flex-col min-w-0 pr-2">
                                                    <span className="font-bold truncate">{loc.name}</span>
                                                    <span className="text-[9px] opacity-60 uppercase font-mono">{loc.locationType || 'Sanctuary'}</span>
                                                </div>
                                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                                                    hasCoords
                                                        ? isRoyal ? 'bg-[#70121e]/20 text-[#70121e]' : 'bg-amber-400/20 text-amber-300'
                                                        : 'bg-slate-500/20 text-slate-400'
                                                }`}>
                                                    {hasCoords ? 'Jump' : 'Unanchored'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mode Buttons */}
                    <div className={`flex p-1.5 rounded-2xl border ${
                        isRoyal ? 'bg-[#fbf8ef] border-[#c8a96e]/60' : isWiki ? 'bg-white border-[#d4c8af]' : 'bg-slate-900/90 border-slate-800'
                    } shadow-md`}>
                        <button
                            type="button"
                            onClick={() => { setEditMode('marker'); setLinkSource(null); }}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-black uppercase transition-all ${
                                editMode === 'marker'
                                    ? isRoyal
                                        ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e] shadow-sm'
                                        : isWiki
                                        ? 'bg-[#b91c1c] text-white shadow-sm'
                                        : 'bg-[#fef08a] text-black shadow-md'
                                    : 'opacity-60 hover:opacity-100'
                            }`}
                        >
                            <Globe size={14} /> Anchors
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditMode('link')}
                            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-black uppercase transition-all ${
                                editMode === 'link'
                                    ? isRoyal
                                        ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e] shadow-sm'
                                        : isWiki
                                        ? 'bg-[#b91c1c] text-white shadow-sm'
                                        : 'bg-blue-500 text-white shadow-md'
                                    : 'opacity-60 hover:opacity-100'
                            }`}
                        >
                            <Link2 size={14} /> {linkSource ? 'Pick Target...' : 'Ley-Lines'}
                        </button>
                    </div>

                    {/* Filter & Grid HUD Buttons */}
                    <button
                        type="button"
                        onClick={() => setShowFiltersMenu(!showFiltersMenu)}
                        title="Filter Ley-Line Overlays"
                        className={`p-2.5 rounded-2xl border transition-all ${
                            showFiltersMenu
                                ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] border-[#c8a96e]' : 'bg-white/20 border-white/40'
                                : isRoyal ? 'bg-[#fbf8ef] border-[#c8a96e]/60 text-[#2b1810]' : isWiki ? 'bg-white border-[#d4c8af]' : 'bg-slate-900 border-slate-700'
                        } shadow-sm`}
                    >
                        <Filter size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowGrid(!showGrid)}
                        title="Toggle Graticule Coordinate Grid"
                        className={`p-2.5 rounded-2xl border transition-all ${
                            showGrid
                                ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] border-[#c8a96e]' : 'bg-white/20 border-white/40'
                                : isRoyal ? 'bg-[#fbf8ef] border-[#c8a96e]/60 text-[#2b1810]' : isWiki ? 'bg-white border-[#d4c8af]' : 'bg-slate-900 border-slate-700'
                        } shadow-sm`}
                    >
                        <Grid size={15} />
                    </button>
                </div>
            </div>

            {/* Ley-Line Filters Floating Dropdown */}
            {showFiltersMenu && (
                <div className={`absolute top-24 right-8 z-40 p-4 rounded-3xl border shadow-2xl space-y-3 w-72 animate-in slide-in-from-top-2 duration-200 ${
                    isRoyal ? 'bg-[#fbf8ef] border-2 border-[#c8a96e] text-[#2b1810]' : isWiki ? 'bg-white border-[#d4c8af] text-[#2b1810]' : 'bg-slate-900/95 border-slate-700 text-slate-100'
                }`}>
                    <div className="flex items-center justify-between border-b pb-2 border-current/15">
                        <span className="text-xs font-serif font-black uppercase tracking-wider flex items-center gap-1.5">
                            <Layers size={13} className={accent} /> Ley-Line Channels
                        </span>
                        <button type="button" onClick={() => setShowFiltersMenu(false)} className="opacity-50 hover:opacity-100">
                            <X size={14} />
                        </button>
                    </div>

                    <div className="space-y-1.5">
                        {(Object.keys(CONNECTION_META) as ConnectionType[]).map(typeKey => {
                            const meta = CONNECTION_META[typeKey];
                            const isEnabled = routeFilters[typeKey];
                            const count = connectionCounts[typeKey] || 0;
                            return (
                                <button
                                    key={typeKey}
                                    type="button"
                                    onClick={() => setRouteFilters(prev => ({ ...prev, [typeKey]: !prev[typeKey] }))}
                                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                                        isEnabled
                                            ? isRoyal ? 'bg-[#ede2cc] text-[#2b1810]' : 'bg-white/10'
                                            : 'opacity-40 hover:opacity-75'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                                        <span className="font-bold">{meta.label}</span>
                                    </div>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/10">
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Interactive Map Viewport */}
            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className={`flex-1 w-full min-h-[480px] rounded-[3.5rem] border-8 md:border-[14px] ${borderCard} ${bgCard} shadow-2xl relative overflow-hidden group select-none ${
                    isPanning ? 'cursor-grabbing' : editMode === 'marker' ? 'cursor-crosshair' : 'cursor-grab'
                }`}
            >
                {/* Scaled & Panned Canvas Layer */}
                <div
                    style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'center center',
                    }}
                    className="w-full h-full relative will-change-transform select-none"
                >
                    {/* Background Map Image */}
                    <img
                        src={world.mapImage}
                        draggable={false}
                        className={`w-full h-full object-cover pointer-events-none ${
                            isWiki ? 'sepia-[.8] opacity-75' : isRoyal ? 'sepia-[.35] opacity-85 contrast-105' : 'sepia-[.4] opacity-60'
                        }`}
                        alt="World Atlas"
                    />

                    {/* Graticule Latitude/Longitude Grid Overlay */}
                    {showGrid && (
                        <div className="absolute inset-0 pointer-events-none opacity-25">
                            <svg className="w-full h-full stroke-current" strokeWidth="0.5" strokeDasharray="4,8">
                                {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(pct => (
                                    <React.Fragment key={pct}>
                                        <line x1={`${pct}%`} y1="0%" x2={`${pct}%`} y2="100%" />
                                        <line x1="0%" y1={`${pct}%`} x2="100%" y2={`${pct}%`} />
                                    </React.Fragment>
                                ))}
                            </svg>
                        </div>
                    )}

                    {/* SVG Layer for Connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                        <defs>
                            <filter id="leyline-glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {(world.mapConnections || []).map(conn => {
                            const connType = (conn.type as ConnectionType) || 'trade';
                            if (!routeFilters[connType]) return null;

                            const s = world.entities.find(e => e.id === conn.sourceId);
                            const t = world.entities.find(e => e.id === conn.targetId);
                            if (!s?.coordinates || !t?.coordinates) return null;

                            const meta = CONNECTION_META[connType] || CONNECTION_META.trade;

                            return (
                                <g key={conn.id} className="pointer-events-auto cursor-pointer group/line" onClick={(e) => deleteConnection(conn.id, e)}>
                                    <line
                                        x1={`${s.coordinates.x}%`}
                                        y1={`${s.coordinates.y}%`}
                                        x2={`${t.coordinates.x}%`}
                                        y2={`${t.coordinates.y}%`}
                                        stroke={meta.color}
                                        strokeWidth="3"
                                        strokeDasharray={meta.strokeDash || 'none'}
                                        className={`${conn.type === 'magic' ? 'animate-pulse' : ''} opacity-70 group-hover/line:opacity-100 transition-opacity`}
                                        filter="url(#leyline-glow)"
                                    />
                                    {/* Delete Connection Target Circle on Line Midpoint */}
                                    <circle
                                        cx={`${(s.coordinates.x + t.coordinates.x) / 2}%`}
                                        cy={`${(s.coordinates.y + t.coordinates.y) / 2}%`}
                                        r="13"
                                        fill="#0f172a"
                                        className="opacity-0 group-hover/line:opacity-100 transition-opacity"
                                    />
                                    <foreignObject
                                        x={`${(s.coordinates.x + t.coordinates.x) / 2}%`}
                                        y={`${(s.coordinates.y + t.coordinates.y) / 2}%`}
                                        width="24"
                                        height="24"
                                        className="opacity-0 group-hover/line:opacity-100 transition-opacity -translate-x-3 -translate-y-3"
                                    >
                                        <Trash2 size={16} className="text-red-400 hover:text-red-300 transition-colors" />
                                    </foreignObject>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Markers Layer */}
                    {anchoredLocations.map(loc => {
                        if (!loc.coordinates) return null;
                        const isLinkSelected = linkSource === loc.id;
                        const isBeaconActive = activeBeaconId === loc.id;
                        const isDossierOpen = dossierLocationId === loc.id;

                        return (
                            <div
                                key={loc.id}
                                style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
                                className={`absolute -translate-x-1/2 -translate-y-1/2 group/marker z-10 transition-transform ${
                                    isLinkSelected ? 'scale-150 brightness-150 animate-bounce' : ''
                                }`}
                                onClick={(e) => handleMarkerClick(loc.id, e)}
                            >
                                <div className="relative cursor-pointer">
                                    {/* Radiant Pulse Beacon Animation */}
                                    {isBeaconActive && (
                                        <div className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                            <span className={`absolute -inset-6 rounded-full animate-ping opacity-75 ${
                                                isRoyal ? 'bg-[#70121e]' : 'bg-yellow-400'
                                            }`} />
                                            <span className={`absolute -inset-10 rounded-full animate-pulse border-2 border-dashed ${
                                                isRoyal ? 'border-[#c8a96e]' : 'border-yellow-300'
                                            }`} />
                                        </div>
                                    )}

                                    {/* Pin Marker Icon */}
                                    <MapPin
                                        className={`${
                                            isLinkSelected
                                                ? 'text-blue-400'
                                                : isDossierOpen
                                                ? isRoyal ? 'text-[#70121e] scale-125' : 'text-yellow-400 scale-125'
                                                : accent
                                        } drop-shadow-xl group-hover/marker:scale-125 transition-transform duration-200`}
                                        size={32}
                                        strokeWidth={2.5}
                                        fill={isRoyal ? "#70121e33" : isWiki ? "#b91c1c33" : "#fef08a44"}
                                    />

                                    {/* Tiny Label Badge on Pin */}
                                    <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider whitespace-nowrap shadow-md pointer-events-none transition-all ${
                                        isDossierOpen || isBeaconActive
                                            ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e]' : 'bg-yellow-400 text-black border border-yellow-200'
                                            : isRoyal ? 'bg-[#fbf8ef] text-[#3d0a10] border border-[#c8a96e]/60' : isWiki ? 'bg-white text-[#b91c1c] border border-[#d4c8af]' : 'bg-slate-950 text-[#fef08a] border border-slate-700'
                                    }`}>
                                        {loc.name}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Floating Ornate Compass Rose HUD (Bottom-Left) */}
                <div className={`absolute bottom-8 left-8 z-30 p-4 rounded-3xl border shadow-2xl backdrop-blur-md flex items-center gap-3 pointer-events-auto ${
                    isRoyal ? 'bg-[#fbf8ef]/90 border-2 border-[#c8a96e]/70 text-[#2b1810]' : isWiki ? 'bg-white/90 border-[#d4c8af] text-[#2b1810]' : isVoyager ? 'bg-[#0f172a]/90 border-[#2dd4bf]/40 text-[#2dd4bf]' : 'bg-slate-950/80 border-slate-700 text-[#fef08a]'
                }`}>
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform transition-transform duration-500">
                            {/* Outer Circle Ring */}
                            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
                            <circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                            
                            {/* Compass Rose Points */}
                            {/* North */}
                            <polygon points="50,6 55,45 50,50 45,45" fill={isRoyal ? '#70121e' : '#e11d48'} />
                            {/* South */}
                            <polygon points="50,94 55,55 50,50 45,55" fill="currentColor" opacity="0.5" />
                            {/* East */}
                            <polygon points="94,50 55,55 50,50 55,45" fill="currentColor" opacity="0.7" />
                            {/* West */}
                            <polygon points="6,50 45,55 50,50 45,45" fill="currentColor" opacity="0.7" />

                            {/* Center Gem Pin */}
                            <circle cx="50" cy="50" r="4" fill={isRoyal ? '#c8a96e' : '#fbbf24'} />
                        </svg>
                        <span className="absolute top-0 text-[8px] font-serif font-black uppercase text-red-500">N</span>
                    </div>

                    <div className="hidden sm:flex flex-col text-[9px] font-mono leading-tight opacity-75">
                        <span className="font-bold tracking-wider uppercase font-serif">Planar Bearing</span>
                        <span>LAT: 44° 12' N</span>
                        <span>LON: 19° 48' E</span>
                    </div>
                </div>

                {/* Floating Zoom & Canvas Controls HUD (Bottom-Right) */}
                <div className={`absolute bottom-8 right-8 z-30 flex items-center gap-1.5 p-2 rounded-2xl border shadow-2xl backdrop-blur-md ${
                    isRoyal ? 'bg-[#fbf8ef]/90 border-2 border-[#c8a96e]/70 text-[#2b1810]' : isWiki ? 'bg-white/90 border-[#d4c8af] text-[#2b1810]' : 'bg-slate-950/85 border-slate-700 text-white'
                }`}>
                    <button
                        type="button"
                        onClick={zoomOut}
                        title="Zoom Out"
                        className="p-2 rounded-xl hover:bg-black/10 transition-colors"
                    >
                        <ZoomOut size={16} />
                    </button>
                    <span className="text-[10px] font-mono font-bold px-2 text-center min-w-[42px]">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        type="button"
                        onClick={zoomIn}
                        title="Zoom In"
                        className="p-2 rounded-xl hover:bg-black/10 transition-colors"
                    >
                        <ZoomIn size={16} />
                    </button>
                    <div className="w-[1px] h-4 bg-current/20 mx-1" />
                    <button
                        type="button"
                        onClick={resetZoom}
                        title="Reset View & Center"
                        className="p-2 rounded-xl hover:bg-black/10 transition-colors"
                    >
                        <RotateCcw size={15} />
                    </button>
                </div>

                {/* Rich Location Dossier Tooltip Card (Floating Inspector) */}
                {dossierEntity && dossierEntity.coordinates && (
                    <div className={`absolute top-6 left-6 z-40 max-w-sm w-full p-5 rounded-3xl border shadow-2xl space-y-4 animate-in slide-in-from-left-4 duration-300 backdrop-blur-md ${
                        isRoyal ? 'bg-[#fbf8ef]/95 border-2 border-[#c8a96e] text-[#2b1810]' : isWiki ? 'bg-white/95 border-[#d4c8af] text-[#2b1810]' : 'bg-slate-900/95 border-slate-700 text-slate-100'
                    }`}>
                        <div className="flex items-start justify-between gap-3 border-b pb-3 border-current/15">
                            <div className="flex items-center gap-3">
                                {dossierEntity.imageUri ? (
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-current/20 shrink-0 shadow-md">
                                        <NexusImage src={dossierEntity.imageUri} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                                        isRoyal ? 'bg-[#ede2cc] text-[#70121e] border-[#c8a96e]/60' : 'bg-black/20 border-current/20'
                                    }`}>
                                        <Compass size={22} />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h3 className="text-base font-serif font-black uppercase tracking-tight truncate">
                                        {dossierEntity.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                            isRoyal ? 'bg-[#70121e]/15 text-[#70121e]' : 'bg-current/10 opacity-70'
                                        }`}>
                                            {dossierEntity.locationType || 'Sanctuary'}
                                        </span>
                                        <span className="text-[9px] font-mono opacity-50">
                                            [{dossierEntity.coordinates.x}%, {dossierEntity.coordinates.y}%]
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDossierLocationId(null)}
                                className="opacity-40 hover:opacity-100 transition-opacity p-1"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Stats Readout */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {dossierEntity.population && (
                                <div className="p-2.5 rounded-xl bg-current/5 border border-current/10">
                                    <span className="text-[9px] uppercase tracking-wider opacity-60 block font-mono">Population</span>
                                    <span className="font-bold">{dossierEntity.population}</span>
                                </div>
                            )}
                            {dossierEntity.size && (
                                <div className="p-2.5 rounded-xl bg-current/5 border border-current/10">
                                    <span className="text-[9px] uppercase tracking-wider opacity-60 block font-mono">Domain Size</span>
                                    <span className="font-bold">{dossierEntity.size}</span>
                                </div>
                            )}
                        </div>

                        {/* Description Lore Snippet */}
                        {dossierEntity.description && (
                            <p className="text-xs line-clamp-3 opacity-75 leading-relaxed font-serif">
                                {dossierEntity.description}
                            </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-1 border-t border-current/15">
                            <button
                                type="button"
                                onClick={() => onNavigate(dossierEntity.id)}
                                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                                    isRoyal
                                        ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#881337] border border-[#c8a96e] shadow-sm'
                                        : isWiki
                                        ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]'
                                        : 'bg-[#fef08a] text-black hover:bg-yellow-400'
                                }`}
                            >
                                <Eye size={13} /> Open Lore
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleToggleEdit(dossierEntity.id);
                                    onNavigate(dossierEntity.id);
                                }}
                                className="p-2 rounded-xl border border-current/20 hover:bg-current/10 transition-colors"
                                title="Edit in Studio"
                            >
                                <Edit3 size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setWorld(prev => ({
                                        ...prev,
                                        entities: prev.entities.map(ent =>
                                            ent.id === dossierEntity.id ? { ...ent, coordinates: undefined } : ent
                                        )
                                    }));
                                    setDossierLocationId(null);
                                }}
                                className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Remove Anchor Pin"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== Modal: Plant / Assign Anchor ===== */}
            {pendingMarkerPos && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <form
                        onSubmit={handleConfirmAnchor}
                        className={`w-full max-w-lg p-8 rounded-3xl border shadow-2xl space-y-6 ${
                            isRoyal ? 'bg-[#fbf8ef] border-2 border-[#c8a96e] text-[#2b1810]' : isWiki ? 'bg-[#fbf6ea] border-[#d4c8af] text-[#2b1810]' : 'bg-slate-900 border-[#c8a96e]/50 text-slate-100'
                        }`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b pb-4 border-current/10">
                            <div className="flex items-center gap-3">
                                <MapPin size={22} className={accent} />
                                <div>
                                    <h3 className="text-lg font-serif font-black uppercase tracking-tight">Plant Sanctuary Anchor</h3>
                                    <p className="text-[10px] opacity-60 font-mono tracking-widest">ATLAS COORDS: [{pendingMarkerPos.x}%, {pendingMarkerPos.y}%]</p>
                                </div>
                            </div>
                            <button type="button" onClick={cancelModal} className="opacity-50 hover:opacity-100 transition-opacity">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Mode tabs */}
                        <div className={`flex rounded-2xl p-1 border ${
                            isRoyal ? 'bg-[#ede2cc] border-[#c8a96e]/40' : isWiki ? 'bg-[#f0e8d8] border-[#d4c8af]' : 'bg-black/30 border-slate-700/50'
                        }`}>
                            <button
                                type="button"
                                onClick={() => { setAnchorMode('existing'); setDuplicateError(''); setReplaceConfirm(false); }}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                                    anchorMode === 'existing'
                                        ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] shadow-sm' : isWiki ? 'bg-[#b91c1c] text-white shadow' : 'bg-[#fef08a] text-black shadow-lg'
                                        : 'opacity-50 hover:opacity-80'
                                }`}
                            >
                                <Search size={13} /> Pin Existing Location
                            </button>
                            <button
                                type="button"
                                onClick={() => { setAnchorMode('new'); setDuplicateError(''); setReplaceConfirm(false); }}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                                    anchorMode === 'new'
                                        ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] shadow-sm' : isWiki ? 'bg-[#b91c1c] text-white shadow' : 'bg-[#fef08a] text-black shadow-lg'
                                        : 'opacity-50 hover:opacity-80'
                                }`}
                            >
                                <Plus size={13} /> Create New Location
                            </button>
                        </div>

                        {/* Existing Location Picker */}
                        {anchorMode === 'existing' && (
                            <div className="space-y-3">
                                {allLocations.length === 0 ? (
                                    <div className="text-center py-6 opacity-50 text-sm italic">
                                        No locations exist yet. Switch to "Create New" to add one.
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                                            <input
                                                type="text"
                                                placeholder="Search locations..."
                                                value={locationSearch}
                                                onChange={e => setLocationSearch(e.target.value)}
                                                className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${inputCls}`}
                                            />
                                        </div>

                                        <div className={`max-h-52 overflow-y-auto rounded-xl border divide-y ${
                                            isRoyal ? 'border-[#c8a96e]/40 divide-[#c8a96e]/20' : isWiki ? 'border-[#d4c8af] divide-[#d4c8af]' : 'border-slate-700 divide-slate-700/60'
                                        }`}>
                                            {allLocations.filter(l => l.name.toLowerCase().includes(locationSearch.toLowerCase())).map(loc => {
                                                const hasCoords = Boolean(loc.coordinates);
                                                const isSelected = selectedExistingId === loc.id;
                                                return (
                                                    <button
                                                        key={loc.id}
                                                        type="button"
                                                        onClick={() => { setSelectedExistingId(loc.id); setReplaceConfirm(false); }}
                                                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all text-xs ${
                                                            isSelected
                                                                ? isRoyal ? 'bg-[#70121e]/15 text-[#70121e] font-bold' : isWiki ? 'bg-[#b91c1c]/10 text-[#b91c1c]' : 'bg-yellow-400/10 text-yellow-300'
                                                                : 'hover:bg-black/5'
                                                        }`}
                                                    >
                                                        <span className="font-bold">{loc.name}</span>
                                                        <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                            hasCoords
                                                                ? 'bg-amber-500/20 text-amber-500 font-bold'
                                                                : 'bg-slate-500/20 text-slate-500'
                                                        }`}>
                                                            {hasCoords ? 'Anchored' : 'Unanchored'}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {selectedExistingId && allLocations.find(l => l.id === selectedExistingId)?.coordinates && (
                                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                                                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                                <div className="text-xs leading-relaxed">
                                                    <p className="font-bold text-amber-600 dark:text-amber-300">
                                                        {replaceConfirm
                                                            ? 'Confirmed. Click "Plant Anchor" to relocate.'
                                                            : 'This location is already anchored on the map.'}
                                                    </p>
                                                    {!replaceConfirm && (
                                                        <p className="opacity-75">Click Confirm Replace below to update its position.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* New Location Form */}
                        {anchorMode === 'new' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1.5">New Location Name</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="e.g. Citadel of the Sun, Whispering Woods..."
                                        value={markerNameInput}
                                        onChange={e => { setMarkerNameInput(e.target.value); setDuplicateError(''); }}
                                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${inputCls}`}
                                    />
                                </div>

                                {duplicateError && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2">
                                        <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">{duplicateError}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={cancelModal}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase opacity-60 hover:opacity-100 transition-opacity"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={
                                    anchorMode === 'existing'
                                        ? !selectedExistingId
                                        : !markerNameInput.trim()
                                }
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    isRoyal
                                        ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#881337] disabled:opacity-40 border border-[#c8a96e] shadow-md'
                                        : isWiki
                                        ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b] disabled:opacity-40'
                                        : 'bg-[#fef08a] text-black hover:bg-yellow-400 disabled:opacity-40 shadow-lg'
                                }`}
                            >
                                {anchorMode === 'existing' && allLocations.find(l => l.id === selectedExistingId)?.coordinates && !replaceConfirm
                                    ? 'Confirm Replace'
                                    : 'Plant Anchor'}
                            </button>
                        </div>
                    </form>
                </div>,
                document.body
            )}

            {/* ===== Modal: New Ley-Line Connection ===== */}
            {pendingConnection && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className={`w-full max-w-lg p-8 rounded-3xl border shadow-2xl space-y-6 ${
                        isRoyal ? 'bg-[#fbf8ef] border-2 border-[#c8a96e] text-[#2b1810]' : isWiki ? 'bg-[#fbf6ea] border-[#d4c8af] text-[#2b1810]' : 'bg-slate-900 border-[#c8a96e]/50 text-slate-100'
                    }`}>
                        <div className="flex items-center justify-between border-b pb-4 border-current/15">
                            <div className="flex items-center gap-3">
                                <Link2 size={22} className={accent} />
                                <div>
                                    <h3 className="text-lg font-serif font-black uppercase tracking-tight">Forge Ley-Line Passage</h3>
                                    <p className="text-[10px] opacity-60 font-mono tracking-widest">
                                        {sourceEntity?.name || 'Origin'} ➔ {targetEntity?.name || 'Destination'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setPendingConnection(null); setLinkSource(null); }}
                                className="opacity-50 hover:opacity-100 transition-opacity"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block">Passage Nature</label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'trade', label: 'Trade Route', icon: Compass, color: '#fbbf24', desc: 'Commercial overland & sea lanes' },
                                    { id: 'magic', label: 'Arcane Conduit', icon: Sparkles, color: '#818cf8', desc: 'Mystical portals & ley-lines' },
                                    { id: 'diplomatic', label: 'Diplomatic Envoy', icon: Shield, color: '#4ade80', desc: 'Peace treaties & courier lines' },
                                    { id: 'war', label: 'Warpath', icon: Swords, color: '#f87171', desc: 'Military marches & frontlines' },
                                ].map(option => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setSelectedConnectionType(option.id as ConnectionType)}
                                        className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                                            selectedConnectionType === option.id
                                                ? isRoyal
                                                    ? 'bg-[#70121e]/15 border-[#70121e] ring-1 ring-[#70121e]'
                                                    : isWiki
                                                    ? 'bg-[#b91c1c]/10 border-[#b91c1c] ring-1 ring-[#b91c1c]'
                                                    : 'bg-slate-800 border-[#fef08a] ring-1 ring-[#fef08a]'
                                                : 'border-current/10 hover:border-current/30 opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <option.icon size={16} style={{ color: option.color }} />
                                            <span className="text-xs font-bold uppercase">{option.label}</span>
                                        </div>
                                        <span className="text-[10px] opacity-60 leading-tight">{option.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => { setPendingConnection(null); setLinkSource(null); }}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase opacity-60 hover:opacity-100 transition-opacity"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmConnection}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    isRoyal
                                        ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#881337] border border-[#c8a96e] shadow-md'
                                        : isWiki
                                        ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]'
                                        : 'bg-blue-500 text-white hover:bg-blue-400 shadow-lg'
                                }`}
                            >
                                Forge Passage
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
