import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Plus, Check, LucideIcon, Folder, Eye, EyeOff, FileText, Edit3, MessageSquare } from 'lucide-react';
import { createPortal } from 'react-dom';
import { SmartSelectProps } from '../../types';
import { useTheme } from '../../theme';
import { isEntityDeceased, isEntityCategory, isEntityMinor } from '../../utils/documentModeUtils';
import { getRelationalNote, setRelationalNote, formatFieldLabel } from '../../utils/relationalNotesUtils';

export const SmartSelect: React.FC<SmartSelectProps & { icon?: LucideIcon }> = ({
    label,
    ids = [],
    type,
    all,
    onChange,
    onCreate,
    disabled,
    icon: Icon,
    gridSpan = 12,
    excludeIds = [],
    fieldKey,
    relationalNotes,
    onRelationalNotesChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [showMinor, setShowMinor] = useState(false);
    const [editingNoteTargetId, setEditingNoteTargetId] = useState<string | null>(null);
    const [noteDraftText, setNoteDraftText] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { layoutMode } = useTheme();
    const isWikiMode = layoutMode === 'wiki';

    const typeEntities = useMemo(() => {
        return all.filter((e: any) => e.type === type && !excludeIds.includes(e.id));
    }, [all, type, excludeIds]);

    const minorCount = useMemo(() => {
        return typeEntities.filter(e => isEntityMinor(e)).length;
    }, [typeEntities]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return typeEntities.filter((e: any) => {
            const matchesSearch = !q || e.name.toLowerCase().includes(q);
            const isSelected = ids.includes(e.id);
            const matchesMinorFilter = showMinor || !isEntityMinor(e) || isSelected || q.length > 0;
            return matchesSearch && matchesMinorFilter;
        });
    }, [typeEntities, search, ids, showMinor]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleId = (id: string) => {
        if (ids.includes(id)) {
            onChange(ids.filter((i: string) => i !== id));
            // Non-destructively clean up only this specific field's relational note
            if (fieldKey && onRelationalNotesChange && relationalNotes) {
                const nextNotes = setRelationalNote(relationalNotes, fieldKey, id, '');
                onRelationalNotesChange(nextNotes);
            }
        } else {
            onChange([...ids, id]);
        }
    };

    const handleOpenNoteModal = (targetId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const currentNote = getRelationalNote(relationalNotes, fieldKey || 'general', targetId);
        setNoteDraftText(currentNote);
        setEditingNoteTargetId(targetId);
    };

    const handleSaveNote = () => {
        if (!editingNoteTargetId) return;
        if (onRelationalNotesChange) {
            const nextNotes = setRelationalNote(
                relationalNotes,
                fieldKey || 'general',
                editingNoteTargetId,
                noteDraftText
            );
            onRelationalNotesChange(nextNotes);
        }
        setEditingNoteTargetId(null);
    };

    const bgInput = isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700';
    const tagClass = isWikiMode ? 'bg-[#b91c1c]/10 text-[#b91c1c] border-[#b91c1c]/30' : 'bg-[#fef08a]/10 text-[#fef08a] border-[#fef08a]/30';

    const editingTarget = editingNoteTargetId ? all.find((e: any) => e.id === editingNoteTargetId) : null;

    return (
        <div className="space-y-1 relative" style={{ gridColumn: `span ${gridSpan}` }} ref={dropdownRef}>
            <div className="flex items-center gap-2 pl-1 mb-1">
                {Icon && <Icon size={12} className={isWikiMode ? 'text-[#b91c1c]/60' : 'text-[#fef08a]/60'} />}
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
                {fieldKey && (
                    <span className="text-[9px] opacity-40 font-mono ml-auto">
                        annotated
                    </span>
                )}
            </div>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full ${bgInput} border rounded-lg p-2 text-xs flex flex-wrap gap-1 cursor-pointer min-h-[38px] transition-colors shadow-sm ${disabled ? 'opacity-50 cursor-default' : ''}`}
            >
                {ids.length === 0 && <span className="text-slate-400">Add connection...</span>}
                {ids.map((id: string) => {
                    const target = all.find((e: any) => e.id === id);
                    const isDeceased = isEntityDeceased(target);
                    const isCategory = isEntityCategory(target);
                    const note = getRelationalNote(relationalNotes, fieldKey || 'general', id);
                    const hasNote = Boolean(note && note.trim().length > 0);

                    return (
                        <span key={id} className={`${tagClass} px-2 py-0.5 rounded border flex items-center gap-1.5 group/tag max-w-full min-w-0`}>
                            {isCategory && <Folder size={10} className="opacity-70 shrink-0 text-teal-400" />}
                            <span className="shrink-0">{target?.name || 'Unknown'}</span>
                            {isDeceased && <span className="font-serif text-[11px] text-rose-400 font-bold leading-none shrink-0">†</span>}
                            
                            {/* Relational Context Note Trigger */}
                            {onRelationalNotesChange && !disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => handleOpenNoteModal(id, e)}
                                    title={hasNote ? `Context Note: "${note}"` : `Add relationship context note`}
                                    className={`px-1.5 py-0.5 rounded transition-all flex items-center gap-1 min-w-0 max-w-full ${hasNote ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono text-[9px]' : 'opacity-30 hover:opacity-100 hover:text-white'}`}
                                >
                                    <FileText size={9} className="shrink-0" />
                                    {hasNote && <span className="truncate">{note}</span>}
                                </button>
                            )}

                            {!disabled && (
                                <X size={10} className="hover:text-black cursor-pointer shrink-0 ml-0.5" onClick={(e) => { e.stopPropagation(); toggleId(id); }} />
                            )}
                        </span>
                    );
                })}
            </div>
            {isOpen && !disabled && (
                <div className={`absolute top-full left-0 w-full mt-1 ${isWikiMode ? 'bg-[#f5e6d3] border-[#d4c8af]' : 'bg-slate-900 border-slate-700'} border rounded-lg shadow-2xl z-[100] overflow-hidden`}>
                    <div className="p-2 border-b border-slate-800/10 flex items-center gap-2">
                        <input autoFocus placeholder="Filter..." className={`w-full ${isWikiMode ? 'bg-white' : 'bg-slate-800'} rounded px-2 py-1 text-xs focus:ring-0 outline-none`}
                            value={search} onChange={e => setSearch(e.target.value)} />
                        {minorCount > 0 && !search && (
                            <button
                                type="button"
                                onClick={() => setShowMinor(!showMinor)}
                                title={showMinor ? "Hide Minor Entries" : `Show ${minorCount} Minor Entries`}
                                className={`px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 shrink-0 ${showMinor ? 'bg-amber-500/20 text-amber-400' : 'bg-black/10 text-slate-400 hover:text-slate-200'}`}
                            >
                                {showMinor ? <Eye size={11} /> : <EyeOff size={11} />}
                                <span>{showMinor ? 'Minor' : `+${minorCount}`}</span>
                            </button>
                        )}
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filtered.length === 0 && search && (
                            <button onClick={() => {
                                const newId = onCreate(type, search, false);
                                if (newId) {
                                    toggleId(newId);
                                    setIsOpen(false);
                                    setSearch("");
                                }
                            }}
                                className={`w-full text-left px-3 py-2 text-xs ${isWikiMode ? 'text-[#b91c1c] hover:bg-black/5' : 'text-[#fef08a] hover:bg-slate-800'} flex items-center gap-2 font-bold`}>
                                <Plus size={12} /> Create "{search}"
                            </button>
                        )}
                        {filtered.map((o: any) => {
                            const isDeceased = isEntityDeceased(o);
                            const isCategory = isEntityCategory(o);
                            const isMinor = isEntityMinor(o);
                            const isSelected = ids.includes(o.id);
                            return (
                                <button key={o.id} onClick={() => toggleId(o.id)}
                                    className={`w-full text-left px-3 py-2 text-xs flex justify-between items-center transition-colors ${isSelected ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-[#fef08a] text-black font-bold') : (isWikiMode ? 'text-slate-700 hover:bg-black/5' : 'text-slate-300 hover:bg-slate-800')} ${isMinor ? 'opacity-70 italic' : ''}`}>
                                    <span className="flex items-center gap-1.5 truncate">
                                        {isCategory && <Folder size={11} className="text-teal-400 shrink-0" />}
                                        <span className={isDeceased ? 'line-through opacity-85' : ''}>{o.name}</span>
                                        {isDeceased && <span className="font-serif text-[11px] text-rose-400 font-bold shrink-0 leading-none">†</span>}
                                        {isMinor && <span className="text-[8px] opacity-50 uppercase px-1 rounded bg-black/20 shrink-0">Minor</span>}
                                    </span>
                                    {isSelected && <Check size={12} className="shrink-0 ml-2" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Field-Scoped Relational Context Note Modal (Portaled to document.body) */}
            {editingNoteTargetId && editingTarget && createPortal(
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                            <div>
                                <div className="flex items-center gap-2 text-amber-400 text-[10px] uppercase font-black tracking-widest mb-1">
                                    <MessageSquare size={13} />
                                    <span>Relationship Context Note</span>
                                </div>
                                <h3 className="text-base font-black text-white">
                                    {editingTarget.name}
                                    <span className="text-xs font-normal text-slate-400 ml-2">
                                        ({fieldKey ? formatFieldLabel(fieldKey) : label})
                                    </span>
                                </h3>
                            </div>
                            <button
                                onClick={() => setEditingNoteTargetId(null)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Relational Context & History
                            </label>
                            <p className="text-[11px] text-slate-400 italic">
                                Add specific context explaining this connection (e.g. "Betrayed Aurelius during the Siege of Sol", "Mentored her swordsmanship in youth").
                            </p>
                            <textarea
                                autoFocus
                                rows={4}
                                value={noteDraftText}
                                onChange={(e) => setNoteDraftText(e.target.value)}
                                placeholder="Enter context or historical annotation for this relationship..."
                                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            {noteDraftText.trim() ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNoteDraftText('');
                                    }}
                                    className="text-[11px] text-rose-400 hover:text-rose-300 font-bold"
                                >
                                    Clear Note
                                </button>
                            ) : <div />}

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingNoteTargetId(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveNote}
                                    className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"
                                >
                                    Save Annotation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
