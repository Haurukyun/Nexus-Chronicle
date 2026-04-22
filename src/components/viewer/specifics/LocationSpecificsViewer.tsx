import React from 'react';
import { Location, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';

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
