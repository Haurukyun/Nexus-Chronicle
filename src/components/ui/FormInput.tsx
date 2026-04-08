import React, { useState, useEffect, useRef } from 'react';
import { FormInputProps } from '../../types';

export const FormInput = ({ label, value, onChange, placeholder, type = "text", isWikiMode, disabled, options }: FormInputProps & { options?: string[], disabled?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-1 relative" ref={dropdownRef}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>
            <input
                type={type}
                disabled={disabled}
                className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-lg px-3 py-2 text-sm outline-none transition-all focus:ring-1 ${isWikiMode ? 'focus:ring-red-500' : 'focus:ring-yellow-500'} disabled:opacity-50`}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
            />
            {options && isOpen && (
                <div className={`absolute top-full left-0 w-full mt-1 ${isWikiMode ? 'bg-[#f5e6d3] border-[#d4c8af]' : 'bg-slate-900 border-slate-700'} border rounded-lg shadow-2xl z-[100] overflow-hidden`}>
                    <div className="max-h-40 overflow-y-auto">
                        {options.map((opt: string) => (
                            <button
                                key={opt}
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-xs transition-colors ${isWikiMode ? 'text-slate-700 hover:bg-black/5' : 'text-slate-400 hover:bg-slate-800'}`}
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
