import React, { useState, useMemo } from 'react';
import {
    Newspaper, Swords, Shield, Heart, Calendar, HelpCircle,
    ExternalLink, Sparkles, Filter, RefreshCw, BookOpen, MapPin, Users
} from 'lucide-react';
import { WorldData, WorldEntity, FactionRelation, PlotThread, Event } from '../types';
import { useTheme } from '../theme';
import { VectorFiligreeCorner } from '../components/ui/VectorFiligreeCorner';

interface Props {
    world: WorldData;
    onNavigate: (id: string) => void;
}

export type DispatchCategory = 'all' | 'diplomacy' | 'dynasty' | 'history' | 'mystery';

export interface GazetteArticle {
    id: string;
    category: 'diplomacy' | 'dynasty' | 'history' | 'mystery';
    headline: string;
    lead: string;
    body: string;
    dateStamp?: string;
    importance: 'breaking' | 'major' | 'feature';
    linkedEntityIds: string[];
    tag: string;
}

/**
 * Procedural world newspaper engine.
 * Synthesizes living lore from pure client-side state (0 AI, 100% deterministic & offline).
 */
export function generateGazetteArticles(world: WorldData): GazetteArticle[] {
    const articles: GazetteArticle[] = [];
    const worldSuffix = world.name && world.name.trim() && world.name !== 'Aethelgard Chronicle'
        ? ` in the world of ${world.name}`
        : world.name && world.name.trim()
            ? ` in ${world.name}`
            : '';

    const entities = world.entities || [];
    const characters = entities.filter(e => e.type === 'character');
    const factions = entities.filter(e => ['political', 'religious', 'organization', 'magic', 'science', 'tech'].includes(e.type));
    const events = entities.filter(e => e.type === 'event') as (Event & WorldEntity)[];
    const relations = world.factionRelations || [];
    const threads = world.plotThreads || [];

    // 1. DIPLOMATIC & FACTION DISPATCHES
    relations.forEach((rel) => {
        const fA = factions.find(f => f.id === rel.factionAId);
        const fB = factions.find(f => f.id === rel.factionBId);
        if (!fA || !fB) return;

        if (rel.tension >= 75) {
            articles.push({
                id: `rel-${rel.id}`,
                category: 'diplomacy',
                importance: 'breaking',
                tag: 'Sworn Allies',
                headline: `GRAND ALLIANCE: ${fA.name.toUpperCase()} & ${fB.name.toUpperCase()} PLEDGE BROTHERHOOD`,
                lead: `${fA.name} and ${fB.name} are sworn allies${worldSuffix}.`,
                body: rel.notes
                    ? `Envoys have ratified binding treaties. Official chronicle note: "${rel.notes}". Mutual defense pacts and open border transit have been decreed.`
                    : `Diplomatic emissaries confirm that ${fA.name} and ${fB.name} have forged an unbreakable compact${worldSuffix}, pledging to stand side-by-side against all realm adversities.`,
                linkedEntityIds: [fA.id, fB.id],
            });
        } else if (rel.tension >= 30) {
            articles.push({
                id: `rel-${rel.id}`,
                category: 'diplomacy',
                importance: 'major',
                tag: 'Allied Accord',
                headline: `DIPLOMATIC ENTENTE: ${fA.name.toUpperCase()} & ${fB.name.toUpperCase()} ALIGN INTERESTS`,
                lead: `${fA.name} and ${fB.name} are allied${worldSuffix}.`,
                body: rel.notes
                    ? `Chronicle records state: "${rel.notes}". Bilateral agreements continue to solidify their political cohesion.`
                    : `Leaders of ${fA.name} and ${fB.name} have concluded formal negotiations, ushering in a period of coordinated trade and diplomatic solidarity${worldSuffix}.`,
                linkedEntityIds: [fA.id, fB.id],
            });
        } else if (rel.tension <= -75) {
            articles.push({
                id: `rel-${rel.id}`,
                category: 'diplomacy',
                importance: 'breaking',
                tag: 'Total War',
                headline: `STATE OF TOTAL WAR: ${fA.name.toUpperCase()} & ${fB.name.toUpperCase()} MUSTER ARMIES`,
                lead: `${fA.name} and ${fB.name} have entered active war${worldSuffix}.`,
                body: rel.notes
                    ? `Frontline dispatch records: "${rel.notes}". Border fortifications have raised battle banners with hostilities actively engaged.`
                    : `All diplomatic avenues have collapsed. Troops and battle banners from ${fA.name} clash openly against ${fB.name}${worldSuffix}, sparking widespread upheaval.`,
                linkedEntityIds: [fA.id, fB.id],
            });
        } else if (rel.tension <= -30) {
            articles.push({
                id: `rel-${rel.id}`,
                category: 'diplomacy',
                importance: 'major',
                tag: 'Hostile Borders',
                headline: `ESCALATING TENSIONS: SHADOWS OF CONFLICT OVER ${fA.name.toUpperCase()} & ${fB.name.toUpperCase()}`,
                lead: `Diplomatic relations between ${fA.name} and ${fB.name} have deteriorated into open hostility${worldSuffix}.`,
                body: rel.notes
                    ? `Diplomatic record note: "${rel.notes}". Scouts report skirmishes and tightened checkpoints along all shared territories.`
                    : `Emissaries report frozen negotiations and heightened readiness along the frontiers. Observers fear outright confrontation may soon follow.`,
                linkedEntityIds: [fA.id, fB.id],
            });
        }
    });

    // 2. DYNASTIC & BLOODLINE CHRONICLES
    characters.forEach((char) => {
        const charAny = char as any;
        const childIds: string[] = Array.isArray(char.childrenIds)
            ? char.childrenIds
            : Array.isArray(charAny.pairedChildren)
                ? charAny.pairedChildren
                : [];

        if (childIds.length >= 2) {
            const children = childIds.map(id => characters.find(c => c.id === id)).filter(Boolean) as WorldEntity[];
            if (children.length >= 2) {
                const namesList = children.length === 2
                    ? `${children[0].name} and ${children[1].name}`
                    : `${children.slice(0, -1).map(c => c.name).join(', ')}, and ${children[children.length - 1].name}`;

                articles.push({
                    id: `dynasty-children-${char.id}`,
                    category: 'dynasty',
                    importance: 'major',
                    tag: 'Dynastic Lineage',
                    headline: `HOUSE OF ${char.name.toUpperCase()}: THE HEIRS OF THE LINEAGE`,
                    lead: `${char.name} has ${children.length} children of note, named ${namesList}${worldSuffix}.`,
                    body: `Court heralds acknowledge this lineage as a prominent branch of succession. The heirs carry the bloodline, titles, and ancestral heritage forward into the unfolding era.`,
                    linkedEntityIds: [char.id, ...children.map(c => c.id)],
                });
            }
        }

        // Enmities / Rivalries
        const enemyIds: string[] = Array.isArray(char.enemyIds)
            ? char.enemyIds
            : Array.isArray(charAny.pairedEnemyCharacter)
                ? charAny.pairedEnemyCharacter
                : [];

        if (enemyIds.length > 0) {
            const rival = characters.find(c => c.id === enemyIds[0]);
            if (rival) {
                articles.push({
                    id: `feud-${char.id}-${rival.id}`,
                    category: 'dynasty',
                    importance: 'feature',
                    tag: 'Blood Feud',
                    headline: `COURT RIVALRY: THE BITTER FEUD OF ${char.name.toUpperCase()} & ${rival.name.toUpperCase()}`,
                    lead: `An enduring enmity persists between ${char.name} and ${rival.name}${worldSuffix}.`,
                    body: `Historians and chroniclers report that mutual animosity between the two shows no sign of waning. Their ongoing friction continues to sway alliances and influence factional politics.`,
                    linkedEntityIds: [char.id, rival.id],
                });
            }
        }
    });

    // 3. HISTORICAL ERAS & CONVERGENCES
    events.forEach((ev) => {
        const evAny = ev as any;
        const start = evAny.startDate || evAny.eventStartYear || evAny.startYear || evAny.year;
        const end = evAny.endDate || evAny.eventEndYear || evAny.endYear;

        if (start && end && start !== end) {
            articles.push({
                id: `hist-${ev.id}`,
                category: 'history',
                importance: 'major',
                tag: 'Historical Saga',
                headline: `CHRONICLES OF ${start}–${end}: THE SAGA OF ${ev.name.toUpperCase()}`,
                lead: `From ${start} to ${end}, the realm was defined by ${ev.name}${worldSuffix}.`,
                body: ev.description
                    ? `Archival records recount: ${ev.description.slice(0, 180)}... The epochal consequences of this era remain etched into modern maps and treaties.`
                    : `Spanning multiple transformative years, this pivotal event set into motion political, cultural, and territorial realignments that resonate to this day.`,
                dateStamp: `${start} – ${end}`,
                linkedEntityIds: [ev.id],
            });
        } else if (start) {
            articles.push({
                id: `hist-single-${ev.id}`,
                category: 'history',
                importance: 'feature',
                tag: 'Historical Landmark',
                headline: `YEAR ${start} ARCHIVE: THE OCCURRENCE OF ${ev.name.toUpperCase()}`,
                lead: `In the recorded year of ${start}, chroniclers inscribed the historic occurrence of ${ev.name}${worldSuffix}.`,
                body: ev.description
                    ? `${ev.description.slice(0, 160)}... Scholars frequently cite this moment as a decisive turning point in regional history.`
                    : `Marked prominently on the Chronos axis, the occurrence continues to serve as an anchor point for reckoning dates and genealogies.`,
                dateStamp: `Year ${start}`,
                linkedEntityIds: [ev.id],
            });
        }
    });

    // 4. THE CONSPIRACY & INVESTIGATION DESK
    threads.forEach((t) => {
        const revealedCount = t.clues.filter(c => c.isRevealed).length;
        if (t.status === 'open') {
            articles.push({
                id: `thread-${t.id}`,
                category: 'mystery',
                importance: 'feature',
                tag: 'Unsolved Enigma',
                headline: `WHISPERS IN THE SHADOWS: THE ENIGMA OF ${t.title.toUpperCase()}`,
                lead: `${t.title} remains an unresolved investigation${worldSuffix}.`,
                body: t.clues.length > 0
                    ? `Investigators have recorded ${t.clues.length} pieces of evidence (${revealedCount} verified in public rumors). The true mastermind and motive remain shrouded in obscurity.`
                    : `Murmurs persist across taverns and scriptoriums regarding this mystery. No definitive conclusion has yet been recorded in the permanent chronicle.`,
                linkedEntityIds: t.linkedEntityIds || [],
            });
        } else if (t.status === 'resolved') {
            articles.push({
                id: `thread-res-${t.id}`,
                category: 'mystery',
                importance: 'major',
                tag: 'Mystery Solved',
                headline: `TRUTH BROUGHT TO LIGHT: THE RESOLUTION OF ${t.title.toUpperCase()}`,
                lead: `The tangled enigma of ${t.title} has finally been brought to a definitive resolution${worldSuffix}.`,
                body: `After comprehensive inquiry and the collection of decisive evidence, chroniclers have declared this inquiry closed. Its revelations are now archived for posterity.`,
                linkedEntityIds: t.linkedEntityIds || [],
            });
        }
    });

    return articles;
}

export const GazetteView: React.FC<Props> = ({ world, onNavigate }) => {
    const { themeId, layoutMode } = useTheme();
    const isRoyal = themeId === 'royal-codex';
    const isWiki = layoutMode === 'wiki';
    const isGrandVoyager = themeId === 'grand-voyager';

    const [selectedCategory, setSelectedCategory] = useState<DispatchCategory>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const articles = useMemo(() => generateGazetteArticles(world), [world]);

    const filteredArticles = useMemo(() => {
        return articles.filter(a => {
            const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
            const matchesSearch = !searchQuery ||
                a.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.lead.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.body.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [articles, selectedCategory, searchQuery]);

    // Theme tokens
    const realmName = world.name || 'The Known Realm';
    const containerBg = isRoyal
        ? 'bg-[#fcf8ee] border-2 border-[#c8a96e] text-[#2b1810]'
        : isWiki
            ? 'bg-[#fdfcf0] border-2 border-[#d4c8af] text-[#2d2d2d]'
            : isGrandVoyager
                ? 'bg-[#0f2320]/95 border border-[#2dd4bf]/40 text-[#f5e9d0]'
                : 'bg-slate-900/90 border border-slate-700 text-slate-100';

    const headerBorder = isRoyal ? 'border-[#c8a96e]' : isWiki ? 'border-[#d4c8af]' : 'border-current/20';

    return (
        <div className="max-w-5xl mx-auto w-full pb-28 pt-2 px-2 sm:px-4 space-y-6 animate-in fade-in duration-500">
            {/* Broadsheet Masthead */}
            <div className={`rounded-3xl p-6 sm:p-8 border-2 shadow-2xl relative overflow-hidden ${containerBg}`}>
                {/* Ornamental Filigree Corners */}
                {isRoyal && (
                    <>
                        <VectorFiligreeCorner position="top-left"     size={28} color="#c8a96e" className="absolute top-2 left-2"     />
                        <VectorFiligreeCorner position="top-right"    size={28} color="#c8a96e" className="absolute top-2 right-2"    />
                        <VectorFiligreeCorner position="bottom-left"  size={28} color="#c8a96e" className="absolute bottom-2 left-2"  />
                        <VectorFiligreeCorner position="bottom-right" size={28} color="#c8a96e" className="absolute bottom-2 right-2" />
                    </>
                )}

                {/* Top Dateline Strip */}
                <div className={`flex items-center justify-between border-b-2 pb-2 text-[10px] font-mono uppercase tracking-widest font-bold opacity-70 ${headerBorder}`}>
                    <span>Dispatch Volume I · Broadsheet Edition</span>
                    <span>{realmName} Chronicle Records</span>
                    <span>{filteredArticles.length} Dispatches Inscribed</span>
                </div>

                {/* Masthead Title */}
                <div className="text-center py-6 border-b-2 my-3" style={{ borderColor: isRoyal ? '#c8a96e' : 'currentColor' }}>
                    <h1 className={`text-4xl sm:text-6xl font-black uppercase tracking-tighter ${isRoyal ? 'font-serif text-[#3d0a10]' : isWiki ? 'text-[#854d0e]' : isGrandVoyager ? 'text-[#2dd4bf]' : 'text-[#fef08a]'}`}>
                        The Chronicle Gazette
                    </h1>
                    <p className={`text-xs sm:text-sm mt-2 italic max-w-2xl mx-auto ${isRoyal ? 'font-serif text-[#5c2a12]' : 'opacity-70'}`}>
                        The Living Herald of {realmName} — automatic diplomatic intelligence, dynastic successions, epochal sagas & mystery chronicles
                    </p>
                </div>

                {/* Filter Ribbon */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                            { id: 'all', label: 'All Dispatches', icon: Newspaper },
                            { id: 'diplomacy', label: 'Diplomacy & War', icon: Swords },
                            { id: 'dynasty', label: 'Dynasties & Heirs', icon: Heart },
                            { id: 'history', label: 'Epochs & Eras', icon: Calendar },
                            { id: 'mystery', label: 'The Mystery Desk', icon: HelpCircle },
                        ].map(tab => {
                            const Icon = tab.icon;
                            const isActive = selectedCategory === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(tab.id as any)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                                        isActive
                                            ? isRoyal
                                                ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e] shadow-md font-serif'
                                                : isWiki
                                                    ? 'bg-[#b91c1c] text-white shadow-md'
                                                    : isGrandVoyager
                                                        ? 'bg-[#2dd4bf] text-slate-950 shadow-md'
                                                        : 'bg-[#fef08a] text-slate-950 shadow-md'
                                            : isRoyal
                                                ? 'text-[#3d0a10] hover:bg-[#70121e]/10 border border-[#c8a96e]/40'
                                                : 'opacity-60 hover:opacity-100 hover:bg-black/5'
                                    }`}
                                >
                                    <Icon size={13} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Filter news..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={`text-xs px-3 py-1.5 rounded-xl border outline-none font-medium ${
                                isRoyal
                                    ? 'border-2 border-[#c8a96e] bg-[#fffcf5] text-[#2b1810] placeholder-[#2b1810]/40'
                                    : 'border border-current/20 bg-black/5 text-current'
                            }`}
                        />
                    </div>
                </div>
            </div>

            {/* Articles Grid */}
            {filteredArticles.length === 0 ? (
                <div className={`p-16 rounded-3xl border-2 border-dashed text-center space-y-3 ${containerBg}`}>
                    <Newspaper size={42} className="mx-auto opacity-30" />
                    <h3 className={`text-lg font-bold uppercase tracking-wider ${isRoyal ? 'font-serif text-[#3d0a10]' : ''}`}>
                        No Dispatches on the Wire
                    </h3>
                    <p className="text-xs opacity-60 max-w-md mx-auto">
                        The realm is tranquil. Form alliances in the Balance of Power, assign children to characters, record dated historical events, or start a Plot Thread to see live articles printed here!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredArticles.map((article, idx) => {
                        const isBreaking = article.importance === 'breaking';
                        const isSpanFull = idx === 0 && filteredArticles.length > 2;

                        return (
                            <article
                                key={article.id}
                                className={`rounded-2xl p-5 sm:p-6 border-2 shadow-lg transition-all hover:scale-[1.01] flex flex-col justify-between ${containerBg} ${
                                    isSpanFull ? 'md:col-span-2' : ''
                                }`}
                                style={{
                                    borderLeftWidth: isBreaking ? 6 : 2,
                                    borderLeftColor: isBreaking ? (isRoyal ? '#70121e' : '#ef4444') : undefined
                                }}
                            >
                                <div className="space-y-3">
                                    {/* Article Tag & Datestamp */}
                                    <div className="flex items-center justify-between border-b pb-2 border-current/10">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                            isBreaking
                                                ? isRoyal ? 'bg-[#70121e] text-[#fff8e7]' : 'bg-red-600 text-white'
                                                : isRoyal ? 'bg-[#c8a96e]/20 text-[#70121e]' : 'bg-black/10'
                                        }`}>
                                            {article.tag}
                                        </span>
                                        {article.dateStamp && (
                                            <span className="text-[10px] font-mono font-bold opacity-60">
                                                {article.dateStamp}
                                            </span>
                                        )}
                                    </div>

                                    {/* Headline */}
                                    <h2 className={`font-black uppercase tracking-tight leading-tight ${
                                        isSpanFull ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
                                    } ${isRoyal ? 'font-serif text-[#3d0a10]' : ''}`}>
                                        {article.headline}
                                    </h2>

                                    {/* Lead paragraph */}
                                    <p className={`font-serif text-sm font-semibold leading-relaxed ${
                                        isRoyal ? 'text-[#70121e]' : 'text-amber-500 font-bold'
                                    }`}>
                                        {article.lead}
                                    </p>

                                    {/* Body text */}
                                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed font-sans">
                                        {article.body}
                                    </p>
                                </div>

                                {/* Linked Codex Entity Chips */}
                                {article.linkedEntityIds.length > 0 && (
                                    <div className="pt-4 mt-4 border-t border-current/10 flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[9px] font-mono uppercase tracking-wider opacity-50">Related:</span>
                                            {article.linkedEntityIds.map(id => {
                                                const ent = world.entities.find(e => e.id === id);
                                                if (!ent) return null;
                                                return (
                                                    <button
                                                        key={id}
                                                        type="button"
                                                        onClick={() => onNavigate(id)}
                                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 ${
                                                            isRoyal
                                                                ? 'border-[#c8a96e] bg-[#fffcf5] text-[#3d0a10] hover:bg-[#70121e] hover:text-[#fff8e7]'
                                                                : 'border-current/30 hover:bg-black/10'
                                                        }`}
                                                        title={`Open ${ent.name} dossier`}
                                                    >
                                                        <span>{ent.name}</span>
                                                        <ExternalLink size={9} className="opacity-60" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
