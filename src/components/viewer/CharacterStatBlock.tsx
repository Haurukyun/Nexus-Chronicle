import React from 'react';
import { TaperedDivider, WikiStatRow, LinksDisplay, RadarChart, EmeraldGem } from '../ui';
import { Character, WorldEntity } from '../../types';
import { CategorizedBacklinks } from '../../utils/backlinkUtils';
import { useWorldStore } from '../../store/useWorldStore';

interface CharacterStatBlockProps {
    entity: WorldEntity;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    hideName?: boolean;
    backlinks?: CategorizedBacklinks;
}

export const CharacterStatBlock = ({ entity, allEntities, onNavigate, hideName = false, backlinks }: CharacterStatBlockProps) => {
    if (entity.type !== 'character') return null;
    const char = entity as Character;
    const theme = useWorldStore(state => state.theme);
    const isRoyal = theme === 'royal-codex';
    const isWikiMode = theme === 'wiki'; 

    const speciesNames = (char.pairedRace || char.speciesIds || []).map(id => allEntities.find((e: any) => e.id === id)?.name).filter(Boolean).join(', ');
    const occupationNames = (char.pairedProfession || char.occupationIds || []).map(id => allEntities.find((e: any) => e.id === id)?.name).filter(Boolean).join(', ');

    const isDeceased = Boolean(char.deathDate?.trim() || char.dateOfDeath?.trim() || char.deadSwitch || (char as any).isDead);

    const subtitle = [
        char.sex,
        char.ethnicity,
        speciesNames,
        occupationNames,
        isDeceased ? 'deceased' : 'living'
    ].filter(Boolean).join(' ');

    const merge = (forward: string[] | undefined, back: string[] | undefined) => {
        return [...new Set([...(forward || []), ...(back || [])])];
    };

    if (isRoyal) {
        const stats = (char.stats || {}) as any;
        const str = stats.strength || '10';
        const dex = stats.dexterity || '10';
        const con = stats.constitution || '10';
        const int = stats.intelligence || '18';
        const wis = stats.wisdom || '16';
        const cha = stats.charisma || '15';

        return (
            <div 
                className="bg-gradient-to-b from-[#4a0d1b] via-[#300611] to-[#1b0207] border-4 border-[#c8a96e] rounded-t-2xl shadow-2xl p-5 pb-10 text-[#fff8e7] font-sans relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 24px), 50% 100%, 0 calc(100% - 24px))' }}
            >
                {/* Inner Decorative Gold Filigree Border */}
                <div className="absolute inset-1 border border-[#c8a96e]/30 pointer-events-none rounded-t-xl" />

                {/* Banner Header */}
                <div className="text-center border-b border-[#c8a96e]/40 pb-3 mb-3">
                    <span className="text-[11px] font-serif font-bold uppercase tracking-[0.25em] text-[#e6c687] block drop-shadow">RPG Stat Chart</span>
                </div>

                {/* Radar Chart */}
                <div className="py-1 flex items-center justify-center">
                    <RadarChart stats={stats} isWikiMode={false} />
                </div>

                {/* Attribute Score Header */}
                <div className="border-t border-[#c8a96e]/40 pt-3 mt-2">
                    <div className="text-[10px] font-serif font-bold uppercase tracking-[0.25em] text-[#e6c687] text-center mb-3">Attribute Score</div>

                    {/* 6 Shield / Octagonal Badges in 2 Rows of 3 */}
                    <div className="grid grid-cols-3 gap-2.5 text-center px-2">
                        {[
                            { label: 'INT', val: int },
                            { label: 'WIS', val: wis },
                            { label: 'CHA', val: cha },
                            { label: 'INT', val: int },
                            { label: 'WIS', val: wis },
                            { label: 'CHA', val: '17' }
                        ].map((st, idx) => (
                            <div 
                                key={idx} 
                                className="bg-gradient-to-b from-[#4a1c1c] to-[#260e0e] border border-[#d4c8af] py-2 px-1 text-center shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)] transition-all cursor-default relative h-16 flex flex-col justify-center"
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)' }}
                            >
                                <div className="absolute inset-[2px] border border-[#d4c8af]/40 pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)' }} />
                                <span className="block font-serif font-bold text-[#e6c687] text-[10px] tracking-wider uppercase leading-none mb-1 z-10">{st.label}</span>
                                <span className="text-xl font-serif font-medium text-white leading-none drop-shadow z-10">{st.val}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Living Status Header & Glowing Emerald Gem */}
                <div className="border-t border-[#c8a96e]/40 pt-3 mt-4 text-center">
                    <div className="text-[10px] font-serif font-bold uppercase tracking-[0.25em] text-[#e6c687]">{isDeceased ? 'DECEASED' : 'LIVING'}</div>
                    <EmeraldGem active={!isDeceased} />
                </div>
            </div>
        );
    }


    const stats = (char.stats || {}) as any;
    const getMod = (valStr: string | undefined) => {
        const val = parseInt(valStr || '10', 10) || 10;
        const mod = Math.floor((val - 10) / 2);
        return mod >= 0 ? `+${mod}` : `${mod}`;
    };

    const attributes = [
        { label: 'STR', val: stats.strength || '10' },
        { label: 'DEX', val: stats.dexterity || '10' },
        { label: 'CON', val: stats.constitution || '10' },
        { label: 'INT', val: stats.intelligence || '10' },
        { label: 'WIS', val: stats.wisdom || '10' },
        { label: 'CHA', val: stats.charisma || '10' },
    ];

    if (isWikiMode) {
        return (
            <div className="bg-[#fefce8] border-2 border-[#d4c8af] rounded shadow-md overflow-hidden font-sans space-y-0 text-[#1a1a1a]">
                {/* Wiki Header */}
                <div className="bg-[#fef9c3] p-2.5 text-center border-b-2 border-[#d4c8af] flex items-center justify-between">
                    <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#854d0e]">
                        Combat & Attributes
                    </h3>
                    <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                            isDeceased
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                    >
                        {isDeceased ? 'Deceased' : 'Living'}
                    </span>
                </div>

                {char.powerLevel && (
                    <div className="px-3 py-1.5 bg-[#fdfcf0] border-b border-[#d4c8af] flex justify-between items-center text-[11px]">
                        <span className="font-bold text-[#854d0e] uppercase text-[10px]">Combat Rating</span>
                        <span className="font-mono font-bold text-[#7a200d]">{char.powerLevel}</span>
                    </div>
                )}

                {/* Radar Chart */}
                <div className="py-2 flex items-center justify-center bg-[#fdfcf0]/70 border-b border-[#d4c8af]">
                    <RadarChart stats={stats} isWikiMode={true} />
                </div>

                {/* Attributes Grid */}
                <div className="p-3 bg-white/70">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-[#854d0e] text-center mb-2">
                        Attribute Scores
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                        {attributes.map((st) => (
                            <div
                                key={st.label}
                                className="bg-[#fefce8] border border-[#d4c8af] rounded p-1.5 flex flex-col items-center justify-center"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a200d] leading-none">
                                    {st.label}
                                </span>
                                <span className="text-base font-serif font-bold text-[#1a1a1a] my-1 leading-none">
                                    {st.val}
                                </span>
                                <span className="text-[10px] font-mono font-semibold text-[#854d0e] leading-none">
                                    {getMod(st.val)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills / Languages minimal summary if present */}
                {((char.pairedSkills && char.pairedSkills.length > 0) || (char.pairedLanguage && char.pairedLanguage.length > 0)) && (
                    <div className="p-3 border-t border-[#d4c8af] bg-[#fdfcf0]/60 space-y-2 text-xs">
                        {char.pairedSkills && char.pairedSkills.length > 0 && (
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#854d0e] block mb-1">Skills</span>
                                <div className="flex flex-wrap gap-1">
                                    {char.pairedSkills.map(id => {
                                        const ent = allEntities.find(e => e.id === id);
                                        if (!ent) return null;
                                        return (
                                            <button
                                                key={id}
                                                onClick={() => onNavigate(id)}
                                                className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#d4c8af] text-[#7a200d] hover:bg-[#fef9c3] transition-colors"
                                            >
                                                {ent.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        {char.pairedLanguage && char.pairedLanguage.length > 0 && (
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#854d0e] block mb-1">Languages</span>
                                <div className="flex flex-wrap gap-1">
                                    {char.pairedLanguage.map(id => {
                                        const ent = allEntities.find(e => e.id === id);
                                        if (!ent) return null;
                                        return (
                                            <button
                                                key={id}
                                                onClick={() => onNavigate(id)}
                                                className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#d4c8af] text-[#7a200d] hover:bg-[#fef9c3] transition-colors"
                                            >
                                                {ent.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Sovereign (Dark Theme)
    return (
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-[2rem] p-6 shadow-2xl space-y-5 text-slate-200">
            {/* Header / Vitals row */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#fef08a]">
                    Combat Specs
                </span>
                <div className="flex items-center gap-2">
                    {char.powerLevel && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                            CR {char.powerLevel}
                        </span>
                    )}
                    <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isDeceased
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                    >
                        <span
                            className={`w-1.5 h-1.5 rounded-full ${
                                isDeceased
                                    ? 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                                    : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                            }`}
                        />
                        {isDeceased ? 'Deceased' : 'Living'}
                    </span>
                </div>
            </div>

            {/* Radar Chart */}
            <div className="py-1 flex items-center justify-center relative">
                <RadarChart stats={stats} isWikiMode={false} />
            </div>

            {/* Core Attributes Grid */}
            <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400 text-center mb-2.5">
                    Core Attributes
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                    {attributes.map((st) => (
                        <div
                            key={st.label}
                            className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex flex-col items-center justify-center hover:border-slate-700/80 transition-all"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                                {st.label}
                            </span>
                            <span className="text-xl font-bold font-mono text-white my-1 leading-none">
                                {st.val}
                            </span>
                            <span className="text-[10px] font-mono font-medium text-[#fef08a]/80 leading-none">
                                {getMod(st.val)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills / Languages minimal summary if present */}
            {((char.pairedSkills && char.pairedSkills.length > 0) || (char.pairedLanguage && char.pairedLanguage.length > 0)) && (
                <div className="border-t border-slate-800/80 pt-3 space-y-2">
                    {char.pairedSkills && char.pairedSkills.length > 0 && (
                        <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Skills</span>
                            <div className="flex flex-wrap gap-1">
                                {char.pairedSkills.map(id => {
                                    const ent = allEntities.find(e => e.id === id);
                                    if (!ent) return null;
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => onNavigate(id)}
                                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:border-[#fef08a]/40 transition-colors"
                                        >
                                            {ent.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {char.pairedLanguage && char.pairedLanguage.length > 0 && (
                        <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Languages</span>
                            <div className="flex flex-wrap gap-1">
                                {char.pairedLanguage.map(id => {
                                    const ent = allEntities.find(e => e.id === id);
                                    if (!ent) return null;
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => onNavigate(id)}
                                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:border-[#fef08a]/40 transition-colors"
                                        >
                                            {ent.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

