import React from 'react';
import { Currency, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';
import { useTheme } from '../../../theme';

interface Props {
    entity: Currency;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
    backlinks?: any;
}

export const CurrencySpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, isWikiMode, backlinks }) => {
    const { t } = useTheme();
    return (
        <div className="space-y-8">
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Inventory & Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Exchange rates to other Currencies" value={entity.priceCurrencies} isWikiMode={isWikiMode} />
                    <FieldRow label="Made from Resources/Materials" value={entity.madeFromResources} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Items" ids={entity.pairedItems || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            {entity.traits && (
                <div className={`${t.card.panel} p-10 rounded-[2rem] mb-12`}>
                    <h3 className={`text-2xl font-serif font-bold ${t.colors.textHeading} mb-6 tracking-tight`}>Defining Features/Traits</h3>
                    <p className={`${t.typography.body} whitespace-pre-wrap`}>{entity.traits}</p>
                </div>
            )}
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Connections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Description & History" value={entity.description} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Used in Locations" ids={entity.pairedLocations || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Used by Races" ids={entity.usedByRaces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Governance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Used by Ideologies/Political groups" ids={entity.usedInPoliticalGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Used by Organizations/Other groups" ids={entity.usedInOtherGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
        </div>
    );
};
