import React, { useMemo } from 'react';
import { BarChart3, Users, Map, Clock, PieChart, Activity, Fingerprint } from 'lucide-react';
import { WorldData, WorldEntity } from '../types';
import { TYPE_LABELS } from '../constants';
import { useWorldStore } from '../store/useWorldStore';

interface DashboardViewProps {
    world: WorldData;
    isWikiMode: boolean;
    onNavigate: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ world, isWikiMode, onNavigate }) => {
    const setWorldPhase = useWorldStore(state => (state as any).setWorldPhase);
    const stats = useMemo(() => {
        const counts: Record<string, number> = {};
        world.entities.forEach(e => {
            counts[e.type] = (counts[e.type] || 0) + 1;
        });

        const topInterconnected = [...world.entities].sort((a, b) => {
            const getConnCount = (e: WorldEntity) => 
                (e.parentIds?.length || 0) + 
                (e.childrenIds?.length || 0) + 
                (e.friendIds?.length || 0) + 
                (e.enemyIds?.length || 0);
            return getConnCount(b) - getConnCount(a);
        }).slice(0, 5);

        return { counts, topInterconnected };
    }, [world.entities]);

    const insights = useMemo(() => {
        const entCount = world.entities.length;
        if (entCount < 2) return ["Your chronicle is just beginning. Plant more seeds of lore to see the patterns emerge."];
        
        const randomEnt1 = world.entities[Math.floor(Math.random() * entCount)];
        const randomEnt2 = world.entities[Math.floor(Math.random() * entCount)];
        const locations = world.entities.filter(e => e.type === 'location');
        const randomLoc = locations.length > 0 ? locations[Math.floor(Math.random() * locations.length)] : null;

        return [
            `Balance Report: Your world is ${Math.round((stats.counts.character || 0) / (entCount || 1) * 100)}% populated by characters. ${stats.counts.location ? 'The geography is expanding steadily.' : 'Perhaps it needs more physical anchors (Locations)?'}`,
            `Creative Spark: How does ${randomEnt1.name} feel about the presence of ${randomEnt2.name}${randomLoc ? ` at ${randomLoc.name}` : ''}?`,
            `Continuity Check: ${stats.topInterconnected[0]?.name || 'Your primary figure'} currently holds the most threads. If they were to disappear, who would inherit their influence?`,
            `The Void: ${world.trash.length} memories have been cast into the Forgotten Depth. Is there a secret link between one of them and ${randomEnt1.name}?`
        ];
    }, [world.entities, world.trash, stats]);

    const colors = isWikiMode 
        ? ['#b91c1c', '#7a200d', '#1e40af', '#166534', '#854d0e'] 
        : ['#fef08a', '#fbbf24', '#38bdf8', '#4ade80', '#fb7185'];

    const accent = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const bgCard = isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-900/40 border-slate-800/60';

    const renderPieChart = () => {
        let offset = 0;
        const elements: JSX.Element[] = [];
        const entries = Object.entries(stats.counts);
        
        entries.forEach(([type, count], i) => {
            const percentage = (count / (world.entities.length || 1)) * 100;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            const strokeDashoffset = 0 - offset;
            
            elements.push(
                <circle
                    key={type}
                    cx="18" cy="18" r="16"
                    fill="none"
                    stroke={colors[i % colors.length]}
                    strokeWidth="3.8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000"
                />
            );
            offset += percentage;
        });
        
        return elements;
    };

    return (
        <div className="p-12 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="space-y-2">
                <h1 className={`text-7xl font-serif font-black uppercase tracking-tighter ${isWikiMode ? 'text-[#b91c1c]' : 'text-white'}`}>The Architect's Ledger</h1>
                <p className="opacity-50 text-sm tracking-[0.3em] uppercase ml-2 italic">World Analytics & Historical Balance</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard icon={Users} label="Living Souls" value={stats.counts.character || 0} accent={accent} bg={bgCard} />
                <StatCard icon={Map} label="Anchors & Atlas" value={stats.counts.location || 0} accent={accent} bg={bgCard} />
                <StatCard icon={Clock} label="Threads of Fate" value={stats.counts.event || 0} accent={accent} bg={bgCard} />
                <StatCard icon={Fingerprint} label="Total Records" value={world.entities.length} accent={accent} bg={bgCard} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className={`p-8 rounded-[3rem] border ${bgCard} shadow-2xl space-y-8`}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-serif font-bold flex items-center gap-3 uppercase tracking-widest"><PieChart size={20} className={accent} /> World Composition</h3>
                    </div>
                    
                    <div className="flex items-center gap-12">
                        <div className="relative w-48 h-48">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                                {renderPieChart()}
                            </svg>
                        </div>
                        <div className="flex-1 space-y-3">
                            {Object.entries(stats.counts).slice(0, 5).map(([type, count], i) => (
                                <div key={type} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{TYPE_LABELS[type as any] || type}</span>
                                    </div>
                                    <span className="text-xs font-mono font-bold">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={`p-8 rounded-[3rem] border ${bgCard} shadow-2xl space-y-8`}>
                    <h3 className="text-xl font-serif font-bold flex items-center gap-3 uppercase tracking-widest"><Activity size={20} className={accent} /> Nexus Focus</h3>
                    <div className="space-y-4">
                        {stats.topInterconnected.length > 0 ? stats.topInterconnected.map((e, i) => (
                            <div key={e.id} 
                                onClick={() => onNavigate(e.id)}
                                className={`flex items-center justify-between p-4 rounded-3xl border ${isWikiMode ? 'bg-[#fdfcf0]/50 border-black/5' : 'bg-white/5 border-white/5'} hover:border-yellow-500/50 cursor-pointer transition-all hover:scale-[1.02]`}>
                                <div className="flex items-center gap-4">
                                    <span className="text-xl font-serif font-black opacity-20 italic">#{i+1}</span>
                                    <span className="text-xs font-black uppercase tracking-widest">{e.name}</span>
                                </div>
                                <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${isWikiMode ? 'bg-[#b91c1c]/10 text-[#b91c1c]' : 'bg-[#fef08a]/10 text-[#fef08a]'}`}>
                                    {(e.parentIds?.length || 0) + (e.childrenIds?.length || 0) + (e.friendIds?.length || 0) + (e.enemyIds?.length || 0)} Ties
                                </div>
                            </div>
                        )) : <p className="text-xs italic opacity-40">No connections established yet.</p>}
                    </div>
                </div>
            </div>

            <div className={`p-12 rounded-[4rem] border ${bgCard} shadow-2xl relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <BarChart3 size={200} />
                </div>
                <div className="relative z-10 space-y-6">
                    <h3 className="text-2xl font-serif font-bold uppercase tracking-[0.2em]">The Ledger's Insight</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm italic opacity-60 leading-relaxed max-w-3xl">
                        {insights.map((insight, i) => <p key={i}>"{insight}"</p>)}
                    </div>
                </div>
            </div>

            <div className={`p-10 rounded-[3rem] border ${bgCard} shadow-2xl space-y-8`}>
                <div className="flex items-end justify-between">
                    <div>
                        <h3 className="text-xl font-serif font-bold flex items-center gap-3 uppercase tracking-widest leading-none">Aura of the Soul</h3>
                        <p className="opacity-40 text-[9px] uppercase tracking-widest mt-2 ml-1">Current World Phase: {world.worldPhase || 'Sovereign'}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {['creation', 'golden', 'shadow', 'eclipse', 'ruin'].map((phase: any) => (
                        <button 
                            key={phase}
                            onClick={() => setWorldPhase(phase)}
                            className={`p-5 rounded-3xl border transition-all text-left space-y-2 group ${world.worldPhase === phase ? (isWikiMode ? 'bg-[#b91c1c] text-white border-[#b91c1c]' : 'bg-[#fef08a] text-black border-[#fef08a]') : 'hover:bg-white/5 opacity-60'}`}
                        >
                            <span className="block text-[10px] font-black uppercase tracking-tighter">{phase}</span>
                            <span className="block text-[8px] opacity-60 group-hover:opacity-100 italic">
                                {phase === 'creation' && 'The First Spark'}
                                {phase === 'golden' && 'Radiant Peace'}
                                {phase === 'shadow' && 'Whispers in Dark'}
                                {phase === 'eclipse' && 'Cosmic Paradox'}
                                {phase === 'ruin' && 'Final Echoes'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, accent, bg }: any) => (
    <div className={`p-6 rounded-[2.5rem] border ${bg} flex flex-col items-center justify-center text-center space-y-3 transition-transform hover:scale-105`}>
        <div className={`p-3 rounded-2xl ${accent.replace('text', 'bg')}/10`}>
            <Icon size={20} className={accent} />
        </div>
        <div>
            <div className="text-3xl font-serif font-black">{value}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{label}</div>
        </div>
    </div>
);
