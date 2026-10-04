import React from 'react';
import { Condition, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';
import { useTheme } from '../../../theme';

interface Props {
    entity: Condition;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    backlinks?: any;
}

export const ConditionSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, backlinks }) => {
    const { t } = useTheme();
    return (
        <div className="space-y-8">
            {entity.features && (
                <div className={`${t.card.panel} p-10 rounded-[2rem] mb-12`}>
                    <h3 className={`text-2xl font-serif font-bold ${t.colors.textHeading} mb-6 tracking-tight`}>Prominent features</h3>
                    <p className={`${t.typography.body} whitespace-pre-wrap`}>{entity.features}</p>
                </div>
            )}
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Connections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Duration" value={entity.duration} />
                    <FieldRow label="Ways of attaining" value={entity.meansOfAttaining} />
                    <FieldRow label="Ways of removing" value={entity.meansOfRemoving} />
                    <FieldRow label="Description & History" value={entity.description} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Related Boons" ids={entity.pairedConnectedConditionsPositive || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Related Afflictions" ids={entity.pairedConnectedConditionsNegative || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Related Other conditions" ids={entity.pairedConnectedConditionsOther || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Affecting Characters positively" ids={entity.pairedCharactersPositive || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Affecting Characters negatively" ids={entity.pairedCharactersNegative || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Affecting Characters in other ways" ids={entity.pairedCharactersOther || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Characters" ids={entity.pairedCharactersConnected || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Affecting Locations/Geography positively" ids={entity.pairedLocationsPositive || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Affecting Locations/Geography negatively" ids={entity.pairedLocationsNegative || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Affecting Locations/Geography in other ways" ids={entity.pairedLocationsOther || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Affecting Events positively" ids={entity.pairedEventsPositive || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Affecting Events negatively" ids={entity.pairedEventsNegative || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Affecting Events in other ways" ids={entity.pairedEventsOther || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Affecting Species/Races/Flora/Fauna positively" ids={entity.pairedRacesPositive || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Affecting Species/Races/Flora/Fauna negatively" ids={entity.pairedRacesNegative || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Affecting Species/Races/Flora/Fauna in other ways" ids={entity.pairedRacesOther || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Vital Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Affliction/Boon/Condition type" value={entity.conditionType} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Myths/Legends/Stories" ids={entity.pairedMyths || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Stats & Knowledge</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Stats/Attributes modifiers" value={entity.statsListRequired} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Caused by positive Skills/Spells/Other" ids={entity.pairedSkillsPositive || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Caused by negative Skills/Spells/Other" ids={entity.pairedSkillsNegative || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Caused by neutral/other Skills/Spells/Other" ids={entity.pairedSkillsOther || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            {entity.traditions && (
                <div className={`${t.card.panel} p-10 rounded-[2rem] mb-12`}>
                    <h3 className={`text-2xl font-serif font-bold ${t.colors.textHeading} mb-6 tracking-tight`}>Traditions & customs connected to the item</h3>
                    <p className={`${t.typography.body} whitespace-pre-wrap`}>{entity.traditions}</p>
                </div>
            )}
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Governance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Ideologies/Political groups" ids={entity.pairedRacesPoliticalGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Teachings/Religious groups" ids={entity.pairedReligiousGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Organizations/Other groups" ids={entity.pairedOtherGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Schools of Magic/Magical groups" ids={entity.pairedMagicGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Sciences/Technological groups" ids={entity.pairedTechGroups || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Inventory & Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Boon caused by Items" ids={entity.pairedItemsPositive || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Affliction caused by Items" ids={entity.pairedItemsNegative || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Other Condition caused by Items" ids={entity.pairedItemsOther || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Affecting the following Items" ids={entity.pairedItemsAfflicting || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Caused by positive Resources/Materials" ids={entity.pairedResourcesPositive || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Caused by negative Resources/Materials" ids={entity.pairedResourcesNegative || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Caused by neutral/other Resources/Materials" ids={entity.pairedResourcesOther || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
        </div>
    );
};
