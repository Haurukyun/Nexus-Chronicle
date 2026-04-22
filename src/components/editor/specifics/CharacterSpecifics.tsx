import React from 'react';
import { Character, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { Info, Zap, Heart, Swords, Scroll } from 'lucide-react';

interface Props {
    entity: Character;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Character>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const CharacterSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <>
            <EditorGroup title="Basic information" icon={Info} isWikiMode={isWikiMode}>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Titles</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-20 outline-none resize-none text-sm shadow-sm`} value={entity.titles || ""} onChange={e => onUpdate({ ...entity, titles: e.target.value })} />
                </div>
                
                <FormInput label="Sex" value={entity.sex || ""} options={['Male', 'Female', 'Non-binary', 'Fluid', 'Other']} onChange={(v: string) => onUpdate({ ...entity, sex: v })} isWikiMode={isWikiMode} />
                <FormInput label="Age" value={entity.age || ""} onChange={(v: string) => onUpdate({ ...entity, age: v })} isWikiMode={isWikiMode} />
                <FormInput label="Height" value={entity.height || ""} onChange={(v: string) => onUpdate({ ...entity, height: v })} isWikiMode={isWikiMode} />
                <FormInput label="Weight" value={entity.weight || ""} onChange={(v: string) => onUpdate({ ...entity, weight: v })} isWikiMode={isWikiMode} />
                <FormInput label="Date of birth" value={entity.birthDate || ""} onChange={(v: string) => onUpdate({ ...entity, birthDate: v })} isWikiMode={isWikiMode} />
                <FormInput label="Date of death" value={entity.deathDate || ""} onChange={(v: string) => onUpdate({ ...entity, deathDate: v })} isWikiMode={isWikiMode} />
                
                <SmartSelect label="Species/Races" ids={entity.pairedRace || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedRace: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Occupation/Class" ids={entity.pairedProfession || []} type="occupation" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedProfession: ids })} onCreate={onCreateNew} />
                <FormInput label="Ethnicity" value={entity.ethnicity || ""} onChange={(v: string) => onUpdate({ ...entity, ethnicity: v })} isWikiMode={isWikiMode} />
                <FormInput label="Combat rating" value={entity.powerLevel || ""} options={['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']} onChange={(v: string) => onUpdate({ ...entity, powerLevel: v })} isWikiMode={isWikiMode} />
                
                <SmartSelect label="Place of residence" ids={entity.pairedCurrentLocationNew || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCurrentLocationNew: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Place of origin" ids={entity.pairedOriginLocationNew || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedOriginLocationNew: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Place of demise" ids={entity.pairedDemiseLocationNew || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedDemiseLocationNew: ids })} onCreate={onCreateNew} />
                
                <SmartSelect label="Affected by Boons" ids={entity.pairedConditionsPositive || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsPositive: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affected by Afflictions" ids={entity.pairedConditionsNegative || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsNegative: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Affected by Other conditions" ids={entity.pairedConditionsOther || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditionsOther: ids })} onCreate={onCreateNew} />
                
                {/* Legacy String fields from FAv1 */}
                <FormInput label="Legacy Skills (String)" value={entity.skills || ""} onChange={(v: string) => onUpdate({ ...entity, skills: v })} isWikiMode={isWikiMode} />
                <FormInput label="Legacy Place of residence" value={entity.pairedCurrentLocation || ""} onChange={(v: string) => onUpdate({ ...entity, pairedCurrentLocation: v })} isWikiMode={isWikiMode} />
                <FormInput label="Legacy Place of origin" value={entity.pairedOriginLocation || ""} onChange={(v: string) => onUpdate({ ...entity, pairedOriginLocation: v })} isWikiMode={isWikiMode} />
                <FormInput label="Legacy Place of demise" value={entity.pairedDemiseLocation || ""} onChange={(v: string) => onUpdate({ ...entity, pairedDemiseLocation: v })} isWikiMode={isWikiMode} />
            </EditorGroup>

            <EditorGroup title="Skills, Stats, Knowledge & Characteristics" icon={Zap} isWikiMode={isWikiMode}>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                </div>
                <div className="lg:col-span-1.5 md:col-span-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Traits & Characteristics</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.personalityTraits || ''} onChange={e => onUpdate({ ...entity, personalityTraits: e.target.value })} />
                </div>
                <div className="lg:col-span-1.5 md:col-span-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Unique/Unusual Features</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traits || ''} onChange={e => onUpdate({ ...entity, traits: e.target.value })} />
                </div>

                <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-6 gap-6 p-6 rounded-3xl border border-slate-500/10 bg-black/5">
                    <h4 className="col-span-full text-[10px] font-black uppercase text-slate-500 border-b pb-2 mb-2 flex items-center gap-2">Stats/Attributes</h4>
                    <FormInput label="STR" value={entity.stats?.strength || ""} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats!, strength: v } })} isWikiMode={isWikiMode} />
                    <FormInput label="DEX" value={entity.stats?.dexterity || ""} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats!, dexterity: v } })} isWikiMode={isWikiMode} />
                    <FormInput label="CON" value={entity.stats?.constitution || ""} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats!, constitution: v } })} isWikiMode={isWikiMode} />
                    <FormInput label="INT" value={entity.stats?.intelligence || ""} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats!, intelligence: v } })} isWikiMode={isWikiMode} />
                    <FormInput label="WIS" value={entity.stats?.wisdom || ""} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats!, wisdom: v } })} isWikiMode={isWikiMode} />
                    <FormInput label="CHA" value={entity.stats?.charisma || ""} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats!, charisma: v } })} isWikiMode={isWikiMode} />
                    
                    <div className="col-span-full mt-4">
                        <FormInput label="Stats/Attributes (Legacy Text)" value={entity.statsList || ""} onChange={(v: string) => onUpdate({ ...entity, statsList: v })} isWikiMode={isWikiMode} />
                    </div>
                </div>

                <FormInput label="Equipment/Owned Items (Text)" value={entity.possessedItems || ""} onChange={(v: string) => onUpdate({ ...entity, possessedItems: v })} isWikiMode={isWikiMode} />
                <FormInput label="Wealth/Owned Currencies (Text)" value={entity.possessedCurrencies || ""} onChange={(v: string) => onUpdate({ ...entity, possessedCurrencies: v })} isWikiMode={isWikiMode} />
                <FormInput label="Known Skills/Abilities (Text)" value={entity.knownSkills || ""} onChange={(v: string) => onUpdate({ ...entity, knownSkills: v })} isWikiMode={isWikiMode} />
                <FormInput label="Known Spells (Text)" value={entity.knownSpells || ""} onChange={(v: string) => onUpdate({ ...entity, knownSpells: v })} isWikiMode={isWikiMode} />
                <FormInput label="Known Languages (Text)" value={entity.knownLanguage || ""} onChange={(v: string) => onUpdate({ ...entity, knownLanguage: v })} isWikiMode={isWikiMode} />
                <FormInput label="Known Magical teachings (Text)" value={entity.knownMagic || ""} onChange={(v: string) => onUpdate({ ...entity, knownMagic: v })} isWikiMode={isWikiMode} />
                <FormInput label="Known Technologies/Sciences (Text)" value={entity.knownTech || ""} onChange={(v: string) => onUpdate({ ...entity, knownTech: v })} isWikiMode={isWikiMode} />

                <SmartSelect label="Connected Items" ids={entity.pairedConnectedItems || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedItems: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected Wealth/Resources" ids={entity.pairedResources || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedResources: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected Skills" ids={entity.pairedSkills || []} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkills: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected Languages" ids={entity.pairedLanguage || []} type="language" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedLanguage: ids })} onCreate={onCreateNew} />
            </EditorGroup>

            <EditorGroup title="Relationships" icon={Heart} isWikiMode={isWikiMode}>
                <SmartSelect label="Parents" ids={entity.parentsOfCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, parentsOfCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Children" ids={entity.childOfCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, childOfCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Relatives" ids={entity.relativesOfCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relativesOfCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Friends" ids={entity.allyResCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, allyResCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Enemies" ids={entity.enemydResCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, enemydResCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Complicated" ids={entity.complicatedResCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, complicatedResCharacter: ids })} onCreate={onCreateNew} />
            </EditorGroup>

            <EditorGroup title="Groups/Teachings" icon={Swords} isWikiMode={isWikiMode}>
                <GroupRoleGroup label="Political groups" roleKey="political" isWikiMode={isWikiMode} entity={{...entity, groupConnections: { political: { leadingFigureOf: entity.leadingPoliticalLeaders || [], connectedTo: entity.pairedConnectionPolGroup || [], memberOf: entity.pairedBelongingPolGroup || [], allyOf: entity.pairedAllyPolGroup || [], enemyOf: entity.pairedEnemyPolGroup || []} }} as any} allEntities={allEntities} 
                    onUpdate={(updatedData: any) => {
                        const pol = updatedData.groupConnections.political;
                        onUpdate({ ...entity, leadingPoliticalLeaders: pol.leadingFigureOf, pairedConnectionPolGroup: pol.connectedTo, pairedBelongingPolGroup: pol.memberOf, pairedAllyPolGroup: pol.allyOf, pairedEnemyPolGroup: pol.enemyOf });
                    }} onCreateNew={onCreateNew} />
                
                <GroupRoleGroup label="Organizations" roleKey="organization" isWikiMode={isWikiMode} entity={{...entity, groupConnections: { organization: { leadingFigureOf: entity.leadingOtherLeaders || [], connectedTo: entity.pairedConnectionOtherGroups || [], memberOf: entity.pairedBelongingOtherGroups || [], allyOf: entity.pairedAllyOtherGroups || [], enemyOf: entity.pairedEnemyOtherGroups || []} }} as any} allEntities={allEntities} 
                    onUpdate={(updatedData: any) => {
                        const org = updatedData.groupConnections.organization;
                        onUpdate({ ...entity, leadingOtherLeaders: org.leadingFigureOf, pairedConnectionOtherGroups: org.connectedTo, pairedBelongingOtherGroups: org.memberOf, pairedAllyOtherGroups: org.allyOf, pairedEnemyOtherGroups: org.enemyOf });
                    }} onCreateNew={onCreateNew} />
                    
                <GroupRoleGroup label="Religious groups" roleKey="religious" isWikiMode={isWikiMode} entity={{...entity, groupConnections: { religious: { leadingFigureOf: entity.leadingReligiousLeaders || [], connectedTo: entity.pairedConnectionRelGroup || [], memberOf: entity.pairedBelongingRelGroup || [], allyOf: entity.pairedAllyRelGroup || [], enemyOf: entity.pairedEnemyRelGroup || []} }} as any} allEntities={allEntities} 
                    onUpdate={(updatedData: any) => {
                        const rel = updatedData.groupConnections.religious;
                        onUpdate({ ...entity, leadingReligiousLeaders: rel.leadingFigureOf, pairedConnectionRelGroup: rel.connectedTo, pairedBelongingRelGroup: rel.memberOf, pairedAllyRelGroup: rel.allyOf, pairedEnemyRelGroup: rel.enemyOf });
                    }} onCreateNew={onCreateNew} />
                    
                <GroupRoleGroup label="Magical groups" roleKey="magic" isWikiMode={isWikiMode} entity={{...entity, groupConnections: { magic: { leadingFigureOf: entity.leadingMagicalLeaders || [], connectedTo: entity.pairedConnectionMagicGroup || [], memberOf: entity.pairedBelongingMagicGroup || [], allyOf: entity.pairedAllyMagicGroup || [], enemyOf: entity.pairedEnemyMagicGroup || []} }} as any} allEntities={allEntities} 
                    onUpdate={(updatedData: any) => {
                        const mag = updatedData.groupConnections.magic;
                        onUpdate({ ...entity, leadingMagicalLeaders: mag.leadingFigureOf, pairedConnectionMagicGroup: mag.connectedTo, pairedBelongingMagicGroup: mag.memberOf, pairedAllyMagicGroup: mag.allyOf, pairedEnemyMagicGroup: mag.enemyOf });
                    }} onCreateNew={onCreateNew} />
                    
                <GroupRoleGroup label="Technological groups" roleKey="science" isWikiMode={isWikiMode} entity={{...entity, groupConnections: { science: { leadingFigureOf: entity.leadingTechLeaders || [], connectedTo: entity.pairedConnectionTechGroup || [], memberOf: entity.pairedBelongingTechGroup || [], allyOf: entity.pairedAllyTechGroup || [], enemyOf: entity.pairedEnemyTechGroup || []} }} as any} allEntities={allEntities} 
                    onUpdate={(updatedData: any) => {
                        const sci = updatedData.groupConnections.science;
                        onUpdate({ ...entity, leadingTechLeaders: sci.leadingFigureOf, pairedConnectionTechGroup: sci.connectedTo, pairedBelongingTechGroup: sci.memberOf, pairedAllyTechGroup: sci.allyOf, pairedEnemyTechGroup: sci.enemyOf });
                    }} onCreateNew={onCreateNew} />
            </EditorGroup>

            <EditorGroup title="Events, Cultures & Myths" icon={Scroll} isWikiMode={isWikiMode}>
                <SmartSelect label="Took part in Events" ids={entity.pairedEvent || []} type="event" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEvent: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected Cultures/Art" ids={entity.relatedCultures || []} type="culture" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relatedCultures: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Myths & Legends" ids={entity.pairedConnectedMyths || []} type="myth" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMyths: ids })} onCreate={onCreateNew} />
            </EditorGroup>
        </>
    );
};
