import React, { useState, useMemo } from 'react';
import { MapPin, Globe, Link2, Trash2, X, Plus, Sparkles, Shield, Swords, Compass } from 'lucide-react';
import { WorldData, WorldEntity, MapConnection } from '../types';
import { useWorldStore } from '../store/useWorldStore';

interface WorldMapProps {
    world: WorldData;
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
}

export const WorldMap = ({ world, setWorld, onNavigate, isWikiMode }: WorldMapProps) => {
    const [editMode, setEditMode] = useState<'marker' | 'link'>('marker');
    const [linkSource, setLinkSource] = useState<string | null>(null);

    // Modal state for creating a new location marker
    const [pendingMarkerPos, setPendingMarkerPos] = useState<{ x: number; y: number } | null>(null);
    const [markerNameInput, setMarkerNameInput] = useState('');

    // Modal state for creating a new connection
    const [pendingConnection, setPendingConnection] = useState<{ sourceId: string; targetId: string } | null>(null);
    const [selectedConnectionType, setSelectedConnectionType] = useState<'trade' | 'magic' | 'diplomatic' | 'war'>('trade');

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (editMode !== 'marker') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPendingMarkerPos({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
        setMarkerNameInput('');
    };

    const handleConfirmNewMarker = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!pendingMarkerPos || !markerNameInput.trim()) return;

        const name = markerNameInput.trim();
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

    const accent = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const bgCard = isWikiMode ? 'bg-[#f5e6d3]' : 'bg-slate-900';

    return (
        <div className="w-full h-full flex flex-col animate-in fade-in duration-1000 p-12 space-y-8 relative">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className={`text-8xl font-serif font-black uppercase tracking-tighter ${isWikiMode ? 'text-[#b91c1c]' : 'text-white'}`}>{world.name} Atlas</h2>
                    <p className="opacity-40 text-xs tracking-[0.4em] uppercase ml-2 italic">Strategic Overlays & Ley-Line Cartography</p>
                </div>
                
                <div className={`flex p-2 rounded-3xl border ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-900 border-slate-800'} shadow-xl`}>
                    <button 
                        onClick={() => { setEditMode('marker'); setLinkSource(null); }}
                        className={`px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase transition-all ${editMode === 'marker' ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-[#fef08a] text-black shadow-lg shadow-yellow-500/20') : 'hover:bg-white/5 opacity-70'}`}>
                        <Globe size={14} /> Anchors
                    </button>
                    <button 
                        onClick={() => setEditMode('link')}
                        className={`px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase transition-all ${editMode === 'link' ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-blue-500 text-white shadow-lg shadow-blue-500/20') : 'hover:bg-white/5 opacity-70'}`}>
                        <Link2 size={14} /> {linkSource ? 'Select Target Pin...' : 'Ley-Lines'}
                    </button>
                </div>
            </div>

            <div 
                className={`flex-1 ${bgCard} rounded-[5rem] border-[16px] ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/40'} shadow-2xl relative overflow-hidden group ${editMode === 'marker' ? 'cursor-crosshair' : 'cursor-default'}`} 
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
                            <MapPin className={`${linkSource === loc.id ? 'text-blue-400' : accent} drop-shadow-lg group-hover/marker:scale-150 transition-transform duration-300`} size={32} strokeWidth={2.5} fill={isWikiMode ? "#b91c1c22" : "#fef08a44"} />
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 p-1 opacity-0 group-hover/marker:opacity-100 transition-all ${isWikiMode ? 'bg-[#fdfcf0] border-[#b91c1c]' : 'bg-slate-950 border-[#fef08a]'} border-2 px-5 py-2 rounded-2xl whitespace-nowrap shadow-2xl pointer-events-none`}>
                                <span className={`text-sm font-black ${isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]'} uppercase tracking-widest`}>{loc.name}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal: New Location Anchor */}
            {pendingMarkerPos && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <form 
                        onSubmit={handleConfirmNewMarker}
                        className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl space-y-6 ${isWikiMode ? 'bg-[#fbf6ea] border-[#d4c8af] text-[#2b1810]' : 'bg-slate-900 border-[#c8a96e]/50 text-slate-100'}`}
                    >
                        <div className="flex items-center justify-between border-b pb-4 border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <MapPin size={22} className={accent} />
                                <div>
                                    <h3 className="text-lg font-serif font-black uppercase tracking-tight">Plant Sanctuary Anchor</h3>
                                    <p className="text-[10px] opacity-60 font-mono tracking-widest">MAP COORDS: [{pendingMarkerPos.x}%, {pendingMarkerPos.y}%]</p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setPendingMarkerPos(null)} 
                                className="opacity-50 hover:opacity-100 transition-opacity"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block">Location Name</label>
                            <input 
                                autoFocus
                                type="text"
                                placeholder="e.g. Citadel of the Sun, Whispering Woods..."
                                value={markerNameInput}
                                onChange={(e) => setMarkerNameInput(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${isWikiMode ? 'bg-white border-[#d4c8af] focus:ring-2 focus:ring-[#b91c1c]' : 'bg-slate-800/80 border-slate-700 focus:border-[#fef08a] text-white'}`}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setPendingMarkerPos(null)}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase opacity-60 hover:opacity-100 transition-opacity"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!markerNameInput.trim()}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    isWikiMode 
                                        ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b] disabled:opacity-40' 
                                        : 'bg-[#fef08a] text-black hover:bg-yellow-400 disabled:opacity-40 shadow-lg shadow-yellow-500/20'
                                }`}
                            >
                                Plant Anchor
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal: New Ley-Line Connection */}
            {pendingConnection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className={`w-full max-w-lg p-8 rounded-3xl border shadow-2xl space-y-6 ${isWikiMode ? 'bg-[#fbf6ea] border-[#d4c8af] text-[#2b1810]' : 'bg-slate-900 border-[#c8a96e]/50 text-slate-100'}`}>
                        <div className="flex items-center justify-between border-b pb-4 border-slate-700/50">
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
                                        onClick={() => setSelectedConnectionType(option.id as any)}
                                        className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                                            selectedConnectionType === option.id
                                                ? isWikiMode 
                                                    ? 'bg-[#b91c1c]/10 border-[#b91c1c] ring-1 ring-[#b91c1c]'
                                                    : 'bg-slate-800 border-[#fef08a] ring-1 ring-[#fef08a]'
                                                : 'border-slate-700/60 hover:border-slate-500 opacity-60 hover:opacity-100'
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
                                    isWikiMode 
                                        ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]' 
                                        : 'bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/20'
                                }`}
                            >
                                Forge Passage
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
