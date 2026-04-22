import React from 'react';
import { Tech, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { Anchor, Gem, Globe, Info, Scroll, Tent, Zap } from 'lucide-react';

interface Props {
    entity: Tech;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Tech>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const TechSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <>
            <EditorGroup title="Governance" icon={Anchor} isWikiMode={isWikiMode}>
                <FormInput label="Leading figures (legacy)" value={entity.leaders || ""} onChange={(v: string) => onUpdate({ ...entity, leaders: v })} isWikiMode={isWikiMode} />
                <SmartSelect label="Technology/Science Users" ids={entity.pairedCharacter || []} type="tech" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Succeeding Sciences/Technological groups" ids={entity.succedingTechGroup || []} type="tech" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, succedingTechGroup: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Preceding Sciences/Technological groups" ids={entity.preceedingTechGroup || []} type="tech" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, preceedingTechGroup: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Headquarters" ids={entity.headquarters || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, headquarters: ids })} onCreate={onCreateNew} />
                <FormInput label="Scientific branches" value={entity.formTech || ""} onChange={(v: string) => onUpdate({ ...entity, formTech: v })} isWikiMode={isWikiMode} />
                <SmartSelect label="Related Technologies/Sciences" ids={entity.pairedTech || []} type="tech" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedTech: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Ruled/Influenced Locations" ids={entity.governLocations || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, governLocations: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected Ideologies/Political groups" ids={entity.pairedConnectedPolGroups || []} type="political" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedPolGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Allied Ideologies/Political groups" ids={entity.pairedAllyPolGroups || []} type="political" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyPolGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Enemy Ideologies/Political groups" ids={entity.pairedEnemyPolGroups || []} type="political" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyPolGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected Teachings/Religious groups" ids={entity.pairedConnectedReligiousGroups || []} type="religious" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedReligiousGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Allied Teachings/Religious groups" ids={entity.pairedAllyReligiousGroups || []} type="religious" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyReligiousGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Enemy Teachings/Religious groups" ids={entity.pairedEnemyReligiousGroups || []} type="religious" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyReligiousGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicalGroups || []} type="magic" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMagicalGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Allied Schools of Magic/Magical groups" ids={entity.pairedAllyMagicalGroups || []} type="magic" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyMagicalGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Enemy Schools of Magic/Magical groups" ids={entity.pairedEnemyMagicalGroups || []} type="magic" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyMagicalGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected Sciences/Technological groups" ids={entity.pairedConnectedTechGroups || []} type="tech" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedTechGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Allied Sciences/Technological groups" ids={entity.pairedAllyTechGroups || []} type="tech" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyTechGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Enemy Sciences/Technological groups" ids={entity.pairedEnemyTechGroups || []} type="tech" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyTechGroups: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Basic" icon={Info} isWikiMode={isWikiMode}>
                <FormInput label="Date of creation" value={entity.creationTime || ""} onChange={(v: string) => onUpdate({ ...entity, creationTime: v })} isWikiMode={isWikiMode} />
                <FormInput label="Date of end" value={entity.endTIme || ""} onChange={(v: string) => onUpdate({ ...entity, endTIme: v })} isWikiMode={isWikiMode} />
                <FormInput label="Member/User count" value={entity.population || ""} onChange={(v: string) => onUpdate({ ...entity, population: v })} isWikiMode={isWikiMode} />
                <FormInput label="Type" value={entity.typeTech || ""} onChange={(v: string) => onUpdate({ ...entity, typeTech: v })} isWikiMode={isWikiMode} />
                <SmartSelect label="Common languages" ids={entity.localLanguages || []} type="language" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, localLanguages: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Myths, legends and stories" ids={entity.pairedConnectedMyths || []} type="myth" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMyths: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Connections" icon={Globe} isWikiMode={isWikiMode}>
                <FormInput label="Name for members/followers" value={entity.followerName || ""} onChange={(v: string) => onUpdate({ ...entity, followerName: v })} isWikiMode={isWikiMode} />
                <SmartSelect label="Connected to Afflictions/Boons/Conditions" ids={entity.pairedConditions || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditions: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Common Species/Races/Flora/Fauna" ids={entity.connectedRaces || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedRaces: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="note" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected Locations" ids={entity.connectedLocations || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedLocations: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected Events" ids={entity.connectedEvents || []} type="event" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedEvents: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected Characters" ids={entity.pairedConnectionCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectionCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Prominent Members" ids={entity.pairedBelongingCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedBelongingCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Prominent Allies" ids={entity.pairedAllyCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Prominent Enemies" ids={entity.pairedEnemyCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} type="organization" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedOtherGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Allied Organizations/Other groups" ids={entity.pairedAllyOtherGroups || []} type="organization" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyOtherGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Enemy Organizations/Other groups" ids={entity.pairedEnemyOtherGroups || []} type="organization" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyOtherGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Occupations/Classes" ids={entity.pairedConnectedProfessions || []} type="occupation" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedProfessions: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Details" icon={Scroll} isWikiMode={isWikiMode}>
                <FormInput label="Follower/Subject count" value={entity.followers || ""} onChange={(v: string) => onUpdate({ ...entity, followers: v })} isWikiMode={isWikiMode} />
                <SmartSelect label="Leading Figures" ids={entity.leadingCharacters || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, leadingCharacters: ids })} onCreate={onCreateNew} />
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                </div>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Secrets/Spoilers/DM notes</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Stats" icon={Zap} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Skills/Spells/Other" ids={entity.pairedSkills || []} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkills: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Possessions" icon={Gem} isWikiMode={isWikiMode}>
                <SmartSelect label="Important Resources/Materials" ids={entity.pairedConnectedResources || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedResources: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Items" ids={entity.pairedConnectedItems || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedItems: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Traditions" icon={Tent} isWikiMode={isWikiMode}>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Traditions & Customs</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traditions || ''} onChange={e => onUpdate({ ...entity, traditions: e.target.value })} />
                </div>
                <SmartSelect label="Connected to Cultures/Art" ids={entity.pairedConnectedCultures || []} type="culture" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedCultures: ids })} onCreate={onCreateNew} />
            </EditorGroup>
        </>
    );
};
