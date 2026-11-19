import React, { useState, useMemo } from 'react';
import { RefreshCw, Trash, AlertTriangle, CheckSquare, Square, Filter, RotateCcw, Check } from 'lucide-react';
import { WorldEntity, WorldData, EntityType } from '../types';
import { TYPE_LABELS } from '../constants';
import { useTheme } from '../theme';
import { ThemeCard } from '../components/ui';

interface TrashViewProps {
    trash: WorldEntity[];
    setWorld: (update: WorldData | ((prev: WorldData) => WorldData)) => void;
}

export const TrashView = ({ trash, setWorld }: TrashViewProps) => {
    const { t } = useTheme();
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [confirmBulkDelete, setConfirmBulkDelete] = useState<boolean>(false);
    const [confirmEmptyTrash, setConfirmEmptyTrash] = useState<boolean>(false);

    // Filter trash list
    const filteredTrash = useMemo(() => {
        if (typeFilter === 'all') return trash;
        return trash.filter(e => e.type === typeFilter);
    }, [trash, typeFilter]);

    // Unique types present in trash for filter dropdown
    const availableTypes = useMemo(() => {
        const types = new Set<EntityType>();
        trash.forEach(e => types.add(e.type));
        return Array.from(types).sort();
    }, [trash]);

    const allFilteredSelected = filteredTrash.length > 0 && filteredTrash.every(e => selectedIds.has(e.id));
    const someFilteredSelected = filteredTrash.some(e => selectedIds.has(e.id));

    const toggleSelectAll = () => {
        if (allFilteredSelected) {
            // Deselect all filtered
            setSelectedIds(prev => {
                const next = new Set(prev);
                filteredTrash.forEach(e => next.delete(e.id));
                return next;
            });
        } else {
            // Select all filtered
            setSelectedIds(prev => {
                const next = new Set(prev);
                filteredTrash.forEach(e => next.add(e.id));
                return next;
            });
        }
    };

    const toggleSelectItem = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleRestoreSingle = (e: WorldEntity) => {
        setWorld((p) => {
            const parentStillExists = e.parentId
                ? p.entities.some((ent) => ent.id === e.parentId && ent.type === e.type)
                : false;
            const restoredEntity: WorldEntity = parentStillExists
                ? e
                : { ...e, parentId: undefined };
            return {
                ...p,
                trash: p.trash.filter((x) => x.id !== e.id),
                entities: [...p.entities, restoredEntity],
            };
        });
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(e.id);
            return next;
        });
    };

    const handleBulkRestore = (targets: WorldEntity[]) => {
        if (targets.length === 0) return;
        const targetIds = new Set(targets.map(t => t.id));
        setWorld((p) => {
            const restoredEntities: WorldEntity[] = targets.map(e => {
                const parentStillExists = e.parentId
                    ? p.entities.some((ent) => ent.id === e.parentId && ent.type === e.type) ||
                      targets.some(t => t.id === e.parentId && t.type === e.type)
                    : false;
                return parentStillExists ? e : { ...e, parentId: undefined };
            });

            return {
                ...p,
                trash: p.trash.filter((x) => !targetIds.has(x.id)),
                entities: [...p.entities, ...restoredEntities],
            };
        });
        setSelectedIds(prev => {
            const next = new Set(prev);
            targetIds.forEach(id => next.delete(id));
            return next;
        });
    };

    const handlePermanentDelete = (id: string) => {
        if (confirmDeleteId === id) {
            setWorld((p) => ({ ...p, trash: p.trash.filter((x) => x.id !== id) }));
            setConfirmDeleteId(null);
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        } else {
            setConfirmDeleteId(id);
        }
    };

    const handleBulkPermanentDelete = (idsToDelete: Set<string>) => {
        if (idsToDelete.size === 0) return;
        setWorld((p) => ({
            ...p,
            trash: p.trash.filter((x) => !idsToDelete.has(x.id)),
        }));
        setSelectedIds(new Set());
        setConfirmBulkDelete(false);
    };

    const handleEmptyTrash = () => {
        setWorld((p) => ({
            ...p,
            trash: [],
        }));
        setSelectedIds(new Set());
        setConfirmEmptyTrash(false);
    };

    const selectedEntities = useMemo(() => {
        return trash.filter(e => selectedIds.has(e.id));
    }, [trash, selectedIds]);

    return (
        <div className="p-10 lg:p-16 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <h2 className={`text-5xl lg:text-6xl ${t.typography.heading} ${t.colors.textAccent}`}>Forgotten Depth</h2>
                    <p className={`text-xs uppercase tracking-widest mt-2 ${t.colors.textMuted}`}>
                        Decommissioned & Archival Records ({trash.length} total)
                    </p>
                </div>

                {trash.length > 0 && (
                    <div className="flex items-center gap-3">
                        {confirmEmptyTrash ? (
                            <div className="flex items-center gap-2 bg-rose-950/40 border border-rose-500/40 px-3 py-1.5 rounded-xl">
                                <span className="text-[11px] text-rose-300 font-bold uppercase">Empty entire archive?</span>
                                <button
                                    onClick={handleEmptyTrash}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => setConfirmEmptyTrash(false)}
                                    className="px-2 py-1 text-slate-400 hover:text-white text-xs transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setConfirmEmptyTrash(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
                            >
                                <Trash size={14} />
                                <span>Empty Archive</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Filter and Selection Toolbar */}
            {trash.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSelectAll}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer text-slate-200"
                            title={allFilteredSelected ? "Deselect all" : "Select all in view"}
                        >
                            {allFilteredSelected ? (
                                <CheckSquare size={16} className="text-amber-400" />
                            ) : someFilteredSelected ? (
                                <div className="w-4 h-4 rounded border border-amber-400/60 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-amber-400 rounded-sm" />
                                </div>
                            ) : (
                                <Square size={16} className="text-slate-400" />
                            )}
                            <span>{allFilteredSelected ? "Deselect All" : "Select All"}</span>
                        </button>

                        {/* Filter by Entity Type */}
                        <div className="flex items-center gap-2 pl-3 border-l border-white/10">
                            <Filter size={14} className="text-slate-400" />
                            <select
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                                className="bg-slate-900 border border-white/10 text-xs rounded-xl px-2.5 py-1.5 outline-none text-slate-200 cursor-pointer"
                            >
                                <option value="all">All Types ({trash.length})</option>
                                {availableTypes.map(typ => (
                                    <option key={typ} value={typ}>
                                        {TYPE_LABELS[typ] || typ} ({trash.filter(e => e.type === typ).length})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Bulk Action Controls */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-amber-400 mr-1">
                                {selectedIds.size} selected
                            </span>
                            <button
                                onClick={() => handleBulkRestore(selectedEntities)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                            >
                                <RotateCcw size={14} />
                                <span>Restore Selected</span>
                            </button>

                            {confirmBulkDelete ? (
                                <div className="flex items-center gap-1.5 bg-rose-950/60 border border-rose-500/50 px-2.5 py-1 rounded-xl">
                                    <span className="text-[11px] text-rose-300 font-bold uppercase">Delete {selectedIds.size}?</span>
                                    <button
                                        onClick={() => handleBulkPermanentDelete(selectedIds)}
                                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded transition-colors"
                                    >
                                        Yes
                                    </button>
                                    <button
                                        onClick={() => setConfirmBulkDelete(false)}
                                        className="px-1.5 py-0.5 text-slate-300 hover:text-white text-[11px] transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setConfirmBulkDelete(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                                >
                                    <Trash size={14} />
                                    <span>Erase Selected</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Entity List */}
            <div className="space-y-3">
                {trash.length === 0 && (
                    <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
                        <p className="opacity-40 italic text-base">The archive is silent. No forgotten records reside here.</p>
                    </div>
                )}
                {trash.length > 0 && filteredTrash.length === 0 && (
                    <div className="p-8 text-center rounded-2xl border border-white/10 bg-white/[0.02]">
                        <p className="opacity-60 text-sm">No records matching type "{TYPE_LABELS[typeFilter as EntityType] || typeFilter}".</p>
                    </div>
                )}
                {filteredTrash.map((e: WorldEntity) => {
                    const isSelected = selectedIds.has(e.id);
                    return (
                        <ThemeCard
                            key={e.id}
                            className={`flex items-center justify-between p-4 transition-all ${
                                isSelected ? 'ring-1 ring-amber-400/60 bg-amber-500/[0.04]' : ''
                            }`}
                        >
                            <div className="flex items-center gap-3.5">
                                <button
                                    type="button"
                                    onClick={() => toggleSelectItem(e.id)}
                                    className="text-slate-400 hover:text-amber-400 p-0.5 cursor-pointer transition-colors"
                                >
                                    {isSelected ? (
                                        <CheckSquare size={18} className="text-amber-400" />
                                    ) : (
                                        <Square size={18} />
                                    )}
                                </button>

                                <div>
                                    <span className="font-bold text-lg">{e.name}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/5 ${t.colors.textMuted}`}>
                                            {TYPE_LABELS[e.type] || e.type}
                                        </span>
                                        {e.parentId && !trash.some(t => t.id === e.parentId) && (
                                            <span className="text-[10px] text-amber-400/80 font-medium">
                                                ⚠ Parent not in archive — will restore as root
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 items-center">
                                <button
                                    onClick={() => handleRestoreSingle(e)}
                                    className="p-2 hover:bg-emerald-500/10 text-emerald-400 rounded-lg transition-all cursor-pointer"
                                    title="Restore entry to codex"
                                >
                                    <RefreshCw size={18} />
                                </button>
                                {confirmDeleteId === e.id ? (
                                    <div className="flex items-center gap-1 bg-rose-950/40 border border-rose-500/30 px-2 py-1 rounded-lg">
                                        <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">Erase forever?</span>
                                        <button
                                            onClick={() => handlePermanentDelete(e.id)}
                                            className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded transition-all cursor-pointer"
                                            title="Confirm permanent deletion"
                                        >
                                            <AlertTriangle size={14} />
                                        </button>
                                        <button
                                            onClick={() => setConfirmDeleteId(null)}
                                            className="p-1 text-slate-400 hover:text-white transition-all text-xs cursor-pointer"
                                            title="Cancel"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handlePermanentDelete(e.id)}
                                        className="p-2 hover:bg-rose-500/10 text-rose-400/80 hover:text-rose-300 rounded-lg transition-all cursor-pointer"
                                        title="Permanently erase"
                                    >
                                        <Trash size={18} />
                                    </button>
                                )}
                            </div>
                        </ThemeCard>
                    );
                })}
            </div>
        </div>
    );
};
