import React from 'react';
import { 
    Settings, Info, BookOpen, Heart, Globe, Swords, Scroll, Ghost, Zap,
    Scale, FolderTree, Type, PaintBucket, CheckSquare, Search, Skull, 
    Box, Hash, Tag, FileText, Code, UserCircle, MapPin, Calendar, Hourglass, 
    Sparkles, Anchor, Users, Maximize, MessageSquare, Coins, Home, Pickaxe, 
    Gem, User, Leaf, Sun, Moon, Tent, Pencil
} from 'lucide-react';
import { EditorGroup } from './EditorGroup';
import { GroupRoleGroup } from './GroupRoleGroup';
import { FormInput, FormToggle, SmartSelect } from '../ui';
import { EntityEditorProps, Location } from '../../types';

export const EntityEditor = ({ entity, allEntities, onSave, onCancel, onCreateNew, isWikiMode, onUpdate }: EntityEditorProps) => {
    const isLocation = entity.type === 'location';
    const loc = entity as Location;

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
                {/* 1. MANDATORY DOCUMENT SETTINGS (UNIVERSAL) */}
                <EditorGroup title="Document settings" icon={Settings} isWikiMode={isWikiMode}>
                    <div className="md:col-span-1 lg:col-span-1">
                        <FormInput label="Name" icon={Scale} value={entity.name} onChange={(v: string) => onUpdate({ ...entity, name: v })} isWikiMode={isWikiMode} />
                    </div>
                    <div className="md:col-span-1 lg:col-span-1">
                        <SmartSelect label="Belongs under" icon={FolderTree} ids={entity.belongsUnderId ? [entity.belongsUnderId] : []} type={entity.type === 'location' ? 'location' : 'note'} all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, belongsUnderId: ids[0] })} onCreate={onCreateNew} />
                    </div>
                    <FormInput label="Text color" icon={Type} value={entity.textColor} type="color" onChange={(v: string) => onUpdate({ ...entity, textColor: v })} isWikiMode={isWikiMode} />
                    <FormInput label="Background color" icon={PaintBucket} value={entity.backgroundColor} type="color" onChange={(v: string) => onUpdate({ ...entity, backgroundColor: v })} isWikiMode={isWikiMode} />
                    <div className="flex items-end pb-2">
                        <FormToggle label="Is finished" icon={CheckSquare} checked={entity.isFinished} onChange={(v: boolean) => onUpdate({ ...entity, isFinished: v })} isWikiMode={isWikiMode} />
                    </div>

                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-slate-500/5">
                        <FormToggle label="Is a minor document" icon={Search} checked={entity.isMinorDocument} onChange={(v: boolean) => onUpdate({ ...entity, isMinorDocument: v })} isWikiMode={isWikiMode} />
                        <FormToggle label="Is Dead/Gone/Destroyed" icon={Skull} checked={entity.isDead} onChange={(v: boolean) => onUpdate({ ...entity, isDead: v })} isWikiMode={isWikiMode} />
                        <FormToggle label="Is a category" icon={Box} checked={entity.isCategory} onChange={(v: boolean) => onUpdate({ ...entity, isCategory: v })} isWikiMode={isWikiMode} />
                        <FormInput label="Order number" icon={Hash} value={entity.orderNumber || ""} onChange={(v: string) => onUpdate({ ...entity, orderNumber: v })} isWikiMode={isWikiMode} />
                    </div>

                    <div className="lg:col-span-3">
                        <FormInput label="Tags" icon={Tag} value={entity.tags?.join(', ')} placeholder="Fantasy, Hero, Royal..." onChange={(v: string) => onUpdate({ ...entity, tags: v.split(',').map(s => s.trim()) })} isWikiMode={isWikiMode} />
                    </div>

                    <div className="lg:col-span-2">
                        <FormInput label="Document Template" icon={FileText} value={entity.documentTemplate || "None"} options={['None', 'Protagonist', 'Antagonist', 'NPC', 'Legendary', 'Deity']} onChange={(v: string) => onUpdate({ ...entity, documentTemplate: v })} isWikiMode={isWikiMode} />
                    </div>
                    <div className="lg:col-span-3">
                        <FormInput label="Extra HTML classes" icon={Code} value={entity.extraHtmlClasses || ""} onChange={(v: string) => onUpdate({ ...entity, extraHtmlClasses: v })} isWikiMode={isWikiMode} />
                    </div>
                    <div className="lg:col-span-3">
                        <FormInput label="Other Names & Epithets" icon={UserCircle} value={entity.otherNamesAndEpithets || ""} onChange={(v: string) => onUpdate({ ...entity, otherNamesAndEpithets: v })} isWikiMode={isWikiMode} />
                    </div>
                </EditorGroup>

                {/* 2. DESCRIPTION & HISTORY (UNIVERSAL) */}
                <EditorGroup title="Description & History" icon={BookOpen} isWikiMode={isWikiMode}>
                    <div className="lg:col-span-3 space-y-2">
                        <div className={`w-full p-4 rounded-xl border border-dashed text-[10px] font-bold uppercase opacity-40 text-center ${isWikiMode ? 'border-black/20' : 'border-white/20'}`}>
                            📜 The Great Narrative Scribe - Rich Text Interface Placeholder
                        </div>
                        <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-6 py-5 h-80 outline-none text-lg leading-relaxed shadow-sm`} 
                            placeholder="The echoes of history begin here..."
                            value={entity.description} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                    </div>
                </EditorGroup>

                {/* 3. LOCATION SPECIFIC SECTIONS */}
                {isLocation && (
                    <>
                        <EditorGroup title="Basic information" icon={Info} isWikiMode={isWikiMode}>
                            <SmartSelect label="Succeeding Locations/Geography" icon={MapPin} ids={loc.succeedingLocationIds} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, succeedingLocationIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Preceding Locations/Geography" icon={MapPin} ids={loc.precedingLocationIds} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, precedingLocationIds: ids })} onCreate={onCreateNew} />
                            <FormInput label="Date of creation" icon={Calendar} value={loc.dateOfCreation || ""} onChange={(v) => onUpdate({ ...loc, dateOfCreation: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Date of end" icon={Hourglass} value={loc.dateOfEnd || ""} onChange={(v) => onUpdate({ ...loc, dateOfEnd: v })} isWikiMode={isWikiMode} />
                            
                            <div className="lg:col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block flex items-center gap-2">
                                    <Sparkles size={12} className="opacity-60" /> Unusual features/Traits
                                </label>
                                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={loc.unusualFeatures} onChange={e => onUpdate({ ...loc, unusualFeatures: e.target.value })} />
                            </div>

                            <FormInput label="Location type" icon={Anchor} value={loc.locationType || ""} options={['Settlement', 'Dungeon', 'Empire', 'Wilderness', 'Holy Ground', 'Ruins', 'Planar Overlay']} onChange={(v) => onUpdate({ ...loc, locationType: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Population" icon={Users} value={loc.population || ""} onChange={(v) => onUpdate({ ...loc, population: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Size" icon={Maximize} value={loc.size || ""} onChange={(v) => onUpdate({ ...loc, size: v })} isWikiMode={isWikiMode} />
                            
                            <SmartSelect label="Local Languages" icon={MessageSquare} ids={loc.localLanguageIds} type="language" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, localLanguageIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Local Currencies" icon={Coins} ids={loc.localCurrencyIds} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, localCurrencyIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Local Cultures/Art" icon={Home} ids={loc.localCultureIds} type="culture" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, localCultureIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Common Occupations/Classes" icon={Pickaxe} ids={loc.commonOccupationIds} type="occupation" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, commonOccupationIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Local Resources/Materials" icon={Gem} ids={loc.localResourceIds} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, localResourceIds: ids })} onCreate={onCreateNew} />
                            
                            <div className="lg:col-span-1.5 md:col-span-1">
                                <SmartSelect label="Neighbouring Locations" icon={MapPin} ids={loc.neighbouringLocationIds} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, neighbouringLocationIds: ids })} onCreate={onCreateNew} />
                            </div>
                            <div className="lg:col-span-1.5 md:col-span-1">
                                <SmartSelect label="Other connected Locations" icon={MapPin} ids={loc.otherConnectedLocationIds} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, otherConnectedLocationIds: ids })} onCreate={onCreateNew} />
                            </div>
                        </EditorGroup>

                        <EditorGroup title="Traditions & Customs" icon={Tent} isWikiMode={isWikiMode}>
                            <div className="lg:col-span-3 space-y-2">
                                <div className={`w-full p-4 rounded-xl border border-dashed text-[10px] font-bold uppercase opacity-40 text-center ${isWikiMode ? 'border-black/20' : 'border-white/20'}`}>
                                    📜 Local Customs, Rituals & Cultural Nuances
                                </div>
                                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-6 py-5 h-64 outline-none text-lg leading-relaxed shadow-sm`} 
                                    placeholder="Describe the heartbeat of this place..."
                                    value={loc.traditionsAndCustoms} onChange={e => onUpdate({ ...loc, traditionsAndCustoms: e.target.value })} />
                            </div>
                        </EditorGroup>

                        <EditorGroup title="Resident information" icon={UserCircle} isWikiMode={isWikiMode}>
                            <div className="lg:col-span-1">
                                <SmartSelect label="Characters originated from the location" icon={User} ids={loc.originatedCharacterIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, originatedCharacterIds: ids })} onCreate={onCreateNew} />
                            </div>
                            <div className="lg:col-span-1">
                                <SmartSelect label="Characters currently living in the location" icon={User} ids={loc.livingCharacterIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, livingCharacterIds: ids })} onCreate={onCreateNew} />
                            </div>
                            <div className="lg:col-span-1">
                                <SmartSelect label="Characters deceased at the location" icon={User} ids={loc.deceasedCharacterIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, deceasedCharacterIds: ids })} onCreate={onCreateNew} />
                            </div>
                            <div className="lg:col-span-1.5 md:col-span-1">
                                <SmartSelect label="Other connected Characters" icon={User} ids={loc.connectedCharacterIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, connectedCharacterIds: ids })} onCreate={onCreateNew} />
                            </div>
                            <div className="lg:col-span-1.5 md:col-span-1">
                                <SmartSelect label="Local Species/Races/Flora/Fauna" icon={Leaf} ids={loc.localSpeciesIds} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, localSpeciesIds: ids })} onCreate={onCreateNew} />
                            </div>
                        </EditorGroup>

                        <EditorGroup title="Governance Connections" icon={Anchor} isWikiMode={isWikiMode}>
                            <div className="lg:col-span-3 border-b border-slate-500/10 pb-4 mb-4">
                                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Governing Authorities</h3>
                                <p className="text-[9px] opacity-40 italic">Groups that wield primary power over this territory</p>
                            </div>
                            <GroupRoleGroup label="Governing Ideologies/Political groups" roleKey="political" isWikiMode={isWikiMode} entity={loc} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, governingGroupConnections: {...loc.governingGroupConnections, political: d.groupConnections.political}})} onCreateNew={onCreateNew} isCustomGoverning />
                            <GroupRoleGroup label="Governing Organizations/Other groups" roleKey="organization" isWikiMode={isWikiMode} entity={loc} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, governingGroupConnections: {...loc.governingGroupConnections, organization: d.groupConnections.organization}})} onCreateNew={onCreateNew} isCustomGoverning />
                            <GroupRoleGroup label="Governing Teachings/Religious groups" roleKey="religious" isWikiMode={isWikiMode} entity={loc} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, governingGroupConnections: {...loc.governingGroupConnections, religious: d.groupConnections.religious}})} onCreateNew={onCreateNew} isCustomGoverning />
                            <GroupRoleGroup label="Governing Schools of Magic/Magical groups" roleKey="magic" isWikiMode={isWikiMode} entity={loc} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, governingGroupConnections: {...loc.governingGroupConnections, magic: d.groupConnections.magic}})} onCreateNew={onCreateNew} isCustomGoverning />
                            <GroupRoleGroup label="Governing Sciences/Technological groups" roleKey="science" isWikiMode={isWikiMode} entity={loc} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, governingGroupConnections: {...loc.governingGroupConnections, science: d.groupConnections.science}})} onCreateNew={onCreateNew} isCustomGoverning />
                        </EditorGroup>

                        <EditorGroup title="Influential Connections" icon={Globe} isWikiMode={isWikiMode}>
                            <div className="lg:col-span-3 border-b border-slate-500/10 pb-4 mb-4">
                                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Connected Entities</h3>
                                <p className="text-[9px] opacity-40 italic">Groups with significant influence but no formal authority</p>
                            </div>
                            <GroupRoleGroup label="Connected Ideologies/Political groups" roleKey="political" isWikiMode={isWikiMode} entity={loc} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Connected Organizations/Other groups" roleKey="organization" isWikiMode={isWikiMode} entity={loc} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Connected Teachings/Religious groups" roleKey="religious" isWikiMode={isWikiMode} entity={loc} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Connected Schools of Magic/Magical groups" roleKey="magic" isWikiMode={isWikiMode} entity={loc} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Connected Sciences/Technological groups" roleKey="science" isWikiMode={isWikiMode} entity={loc} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                        </EditorGroup>
                    </>
                )}

                {/* character specific content */}
                {entity.type === 'character' && (
                    <>
                        <EditorGroup title="Basic information" icon={Info} isWikiMode={isWikiMode}>
                            <div className="lg:col-span-3">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Titles</label>
                                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-20 outline-none resize-none text-sm shadow-sm`} value={entity.titles} onChange={e => onUpdate({ ...entity, titles: e.target.value })} />
                            </div>
                            
                            <FormInput label="Sex" value={entity.sex} options={['Male', 'Female', 'Non-binary', 'Fluid', 'Other']} onChange={(v: string) => onUpdate({ ...entity, sex: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Age" value={entity.age} onChange={(v: string) => onUpdate({ ...entity, age: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Height" value={entity.height} onChange={(v: string) => onUpdate({ ...entity, height: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Weight" value={entity.weight} onChange={(v: string) => onUpdate({ ...entity, weight: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Date of birth" value={entity.dateOfBirth} onChange={(v: string) => onUpdate({ ...entity, dateOfBirth: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Date of death" value={entity.dateOfDeath} onChange={(v: string) => onUpdate({ ...entity, dateOfDeath: v })} isWikiMode={isWikiMode} />
                            
                            <SmartSelect label="Species/Races" ids={entity.speciesIds} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, speciesIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Occupation/Class" ids={entity.occupationIds} type="occupation" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, occupationIds: ids })} onCreate={onCreateNew} />
                            <FormInput label="Ethnicity" value={entity.ethnicity} onChange={(v: string) => onUpdate({ ...entity, ethnicity: v })} isWikiMode={isWikiMode} />
                            <FormInput label="Combat rating" value={entity.combatRating} options={['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']} onChange={(v: string) => onUpdate({ ...entity, combatRating: v })} isWikiMode={isWikiMode} />
                            
                            <SmartSelect label="Place of residence" ids={entity.placeOfResidenceId || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, placeOfResidenceId: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Place of origin" ids={entity.placeOfOriginId || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, placeOfOriginId: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Place of demise" ids={entity.placeOfDemiseId || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, placeOfDemiseId: ids })} onCreate={onCreateNew} />
                            
                            <SmartSelect label="Affected by Boons" ids={entity.affectedByBoonsIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, affectedByBoonsIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Affected by Afflictions" ids={entity.affectedByAfflictionsIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, affectedByAfflictionsIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Affected by Other conditions" ids={entity.affectedByOtherConditionsIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, affectedByOtherConditionsIds: ids })} onCreate={onCreateNew} />
                        </EditorGroup>

                        <EditorGroup title="Skills, Stats, Knowledge & Characteristics" icon={Zap} isWikiMode={isWikiMode}>
                            <div className="lg:col-span-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Traits & Characteristics</label>
                                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traitsAndCharacteristics} onChange={e => onUpdate({ ...entity, traitsAndCharacteristics: e.target.value })} />
                            </div>
                            <div className="lg:col-span-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Unique/Unusual Features</label>
                                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.unusualFeatures} onChange={e => onUpdate({ ...entity, unusualFeatures: e.target.value })} />
                            </div>

                            <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-6 gap-6 p-6 rounded-3xl border border-slate-500/10 bg-black/5">
                                <h4 className="col-span-full text-[10px] font-black uppercase text-slate-500 border-b pb-2 mb-2 flex items-center gap-2">Stats/Attributes</h4>
                                <FormInput label="STR" value={entity.stats?.strength} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, strength: v } })} isWikiMode={isWikiMode} />
                                <FormInput label="DEX" value={entity.stats?.dexterity} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, dexterity: v } })} isWikiMode={isWikiMode} />
                                <FormInput label="CON" value={entity.stats?.constitution} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, constitution: v } })} isWikiMode={isWikiMode} />
                                <FormInput label="INT" value={entity.stats?.intelligence} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, intelligence: v } })} isWikiMode={isWikiMode} />
                                <FormInput label="WIS" value={entity.stats?.wisdom} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, wisdom: v } })} isWikiMode={isWikiMode} />
                                <FormInput label="CHA" value={entity.stats?.charisma} onChange={(v: string) => onUpdate({ ...entity, stats: { ...entity.stats, charisma: v } })} isWikiMode={isWikiMode} />
                            </div>

                            <SmartSelect label="Equipment/Items" ids={entity.equipmentIds || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, equipmentIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Wealth/Currencies" ids={entity.wealthIds || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, wealthIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Known Skills" ids={entity.skillIds} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, skillIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Known Spells" ids={entity.spellIds} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, spellIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Languages" ids={entity.languageIds} type="language" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, languageIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Magical teachings" ids={entity.magicalTeachingIds} type="magic" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, magicalTeachingIds: ids })} onCreate={onCreateNew} />
                        </EditorGroup>

                        <EditorGroup title="Relationships" icon={Heart} isWikiMode={isWikiMode}>
                            <SmartSelect label="Parents" ids={entity.parentIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, parentIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Children" ids={entity.childrenIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, childrenIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Relatives" ids={entity.relativeIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, relativeIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Friends" ids={entity.friendIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, friendIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Enemies" ids={entity.enemyIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, enemyIds: ids })} onCreate={onCreateNew} />
                            <SmartSelect label="Complicated" ids={entity.complicatedWithIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, complicatedWithIds: ids })} onCreate={onCreateNew} />
                        </EditorGroup>

                        <EditorGroup title="Groups/Teachings" icon={Swords} isWikiMode={isWikiMode}>
                            <GroupRoleGroup label="Political groups" roleKey="political" isWikiMode={isWikiMode} entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Organizations" roleKey="organization" isWikiMode={isWikiMode} entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Religious groups" roleKey="religious" isWikiMode={isWikiMode} entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Magical groups" roleKey="magic" isWikiMode={isWikiMode} entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                            <GroupRoleGroup label="Technological groups" roleKey="science" isWikiMode={isWikiMode} entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                        </EditorGroup>
                    </>
                )}

                {/* 4. UNIVERSAL CONNECTIONS */}
                <EditorGroup title="World & Details" icon={Scroll} isWikiMode={isWikiMode}>
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                        <SmartSelect label="Lore Notes" icon={BookOpen} ids={entity.loreNoteIds} type="note" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, loreNoteIds: ids })} onCreate={onCreateNew} />
                        <SmartSelect label="Myths & Legends" icon={Scroll} ids={entity.mythIds} type="myth" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, mythIds: ids })} onCreate={onCreateNew} />
                    </div>
                    
                    <SmartSelect label="Connected to Events" icon={Calendar} ids={entity.eventIds} type="event" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, eventIds: ids })} onCreate={onCreateNew} />
                    <SmartSelect label="Connected to Skills/Spells/Other" icon={Zap} ids={entity.detailSkillIds} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, detailSkillIds: ids })} onCreate={onCreateNew} />
                    <SmartSelect label="Connected to Items" icon={Pencil} ids={entity.detailItemIds} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, detailItemIds: ids })} onCreate={onCreateNew} />
                    
                    <SmartSelect label="Affected by Boons" icon={Sun} ids={entity.detailConditionIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, detailConditionIds: ids })} onCreate={onCreateNew} />
                    <SmartSelect label="Affected by Afflictions" icon={Moon} ids={entity.detailConditionIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, detailConditionIds: ids })} onCreate={onCreateNew} />
                    <SmartSelect label="Affected by Other conditions" icon={Sun} ids={entity.detailResourceIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, detailResourceIds: ids })} onCreate={onCreateNew} />
                </EditorGroup>

                {/* 5. SECRETS (UNIVERSAL) */}
                <EditorGroup title="Secrets/Spoilers/DM notes" icon={Ghost} isWikiMode={isWikiMode}>
                    <div className="lg:col-span-3">
                        <textarea className={`w-full ${isWikiMode ? 'bg-[#fff5f5] border-rose-200 text-rose-900' : 'bg-slate-950 border-rose-900/30 text-rose-300'} border rounded-2xl px-6 py-4 h-48 outline-none font-mono text-sm leading-relaxed shadow-sm`} 
                            placeholder="Private ruminations only visible in the scroll of creation..."
                            value={entity.privateNotes} onChange={e => onUpdate({ ...entity, privateNotes: e.target.value })} />
                    </div>
                </EditorGroup>
            </fieldset>
        </div>
    );
};
