import React, { useMemo } from 'react';
import { Folder } from 'lucide-react';
import { CodexHeader, WikiHeader, RoyalHeader } from './ViewerHeaders';
import { CharacterStatBlock } from './CharacterStatBlock';
import { WikiInfobox } from './WikiInfobox';
import { FieldRow, LinksDisplay, MarkdownRenderer } from '../ui';
import { NexusImage } from '../ui/NexusImage';
import { EntityViewerProps, Character, EntityType, Location } from '../../types';
import { TYPE_LABELS } from '../../constants';
import { getCategorizedBacklinks } from '../../utils/backlinkUtils';
import { EntitySpecificsViewerRegistry } from './specifics/EntitySpecificsViewerRegistry';
import { ViewerSectionCard } from './ViewerSectionCard';
import { useWorldStore } from '../../store/useWorldStore';
import { useTheme } from '../../theme';
import { isEntityDeceased, isEntityCategory, isEntityFinished } from '../../utils/documentModeUtils';

export const EntityViewer = ({ entity, allEntities, onEdit, onDelete, onNavigate, onFocusMap }: EntityViewerProps) => {
    const isChar = entity.type === 'character';
    const isLoc = entity.type === 'location';
    const char = entity as Character;
    const loc = entity as Location;
    const { layoutMode, themeId } = useTheme();
    const isWiki = layoutMode === 'wiki';
    const updateEntityLock = useWorldStore(state => state.updateEntityLock);

    const isDeceased = isEntityDeceased(entity);
    const isCategory = isEntityCategory(entity);
    const isFinished = isEntityFinished(entity);
    const childEntities = useMemo(() => allEntities.filter(e => e.parentId === entity.id), [allEntities, entity.id]);

    const handleToggleLock = () => {
        updateEntityLock(entity.id, !entity.isReadOnly);
    };

    // Calculate categorized backlinks
    const backlinks = useMemo(() => getCategorizedBacklinks(entity.id, allEntities), [entity.id, allEntities]);

    // Royal Codex: show tabs (Overview / Biography / Relations / Inventory) at top
    const [activeTab, setActiveTab] = React.useState<string>('overview');

    const royalTabs = ['Overview', 'Biography', 'Relations', 'Inventory'];

    const MainView = () => (
        <div className={`flex ${isWiki || (themeId === 'royal-codex') ? 'flex-row gap-8' : 'flex-col lg:flex-row gap-12'}`}>
            <div className="flex-1 min-w-0 space-y-6">
                {/* Royal Codex Tab Bar */}
                {(themeId === 'royal-codex') && (
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
                {(!(themeId === 'royal-codex') || activeTab === 'overview' || activeTab === 'biography') && (
                    <ViewerSectionCard 
                        title={isCategory ? 'Category Overview' : (isChar ? 'Biography' : 'Overview')} 
                        badgeText={isCategory ? 'Folder Container' : (isFinished ? 'Finished' : undefined)}
                    >
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            {entity.description?.trim() ? (
                                <MarkdownRenderer
                                    content={entity.description}
                                    allEntities={allEntities}
                                    onNavigate={onNavigate}
                                    className="flex-1 min-w-0"
                                />
                            ) : (
                                <p className={`flex-1 text-base leading-relaxed opacity-40 italic ${(themeId === 'royal-codex') ? 'font-serif text-[#2b1810]' : isWiki ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'}`}>
                                    No description provided yet.
                                </p>
                            )}
                        </div>
                    </ViewerSectionCard>
                )}


                {/* Specifics Sections OR Category Directory */}
                {isCategory ? (
                    <ViewerSectionCard title="Folder Contents & Nested Entries" badgeText={`${childEntities.length} Entries`}>
                        {childEntities.length === 0 ? (
                            <p className={`text-sm opacity-50 italic py-4 ${(themeId === 'royal-codex') ? 'font-serif' : ''}`}>
                                No child entries are currently filed under this folder container.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {childEntities.map(child => {
                                    const isChildDeceased = isEntityDeceased(child);
                                    const isChildCat = isEntityCategory(child);
                                    return (
                                        <button
                                            key={child.id}
                                            onClick={() => onNavigate(child.id)}
                                            className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-all hover:scale-[1.01] shadow-sm ${
                                                isWiki
                                                    ? 'bg-white border-[#d4c8af] hover:border-[#b91c1c]/50'
                                                    : (themeId === 'royal-codex')
                                                    ? 'bg-[#f7f0e1] border-[#c8a96e]/60 hover:border-[#70121e]'
                                                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
                                            }`}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    {isChildCat && <Folder size={12} className="text-teal-400 shrink-0" />}
                                                    <span className={`text-xs font-bold truncate ${isChildDeceased ? 'line-through opacity-80' : ''}`}>
                                                        {child.name}
                                                    </span>
                                                    {isChildDeceased && <span className="text-[11px] font-serif text-rose-400 font-bold">†</span>}
                                                </div>
                                                <div className="text-[9px] uppercase tracking-widest opacity-50 mt-0.5">
                                                    {TYPE_LABELS[child.type]}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </ViewerSectionCard>
                ) : (
                    (!(themeId === 'royal-codex') || activeTab === 'overview') && (
                        <div className="space-y-6">
                            <EntitySpecificsViewerRegistry entity={entity} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />
                        </div>
                    )
                )}

                {entity.spoilerNotes && (!(themeId === 'royal-codex') || activeTab === 'overview') && (
                    <ViewerSectionCard title="Secrets / DM Notes">
                        <MarkdownRenderer
                            content={entity.spoilerNotes}
                            allEntities={allEntities}
                            onNavigate={onNavigate}
                        />
                    </ViewerSectionCard>
                )}

                {(!(themeId === 'royal-codex') || activeTab === 'relations') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <LinksDisplay label="Lore Connections" ids={[...new Set([...(entity.loreNoteIds || []), ...backlinks.lore, ...backlinks.referencedIn])]} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Mythic Roots" ids={[...new Set([...(entity.mythIds || []), ...backlinks.myths])]} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Event Ties" ids={[...new Set([...(entity.eventIds || []), ...backlinks.events])]} all={allEntities} onNav={onNavigate} />
                        {isChar && (
                            <>
                                <LinksDisplay label="Allies" ids={backlinks.allies} all={allEntities} onNav={onNavigate} />
                                <LinksDisplay label="Enemies/Rivals" ids={backlinks.enemies} all={allEntities} onNav={onNavigate} />
                                <LinksDisplay 
                                    label="Known Affiliations" 
                                    ids={
                                        char.groupConnections && typeof char.groupConnections === 'object'
                                            ? Object.values(char.groupConnections).flatMap((g: any) => (g && typeof g === 'object' && Array.isArray(g.connectedTo) ? g.connectedTo : []))
                                            : []
                                    } 
                                    all={allEntities} 
                                    onNav={onNavigate} 
                                    wikiStyle="tag" 
                                />
                            </>
                        )}
                        {entity.type === 'item' && (
                            <LinksDisplay label="Current Owners/Users" ids={backlinks.referencedIn} all={allEntities} onNav={onNavigate} />
                        )}
                        {(entity.type === 'species' || entity.type === 'organization' || entity.type === 'political' || entity.type === 'religious' || entity.type === 'magic' || entity.type === 'science') && (
                            <LinksDisplay label="Prominent Members" ids={backlinks.members} all={allEntities} onNav={onNavigate} />
                        )}
                        {(entity.type === 'ability' || entity.type === 'science' || entity.type === 'tech' || entity.type === 'magic') && (
                            <LinksDisplay label="Known Practitioners / Users" ids={backlinks.practitioners} all={allEntities} onNav={onNavigate} />
                        )}
                        {backlinks.predecessors && backlinks.predecessors.length > 0 && (
                            <LinksDisplay label="Preceding Roots / Ancestors" ids={backlinks.predecessors} all={allEntities} onNav={onNavigate} />
                        )}
                        {backlinks.successors && backlinks.successors.length > 0 && (
                            <LinksDisplay label="Succeeding Branches / Descendants" ids={backlinks.successors} all={allEntities} onNav={onNavigate} />
                        )}
                        {backlinks.prerequisites && backlinks.prerequisites.length > 0 && (
                            <LinksDisplay label="Prerequisites / Components" ids={backlinks.prerequisites} all={allEntities} onNav={onNavigate} />
                        )}
                        {backlinks.unlocks && backlinks.unlocks.length > 0 && (
                            <LinksDisplay label="Enables / Refines Into" ids={backlinks.unlocks} all={allEntities} onNav={onNavigate} />
                        )}
                    </div>
                )}

                {entity.privateNotes && (
                    <div className="bg-rose-500/5 border border-rose-900/20 p-8 rounded-2xl">
                        <h3 className="text-xs font-black uppercase mb-4 tracking-widest text-rose-500">DM Confidential Notes</h3>
                        <MarkdownRenderer
                            content={entity.privateNotes}
                            allEntities={allEntities}
                            onNavigate={onNavigate}
                        />
                    </div>
                )}
            </div>

            {/* Right Column Stat Block / Infobox */}
            <aside className="lg:w-72 shrink-0 space-y-6">
                {(themeId === 'royal-codex') ? (
                    <>
                        {isChar && <CharacterStatBlock entity={entity} allEntities={allEntities} onNavigate={onNavigate} hideName={true} backlinks={backlinks} />}
                        {!isChar && (
                            <div className="bg-[#3f0d19] text-[#fef08a] border-4 border-[#c8a96e] rounded-3xl p-6 shadow-2xl space-y-4">
                                {entity.imageUri && (
                                    <div className="w-full aspect-square rounded-2xl overflow-hidden border border-[#c8a96e]/40 shadow-lg">
                                        <NexusImage src={entity.imageUri} className="w-full h-full object-cover" containerClassName="w-full h-full" />
                                    </div>
                                )}
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
                                    <FieldRow label="Type" value={loc.locationType} />
                                    <FieldRow label="Demographics" value={loc.population} />
                                    <FieldRow label="Manifested" value={loc.creationTime || (loc as any).dateOfCreation} />
                                    <LinksDisplay label="Local Languages" ids={loc.pairedLanguages || (loc as any).localLanguageIds || []} all={allEntities} onNav={onNavigate} wikiStyle="inline" />
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {isChar && <CharacterStatBlock entity={entity} allEntities={allEntities} onNavigate={onNavigate} hideName={true} backlinks={backlinks} />}
                        <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 h-fit sticky top-10 space-y-6">
                            {!isChar && entity.imageUri && (
                                <div className="w-full aspect-square rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl">
                                    <NexusImage src={entity.imageUri} className="w-full h-full object-cover" containerClassName="w-full h-full" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-[10px] font-black text-[#fef08a] uppercase tracking-[0.4em] mb-6 border-b border-slate-800/60 pb-3">Record Vitals</h3>
                                <div className="space-y-6">
                                    <FieldRow label="Type" value={TYPE_LABELS[entity.type as EntityType]} />
                                    <FieldRow label="Template" value={entity.docTemplate?.join(', ') || (entity as any).documentTemplate || "Generic"} />
                                    <FieldRow label="Order" value={entity.order || (entity as any).orderNumber} />
                                    <FieldRow label="Status" value={(entity as any).status || (entity.deadSwitch ? 'Lost' : 'Active')} />
                                    <FieldRow label="Hierarchy" value={allEntities.find(e => e.id === (entity.parentId || (entity as any).belongsUnderId))?.name} />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </aside>
        </div>
    );

    return (
        <article className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {(themeId === 'royal-codex') ? (
                <RoyalHeader entity={entity} onEdit={onEdit} onDelete={onDelete} onToggleLock={handleToggleLock} />
            ) : isWiki ? (
                <WikiHeader entity={entity} onEdit={onEdit} onDelete={onDelete} onToggleLock={handleToggleLock} />
            ) : (
                <CodexHeader entity={entity} onEdit={onEdit} onDelete={onDelete} onToggleLock={handleToggleLock} />
            )}
            <MainView />
        </article>
    );
};
