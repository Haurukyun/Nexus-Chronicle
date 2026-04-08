import React from 'react';

export const WikiStatRow = ({ label, value, boldLabel = true }: { label: string, value?: string, boldLabel?: boolean }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
        <div className="text-sm leading-tight my-1">
            <span className={`${boldLabel ? 'font-bold' : ''} text-[#7a200d]`}>{label}</span>{' '}
            <span className="text-[#2d2d2d]">{value}</span>
        </div>
    );
};

export const WikiInfoboxRow = ({ label, value }: { label: string, value?: string }) => {
    if (!value) return null;
    return (
        <tr className="border-b border-[#d4c8af]/40 last:border-0 hover:bg-black/5 transition-colors">
            <th className="p-2 text-[#7a200d] font-bold text-[11px] uppercase tracking-tight text-left align-top">{label}</th>
            <td className="p-2 text-[#2d2d2d] font-medium text-xs text-right">{value}</td>
        </tr>
    );
};
