import React from 'react';
import { Scroll, Trash2, Save } from 'lucide-react';
import { WorldEntity } from '../../types';

interface HeaderProps {
    entity: WorldEntity;
    onEdit: () => void;
    onDelete: () => void;
}

export const CodexHeader = ({ entity, onEdit, onDelete }: HeaderProps) => (
    <header className="border-b border-slate-800/80 pb-12 flex justify-between items-end mb-12">
        <div>
            <div className="flex items-center gap-3 text-[#fef08a] mb-4 uppercase tracking-[0.4em] font-black text-[10px]"><Scroll size={14} /> Record Entry</div>
            <h1 className="text-[7rem] font-serif font-black text-white tracking-tighter uppercase leading-[0.8] mb-4">{entity.name}</h1>
            {entity.otherNames && <p className="text-slate-500 text-3xl font-serif italic opacity-60">"{entity.otherNames}"</p>}
        </div>
        <div className="flex gap-4">
            {!entity.isReadOnly && (
                <button onClick={onEdit} className="bg-[#fef08a] text-slate-950 px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all">Edit Scroll</button>
            )}
            <button onClick={onDelete} className="p-4 text-rose-500 hover:bg-rose-500/10 rounded-full transition-all"><Trash2 size={24} /></button>
        </div>
    </header>
);

export const WikiHeader = ({ entity, onEdit, onDelete }: HeaderProps) => (
    <header className="border-b-4 border-[#b91c1c] pb-2 flex justify-between items-end mb-10">
        <div>
            <h1 className="text-6xl font-serif font-bold text-[#b91c1c] uppercase tracking-tight leading-none">{entity.name}</h1>
            {entity.otherNames && <p className="text-[#854d0e] text-lg font-serif italic mt-1">"{entity.otherNames}"</p>}
        </div>
        <div className="flex gap-3 pb-2">
            {!entity.isReadOnly && (
                <button onClick={onEdit} className="p-2 hover:bg-black/5 rounded text-slate-500" title="Edit"><Save size={20} /></button>
            )}
            <button onClick={onDelete} className="p-2 hover:bg-rose-500/10 rounded text-rose-700" title="Trash"><Trash2 size={20} /></button>
        </div>
    </header>
);
