import React from 'react';

export const WikiStatRow = ({ label, value, boldLabel = true }: { label: string, value?: string, boldLabel?: boolean }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
        <div className="text-sm leading-tight my-1">
            <span className={`\${boldLabel ? 'font-bold' : ''} text-[#7a200d]`}>{label}</span>{' '}
            <span className="text-[#2d2d2d]">{value}</span>
        </div>
    );
};
