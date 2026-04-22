import React from 'react';
import { PoliticalGroup, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';

interface Props {
    entity: PoliticalGroup;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
}

export const PoliticalGroupSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, isWikiMode }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-2 col-span-full tracking-widest text-[#fef08a] border-b border-slate-800/60 pb-3">PoliticalGroup Intelligence</h3>
            <FieldRow label="Leading Figures (legacy)" value={entity.leaders || ""} isWikiMode={isWikiMode} />
            <LinksDisplay label="Succeeding Ideologies/Political groups" ids={entity.succedingPolGroup || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Preceding Ideologies/Political groups" ids={entity.preceedingPolGroup || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <FieldRow label="Date of creation" value={entity.creationTime || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Date of end" value={entity.endTIme || ""} isWikiMode={isWikiMode} />
            <LinksDisplay label="Headquarters" ids={entity.headquarters || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <FieldRow label="Name for members/followers" value={entity.followerName || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Member count" value={entity.population || ""} isWikiMode={isWikiMode} />
            <FieldRow label="Follower/Subject count" value={entity.followers || ""} isWikiMode={isWikiMode} />
            <LinksDisplay label="Leading Figures" ids={entity.leadingCharacters || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <FieldRow label="Form of government" value={entity.formGovernment || ""} isWikiMode={isWikiMode} />
            <LinksDisplay label="Related Ideologies" ids={entity.realedTeachings || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Used Languages" ids={entity.localLanguages || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Common Species/Races/Flora/Fauna" ids={entity.connectedRaces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Used Currencies" ids={entity.localCurrencies || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Important Resources/Materials" ids={entity.pairedConnectedResources || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Myths, legends and stories" ids={entity.pairedConnectedMyths || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Ruled/Influenced Locations" ids={entity.governLocations || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected Locations" ids={entity.connectedLocations || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected Events" ids={entity.connectedEvents || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Cultures/Art" ids={entity.pairedConnectedCultures || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected Characters" ids={entity.pairedConnectionCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Prominent Members" ids={entity.pairedBelongingCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Prominent Allies" ids={entity.pairedAllyCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Prominent Enemies" ids={entity.pairedEnemyCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected Ideologies/Political groups" ids={entity.pairedConnectedPolGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Allied Ideologies/Political groups" ids={entity.pairedAllyPolGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Enemy Ideologies/Political groups" ids={entity.pairedEnemyPolGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Allied Organizations/Other groups" ids={entity.pairedAllyOtherGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Enemy Organizations/Other groups" ids={entity.pairedEnemyOtherGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected Teachings/Religious groups" ids={entity.pairedConnectedReligiousGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Allied Teachings/Religious groups" ids={entity.pairedAllyReligiousGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Enemy Teachings/Religious groups" ids={entity.pairedEnemyReligiousGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicalGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Allied Schools of Magic/Magical groups" ids={entity.pairedAllyMagicalGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Enemy Schools of Magic/Magical groups" ids={entity.pairedEnemyMagicalGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected Sciences/Technological groups" ids={entity.pairedConnectedTechGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Allied Sciences/Technological groups" ids={entity.pairedAllyTechGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Enemy Sciences/Technological groups" ids={entity.pairedEnemyTechGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Skills/Spells/Other" ids={entity.pairedSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Items" ids={entity.pairedConnectedItems || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Occupations/Classes" ids={entity.pairedConnectedProfessions || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            <LinksDisplay label="Connected to Afflictions/Boons/Conditions" ids={entity.pairedConditions || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            </div>
            {entity.description && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Description & History</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.description}</p>
                </div>
            )}
            {entity.traditions && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Traditions & Customs</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.traditions}</p>
                </div>
            )}
            {entity.spoilerNotes && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Secrets/Spoilers/DM notes</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.spoilerNotes}</p>
                </div>
            )}
        </div>
    );
};
