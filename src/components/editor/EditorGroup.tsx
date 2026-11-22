import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../../theme';

interface EditorGroupProps {
    title: string;
    icon: LucideIcon;
    children: React.ReactNode;
    id?: string;
}

export const EditorGroup = ({ title, icon: Icon, children, id }: EditorGroupProps) => {
    const { themeId, layoutMode } = useTheme();
    const isWiki = layoutMode === 'wiki';
    const isRoyal = themeId === 'royal-codex';

    const firstChar = title.charAt(0).toUpperCase();

    let containerStyle = 'bg-slate-900/40 border-slate-700';
    let headerStyle = 'bg-slate-900/80 border-slate-800';
    let iconStyle = 'text-[#fef08a]';
    let titleStyle = 'text-[#fef08a]';

    if (isRoyal) {
        containerStyle = 'bg-[#f7f0e1] border-2 border-[#c8a96e]/50 shadow-md rounded-2xl';
        headerStyle = 'bg-[#ede2cc] border-b border-[#c8a96e]/40';
        iconStyle = 'text-[#70121e]';
        titleStyle = 'text-[#2b1810] font-serif font-bold tracking-wider';
    } else if (isWiki) {
        containerStyle = 'bg-white border-[#d4c8af]';
        headerStyle = 'bg-[#f5e6d3] border-[#d4c8af]';
        iconStyle = 'text-[#b91c1c]';
        titleStyle = 'text-[#854d0e]';
    }

    return (
        <div id={id} className={`mb-6 sm:mb-8 border rounded-2xl shadow-lg scroll-mt-24 min-w-0 w-full ${containerStyle}`}>
            <div className={`px-4 sm:px-6 py-3 sm:py-3.5 border-b flex items-center gap-2.5 sm:gap-3.5 rounded-t-2xl min-w-0 ${headerStyle}`}>
                {isRoyal ? (
                    <div className="w-7 h-7 rounded-md bg-[#70121e] border border-[#c8a96e] text-[#fff8e7] font-serif font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                        {firstChar}
                    </div>
                ) : (
                    <Icon size={16} className={iconStyle} />
                )}
                <h3 className={`text-xs font-bold uppercase tracking-[0.15em] truncate min-w-0 ${titleStyle}`}>{title}</h3>
            </div>
            <div className="p-3 sm:p-4 md:p-6 grid grid-cols-12 gap-2.5 sm:gap-4 md:gap-5 items-start min-w-0">
                {children}
            </div>
        </div>
    );
};
