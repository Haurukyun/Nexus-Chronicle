import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { SmartSelectProps } from '../../types';

export const SmartSelect: React.FC<SmartSelectProps> = ({ label, ids = [], type, all, onChange, onCreate, isWikiMode, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const filtered = all.filter((e: any) => e.type === type && e.name.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleId = (id: string) => {
        if (ids.includes(id)) onChange(ids.filter((i: string) => i !== id));
        else onChange([...ids, id]);
    };

    const bgInput = isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700';
    const tagClass = isWikiMode ? 'bg-[#b91c1c]/10 text-[#b91c1c] border-[#b91c1c]/30' : 'bg-[#fef08a]/10 text-[#fef08a] border-[#fef08a]/30';

    return (
        <div className="space-y-1 relative" ref={dropdownRef}>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full \${bgInput} border rounded-lg p-2 text-xs flex flex-wrap gap-1 cursor-pointer min-h-[38px] transition-colors \${disabled ? 'opacity-50 cursor-default' : ''}`}
            >
                {ids.length === 0 && <span className="text-slate-400">Add connection...</span>}
                {ids.map((id: string) => (
                    <span key={id} className={`\${tagClass} px-2 py-0.5 rounded border flex items-center gap-1 group/tag`}>
                        {all.find((e: any) => e.id === id)?.name || 'Unknown'}
                        {!disabled && <X size={10} className="hover:text-black cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleId(id); }} />}
                    </span>
                ))}
            </div>
            {isOpen && !disabled && (
                <div className={`absolute top-full left-0 w-full mt-1 \${isWikiMode ? 'bg-[#f5e6d3] border-[#d4c8af]' : 'bg-slate-900 border-slate-700'} border rounded-lg shadow-2xl z-[100] overflow-hidden`}>
                    <div className="p-2 border-b border-slate-800/10">
                        <input autoFocus placeholder="Filter..." className={`w-full \${isWikiMode ? 'bg-white' : 'bg-slate-800'} rounded px-2 py-1 text-xs focus:ring-0 outline-none`}
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filtered.length === 0 && search && (
                            <button onClick={() => {
                                const newId = onCreate(type, search, false);
                                if (newId) {
                                    toggleId(newId);
                                    setIsOpen(false);
                                    setSearch("");
                                }
                            }}
                                className={`w-full text-left px-3 py-2 text-xs \${isWikiMode ? 'text-[#b91c1c] hover:bg-black/5' : 'text-[#fef08a] hover:bg-slate-800'} flex items-center gap-2 font-bold`}>
                                <Plus size={12} /> Create "{search}"
                            </button>
                        )}
                        {filtered.map((o: any) => (
                            <button key={o.id} onClick={() => toggleId(o.id)}
                                className={`w-full text-left px-3 py-2 text-xs flex justify-between items-center transition-colors \${ids.includes(o.id) ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-[#fef08a] text-black font-bold') : (isWikiMode ? 'text-slate-700 hover:bg-black/5' : 'text-slate-500 hover:bg-slate-800')}`}>
                                {o.name} {ids.includes(o.id) && <Check size={12} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
