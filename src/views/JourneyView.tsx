import React, { useState, useMemo } from 'react';
import { Compass, Wind, MapPin, Footprints, Clock, Scale } from 'lucide-react';
import { WorldData, WorldEntity } from '../types';

interface JourneyViewProps {
    world: WorldData;
    isWikiMode: boolean;
    onNavigate: (id: string) => void;
}

export const JourneyView: React.FC<JourneyViewProps> = ({ world, isWikiMode, onNavigate }) => {
    const [startId, setStartId] = useState<string>('');
    const [endId, setEndId] = useState<string>('');
    const [travelMethod, setTravelMethod] = useState<'foot' | 'horse' | 'magic'>('foot');

    const locations = useMemo(() => world.entities.filter(e => e.type === 'location'), [world.entities]);

    const calculation = useMemo(() => {
        const s = locations.find(l => l.id === startId);
        const e = locations.find(l => l.id === endId);
        if (!s?.coordinates || !e?.coordinates) return null;

        // Euclidean distance in "Map Units"
        const dx = e.coordinates.x - s.coordinates.x;
        const dy = e.coordinates.y - s.coordinates.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Conversions
        const unitsToLeagues = 10;
        const leagues = dist * unitsToLeagues;
        
        const speeds = { foot: 20, horse: 60, magic: 200 }; // Leagues per day
        const days = leagues / speeds[travelMethod];

        return { leagues: Math.round(leagues), days: days.toFixed(1) };
    }, [startId, endId, travelMethod, locations]);

    const accent = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const bgCard = isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-900/40 border-slate-800/60';

    return (
        <div className="p-12 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
             <header className="space-y-2">
                <h1 className={`text-7xl font-serif font-black uppercase tracking-tighter ${isWikiMode ? 'text-[#b91c1c]' : 'text-white'}`}>The Grand Voyager</h1>
                <p className="opacity-50 text-sm tracking-[0.3em] uppercase ml-2 italic">Travel Logistics & Transdimensional Distance</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className={`p-10 rounded-[4rem] border ${bgCard} shadow-2xl space-y-8`}>
                    <h3 className="text-xl font-serif font-bold flex items-center gap-3 uppercase tracking-widest"><Compass size={20} className={accent} /> Journey Configuration</h3>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40 ml-2">Starting Anchor</label>
                            <select 
                                value={startId} 
                                onChange={(e) => setStartId(e.target.value)}
                                className={`w-full p-4 rounded-2xl border ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-black/20 border-slate-800'} text-xs outline-none focus:ring-1 focus:ring-yellow-500/50`}>
                                <option value="">Select Location...</option>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40 ml-2">Destination</label>
                            <select 
                                value={endId} 
                                onChange={(e) => setEndId(e.target.value)}
                                className={`w-full p-4 rounded-2xl border ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-black/20 border-slate-800'} text-xs outline-none focus:ring-1 focus:ring-yellow-500/50`}>
                                <option value="">Select Location...</option>
                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase opacity-40 ml-2">Method of Transit</label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['foot', 'horse', 'magic'] as const).map(m => (
                                    <button 
                                        key={m}
                                        onClick={() => setTravelMethod(m)}
                                        className={`p-4 rounded-2xl border text-[10px] font-black uppercase flex flex-col items-center gap-2 transition-all ${travelMethod === m ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-[#fef08a] text-black shadow-lg shadow-yellow-500/20') : 'hover:bg-white/5 opacity-60'}`}>
                                        {m === 'foot' && <Footprints size={16} />}
                                        {m === 'horse' && <Wind size={16} />}
                                        {m === 'magic' && <Scale size={16} />}
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`p-10 rounded-[4rem] border ${bgCard} shadow-2xl relative overflow-hidden flex flex-col justify-center text-center space-y-8`}>
                    {calculation ? (
                        <div className="space-y-6 animate-in zoom-in duration-500">
                            <div className="space-y-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${accent}`}>Estimated Scale</span>
                                <div className="text-6xl font-serif font-black">{calculation.leagues} <span className="text-xl">Leagues</span></div>
                            </div>
                            <div className="w-12 h-1 bg-yellow-500/20 mx-auto rounded-full" />
                            <div className="space-y-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${accent}`}>Arrival Forecast</span>
                                <div className="text-6xl font-serif font-black">{calculation.days} <span className="text-xl">Days</span></div>
                            </div>
                        </div>
                    ) : (
                        <div className="opacity-20 flex flex-col items-center gap-4">
                            <MapPin size={80} />
                            <p className="font-serif italic">Define your path to calculate the threads of fate.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className={`p-12 rounded-[4rem] border ${bgCard} shadow-2xl relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Clock size={200} />
                </div>
                <div className="relative z-10 space-y-6">
                    <h3 className="text-2xl font-serif font-bold uppercase tracking-[0.2em]">Voyager's Almanac</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm italic opacity-60 leading-relaxed max-w-3xl">
                        <p>"Travel speed is determined by world units. Consider local hazards—mountains may double travel time, while sea-routes require specialized resource records."</p>
                        <p>"Distances are calculated as the raven flies. Actual mountain paths may result in 1.4x distance multiplier."</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
