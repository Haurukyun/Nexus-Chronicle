import React, { useMemo } from 'react';
import { CodexHeader, WikiHeader } from './ViewerHeaders';
import { CharacterStatBlock } from './CharacterStatBlock';
import { WikiInfobox } from './WikiInfobox';
import { FieldRow, LinksDisplay } from '../ui';
import { EntityViewerProps, Character, EntityType, Location } from '../../types';
import { TYPE_LABELS } from '../../constants';
import { getCategorizedBacklinks } from '../../utils/backlinkUtils';
import { EntitySpecificsViewerRegistry } from './specifics/EntitySpecificsViewerRegistry';

export const EntityViewer = ({ entity, allEntities, onEdit, onDelete, onNavigate, onFocusMap, isWikiMode }: EntityViewerProps) => {
    const isChar = entity.type === 'character';
    const isLoc = entity.type === 'location';
    const char = entity as Character;
    const loc = entity as Location;

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
                    {entity.type !== 'location' && (
                        <EntitySpecificsViewerRegistry entity={entity} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} />
                    )}
                    {!isWikiMode && isLoc && (
                         <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                            <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Geographic Intelligence</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                                <FieldRow label="Type" value={loc.locationType} isWikiMode={false} />
                                <FieldRow label="Population" value={loc.population} isWikiMode={false} />
                                <FieldRow label="Size" value={loc.size} isWikiMode={false} />
                                <FieldRow label="Founded" value={loc.dateOfCreation} isWikiMode={false} />
                                <FieldRow label="Ended" value={loc.dateOfEnd} isWikiMode={false} />
                                <div className="col-span-2 mt-4 space-y-4">
                                    <FieldRow label="Unusual Layout/Features" value={loc.unusualFeatures} isWikiMode={false} />
                                    <LinksDisplay label="Preceding Geography" ids={loc.precedingLocationIds || []} all={allEntities} onNav={onNavigate} isWikiMode={false} />
                                    <LinksDisplay label="Succeeding Geography" ids={loc.succeedingLocationIds || []} all={allEntities} onNav={onNavigate} isWikiMode={false} />
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoc && loc.traditionsAndCustoms && (
                        <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                            <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Traditions & Customs</h3>
                            <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{loc.traditionsAndCustoms}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Always show reciprocal Story connections */}
                        <LinksDisplay label="Lore Connections" ids={[...new Set([...(entity.loreNoteIds || []), ...backlinks.lore, ...backlinks.referencedIn])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Mythic Roots" ids={[...new Set([...(entity.mythIds || []), ...backlinks.myths])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Event Ties" ids={[...new Set([...(entity.eventIds || []), ...backlinks.events])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        
                        {/* Specialized Complementary Displays */}
                        {isLoc && (
                            <>
                                <LinksDisplay label="Characters Born Here" ids={loc.originatedCharacterIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                                <LinksDisplay label="Current Residents" ids={[...new Set([...(loc.livingCharacterIds || []), ...backlinks.residents])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                                <LinksDisplay label="Historical Figures (Lost Here)" ids={[...new Set([...(loc.deceasedCharacterIds || []), ...backlinks.passedHere])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                                <LinksDisplay label="Neighbouring Lands" ids={loc.neighbouringLocationIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                                <LinksDisplay label="Internal Points of Interest" ids={backlinks.containedIn} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                                <LinksDisplay label="Governing Authorities" ids={Object.values(loc.governingGroupConnections || {}).flatMap(g => g.connectedTo || [])} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
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
                        {isLoc && (
                            <div className="p-4 bg-[#fcf5e9] border border-[#d4c8af]/60 rounded-sm">
                                <h4 className="text-[10px] font-black text-[#854d0e] uppercase border-b border-[#d4c8af] pb-1 mb-3">Geographic Vitals</h4>
                                <div className="space-y-3">
                                    <FieldRow label="Type" value={loc.locationType} isWikiMode={true} />
                                    <FieldRow label="Demographics" value={loc.population} isWikiMode={true} />
                                    <FieldRow label="Manifested" value={loc.dateOfCreation} isWikiMode={true} />
                                    <LinksDisplay label="Local Languages" ids={loc.localLanguageIds || []} all={allEntities} onNav={onNavigate} isWikiMode={true} wikiStyle="inline" />
                                </div>
                            </div>
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
