import React from 'react';
import { FieldRowProps } from '../../types';

export const FieldRow = ({ label, value, isWikiMode }: FieldRowProps) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
        <div className="py-2 border-b border-slate-500/10 last:border-0 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
            <span className={`text-[9px] font-black uppercase tracking-widest shrink-0 w-32 ${isWikiMode ? 'text-[#854d0e]' : 'text-slate-500'}`}>{label}</span>
            <span className={`text-sm ${isWikiMode ? 'text-[#1a1a1a]' : 'text-slate-300'}`}>{value}</span>
        </div>
    );
};
