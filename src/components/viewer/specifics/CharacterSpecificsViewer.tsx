import React from 'react';
import { Character, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';
import { ViewerSectionCard } from '../ViewerSectionCard';
import { useWorldStore } from '../../../store/useWorldStore';

interface Props {
    entity: Character;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
    backlinks?: any;
}

export const CharacterSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, isWikiMode, backlinks }) => {
    const theme = useWorldStore(state => state.theme);
    const isRoyal = theme === 'royal-codex';

    const speciesNames = entity.pairedRace?.map(id => allEntities.find((e: any) => e.id === id)?.name).filter(Boolean).join(', ');

    return (
        <div className="space-y-6">
            <ViewerSectionCard title="Vital Records">
                {isRoyal ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 py-1 font-serif">
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Name:</span>
                            <span className="text-[#3d271d] text-sm font-medium">{entity.name || 'Elara Vance'}</span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Study:</span>
                            <span className="text-[#3d271d] text-sm font-medium">112</span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Species:</span>
                            <span className="text-[#3d271d] text-sm font-medium">{speciesNames || 'High Elf'}</span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Origin:</span>
                            <span className="text-[#3d271d] text-sm font-medium">Ungmerned</span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Age:</span>
                            <span className="text-[#3d271d] text-sm font-medium">{entity.age || '112'}</span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-[#c8a96e]/20 pb-1.5">
                            <span className="font-bold text-[#2b1810] text-sm">Origin:</span>
                            <span className="text-[#3d271d] text-sm font-medium">Silverwood Kingdom</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                        <FieldRow label="Titles" value={entity.titles} isWikiMode={isWikiMode} />
                        <FieldRow label="Sex" value={entity.sex} isWikiMode={isWikiMode} />
                        <FieldRow label="Age" value={entity.age} isWikiMode={isWikiMode} />
                        <FieldRow label="Height" value={entity.height} isWikiMode={isWikiMode} />
                        <FieldRow label="Weight" value={entity.weight} isWikiMode={isWikiMode} />
                        <FieldRow label="Ethnicity" value={entity.ethnicity} isWikiMode={isWikiMode} />
                        <FieldRow label="Combat Rating" value={entity.powerLevel} isWikiMode={isWikiMode} />
                        <FieldRow label="Birth" value={entity.birthDate} isWikiMode={isWikiMode} />
                        <FieldRow label="Death" value={entity.deathDate} isWikiMode={isWikiMode} />
                        <div className="col-span-full mt-2 space-y-3 border-t border-current/10 pt-3">
                            <LinksDisplay label="Species/Races" ids={entity.pairedRace || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Occupation/Class" ids={entity.pairedProfession || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Place of Residence" ids={entity.pairedCurrentLocationNew || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Place of Origin" ids={entity.pairedOriginLocationNew || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Place of Demise" ids={entity.pairedDemiseLocationNew || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
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
            
            <ViewerSectionCard title="Inventory">
                {isRoyal ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 py-1">
                        <div className="flex items-center gap-2.5 border-b border-[#c8a96e]/30 pb-2">
                            <span className="text-base">📖</span>
                            <span className="font-serif font-bold text-[#2b1810] text-sm">'Ancient Tome'</span>
                        </div>
                        <div className="flex items-center gap-2.5 border-b border-[#c8a96e]/30 pb-2">
                            <span className="text-base">⚔️</span>
                            <span className="font-serif font-bold text-[#2b1810] text-sm">Nama Homes</span>
                        </div>
                        <div className="flex items-center gap-2.5 border-b border-[#c8a96e]/30 pb-2">
                            <span className="text-base">🪄</span>
                            <span className="font-serif font-bold text-[#2b1810] text-sm">{entity.possessedItems || 'Runed Staff'}</span>
                        </div>
                        <div className="flex items-center gap-2.5 border-b border-[#c8a96e]/30 pb-2">
                            <span className="text-base">🧪</span>
                            <span className="font-serif font-bold text-[#2b1810] text-sm">{entity.possessedCurrencies || 'Mana Potions'}</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                        <FieldRow label="Stats/Attributes (Legacy Text)" value={entity.statsList} isWikiMode={isWikiMode} />
                        <FieldRow label="Equipment/Owned Items" value={entity.possessedItems} isWikiMode={isWikiMode} />
                        <FieldRow label="Wealth/Owned Currencies" value={entity.possessedCurrencies} isWikiMode={isWikiMode} />
                        <FieldRow label="Known Skills/Abilities" value={entity.knownSkills} isWikiMode={isWikiMode} />
                        <FieldRow label="Known Spells" value={entity.knownSpells} isWikiMode={isWikiMode} />
                        <FieldRow label="Known Languages" value={entity.knownLanguage} isWikiMode={isWikiMode} />
                        <FieldRow label="Known Magical Teachings" value={entity.knownMagic} isWikiMode={isWikiMode} />
                        <FieldRow label="Known Technologies" value={entity.knownTech} isWikiMode={isWikiMode} />
                        
                        <div className="col-span-full mt-2 space-y-3 border-t border-current/10 pt-3">
                            <LinksDisplay label="Connected Items" ids={entity.pairedConnectedItems || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Connected Wealth/Resources" ids={entity.pairedResources || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Connected Skills" ids={entity.pairedSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Connected Languages" ids={entity.pairedLanguage || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Affected by Boons" ids={entity.pairedConditionsPositive || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Affected by Afflictions" ids={entity.pairedConditionsNegative || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Affected by Other conditions" ids={entity.pairedConditionsOther || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        </div>
                    </div>
                )}
            </ViewerSectionCard>


            <ViewerSectionCard title="Interpersonal Web">
                <div className="space-y-3">
                    <LinksDisplay label="Parents" ids={entity.parentsOfCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    <LinksDisplay label="Children" ids={entity.childOfCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    <LinksDisplay label="Relatives" ids={entity.relativesOfCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    <LinksDisplay label="Friends" ids={entity.allyResCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                    <LinksDisplay label="Enemies" ids={entity.enemydResCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                    <LinksDisplay label="Complicated" ids={entity.complicatedResCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                </div>
            </ViewerSectionCard>
            
            <ViewerSectionCard title="Affiliations & Connections">
                <div className="space-y-3">
                    <LinksDisplay label="Ideologies/Political Groups" ids={[...(entity.leadingPoliticalLeaders || []), ...(entity.pairedConnectionPolGroup || []), ...(entity.pairedBelongingPolGroup || []), ...(entity.pairedAllyPolGroup || []), ...(entity.pairedEnemyPolGroup || [])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                    <LinksDisplay label="Organizations" ids={[...(entity.leadingOtherLeaders || []), ...(entity.pairedConnectionOtherGroups || []), ...(entity.pairedBelongingOtherGroups || []), ...(entity.pairedAllyOtherGroups || []), ...(entity.pairedEnemyOtherGroups || [])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                    <LinksDisplay label="Teachings/Religious Groups" ids={[...(entity.leadingReligiousLeaders || []), ...(entity.pairedConnectionRelGroup || []), ...(entity.pairedBelongingRelGroup || []), ...(entity.pairedAllyRelGroup || []), ...(entity.pairedEnemyRelGroup || [])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                    <LinksDisplay label="Magical Groups" ids={[...(entity.leadingMagicalLeaders || []), ...(entity.pairedConnectionMagicGroup || []), ...(entity.pairedBelongingMagicGroup || []), ...(entity.pairedAllyMagicGroup || []), ...(entity.pairedEnemyMagicGroup || [])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                    <LinksDisplay label="Technological Groups" ids={[...(entity.leadingTechLeaders || []), ...(entity.pairedConnectionTechGroup || []), ...(entity.pairedBelongingTechGroup || []), ...(entity.pairedAllyTechGroup || []), ...(entity.pairedEnemyTechGroup || [])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                    <LinksDisplay label="Took part in Events" ids={entity.pairedEvent || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    <LinksDisplay label="Connected Cultures/Art" ids={entity.relatedCultures || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                </div>
            </ViewerSectionCard>
        </div>
    );
};

