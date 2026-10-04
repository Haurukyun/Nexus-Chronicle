import React from 'react';
import { Ability, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';
import { useTheme } from '../../../theme';

interface Props {
    entity: Ability;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    backlinks?: any;
}

export const AbilitySpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, backlinks }) => {
    const { t } = useTheme();
    return (
        <div className="space-y-8">
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Stats & Knowledge</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Stats/Attributes required" value={entity.statsListRequired} />
                    <FieldRow label="Stats/Attributes provided" value={entity.statsListProvided} />
                    <FieldRow label="Complexity to use" value={entity.levelSkill} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Related Skills/Spells/Other" ids={entity.pairedSkills || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Prerequisites Skills/Spells/Other" ids={entity.prerequisiteSkills || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Required by Skills/Spells/Other" ids={entity.postrequisiteSkills || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Items capable of using this Skills/Spells/Other" ids={entity.pairedItemsUsing || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Characters" ids={entity.pairedCharacterSkills || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Locations/Geography" ids={entity.pairedLocationsSkills || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Species/Races/Flora/Fauna" ids={entity.pairedRacesSkills || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Skills/Other connected to Events" ids={entity.pairedEventSkills || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Spells connected to Events" ids={entity.pairedEventSpells || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Organizations/Other groups" ids={entity.pairedOtherGroupsSkills || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            {entity.traits && (
                <div className={`${t.card.panel} p-10 rounded-[2rem] mb-12`}>
                    <h3 className={`text-2xl font-serif font-bold ${t.colors.textHeading} mb-6 tracking-tight`}>Unique/Defining Features</h3>
                    <p className={`${t.typography.body} whitespace-pre-wrap`}>{entity.traits}</p>
                </div>
            )}
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Vital Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Type" value={entity.typeSkill} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Myths/Legends/Stories" ids={entity.pairedMyths || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Inventory & Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Commonly used with Items" ids={entity.pairedItemsCommon || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Required Items" ids={entity.pairedItemsRequire || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Created Items" ids={entity.pairedItemsCreate || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Required Resources/Materials" ids={entity.pairedResourcesRequire || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Created Resources/Materials" ids={entity.pairedResourcesCreate || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Connections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Description & History" value={entity.description} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Commonly used by Occupations/Classes" ids={entity.pairedConnectedProfessions || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Causing following Boons" ids={entity.pairedConditionsPositive || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Causing following Afflictions" ids={entity.pairedConditionsNegative || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Causing following Other conditions" ids={entity.pairedConditionsOther || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            {entity.traditions && (
                <div className={`${t.card.panel} p-10 rounded-[2rem] mb-12`}>
                    <h3 className={`text-2xl font-serif font-bold ${t.colors.textHeading} mb-6 tracking-tight`}>Traditions & customs connected to the Skill/Spell/other</h3>
                    <p className={`${t.typography.body} whitespace-pre-wrap`}>{entity.traditions}</p>
                </div>
            )}
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Traditions & Customs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-2">
                        <LinksDisplay label="Connected to Cultures/Art" ids={entity.relatedCultures || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Governance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Ideologies/Political groups" ids={entity.pairedPoliticalGroupsSkills || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Teachings/Religious groups" ids={entity.pairedReligiousGroupsSkills || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Schools of Magic/Magical groups" ids={entity.pairedMagicGroupsSkills || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Sciences/Technological groups" ids={entity.pairedTechGroupsSkills || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
        </div>
    );
};
