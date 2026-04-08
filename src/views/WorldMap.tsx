import React, { useState, useMemo } from 'react';
import { MapPin, Globe, Link2, Trash2 } from 'lucide-react';
import { WorldData, WorldEntity, MapConnection } from '../types';

interface WorldMapProps {
    world: WorldData;
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
}

export const WorldMap = ({ world, setWorld, onNavigate, isWikiMode }: WorldMapProps) => {
    const [editMode, setEditMode] = useState<'marker' | 'link'>('marker');
    const [linkSource, setLinkSource] = useState<string | null>(null);

    const addMarker = (e: React.MouseEvent<HTMLDivElement>) => {
        if (editMode !== 'marker') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const name = prompt("Location Anchor Name:");
        if (name) {
            const id = crypto.randomUUID();
            const newLoc: any = { 
                id, name, type: 'location', description: "", 
                coordinates: { x, y }, lastModified: Date.now(), tags: [],
                parentIds: [], childrenIds: [], relativeIds: [], friendIds: [], 
                enemyIds: [], complicatedWithIds: [], loreNoteIds: [], mythIds: [], 
                eventIds: [], locationIds: [], cultureIds: [],
                groupConnections: {
                    political: { leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] },
                    organization: { leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] },
                    religious: { leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] },
                    magic: { leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] },
                    science: { leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] },
                },
                detailSkillIds: [], detailItemIds: [], detailConditionIds: [], detailResourceIds: []
            };
            setWorld((p) => ({ ...p, entities: [...p.entities, newLoc] }));
        }
    };

    const handleMarkerClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (editMode === 'link') {
            if (!linkSource) {
                setLinkSource(id);
            } else if (linkSource !== id) {
                const type = prompt("Connection Type (trade, magic, diplomatic, war):", "trade") as any;
                const newConn: MapConnection = {
                    id: crypto.randomUUID(),
                    sourceId: linkSource,
                    targetId: id,
                    type: ['trade', 'magic', 'diplomatic', 'war'].includes(type) ? type : 'trade'
                };
                setWorld(prev => ({
                    ...prev,
                    mapConnections: [...(prev.mapConnections || []), newConn]
                }));
                setLinkSource(null);
            } else {
                setLinkSource(null);
            }
        } else {
            onNavigate(id);
        }
    };

    const deleteConnection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setWorld(prev => ({
            ...prev,
            mapConnections: (prev.mapConnections || []).filter(c => c.id !== id)
        }));
    };

    const accent = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const bgCard = isWikiMode ? 'bg-[#f5e6d3]' : 'bg-slate-900';

    return (
        <div className="w-full h-full flex flex-col animate-in fade-in duration-1000 p-12 space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className={`text-8xl font-serif font-black uppercase tracking-tighter ${isWikiMode ? 'text-[#b91c1c]' : 'text-white'}`}>{world.name} Atlas</h2>
                    <p className="opacity-40 text-xs tracking-[0.4em] uppercase ml-2 italic">Strategic Overlays & Ley-Line Cartography</p>
                </div>
                
                <div className={`flex p-2 rounded-3xl border ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-900 border-slate-800'} shadow-xl`}>
                    <button 
                        onClick={() => { setEditMode('marker'); setLinkSource(null); }}
                        className={`px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase transition-all ${editMode === 'marker' ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-[#fef08a] text-black') : 'hover:bg-white/5'}`}>
                        <Globe size={14} /> Anchors
                    </button>
                    <button 
                        onClick={() => setEditMode('link')}
                        className={`px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase transition-all ${editMode === 'link' ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-blue-500 text-white shadow-lg shadow-blue-500/20') : 'hover:bg-white/5'}`}>
                        <Link2 size={14} /> {linkSource ? 'Select Target...' : 'Ley-Lines'}
                    </button>
                </div>
            </div>

            <div className={`flex-1 ${bgCard} rounded-[5rem] border-[16px] ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/40'} shadow-2xl relative overflow-hidden group cursor-crosshair`} onClick={addMarker}>
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

                        const colors: any = { trade: '#fbbf24', magic: '#818cf8', diplomatic: '#4ade80', war: '#f87171' };
                        const color = colors[conn.type] || '#fff';

                        return (
                            <g key={conn.id} className="pointer-events-auto cursor-pointer group" onClick={(e) => deleteConnection(conn.id, e)}>
                                <line 
                                    x1={`${s.coordinates.x}%`} y1={`${s.coordinates.y}%`}
                                    x2={`${t.coordinates.x}%`} y2={`${t.coordinates.y}%`}
                                    stroke={color} strokeWidth="2" strokeDasharray={conn.type === 'trade' ? "5,5" : "none"}
                                    className={`${conn.type === 'magic' ? 'animate-pulse' : ''} opacity-40 group-hover:opacity-100 transition-opacity`}
                                    filter="url(#glow)"
                                />
                                <circle cx={`${(s.coordinates.x + t.coordinates.x) / 2}%`} cy={`${(s.coordinates.y + t.coordinates.y) / 2}%`} r="12" fill={bgCard.split(' ')[1]} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                <foreignObject x={`${(s.coordinates.x + t.coordinates.x) / 2}%`} y={`${(s.coordinates.y + t.coordinates.y) / 2}%`} width="24" height="24" className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-3 -translate-y-3">
                                    <Trash2 size={16} className="text-red-500" />
                                </foreignObject>
                            </g>
                        );
                    })}
                </svg>

                {/* Markers Layer */}
                {world.entities.filter((ent: any) => ent.coordinates).map((loc: any) => (
                    <div key={loc.id} style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 group/marker z-10 transition-all ${linkSource === loc.id ? 'scale-150 brightness-150' : ''}`}
                        onClick={(e) => handleMarkerClick(loc.id, e)}>
                        <div className="relative">
                            <MapPin className={`${linkSource === loc.id ? 'text-blue-500' : accent} drop-shadow-lg group-hover/marker:scale-150 transition-transform duration-300`} size={32} strokeWidth={2.5} fill={isWikiMode ? "#b91c1c22" : "#fef08a44"} />
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 p-1 opacity-0 group-hover/marker:opacity-100 transition-all ${isWikiMode ? 'bg-[#fdfcf0] border-[#b91c1c]' : 'bg-slate-950 border-[#fef08a]'} border-2 px-5 py-2 rounded-2xl whitespace-nowrap shadow-2xl`}>
                                <span className={`text-sm font-black ${isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]'} uppercase tracking-widest`}>{loc.name}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
