import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, Sparkles, Check, RotateCcw, ArrowUp, ArrowDown, 
    Layers, SlidersHorizontal, Library, Globe, Swords, Scroll,
    CheckCircle2
} from 'lucide-react';
import { WorldData, EntityType } from '../../types';
import { useWorldStore } from '../../store/useWorldStore';
import { useTheme } from '../../theme';
import { TYPE_LABELS, HIERARCHY_CONFIG } from '../../constants';
import { ALL_ENTITY_TYPES, REALM_PRESETS, getActiveEntityTypes } from '../../utils/realmConfig';
import { DEFAULT_GROUP_ORDER, getOrderedHierarchy, reorderGroups } from '../../utils/sidebarConfig';
import { CodexCheckbox } from '../ui/CodexCheckbox';
import { VectorFiligreeCorner } from '../ui/VectorFiligreeCorner';

interface CategoryManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    world: WorldData;
}

const GROUP_ICONS: Record<string, any> = {
    story: Library,
    world: Globe,
    groups: Swords,
    details: Scroll
};

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
    isOpen,
    onClose,
    world
}) => {
    const { themeId, layoutMode } = useTheme();
    const isRoyal = themeId === 'royal-codex';
    const isWiki = layoutMode === 'wiki';
    const isGrandVoyager = themeId === 'grand-voyager';

    const [activeTab, setActiveTab] = useState<'categories' | 'order'>('categories');

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const currentActive = getActiveEntityTypes(world);
    const orderedHierarchy = getOrderedHierarchy(world.sidebarGroupOrder);
    const activeGroupOrder = world.sidebarGroupOrder || DEFAULT_GROUP_ORDER;

    // Toggle a single entity type
    const handleToggleType = (type: EntityType) => {
        const isActive = currentActive.includes(type);
        const next = isActive
            ? currentActive.filter(t => t !== type)
            : [...currentActive, type];
        useWorldStore.setState(state => ({
            world: { ...state.world, activeEntityTypes: next }
        }));
    };

    // Apply preset
    const handleApplyPreset = (preset: typeof REALM_PRESETS[0]) => {
        useWorldStore.setState(state => ({
            world: {
                ...state.world,
                activeEntityTypes: [...preset.activeEntityTypes],
                activeModules: { ...preset.activeModules }
            }
        }));
    };

    // Enable all
    const handleEnableAll = () => {
        useWorldStore.setState(state => ({
            world: { ...state.world, activeEntityTypes: [...ALL_ENTITY_TYPES] }
        }));
    };

    // Move group up/down
    const handleMoveGroup = (groupId: string, direction: 'up' | 'down') => {
        const next = reorderGroups(activeGroupOrder, groupId, direction);
        useWorldStore.setState(state => ({
            world: { ...state.world, sidebarGroupOrder: next }
        }));
    };

    // Reset group order
    const handleResetGroupOrder = () => {
        useWorldStore.setState(state => ({
            world: { ...state.world, sidebarGroupOrder: [...DEFAULT_GROUP_ORDER] }
        }));
    };

    // Theme styling
    const modalBg = isRoyal
        ? 'bg-[#18110b] border-2 border-[#c8a96e]/70 text-[#f5ebd7] shadow-[0_25px_70px_rgba(0,0,0,0.95)]'
        : isWiki
        ? 'bg-[#fdfcf0] border-2 border-[#d4c8af] text-[#2b1810] shadow-2xl'
        : isGrandVoyager
        ? 'bg-[#061517] border-2 border-[#2dd4bf]/40 text-[#f5e9d0] shadow-[0_25px_70px_rgba(0,0,0,0.95)]'
        : 'bg-slate-900 border-2 border-slate-700 text-slate-100 shadow-2xl';

    const cardBg = isRoyal
        ? 'bg-[#22160d] border-[#c8a96e]/25 hover:border-[#c8a96e]/60 text-[#f5ebd7]'
        : isWiki
        ? 'bg-white border-[#d4c8af] hover:border-[#b91c1c]/50 text-[#2b1810]'
        : isGrandVoyager
        ? 'bg-[#0d2225] border-[#2dd4bf]/25 hover:border-[#2dd4bf]/60 text-[#f5e9d0]'
        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-100';

    const activePresetRing = isRoyal
        ? 'ring-2 ring-[#c8a96e] border-[#c8a96e] bg-[#331c10]'
        : isWiki
        ? 'ring-2 ring-[#b91c1c] border-[#b91c1c] bg-[#fbf0e8]'
        : isGrandVoyager
        ? 'ring-2 ring-[#2dd4bf] border-[#2dd4bf] bg-[#103338]'
        : 'ring-2 ring-yellow-400 border-yellow-400 bg-slate-800';

    const modalContent = (
        <div 
            data-interactive-ui="true" 
            className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className={`relative w-full max-w-3xl rounded-3xl border flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 ${modalBg}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Royal Codex Ornate Vector Filigree Corners */}
                {isRoyal && (
                    <>
                        <VectorFiligreeCorner position="top-left" className="absolute top-2 left-2 z-20" size={24} />
                        <VectorFiligreeCorner position="top-right" className="absolute top-2 right-2 z-20" size={24} />
                        <VectorFiligreeCorner position="bottom-left" className="absolute bottom-2 left-2 z-20" size={24} />
                        <VectorFiligreeCorner position="bottom-right" className="absolute bottom-2 right-2 z-20" size={24} />
                    </>
                )}

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-current/15 relative z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                            isRoyal ? 'bg-[#2a170d] border-[#c8a96e]/50 text-[#fcd34d]' : 'bg-black/20 border-current/20'
                        }`}>
                            <SlidersHorizontal size={18} />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-serif font-black uppercase tracking-tight">
                                Codex Categories & Realm Blueprints
                            </h2>
                            <p className="text-[11px] font-sans opacity-70">
                                Configure which entity categories and group branches are visible across your chronicle.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/20 transition-all cursor-pointer shrink-0"
                        title="Close (Escape)"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation Tabs Bar */}
                <div className="flex items-center justify-between px-6 py-2.5 border-b border-current/10 bg-black/10 shrink-0">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('categories')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                                activeTab === 'categories'
                                    ? isRoyal
                                        ? 'bg-[#70121e] text-[#fff8e7] border-[#c8a96e] shadow-md'
                                        : isWiki
                                        ? 'bg-[#b91c1c] text-white border-[#b91c1c] shadow-md'
                                        : isGrandVoyager
                                        ? 'bg-[#2dd4bf] text-[#041e1e] border-teal-300 shadow-md'
                                        : 'bg-[#fef08a] text-black border-yellow-300 shadow-md'
                                    : 'border-transparent opacity-60 hover:opacity-100 hover:bg-black/10'
                            }`}
                        >
                            <Layers size={13} />
                            <span>Categories & Blueprints</span>
                            <span className="text-[10px] opacity-75 font-mono ml-0.5">
                                ({currentActive.length}/21)
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('order')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                                activeTab === 'order'
                                    ? isRoyal
                                        ? 'bg-[#70121e] text-[#fff8e7] border-[#c8a96e] shadow-md'
                                        : isWiki
                                        ? 'bg-[#b91c1c] text-white border-[#b91c1c] shadow-md'
                                        : isGrandVoyager
                                        ? 'bg-[#2dd4bf] text-[#041e1e] border-teal-300 shadow-md'
                                        : 'bg-[#fef08a] text-black border-yellow-300 shadow-md'
                                    : 'border-transparent opacity-60 hover:opacity-100 hover:bg-black/10'
                            }`}
                        >
                            <ArrowUp size={13} className="rotate-45" />
                            <span>Sidebar Group Order</span>
                        </button>
                    </div>

                    {activeTab === 'categories' ? (
                        <button
                            type="button"
                            onClick={handleEnableAll}
                            className={`text-xs font-serif font-bold transition-all cursor-pointer underline flex items-center gap-1 ${
                                isRoyal ? 'text-[#fcd34d] hover:text-white' : 'text-amber-400 hover:text-amber-300'
                            }`}
                        >
                            <CheckCircle2 size={13} />
                            <span>Enable All (21)</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResetGroupOrder}
                            className="text-xs font-serif font-bold opacity-75 hover:opacity-100 transition-all cursor-pointer flex items-center gap-1 text-amber-400 hover:underline"
                        >
                            <RotateCcw size={12} />
                            <span>Reset to Default</span>
                        </button>
                    )}
                </div>

                {/* Modal Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {activeTab === 'categories' ? (
                        <>
                            {/* Genre Quick Presets */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 flex items-center gap-1">
                                        <Sparkles size={11} className={isRoyal ? 'text-[#fcd34d]' : 'text-amber-400'} />
                                        Genre Blueprints & Presets
                                    </span>
                                    <span className="text-[10px] font-mono opacity-50">
                                        Click to switch archetype
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {REALM_PRESETS.slice(0, 6).map(preset => {
                                        const isMatch = preset.activeEntityTypes.length === currentActive.length &&
                                            preset.activeEntityTypes.every(t => currentActive.includes(t));

                                        return (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => handleApplyPreset(preset)}
                                                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[72px] ${cardBg} ${
                                                    isMatch ? activePresetRing : 'hover:scale-[1.01]'
                                                }`}
                                                title={preset.description}
                                            >
                                                <div className="flex items-center justify-between gap-1 w-full">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="text-base shrink-0">{preset.icon}</span>
                                                        <span className="font-serif font-bold text-xs truncate">
                                                            {preset.label}
                                                        </span>
                                                    </div>
                                                    {isMatch && (
                                                        <span className="w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0">
                                                            <Check size={10} strokeWidth={3} />
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-sans opacity-60 line-clamp-1 mt-1">
                                                    {preset.description}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 4 Category Groups Grid */}
                            <div className="space-y-4 pt-2">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest opacity-60 block">
                                    Active Entity Categories
                                </span>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {orderedHierarchy.map(group => {
                                        const GroupIcon = GROUP_ICONS[group.id] || Layers;
                                        const activeInGroup = group.types.filter(t => currentActive.includes(t)).length;

                                        return (
                                            <div 
                                                key={group.id} 
                                                className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                                                    isRoyal ? 'bg-black/20 border-[#c8a96e]/25' : 'bg-black/10 border-current/10'
                                                }`}
                                            >
                                                {/* Group Header */}
                                                <div className="flex items-center justify-between pb-2 border-b border-current/10">
                                                    <div className="flex items-center gap-2">
                                                        <GroupIcon size={14} className={isRoyal ? 'text-[#fcd34d]' : 'text-amber-400'} />
                                                        <span className="font-serif font-black text-xs uppercase tracking-wide">
                                                            {group.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-mono opacity-60">
                                                        {activeInGroup} / {group.types.length} Active
                                                    </span>
                                                </div>

                                                {/* Category Item Rows */}
                                                <div className="space-y-1">
                                                    {group.types.map(type => {
                                                        const isActive = currentActive.includes(type);
                                                        const count = world.entities.filter(e => e.type === type).length;

                                                        return (
                                                            <button
                                                                key={type}
                                                                type="button"
                                                                onClick={() => handleToggleType(type)}
                                                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer border ${
                                                                    isActive
                                                                        ? isRoyal
                                                                            ? 'bg-[#2a170d]/80 border-[#c8a96e]/30 text-[#fff8e7] font-semibold'
                                                                            : isWiki
                                                                            ? 'bg-rose-50/70 border-rose-200 text-[#2b1810] font-semibold'
                                                                            : 'bg-white/10 border-white/10 font-semibold'
                                                                        : 'border-transparent opacity-40 hover:opacity-75 hover:bg-black/10'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <CodexCheckbox checked={isActive} size="sm" />
                                                                    <span className="text-xs truncate font-serif">
                                                                        {TYPE_LABELS[type]}
                                                                    </span>
                                                                </div>

                                                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                                                    count > 0 ? 'bg-current/15 font-bold opacity-100' : 'opacity-40'
                                                                }`}>
                                                                    {count}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Group Order Tab */
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-serif font-bold text-sm">
                                    Sidebar Group Display Sequence
                                </h3>
                                <p className="text-xs opacity-70 mt-0.5">
                                    Reorder the four primary entity groups in the left sidebar to suit your worldbuilding focus.
                                </p>
                            </div>

                            <div className="space-y-2">
                                {activeGroupOrder.map((groupId, index) => {
                                    const conf = HIERARCHY_CONFIG.find(c => c.id === groupId);
                                    if (!conf) return null;
                                    const GroupIcon = GROUP_ICONS[groupId] || Layers;
                                    const activeCount = conf.types.filter(t => currentActive.includes(t)).length;

                                    return (
                                        <div
                                            key={groupId}
                                            className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${cardBg}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs border ${
                                                    isRoyal ? 'bg-black/30 border-[#c8a96e]/40 text-[#fcd34d]' : 'bg-black/10 border-current/20'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <GroupIcon size={14} className={isRoyal ? 'text-[#c8a96e]' : 'text-amber-400'} />
                                                        <span className="font-serif font-bold text-sm">
                                                            {conf.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-mono opacity-60">
                                                        {activeCount} of {conf.types.length} blueprints enabled
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveGroup(groupId, 'up')}
                                                    disabled={index === 0}
                                                    className="p-2 rounded-xl border border-current/15 opacity-60 hover:opacity-100 disabled:opacity-20 hover:bg-black/10 transition-all cursor-pointer disabled:cursor-not-allowed"
                                                    title="Move group up in sidebar"
                                                >
                                                    <ArrowUp size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveGroup(groupId, 'down')}
                                                    disabled={index === activeGroupOrder.length - 1}
                                                    className="p-2 rounded-xl border border-current/15 opacity-60 hover:opacity-100 disabled:opacity-20 hover:bg-black/10 transition-all cursor-pointer disabled:cursor-not-allowed"
                                                    title="Move group down in sidebar"
                                                >
                                                    <ArrowDown size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3.5 border-t border-current/15 flex items-center justify-between bg-black/15 shrink-0">
                    <span className="text-[11px] font-mono opacity-60">
                        Changes are saved instantly to your realm codex.
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-5 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                            isRoyal
                                ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e] hover:bg-[#881326]'
                                : isWiki
                                ? 'bg-[#b91c1c] text-white hover:bg-red-800'
                                : isGrandVoyager
                                ? 'bg-[#2dd4bf] text-[#041e1e] hover:bg-teal-300'
                                : 'bg-amber-400 text-black hover:bg-yellow-400 font-black'
                        }`}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
