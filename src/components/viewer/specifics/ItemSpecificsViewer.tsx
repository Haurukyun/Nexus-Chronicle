import React from 'react';
import { Item, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';
import { useTheme } from '../../../theme';

interface Props {
    entity: Item;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
    backlinks?: any;
}

export const ItemSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, isWikiMode, backlinks }) => {
    const { t } = useTheme();
    return (
        <div className="space-y-8">
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Governance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Capable of utilizing Spells/Magic" ids={entity.pairedMagic || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Ideologies/Political groups" ids={entity.pairedConnectedPolGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Teachings/Religious groups" ids={entity.pairedConnectedRelGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Sciences/Technological groups" ids={entity.pairedConnectedTechGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Inventory & Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Cost in different Currencies" value={entity.priceInCurrencies} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Currencies" ids={entity.pairedCurrencies || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Related to other Items" ids={entity.pairedItems || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Resources/Materials the Item is made of" ids={entity.pairedResourcesMade || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Resources/Materials the Item produces" ids={entity.pairedResourcesProduced || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            {entity.features && (
                <div className={`${t.card.panel} p-10 rounded-[2rem] mb-12`}>
                    <h3 className={`text-2xl font-serif font-bold ${t.colors.textHeading} mb-6 tracking-tight`}>Prominent features</h3>
                    <p className={`${t.typography.body} whitespace-pre-wrap`}>{entity.features}</p>
                </div>
            )}
            {entity.traditions && (
                <div className={`${t.card.panel} p-10 rounded-[2rem] mb-12`}>
                    <h3 className={`text-2xl font-serif font-bold ${t.colors.textHeading} mb-6 tracking-tight`}>Traditions & customs connected to the item</h3>
                    <p className={`${t.typography.body} whitespace-pre-wrap`}>{entity.traditions}</p>
                </div>
            )}
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Traditions & Customs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-2">
                        <LinksDisplay label="Connected to Cultures/Art" ids={entity.relatedCultures || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Interpersonal Web</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Involved in Events" ids={entity.pairedEvents || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Vital Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Involved in Myths, legends and stories" ids={entity.pairedMyths || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Allows for usage of Skills/Spells/Other" ids={entity.pairedSkillsUsing || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Connections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Description & History" value={entity.description} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Causing Boons" ids={entity.pairedConditionsPositive || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Causing Afflictions" ids={entity.pairedConditionsNegative || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Causing Other conditions" ids={entity.pairedConditionsOther || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Affected by Afflictions/Boons/Conditions" ids={entity.pairedConditionsAfflicting || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Characters" ids={entity.pairedConnectedCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Locations" ids={entity.pairedConnectedLocations || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Species/Races/Flora/Fauna" ids={entity.pairedConnectedRaces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to by Occupations/Classes" ids={entity.pairedConnectedProfessions || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Stats & Knowledge</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Stats/Attributes required" value={entity.statsListRequired} isWikiMode={isWikiMode} />
                    <FieldRow label="Stats/Attributes provided" value={entity.statsList} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Commonly used with Skills/Spells/Other" ids={entity.pairedSkillsCommon || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Created by Skills/Spells/Other" ids={entity.pairedSkillsCreate || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Skills/Spells/Other requiring this Item" ids={entity.pairedSkillsRequire || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
        </div>
    );
};
