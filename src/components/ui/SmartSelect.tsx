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
    const { themeId, layoutMode } = useTheme();
    const isWikiMode = layoutMode === 'wiki';
    const isRoyal = themeId === 'royal-codex';

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

    const bgInput = isRoyal 
        ? 'bg-[#fbf8ef] border-[#c8a96e]/60 text-[#2b1810] font-serif shadow-inner'
        : isWikiMode 
            ? 'bg-white border-[#d4c8af]' 
            : 'bg-slate-800/40 border-slate-700';

    const tagClass = isRoyal
        ? 'bg-[#ede2cc] text-[#70121e] border-[#c8a96e]/60 font-serif font-bold shadow-sm'
        : isWikiMode 
            ? 'bg-[#b91c1c]/10 text-[#b91c1c] border-[#b91c1c]/30' 
            : 'bg-[#fef08a]/10 text-[#fef08a] border-[#fef08a]/30';

    const labelStyle = isRoyal
        ? 'text-[#451a03] font-serif font-bold'
        : isWikiMode
            ? 'text-[#854d0e] font-black'
            : 'text-slate-500 font-black';

    const iconStyle = isRoyal
        ? 'text-[#70121e]'
        : isWikiMode
            ? 'text-[#b91c1c]/60'
            : 'text-[#fef08a]/60';

    const editingTarget = editingNoteTargetId ? all.find((e: any) => e.id === editingNoteTargetId) : null;

    return (
        <div className="space-y-1 relative" style={{ gridColumn: `span ${gridSpan}` }} ref={dropdownRef}>
            <div className="flex items-center gap-2 pl-1 mb-1">
                {Icon && <Icon size={12} className={iconStyle} />}
                <label className={`text-[10px] uppercase tracking-widest ${labelStyle}`}>{label}</label>
                {fieldKey && (
                    <span className={`text-[9px] font-mono ml-auto ${isRoyal ? 'text-[#8c6d48]' : 'opacity-40'}`}>
                        annotated
                    </span>
                )}
            </div>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full ${bgInput} border rounded-lg p-2 text-xs flex flex-wrap gap-1 cursor-pointer min-h-[38px] transition-colors shadow-sm ${disabled ? 'opacity-50 cursor-default' : ''}`}
            >
                {ids.length === 0 && <span className={isRoyal ? 'text-[#8c6d48] font-serif italic' : 'text-slate-400'}>Add connection...</span>}
                {ids.map((id: string) => {
                    const target = all.find((e: any) => e.id === id);
                    const isDeceased = isEntityDeceased(target);
                    const isCategory = isEntityCategory(target);
                    const note = getRelationalNote(relationalNotes, fieldKey || 'general', id);
                    const hasNote = Boolean(note && note.trim().length > 0);

                    return (
                        <span key={id} className={`${tagClass} px-2 py-0.5 rounded border flex items-center gap-1.5 group/tag max-w-full min-w-0`}>
                            {isCategory && <Folder size={10} className={`shrink-0 ${isRoyal ? 'text-[#70121e]' : 'opacity-70 text-teal-400'}`} />}
                            <span className="shrink-0">{target?.name || 'Unknown'}</span>
                            {isDeceased && <span className="font-serif text-[11px] text-rose-500 font-bold leading-none shrink-0">†</span>}
                            
                            {/* Relational Context Note Trigger */}
                            {onRelationalNotesChange && !disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => handleOpenNoteModal(id, e)}
                                    title={hasNote ? `Context Note: "${note}"` : `Add relationship context note`}
                                    className={`px-1.5 py-0.5 rounded transition-all flex items-center gap-1 min-w-0 max-w-full ${
                                        hasNote 
                                            ? isRoyal 
                                                ? 'bg-[#c8a96e]/25 text-[#451a03] border border-[#c8a96e]/60 font-mono text-[9px]'
                                                : 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono text-[9px]' 
                                            : isRoyal
                                                ? 'opacity-40 hover:opacity-100 hover:text-[#70121e]'
                                                : 'opacity-30 hover:opacity-100 hover:text-white'
                                    }`}
                                >
                                    <FileText size={9} className="shrink-0" />
                                    {hasNote && <span className="truncate">{note}</span>}
                                </button>
                            )}

                            {!disabled && (
                                <X size={10} className={`${isRoyal ? 'hover:text-[#70121e]' : 'hover:text-black'} cursor-pointer shrink-0 ml-0.5`} onClick={(e) => { e.stopPropagation(); toggleId(id); }} />
                            )}
                        </span>
                    );
                })}
            </div>
            {isOpen && !disabled && (
                <div className={`absolute top-full left-0 w-full mt-1 ${isRoyal ? 'bg-[#f7f0e1] border-2 border-[#c8a96e]' : isWikiMode ? 'bg-[#f5e6d3] border-[#d4c8af]' : 'bg-slate-900 border-slate-700'} border rounded-lg shadow-2xl z-[100] overflow-hidden`}>
                    <div className={`p-2 border-b ${isRoyal ? 'border-[#c8a96e]/30' : 'border-slate-800/10'} flex items-center gap-2`}>
                        <input 
                            autoFocus 
                            placeholder="Filter..." 
                            className={`w-full ${
                                isRoyal 
                                    ? 'bg-[#fbf8ef] border border-[#c8a96e]/50 text-[#2b1810] placeholder:text-[#8c6d48]/70 focus:border-[#70121e] font-serif' 
                                    : isWikiMode 
                                        ? 'bg-white' 
                                        : 'bg-slate-800'
                            } rounded px-2 py-1 text-xs focus:ring-0 outline-none`}
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                        {minorCount > 0 && !search && (
                            <button
                                type="button"
                                onClick={() => setShowMinor(!showMinor)}
                                title={showMinor ? "Hide Minor Entries" : `Show ${minorCount} Minor Entries`}
                                className={`px-2 py-1 text-[10px] font-bold rounded flex items-center gap-1 shrink-0 ${
                                    showMinor 
                                        ? isRoyal ? 'bg-[#70121e]/15 text-[#70121e]' : 'bg-amber-500/20 text-amber-400' 
                                        : isRoyal ? 'bg-[#ede2cc] text-[#5c2a12] hover:bg-[#c8a96e]/30' : 'bg-black/10 text-slate-400 hover:text-slate-200'
                                }`}
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
                                className={`w-full text-left px-3 py-2 text-xs ${
                                    isRoyal 
                                        ? 'text-[#70121e] hover:bg-[#ede2cc] font-serif' 
                                        : isWikiMode 
                                            ? 'text-[#b91c1c] hover:bg-black/5' 
                                            : 'text-[#fef08a] hover:bg-slate-800'
                                } flex items-center gap-2 font-bold`}>
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
                                    className={`w-full text-left px-3 py-2 text-xs flex justify-between items-center transition-colors ${
                                        isSelected 
                                            ? isRoyal 
                                                ? 'bg-[#70121e] text-[#fff8e7] font-bold' 
                                                : isWikiMode 
                                                    ? 'bg-[#b91c1c] text-white' 
                                                    : 'bg-[#fef08a] text-black font-bold' 
                                            : isRoyal 
                                                ? 'text-[#2b1810] hover:bg-[#ede2cc] font-serif' 
                                                : isWikiMode 
                                                    ? 'text-slate-700 hover:bg-black/5' 
                                                    : 'text-slate-300 hover:bg-slate-800'
                                    } ${isMinor ? 'opacity-70 italic' : ''}`}>
                                    <span className="flex items-center gap-1.5 truncate">
                                        {isCategory && <Folder size={11} className={`${isRoyal ? 'text-[#70121e]' : 'text-teal-400'} shrink-0`} />}
                                        <span className={isDeceased ? 'line-through opacity-85' : ''}>{o.name}</span>
                                        {isDeceased && <span className="font-serif text-[11px] text-rose-500 font-bold shrink-0 leading-none">†</span>}
                                        {isMinor && <span className={`text-[8px] opacity-60 uppercase px-1 rounded ${isRoyal ? 'bg-[#c8a96e]/30 text-[#451a03]' : 'bg-black/20'} shrink-0`}>Minor</span>}
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
                    <div className={`${
                        isRoyal 
                            ? 'bg-[#f7f0e1] border-2 border-[#c8a96e] text-[#2b1810]' 
                            : 'bg-slate-900 border border-slate-700/80 text-slate-200'
                    } rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200`}>
                        <div className={`flex items-start justify-between gap-3 border-b ${isRoyal ? 'border-[#c8a96e]/30' : 'border-slate-800'} pb-3`}>
                            <div>
                                <div className={`flex items-center gap-2 ${isRoyal ? 'text-[#70121e]' : 'text-amber-400'} text-[10px] uppercase font-black tracking-widest mb-1`}>
                                    <MessageSquare size={13} />
                                    <span>Relationship Context Note</span>
                                </div>
                                <h3 className={`text-base font-black ${isRoyal ? 'text-[#3d0a10] font-serif' : 'text-white'}`}>
                                    {editingTarget.name}
                                    <span className={`text-xs font-normal ${isRoyal ? 'text-[#5c2a12]' : 'text-slate-400'} ml-2`}>
                                        ({fieldKey ? formatFieldLabel(fieldKey) : label})
                                    </span>
                                </h3>
                            </div>
                            <button
                                onClick={() => setEditingNoteTargetId(null)}
                                className={`${isRoyal ? 'text-[#5c2a12] hover:text-[#70121e]' : 'text-slate-400 hover:text-white'} p-1 rounded-lg`}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label className={`text-[10px] font-black uppercase tracking-wider ${isRoyal ? 'text-[#451a03] font-serif' : 'text-slate-400'}`}>
                                Relational Context & History
                            </label>
                            <p className={`text-[11px] ${isRoyal ? 'text-[#5c2a12]/80 font-serif' : 'text-slate-400'} italic`}>
                                Add specific context explaining this connection (e.g. "Betrayed Aurelius during the Siege of Sol", "Mentored her swordsmanship in youth").
                            </p>
                            <textarea
                                autoFocus
                                rows={4}
                                value={noteDraftText}
                                onChange={(e) => setNoteDraftText(e.target.value)}
                                placeholder="Enter context or historical annotation for this relationship..."
                                className={`w-full ${
                                    isRoyal 
                                        ? 'bg-[#fbf8ef] border border-[#c8a96e]/60 text-[#2b1810] placeholder:text-[#8c6d48]/70 focus:border-[#70121e] font-serif' 
                                        : 'bg-slate-950/80 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-amber-400'
                                } rounded-xl p-3 text-xs focus:outline-none transition-colors`}
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            {noteDraftText.trim() ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNoteDraftText('');
                                    }}
                                    className="text-[11px] text-rose-500 hover:text-rose-400 font-bold"
                                >
                                    Clear Note
                                </button>
                            ) : <div />}

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingNoteTargetId(null)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold ${
                                        isRoyal ? 'text-[#5c2a12] hover:bg-[#ede2cc]' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    } transition-colors`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveNote}
                                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                                        isRoyal
                                            ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e] hover:bg-[#881337] shadow-lg shadow-[#70121e]/20'
                                            : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-lg shadow-amber-400/20'
                                    } transition-colors`}
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
