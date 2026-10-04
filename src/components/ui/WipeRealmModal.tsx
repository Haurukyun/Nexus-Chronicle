import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Skull, X } from 'lucide-react';
import { WorldData, ThemeMode } from '../../types';
import { useTheme } from '../../theme';

interface WipeRealmModalProps {
    isOpen: boolean;
    realm: WorldData;
    onConfirm: () => void;
    onCancel: () => void;
    theme?: ThemeMode;
}

export const WipeRealmModal: React.FC<WipeRealmModalProps> = ({
    isOpen,
    realm,
    onConfirm,
    onCancel,
}) => {
    const { isWikiMode, isRoyal } = useTheme();
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const entityCount = (realm.entities || []).length;

    const bgClass = isWikiMode
        ? 'bg-[#f5f0e8] border-[#b91c1c] text-[#1a1a1a]'
        : isRoyal
        ? 'bg-[#2a0a0f] border-[#70121e] text-[#fff8e7]'
        : 'bg-slate-900 border-red-500/60 text-white';

    const titleClass = isWikiMode
        ? 'text-[#b91c1c]'
        : isRoyal
        ? 'text-[#ff6b6b]'
        : 'text-red-400';

    const subtextClass = isWikiMode
        ? 'text-[#5a3a2a]'
        : isRoyal
        ? 'text-[#ffcdd2]'
        : 'text-slate-300';

    const confirmBtnClass = isWikiMode
        ? 'bg-[#b91c1c] hover:bg-[#991b1b] text-white'
        : isRoyal
        ? 'bg-[#70121e] hover:bg-[#8b1a28] text-[#fff8e7]'
        : 'bg-red-600 hover:bg-red-700 text-white';

    const cancelBtnClass = isWikiMode
        ? 'bg-[#e8e0d0] hover:bg-[#d8cfc0] text-[#3d2a1a] border border-[#c8b89a]'
        : isRoyal
        ? 'bg-[#3d1a20] hover:bg-[#4a2030] text-[#fff8e7] border border-[#70121e]/40'
        : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600';

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div className={`relative w-full max-w-md rounded-2xl border-2 p-8 shadow-2xl mx-4 ${bgClass}`}>
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity"
                >
                    <X size={18} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                        <Skull size={28} className={titleClass} />
                    </div>
                </div>

                {/* Title */}
                <h2 className={`text-center text-xl font-black uppercase tracking-widest mb-1 ${titleClass}`}>
                    Oblivion Protocol
                </h2>
                <p className={`text-center text-sm mb-6 ${subtextClass}`}>
                    You are about to erase all entities from{' '}
                    <span className="font-bold">{realm.name}</span>
                </p>

                {/* Warning box */}
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 mb-6 flex gap-3 items-start">
                    <AlertTriangle size={18} className={`${titleClass} mt-0.5 shrink-0`} />
                    <div className={`text-sm ${subtextClass}`}>
                        <p className="font-semibold mb-1">This action cannot be undone.</p>
                        <p>
                            <span className="font-bold">{entityCount} {entityCount === 1 ? 'entity' : 'entities'}</span>{' '}
                            and all associated relationships, drafts, and open tabs will be permanently obliterated.
                            The realm itself and its lore settings will remain.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${cancelBtnClass}`}
                    >
                        Stand Down
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 ${confirmBtnClass}`}
                    >
                        <Skull size={15} />
                        Execute Protocol
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
