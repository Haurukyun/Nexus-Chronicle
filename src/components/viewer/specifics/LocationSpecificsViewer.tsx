import React from 'react';
import { Location, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';
import { Compass, MapPin } from 'lucide-react';
import { useWorldStore } from '../../../store/useWorldStore';

interface Props {
    entity: Location;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
    backlinks?: any;
}

export const LocationSpecificsViewer: React.FC<Props> = ({ entity: loc, allEntities, onNavigate, isWikiMode, backlinks }) => {
    return (
        <div className="space-y-8">
            {!isWikiMode && (
                <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                    <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a] flex items-center gap-2">
                        <Compass size={14} /> Geographic Intelligence & Atlas Anchor
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                        <FieldRow label="Type" value={loc.locationType} isWikiMode={false} />
                        <FieldRow label="Population" value={loc.population} isWikiMode={false} />
                        <FieldRow label="Size" value={loc.size} isWikiMode={false} />
                        <FieldRow label="Founded" value={loc.dateOfCreation} isWikiMode={false} />
                        <FieldRow label="Ended" value={loc.dateOfEnd} isWikiMode={false} />
                        <FieldRow 
                            label="Atlas Anchor" 
                            value={loc.coordinates ? `X: ${loc.coordinates.x}%, Y: ${loc.coordinates.y}%` : "Unanchored"} 
                            isWikiMode={false} 
                        />
                        <div className="col-span-2 mt-4 space-y-4">
                            <FieldRow label="Unusual Layout/Features" value={loc.unusualFeatures} isWikiMode={false} />
                            <LinksDisplay label="Preceding Geography" ids={loc.precedingLocationIds || []} all={allEntities} onNav={onNavigate} isWikiMode={false} />
                            <LinksDisplay label="Succeeding Geography" ids={loc.succeedingLocationIds || []} all={allEntities} onNav={onNavigate} isWikiMode={false} />
                        </div>
                    </div>

                    {/* Mini visual map preview if coordinates exist */}
                    {loc.coordinates && (
                        <div className="mt-6 pt-6 border-t border-slate-800/80">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block flex items-center gap-1.5">
                                <MapPin size={12} className="text-[#fef08a]" /> Cartographic Fixation
                            </span>
                            <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                                <img
                                    src={useWorldStore.getState().world.mapImage}
                                    alt="Atlas Pin"
                                    className="w-full h-full object-cover filter contrast-105 opacity-80"
                                />
                                <div
                                    style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
                                    className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center animate-in zoom-in"
                                >
                                    <div className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mb-0.5 shadow-md bg-black/90 text-yellow-300 border border-yellow-500/40">
                                        {loc.name}
                                    </div>
                                    <div className="p-1 rounded-full bg-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.8)]">
                                        <MapPin size={14} fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {loc.traditionsAndCustoms && (
                <div className={isWikiMode ? 'mb-12' : 'bg-slate-900/10 border-slate-800/40 p-10 rounded-[2rem] border'}>
                    <h3 className={`text-2xl font-serif font-bold ${isWikiMode ? 'text-[#e69a28] border-b border-[#e69a28] pb-2' : 'text-[#fef08a]'} mb-6 tracking-tight`}>Traditions & Customs</h3>
                    <p className={`${isWikiMode ? 'text-[#2d2d2d] font-serif' : 'text-slate-300 font-light'} whitespace-pre-wrap`}>{loc.traditionsAndCustoms}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <LinksDisplay label="Characters Born Here" ids={loc.originatedCharacterIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                <LinksDisplay label="Current Residents" ids={[...new Set([...(loc.livingCharacterIds || []), ...(backlinks?.residents || [])])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                <LinksDisplay label="Historical Figures (Lost Here)" ids={[...new Set([...(loc.deceasedCharacterIds || []), ...(backlinks?.passedHere || [])])]} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                <LinksDisplay label="Neighbouring Lands" ids={loc.neighbouringLocationIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                <LinksDisplay label="Internal Points of Interest" ids={backlinks?.containedIn || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                <LinksDisplay label="Governing Authorities" ids={Object.values(loc.governingGroupConnections || {}).flatMap((g: any) => g.connectedTo || [])} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} wikiStyle="tag" />
                <LinksDisplay label="Local Languages" ids={loc.localLanguageIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                <LinksDisplay label="Local Currencies" ids={loc.localCurrencyIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                <LinksDisplay label="Local Cultures/Art" ids={loc.localCultureIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                <LinksDisplay label="Common Occupations/Classes" ids={loc.commonOccupationIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                <LinksDisplay label="Local Resources/Materials" ids={loc.localResourceIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                <LinksDisplay label="Local Species/Races/Flora/Fauna" ids={loc.localSpeciesIds} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
            </div>
        </div>
    );
};
