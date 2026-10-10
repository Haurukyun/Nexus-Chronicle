import React, { useState } from 'react';
import { Scroll, Trash2, Save, Lock, Unlock, Folder } from 'lucide-react';
import { WorldEntity } from '../../types';
import { isEntityCategory, isEntityDeceased, isEntityFinished } from '../../utils/documentModeUtils';

interface HeaderProps {
    entity: WorldEntity;
    onEdit: () => void;
    onDelete: () => void;
    onToggleLock: () => void;
}

/** Two-click delete confirm. First click shows "Sure?", second confirms, blur cancels. */
const ConfirmDeleteButton: React.FC<{ onConfirm: () => void; className: string; iconSize: number }> = ({
    onConfirm, className, iconSize
}) => {
    const [pending, setPending] = useState(false);
    return (
        <button
            onClick={() => { if (pending) { onConfirm(); setPending(false); } else { setPending(true); } }}
            onBlur={() => setPending(false)}
            className={`${className} ${pending ? 'ring-2 ring-rose-500/60' : ''} transition-all`}
            title={pending ? 'Click again to confirm deletion' : 'Send to Forgotten Depth'}
        >
            {pending
                ? <span className="text-[9px] font-black uppercase tracking-wider px-1 text-rose-400">Sure?</span>
                : <Trash2 size={iconSize} />}
        </button>
    );
};

export const CodexHeader = ({ entity, onEdit, onDelete, onToggleLock }: HeaderProps) => {
    const isCat = isEntityCategory(entity);
    const isDead = isEntityDeceased(entity);
    const isDone = isEntityFinished(entity);

    return (
        <header className="border-b border-slate-800/80 pb-8 mb-8">
            <div className="flex justify-between items-end gap-6">
                <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <div className="flex items-center gap-2 text-[#fef08a] uppercase tracking-[0.4em] font-black text-[10px]">
                            {isCat ? <Folder size={14} className="text-amber-400" /> : <Scroll size={14} />}
                            {isCat ? 'Category Folder' : 'Record Entry'}
                        </div>
                        {isDead && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase bg-rose-950/80 text-rose-300 border border-rose-500/30 flex items-center gap-1" title="Marked as Fallen / Deceased">
                                † Fallen / Deceased
                            </span>
                        )}
                        {isDone && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1" title="Completed Record">
                                ● Completed
                            </span>
                        )}
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-black text-white tracking-tighter uppercase leading-[0.9] mb-3 flex items-center gap-3">
                        <span>{entity.name}</span>
                        {isDead && <span className="text-rose-500/80 select-none font-normal" title="Fallen / Deceased">†</span>}
                    </h1>
                    {entity.otherNames && <p className="text-slate-500 text-2xl font-serif italic opacity-60">"{entity.otherNames}"</p>}
                </div>
                <div className="flex items-center gap-4 shrink-0">
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
                    <ConfirmDeleteButton onConfirm={onDelete} className="p-4 text-rose-500 hover:bg-rose-500/10 rounded-full" iconSize={24} />
                </div>
            </div>
        </header>
    );
};

export const WikiHeader = ({ entity, onEdit, onDelete, onToggleLock }: HeaderProps) => {
    const isCat = isEntityCategory(entity);
    const isDead = isEntityDeceased(entity);
    const isDone = isEntityFinished(entity);

    return (
        <header className="border-b-4 border-[#b91c1c] pb-2 flex justify-between items-end mb-10">
            <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    {isCat && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Folder size={12} /> Folder
                        </span>
                    )}
                    {isDead && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                            † Deceased
                        </span>
                    )}
                    {isDone && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ● Completed
                        </span>
                    )}
                </div>
                <h1 className="text-6xl font-serif font-bold text-[#b91c1c] uppercase tracking-tight leading-none flex items-center gap-2">
                    <span>{entity.name}</span>
                    {isDead && <span className="text-rose-600/70 select-none" title="Deceased">†</span>}
                </h1>
                {entity.otherNames && <p className="text-[#854d0e] text-lg font-serif italic mt-1">"{entity.otherNames}"</p>}
            </div>
            <div className="flex items-center gap-3 pb-2 shrink-0">
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
                <ConfirmDeleteButton onConfirm={onDelete} className="p-2 hover:bg-rose-500/10 rounded text-rose-700" iconSize={20} />
            </div>
        </header>
    );
};

export const RoyalHeader = ({ entity, onEdit, onDelete, onToggleLock }: HeaderProps) => {
    const isCat = isEntityCategory(entity);
    const isDead = isEntityDeceased(entity);
    const isDone = isEntityFinished(entity);

    return (
        <header className="border-b-2 border-[#c8a96e]/40 pb-4 flex justify-between items-center mb-6">
            <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <div className="flex items-center gap-2 text-[#70121e] uppercase tracking-[0.2em] font-serif font-bold text-xs">
                        {isCat ? <Folder size={14} className="text-[#a0522d]" /> : <Scroll size={14} />}
                        {isCat ? 'Folder Container' : 'Codex Record'}
                    </div>
                    {isDead && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-serif font-bold tracking-wider uppercase bg-[#3f1d1d] text-[#ffcdd2] border border-[#a83232]/50">
                            † Fallen / Deceased
                        </span>
                    )}
                    {isDone && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-serif font-bold tracking-wider uppercase bg-[#1d3f27] text-[#c8e6c9] border border-[#2e7d32]/50">
                            ● Completed
                        </span>
                    )}
                </div>
                <h1 className="text-4xl font-serif font-black text-[#2b1810] tracking-tight uppercase leading-none flex items-center gap-2">
                    <span>{entity.name}</span>
                    {isDead && <span className="text-[#70121e]/80 select-none" title="Fallen / Deceased">†</span>}
                </h1>
                {entity.otherNames && <p className="text-[#7a4f2a] text-sm font-serif italic mt-1">"{entity.otherNames}"</p>}
            </div>
            <div className="flex items-center gap-3">
                {entity.isReadOnly ? (
                    <button 
                        onClick={onToggleLock} 
                        className="flex items-center gap-2 bg-[#3f2210] text-[#fff8e7] border border-[#d4af37] px-5 py-2.5 rounded-xl font-serif font-bold text-xs uppercase tracking-wider hover:bg-[#522d16] transition-all shadow-md"
                        title="Entry is locked. Click to Unlock and edit."
                    >
                        <Lock size={14} /> Locked (Click to Unlock)
                    </button>
                ) : (
                    <>
                        <button onClick={onEdit} className="bg-[#70121e] text-[#fff8e7] border border-[#c8a96e] px-5 py-2.5 rounded-xl font-serif font-bold text-xs uppercase tracking-wider hover:bg-[#881337] transition-all shadow-md">
                            Edit Scroll
                        </button>
                        <button onClick={onToggleLock} className="p-2 text-[#70121e]/60 hover:text-[#70121e] hover:bg-[#70121e]/10 rounded-full transition-all" title="Lock Entry">
                            <Unlock size={16} />
                        </button>
                    </>
                )}
                <ConfirmDeleteButton onConfirm={onDelete} className="p-2 text-[#70121e] hover:bg-[#70121e]/10 rounded-full" iconSize={18} />
            </div>
        </header>
    );
};

