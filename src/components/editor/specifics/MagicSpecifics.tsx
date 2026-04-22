import React from 'react';
import { Magic, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { FileText } from 'lucide-react';

interface Props {
    entity: Magic;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Magic>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const MagicSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <EditorGroup title="Magic Specifics" icon={FileText} isWikiMode={isWikiMode}>
            <FormInput label="Leading Figures" value={entity.leaders || ""} onChange={(v: string) => onUpdate({ ...entity, leaders: v })} isWikiMode={isWikiMode} />
            <SmartSelect label="Magic/Spell Users" ids={entity.pairedCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCharacter: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Important items" ids={entity.pairedItems || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedItems: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Succeeding Schools of Magic/Magical groups" ids={entity.succedingMagicGroup || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, succedingMagicGroup: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Preceding Schools of Magic/Magical groups" ids={entity.preceedingMagicGroup || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, preceedingMagicGroup: ids })} onCreate={onCreateNew} />
            <FormInput label="Date of creation" value={entity.creationTime || ""} onChange={(v: string) => onUpdate({ ...entity, creationTime: v })} isWikiMode={isWikiMode} />
            <FormInput label="Date of end" value={entity.endTIme || ""} onChange={(v: string) => onUpdate({ ...entity, endTIme: v })} isWikiMode={isWikiMode} />
            <SmartSelect label="Headquarters" ids={entity.headquarters || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, headquarters: ids })} onCreate={onCreateNew} />
            <FormInput label="Name for members/followers" value={entity.followerName || ""} onChange={(v: string) => onUpdate({ ...entity, followerName: v })} isWikiMode={isWikiMode} />
            <FormInput label="Member/User count" value={entity.users || ""} onChange={(v: string) => onUpdate({ ...entity, users: v })} isWikiMode={isWikiMode} />
            <FormInput label="Follower/Subject count" value={entity.followers || ""} onChange={(v: string) => onUpdate({ ...entity, followers: v })} isWikiMode={isWikiMode} />
            <SmartSelect label="Leading Figures" ids={entity.leadingCharacters || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, leadingCharacters: ids })} onCreate={onCreateNew} />
            <FormInput label="Type" value={entity.typeMagic || ""} onChange={(v: string) => onUpdate({ ...entity, typeMagic: v })} isWikiMode={isWikiMode} />
            <FormInput label="General schools of magic" value={entity.formMagic || ""} onChange={(v: string) => onUpdate({ ...entity, formMagic: v })} isWikiMode={isWikiMode} />
            <SmartSelect label="Related Schools of Magic" ids={entity.pairedSpells || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSpells: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Skills/Spells/Other" ids={entity.pairedSkills || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkills: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Afflictions/Boons/Conditions" ids={entity.pairedConditions || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditions: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Important Resources/Materials" ids={entity.pairedConnectedResources || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedResources: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Common Species/Races/Flora/Fauna" ids={entity.connectedRaces || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedRaces: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Common Languages" ids={entity.localLanguages || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, localLanguages: ids })} onCreate={onCreateNew} />
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
            </div>
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Traditions & Customs</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traditions || ''} onChange={e => onUpdate({ ...entity, traditions: e.target.value })} />
            </div>
            <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Myths, legends and stories" ids={entity.pairedConnectedMyths || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMyths: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Ruled/Influenced Locations" ids={entity.governLocations || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, governLocations: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected Locations" ids={entity.connectedLocations || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedLocations: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected Events" ids={entity.connectedEvents || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedEvents: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Cultures/Art" ids={entity.pairedConnectedCultures || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedCultures: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected Characters" ids={entity.pairedConnectionCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectionCharacter: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Prominent Members" ids={entity.pairedBelongingCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedBelongingCharacter: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Prominent Allies" ids={entity.pairedAllyCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyCharacter: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Prominent Enemies" ids={entity.pairedEnemyCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyCharacter: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected Political groups" ids={entity.pairedConnectedPolGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedPolGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Allied Political groups" ids={entity.pairedAllyPolGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyPolGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Enemy Political groups" ids={entity.pairedEnemyPolGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyPolGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedOtherGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Allied Organizations/Other groups" ids={entity.pairedAllyOtherGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyOtherGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Enemy Organizations/Other groups" ids={entity.pairedEnemyOtherGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyOtherGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected Teachings/Religious groups" ids={entity.pairedConnectedReligiousGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedReligiousGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Allied Teachings/Religious groups" ids={entity.pairedAllyReligiousGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyReligiousGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Enemy Teachings/Religious groups" ids={entity.pairedEnemyReligiousGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyReligiousGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicalGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMagicalGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Allied Schools of Magic/Magical groups" ids={entity.pairedAllyMagicalGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyMagicalGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Enemy Schools of Magic/Magical groups" ids={entity.pairedEnemyMagicalGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyMagicalGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected Sciences/Technological groups" ids={entity.pairedConnectedTechGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedTechGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Allied Sciences/Technological groups" ids={entity.pairedAllyTechGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyTechGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Enemy Sciences/Technological groups" ids={entity.pairedEnemyTechGroups || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyTechGroups: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Items" ids={entity.pairedConnectedItems || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedItems: ids })} onCreate={onCreateNew} />
            <SmartSelect label="Connected to Occupations/Classes" ids={entity.pairedConnectedProfessions || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedProfessions: ids })} onCreate={onCreateNew} />
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Secrets/Spoilers/DM notes</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
            </div>
        </EditorGroup>
    );
};
