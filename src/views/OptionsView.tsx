import React, { useMemo, useState, useRef } from 'react';
import {
    Palette, Skull, Globe, Layers, Plus, Copy,
    Download, Upload, Trash2, Edit2, Check, Sparkles, AlertTriangle, ArrowRight, BookOpen,
    Radio, FileArchive, Zap, Heart, FileText, FileCode2, ChevronDown
} from 'lucide-react';
import { WorldData, EntityType, WorldPhase } from '../types';
import { TYPE_LABELS } from '../constants';
import { FormInput } from '../components/ui';
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
        handleHealRelations
    } = useWorldStore();

    const { t, layoutMode, themeId } = useTheme();
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
        <div className="p-16 max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-40">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className={`text-6xl font-serif font-black uppercase tracking-tighter ${accent}`}>System Settings</h2>
                    <p className="opacity-50 text-sm mt-2 italic font-serif">Configure parameters, manage multi-campaign realms, and curate backups.</p>
                </div>

                <button
                    onClick={() => setIsNewModalOpen(true)}
                    className={`px-5 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                        (themeId === 'royal-codex')
                            ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#881337] border border-[#c8a96e] shadow-md'
                            : (layoutMode === 'wiki')
                            ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]'
                            : 'bg-[#fef08a] text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20'
                    }`}
                >
                    <Plus size={16} /> Found New Realm
                </button>
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
                                                    className="px-2 py-1 rounded bg-black/40 border border-white/20 text-xs font-bold w-full outline-none"
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
                                                className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1 opacity-70 hover:opacity-100"
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
                                            className="w-full px-2 py-1.5 rounded bg-black/40 border border-white/20 text-xs outline-none resize-none"
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
                                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
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
                                <div key={type} className="flex flex-col p-2 bg-black/20 rounded border border-white/5">
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
                                    onClick={() => {                                        setTheme('sovereign');
                                    }}
                                    className={`p-4 rounded-xl border text-left transition-all ${
                                        theme === 'sovereign'
                                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/60 shadow-lg'
                                            : 'bg-black/20 text-slate-400 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="text-xs font-bold flex items-center gap-2">🌙 Sovereign</div>
                                    <div className="text-[9px] opacity-60 mt-1">Dark Obsidian & Warm Gold</div>
                                </button>
                                <button
                                    onClick={() => {                                        setTheme('wiki');
                                    }}
                                    className={`p-4 rounded-xl border text-left transition-all ${
                                        theme === 'wiki'
                                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-lg'
                                            : 'bg-black/20 text-slate-400 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="text-xs font-bold flex items-center gap-2">📜 Wiki Mode</div>
                                    <div className="text-[9px] opacity-60 mt-1">Classic Parchment & Red</div>
                                </button>
                                <button
                                    onClick={() => {                                        setTheme('royal-codex');
                                    }}
                                    className={`p-4 rounded-xl border text-left transition-all ${
                                        theme === 'royal-codex'
                                            ? 'bg-[#70121e]/25 text-[#fff8e7] border-[#c8a96e] shadow-lg'
                                            : 'bg-black/20 text-slate-400 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="text-xs font-bold flex items-center gap-2">👑 Royal Codex</div>
                                    <div className="text-[9px] opacity-60 mt-1">Illuminated Parchment & Gold</div>
                                </button>
                                <button
                                    onClick={() => {                                        setTheme('grand-voyager');
                                    }}
                                    className={`p-4 rounded-xl border text-left transition-all ${
                                        theme === 'grand-voyager'
                                            ? 'bg-[#0d9488]/20 text-[#2dd4bf] border-[#2dd4bf]/70 shadow-lg shadow-teal-950/40'
                                            : 'bg-black/20 text-slate-400 border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <div className="text-xs font-bold flex items-center gap-2">🧭 Grand Voyager</div>
                                    <div className="text-[9px] opacity-60 mt-1">Tropical Seas & Teak Timber</div>
                                </button>
                            </div>
                        </div>

                        {/* Universe Backup & Restore */}
                        <div className="pt-2 space-y-4">
                            {/* Classic JSON Backups */}
                            <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-4">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider opacity-60 block">Lore Archive (JSON)</span>
                                    <p className="text-[11px] opacity-40 font-serif italic mt-0.5">Export realm lore as plain JSON — no media assets included.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <button
                                        onClick={() => exportWorld()}
                                        className="py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-700 hover:border-yellow-400 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download size={13} /> Active Realm (.json)
                                    </button>

                                    <button
                                        onClick={() => exportUniverse()}
                                        className="py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-700 hover:border-yellow-400 transition-all flex items-center justify-center gap-2 bg-yellow-400/5"
                                    >
                                        <Layers size={13} /> Full Multiverse (.json)
                                    </button>

                                    <button
                                        onClick={handleImportJsonClick}
                                        className="py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-700 hover:border-yellow-400 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                                    >
                                        <Upload size={13} /> Import JSON
                                        <input ref={jsonImportRef} type="file" className="hidden" accept=".json" onChange={handleImportFile} />
                                    </button>
                                </div>
                            </div>

                            {/* Nexus Archive - Full Asset Bundles */}
                            <div className="p-5 rounded-2xl bg-purple-900/10 border border-purple-500/20 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <FileArchive size={14} className="text-purple-400" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">Nexus Archive (.nexus) — Full Asset Bundle</span>
                                        </div>
                                        <p className="text-[11px] opacity-50 font-serif italic mt-1">Bundles lore + every HD image, map, and media file into one portable container. No compression — 100% fidelity.</p>
                                    </div>
                                </div>

                                {nexusNotice && (
                                    <div className={`p-3 rounded-xl border text-[10px] flex items-center justify-between gap-2 ${
                                        nexusNotice.isError
                                            ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    }`}>
                                        <span>{nexusNotice.text}</span>
                                        <button onClick={() => setNexusNotice(null)} className="opacity-60 hover:opacity-100 font-bold">✕</button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                    <button
                                        onClick={() => handleExportNexusArchive('world')}
                                        disabled={nexusExporting}
                                        className="py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                                    >
                                        <FileArchive size={13} />{nexusExporting ? 'Packing…' : 'Active Realm (.nexus)'}
                                    </button>

                                    <button
                                        onClick={() => handleExportNexusArchive('universe')}
                                        disabled={nexusExporting}
                                        className="py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                                    >
                                        <Layers size={13} />{nexusExporting ? 'Packing…' : 'Full Multiverse (.nexus)'}
                                    </button>

                                    <button
                                        onClick={handleImportNexusClick}
                                        className="py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
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
                                        className="py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border border-purple-500/40 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-purple-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Radio size={13} /> NexusBeam (P2P)
                                    </button>
                                </div>

                                <p className="text-[9px] opacity-30 font-mono">
                                    NexusBeam transfers archives directly device-to-device via WebRTC — no cloud, no size limits, works globally via STUN relay.
                                </p>
                            </div>

                            {/* Fantasia Archive Migration */}
                            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/25 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={14} className="text-amber-400" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">Fantasia Archive Migration (.zip / .txt / .json)</span>
                                        </div>
                                        <p className="text-[11px] opacity-50 font-serif italic mt-1">
                                            Migrate existing projects directly from Fantasia Archive v1. Translates all 20 blueprints, group affiliations, relational context notes, and automatically establishes two-way bidirectional sync.
                                        </p>
                                    </div>
                                </div>

                                {faNotice && (
                                    <div className={`p-3 rounded-xl border text-[10px] flex items-center justify-between gap-2 ${
                                        faNotice.isError
                                            ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                    }`}>
                                        <span>{faNotice.text}</span>
                                        <button onClick={() => setFaNotice(null)} className="opacity-60 hover:opacity-100 font-bold">✕</button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <button
                                        onClick={() => handleFaClick('new')}
                                        disabled={faMigrating}
                                        className="py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-100 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                                    >
                                        <Upload size={13} /> {faMigrating ? 'Migrating Codex…' : 'Import as New Realm'}
                                    </button>

                                    <button
                                        onClick={() => handleFaClick('merge')}
                                        disabled={faMigrating}
                                        className="py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border border-amber-500/20 hover:border-amber-400 hover:bg-amber-500/10 text-amber-200 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
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

                                <p className="text-[9px] opacity-35 font-mono">
                                    Accepts a .zip export of a project folder, multiple .txt/.json database dumps selected together, or a single raw export file.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Lore Sharing — Batch Markdown / HTML Export */}
                    <section className="pt-8 border-t border-slate-800/40 space-y-5">
                        <div className="flex items-center gap-3">
                            <FileText size={14} className="text-emerald-300" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-300">Lore Sharing — Markdown &amp; HTML Export</h3>
                        </div>
                        <p className="text-[11px] opacity-40 font-serif italic">
                            Export codex entries as portable Markdown (Obsidian / Notion compatible) or standalone styled HTML. Relational context notes are included.
                        </p>

                        <div className="p-5 rounded-2xl bg-emerald-900/10 border border-emerald-500/20 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative">
                                    <select
                                        value={batchExportType}
                                        onChange={e => setBatchExportType(e.target.value as EntityType | 'all')}
                                        className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-black/30 border border-emerald-500/25 text-xs font-bold text-emerald-100 outline-none cursor-pointer hover:border-emerald-400 transition-colors"
                                    >
                                        <option value="all">All Types</option>
                                        {(Object.entries(TYPE_LABELS) as [EntityType, string][]).map(([type, label]) => (
                                            <option key={type} value={type}>{label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none text-emerald-300" />
                                </div>
                                <button
                                    onClick={() => handleBatchExport('markdown')}
                                    disabled={batchExporting}
                                    className="py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10 text-emerald-200 transition-all flex items-center gap-1.5 disabled:opacity-40"
                                >
                                    <FileText size={12} /> {batchExporting ? 'Exporting…' : 'Export as Markdown'}
                                </button>
                                <button
                                    onClick={() => handleBatchExport('html')}
                                    disabled={batchExporting}
                                    className="py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider border border-sky-500/30 hover:border-sky-400 hover:bg-sky-500/10 text-sky-200 transition-all flex items-center gap-1.5 disabled:opacity-40"
                                >
                                    <FileCode2 size={12} /> {batchExporting ? 'Exporting…' : 'Export as HTML'}
                                </button>
                            </div>
                            {batchNotice && (
                                <div className={`text-[10px] px-3 py-2 rounded-lg border ${
                                    batchNotice.isError
                                        ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                }`}>
                                    {batchNotice.text}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Data Integrity */}
                    <section className="pt-8 border-t border-slate-800/40 space-y-6">
                        <div className="flex items-center gap-3">
                            <Heart size={14} className="text-emerald-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Data Integrity</h3>
                        </div>
                        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-900/20 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold text-emerald-200">Heal Bidirectional Relations</p>
                                <p className="text-[10px] text-emerald-200/50 max-w-md">
                                    Scans all entities and repairs any one-way links — e.g. if a Character lists a Condition as a boon but the Condition page doesn't show the Character back, this fixes it instantly.
                                </p>
                            </div>
                            <button
                                onClick={handleHeal}
                                className={`px-6 py-2 text-[10px] font-black rounded-lg transition-all border whitespace-nowrap flex items-center gap-2 ${
                                    healDone
                                        ? 'bg-emerald-600 text-white border-emerald-400'
                                        : 'bg-emerald-900/40 hover:bg-emerald-700 text-emerald-200 border-emerald-500/30'
                                }`}
                            >
                                <Heart size={12} />
                                {healDone ? '✓ Relations Healed!' : 'HEAL RELATIONS'}
                            </button>
                        </div>

                        {/* Prune Unused Media (CAS Garbage Collection) */}
                        <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-900/20 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold text-purple-200">Prune Unused Media (Vault Garbage Collection)</p>
                                <p className="text-[10px] text-purple-200/50 max-w-md">
                                    Audits the IndexedDB binary asset vault against all entities, maps, and lore notes. Safely purges orphaned images no longer referenced in any campaign.
                                </p>
                            </div>
                            <button
                                onClick={handlePruneMedia}
                                disabled={isPruning}
                                className={`px-6 py-2 text-[10px] font-black rounded-lg transition-all border whitespace-nowrap flex items-center gap-2 ${
                                    pruneNotice
                                        ? 'bg-purple-600 text-white border-purple-400'
                                        : 'bg-purple-900/40 hover:bg-purple-700 text-purple-200 border-purple-500/30 disabled:opacity-40'
                                }`}
                            >
                                <Sparkles size={12} />
                                {pruneNotice || (isPruning ? 'Auditing Vault…' : 'PRUNE UNUSED MEDIA')}
                            </button>
                        </div>
                    </section>

                    {/* Developer & Agent Diagnostics */}
                    <section className="pt-8 border-t border-slate-800/40 space-y-6">
                        <div className="flex items-center gap-3">
                            <Zap size={14} className="text-yellow-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-yellow-400">Developer & Agent Diagnostics</h3>
                        </div>
                        <div className="p-6 rounded-2xl bg-yellow-500/5 border border-yellow-900/20 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold text-yellow-200">Export Live Agent Dev Snapshot</p>
                                <p className="text-[10px] text-yellow-200/50 max-w-md">
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
                                className="px-6 py-2 text-[10px] font-black rounded-lg transition-all border whitespace-nowrap flex items-center gap-2 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-200 border-yellow-400/40"
                            >
                                <Download size={12} />
                                EXPORT DEV SNAPSHOT (.dev-state.json)
                            </button>
                        </div>
                    </section>

                    {/* Oblivion Protocol */}
                    <section className="pt-8 border-t border-slate-800/40 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                                <Skull size={14} /> Oblivion Protocol (Danger Zone)
                            </h3>
                        </div>
                        <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-900/20 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold text-rose-200">Purge Active Realm Cache</p>
                                <p className="text-[10px] text-rose-200/50">Permanently reset the entities and map markers of the active realm ("{world.name}").</p>
                            </div>
                            <button
                                onClick={() => setIsWipeModalOpen(true)}
                                className="px-6 py-2 bg-rose-900/40 hover:bg-rose-600 text-rose-200 text-[10px] font-black rounded-lg transition-all border border-rose-500/30 whitespace-nowrap"
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

            <footer className="text-center opacity-20 hover:opacity-100 transition-opacity duration-1000">
                <p className="text-[11px] font-black tracking-[0.5em] uppercase">Built for the Chroniclers of the Multiverse</p>
                <p className="text-[9px] mt-1 font-mono">v1.3.0-multiverse // Nexus Chronicle Engine</p>
            </footer>
        </div>
    );
};
