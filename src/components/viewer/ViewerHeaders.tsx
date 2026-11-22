import React, { useState } from 'react';
import { Scroll, Trash2, Save, Lock, Unlock, Folder, Download, FileText, FileCode2, Printer, Edit3, Users } from 'lucide-react';
import { WorldEntity, Character } from '../../types';
import { isEntityCategory, isEntityDeceased, isEntityFinished } from '../../utils/documentModeUtils';
import { generateEntityMarkdown, generateEntityHtml, downloadTextFile } from '../../utils/exportUtils';
import { generateCharacterSheetHtml, generateRelationSheetHtml, openPrintableDocument } from '../../utils/characterSheetUtils';
import { useWorldStore } from '../../store/useWorldStore';
import { useTheme } from '../../theme';
import { NexusImage } from '../ui';
import { RenameEntityModal } from '../ui/RenameEntityModal';
import { renameEntityInWorld } from '../../utils/entityRenaming';

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
            className={`${className} ${pending ? 'ring-2 ring-rose-500/60' : ''} flex items-center justify-center transition-all`}
            title={pending ? 'Click again to confirm deletion' : 'Send to Forgotten Depth'}
        >
            {pending
                ? <span className="text-[9px] font-black uppercase tracking-wider px-1 text-rose-400">Sure?</span>
                : <Trash2 size={iconSize} />}
        </button>
    );
};

/** Dropdown export menu for a single codex entry */
const ExportDropdown: React.FC<{ entity: WorldEntity; allEntities: WorldEntity[]; theme: string; className?: string }> = ({
    entity, allEntities, theme, className = ''
}) => {
    const [open, setOpen] = useState(false);

    const handleExportMarkdown = async () => {
        setOpen(false);
        const md = generateEntityMarkdown(entity, allEntities);
        const cleanName = entity.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        await downloadTextFile(md, `${cleanName}.md`, 'text/markdown');
    };

    const handleExportHtml = async () => {
        setOpen(false);
        const html = generateEntityHtml(entity, allEntities, theme);
        const cleanName = entity.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        await downloadTextFile(html, `${cleanName}.html`, 'text/html');
    };

    const handlePrintSheet = () => {
        setOpen(false);
        if (entity.type === 'character') {
            const sheetHtml = generateCharacterSheetHtml(entity as Character, allEntities, { includeDmNotes: true, theme });
            openPrintableDocument(sheetHtml, `${entity.name.toLowerCase().replace(/\s+/g, '-')}-character-sheet`);
        } else {
            const html = generateEntityHtml(entity, allEntities, theme);
            openPrintableDocument(html, `${entity.name.toLowerCase().replace(/\s+/g, '-')}-dossier`);
        }
    };

    const handlePrintRelationSheet = () => {
        setOpen(false);
        if (entity.type === 'character') {
            const relHtml = generateRelationSheetHtml(entity as Character, allEntities, { theme });
            openPrintableDocument(relHtml, `${entity.name.toLowerCase().replace(/\s+/g, '-')}-relations`);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setOpen(!open)}
                title="Export this entry"
                className="flex items-center gap-1.5 p-2.5 rounded-xl border border-current/20 opacity-50 hover:opacity-100 transition-all cursor-pointer"
            >
                <Download size={16} />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-[200]" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-60 rounded-2xl border bg-slate-900 border-slate-700 shadow-2xl z-[201] overflow-hidden">
                        <div className="px-3 pt-2.5 pb-1 text-[9px] font-black uppercase tracking-widest text-slate-500">Export Entry</div>
                        {entity.type === 'character' && (
                            <>
                                <button
                                    onClick={handlePrintSheet}
                                    className="w-full text-left px-3 py-2.5 text-xs font-medium text-amber-200 hover:bg-slate-800 flex items-center gap-2.5 transition-colors bg-amber-500/10 cursor-pointer"
                                >
                                    <Printer size={14} className="text-amber-400" />
                                    Printable Character Sheet
                                    <span className="text-[10px] text-amber-400/70 ml-auto">PDF/Print</span>
                                </button>
                                <button
                                    onClick={handlePrintRelationSheet}
                                    className="w-full text-left px-3 py-2.5 text-xs font-medium text-pink-200 hover:bg-slate-800 flex items-center gap-2.5 transition-colors border-t border-slate-800 cursor-pointer bg-pink-500/10"
                                >
                                    <Users size={14} className="text-pink-400" />
                                    Print Relation Sheet
                                    <span className="text-[10px] text-pink-400/70 ml-auto">PDF/Print</span>
                                </button>
                            </>
                        )}
                        <button
                            onClick={handlePrintSheet}
                            className={`w-full text-left px-3 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer ${entity.type === 'character' ? 'border-t border-slate-800' : ''}`}
                        >
                            <Printer size={14} className="text-purple-400" />
                            Print Dossier
                            <span className="text-[10px] text-slate-500 ml-auto">PDF/Print</span>
                        </button>
                        <button
                            onClick={handleExportMarkdown}
                            className="w-full text-left px-3 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition-colors border-t border-slate-800"
                        >
                            <FileText size={14} className="text-emerald-400" />
                            Markdown (.md)
                            <span className="text-[10px] text-slate-500 ml-auto">Obsidian</span>
                        </button>
                        <button
                            onClick={handleExportHtml}
                            className="w-full text-left px-3 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition-colors border-t border-slate-800"
                        >
                            <FileCode2 size={14} className="text-sky-400" />
                            HTML Document (.html)
                            <span className="text-[10px] text-slate-500 ml-auto">Portable</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export const CodexHeader = ({ entity, onEdit, onDelete, onToggleLock }: HeaderProps) => {
    const isCat = isEntityCategory(entity);
    const isDead = isEntityDeceased(entity);
    const isDone = isEntityFinished(entity);
    const allEntities = useWorldStore(s => s.world.entities);
    const world = useWorldStore(s => s.world);
    const setWorld = useWorldStore(s => s.setWorld);
    const [showRename, setShowRename] = useState(false);

    return (
    <>
        <header className="border-b border-slate-800/80 pb-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 min-w-0 w-full">
                <div className="min-w-0 flex-1">
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
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black text-white tracking-tighter uppercase leading-[0.9] mb-3 min-w-0 [overflow-wrap:anywhere] break-words flex flex-wrap items-center gap-3">
                        <span>{entity.name}</span>
                        {isDead && <span className="text-rose-500/80 select-none font-normal" title="Fallen / Deceased">†</span>}
                    </h1>
                    {entity.otherNames && <p className="text-slate-500 text-2xl font-serif italic opacity-60">"{entity.otherNames}"</p>}
                    {entity.tags && entity.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-3">
                            {entity.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider bg-slate-800/80 border border-slate-700/60 text-slate-300"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <ExportDropdown entity={entity} allEntities={allEntities} theme="sovereign" />
                    {!entity.isReadOnly && (
                        <button
                            onClick={() => setShowRename(true)}
                            className="p-3 opacity-40 hover:opacity-100 text-slate-400 hover:text-amber-400 hover:bg-white/5 rounded-xl transition-all"
                            title="Rename & propagate wikilinks"
                        >
                            <Edit3 size={18} />
                        </button>
                    )}
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
        {showRename && (
            <RenameEntityModal
                entity={entity}
                world={world}
                onConfirm={(newName) => {
                    const result = renameEntityInWorld(world, entity.id, newName);
                    setWorld(result.updatedWorld);
                    setShowRename(false);
                }}
                onClose={() => setShowRename(false)}
            />
        )}
    </>
    );
};

export const WikiHeader = ({ entity, onEdit, onDelete, onToggleLock }: HeaderProps) => {
    const isCat = isEntityCategory(entity);
    const isDead = isEntityDeceased(entity);
    const isDone = isEntityFinished(entity);
    const allEntities = useWorldStore(s => s.world.entities);
    const world = useWorldStore(s => s.world);
    const setWorld = useWorldStore(s => s.setWorld);
    const [showRename, setShowRename] = useState(false);

    return (
    <>
        <header className="border-b-4 border-[#b91c1c] pb-3 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-8 min-w-0 w-full">
            <div className="min-w-0 flex-1">
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
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#b91c1c] uppercase tracking-tight leading-none min-w-0 [overflow-wrap:anywhere] break-words flex flex-wrap items-center gap-2">
                    <span>{entity.name}</span>
                    {isDead && <span className="text-rose-600/70 select-none" title="Deceased">†</span>}
                </h1>
                {entity.otherNames && <p className="text-[#854d0e] text-lg font-serif italic mt-1">"{entity.otherNames}"</p>}
                {entity.tags && entity.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mt-2">
                        {entity.tags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-[#eae4d3] border border-[#d4c8af] text-[#475569]"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3 pb-2 shrink-0">
                <ExportDropdown
                    entity={entity}
                    allEntities={allEntities}
                    theme="wiki"
                    className="text-[#b91c1c]"
                />
                {!entity.isReadOnly && (
                    <button onClick={() => setShowRename(true)} className="p-2 hover:bg-black/5 rounded text-slate-400 hover:text-[#b91c1c]" title="Rename & propagate wikilinks"><Edit3 size={16} /></button>
                )}
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
        {showRename && (
            <RenameEntityModal
                entity={entity}
                world={world}
                onConfirm={(newName) => { const result = renameEntityInWorld(world, entity.id, newName); setWorld(result.updatedWorld); setShowRename(false); }}
                onClose={() => setShowRename(false)}
            />
        )}
    </>
    );
};

export const RoyalHeader = ({ entity, onEdit, onDelete, onToggleLock }: HeaderProps) => {
    const isCat = isEntityCategory(entity);
    const isDead = isEntityDeceased(entity);
    const isDone = isEntityFinished(entity);
    const allEntities = useWorldStore(s => s.world.entities);
    const world = useWorldStore(s => s.world);
    const setWorld = useWorldStore(s => s.setWorld);
    const [showRename, setShowRename] = useState(false);

    return (
    <>
        <header className="border-b-2 border-[#c8a96e]/40 pb-4 flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6 min-w-0 w-full">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                {entity.imageUri && (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-[#c8a96e] bg-[#24050b] shadow-xl shrink-0 relative group">
                        <NexusImage src={entity.imageUri} className="w-full h-full object-cover" containerClassName="w-full h-full" />
                        <div className="absolute inset-0.5 border border-[#c8a96e]/30 rounded-xl pointer-events-none" />
                    </div>
                )}
                <div className="min-w-0 flex-1">
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
                    <h1 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-serif font-black text-[#2b1810] tracking-tight uppercase leading-tight min-w-0 [overflow-wrap:anywhere] break-words">
                        <span>{entity.name}</span>
                        {isDead && <span className="text-[#70121e]/80 select-none ml-1.5 shrink-0" title="Fallen / Deceased">†</span>}
                    </h1>
                    {entity.otherNames && <p className="text-[#7a4f2a] text-sm font-serif italic mt-1 truncate">"{entity.otherNames}"</p>}
                    {entity.tags && entity.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {entity.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded text-[9px] font-serif font-bold tracking-wider bg-[#ede0c4] border border-[#c8a96e]/50 text-[#70121e]"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 self-start lg:self-center">
                <ExportDropdown
                    entity={entity}
                    allEntities={allEntities}
                    theme="royal-codex"
                    className="text-[#70121e]"
                />
                {!entity.isReadOnly && (
                    <button onClick={() => setShowRename(true)} className="p-2 text-[#70121e]/60 hover:text-[#70121e] hover:bg-[#70121e]/10 rounded-full transition-all" title="Rename & propagate wikilinks"><Edit3 size={16} /></button>
                )}
                {entity.isReadOnly ? (
                    <button
                        onClick={onToggleLock}
                        className="flex items-center gap-2 bg-[#3f2210] text-[#fff8e7] border border-[#d4af37] px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-serif font-bold text-xs uppercase tracking-wider hover:bg-[#522d16] transition-all shadow-md"
                        title="Entry is locked. Click to Unlock and edit."
                    >
                        <Lock size={14} /> Locked (Click to Unlock)
                    </button>
                ) : (
                    <>
                        <button onClick={onEdit} className="bg-[#70121e] text-[#fff8e7] border border-[#c8a96e] px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-serif font-bold text-xs uppercase tracking-wider hover:bg-[#881337] transition-all shadow-md">
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
        {showRename && (
            <RenameEntityModal
                entity={entity}
                world={world}
                onConfirm={(newName) => { const result = renameEntityInWorld(world, entity.id, newName); setWorld(result.updatedWorld); setShowRename(false); }}
                onClose={() => setShowRename(false)}
            />
        )}
    </>
    );
};
