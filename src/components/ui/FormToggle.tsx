import React from 'react';
import { LucideIcon } from 'lucide-react';
import { FormToggleProps } from '../../types';

export const FormToggle = ({ label, checked, onChange, isWikiMode, disabled, icon: Icon }: FormToggleProps & { disabled?: boolean, icon?: LucideIcon }) => (
    <div className={`flex items-center justify-between p-2 rounded-lg hover:bg-black/5 transition-all ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-2">
            {Icon && <Icon size={12} className={isWikiMode ? 'text-[#b91c1c]/60' : 'text-[#fef08a]/60'} />}
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>
        </div>
        <button
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`w-10 h-5 rounded-full relative transition-all ${checked ? (isWikiMode ? 'bg-[#b91c1c]' : 'bg-[#fef08a]') : 'bg-slate-600 shadow-inner'}`}
        >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-5.5' : 'left-0.5'}`} />
        </button>
    </div>
);
