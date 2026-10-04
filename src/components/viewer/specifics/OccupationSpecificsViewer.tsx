import React from 'react';
import { Occupation, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';
import { useTheme } from '../../../theme';

interface Props {
    entity: Occupation;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    backlinks?: any;
}

export const OccupationSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, backlinks }) => {
    const { t } = useTheme();
    return (
        <div className="space-y-8">
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Connections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Titles & Ranks" value={entity.titles} />
                    <FieldRow label="Description & History" value={entity.description} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Related Occupations/Classes" ids={entity.relatedProfessions || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Characters of the Occupation/Class" ids={entity.pairedCharacter || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Common Species/Races/Flora/Fauna" ids={entity.commonRaces || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Locations/Geography" ids={entity.connectedLocations || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            {entity.features && (
                <div className={`${t.card.panel} p-10 rounded-[2rem] mb-12`}>
                    <h3 className={`text-2xl font-serif font-bold ${t.colors.textHeading} mb-6 tracking-tight`}>Prominent features</h3>
                    <p className={`${t.typography.body} whitespace-pre-wrap`}>{entity.features}</p>
                </div>
            )}
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Vital Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Occupation/Class type" value={entity.professionType} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Myths/Legends/Stories" ids={entity.pairedMyths || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Languages" ids={entity.localLanguages || []} all={allEntities} onNav={onNavigate} />
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
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Traditions & Customs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-2">
                        <LinksDisplay label="Connected to Cultures/Art" ids={entity.relatedCultures || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Stats & Knowledge</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Commonly used Skills/Spells/Other" value={entity.pairedUsedSkills} />
                    <FieldRow label="Stats/Attributes" value={entity.statsList} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Skills/Spells/Other" ids={entity.pairedConnectedSkills || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Inventory & Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Commonly used Items" value={entity.pairedUsedItems} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Used Resources/Materials" ids={entity.usedResources || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Produced Resources/Materials" ids={entity.producedResources || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Items" ids={entity.pairedConnectedItems || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Governance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Ideologies/Political groups" ids={entity.pairedConnectedPolGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Teachings/Religious groups" ids={entity.pairedConnectedReligiousGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Sciences/Technological groups" ids={entity.pairedConnectedTechGroups || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
        </div>
    );
};
