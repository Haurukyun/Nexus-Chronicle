
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Plus, Search, Book, BookOpen, Users, Map as MapIcon, Languages, Swords, History, 
    ChevronRight, ChevronDown, Save, Trash2, Sparkles, Globe, MapPin, 
    Link as LinkIcon, Scroll, Library, Zap, Shield, Briefcase, X, ExternalLink,
    Settings, Info, Heart, Eye, Award, DollarSign, Ghost, Skull, Flag, Compass, Check,
    LayoutGrid, Maximize2, Columns, BookMarked, RefreshCw, Trash, Palette, FileText,
    Brain, FlaskConical, GraduationCap, Scale
} from 'lucide-react';
import { EntityType, WorldEntity, Character, WorldData, GroupRoleLinks } from './types';

// --- Constants ---
const TYPE_LABELS: Record<EntityType, string> = {
    chapter: 'Chapters', note: 'Lore Notes', myth: 'Myths/Legends',
    character: 'Characters', location: 'Locations', event: 'Events',
    species: 'Species/Races', language: 'Languages', culture: 'Cultures/Arts',
    political: 'Political Groups', religious: 'Religious Groups', organization: 'Organizations',
    magic: 'Magical Groups', science: 'Technological Groups',
    ability: 'Skills/Spells', item: 'Items', occupation: 'Occupations', condition: 'Conditions', resource: 'Materials'
};

const HIERARCHY_CONFIG = [
    { id: 'story', label: 'Story/Lore', icon: Library, types: ['chapter', 'note', 'myth'] as EntityType[] },
    { id: 'world', label: 'World', icon: Globe, types: ['character', 'location', 'event', 'species', 'language', 'culture'] as EntityType[] },
    { id: 'groups', label: 'Groups/Teachings', icon: Swords, types: ['political', 'religious', 'organization', 'magic', 'science'] as EntityType[] },
    { id: 'details', label: 'Details', icon: Scroll, types: ['ability', 'item', 'occupation', 'condition', 'resource'] as EntityType[] }
];

// --- Form Components ---

const FormInput = ({ label, value, onChange, placeholder, type = "text", isWikiMode }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>
        <input 
            type={type} 
            className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-lg px-3 py-2 text-sm outline-none transition-all focus:ring-1 ${isWikiMode ? 'focus:ring-red-500' : 'focus:ring-yellow-500'}`} 
            value={value || ''} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder} 
        />
    </div>
);

const FormToggle = ({ label, value, onChange, isWikiMode }: any) => (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 transition-all">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>
        <button 
            onClick={() => onChange(!value)}
            className={`w-10 h-5 rounded-full relative transition-all ${value ? (isWikiMode ? 'bg-[#b91c1c]' : 'bg-[#fef08a]') : 'bg-slate-600'}`}
        >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-5.5' : 'left-0.5'}`} />
        </button>
    </div>
);

const SmartSelect = ({ label, ids, type, all, onChange, onCreate, isWikiMode }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const filtered = all.filter((e: any) => e.type === type && e.name.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleId = (id: string) => {
        if (ids.includes(id)) onChange(ids.filter((i: string) => i !== id));
        else onChange([...ids, id]);
    };

    const bgInput = isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700';
    const tagClass = isWikiMode ? 'bg-[#b91c1c]/10 text-[#b91c1c] border-[#b91c1c]/30' : 'bg-[#fef08a]/10 text-[#fef08a] border-[#fef08a]/30';

    return (
        <div className="space-y-1 relative" ref={dropdownRef}>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full ${bgInput} border rounded-lg p-2 text-xs flex flex-wrap gap-1 cursor-pointer min-h-[38px] transition-colors`}
            >
                {ids.length === 0 && <span className="text-slate-400">Add connection...</span>}
                {ids.map((id: string) => (
                    <span key={id} className={`${tagClass} px-2 py-0.5 rounded border flex items-center gap-1 group/tag`}>
                        {all.find((e: any) => e.id === id)?.name || 'Unknown'}
                        <X size={10} className="hover:text-black cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleId(id); }} />
                    </span>
                ))}
            </div>
            {isOpen && (
                <div className={`absolute top-full left-0 w-full mt-1 ${isWikiMode ? 'bg-[#f5e6d3] border-[#d4c8af]' : 'bg-slate-900 border-slate-700'} border rounded-lg shadow-2xl z-[100] overflow-hidden`}>
                    <div className="p-2 border-b border-slate-800/10">
                        <input autoFocus placeholder="Filter..." className={`w-full ${isWikiMode ? 'bg-white' : 'bg-slate-800'} rounded px-2 py-1 text-xs focus:ring-0 outline-none`}
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {filtered.length === 0 && search && (
                            <button onClick={() => { onCreate(type, search); setIsOpen(false); setSearch(""); }}
                                className={`w-full text-left px-3 py-2 text-xs ${isWikiMode ? 'text-[#b91c1c] hover:bg-black/5' : 'text-[#fef08a] hover:bg-slate-800'} flex items-center gap-2 font-bold`}>
                                <Plus size={12} /> Create "{search}"
                            </button>
                        )}
                        {filtered.map((o: any) => (
                            <button key={o.id} onClick={() => toggleId(o.id)}
                                className={`w-full text-left px-3 py-2 text-xs flex justify-between items-center transition-colors ${ids.includes(o.id) ? (isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-[#fef08a] text-black font-bold') : (isWikiMode ? 'text-slate-700 hover:bg-black/5' : 'text-slate-500 hover:bg-slate-800')}`}>
                                {o.name} {ids.includes(o.id) && <Check size={12} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- View Helpers ---

const TaperedDivider = () => (
    <svg height="5" width="100%" className="my-1 overflow-visible">
        <path d="M 0 2.5 L 500 2.5" stroke="#7a200d" strokeWidth="3" fill="none" className="w-full" />
    </svg>
);

const FieldRow = ({ label, value, isWikiMode }: any) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
        <div className="py-2 border-b border-slate-500/10 last:border-0 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
            <span className={`text-[9px] font-black uppercase tracking-widest shrink-0 w-32 ${isWikiMode ? 'text-[#854d0e]' : 'text-slate-500'}`}>{label}</span>
            <span className={`text-sm ${isWikiMode ? 'text-[#1a1a1a]' : 'text-slate-300'}`}>{value}</span>
        </div>
    );
};

const WikiStatRow = ({ label, value, boldLabel = true }: any) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
        <div className="text-sm leading-tight my-1">
            <span className={`${boldLabel ? 'font-bold' : ''} text-[#7a200d]`}>{label}</span>{' '}
            <span className="text-[#2d2d2d]">{value}</span>
        </div>
    );
};

const WikiInfoboxRow = ({ label, value }: { label: string, value?: string }) => {
    if (!value) return null;
    return (
        <tr className="border-b border-[#d4c8af]/40 last:border-0 hover:bg-black/5 transition-colors">
            <th className="p-2 text-[#7a200d] font-bold text-[11px] uppercase tracking-tight text-left align-top">{label}</th>
            <td className="p-2 text-[#2d2d2d] font-medium text-xs text-right">{value}</td>
        </tr>
    );
};

const LinksDisplay = ({ label, ids, all, onNav, isWikiMode, wikiStyle = 'tag' }: any) => {
    if (!ids || ids.length === 0) return null;
    
    if (isWikiMode && wikiStyle === 'inline') {
        return (
            <div className="text-sm leading-tight my-1">
                <span className="font-bold text-[#7a200d]">{label}</span>{' '}
                <span className="text-[#2d2d2d]">
                    {ids.map((id: string, idx: number) => {
                        const ent = all.find((e: any) => e.id === id);
                        if (!ent) return null;
                        return (
                            <React.Fragment key={id}>
                                <button onClick={() => onNav(id)} className="text-[#7a200d] hover:underline transition-all">
                                    {ent.name}
                                </button>
                                {idx < ids.length - 1 ? ', ' : ''}
                            </React.Fragment>
                        );
                    })}
                </span>
            </div>
        );
    }

    return (
        <div className="py-3 border-b border-slate-500/10 last:border-0 flex flex-col gap-2">
            <span className={`text-[9px] font-black uppercase tracking-widest ${isWikiMode ? 'text-[#854d0e]' : 'text-slate-500'}`}>{label}</span>
            <div className="flex flex-wrap gap-2">
                {ids.map((id: string) => {
                    const ent = all.find((e: any) => e.id === id);
                    if (!ent) return null;
                    return (
                        <button key={id} onClick={() => onNav(id)} className={`px-2 py-0.5 text-xs rounded border transition-all ${isWikiMode ? 'border-[#d4c8af] bg-white text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white' : 'border-slate-700 bg-slate-800/60 text-[#fef08a] hover:bg-[#fef08a] hover:text-slate-950'}`}>
                            {ent.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// --- Main Components ---

const EntityEditor = ({ entity, allEntities, onSave, onCancel, onCreateNew, isWikiMode, onUpdate }: any) => {
    const EditorGroup = ({ title, icon: Icon, children }: any) => (
        <div className={`mb-8 border rounded-2xl overflow-hidden shadow-lg ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-900/40 border-slate-700'}`}>
            <div className={`px-6 py-3 border-b flex items-center gap-3 ${isWikiMode ? 'bg-[#f5e6d3] border-[#d4c8af]' : 'bg-slate-900/80 border-slate-800'}`}>
                <Icon size={16} className={isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]'} />
                <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isWikiMode ? 'text-[#854d0e]' : 'text-[#fef08a]'}`}>{title}</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {children}
            </div>
        </div>
    );

    const GroupRoleGroup = ({ label, roleKey }: any) => {
        const roles = ['leadingFigureOf', 'connectedTo', 'memberOf', 'allyOf', 'enemyOf'];
        const typeMap: Record<string, EntityType> = {
            political: 'political', organization: 'organization', religious: 'religious', magic: 'magic', science: 'science'
        };
        return (
            <div className={`lg:col-span-3 p-4 rounded-xl border ${isWikiMode ? 'bg-[#fef9c3]/20 border-[#d4c8af]' : 'bg-slate-950/30 border-slate-800'}`}>
                <h4 className="text-[9px] font-black uppercase text-slate-500 mb-4 border-b pb-1">{label}</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {roles.map(r => (
                        <SmartSelect key={r} isWikiMode={isWikiMode} all={allEntities} label={r.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} ids={entity.groupConnections[roleKey][r]} type={typeMap[roleKey]} onChange={(ids: string[]) => onUpdate({...entity, groupConnections: {...entity.groupConnections, [roleKey]: {...entity.groupConnections[roleKey], [r]: ids}}})} onCreate={onCreateNew} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto pb-40">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h2 className={`text-4xl font-serif font-black uppercase tracking-tighter ${isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]'}`}>Inscribing Record</h2>
                    <p className="opacity-50 text-xs italic">Currently editing: <span className="font-bold underline">{entity.name}</span></p>
                </div>
                <div className="flex gap-4">
                    <button onClick={onCancel} className="px-6 py-2 text-slate-500 font-bold hover:text-red-500 transition-colors uppercase text-[10px]">Close</button>
                    <button onClick={onSave} className={`px-10 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest ${isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-[#fef08a] text-slate-950'}`}>Commit Archive</button>
                </div>
            </header>

            <EditorGroup title="Document Settings" icon={Settings}>
                <div className="lg:col-span-2">
                    <FormInput label="Name" value={entity.name} onChange={(v: string) => onUpdate({...entity, name: v})} isWikiMode={isWikiMode} />
                </div>
                <FormInput label="Belongs Under" value={entity.belongsUnderId} onChange={(v: string) => onUpdate({...entity, belongsUnderId: v})} isWikiMode={isWikiMode} />
                <FormInput label="Text Color" value={entity.textColor} type="color" onChange={(v: string) => onUpdate({...entity, textColor: v})} isWikiMode={isWikiMode} />
                <FormInput label="Background Color" value={entity.backgroundColor} type="color" onChange={(v: string) => onUpdate({...entity, backgroundColor: v})} isWikiMode={isWikiMode} />
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-b py-3 my-2 border-slate-500/10">
                    <FormToggle label="Read-only mode" value={entity.isReadOnly} onChange={(v: boolean) => onUpdate({...entity, isReadOnly: v})} isWikiMode={isWikiMode} />
                    <FormToggle label="Minor document" value={entity.isMinorDocument} onChange={(v: boolean) => onUpdate({...entity, isMinorDocument: v})} isWikiMode={isWikiMode} />
                    <FormToggle label="Dead/Gone/Destroyed" value={entity.isDead} onChange={(v: boolean) => onUpdate({...entity, isDead: v})} isWikiMode={isWikiMode} />
                    <FormToggle label="Category" value={entity.isCategory} onChange={(v: boolean) => onUpdate({...entity, isCategory: v})} isWikiMode={isWikiMode} />
                </div>
                <div className="lg:col-span-2">
                    <FormInput label="Tags" value={entity.tags?.join(', ')} onChange={(v: string) => onUpdate({...entity, tags: v.split(',').map(s => s.trim())})} isWikiMode={isWikiMode} />
                </div>
                <FormInput label="Other Names" value={entity.otherNames} onChange={(v: string) => onUpdate({...entity, otherNames: v})} isWikiMode={isWikiMode} />
            </EditorGroup>

            {entity.type === 'character' && (
                <>
                    <EditorGroup title="Basic Information" icon={Info}>
                        <FormInput label="Titles" value={entity.titles} onChange={(v: string) => onUpdate({...entity, titles: v})} isWikiMode={isWikiMode} />
                        <FormInput label="Sex" value={entity.sex} onChange={(v: string) => onUpdate({...entity, sex: v})} isWikiMode={isWikiMode} />
                        <FormInput label="Other" value={entity.otherBasicInfo} onChange={(v: string) => onUpdate({...entity, otherBasicInfo: v})} isWikiMode={isWikiMode} />
                        <FormInput label="Age" value={entity.age} onChange={(v: string) => onUpdate({...entity, age: v})} isWikiMode={isWikiMode} />
                        <FormInput label="Height" value={entity.height} onChange={(v: string) => onUpdate({...entity, height: v})} isWikiMode={isWikiMode} />
                        <FormInput label="Weight" value={entity.weight} onChange={(v: string) => onUpdate({...entity, weight: v})} isWikiMode={isWikiMode} />
                        <FormInput label="Date of birth" value={entity.dateOfBirth} onChange={(v: string) => onUpdate({...entity, dateOfBirth: v})} isWikiMode={isWikiMode} />
                        <FormInput label="Date of death" value={entity.dateOfDeath} onChange={(v: string) => onUpdate({...entity, dateOfDeath: v})} isWikiMode={isWikiMode} />
                        <SmartSelect label="Species/Races" ids={entity.speciesIds} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, speciesIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Occupation/Class" ids={entity.occupationIds} type="occupation" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, occupationIds: ids})} onCreate={onCreateNew} />
                        <FormInput label="Ethnicity" value={entity.ethnicity} onChange={(v: string) => onUpdate({...entity, ethnicity: v})} isWikiMode={isWikiMode} />
                        <FormInput label="Combat rating" value={entity.combatRating} onChange={(v: string) => onUpdate({...entity, combatRating: v})} isWikiMode={isWikiMode} />
                        <FormInput label="Place of residence" value={entity.placeOfResidenceId} onChange={(v: string) => onUpdate({...entity, placeOfResidenceId: v})} isWikiMode={isWikiMode} />
                        <FormInput label="Place of origin" value={entity.placeOfOriginId} onChange={(v: string) => onUpdate({...entity, placeOfOriginId: v})} isWikiMode={isWikiMode} />
                        <FormInput label="Place of demise" value={entity.placeOfDemiseId} onChange={(v: string) => onUpdate({...entity, placeOfDemiseId: v})} isWikiMode={isWikiMode} />
                        <SmartSelect label="Affected by Boons" ids={entity.affectedByBoonsIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, affectedByBoonsIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Affected by Afflictions" ids={entity.affectedByAfflictionsIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, affectedByAfflictionsIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Affected by Other conditions" ids={entity.affectedByOtherConditionsIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, affectedByOtherConditionsIds: ids})} onCreate={onCreateNew} />
                    </EditorGroup>

                    <EditorGroup title="Description & History" icon={BookOpen}>
                        <div className="lg:col-span-3 space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Description Summary</label>
                            <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-48 outline-none resize-none text-base`} value={entity.description} onChange={e => onUpdate({...entity, description: e.target.value})} />
                        </div>
                        <div className="lg:col-span-3">
                            <FormInput label="Traits & Characteristics" value={entity.traitsAndCharacteristics} onChange={(v: string) => onUpdate({...entity, traitsAndCharacteristics: v})} isWikiMode={isWikiMode} />
                        </div>
                        <div className="lg:col-span-3">
                            <FormInput label="Unique/Unusual Features" value={entity.unusualFeatures} onChange={(v: string) => onUpdate({...entity, unusualFeatures: v})} isWikiMode={isWikiMode} />
                        </div>
                        <div className="lg:col-span-3 grid grid-cols-4 gap-4 p-4 rounded-xl border border-slate-500/10">
                            <h4 className="col-span-4 text-[9px] font-black uppercase text-slate-500 border-b pb-1">Stats/Attributes</h4>
                            <FormInput label="test" value={entity.stats?.test} onChange={(v: string) => onUpdate({...entity, stats: {...entity.stats, test: v}})} isWikiMode={isWikiMode} />
                            <FormInput label="Wisdom" value={entity.stats?.wisdom} onChange={(v: string) => onUpdate({...entity, stats: {...entity.stats, wisdom: v}})} isWikiMode={isWikiMode} />
                            <FormInput label="Stat/Attribute" value={entity.stats?.attribute} onChange={(v: string) => onUpdate({...entity, stats: {...entity.stats, attribute: v}})} isWikiMode={isWikiMode} />
                            <FormInput label="Messed up" value={entity.stats?.messedUp} onChange={(v: string) => onUpdate({...entity, stats: {...entity.stats, messedUp: v}})} isWikiMode={isWikiMode} />
                        </div>
                        <div className="lg:col-span-3"><FormInput label="Equipment/Owned Items" value={entity.equipment} onChange={(v: string) => onUpdate({...entity, equipment: v})} isWikiMode={isWikiMode} /></div>
                        <div className="lg:col-span-3"><FormInput label="Wealth/Owned Currencies" value={entity.wealth} onChange={(v: string) => onUpdate({...entity, wealth: v})} isWikiMode={isWikiMode} /></div>
                        <SmartSelect label="Known Skills/Abilities" ids={entity.skillIds} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, skillIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Known Spells" ids={entity.spellIds} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, spellIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Known Languages" ids={entity.languageIds} type="language" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, languageIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Known Magical teachings" ids={entity.magicalTeachingIds} type="magic" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, magicalTeachingIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Known Technologies/Sciences" ids={entity.technologyIds} type="science" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, technologyIds: ids})} onCreate={onCreateNew} />
                    </EditorGroup>

                    <EditorGroup title="Relationships" icon={Heart}>
                        <SmartSelect label="Parents of the Character" ids={entity.parentIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, parentIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Children of the Character" ids={entity.childrenIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, childrenIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Other relatives of the Character" ids={entity.relativeIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, relativeIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Friends/Allies" ids={entity.friendIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, friendIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Enemies" ids={entity.enemyIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, enemyIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Complicated relationship with" ids={entity.complicatedWithIds} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, complicatedWithIds: ids})} onCreate={onCreateNew} />
                    </EditorGroup>

                    <EditorGroup title="Story/Lore & World Connections" icon={Globe}>
                        <SmartSelect label="Lore notes/Other notes" ids={entity.loreNoteIds} type="note" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, loreNoteIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Myths, legends and stories" ids={entity.mythIds} type="myth" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, mythIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Took part in Events" ids={entity.eventIds} type="event" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, eventIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Connected to Locations" ids={entity.locationIds} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, locationIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Connected to Languages" ids={entity.languageIds} type="language" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, languageIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Connected Cultures/Art" ids={entity.cultureIds} type="culture" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, cultureIds: ids})} onCreate={onCreateNew} />
                    </EditorGroup>

                    <EditorGroup title="Groups/Teachings Connections" icon={Swords}>
                        <GroupRoleGroup label="Ideologies/Political groups" roleKey="political" />
                        <GroupRoleGroup label="Organizations/Other groups" roleKey="organization" />
                        <GroupRoleGroup label="Teachings/Religious groups" roleKey="religious" />
                        <GroupRoleGroup label="Schools of Magic/Magical groups" roleKey="magic" />
                        <GroupRoleGroup label="Sciences/Technological groups" roleKey="science" />
                    </EditorGroup>

                    <EditorGroup title="Details Connections" icon={Scroll}>
                        <SmartSelect label="Skills/Spells/Other" ids={entity.detailSkillIds} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, detailSkillIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Connected to Items" ids={entity.detailItemIds} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, detailItemIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Afflictions/Boons/Conditions" ids={entity.detailConditionIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, detailConditionIds: ids})} onCreate={onCreateNew} />
                        <SmartSelect label="Resources/Materials" ids={entity.detailResourceIds} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids: string[]) => onUpdate({...entity, detailResourceIds: ids})} onCreate={onCreateNew} />
                    </EditorGroup>

                    <EditorGroup title="Secrets/Spoilers/DM notes" icon={Ghost}>
                         <div className="lg:col-span-3">
                            <textarea className={`w-full ${isWikiMode ? 'bg-[#fff5f5] border-rose-200 text-rose-900' : 'bg-slate-950 border-rose-900/30 text-rose-300'} border rounded-xl px-4 py-3 h-48 outline-none font-mono text-sm`} value={entity.privateNotes} onChange={e => onUpdate({...entity, privateNotes: e.target.value})} />
                        </div>
                    </EditorGroup>
                </>
            )}
        </div>
    );
};

const EntityViewer = ({ entity, allEntities, onEdit, onDelete, onNavigate, isWikiMode }: any) => {
    const isChar = entity.type === 'character';
    const accent = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    
    // Header for Codex mode
    const CodexHeader = () => (
        <header className="border-b border-slate-800/80 pb-12 flex justify-between items-end mb-12">
            <div>
                <div className="flex items-center gap-3 text-[#fef08a] mb-4 uppercase tracking-[0.4em] font-black text-[10px]"><Scroll size={14} /> Record Entry</div>
                <h1 className="text-[7rem] font-serif font-black text-white tracking-tighter uppercase leading-[0.8] mb-4">{entity.name}</h1>
                {entity.otherNames && <p className="text-slate-500 text-3xl font-serif italic opacity-60">"{entity.otherNames}"</p>}
            </div>
            <div className="flex gap-4">
                <button onClick={onEdit} className="bg-[#fef08a] text-slate-950 px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all">Edit Scroll</button>
                <button onClick={onDelete} className="p-4 text-rose-500 hover:bg-rose-500/10 rounded-full transition-all"><Trash2 size={24} /></button>
            </div>
        </header>
    );

    // Header for Wiki mode
    const WikiHeader = () => (
        <header className="border-b-4 border-[#b91c1c] pb-2 flex justify-between items-end mb-10">
            <div>
                <h1 className="text-6xl font-serif font-bold text-[#b91c1c] uppercase tracking-tight leading-none">{entity.name}</h1>
                {entity.otherNames && <p className="text-[#854d0e] text-lg font-serif italic mt-1">"{entity.otherNames}"</p>}
            </div>
            <div className="flex gap-3 pb-2">
                <button onClick={onEdit} className="p-2 hover:bg-black/5 rounded text-slate-500" title="Edit"><Save size={20} /></button>
                <button onClick={onDelete} className="p-2 hover:bg-rose-500/10 rounded text-rose-700" title="Trash"><Trash2 size={20} /></button>
            </div>
        </header>
    );

    // "Goblin" Style Stat Block for Characters in Wiki Mode
    const CharacterStatBlock = () => {
        const char = entity as Character;
        const subtitle = [
            char.sex,
            char.ethnicity,
            char.speciesIds?.map(id => allEntities.find((e: any) => e.id === id)?.name).join(', '),
            char.occupationIds?.map(id => allEntities.find((e: any) => e.id === id)?.name).join(', '),
            char.isDead ? 'deceased' : 'living'
        ].filter(Boolean).join(' ');

        return (
            <div className="bg-[#fdfcf0] p-6 border-t-8 border-b-8 border-[#7a200d] space-y-2 shadow-inner font-sans select-text">
                <div className="border-b-2 border-[#7a200d] pb-1">
                    <h2 className="text-4xl font-serif font-bold text-[#7a200d] uppercase leading-none tracking-tight">{char.name}</h2>
                    <p className="text-sm italic text-[#2d2d2d] mt-1">{subtitle}</p>
                </div>
                
                <TaperedDivider />

                <div className="space-y-1">
                    <WikiStatRow label="Age" value={char.age} />
                    <WikiStatRow label="Hit Points" value={char.combatRating ? `${char.combatRating} (estimated)` : null} />
                    <WikiStatRow label="Height / Weight" value={char.height && char.weight ? `${char.height} / ${char.weight}` : (char.height || char.weight)} />
                    <WikiStatRow label="Titles" value={char.titles} />
                </div>

                <TaperedDivider />

                <div className="flex justify-between py-2 text-center">
                    <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">WIS</span><span className="text-sm">{char.stats?.wisdom || '10 (+0)'}</span></div>
                    <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">TST</span><span className="text-sm">{char.stats?.test || '10 (+0)'}</span></div>
                    <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">ATR</span><span className="text-sm">{char.stats?.attribute || '10 (+0)'}</span></div>
                    <div><span className="block font-bold text-[#7a200d] text-[10px] uppercase">MSP</span><span className="text-sm">{char.stats?.messedUp || '10 (+0)'}</span></div>
                </div>

                <TaperedDivider />

                <div className="space-y-1">
                    <WikiStatRow label="Traits" value={char.traitsAndCharacteristics} />
                    <WikiStatRow label="Features" value={char.unusualFeatures} />
                    <LinksDisplay label="Skills" ids={char.skillIds} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                    <LinksDisplay label="Spells" ids={char.spellIds} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                    <LinksDisplay label="Languages" ids={char.languageIds} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                    <WikiStatRow label="Equipment" value={char.equipment} />
                    <WikiStatRow label="Wealth" value={char.wealth} />
                </div>

                <TaperedDivider />

                <div className="pt-2">
                    <h4 className="font-bold text-[#7a200d] text-lg border-b border-[#d4c8af] mb-2 uppercase tracking-tight">Biography</h4>
                    <p className="text-sm text-[#2d2d2d] leading-relaxed whitespace-pre-wrap italic">{char.description || "Historical data missing."}</p>
                </div>
            </div>
        );
    };

    // "Aris" Style Infobox for Locations/Entities in Wiki Mode
    const WikiInfobox = () => (
        <aside className="lg:w-80 shrink-0 space-y-6">
            <div className="bg-[#fefce8] border-2 border-[#d4c8af] rounded shadow-md overflow-hidden">
                <div className="bg-[#fef9c3] p-2 text-center border-b-2 border-[#d4c8af]">
                    <h3 className="font-serif font-bold text-xl uppercase tracking-tighter text-[#1a1a1a]">{entity.name}</h3>
                </div>
                {/* Image Placeholder */}
                <div className="h-48 bg-[#ccc5a8] flex items-center justify-center border-b border-[#d4c8af] overflow-hidden grayscale contrast-75">
                    {isChar ? <Users size={100} className="text-[#a89d7d]" /> : <Globe size={100} className="text-[#a89d7d]" />}
                </div>
                <div className="p-0">
                    <h4 className="bg-[#f5e6d3] p-2 text-center text-[11px] font-black text-[#854d0e] uppercase tracking-widest border-b border-[#d4c8af]">Data Sheet</h4>
                    <table className="w-full text-xs text-left border-collapse">
                        <tbody>
                            <WikiInfoboxRow label="Type" value={TYPE_LABELS[entity.type as EntityType]} />
                            <WikiInfoboxRow label="Origin" value={(entity as any).placeOfOriginId} />
                            <WikiInfoboxRow label="Created" value={entity.lastModified ? new Date(entity.lastModified).toLocaleDateString() : undefined} />
                            <WikiInfoboxRow label="Tags" value={entity.tags?.join(', ')} />
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Wiki connections list for non-char entities */}
            <div className="p-4 bg-white/50 border border-[#d4c8af] rounded space-y-4">
                <h4 className="text-[10px] font-black text-[#854d0e] uppercase border-b border-[#d4c8af] pb-1">Relations</h4>
                <div className="space-y-4">
                    <LinksDisplay label="Locations" ids={(entity as any).locationIds} all={allEntities} onNav={onNavigate} isWikiMode={true} />
                    <LinksDisplay label="Members" ids={(entity as any).memberOf} all={allEntities} onNav={onNavigate} isWikiMode={true} />
                </div>
            </div>
        </aside>
    );

    const MainView = () => (
        <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 space-y-12">
                {isWikiMode && isChar ? (
                    <CharacterStatBlock />
                ) : (
                    <>
                        <section className={`${isWikiMode ? 'border-l-4 border-[#7a200d] pl-8 py-4 bg-[#fdfcf0]' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}`}>
                            <h2 className={`text-3xl font-serif font-bold ${isWikiMode ? 'text-[#7a200d]' : 'text-[#fef08a]'} mb-6 uppercase tracking-tight`}>Overview</h2>
                            <p className={`text-lg leading-relaxed font-light ${isWikiMode ? 'text-[#2d2d2d]' : 'text-slate-300'} whitespace-pre-wrap`}>{entity.description || "The entry is currently silent."}</p>
                        </section>

                        {!isWikiMode && (
                            <div className="space-y-8">
                                <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                                    <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Vital Records</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                        <FieldRow label="Titles" value={entity.titles} isWikiMode={false} />
                                        <FieldRow label="Age" value={entity.age} isWikiMode={false} />
                                        <FieldRow label="Sex" value={entity.sex} isWikiMode={false} />
                                        <FieldRow label="Combat Rating" value={entity.combatRating} isWikiMode={false} />
                                        <FieldRow label="Status" value={entity.isDead ? 'Lost' : 'Active'} isWikiMode={false} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                
                {/* Secondary details shared by both layouts if they exist */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <LinksDisplay label="Lore Connections" ids={(entity as any).loreNoteIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    <LinksDisplay label="Mythic Roots" ids={(entity as any).mythIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    <LinksDisplay label="Event Ties" ids={(entity as any).eventIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                </div>
            </div>

            {isWikiMode && !isChar && <WikiInfobox />}
            
            {!isWikiMode && (
                <aside className="lg:w-80 shrink-0 space-y-6">
                    <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 h-fit sticky top-10">
                        <h3 className="text-[10px] font-black text-[#fef08a] uppercase tracking-[0.4em] mb-6 border-b border-slate-800/60 pb-3">Record Vitals</h3>
                        <div className="space-y-6">
                            <FieldRow label="Type" value={TYPE_LABELS[entity.type as EntityType]} isWikiMode={false} />
                            {isChar && <FieldRow label="Age" value={entity.age} isWikiMode={false} />}
                            <FieldRow label="Status" value={entity.isDead ? 'Lost' : 'Active'} isWikiMode={false} />
                            <FieldRow label="Belongs Under" value={entity.belongsUnderId} isWikiMode={false} />
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
            {isWikiMode ? <WikiHeader /> : <CodexHeader />}
            <MainView />
        </div>
    );
};

// --- APP CORE ---

export default function App() {
    const [world, setWorld] = useState<WorldData>(() => {
        const saved = localStorage.getItem('chronicle-v10');
        return saved ? JSON.parse(saved) : { name: "New Realm", entities: [], trash: [], mapImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000' };
    });

    const [openTabIds, setOpenTabIds] = useState<string[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | 'map' | 'trash' | 'options'>('map');
    const [isWikiMode, setIsWikiMode] = useState(false);
    const [drafts, setDrafts] = useState<Record<string, WorldEntity>>({});
    const [editingTabIds, setEditingTabIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['world']);

    useEffect(() => localStorage.setItem('chronicle-v10', JSON.stringify(world)), [world]);

    const activeEntity = useMemo(() => {
        if (editingTabIds.has(activeTabId as string)) return drafts[activeTabId as string];
        return world.entities.find(e => e.id === activeTabId);
    }, [world.entities, activeTabId, editingTabIds, drafts]);

    const handleOpenEntity = (id: string) => {
        if (!openTabIds.includes(id)) setOpenTabIds(prev => [...prev, id]);
        setActiveTabId(id);
    };

    const handleCloseTab = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setOpenTabIds(prev => {
            const newTabs = prev.filter(tid => tid !== id);
            if (activeTabId === id) {
                setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1] : 'map');
            }
            return newTabs;
        });
        if (editingTabIds.has(id)) {
            const nextEdit = new Set(editingTabIds);
            nextEdit.delete(id);
            setEditingTabIds(nextEdit);
        }
    };

    const handleCreate = (type: EntityType, name?: string) => {
        const id = crypto.randomUUID();
        const emptyRole = () => ({ leadingFigureOf: [], connectedTo: [], memberOf: [], allyOf: [], enemyOf: [] });
        const newEntity: any = {
            id, name: name || `New ${type}`, description: "", type, lastModified: Date.now(), tags: [],
            speciesIds: [], occupationIds: [], affectedByBoonsIds: [], affectedByAfflictionsIds: [], affectedByOtherConditionsIds: [],
            skillIds: [], spellIds: [], languageIds: [], magicalTeachingIds: [], technologyIds: [],
            parentIds: [], childrenIds: [], relativeIds: [], friendIds: [], enemyIds: [], complicatedWithIds: [],
            loreNoteIds: [], mythIds: [], eventIds: [], locationIds: [], cultureIds: [],
            groupConnections: { political: emptyRole(), organization: emptyRole(), religious: emptyRole(), magic: emptyRole(), science: emptyRole() },
            detailSkillIds: [], detailItemIds: [], detailConditionIds: [], detailResourceIds: [], stats: {}
        };
        setWorld(prev => ({ ...prev, entities: [newEntity, ...prev.entities] }));
        setDrafts(p => ({ ...p, [id]: newEntity }));
        setEditingTabIds(p => new Set(p).add(id));
        handleOpenEntity(id);
    };

    const handleSaveDraft = (id: string) => {
        const d = drafts[id];
        if (!d) return;
        setWorld(prev => ({ ...prev, entities: prev.entities.map(e => e.id === id ? {...d, lastModified: Date.now()} : e) }));
        const nextEdit = new Set(editingTabIds);
        nextEdit.delete(id);
        setEditingTabIds(nextEdit);
        setDrafts(p => { const next = {...p}; delete next[id]; return next; });
    };

    const handleToggleEdit = (id: string) => {
        if (editingTabIds.has(id)) {
            handleSaveDraft(id);
        } else {
            const ent = world.entities.find(e => e.id === id);
            if (ent) {
                setDrafts(p => ({ ...p, [id]: {...ent} }));
                setEditingTabIds(p => new Set(p).add(id));
            }
        }
    };

    const handleDeleteToTrash = (entity: WorldEntity) => {
        if (confirm(`Move "${entity.name}" to the Archive Depth (Trash)?`)) {
            setWorld(prev => ({ ...prev, entities: prev.entities.filter(e => e.id !== entity.id), trash: [...prev.trash, entity] }));
            handleCloseTab(entity.id);
        }
    };

    const bgClass = isWikiMode ? 'bg-[#fdfcf0]' : 'bg-[#070b14]';
    const accentText = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const sidebarBg = isWikiMode ? 'bg-[#f5e6d3]' : 'bg-slate-900/20';

    return (
        <div className={`flex h-screen ${bgClass} ${isWikiMode ? 'text-[#1a1a1a]' : 'text-slate-300'} transition-all duration-500 overflow-hidden font-sans`}>
            {/* Sidebar */}
            <aside className={`w-80 border-r ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/60'} flex flex-col ${sidebarBg} backdrop-blur-md z-20`}>
                <div className={`p-6 border-b ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/60'}`}>
                    <h1 className={`text-xl font-serif font-bold ${accentText} tracking-widest flex items-center gap-2 uppercase mb-4`}>
                        {isWikiMode ? <BookMarked size={22} /> : <Compass size={22} className="animate-pulse" />} 
                        {isWikiMode ? 'ARCHIVE' : 'CHRONICLE'}
                    </h1>
                    <button onClick={() => setIsWikiMode(!isWikiMode)} className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black tracking-widest border-2 transition-all mb-4 ${isWikiMode ? 'bg-[#b91c1c] text-white border-[#b91c1c]' : 'bg-slate-800/40 text-[#fef08a] border-slate-700 hover:border-[#fef08a]'}`}>
                        {isWikiMode ? <Scroll size={14} /> : <LayoutGrid size={14} />} {isWikiMode ? 'WIKI MODE ACTIVE' : 'CODEX MODE ACTIVE'}
                    </button>
                    <div className="relative group">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                        <input placeholder="Filter tree..." className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
                    {HIERARCHY_CONFIG.map(cat => (
                        <div key={cat.id}>
                            <button onClick={() => setExpandedCategories(p => p.includes(cat.id) ? p.filter(c => c !== cat.id) : [...p, cat.id])} className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-semibold hover:bg-black/5`}>
                                {expandedCategories.includes(cat.id) ? <ChevronDown size={14} className="mr-2" /> : <ChevronRight size={14} className="mr-2" />}
                                <cat.icon size={16} className={`mr-2 ${accentText}`} /> {cat.label}
                            </button>
                            {expandedCategories.includes(cat.id) && (
                                <div className={`ml-5 border-l ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/60'} mt-1 pl-1`}>
                                    {cat.types.map(type => (
                                        <div key={type} className="mt-2">
                                            <div className="flex items-center justify-between px-4 py-1 text-[9px] uppercase font-black tracking-widest opacity-50">
                                                <span>{TYPE_LABELS[type]}</span>
                                                <button onClick={() => handleCreate(type)} className={`hover:${accentText}`}><Plus size={10} /></button>
                                            </div>
                                            {world.entities.filter(e => e.type === type && e.name.toLowerCase().includes(searchQuery.toLowerCase())).map(e => (
                                                <button key={e.id} onClick={() => handleOpenEntity(e.id)} className={`w-full text-left px-5 py-1.5 text-xs flex items-center gap-2 truncate rounded-r-lg group ${activeTabId === e.id ? (isWikiMode ? 'bg-black/10 text-[#b91c1c] font-bold border-l-2 border-[#b91c1c]' : 'bg-[#fef08a]/10 text-[#fef08a] border-l-2 border-[#fef08a]') : 'hover:bg-black/5'}`}>
                                                    <span className="truncate">{e.name}</span>
                                                    {editingTabIds.has(e.id) && <RefreshCw size={10} className="animate-spin text-slate-500 ml-auto" />}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <div className={`mt-8 pt-4 border-t ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/60'} space-y-1`}>
                        <button onClick={() => setActiveTabId('trash')} className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-bold ${activeTabId === 'trash' ? accentText : 'opacity-50'}`}><Trash size={14} className="mr-3" /> Trash ({world.trash.length})</button>
                        <button onClick={() => setActiveTabId('options')} className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-bold ${activeTabId === 'options' ? accentText : 'opacity-50'}`}><Settings size={14} className="mr-3" /> Options</button>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                <div className={`flex h-12 ${isWikiMode ? 'bg-[#f5e6d3] border-b-[#d4c8af]' : 'bg-slate-900/60 border-b-slate-800/80'} border-b shrink-0 z-10`}>
                    <button onClick={() => setActiveTabId('map')} className={`flex items-center px-6 gap-3 border-r ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/60'} ${activeTabId === 'map' ? (isWikiMode ? 'bg-[#fdfcf0] border-t-2 border-[#b91c1c]' : 'bg-[#0b0e1a] border-t-2 border-[#fef08a]') : 'opacity-50 hover:bg-black/5'}`}>
                        <MapIcon size={14} /> <span className="text-[10px] uppercase tracking-widest font-black">Atlas</span>
                    </button>
                    {openTabIds.map(tid => (
                        <button key={tid} onClick={() => setActiveTabId(tid)} className={`flex items-center px-6 gap-4 border-r ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/60'} group min-w-[120px] ${activeTabId === tid ? (isWikiMode ? 'bg-[#fdfcf0] border-t-2 border-[#b91c1c]' : 'bg-[#0b0e1a] border-t-2 border-[#fef08a]') : 'opacity-50 hover:bg-black/5'}`}>
                            <span className="text-[11px] truncate uppercase tracking-tighter font-bold">{world.entities.find(e => e.id === tid)?.name || drafts[tid]?.name || 'Unknown'}</span>
                            <X size={12} className="opacity-0 group-hover:opacity-100 hover:text-red-500" onClick={e => handleCloseTab(tid, e)} />
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeTabId === 'map' && <WorldMap world={world} setWorld={setWorld} onNavigate={handleOpenEntity} isWikiMode={isWikiMode} />}
                    {activeTabId === 'trash' && <TrashView trash={world.trash} setWorld={setWorld} isWikiMode={isWikiMode} />}
                    {activeTabId === 'options' && <OptionsView world={world} setWorld={setWorld} isWikiMode={isWikiMode} />}
                    
                    {activeEntity && (
                        editingTabIds.has(activeTabId as string) ? 
                        <div className="p-10">
                            <EntityEditor 
                                entity={activeEntity} 
                                allEntities={world.entities} 
                                isWikiMode={isWikiMode} 
                                onUpdate={(d: any) => setDrafts(p => ({ ...p, [activeTabId as string]: d }))}
                                onSave={() => handleSaveDraft(activeTabId as string)} 
                                onCancel={() => {
                                    const nextEdit = new Set(editingTabIds);
                                    nextEdit.delete(activeTabId as string);
                                    setEditingTabIds(nextEdit);
                                }} 
                                onCreateNew={handleCreate} 
                            />
                        </div> :
                        <div className="p-16">
                            <EntityViewer 
                                entity={activeEntity} 
                                allEntities={world.entities} 
                                onEdit={() => handleToggleEdit(activeTabId as string)} 
                                onDelete={() => handleDeleteToTrash(activeEntity)} 
                                onNavigate={handleOpenEntity}
                                isWikiMode={isWikiMode}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// --- Trash & Options Sub-views ---

function TrashView({ trash, setWorld, isWikiMode }: any) {
    const accent = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    return (
        <div className="p-16 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <h2 className={`text-6xl font-serif font-black uppercase tracking-tighter ${accent}`}>Forgotten Depth</h2>
            <div className="space-y-3">
                {trash.length === 0 && <p className="opacity-40 italic text-center py-10">The archive is silent.</p>}
                {trash.map((e: WorldEntity) => (
                    <div key={e.id} className={`flex items-center justify-between p-4 rounded-xl border ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-900/40 border-slate-800'}`}>
                        <div>
                            <span className="font-bold text-lg">{e.name}</span>
                            <p className="text-[10px] uppercase opacity-50">{TYPE_LABELS[e.type]}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setWorld((p:any) => ({ ...p, trash: p.trash.filter((x:any)=>x.id!==e.id), entities: [...p.entities, e] }))} className="p-2 hover:bg-green-500/10 text-green-500 transition-all"><RefreshCw size={20} /></button>
                            <button onClick={() => setWorld((p:any) => ({ ...p, trash: p.trash.filter((x:any)=>x.id!==e.id) }))} className="p-2 hover:bg-rose-500/10 text-rose-500 transition-all"><Trash size={20} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function OptionsView({ world, setWorld, isWikiMode }: any) {
    const accent = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    return (
        <div className="p-16 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
            <h2 className={`text-6xl font-serif font-black uppercase tracking-tighter ${accent}`}>System Config</h2>
            <div className={`p-10 rounded-3xl border ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-900/10 border-slate-800/60'}`}>
                <div className="space-y-6">
                    <FormInput label="Realm Name" value={world.name} onChange={(v: string) => setWorld({ ...world, name: v })} isWikiMode={isWikiMode} />
                    <FormInput label="Global Atlas Image (URL)" value={world.mapImage} onChange={(v: string) => setWorld({ ...world, mapImage: v })} isWikiMode={isWikiMode} />
                    <div className="pt-6 border-t border-slate-800/20">
                        <button onClick={() => {
                            const blob = new Blob([JSON.stringify(world, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a'); a.href = url; a.download = `${world.name}_chronicle.json`; a.click();
                        }} className={`px-8 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest ${isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-slate-800 text-[#fef08a] border border-[#fef08a]/20'}`}>Export Archive JSON</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const WorldMap = ({ world, setWorld, onNavigate, isWikiMode }: any) => {
    const addMarker = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const name = prompt("Location Anchor Name:");
        if (name) {
            const id = crypto.randomUUID();
            const newLoc = { id, name, type: 'location', description: "", coordinates: { x, y }, lastModified: Date.now(), tags: [] };
            setWorld((p:any) => ({ ...p, entities: [...p.entities, newLoc] }));
        }
    };
    const accent = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    return (
        <div className="w-full h-full flex flex-col animate-in fade-in duration-1000 p-12">
            <div className="mb-14">
                <h2 className={`text-8xl font-serif font-black uppercase tracking-tighter ${isWikiMode ? 'text-[#b91c1c]' : 'text-white'}`}>{world.name} Atlas</h2>
            </div>
            <div className={`flex-1 ${isWikiMode ? 'bg-[#f5e6d3]' : 'bg-slate-900'} rounded-[5rem] border-[16px] ${isWikiMode ? 'border-[#d4c8af]' : 'border-slate-800/40'} shadow-2xl relative overflow-hidden group cursor-crosshair`} onClick={addMarker}>
                <img src={world.mapImage} className={`w-full h-full object-cover opacity-50 ${isWikiMode ? 'sepia-[.8]' : 'sepia-[.4]'} transition-transform duration-[120s] group-hover:scale-110`} />
                {world.entities.filter((ent:any) => ent.coordinates).map((loc:any) => (
                    <div key={loc.id} style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group/marker z-10"
                        onClick={(e) => { e.stopPropagation(); onNavigate(loc.id); }}>
                        <div className="relative">
                            <MapPin className={`${accent} drop-shadow-lg group-hover/marker:scale-150 transition-transform duration-300`} size={32} strokeWidth={2.5} fill={isWikiMode ? "#b91c1c22" : "#fef08a44"} />
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover/marker:opacity-100 transition-all ${isWikiMode ? 'bg-[#fdfcf0] border-[#b91c1c]' : 'bg-slate-950 border-[#fef08a]'} border-2 px-5 py-2 rounded-2xl whitespace-nowrap shadow-2xl`}>
                                <span className={`text-sm font-black ${isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]'} uppercase tracking-widest`}>{loc.name}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
