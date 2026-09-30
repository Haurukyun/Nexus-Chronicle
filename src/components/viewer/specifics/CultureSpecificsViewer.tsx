import React from 'react';
import { Culture, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';
import { useTheme } from '../../../theme';

interface Props {
    entity: Culture;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
    backlinks?: any;
}

export const CultureSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, isWikiMode, backlinks }) => {
    const { t } = useTheme();
    return (
        <div className="space-y-8">
            {entity.traditions && (
                <div className={`${t.card.panel} p-10 rounded-[2rem] mb-12`}>
                    <h3 className={`text-2xl font-serif font-bold ${t.colors.textHeading} mb-6 tracking-tight`}>Connected Traditions & Customs to the Culture/Art</h3>
                    <p className={`${t.typography.body} whitespace-pre-wrap`}>{entity.traditions}</p>
                </div>
            )}
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Traditions & Customs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-2">
                        <LinksDisplay label="Succeeding Cultures/Art" ids={entity.succedingCultures || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                    <div className="col-span-full mt-2">
                        <LinksDisplay label="Preceding Cultures/Art" ids={entity.preceedingCultures || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Vital Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Date of creation" value={entity.creationTime} isWikiMode={isWikiMode} />
                    <FieldRow label="Date of end" value={entity.endTIme} isWikiMode={isWikiMode} />
                    <FieldRow label="Estimated population" value={entity.population} isWikiMode={isWikiMode} />
                    <FieldRow label="Type" value={entity.typeCulture} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Myths, legends and stories" ids={entity.pairedOtherMyths || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
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
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Connections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Description & History" value={entity.description} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected Characters" ids={entity.relatedCharacters || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Common among Species/Races/Flora/Fauna" ids={entity.relatedRaces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Common in Locations" ids={entity.relatedLocations || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Events" ids={entity.pairedEvents || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Common Occupations/Classes" ids={entity.relatedProfessions || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Stats & Knowledge</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Related Skills/Spells/Other" ids={entity.pairedSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Inventory & Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Important Items" ids={entity.pairedItems || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Important Resources/Materials" ids={entity.relatedResouces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Governance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Ideologies/Political groups" ids={entity.pairedConnectedPolGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Teachings/Religious groups" ids={entity.pairedConnectedReligiousGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Sciences/Technological groups" ids={entity.pairedConnectedTechGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
        </div>
    );
};
