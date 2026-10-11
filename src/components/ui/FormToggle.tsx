import React from 'react';
import { LucideIcon } from 'lucide-react';
import { FormToggleProps } from '../../types';
import { useTheme } from '../../theme';

export const FormToggle = ({ label, checked, onChange, disabled, icon: Icon, gridSpan = 12 }: FormToggleProps & { disabled?: boolean, icon?: LucideIcon }) => {
    const { themeId, layoutMode } = useTheme();
    const isWikiMode = layoutMode === 'wiki';
    const isRoyal = themeId === 'royal-codex';

    const labelStyle = isRoyal 
        ? 'text-[#451a03] font-serif font-bold' 
        : isWikiMode 
            ? 'text-[#854d0e] font-black' 
            : 'text-slate-500 font-black';

    const iconStyle = isRoyal 
        ? 'text-[#70121e]' 
        : isWikiMode 
            ? 'text-[#b91c1c]/60' 
            : 'text-[#fef08a]/60';

    const trackStyle = checked
        ? isRoyal
            ? 'bg-[#70121e] border border-[#c8a96e]'
            : isWikiMode
                ? 'bg-[#b91c1c]'
                : 'bg-[#fef08a]'
        : isRoyal
            ? 'bg-[#d4c8af] border border-[#c8a96e]/50 shadow-inner'
            : 'bg-slate-600 shadow-inner';

    const thumbStyle = isRoyal
        ? 'bg-[#fff8e7] border border-[#c8a96e]/40 shadow-sm'
        : 'bg-white shadow-sm';

    const containerHover = isRoyal ? 'hover:bg-[#c8a96e]/15' : 'hover:bg-black/5';

    return (
        <div 
            className={`flex items-center justify-between p-2 rounded-lg ${containerHover} transition-all ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            style={{ gridColumn: `span ${gridSpan}` }}
        >
            <div className="flex items-center gap-2">
                {Icon && <Icon size={12} className={iconStyle} />}
                <label className={`text-[10px] uppercase tracking-widest ${labelStyle}`}>{label}</label>
            </div>
            <button
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={`w-10 h-5 rounded-full relative transition-all ${trackStyle}`}
            >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full ${thumbStyle} transition-all ${checked ? 'left-5.5' : 'left-0.5'}`} />
            </button>
        </div>
    );
};
