import React from 'react';
import { X, Keyboard, Sparkles, MoveVertical, Save, Edit3, Search, FolderTree, ArrowDownRight, Compass } from 'lucide-react';
import { ThemeMode } from '../../types';
import { useTheme } from '../../theme';

interface KeybindsModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme?: ThemeMode;
    isWikiMode?: boolean;
}

interface KeybindItem {
    keys: string[];
    action: string;
    description: string;
}

interface KeybindCategory {
    title: string;
    icon: React.ElementType;
    items: KeybindItem[];
}

export const KeybindsModal: React.FC<KeybindsModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { isWikiMode, isRoyal } = useTheme();
    if (!isOpen) return null;

    const categories: KeybindCategory[] = [
        {
            title: 'Scribe & Chronicle Editor',
            icon: Save,
            items: [
                {
                    keys: ['Ctrl', 'Enter'],
                    action: 'Commit to Chronicle',
                    description: 'Saves draft changes and updates the permanent codex'
                },
                {
                    keys: ['Ctrl', 'S'],
                    action: 'Quick Save Draft',
                    description: 'Saves current draft without closing the editor'
                },
                {
                    keys: ['Ctrl', 'E'],
                    action: 'Toggle Scribe Mode',
                    description: 'Switch between reading and editing the active entity'
                },
                {
                    keys: ['Escape'],
                    action: 'Abandon Scrawl / Close',
                    description: 'Discard uncommitted draft or dismiss current dialog'
                }
            ]
        },
        {
            title: 'Sidebar Drag & Tree Reparenting',
            icon: FolderTree,
            items: [
                {
                    keys: ['Drag & Drop', 'Onto Entry'],
                    action: 'Nest As Child (Same Category)',
                    description: 'Reparents dragged item under a target entity of the same type'
                },
                {
                    keys: ['Drag & Drop', 'Top/Bottom Edge'],
                    action: 'Reorder As Sibling (Same Category)',
                    description: 'Places item above or below target entity within the same type'
                },
                {
                    keys: ['Drag & Drop', 'Onto Type Header'],
                    action: 'Unparent to Root',
                    description: 'Removes parent hierarchy and places at top-level of its category'
                }
            ]
        },
        {
            title: 'Codex Navigation & Realms',
            icon: Compass,
            items: [
                {
                    keys: ['Ctrl', 'K'],
                    action: 'Focus Codex Search',
                    description: 'Instantly jump to sidebar entity search bar'
                },
                {
                    keys: ['Alt', '1'],
                    action: 'World Ledger',
                    description: 'Open world statistics, density charts, and insights'
                },
                {
                    keys: ['Alt', '2'],
                    action: 'Chronos Timeline',
                    description: 'Inspect linear chronological history and events'
                },
                {
                    keys: ['Alt', '3'],
                    action: 'Nexus Lines',
                    description: 'View recursive tree relationship graph'
                },
                {
                    keys: ['Alt', '4'],
                    action: 'Grand Journey',
                    description: 'Open the character quest and journey view'
                },
                {
                    keys: ['Alt', '5'],
                    action: 'Atlas View',
                    description: 'Explore the high-resolution interactive cartography'
                },
                {
                    keys: ['Alt', '6'],
                    action: 'Forgotten Depth',
                    description: 'Open realm recycling and trash archive'
                },
                {
                    keys: ['Alt', '7'],
                    action: 'Multiverse Registry',
                    description: 'Open realm settings, multi-campaign switcher, and backups'
                }
            ]
        },
        {
            title: 'General Shortcuts',
            icon: Keyboard,
            items: [
                {
                    keys: ['?'],
                    action: 'Grimoire of Shortcuts',
                    description: 'Toggle this cheat sheet from anywhere outside text inputs'
                }
            ]
        }
    ];

    // Theme styles
    const modalBg = isRoyal
        ? 'bg-[#1e130c] border-2 border-[#c8a96e]/70 text-[#f7efe0] shadow-[0_25px_70px_rgba(0,0,0,0.9)]'
        : isWikiMode
        ? 'bg-[#fdfcf5] border border-[#d4c8af] text-[#1a1a1a] shadow-2xl'
        : 'bg-[#0f172a]/95 border border-slate-700/80 text-slate-100 shadow-2xl';

    const headerBg = isRoyal
        ? 'border-b border-[#c8a96e]/40 bg-[#29170e]'
        : isWikiMode
        ? 'border-b border-[#e2d5c3] bg-[#f7efe0]'
        : 'border-b border-slate-800 bg-slate-900/60';

    const kbdClass = isRoyal
        ? 'bg-[#3b2315] border border-[#c8a96e]/60 text-[#fff8e7] shadow-[0_2px_0_rgba(200,169,110,0.4)]'
        : isWikiMode
        ? 'bg-white border border-[#d4c8af] text-[#b91c1c] shadow-[0_1.5px_0_rgba(185,28,28,0.25)]'
        : 'bg-slate-800 border border-slate-600 text-yellow-400 shadow-[0_1.5px_0_rgba(234,179,8,0.3)]';

    const accentTitle = isRoyal
        ? 'text-[#fff8e7] font-serif'
        : isWikiMode
        ? 'text-[#b91c1c] font-serif'
        : 'text-[#fef08a] font-sans';

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className={`relative w-full max-w-3xl rounded-2xl overflow-hidden max-h-[85vh] flex flex-col ${modalBg} animate-in zoom-in-95 duration-200`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 ${headerBg}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isRoyal ? 'bg-[#3b2315] text-[#fff8e7]' : isWikiMode ? 'bg-[#b91c1c]/10 text-[#b91c1c]' : 'bg-yellow-500/10 text-yellow-400'}`}>
                            <Keyboard size={20} />
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold uppercase tracking-wider flex items-center gap-2 ${accentTitle}`}>
                                Grimoire of Shortcuts & Gestures
                            </h3>
                            <p className="text-xs opacity-60">Master the arcane commands of Nexus Chronicle</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-1.5 rounded-lg transition-colors ${isRoyal ? 'text-[#c8a96e] hover:bg-[#382113]' : isWikiMode ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        title="Close (Esc)"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-75">
                                <cat.icon size={14} className={isRoyal ? 'text-[#c8a96e]' : isWikiMode ? 'text-[#b91c1c]' : 'text-yellow-400'} />
                                <span>{cat.title}</span>
                            </div>

                            <div className={`rounded-xl border overflow-hidden divide-y ${
                                isRoyal
                                    ? 'border-[#c8a96e]/30 divide-[#c8a96e]/20 bg-[#25160e]/60'
                                    : isWikiMode
                                    ? 'border-[#e2d5c3] divide-[#e2d5c3] bg-white'
                                    : 'border-slate-800 divide-slate-800 bg-slate-900/40'
                            }`}>
                                {cat.items.map((item, itemIdx) => (
                                    <div 
                                        key={itemIdx}
                                        className="flex items-center justify-between px-4 py-2.5 gap-4 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-semibold">{item.action}</div>
                                            <div className="text-[11px] opacity-60 truncate">{item.description}</div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {item.keys.map((k, kIdx) => (
                                                <React.Fragment key={kIdx}>
                                                    <kbd className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${kbdClass}`}>
                                                        {k}
                                                    </kbd>
                                                    {kIdx < item.keys.length - 1 && (
                                                        <span className="text-[10px] opacity-40 font-mono">+</span>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className={`px-6 py-3 border-t flex items-center justify-between text-[11px] opacity-60 ${headerBg}`}>
                    <span>Tip: Press <kbd className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${kbdClass}`}>Esc</kbd> anytime to dismiss modals or exit edit mode.</span>
                    <button
                        onClick={onClose}
                        className={`px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                            isRoyal
                                ? 'bg-[#c8a96e] text-black hover:bg-[#dfc488]'
                                : isWikiMode
                                ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]'
                                : 'bg-yellow-400 text-black hover:bg-yellow-300'
                        }`}
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};
