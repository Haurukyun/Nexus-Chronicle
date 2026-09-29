import React, { useMemo, useState } from 'react';
import { 
    Search, Plus, Trash2, BarChart3, History, GitMerge, 
    Footprints, Globe, Settings, BookMarked, Compass, 
    ChevronRight, ChevronDown, GripVertical
} from 'lucide-react';
import { EntityType, ThemeMode, WorldData, WorldEntity } from '../../types';
import { HIERARCHY_CONFIG, TYPE_LABELS } from '../../constants';
import { useWorldStore } from '../../store/useWorldStore';

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
    isWikiMode: boolean;
    setIsWikiMode: (mode: boolean) => void;
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

const EntityItem: React.FC<{
    entity: WorldEntity;
    depth: number;
    allEntities: WorldEntity[];
    activeTabId: string;
    handleOpenEntity: (id: string) => void;
    handleDeleteToTrash: (entity: WorldEntity) => void;
    isWikiMode: boolean;
    theme?: ThemeMode;
    draggedEntityId: string | null;
    setDraggedEntityId: (id: string | null) => void;
    onReorderAndReparent: (draggedId: string, targetId: string | null, position: 'before' | 'after' | 'inside', targetType?: EntityType) => void;
}> = ({ 
    entity, depth, allEntities, activeTabId, handleOpenEntity, handleDeleteToTrash, 
    isWikiMode, theme, draggedEntityId, setDraggedEntityId, onReorderAndReparent 
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);

    // Bulletproof child lookup: Only includes entities whose safe parent is this entity
    const children = allEntities.filter(e => getSafeParentId(e, allEntities) === entity.id);
    const hasChildren = children.length > 0;
    const isActive = activeTabId === entity.id;
    const isRoyal = theme === 'royal-codex';
    const isBeingDragged = draggedEntityId === entity.id;

    // Target is invalid if it's the dragged entity itself, a descendant, or a DIFFERENT entity type
    const isInvalidTarget = useMemo(() => {
        if (!draggedEntityId || draggedEntityId === entity.id) return true;
        const draggedEntity = allEntities.find(e => e.id === draggedEntityId);
        // STRICT TYPE MATCH: Cannot drag or reparent across different categories/types!
        if (!draggedEntity || draggedEntity.type !== entity.type) return true;

        const visited = new Set<string>([draggedEntityId]);
        let cur = allEntities.find(e => e.id === entity.id);
        while (cur && cur.parentId) {
            if (visited.has(cur.id) || cur.parentId === draggedEntityId) return true;
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

    const activeStyle = isRoyal
        ? 'bg-gradient-to-r from-[#382315] via-[#2d180d] to-[#24130a] text-[#fff8e7] border-y border-[#c8a96e]/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] font-serif font-bold text-xs'
        : isWikiMode
        ? 'bg-[#b91c1c] text-white shadow-md'
        : 'bg-slate-800 text-[#fef08a] border-l-4 border-yellow-500 shadow-xl shadow-yellow-500/5';

    const hoverStyle = isRoyal
        ? 'hover:bg-[#2a150a]/60 text-[#c8a96e]/90 hover:text-[#fff8e7] font-serif text-xs font-semibold'
        : 'hover:bg-white/5 opacity-70 hover:opacity-100';

    let dropIndicatorClass = '';
    if (dropPosition === 'before') {
        dropIndicatorClass = isRoyal 
            ? 'border-t-2 border-[#d4af37] shadow-[0_-2px_8px_rgba(212,175,55,0.7)]'
            : isWikiMode
            ? 'border-t-2 border-[#b91c1c] shadow-[0_-2px_8px_rgba(185,28,28,0.5)]'
            : 'border-t-2 border-yellow-400 shadow-[0_-2px_8px_rgba(250,204,21,0.6)]';
    } else if (dropPosition === 'after') {
        dropIndicatorClass = isRoyal 
            ? 'border-b-2 border-[#d4af37] shadow-[0_2px_8px_rgba(212,175,55,0.7)]'
            : isWikiMode
            ? 'border-b-2 border-[#b91c1c] shadow-[0_2px_8px_rgba(185,28,28,0.5)]'
            : 'border-b-2 border-yellow-400 shadow-[0_2px_8px_rgba(250,204,21,0.6)]';
    } else if (dropPosition === 'inside') {
        dropIndicatorClass = isRoyal 
            ? 'ring-2 ring-[#d4af37] bg-[#3d2315] shadow-inner'
            : isWikiMode
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
                    setDraggedEntityId(entity.id);
                }}
                onDragEnd={() => {
                    setDraggedEntityId(null);
                    setDropPosition(null);
                }}
                onDragOver={(e) => {
                    if (isInvalidTarget) return;
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'move';

                    const rect = e.currentTarget.getBoundingClientRect();
                    const offsetY = e.clientY - rect.top;
                    const height = rect.height;

                    if (offsetY < height * 0.25) {
                        setDropPosition('before');
                    } else if (offsetY > height * 0.75) {
                        setDropPosition('after');
                    } else {
                        setDropPosition('inside');
                    }
                }}
                onDragLeave={() => {
                    setDropPosition(null);
                }}
                onDrop={(e) => {
                    if (isInvalidTarget || !draggedEntityId || !dropPosition) return;
                    e.preventDefault();
                    e.stopPropagation();
                    onReorderAndReparent(draggedEntityId, entity.id, dropPosition);
                    setIsExpanded(true);
                    setDropPosition(null);
                    setDraggedEntityId(null);
                }}
                className={`flex items-center group/item transition-all rounded-lg overflow-hidden relative cursor-grab active:cursor-grabbing ${
                    isBeingDragged ? 'opacity-30 scale-[0.98]' : ''
                } ${dropIndicatorClass} ${
                    isActive ? activeStyle : hoverStyle
                } ${entity.minorSwitch ? 'italic opacity-50' : ''}`}
                style={customStyle}
                title={`Drag to reparent or reorder: "${entity.name}"`}
            >
                <GripVertical size={11} className="opacity-0 group-hover/item:opacity-40 hover:opacity-80 transition-opacity shrink-0 -ml-1 mr-0.5 cursor-grab" />

                {hasChildren ? (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                        className="p-1 opacity-40 hover:opacity-100 transition-opacity"
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
                        {entity.name}
                        {entity.finishedSwitch && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" title="Finished" />}
                        {entity.deadSwitch && <span className="text-[8px] opacity-40">💀</span>}
                        {entity.categorySwitch && <span className="text-[8px] opacity-40 font-bold px-1 rounded bg-slate-500/20">CAT</span>}
                    </span>
                    {dropPosition === 'inside' && (
                        <span className={`text-[8px] font-bold px-1 rounded uppercase tracking-wider ${
                            isRoyal ? 'bg-[#d4af37] text-black' : isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-yellow-400 text-black'
                        }`}>↳ Nest</span>
                    )}
                    {isRoyal && isActive && (
                        <span className="text-[#c8a96e] text-[9px] font-mono shrink-0 drop-shadow">▶</span>
                    )}
                </button>

                <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteToTrash(entity); }}
                    className="p-2 opacity-0 group-hover/item:opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
                >
                    <Trash2 size={12} />
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
                            isWikiMode={isWikiMode}
                            theme={theme}
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
    isWikiMode,
    setIsWikiMode,
    theme,
    setTheme,
}) => {
    const isRoyal = theme === 'royal-codex';
    const [draggedEntityId, setDraggedEntityId] = useState<string | null>(null);
    const [headerDropType, setHeaderDropType] = useState<EntityType | null>(null);
    const reorderAndReparentEntity = useWorldStore(state => state.reorderAndReparentEntity);

    const draggedEntity = useMemo(() => {
        return world.entities.find(e => e.id === draggedEntityId);
    }, [world.entities, draggedEntityId]);

    const sidebarBg = isRoyal
        ? 'bg-[#181410] border-r-2 border-[#110e0b] shadow-[5px_0_15px_rgba(0,0,0,0.8)] relative'
        : isWikiMode ? 'bg-[#fdf6e3]' : 'bg-[#0f172a]/80';

    const accentText = isRoyal
        ? 'text-[#d4af37]'
        : isWikiMode ? 'text-[#854d0e]' : 'text-[#fef08a]';

    const borderColor = isRoyal
        ? 'border-[#c8a96e]/20'
        : isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/60';

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

    const isSearching = searchQuery.length > 0;

    const navBtnStyle = (viewId: string, activeColor: string) => {
        const isActive = activeTabId === viewId;
        if (isRoyal) {
            return isActive
                ? 'bg-[#2d1208] text-[#f0ddb0] border border-[#c8a96e]/30'
                : 'text-[#c8a96e]/70 hover:text-[#f0ddb0] hover:bg-[#2a150a]/50';
        }
        return isActive ? activeColor : 'hover:bg-white/5';
    };

    return (
        <aside className={`w-56 border-r ${borderColor} flex flex-col ${sidebarBg} backdrop-blur-md z-20`}>
            {/* Ornamental Gold Filigree Corners for Left Spine */}
            {isRoyal && (
                <>
                    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#c8a96e] pointer-events-none" />
                    <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#c8a96e] pointer-events-none" />
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#c8a96e] pointer-events-none" />
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#c8a96e] pointer-events-none" />
                </>
            )}

            {/* Header */}
            <div className={`p-5 border-b ${borderColor} relative z-10`}>
                <h1 className={`text-base font-serif font-bold ${accentText} tracking-widest flex items-center gap-2 uppercase mb-4 text-center justify-center`}>
                    {isRoyal ? null : isWikiMode ? <BookMarked size={22} /> : <Compass size={22} className="animate-pulse" />}
                    {world.name}
                </h1>
                <div className="relative group">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isRoyal ? 'text-[#c8a96e]/50' : 'text-slate-500 group-focus-within:text-yellow-500'}`} size={13} />
                    <input
                        id="sidebar-search-input"
                        placeholder="type:location tag:urban... (Ctrl+K)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full border rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 outline-none transition-all ${
                            isRoyal
                                ? 'bg-[#0f0905] border-[#c8a96e]/20 text-[#f0ddb0] placeholder-[#c8a96e]/30 focus:ring-[#c8a96e]/40'
                                : isWikiMode
                                ? 'bg-white/50 border-none focus:ring-yellow-500/50'
                                : 'bg-white/5 border-none focus:ring-yellow-500/50'
                        }`}
                    />
                </div>
            </div>

            {/* Entity Nav */}
            <nav className="flex-1 overflow-y-auto p-3 custom-scrollbar">
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
                                                if (!draggedEntityId || !draggedEntity || draggedEntity.type !== type) return;
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setHeaderDropType(type);
                                            }}
                                            onDragLeave={() => {
                                                if (headerDropType === type) setHeaderDropType(null);
                                            }}
                                            onDrop={(e) => {
                                                if (!draggedEntityId || !draggedEntity || draggedEntity.type !== type) return;
                                                e.preventDefault();
                                                e.stopPropagation();
                                                reorderAndReparentEntity(draggedEntityId, null, 'inside', type);
                                                setHeaderDropType(null);
                                                setDraggedEntityId(null);
                                            }}
                                            className={`flex items-center justify-between px-2 py-0.5 rounded transition-all ${
                                                headerDropType === type
                                                    ? (isRoyal 
                                                        ? 'bg-[#3b2315] ring-1 ring-[#d4af37] text-[#fef08a]' 
                                                        : isWikiMode 
                                                        ? 'bg-[#b91c1c]/10 ring-1 ring-[#b91c1c] text-[#b91c1c]' 
                                                        : 'bg-yellow-500/20 ring-1 ring-yellow-400 text-yellow-300')
                                                    : ''
                                            }`}
                                        >
                                            <span className={`text-[9px] font-bold uppercase ${isRoyal ? 'text-[#c8a96e]/40' : 'text-slate-500/60'}`}>
                                                {TYPE_LABELS[type]}
                                                {headerDropType === type && (
                                                    <span className="ml-1.5 text-[8px] font-normal lowercase tracking-normal text-yellow-400 font-mono">↳ root</span>
                                                )}
                                            </span>
                                            {!world.entities.find(e => e.categorySwitch && e.type === type) && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCreate(type, undefined, true); }}
                                                    className={`opacity-30 hover:opacity-100 p-1 hover:bg-white/10 rounded-md transition-all cursor-pointer ${isRoyal ? 'text-[#c8a96e]' : 'text-slate-500'}`}
                                                    title={`Add ${TYPE_LABELS[type]}`}
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-px">
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
                                                        isWikiMode={isWikiMode}
                                                        theme={theme}
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
                <button onClick={() => setActiveTabId('trash')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTabId === 'trash' ? 'text-red-400' : isRoyal ? 'text-[#c8a96e]/50 hover:text-red-400' : 'text-slate-500 hover:text-red-400'}`}><Trash2 size={13} /> Forgotten Depth</button>
                <button onClick={() => setActiveTabId('options')} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeTabId === 'options' ? accentText : isRoyal ? 'text-[#c8a96e]/50 hover:text-[#d4af37]' : 'text-slate-500 hover:text-slate-300'}`}><Settings size={13} /> System Archive</button>
            </div>
        </aside>
    );
};


