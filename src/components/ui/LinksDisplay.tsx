import React from 'react';
import { LinksDisplayProps } from '../../types';

export const LinksDisplay = ({ label, ids, all, onNav, isWikiMode, wikiStyle = 'tag' }: LinksDisplayProps) => {
    if (!ids || ids.length === 0) return null;

    if (isWikiMode && wikiStyle === 'inline') {
        return (
            <div className="text-sm leading-tight my-1">
                <span className="font-bold text-[#7a200d]">{label}</span>{' '}
                <span className="text-[#2d2d2d]">
                    {ids.map((id: string, idx: number) => {
                        const ent = all.find((e: any) => e.id === id);
                        if (!ent) return null;
                        return (
                            <React.Fragment key={id}>
                                <button onClick={() => onNav(id)} className="text-[#7a200d] hover:underline transition-all">
                                    {ent.name}
                                </button>
                                {idx < ids.length - 1 ? ', ' : ''}
                            </React.Fragment>
                        );
                    })}
                </span>
            </div>
        );
    }

    return (
        <div className="py-3 border-b border-slate-500/10 last:border-0 flex flex-col gap-2">
            <span className={`text-[9px] font-black uppercase tracking-widest ${isWikiMode ? 'text-[#854d0e]' : 'text-slate-500'}`}>{label}</span>
            <div className="flex flex-wrap gap-2">
                {ids.map((id: string) => {
                    const ent = all.find((e: any) => e.id === id);
                    if (!ent) return null;
                    return (
                        <button key={id} onClick={() => onNav(id)} className={`px-2 py-0.5 text-xs rounded border transition-all ${isWikiMode ? 'border-[#d4c8af] bg-white text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white' : 'border-slate-700 bg-slate-800/60 text-[#fef08a] hover:bg-[#fef08a] hover:text-slate-950'}`}>
                            {ent.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
