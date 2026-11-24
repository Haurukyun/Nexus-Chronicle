import React, { useState, useMemo } from 'react';
import { Plus, X, MessageSquare, Check, Sparkles, SlidersHorizontal, Tag, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../theme';
import { EntityType } from '../../types';
import { TYPE_LABELS } from '../../constants';
import { useWorldStore } from '../../store/useWorldStore';
import { VectorFiligreeCorner } from '../ui/VectorFiligreeCorner';

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
    suggestionCategory?: EntityType;
}

export const TraitListEditor: React.FC<TraitListEditorProps> = ({
    label,
    value,
    onChange,
    suggestions,
    placeholder = 'Add new...',
    gridSpan = 6,
    suggestionCategory,
}) => {
    const { themeId, layoutMode } = useTheme();
    const isRoyal = themeId === 'royal-codex';
    const isWiki = layoutMode === 'wiki';

    const world = useWorldStore(state => state.world);

    const [inputVal, setInputVal] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [noteDraft, setNoteDraft] = useState('');
    const [showSuggestionModal, setShowSuggestionModal] = useState(false);
    const [newCustomSuggestion, setNewCustomSuggestion] = useState('');

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
        <div className="space-y-1.5 sm:space-y-2 min-w-0 w-full" style={{ gridColumn: `span ${gridSpan}` }}>
            <div className="flex items-center justify-between gap-1 min-w-0">
                <label className={`text-[10px] font-black uppercase tracking-wider sm:tracking-widest ${labelStyle} truncate min-w-0`}>
                    {label} ({items.length})
                </label>
                <span className="text-[9px] font-mono opacity-50 shrink-0 hidden xl:inline">Click 📝 to annotate notes</span>
            </div>

            {/* List Chips Display */}
            <div className={`min-h-[38px] sm:min-h-[46px] p-1.5 sm:p-2 rounded-xl border flex flex-wrap gap-1 sm:gap-1.5 items-center min-w-0 w-full ${
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
            <div className="flex gap-1.5 sm:gap-2 min-w-0 w-full">
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

            {/* Suggestions Chips & In-Context Bank Trigger */}
            {(suggestions.length > 0 || Boolean(suggestionCategory)) && (
                <div className="space-y-1 pt-0.5 sm:pt-1 min-w-0 w-full">
                    <div className="flex items-center justify-between min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-wider block opacity-60 flex items-center gap-1">
                            <Sparkles size={10} className={isRoyal ? 'text-[#c8a96e]' : 'text-amber-400'} /> 
                            Suggested Quick-Picks {suggestions.length > 0 && `(${suggestions.length})`}
                        </span>
                        {suggestionCategory && (
                            <button
                                type="button"
                                onClick={() => setShowSuggestionModal(true)}
                                className={`text-[9px] font-mono flex items-center gap-1 transition-all px-2 py-0.5 rounded cursor-pointer border ${
                                    isRoyal
                                        ? 'text-[#c8a96e] border-[#c8a96e]/30 hover:border-[#c8a96e] hover:bg-[#c8a96e]/15 hover:text-[#fff8e7]'
                                        : isWiki
                                        ? 'text-[#b91c1c] border-[#b91c1c]/30 hover:bg-rose-100'
                                        : 'text-amber-400 border-amber-400/30 hover:bg-white/10'
                                }`}
                                title={`Manage custom suggestions for ${TYPE_LABELS[suggestionCategory] || suggestionCategory}`}
                            >
                                <SlidersHorizontal size={10} />
                                <span>Edit Suggestions ({((world.customSuggestions && world.customSuggestions[suggestionCategory]) || []).length})</span>
                            </button>
                        )}
                    </div>

                    {suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto min-w-0 w-full">
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
                    )}
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

            {/* In-Context Suggestion Bank Modal */}
            {showSuggestionModal && suggestionCategory && createPortal(
                <div data-interactive-ui="true" className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowSuggestionModal(false)}>
                    <div 
                        className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden ${
                            isRoyal ? 'bg-[#18110b] border-2 border-[#c8a96e] text-[#f5ebd7]' : isWiki ? 'bg-[#fdfcf0] border-2 border-[#d4c8af] text-[#2b1810]' : 'bg-slate-900 border-2 border-slate-700 text-slate-100'
                        }`}
                        onClick={e => e.stopPropagation()}
                    >
                        {isRoyal && (
                            <>
                                <VectorFiligreeCorner position="top-left" className="absolute top-2 left-2 z-20" size={20} />
                                <VectorFiligreeCorner position="top-right" className="absolute top-2 right-2 z-20" size={20} />
                                <VectorFiligreeCorner position="bottom-left" className="absolute bottom-2 left-2 z-20" size={20} />
                                <VectorFiligreeCorner position="bottom-right" className="absolute bottom-2 right-2 z-20" size={20} />
                            </>
                        )}

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b pb-3 border-current/15 relative z-10">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                                    isRoyal ? 'bg-[#2a170d] border-[#c8a96e]/50 text-[#fcd34d]' : 'bg-black/20 border-current/20'
                                }`}>
                                    <Sparkles size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-serif font-black uppercase tracking-wide">
                                        Suggestion Bank: {TYPE_LABELS[suggestionCategory] || suggestionCategory}
                                    </h3>
                                    <p className="text-[10px] font-sans opacity-70">
                                        Custom keywords and traits for {label}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSuggestionModal(false)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100 hover:bg-black/10 cursor-pointer"
                                title="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Add Suggestion Input */}
                        <div className="space-y-1.5 relative z-10">
                            <label className="text-[10px] font-black uppercase tracking-wider opacity-70 block font-mono">
                                Add New Custom Suggestion
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    autoFocus
                                    value={newCustomSuggestion}
                                    onChange={e => setNewCustomSuggestion(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const trimmed = newCustomSuggestion.trim();
                                            if (!trimmed) return;
                                            const current = world.customSuggestions?.[suggestionCategory] || [];
                                            if (!current.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
                                                useWorldStore.setState(state => ({
                                                    world: {
                                                        ...state.world,
                                                        customSuggestions: {
                                                            ...(state.world.customSuggestions || {}),
                                                            [suggestionCategory]: [...current, trimmed]
                                                        }
                                                    }
                                                }));
                                            }
                                            setNewCustomSuggestion('');
                                        }
                                    }}
                                    placeholder={`e.g. Iron Will, Photographic Memory, Arcane Eye...`}
                                    className={`flex-1 px-3 py-2 rounded-xl border text-xs outline-none transition-all ${
                                        isRoyal
                                            ? 'bg-[#22160d] border-[#c8a96e]/40 text-[#f5ebd7] placeholder-[#c8a96e]/40 focus:border-[#c8a96e]'
                                            : isWiki
                                            ? 'bg-white border-[#d4c8af] text-[#2b1810]'
                                            : 'bg-slate-800 border-slate-700 text-slate-100'
                                    }`}
                                />
                                <button
                                    type="button"
                                    disabled={!newCustomSuggestion.trim()}
                                    onClick={() => {
                                        const trimmed = newCustomSuggestion.trim();
                                        if (!trimmed) return;
                                        const current = world.customSuggestions?.[suggestionCategory] || [];
                                        if (!current.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
                                            useWorldStore.setState(state => ({
                                                world: {
                                                    ...state.world,
                                                    customSuggestions: {
                                                        ...(state.world.customSuggestions || {}),
                                                        [suggestionCategory]: [...current, trimmed]
                                                    }
                                                }
                                            }));
                                        }
                                        setNewCustomSuggestion('');
                                    }}
                                    className={`px-3 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider shrink-0 disabled:opacity-30 cursor-pointer shadow-sm ${
                                        isRoyal
                                            ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e]'
                                            : isWiki
                                            ? 'bg-[#b91c1c] text-white'
                                            : 'bg-amber-400 text-black font-black'
                                    }`}
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Active Registered Suggestions List */}
                        <div className="space-y-2 relative z-10">
                            <div className="flex items-center justify-between text-[10px] font-mono opacity-70">
                                <span>Custom Suggestions ({(world.customSuggestions?.[suggestionCategory] || []).length})</span>
                                {(world.customSuggestions?.[suggestionCategory] || []).length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            useWorldStore.setState(state => ({
                                                world: {
                                                    ...state.world,
                                                    customSuggestions: {
                                                        ...(state.world.customSuggestions || {}),
                                                        [suggestionCategory]: []
                                                    }
                                                }
                                            }));
                                        }}
                                        className="text-red-400 hover:text-red-300 underline cursor-pointer text-[9px]"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            <div className={`p-3 rounded-2xl border min-h-[90px] max-h-48 overflow-y-auto flex flex-wrap gap-1.5 items-start custom-scrollbar ${
                                isRoyal ? 'bg-[#100a06] border-[#c8a96e]/20' : 'bg-black/10 border-current/10'
                            }`}>
                                {(world.customSuggestions?.[suggestionCategory] || []).length === 0 ? (
                                    <p className="text-xs font-serif italic opacity-50 py-3 px-2 text-center w-full">
                                        No custom suggestions registered yet for {TYPE_LABELS[suggestionCategory]}. Type a trait or keyword above and press Add!
                                    </p>
                                ) : (
                                    (world.customSuggestions?.[suggestionCategory] || []).map((sugg, idx) => (
                                        <div
                                            key={`${sugg}-${idx}`}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-serif border ${
                                                isRoyal
                                                    ? 'bg-[#2a170d] border-[#c8a96e]/40 text-[#f5ebd7]'
                                                    : isWiki
                                                    ? 'bg-white border-[#d4c8af] text-[#2b1810]'
                                                    : 'bg-slate-800 border-slate-700 text-slate-200'
                                            }`}
                                        >
                                            <span>{sugg}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    useWorldStore.setState(state => ({
                                                        world: {
                                                            ...state.world,
                                                            customSuggestions: {
                                                                ...(state.world.customSuggestions || {}),
                                                                [suggestionCategory]: (state.world.customSuggestions?.[suggestionCategory] || []).filter((_, i) => i !== idx)
                                                            }
                                                        }
                                                    }));
                                                }}
                                                className="opacity-40 hover:opacity-100 hover:text-red-400 p-0.5 ml-0.5 cursor-pointer"
                                                title={`Remove "${sugg}"`}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-2 border-t border-current/15 flex items-center justify-between relative z-10">
                            <span className="text-[10px] font-sans opacity-60">
                                💡 Suggestions appear automatically across all {TYPE_LABELS[suggestionCategory]} editors.
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowSuggestionModal(false)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-serif font-bold uppercase tracking-wider cursor-pointer ${
                                    isRoyal
                                        ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e]'
                                        : isWiki
                                        ? 'bg-[#b91c1c] text-white'
                                        : 'bg-amber-400 text-black font-black'
                                }`}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
