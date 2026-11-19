import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Image as ImageIcon, X, Trash2, Upload, Download, RefreshCw,
    Search, Filter, HardDrive, Check, AlertTriangle, Eye, Copy,
    FileText, Layers, ExternalLink, Sparkles
} from 'lucide-react';
import { WorldData, WorldEntity, ThemeMode } from '../../types';
import {
    getAllAssets,
    StoredAsset,
    saveAsset,
    deleteAsset,
    pruneOrphanAssets,
    extractActiveAssetUris,
    resolveAssetUrl,
    getStorageEstimate
} from '../../utils/assetStore';
import { downloadFileToDevice } from '../../utils/nexusArchive';
import { useTheme } from '../../theme';
import { ExpandedImageModal } from '../ui/ExpandedImageModal';

interface AssetVaultModalProps {
    isOpen: boolean;
    onClose: () => void;
    worlds: WorldData[] | WorldData;
    onNavigate?: (entityId: string) => void;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export const AssetVaultModal: React.FC<AssetVaultModalProps> = ({
    isOpen,
    onClose,
    worlds,
    onNavigate,
}) => {
    const { themeId, layoutMode } = useTheme();
    const isRoyal = themeId === 'royal-codex';
    const isWiki = layoutMode === 'wiki';

    const [assets, setAssets] = useState<StoredAsset[]>([]);
    const [urls, setUrls] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'used' | 'orphan'>('all');
    const [storageInfo, setStorageInfo] = useState<{ usedBytes: number; quotaBytes: number; percentage: number }>({
        usedBytes: 0,
        quotaBytes: 0,
        percentage: 0,
    });
    const [previewAsset, setPreviewAsset] = useState<StoredAsset | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ text: string; isError?: boolean } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Compute active asset URIs & usage mapping across worlds
    const { activeUris, usageMap } = useMemo(() => {
        const list = Array.isArray(worlds) ? worlds : [worlds];
        const uris = new Set<string>();
        const map = new Map<string, Array<{ id: string; name: string; type: string }>>();

        const addRef = (uri: string | undefined, entityInfo: { id: string; name: string; type: string }) => {
            if (!uri || !uri.startsWith('asset://')) return;
            uris.add(uri);
            const current = map.get(uri) || [];
            if (!current.some(c => c.id === entityInfo.id)) {
                current.push(entityInfo);
            }
            map.set(uri, current);
        };

        for (const w of list) {
            if (w.mapImage && w.mapImage.startsWith('asset://')) {
                uris.add(w.mapImage);
                const current = map.get(w.mapImage) || [];
                current.push({ id: 'world_map', name: `${w.name || 'Realm'} Map`, type: 'map' });
                map.set(w.mapImage, current);
            }

            const allEntities = [...(w.entities || []), ...(w.trash || [])];
            for (const ent of allEntities) {
                if (ent.imageUri) addRef(ent.imageUri, { id: ent.id, name: ent.name, type: ent.type });
                if ((ent as any).headerImageUri) addRef((ent as any).headerImageUri, { id: ent.id, name: ent.name, type: ent.type });

                // Scan description & private notes for embedded asset links
                const text = `${ent.description || ''} ${ent.privateNotes || ''}`;
                if (text.includes('asset://')) {
                    const matches = text.match(/asset:\/\/[a-zA-Z0-9_\-.]+/g);
                    if (matches) {
                        matches.forEach(m => addRef(m, { id: ent.id, name: ent.name, type: ent.type }));
                    }
                }
            }
        }

        return { activeUris: uris, usageMap: map };
    }, [worlds]);

    // Load assets and storage
    const loadAssets = async () => {
        setLoading(true);
        try {
            const list = await getAllAssets();
            setAssets(list);

            // Resolve temporary URLs for image rendering
            const urlMap: Record<string, string> = {};
            for (const a of list) {
                try {
                    urlMap[a.id] = await resolveAssetUrl(a.id);
                } catch {
                    // skip
                }
            }
            setUrls(urlMap);

            const est = await getStorageEstimate();
            setStorageInfo(est);
        } catch (err: any) {
            setNotification({ text: `Failed to load vault assets: ${err?.message || 'Error'}`, isError: true });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadAssets();
        }
    }, [isOpen]);

    // Handle Upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        let uploadedCount = 0;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                await saveAsset(file);
                uploadedCount++;
            } catch (err) {
                console.error('Failed to store asset:', err);
            }
        }

        setNotification({ text: `✓ Stored ${uploadedCount} asset${uploadedCount !== 1 ? 's' : ''} in vault.` });
        setTimeout(() => setNotification(null), 3500);
        await loadAssets();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Handle Delete Single Asset
    const handleDeleteAsset = async (asset: StoredAsset) => {
        const usages = usageMap.get(asset.id);
        const warning = usages && usages.length > 0
            ? `Warning: This asset is used by ${usages.map(u => u.name).join(', ')}. Deleting it will cause broken image links.`
            : `Are you sure you want to permanently erase this asset?`;

        if (!confirm(warning)) return;

        try {
            await deleteAsset(asset.id);
            setNotification({ text: `✓ Asset deleted from vault.` });
            setTimeout(() => setNotification(null), 3000);
            await loadAssets();
        } catch (err: any) {
            setNotification({ text: `Failed to delete asset: ${err?.message || 'Error'}`, isError: true });
        }
    };

    // Handle Prune Orphans
    const handlePruneOrphans = async () => {
        const orphanCount = assets.filter(a => !activeUris.has(a.id)).length;
        if (orphanCount === 0) {
            setNotification({ text: `Vault is clean — no orphan assets detected.` });
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        if (!confirm(`Prune ${orphanCount} unreferenced orphan media files from vault? This will reclaim local disk space.`)) {
            return;
        }

        try {
            const { deletedCount, bytesReclaimed } = await pruneOrphanAssets(activeUris);
            setNotification({
                text: `✓ Pruned ${deletedCount} orphan assets (${formatBytes(bytesReclaimed)} reclaimed).`
            });
            setTimeout(() => setNotification(null), 4500);
            await loadAssets();
        } catch (err: any) {
            setNotification({ text: `Prune failed: ${err?.message || 'Error'}`, isError: true });
        }
    };

    // Handle Download
    const handleDownload = async (asset: StoredAsset) => {
        const ext = asset.fileName?.split('.').pop() || asset.mimeType.split('/')[1] || 'png';
        const name = asset.fileName || `vault-asset-${asset.id.slice(-12)}.${ext}`;
        await downloadFileToDevice(asset.blob, name, asset.mimeType);
    };

    // Copy URI
    const handleCopyUri = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Filtered assets
    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            const isUsed = activeUris.has(asset.id);
            if (filterType === 'used' && !isUsed) return false;
            if (filterType === 'orphan' && isUsed) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = asset.fileName?.toLowerCase().includes(q);
                const matchId = asset.id.toLowerCase().includes(q);
                const usages = usageMap.get(asset.id) || [];
                const matchUsages = usages.some(u => u.name.toLowerCase().includes(q));
                return matchName || matchId || matchUsages;
            }

            return true;
        });
    }, [assets, activeUris, filterType, searchQuery, usageMap]);

    const totalBytes = useMemo(() => {
        return assets.reduce((acc, a) => acc + (a.size || 0), 0);
    }, [assets]);

    const orphanCount = useMemo(() => {
        return assets.filter(a => !activeUris.has(a.id)).length;
    }, [assets, activeUris]);

    if (!isOpen) return null;

    // Theme tokens
    const modalBg = isRoyal
        ? 'bg-[#1e130c] text-[#f7efe0] border-[#c8a96e]/60'
        : isWiki
        ? 'bg-[#fcfbf7] text-[#1c1917] border-[#d4c8af]'
        : 'bg-[#0f172a] text-slate-100 border-slate-700';

    const cardBg = isRoyal
        ? 'bg-[#29170e]/80 border-[#c8a96e]/30 hover:border-[#c8a96e]'
        : isWiki
        ? 'bg-white border-[#d4c8af] hover:border-[#b91c1c]/50'
        : 'bg-slate-900/60 border-slate-800 hover:border-slate-600';

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className={`relative w-full max-w-5xl h-[88vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${modalBg}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${isRoyal ? 'border-[#c8a96e]/30 bg-[#29170e]' : isWiki ? 'border-[#d4c8af] bg-[#f7f0e0]' : 'border-slate-800 bg-slate-900/80'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isRoyal ? 'bg-[#70121e] text-[#fef08a]' : isWiki ? 'bg-[#b91c1c] text-white' : 'bg-purple-500/20 text-purple-300'}`}>
                            <HardDrive size={22} />
                        </div>
                        <div>
                            <h2 className={`text-base font-bold uppercase tracking-wider flex items-center gap-2 ${isRoyal ? 'font-serif text-[#fff8e7]' : isWiki ? 'font-serif text-[#b91c1c]' : 'text-slate-100'}`}>
                                Asset & Media Vault Manager
                            </h2>
                            <p className="text-xs opacity-60">Content-Addressable Storage (CAS) · Deduplicated Local Media Engine</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                                isRoyal
                                    ? 'border-[#c8a96e] bg-[#70121e] text-[#fff8e7] hover:bg-[#881726]'
                                    : isWiki
                                    ? 'border-[#b91c1c] bg-[#b91c1c] text-white hover:bg-[#991b1b]'
                                    : 'border-purple-400/50 bg-purple-500/20 text-purple-200 hover:bg-purple-500/30'
                            }`}
                        >
                            <Upload size={13} />
                            Upload Media
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,audio/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        {orphanCount > 0 && (
                            <button
                                onClick={handlePruneOrphans}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-all"
                                title={`Prune ${orphanCount} unreferenced media files`}
                            >
                                <Trash2 size={13} />
                                Prune Orphans ({orphanCount})
                            </button>
                        )}

                        <button
                            onClick={loadAssets}
                            className="p-2 rounded-xl border border-current/20 opacity-60 hover:opacity-100 transition-opacity"
                            title="Refresh Vault"
                        >
                            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl border border-current/20 opacity-60 hover:opacity-100 transition-opacity"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Vault Metrics Bar */}
                <div className={`px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-4 text-xs shrink-0 ${isRoyal ? 'bg-[#24130a]/90 border-[#c8a96e]/20' : isWiki ? 'bg-stone-100 border-[#d4c8af]' : 'bg-slate-900/50 border-slate-800'}`}>
                    <div className="flex items-center gap-6">
                        <div>
                            <span className="opacity-50 text-[10px] uppercase font-bold tracking-wider mr-1.5">Vault Total:</span>
                            <span className="font-mono font-bold">{assets.length} Assets</span>
                            <span className="opacity-40 font-mono text-[11px] ml-1.5">({formatBytes(totalBytes)})</span>
                        </div>
                        <div>
                            <span className="opacity-50 text-[10px] uppercase font-bold tracking-wider mr-1.5">In Use:</span>
                            <span className="font-mono font-bold text-emerald-400">{assets.length - orphanCount}</span>
                        </div>
                        <div>
                            <span className="opacity-50 text-[10px] uppercase font-bold tracking-wider mr-1.5">Orphans:</span>
                            <span className={`font-mono font-bold ${orphanCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>{orphanCount}</span>
                        </div>
                    </div>

                    {storageInfo.quotaBytes > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="opacity-50 text-[10px] uppercase font-bold tracking-wider">Storage Quota:</span>
                            <div className="w-28 h-2 rounded-full bg-black/30 overflow-hidden border border-current/20">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full"
                                    style={{ width: `${Math.min(100, Math.max(2, storageInfo.percentage))}%` }}
                                />
                            </div>
                            <span className="font-mono text-[10px] opacity-70">
                                {formatBytes(storageInfo.usedBytes)} / {formatBytes(storageInfo.quotaBytes)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Search & Filter Bar */}
                <div className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${isRoyal ? 'bg-[#29170e]/40 border-[#c8a96e]/20' : isWiki ? 'bg-stone-50 border-[#d4c8af]' : 'bg-slate-900/30 border-slate-800'}`}>
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by file name, asset URI hash, or linked entity..."
                            className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs outline-none transition-all ${
                                isRoyal
                                    ? 'bg-[#1b0d06] border-[#c8a96e]/30 focus:border-[#c8a96e]'
                                    : isWiki
                                    ? 'bg-white border-[#d4c8af] focus:border-[#b91c1c]'
                                    : 'bg-slate-950 border-slate-700 focus:border-purple-400'
                            }`}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 mr-1 flex items-center gap-1">
                            <Filter size={11} /> Filter:
                        </span>
                        {(['all', 'used', 'orphan'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setFilterType(mode)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all border ${
                                    filterType === mode
                                        ? isRoyal
                                            ? 'border-[#c8a96e] bg-[#70121e] text-[#fff8e7]'
                                            : isWiki
                                            ? 'border-[#b91c1c] bg-[#b91c1c] text-white'
                                            : 'border-purple-400 bg-purple-500/20 text-purple-200'
                                        : 'border-current/15 opacity-60 hover:opacity-100'
                                }`}
                            >
                                {mode === 'all' ? 'All Assets' : mode === 'used' ? 'In Use' : 'Orphans'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications Banner */}
                {notification && (
                    <div className={`px-6 py-2 text-xs font-medium flex items-center justify-between border-b ${
                        notification.isError
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    }`}>
                        <span>{notification.text}</span>
                        <button onClick={() => setNotification(null)} className="opacity-60 hover:opacity-100">
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Asset Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-3">
                            <RefreshCw size={28} className="animate-spin text-purple-400" />
                            <p className="text-xs uppercase tracking-widest font-mono">Cataloging Vault Media...</p>
                        </div>
                    ) : filteredAssets.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 text-center space-y-2">
                            <ImageIcon size={48} className="opacity-40" />
                            <p className="font-serif text-base">No media assets match your query</p>
                            <p className="text-xs opacity-60">Upload portraits, atlas maps, or scene attachments to fill the vault</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredAssets.map((asset) => {
                                const isUsed = activeUris.has(asset.id);
                                const usages = usageMap.get(asset.id) || [];
                                const objUrl = urls[asset.id];
                                const ext = asset.fileName?.split('.').pop() || asset.mimeType.split('/')[1] || 'img';

                                return (
                                    <div
                                        key={asset.id}
                                        className={`rounded-xl border p-2 flex flex-col group transition-all shadow-sm ${cardBg}`}
                                    >
                                        {/* Thumbnail Container */}
                                        <div
                                            onClick={() => setPreviewAsset(asset)}
                                            className="w-full aspect-square rounded-lg bg-black/20 overflow-hidden relative cursor-pointer flex items-center justify-center border border-current/10"
                                        >
                                            {objUrl ? (
                                                <img
                                                    src={objUrl}
                                                    alt={asset.fileName || asset.id}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        (e.target as HTMLElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <ImageIcon size={32} className="opacity-30" />
                                            )}

                                            {/* Hover Expand Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <span className="p-1.5 rounded-lg bg-black/60 text-white hover:scale-110 transition-transform">
                                                    <Eye size={14} />
                                                </span>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="absolute top-1.5 left-1.5">
                                                {isUsed ? (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/90 text-white shadow-xs">
                                                        {usages.length} Link{usages.length !== 1 ? 's' : ''}
                                                    </span>
                                                ) : (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/90 text-black shadow-xs">
                                                        Orphan
                                                    </span>
                                                )}
                                            </div>

                                            {/* Extension Badge */}
                                            <div className="absolute top-1.5 right-1.5">
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-black/70 text-slate-300 shadow-xs">
                                                    {ext}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div className="mt-2 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="text-xs font-semibold truncate" title={asset.fileName || asset.id}>
                                                    {asset.fileName || asset.id.replace('asset://', '').slice(0, 20)}
                                                </h4>
                                                <div className="flex items-center justify-between text-[10px] opacity-60 mt-0.5 font-mono">
                                                    <span>{formatBytes(asset.size)}</span>
                                                    <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {/* Linked Entities */}
                                            {usages.length > 0 ? (
                                                <div className="mt-1.5 pt-1.5 border-t border-current/10 flex flex-wrap gap-1">
                                                    {usages.slice(0, 2).map(u => (
                                                        <button
                                                            key={u.id}
                                                            onClick={() => {
                                                                if (onNavigate && u.id !== 'world_map') {
                                                                    onClose();
                                                                    onNavigate(u.id);
                                                                }
                                                            }}
                                                            className="text-[9px] px-1.5 py-0.5 rounded bg-current/10 hover:bg-current/20 truncate max-w-[110px]"
                                                            title={`Used in: ${u.name} (${u.type})`}
                                                        >
                                                            {u.name}
                                                        </button>
                                                    ))}
                                                    {usages.length > 2 && (
                                                        <span className="text-[9px] opacity-50 self-center">
                                                            +{usages.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="mt-1.5 pt-1.5 border-t border-current/10 text-[9px] opacity-40 italic">
                                                    Not referenced
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="mt-2 pt-1 border-t border-current/10 flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleCopyUri(asset.id)}
                                                        className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-current/10 transition-colors"
                                                        title="Copy Asset URI"
                                                    >
                                                        {copiedId === asset.id ? (
                                                            <Check size={12} className="text-emerald-400" />
                                                        ) : (
                                                            <Copy size={12} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(asset)}
                                                        className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-current/10 transition-colors"
                                                        title="Download File"
                                                    >
                                                        <Download size={12} />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleDeleteAsset(asset)}
                                                    className="p-1 rounded opacity-50 hover:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                    title="Delete from Vault"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`px-6 py-3 border-t flex items-center justify-between text-xs shrink-0 ${isRoyal ? 'border-[#c8a96e]/30 bg-[#29170e]' : isWiki ? 'border-[#d4c8af] bg-[#f7f0e0]' : 'border-slate-800 bg-slate-900/80'}`}>
                    <span className="opacity-60 text-[10px]">
                        Showing {filteredAssets.length} of {assets.length} stored media assets
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-xl border border-current/20 text-xs font-semibold hover:bg-current/10 transition-colors"
                    >
                        Close Vault
                    </button>
                </div>
            </div>

            {/* Fullscreen Preview Modal */}
            {previewAsset && (
                <ExpandedImageModal
                    imageUri={urls[previewAsset.id] || previewAsset.id}
                    entityName={previewAsset.fileName || previewAsset.id}
                    onClose={() => setPreviewAsset(null)}
                    theme={themeId as ThemeMode}
                />
            )}
        </div>,
        document.body
    );
};
