import React, { useMemo } from 'react';
import { Character, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';
import { ViewerSectionCard } from '../ViewerSectionCard';
import { useWorldStore } from '../../../store/useWorldStore';
import { shouldHideEmptyFields, isFieldVisible, isFieldValueEmpty } from '../../../utils/fieldVisibilityUtils';
import { getActiveGenreTemplate, getGenreFieldLabel } from '../../../utils/genreTemplates';

interface Props {
    entity: Character;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    backlinks?: any;
}

export const CharacterSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, backlinks }) => {
    const theme = useWorldStore(state => state.theme);
    const isRoyal = theme === 'royal-codex';

    const renderEntityLinks = (ids: string[] | undefined, fallbackText?: string) => {
        if (!ids || ids.length === 0) {
            return <span className="text-[#3d271d] text-sm font-medium">{fallbackText || '—'}</span>;
        }
        const resolved = ids.map(id => allEntities.find((e: any) => e.id === id)).filter(Boolean);
        if (resolved.length === 0) {
            return <span className="text-[#3d271d] text-sm font-medium">{fallbackText || '—'}</span>;
        }
        return (
            <span className="inline-flex flex-wrap justify-end items-center gap-x-1.5 gap-y-0.5 text-right">
                {resolved.map((ent: any, idx: number) => (
                    <span key={ent.id} className="inline-flex items-center">
                        <button
                            type="button"
                            onClick={() => onNavigate(ent.id)}
                            className="text-[#70121e] hover:text-[#3d0a10] font-bold hover:underline transition-colors cursor-pointer text-sm"
                            title={`Navigate to ${ent.name}`}
                        >
                            {ent.name}
                        </button>
                        {idx < resolved.length - 1 && <span className="text-[#3d271d] mr-1">,</span>}
                    </span>
                ))}
            </span>
        );
    };

    const isDeceased = Boolean(entity.deathDate?.trim() || (entity as any).dateOfDeath?.trim() || entity.deadSwitch);

    const effectiveParentIds = useMemo(() => {
        const set = new Set<string>(entity.parentsOfCharacter || []);
        if (entity.parentId && allEntities.some(e => e.id === entity.parentId && e.type === 'character')) {
            set.add(entity.parentId);
        }
        (entity.parentIds || []).forEach((id: string) => set.add(id));
        if (backlinks?.parents) backlinks.parents.forEach((id: string) => set.add(id));
        set.delete(entity.id);
        return Array.from(set);
    }, [entity.parentsOfCharacter, entity.parentId, entity.parentIds, entity.id, allEntities, backlinks]);

    const effectiveChildIds = useMemo(() => {
        const set = new Set<string>(entity.childOfCharacter || []);
        allEntities.forEach(e => {
            if (e.type === 'character' && e.parentId === entity.id) {
                set.add(e.id);
            }
        });
        (entity.childrenIds || []).forEach((id: string) => set.add(id));
        if (backlinks?.children) backlinks.children.forEach((id: string) => set.add(id));
        set.delete(entity.id);
        return Array.from(set);
    }, [entity.childOfCharacter, entity.childrenIds, entity.id, allEntities, backlinks]);

    const world = useWorldStore(state => state.world);
    const hideEmpty = shouldHideEmptyFields(world, entity);
    const show = (fieldKey: string) => isFieldVisible(world, 'character', fieldKey);
    const genre = getActiveGenreTemplate(world, entity);

    return (
        <div className="space-y-6">
            <ViewerSectionCard id="section-vitals" title="Vital Records">
                {isRoyal ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-10 gap-y-3 py-1 font-serif min-w-0">
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Name:</span>
                            <span className="text-[#3d271d] text-sm font-medium">{entity.name}</span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Status:</span>
                            <span className="text-[#3d271d] text-sm font-medium">{isDeceased ? 'Deceased' : 'Living'}</span>
                        </div>
                        {show('titles') && (!hideEmpty || !isFieldValueEmpty(entity.titles)) && (
                            <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                                <span className="font-bold text-[#2b1810] text-sm">Titles:</span>
                                <span className="text-[#3d271d] text-sm font-medium">{entity.titles || '—'}</span>
                            </div>
                        )}
                        {show('species') && (!hideEmpty || !isFieldValueEmpty(entity.pairedRace)) && (
                            <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                                <span className="font-bold text-[#2b1810] text-sm">{getGenreFieldLabel(genre, 'pairedRace', 'Species')}:</span>
                                {renderEntityLinks(entity.pairedRace, (entity as any).species)}
                            </div>
                        )}
                        {show('occupation') && (!hideEmpty || !isFieldValueEmpty(entity.pairedProfession)) && (
                            <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                                <span className="font-bold text-[#2b1810] text-sm">{getGenreFieldLabel(genre, 'pairedProfession', 'Occupation')}:</span>
                                {renderEntityLinks(entity.pairedProfession, (entity as any).occupation)}
                            </div>
                        )}
                        {show('sex') && (!hideEmpty || !isFieldValueEmpty(entity.sex)) && (
                            <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                                <span className="font-bold text-[#2b1810] text-sm">Sex:</span>
                                <span className="text-[#3d271d] text-sm font-medium">{entity.sex || '—'}</span>
                            </div>
                        )}
                        {show('age') && (!hideEmpty || !isFieldValueEmpty(entity.age)) && (
                            <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                                <span className="font-bold text-[#2b1810] text-sm">Age:</span>
                                <span className="text-[#3d271d] text-sm font-medium">{entity.age || '—'}</span>
                            </div>
                        )}
                        {show('height') && (!hideEmpty || !isFieldValueEmpty(entity.height)) && (
                            <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                                <span className="font-bold text-[#2b1810] text-sm">Height:</span>
                                <span className="text-[#3d271d] text-sm font-medium">{entity.height || '—'}</span>
                            </div>
                        )}
                        {show('weight') && (!hideEmpty || !isFieldValueEmpty(entity.weight)) && (
                            <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                                <span className="font-bold text-[#2b1810] text-sm">Weight:</span>
                                <span className="text-[#3d271d] text-sm font-medium">{entity.weight || '—'}</span>
                            </div>
                        )}
                        {show('ethnicity') && (!hideEmpty || !isFieldValueEmpty(entity.ethnicity)) && (
                            <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                                <span className="font-bold text-[#2b1810] text-sm">Ethnicity:</span>
                                <span className="text-[#3d271d] text-sm font-medium">{entity.ethnicity || '—'}</span>
                            </div>
                        )}
                        {show('powerLevel') && (!hideEmpty || !isFieldValueEmpty(entity.powerLevel)) && (
                            <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                                <span className="font-bold text-[#2b1810] text-sm">{getGenreFieldLabel(genre, 'powerLevel', 'Combat Rating')}:</span>
                                <span className="text-[#70121e] font-bold text-sm">{entity.powerLevel || '—'}</span>
                            </div>
                        )}
                        {show('origin') && (!hideEmpty || !isFieldValueEmpty(entity.pairedOriginLocationNew)) && (
                            <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                                <span className="font-bold text-[#2b1810] text-sm">Origin:</span>
                                {renderEntityLinks(entity.pairedOriginLocationNew, (entity as any).placeOfOrigin)}
                            </div>
                        )}
                        {show('residence') && (!hideEmpty || !isFieldValueEmpty(entity.pairedCurrentLocationNew)) && (
                            <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                                <span className="font-bold text-[#2b1810] text-sm">Residence:</span>
                                {renderEntityLinks(entity.pairedCurrentLocationNew, (entity as any).placeOfResidence)}
                            </div>
                        )}
                        {show('birthDate') && (!hideEmpty || !isFieldValueEmpty(entity.birthDate)) && (
                            <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                                <span className="font-bold text-[#2b1810] text-sm">Birth:</span>
                                <span className="text-[#3d271d] text-sm font-medium">{entity.birthDate || '—'}</span>
                            </div>
                        )}
                        {show('demise') && isDeceased && (
                            <>
                                {(!hideEmpty || !isFieldValueEmpty(entity.deathDate || (entity as any).dateOfDeath)) && (
                                    <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                                        <span className="font-bold text-[#2b1810] text-sm">Death:</span>
                                        <span className="text-[#3d271d] text-sm font-medium">{entity.deathDate || (entity as any).dateOfDeath || '—'}</span>
                                    </div>
                                )}
                                {(!hideEmpty || !isFieldValueEmpty(entity.pairedDemiseLocationNew)) && (entity.pairedDemiseLocationNew && entity.pairedDemiseLocationNew.length > 0) && (
                                    <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                                        <span className="font-bold text-[#2b1810] text-sm">Place of Demise:</span>
                                        {renderEntityLinks(entity.pairedDemiseLocationNew)}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                        {show('titles') && (!hideEmpty || !isFieldValueEmpty(entity.titles)) && <FieldRow label="Titles" value={entity.titles} />}
                        {show('sex') && (!hideEmpty || !isFieldValueEmpty(entity.sex)) && <FieldRow label="Sex" value={entity.sex} />}
                        {show('age') && (!hideEmpty || !isFieldValueEmpty(entity.age)) && <FieldRow label="Age" value={entity.age} />}
                        {show('height') && (!hideEmpty || !isFieldValueEmpty(entity.height)) && <FieldRow label="Height" value={entity.height} />}
                        {show('weight') && (!hideEmpty || !isFieldValueEmpty(entity.weight)) && <FieldRow label="Weight" value={entity.weight} />}
                        {show('ethnicity') && (!hideEmpty || !isFieldValueEmpty(entity.ethnicity)) && <FieldRow label="Ethnicity" value={entity.ethnicity} />}
                        {show('powerLevel') && (!hideEmpty || !isFieldValueEmpty(entity.powerLevel)) && <FieldRow label={getGenreFieldLabel(genre, 'powerLevel', 'Combat Rating')} value={entity.powerLevel} />}
                        {show('birthDate') && (!hideEmpty || !isFieldValueEmpty(entity.birthDate)) && <FieldRow label="Birth" value={entity.birthDate} />}
                        {show('demise') && (!hideEmpty || !isFieldValueEmpty(entity.deathDate)) && <FieldRow label="Death" value={entity.deathDate} />}
                        <div className="col-span-full mt-2 space-y-3 border-t border-current/10 pt-3">
                            {show('species') && (!hideEmpty || !isFieldValueEmpty(entity.pairedRace)) && (
                                <LinksDisplay label={getGenreFieldLabel(genre, 'pairedRace', 'Species/Races')} ids={entity.pairedRace || []} all={allEntities} onNav={onNavigate} />
                            )}
                            {show('occupation') && (!hideEmpty || !isFieldValueEmpty(entity.pairedProfession)) && (
                                <LinksDisplay label={getGenreFieldLabel(genre, 'pairedProfession', 'Occupation/Class')} ids={entity.pairedProfession || []} all={allEntities} onNav={onNavigate} />
                            )}
                            {show('residence') && (!hideEmpty || !isFieldValueEmpty(entity.pairedCurrentLocationNew)) && (
                                <LinksDisplay label="Place of Residence" ids={entity.pairedCurrentLocationNew || []} all={allEntities} onNav={onNavigate} />
                            )}
                            {show('origin') && (!hideEmpty || !isFieldValueEmpty(entity.pairedOriginLocationNew)) && (
                                <LinksDisplay label="Place of Origin" ids={entity.pairedOriginLocationNew || []} all={allEntities} onNav={onNavigate} />
                            )}
                            {show('demise') && (!hideEmpty || !isFieldValueEmpty(entity.pairedDemiseLocationNew)) && (
                                <LinksDisplay label="Place of Demise" ids={entity.pairedDemiseLocationNew || []} all={allEntities} onNav={onNavigate} />
                            )}
                        </div>
                    </div>
                )}
            </ViewerSectionCard>


            {show('personalityTraits') && entity.personalityTraits && (!hideEmpty || !isFieldValueEmpty(entity.personalityTraits)) && (
                <ViewerSectionCard id="section-traits" title="Traits & Characteristics">
                    {(() => {
                        try {
                            const parsed = JSON.parse(entity.personalityTraits);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                return (
                                    <ul className="space-y-2">
                                        {parsed.map((item: any, idx: number) => {
                                            const name = typeof item === 'string' ? item : item.name || item.title;
                                            const note = typeof item === 'object' ? item.note : null;
                                            return (
                                                <li key={idx} className="flex items-start gap-2 text-base font-serif leading-relaxed">
                                                    <span className={`${isRoyal ? 'text-[#70121e]' : 'text-amber-500'} select-none shrink-0 font-bold`}>•</span>
                                                    <div className="flex-1">
                                                        <strong className="font-bold">{name}</strong>
                                                        {note && (
                                                            <span className={`italic text-sm ml-2 ${isRoyal ? 'text-[#5c2a12]/85' : 'opacity-75'}`}>
                                                                — {note}
                                                            </span>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                );
                            }
                        } catch {}
                        return <p className="whitespace-pre-wrap leading-relaxed font-serif text-base">{entity.personalityTraits}</p>;
                    })()}
                </ViewerSectionCard>
            )}

            {show('traits') && entity.traits && (!hideEmpty || !isFieldValueEmpty(entity.traits)) && (
                <ViewerSectionCard id="section-features" title="Unique / Unusual Features">
                    {(() => {
                        try {
                            const parsed = JSON.parse(entity.traits);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                return (
                                    <ul className="space-y-2">
                                        {parsed.map((item: any, idx: number) => {
                                            const name = typeof item === 'string' ? item : item.name || item.title;
                                            const note = typeof item === 'object' ? item.note : null;
                                            return (
                                                <li key={idx} className="flex items-start gap-2 text-base font-serif leading-relaxed">
                                                    <span className={`${isRoyal ? 'text-[#70121e]' : 'text-amber-500'} select-none shrink-0 font-bold`}>•</span>
                                                    <div className="flex-1">
                                                        <strong className="font-bold">{name}</strong>
                                                        {note && (
                                                            <span className={`italic text-sm ml-2 ${isRoyal ? 'text-[#5c2a12]/85' : 'opacity-75'}`}>
                                                                — {note}
                                                            </span>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                );
                            }
                        } catch {}
                        return <p className="whitespace-pre-wrap leading-relaxed font-serif text-base">{entity.traits}</p>;
                    })()}
                </ViewerSectionCard>
            )}
            
            <ViewerSectionCard id="section-inventory" title="Inventory & Conditions">
                {isRoyal ? (
                    <div className="space-y-4 font-serif">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-8 gap-y-3 py-1 min-w-0">
                            {show('possessedItems') && (!hideEmpty || !isFieldValueEmpty(entity.possessedItems)) && (
                                <div className="flex items-center justify-between border-b border-[#c8a96e]/30 pb-2">
                                    <span className="text-sm font-bold text-[#2b1810]">{getGenreFieldLabel(genre, 'possessedItems', 'Equipment / Items')}:</span>
                                    <span className="text-sm text-[#3d271d]">{entity.possessedItems || '—'}</span>
                                </div>
                            )}
                            {show('possessedCurrencies') && (!hideEmpty || !isFieldValueEmpty(entity.possessedCurrencies)) && (
                                <div className="flex items-center justify-between border-b border-[#c8a96e]/30 pb-2">
                                    <span className="text-sm font-bold text-[#2b1810]">{getGenreFieldLabel(genre, 'possessedCurrencies', 'Wealth / Currencies')}:</span>
                                    <span className="text-sm text-[#3d271d]">{entity.possessedCurrencies || '—'}</span>
                                </div>
                            )}
                            {show('knownSkills') && (!hideEmpty || !isFieldValueEmpty(entity.knownSkills)) && (
                                <div className="flex items-center justify-between border-b border-[#c8a96e]/30 pb-2">
                                    <span className="text-sm font-bold text-[#2b1810]">Known Skills:</span>
                                    <span className="text-sm text-[#3d271d]">{entity.knownSkills || '—'}</span>
                                </div>
                            )}
                            {show('knownMagic') && (!hideEmpty || !isFieldValueEmpty(entity.knownSpells)) && (
                                <div className="flex items-center justify-between border-b border-[#c8a96e]/30 pb-2">
                                    <span className="text-sm font-bold text-[#2b1810]">{getGenreFieldLabel(genre, 'knownMagic', 'Known Spells')}:</span>
                                    <span className="text-sm text-[#3d271d]">{entity.knownSpells || '—'}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-3 border-t border-[#c8a96e]/30 pt-4">
                            {(!hideEmpty || !isFieldValueEmpty(entity.pairedConnectedItems)) && (
                                <LinksDisplay label="Connected Items" ids={entity.pairedConnectedItems || []} all={allEntities} onNav={onNavigate} />
                            )}
                            {(!hideEmpty || !isFieldValueEmpty(entity.pairedResources)) && (
                                <LinksDisplay label="Connected Wealth/Resources" ids={entity.pairedResources || []} all={allEntities} onNav={onNavigate} />
                            )}
                            {(!hideEmpty || !isFieldValueEmpty(entity.pairedSkills)) && (
                                <LinksDisplay label="Connected Skills" ids={entity.pairedSkills || []} all={allEntities} onNav={onNavigate} />
                            )}
                            {show('knownLanguage') && (!hideEmpty || !isFieldValueEmpty(entity.pairedLanguage)) && (
                                <LinksDisplay label="Connected Languages" ids={entity.pairedLanguage || []} all={allEntities} onNav={onNavigate} />
                            )}
                            {show('knownMagic') && (!hideEmpty || !isFieldValueEmpty(entity.pairedMagic)) && (
                                <LinksDisplay label={getGenreFieldLabel(genre, 'knownMagic', 'Schools of Magic / Teachings')} ids={entity.pairedMagic || []} all={allEntities} onNav={onNavigate} />
                            )}
                            {show('knownTech') && (!hideEmpty || !isFieldValueEmpty(entity.pairedTech)) && (
                                <LinksDisplay label={getGenreFieldLabel(genre, 'knownTech', 'Sciences & Technologies')} ids={entity.pairedTech || []} all={allEntities} onNav={onNavigate} />
                            )}
                            {show('conditions') && (!hideEmpty || !isFieldValueEmpty(entity.pairedConditionsPositive)) && (
                                <LinksDisplay label="Affected by Boons" ids={entity.pairedConditionsPositive || []} all={allEntities} onNav={onNavigate} />
                            )}
                            {show('conditions') && (!hideEmpty || !isFieldValueEmpty(entity.pairedConditionsNegative)) && (
                                <LinksDisplay label="Affected by Afflictions" ids={entity.pairedConditionsNegative || []} all={allEntities} onNav={onNavigate} />
                            )}
                            {show('conditions') && (!hideEmpty || !isFieldValueEmpty(entity.pairedConditionsOther)) && (
                                <LinksDisplay label="Affected by Other conditions" ids={entity.pairedConditionsOther || []} all={allEntities} onNav={onNavigate} />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                        {(!hideEmpty || !isFieldValueEmpty(entity.statsList)) && <FieldRow label="Stats/Attributes (Legacy Text)" value={entity.statsList} />}
                        {show('possessedItems') && (!hideEmpty || !isFieldValueEmpty(entity.possessedItems)) && <FieldRow label={getGenreFieldLabel(genre, 'possessedItems', 'Equipment/Owned Items')} value={entity.possessedItems} />}
                        {show('possessedCurrencies') && (!hideEmpty || !isFieldValueEmpty(entity.possessedCurrencies)) && <FieldRow label={getGenreFieldLabel(genre, 'possessedCurrencies', 'Wealth/Owned Currencies')} value={entity.possessedCurrencies} />}
                        {show('knownSkills') && (!hideEmpty || !isFieldValueEmpty(entity.knownSkills)) && <FieldRow label="Known Skills/Abilities" value={entity.knownSkills} />}
                        {show('knownMagic') && (!hideEmpty || !isFieldValueEmpty(entity.knownSpells)) && <FieldRow label={getGenreFieldLabel(genre, 'knownMagic', 'Known Spells')} value={entity.knownSpells} />}
                        {show('knownLanguage') && (!hideEmpty || !isFieldValueEmpty(entity.knownLanguage)) && <FieldRow label="Known Languages" value={entity.knownLanguage} />}
                        {show('knownMagic') && (!hideEmpty || !isFieldValueEmpty(entity.knownMagic)) && <FieldRow label={getGenreFieldLabel(genre, 'knownMagic', 'Known Magical Teachings')} value={entity.knownMagic} />}
                        {show('knownTech') && (!hideEmpty || !isFieldValueEmpty(entity.knownTech)) && <FieldRow label={getGenreFieldLabel(genre, 'knownTech', 'Known Technologies')} value={entity.knownTech} />}
                        
                        <div className="col-span-full mt-2 space-y-3 border-t border-current/10 pt-3">
                            {(!hideEmpty || !isFieldValueEmpty(entity.pairedConnectedItems)) && <LinksDisplay label="Connected Items" ids={entity.pairedConnectedItems || []} all={allEntities} onNav={onNavigate} />}
                            {(!hideEmpty || !isFieldValueEmpty(entity.pairedResources)) && <LinksDisplay label="Connected Wealth/Resources" ids={entity.pairedResources || []} all={allEntities} onNav={onNavigate} />}
                            {(!hideEmpty || !isFieldValueEmpty(entity.pairedSkills)) && <LinksDisplay label="Connected Skills" ids={entity.pairedSkills || []} all={allEntities} onNav={onNavigate} />}
                            {show('knownLanguage') && (!hideEmpty || !isFieldValueEmpty(entity.pairedLanguage)) && <LinksDisplay label="Connected Languages" ids={entity.pairedLanguage || []} all={allEntities} onNav={onNavigate} />}
                            {show('knownMagic') && (!hideEmpty || !isFieldValueEmpty(entity.pairedMagic)) && <LinksDisplay label={getGenreFieldLabel(genre, 'knownMagic', 'Schools of Magic / Teachings')} ids={entity.pairedMagic || []} all={allEntities} onNav={onNavigate} />}
                            {show('knownTech') && (!hideEmpty || !isFieldValueEmpty(entity.pairedTech)) && <LinksDisplay label={getGenreFieldLabel(genre, 'knownTech', 'Sciences & Technologies')} ids={entity.pairedTech || []} all={allEntities} onNav={onNavigate} />}
                            {show('conditions') && (!hideEmpty || !isFieldValueEmpty(entity.pairedConditionsPositive)) && <LinksDisplay label="Affected by Boons" ids={entity.pairedConditionsPositive || []} all={allEntities} onNav={onNavigate} />}
                            {show('conditions') && (!hideEmpty || !isFieldValueEmpty(entity.pairedConditionsNegative)) && <LinksDisplay label="Affected by Afflictions" ids={entity.pairedConditionsNegative || []} all={allEntities} onNav={onNavigate} />}
                            {show('conditions') && (!hideEmpty || !isFieldValueEmpty(entity.pairedConditionsOther)) && <LinksDisplay label="Affected by Other conditions" ids={entity.pairedConditionsOther || []} all={allEntities} onNav={onNavigate} />}
                        </div>
                    </div>
                )}
            </ViewerSectionCard>


            <ViewerSectionCard id="section-interpersonal" title="Interpersonal Web">
                <div className="space-y-3">
                    <LinksDisplay label="Parents" ids={effectiveParentIds} all={allEntities} onNav={onNavigate} fieldKey="parentsOfCharacter" allRelationalNotes={entity.relationalNotes} />
                    <LinksDisplay label="Children" ids={effectiveChildIds} all={allEntities} onNav={onNavigate} fieldKey="childOfCharacter" allRelationalNotes={entity.relationalNotes} />
                    <LinksDisplay label="Relatives" ids={[...new Set([...(entity.relativesOfCharacter || []), ...(backlinks?.relatives || [])])]} all={allEntities} onNav={onNavigate} fieldKey="relativesOfCharacter" allRelationalNotes={entity.relationalNotes} />
                    <LinksDisplay label="Friends" ids={[...new Set([...(entity.allyResCharacter || []), ...(backlinks?.friends || [])])]} all={allEntities} onNav={onNavigate} wikiStyle="tag" fieldKey="allyResCharacter" allRelationalNotes={entity.relationalNotes} />
                    <LinksDisplay label="Enemies" ids={[...new Set([...(entity.enemydResCharacter || []), ...(backlinks?.enemies || [])])]} all={allEntities} onNav={onNavigate} wikiStyle="tag" fieldKey="enemydResCharacter" allRelationalNotes={entity.relationalNotes} />
                    <LinksDisplay label="Complicated" ids={[...new Set([...(entity.complicatedResCharacter || []), ...(backlinks?.complicated || [])])]} all={allEntities} onNav={onNavigate} wikiStyle="tag" fieldKey="complicatedResCharacter" allRelationalNotes={entity.relationalNotes} />
                </div>
            </ViewerSectionCard>
            
            <ViewerSectionCard id="section-affiliations" title="Affiliations & Connections">
                <div className="space-y-3">
                    <LinksDisplay label="Ideologies/Political Groups" ids={[...(entity.leadingPoliticalLeaders || []), ...(entity.pairedConnectionPolGroup || []), ...(entity.pairedBelongingPolGroup || []), ...(entity.pairedAllyPolGroup || []), ...(entity.pairedEnemyPolGroup || [])]} all={allEntities} onNav={onNavigate} wikiStyle="tag" />
                    <LinksDisplay label="Organizations" ids={[...(entity.leadingOtherLeaders || []), ...(entity.pairedConnectionOtherGroups || []), ...(entity.pairedBelongingOtherGroups || []), ...(entity.pairedAllyOtherGroups || []), ...(entity.pairedEnemyOtherGroups || [])]} all={allEntities} onNav={onNavigate} wikiStyle="tag" />
                    <LinksDisplay label="Teachings/Religious Groups" ids={[...(entity.leadingReligiousLeaders || []), ...(entity.pairedConnectionRelGroup || []), ...(entity.pairedBelongingRelGroup || []), ...(entity.pairedAllyRelGroup || []), ...(entity.pairedEnemyRelGroup || [])]} all={allEntities} onNav={onNavigate} wikiStyle="tag" />
                    <LinksDisplay label="Magical Groups" ids={[...(entity.leadingMagicalLeaders || []), ...(entity.pairedConnectionMagicGroup || []), ...(entity.pairedBelongingMagicGroup || []), ...(entity.pairedAllyMagicGroup || []), ...(entity.pairedEnemyMagicGroup || [])]} all={allEntities} onNav={onNavigate} wikiStyle="tag" />
                    <LinksDisplay label="Technological Groups" ids={[...(entity.leadingTechLeaders || []), ...(entity.pairedConnectionTechGroup || []), ...(entity.pairedBelongingTechGroup || []), ...(entity.pairedAllyTechGroup || []), ...(entity.pairedEnemyTechGroup || [])]} all={allEntities} onNav={onNavigate} wikiStyle="tag" />
                    <LinksDisplay label="Took part in Events" ids={entity.pairedEvent || []} all={allEntities} onNav={onNavigate} />
                    <LinksDisplay label="Connected Cultures/Art" ids={entity.relatedCultures || []} all={allEntities} onNav={onNavigate} />
                </div>
            </ViewerSectionCard>
        </div>
    );
};

