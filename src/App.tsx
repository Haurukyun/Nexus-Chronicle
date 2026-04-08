import React, { useMemo } from 'react';
import {
    Search, Plus, Globe, Trash2, Settings,
    BookMarked, Compass, Eye, Edit3, BarChart3, History, GitMerge, Footprints
} from 'lucide-react';
import { useWorldStore } from './store/useWorldStore';
import { HIERARCHY_CONFIG, TYPE_LABELS } from './constants';
import { WorldMap } from './views/WorldMap';
import { TrashView } from './views/TrashView';
import { OptionsView } from './views/OptionsView';
import { DashboardView } from './views/DashboardView';
import { TimelineView } from './views/TimelineView';
import { NexusTreeView } from './views/NexusTreeView';
import { JourneyView } from './views/JourneyView';
import { EntityViewer } from './components/viewer/EntityViewer';
import { EntityEditor } from './components/editor/EntityEditor';

const App = () => {
    const {
        world, setWorld,
        openTabIds, activeTabId, setActiveTabId,
        isWikiMode, setIsWikiMode,
        drafts, setDrafts,
        editingTabIds, setEditingTabIds,
        searchQuery, setSearchQuery,
        expandedCategories, setExpandedCategories,
        handleOpenEntity, handleCloseTab, handleCreate,
        handleSaveDraft, handleToggleEdit, handleDeleteToTrash
    } = useWorldStore();

    const activeEntity = useMemo(() => {
        if (editingTabIds.includes(activeTabId as string)) return drafts[activeTabId as string];
        return world.entities.find(e => e.id === activeTabId);
    }, [world.entities, activeTabId, editingTabIds, drafts]);

    const bgClass = isWikiMode ? 'bg-[#fdfcf0]' : 'bg-[#070b14]';
    const accentText = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const sidebarBg = isWikiMode ? 'bg-[#f5e6d3]' : 'bg-slate-900/20';

    const auraStyles = useMemo(() => {
        const phase = world.worldPhase || 'golden';
        const config: any = {
            creation: { filter: 'contrast(1.1) brightness(1.1)', accent: '#fef08a', bg: 'radial-gradient(circle, #fff2 0%, transparent 70%)' },
            golden: { filter: 'sepia(0.2)', accent: '#fbbf24', bg: 'none' },
            shadow: { filter: 'grayscale(0.4) brightness(0.7) contrast(1.2)', accent: '#818cf8', bg: 'url("https://www.transparenttextures.com/patterns/dark-matter.png")' },
            eclipse: { filter: 'hue-rotate(180deg) invert(0.1) brightness(0.8)', accent: '#fb7185', bg: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)' },
            ruin: { filter: 'grayscale(1) contrast(1.5) brightness(0.5)', accent: '#f87171', bg: 'url("https://www.transparenttextures.com/patterns/60-lines.png")' }
        };
        return config[phase] || config.golden;
    }, [world.worldPhase]);

    return (
        <div 
            style={{ filter: auraStyles.filter }}
            className={`flex h-screen ${bgClass} ${isWikiMode ? 'text-[#1a1a1a]' : 'text-slate-300'} transition-all duration-1000 overflow-hidden font-sans relative`}>
            {auraStyles.bg !== 'none' && (
                <div className="absolute inset-0 pointer-events-none opacity-10 z-0" style={{ background: auraStyles.bg }} />
            )}
            {/* Sidebar */}
            <aside className={`w-80 border-r ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/60'} flex flex-col ${sidebarBg} backdrop-blur-md z-20`}>
                <div className={`p-6 border-b ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/60'}`}>
                    <h1 className={`text-xl font-serif font-bold ${accentText} tracking-widest flex items-center gap-2 uppercase mb-4`}>
                        {isWikiMode ? <BookMarked size={22} /> : <Compass size={22} className="animate-pulse" />}
                        {world.name}
                    </h1>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors" size={14} />
                        <input
                            placeholder="Search Archive..."
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
                                                {!world.entities.find(e => e.isCategory && e.type === type) && (
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
                                                {world.entities
                                                    .filter(e => e.type === type && e.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                    .map(entity => (
                                                        <button
                                                            key={entity.id}
                                                            onClick={() => handleOpenEntity(entity.id)}
                                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex justify-between items-center group ${activeTabId === entity.id ? (isWikiMode ? 'bg-[#b91c1c] text-white shadow-lg' : 'bg-slate-800 text-[#fef08a] border-l-4 border-yellow-500 shadow-xl shadow-yellow-500/5') : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}
                                                        >
                                                            <span className="truncate">{entity.name}</span>
                                                            <Trash2 size={12} className="opacity-0 group-hover:opacity-40 hover:text-red-500 transition-opacity" onClick={(e) => { e.stopPropagation(); handleDeleteToTrash(entity); }} />
                                                        </button>
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

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative bg-gradient-to-br from-transparent to-black/20 overflow-y-auto">
                {/* Tabs Bar */}
                {openTabIds.length > 0 && (
                    <div className={`flex items-center gap-2 p-4 border-b ${isWikiMode ? 'border-[#d4c8af] bg-[#f5e6d3]/30' : 'border-slate-800/40 bg-black/20'} backdrop-blur-md sticky top-0 z-10 overflow-x-auto`}>
                        {openTabIds.map(id => {
                            const e = world.entities.find(ent => ent.id === id);
                            if (!e) return null;
                            const isEditing = editingTabIds.includes(id);
                            return (
                                <div
                                    key={id}
                                    onClick={() => setActiveTabId(id)}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border ${activeTabId === id ? (isWikiMode ? 'bg-[#b91c1c] text-white border-[#b91c1c]' : 'bg-[#fef08a] text-black border-[#fef08a]') : (isWikiMode ? 'bg-white border-[#d4c8af] text-slate-500' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-200')}`}
                                >
                                    <span className="flex items-center gap-2">
                                        {isEditing ? <Edit3 size={12} className="text-blue-500 animate-pulse" /> : <Eye size={12} />}
                                        {e.name}
                                    </span>
                                    <button onClick={(ev) => handleCloseTab(id, ev)} className="hover:text-red-500">×</button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Body Content */}
                <div className="flex-1">
                    {activeTabId === 'map' && <WorldMap world={world} setWorld={setWorld} onNavigate={handleOpenEntity} isWikiMode={isWikiMode} />}
                    {activeTabId === 'trash' && <TrashView trash={world.trash} setWorld={setWorld} isWikiMode={isWikiMode} />}
                    {activeTabId === 'options' && <OptionsView world={world} setWorld={setWorld} isWikiMode={isWikiMode} setIsWikiMode={setIsWikiMode} />}
                    {activeTabId === 'dashboard' && <DashboardView world={world} isWikiMode={isWikiMode} onNavigate={handleOpenEntity} />}
                    {activeTabId === 'timeline' && <TimelineView world={world} isWikiMode={isWikiMode} onNavigate={handleOpenEntity} />}
                    {activeTabId === 'nexus' && <NexusTreeView world={world} isWikiMode={isWikiMode} onNavigate={handleOpenEntity} />}
                    {activeTabId === 'journey' && <JourneyView world={world} isWikiMode={isWikiMode} onNavigate={handleOpenEntity} />}

                    {activeEntity && (
                        <div className="max-w-7xl mx-auto px-12 py-16 min-h-full">
                            {editingTabIds.includes(activeTabId as string) ? (
                                <EntityEditor
                                    entity={activeEntity}
                                    allEntities={world.entities}
                                    onUpdate={(updated) => setDrafts({ ...drafts, [activeTabId as string]: updated })}
                                    onSave={() => handleSaveDraft(activeTabId as string)}
                                    onCancel={() => handleToggleEdit(activeTabId as string)}
                                    onCreateNew={handleCreate}
                                    isWikiMode={isWikiMode}
                                />
                            ) : (
                                <EntityViewer
                                    entity={activeEntity}
                                    allEntities={world.entities}
                                    onEdit={() => handleToggleEdit(activeTabId as string)}
                                    onDelete={() => handleDeleteToTrash(activeEntity)}
                                    onNavigate={handleOpenEntity}
                                    isWikiMode={isWikiMode}
                                    onFocusMap={() => {
                                        setActiveTabId('map');
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;
