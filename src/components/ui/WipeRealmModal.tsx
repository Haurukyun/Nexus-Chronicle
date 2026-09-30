import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Skull, AlertTriangle, X } from 'lucide-react';
import { WorldData, ThemeMode } from '../../types';

interface WipeRealmModalProps {
    isOpen: boolean;
    realm: WorldData;
    onConfirm: () => void;
    onCancel: () => void;
    theme: ThemeMode;
    isWikiMode: boolean;
}

export const WipeRealmModal: React.FC<WipeRealmModalProps> = ({
    isOpen,
    realm,
    onConfirm,
    onCancel,
    theme,
    isWikiMode
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onCancel();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const isRoyal = theme === 'royal-codex';

    const modalBg = isRoyal
        ? 'bg-[#181410] border-[#c8a96e]/40 text-[#f5ebd7]'
        : isWikiMode
        ? 'bg-[#fbf6ea] border-[#d4c8af] text-[#2b1810]'
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
                        <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 shrink-0">
                            <Skull size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-serif font-black uppercase tracking-tight text-rose-400">
                                Oblivion Protocol
                            </h2>
                            <p className="text-[11px] opacity-60 font-serif italic truncate max-w-[240px]">
                                Purge Active Realm Cache
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
                    <p className="text-sm font-medium leading-relaxed">
                        Are you absolutely certain you want to purge all records from <span className="font-bold underline decoration-rose-500/50">{realm.name}</span>?
                    </p>
                    <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs space-y-1.5 text-rose-300">
                        <p className="font-bold flex items-center gap-1.5">
                            <AlertTriangle size={13} /> Irreversible Purge
                        </p>
                        <p className="opacity-80">
                            This will permanently reset all <strong className="text-white">{realm.entities?.length || 0} entities</strong>, <strong className="text-white">{realm.trash?.length || 0} trash records</strong>, and cartography leylines in <strong className="text-white">"{realm.name}"</strong>.
                        </p>
                        <p className="opacity-60 text-[10px] pt-1">
                            Note: Other realms in your multiverse and the active realm's settings will remain preserved.
                        </p>
                    </div>
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
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/30 transition-all"
                    >
                        <Skull size={14} />
                        <span>Purge Active Realm</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalElement, document.body) : modalElement;
};
