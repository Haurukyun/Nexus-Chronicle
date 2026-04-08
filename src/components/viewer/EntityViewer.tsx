import React from 'react';
import { CodexHeader, WikiHeader } from './ViewerHeaders';
import { CharacterStatBlock } from './CharacterStatBlock';
import { WikiInfobox } from './WikiInfobox';
import { FieldRow, LinksDisplay } from '../ui';
import { EntityViewerProps, Character } from '../../types';

export const EntityViewer = ({ entity, allEntities, onEdit, onDelete, onNavigate, onFocusMap, isWikiMode }: EntityViewerProps) => {
    const isChar = entity.type === 'character';
    const char = entity as Character;

    const MainView = () => (
        <div className={`flex \${isWikiMode ? 'flex-row gap-12' : 'flex-col lg:flex-row gap-12'}`}>
            <div className="flex-1 space-y-12">
                <section className={`\${isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}`}>
                    <h2 className={`text-4xl font-serif font-bold \${isWikiMode ? 'text-[#e69a28]' : 'text-[#fef08a]'} mb-2 uppercase tracking-tight`}>{isChar ? 'Biography' : 'Overview'}</h2>
                    {isWikiMode && <div className="h-[2px] w-full bg-[#e69a28] mb-6" />}

                    <p className={`text-lg leading-relaxed \${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.description || "The entry is currently silent."}</p>
                </section>

                {isWikiMode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <LinksDisplay label="Lore Connections" ids={char.loreNoteIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Mythic Roots" ids={char.mythIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Event Ties" ids={char.eventIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                )}

                {!isWikiMode && (
                    <div className="space-y-8">
                        <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                            <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Vital Records</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                <FieldRow label="Titles" value={char.titles} isWikiMode={false} />
                                <FieldRow label="Sex" value={char.sex} isWikiMode={false} />
                                <FieldRow label="Ethnicity" value={char.ethnicity} isWikiMode={false} />
                                <FieldRow label="Species" value={char.speciesIds?.map((id: string) => allEntities.find(e => e.id === id)?.name).filter(Boolean).join(', ')} isWikiMode={false} />
                                <FieldRow label="Occupation" value={char.occupationIds?.map((id: string) => allEntities.find(e => e.id === id)?.name).filter(Boolean).join(', ')} isWikiMode={false} />
                                <FieldRow label="Age" value={char.age} isWikiMode={false} />
                                <FieldRow label="Status" value={entity.status || (entity.isDead ? 'Deceased' : 'Living')} isWikiMode={false} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <LinksDisplay label="Related Lore" ids={char.loreNoteIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="World Geography" ids={char.locationIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            <LinksDisplay label="Events" ids={char.eventIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        </div>
                    </div>
                )}
            </div>

            {isWikiMode ? (
                <WikiInfobox entity={entity} allEntities={allEntities} onNavigate={onNavigate} onFocusMap={onFocusMap} />
            ) : (
                isChar && (
                    <aside className="lg:w-96">
                        <CharacterStatBlock entity={entity} allEntities={allEntities} onNavigate={onNavigate} />
                    </aside>
                )
            )}
        </div>
    );

    return (
        <article className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {isWikiMode ? (
                <WikiHeader entity={entity} onEdit={onEdit} onDelete={onDelete} />
            ) : (
                <CodexHeader entity={entity} onEdit={onEdit} onDelete={onDelete} />
            )}
            <MainView />
        </article>
    );
};
