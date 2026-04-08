import React from 'react';
import { RefreshCw, Trash } from 'lucide-react';
import { WorldEntity, WorldData } from '../types';
import { TYPE_LABELS } from '../constants';

interface TrashViewProps {
    trash: WorldEntity[];
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
    isWikiMode: boolean;
}

export const TrashView = ({ trash, setWorld, isWikiMode }: TrashViewProps) => {
    const accent = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    return (
        <div className="p-16 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <h2 className={`text-6xl font-serif font-black uppercase tracking-tighter \${accent}`}>Forgotten Depth</h2>
            <div className="space-y-3">
                {trash.length === 0 && <p className="opacity-40 italic text-center py-10">The archive is silent.</p>}
                {trash.map((e: WorldEntity) => (
                    <div key={e.id} className={`flex items-center justify-between p-4 rounded-xl border \${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-900/40 border-slate-800'}`}>
                        <div>
                            <span className="font-bold text-lg">{e.name}</span>
                            <p className="text-[10px] uppercase opacity-50">{TYPE_LABELS[e.type]}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setWorld((p: any) => ({ ...p, trash: p.trash.filter((x: any) => x.id !== e.id), entities: [...p.entities, e] }))} className="p-2 hover:bg-green-500/10 text-green-500 transition-all"><RefreshCw size={20} /></button>
                            <button onClick={() => setWorld((p: any) => ({ ...p, trash: p.trash.filter((x: any) => x.id !== e.id) }))} className="p-2 hover:bg-rose-500/10 text-rose-500 transition-all"><Trash size={20} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
