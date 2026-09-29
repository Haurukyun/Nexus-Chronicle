import React from 'react';
import { Scroll, Trash2, Save, Lock, Unlock } from 'lucide-react';
import { WorldEntity } from '../../types';

interface HeaderProps {
    entity: WorldEntity;
    onEdit: () => void;
    onDelete: () => void;
    onToggleLock: () => void;
}

export const CodexHeader = ({ entity, onEdit, onDelete, onToggleLock }: HeaderProps) => (
    <header className="border-b border-slate-800/80 pb-12 flex justify-between items-end mb-12">
        <div>
            <div className="flex items-center gap-3 text-[#fef08a] mb-4 uppercase tracking-[0.4em] font-black text-[10px]"><Scroll size={14} /> Record Entry</div>
            <h1 className="text-[7rem] font-serif font-black text-white tracking-tighter uppercase leading-[0.8] mb-4">{entity.name}</h1>
            {entity.otherNames && <p className="text-slate-500 text-3xl font-serif italic opacity-60">"{entity.otherNames}"</p>}
        </div>
        <div className="flex items-center gap-4">
            {entity.isReadOnly ? (
                <button 
                    onClick={onToggleLock} 
                    className="flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/60 px-6 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-amber-500/30 hover:scale-105 transition-all shadow-lg active:scale-95"
                    title="Entry is locked against edits. Click to Unlock and edit."
                >
                    <Lock size={16} /> Locked (Click to Unlock)
                </button>
            ) : (
                <>
                    <button onClick={onEdit} className="bg-[#fef08a] text-slate-950 px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all">Edit Scroll</button>
                    <button onClick={onToggleLock} className="p-3 opacity-40 hover:opacity-100 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-xl transition-all" title="Lock Entry (Protect against edits)">
                        <Unlock size={18} />
                    </button>
                </>
            )}
            <button onClick={onDelete} className="p-4 text-rose-500 hover:bg-rose-500/10 rounded-full transition-all" title="Send to Forgotten Depth"><Trash2 size={24} /></button>
        </div>
    </header>
);

export const WikiHeader = ({ entity, onEdit, onDelete, onToggleLock }: HeaderProps) => (
    <header className="border-b-4 border-[#b91c1c] pb-2 flex justify-between items-end mb-10">
        <div>
            <h1 className="text-6xl font-serif font-bold text-[#b91c1c] uppercase tracking-tight leading-none">{entity.name}</h1>
            {entity.otherNames && <p className="text-[#854d0e] text-lg font-serif italic mt-1">"{entity.otherNames}"</p>}
        </div>
        <div className="flex items-center gap-3 pb-2">
            {entity.isReadOnly ? (
                <button 
                    onClick={onToggleLock} 
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-100 border border-amber-400 text-amber-900 rounded font-serif text-xs font-bold hover:bg-amber-200 transition-all shadow-sm"
                    title="Entry is locked. Click to Unlock."
                >
                    <Lock size={14} /> Locked (Click to Unlock)
                </button>
            ) : (
                <>
                    <button onClick={onEdit} className="p-2 hover:bg-black/5 rounded text-slate-500" title="Edit"><Save size={20} /></button>
                    <button onClick={onToggleLock} className="p-2 hover:bg-black/5 rounded text-slate-400 hover:text-amber-700" title="Lock Entry">
                        <Unlock size={18} />
                    </button>
                </>
            )}
            <button onClick={onDelete} className="p-2 hover:bg-rose-500/10 rounded text-rose-700" title="Trash"><Trash2 size={20} /></button>
        </div>
    </header>
);

export const RoyalHeader = ({ entity, onEdit, onDelete, onToggleLock }: HeaderProps) => (
    <header className="border-b-2 border-[#c8a96e]/40 pb-4 flex justify-between items-center mb-6">
        <div>
            <div className="flex items-center gap-2 text-[#70121e] mb-1 uppercase tracking-[0.2em] font-serif font-bold text-xs">
                <Scroll size={14} /> Codex Record
            </div>
            <h1 className="text-4xl font-serif font-black text-[#2b1810] tracking-tight uppercase leading-none">{entity.name}</h1>
            {entity.otherNames && <p className="text-[#7a4f2a] text-sm font-serif italic mt-1">"{entity.otherNames}"</p>}
        </div>
        <div className="flex items-center gap-3">
            {entity.isReadOnly ? (
                <button 
                    onClick={onToggleLock} 
                    className="flex items-center gap-2 bg-[#3f2210] text-[#fef08a] border border-[#d4af37] px-5 py-2.5 rounded-xl font-serif font-bold text-xs uppercase tracking-wider hover:bg-[#522d16] transition-all shadow-md"
                    title="Entry is locked. Click to Unlock and edit."
                >
                    <Lock size={14} /> Locked (Click to Unlock)
                </button>
            ) : (
                <>
                    <button onClick={onEdit} className="bg-[#70121e] text-[#fef08a] border border-[#c8a96e] px-5 py-2.5 rounded-xl font-serif font-bold text-xs uppercase tracking-wider hover:bg-[#881337] transition-all shadow-md">
                        Edit Scroll
                    </button>
                    <button onClick={onToggleLock} className="p-2 text-[#70121e]/60 hover:text-[#70121e] hover:bg-[#70121e]/10 rounded-full transition-all" title="Lock Entry">
                        <Unlock size={16} />
                    </button>
                </>
            )}
            <button onClick={onDelete} className="p-2 text-[#70121e] hover:bg-[#70121e]/10 rounded-full transition-all" title="Trash">
                <Trash2 size={18} />
            </button>
        </div>
    </header>
);


