import React, { useMemo, useState, useRef } from 'react';
import {
    Palette, Skull, Globe, Layers, Plus, Copy,
    Download, Upload, Trash2, Edit2, Check, Sparkles, AlertTriangle, ArrowRight, BookOpen,
    Radio, FileArchive, Zap, Heart, FileText, FileCode2, ChevronDown, FolderOpen,
    Sliders, CheckSquare, Square, Shield, Swords, Cpu, MapPin, Tag, X, Lightbulb, Eye, EyeOff
} from 'lucide-react';
import { WorldData, EntityType, WorldPhase, RealmModuleConfig } from '../types';
import { TYPE_LABELS, HIERARCHY_CONFIG } from '../constants';
import {
    ALL_ENTITY_TYPES,
    DEFAULT_REALM_MODULES,
    isEntityTypeActive,
    isModuleActive,
    getActiveEntityTypes,
    getActiveModules,
    REALM_PRESETS
} from '../utils/realmConfig';
import { FormInput, CodexCheckbox } from '../components/ui';
import { useWorldStore } from '../store/useWorldStore';
import { useTheme } from '../theme';
import { NewRealmModal } from '../components/ui/NewRealmModal';
import { NexusBeamModal } from '../components/ui/NexusBeamModal';
import { DeleteRealmModal } from '../components/ui/DeleteRealmModal';
import { WipeRealmModal } from '../components/ui/WipeRealmModal';
import { exportNexusArchiveFile, unpackNexusArchive, downloadFileToDevice } from '../utils/nexusArchive';
import { isDesktopApp, openFileNative } from '../utils/nativeFileBridge';
import { pruneOrphanAssets, extractActiveAssetUris } from '../utils/assetStore';
import { generateEntityMarkdown, generateEntityHtml, downloadTextFile } from '../utils/exportUtils';
import { importFantasiaArchiveProject, FaInputFile } from '../utils/fantasiaArchiveMigration';
import { reconcileAllBidirectionalRelations } from '../utils/bidirectionalSync';
import { CONFIGURABLE_FIELDS, toggleFieldHidden } from '../utils/fieldVisibilityUtils';
import { GENRE_TEMPLATE_LIST, applyGenreTemplateToWorld, getActiveGenreTemplate, GenreTemplateId } from '../utils/genreTemplates';
import { AssetVaultModal } from '../components/vault/AssetVaultModal';
import { getVaultInfo, openVaultFolder, saveCodexToDisk, VaultInfo } from '../utils/portableVault';
import { mairimashitaWorld } from '../data/mairimashitaWorld';

interface OptionsViewProps {
    world: WorldData;
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
}

const PHASE_COLORS: Record<WorldPhase, string> = {
    creation: '#c084fc',
    golden: '#fef08a',
    shadow: '#818cf8',
    eclipse: '#f87171',
    ruin: '#4ade80'
};

const PHASE_NAMES: Record<WorldPhase, string> = {
    creation: 'Age of Genesis',
    golden: 'Golden Zenith',
    shadow: 'Twilit Gloom',
    eclipse: 'Blood Eclipse',
    ruin: 'Forsaken Ruin'
};

export const OptionsView = ({ world, setWorld }: OptionsViewProps) => {
    const {
        worlds,
        activeWorldId,
        switchWorld,
        createWorld,
        duplicateWorld,
        deleteWorld,
        updateWorldDetails,
        exportWorld,
        exportUniverse,
        importWorldData,
        theme,
        setTheme,
        setOpenTabIds,
        setDrafts,
        setEditingTabIds,
        setActiveTabId,
        handleHealRelations,
        handleOpenEntity
    } = useWorldStore();

    const { t, layoutMode, themeId } = useTheme();
    const isRoyal = themeId === 'royal-codex';
    const isWiki = layoutMode === 'wiki';
    const isLight = isRoyal || isWiki;

    const [healDone, setHealDone] = useState(false);
    const handleHeal = () => {
        handleHealRelations();
        setHealDone(true);
        setTimeout(() => setHealDone(false), 3000);
    };

    // Batch lore export state
    const [batchExportType, setBatchExportType] = useState<EntityType | 'all'>('all');
    const [batchExporting, setBatchExporting] = useState(false);
    const [batchNotice, setBatchNotice] = useState<{ text: string; isError?: boolean } | null>(null);

    // Custom Suggestion Banks state (Approach 3)
    const [selectedSuggestionType, setSelectedSuggestionType] = useState<EntityType>('character');
    const [newSuggestionInput, setNewSuggestionInput] = useState('');

    // Field Visibility Config state (Approach 6)
    const [selectedFieldType, setSelectedFieldType] = useState<EntityType>('character');

    // Genre Template Selector state (Approach 7)
    const [applyGenreFieldDefaults, setApplyGenreFieldDefaults] = useState(false);

    // Desktop Storage & Portable Vault state (Choice 1 Architecture)
    const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
    const [isSavingToVault, setIsSavingToVault] = useState(false);
    const [vaultNotice, setVaultNotice] = useState<string | null>(null);

    React.useEffect(() => {
        getVaultInfo().then(info => setVaultInfo(info));
    }, []);

    const handleOpenVault = async () => {
        await openVaultFolder();
    };

    const handleForceVaultSave = async () => {
        setIsSavingToVault(true);
        const state = useWorldStore.getState();
        const success = await saveCodexToDisk({
            worlds: state.worlds,
            activeWorldId: state.activeWorldId,
            world: state.world,
            theme: state.theme,
            scratchpadNote: state.scratchpadNote
        });
        setIsSavingToVault(false);
        if (success) {
            setVaultNotice('✓ Synced actively to codex.json on disk');
            setTimeout(() => setVaultNotice(null), 3000);
        }
    };

    const handleLoadMairimashitaWorld = () => {
        const existing = worlds.find(w => w.id === mairimashitaWorld.id);
        if (existing) {
            switchWorld(existing.id);
            setImportNotice({ text: '✓ Switched to existing Netherworld (Mairimashita! Iruma-kun) Realm' });
            return;
        }
        useWorldStore.setState(prev => ({
            worlds: [...prev.worlds, mairimashitaWorld],
            world: mairimashitaWorld,
            activeWorldId: mairimashitaWorld.id
        }));
        setImportNotice({ text: '✓ Successfully spawned and loaded Netherworld (Mairimashita! Iruma-kun) Realm' });
    };

    const handleAddSuggestion = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = newSuggestionInput.trim();
        if (!trimmed) return;
        const current = world.customSuggestions?.[selectedSuggestionType] || [];
        if (current.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
            setNewSuggestionInput('');
            return;
        }
        setWorld({
            ...world,
            customSuggestions: {
                ...(world.customSuggestions || {}),
                [selectedSuggestionType]: [...current, trimmed]
            }
        });
        setNewSuggestionInput('');
    };

    const handleRemoveSuggestion = (type: EntityType, index: number) => {
        const current = world.customSuggestions?.[type] || [];
        setWorld({
            ...world,
            customSuggestions: {
                ...(world.customSuggestions || {}),
                [type]: current.filter((_, i) => i !== index)
            }
        });
    };

    const handleClearSuggestions = (type: EntityType) => {
        setWorld({
            ...world,
            customSuggestions: {
                ...(world.customSuggestions || {}),
                [type]: []
            }
        });
    };

    const handleBatchExport = async (format: 'markdown' | 'html') => {
        setBatchExporting(true);
        setBatchNotice(null);
        try {
            const entities = batchExportType === 'all'
                ? world.entities
                : world.entities.filter(e => e.type === batchExportType);

            if (entities.length === 0) {
                setBatchNotice({ text: 'No entries found for the selected type.', isError: true });
                setBatchExporting(false);
                return;
            }

            // Build a concatenated multi-entry file
            const parts: string[] = [];
            const divider = format === 'markdown' ? '\n\n---\n\n' : '';

            if (format === 'markdown') {
                entities.forEach(e => parts.push(generateEntityMarkdown(e, world.entities)));
                const combined = parts.join(divider);
                const typeSuffix = batchExportType === 'all' ? 'all-entries' : batchExportType;
                await downloadTextFile(combined, `nexus-lore-${typeSuffix}.md`, 'text/markdown');
            } else {
                // For HTML: wrap each entry's body in an <article> inside one document
                const allHtmlBodies: string[] = [];
                entities.forEach(e => {
                    const fullHtml = generateEntityHtml(e, world.entities, themeId);
                    // Extract just the container content between <body> tags
                    const bodyMatch = fullHtml.match(/<div class="container">([\/\s\S]*?)<\/div>\s*<\/body>/);
                    allHtmlBodies.push(`<article class="entry">${bodyMatch ? bodyMatch[0] : fullHtml}</article>`);
                });
                const typeSuffix = batchExportType === 'all' ? 'all-entries' : batchExportType;
                const doc = `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><title>${world.name} — Nexus Chronicle Lore Export</title>
<style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#f8fafc;padding:2rem 1rem;} .entry{max-width:860px;margin:0 auto 5rem;border-bottom:1px solid #334155;padding-bottom:3rem;}</style>
</head><body>${allHtmlBodies.join('\n')}</body></html>`;
                await downloadTextFile(doc, `nexus-lore-${typeSuffix}.html`, 'text/html');
            }

            setBatchNotice({ text: `✓ Exported ${entities.length} ${format === 'markdown' ? 'Markdown' : 'HTML'} entr${entities.length === 1 ? 'y' : 'ies'}.` });
            setTimeout(() => setBatchNotice(null), 4000);
        } catch (err: any) {
            setBatchNotice({ text: `Export failed: ${err?.message || 'Unknown error'}`, isError: true });
        } finally {
            setBatchExporting(false);
        }
    };

    const [isPruning, setIsPruning] = useState(false);
    const [pruneNotice, setPruneNotice] = useState<string | null>(null);
    const [isVaultOpen, setIsVaultOpen] = useState(false);

    const handlePruneMedia = async () => {
        setIsPruning(true);
        setPruneNotice(null);
        try {
            const activeUris = extractActiveAssetUris(worlds);
            const { deletedCount, bytesReclaimed } = await pruneOrphanAssets(activeUris);
            const mb = (bytesReclaimed / (1024 * 1024)).toFixed(1);
            if (deletedCount === 0) {
                setPruneNotice('✓ Vault clean (0 orphans)');
            } else {
                setPruneNotice(`✓ Pruned ${deletedCount} files (${mb} MB reclaimed)`);
            }
            setTimeout(() => setPruneNotice(null), 4000);
        } catch (err: any) {
            setPruneNotice(`Prune failed: ${err?.message || 'Error'}`);
            setTimeout(() => setPruneNotice(null), 4000);
        } finally {
            setIsPruning(false);
        }
    };

    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [isBeamModalOpen, setIsBeamModalOpen] = useState(false);
    const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
    const [realmToDelete, setRealmToDelete] = useState<WorldData | null>(null);
    const [editingWorldId, setEditingWorldId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [importNotice, setImportNotice] = useState<{ text: string; isError?: boolean } | null>(null);
    const [nexusNotice, setNexusNotice] = useState<{ text: string; isError?: boolean } | null>(null);
    const [nexusExporting, setNexusExporting] = useState(false);
    const nexusImportRef = useRef<HTMLInputElement>(null);
    const jsonImportRef = useRef<HTMLInputElement>(null);
    const [faNotice, setFaNotice] = useState<{ text: string; isError?: boolean } | null>(null);
    const [faMigrating, setFaMigrating] = useState(false);
    const faImportRef = useRef<HTMLInputElement>(null);
    const faImportModeRef = useRef<'new' | 'merge'>('new');

    const accent = t.colors.textAccent;
    const bgCard = `${t.card.base}`;

    const stats = useMemo(() => {
        const total = world.entities.length;
        const byType = world.entities.reduce((acc: any, e: any) => {
            acc[e.type] = (acc[e.type] || 0) + 1;
            return acc;
        }, {});
        const totalConnections = world.entities.reduce((acc: number, e: any) => {
            const char = e as any;
            let count = (char.locationIds?.length || 0) + (char.loreNoteIds?.length || 0) + (char.mythIds?.length || 0);
            if (char.groupConnections) {
                Object.values(char.groupConnections).forEach((g: any) => {
                    Object.values(g).forEach((v: any) => { if (Array.isArray(v)) count += v.length; });
                });
            }
            return acc + count;
        }, 0);
        return { total, byType, totalConnections };
    }, [world.entities]);

    const handleExportNexusArchive = async (mode: 'world' | 'universe') => {
        setNexusExporting(true);
        setNexusNotice(null);
        try {
            const target = mode === 'universe'
                ? { universe: { worlds, version: 1 as const, exportedAt: Date.now() } }
                : { world };
            await exportNexusArchiveFile(target);
            setNexusNotice({ text: `✓ .nexus archive packaged — assets bundled uncompressed.` });
        } catch (err: any) {
            setNexusNotice({ text: `Failed to pack archive: ${err?.message || 'Unknown error'}`, isError: true });
        } finally {
            setNexusExporting(false);
        }
    };

    const processNexusFile = async (file: File | Blob) => {
        setNexusNotice(null);
        try {
            const { manifest, assetsImported } = await unpackNexusArchive(file);
            if (manifest.universe) {
                const result = importWorldData(manifest.universe, 'new');
                setNexusNotice({ text: `✓ Universe archive restored — ${result.message}. ${assetsImported} assets loaded to vault.`, isError: !result.success });
            } else if (manifest.world) {
                const mode = world.entities.length === 0 ? 'replace' : 'new';
                const result = importWorldData(manifest.world, mode);
                setNexusNotice({ text: `✓ Realm restored — ${result.message}. ${assetsImported} assets loaded to vault.`, isError: !result.success });
            } else {
                setNexusNotice({ text: 'Archive is valid but contains no world data.', isError: true });
            }
        } catch (err: any) {
            setNexusNotice({ text: `Failed to unpack archive: ${err?.message || 'Invalid .nexus file'}`, isError: true });
        }
    };

    const processJsonText = (jsonString: string) => {
        try {
            const parsed = JSON.parse(jsonString);
            const isUniverse = parsed && Array.isArray(parsed.worlds) && parsed.version === 1;

            if (isUniverse) {
                const result = importWorldData(parsed, 'new');
                setImportNotice({ text: result.message, isError: !result.success });
            } else if (parsed && parsed.name && Array.isArray(parsed.entities)) {
                const mode = world.entities.length === 0 ? 'replace' : 'new';
                const result = importWorldData(parsed, mode);
                setImportNotice({ text: result.message, isError: !result.success });
            } else {
                setImportNotice({ text: 'Invalid JSON format for Nexus Chronicle realm data.', isError: true });
            }
        } catch (err: any) {
            setImportNotice({ text: `Failed to parse JSON file: ${err?.message || 'Syntax error'}`, isError: true });
        }
    };

    const handleImportNexusClick = async () => {
        if (isDesktopApp()) {
            const fileData = await openFileNative([{ name: 'Nexus Campaign Archive', extensions: ['nexus'] }]);
            if (!fileData) return;
            const file = new File([fileData.data], fileData.fileName, { type: 'application/octet-stream' });
            await processNexusFile(file);
        } else {
            nexusImportRef.current?.click();
        }
    };

    const handleImportJsonClick = async () => {
        if (isDesktopApp()) {
            const fileData = await openFileNative([{ name: 'JSON Codex Document', extensions: ['json'] }]);
            if (!fileData) return;
            processJsonText(fileData.text);
        } else {
            jsonImportRef.current?.click();
        }
    };

    const handleImportNexusFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        await processNexusFile(file);
    };

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            processJsonText(event.target?.result as string);
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const processFaFiles = async (fileList: FileList | File[], mode: 'new' | 'merge') => {
        setFaMigrating(true);
        setFaNotice(null);
        try {
            const inputFiles: FaInputFile[] = [];
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                const buffer = await file.arrayBuffer();
                inputFiles.push({
                    name: file.name,
                    content: new Uint8Array(buffer)
                });
            }

            const result = importFantasiaArchiveProject(inputFiles);
            if (!result.success || !result.world) {
                setFaNotice({ text: result.message, isError: true });
                return;
            }

            if (mode === 'merge') {
                const existingIds = new Set(world.entities.map(e => e.id));
                const newEntities = result.entities.filter(e => !existingIds.has(e.id));
                const updatedEntities = [...world.entities, ...newEntities];
                const reconciled = reconcileAllBidirectionalRelations(updatedEntities);
                setWorld({ ...world, entities: reconciled });
                setFaNotice({
                    text: `✓ Merged ${newEntities.length} entries into "${world.name}" (${result.stats.relationshipsCount} relations linked).`
                });
            } else {
                const importRes = importWorldData(result.world, 'new');
                setFaNotice({
                    text: `✓ ${result.message} (${result.stats.relationshipsCount} relations synchronized).`,
                    isError: !importRes.success
                });
            }
        } catch (err: any) {
            setFaNotice({ text: `Migration failed: ${err?.message || 'Unknown error'}`, isError: true });
        } finally {
            setFaMigrating(false);
        }
    };

    const handleFaClick = async (mode: 'new' | 'merge') => {
        if (isDesktopApp()) {
            const fileData = await openFileNative([
                { name: 'Fantasia Archive (*.zip, *.json, *.txt)', extensions: ['zip', 'json', 'txt'] }
            ]);
            if (!fileData) return;
            const file = new File([fileData.data], fileData.fileName, { type: 'application/octet-stream' });
            await processFaFiles([file], mode);
        } else {
            faImportModeRef.current = mode;
            faImportRef.current?.click();
        }
    };

    const handleImportFaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        await processFaFiles(files, faImportModeRef.current);
        e.target.value = '';
    };

    const handleStartEdit = (w: WorldData) => {
        setEditingWorldId(w.id || activeWorldId);
        setEditName(w.name);
        setEditDescription(w.description || '');
    };

    const handleSaveEdit = (worldId: string) => {
        if (!editName.trim()) return;
        updateWorldDetails(worldId, {
            name: editName.trim(),
            description: editDescription.trim()
        });
        setEditingWorldId(null);
    };

    return (
        <div className="p-6 sm:p-10 md:p-14 max-w-6xl xl:max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-40">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className={`text-6xl font-serif font-black uppercase tracking-tighter ${accent}`}>System Settings</h2>
                    <p className="opacity-50 text-sm mt-2 italic font-serif">Configure parameters, manage multi-campaign realms, and curate backups.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        type="button"
                        onClick={handleLoadMairimashitaWorld}
                        className={`px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                            (themeId === 'royal-codex')
                                ? 'bg-[#5b0e18] text-[#ebd9bd] hover:bg-[#70121e] border border-[#c8a96e]/60 shadow-md'
                                : (layoutMode === 'wiki')
                                ? 'bg-stone-200 text-stone-800 hover:bg-stone-300 border border-stone-400'
                                : 'bg-slate-800 text-yellow-300 hover:bg-slate-700 border border-slate-700'
                        }`}
                        title="Load complete reference realm based on Mairimashita! Iruma-kun with all 21 categories populated"
                    >
                        <Sparkles size={15} className="text-yellow-400" />
                        <span>Load Iruma-kun Realm</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsNewModalOpen(true)}
                        className={`px-5 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                            (themeId === 'royal-codex')
                                ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#881337] border border-[#c8a96e] shadow-md'
                                : (layoutMode === 'wiki')
                                ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]'
                                : 'bg-[#fef08a] text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'
                        }`}
                    >
                        <Plus size={16} /> Found New Realm
                    </button>
                </div>
            </header>

            {/* Import Feedback Banner */}
            {importNotice && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                    importNotice.isError
                        ? 'bg-red-500/10 border-red-500/30 text-red-300'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}>
                    <span>{importNotice.text}</span>
                    <button
                        onClick={() => setImportNotice(null)}
                        className="opacity-60 hover:opacity-100 font-bold px-2 py-0.5 rounded"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Multiverse Registry (All Realms) */}
            <section className={`p-8 rounded-3xl border ${bgCard} shadow-2xl space-y-6`}>
                <div className="flex items-center justify-between border-b border-current/10 pb-4">
                    <div className="flex items-center gap-3">
                        <Layers size={22} className={accent} />
                        <div>
                            <h3 className="text-lg font-serif font-black uppercase tracking-wide">
                                Multiverse Registry ({worlds.length} Realms)
                            </h3>
                            <p className="text-[11px] opacity-60 font-serif italic">
                                Seamlessly switch between worlds, fork campaigns, or archive ancient histories.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {worlds.map((w) => {
                        const isCurrent = w.id === activeWorldId;
                        const phaseColor = PHASE_COLORS[w.worldPhase] || '#fef08a';
                        const isEditingThis = editingWorldId === w.id;

                        return (
                            <div
                                key={w.id}
                                className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all relative ${
                                    isCurrent
                                        ? (themeId === 'royal-codex')
                                            ? 'bg-[#70121e]/15 border-[#70121e] ring-1 ring-[#70121e]'
                                            : (layoutMode === 'wiki')
                                            ? 'bg-[#b91c1c]/10 border-[#b91c1c] ring-1 ring-[#b91c1c]'
                                            : 'bg-yellow-400/10 border-yellow-400/50 ring-1 ring-yellow-400/50 shadow-lg'
                                        : isLight
                                        ? 'bg-[#ede2cb]/70 border-[#c8a96e]/40 hover:border-[#c8a96e] text-[#2b1810]'
                                        : 'bg-black/20 border-white/5 hover:border-white/20'
                                }`}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <div
                                                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                                                style={{ backgroundColor: phaseColor }}
                                                title={PHASE_NAMES[w.worldPhase]}
                                            />
                                            {isEditingThis ? (
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className={`px-2 py-1 rounded text-xs font-bold w-full outline-none ${
                                                        isLight ? 'bg-white border border-[#c8a96e] text-[#2b1810]' : 'bg-black/40 border border-white/20 text-white'
                                                    }`}
                                                    autoFocus
                                                />
                                            ) : (
                                                <h4 className="font-serif font-black text-sm uppercase tracking-wider truncate">
                                                    {w.name}
                                                </h4>
                                            )}
                                        </div>

                                        {isCurrent ? (
                                            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                                                (themeId === 'royal-codex') ? 'bg-[#70121e] text-[#fff8e7]' : (layoutMode === 'wiki') ? 'bg-[#b91c1c] text-white' : 'bg-yellow-400 text-black'
                                            }`}>
                                                Active Realm
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => switchWorld(w.id || activeWorldId)}
                                                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-xl transition-all flex items-center gap-1 ${
                                                    isLight ? 'bg-[#70121e]/15 hover:bg-[#70121e] text-[#70121e] hover:text-[#fff8e7] border border-[#c8a96e]/50' : 'bg-white/10 hover:bg-white/20 text-white'
                                                }`}
                                            >
                                                <span>Enter</span> <ArrowRight size={11} />
                                            </button>
                                        )}
                                    </div>

                                    {isEditingThis ? (
                                        <textarea
                                            rows={2}
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            placeholder="Realm synopsis..."
                                            className={`w-full px-2 py-1.5 rounded text-xs outline-none resize-none ${
                                                isLight ? 'bg-white border border-[#c8a96e] text-[#2b1810]' : 'bg-black/40 border border-white/20 text-white'
                                            }`}
                                        />
                                    ) : (
                                        <p className="text-xs opacity-60 font-serif italic line-clamp-2 min-h-[2rem]">
                                            {w.description || 'No synopsis recorded for this realm.'}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-3 text-[10px] font-mono opacity-50 pt-1">
                                        <span>{w.entities?.length || 0} Entities</span>
                                        <span>•</span>
                                        <span>{w.mapConnections?.length || 0} Ley-Lines</span>
                                        <span>•</span>
                                        <span className="capitalize">{PHASE_NAMES[w.worldPhase] || w.worldPhase}</span>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-current/10 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        {isEditingThis ? (
                                            <button
                                                onClick={() => handleSaveEdit(w.id || activeWorldId)}
                                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold flex items-center gap-1 text-[11px]"
                                            >
                                                <Check size={12} /> Save
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleStartEdit(w)}
                                                className="p-1.5 rounded-lg hover:bg-white/10 opacity-60 hover:opacity-100 transition-opacity"
                                                title="Rename / Edit Synopsis"
                                            >
                                                <Edit2 size={13} />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => duplicateWorld(w.id || activeWorldId)}
                                            className="p-1.5 rounded-lg hover:bg-white/10 opacity-60 hover:opacity-100 transition-opacity"
                                            title="Fork / Clone Realm"
                                        >
                                            <Copy size={13} />
                                        </button>

                                        <button
                                            onClick={() => exportWorld(w.id)}
                                            className="p-1.5 rounded-lg hover:bg-white/10 opacity-60 hover:opacity-100 transition-opacity"
                                            title="Export Realm JSON"
                                        >
                                            <Download size={13} />
                                        </button>
                                    </div>

                                    {worlds.length > 1 && (
                                        <button
                                            onClick={() => setRealmToDelete(w)}
                                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 opacity-60 hover:opacity-100 transition-all"
                                            title="Dissolve / Delete Realm"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Statistics & Realm Identity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={`lg:col-span-1 p-8 rounded-3xl border ${bgCard} shadow-2xl space-y-6`}>
                    <h3 className={`text-xs font-black uppercase tracking-widest ${accent} border-b border-slate-800/20 pb-2`}>
                        Active Realm Statistics
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] uppercase font-bold opacity-40">Total Entities</span>
                            <span className="text-3xl font-serif font-bold">{stats.total}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] uppercase font-bold opacity-40">Connections</span>
                            <span className="text-xl font-serif font-bold">{stats.totalConnections}</span>
                        </div>
                        <div className="h-[1px] w-full bg-slate-800/40 my-2" />
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2">
                            {Object.entries(stats.byType).map(([type, count]) => (
                                <div key={type} className={`flex flex-col p-2 rounded border ${isLight ? 'bg-[#ede2cb]/60 border-[#c8a96e]/30' : 'bg-black/20 border-white/5'}`}>
                                    <span className="text-[8px] uppercase font-black opacity-30">{TYPE_LABELS[type as EntityType] || type}</span>
                                    <span className="text-sm font-bold">{count as number}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={`lg:col-span-2 p-10 rounded-3xl border ${bgCard} shadow-2xl space-y-10`}>
                    <section className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                            <Palette size={14} /> Active Realm Identity & Theme
                        </h3>
                        <FormInput label="Active Realm Name" value={world.name} onChange={(v: string) => setWorld({ ...world, name: v })} />
                        <FormInput label="Global Atlas Image (URL)" value={world.mapImage || ''} onChange={(v: string) => setWorld({ ...world, mapImage: v })} />
                        
                        <div className="space-y-3 pt-2">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Visual Codex Theme</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <button
                                    onClick={() => setTheme('sovereign')}
                                    className={`p-4 rounded-xl border text-left transition-all ${
                                        theme === 'sovereign'
                                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/60 shadow-lg'
                                            : isLight
                                            ? 'bg-[#f7efe0] text-[#2b1810] border-[#c8a96e]/40 hover:border-[#c8a96e]'
                                            : 'bg-black/20 text-slate-400 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="text-xs font-bold flex items-center gap-2">🌙 Sovereign</div>
                                    <div className="text-[9px] opacity-60 mt-1">Dark Obsidian & Warm Gold</div>
                                </button>
                                <button
                                    onClick={() => setTheme('wiki')}
                                    className={`p-4 rounded-xl border text-left transition-all ${
                                        theme === 'wiki'
                                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-lg'
                                            : isLight
                                            ? 'bg-[#f7efe0] text-[#2b1810] border-[#c8a96e]/40 hover:border-[#c8a96e]'
                                            : 'bg-black/20 text-slate-400 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="text-xs font-bold flex items-center gap-2">📜 Wiki Mode</div>
                                    <div className="text-[9px] opacity-60 mt-1">Classic Parchment & Red</div>
                                </button>
                                <button
                                    onClick={() => setTheme('royal-codex')}
                                    className={`p-4 rounded-xl border text-left transition-all ${
                                        theme === 'royal-codex'
                                            ? 'bg-[#70121e] text-[#fff8e7] border-[#c8a96e] shadow-lg'
                                            : isLight
                                            ? 'bg-[#f7efe0] text-[#2b1810] border-[#c8a96e]/40 hover:border-[#c8a96e]'
                                            : 'bg-black/20 text-slate-400 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="text-xs font-bold flex items-center gap-2">👑 Royal Codex</div>
                                    <div className="text-[9px] opacity-60 mt-1">Illuminated Parchment & Gold</div>
                                </button>
                                <button
                                    onClick={() => setTheme('grand-voyager')}
                                    className={`p-4 rounded-xl border text-left transition-all ${
                                        theme === 'grand-voyager'
                                            ? 'bg-[#0d9488]/20 text-[#2dd4bf] border-[#2dd4bf]/70 shadow-lg shadow-teal-950/40'
                                            : isLight
                                            ? 'bg-[#f7efe0] text-[#2b1810] border-[#c8a96e]/40 hover:border-[#c8a96e]'
                                            : 'bg-black/20 text-slate-400 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="text-xs font-bold flex items-center gap-2">🧭 Grand Voyager</div>
                                    <div className="text-[9px] opacity-60 mt-1">Tropical Seas & Teak Timber</div>
                                </button>
                            </div>
                        </div>

                        {/* Realm Blueprints & Engine Modules (Approaches 2 & 7) */}
                        <div className={`p-6 rounded-2xl border space-y-6 ${
                            isLight ? 'bg-[#f7efe0]/80 border-[#c8a96e]/40' : 'bg-black/30 border-white/10'
                        }`}>
                            {/* Section Header */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sliders size={15} className={accent} />
                                        <h4 className={`text-xs font-black uppercase tracking-widest ${accent}`}>
                                            Realm Blueprints & Engine Modules
                                        </h4>
                                    </div>
                                    <span className="text-[10px] font-mono opacity-50">
                                        {getActiveEntityTypes(world).length} / {ALL_ENTITY_TYPES.length} Blueprints Active
                                    </span>
                                </div>
                                <p className="text-[11px] opacity-60 font-serif italic mt-1">
                                    Tailor Nexus Chronicle to any universe. Toggle off fantasy combat rolls, cybernetic blueprints, or arcane groups to keep your workspace crisp and distraction-free. Existing data is permanently preserved.
                                </p>
                            </div>

                            {/* Quick Presets Bar */}
                            <div className="space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-wider opacity-60 block">
                                    Worldbuilding Presets
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
                                    {REALM_PRESETS.map(preset => {
                                        const currentActiveTypes = getActiveEntityTypes(world);
                                        const isActive = preset.activeEntityTypes.length === currentActiveTypes.length &&
                                            preset.activeEntityTypes.every(t => currentActiveTypes.includes(t)) &&
                                            (Object.keys(preset.activeModules) as Array<keyof RealmModuleConfig>).every(k => isModuleActive(world, k) === preset.activeModules[k]);

                                        return (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => {
                                                    setWorld({
                                                        ...world,
                                                        activeEntityTypes: [...preset.activeEntityTypes],
                                                        activeModules: { ...preset.activeModules }
                                                    });
                                                }}
                                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                                    isActive
                                                        ? isLight
                                                            ? 'bg-[#70121e] text-[#fff8e7] border-[#c8a96e] shadow-md font-bold'
                                                            : 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-md font-bold'
                                                        : isLight
                                                        ? 'bg-[#fdfbf6] text-[#2b1810] border-[#c8a96e]/30 hover:border-[#c8a96e] hover:bg-[#ede2cb]/60'
                                                        : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/20 hover:bg-white/10'
                                                }`}
                                                title={preset.description}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="text-sm">{preset.icon}</span>
                                                    {isActive && <Check size={12} className={isLight ? 'text-[#e6c687]' : 'text-amber-400'} />}
                                                </div>
                                                <span className="text-[10px] font-bold mt-1.5 leading-tight">{preset.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Master Engine Switches (Approach 2) */}
                            <div className="space-y-2.5 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-wider opacity-60 block">
                                        Engine System Modules
                                    </span>
                                    <span className="text-[9px] opacity-40 font-mono">Approach 2: Realm Switches</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                                    {[
                                        { key: 'combatStats' as const, label: 'RPG Combat & Stats', icon: Swords, desc: 'D20 attributes, radar chart, vital metrics' },
                                        { key: 'magicSystems' as const, label: 'Magic & Arcana', icon: Sparkles, desc: 'Spell schools, arcane groups, mystic ties' },
                                        { key: 'techSystems' as const, label: 'Tech & Cybernetics', icon: Cpu, desc: 'Technological blueprints, science divisions' },
                                        { key: 'factionMatrix' as const, label: 'Faction Tension Matrix', icon: Shield, desc: 'Balance of power, treaties, and conflict' },
                                        { key: 'atlasCoordinates' as const, label: 'Cartography & Atlas', icon: MapPin, desc: 'Map pins, geographic zones, journey routes' },
                                    ].map(module => {
                                        const active = isModuleActive(world, module.key);
                                        return (
                                            <button
                                                key={module.key}
                                                type="button"
                                                onClick={() => {
                                                    const current = getActiveModules(world);
                                                    setWorld({
                                                        ...world,
                                                        activeModules: {
                                                            ...current,
                                                            [module.key]: !active
                                                        }
                                                    });
                                                }}
                                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                                                    active
                                                        ? isLight
                                                            ? 'bg-[#f5ecda] border-[#c8a96e] text-[#2b1810]'
                                                            : 'bg-white/10 border-white/20 text-white'
                                                        : isLight
                                                        ? 'bg-black/5 border-dashed border-black/20 text-[#2b1810]/50 opacity-60 hover:opacity-100'
                                                        : 'bg-black/20 border-dashed border-white/10 text-slate-500 opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                <div className={`p-1.5 rounded-lg mt-0.5 ${
                                                    active 
                                                        ? isLight ? 'bg-[#70121e]/15 text-[#70121e]' : 'bg-amber-400/20 text-amber-400' 
                                                        : 'bg-black/10 text-slate-500'
                                                }`}>
                                                    <module.icon size={13} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <span className="text-[11px] font-bold truncate">{module.label}</span>
                                                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                                                            active ? (isLight ? 'bg-[#70121e]/10 text-[#70121e]' : 'bg-amber-400/15 text-amber-300') : 'opacity-40'
                                                        }`}>
                                                            {active ? 'ON' : 'OFF'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[9px] opacity-60 line-clamp-1 mt-0.5">{module.desc}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Entity Blueprints Category Matrix (Approach 7) */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-wider opacity-60 block">
                                        Entity Type Blueprints (Macro Filtering)
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setWorld({ ...world, activeEntityTypes: [...ALL_ENTITY_TYPES] })}
                                            className="text-[9px] font-bold text-amber-500 hover:underline cursor-pointer"
                                        >
                                            Enable All (21)
                                        </button>
                                        <span className="text-[9px] opacity-30">|</span>
                                        <span className="text-[9px] opacity-40 font-mono">Approach 7</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {HIERARCHY_CONFIG.map(group => {
                                        const groupActive = group.types.filter(t => isEntityTypeActive(world, t));
                                        const allGroupEnabled = groupActive.length === group.types.length;

                                        return (
                                            <div
                                                key={group.id}
                                                className={`p-3.5 rounded-xl border space-y-2.5 ${
                                                    isLight ? 'bg-[#fffdf9] border-[#c8a96e]/30' : 'bg-black/20 border-white/5'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between border-b pb-1.5 border-current/10">
                                                    <div className="flex items-center gap-1.5">
                                                        <group.icon size={12} className={isLight ? 'text-[#70121e]' : 'text-amber-400'} />
                                                        <span className="text-[10px] font-black uppercase tracking-wider font-serif">
                                                            {group.label}
                                                        </span>
                                                        <span className="text-[9px] opacity-40 font-mono">
                                                            ({groupActive.length}/{group.types.length})
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const currentSet = new Set(getActiveEntityTypes(world));
                                                            if (allGroupEnabled) {
                                                                group.types.forEach(t => currentSet.delete(t));
                                                            } else {
                                                                group.types.forEach(t => currentSet.add(t));
                                                            }
                                                            setWorld({ ...world, activeEntityTypes: Array.from(currentSet) });
                                                        }}
                                                        className="text-[9px] font-mono opacity-60 hover:opacity-100 cursor-pointer"
                                                    >
                                                        {allGroupEnabled ? 'None' : 'All'}
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {group.types.map(type => {
                                                        const isActive = isEntityTypeActive(world, type);
                                                        const count = stats.byType[type] || 0;

                                                        return (
                                                            <button
                                                                key={type}
                                                                type="button"
                                                                onClick={() => {
                                                                    const current = getActiveEntityTypes(world);
                                                                    const next = isActive
                                                                        ? current.filter(t => t !== type)
                                                                        : [...current, type];
                                                                    setWorld({ ...world, activeEntityTypes: next });
                                                                }}
                                                                className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                                                                    isActive
                                                                        ? isLight
                                                                            ? 'bg-[#f7efe0] border-[#c8a96e]/60 text-[#2b1810]'
                                                                            : 'bg-white/10 border-white/15 text-white'
                                                                        : isLight
                                                                        ? 'bg-black/5 border-dashed border-black/10 text-stone-400 opacity-50'
                                                                        : 'bg-black/30 border-dashed border-white/5 text-slate-500 opacity-50'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-1.5 min-w-0">
                                                                    <CodexCheckbox checked={isActive} size="sm" />
                                                                    <span className="text-[10px] font-semibold truncate">
                                                                        {TYPE_LABELS[type]}
                                                                    </span>
                                                                </div>
                                                                {count > 0 && (
                                                                    <span className={`text-[8px] font-mono px-1 py-0.2 rounded shrink-0 ${
                                                                        isLight ? 'bg-[#70121e]/10 text-[#70121e]' : 'bg-amber-400/20 text-amber-300'
                                                                    }`} title={`${count} records exist in storage`}>
                                                                        {count}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Codex Document Defaults (Approach 6 Global Toggle) */}
                            <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                                isLight ? 'bg-[#fdfaf2] border-[#c8a96e]/30' : 'bg-black/25 border-white/5'
                            }`}>
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-black uppercase tracking-wider block">
                                        Default to Hide Empty Unfilled Fields in Codex View
                                    </span>
                                    <p className="text-[10px] opacity-60 font-serif italic">
                                        When enabled, viewing any entity automatically conceals unpopulated attributes and empty lists by default across this Realm. Can be individually adjusted per-document.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setWorld({ ...world, hideEmptyFieldsDefault: !world.hideEmptyFieldsDefault })}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                        world.hideEmptyFieldsDefault
                                            ? isLight
                                                ? 'bg-[#70121e] text-[#fff8e7] border-[#c8a96e]'
                                                : 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                                            : isLight
                                            ? 'bg-black/5 text-[#2b1810]/60 border-black/20'
                                            : 'bg-white/5 text-slate-400 border-white/10'
                                    }`}
                                >
                                    {world.hideEmptyFieldsDefault ? '✓ Auto-Hide' : 'Show All'}
                                </button>
                            </div>

                            {/* Field Visibility Config (Approach 6) */}
                            {(() => {
                                const fields = CONFIGURABLE_FIELDS[selectedFieldType] || [];
                                const hiddenForType = world.hiddenFields?.[selectedFieldType] || [];
                                const fieldTypePills: EntityType[] = Object.keys(CONFIGURABLE_FIELDS) as EntityType[];
                                return (
                                    <div className={`p-5 rounded-2xl border space-y-4 ${
                                        isLight ? 'bg-[#ede2cb]/60 border-[#c8a96e]/30' : 'bg-black/20 border-white/5'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            <Eye size={14} className={isLight ? 'text-[#70121e]' : 'text-amber-400'} />
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-[#70121e]' : 'text-amber-300'}`}>
                                                Field Visibility per Entity Type
                                            </span>
                                            <span className="text-[9px] opacity-40 font-mono">Approach 6</span>
                                        </div>
                                        <p className="text-[11px] opacity-60 font-serif italic">
                                            Hide specific fields globally across all entities of the selected type. Hidden fields disappear from both the editor and viewer.
                                        </p>
                                        {/* Entity type pills */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {fieldTypePills.map(ft => (
                                                <button
                                                    key={ft}
                                                    type="button"
                                                    onClick={() => setSelectedFieldType(ft)}
                                                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                                                        selectedFieldType === ft
                                                            ? isLight
                                                                ? 'bg-[#70121e] text-[#fff8e7] border-[#c8a96e]'
                                                                : 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                                                            : isLight
                                                            ? 'bg-black/5 text-[#2b1810]/60 border-black/15 hover:bg-black/10'
                                                            : 'bg-white/5 text-slate-400 border-white/8 hover:bg-white/10'
                                                    }`}
                                                >
                                                    {ft}
                                                    {(world.hiddenFields?.[ft]?.length ?? 0) > 0 && (
                                                        <span className={`ml-1 text-[8px] font-mono ${isLight ? 'text-[#c8a96e]' : 'text-amber-500'}`}>
                                                            {world.hiddenFields![ft]!.length}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        {/* Field list */}
                                        {fields.length > 0 ? (
                                            <div className="space-y-1.5">
                                                {fields.map(field => {
                                                    const isHidden = hiddenForType.includes(field.key);
                                                    return (
                                                        <div
                                                            key={field.key}
                                                            className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg border transition-all ${
                                                                isHidden
                                                                    ? isLight
                                                                        ? 'bg-[#f5e8d0]/60 border-[#c8a96e]/20 opacity-60'
                                                                        : 'bg-white/3 border-white/5 opacity-50'
                                                                    : isLight
                                                                    ? 'bg-white/50 border-[#c8a96e]/20'
                                                                    : 'bg-white/5 border-white/8'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                {isHidden
                                                                    ? <EyeOff size={12} className="shrink-0 opacity-50" />
                                                                    : <Eye size={12} className={`shrink-0 ${isLight ? 'text-[#70121e]' : 'text-amber-400'}`} />
                                                                }
                                                                <span className={`text-[11px] font-serif truncate ${isHidden ? 'line-through opacity-50' : ''}`}>
                                                                    {field.label}
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newHiddenFields = toggleFieldHidden(world.hiddenFields, selectedFieldType, field.key);
                                                                    setWorld({ ...world, hiddenFields: newHiddenFields });
                                                                }}
                                                                className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                                                                    isHidden
                                                                        ? isLight
                                                                            ? 'bg-[#70121e]/10 text-[#70121e] border-[#70121e]/30 hover:bg-[#70121e]/20'
                                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                                                                        : isLight
                                                                        ? 'bg-black/5 text-[#2b1810]/60 border-black/15 hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                                                                        : 'bg-white/5 text-slate-400 border-white/8 hover:bg-red-900/20 hover:text-red-400 hover:border-red-700/40'
                                                                }`}
                                                            >
                                                                {isHidden ? 'Show' : 'Hide'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                                {hiddenForType.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setWorld({ ...world, hiddenFields: { ...world.hiddenFields, [selectedFieldType]: [] } })}
                                                        className="text-[9px] font-mono text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider cursor-pointer mt-1"
                                                    >
                                                        Reset {selectedFieldType} ({hiddenForType.length} hidden)
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-[11px] opacity-40 italic text-center py-2">No configurable fields for this type.</p>
                                        )}
                                    </div>
                                );
                            })()}
                            {/* Genre-Switchable Entity Templates (Approach 7) */}
                            {(() => {
                                const currentGenre = getActiveGenreTemplate(world);
                                const getGenreIcon = (iconName: string) => {
                                    switch (iconName) {
                                        case 'Sparkles': return Sparkles;
                                        case 'Cpu': return Cpu;
                                        case 'MapPin': return MapPin;
                                        case 'Skull': return Skull;
                                        default: return Globe;
                                    }
                                };
                                return (
                                    <div className={`p-5 rounded-2xl border space-y-4 ${
                                        isLight ? 'bg-[#ede2cb]/60 border-[#c8a96e]/30' : 'bg-black/20 border-white/5'
                                    }`}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Globe size={14} className={isLight ? 'text-[#70121e]' : 'text-amber-400'} />
                                                    <span className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-[#70121e]' : 'text-amber-300'}`}>
                                                        Genre-Switchable Realm Template
                                                    </span>
                                                    <span className="text-[9px] opacity-40 font-mono">Approach 7</span>
                                                </div>
                                                <p className="text-[11px] opacity-60 font-serif italic mt-1">
                                                    Dynamically adapts entity terminology, threat ratings, equipment classifications, and recommended field visibility to match your setting's tone without modifying your underlying data.
                                                </p>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider shrink-0 border ${
                                                isLight ? 'bg-[#70121e]/10 text-[#70121e] border-[#70121e]/25' : 'bg-amber-400/10 text-amber-300 border-amber-400/25'
                                            }`}>
                                                Active: {currentGenre}
                                            </span>
                                        </div>

                                        {/* Genre Template Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                                            {GENRE_TEMPLATE_LIST.map(tmpl => {
                                                const isSelected = currentGenre === tmpl.id;
                                                const IconComponent = getGenreIcon(tmpl.icon);
                                                return (
                                                    <div
                                                        key={tmpl.id}
                                                        onClick={() => {
                                                            const nextWorld = applyGenreTemplateToWorld(world, tmpl.id, applyGenreFieldDefaults);
                                                            setWorld(nextWorld);
                                                        }}
                                                        className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer select-none text-left ${
                                                            isSelected
                                                                ? isLight
                                                                    ? 'bg-[#f7efe0] border-[#70121e] shadow-md ring-1 ring-[#70121e]/30'
                                                                    : 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                                                                : isLight
                                                                ? 'bg-white/40 border-[#c8a96e]/20 hover:bg-white/70 hover:border-[#c8a96e]/40'
                                                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15'
                                                        }`}
                                                    >
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center justify-between">
                                                                <div className={`p-1.5 rounded-lg ${
                                                                    isSelected
                                                                        ? isLight ? 'bg-[#70121e] text-[#fff8e7]' : 'bg-amber-400 text-black'
                                                                        : isLight ? 'bg-black/5 text-[#70121e]' : 'bg-white/10 text-slate-300'
                                                                }`}>
                                                                    <IconComponent size={14} />
                                                                </div>
                                                                {isSelected && (
                                                                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                                                        isLight ? 'bg-[#70121e]/15 text-[#70121e]' : 'bg-amber-400/20 text-amber-300'
                                                                    }`}>
                                                                        Active
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="font-bold text-xs leading-snug">{tmpl.label}</div>
                                                            <div className="text-[10px] font-serif italic opacity-75">{tmpl.tagline}</div>
                                                            <p className="text-[10px] opacity-60 leading-relaxed line-clamp-3">
                                                                {tmpl.description}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className={`mt-3 w-full py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all border ${
                                                                isSelected
                                                                    ? isLight
                                                                        ? 'bg-[#70121e] text-[#fff8e7] border-[#70121e]'
                                                                        : 'bg-amber-400 text-black border-amber-400 font-bold'
                                                                    : isLight
                                                                    ? 'bg-black/5 text-[#2b1810]/70 border-black/10 hover:bg-black/10'
                                                                    : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                                                            }`}
                                                        >
                                                            {isSelected ? '✓ Current Genre' : 'Select'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Optional field auto-hide sync checkbox */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <CodexCheckbox
                                                checked={applyGenreFieldDefaults}
                                                onChange={setApplyGenreFieldDefaults}
                                                size="sm"
                                            />
                                            <span className="text-[11px] font-serif opacity-80 cursor-pointer" onClick={() => setApplyGenreFieldDefaults(!applyGenreFieldDefaults)}>
                                                Auto-apply recommended field visibility defaults when switching genre (e.g. hides cybernetics in fantasy, hides magic in sci-fi).
                                            </span>
                                        </div>
                                    </div>
                                );
                            })()}
                            {/* Custom Suggestion Banks (Approach 3) */}
                            <div className={`p-5 rounded-2xl border space-y-4 ${
                                isLight ? 'bg-[#ede2cb]/60 border-[#c8a96e]/30' : 'bg-black/20 border-white/5'
                            }`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Tag size={14} className={isLight ? 'text-[#70121e]' : 'text-amber-400'} />
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-[#70121e]' : 'text-amber-300'}`}>
                                                Custom Suggestion Banks
                                            </span>
                                            <span className="text-[9px] opacity-40 font-mono">Approach 3</span>
                                        </div>
                                        <p className="text-[11px] opacity-60 font-serif italic mt-1">
                                            Create reusable traits, features, and keyword chips per entity category. Injected automatically into entity trait editors across your codex.
                                        </p>
                                    </div>
                                    {world.customSuggestions?.[selectedSuggestionType]?.length ? (
                                        <button
                                            type="button"
                                            onClick={() => handleClearSuggestions(selectedSuggestionType)}
                                            className="text-[9px] font-mono text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider cursor-pointer"
                                        >
                                            Clear ({world.customSuggestions[selectedSuggestionType]?.length})
                                        </button>
                                    ) : null}
                                </div>

                                {/* Category Pills */}
                                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 no-scrollbar">
                                    {ALL_ENTITY_TYPES.map(type => {
                                        const count = world.customSuggestions?.[type]?.length || 0;
                                        const isSelected = selectedSuggestionType === type;
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setSelectedSuggestionType(type)}
                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                                                    isSelected
                                                        ? isLight
                                                            ? 'bg-[#70121e] text-[#fff8e7] font-bold shadow-sm'
                                                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                                                        : isLight
                                                        ? 'bg-black/5 hover:bg-black/10 text-[#2b1810]/70'
                                                        : 'bg-white/5 hover:bg-white/10 text-slate-400'
                                                }`}
                                            >
                                                <span>{TYPE_LABELS[type] || type}</span>
                                                {count > 0 && (
                                                    <span className={`px-1 rounded-full text-[8px] font-bold ${
                                                        isSelected
                                                            ? isLight ? 'bg-black/20 text-white' : 'bg-amber-400/30 text-amber-200'
                                                            : isLight ? 'bg-black/10 text-black/60' : 'bg-white/10 text-slate-300'
                                                    }`}>
                                                        {count}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Add New Suggestion Input */}
                                <form onSubmit={handleAddSuggestion} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newSuggestionInput}
                                        onChange={e => setNewSuggestionInput(e.target.value)}
                                        placeholder={`Add new suggestion for ${TYPE_LABELS[selectedSuggestionType]} (e.g. Cybernetic, Arcane Crest)...`}
                                        className={`flex-1 px-3 py-1.5 text-xs rounded-xl border outline-none font-serif ${
                                            isLight
                                                ? 'bg-[#fffdf9] border-[#c8a96e]/50 text-[#2b1810] focus:border-[#70121e]'
                                                : 'bg-slate-900/60 border-slate-700 text-slate-200 focus:border-amber-400'
                                        }`}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newSuggestionInput.trim()}
                                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                                            isLight
                                                ? 'bg-[#70121e] text-[#fff8e7] border-[#c8a96e] hover:bg-[#851624]'
                                                : 'bg-amber-500/20 text-amber-300 border-amber-500/60 hover:bg-amber-500/30'
                                        }`}
                                    >
                                        <Plus size={12} /> Add
                                    </button>
                                </form>

                                {/* Suggestions Chips Container */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-[9px] font-mono opacity-50 uppercase">
                                        <span>Active Suggestions for {TYPE_LABELS[selectedSuggestionType]}</span>
                                        <span>{(world.customSuggestions?.[selectedSuggestionType] || []).length} registered</span>
                                    </div>
                                    <div className={`p-3 rounded-xl border min-h-[56px] flex flex-wrap gap-1.5 items-center ${
                                        isLight ? 'bg-[#fffdf9]/70 border-[#c8a96e]/20' : 'bg-black/30 border-white/5'
                                    }`}>
                                        {(world.customSuggestions?.[selectedSuggestionType] || []).length === 0 ? (
                                            <span className="text-[10px] opacity-40 font-serif italic">
                                                No custom suggestions yet for this category. Type above to add one!
                                            </span>
                                        ) : (
                                            (world.customSuggestions?.[selectedSuggestionType] || []).map((sugg, idx) => (
                                                <span
                                                    key={`${sugg}-${idx}`}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-serif border shadow-xs animate-in fade-in duration-150 ${
                                                        isLight
                                                            ? 'bg-[#fbf7ed] border-[#c8a96e]/50 text-[#2b1810]'
                                                            : 'bg-slate-800/80 border-slate-700 text-slate-200'
                                                    }`}
                                                >
                                                    <span>{sugg}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSuggestion(selectedSuggestionType, idx)}
                                                        className="hover:text-red-400 opacity-60 hover:opacity-100 p-0.5 rounded cursor-pointer transition-opacity"
                                                        title="Remove suggestion"
                                                    >
                                                        <X size={11} />
                                                    </button>
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Universe Backup & Restore */}
                        <div className="pt-2 space-y-4">
                            {/* Desktop Storage & Portable Vault (Choice 1 Architecture) */}
                            {isDesktopApp() && (
                                <div className={`p-5 rounded-2xl border space-y-4 ${isLight ? 'bg-[#ede2cb]/60 border-[#c8a96e]/30' : 'bg-black/20 border-white/5'}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-wider opacity-60 block">
                                                    {vaultInfo?.is_portable ? 'Portable Vault Storage (Active)' : 'Application Storage Vault'}
                                                </span>
                                                {vaultInfo?.is_portable && (
                                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                        Portable Drive Mode
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] opacity-40 font-serif italic mt-0.5">
                                                {vaultInfo?.is_portable
                                                    ? 'Data sits in the ./data/ directory beside the executable. All campaign codex entries and media assets travel portably with your app folder.'
                                                    : 'Standard installation storage in platform AppData.'}
                                            </p>
                                        </div>
                                    </div>

                                    {vaultInfo && (
                                        <div className="text-[11px] font-mono p-2.5 rounded-xl bg-black/10 dark:bg-black/40 border border-current/10 truncate select-all" title={vaultInfo.vault_dir}>
                                            📁 {vaultInfo.vault_dir}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2.5 pt-1">
                                        <button
                                            type="button"
                                            onClick={handleOpenVault}
                                            className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                                isLight
                                                    ? 'border-[#c8a96e]/50 hover:border-[#70121e] hover:bg-[#70121e]/10 text-[#2b1810]'
                                                    : 'border-slate-700 hover:border-yellow-400'
                                            }`}
                                        >
                                            <FolderOpen size={13} /> Open Vault Folder
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleForceVaultSave}
                                            disabled={isSavingToVault}
                                            className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                                isLight
                                                    ? 'border-[#c8a96e]/50 hover:border-[#70121e] hover:bg-[#70121e]/10 text-[#2b1810]'
                                                    : 'border-slate-700 hover:border-yellow-400'
                                            }`}
                                        >
                                            <Check size={13} /> {isSavingToVault ? 'Saving…' : 'Sync Codex to Disk'}
                                        </button>

                                        {vaultNotice && (
                                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-serif italic self-center">
                                                {vaultNotice}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Classic JSON Backups */}
                            <div className={`p-5 rounded-2xl border space-y-4 ${isLight ? 'bg-[#ede2cb]/60 border-[#c8a96e]/30' : 'bg-black/20 border-white/5'}`}>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider opacity-60 block">Lore Archive (JSON)</span>
                                    <p className="text-[11px] opacity-40 font-serif italic mt-0.5">Export realm lore as plain JSON — no media assets included.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <button
                                        onClick={() => exportWorld()}
                                        className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${isLight ? 'border-[#c8a96e]/50 hover:border-[#70121e] hover:bg-[#70121e]/10 text-[#2b1810]' : 'border-slate-700 hover:border-yellow-400'}`}
                                    >
                                        <Download size={13} /> Active Realm (.json)
                                    </button>

                                    <button
                                        onClick={() => exportUniverse()}
                                        className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${isLight ? 'border-[#c8a96e]/50 hover:border-[#70121e] hover:bg-[#70121e]/10 text-[#2b1810] bg-[#70121e]/5' : 'border-slate-700 hover:border-yellow-400 bg-yellow-400/5'}`}
                                    >
                                        <Layers size={13} /> Full Multiverse (.json)
                                    </button>

                                    <button
                                        onClick={handleImportJsonClick}
                                        className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2 cursor-pointer text-center ${isLight ? 'border-[#c8a96e]/50 hover:border-[#70121e] hover:bg-[#70121e]/10 text-[#2b1810]' : 'border-slate-700 hover:border-yellow-400'}`}
                                    >
                                        <Upload size={13} /> Import JSON
                                        <input ref={jsonImportRef} type="file" className="hidden" accept=".json" onChange={handleImportFile} />
                                    </button>
                                </div>
                            </div>

                            {/* Nexus Archive - Full Asset Bundles */}
                            <div className={`p-5 rounded-2xl border space-y-4 ${
                                isLight
                                    ? 'bg-[#70121e]/5 border-[#c8a96e]/40'
                                    : 'bg-purple-900/10 border-purple-500/20'
                            }`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <FileArchive size={14} className={isLight ? 'text-[#70121e]' : 'text-purple-400'} />
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-[#70121e]' : 'text-purple-300'}`}>
                                                Nexus Archive (.nexus) — Full Asset Bundle
                                            </span>
                                        </div>
                                        <p className="text-[11px] opacity-60 font-serif italic mt-1">Bundles lore + every HD image, map, and media file into one portable container. No compression — 100% fidelity.</p>
                                    </div>
                                </div>

                                {nexusNotice && (
                                    <div className={`p-3 rounded-xl border text-[10px] flex items-center justify-between gap-2 ${
                                        nexusNotice.isError
                                            ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-300'
                                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                                    }`}>
                                        <span>{nexusNotice.text}</span>
                                        <button onClick={() => setNexusNotice(null)} className="opacity-60 hover:opacity-100 font-bold">✕</button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                    <button
                                        onClick={() => handleExportNexusArchive('world')}
                                        disabled={nexusExporting}
                                        className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2 disabled:opacity-40 ${
                                            isLight
                                                ? 'border-[#c8a96e]/50 hover:border-[#70121e] hover:bg-[#70121e]/10 text-[#2b1810]'
                                                : 'border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10'
                                        }`}
                                    >
                                        <FileArchive size={13} />{nexusExporting ? 'Packing…' : 'Active Realm (.nexus)'}
                                    </button>

                                    <button
                                        onClick={() => handleExportNexusArchive('universe')}
                                        disabled={nexusExporting}
                                        className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2 disabled:opacity-40 ${
                                            isLight
                                                ? 'border-[#c8a96e]/50 hover:border-[#70121e] hover:bg-[#70121e]/10 text-[#2b1810]'
                                                : 'border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10'
                                        }`}
                                    >
                                        <Layers size={13} />{nexusExporting ? 'Packing…' : 'Full Multiverse (.nexus)'}
                                    </button>

                                    <button
                                        onClick={handleImportNexusClick}
                                        className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2 cursor-pointer text-center ${
                                            isLight
                                                ? 'border-[#c8a96e]/50 hover:border-[#70121e] hover:bg-[#70121e]/10 text-[#2b1810]'
                                                : 'border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10'
                                        }`}
                                    >
                                        <Upload size={13} /> Restore .nexus
                                        <input
                                            ref={nexusImportRef}
                                            type="file"
                                            className="hidden"
                                            accept=".nexus"
                                            onChange={handleImportNexusFile}
                                        />
                                    </button>

                                    <button
                                        onClick={() => setIsBeamModalOpen(true)}
                                        className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2 ${
                                            isLight
                                                ? 'border-[#70121e]/30 bg-[#70121e]/10 hover:bg-[#70121e]/20 text-[#70121e]'
                                                : 'border-purple-500/40 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-purple-100'
                                        }`}
                                    >
                                        <Radio size={13} /> NexusBeam (P2P)
                                    </button>
                                </div>

                                <p className="text-[9px] opacity-40 font-mono">
                                    NexusBeam transfers archives directly device-to-device via WebRTC — no cloud, no size limits, works globally via STUN relay.
                                </p>
                            </div>

                            {/* Fantasia Archive Migration */}
                            <div className={`p-5 rounded-2xl border space-y-4 ${
                                isLight
                                    ? 'bg-[#c8a96e]/10 border-[#c8a96e]/40'
                                    : 'bg-amber-950/20 border-amber-500/25'
                            }`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={14} className={isLight ? 'text-[#8a5d1b]' : 'text-amber-400'} />
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-[#8a5d1b]' : 'text-amber-300'}`}>
                                                Fantasia Archive Migration (.zip / .txt / .json)
                                            </span>
                                        </div>
                                        <p className="text-[11px] opacity-60 font-serif italic mt-1">
                                            Migrate existing projects directly from Fantasia Archive v1. Translates all 20 blueprints, group affiliations, relational context notes, and automatically establishes two-way bidirectional sync.
                                        </p>
                                    </div>
                                </div>

                                {faNotice && (
                                    <div className={`p-3 rounded-xl border text-[10px] flex items-center justify-between gap-2 ${
                                        faNotice.isError
                                            ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-300'
                                            : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                                    }`}>
                                        <span>{faNotice.text}</span>
                                        <button onClick={() => setFaNotice(null)} className="opacity-60 hover:opacity-100 font-bold">✕</button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <button
                                        onClick={() => handleFaClick('new')}
                                        disabled={faMigrating}
                                        className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2 disabled:opacity-40 ${
                                            isLight
                                                ? 'border-[#c8a96e] bg-[#c8a96e]/20 hover:bg-[#c8a96e]/35 text-[#593b0b]'
                                                : 'border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-100'
                                        }`}
                                    >
                                        <Upload size={13} /> {faMigrating ? 'Migrating Codex…' : 'Import as New Realm'}
                                    </button>

                                    <button
                                        onClick={() => handleFaClick('merge')}
                                        disabled={faMigrating}
                                        className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2 disabled:opacity-40 ${
                                            isLight
                                                ? 'border-[#c8a96e]/50 hover:border-[#8a5d1b] hover:bg-[#c8a96e]/15 text-[#593b0b]'
                                                : 'border-amber-500/20 hover:border-amber-400 hover:bg-amber-500/10 text-amber-200'
                                        }`}
                                    >
                                        <Layers size={13} /> {faMigrating ? 'Migrating…' : `Merge into "${world.name}"`}
                                    </button>

                                    <input
                                        ref={faImportRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        accept=".zip,.txt,.json"
                                        onChange={handleImportFaChange}
                                    />
                                </div>

                                <p className="text-[9px] opacity-40 font-mono">
                                    Accepts a .zip export of a project folder, multiple .txt/.json database dumps selected together, or a single raw export file.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Lore Sharing — Batch Markdown / HTML Export */}
                    <section className={`pt-8 border-t space-y-5 ${isLight ? 'border-[#c8a96e]/30' : 'border-slate-800/40'}`}>
                        <div className="flex items-center gap-3">
                            <FileText size={14} className={isLight ? 'text-[#1e5436]' : 'text-emerald-300'} />
                            <h3 className={`text-xs font-black uppercase tracking-widest ${isLight ? 'text-[#1e5436]' : 'text-emerald-300'}`}>
                                Lore Sharing — Markdown &amp; HTML Export
                            </h3>
                        </div>
                        <p className="text-[11px] opacity-60 font-serif italic">
                            Export codex entries as portable Markdown (Obsidian / Notion compatible) or standalone styled HTML. Relational context notes are included.
                        </p>

                        <div className={`p-5 rounded-2xl border space-y-4 ${
                            isLight
                                ? 'bg-[#ede2cb]/60 border-[#c8a96e]/40'
                                : 'bg-emerald-900/10 border-emerald-500/20'
                        }`}>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative">
                                    <select
                                        value={batchExportType}
                                        onChange={e => setBatchExportType(e.target.value as EntityType | 'all')}
                                        className={`appearance-none pl-3 pr-8 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer transition-colors ${
                                            isLight
                                                ? 'bg-white border border-[#c8a96e] text-[#2b1810] hover:border-[#70121e]'
                                                : 'bg-black/30 border border-emerald-500/25 text-emerald-100 hover:border-emerald-400'
                                        }`}
                                    >
                                        <option value="all">All Types</option>
                                        {(Object.entries(TYPE_LABELS) as [EntityType, string][]).map(([type, label]) => (
                                            <option key={type} value={type}>{label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none ${
                                        isLight ? 'text-[#2b1810]' : 'text-emerald-300'
                                    }`} />
                                </div>
                                <button
                                    onClick={() => handleBatchExport('markdown')}
                                    disabled={batchExporting}
                                    className={`py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 disabled:opacity-40 ${
                                        isLight
                                            ? 'border-[#1e5436]/40 bg-[#1e5436]/10 hover:bg-[#1e5436]/20 text-[#1e5436]'
                                            : 'border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10 text-emerald-200'
                                    }`}
                                >
                                    <FileText size={12} /> {batchExporting ? 'Exporting…' : 'Export as Markdown'}
                                </button>
                                <button
                                    onClick={() => handleBatchExport('html')}
                                    disabled={batchExporting}
                                    className={`py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 disabled:opacity-40 ${
                                        isLight
                                            ? 'border-[#0369a1]/40 bg-[#0369a1]/10 hover:bg-[#0369a1]/20 text-[#0369a1]'
                                            : 'border-sky-500/30 hover:border-sky-400 hover:bg-sky-500/10 text-sky-200'
                                    }`}
                                >
                                    <FileCode2 size={12} /> {batchExporting ? 'Exporting…' : 'Export as HTML'}
                                </button>
                            </div>
                            {batchNotice && (
                                <div className={`text-[10px] px-3 py-2 rounded-lg border ${
                                    batchNotice.isError
                                        ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-300'
                                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                                }`}>
                                    {batchNotice.text}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Data Integrity */}
                    <section className={`pt-8 border-t space-y-6 ${isLight ? 'border-[#c8a96e]/30' : 'border-slate-800/40'}`}>
                        <div className="flex items-center gap-3">
                            <Heart size={14} className={isLight ? 'text-[#1e5436]' : 'text-emerald-400'} />
                            <h3 className={`text-xs font-black uppercase tracking-widest ${isLight ? 'text-[#1e5436]' : 'text-emerald-400'}`}>
                                Data Integrity
                            </h3>
                        </div>
                        <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
                            isLight
                                ? 'bg-[#ede2cb]/60 border-[#c8a96e]/40'
                                : 'bg-emerald-500/5 border-emerald-900/20'
                        }`}>
                            <div>
                                <p className={`text-xs font-bold ${isLight ? 'text-[#1e5436]' : 'text-emerald-200'}`}>
                                    Heal Bidirectional Relations
                                </p>
                                <p className={`text-[10px] max-w-md ${isLight ? 'text-[#2b1810]/70' : 'text-emerald-200/50'}`}>
                                    Scans all entities and repairs any one-way links — e.g. if a Character lists a Condition as a boon but the Condition page doesn't show the Character back, this fixes it instantly.
                                </p>
                            </div>
                            <button
                                onClick={handleHeal}
                                className={`px-6 py-2 text-[10px] font-black rounded-lg transition-all border whitespace-nowrap flex items-center gap-2 ${
                                    healDone
                                        ? 'bg-emerald-600 text-white border-emerald-400'
                                        : isLight
                                        ? 'bg-[#1e5436]/15 hover:bg-[#1e5436] text-[#1e5436] hover:text-white border-[#1e5436]/40'
                                        : 'bg-emerald-900/40 hover:bg-emerald-700 text-emerald-200 border-emerald-500/30'
                                }`}
                            >
                                <Heart size={12} />
                                {healDone ? '✓ Relations Healed!' : 'HEAL RELATIONS'}
                            </button>
                        </div>

                        {/* Asset & Media Vault Manager */}
                        <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
                            isLight
                                ? 'bg-[#ede2cb]/60 border-[#c8a96e]/40'
                                : 'bg-purple-500/5 border-purple-900/20'
                        }`}>
                            <div>
                                <p className={`text-xs font-bold ${isLight ? 'text-[#581c87]' : 'text-purple-200'}`}>
                                    Asset & Media Vault Manager
                                </p>
                                <p className={`text-[10px] max-w-md ${isLight ? 'text-[#2b1810]/70' : 'text-purple-200/50'}`}>
                                    Browse, inspect, and manage all binary images, cartography maps, and media assets stored in Content-Addressable Storage (CAS). Inspect which entities reference each asset and clean up orphan files.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsVaultOpen(true)}
                                    className={`px-5 py-2 text-[10px] font-black rounded-lg transition-all border whitespace-nowrap flex items-center gap-2 shadow-md ${
                                        isLight
                                            ? 'bg-[#70121e] hover:bg-[#881337] text-white border-[#c8a96e]'
                                            : 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400'
                                    }`}
                                >
                                    <Layers size={12} />
                                    OPEN ASSET VAULT
                                </button>
                                <button
                                    onClick={handlePruneMedia}
                                    disabled={isPruning}
                                    className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all border whitespace-nowrap flex items-center gap-2 ${
                                        pruneNotice
                                            ? 'bg-purple-600 text-white border-purple-400'
                                            : isLight
                                            ? 'bg-[#581c87]/15 hover:bg-[#581c87] text-[#581c87] hover:text-white border-[#581c87]/40 disabled:opacity-40'
                                            : 'bg-purple-900/40 hover:bg-purple-700 text-purple-200 border-purple-500/30 disabled:opacity-40'
                                    }`}
                                >
                                    <Sparkles size={12} />
                                    {pruneNotice || (isPruning ? 'Auditing…' : 'PRUNE ORPHANS')}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Developer & Agent Diagnostics */}
                    <section className={`pt-8 border-t space-y-6 ${isLight ? 'border-[#c8a96e]/30' : 'border-slate-800/40'}`}>
                        <div className="flex items-center gap-3">
                            <Zap size={14} className={isLight ? 'text-[#854d0e]' : 'text-yellow-400'} />
                            <h3 className={`text-xs font-black uppercase tracking-widest ${isLight ? 'text-[#854d0e]' : 'text-yellow-400'}`}>
                                Developer & Agent Diagnostics
                            </h3>
                        </div>
                        <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
                            isLight
                                ? 'bg-[#ede2cb]/60 border-[#c8a96e]/40'
                                : 'bg-yellow-500/5 border-yellow-900/20'
                        }`}>
                            <div>
                                <p className={`text-xs font-bold ${isLight ? 'text-[#854d0e]' : 'text-yellow-200'}`}>
                                    Export Live Agent Dev Snapshot
                                </p>
                                <p className={`text-[10px] max-w-md ${isLight ? 'text-[#2b1810]/70' : 'text-yellow-200/50'}`}>
                                    Downloads or updates a local developer snapshot for AI agent tools and the State Inspector MCP server to inspect active campaign status, entity breakdown, and relations.
                                </p>
                            </div>
                            <button
                                onClick={async () => {
                                    const stateData = {
                                        timestamp: new Date().toISOString(),
                                        world,
                                        activeWorldId,
                                        theme,
                                    };
                                    const blob = new Blob([JSON.stringify(stateData, null, 2)], { type: 'application/json' });
                                    await downloadFileToDevice(blob, '.dev-state.json', 'application/json');
                                }}
                                className={`px-6 py-2 text-[10px] font-black rounded-lg transition-all border whitespace-nowrap flex items-center gap-2 ${
                                    isLight
                                        ? 'bg-[#854d0e]/15 hover:bg-[#854d0e] text-[#854d0e] hover:text-white border-[#854d0e]/40'
                                        : 'bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-200 border-yellow-400/40'
                                }`}
                            >
                                <Download size={12} />
                                EXPORT DEV SNAPSHOT (.dev-state.json)
                            </button>
                        </div>
                    </section>

                    {/* Oblivion Protocol */}
                    <section className={`pt-8 border-t space-y-6 ${isLight ? 'border-[#c8a96e]/30' : 'border-slate-800/40'}`}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-500 flex items-center gap-2">
                                <Skull size={14} /> Oblivion Protocol (Danger Zone)
                            </h3>
                        </div>
                        <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
                            isLight
                                ? 'bg-[#ede2cb]/60 border-rose-500/30'
                                : 'bg-rose-500/5 border-rose-900/20'
                        }`}>
                            <div>
                                <p className={`text-xs font-bold ${isLight ? 'text-rose-800' : 'text-rose-200'}`}>
                                    Purge Active Realm Cache
                                </p>
                                <p className={`text-[10px] ${isLight ? 'text-[#2b1810]/70' : 'text-rose-200/50'}`}>
                                    Permanently reset the entities and map markers of the active realm ("{world.name}").
                                </p>
                            </div>
                            <button
                                onClick={() => setIsWipeModalOpen(true)}
                                className={`px-6 py-2 text-[10px] font-black rounded-lg transition-all border whitespace-nowrap ${
                                    isLight
                                        ? 'bg-rose-700 hover:bg-rose-800 text-white border-rose-600'
                                        : 'bg-rose-900/40 hover:bg-rose-600 text-rose-200 border-rose-500/30'
                                }`}
                            >
                                WIPE ACTIVE REALM
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {/* Found New Realm Modal */}
            <NewRealmModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onCreate={(name, desc, mapImage, phase) => {
                    createWorld(name, desc, mapImage, phase);
                }}
                theme={theme}
            />

            {/* NexusBeam P2P Transfer Modal */}
            <NexusBeamModal
                isOpen={isBeamModalOpen}
                onClose={() => setIsBeamModalOpen(false)}
                theme={theme}
            />

            {/* Dissolve Realm Confirmation Modal */}
            <DeleteRealmModal
                realm={realmToDelete}
                canDelete={worlds.length > 1}
                onConfirm={() => {
                    if (realmToDelete) {
                        deleteWorld(realmToDelete.id || activeWorldId);
                        setRealmToDelete(null);
                    }
                }}
                onCancel={() => setRealmToDelete(null)}
                theme={theme}
            />

            {/* Oblivion Protocol Wipe Active Realm Modal */}
            <WipeRealmModal
                isOpen={isWipeModalOpen}
                realm={world}
                onConfirm={() => {
                    setWorld({
                        ...world,
                        entities: [],
                        trash: [],
                        mapConnections: []
                    });
                    setOpenTabIds([]);
                    setDrafts({});
                    setEditingTabIds([]);
                    setActiveTabId('dashboard');
                    setIsWipeModalOpen(false);
                    setNexusNotice({ text: `✓ Oblivion Protocol executed: Active realm "${world.name}" cache purged. All entities reset.` });
                }}
                onCancel={() => setIsWipeModalOpen(false)}
                theme={theme}
            />

            <AssetVaultModal
                isOpen={isVaultOpen}
                onClose={() => setIsVaultOpen(false)}
                worlds={worlds}
                onNavigate={(id) => handleOpenEntity(id)}
            />

            <footer className="text-center opacity-20 hover:opacity-100 transition-opacity duration-1000">
                <p className="text-[11px] font-black tracking-[0.5em] uppercase">Built for the Chroniclers of the Multiverse</p>
                <p className="text-[9px] mt-1 font-mono">v1.3.0-multiverse // Nexus Chronicle Engine</p>
            </footer>
        </div>
    );
};
