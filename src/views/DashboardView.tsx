import React, { useMemo } from 'react';
import { BarChart3, Users, Map, Clock, PieChart, Activity, Fingerprint } from 'lucide-react';
import { WorldData, WorldEntity } from '../types';
import { TYPE_LABELS } from '../constants';
import { useTheme } from '../theme';

interface DashboardViewProps {
    world: WorldData;
    onNavigate: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ world, onNavigate }) => {
    const { isWikiMode, isRoyal } = useTheme();
    const stats = useMemo(() => {
        const counts: Record<string, number> = {};
        world.entities.forEach(e => {
            counts[e.type] = (counts[e.type] || 0) + 1;
        });

        const topInterconnected = [...world.entities].sort((a, b) => {
            const getConnCount = (e: any) => 
                (e.parentIds?.length || 0) + 
                (e.parentsOfCharacter?.length || 0) + 
                (e.childrenIds?.length || 0) + 
                (e.childOfCharacter?.length || 0) + 
                (e.friendIds?.length || 0) + 
                (e.allyResCharacter?.length || 0) + 
                (e.enemyIds?.length || 0) + 
                (e.enemydResCharacter?.length || 0) + 
                (e.relativeIds?.length || 0) + 
                (e.relativesOfCharacter?.length || 0) + 
                (e.pairedCurrentLocationNew?.length || 0) + 
                (e.pairedSkills?.length || 0) + 
                (e.pairedEvent?.length || 0) + 
                (e.pairedConnectedItems?.length || 0);
            return getConnCount(b) - getConnCount(a);
        }).slice(0, 5);

        return { counts, topInterconnected };
    }, [world.entities]);



    const colors = isRoyal
        ? ['#70121e', '#c8a96e', '#3d5a80', '#2d6a4f', '#6d3b1e']
        : isWikiMode 
        ? ['#b91c1c', '#7a200d', '#1e40af', '#166534', '#854d0e'] 
        : ['#fef08a', '#fbbf24', '#38bdf8', '#4ade80', '#fb7185'];

    const accent = isRoyal ? 'text-[#70121e]' : isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const bgCard = isRoyal ? 'bg-[#f5ead0] border-[#c8a96e]/40' : isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-900/40 border-slate-800/60';

    const renderPieChart = () => {
        let offset = 0;
        const elements: React.ReactNode[] = [];
        const entries = Object.entries(stats.counts);
        
        entries.forEach(([type, count], i) => {
            const numCount = typeof count === 'number' ? count : Number(count) || 0;
            const percentage = (numCount / (world.entities.length || 1)) * 100;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            const strokeDashoffset = -offset;
            
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
                <h1 className={`text-7xl font-serif font-black uppercase tracking-tighter ${isRoyal ? 'text-[#3d0a10]' : isWikiMode ? 'text-[#b91c1c]' : 'text-white'}`}>The Architect's Ledger</h1>
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
                            <div key={e.id} onClick={() => onNavigate(e.id)}
                                className={`flex items-center justify-between p-4 rounded-3xl border ${isRoyal ? 'bg-[#ede0c4]/50 border-[#c8a96e]/20' : isWikiMode ? 'bg-[#fdfcf0]/50 border-black/5' : 'bg-white/5 border-white/5'} hover:border-yellow-500/50 cursor-pointer transition-all hover:scale-[1.02]`}>
                                <div className="flex items-center gap-4">
                                    <span className="text-xl font-serif font-black opacity-20 italic">#{i+1}</span>
                                    <span className="text-xs font-black uppercase tracking-widest">{e.name}</span>
                                </div>
                                <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${isRoyal ? 'bg-[#70121e]/10 text-[#70121e]' : isWikiMode ? 'bg-[#b91c1c]/10 text-[#b91c1c]' : 'bg-[#fef08a]/10 text-[#fef08a]'}`}>
                                    {(e.parentIds?.length || 0) + (e.childrenIds?.length || 0) + (e.friendIds?.length || 0) + (e.enemyIds?.length || 0)} Ties
                                </div>
                            </div>
                        )) : <p className="text-xs italic opacity-40">No connections established yet.</p>}
                    </div>
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
