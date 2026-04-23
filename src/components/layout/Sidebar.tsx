import React, { useMemo, useState } from 'react';
import { 
    Search, Plus, Trash2, BarChart3, History, GitMerge, 
    Footprints, Globe, Settings, BookMarked, Compass, 
    ChevronRight, ChevronDown 
} from 'lucide-react';
import { EntityType, WorldData, WorldEntity } from '../../types';
import { HIERARCHY_CONFIG, TYPE_LABELS } from '../../constants';

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
}

const EntityItem: React.FC<{
    entity: WorldEntity;
    depth: number;
    allEntities: WorldEntity[];
    activeTabId: string;
    handleOpenEntity: (id: string) => void;
    handleDeleteToTrash: (entity: WorldEntity) => void;
    isWikiMode: boolean;
}> = ({ entity, depth, allEntities, activeTabId, handleOpenEntity, handleDeleteToTrash, isWikiMode }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const children = allEntities.filter(e => e.parentId === entity.id);
    const hasChildren = children.length > 0;

    return (
        <div className="space-y-px">
            <div 
                className={`flex items-center group/item transition-all rounded-lg overflow-hidden ${
                    activeTabId === entity.id 
                    ? (isWikiMode ? 'bg-[#b91c1c] text-white shadow-md' : 'bg-slate-800 text-[#fef08a] border-l-4 border-yellow-500 shadow-xl shadow-yellow-500/5') 
                    : 'hover:bg-white/5 opacity-70 hover:opacity-100'
                }`}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
                {hasChildren ? (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                        className="p-1 opacity-40 hover:opacity-100 transition-opacity"
                    >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                ) : (
                    <div className="w-5" />
                )}
                
                <button
                    onClick={() => handleOpenEntity(entity.id)}
                    className="flex-1 text-left py-2 text-xs truncate"
                >
                    {entity.name}
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
    setIsWikiMode
}) => {
    const accentText = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const sidebarBg = isWikiMode ? 'bg-[#f5e6d3]' : 'bg-slate-900/20';

    const filteredEntities = useMemo(() => {
        if (!searchQuery) return world.entities;

        const tokens = searchQuery.toLowerCase().split(' ');
        return world.entities.filter(entity => {
            return tokens.every(token => {
                if (token.startsWith('type:')) {
                    return entity.type === token.split(':')[1];
                }
                if (token.startsWith('tag:')) {
                    const searchTag = token.split(':')[1];
                    return entity.tags?.some(t => t.toLowerCase().includes(searchTag));
                }
                if (token === 'is:finished') return entity.finishedSwitch;
                if (token === 'is:minor') return entity.minorSwitch;
                if (token === 'is:dead') return entity.deadSwitch;
                
                return (
                    entity.name.toLowerCase().includes(token) ||
                    entity.description?.toLowerCase().includes(token)
                );
            });
        });
    }, [world.entities, searchQuery]);

    // To handle hierarchy correctly in the sidebar groups, 
    // we only show top-level entities (no parentId) of each type,
    // and the EntityItem component will recursively render children.
    // If a search is active, we might want to show all results flattened or keep hierarchy.
    // Fantasia Archive keeps hierarchy but expands matched parents.
    // For simplicity, if search is active, we show flattened results.
    // If no search, we show hierarchy.

    const isSearching = searchQuery.length > 0;

    return (
        <aside className={`w-80 border-r ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/60'} flex flex-col ${sidebarBg} backdrop-blur-md z-20`}>
            <div className={`p-6 border-b ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/60'}`}>
                <h1 className={`text-xl font-serif font-bold ${accentText} tracking-widest flex items-center gap-2 uppercase mb-4`}>
                    {isWikiMode ? <BookMarked size={22} /> : <Compass size={22} className="animate-pulse" />}
                    {world.name}
                </h1>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors" size={14} />
                    <input
                        placeholder="type:location tag:urban..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full ${isWikiMode ? 'bg-white/50' : 'bg-white/5'} border-none rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-yellow-500/50 outline-none transition-all`}
                    />
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {HIERARCHY_CONFIG.map(group => (
                    <div key={group.id} className="mb-6">
                        <button
                            onClick={() => setExpandedCategories(expandedCategories.includes(group.id) ? expandedCategories.filter(id => id !== group.id) : [...expandedCategories, group.id])}
                            className={`w-full flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-3 px-2 ${accentText} opacity-80 hover:opacity-100 transition-opacity`}
                        >
                            <span className="flex items-center gap-2 uppercase font-serif">
                                <group.icon size={12} /> {group.label}
                            </span>
                            <span className="text-[8px] opacity-40">{expandedCategories.includes(group.id) ? '▲' : '▼'}</span>
                        </button>

                        {expandedCategories.includes(group.id) && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                                {group.types.map(type => (
                                    <div key={type} className="space-y-0.5 group/type">
                                        <div className="flex items-center justify-between px-2 py-1">
                                            <span className="text-[9px] font-bold text-slate-500/60 uppercase">{TYPE_LABELS[type]}</span>
                                            {!world.entities.find(e => e.categorySwitch && e.type === type) && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCreate(type, undefined, true); }}
                                                    className="opacity-30 hover:opacity-100 p-1.5 hover:bg-white/10 rounded-md text-slate-500 transition-all cursor-pointer"
                                                    title={`Add ${TYPE_LABELS[type]}`}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-px">
                                            {filteredEntities
                                                .filter(e => e.type === type && (isSearching || !e.parentId))
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

            <div className={`p-4 border-t ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/60'} space-y-2`}>
                <button onClick={() => setActiveTabId('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold ${activeTabId === 'dashboard' ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20') : 'hover:bg-white/5'}`}><BarChart3 size={16} /> World Ledger</button>
                <button onClick={() => setActiveTabId('timeline')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold ${activeTabId === 'timeline' ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-purple-500 text-white shadow-lg shadow-purple-500/20') : 'hover:bg-white/5'}`}><History size={16} /> Chronos View</button>
                <button onClick={() => setActiveTabId('nexus')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold ${activeTabId === 'nexus' ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20') : 'hover:bg-white/5'}`}><GitMerge size={16} /> Nexus Lines</button>
                <button onClick={() => setActiveTabId('journey')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold ${activeTabId === 'journey' ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-orange-500 text-white shadow-lg shadow-orange-500/20') : 'hover:bg-white/5'}`}><Footprints size={16} /> Grand Journey</button>
                <button onClick={() => setActiveTabId('map')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold ${activeTabId === 'map' ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20') : 'hover:bg-white/5'}`}><Globe size={16} /> Atlas View</button>
                <button onClick={() => setActiveTabId('trash')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold ${activeTabId === 'trash' ? (isWikiMode ? 'text-red-500' : 'text-slate-400') : 'text-slate-500 hover:text-red-400'}`}><Trash2 size={14} /> Forgotten Depth</button>
                <button onClick={() => setActiveTabId('options')} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold ${activeTabId === 'options' ? (isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]') : 'text-slate-500 hover:text-slate-300'}`}><Settings size={14} /> System Archive</button>
            </div>
        </aside>
    );
};
