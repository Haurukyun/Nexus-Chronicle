import React, { useMemo, useState, useEffect } from 'react';
import { 
    Folder, Hash, Printer, Compass, BookOpen, Shield, 
    Sparkles, Package, Heart, Swords, Ghost, GitMerge, 
    EyeOff, ChevronRight, ChevronLeft, ChevronsRight, X,
    AlertTriangle, Landmark, CloudRain,
    Crown, Scroll, Castle, Anchor
} from 'lucide-react';
import { CodexHeader, WikiHeader, RoyalHeader } from './ViewerHeaders';
import { CharacterStatBlock } from './CharacterStatBlock';
import { WikiInfobox } from './WikiInfobox';
import { FieldRow, LinksDisplay, MarkdownRenderer } from '../ui';
import { NexusImage } from '../ui/NexusImage';
import { EntityViewerProps, Character, EntityType, Location, Organization } from '../../types';
import { TYPE_LABELS } from '../../constants';
import { getCategorizedBacklinks } from '../../utils/backlinkUtils';
import { EntitySpecificsViewerRegistry } from './specifics/EntitySpecificsViewerRegistry';
import { ViewerSectionCard } from './ViewerSectionCard';
import { useWorldStore } from '../../store/useWorldStore';
import { useTheme } from '../../theme';
import { isEntityDeceased, isEntityCategory, isEntityFinished } from '../../utils/documentModeUtils';
import { generateRelationSheetHtml, openPrintableDocument } from '../../utils/characterSheetUtils';
import { isModuleActive } from '../../utils/realmConfig';

export const EntityViewer = ({ entity, allEntities, onEdit, onDelete, onNavigate, onFocusMap }: EntityViewerProps) => {
    const isChar = entity.type === 'character';
    const isLoc = entity.type === 'location';
    const char = entity as Character;
    const loc = entity as Location;
    const { layoutMode, themeId } = useTheme();
    const isWiki = layoutMode === 'wiki';
    const updateEntityLock = useWorldStore(state => state.updateEntityLock);
    const world = useWorldStore(state => state.world);
    const showCombatStats = isModuleActive(world, 'combatStats');
    const showCharacterStatBlock = isChar && showCombatStats && char.statBlockMode !== 'none';

    const isDeceased = isEntityDeceased(entity);
    const isCategory = isEntityCategory(entity);
    const isFinished = isEntityFinished(entity);
    const childEntities = useMemo(() => allEntities.filter(e => e.parentId === entity.id), [allEntities, entity.id]);

    const handleToggleLock = () => {
        updateEntityLock(entity.id, !entity.isReadOnly);
    };

    // Calculate categorized backlinks
    const backlinks = useMemo(() => getCategorizedBacklinks(entity.id, allEntities), [entity.id, allEntities]);
    const parentEntity = allEntities.find(e => e.id === (entity.parentId || (entity as any).belongsUnderId));

    const isRoyal = themeId === 'royal-codex';
    const isVoyager = themeId === 'grand-voyager';

    // Royal Codex: show tabs (Overview / Biography / Relations / Inventory) at top
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [activeSection, setActiveSection] = useState<string>('section-overview');
    const [isNavExpanded, setIsNavExpanded] = useState<boolean>(true);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

    useEffect(() => {
        setActiveTab('overview');
        setActiveSection('section-overview');
    }, [entity.id]);

    const totalBacklinkCount = useMemo(() => {
        return Object.values(backlinks).reduce((acc: number, arr: any) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
    }, [backlinks]);

    const navItems = useMemo(() => {
        const items: Array<{ id: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [];

        items.push({
            id: 'section-overview',
            label: isCategory ? 'Category Overview' : (isChar ? 'Biography' : 'Overview'),
            icon: BookOpen
        });

        if (isCategory) {
            items.push({
                id: 'section-directory',
                label: `Folder Contents (${childEntities.length})`,
                icon: Folder
            });
        } else if (isChar) {
            items.push({ id: 'section-vitals', label: 'Vital Records', icon: Shield });

            const hasTraits = Boolean(char.personalityTraits?.trim() || (char as any).traitsList?.length);
            if (hasTraits) {
                items.push({ id: 'section-traits', label: 'Traits & Quirks', icon: Sparkles });
            }

            const hasFeatures = Boolean(char.traits?.trim() || (char as any).uniqueFeaturesList?.length);
            if (hasFeatures) {
                items.push({ id: 'section-features', label: 'Unique Features', icon: Sparkles });
            }

            items.push(
                { id: 'section-inventory', label: 'Inventory & Gear', icon: Package },
                { id: 'section-interpersonal', label: 'Kinship & Ties', icon: Heart },
                { id: 'section-affiliations', label: 'Affiliations', icon: Swords }
            );
        } else if (isLoc) {
            items.push({ id: 'section-specifics', label: 'Atlas Anchor & Vitals', icon: Compass });
            if (loc.defenses?.trim()) items.push({ id: 'section-defenses', label: 'Defenses', icon: Shield });
            if (loc.hazards?.trim()) items.push({ id: 'section-hazards', label: 'Hazards', icon: AlertTriangle });
            if (loc.notableLandmarks?.trim()) items.push({ id: 'section-landmarks', label: 'Landmarks', icon: Landmark });
            if (loc.climateNotes?.trim()) items.push({ id: 'section-climate', label: 'Climate', icon: CloudRain });
            if (loc.traditionsAndCustoms?.trim()) items.push({ id: 'section-traditions', label: 'Traditions', icon: BookOpen });
        } else if (entity.type === 'organization' || entity.type === 'political' || entity.type === 'religious') {
            const org = entity as any;
            items.push({ id: 'section-specifics', label: 'Governance & Vitals', icon: Anchor });
            if (org.hierarchyRanks?.trim()) items.push({ id: 'section-hierarchy', label: 'Hierarchy', icon: Crown });
            if (org.coreTenets?.trim()) items.push({ id: 'section-tenets', label: 'Tenets & Creed', icon: Scroll });
            if (org.factionAssets?.trim()) items.push({ id: 'section-assets', label: 'Assets & Strongholds', icon: Castle });
            if (org.traditions?.trim()) items.push({ id: 'section-traditions', label: 'Traditions', icon: BookOpen });
        } else {
            items.push({
                id: 'section-specifics',
                label: `${TYPE_LABELS[entity.type as EntityType] || entity.type} Vitals`,
                icon: Compass
            });
        }

        if (entity.spoilerNotes?.trim()) {
            items.push({ id: 'section-spoilers', label: 'Secrets / Spoilers', icon: Ghost });
        }

        items.push({
            id: 'section-relations',
            label: `Ties & Backlinks (${totalBacklinkCount})`,
            icon: GitMerge
        });

        if (entity.privateNotes?.trim()) {
            items.push({ id: 'section-private-notes', label: 'DM Confidential', icon: EyeOff });
        }

        if (entity.customAttributes && Object.keys(entity.customAttributes).length > 0) {
            items.push({ id: 'section-attributes', label: 'Custom Attributes', icon: Hash });
        }

        return items;
    }, [entity, isCategory, isChar, isLoc, childEntities.length, totalBacklinkCount]);

    useEffect(() => {
        const sectionIds = navItems.map(item => item.id);
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.find(e => e.isIntersecting);
                if (visible) {
                    setActiveSection(visible.target.id);
                }
            },
            { rootMargin: '-10% 0px -70% 0px', threshold: 0.05 }
        );

        sectionIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [navItems]);

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        if (isRoyal) {
            if (id === 'section-relations' || id === 'section-interpersonal' || id === 'section-affiliations') {
                setActiveTab('relations');
            } else if (id === 'section-inventory') {
                setActiveTab('inventory');
            } else {
                setActiveTab('overview');
            }
        }
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 50);
    };

    const getActiveItemClasses = (isActive: boolean) => {
        if (isActive) {
            if (isRoyal) return 'bg-[#70121e] text-[#fff8e7] font-serif font-bold border border-[#c8a96e]/40 shadow-sm';
            if (isWiki) return 'bg-[#b91c1c] text-white font-bold shadow-sm';
            if (isVoyager) return 'bg-[#2dd4bf] text-[#0a1c1c] font-bold shadow-sm';
            return 'bg-[#fef08a] text-black font-bold shadow-sm';
        }
        if (isRoyal) return 'text-[#3d271d] hover:bg-[#70121e]/10 hover:text-[#70121e]';
        if (isWiki) return 'text-[#2d2d2d] hover:bg-amber-100/60 hover:text-[#854d0e]';
        if (isVoyager) return 'text-[#f5e9d0]/80 hover:bg-[#2dd4bf]/15 hover:text-[#2dd4bf]';
        return 'text-slate-300 hover:bg-white/10 hover:text-white';
    };

    const accentIconClass = isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#b91c1c]' : isVoyager ? 'text-[#2dd4bf]' : 'text-[#fef08a]';
    const headerTitleClass = isRoyal ? 'font-serif text-[#3d0a10]' : isWiki ? 'text-[#854d0e]' : isVoyager ? 'text-[#2dd4bf]' : 'text-[#fef08a]';
    const mobileCompassButtonClasses = isRoyal
        ? 'bg-[#70121e] text-[#fff8e7] border-2 border-[#c8a96e] shadow-xl hover:bg-[#881337]'
        : isWiki
            ? 'bg-[#b91c1c] text-white border-2 border-amber-300 shadow-xl hover:bg-[#991b1b]'
            : isVoyager
                ? 'bg-[#2dd4bf] text-[#0a1c1c] border-2 border-[#14b8a6] shadow-xl hover:bg-[#14b8a6]'
                : 'bg-[#fef08a] text-black border-2 border-yellow-300 shadow-xl hover:bg-yellow-300';

    const royalTabs = ['Overview', 'Biography', 'Relations', 'Inventory'];

    const MainView = () => (
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start relative min-w-0 w-full">
            {/* Desktop Sticky Quick-Jump Navigation Rail */}
            <aside className={`hidden 2xl:block shrink-0 sticky top-6 z-20 transition-all duration-200 self-start ${isNavExpanded ? 'w-52' : 'w-11'}`}>
                <div className={`rounded-2xl border backdrop-blur-md shadow-xl transition-all ${
                    isNavExpanded ? 'p-3' : 'p-1.5'
                } ${
                    isRoyal
                        ? 'bg-[#f7efe0]/95 border-[#c8a96e]/60 text-[#2b1810]'
                        : isWiki
                            ? 'bg-[#fdfcf0]/95 border-[#d4c8af] text-[#2d2d2d]'
                            : isVoyager
                                ? 'bg-[#0e2424]/95 border-[#2dd4bf]/40 text-[#f5e9d0]'
                                : 'bg-slate-900/90 border-slate-700/60 text-slate-200'
                }`}>
                    {isNavExpanded ? (
                        <>
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-current/15">
                                <div className="flex items-center gap-1.5">
                                    <Compass size={14} className={accentIconClass} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${headerTitleClass}`}>
                                        Quick Codex
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsNavExpanded(false)}
                                    className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                                    title="Collapse Navigator"
                                >
                                    <ChevronLeft size={13} />
                                </button>
                            </div>
                            <nav className="space-y-1">
                                {navItems.map(item => {
                                    const isActive = activeSection === item.id;
                                    const IconComponent = item.icon;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => scrollToSection(item.id)}
                                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-left transition-all cursor-pointer ${getActiveItemClasses(isActive)}`}
                                        >
                                            <IconComponent size={13} className="shrink-0 opacity-80" />
                                            <span className="truncate flex-1">{item.label}</span>
                                            {isActive && <ChevronRight size={12} className="shrink-0 opacity-80" />}
                                        </button>
                                    );
                                })}
                            </nav>
                        </>
                    ) : (
                        <div className="flex flex-col items-center space-y-1">
                            <button
                                type="button"
                                onClick={() => setIsNavExpanded(true)}
                                className="p-1.5 rounded-lg opacity-70 hover:opacity-100 transition-opacity flex justify-center w-full cursor-pointer mb-1 border-b border-current/15"
                                title="Expand Quick Codex"
                            >
                                <ChevronsRight size={14} className={accentIconClass} />
                            </button>
                            {navItems.map(item => {
                                const isActive = activeSection === item.id;
                                const IconComponent = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => scrollToSection(item.id)}
                                        title={item.label}
                                        className={`w-full flex justify-center p-2 rounded-xl text-xs transition-all cursor-pointer ${getActiveItemClasses(isActive)}`}
                                    >
                                        <IconComponent size={14} />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </aside>

            <div className="flex-1 min-w-0 space-y-6">
                {/* Royal Codex Tab Bar */}
                {(themeId === 'royal-codex') && (
                    <div className="flex flex-wrap border-b-0 gap-1.5 mb-4">
                        {royalTabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`relative px-3 sm:px-5 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-serif font-bold uppercase tracking-widest rounded-t-md transition-all cursor-pointer ${
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
                        id="section-overview"
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
                    <ViewerSectionCard id="section-directory" title="Folder Contents & Nested Entries" badgeText={`${childEntities.length} Entries`}>
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
                                            className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-all hover:scale-[1.01] shadow-sm cursor-pointer ${
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
                        <div id="section-specifics" className="space-y-6">
                            <EntitySpecificsViewerRegistry entity={entity} allEntities={allEntities} onNavigate={onNavigate} backlinks={backlinks} />
                        </div>
                    )
                )}

                {entity.spoilerNotes && (!(themeId === 'royal-codex') || activeTab === 'overview') && (
                    <ViewerSectionCard id="section-spoilers" title="Secrets / DM Notes">
                        <MarkdownRenderer
                            content={entity.spoilerNotes}
                            allEntities={allEntities}
                            onNavigate={onNavigate}
                        />
                    </ViewerSectionCard>
                )}

                {(!(themeId === 'royal-codex') || activeTab === 'relations') && (
                    <div id="section-relations" className="space-y-4">
                        {isChar && (
                            <div className="flex items-center justify-between p-3 rounded-2xl border border-current/15 bg-black/5 dark:bg-white/5 backdrop-blur-sm">
                                <span className={`text-xs font-bold uppercase tracking-wider opacity-70 ${themeId === 'royal-codex' ? 'font-serif text-[#2b1810]' : ''}`}>
                                    Interpersonal Web & Relations
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const html = generateRelationSheetHtml(char, allEntities, { theme: themeId });
                                        openPrintableDocument(html, `${char.name.toLowerCase().replace(/\s+/g, '-')}-relations`);
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer hover:scale-[1.02] ${
                                        themeId === 'royal-codex'
                                            ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e] hover:bg-[#881337] font-serif'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-500'
                                    }`}
                                    title="Print dedicated relationship web sheet (PDF / Handout)"
                                >
                                    <Printer size={13} />
                                    <span>Print Relation Sheet</span>
                                </button>
                            </div>
                        )}
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
                    </div>
                )}

                {entity.privateNotes && (
                    <div id="section-private-notes" className="bg-rose-500/5 border border-rose-900/20 p-8 rounded-2xl">
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
            <aside className="w-full xl:w-80 2xl:w-96 shrink-0 space-y-6 min-w-0 max-w-full">
                {(themeId === 'royal-codex') ? (
                    <>
                        {showCharacterStatBlock ? (
                            <CharacterStatBlock entity={entity} allEntities={allEntities} onNavigate={onNavigate} hideName={true} backlinks={backlinks} />
                        ) : (
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
                                    {parentEntity && (
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-[#c8a96e] font-bold text-[10px] uppercase tracking-widest">Hierarchy</span>
                                            <button
                                                type="button"
                                                onClick={() => onNavigate(parentEntity.id)}
                                                className="text-[#fef08a] hover:text-white font-bold hover:underline text-[11px] text-right cursor-pointer"
                                                title={`Navigate to ${parentEntity.name}`}
                                            >
                                                {parentEntity.name}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : isWiki ? (
                    <>
                        {showCharacterStatBlock ? (
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
                        {showCharacterStatBlock && <CharacterStatBlock entity={entity} allEntities={allEntities} onNavigate={onNavigate} hideName={true} backlinks={backlinks} />}
                        {!showCharacterStatBlock && (
                            <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 h-fit sticky top-10 space-y-6">
                                {entity.imageUri && (
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
                                        <FieldRow
                                            label="Hierarchy"
                                            value={parentEntity ? (
                                                <button
                                                    type="button"
                                                    onClick={() => onNavigate(parentEntity.id)}
                                                    className="text-left font-bold hover:underline transition-colors cursor-pointer text-[#fef08a]"
                                                    title={`Navigate to ${parentEntity.name}`}
                                                >
                                                    {parentEntity.name}
                                                </button>
                                            ) : null}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Custom Attributes */}
                        {entity.customAttributes && Object.keys(entity.customAttributes).length > 0 && (
                            <div id="section-attributes" className={`p-4 rounded-xl border space-y-2 ${
                                themeId === 'royal-codex' ? 'bg-[#3f0d19] text-[#fef08a] border-[#c8a96e]/40' :
                                isWiki ? 'bg-[#fdfcf0] text-[#2b1810] border-rose-300/40' :
                                'bg-slate-900/40 text-slate-100 border-slate-800'
                            }`}>
                                <h4 className={`text-[10px] font-black uppercase tracking-widest border-b pb-2 ${
                                    themeId === 'royal-codex' ? 'text-[#c8a96e]' :
                                    isWiki ? 'text-[#b91c1c]' :
                                    'text-[#fef08a]'
                                }`}>
                                    <Hash size={12} className="inline-block mr-1" /> Custom Attributes
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(entity.customAttributes).map(([key, value]) => (
                                        <div key={key} className="flex flex-col gap-0.5">
                                            <span className={`text-[10px] font-mono font-bold ${themeId === 'royal-codex' ? 'text-[#e6c687]' : isWiki ? 'text-[#854d0e]' : 'text-[#fef08a]'}`}>
                                                {key}
                                            </span>
                                            <span className={`text-[11px] ${themeId === 'royal-codex' ? 'text-[#fef08a]' : isWiki ? 'text-[#2b1810]' : 'text-slate-200'}`}>
                                                {value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </>
                )}
            </aside>
        </div>
    );

    return (
        <article className="animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
            {(themeId === 'royal-codex') ? (
                <RoyalHeader entity={entity} onEdit={onEdit} onDelete={onDelete} onToggleLock={handleToggleLock} />
            ) : isWiki ? (
                <WikiHeader entity={entity} onEdit={onEdit} onDelete={onDelete} onToggleLock={handleToggleLock} />
            ) : (
                <CodexHeader entity={entity} onEdit={onEdit} onDelete={onDelete} onToggleLock={handleToggleLock} />
            )}
            <MainView />

            {/* Mobile / Tablet Floating Quick Jump Button */}
            <div className="xl:hidden fixed bottom-6 right-6 z-40">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                        className={`p-3.5 rounded-full shadow-2xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer ${mobileCompassButtonClasses}`}
                        title="Jump to Section"
                    >
                        <Compass size={20} />
                    </button>

                    {isMobileNavOpen && (
                        <div className={`absolute bottom-14 right-0 w-60 p-3 rounded-2xl border backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-50 ${
                            isRoyal
                                ? 'bg-[#f7efe0] border-[#c8a96e] text-[#2b1810]'
                                : isWiki
                                    ? 'bg-[#fdfcf0] border-[#d4c8af] text-[#2d2d2d]'
                                    : isVoyager
                                        ? 'bg-[#0e2424] border-[#2dd4bf]/50 text-[#f5e9d0]'
                                        : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}>
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-current/15">
                                <div className="flex items-center gap-1.5">
                                    <Compass size={14} className={accentIconClass} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${headerTitleClass}`}>Jump to Category</span>
                                </div>
                                <button type="button" onClick={() => setIsMobileNavOpen(false)} className="p-1 opacity-60 hover:opacity-100 cursor-pointer">
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
                                {navItems.map((item) => {
                                    const IconComponent = item.icon;
                                    const isActive = activeSection === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                scrollToSection(item.id);
                                                setIsMobileNavOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                                                isActive ? getActiveItemClasses(true) : 'hover:bg-black/10 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            <IconComponent size={14} className="shrink-0 opacity-80" />
                                            <span className="truncate flex-1">{item.label}</span>
                                            {isActive && <ChevronRight size={12} className="shrink-0 opacity-80" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};
