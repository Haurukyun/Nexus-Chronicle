import React from 'react';
import { TaperedDivider, WikiStatRow, LinksDisplay } from '../ui';
import { Character, WorldEntity } from '../../types';

interface CharacterStatBlockProps {
    entity: WorldEntity;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    hideName?: boolean;
}

export const CharacterStatBlock = ({ entity, allEntities, onNavigate, hideName = false }: CharacterStatBlockProps) => {
    const char = entity as Character;
    if (char.type !== 'character') return null;

    const speciesNames = char.speciesIds?.map(id => allEntities.find((e: any) => e.id === id)?.name).filter(Boolean).join(', ');
    const occupationNames = char.occupationIds?.map(id => allEntities.find((e: any) => e.id === id)?.name).filter(Boolean).join(', ');

    const subtitle = [
        char.sex,
        char.ethnicity,
        speciesNames,
        occupationNames,
        char.isDead ? 'deceased' : 'living'
    ].filter(Boolean).join(' ');

    return (
        <div className={`bg-[#fdfcf0] \${hideName ? 'p-4' : 'p-6'} border-t-8 border-b-8 border-[#7a200d] space-y-2 shadow-inner font-sans select-text`}>
            {!hideName && (
                <div className="border-b-2 border-[#7a200d] pb-1">
                    <h2 className="text-4xl font-serif font-bold text-[#7a200d] uppercase leading-none tracking-tight">{char.name}</h2>
                    <p className="text-sm italic text-[#2d2d2d] mt-1">{subtitle}</p>
                </div>
            )}
            {hideName && (
                <div className="border-b border-[#7a200d]/40 pb-1 mb-2">
                    <p className="text-[10px] uppercase font-bold text-[#7a200d]">{char.isDead ? 'Status: Deceased' : 'Status: Living'}</p>
                </div>
            )}

            <TaperedDivider />

            <div className="space-y-1">
                <div className="space-y-1">
                    <WikiStatRow label="Sex" value={char.sex} />
                    <WikiStatRow label="Ethnicity" value={char.ethnicity} />
                    <WikiStatRow label="Species" value={speciesNames} />
                    <WikiStatRow label="Occupation" value={occupationNames} />
                    <WikiStatRow label="Age" value={char.age} />
                    <WikiStatRow label="Hit Points" value={char.combatRating ? `\${char.combatRating} (estimated)` : undefined} />
                    <WikiStatRow label="Height / Weight" value={char.height && char.weight ? `\${char.height} / \${char.weight}` : (char.height || char.weight)} />
                    <WikiStatRow label="Titles" value={char.titles} />
                    <WikiStatRow label="Birth" value={char.dateOfBirth} />
                    <WikiStatRow label="Death" value={char.dateOfDeath} />
                    <WikiStatRow label="Origin" value={allEntities.find(e => e.id === char.placeOfOriginId)?.name} />
                    <WikiStatRow label="Residence" value={char.placeOfResidenceId} />
                    <WikiStatRow label="Place of Demise" value={char.placeOfDemiseId} />
                    <WikiStatRow label="Other Info" value={char.otherBasicInfo} />
                </div>
            </div>

            <TaperedDivider />

            <div className="grid grid-cols-3 gap-y-2 py-2 text-center">
                <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">STR</span><span className="text-sm">{char.stats?.strength || '10 (+0)'}</span></div>
                <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">DEX</span><span className="text-sm">{char.stats?.dexterity || '10 (+0)'}</span></div>
                <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">CON</span><span className="text-sm">{char.stats?.constitution || '10 (+0)'}</span></div>
                <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">INT</span><span className="text-sm">{char.stats?.intelligence || '10 (+0)'}</span></div>
                <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">WIS</span><span className="text-sm">{char.stats?.wisdom || '10 (+0)'}</span></div>
                <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">CHA</span><span className="text-sm">{char.stats?.charisma || '10 (+0)'}</span></div>
            </div>

            <TaperedDivider />

            <div className="space-y-1">
                <WikiStatRow label="Traits" value={char.traitsAndCharacteristics} />
                <WikiStatRow label="Features" value={char.unusualFeatures} />
                <LinksDisplay label="Skills" ids={char.skillIds} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                <LinksDisplay label="Spells" ids={char.spellIds} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                <LinksDisplay label="Languages" ids={char.languageIds} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                <LinksDisplay label="Magical Teachings" ids={char.magicalTeachingIds} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                <LinksDisplay label="Technologies" ids={char.technologyIds} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                <LinksDisplay label="Boons" ids={char.affectedByBoonsIds} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                <LinksDisplay label="Afflictions" ids={char.affectedByAfflictionsIds} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                <LinksDisplay label="Other Conditions" ids={char.affectedByOtherConditionsIds} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                <WikiStatRow label="Equipment" value={char.equipment} />
                <WikiStatRow label="Wealth" value={char.wealth} />
            </div>
        </div>
    );
};
