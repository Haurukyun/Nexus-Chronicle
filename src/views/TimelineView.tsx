import React, { useMemo } from 'react';
import { Calendar, History, ArrowLeft, ArrowRight } from 'lucide-react';
import { WorldData, WorldEntity, Character, Event } from '../types';

interface TimelineViewProps {
    world: WorldData;
    isWikiMode: boolean;
    onNavigate: (id: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ world, isWikiMode, onNavigate }) => {
    const timelineData = useMemo(() => {
        const events: any[] = [];
        const extractYear = (dateStr: string | undefined) => {
            if (!dateStr) return null;
            const match = dateStr.match(/-?\d+/);
            return match ? parseInt(match[0]) : null;
        };

        let minYear = Infinity;
        let maxYear = -Infinity;

        world.entities.forEach(e => {
            if (e.type === 'character') {
                const char = e as Character;
                const birth = extractYear(char.dateOfBirth);
                const death = extractYear(char.dateOfDeath);
                if (birth !== null) {
                    events.push({ 
                        id: e.id, 
                        name: e.name, 
                        type: 'life', 
                        start: birth, 
                        end: death || birth + 50, // Default 50 years if no death
                        isDead: !!death
                    });
                    minYear = Math.min(minYear, birth);
                    maxYear = Math.max(maxYear, death || birth + 50);
                }
            } else if (e.type === 'event') {
                const evt = e as Event;
                const year = extractYear(evt.date);
                if (year !== null) {
                    events.push({ id: e.id, name: e.name, type: 'event', start: year, end: year });
                    minYear = Math.min(minYear, year);
                    maxYear = Math.max(maxYear, year);
                }
            }
        });

        if (minYear === Infinity) return { events: [], minYear: 0, maxYear: 100, range: 100 };
        
        // Add padding
        minYear -= 10;
        maxYear += 10;
        
        return { 
            events: events.sort((a, b) => a.start - b.start), 
            minYear, 
            maxYear, 
            range: maxYear - minYear || 100 
        };
    }, [world.entities]);

    const accent = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const trackColor = isWikiMode ? 'bg-[#d4c8af]' : 'bg-slate-800';

    return (
        <div className="p-12 h-full flex flex-col space-y-12">
            <header className="space-y-4">
                <h1 className={`text-7xl font-serif font-black uppercase tracking-tighter ${isWikiMode ? 'text-[#b91c1c]' : 'text-white'}`}>Chronos Timeline</h1>
                <p className="opacity-50 text-sm tracking-[0.3em] uppercase ml-2 italic">The Flow of Historical Paradoxes</p>
            </header>

            <div className="flex-1 relative overflow-auto custom-scrollbar p-12">
                <div className="min-w-[2000px] relative pt-20 pb-40">
                    {/* Time Axis */}
                    <div className={`absolute top-1/2 left-0 w-full h-1 ${trackColor} -translate-y-1/2 opacity-20`} />
                    
                    {/* Year Markers */}
                    {Array.from({ length: 11 }).map((_, i) => {
                        const year = Math.round(timelineData.minYear + (timelineData.range * (i / 10)));
                        const left = (i / 10) * 100;
                        return (
                            <div key={i} className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center" style={{ left: `${left}%` }}>
                                <div className={`w-px h-8 ${trackColor}`} />
                                <span className="text-[10px] font-mono mt-2 opacity-40">{year}</span>
                            </div>
                        );
                    })}

                    {/* Timeline Ribbons */}
                    <div className="space-y-8">
                        {timelineData.events.map((e, i) => {
                            const left = ((e.start - timelineData.minYear) / timelineData.range) * 100;
                            const width = (((e.end - e.start) || 1) / timelineData.range) * 100;
                            const row = i % 5; // Alternate rows to avoid overlap
                            
                            return (
                                <div key={e.id} 
                                    className="absolute transition-all hover:z-50 group"
                                    style={{ 
                                        left: `${left}%`, 
                                        width: e.type === 'event' ? '0' : `${Math.max(width, 0.5)}%`,
                                        top: `${20 + row * 15}%`
                                    }}
                                >
                                    {e.type === 'event' ? (
                                        <div onClick={() => onNavigate(e.id)} className="flex flex-col items-center -translate-x-1/2 cursor-pointer">
                                            <div className={`w-4 h-4 rounded-full border-2 ${isWikiMode ? 'bg-[#b91c1c] border-white' : 'bg-[#fef08a] border-black'} shadow-lg group-hover:scale-150 transition-transform`} />
                                            <div className={`mt-4 px-3 py-1 rounded-lg ${isWikiMode ? 'bg-white border-[#b91c1c]' : 'bg-slate-900 border-[#fef08a]'} border text-[9px] font-black uppercase tracking-widest whitespace-nowrap shadow-2xl`}>
                                                {e.name} ({e.start})
                                            </div>
                                        </div>
                                    ) : (
                                        <div onClick={() => onNavigate(e.id)} className="relative h-6 cursor-pointer">
                                            <div className={`absolute inset-0 rounded-full opacity-20 ${isWikiMode ? 'bg-[#b91c1c]' : 'bg-[#fef08a]'} group-hover:opacity-40 transition-opacity`} />
                                            <div className={`absolute inset-y-0 left-0 border-l-2 ${isWikiMode ? 'border-[#b91c1c]' : 'border-[#fef08a]'} h-full`} />
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-[8px] font-black uppercase tracking-[0.2em] group-hover:scale-105 transition-transform">
                                                {e.name} <span className="opacity-40">{e.start} - {e.isDead ? e.end : 'Present'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <footer className="flex justify-between items-center opacity-40 text-[10px] uppercase font-black tracking-widest px-4">
                <div className="flex items-center gap-2"><ArrowLeft size={12} /> Prehistoric Eras</div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${isWikiMode ? 'bg-[#b91c1c]' : 'bg-[#fef08a]'}`} /> Events</div>
                    <div className="flex items-center gap-2"><div className={`w-8 h-2 rounded-full opacity-30 ${isWikiMode ? 'bg-[#b91c1c]' : 'bg-[#fef08a]'}`} /> Lifespans</div>
                </div>
                <div className="flex items-center gap-2">Future Horizons <ArrowRight size={12} /></div>
            </footer>
        </div>
    );
};
