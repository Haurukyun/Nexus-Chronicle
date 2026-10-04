import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { WorldData, ThemeMode } from '../../types';
import { useTheme } from '../../theme';

interface DeleteRealmModalProps {
    realm: WorldData | null;
    canDelete: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    theme?: ThemeMode;
}

export const DeleteRealmModal: React.FC<DeleteRealmModalProps> = ({
    realm,
    canDelete,
    onConfirm,
    onCancel,
}) => {
    const { themeId, layoutMode } = useTheme();
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onCancel]);

    if (!realm) return null;


    const modalBg = (themeId === 'royal-codex')
        ? 'bg-[#181410] border-[#c8a96e]/40 text-[#f5ebd7]'
        : (layoutMode === 'wiki') ? 'bg-[#fbf6ea] border-[#d4c8af] text-[#2b1810]'
        : 'bg-slate-900 border-slate-700 text-slate-100';

    const modalElement = (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onCancel}
        >
            <div 
                className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${modalBg} relative max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between border-b pb-4 border-current/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-500 shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-serif font-black uppercase tracking-tight text-red-400">
                                Dissolve Realm
                            </h2>
                            <p className="text-[11px] opacity-60 font-serif italic truncate max-w-[240px]">
                                {realm.name}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="opacity-50 hover:opacity-100 transition-opacity p-1.5 rounded-xl hover:bg-white/5"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="space-y-4">
                    {canDelete ? (
                        <>
                            <p className="text-sm font-medium leading-relaxed">
                                Are you sure you want to permanently dissolve the realm <span className="font-bold underline decoration-red-500/50">{realm.name}</span>?
                            </p>
                            <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs space-y-1.5 text-red-300">
                                <p className="font-bold flex items-center gap-1.5">
                                    <Trash2 size={13} /> Irreversible Cataclysm
                                </p>
                                <p className="opacity-80">
                                    All <strong className="text-white">{realm.entities?.length || 0} entities</strong>, map markers, leylines, and chronicle records within this realm will be permanently obliterated.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-xs space-y-2 text-yellow-300">
                            <p className="font-bold">Sole Realm Protection</p>
                            <p className="opacity-80">
                                You cannot delete the sole remaining realm in your multiverse. Your codex requires at least one prime plane of existence.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-current/10">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl text-xs font-bold uppercase opacity-70 hover:opacity-100 hover:bg-white/5 transition-all"
                    >
                        Cancel
                    </button>
                    {canDelete && (
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all"
                        >
                            <Trash2 size={14} />
                            <span>Dissolve Realm</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalElement, document.body) : modalElement;
};
