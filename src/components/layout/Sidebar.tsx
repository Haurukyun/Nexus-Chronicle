import React, { useMemo, useState, useRef } from 'react';
import { 
    Search, Plus, Trash2, BarChart3, History, GitMerge, 
    Footprints, Globe, Settings, BookMarked, Compass, 
    ChevronRight, ChevronDown, GripVertical, Folder
} from 'lucide-react';
import { isEntityDeceased, isEntityCategory, isEntityFinished, isEntityMinor } from '../../utils/documentModeUtils';
import { EntityType, ThemeMode, WorldData, WorldEntity } from '../../types';
import { HIERARCHY_CONFIG, TYPE_LABELS } from '../../constants';
import { useWorldStore } from '../../store/useWorldStore';
import { useTheme } from '../../theme';
import { RealmSwitcher } from './RealmSwitcher';

interface SidebarProps {
    world: WorldData;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    expandedCategories: string[];
    setExpandedCategories: (update: string[] | ((prev: string[]) => string[])) => void;
    activeTabId: string;
    setActiveTabId: (id: string | any) => void;
    handleOpenEntity: (id: string) => void;
    handleCreate: (type: EntityType, name?: string, shouldOpen?: boolean) => string;
    handleDeleteToTrash: (entity: WorldEntity) => void;
    theme?: ThemeMode;
    setTheme?: (theme: ThemeMode) => void;
}


/**
 * Safely resolves the parent ID of an entity.
 * An entity only has a valid parent if:
 * 1. parentId is not null/empty
 * 2. parentId !== entity.id (never self)
 * 3. Parent exists in allEntities
 * 4. Parent has the exact SAME entity type (strict category boundary)
 * 5. Parent chain contains NO circular loops
 * 
 * If ANY condition fails, returns null — ensuring the entity is 
 * immediately treated as a ROOT entity and NEVER lost or hidden from the tree.
 */
function getSafeParentId(entity: WorldEntity, allEntities: WorldEntity[]): string | null {
    if (!entity.parentId || entity.parentId === entity.id) return null;
    const parent = allEntities.find(e => e.id === entity.parentId);
    if (!parent || parent.type !== entity.type) return null;

    // Check circular references up the ancestor chain
    const visited = new Set<string>([entity.id]);
    let curr: WorldEntity | undefined = parent;
    while (curr) {
        if (visited.has(curr.id)) {
            // Cycle detected! Break cycle so entity is never lost
            return null;
        }
        visited.add(curr.id);
        if (!curr.parentId || curr.parentId === curr.id) break;
        curr = allEntities.find(e => e.id === curr?.parentId);
    }
    return parent.id;
}

// Synchronous drag tracking to prevent React state batching race conditions on initial drag frame
let activeDraggedId: string | null = null;
let activeDraggedType: EntityType | null = null;

const EntityItem: React.FC<{
    entity: WorldEntity;
    depth: number;
    allEntities: WorldEntity[];
    activeTabId: string;
    handleOpenEntity: (id: string) => void;
    handleDeleteToTrash: (entity: WorldEntity) => void;
    theme?: ThemeMode;
    draggedEntityId: string | null;
    setDraggedEntityId: (id: string | null) => void;
    onReorderAndReparent: (draggedId: string, targetId: string | null, position: 'before' | 'after' | 'inside', targetType?: EntityType) => void;
}> = ({ 
    entity, depth, allEntities, activeTabId, handleOpenEntity, handleDeleteToTrash, draggedEntityId, setDraggedEntityId, onReorderAndReparent 
}) => {
    const { themeId, layoutMode } = useTheme();
    const [isExpanded, setIsExpanded] = useState(true);
    const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const dragCounter = useRef(0);

    // Bulletproof child lookup: Only includes entities whose safe parent is this entity
    const children = allEntities.filter(e => getSafeParentId(e, allEntities) === entity.id);
    const hasChildren = children.length > 0;
    const isActive = activeTabId === entity.id;
    const currentDraggedId = draggedEntityId || activeDraggedId;
    const isBeingDragged = currentDraggedId === entity.id;

    // Target is invalid if it's the dragged entity itself, a descendant, or a DIFFERENT entity type
    const isInvalidTarget = useMemo(() => {
        const activeId = draggedEntityId || activeDraggedId;
        if (!activeId || activeId === entity.id) return true;
        const draggedEntity = allEntities.find(e => e.id === activeId);
        // STRICT TYPE MATCH: Cannot drag or reparent across different categories/types!
        if (!draggedEntity || draggedEntity.type !== entity.type) return true;

        const visited = new Set<string>([activeId]);
        let cur = allEntities.find(e => e.id === entity.id);
        while (cur && cur.parentId) {
            if (visited.has(cur.id) || cur.parentId === activeId) return true;
            visited.add(cur.id);
            cur = allEntities.find(e => e.id === cur.parentId);
        }
        return false;
    }, [draggedEntityId, entity.id, entity.type, allEntities]);
    
    const customStyle: React.CSSProperties = {
        paddingLeft: `${depth * 12 + 6}px`,
        color: entity.documentColor || undefined,
        backgroundColor: isActive ? undefined : (entity.documentBackgroundColor || undefined)
    };

    const activeStyle = (themeId === 'grand-voyager')
        ? 'bg-gradient-to-r from-[#1f0e04] to-[#2a1408] text-[#2dd4bf] border-l-4 border-[#14b8a6] shadow-lg shadow-teal-950/40 font-bold'
        : (themeId === 'royal-codex')
        ? 'bg-gradient-to-r from-[#382315] via-[#2d180d] to-[#24130a] text-[#fff8e7] border-y border-[#c8a96e]/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] font-serif font-bold text-xs'
        : (layoutMode === 'wiki')
        ? 'bg-[#b91c1c] text-white shadow-md'
        : 'bg-slate-800 text-[#fef08a] border-l-4 border-yellow-500 shadow-xl shadow-yellow-500/5';

    const hoverStyle = (themeId === 'grand-voyager')
        ? 'hover:bg-[#2a1408]/60 text-[#9a8060] hover:text-[#f0dca8]'
        : (themeId === 'royal-codex')
        ? 'hover:bg-[#2a150a]/60 text-[#c8a96e]/90 hover:text-[#fff8e7] font-serif text-xs font-semibold'
        : 'hover:bg-white/5 opacity-70 hover:opacity-100';

    let dropIndicatorClass = '';
    if (dropPosition === 'before') {
        dropIndicatorClass = (themeId === 'grand-voyager')
            ? 'shadow-[inset_0_2px_0_0_#2dd4bf]'
            : (themeId === 'royal-codex') 
            ? 'shadow-[inset_0_2px_0_0_#d4af37]'
            : (layoutMode === 'wiki')
            ? 'shadow-[inset_0_2px_0_0_#b91c1c]'
            : 'shadow-[inset_0_2px_0_0_#facc15]';
    } else if (dropPosition === 'after') {
        dropIndicatorClass = (themeId === 'grand-voyager')
            ? 'shadow-[inset_0_-2px_0_0_#2dd4bf]'
            : (themeId === 'royal-codex') 
            ? 'shadow-[inset_0_-2px_0_0_#d4af37]'
            : (layoutMode === 'wiki')
            ? 'shadow-[inset_0_-2px_0_0_#b91c1c]'
            : 'shadow-[inset_0_-2px_0_0_#facc15]';
    } else if (dropPosition === 'inside') {
        dropIndicatorClass = (themeId === 'grand-voyager')
            ? 'ring-2 ring-[#2dd4bf] bg-[#0f766e]/25 shadow-inner'
            : (themeId === 'royal-codex') 
            ? 'ring-2 ring-[#d4af37] bg-[#3d2315] shadow-inner'
            : (layoutMode === 'wiki')
            ? 'ring-2 ring-[#b91c1c] bg-[#b91c1c]/15'
            : 'ring-2 ring-yellow-400 bg-yellow-500/20';
    }

    return (
        <div className="space-y-px">
            <div 
                draggable={true}
                onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData('text/plain', entity.id);
                    e.dataTransfer.effectAllowed = 'move';
                    activeDraggedId = entity.id;
                    activeDraggedType = entity.type;
                    dragCounter.current = 0;
                    setDraggedEntityId(entity.id);
                }}
                onDragEnd={() => {
                    activeDraggedId = null;
                    activeDraggedType = null;
                    dragCounter.current = 0;
                    setDraggedEntityId(null);
                    setDropPosition(null);
                }}
                onDragEnter={(e) => {
                    const activeId = draggedEntityId || activeDraggedId;
                    if (activeId === entity.id) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = 'move';
                        return;
                    }
                    if (isInvalidTarget) {
                        if (activeId) {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'none';
                        }
                        return;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'move';
                    dragCounter.current += 1;
                }}
                onDragOver={(e) => {
                    const activeId = draggedEntityId || activeDraggedId;
                    if (activeId === entity.id) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = 'move';
                        return;
                    }
                    if (isInvalidTarget) {
                        if (activeId) {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'none';
                        }
                        return;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'move';

                    const rect = e.currentTarget.getBoundingClientRect();
                    const offsetY = e.clientY - rect.top;
                    const height = rect.height;

                    let newPos: 'before' | 'after' | 'inside';
                    if (offsetY < height * 0.25) {
                        newPos = 'before';
                    } else if (offsetY > height * 0.75) {
                        newPos = 'after';
                    } else {
                        newPos = 'inside';
                    }

                    if (newPos !== dropPosition) {
                        setDropPosition(newPos);
                    }
                }}
                onDragLeave={(e) => {
                    e.stopPropagation();
                    dragCounter.current -= 1;
                    if (dragCounter.current <= 0) {
                        dragCounter.current = 0;
                        setDropPosition(null);
                    }
                }}
                onDrop={(e) => {
                    dragCounter.current = 0;
                    const finalDraggedId = draggedEntityId || activeDraggedId;
                    activeDraggedId = null;
                    activeDraggedType = null;
                    if (isInvalidTarget || !finalDraggedId || !dropPosition) return;
                    e.preventDefault();
                    e.stopPropagation();
                    onReorderAndReparent(finalDraggedId, entity.id, dropPosition);
                    setIsExpanded(true);
                    setDropPosition(null);
                    setDraggedEntityId(null);
                }}
                className={`flex items-center group/item rounded-lg overflow-hidden relative cursor-grab active:cursor-grabbing select-none ${
                    draggedEntityId ? '' : 'transition-all'
                } ${
                    isBeingDragged ? 'opacity-40' : ''
                } ${dropIndicatorClass} ${
                    isActive ? activeStyle : hoverStyle
                } ${isEntityMinor(entity) ? 'italic opacity-50' : ''} ${isEntityDeceased(entity) ? 'opacity-80' : ''}`}
                style={customStyle}
                title={`Drag to reparent or reorder: "${entity.name}"`}
            >
                <div className={`flex items-center flex-1 min-w-0 select-none ${currentDraggedId ? 'pointer-events-none' : ''}`}>
                    <GripVertical size={11} className="opacity-0 group-hover/item:opacity-40 hover:opacity-80 transition-opacity shrink-0 -ml-1 mr-0.5 cursor-grab pointer-events-none" />

                    {hasChildren ? (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                            className={`p-1 opacity-40 hover:opacity-100 transition-opacity ${currentDraggedId ? 'pointer-events-none' : ''}`}
                        >
                            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                    ) : (
                        <div className="w-4" />
                    )}
                    
                    <button
                        onClick={() => handleOpenEntity(entity.id)}
                        className="flex-1 text-left py-2 text-xs truncate flex items-center justify-between gap-2 pr-2"
                    >
                        <span className="truncate flex items-center gap-1.5">
                            {isEntityCategory(entity) && <Folder size={11} className="text-teal-400 shrink-0 opacity-80" />}
                            {entity.documentColor && <span className="w-1.5 h-1.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: entity.documentColor }} />}
                            <span className={isEntityDeceased(entity) ? 'line-through opacity-85' : ''}>{entity.name}</span>
                            {isEntityDeceased(entity) && <span className="text-[11px] font-serif text-rose-400 font-bold shrink-0 leading-none" title="Deceased / Fallen">†</span>}
                            {isEntityFinished(entity) && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] shrink-0" title="Finished" />}
                        </span>
                        {dropPosition === 'inside' && (
                            <span className={`text-[8px] font-bold px-1 rounded uppercase tracking-wider pointer-events-none select-none shrink-0 ${
                                (themeId === 'grand-voyager') ? 'bg-[#0d9488] text-white shadow-sm' : (themeId === 'royal-codex') ? 'bg-[#d4af37] text-black' : (layoutMode === 'wiki') ? 'bg-[#b91c1c] text-white' : 'bg-yellow-400 text-black'
                            }`}>↳ Nest</span>
                        )}
                        {(themeId === 'grand-voyager') && isActive && (
                            <span className="text-[#2dd4bf] text-[9px] font-mono shrink-0 drop-shadow pointer-events-none">⚓</span>
                        )}
                        {(themeId === 'royal-codex') && isActive && (
                            <span className="text-[#c8a96e] text-[9px] font-mono shrink-0 drop-shadow pointer-events-none">▶</span>
                        )}
                    </button>
                </div>

                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirmDelete) {
                            handleDeleteToTrash(entity);
                            setConfirmDelete(false);
                        } else {
                            setConfirmDelete(true);
                        }
                    }}
                    onBlur={() => setConfirmDelete(false)}
                    className={`p-2 transition-all ${currentDraggedId ? 'pointer-events-none' : ''} ${
                        confirmDelete
                            ? 'opacity-100 text-rose-400 bg-rose-500/20 rounded'
                            : 'opacity-0 group-hover/item:opacity-40 hover:opacity-100 hover:text-red-500'
                    }`}
                    title={confirmDelete ? 'Click again to confirm' : 'Send to Forgotten Depth'}
                >
                    {confirmDelete ? <span className="text-[9px] font-black uppercase tracking-wider px-1">Sure?</span> : <Trash2 size={12} />}
                </button>
            </div>


            {hasChildren && isExpanded && (
                <div className="animate-in fade-in slide-in-from-left-1 duration-200">
                    {children.map(child => (
                        <EntityItem 
                            key={child.id}
                            entity={child}
                            depth={depth + 1}
                            allEntities={allEntities}
                            activeTabId={activeTabId}
                            handleOpenEntity={handleOpenEntity}
                            handleDeleteToTrash={handleDeleteToTrash}
                            draggedEntityId={draggedEntityId}
                            setDraggedEntityId={setDraggedEntityId}
                            onReorderAndReparent={onReorderAndReparent}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({
    world,
    searchQuery,
    setSearchQuery,
    expandedCategories,
    setExpandedCategories,
    activeTabId,
    setActiveTabId,
    handleOpenEntity,
    handleCreate,
    handleDeleteToTrash,
}) => {
    const { themeId, layoutMode } = useTheme();
    const [draggedEntityId, setDraggedEntityId] = useState<string | null>(null);
    const [headerDropType, setHeaderDropType] = useState<EntityType | null>(null);
    const reorderAndReparentEntity = useWorldStore(state => state.reorderAndReparentEntity);

    const draggedEntity = useMemo(() => {
        return world.entities.find(e => e.id === draggedEntityId);
    }, [world.entities, draggedEntityId]);

    const sidebarBg = (themeId === 'grand-voyager')
        ? 'bg-[#180c04]/97 border-r-2 border-[#6b3d18]/50 shadow-[5px_0_40px_rgba(0,0,0,0.95)] relative'
        : (themeId === 'royal-codex')
        ? 'bg-[#181410] border-r-2 border-[#110e0b] shadow-[5px_0_15px_rgba(0,0,0,0.8)] relative'
        : (layoutMode === 'wiki') ? 'bg-[#fdf6e3]' : 'bg-[#0f172a]/80';

    const accentText = (themeId === 'grand-voyager')
        ? 'text-[#2dd4bf]'
        : (themeId === 'royal-codex')
        ? 'text-[#d4af37]'
        : (layoutMode === 'wiki') ? 'text-[#854d0e]' : 'text-[#fef08a]';

    const borderColor = (themeId === 'grand-voyager')
        ? 'border-[#3d2617]/80'
        : (themeId === 'royal-codex')
        ? 'border-[#c8a96e]/20'
        : (layoutMode === 'wiki') ? 'border-[#d4c8af]' : 'border-slate-800/60';

    const filteredEntities = useMemo(() => {
        if (!searchQuery) return world.entities;
        const tokens = searchQuery.toLowerCase().split(' ');
        return world.entities.filter(entity => {
            return tokens.every(token => {
                if (token.startsWith('type:')) return entity.type.includes(token.split(':')[1]);
                if (token.startsWith('tag:')) return entity.tags?.some(t => t.toLowerCase().includes(token.split(':')[1]));
                if (token.startsWith('temp:')) {
                    const searchTemp = token.split(':')[1];
                    const templates = Array.isArray(entity.docTemplate) ? entity.docTemplate : [entity.docTemplate];
                    return templates.some(t => t?.toLowerCase().includes(searchTemp));
                }
                if (token === 'is:finished') return entity.finishedSwitch;
                if (token === 'is:minor') return entity.minorSwitch;
                if (token === 'is:dead') return entity.deadSwitch;
                if (token === 'is:cat' || token === 'is:category') return entity.categorySwitch;
                return (
                    entity.name.toLowerCase().includes(token) ||
                    entity.otherNames?.some(n => n.toLowerCase().includes(token)) ||
                    entity.description?.toLowerCase().includes(token)
                );
            });
        });
    }, [world.entities, searchQuery]);

    // Safety: Auto-heal any invalid, circular, or cross-type parentId in world.entities so entries can NEVER disappear
    React.useEffect(() => {
        let hasCorruptParent = false;
        const healedEntities = world.entities.map(e => {
            if (e.parentId) {
                const safeParent = getSafeParentId(e, world.entities);
                if (safeParent !== e.parentId) {
                    hasCorruptParent = true;
                    return { ...e, parentId: safeParent };
                }
            }
            return e;
        });

        if (hasCorruptParent) {
            useWorldStore.setState(state => ({
                world: { ...state.world, entities: healedEntities }
            }));
        }
    }, [world.entities]);

    // Global dragover/dragend listener to guarantee continuous dropEffect = 'move'
    // without initial frame cursor flicker across the window
    React.useEffect(() => {
        const handleDragOver = (e: DragEvent) => {
            if (activeDraggedId) {
                e.preventDefault();
                if (e.dataTransfer) {
                    e.dataTransfer.dropEffect = 'move';
                }
            }
        };
        const handleDragEnd = () => {
            activeDraggedId = null;
            activeDraggedType = null;
            setDraggedEntityId(null);
            setHeaderDropType(null);
        };
        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('dragend', handleDragEnd);
        window.addEventListener('drop', handleDragEnd);
        return () => {
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('dragend', handleDragEnd);
            window.removeEventListener('drop', handleDragEnd);
        };
    }, []);

    const isSearching = searchQuery.length > 0;

    const navBtnStyle = (viewId: string, activeColor: string) => {
        const isActive = activeTabId === viewId;
        if ((themeId === 'grand-voyager')) {
            return isActive
                ? 'bg-gradient-to-r from-[#0d344d] to-[#082030] text-[#2dd4bf] border border-[#14b8a6]/50 shadow-md shadow-teal-950/40 font-bold'
                : 'text-amber-100/70 hover:text-[#2dd4bf] hover:bg-[#0d9488]/10';
        }
        if ((themeId === 'royal-codex')) {
            return isActive
                ? 'bg-[#2d1208] text-[#f0ddb0] border border-[#c8a96e]/30'
                : 'text-[#c8a96e]/70 hover:text-[#f0ddb0] hover:bg-[#2a150a]/50';
        }
        return isActive ? activeColor : 'hover:bg-white/5';
    };

    return (
        <aside 
            onDragOver={(e) => {
                if (draggedEntityId || activeDraggedId) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                }
            }}
            onDragEnter={(e) => {
                if (draggedEntityId || activeDraggedId) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                }
            }}
            className={`w-56 border-r ${borderColor} flex flex-col ${sidebarBg} backdrop-blur-md z-20 select-none`}
        >
            {/* Ornamental Gold Filigree Corners for Left Spine */}
            {(themeId === 'royal-codex') && (
                <>
                    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#c8a96e] pointer-events-none" />
                    <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#c8a96e] pointer-events-none" />
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#c8a96e] pointer-events-none" />
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#c8a96e] pointer-events-none" />
                </>
            )}

            {/* Header with Realm Switcher */}
            <div className={`p-3.5 border-b ${borderColor} relative z-10 space-y-3`}>
                <RealmSwitcher onOpenOptions={() => setActiveTabId('options')} />
                <div className="relative group">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${(themeId === 'grand-voyager') ? 'text-[#2dd4bf]/60' : (themeId === 'royal-codex') ? 'text-[#c8a96e]/50' : 'text-slate-500 group-focus-within:text-yellow-500'}`} size={13} />
                    <input
                        id="sidebar-search-input"
                        placeholder="type:location tag:urban... (Ctrl+K)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full border rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 outline-none transition-all ${
                            (themeId === 'grand-voyager')
                                ? 'bg-[#0b0805]/80 border-[#3d2617] text-[#e0f2fe] placeholder-amber-200/30 focus:ring-[#14b8a6]/50'
                                : (themeId === 'royal-codex')
                                ? 'bg-[#0f0905] border-[#c8a96e]/20 text-[#f0ddb0] placeholder-[#c8a96e]/30 focus:ring-[#c8a96e]/40'
                                : (layoutMode === 'wiki') ? 'bg-white/50 border-none focus:ring-yellow-500/50'
                                : 'bg-white/5 border-none focus:ring-yellow-500/50'
                        }`}
                    />
                </div>
            </div>

            {/* Entity Nav */}
            <nav 
                onDragOver={(e) => {
                    if (draggedEntityId || activeDraggedId) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                    }
                }}
                onDragEnter={(e) => {
                    if (draggedEntityId || activeDraggedId) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                    }
                }}
                className="flex-1 overflow-y-auto p-3 custom-scrollbar select-none"
            >
                {HIERARCHY_CONFIG.map(group => (
                    <div key={group.id} className="mb-5">
                        <button
                            onClick={() => setExpandedCategories(expandedCategories.includes(group.id) ? expandedCategories.filter(id => id !== group.id) : [...expandedCategories, group.id])}
                            className={`w-full flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-2 ${accentText} opacity-80 hover:opacity-100 transition-opacity`}
                        >
                            <span className="flex items-center gap-2 uppercase font-serif">
                                <group.icon size={11} /> {group.label}
                            </span>
                            <span className="text-[8px] opacity-40">{expandedCategories.includes(group.id) ? '▲' : '▼'}</span>
                        </button>

                        {expandedCategories.includes(group.id) && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                                {group.types.map(type => (
                                    <div key={type} className="space-y-0.5 group/type">
                                        <div 
                                            onDragOver={(e) => {
                                                const activeId = draggedEntityId || activeDraggedId;
                                                const activeType = draggedEntity?.type || activeDraggedType;
                                                if (!activeId || activeType !== type) return;
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setHeaderDropType(type);
                                            }}
                                            onDragEnter={(e) => {
                                                const activeId = draggedEntityId || activeDraggedId;
                                                const activeType = draggedEntity?.type || activeDraggedType;
                                                if (!activeId || activeType !== type) return;
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setHeaderDropType(type);
                                            }}
                                            onDragLeave={() => {
                                                if (headerDropType === type) setHeaderDropType(null);
                                            }}
                                            onDrop={(e) => {
                                                const activeId = draggedEntityId || activeDraggedId;
                                                const activeType = draggedEntity?.type || activeDraggedType;
                                                if (!activeId || activeType !== type) return;
                                                e.preventDefault();
                                                e.stopPropagation();
                                                activeDraggedId = null;
                                                activeDraggedType = null;
                                                reorderAndReparentEntity(activeId, null, 'inside', type);
                                                setHeaderDropType(null);
                                                setDraggedEntityId(null);
                                            }}
                                            className={`flex items-center justify-between px-2 py-0.5 rounded transition-all ${
                                                headerDropType === type
                                                    ? ((themeId === 'grand-voyager')
                                                        ? 'bg-[#0f766e]/25 ring-1 ring-[#2dd4bf] text-[#2dd4bf]'
                                                        : (themeId === 'royal-codex') 
                                                        ? 'bg-[#3b2315] ring-1 ring-[#d4af37] text-[#fef08a]' 
                                                        : (layoutMode === 'wiki') ? 'bg-[#b91c1c]/10 ring-1 ring-[#b91c1c] text-[#b91c1c]' 
                                                        : 'bg-yellow-500/20 ring-1 ring-yellow-400 text-yellow-300')
                                                    : ''
                                            }`}
                                        >
                                            <span className={`text-[9px] font-bold uppercase ${(themeId === 'grand-voyager') ? 'text-[#2dd4bf]/60' : (themeId === 'royal-codex') ? 'text-[#c8a96e]/40' : 'text-slate-500/60'}`}>
                                                {TYPE_LABELS[type]}
                                                {headerDropType === type && (
                                                    <span className="ml-1.5 text-[8px] font-normal lowercase tracking-normal text-yellow-400 font-mono">↳ root</span>
                                                )}
                                            </span>
                                            {!world.entities.find(e => e.categorySwitch && e.type === type) && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCreate(type, undefined, true); }}
                                                    className={`opacity-30 hover:opacity-100 p-1 hover:bg-white/10 rounded-md transition-all cursor-pointer ${(themeId === 'grand-voyager') ? 'text-[#2dd4bf]' : (themeId === 'royal-codex') ? 'text-[#c8a96e]' : 'text-slate-500'}`}
                                                    title={`Add ${TYPE_LABELS[type]}`}
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <div 
                                            onDragOver={(e) => {
                                                const activeType = draggedEntity?.type || activeDraggedType;
                                                if (activeType === type) {
                                                    e.preventDefault();
                                                    e.dataTransfer.dropEffect = 'move';
                                                }
                                            }}
                                            onDragEnter={(e) => {
                                                const activeType = draggedEntity?.type || activeDraggedType;
                                                if (activeType === type) {
                                                    e.preventDefault();
                                                    e.dataTransfer.dropEffect = 'move';
                                                }
                                            }}
                                            className="space-y-px"
                                        >
                                            {filteredEntities
                                                .filter(e => e.type === type && (isSearching || getSafeParentId(e, world.entities) === null))
                                                .map(entity => (
                                                    <EntityItem 
                                                        key={entity.id}
                                                        entity={entity}
                                                        depth={0}
                                                        allEntities={world.entities}
                                                        activeTabId={activeTabId}
                                                        handleOpenEntity={handleOpenEntity}
                                                        handleDeleteToTrash={handleDeleteToTrash}
                                                        draggedEntityId={draggedEntityId}
                                                        setDraggedEntityId={setDraggedEntityId}
                                                        onReorderAndReparent={reorderAndReparentEntity}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Footer Nav */}
            <div className={`p-3 border-t ${borderColor} space-y-1`}>
                <button onClick={() => setActiveTabId('dashboard')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${navBtnStyle('dashboard', 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20')}`}><BarChart3 size={14} /> World Ledger</button>
                <button onClick={() => setActiveTabId('timeline')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${navBtnStyle('timeline', 'bg-purple-500 text-white shadow-lg shadow-purple-500/20')}`}><History size={14} /> Chronos View</button>
                <button onClick={() => setActiveTabId('nexus')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${navBtnStyle('nexus', 'bg-rose-500 text-white shadow-lg shadow-rose-500/20')}`}><GitMerge size={14} /> Nexus Lines</button>
                <button onClick={() => setActiveTabId('journey')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${navBtnStyle('journey', 'bg-orange-500 text-white shadow-lg shadow-orange-500/20')}`}><Footprints size={14} /> Grand Journey</button>
                <button onClick={() => setActiveTabId('map')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${navBtnStyle('map', 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20')}`}><Globe size={14} /> Atlas View</button>
                <button onClick={() => setActiveTabId('trash')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTabId === 'trash' ? 'text-red-400' : (themeId === 'grand-voyager') ? 'text-amber-100/50 hover:text-red-400' : (themeId === 'royal-codex') ? 'text-[#c8a96e]/50 hover:text-red-400' : 'text-slate-500 hover:text-red-400'}`}><Trash2 size={13} /> Forgotten Depth</button>
                <button onClick={() => setActiveTabId('options')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTabId === 'options' ? accentText : (themeId === 'grand-voyager') ? 'text-amber-100/50 hover:text-[#2dd4bf]' : (themeId === 'royal-codex') ? 'text-[#c8a96e]/50 hover:text-[#d4af37]' : 'text-slate-500 hover:text-slate-300'}`}><Settings size={13} /> System Archive</button>
            </div>
        </aside>
    );
};


