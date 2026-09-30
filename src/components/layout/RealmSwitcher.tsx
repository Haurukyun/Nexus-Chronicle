import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Globe, ChevronDown, Plus, Copy, Download,
    Check, Sparkles, Compass, BookMarked, Search, Layers, Settings
} from 'lucide-react';
import { WorldData, ThemeMode, WorldPhase } from '../../types';
import { useWorldStore } from '../../store/useWorldStore';
import { NewRealmModal } from '../ui/NewRealmModal';

interface RealmSwitcherProps {
    theme: ThemeMode;
    isWikiMode: boolean;
    onOpenOptions?: () => void;
}

const PHASE_COLORS: Record<WorldPhase, string> = {
    creation: '#c084fc',
    golden: '#fef08a',
    shadow: '#818cf8',
    eclipse: '#f87171',
    ruin: '#4ade80'
};

const PHASE_LABELS: Record<WorldPhase, string> = {
    creation: 'Genesis',
    golden: 'Golden Age',
    shadow: 'Twilit Gloom',
    eclipse: 'Eclipse',
    ruin: 'Forsaken Ruin'
};

export const RealmSwitcher: React.FC<RealmSwitcherProps> = ({
    theme,
    isWikiMode,
    onOpenOptions
}) => {
    const {
        world,
        worlds,
        activeWorldId,
        switchWorld,
        createWorld,
        duplicateWorld,
        exportWorld,
        setActiveTabId
    } = useWorldStore();

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const isRoyal = theme === 'royal-codex';

    // Click outside to dismiss
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const filteredWorlds = useMemo(() => {
        if (!search.trim()) return worlds;
        const q = search.toLowerCase();
        return worlds.filter(w => w.name.toLowerCase().includes(q) || w.description?.toLowerCase().includes(q));
    }, [worlds, search]);

    const accentText = isRoyal
        ? 'text-[#d4af37]'
        : isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';

    const popoverBg = isRoyal
        ? 'bg-[#181410] border-[#c8a96e]/40 text-[#f5ebd7] shadow-[0_10px_30px_rgba(0,0,0,0.9)]'
        : isWikiMode
        ? 'bg-[#fbf6ea] border-[#d4c8af] text-[#2b1810] shadow-2xl'
        : 'bg-slate-900 border-slate-700 text-slate-100 shadow-2xl';

    const triggerBg = isRoyal
        ? 'hover:bg-[#251b14] border-[#c8a96e]/20'
        : isWikiMode
        ? 'hover:bg-[#f0e8d8] border-[#d4c8af]/60'
        : 'hover:bg-white/5 border-slate-700/50';

    const activePhaseColor = PHASE_COLORS[world.worldPhase] || '#fef08a';

    const handleSelectWorld = (worldId: string) => {
        if (worldId !== activeWorldId) {
            switchWorld(worldId);
        }
        setIsOpen(false);
    };

    const handleDuplicate = (e: React.MouseEvent, w: WorldData) => {
        e.stopPropagation();
        duplicateWorld(w.id || activeWorldId);
        setIsOpen(false);
    };

    const handleExport = (e: React.MouseEvent, w: WorldData) => {
        e.stopPropagation();
        exportWorld(w.id);
    };

    const handleManageAll = () => {
        setIsOpen(false);
        setActiveTabId('options');
        if (onOpenOptions) onOpenOptions();
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Header Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className={`w-full p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 text-left group ${triggerBg}`}
                title="Switch Realm / Campaign"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                        <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105"
                            style={{
                                borderColor: `${activePhaseColor}66`,
                                backgroundColor: `${activePhaseColor}15`
                            }}
                        >
                            {isRoyal ? (
                                <Sparkles size={14} style={{ color: activePhaseColor }} />
                            ) : isWikiMode ? (
                                <BookMarked size={14} className="text-[#b91c1c]" />
                            ) : (
                                <Compass size={14} style={{ color: activePhaseColor }} />
                            )}
                        </div>
                        <span
                            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black shadow"
                            style={{ backgroundColor: activePhaseColor }}
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-serif font-black tracking-wider uppercase truncate ${accentText}`}>
                                {world.name}
                            </span>
                        </div>
                        <p className="text-[9px] opacity-60 font-mono tracking-tight flex items-center gap-1.5 truncate">
                            <span>{world.entities.length} entities</span>
                            <span>•</span>
                            <span className="capitalize">{PHASE_LABELS[world.worldPhase] || world.worldPhase}</span>
                        </p>
                    </div>
                </div>

                <ChevronDown
                    size={14}
                    className={`opacity-50 group-hover:opacity-100 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <div
                    className={`absolute left-0 top-full mt-2 w-72 rounded-2xl border z-50 p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150 ${popoverBg}`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-2 pt-1 pb-1 border-b border-current/10">
                        <div className="flex items-center gap-1.5">
                            <Layers size={13} className={accentText} />
                            <span className="text-[10px] font-black uppercase tracking-wider opacity-70">
                                Multiverse Realms ({worlds.length})
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setIsOpen(false); setIsNewModalOpen(true); }}
                            className={`p-1 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1 text-[10px] font-bold ${accentText}`}
                            title="Found New Realm"
                        >
                            <Plus size={12} /> New
                        </button>
                    </div>

                    {/* Search if multiple worlds */}
                    {worlds.length > 2 && (
                        <div className="relative px-1">
                            <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Filter realms..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`w-full pl-7 pr-2 py-1.5 rounded-lg border text-[11px] outline-none ${
                                    isRoyal
                                        ? 'bg-[#0f0a07] border-[#c8a96e]/20 text-[#f5ebd7]'
                                        : isWikiMode
                                        ? 'bg-white border-[#d4c8af] text-[#2b1810]'
                                        : 'bg-slate-800 border-slate-700 text-white'
                                }`}
                            />
                        </div>
                    )}

                    {/* Realms List */}
                    <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
                        {filteredWorlds.length === 0 ? (
                            <div className="p-3 text-center text-xs opacity-40 italic">
                                No realms match your search
                            </div>
                        ) : (
                            filteredWorlds.map((w) => {
                                const isActive = w.id === activeWorldId;
                                const phaseColor = PHASE_COLORS[w.worldPhase] || '#fef08a';

                                return (
                                    <div
                                        key={w.id}
                                        onClick={() => handleSelectWorld(w.id || activeWorldId)}
                                        className={`group/item flex items-center justify-between p-2 rounded-xl text-left cursor-pointer transition-all ${
                                            isActive
                                                ? isWikiMode
                                                    ? 'bg-[#b91c1c]/15 text-[#b91c1c] font-bold'
                                                    : 'bg-yellow-400/15 text-yellow-300 font-bold border border-yellow-400/30'
                                                : isWikiMode
                                                ? 'hover:bg-[#b91c1c]/5 opacity-80 hover:opacity-100'
                                                : 'hover:bg-white/5 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <div
                                                className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                                                style={{ backgroundColor: phaseColor }}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs truncate block font-serif">
                                                        {w.name}
                                                    </span>
                                                    {isActive && (
                                                        <Check size={12} className={accentText} />
                                                    )}
                                                </div>
                                                <p className="text-[9px] opacity-60 font-mono tracking-tight">
                                                    {w.entities?.length || 0} entities
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action buttons on hover */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={(e) => handleDuplicate(e, w)}
                                                title="Fork / Duplicate Realm"
                                                className="p-1 rounded hover:bg-white/10 text-xs transition-colors opacity-70 hover:opacity-100"
                                            >
                                                <Copy size={11} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => handleExport(e, w)}
                                                title="Export Realm JSON"
                                                className="p-1 rounded hover:bg-white/10 text-xs transition-colors opacity-70 hover:opacity-100"
                                            >
                                                <Download size={11} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-1.5 border-t border-current/10 space-y-1">
                        <button
                            type="button"
                            onClick={() => { setIsOpen(false); setIsNewModalOpen(true); }}
                            className={`w-full p-2 rounded-xl text-left flex items-center gap-2 text-xs font-bold transition-all ${
                                isWikiMode
                                    ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]'
                                    : 'bg-[#fef08a] text-black hover:bg-yellow-400'
                            }`}
                        >
                            <Plus size={13} />
                            <span>Found New Realm</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleManageAll}
                            className="w-full px-2 py-1.5 rounded-lg text-left flex items-center justify-between text-[11px] opacity-60 hover:opacity-100 hover:bg-white/5 transition-all"
                        >
                            <span className="flex items-center gap-1.5">
                                <Settings size={12} /> Multiverse Registry
                            </span>
                            <span className="text-[9px] uppercase font-mono">Options</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Found New Realm Modal */}
            <NewRealmModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onCreate={(name, desc, mapImage, phase) => {
                    createWorld(name, desc, mapImage, phase);
                }}
                theme={theme}
                isWikiMode={isWikiMode}
            />
        </div>
    );
};
