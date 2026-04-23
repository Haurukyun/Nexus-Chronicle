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
import { Sidebar } from './components/layout/Sidebar';

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
            <Sidebar 
                world={world}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                expandedCategories={expandedCategories}
                setExpandedCategories={setExpandedCategories}
                activeTabId={activeTabId}
                setActiveTabId={setActiveTabId}
                handleOpenEntity={handleOpenEntity}
                handleCreate={handleCreate}
                handleDeleteToTrash={handleDeleteToTrash}
                isWikiMode={isWikiMode}
                setIsWikiMode={setIsWikiMode}
            />

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
