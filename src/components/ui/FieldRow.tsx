import React from 'react';
import { FieldRowProps } from '../../types';
import { useWorldStore } from '../../store/useWorldStore';

export const FieldRow = ({ label, value, isWikiMode }: FieldRowProps) => {
    const theme = useWorldStore(state => state.theme);
    const isRoyal = theme === 'royal-codex';
    const isWiki = theme === 'wiki' || isWikiMode;

    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    let labelStyle = 'text-slate-500';
    let valueStyle = 'text-slate-300';
    let borderStyle = 'border-slate-500/10';

    if (isRoyal) {
        labelStyle = 'text-[#451a03] font-serif font-bold';
        valueStyle = 'text-[#2b1810] font-sans font-medium';
        borderStyle = 'border-[#c8a96e]/20';
    } else if (isWiki) {
        labelStyle = 'text-[#854d0e]';
        valueStyle = 'text-[#1a1a1a]';
        borderStyle = 'border-[#d4c8af]/40';
    }

    return (
        <div className={`py-2 border-b ${borderStyle} last:border-0 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4`}>
            <span className={`text-[10px] uppercase tracking-widest shrink-0 w-32 ${labelStyle}`}>{label}</span>
            <span className={`text-sm ${valueStyle}`}>{value}</span>
        </div>
    );
};

