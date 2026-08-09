import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useWorldStore } from '../../store/useWorldStore';

interface EditorGroupProps {
    title: string;
    icon: LucideIcon;
    children: React.ReactNode;
    isWikiMode?: boolean;
}

export const EditorGroup = ({ title, icon: Icon, children, isWikiMode }: EditorGroupProps) => {
    const theme = useWorldStore(state => state.theme);
    const isRoyal = theme === 'royal-codex';
    const isWiki = theme === 'wiki' || isWikiMode;

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
        <div className={`mb-8 border rounded-2xl shadow-lg ${containerStyle}`}>
            <div className={`px-6 py-3.5 border-b flex items-center gap-3.5 rounded-t-2xl ${headerStyle}`}>
                {isRoyal ? (
                    <div className="w-7 h-7 rounded-md bg-[#70121e] border border-[#c8a96e] text-[#fef08a] font-serif font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                        {firstChar}
                    </div>
                ) : (
                    <Icon size={16} className={iconStyle} />
                )}
                <h3 className={`text-xs font-bold uppercase tracking-[0.15em] ${titleStyle}`}>{title}</h3>
            </div>
            <div className="p-6 grid grid-cols-12 gap-5 items-start">
                {children}
            </div>
        </div>
    );
};
