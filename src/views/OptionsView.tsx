import React, { useMemo } from 'react';
import { Palette, Skull } from 'lucide-react';
import { WorldData, WorldEntity, EntityType } from '../types';
import { TYPE_LABELS } from '../constants';
import { FormInput } from '../components/ui';

interface OptionsViewProps {
    world: WorldData;
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
    isWikiMode: boolean;
    setIsWikiMode: (mode: boolean) => void;
}

export const OptionsView = ({ world, setWorld, isWikiMode, setIsWikiMode }: OptionsViewProps) => {
    const accent = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const bgCard = isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-900/40 border-slate-800';

    const stats = useMemo(() => {
        const total = world.entities.length;
        const byType = world.entities.reduce((acc: any, e: any) => {
            acc[e.type] = (acc[e.type] || 0) + 1;
            return acc;
        }, {});
        const totalConnections = world.entities.reduce((acc: number, e: any) => {
            const char = e as any;
            let count = (char.locationIds?.length || 0) + (char.loreNoteIds?.length || 0) + (char.mythIds?.length || 0);
            if (char.groupConnections) {
                Object.values(char.groupConnections).forEach((g: any) => {
                    Object.values(g).forEach((v: any) => { if (Array.isArray(v)) count += v.length; });
                });
            }
            return acc + count;
        }, 0);
        return { total, byType, totalConnections };
    }, [world.entities]);

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.entities && data.name) {
                    if (confirm("Importing will replace your current world data. Continue?")) {
                        setWorld(data);
                    }
                } else {
                    alert("Invalid JSON format for Nexus Chronicle.");
                }
            } catch (err) {
                alert("Failed to parse JSON file.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-16 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-40">
            <header>
                <h2 className={`text-6xl font-serif font-black uppercase tracking-tighter ${accent}`}>System Settings</h2>
                <p className="opacity-50 text-sm mt-2 italic font-serif">Configure the parameters of your eternal archive.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`lg:col-span-1 p-8 rounded-3xl border ${bgCard} shadow-2xl space-y-6`}>
                    <h3 className={`text-xs font-black uppercase tracking-widest ${accent} border-b border-slate-800/20 pb-2`}>Archive Statistics</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] uppercase font-bold opacity-40">Total Entities</span>
                            <span className="text-3xl font-serif font-bold text-white">{stats.total}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] uppercase font-bold opacity-40">Connections</span>
                            <span className="text-xl font-serif font-bold text-white">{stats.totalConnections}</span>
                        </div>
                        <div className="h-[1px] w-full bg-slate-800/40 my-2" />
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
                            {Object.entries(stats.byType).map(([type, count]) => (
                                <div key={type} className="flex flex-col p-2 bg-black/20 rounded border border-white/5">
                                    <span className="text-[8px] uppercase font-black opacity-30">{TYPE_LABELS[type as EntityType] || type}</span>
                                    <span className="text-sm font-bold">{count as number}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={`lg:col-span-2 p-10 rounded-3xl border ${bgCard} shadow-2xl space-y-10`}>
                    <section className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                            <Palette size={14} /> Realm Identity & Theme
                        </h3>
                        <FormInput label="Realm Name" value={world.name} onChange={(v: string) => setWorld({ ...world, name: v })} isWikiMode={isWikiMode} />
                        <FormInput label="Global Atlas Image (URL)" value={world.mapImage} onChange={(v: string) => setWorld({ ...world, mapImage: v })} isWikiMode={isWikiMode} />
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                                <span className="text-[9px] font-black uppercase opacity-40">Editor Style</span>
                                <div className="flex gap-2">
                                    <button onClick={() => setIsWikiMode(false)} className={`flex-1 py-2 rounded text-[9px] font-black border transition-all ${!isWikiMode ? 'bg-[#fef08a] text-black border-[#fef08a]' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>CODEX</button>
                                    <button onClick={() => setIsWikiMode(true)} className={`flex-1 py-2 rounded text-[9px] font-black border transition-all ${isWikiMode ? 'bg-[#b91c1c] text-white border-[#b91c1c]' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>WIKI</button>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                                <span className="text-[9px] font-black uppercase opacity-40">System Backup</span>
                                <div className="flex gap-2">
                                    <button onClick={() => {
                                        const blob = new Blob([JSON.stringify(world, null, 2)], { type: 'application/json' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a'); a.href = url; a.download = `${world.name}_chronicle.json`; a.click();
                                    }} className={`flex-1 py-2 rounded text-[9px] font-black border border-slate-700 hover:border-[#fef08a] transition-all`}>EXPORT</button>
                                    <label className="flex-1 py-2 rounded text-[9px] font-black border border-slate-700 hover:border-[#fef08a] transition-all text-center cursor-pointer">
                                        IMPORT
                                        <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="pt-10 border-t border-slate-800/40 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                                <Skull size={14} /> Oblivion Protocol (Danger Zone)
                            </h3>
                        </div>
                        <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-900/20 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold text-rose-200">Purge Entity Cache</p>
                                <p className="text-[10px] text-rose-200/50">Permanently delete all entities and the Atlas map.</p>
                            </div>
                            <button onClick={() => {
                                if (confirm("DANGER: This will delete everything. Are you absolutely certain?")) {
                                    setWorld({ name: "New Realm", entities: [], trash: [], mapImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000" });
                                }
                            }} className="px-6 py-2 bg-rose-900/40 hover:bg-rose-600 text-rose-200 text-[10px] font-black rounded-lg transition-all border border-rose-500/30">WIPE ALL DATA</button>
                        </div>
                    </section>
                </div>
            </div>

            <footer className="text-center opacity-20 hover:opacity-100 transition-opacity duration-1000">
                <p className="text-[11px] font-black tracking-[0.5em] uppercase">Built for the Chroniclers of the Multiverse</p>
                <p className="text-[9px] mt-1 font-mono">v1.2.0-alpha // Nexus Chronicle Engine</p>
            </footer>
        </div>
    );
};
