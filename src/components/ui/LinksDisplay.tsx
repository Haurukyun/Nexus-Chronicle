import React from 'react';
import { LinksDisplayProps } from '../../types';
import { useTheme } from '../../theme';
import { getRelationalNote } from '../../utils/relationalNotesUtils';

export const LinksDisplay = ({
    label,
    ids,
    all,
    onNav,
    wikiStyle = 'tag',
    fieldKey,
    relationalNotes,
    allRelationalNotes,
}: LinksDisplayProps) => {
    const { themeId, layoutMode } = useTheme();
    const isWikiMode = layoutMode === 'wiki';
    const isRoyal = themeId === 'royal-codex';

    if (!ids || ids.length === 0) return null;

    const notesSource = relationalNotes || allRelationalNotes;

    if ((isWikiMode || isRoyal) && wikiStyle === 'inline') {
        return (
            <div className="text-sm leading-tight my-1">
                <span className={`font-bold ${isRoyal ? 'text-[#451a03]' : 'text-[#7a200d]'}`}>{label}</span>{' '}
                <span className={isRoyal ? 'text-[#2b1810]' : 'text-[#2d2d2d]'}>
                    {ids.map((id: string, idx: number) => {
                        const ent = all.find((e: any) => e.id === id);
                        if (!ent) return null;
                        const note = getRelationalNote(notesSource, fieldKey || 'general', id);

                        return (
                            <React.Fragment key={id}>
                                <button onClick={() => onNav(id)} className={`${isRoyal ? 'text-[#70121e] font-bold' : 'text-[#7a200d]'} hover:underline transition-all`}>
                                    {ent.name}
                                </button>
                                {note && (
                                    <span className={`text-xs italic font-serif opacity-80 ${isRoyal ? 'text-[#5c2a12]' : 'text-[#854d0e]'}`}>
                                        {' '}({note})
                                    </span>
                                )}
                                {idx < ids.length - 1 ? ', ' : ''}
                            </React.Fragment>
                        );
                    })}
                </span>
            </div>
        );
    }

    let labelStyle = 'text-slate-500';
    let btnStyle = 'border-slate-700 bg-slate-800/60 text-[#fef08a] hover:bg-[#fef08a] hover:text-slate-950';

    if (isRoyal) {
        labelStyle = 'text-[#451a03] font-serif font-bold';
        btnStyle = 'border-[#c8a96e]/60 bg-[#ede2cc] text-[#70121e] font-bold hover:bg-[#70121e] hover:text-[#fff8e7] shadow-sm';
    } else if (isWikiMode) {
        labelStyle = 'text-[#854d0e]';
        btnStyle = 'border-[#d4c8af] bg-white text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white';
    }

    return (
        <div className="py-3 border-b border-current/10 last:border-0 flex flex-col gap-2">
            <span className={`text-[10px] uppercase tracking-widest ${labelStyle}`}>{label}</span>
            <div className="flex flex-wrap gap-2.5">
                {ids.map((id: string) => {
                    const ent = all.find((e: any) => e.id === id);
                    if (!ent) return null;
                    const note = getRelationalNote(notesSource, fieldKey || 'general', id);

                    return (
                        <div key={id} className="inline-flex items-center gap-1.5 flex-wrap">
                            <button onClick={() => onNav(id)} className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${btnStyle}`}>
                                {ent.name}
                            </button>
                            {note && (
                                <span
                                    title={note}
                                    className={`text-[11px] italic px-2 py-0.5 rounded-md border flex items-center gap-1 max-w-xs truncate ${
                                        isRoyal
                                            ? 'bg-[#ede2cc]/80 border-[#c8a96e]/50 text-[#5c2a12] font-serif'
                                            : isWikiMode
                                            ? 'bg-amber-100/70 border-amber-300 text-amber-950'
                                            : 'bg-slate-900/90 border-slate-700/80 text-amber-300'
                                    }`}
                                >
                                    <span className="opacity-50">—</span>
                                    <span className="truncate">{note}</span>
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
