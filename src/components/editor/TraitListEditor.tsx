import React, { useState, useMemo } from 'react';
import { Plus, X, MessageSquare, Check, Sparkles } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../theme';

export interface TraitItem {
    name: string;
    note?: string;
}

interface TraitListEditorProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    suggestions: string[];
    placeholder?: string;
    gridSpan?: number;
}

export const TraitListEditor: React.FC<TraitListEditorProps> = ({
    label,
    value,
    onChange,
    suggestions,
    placeholder = 'Add new...',
    gridSpan = 6,
}) => {
    const { themeId, layoutMode } = useTheme();
    const isRoyal = themeId === 'royal-codex';
    const isWiki = layoutMode === 'wiki';

    const [inputVal, setInputVal] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [noteDraft, setNoteDraft] = useState('');

    // Parse JSON or legacy plain text into TraitItem[]
    const items: TraitItem[] = useMemo(() => {
        if (!value || !value.trim()) return [];
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.map((item: any) => {
                    if (typeof item === 'string') return { name: item };
                    return { name: item.name || item.title || '', note: item.note || '' };
                }).filter(i => i.name.trim());
            }
        } catch {
            // Legacy plain text parser (supports bullet lines or comma lists)
            return value
                .split('\n')
                .map(line => line.trim())
                .filter(Boolean)
                .map(line => {
                    const clean = line.replace(/^[•\-\*]\s*/, '');
                    const parts = clean.split(/:\s*(.+)/);
                    return {
                        name: parts[0]?.trim() || clean,
                        note: parts[1]?.trim() || '',
                    };
                });
        }
        return [];
    }, [value]);

    const saveItems = (newItems: TraitItem[]) => {
        if (newItems.length === 0) {
            onChange('');
        } else {
            onChange(JSON.stringify(newItems));
        }
    };

    const addItem = (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        if (items.some(i => i.name.toLowerCase() === trimmed.toLowerCase())) return;
        saveItems([...items, { name: trimmed }]);
        setInputVal('');
    };

    const removeItem = (index: number) => {
        saveItems(items.filter((_, i) => i !== index));
    };

    const openNoteModal = (index: number) => {
        setEditingIndex(index);
        setNoteDraft(items[index]?.note || '');
    };

    const saveNote = () => {
        if (editingIndex === null) return;
        const updated = items.map((item, i) =>
            i === editingIndex ? { ...item, note: noteDraft.trim() || undefined } : item
        );
        saveItems(updated);
        setEditingIndex(null);
    };

    const currentItem = editingIndex !== null ? items[editingIndex] : null;

    const labelStyle = isRoyal ? 'text-[#451a03] font-serif font-bold' : isWiki ? 'text-[#854d0e]' : 'text-slate-400 font-bold';
    const tagStyle = isRoyal
        ? 'bg-[#ede2cc] text-[#70121e] border-[#c8a96e]/60 font-serif font-bold shadow-xs'
        : isWiki
        ? 'bg-[#b91c1c]/10 text-[#b91c1c] border-[#b91c1c]/30'
        : 'bg-slate-800 text-[#fef08a] border-slate-700';

    return (
        <div className="space-y-2 min-w-0" style={{ gridColumn: `span ${gridSpan}` }}>
            <div className="flex items-center justify-between gap-1 min-w-0">
                <label className={`text-[10px] font-black uppercase tracking-wider sm:tracking-widest ${labelStyle} truncate min-w-0`}>
                    {label} ({items.length})
                </label>
                <span className="text-[9px] font-mono opacity-50 shrink-0 hidden sm:inline">Click 📝 to annotate notes</span>
            </div>

            {/* List Chips Display */}
            <div className={`min-h-[40px] sm:min-h-[46px] p-1.5 sm:p-2 rounded-xl border flex flex-wrap gap-1 sm:gap-1.5 items-center min-w-0 ${
                isRoyal ? 'bg-[#fbf8ef] border-[#c8a96e]/50' : isWiki ? 'bg-white border-[#d4c8af]' : 'bg-slate-900/40 border-slate-700'
            }`}>
                {items.length === 0 ? (
                    <span className="text-xs opacity-40 italic font-serif px-1 line-clamp-1">None listed yet. Select suggestions or enter below.</span>
                ) : (
                    items.map((item, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-1 sm:gap-1.5 pl-2 sm:pl-2.5 pr-1 py-0.5 sm:py-1 rounded-lg text-xs border transition-all max-w-full ${tagStyle}`}
                        >
                            <span className="font-bold tracking-tight truncate">• {item.name}</span>
                            {item.note && (
                                <span className={`text-[10px] italic font-normal max-w-[80px] sm:max-w-[120px] truncate opacity-75 ${isRoyal ? 'text-[#5c2a12]' : 'text-slate-400'}`}>
                                    ({item.note})
                                </span>
                            )}
                            <button
                                type="button"
                                title={item.note ? `Note: "${item.note}" (Click to edit)` : 'Add note/annotation'}
                                onClick={() => openNoteModal(idx)}
                                className={`p-0.5 sm:p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0 ${
                                    item.note ? 'text-amber-600 dark:text-amber-400 font-bold' : 'opacity-40 hover:opacity-100'
                                }`}
                            >
                                <MessageSquare size={11} />
                            </button>
                            <button
                                type="button"
                                title="Remove"
                                onClick={() => removeItem(idx)}
                                className="p-0.5 sm:p-1 rounded opacity-40 hover:opacity-100 hover:text-red-500 transition-colors shrink-0"
                            >
                                <X size={11} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Add Custom Input */}
            <div className="flex gap-1.5 sm:gap-2 min-w-0">
                <input
                    type="text"
                    value={inputVal}
                    placeholder={placeholder}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addItem(inputVal);
                        }
                    }}
                    className={`min-w-0 flex-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-xs outline-none transition-all ${
                        isRoyal
                            ? 'bg-[#fbf8ef] border-[#c8a96e]/60 text-[#2b1810] placeholder-[#8c6d48]/50 focus:border-[#70121e] font-serif'
                            : isWiki
                            ? 'bg-white border-[#d4c8af] text-[#1a1a1a] focus:border-[#b91c1c]'
                            : 'bg-slate-800 border-slate-700 text-slate-100 focus:border-amber-400'
                    }`}
                />
                <button
                    type="button"
                    onClick={() => addItem(inputVal)}
                    disabled={!inputVal.trim()}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 disabled:opacity-30 transition-all ${
                        isRoyal
                            ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e]'
                            : isWiki
                            ? 'bg-[#b91c1c] text-white'
                            : 'bg-amber-400 text-black font-black'
                    }`}
                >
                    <Plus size={13} />
                </button>
            </div>

            {/* Suggestions Chips */}
            {suggestions.length > 0 && (
                <div className="space-y-1 pt-1 min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-wider block opacity-50 flex items-center gap-1">
                        <Sparkles size={10} /> Suggested Quick-Picks
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {suggestions.map(s => {
                            const isAdded = items.some(i => i.name.toLowerCase() === s.toLowerCase());
                            return (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => !isAdded && addItem(s)}
                                    disabled={isAdded}
                                    className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-medium border transition-all truncate max-w-full ${
                                        isAdded
                                            ? 'opacity-30 cursor-default bg-black/5 border-transparent line-through'
                                            : isRoyal
                                            ? 'bg-[#ede2cc]/60 hover:bg-[#ede2cc] border-[#c8a96e]/40 text-[#451a03]'
                                            : isWiki
                                            ? 'bg-rose-50/60 hover:bg-rose-100 border-rose-200 text-rose-800'
                                            : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
                                    }`}
                                >
                                    + {s}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Note Annotation Modal */}
            {editingIndex !== null && currentItem && createPortal(
                <div data-interactive-ui="true" className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200 ${
                        isRoyal ? 'bg-[#fbf8ef] border-2 border-[#c8a96e] text-[#2b1810]' : isWiki ? 'bg-white border-[#d4c8af] text-[#2b1810]' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}>
                        <div className="flex items-center justify-between border-b pb-2 border-current/15">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={16} className={isRoyal ? 'text-[#70121e]' : 'text-amber-400'} />
                                <h3 className="text-sm font-serif font-black uppercase">
                                    Annotation for: <span className="font-bold underline">{currentItem.name}</span>
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingIndex(null)}
                                className="opacity-40 hover:opacity-100 p-1"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block">
                                Context / Historical Description
                            </label>
                            <textarea
                                autoFocus
                                rows={3}
                                value={noteDraft}
                                onChange={e => setNoteDraft(e.target.value)}
                                placeholder={`Add details regarding why this character has '${currentItem.name}'...`}
                                className={`w-full p-2.5 rounded-xl border text-xs outline-none transition-all ${
                                    isRoyal
                                        ? 'bg-[#f7f0e1] border-[#c8a96e]/60 text-[#2b1810] focus:border-[#70121e] font-serif'
                                        : isWiki
                                        ? 'bg-[#fbf8ef] border-[#d4c8af] text-black focus:border-[#b91c1c]'
                                        : 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                                }`}
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            {noteDraft.trim() ? (
                                <button
                                    type="button"
                                    onClick={() => setNoteDraft('')}
                                    className="text-[11px] text-rose-500 hover:text-rose-400 font-bold"
                                >
                                    Clear Note
                                </button>
                            ) : <div />}

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingIndex(null)}
                                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold opacity-60 hover:opacity-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={saveNote}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                                        isRoyal
                                            ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e]'
                                            : isWiki
                                            ? 'bg-[#b91c1c] text-white'
                                            : 'bg-amber-400 text-black'
                                    }`}
                                >
                                    Save Note
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
