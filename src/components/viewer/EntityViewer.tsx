import React, { useMemo } from 'react';
import { CodexHeader, WikiHeader } from './ViewerHeaders';
import { CharacterStatBlock } from './CharacterStatBlock';
import { WikiInfobox } from './WikiInfobox';
import { FieldRow, LinksDisplay } from '../ui';
import { EntityViewerProps, Character, EntityType } from '../../types';
import { TYPE_LABELS } from '../../constants';
import { getCategorizedBacklinks } from '../../utils/backlinkUtils';

export const EntityViewer = ({ entity, allEntities, onEdit, onDelete, onNavigate, onFocusMap, isWikiMode }: EntityViewerProps) => {
    const isChar = entity.type === 'character';
    const char = entity as Character;

    // Calculate categorized backlinks
    const backlinks = useMemo(() => getCategorizedBacklinks(entity.id, allEntities), [entity.id, allEntities]);

    const MainView = () => (
        <div className={`flex ${isWikiMode ? 'flex-row gap-12' : 'flex-col lg:flex-row gap-12'}`}>
            <div className="flex-1 space-y-12">
                <section className={`${isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <h2 className={`text-4xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28]' : 'text-[#fef08a]'} uppercase tracking-tight`}>{isChar ? 'Biography' : 'Overview'}</h2>
                        {entity.isFinished && (
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-[#fef08a] text-black shadow-lg shadow-yellow-500/20 animate-pulse'}`}>
                                Finished
                            </span>
                        )}
                    </div>
                    {isWikiMode && <div className="h-[2px] w-full bg-[#e69a28] mb-6" />}

                    <p className={`text-lg leading-relaxed ${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{entity.description || "The entry is currently silent."}</p>
                </section>

                <div className="space-y-8">
                    {!isWikiMode && isChar && (
                        <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                            <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Vital Records</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                <FieldRow label="Titles" value={char.titles} isWikiMode={false} />
                                <FieldRow label="Sex" value={char.sex} isWikiMode={false} />
                                <FieldRow label="Ethnicity" value={char.ethnicity} isWikiMode={false} />
                                <FieldRow label="Species" value={char.speciesIds?.map((id: string) => allEntities.find(e => e.id === id)?.name).filter(Boolean).join(', ')} isWikiMode={false} />
                                <FieldRow label="Occupation" value={char.occupationIds?.map((id: string) => allEntities.find(e => e.id === id)?.name).filter(Boolean).join(', ')} isWikiMode={false} />
                                <FieldRow label="Combat Rating" value={char.combatRating} isWikiMode={false} />
                                <FieldRow label="Height" value={char.height} isWikiMode={false} />
                                <FieldRow label="Weight" value={char.weight} isWikiMode={false} />
                                <FieldRow label="Birth" value={char.dateOfBirth} isWikiMode={false} />
                                <FieldRow label="Death" value={char.dateOfDeath} isWikiMode={false} />
                                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4 mt-4">
                                    <LinksDisplay label="Origin" ids={char.placeOfOriginId || []} all={allEntities} onNav={onNavigate} isWikiMode={false} />
                                    <LinksDisplay label="Residence" ids={char.placeOfResidenceId || []} all={allEntities} onNav={onNavigate} isWikiMode={false} />
                                    <LinksDisplay label="Place of Demise" ids={char.placeOfDemiseId || []} all={allEntities} onNav={onNavigate} isWikiMode={false} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Always show reciprocal Story connections */}
                        <LinksDisplay label="Lore Connections" ids={[...new Set([...(char.loreNoteIds || []), ...backlinks.lore, ...backlinks.referencedIn])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Mythic Roots" ids={[...new Set([...(char.mythIds || []), ...backlinks.myths])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Event Ties" ids={[...new Set([...(char.eventIds || []), ...backlinks.events])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        
                        {/* Specialized Complementary Displays */}
                        {entity.type === 'location' && (
                            <>
                                <LinksDisplay label="Notable Residents" ids={backlinks.residents} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                                <LinksDisplay label="Native Figures" ids={backlinks.natives} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                                <LinksDisplay label="Points of Interest" ids={backlinks.containedIn} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                            </>
                        )}

                        {entity.type === 'item' && (
                            <LinksDisplay label="Current Owners/Users" ids={backlinks.referencedIn} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        )}

                        {(entity.type === 'species' || entity.type === 'organization' || entity.type === 'political' || entity.type === 'religious' || entity.type === 'magic' || entity.type === 'science') && (
                            <LinksDisplay label="Prominent Members" ids={backlinks.members} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        )}

                        {(entity.type === 'ability' || entity.type === 'technology') && (
                            <LinksDisplay label="Known Practitioners" ids={backlinks.practitioners} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        )}

                        {/* Traditional character links, now bidirectionally merged */}
                        {isChar && (
                            <>
                                <LinksDisplay label="Parents/Ancestors" ids={[...new Set([...(char.parentIds || []), ...backlinks.parents])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                                <LinksDisplay label="Children/Descendants" ids={[...new Set([...(char.childrenIds || []), ...backlinks.children])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                                <LinksDisplay label="Inner Circle & Allies" ids={[...new Set([...(char.friendIds || []), ...backlinks.friends])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                            </>
                        )}
                    </div>

                    {entity.privateNotes && (
                        <div className="bg-rose-500/5 border border-rose-900/20 p-8 rounded-2xl">
                            <h3 className="text-xs font-black uppercase mb-4 tracking-widest text-rose-500">DM Confidential Notes</h3>
                            <p className="text-rose-200/70 font-mono text-sm whitespace-pre-wrap">{entity.privateNotes}</p>
                        </div>
                    )}
                </div>
            </div>

            <aside className="lg:w-80 shrink-0 space-y-6">
                {isWikiMode ? (
                    <>
                        {isChar ? (
                            <CharacterStatBlock entity={entity} allEntities={allEntities} onNavigate={onNavigate} hideName={true} backlinks={backlinks} />
                        ) : (
                            <WikiInfobox entity={entity} allEntities={allEntities} onNavigate={onNavigate} onFocusMap={onFocusMap} />
                        )}
                    </>
                ) : (
                    <>
                        {isChar && <CharacterStatBlock entity={entity} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />}
                        <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 h-fit sticky top-10">
                            <h3 className="text-[10px] font-black text-[#fef08a] uppercase tracking-[0.4em] mb-6 border-b border-slate-800/60 pb-3">Record Vitals</h3>
                            <div className="space-y-6">
                                <FieldRow label="Type" value={TYPE_LABELS[entity.type as EntityType]} isWikiMode={false} />
                                <FieldRow label="Template" value={entity.documentTemplate || "Generic"} isWikiMode={false} />
                                <FieldRow label="Order" value={entity.orderNumber} isWikiMode={false} />
                                <FieldRow label="Status" value={entity.status || (entity.isDead ? 'Lost' : 'Active')} isWikiMode={false} />
                                <FieldRow label="Hierarchy" value={allEntities.find(e => e.id === entity.belongsUnderId)?.name} isWikiMode={false} />
                            </div>
                        </div>
                    </>
                )}
            </aside>
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
