import React, { useState } from 'react';
import { RefreshCw, Trash, AlertTriangle } from 'lucide-react';
import { WorldEntity, WorldData } from '../types';
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

    const handleRestore = (e: WorldEntity) => {
        setWorld((p) => {
            // Validate parentId: if the parent no longer exists in current entities,
            // clear it so the entry comes back as a root instead of vanishing into
            // an invalid subtree.
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
    };

    const handlePermanentDelete = (id: string) => {
        if (confirmDeleteId === id) {
            setWorld((p) => ({ ...p, trash: p.trash.filter((x) => x.id !== id) }));
            setConfirmDeleteId(null);
        } else {
            setConfirmDeleteId(id);
        }
    };

    return (
        <div className="p-16 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <h2 className={`text-6xl ${t.typography.heading} ${t.colors.textAccent}`}>Forgotten Depth</h2>
            <div className="space-y-3">
                {trash.length === 0 && <p className="opacity-40 italic text-center py-10">The archive is silent.</p>}
                {trash.map((e: WorldEntity) => (
                    <ThemeCard key={e.id} className="flex items-center justify-between p-4">
                        <div>
                            <span className="font-bold text-lg">{e.name}</span>
                            <p className={`text-[10px] uppercase ${t.colors.textMuted}`}>{TYPE_LABELS[e.type]}</p>
                            {e.parentId && !trash.some(t => t.id === e.parentId) && (
                                <p className="text-[10px] text-amber-400/70 mt-0.5">⚠ Parent not in archive — will restore as root</p>
                            )}
                        </div>
                        <div className="flex gap-2 items-center">
                            <button
                                onClick={() => handleRestore(e)}
                                className="p-2 hover:bg-green-500/10 text-green-500 transition-all"
                                title="Restore entry"
                            >
                                <RefreshCw size={20} />
                            </button>
                            {confirmDeleteId === e.id ? (
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Erase forever?</span>
                                    <button
                                        onClick={() => handlePermanentDelete(e.id)}
                                        className="p-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 rounded transition-all"
                                        title="Confirm permanent deletion"
                                    >
                                        <AlertTriangle size={16} />
                                    </button>
                                    <button
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="p-1.5 text-slate-400 hover:text-white transition-all text-xs"
                                        title="Cancel"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handlePermanentDelete(e.id)}
                                    className="p-2 hover:bg-rose-500/10 text-rose-500 transition-all"
                                    title="Permanently erase"
                                >
                                    <Trash size={20} />
                                </button>
                            )}
                        </div>
                    </ThemeCard>
                ))}
            </div>
        </div>
    );
};
