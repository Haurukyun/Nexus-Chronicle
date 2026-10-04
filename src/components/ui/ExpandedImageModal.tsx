import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn } from 'lucide-react';
import { NexusImage } from './NexusImage';
import { useTheme } from '../../theme';

interface ExpandedImageModalProps {
    imageUri: string;
    entityName?: string;
    onClose: () => void;
    theme?: 'royal-codex' | 'wiki' | 'sovereign';
}

export const ExpandedImageModal = ({ imageUri, entityName, onClose, theme: propTheme }: ExpandedImageModalProps) => {
    const { themeId } = useTheme();
    const theme = propTheme || themeId;
    const handleKey = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [handleKey]);

    const accentClass =
        theme === 'royal-codex'
            ? 'border-[#c8a96e] text-[#e6c687]'
            : theme === 'wiki'
            ? 'border-amber-700/60 text-amber-800'
            : 'border-slate-600/60 text-slate-300';

    const headerBg =
        theme === 'royal-codex'
            ? 'bg-[#1b0207]/95'
            : theme === 'wiki'
            ? 'bg-amber-50/95'
            : 'bg-slate-950/95';

    const closeBtn =
        theme === 'royal-codex'
            ? 'bg-[#c8a96e]/10 hover:bg-[#c8a96e]/30 border-[#c8a96e]/40 text-[#e6c687]'
            : theme === 'wiki'
            ? 'bg-amber-800/10 hover:bg-amber-800/20 border-amber-700/40 text-amber-800'
            : 'bg-slate-800/60 hover:bg-slate-700/80 border-slate-600/40 text-slate-300';

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <div
                className={`relative z-10 flex flex-col rounded-2xl overflow-hidden shadow-2xl border ${accentClass} max-w-[90vw] max-h-[90vh]`}
                style={{ minWidth: 280 }}
                onClick={e => e.stopPropagation()}
            >
                <div className={`${headerBg} ${accentClass} border-b flex items-center justify-between px-4 py-2.5 gap-4`}>
                    <div className="flex items-center gap-2">
                        <ZoomIn size={14} className="opacity-70 shrink-0" />
                        {entityName && (
                            <span className="text-xs font-bold tracking-widest uppercase truncate max-w-[240px]">
                                {entityName}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-lg border transition-colors ${closeBtn}`}
                        title="Close (Esc)"
                    >
                        <X size={14} />
                    </button>
                </div>
                <div className="bg-black flex items-center justify-center overflow-hidden" style={{ maxHeight: 'calc(90vh - 48px)' }}>
                    <NexusImage
                        src={imageUri}
                        className="max-w-full max-h-full object-contain"
                        containerClassName="flex items-center justify-center"
                        style={{ maxHeight: 'calc(90vh - 48px)', maxWidth: '90vw' } as React.CSSProperties}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
};
