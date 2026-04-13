import React from 'react';
import { Settings, Info, BookOpen, Heart, Globe, Swords, Scroll, Ghost, Zap } from 'lucide-react';
import { EditorGroup } from './EditorGroup';
import { GroupRoleGroup } from './GroupRoleGroup';
import { FormInput, FormToggle, SmartSelect } from '../ui';
import { EntityEditorProps } from '../../types';

export const EntityEditor = ({ entity, allEntities, onSave, onCancel, onCreateNew, isWikiMode, onUpdate }: EntityEditorProps) => {
    return (
        <div className="max-w-7xl mx-auto pb-40 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-end border-b border-slate-500/20 pb-8">
                <div>
                    <h2 className={`text-5xl font-serif font-black uppercase tracking-tighter ${isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]'}`}>The Sovereign Scribe</h2>
                    <p className="opacity-50 text-xs italic">Inscribing the essence of: <span className="font-bold underline">{entity.name}</span></p>
                </div>
                <div className="flex gap-4 items-center">
                    <FormToggle label={entity.isReadOnly ? "LOCKED" : "Lock Entry"} checked={entity.isReadOnly} onChange={(v: boolean) => onUpdate({ ...entity, isReadOnly: v })} isWikiMode={isWikiMode} />
                    <button onClick={onSave} className={`px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest ${isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-[#fef08a] text-black'} hover:scale-105 transition-all shadow-2xl active:scale-95`}>
                        Commit to Chronicle
                    </button>
                    <button onClick={onCancel} className="p-4 text-slate-500 hover:text-red-500 transition-colors uppercase font-black text-[10px] tracking-widest">Abandon Scrawl</button>
                </div>
            </header>

            <fieldset disabled={entity.isReadOnly} className="space-y-12">
                {/* 1. DOCUMENT SETTINGS */}
                <EditorGroup title="Document settings" icon={Settings} isWikiMode={isWikiMode}>
                    <div className="md:col-span-1 lg:col-span-1">
                        <FormInput label="Name" value={entity.name} onChange={(v: string) => onUpdate({ ...entity, name: v })} isWikiMode={isWikiMode} />
                    </div>
                    <div className="md:col-span-1 lg:col-span-1">
                        <SmartSelect label="Belongs under" ids={entity.belongsUnderId ? [entity.belongsUnderId] : []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, belongsUnderId: ids[0] })} onCreate={onCreateNew} />
                    </div>
                    <FormInput label="Text color" value={entity.textColor} type="color" onChange={(v: string) => onUpdate({ ...entity, textColor: v })} isWikiMode={isWikiMode} />
                    <FormInput label="Background color" value={entity.backgroundColor} type="color" onChange={(v: string) => onUpdate({ ...entity, backgroundColor: v })} isWikiMode={isWikiMode} />
                    <div className="flex items-end pb-2">
                        <FormToggle label="Is finished" checked={entity.isFinished} onChange={(v: boolean) => onUpdate({ ...entity, isFinished: v })} isWikiMode={isWikiMode} />
                    </div>

                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-slate-500/5">
                        <FormToggle label="Is a minor document" checked={entity.isMinorDocument} onChange={(v: boolean) => onUpdate({ ...entity, isMinorDocument: v })} isWikiMode={isWikiMode} />
                        <FormToggle label="Is Dead/Gone/Destroyed" checked={entity.isDead} onChange={(v: boolean) => onUpdate({ ...entity, isDead: v })} isWikiMode={isWikiMode} />
                        <FormToggle label="Is a category" checked={entity.isCategory} onChange={(v: boolean) => onUpdate({ ...entity, isCategory: v })} isWikiMode={isWikiMode} />
                        <FormInput label="Order number" value={entity.orderNumber || ""} onChange={(v: string) => onUpdate({ ...entity, orderNumber: v })} isWikiMode={isWikiMode} />
                    </div>

                    <div className="lg:col-span-3">
                        <FormInput label="Tags" value={entity.tags?.join(', ')} placeholder="Fantasy, Hero, Royal..." onChange={(v: string) => onUpdate({ ...entity, tags: v.split(',').map(s => s.trim()) })} isWikiMode={isWikiMode} />
                    </div>

                    <div className="lg:col-span-2">
                        <FormInput label="Document Template" value={entity.documentTemplate || "None"} options={['None', 'Protagonist', 'Antagonist', 'NPC', 'Legendary', 'Deity']} onChange={(v: string) => onUpdate({ ...entity, documentTemplate: v })} isWikiMode={isWikiMode} />
                    </div>
                    <div className="lg:col-span-3">
                        <FormInput label="Extra HTML classes" value={entity.extraHtmlClasses || ""} onChange={(v: string) => onUpdate({ ...entity, extraHtmlClasses: v })} isWikiMode={isWikiMode} />
                    </div>
                    <div className="lg:col-span-3">
                        <FormInput label="Other Names & Epithets" value={entity.otherNamesAndEpithets || ""} onChange={(v: string) => onUpdate({ ...entity, otherNamesAndEpithets: v })} isWikiMode={isWikiMode} />
                    </div>
                </EditorGroup>

                {entity.type === 'character' && (
                    <>
                        {/* 2. BASIC INFORMATION */}
                        <EditorGroup title="Basic information" icon={Info} isWikiMode={isWikiMode}>
                            <div className="lg:col-span-3">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Titles</label>
                                <textarea className={`w-full mt-1 ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-20 outline-none resize-none text-sm`} value={entity.titles} onChange={e => onUpdate({ ...entity, titles: e.target.value })} />
                            </div>
                            
                            <FormInput label="Sex" value={entity.sex} options={['Male', 'Female', 'Non-binary', 'Fluid', 'Other']} onChange={(v: string) => onUpdate({ ...entity, sex: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Age" value={entity.age} onChange={(v: string) => onUpdate({ ...entity, age: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Height" value={entity.height} onChange={(v: string) => onUpdate({ ...entity, height: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Weight" value={entity.weight} onChange={(v: string) => onUpdate({ ...entity, weight: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Date of birth" value={entity.dateOfBirth} onChange={(v: string) => onUpdate({ ...entity, dateOfBirth: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Date of death" value={entity.dateOfDeath} onChange={(v: string) => onUpdate({ ...entity, dateOfDeath: v })} isWikiMode={isWikiMode} />
                            
                            <div className="lg:col-span-1.5 md:col-span-1">
                                <SmartSelect label="Species/Races" ids={entity.speciesIds} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, speciesIds: ids })} onCreate={onCreateNew} />
                            </div>
                            <div className="lg:col-span-1.5 md:col-span-1">
                                <SmartSelect label="Occupation/Class" ids={entity.occupationIds} type="occupation" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, occupationIds: ids })} onCreate={onCreateNew} />
                            </div>
                            
                            <div className="lg:col-span-2">
                                <FormInput label="Ethnicity" value={entity.ethnicity} onChange={(v: string) => onUpdate({ ...entity, ethnicity: v })} isWikiMode={isWikiMode} />
                            </div>
                            <div>
                                <FormInput label="Combat rating" value={entity.combatRating} options={['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']} onChange={(v: string) => onUpdate({ ...entity, combatRating: v })} isWikiMode={isWikiMode} />
                            </div>
                            
                            <SmartSelect label="Place of residence" ids={entity.placeOfResidenceId || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, placeOfResidenceId: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Place of origin" ids={entity.placeOfOriginId || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, placeOfOriginId: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Place of demise" ids={entity.placeOfDemiseId || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, placeOfDemiseId: ids })} onCreate={onCreateNew} />
                            
                            <SmartSelect label="Affected by Boons" ids={entity.affectedByBoonsIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, affectedByBoonsIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Affected by Afflictions" ids={entity.affectedByAfflictionsIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, affectedByAfflictionsIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Affected by Other conditions" ids={entity.affectedByOtherConditionsIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, affectedByOtherConditionsIds: ids })} onCreate={onCreateNew} />
                        </EditorGroup>

                        {/* 3. DESCRIPTION & HISTORY */}
                        <EditorGroup title="Description & History" icon={BookOpen} isWikiMode={isWikiMode}>
                            <div className="lg:col-span-3 space-y-2">
                                <div className={`w-full p-4 rounded-xl border border-dashed text-[10px] font-bold uppercase opacity-40 text-center ${isWikiMode ? 'border-black/20' : 'border-white/20'}`}>
                                    📜 The Great Narrative Scribe - Rich Text Interface Placeholder
                                </div>
                                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-6 py-5 h-80 outline-none text-lg leading-relaxed`} 
                                    placeholder="The echoes of history begin here..."
                                    value={entity.description} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                            </div>
                        </EditorGroup>

                        {/* 4. SKILLS, STATS, KNOWLEDGE & CHARACTERISTICS */}
                        <EditorGroup title="Skills, Stats, Knowledge & Characteristics" icon={Zap} isWikiMode={isWikiMode}>
                            <div className="lg:col-span-1.5 md:col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Traits & Characteristics</label>
                                <textarea className={`w-full mt-1 ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm`} value={entity.traitsAndCharacteristics} onChange={e => onUpdate({ ...entity, traitsAndCharacteristics: e.target.value })} />
                            </div>
                            <div className="lg:col-span-1.5 md:col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Unique/Unusual Features</label>
                                <textarea className={`w-full mt-1 ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm`} value={entity.unusualFeatures} onChange={e => onUpdate({ ...entity, unusualFeatures: e.target.value })} />
                            </div>

                            <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-6 gap-6 p-6 rounded-3xl border border-slate-500/10 bg-black/5">
                                <h4 className="col-span-2 lg:col-span-6 text-[10px] font-black uppercase text-slate-500 border-b pb-2 mb-2 flex items-center gap-2">Stats/Attributes</h4>
                                <FormInput label="STR" value={entity.stats?.strength} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, strength: v } })} isWikiMode={isWikiMode} />
                                <FormInput label="DEX" value={entity.stats?.dexterity} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, dexterity: v } })} isWikiMode={isWikiMode} />
                                <FormInput label="CON" value={entity.stats?.constitution} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, constitution: v } })} isWikiMode={isWikiMode} />
                                <FormInput label="INT" value={entity.stats?.intelligence} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, intelligence: v } })} isWikiMode={isWikiMode} />
                                <FormInput label="WIS" value={entity.stats?.wisdom} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, wisdom: v } })} isWikiMode={isWikiMode} />
                                <FormInput label="CHA" value={entity.stats?.charisma} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, charisma: v } })} isWikiMode={isWikiMode} />
                            </div>

                            <SmartSelect label="Equipment/Owned Items" ids={entity.equipmentIds || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, equipmentIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Wealth/Owned Currencies" ids={entity.wealthIds || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, wealthIds: ids })} onCreate={onCreateNew} />
                            
                            <SmartSelect label="Known Skills/Abilities" ids={entity.skillIds} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, skillIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Known Spells" ids={entity.spellIds} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, spellIds: ids })} onCreate={onCreateNew} />
                            <div className="lg:col-span-1">
                                <SmartSelect label="Known Languages" ids={entity.languageIds} type="language" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, languageIds: ids })} onCreate={onCreateNew} />
                            </div>
                            <div className="lg:col-span-1">
                                <SmartSelect label="Known Magical teachings" ids={entity.magicalTeachingIds} type="magic" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, magicalTeachingIds: ids })} onCreate={onCreateNew} />
                            </div>
                            <div className="lg:col-span-1">
                                <SmartSelect label="Known Technologies/Sciences" ids={entity.technologyIds} type="science" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, technologyIds: ids })} onCreate={onCreateNew} />
                            </div>
                        </EditorGroup>

                        {/* 5. RELATIONSHIPS */}
                        <EditorGroup title="Relationships" icon={Heart} isWikiMode={isWikiMode}>
                            <SmartSelect label="Parents of the Character" ids={entity.parentIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, parentIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Children of the Character" ids={entity.childrenIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, childrenIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Other relatives of the Character" ids={entity.relativeIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, relativeIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Friends/Allies" ids={entity.friendIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, friendIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Enemies" ids={entity.enemyIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, enemyIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Complicated relationship with" ids={entity.complicatedWithIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, complicatedWithIds: ids })} onCreate={onCreateNew} />
                        </EditorGroup>

                        {/* 8. CONNECTIONS - DETAILS */}
                        <EditorGroup title="Connections - Details" icon={Scroll} isWikiMode={isWikiMode}>
                            <SmartSelect label="Connected to Skills/Spells/Other" ids={entity.detailSkillIds} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, detailSkillIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Connected to Items" ids={entity.detailItemIds} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, detailItemIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Connected to Afflictions/Boons/Conditions" ids={entity.detailConditionIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, detailConditionIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Connected to Resources/Materials" ids={entity.detailResourceIds} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, detailResourceIds: ids })} onCreate={onCreateNew} />
                        </EditorGroup>

                        {/* 6. CONNECTIONS - STORY/LORE */}
                        <EditorGroup title="Connections - Story/Lore" icon={Globe} isWikiMode={isWikiMode}>
                            <div className="lg:col-span-1.5 md:col-span-1">
                                <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.loreNoteIds} type="note" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, loreNoteIds: ids })} onCreate={onCreateNew} />
                            </div>
                            <div className="lg:col-span-1.5 md:col-span-1">
                                <SmartSelect label="Connected to Myths, legends and stories" ids={entity.mythIds} type="myth" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({ ...entity, mythIds: ids })} onCreate={onCreateNew} />
                            </div>
                        </EditorGroup>

                        {/* 7. GROUPS/TEACHINGS */}
                        <EditorGroup title="Groups/Teachings Connections" icon={Swords} isWikiMode={isWikiMode}>
                            <GroupRoleGroup label="Ideologies/Political groups" roleKey="political" isWikiMode={isWikiMode} entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Organizations/Other groups" roleKey="organization" isWikiMode={isWikiMode} entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Teachings/Religious groups" roleKey="religious" isWikiMode={isWikiMode} entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Schools of Magic/Magical groups" roleKey="magic" isWikiMode={isWikiMode} entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Sciences/Technological groups" roleKey="science" isWikiMode={isWikiMode} entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                        </EditorGroup>

                        <EditorGroup title="Secrets/Spoilers/DM notes" icon={Ghost} isWikiMode={isWikiMode}>
                            <div className="lg:col-span-3">
                                <textarea className={`w-full ${isWikiMode ? 'bg-[#fff5f5] border-rose-200 text-rose-900' : 'bg-slate-950 border-rose-900/30 text-rose-300'} border rounded-2xl px-6 py-4 h-48 outline-none font-mono text-sm leading-relaxed`} 
                                    placeholder="Private ruminations only visible in the scroll of creation..."
                                    value={entity.privateNotes} onChange={e => onUpdate({ ...entity, privateNotes: e.target.value })} />
                            </div>
                        </EditorGroup>
                    </>
                )}
            </fieldset>
        </div>
    );
};
