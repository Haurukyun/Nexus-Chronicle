import React, { useMemo, useEffect, useState } from 'react';
import {
    Search, Plus, Globe, Trash2, Settings,
    BookMarked, Compass, Eye, Edit3, BarChart3, History, GitMerge, Footprints, Keyboard,
    Undo2, Redo2, BookOpen, Lightbulb, Swords, Newspaper
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
import { SessionLogView } from './views/SessionLogView';
import { PlotThreadsView } from './views/PlotThreadsView';
import { FactionMatrixView } from './views/FactionMatrixView';
import { GazetteView } from './views/GazetteView';
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
    const isRoyal = themeId === 'royal-codex';
    const isWiki = layoutMode === 'wiki';

    const canUndo = Boolean(historyPast && historyPast.length > 0);
    const canRedo = Boolean(historyFuture && historyFuture.length > 0);

    useEffect(() => {
        const systemTabs = ['map', 'trash', 'options', 'dashboard', 'timeline', 'nexus', 'journey', 'session-logs', 'plot-threads', 'faction-matrix', 'gazette'];
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
                const systemTabs = ['map', 'trash', 'options', 'dashboard', 'timeline', 'nexus', 'journey', 'session-logs', 'plot-threads', 'faction-matrix', 'gazette'];
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

            // Alt navigation: quick navigate realms
            if (e.altKey && !e.ctrlKey && !e.shiftKey) {
                const navKeys: Record<string, any> = {
                    '1': 'dashboard',
                    '2': 'timeline',
                    '3': 'nexus',
                    '4': 'journey',
                    '5': 'map',
                    '6': 'trash',
                    '7': 'options',
                    '8': 'session-logs',
                    '9': 'plot-threads',
                    '0': 'faction-matrix',
                    'g': 'gazette',
                    'G': 'gazette'
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

    // Architectural Toolbar Tokens — perfectly cohesive with Sidebar, Codex sheets, and theme registry
    const headerTrayCls = isRoyal
        ? 'bg-[#18100a]/85 border border-[#c8a96e]/30 shadow-inner'
        : isWiki
            ? 'bg-[#e8dcce] border border-[#d4c8af] shadow-inner'
            : isGrandVoyager
                ? 'bg-[#0a181a]/85 border border-[#2dd4bf]/30 shadow-inner'
                : 'bg-slate-950/70 border border-slate-800 shadow-inner';

    const ribbonActiveCls = isRoyal
        ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e] shadow-sm font-serif font-bold uppercase tracking-wider'
        : isWiki
            ? 'bg-[#b91c1c] text-white font-bold border border-red-800 shadow-sm font-serif uppercase tracking-wide'
            : isGrandVoyager
                ? 'bg-[#2dd4bf] text-slate-950 font-bold border border-teal-300 shadow-sm font-serif uppercase tracking-wider'
                : 'bg-[#fef08a] text-slate-950 font-bold border border-yellow-300 shadow-sm';

    const ribbonInactiveCls = isRoyal
        ? 'text-[#c8a96e]/80 hover:text-[#fff8e7] hover:bg-[#70121e]/20 font-serif font-semibold tracking-wider transition-colors duration-150'
        : isWiki
            ? 'text-stone-700 hover:text-stone-950 hover:bg-black/5 font-serif font-medium tracking-wide transition-colors duration-150'
            : isGrandVoyager
                ? 'text-amber-100/70 hover:text-[#2dd4bf] hover:bg-white/5 font-serif font-medium tracking-wider transition-colors duration-150'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium transition-colors duration-150';

    const actionToolBtnCls = isRoyal
        ? 'text-[#c8a96e]/80 hover:text-[#fff8e7] hover:bg-[#70121e]/20 font-serif font-semibold tracking-wider transition-colors duration-150'
        : isWiki
            ? 'text-stone-700 hover:text-stone-950 hover:bg-black/5 font-serif font-medium tracking-wide transition-colors duration-150'
            : isGrandVoyager
                ? 'text-amber-100/70 hover:text-[#2dd4bf] hover:bg-white/5 font-serif font-medium tracking-wider transition-colors duration-150'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium transition-colors duration-150';

    const dossierBarCls = isRoyal
        ? 'bg-[#180e07] border-[#c8a96e]/20'
        : isWiki
            ? 'bg-[#ede0ce] border-[#d4c8af]'
            : isGrandVoyager
                ? 'bg-[#0c1c1e] border-[#2dd4bf]/20'
                : 'bg-slate-950/80 border-slate-800';

    const dossierActiveCls = isRoyal
        ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e] font-serif font-bold uppercase tracking-wider shadow-sm'
        : isWiki
            ? 'bg-white text-[#b91c1c] border border-[#d4c8af] font-serif font-bold uppercase tracking-wide shadow-sm'
            : isGrandVoyager
                ? 'bg-[#133438] text-[#2dd4bf] border border-[#2dd4bf]/40 font-serif font-bold uppercase tracking-wider shadow-sm'
                : 'bg-slate-800 text-[#fef08a] border border-slate-700 font-bold shadow-sm';

    const dossierInactiveCls = isRoyal
        ? 'bg-[#120803] text-[#c8a96e]/70 hover:text-[#fff8e7] hover:bg-[#251206] border border-[#c8a96e]/20 font-serif tracking-wider transition-colors duration-150'
        : isWiki
            ? 'bg-[#f5e6d3] text-stone-600 hover:text-stone-900 border border-[#d4c8af]/60 font-serif transition-colors duration-150'
            : isGrandVoyager
                ? 'bg-[#081517] text-amber-100/60 hover:text-amber-100 border border-[#2dd4bf]/15 font-serif transition-colors duration-150'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800/80 transition-colors duration-150';

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

                    {/* Top Header Bar */}
                    <header className={`sticky top-0 z-[100] border-b ${t.layout.headerBg} shadow-sm`} data-interactive-ui="true">
                        {/* Tier 1: Primary Realm Navigation Ribbon & Action Tools */}
                        <div className="flex items-center justify-between px-3 py-2 gap-3">
                            {/* Realm Navigation Ribbon */}
                            <nav className={`inline-flex items-center p-1 rounded-xl ${headerTrayCls} max-w-full overflow-x-auto custom-scrollbar-hidden min-w-0 gap-1`}>
                                {[
                                    { id: 'gazette', label: 'Gazette', icon: Newspaper, shortcut: 'Alt+G' },
                                    { id: 'map', label: 'Atlas', icon: Globe, shortcut: 'Alt+5' },
                                    { id: 'timeline', label: 'Chronos', icon: History, shortcut: 'Alt+2' },
                                    { id: 'session-logs', label: 'Sessions', icon: BookOpen, shortcut: 'Alt+8' },
                                    { id: 'plot-threads', label: 'Plot Threads', icon: Lightbulb, shortcut: 'Alt+9' },
                                    { id: 'faction-matrix', label: 'Factions', icon: Swords, shortcut: 'Alt+0' },
                                    { id: 'nexus', label: 'Nexus Lines', icon: GitMerge, shortcut: 'Alt+3' },
                                    { id: 'journey', label: 'Journey', icon: Footprints, shortcut: 'Alt+4' },
                                    { id: 'dashboard', label: 'Ledger', icon: BarChart3, shortcut: 'Alt+1' },
                                ].map(item => {
                                    const isActive = activeTabId === item.id;
                                    const IconComponent = item.icon;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setActiveTabId(item.id)}
                                            title={`${item.label} (${item.shortcut})`}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tracking-tight transition-colors duration-150 cursor-pointer shrink-0 ${
                                                isActive ? ribbonActiveCls : ribbonInactiveCls
                                            }`}
                                        >
                                            <IconComponent size={13} className={`shrink-0 ${isActive ? 'opacity-100' : 'opacity-80'}`} />
                                            <span>{item.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* Header Action Tools */}
                            <div className={`inline-flex items-center gap-0.5 p-1 rounded-xl ${headerTrayCls} shrink-0`}>
                                {/* Jump / Command Palette */}
                                <button
                                    onClick={() => setShowCommandPalette(true)}
                                    title="Command Palette & Fast Search (Ctrl+K)"
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-tight transition-colors duration-150 cursor-pointer ${actionToolBtnCls}`}
                                >
                                    <Search size={13} className="opacity-80" />
                                    <span className="hidden md:inline font-medium">Jump</span>
                                    <kbd className={`hidden lg:inline text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                                        isRoyal ? 'bg-black/50 text-[#e6c687] border-[#c8a96e]/40'
                                        : isWiki ? 'bg-white/80 text-stone-600 border-stone-300'
                                        : 'bg-white/[0.08] text-slate-300 border-white/[0.10]'
                                    }`}>Ctrl+K</kbd>
                                </button>

                                {/* Undo Button */}
                                <button
                                    onClick={undo}
                                    disabled={!canUndo}
                                    title="Undo changes (Ctrl+Z)"
                                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium tracking-tight transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${actionToolBtnCls}`}
                                >
                                    <Undo2 size={13} />
                                    <span className="hidden xl:inline font-medium">Undo</span>
                                </button>

                                {/* Redo Button */}
                                <button
                                    onClick={redo}
                                    disabled={!canRedo}
                                    title="Redo changes (Ctrl+Y or Ctrl+Shift+Z)"
                                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium tracking-tight transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${actionToolBtnCls}`}
                                >
                                    <Redo2 size={13} />
                                    <span className="hidden xl:inline font-medium">Redo</span>
                                </button>

                                {/* Scratchpad / Lore Journal */}
                                <button
                                    onClick={() => setShowScratchpad(true)}
                                    title="DM Scratchpad & Lore Journal (Ctrl+J)"
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-tight transition-colors duration-150 cursor-pointer ${actionToolBtnCls}`}
                                >
                                    <BookMarked size={13} className="opacity-80" />
                                    <span className="hidden sm:inline font-medium">Scratchpad</span>
                                </button>

                                {/* Keybinds / Grimoire */}
                                <button
                                    onClick={() => setShowKeybindsModal(true)}
                                    title="Grimoire of Shortcuts & Gestures (? or Ctrl+/)"
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-tight transition-colors duration-150 cursor-pointer ${actionToolBtnCls}`}
                                >
                                    <Keyboard size={13} className="opacity-80" />
                                    <span className="hidden sm:inline font-medium">Keybinds</span>
                                </button>

                                {/* Sleek divider */}
                                <div className="w-px h-4 mx-0.5 bg-current opacity-20" />

                                <ThemeSwitcher theme={theme} setTheme={setTheme} buttonClassName={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium tracking-tight transition-colors duration-150 cursor-pointer ${actionToolBtnCls}`} />
                            </div>
                        </div>

                        {/* Tier 2: Entity Document Tabs Bar (Rendered only when open dossier tabs exist) */}
                        {openTabIds.length > 0 && (
                            <div className={`flex items-center justify-between px-3 py-1.5 border-t min-h-[36px] gap-2 ${dossierBarCls}`}>
                                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 flex-1 min-w-0 custom-scrollbar-hidden">
                                    {openTabIds.map(id => {
                                        const e = world.entities.find(ent => ent.id === id);
                                        if (!e) return null;
                                        const isEditing = editingTabIds.includes(id);
                                        const isActive = activeTabId === id;

                                        return (
                                            <div
                                                key={id}
                                                onClick={() => setActiveTabId(id)}
                                                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs cursor-pointer transition-colors duration-150 border shrink-0 ${
                                                    isActive ? dossierActiveCls : dossierInactiveCls
                                                }`}
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    {isEditing ? <Edit3 size={11} className="text-amber-400 animate-pulse" /> : <Eye size={11} />}
                                                    <span className="max-w-[140px] truncate">{e.name}</span>
                                                </span>
                                                <button
                                                    onClick={(ev) => handleCloseTab(id, ev)}
                                                    className="hover:text-red-400 ml-1 font-bold p-0.5 rounded hover:bg-black/20 transition-colors duration-150"
                                                    title="Close dossier tab"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[9px] font-mono opacity-50 font-bold uppercase tracking-widest hidden sm:inline">
                                        {openTabIds.length} {openTabIds.length === 1 ? 'dossier' : 'dossiers'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </header>

                    {/* Body Content */}
                    <div className={`flex-1 min-h-0 flex flex-col ${['map', 'timeline', 'nexus'].includes(activeTabId) ? 'p-2 sm:p-3 overflow-hidden' : 'p-4 md:p-6'}`}>
                        {activeTabId === 'map' && <WorldMap world={world} setWorld={setWorld} onNavigate={handleOpenEntity} />}
                        {activeTabId === 'trash' && <TrashView trash={world.trash} setWorld={setWorld} />}
                        {activeTabId === 'options' && <OptionsView world={world} setWorld={setWorld} />}
                        {activeTabId === 'dashboard' && <DashboardView world={world} onNavigate={handleOpenEntity} />}
                        {activeTabId === 'timeline' && <TimelineView world={world} setWorld={setWorld} onNavigate={handleOpenEntity} />}
                        {activeTabId === 'nexus' && <NexusTreeView world={world} onNavigate={handleOpenEntity} />}
                        {activeTabId === 'journey' && <JourneyView world={world} onNavigate={handleOpenEntity} />}
                        {activeTabId === 'session-logs' && <SessionLogView world={world} onNavigate={handleOpenEntity} />}
                        {activeTabId === 'plot-threads' && <PlotThreadsView world={world} onNavigate={handleOpenEntity} />}
                        {activeTabId === 'faction-matrix' && <FactionMatrixView world={world} onNavigate={handleOpenEntity} />}
                        {activeTabId === 'gazette' && <GazetteView world={world} onNavigate={handleOpenEntity} />}

                        {activeEntity && (
                            isManuscript ? (

                                <div className="relative flex-1 flex flex-col p-2 sm:p-4 md:p-6 bg-gradient-to-br from-[#4a0d1b] via-[#330712] to-[#1c0207] min-h-full rounded-3xl border-2 border-[#c8a96e]/40 shadow-2xl">
                                    {/* Stacked Parchment Page Layers Behind Book */}
                                    <div className="absolute -bottom-3 -left-4 w-80 h-48 bg-[#ebd9bd] border border-[#c8a96e]/50 rounded-xl transform -rotate-2 shadow-lg pointer-events-none z-0" />
                                    <div className="absolute -top-3 -right-4 w-72 h-40 bg-[#ebd9bd] border border-[#c8a96e]/50 rounded-xl transform rotate-1 shadow-lg pointer-events-none z-0" />

                                    {/* Inner Vellum Parchment Page — Wraps Full Scroll Height Seamlessly */}
                                    <div className="relative flex-1 flex flex-col bg-gradient-to-b from-[#fbf6ea] via-[#f7efe0] to-[#eee2cb] rounded-2xl p-4 sm:p-6 md:p-10 border-2 border-[#c8a96e]/70 shadow-[inset_0_0_30px_rgba(180,140,80,0.15)] text-[#2b1810] min-h-full pb-16">

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
                                                    onUpdate={(updated) => setDrafts(prev => ({ ...prev, [activeTabId as string]: { ...(prev[activeTabId as string] || activeEntity), ...updated } }))}
                                                    onSave={() => handleSaveDraft(activeTabId as string)}
                                                    onCancel={() => handleToggleEdit(activeTabId as string)}
                                                    onCreateNew={handleCreate}
                                                    onNavigate={handleOpenEntity}
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

                                        {/* Persistent Illuminated Royal Codex Bottom Binding Contour */}
                                        <div className="mt-16 pt-6 border-t-2 border-[#c8a96e]/50 flex items-center justify-between opacity-80 select-none">
                                            <div className="flex items-center gap-2 text-[10px] font-serif font-black tracking-widest text-[#70121e] uppercase">
                                                <span>❖ Nexus Chronicle</span>
                                                <span className="opacity-40">·</span>
                                                <span>Royal Codex</span>
                                            </div>
                                            <div className="h-0.5 flex-1 mx-4 bg-gradient-to-r from-[#c8a96e]/60 via-[#70121e]/40 to-[#c8a96e]/60" />
                                            <div className="text-[10px] font-serif italic text-[#5c2a12]">
                                                Finis Chronicorum ❖
                                            </div>
                                        </div>
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
                                                onUpdate={(updated) => setDrafts(prev => ({ ...prev, [activeTabId as string]: { ...(prev[activeTabId as string] || activeEntity), ...updated } }))}
                                                onSave={() => handleSaveDraft(activeTabId as string)}
                                                onCancel={() => handleToggleEdit(activeTabId as string)}
                                                onCreateNew={handleCreate}
                                                onNavigate={handleOpenEntity}
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
