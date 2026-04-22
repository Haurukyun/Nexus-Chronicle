import React from 'react';
import { Character, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';

interface Props {
    entity: Character;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
    backlinks?: any;
}

export const CharacterSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, isWikiMode, backlinks }) => {
    return (
        <div className="space-y-8">
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Vital Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Titles" value={entity.titles} isWikiMode={false} />
                    <FieldRow label="Sex" value={entity.sex} isWikiMode={false} />
                    <FieldRow label="Age" value={entity.age} isWikiMode={false} />
                    <FieldRow label="Height" value={entity.height} isWikiMode={false} />
                    <FieldRow label="Weight" value={entity.weight} isWikiMode={false} />
                    <FieldRow label="Ethnicity" value={entity.ethnicity} isWikiMode={false} />
                    <FieldRow label="Combat Rating" value={entity.powerLevel} isWikiMode={false} />
                    <FieldRow label="Birth" value={entity.birthDate} isWikiMode={false} />
                    <FieldRow label="Death" value={entity.deathDate} isWikiMode={false} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Species/Races" ids={entity.pairedRace || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Occupation/Class" ids={entity.pairedProfession || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Place of Residence" ids={entity.pairedCurrentLocationNew || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Place of Origin" ids={entity.pairedOriginLocationNew || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Place of Demise" ids={entity.pairedDemiseLocationNew || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>

            {entity.personalityTraits && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Traits & Characteristics</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.personalityTraits}</p>
                </div>
            )}

            {entity.traits && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Unusual Features</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.traits}</p>
                </div>
            )}
            
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Inventory & Abilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Stats/Attributes (Legacy Text)" value={entity.statsList} isWikiMode={false} />
                    <FieldRow label="Equipment/Owned Items" value={entity.possessedItems} isWikiMode={false} />
                    <FieldRow label="Wealth/Owned Currencies" value={entity.possessedCurrencies} isWikiMode={false} />
                    <FieldRow label="Known Skills/Abilities" value={entity.knownSkills} isWikiMode={false} />
                    <FieldRow label="Known Spells" value={entity.knownSpells} isWikiMode={false} />
                    <FieldRow label="Known Languages" value={entity.knownLanguage} isWikiMode={false} />
                    <FieldRow label="Known Magical Teachings" value={entity.knownMagic} isWikiMode={false} />
                    <FieldRow label="Known Technologies" value={entity.knownTech} isWikiMode={false} />
                    
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected Items" ids={entity.pairedConnectedItems || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected Wealth/Resources" ids={entity.pairedResources || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected Skills" ids={entity.pairedSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected Languages" ids={entity.pairedLanguage || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Affected by Boons" ids={entity.pairedConditionsPositive || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Affected by Afflictions" ids={entity.pairedConditionsNegative || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Affected by Other conditions" ids={entity.pairedConditionsOther || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Interpersonal Web</h3>
                <div className="space-y-4">
                    <LinksDisplay label="Parents" ids={entity.parentsOfCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    <LinksDisplay label="Children" ids={entity.childOfCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    <LinksDisplay label="Relatives" ids={entity.relativesOfCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    <LinksDisplay label="Friends" ids={entity.allyResCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                    <LinksDisplay label="Enemies" ids={entity.enemydResCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                    <LinksDisplay label="Complicated" ids={entity.complicatedResCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                </div>
            </div>
            
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Affiliations & Connections</h3>
                <div className="space-y-4">
                    <LinksDisplay label="Ideologies/Political Groups" ids={[...(entity.leadingPoliticalLeaders || []), ...(entity.pairedConnectionPolGroup || []), ...(entity.pairedBelongingPolGroup || []), ...(entity.pairedAllyPolGroup || []), ...(entity.pairedEnemyPolGroup || [])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                    <LinksDisplay label="Organizations" ids={[...(entity.leadingOtherLeaders || []), ...(entity.pairedConnectionOtherGroups || []), ...(entity.pairedBelongingOtherGroups || []), ...(entity.pairedAllyOtherGroups || []), ...(entity.pairedEnemyOtherGroups || [])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                    <LinksDisplay label="Teachings/Religious Groups" ids={[...(entity.leadingReligiousLeaders || []), ...(entity.pairedConnectionRelGroup || []), ...(entity.pairedBelongingRelGroup || []), ...(entity.pairedAllyRelGroup || []), ...(entity.pairedEnemyRelGroup || [])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                    <LinksDisplay label="Magical Groups" ids={[...(entity.leadingMagicalLeaders || []), ...(entity.pairedConnectionMagicGroup || []), ...(entity.pairedBelongingMagicGroup || []), ...(entity.pairedAllyMagicGroup || []), ...(entity.pairedEnemyMagicGroup || [])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                    <LinksDisplay label="Technological Groups" ids={[...(entity.leadingTechLeaders || []), ...(entity.pairedConnectionTechGroup || []), ...(entity.pairedBelongingTechGroup || []), ...(entity.pairedAllyTechGroup || []), ...(entity.pairedEnemyTechGroup || [])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                    <LinksDisplay label="Took part in Events" ids={entity.pairedEvent || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    <LinksDisplay label="Connected Cultures/Art" ids={entity.relatedCultures || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                </div>
            </div>
        </div>
    );
};
