import React, { useMemo } from 'react';
import { Location, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';
import { useTheme } from '../../../theme';
import { Compass, MapPin, Shield, AlertTriangle, Landmark, CloudRain } from 'lucide-react';
import { useWorldStore } from '../../../store/useWorldStore';
import { ViewerSectionCard } from '../ViewerSectionCard';

interface Props {
    entity: Location;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    backlinks?: any;
}

const parseTraitList = (raw: string | undefined): { name: string; note?: string }[] => {
    if (!raw || !raw.trim()) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map((item: any) => {
                if (typeof item === 'string') return { name: item };
                return { name: item.name || item.title || '', note: item.note || '' };
            }).filter(i => i.name.trim());
        }
    } catch {
        return raw
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean)
            .map(line => {
                const clean = line.replace(/^[•\-\*]\s*/, '');
                const parts = clean.split(/:\s*(.+)/);
                return {
                    name: parts[0]?.trim() || clean,
                    note: parts[1]?.trim() || '',
                };
            });
    }
    return [];
};

const StructuredListDisplay: React.FC<{
    items: { name: string; note?: string }[];
    icon: React.ComponentType<{ size?: number; className?: string }>;
    isRoyal: boolean;
}> = ({ items, icon: Icon, isRoyal }) => {
    return (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item, idx) => (
                <li
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-sm transition-all ${
                        isRoyal
                            ? 'bg-[#f7f0e1]/90 border-[#c8a96e]/50 text-[#2b1810]'
                            : 'bg-black/10 border-white/10 text-inherit'
                    }`}
                >
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isRoyal ? 'bg-[#70121e]/10 text-[#70121e]' : 'bg-amber-400/10 text-amber-400'
                    }`}>
                        <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold leading-snug">{item.name}</div>
                        {item.note && (
                            <div className={`text-xs mt-1 leading-relaxed italic opacity-85 ${
                                isRoyal ? 'text-[#5c2a12]' : 'text-slate-400'
                            }`}>
                                {item.note}
                            </div>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
};

export const LocationSpecificsViewer: React.FC<Props> = ({ entity: loc, allEntities, onNavigate, backlinks }) => {
    const { t, layoutMode, themeId } = useTheme();
    const isWikiMode = layoutMode === 'wiki';
    const isRoyal = themeId === 'royal-codex';

    const defenses = useMemo(() => parseTraitList(loc.defenses), [loc.defenses]);
    const hazards = useMemo(() => parseTraitList(loc.hazards), [loc.hazards]);
    const landmarks = useMemo(() => parseTraitList(loc.notableLandmarks), [loc.notableLandmarks]);
    const climate = useMemo(() => parseTraitList(loc.climateNotes), [loc.climateNotes]);

    return (
        <div className="space-y-8">
            {!isWikiMode && (
                <div className={`${t.card.base} p-4 sm:p-6 md:p-8 rounded-2xl w-full min-w-0 max-w-full`}>
                    <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent} flex items-center gap-2`}>
                        <Compass size={14} /> Geographic Intelligence & Atlas Anchor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-10">
                        <FieldRow label="Type" value={loc.locationType} />
                        <FieldRow label="Population" value={loc.population} />
                        <FieldRow label="Size" value={loc.size} />
                        <FieldRow label="Founded" value={loc.dateOfCreation} />
                        <FieldRow label="Ended" value={loc.dateOfEnd} />
                        {loc.coordinates ? (
                            <>
                                <FieldRow label="Anchor X" value={`${loc.coordinates.x}%`} />
                                <FieldRow label="Anchor Y" value={`${loc.coordinates.y}%`} />
                            </>
                        ) : (
                            <FieldRow label="Atlas Anchor" value="Unanchored" />
                        )}
                        <div className="col-span-2 mt-4 space-y-4">
                            <FieldRow label="Unusual Layout/Features" value={loc.unusualFeatures} />
                            <LinksDisplay label="Preceding Geography" ids={loc.precedingLocationIds || []} all={allEntities} onNav={onNavigate} />
                            <LinksDisplay label="Succeeding Geography" ids={loc.succeedingLocationIds || []} all={allEntities} onNav={onNavigate} />
                        </div>
                    </div>

                    {/* Mini visual map preview if coordinates exist — always full-width, outside the 2-col grid */}
                    {loc.coordinates && (
                        <div className="mt-6 pt-6 border-t border-slate-800/80">
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${t.colors.textMuted} flex items-center gap-1.5`}>
                                    <MapPin size={12} className={t.colors.textAccent} /> Atlas Anchor Pin
                                </span>
                                <button
                                    type="button"
                                    onClick={() => useWorldStore.getState().focusMapLocation(loc.id)}
                                    className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors ${t.colors.textAccent} hover:underline cursor-pointer shrink-0`}
                                >
                                    <Compass size={13} /> Open in World Atlas
                                </button>
                            </div>
                            <div className={`relative w-full aspect-[21/9] rounded-xl overflow-hidden ${t.colors.borderDefault} border bg-slate-950 shadow-inner`}>
                                <img
                                    src={useWorldStore.getState().world.mapImage}
                                    alt="Atlas Pin"
                                    className="w-full h-full object-cover filter contrast-105 opacity-80"
                                />
                                <div
                                    style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
                                    className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center animate-in zoom-in"
                                >
                                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mb-0.5 shadow-md ${t.card.panel} ${t.colors.textAccent}`}>
                                        {loc.name}
                                    </div>
                                    <div className={`p-1 rounded-full ${t.colors.accentBg} text-white shadow-lg`}>
                                        <MapPin size={14} fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {defenses.length > 0 && (
                <ViewerSectionCard id="section-defenses" title="Defenses & Fortifications" badgeText={`${defenses.length}`}>
                    <StructuredListDisplay items={defenses} icon={Shield} isRoyal={isRoyal} />
                </ViewerSectionCard>
            )}

            {hazards.length > 0 && (
                <ViewerSectionCard id="section-hazards" title="Hazards & Environmental Dangers" badgeText={`${hazards.length}`}>
                    <StructuredListDisplay items={hazards} icon={AlertTriangle} isRoyal={isRoyal} />
                </ViewerSectionCard>
            )}

            {landmarks.length > 0 && (
                <ViewerSectionCard id="section-landmarks" title="Notable Landmarks" badgeText={`${landmarks.length}`}>
                    <StructuredListDisplay items={landmarks} icon={Landmark} isRoyal={isRoyal} />
                </ViewerSectionCard>
            )}

            {climate.length > 0 && (
                <ViewerSectionCard id="section-climate" title="Climate & Weather" badgeText={`${climate.length}`}>
                    <StructuredListDisplay items={climate} icon={CloudRain} isRoyal={isRoyal} />
                </ViewerSectionCard>
            )}

            {loc.traditionsAndCustoms && (
                <ViewerSectionCard id="section-traditions" title="Traditions & Customs">
                    <p className={`${t.typography.body} whitespace-pre-wrap leading-relaxed`}>{loc.traditionsAndCustoms}</p>
                </ViewerSectionCard>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <LinksDisplay label="Characters Born Here" ids={[...new Set([...(loc.originatedCharacterIds || []), ...(loc.pairedOriginCharactersNew || []), ...(backlinks?.natives || [])])]} all={allEntities} onNav={onNavigate} />
                <LinksDisplay label="Current Residents" ids={[...new Set([...(loc.livingCharacterIds || []), ...(loc.pairedCurrentCharactersNew || []), ...(backlinks?.residents || [])])]} all={allEntities} onNav={onNavigate} />
                <LinksDisplay label="Historical Figures (Lost Here)" ids={[...new Set([...(loc.deceasedCharacterIds || []), ...(loc.pairedDemiseCharactersNew || []), ...(backlinks?.passedHere || [])])]} all={allEntities} onNav={onNavigate} />
                <LinksDisplay label="Neighbouring Lands" ids={loc.neighbouringLocationIds} all={allEntities} onNav={onNavigate} />
                <LinksDisplay label="Internal Points of Interest" ids={backlinks?.containedIn || []} all={allEntities} onNav={onNavigate} />
                <LinksDisplay label="Governing Authorities" ids={Object.values(loc.governingGroupConnections || {}).flatMap((g: any) => g.connectedTo || [])} all={allEntities} onNav={onNavigate} wikiStyle="tag" />
                <LinksDisplay label="Local Languages" ids={loc.localLanguageIds} all={allEntities} onNav={onNavigate} />
                <LinksDisplay label="Local Currencies" ids={loc.localCurrencyIds} all={allEntities} onNav={onNavigate} />
                <LinksDisplay label="Local Cultures/Art" ids={loc.localCultureIds} all={allEntities} onNav={onNavigate} />
                <LinksDisplay label="Common Occupations/Classes" ids={loc.commonOccupationIds} all={allEntities} onNav={onNavigate} />
                <LinksDisplay label="Local Resources/Materials" ids={loc.localResourceIds} all={allEntities} onNav={onNavigate} />
                <LinksDisplay label="Local Species/Races/Flora/Fauna" ids={loc.localSpeciesIds} all={allEntities} onNav={onNavigate} />
            </div>
        </div>
    );
};
