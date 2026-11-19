import React, { useMemo, useEffect, useState } from 'react';
import {
    Search, Plus, Globe, Trash2, Settings,
    BookMarked, Compass, Eye, Edit3, BarChart3, History, GitMerge, Footprints, Keyboard,
    Undo2, Redo2
} from 'lucide-react';
import { useWorldStore } from './store/useWorldStore';
import { useTheme } from './theme';
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
import { KeybindsModal } from './components/ui/KeybindsModal';
import { CommandPalette } from './components/ui/CommandPalette';
import { ScratchpadDrawer } from './components/ui/ScratchpadDrawer';
import { TropicalSceneBackground } from './components/ui/TropicalSceneBackground';


const App = () => {
    const {
        world, setWorld,
        openTabIds, activeTabId, setActiveTabId,
        theme, setTheme,
        drafts, setDrafts,
        editingTabIds, setEditingTabIds,
        searchQuery, setSearchQuery,
        expandedCategories, setExpandedCategories,
        scratchpadNote, setScratchpadNote, exportWorld,
        historyPast, historyFuture, undo, redo,
        handleOpenEntity, handleCloseTab, handleCreate,
        handleSaveDraft, handleToggleEdit, handleDeleteToTrash
    } = useWorldStore();

    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [showScratchpad, setShowScratchpad] = useState(false);
    const [showKeybindsModal, setShowKeybindsModal] = useState(false);

    const { t, layoutMode, themeId } = useTheme();
    const isManuscript = layoutMode === 'manuscript';
    const isGrandVoyager = themeId === 'grand-voyager';

    const canUndo = Boolean(historyPast && historyPast.length > 0);
    const canRedo = Boolean(historyFuture && historyFuture.length > 0);

    useEffect(() => {
        const systemTabs = ['map', 'trash', 'options', 'dashboard', 'timeline', 'nexus', 'journey'];
        if (!systemTabs.includes(activeTabId)) {
            const exists = world.entities.some(e => e.id === activeTabId);
            if (!exists) {
                if (world.entities.length > 0) {
                    setActiveTabId(world.entities[0].id);
                } else {
                    setActiveTabId('dashboard');
                }
            }
        }
    }, [activeTabId, world.entities, setActiveTabId]);

    const activeEntity = useMemo(() => {
        if (editingTabIds.includes(activeTabId as string)) return drafts[activeTabId as string];
        return world.entities.find(e => e.id === activeTabId);
    }, [world.entities, activeTabId, editingTabIds, drafts]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isEditing = editingTabIds.includes(activeTabId as string);
            const target = e.target as HTMLElement | null;
            const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

            // Commit draft (Ctrl+Enter or Cmd+Enter)
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (isEditing) {
                    e.preventDefault();
                    handleSaveDraft(activeTabId as string);
                    return;
                }
            }

            // Undo changes (Ctrl+Z or Cmd+Z outside text inputs)
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
                if (!isInput) {
                    e.preventDefault();
                    undo();
                    return;
                }
            }

            // Redo changes (Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z outside text inputs)
            if (
                ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))
            ) {
                if (!isInput) {
                    e.preventDefault();
                    redo();
                    return;
                }
            }

            // Quick save draft (Ctrl+S or Cmd+S)
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                if (isEditing) {
                    handleSaveDraft(activeTabId as string);
                    return;
                }
            }

            // Summon Global Command Palette (Ctrl+K or Cmd+K)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault();
                setShowCommandPalette(prev => !prev);
                return;
            }

            // Summon DM Scratchpad & Lore Journal (Ctrl+J or Cmd+J)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'j' || e.key === 'J')) {
                e.preventDefault();
                setShowScratchpad(prev => !prev);
                return;
            }

            // Toggle Edit mode (Ctrl+E or Cmd+E)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'e' || e.key === 'E')) {
                const systemTabs = ['map', 'trash', 'options', 'dashboard', 'timeline', 'nexus', 'journey'];
                if (!systemTabs.includes(activeTabId)) {
                    e.preventDefault();
                    handleToggleEdit(activeTabId as string);
                    return;
                }
            }

            // Escape: close open overlays or abandon edit
            if (e.key === 'Escape') {
                if (showCommandPalette) {
                    e.preventDefault();
                    setShowCommandPalette(false);
                    return;
                }
                if (showScratchpad) {
                    e.preventDefault();
                    setShowScratchpad(false);
                    return;
                }
                if (showKeybindsModal) {
                    e.preventDefault();
                    setShowKeybindsModal(false);
                    return;
                }
                if (isEditing) {
                    e.preventDefault();
                    handleToggleEdit(activeTabId as string);
                    return;
                }
            }

            // '?' outside inputs: toggle keybinds modal
            if (e.key === '?' && !isInput) {
                e.preventDefault();
                setShowKeybindsModal(prev => !prev);
                return;
            }

            // Alt+1 to Alt+7: quick navigate realms
            if (e.altKey && !e.ctrlKey && !e.shiftKey) {
                const navKeys: Record<string, any> = {
                    '1': 'dashboard',
                    '2': 'timeline',
                    '3': 'nexus',
                    '4': 'journey',
                    '5': 'map',
                    '6': 'trash',
                    '7': 'options'
                };
                if (navKeys[e.key]) {
                    e.preventDefault();
                    setActiveTabId(navKeys[e.key]);
                    return;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTabId, editingTabIds, handleSaveDraft, handleToggleEdit, setActiveTabId, showCommandPalette, showScratchpad, showKeybindsModal, undo, redo]);

    // App shell geometry tokens — derived from layoutMode (structure) + theme tokens (material)
    const bgClass = t.layout.appBg;
    const textColor = t.colors.textBody;

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
            className={`flex h-screen ${bgClass} ${textColor} transition-all duration-700 overflow-hidden font-sans relative ${isManuscript ? 'p-1 sm:p-2 md:p-3 items-center justify-center' : ''}`}>
            
            {auraStyles.bg !== 'none' && (
                <div className="absolute inset-0 pointer-events-none opacity-10 z-0" style={{ background: auraStyles.bg }} />
            )}

            <div className={`flex w-full h-full ${isManuscript ? 'w-full max-w-none 2xl:max-w-[2400px] bg-[#1a0f0a] rounded-r-3xl shadow-[0_40px_100px_rgba(0,0,0,0.95)] overflow-hidden relative' : ''}`}>
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
                />

                {/* Main Content Area */}
                <main className={`flex-1 flex flex-col relative overflow-y-auto ${isGrandVoyager ? 'bg-transparent' : t.layout.pageBg}`}>

                    {/* Grand Voyager tropical scene background */}
                    {isGrandVoyager && <TropicalSceneBackground />}
                    
                    {/* Top Header & Tabs Bar */}
                    <div className={`flex items-center justify-between p-3 border-b ${t.layout.headerBg} backdrop-blur-md sticky top-0 z-[100] gap-4`} data-interactive-ui="true">
                        <div className="flex items-center gap-2 overflow-x-auto flex-1">
                            {openTabIds.map(id => {
                                const e = world.entities.find(ent => ent.id === id);
                                if (!e) return null;
                                const isEditing = editingTabIds.includes(id);
                                const isActive = activeTabId === id;

                                let tabStyle = t.button.tabInactive;
                                if (isActive) {
                                    tabStyle = t.button.tabActive;
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

                        {/* Header Action Tools — Ultra-Modern Sleek Glassmorphic Toolbar */}
                        <div className="flex items-center gap-0.5 p-1 rounded-full border shrink-0 backdrop-blur-2xl transition-all shadow-xl"
                            style={{
                                backgroundColor: theme === 'royal-codex' ? 'rgba(251, 248, 239, 0.88)'
                                               : theme === 'wiki' ? 'rgba(255, 255, 255, 0.92)'
                                               : theme === 'grand-voyager' ? 'rgba(18, 10, 5, 0.82)'
                                               : 'rgba(10, 15, 26, 0.75)',
                                borderColor: theme === 'royal-codex' ? 'rgba(200, 169, 110, 0.5)'
                                           : theme === 'wiki' ? 'rgba(212, 200, 175, 0.85)'
                                           : theme === 'grand-voyager' ? 'rgba(45, 212, 191, 0.3)'
                                           : 'rgba(255, 255, 255, 0.12)',
                                boxShadow: theme === 'royal-codex' ? '0 4px 20px rgba(112, 18, 30, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                                         : theme === 'wiki' ? '0 4px 16px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                                         : theme === 'grand-voyager' ? '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(45, 212, 191, 0.15)'
                                         : '0 8px 30px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                            }}
                            data-interactive-ui="true"
                        >
                            {/* Jump / Command Palette */}
                            <button
                                onClick={() => setShowCommandPalette(true)}
                                title="Command Palette & Fast Search (Ctrl+K)"
                                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all duration-150 cursor-pointer active:scale-95 ${
                                    theme === 'royal-codex'
                                        ? 'text-[#70121e] hover:bg-[#70121e]/10 font-serif'
                                        : theme === 'wiki'
                                        ? 'text-slate-700 hover:text-slate-950 hover:bg-black/[0.05]'
                                        : theme === 'grand-voyager'
                                        ? 'text-[#2dd4bf] hover:bg-[#2dd4bf]/15'
                                        : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                                }`}
                            >
                                <Search size={13} className="transition-transform duration-200 group-hover:scale-110 opacity-75 group-hover:opacity-100" />
                                <span className="hidden md:inline font-medium">Jump</span>
                                <kbd className="hidden lg:inline text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.08] text-slate-400 border border-white/[0.06]">Ctrl+K</kbd>
                            </button>

                            {/* Undo Button */}
                            <button
                                onClick={undo}
                                disabled={!canUndo}
                                title="Undo changes (Ctrl+Z)"
                                className={`group flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all duration-150 cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
                                    theme === 'royal-codex'
                                        ? 'text-[#70121e] hover:bg-[#70121e]/10 font-serif'
                                        : theme === 'wiki'
                                        ? 'text-slate-700 hover:text-slate-950 hover:bg-black/[0.05]'
                                        : theme === 'grand-voyager'
                                        ? 'text-[#2dd4bf] hover:bg-[#2dd4bf]/15'
                                        : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                                }`}
                            >
                                <Undo2 size={13} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
                                <span className="hidden xl:inline font-medium">Undo</span>
                            </button>

                            {/* Redo Button */}
                            <button
                                onClick={redo}
                                disabled={!canRedo}
                                title="Redo changes (Ctrl+Y or Ctrl+Shift+Z)"
                                className={`group flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all duration-150 cursor-pointer active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
                                    theme === 'royal-codex'
                                        ? 'text-[#70121e] hover:bg-[#70121e]/10 font-serif'
                                        : theme === 'wiki'
                                        ? 'text-slate-700 hover:text-slate-950 hover:bg-black/[0.05]'
                                        : theme === 'grand-voyager'
                                        ? 'text-[#2dd4bf] hover:bg-[#2dd4bf]/15'
                                        : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                                }`}
                            >
                                <Redo2 size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                                <span className="hidden xl:inline font-medium">Redo</span>
                            </button>

                            {/* Scratchpad / Lore Journal */}
                            <button
                                onClick={() => setShowScratchpad(true)}
                                title="DM Scratchpad & Lore Journal (Ctrl+J)"
                                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all duration-150 cursor-pointer active:scale-95 ${
                                    theme === 'royal-codex'
                                        ? 'text-[#70121e] hover:bg-[#70121e]/10 font-serif'
                                        : theme === 'wiki'
                                        ? 'text-slate-700 hover:text-slate-950 hover:bg-black/[0.05]'
                                        : theme === 'grand-voyager'
                                        ? 'text-[#2dd4bf] hover:bg-[#2dd4bf]/15'
                                        : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                                }`}
                            >
                                <BookMarked size={13} className="transition-transform duration-200 group-hover:scale-110 opacity-75 group-hover:opacity-100" />
                                <span className="hidden sm:inline font-medium">Scratchpad</span>
                            </button>

                            {/* Keybinds / Grimoire */}
                            <button
                                onClick={() => setShowKeybindsModal(true)}
                                title="Grimoire of Shortcuts & Gestures (? or Ctrl+/)"
                                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-tight transition-all duration-150 cursor-pointer active:scale-95 ${
                                    theme === 'royal-codex'
                                        ? 'text-[#70121e] hover:bg-[#70121e]/10 font-serif'
                                        : theme === 'wiki'
                                        ? 'text-slate-700 hover:text-slate-950 hover:bg-black/[0.05]'
                                        : theme === 'grand-voyager'
                                        ? 'text-[#2dd4bf] hover:bg-[#2dd4bf]/15'
                                        : 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                                }`}
                            >
                                <Keyboard size={13} className="transition-transform duration-200 group-hover:scale-110 opacity-75 group-hover:opacity-100" />
                                <span className="hidden sm:inline font-medium">Keybinds</span>
                            </button>

                            {/* Sleek divider */}
                            <div className={`w-px h-3.5 mx-0.5 ${
                                theme === 'royal-codex' ? 'bg-[#70121e]/20'
                                : theme === 'wiki' ? 'bg-black/10'
                                : theme === 'grand-voyager' ? 'bg-[#2dd4bf]/25'
                                : 'bg-white/10'
                            }`} />

                            <ThemeSwitcher theme={theme} setTheme={setTheme} />
                        </div>
                    </div>

                {/* Body Content */}
                <div className="flex-1 p-4 md:p-6">
                    {activeTabId === 'map' && <WorldMap world={world} setWorld={setWorld} onNavigate={handleOpenEntity} />}
                    {activeTabId === 'trash' && <TrashView trash={world.trash} setWorld={setWorld} />}
                    {activeTabId === 'options' && <OptionsView world={world} setWorld={setWorld} />}
                    {activeTabId === 'dashboard' && <DashboardView world={world} onNavigate={handleOpenEntity} />}
                    {activeTabId === 'timeline' && <TimelineView world={world} setWorld={setWorld} onNavigate={handleOpenEntity} />}
                    {activeTabId === 'nexus' && <NexusTreeView world={world} onNavigate={handleOpenEntity} />}
                    {activeTabId === 'journey' && <JourneyView world={world} onNavigate={handleOpenEntity} />}

                    {activeEntity && (
                        isManuscript ? (

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
                                            />
                                        ) : (
                                            <EntityViewer
                                                entity={activeEntity}
                                                allEntities={world.entities}
                                                onEdit={() => handleToggleEdit(activeTabId as string)}
                                                onDelete={() => handleDeleteToTrash(activeEntity)}
                                                onNavigate={handleOpenEntity}
                                                onFocusMap={() => {
                                                    if (activeEntity?.type === 'location') {
                                                        useWorldStore.getState().focusMapLocation(activeEntity.id);
                                                    } else if (activeEntity?.type === 'character' && (activeEntity as any).pairedCurrentLocationNew?.[0]) {
                                                        useWorldStore.getState().focusMapLocation((activeEntity as any).pairedCurrentLocationNew[0]);
                                                    } else {
                                                        setActiveTabId('map');
                                                    }
                                                }}
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
                            <div className="w-full max-w-none 2xl:max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12 min-h-full">
                                <ErrorBoundary fallbackLabel="Error rendering character scroll or details. Click below to recover.">
                                    {editingTabIds.includes(activeTabId as string) ? (
                                        <EntityEditor
                                            entity={activeEntity}
                                            allEntities={world.entities}
                                            onUpdate={(updated) => setDrafts({ ...drafts, [activeTabId as string]: updated })}
                                            onSave={() => handleSaveDraft(activeTabId as string)}
                                            onCancel={() => handleToggleEdit(activeTabId as string)}
                                            onCreateNew={handleCreate}
                                        />
                                    ) : (
                                        <EntityViewer
                                            entity={activeEntity}
                                            allEntities={world.entities}
                                            onEdit={() => handleToggleEdit(activeTabId as string)}
                                            onDelete={() => handleDeleteToTrash(activeEntity)}
                                            onNavigate={handleOpenEntity}
                                            onFocusMap={() => setActiveTabId('map')}
                                        />
                                    )}
                                </ErrorBoundary>
                            </div>
                        )

                    )}
                </div>
            </main>
            </div>

            <KeybindsModal 
                isOpen={showKeybindsModal} 
                onClose={() => setShowKeybindsModal(false)} 
            />

            <CommandPalette
                isOpen={showCommandPalette}
                onClose={() => setShowCommandPalette(false)}
                world={world}
                onNavigate={handleOpenEntity}
                onNavigateSystem={(tabId) => setActiveTabId(tabId as any)}
                onCreateEntity={(type) => handleCreate(type, undefined, true)}
                onOpenScratchpad={() => setShowScratchpad(true)}
                onOpenKeybinds={() => setShowKeybindsModal(true)}
                onExportActiveRealm={() => exportWorld()}
            />

            <ScratchpadDrawer
                isOpen={showScratchpad}
                onClose={() => setShowScratchpad(false)}
                world={world}
                scratchpadNote={scratchpadNote}
                onUpdateNote={setScratchpadNote}
                onNavigate={handleOpenEntity}
                handleCreate={handleCreate}
                drafts={drafts}
                setDrafts={setDrafts}
            />
        </div>
    );
};

export default App;
