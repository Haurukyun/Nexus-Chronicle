import React from 'react';
import { Character, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';
import { ViewerSectionCard } from '../ViewerSectionCard';
import { useWorldStore } from '../../../store/useWorldStore';

interface Props {
    entity: Character;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    backlinks?: any;
}

export const CharacterSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, backlinks }) => {
    const theme = useWorldStore(state => state.theme);
    const isRoyal = theme === 'royal-codex';

    const speciesNames = (entity.pairedRace || []).map(id => allEntities.find((e: any) => e.id === id)?.name).filter(Boolean).join(', ');
    const occupationNames = (entity.pairedProfession || []).map(id => allEntities.find((e: any) => e.id === id)?.name).filter(Boolean).join(', ');
    const residenceNames = (entity.pairedCurrentLocationNew || []).map(id => allEntities.find((e: any) => e.id === id)?.name).filter(Boolean).join(', ');
    const originNames = (entity.pairedOriginLocationNew || []).map(id => allEntities.find((e: any) => e.id === id)?.name).filter(Boolean).join(', ');
    const isDeceased = Boolean(entity.deathDate?.trim() || (entity as any).dateOfDeath?.trim() || entity.deadSwitch);

    return (
        <div className="space-y-6">
            <ViewerSectionCard title="Vital Records">
                {isRoyal ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 py-1 font-serif">
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Name:</span>
                            <span className="text-[#3d271d] text-sm font-medium">{entity.name}</span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Status:</span>
                            <span className="text-[#3d271d] text-sm font-medium">{isDeceased ? 'Deceased' : 'Living'}</span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Species:</span>
                            <span className="text-[#3d271d] text-sm font-medium">{speciesNames || '—'}</span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Occupation:</span>
                            <span className="text-[#3d271d] text-sm font-medium">{occupationNames || '—'}</span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Age:</span>
                            <span className="text-[#3d271d] text-sm font-medium">{entity.age || '—'}</span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Origin:</span>
                            <span className="text-[#3d271d] text-sm font-medium">{originNames || '—'}</span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Residence:</span>
                            <span className="text-[#3d271d] text-sm font-medium">{residenceNames || '—'}</span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Birth:</span>
                            <span className="text-[#3d271d] text-sm font-medium">{entity.birthDate || '—'}</span>
                        </div>
                        {isDeceased && (
                            <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                                <span className="font-bold text-[#2b1810] text-sm">Death:</span>
                                <span className="text-[#3d271d] text-sm font-medium">{entity.deathDate || '—'}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                        <FieldRow label="Titles" value={entity.titles} />
                        <FieldRow label="Sex" value={entity.sex} />
                        <FieldRow label="Age" value={entity.age} />
                        <FieldRow label="Height" value={entity.height} />
                        <FieldRow label="Weight" value={entity.weight} />
                        <FieldRow label="Ethnicity" value={entity.ethnicity} />
                        <FieldRow label="Combat Rating" value={entity.powerLevel} />
                        <FieldRow label="Birth" value={entity.birthDate} />
                        <FieldRow label="Death" value={entity.deathDate} />
                        <div className="col-span-full mt-2 space-y-3 border-t border-current/10 pt-3">
                            <LinksDisplay label="Species/Races" ids={entity.pairedRace || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Occupation/Class" ids={entity.pairedProfession || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Place of Residence" ids={entity.pairedCurrentLocationNew || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Place of Origin" ids={entity.pairedOriginLocationNew || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Place of Demise" ids={entity.pairedDemiseLocationNew || []} all={allEntities} onNav={onNavigate} />
                        </div>
                    </div>
                )}
            </ViewerSectionCard>


            {entity.personalityTraits && (
                <ViewerSectionCard title="Traits & Characteristics">
                    <p className="whitespace-pre-wrap leading-relaxed font-serif text-base">{entity.personalityTraits}</p>
                </ViewerSectionCard>
            )}

            {entity.traits && (
                <ViewerSectionCard title="Unusual Features">
                    <p className="whitespace-pre-wrap leading-relaxed font-serif text-base">{entity.traits}</p>
                </ViewerSectionCard>
            )}
            
            <ViewerSectionCard title="Inventory & Conditions">
                {isRoyal ? (
                    <div className="space-y-4 font-serif">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 py-1">
                            <div className="flex items-center justify-between border-b border-[#c8a96e]/30 pb-2">
                                <span className="text-sm font-bold text-[#2b1810]">Equipment / Items:</span>
                                <span className="text-sm text-[#3d271d]">{entity.possessedItems || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-[#c8a96e]/30 pb-2">
                                <span className="text-sm font-bold text-[#2b1810]">Wealth / Currencies:</span>
                                <span className="text-sm text-[#3d271d]">{entity.possessedCurrencies || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-[#c8a96e]/30 pb-2">
                                <span className="text-sm font-bold text-[#2b1810]">Known Skills:</span>
                                <span className="text-sm text-[#3d271d]">{entity.knownSkills || '—'}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-[#c8a96e]/30 pb-2">
                                <span className="text-sm font-bold text-[#2b1810]">Known Spells:</span>
                                <span className="text-sm text-[#3d271d]">{entity.knownSpells || '—'}</span>
                            </div>
                        </div>
                        <div className="space-y-3 border-t border-[#c8a96e]/30 pt-4">
                            <LinksDisplay label="Connected Items" ids={entity.pairedConnectedItems || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Connected Wealth/Resources" ids={entity.pairedResources || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Connected Skills" ids={entity.pairedSkills || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Connected Languages" ids={entity.pairedLanguage || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Affected by Boons" ids={entity.pairedConditionsPositive || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Affected by Afflictions" ids={entity.pairedConditionsNegative || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Affected by Other conditions" ids={entity.pairedConditionsOther || []} all={allEntities} onNav={onNavigate} />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                        <FieldRow label="Stats/Attributes (Legacy Text)" value={entity.statsList} />
                        <FieldRow label="Equipment/Owned Items" value={entity.possessedItems} />
                        <FieldRow label="Wealth/Owned Currencies" value={entity.possessedCurrencies} />
                        <FieldRow label="Known Skills/Abilities" value={entity.knownSkills} />
                        <FieldRow label="Known Spells" value={entity.knownSpells} />
                        <FieldRow label="Known Languages" value={entity.knownLanguage} />
                        <FieldRow label="Known Magical Teachings" value={entity.knownMagic} />
                        <FieldRow label="Known Technologies" value={entity.knownTech} />
                        
                        <div className="col-span-full mt-2 space-y-3 border-t border-current/10 pt-3">
                            <LinksDisplay label="Connected Items" ids={entity.pairedConnectedItems || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Connected Wealth/Resources" ids={entity.pairedResources || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Connected Skills" ids={entity.pairedSkills || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Connected Languages" ids={entity.pairedLanguage || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Affected by Boons" ids={entity.pairedConditionsPositive || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Affected by Afflictions" ids={entity.pairedConditionsNegative || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Affected by Other conditions" ids={entity.pairedConditionsOther || []} all={allEntities} onNav={onNavigate} />
                        </div>
                    </div>
                )}
            </ViewerSectionCard>


            <ViewerSectionCard title="Interpersonal Web">
                <div className="space-y-3">
                    <LinksDisplay label="Parents" ids={[...new Set([...(entity.parentsOfCharacter || []), ...(backlinks?.parents || [])])]} all={allEntities} onNav={onNavigate} />
                    <LinksDisplay label="Children" ids={[...new Set([...(entity.childOfCharacter || []), ...(backlinks?.children || [])])]} all={allEntities} onNav={onNavigate} />
                    <LinksDisplay label="Relatives" ids={[...new Set([...(entity.relativesOfCharacter || []), ...(backlinks?.relatives || [])])]} all={allEntities} onNav={onNavigate} />
                    <LinksDisplay label="Friends" ids={[...new Set([...(entity.allyResCharacter || []), ...(backlinks?.friends || [])])]} all={allEntities} onNav={onNavigate} wikiStyle="tag" />
                    <LinksDisplay label="Enemies" ids={[...new Set([...(entity.enemydResCharacter || []), ...(backlinks?.enemies || [])])]} all={allEntities} onNav={onNavigate} wikiStyle="tag" />
                    <LinksDisplay label="Complicated" ids={[...new Set([...(entity.complicatedResCharacter || []), ...(backlinks?.complicated || [])])]} all={allEntities} onNav={onNavigate} wikiStyle="tag" />
                </div>
            </ViewerSectionCard>
            
            <ViewerSectionCard title="Affiliations & Connections">
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

