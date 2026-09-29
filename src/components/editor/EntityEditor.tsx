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
import { FormInput, FormToggle, SmartSelect, MarkdownEditor } from '../ui';
import { EntityEditorProps, Location } from '../../types';
import { EntitySpecificsRegistry } from './specifics/EntitySpecificsRegistry';

export const EntityEditor = ({ entity, allEntities, onSave, onCancel, onCreateNew, isWikiMode, onUpdate }: EntityEditorProps) => {
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
            <header className="flex justify-between items-end border-b border-slate-500/20 pb-8">
                <div>
                    <h2 className={`text-5xl font-serif font-black uppercase tracking-tighter ${isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]'}`}>The Sovereign Scribe</h2>
                    <p className="opacity-50 text-xs italic">Inscribing the essence of: <span className="font-bold underline">{entity.name}</span></p>
                </div>
                <div className="flex gap-4 items-center">
                    <FormToggle label={entity.isReadOnly ? "LOCKED" : "Lock Entry"} checked={entity.isReadOnly} onChange={(v: boolean) => onUpdate({ ...entity, isReadOnly: v })} isWikiMode={isWikiMode} />
                    <button 
                        onClick={onSave} 
                        title="Commit to Chronicle (Ctrl+Enter or Ctrl+S)"
                        className={`px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest ${isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-[#fef08a] text-black'} hover:scale-105 transition-all shadow-2xl active:scale-95 flex items-center gap-2`}
                    >
                        <span>Commit to Chronicle</span>
                        <kbd className="opacity-60 text-[9px] font-mono tracking-normal px-1.5 py-0.5 rounded bg-black/20">Ctrl+↵</kbd>
                    </button>
                    <button 
                        onClick={onCancel} 
                        title="Abandon Scrawl (Esc)"
                        className="p-4 text-slate-500 hover:text-red-500 transition-colors uppercase font-black text-[10px] tracking-widest flex items-center gap-1.5"
                    >
                        <span>Abandon Scrawl</span>
                        <kbd className="opacity-40 text-[9px] font-mono tracking-normal">(Esc)</kbd>
                    </button>
                </div>
            </header>

            <fieldset disabled={entity.isReadOnly} className="space-y-12">
                {/* 1. MANDATORY DOCUMENT SETTINGS (UNIVERSAL) */}
                <EditorGroup title="Document settings" icon={Settings} isWikiMode={isWikiMode}>
                    <FormInput label="Name" icon={Scale} value={entity.name} onChange={(v: string) => onUpdate({ ...entity, name: v })} isWikiMode={isWikiMode} gridSpan={6} />
                    <SmartSelect 
                        label="Belongs under" 
                        icon={FolderTree} 
                        ids={entity.parentId ? [entity.parentId] : []} 
                        type={entity.type} 
                        all={allEntities} 
                        isWikiMode={isWikiMode} 
                        onChange={(ids) => onUpdate({ ...entity, parentId: ids[0] || null })} 
                        onCreate={onCreateNew} 
                        gridSpan={6}
                        excludeIds={[entity.id]}
                    />
                    
                    <FormInput label="Text color" icon={Type} value={entity.textColor} type="color" onChange={(v: string) => onUpdate({ ...entity, textColor: v })} isWikiMode={isWikiMode} gridSpan={3} />
                    <FormInput label="Background color" icon={PaintBucket} value={entity.backgroundColor} type="color" onChange={(v: string) => onUpdate({ ...entity, backgroundColor: v })} isWikiMode={isWikiMode} gridSpan={3} />
                    <FormToggle label="Is finished" icon={CheckSquare} checked={entity.isFinished} onChange={(v: boolean) => onUpdate({ ...entity, isFinished: v })} isWikiMode={isWikiMode} gridSpan={3} />
                    <FormInput label="Order number" icon={Hash} value={entity.orderNumber || ""} onChange={(v: string) => onUpdate({ ...entity, orderNumber: v })} isWikiMode={isWikiMode} gridSpan={3} />

                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-500/5">
                        <FormToggle label="Is a minor document" icon={Search} checked={entity.isMinorDocument} onChange={(v: boolean) => onUpdate({ ...entity, isMinorDocument: v })} isWikiMode={isWikiMode} />
                        <FormToggle label="Is Dead/Gone/Destroyed" icon={Skull} checked={entity.isDead} onChange={(v: boolean) => onUpdate({ ...entity, isDead: v })} isWikiMode={isWikiMode} />
                        <FormToggle label="Is a category" icon={Box} checked={entity.isCategory} onChange={(v: boolean) => onUpdate({ ...entity, isCategory: v })} isWikiMode={isWikiMode} />
                    </div>

                    <FormInput label="Tags" icon={Tag} value={entity.tags?.join(', ')} placeholder="Fantasy, Hero, Royal..." onChange={(v: string) => onUpdate({ ...entity, tags: v.split(',').map(s => s.trim()) })} isWikiMode={isWikiMode} gridSpan={12} />

                    <FormInput label="Document Template" icon={FileText} value={entity.documentTemplate || "None"} options={['None', 'Protagonist', 'Antagonist', 'NPC', 'Legendary', 'Deity']} onChange={(v: string) => onUpdate({ ...entity, documentTemplate: v })} isWikiMode={isWikiMode} gridSpan={4} />
                    <FormInput label="Extra HTML classes" icon={Code} value={entity.extraHtmlClasses || ""} onChange={(v: string) => onUpdate({ ...entity, extraHtmlClasses: v })} isWikiMode={isWikiMode} gridSpan={8} />
                    <FormInput label="Other Names & Epithets" icon={UserCircle} value={entity.otherNamesAndEpithets || ""} onChange={(v: string) => onUpdate({ ...entity, otherNamesAndEpithets: v })} isWikiMode={isWikiMode} gridSpan={12} />
                </EditorGroup>

                {/* 2. DESCRIPTION & HISTORY (UNIVERSAL) */}
                <EditorGroup title="Description & History" icon={BookOpen} isWikiMode={isWikiMode}>
                    <div className="lg:col-span-3">
                        <MarkdownEditor
                            value={entity.description || ''}
                            onChange={(v) => onUpdate({ ...entity, description: v })}
                            allEntities={allEntities}
                            isWikiMode={isWikiMode}
                            placeholder="The echoes of history begin here...  Use **bold**, *italic*, # Heading, and [[Entity Name]] to link."
                            minHeight="h-80"
                        />
                    </div>
                </EditorGroup>

                <EntitySpecificsRegistry entity={entity} allEntities={allEntities} onUpdate={onUpdate} onCreateNew={onCreateNew} isWikiMode={isWikiMode} />

                {/* 4. UNIVERSAL CONNECTIONS */}
                <EditorGroup title="World & Details" icon={Scroll} isWikiMode={isWikiMode}>
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                        <SmartSelect label="Lore Notes" icon={BookOpen} ids={entity.loreNoteIds} type="note" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, loreNoteIds: ids })} onCreate={onCreateNew} />
                        <SmartSelect label="Myths & Legends" icon={Scroll} ids={entity.mythIds} type="myth" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, mythIds: ids })} onCreate={onCreateNew} />
                    </div>
                    
                    <SmartSelect label="Connected to Events" icon={Calendar} ids={entity.eventIds} type="event" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, eventIds: ids })} onCreate={onCreateNew} gridSpan={4} />
                    <SmartSelect label="Connected to Skills/Spells/Other" icon={Zap} ids={entity.detailSkillIds} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, detailSkillIds: ids })} onCreate={onCreateNew} gridSpan={4} />
                    <SmartSelect label="Connected to Items" icon={Pencil} ids={entity.detailItemIds} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, detailItemIds: ids })} onCreate={onCreateNew} gridSpan={4} />
                    
                    <SmartSelect label="Affected by Boons" icon={Sun} ids={entity.detailConditionIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, detailConditionIds: ids })} onCreate={onCreateNew} gridSpan={4} />
                    <SmartSelect label="Affected by Afflictions" icon={Moon} ids={entity.detailConditionIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, detailConditionIds: ids })} onCreate={onCreateNew} gridSpan={4} />
                    <SmartSelect label="Affected by Other conditions" icon={Sun} ids={entity.detailResourceIds} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, detailResourceIds: ids })} onCreate={onCreateNew} gridSpan={4} />
                </EditorGroup>

                {/* 5. SECRETS (UNIVERSAL) */}
                <EditorGroup title="Secrets/Spoilers/DM notes" icon={Ghost} isWikiMode={isWikiMode}>
                    <div className="lg:col-span-3">
                        <MarkdownEditor
                            value={entity.privateNotes || ''}
                            onChange={(v) => onUpdate({ ...entity, privateNotes: v })}
                            allEntities={allEntities}
                            isWikiMode={isWikiMode}
                            placeholder="Private ruminations only visible in the scroll of creation..."
                            minHeight="h-48"
                        />
                    </div>
                </EditorGroup>
            </fieldset>
        </div>
    );
};
