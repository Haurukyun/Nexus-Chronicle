import React, { useState } from 'react';
import {
    Settings, Info, BookOpen, Heart, Globe, Swords, Scroll, Ghost, Zap,
    Scale, FolderTree, Type, PaintBucket, CheckSquare, Search, Skull,
    Box, Hash, Tag, FileText, Code, UserCircle, MapPin, Calendar, Hourglass,
    Sparkles, Anchor, Users, Maximize, MessageSquare, Coins, Home, Pickaxe,
    Gem, User, Leaf, Sun, Moon, Tent, Pencil, ImageIcon, Plus, Trash2, GripVertical,
    Check, X
} from 'lucide-react';
import { AssetImageUploader } from '../ui/AssetImageUploader';
import { EditorGroup } from './EditorGroup';
import { GroupRoleGroup } from './GroupRoleGroup';
import { FormInput, FormToggle, SmartSelect, MarkdownEditor } from '../ui';
import { EntityEditorProps, Location } from '../../types';
import { EntitySpecificsRegistry } from './specifics/EntitySpecificsRegistry';
import { useTheme } from '../../theme';
import { isEntityCategory } from '../../utils/documentModeUtils';

// Custom Attributes Editor Component
const CustomAttributesEditor = ({
    attributes,
    onChange,
    themeId
}: {
    attributes: Record<string, string>;
    onChange: (attrs: Record<string, string>) => void;
    themeId: string;
}) => {
    const [editKey, setEditKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [newKey, setNewKey] = useState<string>('');
    const [newValue, setNewValue] = useState<string>('');

    const isRoyal = themeId === 'royal-codex';
    const isWiki = themeId === 'wiki';

    const handleSaveEdit = (key: string) => {
        const updated = { ...attributes, [key]: editValue };
        onChange(updated);
        setEditKey(null);
    };

    const handleDelete = (key: string) => {
        const updated = { ...attributes };
        delete updated[key];
        onChange(updated);
    };

    const handleAddNew = () => {
        if (newKey.trim()) {
            const updated = { ...attributes, [newKey.trim()]: newValue };
            onChange(updated);
            setNewKey('');
            setNewValue('');
        }
    };

    const entries = Object.entries(attributes);

    if (entries.length === 0 && !newKey && !newValue) {
        return (
            <div className="col-span-12">
                <button
                    onClick={() => {}} // Just to show the add form
                    className={`w-full text-left p-4 rounded-xl border-2 border-dashed transition-all ${
                        isRoyal ? 'border-[#c8a96e]/40 hover:border-[#c8a96e] bg-[#ede2cc]/30' : 'border-slate-500/10 hover:border-slate-400/30 bg-black/5'
                    }`}
                >
                    <div className="flex items-center gap-3 text-center text-sm">
                        <Plus size={18} className={`mx-auto ${isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#b91c1c]' : 'text-[#fef08a]'}`} />
                        <span className={`font-bold ${isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#854d0e]' : 'text-[#fef08a]'}`}>
                            Add Custom Attribute
                        </span>
                    </div>
                </button>
            </div>
        );
    }

    return (
        <div className="col-span-12 space-y-3">
            {/* Existing attributes */}
            {entries.map(([key, value]) => (
                <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isRoyal ? 'border-[#c8a96e]/40 bg-[#ede2cc]/60' : isWiki ? 'border-rose-300/30 bg-rose-50/50' : 'border-slate-500/10 bg-black/5'
                }`}>
                    <GripVertical size={16} className="opacity-30 cursor-grab" />
                    <div className="flex-1 min-w-0">
                        {editKey === key ? (
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(key)}
                                onBlur={() => handleSaveEdit(key)}
                                autoFocus
                                className={`w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none ${
                                    isRoyal ? 'border-[#c8a96e] bg-white text-[#2b1810]' : isWiki ? 'border-rose-300 bg-white text-[#1a1a1a]' : 'border-slate-600 bg-slate-900 text-white'
                                }`}
                            />
                        ) : (
                            <span className={`font-mono text-sm ${isRoyal ? 'text-[#3d0a10]' : isWiki ? 'text-[#854d0e]' : 'text-[#fef08a]'}`}>
                                {key}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {editKey === key ? (
                            <>
                                <button
                                    onClick={() => handleSaveEdit(key)}
                                    className={`p-2 rounded-lg transition-colors ${isRoyal ? 'text-[#70121e] hover:bg-[#c8a96e]/30' : isWiki ? 'text-[#b91c1c] hover:bg-rose-200/30' : 'text-[#fef08a] hover:bg-yellow-500/20'}`}
                                    title="Save"
                                >
                                    <Check size={14} />
                                </button>
                                <button
                                    onClick={() => setEditKey(null)}
                                    className={`p-2 rounded-lg transition-colors ${isRoyal ? 'text-[#881337] hover:bg-[#c8a96e]/30' : isWiki ? 'text-rose-600 hover:bg-rose-200/30' : 'text-red-400 hover:bg-yellow-500/20'}`}
                                    title="Cancel"
                                >
                                    <X size={14} />
                                </button>
                            </>
                        ) : (
                            <>
                                <span className={`font-mono text-sm text-slate-500 ${isRoyal ? 'text-[#5c2a12]' : ''}`}>{value}</span>
                                <button
                                    onClick={() => { setEditKey(key); setEditValue(value); }}
                                    className={`p-1.5 rounded-lg transition-colors opacity-50 hover:opacity-100 ${isRoyal ? 'text-[#70121e] hover:bg-[#c8a96e]/20' : isWiki ? 'text-[#b91c1c] hover:bg-rose-200/30' : 'text-slate-400 hover:bg-white/10'}`}
                                    title="Edit value"
                                >
                                    <Pencil size={12} />
                                </button>
                                <button
                                    onClick={() => handleDelete(key)}
                                    className={`p-1.5 rounded-lg transition-colors opacity-50 hover:opacity-100 ${isRoyal ? 'text-[#881337] hover:bg-[#881337]/10' : isWiki ? 'text-rose-600 hover:bg-rose-200/30' : 'text-red-400 hover:bg-red-500/10'}`}
                                    title="Delete attribute"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            ))}

            {/* Add new attribute form */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border-2 border-dashed transition-all ${
                isRoyal ? 'border-[#c8a96e]/40 bg-[#ede2cc]/30' : isWiki ? 'border-rose-300/30 bg-rose-50/30' : 'border-slate-500/10 bg-black/5'
            }`}>
                <Plus size={18} className={`shrink-0 ${isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#b91c1c]' : 'text-[#fef08a]'}`} />
                <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Key (e.g., 'Crafting Rank')"
                    className={`flex-1 min-w-0 px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none ${
                        isRoyal ? 'border-[#c8a96e] bg-white text-[#2b1810]' : isWiki ? 'border-rose-300 bg-white text-[#1a1a1a]' : 'border-slate-600 bg-slate-900 text-white'
                    }`}
                />
                <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Value (e.g., 'Grandmaster')"
                    className={`flex-1 min-w-0 px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none ${
                        isRoyal ? 'border-[#c8a96e] bg-white text-[#2b1810]' : isWiki ? 'border-rose-300 bg-white text-[#1a1a1a]' : 'border-slate-600 bg-slate-900 text-white'
                    }`}
                />
                <button
                    onClick={handleAddNew}
                    disabled={!newKey.trim()}
                    className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isRoyal ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#881337]' : isWiki ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]' : 'bg-[#fef08a] text-black hover:bg-yellow-400'
                    }`}
                >
                    Add
                </button>
            </div>
        </div>
    );
};

export const EntityEditor = ({ entity, allEntities, onSave, onCancel, onCreateNew, onUpdate }: EntityEditorProps) => {
    const { themeId, layoutMode } = useTheme();
    const isWikiMode = layoutMode === 'wiki';
    const isRoyal = themeId === 'royal-codex';
    const isLocation = entity.type === 'location';
    const loc = entity as Location;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (!entity.isReadOnly) {
                onSave();
            }
        }
    };

    return (
        <div 
            onKeyDown={handleKeyDown}
            className="max-w-7xl mx-auto pb-40 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
            <header className={`flex justify-between items-end border-b pb-8 ${isRoyal ? 'border-[#c8a96e]/40' : 'border-slate-500/20'}`}>
                <div>
                    <h2 className={`text-5xl font-serif font-black uppercase tracking-tighter ${
                        isRoyal 
                            ? 'text-[#3d0a10]' 
                            : isWikiMode 
                                ? 'text-[#854d0e]' 
                                : 'text-[#fef08a]'
                    }`}>
                        {isRoyal ? 'The Royal Chronicler' : isWikiMode ? 'The Grand Archive' : 'The Sovereign Scribe'}
                    </h2>
                    <p className={`text-xs italic ${isRoyal ? 'text-[#5c2a12] opacity-80 font-serif' : 'opacity-50'}`}>
                        Inscribing the essence of: <span className="font-bold underline">{entity.name}</span>
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <FormToggle label={entity.isReadOnly ? "LOCKED" : "Lock Entry"} checked={entity.isReadOnly} onChange={(v: boolean) => onUpdate({ ...entity, isReadOnly: v })} />
                    <button 
                        onClick={onSave} 
                        title="Commit to Chronicle (Ctrl+Enter or Ctrl+S)"
                        className={`px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest ${
                            isRoyal
                                ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e] hover:bg-[#881337] shadow-xl'
                                : isWikiMode
                                    ? 'bg-[#b91c1c] text-white shadow-xl hover:bg-[#991b1b]'
                                    : 'bg-[#fef08a] text-black shadow-2xl hover:scale-105'
                        } transition-all active:scale-95 flex items-center gap-2`}
                    >
                        <span>Commit to Chronicle</span>
                        <kbd className={`text-[9px] font-mono tracking-normal px-1.5 py-0.5 rounded ${
                            isRoyal ? 'bg-[#400a11] text-[#fff8e7] border border-[#c8a96e]/40' : 'bg-black/20 opacity-60'
                        }`}>Ctrl+↵</kbd>
                    </button>
                    <button 
                        onClick={onCancel} 
                        title="Abandon Scrawl (Esc)"
                        className={`p-4 transition-colors uppercase font-black text-[10px] tracking-widest flex items-center gap-1.5 ${
                            isRoyal 
                                ? 'text-[#70121e] hover:text-[#991b1b] font-serif' 
                                : 'text-slate-500 hover:text-red-500'
                        }`}
                    >
                        <span>Abandon Scrawl</span>
                        <kbd className="opacity-40 text-[9px] font-mono tracking-normal">(Esc)</kbd>
                    </button>
                </div>
            </header>

            <fieldset disabled={entity.isReadOnly} className="space-y-12">
                {/* 1. MANDATORY DOCUMENT SETTINGS (UNIVERSAL) */}
                <EditorGroup title="Document settings" icon={Settings}>
                    <FormInput label="Name" icon={Scale} value={entity.name} onChange={(v: string) => onUpdate({ ...entity, name: v })} gridSpan={6} />
                    <SmartSelect 
                        label="Belongs under" 
                        icon={FolderTree} 
                        ids={entity.parentId ? [entity.parentId] : []} 
                        type={entity.type} 
                        all={allEntities} 
                        onChange={(ids) => onUpdate({ ...entity, parentId: ids[0] || null })} 
                        onCreate={onCreateNew} 
                        gridSpan={6}
                        excludeIds={[entity.id]}
                    />
                    
                    <div className={`col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl border ${
                        isRoyal ? 'border-[#c8a96e]/40 bg-[#ede2cc]/60 shadow-inner' : 'border-slate-500/10 bg-black/5'
                    }`}>
                        <FormToggle 
                            label="Clean Codex (Finished)" 
                            icon={CheckSquare} 
                            checked={Boolean(entity.isFinished || entity.finishedSwitch)} 
                            onChange={(v: boolean) => onUpdate({ ...entity, isFinished: v, finishedSwitch: v })} 
                        />
                        <FormToggle 
                            label="Folder / Category" 
                            icon={Box} 
                            checked={Boolean(entity.isCategory || entity.categorySwitch)} 
                            onChange={(v: boolean) => onUpdate({ ...entity, isCategory: v, categorySwitch: v })} 
                        />
                        <FormToggle 
                            label="Dead / Fallen / Ruined" 
                            icon={Skull} 
                            checked={Boolean(entity.isDead || entity.deadSwitch)} 
                            onChange={(v: boolean) => onUpdate({ ...entity, isDead: v, deadSwitch: v })} 
                        />
                        <FormToggle 
                            label="Minor Background Entry" 
                            icon={Search} 
                            checked={Boolean(entity.isMinorDocument || entity.minorSwitch)} 
                            onChange={(v: boolean) => onUpdate({ ...entity, isMinorDocument: v, minorSwitch: v })} 
                        />
                    </div>

                    <FormInput 
                        label="Accent / Sigil color" 
                        icon={PaintBucket} 
                        value={entity.documentColor || entity.textColor || ""} 
                        type="color" 
                        onChange={(v: string) => onUpdate({ ...entity, documentColor: v, textColor: v })} 
                        gridSpan={4} 
                    />
                    <FormInput 
                        label="Archetype / Template" 
                        icon={FileText} 
                        value={entity.documentTemplate || (entity.docTemplate ? entity.docTemplate[0] : "None")} 
                        options={['None', 'Protagonist', 'Antagonist', 'Major Ally', 'Major Rival', 'NPC', 'Legendary', 'Deity']} 
                        onChange={(v: string) => onUpdate({ ...entity, documentTemplate: v, docTemplate: [v] })} 
                        gridSpan={8} 
                    />

                    <FormInput 
                        label="Tags" 
                        icon={Tag} 
                        value={entity.tags?.join(', ') || ""} 
                        placeholder="Fantasy, Hero, Royal, Arcane..." 
                        onChange={(v: string) => onUpdate({ ...entity, tags: v.split(',').map(s => s.trim()).filter(Boolean) })} 
                        gridSpan={6} 
                    />
                    <FormInput 
                        label="Other Names & Epithets" 
                        icon={UserCircle} 
                        value={entity.otherNamesAndEpithets || (Array.isArray(entity.otherNames) ? entity.otherNames.join(', ') : "")} 
                        placeholder="The Golden King, Lord of Cinders..." 
                        onChange={(v: string) => {
                            const arr = v.split(',').map(s => s.trim()).filter(Boolean);
                            onUpdate({ ...entity, otherNamesAndEpithets: v, otherNames: arr });
                        }} 
                        gridSpan={6} 
                    />
                </EditorGroup>

                {/* 2. PORTRAIT & IMAGERY (UNIVERSAL) */}
                <EditorGroup title="Portrait & Imagery" icon={ImageIcon}>
                    <div className="col-span-12 max-w-2xl mx-auto w-full py-2">
                        <AssetImageUploader
                            label="Portrait / Illustration"
                            value={entity.imageUri || ''}
                            onChange={(uri) => onUpdate({ ...entity, imageUri: uri })}
                            helperText="Upload a high-resolution portrait from your device or paste a web URL. Stored uncompressed in the local IndexedDB asset vault — preserved inside .nexus archives."
                        />
                    </div>
                </EditorGroup>

                {/* 3. DESCRIPTION & HISTORY (UNIVERSAL) */}
                <EditorGroup title="Description & History" icon={BookOpen}>
                    <div className="col-span-12 w-full">
                        <MarkdownEditor
                            value={entity.description || ''}
                            onChange={(v) => onUpdate({ ...entity, description: v })}
                            allEntities={allEntities}
                            placeholder="The echoes of history begin here... Use **bold**, *italic*, # Heading, and [[Entity Name]] to link."
                            minHeight="h-80"
                        />
                    </div>
                </EditorGroup>

                {isEntityCategory(entity) ? (
                    <div className="p-8 rounded-3xl border border-dashed border-teal-500/30 bg-teal-500/5 text-center space-y-2">
                        <FolderTree className="w-10 h-10 text-teal-400 mx-auto opacity-70" />
                        <h3 className="font-serif font-bold text-lg text-teal-300">Folder / Category Mode Active</h3>
                        <p className="text-xs opacity-60 max-w-md mx-auto">
                            This entry acts as an organizational folder for child records. Type-specific stat blocks and mechanical fields are suppressed to maintain a clean container view.
                        </p>
                    </div>
                ) : (
                    <EntitySpecificsRegistry entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} />
                )}

                {/* 4. UNIVERSAL CONNECTIONS */}
                <EditorGroup title="World & Details" icon={Scroll}>
                    <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                        <SmartSelect label="Lore Notes" icon={BookOpen} ids={entity.loreNoteIds} type="note" all={allEntities} onChange={(ids) => onUpdate({ ...entity, loreNoteIds: ids })} onCreate={onCreateNew} />
                        <SmartSelect label="Myths & Legends" icon={Scroll} ids={entity.mythIds} type="myth" all={allEntities} onChange={(ids) => onUpdate({ ...entity, mythIds: ids })} onCreate={onCreateNew} />
                    </div>
                    
                    <SmartSelect label="Connected to Events" icon={Calendar} ids={entity.eventIds} type="event" all={allEntities} onChange={(ids) => onUpdate({ ...entity, eventIds: ids })} onCreate={onCreateNew} gridSpan={4} />
                    <SmartSelect label="Connected to Skills/Spells/Other" icon={Zap} ids={entity.detailSkillIds} type="ability" all={allEntities} onChange={(ids) => onUpdate({ ...entity, detailSkillIds: ids })} onCreate={onCreateNew} gridSpan={4} />
                    <SmartSelect label="Connected to Items" icon={Pencil} ids={entity.detailItemIds} type="item" all={allEntities} onChange={(ids) => onUpdate({ ...entity, detailItemIds: ids })} onCreate={onCreateNew} gridSpan={4} />
                    
                    <SmartSelect label="Affected by Boons" icon={Sun} ids={entity.detailConditionIds} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, detailConditionIds: ids })} onCreate={onCreateNew} gridSpan={4} />
                    <SmartSelect label="Affected by Afflictions" icon={Moon} ids={entity.detailConditionIds} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, detailConditionIds: ids })} onCreate={onCreateNew} gridSpan={4} />
                    <SmartSelect label="Affected by Other conditions" icon={Sun} ids={entity.detailResourceIds} type="condition" all={allEntities} onChange={(ids) => onUpdate({ ...entity, detailResourceIds: ids })} onCreate={onCreateNew} gridSpan={4} />
                </EditorGroup>

                {/* 4.5. CUSTOM ATTRIBUTES (UNIVERSAL) */}
                <EditorGroup title="Custom Attributes" icon={Hash}>
                    <CustomAttributesEditor
                        attributes={entity.customAttributes || {}}
                        onChange={(attrs) => onUpdate({ ...entity, customAttributes: attrs })}
                        themeId={themeId}
                    />
                </EditorGroup>

                {/* 5. SECRETS (UNIVERSAL) */}
                <EditorGroup title="Secrets/Spoilers/DM notes" icon={Ghost}>
                    <div className="col-span-12 space-y-1.5">
                        <label className={`text-[10px] uppercase tracking-widest block ${
                            isRoyal ? 'text-[#451a03] font-serif font-bold' : 'text-slate-500 font-black opacity-60'
                        }`}>
                            Private Ruminations
                        </label>
                        <MarkdownEditor
                            value={entity.privateNotes || ''}
                            onChange={(v) => onUpdate({ ...entity, privateNotes: v })}
                            allEntities={allEntities}
                            placeholder="Private ruminations only visible in the scroll of creation..."
                            minHeight="h-48"
                        />
                    </div>
                </EditorGroup>
            </fieldset>
        </div>
    );
};
