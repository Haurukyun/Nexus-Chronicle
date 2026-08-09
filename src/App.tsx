import React, { useMemo, useEffect } from 'react';
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
import { ThemeSwitcher } from './components/ui/ThemeSwitcher';
import { ErrorBoundary } from './components/ui/ErrorBoundary';


const App = () => {
    const {
        world, setWorld,
        openTabIds, activeTabId, setActiveTabId,
        theme, setTheme,
        isWikiMode, setIsWikiMode,
        drafts, setDrafts,
        editingTabIds, setEditingTabIds,
        searchQuery, setSearchQuery,
        expandedCategories, setExpandedCategories,
        handleOpenEntity, handleCloseTab, handleCreate,
        handleSaveDraft, handleToggleEdit, handleDeleteToTrash
    } = useWorldStore();

    useEffect(() => {
        const systemTabs = ['map', 'trash', 'options', 'dashboard', 'timeline', 'nexus', 'journey'];
        if (!systemTabs.includes(activeTabId)) {
            const exists = world.entities.some(e => e.id === activeTabId);
            if (!exists) {
                if (world.entities.length > 0) {
                    setActiveTabId(world.entities[0].id);
                } else {
                    setActiveTabId('options');
                }
            }
        }
    }, [activeTabId, world.entities, setActiveTabId]);

    const activeEntity = useMemo(() => {
        if (editingTabIds.includes(activeTabId as string)) return drafts[activeTabId as string];
        return world.entities.find(e => e.id === activeTabId);
    }, [world.entities, activeTabId, editingTabIds, drafts]);


    const bgClass = theme === 'royal-codex' ? 'bg-[#3b2b20] bg-[url("https://www.transparenttextures.com/patterns/wood-pattern.png")] bg-blend-multiply shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]' : isWikiMode ? 'bg-[#fdfcf0]' : 'bg-[#070b14]';
    const textColor = theme === 'royal-codex' ? 'text-[#2b1810]' : isWikiMode ? 'text-[#1a1a1a]' : 'text-slate-300';

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
            className={`flex h-screen ${bgClass} ${textColor} transition-all duration-700 overflow-hidden font-sans relative ${theme === 'royal-codex' ? 'p-4 md:p-8 lg:p-12 items-center justify-center' : ''}`}>
            
            {auraStyles.bg !== 'none' && (
                <div className="absolute inset-0 pointer-events-none opacity-10 z-0" style={{ background: auraStyles.bg }} />
            )}

            <div className={`flex w-full h-full ${theme === 'royal-codex' ? 'max-w-[1500px] bg-[#1a0f0a] rounded-r-3xl shadow-[0_40px_100px_rgba(0,0,0,0.95)] overflow-hidden relative' : ''}`}>
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
                    theme={theme}
                    setTheme={setTheme}
                />

                {/* Main Content Area */}
                <main className={`flex-1 flex flex-col relative ${theme === 'royal-codex' ? 'bg-[#eee2cb]' : 'bg-gradient-to-br from-transparent to-black/30'} overflow-y-auto`}>
                    
                    {/* Top Header & Tabs Bar */}
                    <div className={`flex items-center justify-between p-3 border-b ${
                        theme === 'royal-codex' 
                            ? 'border-[#c8a96e]/50 bg-[#3d2719] text-[#fef08a] shadow-xl z-20' 
                            : isWikiMode 
                            ? 'border-[#d4c8af] bg-[#f5e6d3]/30 text-[#1a1a1a]' 
                            : 'border-slate-800/40 bg-black/20 text-slate-300'
                    } backdrop-blur-md sticky top-0 z-10 gap-4`}>
                        <div className="flex items-center gap-2 overflow-x-auto flex-1">
                            {openTabIds.map(id => {
                                const e = world.entities.find(ent => ent.id === id);
                                if (!e) return null;
                                const isEditing = editingTabIds.includes(id);
                                const isActive = activeTabId === id;

                                let tabStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-200';
                                if (isActive) {
                                    if (theme === 'royal-codex') tabStyle = 'bg-[#70121e] text-[#fef08a] border-2 border-[#c8a96e] shadow-lg font-serif font-bold';
                                    else if (isWikiMode) tabStyle = 'bg-[#b91c1c] text-white border-[#b91c1c] shadow-md';
                                    else tabStyle = 'bg-[#fef08a] text-black border-[#fef08a] shadow-md';
                                } else {
                                    if (theme === 'royal-codex') tabStyle = 'bg-[#4a2e1d] border border-[#c8a96e]/30 text-[#c8a96e] hover:bg-[#523522]';
                                    else if (isWikiMode) tabStyle = 'bg-white border-[#d4c8af] text-slate-600 hover:bg-slate-100';
                                }

                                return (
                                    <div
                                        key={id}
                                        onClick={() => setActiveTabId(id)}
                                        className={`flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border ${tabStyle}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {isEditing ? <Edit3 size={12} className="text-blue-500 animate-pulse" /> : <Eye size={12} />}
                                            {e.name}
                                        </span>
                                        <button onClick={(ev) => handleCloseTab(id, ev)} className="hover:text-red-500 ml-1 font-bold">×</button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Quick Theme Switcher Button */}
                        <div className="flex items-center gap-2 shrink-0">
                            <ThemeSwitcher theme={theme} setTheme={setTheme} />
                        </div>
                    </div>

                {/* Body Content */}
                <div className="flex-1 p-4 md:p-6">
                    {activeTabId === 'map' && <WorldMap world={world} setWorld={setWorld} onNavigate={handleOpenEntity} isWikiMode={isWikiMode} />}
                    {activeTabId === 'trash' && <TrashView trash={world.trash} setWorld={setWorld} isWikiMode={isWikiMode} />}
                    {activeTabId === 'options' && <OptionsView world={world} setWorld={setWorld} isWikiMode={isWikiMode} setIsWikiMode={setIsWikiMode} />}
                    {activeTabId === 'dashboard' && <DashboardView world={world} isWikiMode={isWikiMode} onNavigate={handleOpenEntity} />}
                    {activeTabId === 'timeline' && <TimelineView world={world} isWikiMode={isWikiMode} onNavigate={handleOpenEntity} />}
                    {activeTabId === 'nexus' && <NexusTreeView world={world} isWikiMode={isWikiMode} onNavigate={handleOpenEntity} />}
                    {activeTabId === 'journey' && <JourneyView world={world} isWikiMode={isWikiMode} onNavigate={handleOpenEntity} />}

                    {activeEntity && (
                        theme === 'royal-codex' ? (

                                <div className="p-3 md:p-6 bg-gradient-to-br from-[#4a0d1b] via-[#330712] to-[#1c0207] min-h-full">
                                    {/* Stacked Parchment Page Layers Behind Book */}
                                    <div className="absolute -bottom-3 -left-4 w-80 h-48 bg-[#ebd9bd] border border-[#c8a96e]/50 rounded-xl transform -rotate-2 shadow-lg pointer-events-none z-0" />
                                    <div className="absolute -top-3 -right-4 w-72 h-40 bg-[#ebd9bd] border border-[#c8a96e]/50 rounded-xl transform rotate-1 shadow-lg pointer-events-none z-0" />

                                    {/* Inner Vellum Parchment Page */}
                                    <div className="bg-gradient-to-b from-[#fbf6ea] via-[#f7efe0] to-[#eee2cb] rounded-r-2xl p-6 md:p-10 border-2 border-l-0 border-[#c8a96e]/70 shadow-[inset_0_0_30px_rgba(180,140,80,0.15)] relative text-[#2b1810] min-h-[780px] h-full">
                                    
                                    {/* Four Ornamental Gold Filigree Corners */}
                                    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#c8a96e] pointer-events-none" />
                                    <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#c8a96e] pointer-events-none" />
                                    <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#c8a96e] pointer-events-none" />
                                    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#c8a96e] pointer-events-none" />

                                    <ErrorBoundary fallbackLabel="Error rendering character scroll or details. Click below to recover.">
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
                                                onFocusMap={() => setActiveTabId('map')}
                                                isWikiMode={isWikiMode}
                                            />
                                        )}
                                    </ErrorBoundary>
                                </div>

                                {/* Realistic Feather Quill Pen Overlay Bottom Right */}
                                <div className="absolute -bottom-8 -right-8 w-44 h-44 pointer-events-none z-30 transform rotate-12 drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]">
                                    <svg viewBox="0 0 100 100" className="w-full h-full">
                                        <path d="M85 10 C 60 30, 30 65, 10 90 L 14 92 C 35 70, 65 35, 88 12 Z" fill="url(#quillGrad)" />
                                        <path d="M85 10 Q 55 25, 40 55 Q 60 45, 88 12 Z" fill="#2d261e" opacity="0.8" />
                                        <path d="M10 90 L 4 98 L 12 94 Z" fill="#d4af37" />
                                        <defs>
                                            <linearGradient id="quillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#1f1a14" />
                                                <stop offset="50%" stopColor="#4a3e31" />
                                                <stop offset="100%" stopColor="#8c785c" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-7xl mx-auto px-12 py-16 min-h-full">
                                <ErrorBoundary fallbackLabel="Error rendering character scroll or details. Click below to recover.">
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
                                            onFocusMap={() => setActiveTabId('map')}
                                            isWikiMode={isWikiMode}
                                        />
                                    )}
                                </ErrorBoundary>
                            </div>
                        )

                    )}
                </div>
            </main>
            </div>
        </div>
    );
};

export default App;
