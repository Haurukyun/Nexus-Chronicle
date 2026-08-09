import React, { useState, useEffect, useRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { FormInputProps } from '../../types';
import { useWorldStore } from '../../store/useWorldStore';

export const FormInput = ({ label, value, onChange, placeholder, type = "text", isWikiMode, disabled, options, icon: Icon, gridSpan = 12 }: FormInputProps & { options?: string[], disabled?: boolean, icon?: LucideIcon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const theme = useWorldStore(state => state.theme);
    const isRoyal = theme === 'royal-codex';
    const isWiki = theme === 'wiki' || isWikiMode;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    let inputStyle = 'bg-slate-800/40 border-slate-700 text-slate-200 focus:ring-yellow-500';
    let iconStyle = 'text-[#fef08a]/60';
    let labelStyle = 'text-slate-500';
    let dropdownStyle = 'bg-slate-900 border-slate-700';

    if (isRoyal) {
        inputStyle = 'bg-[#fbf8ef] border-[#c8a96e]/60 text-[#2b1810] focus:ring-amber-700 shadow-inner font-serif';
        iconStyle = 'text-[#70121e]';
        labelStyle = 'text-[#451a03] font-serif font-bold';
        dropdownStyle = 'bg-[#f7f0e1] border-[#c8a96e]';
    } else if (isWiki) {
        inputStyle = 'bg-white border-[#d4c8af] text-slate-800 focus:ring-red-500';
        iconStyle = 'text-[#b91c1c]/60';
        labelStyle = 'text-slate-500';
        dropdownStyle = 'bg-[#f5e6d3] border-[#d4c8af]';
    }

    return (
        <div className="space-y-1 relative" style={{ gridColumn: `span ${gridSpan}` }} ref={dropdownRef}>
            <div className="flex items-center gap-2 pl-1 mb-1">
                {Icon && <Icon size={12} className={iconStyle} />}
                <label className={`text-[10px] font-black uppercase tracking-widest ${labelStyle}`}>{label}</label>
            </div>
            <input
                type={type}
                disabled={disabled}
                className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition-all focus:ring-1 disabled:opacity-50 shadow-sm ${inputStyle}`}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
            />
            {options && isOpen && (
                <div className={`absolute top-full left-0 w-full mt-1 border rounded-lg shadow-2xl z-[100] overflow-hidden ${dropdownStyle}`}>
                    <div className="max-h-40 overflow-y-auto">
                        {options.map((opt: string) => (
                            <button
                                key={opt}
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-xs transition-colors ${isRoyal ? 'text-[#2b1810] hover:bg-[#881337] hover:text-white' : isWiki ? 'text-slate-700 hover:bg-black/5' : 'text-slate-400 hover:bg-slate-800'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

