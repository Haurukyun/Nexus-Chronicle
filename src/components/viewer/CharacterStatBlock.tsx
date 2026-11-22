import React, { useState } from 'react';
import { Users, Maximize2, Printer } from 'lucide-react';
import { TaperedDivider, WikiStatRow, LinksDisplay, RadarChart, EmeraldGem, VectorFiligreeCorner } from '../ui';
import { NexusImage } from '../ui/NexusImage';
import { ExpandedImageModal } from '../ui/ExpandedImageModal';
import { Character, WorldEntity } from '../../types';
import { CategorizedBacklinks } from '../../utils/backlinkUtils';
import { generateCharacterSheetHtml, generateRelationSheetHtml, openPrintableDocument } from '../../utils/characterSheetUtils';
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
    if (char.statBlockMode === 'none') return null;
    const theme = useWorldStore(state => state.theme);
    const isRoyal = theme === 'royal-codex';
    const isWikiMode = theme === 'wiki';
    const [expandedImg, setExpandedImg] = useState<string | null>(null);

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
            <>
                <div 
                    className="bg-gradient-to-b from-[#4a0d1b] via-[#300611] to-[#1b0207] rounded-t-2xl shadow-2xl p-5 pb-10 text-[#fff8e7] font-sans relative overflow-hidden"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 24px), 50% 100%, 0 calc(100% - 24px))' }}
                >
                    {/* Full 5-sided Pennant Vector Contour (Dual Gold Filigree Borders) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polygon
                            points="2,2 98,2 98,96.5 50,99.2 2,96.5"
                            fill="none"
                            stroke="#c8a96e"
                            strokeWidth="4"
                            vectorEffect="non-scaling-stroke"
                        />
                        <polygon
                            points="5,5 95,5 95,95 50,97.5 5,95"
                            fill="none"
                            stroke="#c8a96e"
                            strokeOpacity="0.3"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>

                    {/* Royal Portrait Frame */}
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-[#c8a96e] bg-[#24050b] shadow-2xl mb-4 group">
                        {char.imageUri ? (
                            <NexusImage
                                src={char.imageUri}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                containerClassName="w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#3a0b15] to-[#1c0208] text-[#c8a96e]/40 p-4 text-center">
                                <Users size={56} className="mb-2 opacity-50" />
                                <span className="text-[10px] uppercase font-serif tracking-widest text-[#c8a96e]/60">Royal Record</span>
                            </div>
                        )}
                        {/* Filigree Corner Accents */}
                        <VectorFiligreeCorner position="top-left"     size={16} color="#c8a96e" className="absolute top-1.5 left-1.5"     />
                        <VectorFiligreeCorner position="top-right"    size={16} color="#c8a96e" className="absolute top-1.5 right-1.5"    />
                        <VectorFiligreeCorner position="bottom-left"  size={16} color="#c8a96e" className="absolute bottom-1.5 left-1.5"  />
                        <VectorFiligreeCorner position="bottom-right" size={16} color="#c8a96e" className="absolute bottom-1.5 right-1.5" />

                        {char.imageUri && (
                            <button
                                type="button"
                                onClick={() => setExpandedImg(char.imageUri!)}
                                className="absolute bottom-2.5 right-2.5 bg-black/60 hover:bg-[#70121e] text-[#fef08a] p-1.5 rounded-lg border border-[#c8a96e]/50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-md"
                                title="Inspect Royal Portrait"
                            >
                                <Maximize2 size={13} />
                            </button>
                        )}
                    </div>

                    {/* Banner Header */}
                    <div className="text-center border-b border-[#c8a96e]/40 pb-3 mb-3">
                        <span className="text-[11px] font-serif font-bold uppercase tracking-[0.25em] text-[#e6c687] block drop-shadow">
                            {char.statBlockMode === 'custom' ? 'Character Vitals & Ratings' : 'RPG Stat Chart'}
                        </span>
                    </div>

                    {char.statBlockMode === 'custom' ? (
                        <div className="space-y-2.5 px-1 py-1">
                            {(char.customStats && char.customStats.length > 0) ? (
                                char.customStats.map(st => {
                                    const numVal = parseFloat(st.value);
                                    const numMax = st.max ? parseFloat(st.max) : null;
                                    const percent = (numMax && !isNaN(numVal) && !isNaN(numMax) && numMax > 0)
                                        ? Math.min(100, Math.max(0, (numVal / numMax) * 100))
                                        : null;

                                    return (
                                        <div key={st.id} className="bg-black/35 p-2.5 rounded-xl border border-[#c8a96e]/30 space-y-1.5 shadow-inner">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-serif font-bold text-[#e6c687] uppercase tracking-wider">{st.label}</span>
                                                <span className="font-mono font-bold text-white">
                                                    {st.value} {st.max ? <span className="opacity-60 text-[10px]">/ {st.max}</span> : ''}
                                                </span>
                                            </div>
                                            {percent !== null && (
                                                <div className="w-full h-2 rounded-full bg-black/60 border border-[#c8a96e]/30 overflow-hidden p-0.5">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-[#c8a96e] to-[#fef08a] transition-all duration-500 shadow-[0_0_8px_rgba(254,240,138,0.5)]"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-3 text-center text-xs opacity-60 font-serif italic">
                                    No custom stats configured for this character.
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Radar Chart */}
                            <div className="py-1 flex items-center justify-center">
                                <RadarChart stats={stats} />
                            </div>

                            {/* Attribute Score Header */}
                            <div className="border-t border-[#c8a96e]/40 pt-3 mt-2">
                                <div className="text-[10px] font-serif font-bold uppercase tracking-[0.25em] text-[#e6c687] text-center mb-3">Attribute Score</div>

                                {/* 6 Shield Badges in 2 Rows of 3 */}
                                <div className="grid grid-cols-3 gap-2.5 text-center px-2">
                                    {[
                                        { label: 'STR', val: str },
                                        { label: 'DEX', val: dex },
                                        { label: 'CON', val: con },
                                        { label: 'INT', val: int },
                                        { label: 'WIS', val: wis },
                                        { label: 'CHA', val: cha }
                                    ].map((st, idx) => (
                                        <div 
                                            key={idx} 
                                            className="bg-gradient-to-b from-[#4a1c1c] to-[#260e0e] py-2 px-1 text-center shadow-[inset_0_2px_5px_rgba(0,0,0,0.9)] transition-all cursor-default relative h-16 flex flex-col justify-center"
                                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)' }}
                                        >
                                            {/* Full 5-sided shield contour SVG with outer & inner gold border */}
                                            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                <polygon
                                                    points="1.5,1.5 98.5,1.5 98.5,74.5 50,98 1.5,74.5"
                                                    fill="none"
                                                    stroke="#d4c8af"
                                                    strokeWidth="1.5"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                                <polygon
                                                    points="4,4 96,4 96,72.5 50,94.5 4,72.5"
                                                    fill="none"
                                                    stroke="#d4c8af"
                                                    strokeOpacity="0.4"
                                                    strokeWidth="1"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                            </svg>
                                            <span className="block font-serif font-bold text-[#e6c687] text-[10px] tracking-wider uppercase leading-none mb-1 z-10">{st.label}</span>
                                            <span className="text-xl font-serif font-medium text-white leading-none drop-shadow z-10">{st.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Living Status Header & Glowing Emerald Gem */}
                    <div className="border-t border-[#c8a96e]/40 pt-3 mt-4 text-center">
                        <div className="text-[10px] font-serif font-bold uppercase tracking-[0.25em] text-[#e6c687]">{isDeceased ? 'DECEASED' : 'LIVING'}</div>
                        <EmeraldGem active={!isDeceased} />
                    </div>

                    {/* Print Character Sheet Action */}
                    <div className="mt-4 pt-3 border-t border-[#c8a96e]/30 flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const html = generateCharacterSheetHtml(char, allEntities, { includeDmNotes: true, theme });
                                openPrintableDocument(html, `${char.name.toLowerCase().replace(/\s+/g, '-')}-sheet`);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c8a96e]/60 bg-[#70121e]/80 hover:bg-[#70121e] text-[#fff8e7] text-[10px] font-serif font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-[1.02]"
                            title="Print Character Sheet or Export as PDF"
                        >
                            <Printer size={12} className="text-[#fef08a]" />
                            <span>Print Character Sheet</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const html = generateRelationSheetHtml(char, allEntities, { theme });
                                openPrintableDocument(html, `${char.name.toLowerCase().replace(/\s+/g, '-')}-relations`);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c8a96e]/60 bg-[#4a1c1c]/90 hover:bg-[#70121e] text-[#fff8e7] text-[10px] font-serif font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-[1.02]"
                            title="Print Relationship Web or Export as PDF"
                        >
                            <Users size={12} className="text-[#e6c687]" />
                            <span>Print Relation Sheet</span>
                        </button>
                    </div>
                </div>

                {expandedImg && (
                    <ExpandedImageModal
                        imageUri={expandedImg}
                        entityName={char.name}
                        onClose={() => setExpandedImg(null)}
                        theme="royal-codex"
                    />
                )}
            </>
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
            <>
            <div className="bg-[#fefce8] border-2 border-[#d4c8af] rounded shadow-md overflow-hidden font-sans space-y-0 text-[#1a1a1a]">
                {/* Portrait Part (Living Entry) */}
                <div className={`w-full aspect-square ${char.imageUri ? 'bg-black/10' : 'bg-[#ccc5a8] grayscale contrast-75'} flex items-center justify-center border-b border-[#d4c8af] overflow-hidden relative group`}>
                    {char.imageUri ? (
                        <NexusImage src={char.imageUri} className="w-full h-full object-cover" containerClassName="w-full h-full" />
                    ) : (
                        <Users size={120} className="text-[#a89d7d]" />
                    )}
                    {char.imageUri && (
                        <button
                            onClick={() => setExpandedImg(char.imageUri!)}
                            className="absolute bottom-2 right-2 bg-black/20 p-1 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 cursor-pointer"
                            title="View full image"
                        >
                            <Maximize2 size={14} className="text-white/80" />
                        </button>
                    )}
                </div>

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

                {char.statBlockMode === 'custom' ? (
                    <div className="p-3 bg-white/70 space-y-2 border-b border-[#d4c8af]">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-[#854d0e] text-center mb-1">
                            Character Vitals
                        </div>
                        {(char.customStats && char.customStats.length > 0) ? (
                            char.customStats.map(st => {
                                const numVal = parseFloat(st.value);
                                const numMax = st.max ? parseFloat(st.max) : null;
                                const percent = (numMax && !isNaN(numVal) && !isNaN(numMax) && numMax > 0)
                                    ? Math.min(100, Math.max(0, (numVal / numMax) * 100))
                                    : null;
                                return (
                                    <div key={st.id} className="p-2 bg-[#fdfcf0] border border-[#d4c8af] rounded text-xs space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-[#7a200d] uppercase text-[10px]">{st.label}</span>
                                            <span className="font-mono font-bold text-[#1a1a1a]">
                                                {st.value} {st.max ? <span className="opacity-60 text-[10px]">/ {st.max}</span> : ''}
                                            </span>
                                        </div>
                                        {percent !== null && (
                                            <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
                                                <div className="h-full bg-[#8b0000]" style={{ width: `${percent}%` }} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-xs opacity-50 italic">No custom stats defined.</div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Radar Chart */}
                        <div className="py-2 flex items-center justify-center bg-[#fdfcf0]/70 border-b border-[#d4c8af]">
                            <RadarChart stats={stats} />
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
                    </>
                )}

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
                {/* Print Action */}
                <div className="p-2.5 bg-[#fef9c3]/40 border-t border-[#d4c8af] flex flex-wrap justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            const html = generateCharacterSheetHtml(char, allEntities, { includeDmNotes: true, theme });
                            openPrintableDocument(html, `${char.name.toLowerCase().replace(/\s+/g, '-')}-sheet`);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#d4c8af] bg-white text-[#7a200d] hover:bg-[#fef9c3] transition-all cursor-pointer shadow-xs"
                        title="Print Character Sheet or Export as PDF"
                    >
                        <Printer size={12} />
                        <span>Print Character Sheet</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const html = generateRelationSheetHtml(char, allEntities, { theme });
                            openPrintableDocument(html, `${char.name.toLowerCase().replace(/\s+/g, '-')}-relations`);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#d4c8af] bg-white text-[#7a200d] hover:bg-[#fef9c3] transition-all cursor-pointer shadow-xs"
                        title="Print Relationship Web or Export as PDF"
                    >
                        <Users size={12} />
                        <span>Print Relation Sheet</span>
                    </button>
                </div>
            </div>
            {expandedImg && (
                <ExpandedImageModal
                    imageUri={expandedImg}
                    entityName={char.name}
                    onClose={() => setExpandedImg(null)}
                    theme="wiki"
                />
            )}
        </>);
    }

    // Sovereign (Dark Theme)
    return (
        <>
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-[2rem] p-6 shadow-2xl space-y-5 text-slate-200">
            {/* Portrait Frame (Living Entry) */}
            <div className={`w-full aspect-square rounded-2xl overflow-hidden border ${char.imageUri ? 'border-slate-700/60 shadow-xl' : 'border-slate-800/80 bg-slate-950/40'} flex items-center justify-center relative group`}>
                {char.imageUri ? (
                    <NexusImage src={char.imageUri} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" containerClassName="w-full h-full" />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-600">
                        <Users size={64} className="opacity-40" />
                        <span className="text-[10px] font-mono tracking-widest uppercase opacity-40">No Portrait Inscribed</span>
                    </div>
                )}
                {char.imageUri && (
                    <button
                        onClick={() => setExpandedImg(char.imageUri!)}
                        className="absolute bottom-2 right-2 bg-slate-900/60 p-1.5 rounded-lg border border-slate-600/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800/80 cursor-pointer"
                        title="View full image"
                    >
                        <Maximize2 size={14} className="text-slate-300" />
                    </button>
                )}
            </div>

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

            {char.statBlockMode === 'custom' ? (
                <div className="space-y-2.5">
                    <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400 text-center mb-2.5">
                        Character Vitals & Gauges
                    </div>
                    {(char.customStats && char.customStats.length > 0) ? (
                        char.customStats.map(st => {
                            const numVal = parseFloat(st.value);
                            const numMax = st.max ? parseFloat(st.max) : null;
                            const percent = (numMax && !isNaN(numVal) && !isNaN(numMax) && numMax > 0)
                                ? Math.min(100, Math.max(0, (numVal / numMax) * 100))
                                : null;
                            return (
                                <div key={st.id} className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1.5 shadow-inner">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">{st.label}</span>
                                        <span className="font-mono font-bold text-white">
                                            {st.value} {st.max ? <span className="opacity-50 text-[10px]">/ {st.max}</span> : ''}
                                        </span>
                                    </div>
                                    {percent !== null && (
                                        <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-0.5">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-xs text-slate-500 italic p-2">No custom stats defined.</div>
                    )}
                </div>
            ) : (
                <>
                    {/* Radar Chart */}
                    <div className="py-1 flex items-center justify-center relative">
                        <RadarChart stats={stats} />
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
                </>
            )}

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
            {/* Print Action */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap justify-center gap-2">
                <button
                    type="button"
                    onClick={() => {
                        const html = generateCharacterSheetHtml(char, allEntities, { includeDmNotes: true, theme });
                        openPrintableDocument(html, `${char.name.toLowerCase().replace(/\s+/g, '-')}-sheet`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:text-white hover:border-[#fef08a]/50 transition-all cursor-pointer shadow-xs"
                    title="Print Character Sheet or Export as PDF"
                >
                    <Printer size={12} className="text-[#fef08a]" />
                    <span>Print Character Sheet</span>
                </button>
                <button
                    type="button"
                    onClick={() => {
                        const html = generateRelationSheetHtml(char, allEntities, { theme });
                        openPrintableDocument(html, `${char.name.toLowerCase().replace(/\s+/g, '-')}-relations`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:text-white hover:border-[#fef08a]/50 transition-all cursor-pointer shadow-xs"
                    title="Print Relationship Web or Export as PDF"
                >
                    <Users size={12} className="text-[#fef08a]" />
                    <span>Print Relation Sheet</span>
                </button>
            </div>
        </div>
        {expandedImg && (
            <ExpandedImageModal
                imageUri={expandedImg}
                entityName={char.name}
                onClose={() => setExpandedImg(null)}
                theme="sovereign"
            />
        )}
    </>
    );
};

