import React from 'react';
import { Character, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { useTheme } from '../../../theme';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { Info, Zap, Heart, Swords, Scroll } from 'lucide-react';

interface Props {
    entity: Character;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Character>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
}

export const CharacterSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew }) => {
    const { layoutMode, themeId } = useTheme();
    return (
        <>
            <EditorGroup title="Basic information" icon={Info}>
                <div className="col-span-12">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Titles</label>
                    <textarea className={`w-full ${(layoutMode === 'wiki') ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-20 outline-none resize-none text-sm shadow-sm`} value={entity.titles || ""} onChange={e => onUpdate({ ...entity, titles: e.target.value })} />
                </div>
                
                <FormInput label="Sex" value={entity.sex || ""} options={['Male', 'Female', 'Non-binary', 'Fluid', 'Other']} onChange={(v: string) => onUpdate({ ...entity, sex: v })} gridSpan={3} />
                <FormInput label="Age" value={entity.age || ""} onChange={(v: string) => onUpdate({ ...entity, age: v })} gridSpan={3} />
                <FormInput label="Height" value={entity.height || ""} onChange={(v: string) => onUpdate({ ...entity, height: v })} gridSpan={3} />
                <FormInput label="Weight" value={entity.weight || ""} onChange={(v: string) => onUpdate({ ...entity, weight: v })} gridSpan={3} />
                
                <FormInput label="Date of birth" value={entity.birthDate || ""} onChange={(v: string) => onUpdate({ ...entity, birthDate: v })} gridSpan={6} />
                <FormInput label="Date of death" value={entity.deathDate || ""} onChange={(v: string) => onUpdate({ ...entity, deathDate: v })} gridSpan={6} />
                
                <SmartSelect label="Species/Races" ids={entity.pairedRace || []} type="species" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedRace: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Occupation/Class" ids={entity.pairedProfession || []} type="occupation" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedProfession: ids })} onCreate={onCreateNew} gridSpan={6} />
                
                <FormInput label="Ethnicity" value={entity.ethnicity || ""} onChange={(v: string) => onUpdate({ ...entity, ethnicity: v })} gridSpan={6} />
                <FormInput label="Combat rating" value={entity.powerLevel || ""} options={['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']} onChange={(v: string) => onUpdate({ ...entity, powerLevel: v })} gridSpan={6} />
                
                <SmartSelect label="Place of residence" ids={entity.pairedCurrentLocationNew || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedCurrentLocationNew: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Place of origin" ids={entity.pairedOriginLocationNew || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedOriginLocationNew: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Place of demise" ids={entity.pairedDemiseLocationNew || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedDemiseLocationNew: ids })} onCreate={onCreateNew} gridSpan={4} />
                
                <SmartSelect label="Affected by Boons" ids={entity.pairedConditionsPositive || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConditionsPositive: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Affected by Afflictions" ids={entity.pairedConditionsNegative || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConditionsNegative: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Affected by Other conditions" ids={entity.pairedConditionsOther || []} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConditionsOther: ids })} onCreate={onCreateNew} gridSpan={4} />
                
                {/* Legacy String fields from FAv1 */}
                <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl border border-dashed border-slate-500/20 bg-black/5 mt-4">
                    <h4 className="col-span-full text-[8px] font-black uppercase text-slate-500 tracking-widest mb-2 opacity-50">Legacy Data Migration (FAv1)</h4>
                    <FormInput label="Skills" value={entity.skills || ""} onChange={(v: string) => onUpdate({ ...entity, skills: v })} />
                    <FormInput label="Residence" value={entity.pairedCurrentLocation || ""} onChange={(v: string) => onUpdate({ ...entity, pairedCurrentLocation: v })} />
                    <FormInput label="Origin" value={entity.pairedOriginLocation || ""} onChange={(v: string) => onUpdate({ ...entity, pairedOriginLocation: v })} />
                    <FormInput label="Demise" value={entity.pairedDemiseLocation || ""} onChange={(v: string) => onUpdate({ ...entity, pairedDemiseLocation: v })} />
                </div>
            </EditorGroup>

            <EditorGroup title="Characteristics & Knowledge" icon={Zap}>
                <div className="col-span-12">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                    <textarea className={`w-full ${(layoutMode === 'wiki') ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                </div>
                <div className="col-span-6">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Traits & Characteristics</label>
                    <textarea className={`w-full ${(layoutMode === 'wiki') ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.personalityTraits || ''} onChange={e => onUpdate({ ...entity, personalityTraits: e.target.value })} />
                </div>
                <div className="col-span-6">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Unique/Unusual Features</label>
                    <textarea className={`w-full ${(layoutMode === 'wiki') ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traits || ''} onChange={e => onUpdate({ ...entity, traits: e.target.value })} />
                </div>

                <div className="col-span-12 grid grid-cols-6 gap-6 p-6 rounded-3xl border border-slate-500/10 bg-black/5">
                    <h4 className="col-span-full text-[10px] font-black uppercase text-slate-500 border-b border-slate-500/10 pb-2 mb-2 flex items-center gap-2">Core Attributes</h4>
                    <FormInput label="STR" value={entity.stats?.strength || ""} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats!, strength: v } })} />
                    <FormInput label="DEX" value={entity.stats?.dexterity || ""} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats!, dexterity: v } })} />
                    <FormInput label="CON" value={entity.stats?.constitution || ""} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats!, constitution: v } })} />
                    <FormInput label="INT" value={entity.stats?.intelligence || ""} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats!, intelligence: v } })} />
                    <FormInput label="WIS" value={entity.stats?.wisdom || ""} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats!, wisdom: v } })} />
                    <FormInput label="CHA" value={entity.stats?.charisma || ""} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats!, charisma: v } })} />
                </div>

                <FormInput label="Equipment" value={entity.possessedItems || ""} onChange={(v: string) => onUpdate({ ...entity, possessedItems: v })} gridSpan={4} />
                <FormInput label="Wealth" value={entity.possessedCurrencies || ""} onChange={(v: string) => onUpdate({ ...entity, possessedCurrencies: v })} gridSpan={4} />
                <FormInput label="Legacy Skills" value={entity.knownSkills || ""} onChange={(v: string) => onUpdate({ ...entity, knownSkills: v })} gridSpan={4} />
                
                <FormInput label="Spells" value={entity.knownSpells || ""} onChange={(v: string) => onUpdate({ ...entity, knownSpells: v })} gridSpan={4} />
                <FormInput label="Languages" value={entity.knownLanguage || ""} onChange={(v: string) => onUpdate({ ...entity, knownLanguage: v })} gridSpan={4} />
                <FormInput label="Teachings" value={entity.knownMagic || ""} onChange={(v: string) => onUpdate({ ...entity, knownMagic: v })} gridSpan={4} />

                <SmartSelect label="Connected Items" ids={entity.pairedConnectedItems || []} type="item" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedItems: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Resources" ids={entity.pairedResources || []} type="resource" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedResources: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Linked Skills" ids={entity.pairedSkills || []} type="ability" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedSkills: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Linked Languages" ids={entity.pairedLanguage || []} type="language" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedLanguage: ids })} onCreate={onCreateNew} gridSpan={6} />
            </EditorGroup>

            <EditorGroup title="Relationships" icon={Heart}>
                <SmartSelect label="Parents" ids={entity.parentsOfCharacter || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...entity, parentsOfCharacter: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Children" ids={entity.childOfCharacter || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...entity, childOfCharacter: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Relatives" ids={entity.relativesOfCharacter || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...entity, relativesOfCharacter: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Friends" ids={entity.allyResCharacter || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...entity, allyResCharacter: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Enemies" ids={entity.enemydResCharacter || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...entity, enemydResCharacter: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Complicated" ids={entity.complicatedResCharacter || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...entity, complicatedResCharacter: ids })} onCreate={onCreateNew} gridSpan={4} />
            </EditorGroup>

            <EditorGroup title="Groups & Affiliations" icon={Swords}>
                <GroupRoleGroup label="Political groups" roleKey="political" entity={{...entity, groupConnections: { political: { leadingFigureOf: entity.leadingPoliticalLeaders || [], connectedTo: entity.pairedConnectionPolGroup || [], memberOf: entity.pairedBelongingPolGroup || [], allyOf: entity.pairedAllyPolGroup || [], enemyOf: entity.pairedEnemyPolGroup || []} }} as any} allEntities={allEntities} 
                    onUpdate={(updatedData: any) => {
                        const pol = updatedData.groupConnections.political;
                        onUpdate({ ...entity, leadingPoliticalLeaders: pol.leadingFigureOf, pairedConnectionPolGroup: pol.connectedTo, pairedBelongingPolGroup: pol.memberOf, pairedAllyPolGroup: pol.allyOf, pairedEnemyPolGroup: pol.enemyOf });
                    }} onCreateNew={onCreateNew} />
                
                <GroupRoleGroup label="Organizations" roleKey="organization" entity={{...entity, groupConnections: { organization: { leadingFigureOf: entity.leadingOtherLeaders || [], connectedTo: entity.pairedConnectionOtherGroups || [], memberOf: entity.pairedBelongingOtherGroups || [], allyOf: entity.pairedAllyOtherGroups || [], enemyOf: entity.pairedEnemyOtherGroups || []} }} as any} allEntities={allEntities} 
                    onUpdate={(updatedData: any) => {
                        const org = updatedData.groupConnections.organization;
                        onUpdate({ ...entity, leadingOtherLeaders: org.leadingFigureOf, pairedConnectionOtherGroups: org.connectedTo, pairedBelongingOtherGroups: org.memberOf, pairedAllyOtherGroups: org.allyOf, pairedEnemyOtherGroups: org.enemyOf });
                    }} onCreateNew={onCreateNew} />
                    
                <GroupRoleGroup label="Religious groups" roleKey="religious" entity={{...entity, groupConnections: { religious: { leadingFigureOf: entity.leadingReligiousLeaders || [], connectedTo: entity.pairedConnectionRelGroup || [], memberOf: entity.pairedBelongingRelGroup || [], allyOf: entity.pairedAllyRelGroup || [], enemyOf: entity.pairedEnemyRelGroup || []} }} as any} allEntities={allEntities} 
                    onUpdate={(updatedData: any) => {
                        const rel = updatedData.groupConnections.religious;
                        onUpdate({ ...entity, leadingReligiousLeaders: rel.leadingFigureOf, pairedConnectionRelGroup: rel.connectedTo, pairedBelongingRelGroup: rel.memberOf, pairedAllyRelGroup: rel.allyOf, pairedEnemyRelGroup: rel.enemyOf });
                    }} onCreateNew={onCreateNew} />
            </EditorGroup>

            <EditorGroup title="Cultural Context" icon={Scroll}>
                <SmartSelect label="Events" ids={entity.pairedEvent || []} type="event" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedEvent: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Cultures" ids={entity.relatedCultures || []} type="culture" all={allEntities} onChange={(ids) => onUpdate({ ...entity, relatedCultures: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Myths" ids={entity.pairedConnectedMyths || []} type="myth" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMyths: ids })} onCreate={onCreateNew} gridSpan={4} />
            </EditorGroup>
        </>
    );
};
