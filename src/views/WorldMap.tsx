import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Globe, Link2, Trash2, X, Plus, Sparkles, Shield, Swords, Compass, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { WorldData, WorldEntity, MapConnection } from '../types';
import { useWorldStore } from '../store/useWorldStore';

interface WorldMapProps {
    world: WorldData;
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
}

type AnchorMode = 'existing' | 'new';

export const WorldMap = ({ world, setWorld, onNavigate, isWikiMode }: WorldMapProps) => {
    const theme = useWorldStore(state => state.theme);
    const isRoyal = theme === 'royal-codex';
    const [editMode, setEditMode] = useState<'marker' | 'link'>('marker');
    const [linkSource, setLinkSource] = useState<string | null>(null);

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
    const [selectedConnectionType, setSelectedConnectionType] = useState<'trade' | 'magic' | 'diplomatic' | 'war'>('trade');

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (editMode !== 'marker') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPendingMarkerPos({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
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

    // All location entities
    const allLocations = useMemo(() =>
        world.entities.filter(e => e.type === 'location'),
        [world.entities]
    );

    // For the existing picker - filtered by search
    const filteredLocations = useMemo(() =>
        allLocations.filter(l =>
            l.name.toLowerCase().includes(locationSearch.toLowerCase())
        ),
        [allLocations, locationSearch]
    );

    const selectedExistingEntity = useMemo(() =>
        allLocations.find(l => l.id === selectedExistingId) as (WorldEntity & { coordinates?: { x: number; y: number } }) | undefined,
        [allLocations, selectedExistingId]
    );

    // Does the chosen existing location already have coordinates?
    const existingHasCoords = Boolean((selectedExistingEntity as any)?.coordinates);

    const handleConfirmAnchor = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!pendingMarkerPos) return;

        if (anchorMode === 'existing') {
            if (!selectedExistingId) return;
            // If existing location already has coords and user hasn't confirmed replace yet
            if (existingHasCoords && !replaceConfirm) {
                setReplaceConfirm(true);
                return;
            }
            // Apply coordinates to the existing location entity
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
            // New location mode
            const name = markerNameInput.trim();
            if (!name) return;

            // Check for duplicate name (case-insensitive) across all entities
            const nameLower = name.toLowerCase();
            const duplicate = world.entities.find(ent =>
                ent.name.trim().toLowerCase() === nameLower
            );
            if (duplicate) {
                setDuplicateError(
                    duplicate.type === 'location'
                        ? `A Location named "${duplicate.name}" already exists. Select it from the "Pin Existing Location" tab instead.`
                        : `An entry named "${name}" already exists (type: ${duplicate.type}). Please choose a different name.`
                );
                return;
            }

            // Route through store handleCreate for complete schema defaults
            const id = useWorldStore.getState().handleCreate('location', name, false);

            // Attach coordinates to the newly created location
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
            onNavigate(id);
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

    const accent = isRoyal ? 'text-[#70121e]' : isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const bgCard = isRoyal ? 'bg-[#f5ead0]' : isWikiMode ? 'bg-[#f5e6d3]' : 'bg-slate-900';
    const inputCls = isRoyal
        ? 'bg-[#fcf5e9] border-[#c8a96e]/50 text-[#2b1810] placeholder:text-[#a08a70] focus:ring-2 focus:ring-[#70121e] focus:border-[#70121e]'
        : isWikiMode
        ? 'bg-white border-[#d4c8af] text-[#2b1810] placeholder:text-[#b0a090] focus:ring-2 focus:ring-[#b91c1c] focus:border-[#b91c1c]'
        : 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#fef08a]';

    return (
        <div className="w-full h-full flex flex-col animate-in fade-in duration-1000 p-12 space-y-8 relative">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className={`text-8xl font-serif font-black uppercase tracking-tighter ${isRoyal ? 'text-[#3d0a10]' : isWikiMode ? 'text-[#b91c1c]' : 'text-white'}`}>{world.name} Atlas</h2>
                    <p className="opacity-40 text-xs tracking-[0.4em] uppercase ml-2 italic">Strategic Overlays &amp; Ley-Line Cartography</p>
                </div>
                
                <div className={`flex p-2 rounded-3xl border ${isRoyal ? 'bg-[#f5ead0] border-[#c8a96e]/40' : isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-900 border-slate-800'} shadow-xl`}>
                    <button 
                        onClick={() => { setEditMode('marker'); setLinkSource(null); }}
                        className={`px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase transition-all ${editMode === 'marker' ? (isRoyal ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e] shadow-md' : isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-[#fef08a] text-black shadow-lg shadow-yellow-500/20') : 'hover:bg-white/5 opacity-70'}`}>
                        <Globe size={14} /> Anchors
                    </button>
                    <button 
                        onClick={() => setEditMode('link')}
                        className={`px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase transition-all ${editMode === 'link' ? (isRoyal ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e] shadow-md' : isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-blue-500 text-white shadow-lg shadow-blue-500/20') : 'hover:bg-white/5 opacity-70'}`}>
                        <Link2 size={14} /> {linkSource ? 'Select Target Pin...' : 'Ley-Lines'}
                    </button>
                </div>
            </div>

            <div 
                className={`flex-1 ${bgCard} rounded-[5rem] border-[16px] ${isRoyal ? 'border-[#c8a96e]/40' : isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/40'} shadow-2xl relative overflow-hidden group ${editMode === 'marker' ? 'cursor-crosshair' : 'cursor-default'}`} 
                onClick={handleMapClick}
            >
                <img src={world.mapImage} className={`w-full h-full object-cover opacity-50 ${isWikiMode ? 'sepia-[.8]' : 'sepia-[.4]'} transition-transform duration-[120s] group-hover:scale-110`} alt="World Map" />
                
                {/* SVG Layer for Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {(world.mapConnections || []).map(conn => {
                        const s = world.entities.find(e => e.id === conn.sourceId);
                        const t = world.entities.find(e => e.id === conn.targetId);
                        if (!s?.coordinates || !t?.coordinates) return null;

                        const colors: Record<string, string> = { trade: '#fbbf24', magic: '#818cf8', diplomatic: '#4ade80', war: '#f87171' };
                        const color = colors[conn.type] || '#fff';

                        return (
                            <g key={conn.id} className="pointer-events-auto cursor-pointer group" onClick={(e) => deleteConnection(conn.id, e)}>
                                <line 
                                    x1={`${s.coordinates.x}%`} y1={`${s.coordinates.y}%`}
                                    x2={`${t.coordinates.x}%`} y2={`${t.coordinates.y}%`}
                                    stroke={color} strokeWidth="2.5" strokeDasharray={conn.type === 'trade' ? "6,6" : "none"}
                                    className={`${conn.type === 'magic' ? 'animate-pulse' : ''} opacity-60 group-hover:opacity-100 transition-opacity`}
                                    filter="url(#glow)"
                                />
                                <circle cx={`${(s.coordinates.x + t.coordinates.x) / 2}%`} cy={`${(s.coordinates.y + t.coordinates.y) / 2}%`} r="14" fill="#0f172a" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                <foreignObject x={`${(s.coordinates.x + t.coordinates.x) / 2}%`} y={`${(s.coordinates.y + t.coordinates.y) / 2}%`} width="24" height="24" className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-3 -translate-y-3">
                                    <Trash2 size={16} className="text-red-400 hover:text-red-300 transition-colors" />
                                </foreignObject>
                            </g>
                        );
                    })}
                </svg>

                {/* Markers Layer */}
                {world.entities.filter((ent: any) => ent.coordinates).map((loc: any) => (
                    <div key={loc.id} style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 group/marker z-10 transition-all ${linkSource === loc.id ? 'scale-150 brightness-150 animate-bounce' : ''}`}
                        onClick={(e) => handleMarkerClick(loc.id, e)}>
                        <div className="relative cursor-pointer">
                            <MapPin className={`${linkSource === loc.id ? 'text-blue-400' : accent} drop-shadow-lg group-hover/marker:scale-150 transition-transform duration-300`} size={32} strokeWidth={2.5} fill={isRoyal ? "#70121e22" : isWikiMode ? "#b91c1c22" : "#fef08a44"} />
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 p-1 opacity-0 group-hover/marker:opacity-100 transition-all ${isRoyal ? 'bg-[#f5ead0] border-[#c8a96e]' : isWikiMode ? 'bg-[#fdfcf0] border-[#b91c1c]' : 'bg-slate-950 border-[#fef08a]'} border-2 px-5 py-2 rounded-2xl whitespace-nowrap shadow-2xl pointer-events-none`}>
                                <span className={`text-sm font-black ${isRoyal ? 'text-[#3d0a10]' : isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]'} uppercase tracking-widest`}>{loc.name}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== Modal: Plant / Assign Anchor ===== */}
            {pendingMarkerPos && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <form
                        onSubmit={handleConfirmAnchor}
                        className={`w-full max-w-lg p-8 rounded-3xl border shadow-2xl space-y-6 ${isRoyal ? 'bg-[#f5ead0] border-[#c8a96e]/50 text-[#2b1810]' : isWikiMode ? 'bg-[#fbf6ea] border-[#d4c8af] text-[#2b1810]' : 'bg-slate-900 border-[#c8a96e]/50 text-slate-100'}`}
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
                        <div className={`flex rounded-2xl p-1 border ${isRoyal ? 'bg-[#e8dbbf] border-[#c8a96e]/40' : isWikiMode ? 'bg-[#f0e8d8] border-[#d4c8af]' : 'bg-black/30 border-slate-700/50'}`}>
                            <button
                                type="button"
                                onClick={() => { setAnchorMode('existing'); setDuplicateError(''); setReplaceConfirm(false); }}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                                    anchorMode === 'existing'
                                        ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] shadow-sm' : isWikiMode ? 'bg-[#b91c1c] text-white shadow' : 'bg-[#fef08a] text-black shadow-lg'
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
                                        ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] shadow-sm' : isWikiMode ? 'bg-[#b91c1c] text-white shadow' : 'bg-[#fef08a] text-black shadow-lg'
                                        : 'opacity-50 hover:opacity-80'
                                }`}
                            >
                                <Plus size={13} /> Create New Location
                            </button>
                        </div>

                        {/* ---- Existing Location mode ---- */}
                        {anchorMode === 'existing' && (
                            <div className="space-y-3">
                                {allLocations.length === 0 ? (
                                    <div className="text-center py-6 opacity-50 text-sm italic">
                                        No locations exist yet. Switch to "Create New" to add one.
                                    </div>
                                ) : (
                                    <>
                                        {/* Search filter */}
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

                                        {/* Scrollable list */}
                                        <div className={`max-h-52 overflow-y-auto rounded-xl border divide-y ${isWikiMode ? 'border-[#d4c8af] divide-[#d4c8af]' : 'border-slate-700 divide-slate-700/60'}`}>
                                            {filteredLocations.length === 0 ? (
                                                <div className="p-4 text-center text-xs opacity-40 italic">No matches found</div>
                                            ) : filteredLocations.map(loc => {
                                                const hasCoords = Boolean((loc as any).coordinates);
                                                const isSelected = selectedExistingId === loc.id;
                                                return (
                                                    <button
                                                        key={loc.id}
                                                        type="button"
                                                        onClick={() => { setSelectedExistingId(loc.id); setReplaceConfirm(false); }}
                                                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all text-xs ${
                                                            isSelected
                                                                ? isWikiMode ? 'bg-[#b91c1c]/10' : 'bg-yellow-400/10'
                                                                : isWikiMode ? 'hover:bg-[#b91c1c]/5' : 'hover:bg-white/5'
                                                        }`}
                                                    >
                                                        <span className={`font-bold ${isSelected ? (isWikiMode ? 'text-[#b91c1c]' : 'text-yellow-300') : ''}`}>
                                                            {loc.name}
                                                        </span>
                                                        <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                            hasCoords
                                                                ? 'bg-amber-500/20 text-amber-400'
                                                                : isWikiMode ? 'bg-slate-200 text-slate-500' : 'bg-slate-700 text-slate-400'
                                                        }`}>
                                                            {hasCoords ? 'Anchored' : 'Unanchored'}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Replace warning */}
                                        {selectedExistingId && existingHasCoords && (
                                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                                                <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                                                <div className="text-xs leading-relaxed">
                                                    <p className="font-bold text-amber-300">
                                                        {replaceConfirm
                                                            ? 'Confirmed. Click "Plant Anchor" to relocate.'
                                                            : `"${selectedExistingEntity?.name}" is already anchored at (${(selectedExistingEntity as any)?.coordinates?.x}%, ${(selectedExistingEntity as any)?.coordinates?.y}%).`
                                                        }
                                                    </p>
                                                    {!replaceConfirm && (
                                                        <p className="opacity-75">Are you sure you want to replace its map position?</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {selectedExistingId && !existingHasCoords && (
                                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
                                                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                                <p className="text-xs text-emerald-300">
                                                    Ready to anchor <strong>{selectedExistingEntity?.name}</strong> at this position.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* ---- New Location mode ---- */}
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

                                {/* Duplicate error (submitted) */}
                                {duplicateError && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2">
                                        <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-300 leading-relaxed">{duplicateError}</p>
                                    </div>
                                )}

                                {/* Live duplicate hint while typing */}
                                {!duplicateError && markerNameInput.trim() && (() => {
                                    const nameLower = markerNameInput.trim().toLowerCase();
                                    const dupe = world.entities.find(e => e.name.trim().toLowerCase() === nameLower);
                                    if (!dupe) return null;
                                    return (
                                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
                                            <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-300 leading-relaxed">
                                                An entry named <strong>"{dupe.name}"</strong> already exists ({dupe.type}). Submitting will be blocked - use "Pin Existing Location" instead.
                                            </p>
                                        </div>
                                    );
                                })()}
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
                                        : isWikiMode
                                        ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b] disabled:opacity-40'
                                        : 'bg-[#fef08a] text-black hover:bg-yellow-400 disabled:opacity-40 shadow-lg shadow-yellow-500/20'
                                }`}
                            >
                                {anchorMode === 'existing' && existingHasCoords && !replaceConfirm
                                    ? 'Confirm Replace'
                                    : 'Plant Anchor'
                                }
                            </button>
                        </div>
                    </form>
                </div>,
                document.body
            )}

            {/* ===== Modal: New Ley-Line Connection ===== */}
            {pendingConnection && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className={`w-full max-w-lg p-8 rounded-3xl border shadow-2xl space-y-6 ${isRoyal ? 'bg-[#f5ead0] border-[#c8a96e]/50 text-[#2b1810]' : isWikiMode ? 'bg-[#fbf6ea] border-[#d4c8af] text-[#2b1810]' : 'bg-slate-900 border-[#c8a96e]/50 text-slate-100'}`}>
                        <div className="flex items-center justify-between border-b pb-4 border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <Link2 size={22} className={accent} />
                                <div>
                                    <h3 className="text-lg font-serif font-black uppercase tracking-tight">Forge Ley-Line Passage</h3>
                                    <p className="text-[10px] opacity-60 font-mono tracking-widest">
                                        {sourceEntity?.name || 'Origin'} âž” {targetEntity?.name || 'Destination'}
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
                                        onClick={() => setSelectedConnectionType(option.id as any)}
                                        className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                                            selectedConnectionType === option.id
                                                ? isRoyal
                                                    ? 'bg-[#70121e]/15 border-[#70121e] ring-1 ring-[#70121e]'
                                                    : isWikiMode 
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
                                        : isWikiMode 
                                        ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]' 
                                        : 'bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/20'
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
