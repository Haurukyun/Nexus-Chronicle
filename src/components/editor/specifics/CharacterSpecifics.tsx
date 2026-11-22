import React, { useMemo } from 'react';
import { Character, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle, FantasyDatePicker } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { TraitListEditor } from '../TraitListEditor';
import { useTheme } from '../../../theme';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { Info, Zap, Heart, Swords, Scroll, Plus, Trash2, Sliders, BookOpen, X, Sparkles } from 'lucide-react';
import { useWorldStore } from '../../../store/useWorldStore';
import { isModuleActive } from '../../../utils/realmConfig';
import { mergeSuggestions } from '../../../utils/suggestionUtils';

interface Props {
    entity: Character;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Character>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
}

export const CharacterSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew }) => {
    const { layoutMode, themeId } = useTheme();
    const isWiki = layoutMode === 'wiki';
    const isRoyal = themeId === 'royal-codex';

    const calendar = useWorldStore(state => state.world.timelineCalendar);
    const customPresets = useWorldStore(state => state.world.customCalendarPresets);
    const world = useWorldStore(state => state.world);
    const showCombatStats = isModuleActive(world, 'combatStats');
    const customSuggestions = world.customSuggestions || {};

    const textareaClass = isRoyal
        ? 'w-full bg-[#fbf8ef] border border-[#c8a96e]/60 rounded-xl px-4 py-3 outline-none resize-none text-sm shadow-inner text-[#2b1810] font-serif focus:ring-1 focus:ring-[#70121e]'
        : isWiki
            ? 'w-full bg-white border border-[#d4c8af] rounded-xl px-4 py-3 outline-none resize-none text-sm shadow-sm'
            : 'w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-3 outline-none resize-none text-sm shadow-sm';

    const labelClass = `text-[10px] uppercase tracking-widest pl-1 mb-1 block ${
        isRoyal ? 'text-[#451a03] font-serif font-bold' : isWiki ? 'text-[#854d0e] font-black' : 'text-slate-500 font-black'
    }`;

    const effectiveParentIds = useMemo(() => {
        const set = new Set<string>(entity.parentsOfCharacter || []);
        if (entity.parentId && allEntities.some(e => e.id === entity.parentId && e.type === 'character')) {
            set.add(entity.parentId);
        }
        (entity.parentIds || []).forEach((id: string) => set.add(id));
        set.delete(entity.id);
        return Array.from(set);
    }, [entity.parentsOfCharacter, entity.parentId, entity.parentIds, entity.id, allEntities]);

    const effectiveChildIds = useMemo(() => {
        const set = new Set<string>(entity.childOfCharacter || []);
        allEntities.forEach(e => {
            if (e.type === 'character' && e.parentId === entity.id) {
                set.add(e.id);
            }
        });
        (entity.childrenIds || []).forEach((id: string) => set.add(id));
        set.delete(entity.id);
        return Array.from(set);
    }, [entity.childOfCharacter, entity.childrenIds, entity.id, allEntities]);

    return (
        <>
            <EditorGroup id="section-basic-info" title="Basic information" icon={Info}>
                <div className="col-span-12">
                    <label className={labelClass}>Titles</label>
                    <textarea className={`${textareaClass} h-20`} value={entity.titles || ""} onChange={e => onUpdate({ ...entity, titles: e.target.value })} />
                </div>

                <FormInput label="Sex" value={entity.sex || ""} options={['Male', 'Female', 'Non-binary', 'Fluid', 'Other']} onChange={(v: string) => onUpdate({ ...entity, sex: v })} gridSpan={3} />
                <FormInput label="Age" value={entity.age || ""} onChange={(v: string) => onUpdate({ ...entity, age: v })} gridSpan={3} />
                <FormInput label="Height" value={entity.height || ""} onChange={(v: string) => onUpdate({ ...entity, height: v })} gridSpan={3} />
                <FormInput label="Weight" value={entity.weight || ""} onChange={(v: string) => onUpdate({ ...entity, weight: v })} gridSpan={3} />

                {/* ── CHARACTER LIFECYCLE DATE COMPOSER ── */}
                <FantasyDatePicker
                    startDate={entity.birthDate || ""}
                    endDate={entity.deathDate || ""}
                    startLabel="Birth Date"
                    endLabel="Death Date"
                    onChangeStartDate={(v: string) => onUpdate({ ...entity, birthDate: v, dateOfBirth: v })}
                    onChangeEndDate={(v: string) => onUpdate({ ...entity, deathDate: v, dateOfDeath: v })}
                    activeCalendar={calendar ?? undefined}
                    customPresets={customPresets ?? undefined}
                />

                <SmartSelect label="Species/Races" ids={entity.pairedRace || []} type="species" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedRace: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Occupation/Class" ids={entity.pairedProfession || []} type="occupation" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedProfession: ids })} onCreate={onCreateNew} gridSpan={6} />

                <FormInput label="Ethnicity" value={entity.ethnicity || ""} onChange={(v: string) => onUpdate({ ...entity, ethnicity: v })} gridSpan={6} />
                <FormInput label="Combat rating" value={entity.powerLevel || ""} options={['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']} onChange={(v: string) => onUpdate({ ...entity, powerLevel: v })} gridSpan={6} />

                <SmartSelect label="Place of residence" ids={entity.pairedCurrentLocationNew || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedCurrentLocationNew: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Place of origin" ids={entity.pairedOriginLocationNew || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedOriginLocationNew: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Place of demise" ids={entity.pairedDemiseLocationNew || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedDemiseLocationNew: ids })} onCreate={onCreateNew} gridSpan={4} />

                <SmartSelect label="Affected by Boons" ids={entity.pairedConditionsPositive || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConditionsPositive: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Affected by Afflictions" ids={entity.pairedConditionsNegative || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConditionsNegative: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Affected by Other conditions" ids={entity.pairedConditionsOther || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConditionsOther: ids })} onCreate={onCreateNew} gridSpan={4} />

                {/* Legacy String fields from FAv1 */}
                <div className={`col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl border border-dashed mt-4 ${isRoyal ? 'border-[#c8a96e]/30 bg-[#fbf8ef]' : isWiki ? 'border-[#d4c8af]/50 bg-white/60' : 'border-slate-500/20 bg-black/5'}`}>
                    <h4 className={`col-span-full text-[8px] font-black uppercase tracking-widest mb-2 opacity-50 ${isRoyal ? 'text-[#451a03] font-serif' : 'text-slate-500'}`}>Legacy Data Migration (FAv1)</h4>
                    <FormInput label="Skills" value={entity.skills || ""} onChange={(v: string) => onUpdate({ ...entity, skills: v })} />
                    <FormInput label="Residence" value={entity.pairedCurrentLocation || ""} onChange={(v: string) => onUpdate({ ...entity, pairedCurrentLocation: v })} />
                    <FormInput label="Origin" value={entity.pairedOriginLocation || ""} onChange={(v: string) => onUpdate({ ...entity, pairedOriginLocation: v })} />
                    <FormInput label="Demise" value={entity.pairedDemiseLocation || ""} onChange={(v: string) => onUpdate({ ...entity, pairedDemiseLocation: v })} />
                </div>
            </EditorGroup>

            <EditorGroup id="section-characteristics" title="Characteristics & Knowledge" icon={Zap}>
                {/* Traits & Characteristics List with Notes & Suggestions */}
                <TraitListEditor
                    label="Traits & Characteristics"
                    value={entity.personalityTraits || ''}
                    onChange={v => onUpdate({ ...entity, personalityTraits: v })}
                    suggestions={mergeSuggestions(['Honest', 'Stubborn', 'Cunning', 'Compassionate', 'Brave', 'Cynical', 'Charming', 'Loyal', 'Impulsive', 'Calculating', 'Pragmatic', 'Zealous', 'Stoic', 'Melancholic', 'Eccentric'], customSuggestions['character'])}
                    placeholder="Add trait (e.g. Brave, Cynical)..."
                    gridSpan={6}
                />

                {/* Unique / Unusual Features List with Notes & Suggestions */}
                <TraitListEditor
                    label="Unique / Unusual Features"
                    value={entity.traits || ''}
                    onChange={v => onUpdate({ ...entity, traits: v })}
                    suggestions={mergeSuggestions(['Heterochromia', 'Scar across eye', 'Mechanical prosthetic', 'Tattooed arcane runes', 'Silver hair', 'Pointed ears', 'Missing finger', 'Faint glowing aura', 'Burn marks', 'Golden irises', 'Intricate brand mark', 'Cybernetic ocular implant'], customSuggestions['character'])}
                    placeholder="Add feature (e.g. Scar across eye, Pointed ears)..."
                    gridSpan={6}
                />

                {/* Flexible Stat Block Engine (Standard D20 / Custom Stats & Meters / None) */}
                {showCombatStats && (() => {
                    const mode = entity.statBlockMode || 'rpg-d20';
                    const customList = entity.customStats || [];
                    const statSuggestions = mergeSuggestions(['Health (HP)', 'Mana (MP)', 'Sanity', 'Cyberware', 'Resolve', 'Street Cred', 'Humanity', 'Stress', 'Armor', 'Luck', 'Morale', 'Ammo'], customSuggestions['character']);

                    return (
                        <div className={`col-span-12 p-3 sm:p-4 rounded-2xl border space-y-3 ${isRoyal ? 'border-[#c8a96e]/40 bg-[#fbf8ef]' : isWiki ? 'border-[#d4c8af]/40 bg-white/60' : 'border-slate-500/10 bg-black/5'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                                <div>
                                    <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isRoyal ? 'text-[#451a03] font-serif' : isWiki ? 'text-[#854d0e]' : 'text-slate-400'}`}>
                                        <Swords size={12} /> Character Attributes & Stat Block
                                    </span>
                                    <span className="text-[9px] font-mono opacity-50 block sm:inline">
                                        {mode === 'rpg-d20' ? 'Standard D20 Ability Array' : mode === 'custom' ? 'Custom Author-Defined Gauges & Ratings' : 'Narrative Only (Stats Suppressed)'}
                                    </span>
                                </div>

                                {/* 3-Way Mode Pills */}
                                <div className="inline-flex items-center p-0.5 rounded-lg bg-black/10 border border-current/10 shrink-0 gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => onUpdate({ ...entity, statBlockMode: 'rpg-d20' })}
                                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                                            mode === 'rpg-d20'
                                                ? isRoyal
                                                    ? 'bg-[#70121e] text-[#fff8e7] shadow-sm'
                                                    : 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                                                : 'opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <Swords size={10} /> D20 Array
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onUpdate({ ...entity, statBlockMode: 'custom' })}
                                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                                            mode === 'custom'
                                                ? isRoyal
                                                    ? 'bg-[#70121e] text-[#fff8e7] shadow-sm'
                                                    : 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                                                : 'opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <Sliders size={10} /> Custom Stats
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onUpdate({ ...entity, statBlockMode: 'none' })}
                                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                                            mode === 'none'
                                                ? isRoyal
                                                    ? 'bg-[#70121e] text-[#fff8e7] shadow-sm'
                                                    : 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                                                : 'opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <BookOpen size={10} /> None
                                    </button>
                                </div>
                            </div>

                            {/* Mode 1: Standard D20 */}
                            {mode === 'rpg-d20' && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                                    {[
                                        { key: 'strength', abbr: 'STR', full: 'Strength' },
                                        { key: 'dexterity', abbr: 'DEX', full: 'Dexterity' },
                                        { key: 'constitution', abbr: 'CON', full: 'Constitution' },
                                        { key: 'intelligence', abbr: 'INT', full: 'Intelligence' },
                                        { key: 'wisdom', abbr: 'WIS', full: 'Wisdom' },
                                        { key: 'charisma', abbr: 'CHA', full: 'Charisma' },
                                    ].map(stat => {
                                        const val = (entity.stats as any)?.[stat.key] || '';
                                        const num = parseInt(val, 10);
                                        const mod = !isNaN(num) ? Math.floor((num - 10) / 2) : null;
                                        const modStr = mod !== null ? (mod >= 0 ? `+${mod}` : `${mod}`) : null;

                                        return (
                                            <div
                                                key={stat.key}
                                                className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                                                    isRoyal
                                                        ? 'bg-[#f7f0e1] border-[#c8a96e]/50 text-[#2b1810]'
                                                        : isWiki
                                                        ? 'bg-[#fbf8ef] border-[#d4c8af] text-[#1a1a1a]'
                                                        : 'bg-slate-800/60 border-slate-700 text-slate-100'
                                                }`}
                                            >
                                                <div className="flex items-center gap-1 mb-1">
                                                    <span className="font-mono font-black text-xs">{stat.abbr}</span>
                                                    <span className="text-[9px] opacity-60 font-sans tracking-tight">({stat.full})</span>
                                                </div>

                                                <input
                                                    type="text"
                                                    value={val}
                                                    placeholder="10"
                                                    onChange={e => onUpdate({
                                                        ...entity,
                                                        stats: { ...(entity.stats || { strength: '10', dexterity: '10', constitution: '10', intelligence: '10', wisdom: '10', charisma: '10' }), [stat.key]: e.target.value }
                                                    })}
                                                    className={`w-full text-center font-mono font-bold text-sm py-1 px-1.5 rounded-lg border outline-none transition-all ${
                                                        isRoyal
                                                            ? 'bg-[#fbf8ef] border-[#c8a96e]/60 focus:border-[#70121e] text-[#2b1810]'
                                                            : isWiki
                                                            ? 'bg-white border-[#d4c8af] focus:border-[#b91c1c] text-black'
                                                            : 'bg-slate-900 border-slate-700 focus:border-amber-400 text-white'
                                                    }`}
                                                />

                                                {modStr !== null && (
                                                    <span className={`mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                                                        isRoyal ? 'bg-[#70121e]/15 text-[#70121e]' : 'bg-amber-400/20 text-amber-500'
                                                    }`}>
                                                        {modStr}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Mode 2: Custom Stats & Meters */}
                            {mode === 'custom' && (
                                <div className="space-y-3">
                                    {/* Quick Preset Chips */}
                                    <div className="flex flex-wrap items-center gap-1">
                                        <span className="text-[9px] font-mono opacity-60 uppercase mr-1">Suggestions:</span>
                                        {statSuggestions.map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => {
                                                    const exists = customList.some(item => item.label.toLowerCase() === s.toLowerCase());
                                                    if (!exists) {
                                                        const newStat = { id: `stat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label: s, value: '10', max: s.includes('HP') || s.includes('MP') || s.includes('Sanity') || s.includes('Stress') ? '100' : '' };
                                                        onUpdate({ ...entity, customStats: [...customList, newStat] });
                                                    }
                                                }}
                                                className="text-[9px] px-2 py-0.5 rounded-md border border-current/15 hover:border-amber-400/60 bg-current/5 hover:bg-current/10 transition-all cursor-pointer font-serif"
                                            >
                                                + {s}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Stat Rows */}
                                    {customList.length === 0 ? (
                                        <div className="p-4 rounded-xl border border-dashed border-current/20 text-center opacity-60 text-xs font-serif italic">
                                            No custom stats added yet. Click a suggestion above or the button below to define stats (e.g. Sanity, Cyberware, HP, Resolve).
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {customList.map((st, idx) => (
                                                <div
                                                    key={st.id || idx}
                                                    className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 transition-all ${
                                                        isRoyal
                                                            ? 'bg-[#f7f0e1] border-[#c8a96e]/50 text-[#2b1810]'
                                                            : isWiki
                                                            ? 'bg-[#fbf8ef] border-[#d4c8af] text-[#1a1a1a]'
                                                            : 'bg-slate-800/60 border-slate-700 text-slate-100'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-1">
                                                        <input
                                                            type="text"
                                                            value={st.label}
                                                            placeholder="Stat name..."
                                                            onChange={e => {
                                                                const updated = [...customList];
                                                                updated[idx] = { ...st, label: e.target.value };
                                                                onUpdate({ ...entity, customStats: updated });
                                                            }}
                                                            className="text-xs font-black uppercase tracking-wider bg-transparent border-b border-current/20 focus:border-amber-400 outline-none flex-1 truncate py-0.5"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = customList.filter((_, i) => i !== idx);
                                                                onUpdate({ ...entity, customStats: updated });
                                                            }}
                                                            className="opacity-40 hover:opacity-100 hover:text-rose-500 p-0.5 cursor-pointer transition-colors"
                                                            title="Delete stat"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <div className="flex-1">
                                                            <span className="text-[8px] font-mono opacity-50 block uppercase">Value</span>
                                                            <input
                                                                type="text"
                                                                value={st.value}
                                                                placeholder="10"
                                                                onChange={e => {
                                                                    const updated = [...customList];
                                                                    updated[idx] = { ...st, value: e.target.value };
                                                                    onUpdate({ ...entity, customStats: updated });
                                                                }}
                                                                className={`w-full text-center font-mono font-bold text-xs py-1 px-1 rounded-lg border outline-none ${
                                                                    isRoyal
                                                                        ? 'bg-[#fbf8ef] border-[#c8a96e]/60 focus:border-[#70121e] text-[#2b1810]'
                                                                        : isWiki
                                                                        ? 'bg-white border-[#d4c8af] focus:border-[#b91c1c] text-black'
                                                                        : 'bg-slate-900 border-slate-700 focus:border-amber-400 text-white'
                                                                }`}
                                                            />
                                                        </div>
                                                        <span className="text-xs opacity-40 font-mono mt-3">/</span>
                                                        <div className="flex-1">
                                                            <span className="text-[8px] font-mono opacity-50 block uppercase">Max (opt)</span>
                                                            <input
                                                                type="text"
                                                                value={st.max || ''}
                                                                placeholder="—"
                                                                onChange={e => {
                                                                    const updated = [...customList];
                                                                    updated[idx] = { ...st, max: e.target.value };
                                                                    onUpdate({ ...entity, customStats: updated });
                                                                }}
                                                                className={`w-full text-center font-mono font-bold text-xs py-1 px-1 rounded-lg border outline-none ${
                                                                    isRoyal
                                                                        ? 'bg-[#fbf8ef] border-[#c8a96e]/60 focus:border-[#70121e] text-[#2b1810]'
                                                                        : isWiki
                                                                        ? 'bg-white border-[#d4c8af] focus:border-[#b91c1c] text-black'
                                                                        : 'bg-slate-900 border-slate-700 focus:border-amber-400 text-white'
                                                                }`}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newStat = { id: `stat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label: `Stat ${customList.length + 1}`, value: '10' };
                                            onUpdate({ ...entity, customStats: [...customList, newStat] });
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-current/20 hover:border-amber-400/60 bg-current/5 hover:bg-current/10 text-[10px] font-bold uppercase transition-all cursor-pointer"
                                    >
                                        <Plus size={11} /> Add Custom Stat
                                    </button>
                                </div>
                            )}

                            {/* Mode 3: None (Story Only) */}
                            {mode === 'none' && (
                                <div className="p-3 rounded-xl border border-current/10 bg-current/5 text-center text-xs opacity-75 font-serif italic">
                                    Stat block disabled for this character (Narrative / Pure Story mode). No attribute badges, scores, or combat ratings will appear in Codex view.
                                </div>
                            )}
                        </div>
                    );
                })()}

                <FormInput label="Equipment" value={entity.possessedItems || ""} onChange={(v: string) => onUpdate({ ...entity, possessedItems: v })} gridSpan={4} />
                <FormInput label="Wealth" value={entity.possessedCurrencies || ""} onChange={(v: string) => onUpdate({ ...entity, possessedCurrencies: v })} gridSpan={4} />
                <FormInput label="Legacy Skills" value={entity.knownSkills || ""} onChange={(v: string) => onUpdate({ ...entity, knownSkills: v })} gridSpan={4} />

                <FormInput label="Spells" value={entity.knownSpells || ""} onChange={(v: string) => onUpdate({ ...entity, knownSpells: v })} gridSpan={4} />
                <FormInput label="Languages" value={entity.knownLanguage || ""} onChange={(v: string) => onUpdate({ ...entity, knownLanguage: v })} gridSpan={4} />
                <FormInput label="Teachings" value={entity.knownMagic || ""} onChange={(v: string) => onUpdate({ ...entity, knownMagic: v })} gridSpan={4} />

                <SmartSelect label="Connected Items" ids={entity.pairedConnectedItems || []} type="item" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedItems: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Resources" ids={entity.pairedResources || []} type="resource" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedResources: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Linked Skills" ids={entity.pairedSkills || []} type="ability" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedSkills: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Linked Languages" ids={entity.pairedLanguage || []} type="language" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedLanguage: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Schools of Magic / Teachings" ids={entity.pairedMagic || []} type="magic" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedMagic: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Sciences & Technologies" ids={entity.pairedTech || []} type="science" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedTech: ids })} onCreate={onCreateNew} gridSpan={6} />
            </EditorGroup>

            <EditorGroup id="section-relationships" title="Relationships" icon={Heart}>
                <SmartSelect 
                    label="Parents" 
                    ids={effectiveParentIds} 
                    type="character" 
                    all={allEntities} 
                    excludeIds={[entity.id]}
                    onChange={(ids) => {
                        const removedParent = (entity.parentsOfCharacter || []).find(p => !ids.includes(p));
                        onUpdate({ 
                            ...entity, 
                            parentsOfCharacter: ids,
                            parentId: removedParent && entity.parentId === removedParent ? null : entity.parentId,
                            parentIds: ids
                        });
                    }} 
                    onCreate={onCreateNew} 
                    gridSpan={4} 
                    fieldKey="parentsOfCharacter" 
                    relationalNotes={entity.relationalNotes} 
                    onRelationalNotesChange={(notes) => onUpdate({ ...entity, relationalNotes: notes })} 
                />
                <SmartSelect 
                    label="Children" 
                    ids={effectiveChildIds} 
                    type="character" 
                    all={allEntities} 
                    excludeIds={[entity.id]}
                    onChange={(ids) => onUpdate({ ...entity, childOfCharacter: ids, childrenIds: ids })} 
                    onCreate={onCreateNew} 
                    gridSpan={4} 
                    fieldKey="childOfCharacter" 
                    relationalNotes={entity.relationalNotes} 
                    onRelationalNotesChange={(notes) => onUpdate({ ...entity, relationalNotes: notes })} 
                />
                <SmartSelect 
                    label="Relatives" 
                    ids={entity.relativesOfCharacter || []} 
                    type="character" 
                    all={allEntities} 
                    excludeIds={[entity.id]}
                    onChange={(ids) => onUpdate({ ...entity, relativesOfCharacter: ids, relativeIds: ids })} 
                    onCreate={onCreateNew} 
                    gridSpan={4} 
                    fieldKey="relativesOfCharacter" 
                    relationalNotes={entity.relationalNotes} 
                    onRelationalNotesChange={(notes) => onUpdate({ ...entity, relationalNotes: notes })} 
                />
                <SmartSelect 
                    label="Friends" 
                    ids={entity.allyResCharacter || []} 
                    type="character" 
                    all={allEntities} 
                    excludeIds={[entity.id]}
                    onChange={(ids) => onUpdate({ ...entity, allyResCharacter: ids, friendIds: ids })} 
                    onCreate={onCreateNew} 
                    gridSpan={4} 
                    fieldKey="allyResCharacter" 
                    relationalNotes={entity.relationalNotes} 
                    onRelationalNotesChange={(notes) => onUpdate({ ...entity, relationalNotes: notes })} 
                />
                <SmartSelect 
                    label="Enemies" 
                    ids={entity.enemydResCharacter || []} 
                    type="character" 
                    all={allEntities} 
                    excludeIds={[entity.id]}
                    onChange={(ids) => onUpdate({ ...entity, enemydResCharacter: ids, enemyIds: ids })} 
                    onCreate={onCreateNew} 
                    gridSpan={4} 
                    fieldKey="enemydResCharacter" 
                    relationalNotes={entity.relationalNotes} 
                    onRelationalNotesChange={(notes) => onUpdate({ ...entity, relationalNotes: notes })} 
                />
                <SmartSelect 
                    label="Complicated" 
                    ids={entity.complicatedResCharacter || []} 
                    type="character" 
                    all={allEntities} 
                    excludeIds={[entity.id]}
                    onChange={(ids) => onUpdate({ ...entity, complicatedResCharacter: ids, complicatedWithIds: ids })} 
                    onCreate={onCreateNew} 
                    gridSpan={4} 
                    fieldKey="complicatedResCharacter" 
                    relationalNotes={entity.relationalNotes} 
                    onRelationalNotesChange={(notes) => onUpdate({ ...entity, relationalNotes: notes })} 
                />
            </EditorGroup>

            <EditorGroup id="section-groups" title="Groups & Affiliations" icon={Swords}>
                <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <GroupRoleGroup label="Political groups" roleKey="political" entity={{...entity, groupConnections: { political: { leadingFigureOf: entity.leadingPoliticalLeaders || [], connectedTo: entity.pairedConnectionPolGroup || [], memberOf: entity.pairedBelongingPolGroup || [], allyOf: entity.pairedAllyPolGroup || [], enemyOf: entity.pairedEnemyPolGroup || []} }} as any} allEntities={allEntities}
                        onUpdate={(updatedData: any) => {
                            const pol = updatedData.groupConnections.political;
                            onUpdate({ ...entity, leadingPoliticalLeaders: pol.leadingFigureOf, pairedConnectionPolGroup: pol.connectedTo, pairedBelongingPolGroup: pol.memberOf, pairedAllyPolGroup: pol.allyOf, pairedEnemyPolGroup: pol.enemyOf });
                        }} onCreateNew={onCreateNew} />
                    <GroupRoleGroup label="Organizations" roleKey="organization" entity={{...entity, groupConnections: { organization: { leadingFigureOf: entity.leadingOtherLeaders || [], connectedTo: entity.pairedConnectionOtherGroups || [], memberOf: entity.pairedBelongingOtherGroups || [], allyOf: entity.pairedAllyOtherGroups || [], enemyOf: entity.pairedEnemyOtherGroups || []} }} as any} allEntities={allEntities}
                        onUpdate={(updatedData: any) => {
                            const org = updatedData.groupConnections.organization;
                            onUpdate({ ...entity, leadingOtherLeaders: org.leadingFigureOf, pairedConnectionOtherGroups: org.connectedTo, pairedBelongingOtherGroups: org.memberOf, pairedAllyOtherGroups: org.allyOf, pairedEnemyOtherGroups: org.enemyOf });
                        }} onCreateNew={onCreateNew} />
                    <GroupRoleGroup label="Religious groups" roleKey="religious" entity={{...entity, groupConnections: { religious: { leadingFigureOf: entity.leadingReligiousLeaders || [], connectedTo: entity.pairedConnectionRelGroup || [], memberOf: entity.pairedBelongingRelGroup || [], allyOf: entity.pairedAllyRelGroup || [], enemyOf: entity.pairedEnemyRelGroup || []} }} as any} allEntities={allEntities}
                        onUpdate={(updatedData: any) => {
                            const rel = updatedData.groupConnections.religious;
                            onUpdate({ ...entity, leadingReligiousLeaders: rel.leadingFigureOf, pairedConnectionRelGroup: rel.connectedTo, pairedBelongingRelGroup: rel.memberOf, pairedAllyRelGroup: rel.allyOf, pairedEnemyRelGroup: rel.enemyOf });
                        }} onCreateNew={onCreateNew} />
                    <GroupRoleGroup label="Magical groups & Circles" roleKey="magic" entity={{...entity, groupConnections: { magic: { leadingFigureOf: entity.leadingMagicalLeaders || [], connectedTo: entity.pairedConnectionMagicGroup || [], memberOf: entity.pairedBelongingMagicGroup || [], allyOf: entity.pairedAllyMagicGroup || [], enemyOf: entity.pairedEnemyMagicGroup || []} }} as any} allEntities={allEntities}
                        onUpdate={(updatedData: any) => {
                            const mag = updatedData.groupConnections.magic;
                            onUpdate({ ...entity, leadingMagicalLeaders: mag.leadingFigureOf, pairedConnectionMagicGroup: mag.connectedTo, pairedBelongingMagicGroup: mag.memberOf, pairedAllyMagicGroup: mag.allyOf, pairedEnemyMagicGroup: mag.enemyOf });
                        }} onCreateNew={onCreateNew} />
                    <GroupRoleGroup label="Sciences & Academies" roleKey="science" entity={{...entity, groupConnections: { science: { leadingFigureOf: entity.leadingTechLeaders || [], connectedTo: entity.pairedConnectionTechGroup || [], memberOf: entity.pairedBelongingTechGroup || [], allyOf: entity.pairedAllyTechGroup || [], enemyOf: entity.pairedEnemyTechGroup || []} }} as any} allEntities={allEntities}
                        onUpdate={(updatedData: any) => {
                            const sci = updatedData.groupConnections.science;
                            onUpdate({ ...entity, leadingTechLeaders: sci.leadingFigureOf, pairedConnectionTechGroup: sci.connectedTo, pairedBelongingTechGroup: sci.memberOf, pairedAllyTechGroup: sci.allyOf, pairedEnemyTechGroup: sci.enemyOf });
                        }} onCreateNew={onCreateNew} />
                </div>
            </EditorGroup>

            <EditorGroup id="section-cultural" title="Cultural Context" icon={Scroll}>
                <SmartSelect label="Events" ids={entity.pairedEvent || []} type="event" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedEvent: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Cultures" ids={entity.relatedCultures || []} type="culture" all={allEntities} onChange={(ids) => onUpdate({ ...entity, relatedCultures: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Myths" ids={entity.pairedConnectedMyths || []} type="myth" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMyths: ids })} onCreate={onCreateNew} gridSpan={4} />
            </EditorGroup>
        </>
    );
};
