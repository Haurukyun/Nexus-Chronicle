import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Search, Plus, Globe, Trash2, Settings,
    BarChart3, History, GitMerge, Footprints, Keyboard,
    BookMarked, CornerDownLeft, Sparkles, FileText, ArrowRight,
    User, MapPin, Calendar, Shield, Feather, Sparkle
} from 'lucide-react';
import { WorldData, EntityType } from '../../types';
import { useTheme } from '../../theme';
import { HIERARCHY_CONFIG, TYPE_LABELS, CATEGORY_COLORS } from '../../constants';
import { getEntityAliases } from '../../utils/documentModeUtils';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    world: WorldData;
    onNavigate: (id: string) => void;
    onNavigateSystem: (tabId: string) => void;
    onCreateEntity: (type: EntityType) => void;
    onOpenScratchpad: () => void;
    onOpenKeybinds: () => void;
    onExportActiveRealm: () => void;
}

interface PaletteItem {
    id: string;
    group: 'realms' | 'entities' | 'actions';
    label: string;
    sublabel?: string;
    badge?: string;
    color?: string;
    icon: React.ElementType;
    onSelect: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
    isOpen,
    onClose,
    world,
    onNavigate,
    onNavigateSystem,
    onCreateEntity,
    onOpenScratchpad,
    onOpenKeybinds,
    onExportActiveRealm
}) => {
    const { themeId, layoutMode } = useTheme();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Auto-focus input when opened & reset state
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 30);
        }
    }, [isOpen]);

    // System realm targets
    const systemRealms: Array<{
        id: string;
        label: string;
        aliases: string[];
        sublabel: string;
        icon: React.ElementType;
    }> = useMemo(() => [
        { id: 'dashboard', label: 'World Ledger & Insights', aliases: ['dashboard', 'stats', 'analytics', 'oracle', 'ledger'], sublabel: 'System Realm · Alt+1', icon: BarChart3 },
        { id: 'timeline', label: 'Chronos Timeline', aliases: ['timeline', 'chronos', 'history', 'eras', 'milestones'], sublabel: 'System Realm · Alt+2', icon: History },
        { id: 'nexus', label: 'The Nexus Relationship Graph', aliases: ['nexus', 'graph', 'tree', 'lineage', 'connections'], sublabel: 'System Realm · Alt+3', icon: GitMerge },
        { id: 'journey', label: 'The Grand Voyager', aliases: ['journey', 'voyager', 'travel', 'expedition', 'routes'], sublabel: 'System Realm · Alt+4', icon: Footprints },
        { id: 'map', label: 'Atlas & Cartography', aliases: ['map', 'atlas', 'world map', 'leylines', 'cartography'], sublabel: 'System Realm · Alt+5', icon: Globe },
        { id: 'trash', label: 'Forgotten Depth (Trash)', aliases: ['trash', 'recycle', 'archive', 'deleted'], sublabel: 'System Realm · Alt+6', icon: Trash2 },
        { id: 'options', label: 'Multiverse Registry & Settings', aliases: ['options', 'settings', 'multiverse', 'realms', 'backup'], sublabel: 'System Realm · Alt+7', icon: Settings },
    ], []);

    // Quick creation targets
    const quickCreationTypes: Array<{ type: EntityType; label: string; icon: React.ElementType }> = useMemo(() => [
        { type: 'character', label: 'Character', icon: User },
        { type: 'location', label: 'Location', icon: MapPin },
        { type: 'event', label: 'Historical Event', icon: Calendar },
        { type: 'chapter', label: 'Chronicle Chapter', icon: FileText },
        { type: 'note', label: 'Codex Note', icon: Feather },
        { type: 'item', label: 'Relic / Item', icon: Shield },
        { type: 'organization', label: 'Guild / Organization', icon: Sparkle },
        { type: 'magic', label: 'School of Magic', icon: Sparkles },
    ], []);

    // Compute matching items
    const items = useMemo<PaletteItem[]>(() => {
        const q = query.trim().toLowerCase();
        const results: PaletteItem[] = [];

        // 1. System Realms
        const matchedRealms = systemRealms.filter(realm => {
            if (!q) return true;
            return realm.label.toLowerCase().includes(q) || realm.aliases.some(a => a.includes(q));
        });

        matchedRealms.forEach(realm => {
            results.push({
                id: `realm-${realm.id}`,
                group: 'realms',
                label: realm.label,
                sublabel: realm.sublabel,
                badge: 'Realm',
                icon: realm.icon,
                onSelect: () => {
                    onNavigateSystem(realm.id);
                    onClose();
                }
            });
        });

        // 2. Quick Actions
        const matchedCreate = quickCreationTypes.filter(c => {
            if (!q) return true;
            return c.label.toLowerCase().includes(q) || c.type.toLowerCase().includes(q) || 'create'.includes(q) || 'new'.includes(q);
        });

        matchedCreate.forEach(c => {
            results.push({
                id: `create-${c.type}`,
                group: 'actions',
                label: `Create New ${c.label}`,
                sublabel: `Spawn fresh ${c.type} draft`,
                badge: 'Action',
                icon: Plus,
                onSelect: () => {
                    onCreateEntity(c.type);
                    onClose();
                }
            });
        });

        // Other special actions
        if (!q || 'scratchpad'.includes(q) || 'journal'.includes(q) || 'notes'.includes(q) || 'dm'.includes(q)) {
            results.push({
                id: 'action-scratchpad',
                group: 'actions',
                label: 'Open DM Scratchpad & Lore Journal',
                sublabel: 'Active session notes & fast roll journal · Ctrl+J',
                badge: 'Journal',
                icon: BookMarked,
                onSelect: () => {
                    onOpenScratchpad();
                    onClose();
                }
            });
        }

        if (!q || 'keybinds'.includes(q) || 'shortcuts'.includes(q) || 'grimoire'.includes(q)) {
            results.push({
                id: 'action-keybinds',
                group: 'actions',
                label: 'Grimoire of Shortcuts & Keybinds',
                sublabel: 'View all keyboard gestures and controls · ?',
                badge: 'Help',
                icon: Keyboard,
                onSelect: () => {
                    onOpenKeybinds();
                    onClose();
                }
            });
        }

        if (!q || 'export'.includes(q) || 'backup'.includes(q) || 'nexus'.includes(q)) {
            results.push({
                id: 'action-export',
                group: 'actions',
                label: 'Export Active Realm Container (.nexus)',
                sublabel: 'Save complete lore and asset vault to disk',
                badge: 'Export',
                icon: Globe,
                onSelect: () => {
                    onExportActiveRealm();
                    onClose();
                }
            });
        }

        // 3. Codex Entities (scored by match relevance)
        if (q) {
            const matchedEntities = world.entities.filter(e => {
                const nameMatch = e.name.toLowerCase().includes(q);
                const aliasMatch = getEntityAliases(e).some(a => a.toLowerCase().includes(q));
                const tagMatch = (e.tags || []).some(t => t.toLowerCase().includes(q));
                const typeMatch = e.type.toLowerCase().includes(q);
                return nameMatch || aliasMatch || tagMatch || typeMatch;
            }).slice(0, 20); // Top 20 for instant rendering

            matchedEntities.forEach(entity => {
                const cat = HIERARCHY_CONFIG.find(c => c.types.includes(entity.type));
                const catColor = cat ? CATEGORY_COLORS[cat.id] : '#94a3b8';
                const aliases = getEntityAliases(entity);

                results.push({
                    id: `entity-${entity.id}`,
                    group: 'entities',
                    label: entity.name,
                    sublabel: aliases.length > 0 ? `Alias: ${aliases.join(', ')}` : (entity.description ? entity.description.slice(0, 60) + '…' : `Codex ${TYPE_LABELS[entity.type]}`),
                    badge: TYPE_LABELS[entity.type] || entity.type,
                    color: catColor,
                    icon: FileText,
                    onSelect: () => {
                        onNavigate(entity.id);
                        onClose();
                    }
                });
            });
        }

        return results;
    }, [query, world.entities, systemRealms, quickCreationTypes, onNavigate, onNavigateSystem, onCreateEntity, onOpenScratchpad, onOpenKeybinds, onExportActiveRealm, onClose]);

    // Keep selectedIndex within bounds
    useEffect(() => {
        if (selectedIndex >= items.length) {
            setSelectedIndex(Math.max(0, items.length - 1));
        }
    }, [items.length, selectedIndex]);

    // Keyboard handlers
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % Math.max(1, items.length));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + Math.max(1, items.length)) % Math.max(1, items.length));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (items[selectedIndex]) {
                items[selectedIndex].onSelect();
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    };

    // Auto-scroll selected element into view
    useEffect(() => {
        const activeElem = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
        if (activeElem) {
            activeElem.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    if (!isOpen) return null;

    // Theme tokens
    const isRoyal = themeId === 'royal-codex';
    const isWiki = layoutMode === 'wiki';

    const modalBg = isRoyal
        ? 'bg-[#1e130c] border-2 border-[#c8a96e]/70 text-[#f7efe0] shadow-[0_30px_90px_rgba(0,0,0,0.95)]'
        : isWiki
        ? 'bg-[#fdfcf5] border border-[#d4c8af] text-[#1a1a1a] shadow-2xl'
        : 'bg-[#0f172a]/95 border border-slate-700/80 text-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.8)] backdrop-blur-xl';

    const inputBg = isRoyal
        ? 'bg-[#29170e] border-[#c8a96e]/40 text-[#fff8e7] placeholder-[#c8a96e]/40'
        : isWiki
        ? 'bg-white border-[#d4c8af] text-[#1a1a1a] placeholder-stone-400'
        : 'bg-slate-900/80 border-slate-700/70 text-white placeholder-slate-400';

    const activeItemStyle = isRoyal
        ? 'bg-[#70121e]/40 text-[#fff8e7] border-l-4 border-[#c8a96e]'
        : isWiki
        ? 'bg-[#b91c1c]/10 text-[#b91c1c] border-l-4 border-[#b91c1c]'
        : 'bg-amber-400/15 text-amber-200 border-l-4 border-amber-400';

    const inactiveItemStyle = 'border-l-4 border-transparent opacity-75 hover:opacity-100';

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 sm:pt-28 p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div
                className={`relative w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col ${modalBg} animate-in zoom-in-95 duration-150`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search bar */}
                <div className={`p-4 border-b flex items-center gap-3 ${isRoyal ? 'border-[#c8a96e]/30' : isWiki ? 'border-[#e2d5c3]' : 'border-slate-800'}`}>
                    <Search size={18} className="opacity-50 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Search entities, summon realms, or type an action... (e.g. 'Aurelius', '/timeline', 'character')"
                        className={`w-full bg-transparent border-0 outline-none text-sm font-medium ${isRoyal ? 'placeholder-[#c8a96e]/50' : 'placeholder-current/40'}`}
                    />
                    <kbd className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border shrink-0 opacity-60 ${isRoyal ? 'border-[#c8a96e]/40 bg-[#3b2315]' : isWiki ? 'border-[#d4c8af] bg-white' : 'border-slate-700 bg-slate-800'}`}>
                        ESC
                    </kbd>
                </div>

                {/* Results List */}
                <div
                    ref={listRef}
                    className="max-h-[60vh] overflow-y-auto p-2 space-y-1"
                >
                    {items.length === 0 ? (
                        <div className="py-12 text-center opacity-40">
                            <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-xs uppercase tracking-widest font-bold">No echoes found in the codex</p>
                            <p className="text-[11px] mt-1">Try searching by entity name, alias, tag, or system view</p>
                        </div>
                    ) : (
                        items.map((item, idx) => {
                            const isSelected = idx === selectedIndex;
                            const IconComponent = item.icon;

                            return (
                                <div
                                    key={item.id}
                                    data-index={idx}
                                    onClick={item.onSelect}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                                        isSelected ? activeItemStyle : inactiveItemStyle
                                    }`}
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                        style={{
                                            background: item.color ? `${item.color}20` : 'rgba(128,128,128,0.15)',
                                            color: item.color || 'inherit'
                                        }}
                                    >
                                        <IconComponent size={16} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs truncate">
                                                {item.label}
                                            </span>
                                            {item.badge && (
                                                <span
                                                    className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded font-semibold shrink-0"
                                                    style={{
                                                        background: item.color ? `${item.color}25` : 'rgba(128,128,128,0.18)',
                                                        color: item.color || 'inherit'
                                                    }}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        {item.sublabel && (
                                            <p className="text-[10px] opacity-60 truncate mt-0.5">
                                                {item.sublabel}
                                            </p>
                                        )}
                                    </div>

                                    {isSelected && (
                                        <div className="flex items-center gap-1 opacity-70 shrink-0 text-[10px] font-mono">
                                            <span>jump</span>
                                            <CornerDownLeft size={11} />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer hints */}
                <div className={`px-4 py-2 border-t flex items-center justify-between text-[10px] opacity-50 ${isRoyal ? 'border-[#c8a96e]/30 bg-[#29170e]' : isWiki ? 'border-[#e2d5c3] bg-[#f7efe0]' : 'border-slate-800 bg-slate-900/60'}`}>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 rounded bg-current/10 font-mono">↑</kbd>
                            <kbd className="px-1 rounded bg-current/10 font-mono">↓</kbd> navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 rounded bg-current/10 font-mono">↵</kbd> select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 rounded bg-current/10 font-mono">esc</kbd> close
                        </span>
                    </div>
                    <span className="italic font-serif">{world.name}</span>
                </div>
            </div>
        </div>,
        document.body
    );
};
