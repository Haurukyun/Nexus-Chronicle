import React from 'react';
import { MapPin } from 'lucide-react';
import { WorldData, WorldEntity } from '../types';

interface WorldMapProps {
    world: WorldData;
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
}

export const WorldMap = ({ world, setWorld, onNavigate, isWikiMode }: WorldMapProps) => {
    const addMarker = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const name = prompt("Location Anchor Name:");
        if (name) {
            const id = crypto.randomUUID();
            const newLoc: WorldEntity = { 
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
    const accent = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    return (
        <div className="w-full h-full flex flex-col animate-in fade-in duration-1000 p-12">
            <div className="mb-14">
                <h2 className={`text-8xl font-serif font-black uppercase tracking-tighter ${isWikiMode ? 'text-[#b91c1c]' : 'text-white'}`}>{world.name} Atlas</h2>
            </div>
            <div className={`flex-1 ${isWikiMode ? 'bg-[#f5e6d3]' : 'bg-slate-900'} rounded-[5rem] border-[16px] ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/40'} shadow-2xl relative overflow-hidden group cursor-crosshair`} onClick={addMarker}>
                <img src={world.mapImage} className={`w-full h-full object-cover opacity-50 ${isWikiMode ? 'sepia-[.8]' : 'sepia-[.4]'} transition-transform duration-[120s] group-hover:scale-110`} alt="World Map" />
                {world.entities.filter((ent: any) => ent.coordinates).map((loc: any) => (
                    <div key={loc.id} style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group/marker z-10"
                        onClick={(e) => { e.stopPropagation(); onNavigate(loc.id); }}>
                        <div className="relative">
                            <MapPin className={`${accent} drop-shadow-lg group-hover/marker:scale-150 transition-transform duration-300`} size={32} strokeWidth={2.5} fill={isWikiMode ? "#b91c1c22" : "#fef08a44"} />
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover/marker:opacity-100 transition-all ${isWikiMode ? 'bg-[#fdfcf0] border-[#b91c1c]' : 'bg-slate-950 border-[#fef08a]'} border-2 px-5 py-2 rounded-2xl whitespace-nowrap shadow-2xl`}>
                                <span className={`text-sm font-black ${isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]'} uppercase tracking-widest`}>{loc.name}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
