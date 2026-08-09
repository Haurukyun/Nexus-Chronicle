import React, { useMemo } from 'react';
import { CodexHeader, WikiHeader, RoyalHeader } from './ViewerHeaders';
import { CharacterStatBlock } from './CharacterStatBlock';
import { WikiInfobox } from './WikiInfobox';
import { FieldRow, LinksDisplay } from '../ui';
import { EntityViewerProps, Character, EntityType, Location } from '../../types';
import { TYPE_LABELS } from '../../constants';
import { getCategorizedBacklinks } from '../../utils/backlinkUtils';
import { EntitySpecificsViewerRegistry } from './specifics/EntitySpecificsViewerRegistry';
import { ViewerSectionCard } from './ViewerSectionCard';
import { useWorldStore } from '../../store/useWorldStore';

export const EntityViewer = ({ entity, allEntities, onEdit, onDelete, onNavigate, onFocusMap, isWikiMode }: EntityViewerProps) => {
    const isChar = entity.type === 'character';
    const isLoc = entity.type === 'location';
    const char = entity as Character;
    const loc = entity as Location;
    const theme = useWorldStore(state => state.theme);
    const isRoyal = theme === 'royal-codex';
    const isWiki = theme === 'wiki' || isWikiMode;

    // Calculate categorized backlinks
    const backlinks = useMemo(() => getCategorizedBacklinks(entity.id, allEntities), [entity.id, allEntities]);

    // Royal Codex: show tabs (Overview / Biography / Relations / Inventory) at top
    const [activeTab, setActiveTab] = React.useState<string>('overview');

    const royalTabs = ['Overview', 'Biography', 'Relations', 'Inventory'];

    const MainView = () => (
        <div className={`flex ${isWiki || isRoyal ? 'flex-row gap-8' : 'flex-col lg:flex-row gap-12'}`}>
            <div className="flex-1 min-w-0 space-y-6">
                {/* Royal Codex Tab Bar */}
                {isRoyal && (
                    <div className="flex border-b-0 gap-1 mb-4">
                        {royalTabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`relative px-5 py-2 text-[11px] font-serif font-bold uppercase tracking-widest rounded-t-md transition-all ${
                                    activeTab === tab.toLowerCase()
                                        ? 'bg-[#f7f0e1] text-[#2b1810] border-2 border-b-0 border-[#c8a96e] shadow-sm z-10'
                                        : 'bg-[#e2ceb1] text-[#593d2b] border border-b-0 border-[#c8a96e]/60 hover:bg-[#ede0c9] mt-[2px]'
                                }`}
                            >
                                <span className={`border-b ${activeTab === tab.toLowerCase() ? 'border-transparent' : 'border-[#c8a96e]/60'} absolute bottom-0 left-0 right-0`} />
                                {tab}
                            </button>
                        ))}
                    </div>
                )}

                {/* Biography / Overview Section */}
                {(!isRoyal || activeTab === 'overview' || activeTab === 'biography') && (
                    <ViewerSectionCard title={isChar ? 'Biography' : 'Overview'} badgeText={entity.isFinished ? 'Finished' : undefined}>
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <p className={`flex-1 text-base leading-relaxed whitespace-pre-wrap ${isRoyal ? 'font-serif text-[#2b1810]' : isWiki ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'}`}>
                                {entity.description || 'Elara life as a scholar and mage and based moveself in the tesute with her rleroely lased up orhlaced mage but colours of ther accuity and mage to rumation intor thent God.'}
                            </p>
                            {isRoyal && (
                                <div className="shrink-0 rounded-lg border-2 border-[#c8a96e] overflow-hidden shadow-md bg-[#e2d5bd]">
                                    <img 
                                        src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=300" 
                                        alt="Map Thumbnail" 
                                        className="w-36 h-24 object-cover sepia-[.6] contrast-125 hover:scale-105 transition-all"
                                    />
                                </div>
                            )}
                        </div>
                    </ViewerSectionCard>
                )}


                {/* Specifics Sections */}
                {(!isRoyal || activeTab === 'overview') && (
                    <div className="space-y-6">
                        <EntitySpecificsViewerRegistry entity={entity} allEntities={allEntities} onNavigate={onNavigate} isWikiMode={isWikiMode} backlinks={backlinks} />
                    </div>
                )}

                {entity.spoilerNotes && (!isRoyal || activeTab === 'overview') && (
                    <ViewerSectionCard title="Secrets / DM Notes">
                        <p className={`whitespace-pre-wrap ${isRoyal ? 'font-serif text-[#2b1810]' : isWiki ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'}`}>{entity.spoilerNotes}</p>
                    </ViewerSectionCard>
                )}

                {(!isRoyal || activeTab === 'relations') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <LinksDisplay label="Lore Connections" ids={[...new Set([...(entity.loreNoteIds || []), ...backlinks.lore, ...backlinks.referencedIn])]} all={allEntities} onNav={onNavigate} isWikiMode={isWiki} />
                        <LinksDisplay label="Mythic Roots" ids={[...new Set([...(entity.mythIds || []), ...backlinks.myths])]} all={allEntities} onNav={onNavigate} isWikiMode={isWiki} />
                        <LinksDisplay label="Event Ties" ids={[...new Set([...(entity.eventIds || []), ...backlinks.events])]} all={allEntities} onNav={onNavigate} isWikiMode={isWiki} />
                        {isChar && (
                            <>
                                <LinksDisplay label="Allies" ids={backlinks.allies} all={allEntities} onNav={onNavigate} isWikiMode={isWiki} />
                                <LinksDisplay label="Enemies/Rivals" ids={backlinks.enemies} all={allEntities} onNav={onNavigate} isWikiMode={isWiki} />
                                <LinksDisplay 
                                    label="Known Affiliations" 
                                    ids={
                                        char.groupConnections && typeof char.groupConnections === 'object'
                                            ? Object.values(char.groupConnections).flatMap((g: any) => (g && typeof g === 'object' && Array.isArray(g.connectedTo) ? g.connectedTo : []))
                                            : []
                                    } 
                                    all={allEntities} 
                                    onNav={onNavigate} 
                                    isWikiMode={isWiki} 
                                    wikiStyle="tag" 
                                />
                            </>
                        )}
                        {entity.type === 'item' && (
                            <LinksDisplay label="Current Owners/Users" ids={backlinks.referencedIn} all={allEntities} onNav={onNavigate} isWikiMode={isWiki} />
                        )}
                        {(entity.type === 'species' || entity.type === 'organization' || entity.type === 'political' || entity.type === 'religious' || entity.type === 'magic' || entity.type === 'science') && (
                            <LinksDisplay label="Prominent Members" ids={backlinks.members} all={allEntities} onNav={onNavigate} isWikiMode={isWiki} />
                        )}
                        {(entity.type === 'ability' || entity.type === 'technology') && (
                            <LinksDisplay label="Known Practitioners" ids={backlinks.practitioners} all={allEntities} onNav={onNavigate} isWikiMode={isWiki} />
                        )}
                    </div>
                )}

                {entity.privateNotes && (
                    <div className="bg-rose-500/5 border border-rose-900/20 p-8 rounded-2xl">
                        <h3 className="text-xs font-black uppercase mb-4 tracking-widest text-rose-500">DM Confidential Notes</h3>
                        <p className="text-rose-200/70 font-mono text-sm whitespace-pre-wrap">{entity.privateNotes}</p>
                    </div>
                )}
            </div>

            {/* Right Column Stat Block / Infobox */}
            <aside className="lg:w-72 shrink-0 space-y-6">
                {isRoyal ? (
                    <>
                        {isChar && <CharacterStatBlock entity={entity} allEntities={allEntities} onNavigate={onNavigate} hideName={true} backlinks={backlinks} />}
                        {!isChar && (
                            <div className="bg-[#3f0d19] text-[#fef08a] border-4 border-[#c8a96e] rounded-3xl p-6 shadow-2xl space-y-4">
                                <div className="text-center border-b border-[#c8a96e]/30 pb-3">
                                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#e6c687]">Record Vitals</span>
                                    <h3 className="font-serif font-black text-lg text-[#e6c687] uppercase mt-1">{entity.name}</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[#c8a96e] font-bold text-[10px] uppercase tracking-widest">Type</span>
                                        <span className="text-white text-[11px]">{TYPE_LABELS[entity.type as EntityType]}</span>
                                    </div>
                                    {entity.tags?.length ? (
                                        <div className="flex justify-between">
                                            <span className="text-[#c8a96e] font-bold text-[10px] uppercase tracking-widest">Tags</span>
                                            <span className="text-white text-[11px]">{entity.tags.join(', ')}</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </>
                ) : isWiki ? (
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
                                    <LinksDisplay label="Local Languages" ids={loc.localLanguageIds || []} all={allEntities} onNav={onNavigate} isWikiMode={isWiki} wikiStyle="inline" />
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
            {isRoyal ? (
                <RoyalHeader entity={entity} onEdit={onEdit} onDelete={onDelete} />
            ) : isWiki ? (
                <WikiHeader entity={entity} onEdit={onEdit} onDelete={onDelete} />
            ) : (
                <CodexHeader entity={entity} onEdit={onEdit} onDelete={onDelete} />
            )}
            <MainView />
        </article>
    );
};
