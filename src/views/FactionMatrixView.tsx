import React, { useState, useMemo } from 'react';
import {
    Swords, Shield, Handshake, Minus, Plus, Trash2,
    Info, ChevronDown, ChevronRight
} from 'lucide-react';
import { WorldData, WorldEntity, FactionRelation } from '../types';
import { useWorldStore } from '../store/useWorldStore';
import { useTheme } from '../theme';

interface Props {
    world: WorldData;
    onNavigate: (id: string) => void;
}

const FACTION_TYPES = ['political', 'religious', 'organization', 'magic', 'science', 'tech'];

function tensionLabel(t: number): string {
    if (t >= 80)  return 'Sworn Allies';
    if (t >= 40)  return 'Allied';
    if (t >= 15)  return 'Friendly';
    if (t >= -14) return 'Neutral';
    if (t >= -39) return 'Tense';
    if (t >= -79) return 'Hostile';
    return 'At War';
}

function tensionColor(t: number): string {
    if (t >= 80)  return '#fbbf24';
    if (t >= 40)  return '#22c55e';
    if (t >= 15)  return '#86efac';
    if (t >= -14) return '#94a3b8';
    if (t >= -39) return '#fb923c';
    if (t >= -79) return '#ef4444';
    return '#991b1b';
}

function tensionBg(t: number): string {
    if (t >= 80)  return 'rgba(251,191,36,0.15)';
    if (t >= 40)  return 'rgba(34,197,94,0.12)';
    if (t >= 15)  return 'rgba(134,239,172,0.10)';
    if (t >= -14) return 'rgba(148,163,184,0.08)';
    if (t >= -39) return 'rgba(251,146,60,0.12)';
    if (t >= -79) return 'rgba(239,68,68,0.12)';
    return 'rgba(153,27,27,0.20)';
}

function TensionIcon({ t }: { t: number }) {
    const size = 14;
    if (t >= 40)  return <Handshake size={size} style={{ color: tensionColor(t) }} />;
    if (t >= -14) return <Minus size={size} style={{ color: tensionColor(t) }} />;
    return <Swords size={size} style={{ color: tensionColor(t) }} />;
}

interface RelationRowProps {
    rel: FactionRelation;
    factionA: WorldEntity | undefined;
    factionB: WorldEntity | undefined;
    isRoyal: boolean;
    isWiki: boolean;
    onNavigate: (id: string) => void;
    inputCls: string;
}

const RelationRow: React.FC<RelationRowProps> = ({ rel, factionA, factionB, isRoyal, isWiki, onNavigate, inputCls }) => {
    const { upsertFactionRelation, deleteFactionRelation } = useWorldStore();
    const [expanded, setExpanded] = useState(false);
    const [confirmDel, setConfirmDel] = useState(false);

    if (!factionA || !factionB) return null;

    const color = tensionColor(rel.tension);
    const label = tensionLabel(rel.tension);
    const bg = tensionBg(rel.tension);

    return (
        <div className={`rounded-2xl transition-all overflow-hidden ${
            isRoyal ? 'border-2 border-[#c8a96e]/70 bg-[#fffcf5] text-[#2b1810] shadow-md' : isWiki ? 'border-2 border-[#d4c8af] bg-white text-[#2d2d2d] shadow-sm' : 'border border-slate-700/50 bg-slate-800/50 text-white'
        }`}>
            {/* Row Summary */}
            <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                        type="button"
                        className="font-bold text-sm truncate hover:underline max-w-[140px]"
                        onClick={e => { e.stopPropagation(); onNavigate(factionA.id); }}
                        style={{ color: factionA.documentColor || (isRoyal ? '#2b1810' : isWiki ? '#2d2d2d' : '#e2e8f0') }}
                    >
                        {factionA.name}
                    </button>
                    <TensionIcon t={rel.tension} />
                    <button
                        type="button"
                        className="font-bold text-sm truncate hover:underline max-w-[140px]"
                        onClick={e => { e.stopPropagation(); onNavigate(factionB.id); }}
                        style={{ color: factionB.documentColor || (isRoyal ? '#2b1810' : isWiki ? '#2d2d2d' : '#e2e8f0') }}
                    >
                        {factionB.name}
                    </button>
                </div>

                <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: bg, color }}
                >
                    <span>{label}</span>
                    <span className="font-mono opacity-70">({rel.tension > 0 ? '+' : ''}{rel.tension})</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {confirmDel ? (
                        <>
                            <button type="button" onClick={e => { e.stopPropagation(); deleteFactionRelation(rel.id); }} className="text-red-500 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-red-500/10 hover:bg-red-500/20">Confirm</button>
                            <button type="button" onClick={e => { e.stopPropagation(); setConfirmDel(false); }} className="opacity-40 text-[11px] px-2 py-0.5 rounded-lg hover:bg-black/10">Cancel</button>
                        </>
                    ) : (
                        <button type="button" onClick={e => { e.stopPropagation(); setConfirmDel(true); }} className="p-1.5 opacity-20 hover:opacity-70 hover:text-red-500 transition-all rounded-lg">
                            <Trash2 size={13} />
                        </button>
                    )}
                    {expanded ? <ChevronDown size={16} className="opacity-40" /> : <ChevronRight size={16} className="opacity-40" />}
                </div>
            </div>

            {/* Expanded Detail */}
            {expanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-current/10 pt-3">
                    {/* Tension Slider */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] uppercase tracking-widest font-bold opacity-60 ${isRoyal ? 'font-serif' : ''}`}>
                                Tension Score
                            </span>
                            <span className="text-[11px] font-mono font-bold" style={{ color }}>
                                {rel.tension > 0 ? '+' : ''}{rel.tension} — {label}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] opacity-50 w-16 text-left">⚔️ War</span>
                            <input
                                type="range"
                                min="-100"
                                max="100"
                                value={rel.tension}
                                onChange={e => upsertFactionRelation({
                                    factionAId: rel.factionAId,
                                    factionBId: rel.factionBId,
                                    tension: Number(e.target.value),
                                    notes: rel.notes
                                })}
                                className="flex-1 accent-current"
                                style={{ accentColor: color }}
                            />
                            <span className="text-[10px] opacity-50 w-16 text-right">🤝 Allies</span>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold opacity-60 block mb-1 ${isRoyal ? 'font-serif' : ''}`}>
                            Relationship Notes
                        </span>
                        <input
                            type="text"
                            value={rel.notes}
                            onChange={e => upsertFactionRelation({
                                factionAId: rel.factionAId,
                                factionBId: rel.factionBId,
                                tension: rel.tension,
                                notes: e.target.value
                            })}
                            placeholder="e.g. 'Trade pact since Year 312, broken by the Siege of Morn...'"
                            className={`w-full text-sm px-3 py-2 rounded-xl border outline-none ${inputCls}`}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export const FactionMatrixView: React.FC<Props> = ({ world, onNavigate }) => {
    const { themeId, layoutMode } = useTheme();
    const isRoyal = themeId === 'royal-codex';
    const isWiki = layoutMode === 'wiki';

    const { upsertFactionRelation } = useWorldStore();
    const [newA, setNewA] = useState('');
    const [newB, setNewB] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');

    const factions = useMemo(() =>
        world.entities.filter(e => FACTION_TYPES.includes(e.type))
            .sort((a, b) => a.name.localeCompare(b.name)),
        [world.entities]
    );

    const relations = world.factionRelations || [];

    const getRelation = (aId: string, bId: string) =>
        relations.find(r =>
            (r.factionAId === aId && r.factionBId === bId) ||
            (r.factionAId === bId && r.factionBId === aId)
        );

    const handleAddRelation = () => {
        if (!newA || !newB || newA === newB) return;
        upsertFactionRelation({ factionAId: newA, factionBId: newB, tension: 0, notes: '' });
        setNewA('');
        setNewB('');
    };

    const headerText = isRoyal ? 'text-[#2b1810] font-serif' : isWiki ? 'text-[#2d2d2d]' : 'text-white';
    const subText = isRoyal ? 'text-[#5c2a12]' : isWiki ? 'text-[#854d0e]' : 'text-slate-400';
    const cardBg = isRoyal ? 'bg-[#fffdfa] border-2 border-[#c8a96e]/60 shadow-md' : isWiki ? 'bg-white border-2 border-[#d4c8af] shadow-sm' : 'bg-slate-800/60 border-slate-700/60 shadow-md';
    const inputCls = isRoyal
        ? 'border-2 border-[#c8a96e]/70 bg-[#fffcf5] text-[#2b1810] placeholder-[#2b1810]/40 focus:border-[#70121e] shadow-inner font-medium'
        : isWiki
            ? 'border-2 border-[#d4c8af] bg-white text-[#2d2d2d] placeholder-[#2d2d2d]/40 focus:border-[#b91c1c]'
            : 'border-slate-600 bg-slate-900/80 text-white placeholder-white/30 focus:border-blue-500';
    const accentBtn = isRoyal
        ? 'bg-[#70121e] text-[#fff8e7] border-2 border-[#c8a96e] hover:bg-[#881337] shadow-sm'
        : isWiki
            ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]'
            : 'bg-blue-600 text-white hover:bg-blue-700';

    return (
        <div className="max-w-5xl mx-auto w-full space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className={`text-3xl font-serif font-black uppercase tracking-tight ${headerText}`}>
                        Balance of Power
                    </h1>
                    <p className={`text-xs mt-1 opacity-70 ${subText}`}>
                        Faction influence, alliances, and tension — from sworn allies (+100) to total war (−100)
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'list' ? accentBtn : 'opacity-50 hover:opacity-100'}`}
                    >
                        List
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('matrix')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'matrix' ? accentBtn : 'opacity-50 hover:opacity-100'}`}
                    >
                        Heat Map
                    </button>
                </div>
            </div>

            {/* Add Relation */}
            <div className={`flex items-center gap-3 p-4 rounded-2xl border ${cardBg}`}>
                <span className={`text-[10px] uppercase tracking-widest font-bold opacity-60 shrink-0 ${isRoyal ? 'font-serif' : ''}`}>New Relation</span>
                <select
                    value={newA}
                    onChange={e => setNewA(e.target.value)}
                    className={`flex-1 text-sm px-3 py-2 rounded-xl border outline-none ${inputCls}`}
                >
                    <option value="">Select faction A...</option>
                    {factions.map(f => <option key={f.id} value={f.id}>{f.name} ({f.type})</option>)}
                </select>
                <span className="opacity-40 shrink-0 font-bold">↔</span>
                <select
                    value={newB}
                    onChange={e => setNewB(e.target.value)}
                    className={`flex-1 text-sm px-3 py-2 rounded-xl border outline-none ${inputCls}`}
                >
                    <option value="">Select faction B...</option>
                    {factions.filter(f => f.id !== newA).map(f => <option key={f.id} value={f.id}>{f.name} ({f.type})</option>)}
                </select>
                <button
                    type="button"
                    onClick={handleAddRelation}
                    disabled={!newA || !newB || newA === newB}
                    className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 disabled:cursor-not-allowed disabled:bg-[#3a2215]/10 disabled:text-[#2b1810]/30 disabled:border-[#c8a96e]/30 disabled:shadow-none ${accentBtn}`}
                >
                    <Plus size={14} />
                </button>
            </div>

            {factions.length < 2 && (
                <div className={`p-6 rounded-2xl border border-dashed text-center ${isRoyal ? 'border-[#c8a96e]/30 text-[#5c2a12]' : isWiki ? 'border-[#d4c8af] text-[#854d0e]' : 'border-slate-700 text-slate-500'}`}>
                    <Info size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-bold opacity-50">Need at least 2 factions in your Codex</p>
                    <p className="text-xs opacity-30 mt-1">Add Political Groups, Organizations, Religious Groups, or Magic/Science factions to get started</p>
                </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'list' && relations.length > 0 && (
                <div className="space-y-2">
                    {relations.map(rel => (
                        <RelationRow
                            key={rel.id}
                            rel={rel}
                            factionA={world.entities.find(e => e.id === rel.factionAId)}
                            factionB={world.entities.find(e => e.id === rel.factionBId)}
                            isRoyal={isRoyal}
                            isWiki={isWiki}
                            onNavigate={onNavigate}
                            inputCls={inputCls}
                        />
                    ))}
                </div>
            )}

            {viewMode === 'list' && relations.length === 0 && factions.length >= 2 && (
                <div className={`p-10 rounded-2xl border border-dashed text-center ${isRoyal ? 'border-[#c8a96e]/30 text-[#5c2a12]' : isWiki ? 'border-[#d4c8af] text-[#854d0e]' : 'border-slate-700 text-slate-500'}`}>
                    <Swords size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-bold opacity-50">No faction relations defined yet</p>
                    <p className="text-xs opacity-30 mt-1">Select two factions above to define their relationship</p>
                </div>
            )}

            {/* HEAT MAP MATRIX */}
            {viewMode === 'matrix' && factions.length >= 2 && (
                <div className={`rounded-2xl border p-4 overflow-auto ${isRoyal ? 'bg-[#f7f0e1] border-[#c8a96e]/40' : isWiki ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700/40'}`}>
                    <table className="border-collapse text-xs" style={{ minWidth: `${factions.length * 90 + 140}px` }}>
                        <thead>
                            <tr>
                                <th className="p-2 text-left opacity-40 font-bold text-[10px] uppercase tracking-wider w-36">Faction</th>
                                {factions.map(f => (
                                    <th key={f.id} className="p-1 text-center" style={{ width: 90 }}>
                                        <button
                                            type="button"
                                            onClick={() => onNavigate(f.id)}
                                            className="font-bold text-[10px] uppercase tracking-tight truncate max-w-[80px] block mx-auto hover:underline opacity-80"
                                        >
                                            {f.name.length > 10 ? f.name.slice(0, 10) + '…' : f.name}
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {factions.map(rowFaction => (
                                <tr key={rowFaction.id}>
                                    <td className="p-2 font-bold text-[11px] truncate max-w-[140px]">
                                        <button
                                            type="button"
                                            onClick={() => onNavigate(rowFaction.id)}
                                            className="hover:underline opacity-80"
                                        >
                                            {rowFaction.name}
                                        </button>
                                    </td>
                                    {factions.map(colFaction => {
                                        if (rowFaction.id === colFaction.id) {
                                            return (
                                                <td key={colFaction.id} className="p-1 text-center">
                                                    <div className="w-16 h-9 mx-auto rounded-lg flex items-center justify-center opacity-20" style={{ backgroundColor: 'currentColor' }}>
                                                        <span className="text-[9px] font-bold">—</span>
                                                    </div>
                                                </td>
                                            );
                                        }

                                        const rel = getRelation(rowFaction.id, colFaction.id);
                                        const t = rel?.tension ?? null;
                                        const color = t !== null ? tensionColor(t) : '#94a3b8';
                                        const bg = t !== null ? tensionBg(t) : 'rgba(148,163,184,0.04)';
                                        const label = t !== null ? tensionLabel(t) : 'Unknown';

                                        return (
                                            <td key={colFaction.id} className="p-1 text-center">
                                                <div
                                                    className="w-16 h-9 mx-auto rounded-lg flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform border border-current/10"
                                                    style={{ backgroundColor: bg, borderColor: color + '30' }}
                                                    title={`${rowFaction.name} ↔ ${colFaction.name}: ${label}${t !== null ? ` (${t > 0 ? '+' : ''}${t})` : ''}`}
                                                    onClick={() => {
                                                        if (!rel) {
                                                            upsertFactionRelation({ factionAId: rowFaction.id, factionBId: colFaction.id, tension: 0, notes: '' });
                                                        }
                                                    }}
                                                >
                                                    {t !== null ? (
                                                        <>
                                                            <TensionIcon t={t} />
                                                            <span className="font-mono font-bold text-[9px] mt-0.5" style={{ color }}>
                                                                {t > 0 ? '+' : ''}{t}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[9px] opacity-30 font-bold">+</span>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 flex-wrap">
                        {[
                            { label: 'At War', t: -100 },
                            { label: 'Hostile', t: -60 },
                            { label: 'Tense', t: -25 },
                            { label: 'Neutral', t: 0 },
                            { label: 'Friendly', t: 25 },
                            { label: 'Allied', t: 60 },
                            { label: 'Sworn Allies', t: 100 },
                        ].map(({ label, t }) => (
                            <div key={label} className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: tensionColor(t) }} />
                                <span className="text-[10px] opacity-60">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
