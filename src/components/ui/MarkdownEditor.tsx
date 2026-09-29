import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Eye, PenLine, Bold, Italic, Heading1, Heading2, List, Link2 } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { WorldEntity } from '../../types';

interface MarkdownEditorProps {
    value: string;
    onChange: (v: string) => void;
    allEntities: WorldEntity[];
    onNavigate?: (id: string) => void;
    isWikiMode: boolean;
    placeholder?: string;
    minHeight?: string;
    label?: string;
}

interface WikiSuggestion {
    id: string;
    name: string;
    type: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    value,
    onChange,
    allEntities,
    onNavigate,
    isWikiMode,
    placeholder = 'Write your lore here... Use [[Entity Name]] to link entities, **bold**, *italic*, # Heading',
    minHeight = 'h-72',
    label,
}) => {
    const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('split');

    // Wikilink autocomplete state
    const [suggestions, setSuggestions] = useState<WikiSuggestion[]>([]);
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [wikilinkQuery, setWikilinkQuery] = useState<string | null>(null);
    const [caretRect, setCaretRect] = useState<{ top: number; left: number } | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mirrorRef = useRef<HTMLDivElement>(null);

    const accent = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const borderFocus = isWikiMode ? 'focus:border-[#b91c1c]' : 'focus:border-[#fef08a]';
    const bg = isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/60 border-slate-700';
    const toolbarBg = isWikiMode ? 'bg-[#f0e6d2] border-[#d4c8af]' : 'bg-slate-900 border-slate-700/60';

    // --- Toolbar helpers ---
    const wrapSelection = useCallback((before: string, after: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = value.slice(start, end) || 'text';
        const newVal = value.slice(0, start) + before + selected + after + value.slice(end);
        onChange(newVal);
        setTimeout(() => {
            ta.focus();
            ta.setSelectionRange(start + before.length, start + before.length + selected.length);
        }, 0);
    }, [value, onChange]);

    const insertAtLineStart = useCallback((prefix: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const already = value.slice(lineStart).startsWith(prefix);
        const newVal = already
            ? value.slice(0, lineStart) + value.slice(lineStart + prefix.length)
            : value.slice(0, lineStart) + prefix + value.slice(lineStart);
        onChange(newVal);
        setTimeout(() => ta.focus(), 0);
    }, [value, onChange]);

    // --- Wikilink autocomplete ---
    const detectWikilink = useCallback(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        const caret = ta.selectionStart;
        const textBefore = value.slice(0, caret);
        const match = textBefore.match(/\[\[([^\]|]*)$/);
        if (match) {
            const query = match[1];
            setWikilinkQuery(query);
            const filtered = allEntities
                .filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 8)
                .map(e => ({ id: e.id, name: e.name, type: e.type }));
            setSuggestions(filtered);
            setSuggestionIndex(0);
            // Position dropdown near caret (approximation)
            const lineHeight = 24;
            const lines = textBefore.split('\n').length;
            setCaretRect({ top: Math.min(lines * lineHeight, 200), left: 16 });
        } else {
            setWikilinkQuery(null);
            setSuggestions([]);
            setCaretRect(null);
        }
    }, [value, allEntities]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    useEffect(() => {
        detectWikilink();
    }, [value, detectWikilink]);

    const applyWikilink = useCallback((entity: WikiSuggestion) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const caret = ta.selectionStart;
        const textBefore = value.slice(0, caret);
        const match = textBefore.match(/\[\[([^\]|]*)$/);
        if (!match) return;
        const openBracketPos = textBefore.length - match[0].length;
        const newVal = value.slice(0, openBracketPos) + `[[${entity.name}]]` + value.slice(caret);
        onChange(newVal);
        setWikilinkQuery(null);
        setSuggestions([]);
        setTimeout(() => {
            ta.focus();
            const pos = openBracketPos + entity.name.length + 4;
            ta.setSelectionRange(pos, pos);
        }, 0);
    }, [value, onChange]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (suggestions.length > 0 && wikilinkQuery !== null) {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSuggestionIndex(i => (i + 1) % suggestions.length); return; }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSuggestionIndex(i => (i - 1 + suggestions.length) % suggestions.length); return; }
            if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); applyWikilink(suggestions[suggestionIndex]); return; }
            if (e.key === 'Escape') { setSuggestions([]); setWikilinkQuery(null); return; }
        }
    };

    const toolbarButtons = [
        { icon: Bold, label: 'Bold', action: () => wrapSelection('**', '**') },
        { icon: Italic, label: 'Italic', action: () => wrapSelection('*', '*') },
        { icon: Heading1, label: 'H1', action: () => insertAtLineStart('# ') },
        { icon: Heading2, label: 'H2', action: () => insertAtLineStart('## ') },
        { icon: List, label: 'List', action: () => insertAtLineStart('- ') },
        { icon: Link2, label: 'Wikilink', action: () => { const ta = textareaRef.current; if (!ta) return; const pos = ta.selectionStart; const newVal = value.slice(0, pos) + '[[' + value.slice(pos); onChange(newVal); setTimeout(() => { ta.focus(); ta.setSelectionRange(pos + 2, pos + 2); }, 0); } },
    ];

    return (
        <div className="space-y-0 relative">
            {label && (
                <div className={`text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 ${accent}`}>{label}</div>
            )}

            {/* Toolbar */}
            <div className={`flex items-center gap-1 px-3 py-2 rounded-t-xl border border-b-0 ${toolbarBg}`}>
                <div className="flex items-center gap-0.5 flex-1">
                    {toolbarButtons.map(btn => (
                        <button
                            key={btn.label}
                            type="button"
                            title={btn.label}
                            onClick={btn.action}
                            className={`p-1.5 rounded-lg text-[10px] font-bold transition-colors hover:bg-white/10 ${isWikiMode ? 'text-[#593d2b]' : 'text-slate-400 hover:text-white'}`}
                        >
                            <btn.icon size={13} />
                        </button>
                    ))}
                    <span className={`ml-2 text-[9px] font-mono opacity-30 hidden sm:block`}>
                        [[Entity Name]] to link
                    </span>
                </div>

                {/* View Mode Toggle */}
                <div className={`flex items-center gap-0.5 p-1 rounded-lg ${isWikiMode ? 'bg-black/5' : 'bg-white/5'}`}>
                    {([['edit', PenLine], ['split', Eye], ['preview', Eye]] as const).map(([m, Icon], i) => (
                        <button
                            key={m}
                            type="button"
                            title={m.charAt(0).toUpperCase() + m.slice(1)}
                            onClick={() => setMode(m)}
                            className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wide transition-all flex items-center gap-1 ${
                                mode === m
                                    ? isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-[#fef08a] text-black'
                                    : 'opacity-50 hover:opacity-100'
                            }`}
                        >
                            {i === 0 ? <PenLine size={10} /> : i === 1 ? null : <Eye size={10} />}
                            {m === 'split' ? 'Split' : m === 'edit' ? 'Write' : 'View'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor Body */}
            <div className={`flex rounded-b-xl border overflow-hidden ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-700'}`}>
                {/* Textarea pane */}
                {(mode === 'edit' || mode === 'split') && (
                    <div className={`relative flex-1 ${mode === 'split' ? 'border-r' : ''} ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-700'}`}>
                        <textarea
                            ref={textareaRef}
                            className={`w-full ${minHeight} px-5 py-4 text-sm leading-relaxed font-mono outline-none resize-none ${bg} transition-colors ${borderFocus}`}
                            placeholder={placeholder}
                            value={value}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            spellCheck
                        />
                        {/* Wikilink autocomplete dropdown */}
                        {suggestions.length > 0 && caretRect && (
                            <div
                                className={`absolute z-50 min-w-[200px] max-w-[280px] rounded-2xl border shadow-2xl overflow-hidden ${isWikiMode ? 'bg-[#fdfcf0] border-[#d4c8af]' : 'bg-slate-900 border-slate-700'}`}
                                style={{ top: caretRect.top + 28, left: caretRect.left }}
                            >
                                <div className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest opacity-40 border-b ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-700'}`}>
                                    Link entity — ↑↓ navigate · Enter select · Esc cancel
                                </div>
                                {suggestions.map((s, i) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onMouseDown={(e) => { e.preventDefault(); applyWikilink(s); }}
                                        className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between gap-3 transition-colors ${
                                            i === suggestionIndex
                                                ? isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-[#fef08a] text-black'
                                                : isWikiMode ? 'hover:bg-[#b91c1c]/10' : 'hover:bg-slate-800'
                                        }`}
                                    >
                                        <span className="font-bold truncate">{s.name}</span>
                                        <span className={`text-[9px] uppercase font-mono opacity-60 shrink-0 ${i === suggestionIndex ? 'opacity-80' : ''}`}>{s.type}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Preview pane */}
                {(mode === 'preview' || mode === 'split') && (
                    <div className={`flex-1 ${minHeight} overflow-y-auto px-5 py-4 ${isWikiMode ? 'bg-[#fdfcf0]' : 'bg-slate-900/30'}`}>
                        {value.trim() ? (
                            <MarkdownRenderer
                                content={value}
                                allEntities={allEntities}
                                onNavigate={onNavigate}
                                isWikiMode={isWikiMode}
                            />
                        ) : (
                            <p className="text-xs italic opacity-30">Preview will appear here...</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
