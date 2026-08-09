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

    const speciesNames = char.speciesIds?.map(id => allEntities.find((e: any) => e.id === id)?.name).filter(Boolean).join(', ');
    const occupationNames = char.occupationIds?.map(id => allEntities.find((e: any) => e.id === id)?.name).filter(Boolean).join(', ');

    const subtitle = [
        char.sex,
        char.ethnicity,
        speciesNames,
        occupationNames,
        char.isDead ? 'deceased' : 'living'
    ].filter(Boolean).join(' ');

    const merge = (forward: string[] | undefined, back: string[] | undefined) => {
        return [...new Set([...(forward || []), ...(back || [])])];
    };

    if (isRoyal) {
        const stats = char.stats || {};
        const str = stats.strength || '10';
        const dex = stats.dexterity || '10';
        const con = stats.constitution || '10';
        const int = stats.intelligence || '18';
        const wis = stats.wisdom || '16';
        const cha = stats.charisma || '15';

        return (
            <div 
                className="bg-gradient-to-b from-[#4a0d1b] via-[#300611] to-[#1b0207] border-4 border-[#c8a96e] rounded-t-2xl shadow-2xl p-5 pb-10 text-[#fef08a] font-sans relative overflow-hidden"
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
                    <div className="text-[10px] font-serif font-bold uppercase tracking-[0.25em] text-[#e6c687]">LIVING</div>
                    <EmeraldGem active={!char.isDead} />
                </div>
            </div>
        );
    }


    return (
        <div className={`bg-[#fdfcf0] ${hideName ? 'p-4' : 'p-6'} border-t-8 border-b-8 border-[#7a200d] space-y-2 shadow-inner font-sans select-text text-[#1a1a1a]`}>
            {!hideName && (
                <div className="border-b-2 border-[#7a200d] pb-1">
                    <h2 className="text-4xl font-serif font-bold text-[#7a200d] uppercase leading-none tracking-tight">{char.name}</h2>
                    <p className="text-sm italic text-[#2d2d2d] mt-1">{subtitle}</p>
                    {char.otherNamesAndEpithets && <p className="text-[10px] uppercase font-black text-[#7a200d]/60 mt-1 tracking-widest">{char.otherNamesAndEpithets}</p>}
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
                    <WikiStatRow label="Combat Rating" value={char.combatRating} />
                    <WikiStatRow label="Height / Weight" value={char.height && char.weight ? `${char.height} / ${char.weight}` : (char.height || char.weight)} />
                    <WikiStatRow label="Titles" value={char.titles} />
                    <WikiStatRow label="Birth" value={char.dateOfBirth} />
                    <WikiStatRow label="Death" value={char.dateOfDeath} />
                    <LinksDisplay label="Origin" ids={char.placeOfOriginId || []} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                    <LinksDisplay label="Residence" ids={char.placeOfResidenceId || []} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                    <LinksDisplay label="Place of Demise" ids={char.placeOfDemiseId || []} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                    <WikiStatRow label="Other Info" value={char.otherBasicInfo} />
                </div>
            </div>

            <TaperedDivider />
            
            <RadarChart stats={char.stats || {}} isWikiMode={isWikiMode} />

            <TaperedDivider />

            <div className="grid grid-cols-3 gap-y-2 py-2 text-center">
                <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">STR</span><span className="text-sm">{char.stats?.strength || '10'}</span></div>
                <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">DEX</span><span className="text-sm">{char.stats?.dexterity || '10'}</span></div>
                <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">CON</span><span className="text-sm">{char.stats?.constitution || '10'}</span></div>
                <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">INT</span><span className="text-sm">{char.stats?.intelligence || '10'}</span></div>
                <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">WIS</span><span className="text-sm">{char.stats?.wisdom || '10'}</span></div>
                <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">CHA</span><span className="text-sm">{char.stats?.charisma || '10'}</span></div>
            </div>

            <TaperedDivider />

            <div className="space-y-1">
                <WikiStatRow label="Traits" value={char.traitsAndCharacteristics} />
                <WikiStatRow label="Features" value={char.unusualFeatures} />
                <LinksDisplay label="Parents" ids={merge(char.parentIds, backlinks?.parents)} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                <LinksDisplay label="Children" ids={merge(char.childrenIds, backlinks?.children)} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                <LinksDisplay label="Relatives" ids={merge(char.relativeIds, backlinks?.relatives)} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                <LinksDisplay label="Friends" ids={merge(char.friendIds, backlinks?.friends)} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                <LinksDisplay label="Enemies" ids={merge(char.enemyIds, backlinks?.enemies)} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                
                <LinksDisplay label="Skills/Abilities" ids={char.skillIds} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                <LinksDisplay label="Languages" ids={char.languageIds} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                <LinksDisplay label="Boons/Conditions" ids={merge(char.affectedByBoonsIds, backlinks?.referencedIn)} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                
                <LinksDisplay label="Equipment" ids={char.equipmentIds || []} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
            </div>
        </div>
    );
};

