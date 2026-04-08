import React, { useMemo, useState } from 'react';
import {
    Plus, Search, ChevronRight, ChevronDown, Trash2, Globe, Compass, 
    LayoutGrid, History, Settings, Skull, X, BookMarked
} from 'lucide-react';
import { EntityType, WorldEntity } from './types';
import { TYPE_LABELS, HIERARCHY_CONFIG } from './constants';
import { useWorldStore } from './store/useWorldStore';

// Extracted Components
import { FormInput } from './components/ui';
import { EntityEditor } from './components/editor';
import { EntityViewer } from './components/viewer';
import { TrashView, OptionsView, WorldMap } from './views';

export default function App() {
    const {
        world, setWorld,
        openTabIds, activeTabId, setActiveTabId,
        isWikiMode, setIsWikiMode,
        drafts, setDrafts,
        editingTabIds,
        searchQuery, setSearchQuery,
        expandedCategories, setExpandedCategories,
        handleOpenEntity, handleCloseTab, handleCreate,
        handleSaveDraft, handleToggleEdit, handleDeleteToTrash
    } = useWorldStore();

    const activeEntity = useMemo(() => {
        if (editingTabIds.has(activeTabId as string)) return drafts[activeTabId as string];
        return world.entities.find(e => e.id === activeTabId);
    }, [world.entities, activeTabId, editingTabIds, drafts]);

    const bgClass = isWikiMode ? 'bg-[#fdfcf0]' : 'bg-[#070b14]';
    const accentText = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const sidebarBg = isWikiMode ? 'bg-[#f5e6d3]' : 'bg-slate-900/20';

    return (
        <div className={`flex h-screen \${bgClass} \${isWikiMode ? 'text-[#1a1a1a]' : 'text-slate-300'} transition-all duration-500 overflow-hidden font-sans`}>
            {/* Sidebar */}
            <aside className={`w-80 border-r \${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/60'} flex flex-col \${sidebarBg} backdrop-blur-md z-20`}>
                <div className={`p-6 border-b \${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/60'}`}>
                    <h1 className={`text-xl font-serif font-bold \${accentText} tracking-widest flex items-center gap-2 uppercase mb-4`}>
                        {isWikiMode ? <BookMarked size={22} /> : <Compass size={22} className="animate-pulse" />}
                        {world.name}
                    </h1>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors" size={14} />
                        <input
                            placeholder="Search Archive..."
                            className={`w-full \${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:ring-1 \${isWikiMode ? 'focus:ring-[#b91c1c]' : 'focus:ring-yellow-500'} transition-all`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {HIERARCHY_CONFIG.map(group => (
                        <div key={group.id} className="mb-6">
                            <button
                                onClick={() => setExpandedCategories(expandedCategories.includes(group.id) ? expandedCategories.filter(id => id !== group.id) : [...expandedCategories, group.id])}
                                className={`w-full flex items-center justify-between mb-2 text-[10px] font-black uppercase tracking-[0.2em] \${isWikiMode ? 'text-[#854d0e]' : 'text-slate-500'} hover:opacity-70 transition-opacity`}
                            >
                                <span className="flex items-center gap-2"><group.icon size={12} /> {group.label}</span>
                                {expandedCategories.includes(group.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            </button>

                            {expandedCategories.includes(group.id) && (
                                <div className="space-y-1">
                                    {group.types.map(type => (
                                        <div key={type} className="space-y-0.5">
                                            <div className="flex items-center justify-between group/type px-2 py-1">
                                                <span className="text-[9px] font-bold text-slate-500/60 uppercase">{TYPE_LABELS[type]}</span>
                                                {!world.entities.find(e => e.isCategory && e.type === type) && (
                                                    <button onClick={() => handleCreate(type, undefined, true)} className="opacity-0 group-hover/type:opacity-100 p-0.5 hover:bg-white/10 rounded text-slate-500 transition-all"><Plus size={10} /></button>
                                                )}
                                            </div>
                                            {world.entities
                                                .filter(e => e.type === type && e.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                .map(entity => (
                                                    <button
                                                        key={entity.id}
                                                        onClick={() => handleOpenEntity(entity.id)}
                                                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all flex justify-between items-center group/item \${activeTabId === entity.id ? (isWikiMode ? 'bg-[#b91c1c] text-white shadow-lg' : 'bg-slate-800 text-[#fef08a] border-l-4 border-yellow-500 shadow-xl shadow-yellow-500/5') : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}
                                                    >
                                                        <span className="truncate">{entity.name}</span>
                                                        <Trash2 size={10} className="opacity-0 group-hover/item:opacity-40 hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDeleteToTrash(entity); }} />
                                                    </button>
                                                ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                <div className={`p-4 border-t \${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/60'} space-y-2`}>
                    <button onClick={() => setActiveTabId('map')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold \${activeTabId === 'map' ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-yellow-500 text-black') : 'hover:bg-white/5'}`}><Globe size={16} /> Atlas View</button>
                    <button onClick={() => setActiveTabId('trash')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold \${activeTabId === 'trash' ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-slate-800') : 'hover:bg-white/5 opacity-60'}`}><Skull size={16} /> Archive Depth</button>
                    <button onClick={() => setActiveTabId('options')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold \${activeTabId === 'options' ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-slate-800') : 'hover:bg-white/5'}`}><Settings size={16} /> Configuration</button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative bg-gradient-to-br from-transparent to-black/20">
                {/* Tabs Bar */}
                {openTabIds.length > 0 && (
                    <header className={`flex border-b \${isWikiMode ? 'bg-[#f5e6d3] border-[#d4c8af]' : 'bg-[#070b14] border-slate-800/60'} h-12`}>
                        <div className="flex flex-1 overflow-x-auto no-scrollbar">
                            {openTabIds.map(tid => {
                                const ent = world.entities.find(e => e.id === tid);
                                return (
                                    <button
                                        key={tid}
                                        onClick={() => setActiveTabId(tid)}
                                        className={`group relative h-full px-6 flex items-center gap-3 text-xs font-bold whitespace-nowrap transition-all border-r \${isWikiMode ? 'border-[#d4c8af]' : 'border-white/5'} \${activeTabId === tid ? (isWikiMode ? 'bg-[#fdfcf0] text-[#b91c1c]' : 'bg-[#0a0f1d] text-[#fef08a]') : 'bg-transparent text-slate-500 hover:text-slate-300'}`}
                                    >
                                        <span className="max-w-[120px] truncate">{ent?.name || 'Unknown'}</span>
                                        {editingTabIds.has(tid) && <div className={`w-1.5 h-1.5 rounded-full \${isWikiMode ? 'bg-[#b91c1c]' : 'bg-yellow-500'} animate-pulse`} />}
                                        <X size={12} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all rounded p-0.5" onClick={(e) => handleCloseTab(tid, e)} />
                                        {activeTabId === tid && <div className={`absolute bottom-0 left-0 w-full h-0.5 \${isWikiMode ? 'bg-[#b91c1c]' : 'bg-yellow-500'}`} />}
                                    </button>
                                );
                            })}
                        </div>
                    </header>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {activeTabId === 'map' && <WorldMap world={world} setWorld={setWorld} onNavigate={handleOpenEntity} isWikiMode={isWikiMode} />}
                    {activeTabId === 'trash' && <TrashView trash={world.trash} setWorld={setWorld} isWikiMode={isWikiMode} />}
                    {activeTabId === 'options' && <OptionsView world={world} setWorld={setWorld} isWikiMode={isWikiMode} setIsWikiMode={setIsWikiMode} />}

                    {activeEntity && (
                        <div className="max-w-7xl mx-auto px-12 py-16 min-h-full">
                            {editingTabIds.has(activeTabId as string) ? (
                                <EntityEditor
                                    entity={activeEntity}
                                    allEntities={world.entities}
                                    onSave={() => handleSaveDraft(activeTabId as string)}
                                    onCancel={() => handleToggleEdit(activeTabId as string)}
                                    onUpdate={(data: any) => setDrafts({ ...drafts, [activeTabId as string]: data })}
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
                                    onFocusMap={() => setActiveTabId('map')}
                                    isWikiMode={isWikiMode}
                                />
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
