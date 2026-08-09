import React, { useMemo, useState } from 'react';
import { 
    Search, Plus, Trash2, BarChart3, History, GitMerge, 
    Footprints, Globe, Settings, BookMarked, Compass, 
    ChevronRight, ChevronDown 
} from 'lucide-react';
import { EntityType, ThemeMode, WorldData, WorldEntity } from '../../types';
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
    theme?: ThemeMode;
    setTheme?: (theme: ThemeMode) => void;
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
}> = ({ entity, depth, allEntities, activeTabId, handleOpenEntity, handleDeleteToTrash, isWikiMode, theme }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const children = allEntities.filter(e => e.parentId === entity.id);
    const hasChildren = children.length > 0;
    const isActive = activeTabId === entity.id;
    const isRoyal = theme === 'royal-codex';
    
    const customStyle: React.CSSProperties = {
        paddingLeft: `${depth * 12 + 8}px`,
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

    return (
        <div className="space-y-px">
            <div 
                className={`flex items-center group/item transition-all rounded-lg overflow-hidden relative ${
                    isActive ? activeStyle : hoverStyle
                } ${entity.minorSwitch ? 'italic opacity-50' : ''}`}
                style={customStyle}
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
                    className="flex-1 text-left py-2 text-xs truncate flex items-center justify-between gap-2 pr-2"
                >
                    <span className="truncate flex items-center gap-1.5">
                        {entity.name}
                        {entity.finishedSwitch && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" title="Finished" />}
                        {entity.deadSwitch && <span className="text-[8px] opacity-40">💀</span>}
                        {entity.categorySwitch && <span className="text-[8px] opacity-40 font-bold px-1 rounded bg-slate-500/20">CAT</span>}
                    </span>
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
                        placeholder="type:location tag:urban..."
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
                                        <div className="flex items-center justify-between px-2 py-0.5">
                                            <span className={`text-[9px] font-bold uppercase ${isRoyal ? 'text-[#c8a96e]/40' : 'text-slate-500/60'}`}>{TYPE_LABELS[type]}</span>
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
                                                        theme={theme}
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


