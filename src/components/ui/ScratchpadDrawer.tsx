import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    BookMarked, X, Dices, FileText, Sparkles, Trash2,
    Eye, Edit3, Columns, Bold, Italic, Heading, List,
    Quote, Link2, ArrowRight, Check, Plus, Clock
} from 'lucide-react';
import { WorldData, WorldEntity, EntityType } from '../../types';
import { useTheme } from '../../theme';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TYPE_LABELS } from '../../constants';

interface ScratchpadDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    world: WorldData;
    scratchpadNote: string;
    onUpdateNote: (note: string) => void;
    onNavigate: (id: string) => void;
    handleCreate: (type: EntityType, name?: string, shouldOpen?: boolean) => string;
    drafts: Record<string, WorldEntity>;
    setDrafts: React.Dispatch<React.SetStateAction<Record<string, WorldEntity>>>;
}

type EditorViewMode = 'write' | 'preview' | 'split';

export const ScratchpadDrawer: React.FC<ScratchpadDrawerProps> = ({
    isOpen,
    onClose,
    world,
    scratchpadNote,
    onUpdateNote,
    onNavigate,
    handleCreate,
    drafts,
    setDrafts,
}) => {
    const { themeId, layoutMode } = useTheme();
    const [viewMode, setViewMode] = useState<EditorViewMode>('write');
    const [lastRollMessage, setLastRollMessage] = useState<string | null>(null);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [convertType, setConvertType] = useState<EntityType>('note');
    const [convertTitle, setConvertTitle] = useState('');
    const [clearScratchpadAfterConvert, setClearScratchpadAfterConvert] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-focus textarea when drawer opens
    useEffect(() => {
        if (isOpen && viewMode !== 'preview') {
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 50);
        }
    }, [isOpen, viewMode]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showConvertModal) {
                    setShowConvertModal(false);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, showConvertModal, onClose]);

    if (!isOpen) return null;

    // Helper to insert markdown or text at cursor
    const insertAtCursor = (prefix: string, suffix: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentText = scratchpadNote;
        const selected = currentText.substring(start, end);

        const newText = currentText.substring(0, start) + prefix + selected + suffix + currentText.substring(end);
        onUpdateNote(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 10);
    };

    // Dice rolling utilities
    const rollDie = (sides: number) => {
        const roll = Math.floor(Math.random() * sides) + 1;
        const rollText = `\n> 🎲 **d${sides} Roll**: **${roll}** *(1-${sides})*\n`;
        const next = scratchpadNote ? `${scratchpadNote.trimEnd()}\n${rollText}\n` : `${rollText}\n`;
        onUpdateNote(next);
        setLastRollMessage(`Rolled d${sides}: ${roll}`);
        setTimeout(() => setLastRollMessage(null), 3500);
    };

    const rollOracle = (odds: 'likely' | 'even' | 'unlikely') => {
        // Mythic GME inspired d20 Oracle table
        const roll = Math.floor(Math.random() * 20) + 1;
        let outcome = '';

        if (odds === 'likely') {
            if (roll >= 19) outcome = 'Exceptional Yes! (Yes, and...)';
            else if (roll >= 8) outcome = 'Yes';
            else if (roll >= 4) outcome = 'Yes, but...';
            else outcome = 'No';
        } else if (odds === 'even') {
            if (roll >= 20) outcome = 'Exceptional Yes! (Yes, and...)';
            else if (roll >= 11) outcome = 'Yes';
            else if (roll >= 9) outcome = 'Yes, but...';
            else if (roll >= 3) outcome = 'No';
            else outcome = 'Exceptional No! (No, and...)';
        } else {
            if (roll >= 17) outcome = 'Yes';
            else if (roll >= 14) outcome = 'Yes, but...';
            else if (roll >= 4) outcome = 'No';
            else outcome = 'Exceptional No! (No, and...)';
        }

        const oracleText = `\n> 🔮 **Oracle (${odds.toUpperCase()})**: **${outcome}** *(d20: ${roll})*\n`;
        const next = scratchpadNote ? `${scratchpadNote.trimEnd()}\n${oracleText}\n` : `${oracleText}\n`;
        onUpdateNote(next);
        setLastRollMessage(`Oracle: ${outcome}`);
        setTimeout(() => setLastRollMessage(null), 4000);
    };

    // Conversion to Entity
    const handleOpenConvert = () => {
        // Derive initial title from first line of note
        const firstLine = scratchpadNote.split('\n')[0].replace(/^[#>* -]+/, '').trim();
        setConvertTitle(firstLine.slice(0, 40) || `Session Note (${new Date().toLocaleDateString()})`);
        setShowConvertModal(true);
    };

    const handleConfirmConvert = () => {
        const title = convertTitle.trim() || `Session Note (${new Date().toLocaleDateString()})`;
        const content = scratchpadNote.trim();

        // Spawn entity via store handleCreate
        const newEntityId = handleCreate(convertType, title, true);

        // Update the new entity's description / content in drafts immediately
        setDrafts(prev => {
            const existing = prev[newEntityId];
            if (!existing) return prev;
            return {
                ...prev,
                [newEntityId]: {
                    ...existing,
                    name: title,
                    description: content,
                    ...(convertType === 'chapter' ? { content } : {})
                }
            };
        });

        if (clearScratchpadAfterConvert) {
            onUpdateNote('');
        }

        setShowConvertModal(false);
        onClose();
        onNavigate(newEntityId);
    };

    // Word and character count
    const words = scratchpadNote.trim() ? scratchpadNote.trim().split(/\s+/).length : 0;
    const chars = scratchpadNote.length;

    // Theme tokens
    const isRoyal = themeId === 'royal-codex';
    const isWiki = layoutMode === 'wiki';

    const drawerBg = isRoyal
        ? 'bg-[#1e130c] border-l-2 border-[#c8a96e]/70 text-[#f7efe0] shadow-[-25px_0_70px_rgba(0,0,0,0.95)]'
        : isWiki
        ? 'bg-[#fdfcf5] border-l border-[#d4c8af] text-[#1a1a1a] shadow-2xl'
        : 'bg-[#0f172a]/95 border-l border-slate-700/80 text-slate-100 shadow-[-25px_0_70px_rgba(0,0,0,0.8)] backdrop-blur-xl';

    const headerBorder = isRoyal ? 'border-[#c8a96e]/30 bg-[#29170e]' : isWiki ? 'border-[#e2d5c3] bg-[#f7efe0]' : 'border-slate-800 bg-slate-900/60';
    const toolbarBg = isRoyal ? 'bg-[#29170e]/80 border-b border-[#c8a96e]/20' : isWiki ? 'bg-stone-100 border-b border-[#d4c8af]' : 'bg-slate-900/40 border-b border-slate-800';

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className={`relative w-full max-w-2xl h-full flex flex-col ${drawerBg} animate-in slide-in-from-right duration-250`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drawer Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${headerBorder}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isRoyal ? 'bg-[#3b2315] text-[#fff8e7]' : isWiki ? 'bg-[#b91c1c]/10 text-[#b91c1c]' : 'bg-amber-500/10 text-amber-300'}`}>
                            <BookMarked size={18} />
                        </div>
                        <div>
                            <h3 className={`font-bold text-sm uppercase tracking-wider flex items-center gap-2 ${isRoyal ? 'text-[#fff8e7] font-serif' : isWiki ? 'text-[#b91c1c] font-serif' : 'text-amber-200'}`}>
                                DM Scratchpad & Lore Journal
                            </h3>
                            <p className="text-[10px] opacity-60">Floating session scratchpad · Saved automatically</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View mode toggle */}
                        <div className={`flex items-center rounded-lg border p-0.5 text-xs ${isRoyal ? 'border-[#c8a96e]/30 bg-[#29170e]' : isWiki ? 'border-[#d4c8af] bg-white' : 'border-slate-700 bg-slate-800'}`}>
                            <button
                                onClick={() => setViewMode('write')}
                                title="Write Mode"
                                className={`p-1.5 rounded ${viewMode === 'write' ? 'bg-black/20 font-bold opacity-100' : 'opacity-50 hover:opacity-100'}`}
                            >
                                <Edit3 size={13} />
                            </button>
                            <button
                                onClick={() => setViewMode('split')}
                                title="Split View"
                                className={`p-1.5 rounded hidden sm:block ${viewMode === 'split' ? 'bg-black/20 font-bold opacity-100' : 'opacity-50 hover:opacity-100'}`}
                            >
                                <Columns size={13} />
                            </button>
                            <button
                                onClick={() => setViewMode('preview')}
                                title="Preview Mode"
                                className={`p-1.5 rounded ${viewMode === 'preview' ? 'bg-black/20 font-bold opacity-100' : 'opacity-50 hover:opacity-100'}`}
                            >
                                <Eye size={13} />
                            </button>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Quick Dice Roller & Oracle Bar */}
                <div className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs ${toolbarBg}`}>
                    <div className="flex items-center gap-1 overflow-x-auto">
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-50 flex items-center gap-1 mr-1">
                            <Dices size={12} /> Roll:
                        </span>
                        {[4, 6, 8, 10, 12, 20, 100].map((d) => (
                            <button
                                key={d}
                                onClick={() => rollDie(d)}
                                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all border ${
                                    isRoyal
                                        ? 'border-[#c8a96e]/30 bg-[#3b2315]/80 hover:bg-[#70121e]/50 text-[#fff8e7]'
                                        : isWiki
                                        ? 'border-[#d4c8af] bg-white hover:bg-stone-50 text-stone-800'
                                        : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                                }`}
                            >
                                d{d}
                            </button>
                        ))}

                        <div className="h-4 w-px bg-current/20 mx-1" />

                        {/* Oracle Buttons */}
                        <button
                            onClick={() => rollOracle('likely')}
                            title="Oracle: Likely odds"
                            className="px-2 py-1 rounded text-[10px] font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        >
                            Likely?
                        </button>
                        <button
                            onClick={() => rollOracle('even')}
                            title="Oracle: 50/50 Even odds"
                            className="px-2 py-1 rounded text-[10px] font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                        >
                            50/50?
                        </button>
                        <button
                            onClick={() => rollOracle('unlikely')}
                            title="Oracle: Unlikely odds"
                            className="px-2 py-1 rounded text-[10px] font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        >
                            Unlikely?
                        </button>
                    </div>

                    {lastRollMessage && (
                        <div className="text-[10px] font-bold text-amber-300 animate-pulse">
                            {lastRollMessage}
                        </div>
                    )}
                </div>

                {/* Markdown Formatting Toolbar */}
                {viewMode !== 'preview' && (
                    <div className={`px-4 py-1.5 border-b flex items-center gap-1 shrink-0 ${toolbarBg}`}>
                        <button
                            onClick={() => insertAtCursor('**', '**')}
                            title="Bold"
                            className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-current/10"
                        >
                            <Bold size={13} />
                        </button>
                        <button
                            onClick={() => insertAtCursor('*', '*')}
                            title="Italic"
                            className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-current/10"
                        >
                            <Italic size={13} />
                        </button>
                        <button
                            onClick={() => insertAtCursor('### ')}
                            title="Heading"
                            className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-current/10"
                        >
                            <Heading size={13} />
                        </button>
                        <button
                            onClick={() => insertAtCursor('- ')}
                            title="Bullet List"
                            className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-current/10"
                        >
                            <List size={13} />
                        </button>
                        <button
                            onClick={() => insertAtCursor('> ')}
                            title="Quote"
                            className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-current/10"
                        >
                            <Quote size={13} />
                        </button>
                        <button
                            onClick={() => insertAtCursor('[[', ']]')}
                            title="Wikilink [[Entity]]"
                            className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-current/10 flex items-center gap-0.5 text-[10px]"
                        >
                            <Link2 size={13} />
                            <span className="font-mono text-[9px]">[[link]]</span>
                        </button>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden p-4 gap-4">
                    {/* Write mode or Split left */}
                    {(viewMode === 'write' || viewMode === 'split') && (
                        <div className="flex-1 flex flex-col h-full min-w-0">
                            <textarea
                                ref={textareaRef}
                                value={scratchpadNote}
                                onChange={(e) => onUpdateNote(e.target.value)}
                                placeholder="Jot down active session thoughts, spontaneous NPC dialogues, encounter seeds, or quick rolls here... (Markdown & [[Wikilinks]] supported)"
                                className={`w-full h-full resize-none bg-transparent border-0 outline-none font-mono text-xs leading-relaxed p-2 ${
                                    isRoyal ? 'placeholder-[#c8a96e]/40' : 'placeholder-current/30'
                                }`}
                            />
                        </div>
                    )}

                    {/* Split Divider */}
                    {viewMode === 'split' && (
                        <div className={`w-px shrink-0 ${isRoyal ? 'bg-[#c8a96e]/20' : isWiki ? 'bg-[#d4c8af]' : 'bg-slate-800'}`} />
                    )}

                    {/* Preview mode or Split right */}
                    {(viewMode === 'preview' || viewMode === 'split') && (
                        <div className="flex-1 h-full overflow-y-auto p-2 min-w-0">
                            {scratchpadNote.trim() ? (
                                <MarkdownRenderer
                                    content={scratchpadNote}
                                    allEntities={world.entities}
                                    onNavigate={onNavigate}
                                    isWikiMode={isWiki}
                                    className="text-xs"
                                />
                            ) : (
                                <p className="opacity-30 italic text-xs py-8 text-center">
                                    Scratchpad is empty. Switch to write mode to start scrawling.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Drawer Footer Actions */}
                <div className={`px-6 py-3 border-t flex items-center justify-between shrink-0 text-xs ${headerBorder}`}>
                    <div className="flex items-center gap-3 opacity-60 text-[10px]">
                        <span>{words} words</span>
                        <span>·</span>
                        <span>{chars} characters</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {scratchpadNote.trim() && (
                            <button
                                onClick={() => {
                                    if (confirm('Clear the entire scratchpad? This cannot be undone.')) {
                                        onUpdateNote('');
                                    }
                                }}
                                title="Clear Scratchpad"
                                className="p-2 rounded-lg opacity-50 hover:opacity-100 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}

                        <button
                            onClick={handleOpenConvert}
                            disabled={!scratchpadNote.trim()}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all border ${
                                !scratchpadNote.trim()
                                    ? 'opacity-30 cursor-not-allowed'
                                    : isRoyal
                                    ? 'border-[#c8a96e] bg-[#70121e] text-[#fff8e7] hover:bg-[#851624] shadow-md'
                                    : isWiki
                                    ? 'border-[#b91c1c] bg-[#b91c1c] text-white hover:bg-[#991b1b]'
                                    : 'border-amber-400/50 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
                            }`}
                        >
                            <FileText size={12} />
                            <span>Convert to Entry</span>
                            <ArrowRight size={11} />
                        </button>
                    </div>
                </div>

                {/* Convert to Entry Modal */}
                {showConvertModal && (
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-in fade-in duration-150"
                        onClick={() => setShowConvertModal(false)}
                    >
                        <div
                            className={`w-full max-w-md rounded-2xl border p-6 flex flex-col gap-4 shadow-2xl ${drawerBg}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles size={16} className="text-amber-400" />
                                    Convert Scratchpad to Codex Entry
                                </h4>
                                <button
                                    onClick={() => setShowConvertModal(false)}
                                    className="opacity-50 hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <p className="text-xs opacity-70">
                                This will generate a new record with the current scratchpad contents placed into its primary description.
                            </p>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold tracking-wider opacity-60 block mb-1">
                                        Entry Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['note', 'chapter', 'myth', 'event'] as EntityType[]).map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setConvertType(t)}
                                                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                                                    convertType === t
                                                        ? 'border-amber-400 bg-amber-400/20 text-amber-200 font-bold'
                                                        : 'border-current/20 opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                <span>{TYPE_LABELS[t] || t}</span>
                                                {convertType === t && <Check size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase font-bold tracking-wider opacity-60 block mb-1">
                                        Entry Title
                                    </label>
                                    <input
                                        type="text"
                                        value={convertTitle}
                                        onChange={(e) => setConvertTitle(e.target.value)}
                                        placeholder="Enter entry title..."
                                        className={`w-full px-3 py-2 rounded-xl border text-xs bg-black/20 outline-none ${
                                            isRoyal ? 'border-[#c8a96e]/40' : 'border-current/20'
                                        }`}
                                    />
                                </div>

                                <label className="flex items-center gap-2 text-xs opacity-75 cursor-pointer pt-1">
                                    <input
                                        type="checkbox"
                                        checked={clearScratchpadAfterConvert}
                                        onChange={(e) => setClearScratchpadAfterConvert(e.target.checked)}
                                        className="rounded"
                                    />
                                    <span>Clear scratchpad after converting</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowConvertModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs opacity-70 hover:opacity-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmConvert}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                                        isRoyal
                                            ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#851624]'
                                            : isWiki
                                            ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]'
                                            : 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                                    }`}
                                >
                                    Spawn & Open Entry
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
