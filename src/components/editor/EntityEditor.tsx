import React from 'react';
import { Settings, Info, BookOpen, Heart, Globe, Swords, Scroll, Ghost } from 'lucide-react';
import { EditorGroup } from './EditorGroup';
import { GroupRoleGroup } from './GroupRoleGroup';
import { FormInput, FormToggle, SmartSelect } from '../ui';
import { EntityEditorProps } from '../../types';

export const EntityEditor = ({ entity, allEntities, onSave, onCancel, onCreateNew, isWikiMode, onUpdate }: EntityEditorProps) => {
    return (
        <div className="max-w-6xl mx-auto pb-40 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-end border-b border-slate-500/20 pb-8">
                <div>
                    <h2 className={`text-4xl font-serif font-black uppercase tracking-tighter ${isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]'}`}>Inscribing Record</h2>
                    <p className="opacity-50 text-xs italic">Currently editing: <span className="font-bold underline">{entity.name}</span></p>
                </div>
                <div className="flex gap-4 items-center">
                    <FormToggle label={entity.isReadOnly ? "LOCKED" : "Lock Entry"} checked={entity.isReadOnly} onChange={(v: boolean) => onUpdate({ ...entity, isReadOnly: v })} isWikiMode={isWikiMode} />
                    <button onClick={onSave} className={`px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest ${isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-[#fef08a] text-black'} hover:scale-105 transition-all shadow-xl`}>
                        Commit Scroll
                    </button>
                    <button onClick={onCancel} className="p-4 text-slate-500 hover:text-red-500 transition-colors uppercase font-bold text-[10px]">Cancel</button>
                </div>
            </header>

            <fieldset disabled={entity.isReadOnly} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <EditorGroup title="Document Settings" icon={Settings} isWikiMode={isWikiMode}>
                    <div className="lg:col-span-2">
                        <FormInput label="Name" value={entity.name} onChange={(v: string) => onUpdate({ ...entity, name: v })} isWikiMode={isWikiMode} />
                    </div>
                    <FormInput label="Belongs Under" value={entity.belongsUnderId} onChange={(v: string) => onUpdate({ ...entity, belongsUnderId: v })} isWikiMode={isWikiMode} />
                    <FormInput label="Text Color" value={entity.textColor} type="color" onChange={(v: string) => onUpdate({ ...entity, textColor: v })} isWikiMode={isWikiMode} />
                    <FormInput label="Background Color" value={entity.backgroundColor} type="color" onChange={(v: string) => onUpdate({ ...entity, backgroundColor: v })} isWikiMode={isWikiMode} />
                    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-b py-3 my-2 border-slate-500/10">
                        <FormToggle label="Read-only mode" checked={entity.isReadOnly} onChange={(v: boolean) => onUpdate({ ...entity, isReadOnly: v })} isWikiMode={isWikiMode} />
                        <FormToggle label="Minor document" checked={entity.isMinorDocument} onChange={(v: boolean) => onUpdate({ ...entity, isMinorDocument: v })} isWikiMode={isWikiMode} />
                        <FormInput label="Status" value={entity.status || (entity.isDead ? 'Deceased' : 'Living')} options={['Living', 'Deceased', 'Unknown', 'Lost', 'Active', 'Inactive', 'Recovered']} onChange={(v: string) => onUpdate({ ...entity, status: v, isDead: v === 'Deceased' || v === 'Lost' })} isWikiMode={isWikiMode} />
                        <FormToggle label="Category" checked={entity.isCategory} onChange={(v: boolean) => onUpdate({ ...entity, isCategory: v })} isWikiMode={isWikiMode} />
                    </div>
                    <div className="lg:col-span-2">
                        <FormInput label="Tags" value={entity.tags?.join(', ')} onChange={(v: string) => onUpdate({ ...entity, tags: v.split(',').map(s => s.trim()) })} isWikiMode={isWikiMode} />
                    </div>
                    <FormInput label="Other Names" value={entity.otherNames} onChange={(v: string) => onUpdate({ ...entity, otherNames: v })} isWikiMode={isWikiMode} />
                </EditorGroup>

                {entity.type === 'character' && (
                    <>
                        <EditorGroup title="Basic Information" icon={Info} isWikiMode={isWikiMode}>
                            <FormInput label="Titles" value={entity.titles} onChange={(v: string) => onUpdate({ ...entity, titles: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Sex" value={entity.sex} options={['Male', 'Female', 'Non-binary', 'Other']} onChange={(v: string) => onUpdate({ ...entity, sex: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Other" value={entity.otherBasicInfo} onChange={(v: string) => onUpdate({ ...entity, otherBasicInfo: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Age" value={entity.age} onChange={(v: string) => onUpdate({ ...entity, age: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Height" value={entity.height} onChange={(v: string) => onUpdate({ ...entity, height: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Weight" value={entity.weight} onChange={(v: string) => onUpdate({ ...entity, weight: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Date of birth" value={entity.dateOfBirth} onChange={(v: string) => onUpdate({ ...entity, dateOfBirth: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Date of death" value={entity.dateOfDeath} onChange={(v: string) => onUpdate({ ...entity, dateOfDeath: v })} isWikiMode={isWikiMode} />
                            <SmartSelect label="Species/Races" ids={entity.speciesIds} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, speciesIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Occupation/Class" ids={entity.occupationIds} type="occupation" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, occupationIds: ids })} onCreate={onCreateNew} />
                            <FormInput label="Ethnicity" value={entity.ethnicity} options={['Human', 'Elf', 'Dwarf', 'Orc', 'Gnome', 'Halfling', 'Dragonborn', 'Tiefling', 'African', 'Asian', 'Caucasian', 'Hispanic']} onChange={(v: string) => onUpdate({ ...entity, ethnicity: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Combat rating" value={entity.combatRating} options={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']} onChange={(v: string) => onUpdate({ ...entity, combatRating: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Place of residence" value={entity.placeOfResidenceId} onChange={(v: string) => onUpdate({ ...entity, placeOfResidenceId: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Place of origin" value={entity.placeOfOriginId} onChange={(v: string) => onUpdate({ ...entity, placeOfOriginId: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Place of demise" value={entity.placeOfDemiseId} onChange={(v: string) => onUpdate({ ...entity, placeOfDemiseId: v })} isWikiMode={isWikiMode} />
                            <SmartSelect label="Affected by Boons" ids={entity.affectedByBoonsIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, affectedByBoonsIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Affected by Afflictions" ids={entity.affectedByAfflictionsIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, affectedByAfflictionsIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Affected by Other conditions" ids={entity.affectedByOtherConditionsIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, affectedByOtherConditionsIds: ids })} onCreate={onCreateNew} />
                        </EditorGroup>

                        <EditorGroup title="Description & History" icon={BookOpen} isWikiMode={isWikiMode}>
                            <div className="lg:col-span-3 space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Description Summary</label>
                                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-48 outline-none resize-none text-base`} value={entity.description} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                            </div>
                            <div className="lg:col-span-3">
                                <FormInput label="Traits & Characteristics" value={entity.traitsAndCharacteristics} onChange={(v: string) => onUpdate({ ...entity, traitsAndCharacteristics: v })} isWikiMode={isWikiMode} />
                            </div>
                            <div className="lg:col-span-3">
                                <FormInput label="Unique/Unusual Features" value={entity.unusualFeatures} onChange={(v: string) => onUpdate({ ...entity, unusualFeatures: v })} isWikiMode={isWikiMode} />
                            </div>
                            <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-6 gap-4 p-4 rounded-xl border border-slate-500/10">
                                <h4 className="col-span-2 lg:col-span-6 text-[9px] font-black uppercase text-slate-500 border-b pb-1">Stats/Attributes</h4>
                                <FormInput label="STR" value={entity.stats?.strength} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, strength: v } })} isWikiMode={isWikiMode} />
                                <FormInput label="DEX" value={entity.stats?.dexterity} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, dexterity: v } })} isWikiMode={isWikiMode} />
                                <FormInput label="CON" value={entity.stats?.constitution} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, constitution: v } })} isWikiMode={isWikiMode} />
                                <FormInput label="INT" value={entity.stats?.intelligence} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, intelligence: v } })} isWikiMode={isWikiMode} />
                                <FormInput label="WIS" value={entity.stats?.wisdom} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, wisdom: v } })} isWikiMode={isWikiMode} />
                                <FormInput label="CHA" value={entity.stats?.charisma} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, charisma: v } })} isWikiMode={isWikiMode} />
                            </div>
                            <div className="lg:col-span-3"><FormInput label="Equipment/Owned Items" value={entity.equipment} onChange={(v: string) => onUpdate({ ...entity, equipment: v })} isWikiMode={isWikiMode} /></div>
                            <div className="lg:col-span-3"><FormInput label="Wealth/Owned Currencies" value={entity.wealth} onChange={(v: string) => onUpdate({ ...entity, wealth: v })} isWikiMode={isWikiMode} /></div>
                            <SmartSelect label="Known Skills/Abilities" ids={entity.skillIds} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, skillIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Known Spells" ids={entity.spellIds} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, spellIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Known Languages" ids={entity.languageIds} type="language" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, languageIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Known Magical teachings" ids={entity.magicalTeachingIds} type="magic" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, magicalTeachingIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Known Technologies/Sciences" ids={entity.technologyIds} type="science" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, technologyIds: ids })} onCreate={onCreateNew} />
                        </EditorGroup>

                        <EditorGroup title="Relationships" icon={Heart} isWikiMode={isWikiMode}>
                            <SmartSelect label="Parents of the Character" ids={entity.parentIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, parentIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Children of the Character" ids={entity.childrenIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, childrenIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Other relatives of the Character" ids={entity.relativeIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, relativeIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Friends/Allies" ids={entity.friendIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, friendIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Enemies" ids={entity.enemyIds} type="character" all={allEntities} is WikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, enemyIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Complicated relationship with" ids={entity.complicatedWithIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, complicatedWithIds: ids })} onCreate={onCreateNew} />
                        </EditorGroup>

                        <EditorGroup title="Story/Lore & World Connections" icon={Globe} isWikiMode={isWikiMode}>
                            <SmartSelect label="Lore notes/Other notes" ids={entity.loreNoteIds} type="note" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, loreNoteIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Myths, legends and stories" ids={entity.mythIds} type="myth" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, mythIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Took part in Events" ids={entity.eventIds} type="event" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, eventIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Connected to Locations" ids={entity.locationIds} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, locationIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Connected Cultures/Art" ids={entity.cultureIds} type="culture" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, cultureIds: ids })} onCreate={onCreateNew} />
                        </EditorGroup>

                        <EditorGroup title="Groups/Teachings Connections" icon={Swords} isWikiMode={isWikiMode}>
                            <GroupRoleGroup label="Ideologies/Political groups" roleKey="political" isWikiMode={isWikiMode} entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Organizations/Other groups" roleKey="organization" isWikiMode={isWikiMode} entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Teachings/Religious groups" roleKey="religious" isWikiMode={isWikiMode} entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Schools of Magic/Magical groups" roleKey="magic" isWikiMode={isWikiMode} entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Sciences/Technological groups" roleKey="science" isWikiMode={isWikiMode} entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                        </EditorGroup>

                        <EditorGroup title="Details Connections" icon={Scroll} isWikiMode={isWikiMode}>
                            <SmartSelect label="Skills/Spells/Other" ids={entity.detailSkillIds} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, detailSkillIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Connected to Items" ids={entity.detailItemIds} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, detailItemIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Afflictions/Boons/Conditions" ids={entity.detailConditionIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, detailConditionIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Resources/Materials" ids={entity.detailResourceIds} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, detailResourceIds: ids })} onCreate={onCreateNew} />
                        </EditorGroup>

                        <EditorGroup title="Secrets/Spoilers/DM notes" icon={Ghost} isWikiMode={isWikiMode}>
                            <div className="lg:col-span-3">
                                <textarea className={`w-full ${isWikiMode ? 'bg-[#fff5f5] border-rose-200 text-rose-900' : 'bg-slate-950 border-rose-900/30 text-rose-300'} border rounded-xl px-4 py-3 h-48 outline-none font-mono text-sm`} value={entity.privateNotes} onChange={e => onUpdate({ ...entity, privateNotes: e.target.value })} />
                            </div>
                        </EditorGroup>
                    </>
                )}
            </fieldset>
        </div>
    );
};
