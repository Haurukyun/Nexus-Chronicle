import React from 'react';
import { useWorldStore } from '../../store/useWorldStore';

interface ViewerSectionCardProps {
    title: string;
    children: React.ReactNode;
    badgeText?: string;
}

export const ViewerSectionCard: React.FC<ViewerSectionCardProps> = ({ title, children, badgeText }) => {
    const theme = useWorldStore(state => state.theme);
    const isRoyal = theme === 'royal-codex';
    const isWiki = theme === 'wiki';

    const firstChar = title.charAt(0).toUpperCase();

    if (isRoyal) {
        return (
            <div className="bg-[#fcf5e9] rounded-md p-5 shadow-sm mb-6 text-[#2b1810] relative">
                {/* Double Gold Border Effect */}
                <div className="absolute inset-1 border-2 border-[#d4c8af]" />
                <div className="absolute inset-[6px] border border-[#d4c8af]/50" />
                
                {/* 4 corner ornaments */}
                <div className="absolute top-[3px] left-[3px] w-2 h-2 border-t border-l border-[#855325]" />
                <div className="absolute top-[3px] right-[3px] w-2 h-2 border-t border-r border-[#855325]" />
                <div className="absolute bottom-[3px] left-[3px] w-2 h-2 border-b border-l border-[#855325]" />
                <div className="absolute bottom-[3px] right-[3px] w-2 h-2 border-b border-r border-[#855325]" />

                <div className="relative flex items-center justify-between border-b border-[#d4c8af] pb-2 mb-4 mx-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-10 bg-gradient-to-b from-[#6e2c2c] to-[#471a1a] border border-[#d4c8af] text-[#f0ddb0] font-serif font-black text-xl flex items-center justify-center shadow-md shrink-0 relative" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)' }}>
                            <div className="absolute inset-[2px] border border-[#d4c8af]/50 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)' }} />
                            {firstChar}
                        </div>
                        <h3 className="font-serif font-medium text-2xl text-[#2b1810] tracking-tight">{title}</h3>
                    </div>
                    {badgeText && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#70121e] text-[#fef08a] border border-[#c8a96e]">
                            {badgeText}
                        </span>
                    )}
                </div>
                <div className="relative space-y-4 mx-3">
                    {children}
                </div>
            </div>
        );
    }

    if (isWiki) {
        return (
            <div className="mb-8 p-6 bg-white border border-[#d4c8af] rounded-xl shadow-sm space-y-4 text-[#1a1a1a]">
                <div className="flex items-center justify-between border-b-2 border-[#e69a28] pb-2 mb-4">
                    <h3 className="font-serif font-bold text-2xl text-[#e69a28] uppercase tracking-tight">{title}</h3>
                    {badgeText && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#b91c1c] text-white">
                            {badgeText}
                        </span>
                    )}
                </div>
                <div className="space-y-4">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl mb-8 space-y-4 text-slate-300">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#fef08a]">{title}</h3>
                {badgeText && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#fef08a] text-black">
                        {badgeText}
                    </span>
                )}
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
};
