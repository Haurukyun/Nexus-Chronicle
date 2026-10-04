import React from 'react';
import { Religion, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';
import { useTheme } from '../../../theme';

interface Props {
    entity: Religion;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    backlinks?: any;
}

export const ReligionSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, backlinks }) => {
    const { t } = useTheme();
    return (
        <div className="space-y-8">
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Governance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Leading Figures (legacy)" value={entity.leaders} />
                    <FieldRow label="Form of religion" value={entity.formReligion} />
                    <FieldRow label="Type of religion" value={entity.typeReligion} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Succeeding Teachings/Religious groups" ids={entity.succedingRelGroup || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Preceding Teachings/Religious groups" ids={entity.preceedingRelGroup || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Headquarters" ids={entity.headquarters || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Related Religions" ids={entity.relatedReligions || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Ruled/Influenced Locations" ids={entity.governLocations || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected Ideologies/Political groups" ids={entity.pairedConnectedPolGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Allied Ideologies/Political groups" ids={entity.pairedAllyPolGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Enemy Ideologies/Political groups" ids={entity.pairedEnemyPolGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Allied Organizations/Other groups" ids={entity.pairedAllyOtherGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Enemy Organizations/Other groups" ids={entity.pairedEnemyOtherGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected Teachings/Religious groups" ids={entity.pairedConnectedReligiousGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Allied Teachings/Religious groups" ids={entity.pairedAllyReligoiusGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Enemy Teachings/Religious groups" ids={entity.pairedEnemyReligiousGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Allied Schools of Magic/Magical groups" ids={entity.pairedAllyMagicGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Enemy Schools of Magic/Magical groups" ids={entity.pairedEnemyMagicGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected Sciences/Technological groups" ids={entity.pairedConnectedTechGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Allied Sciences/Technological groups" ids={entity.pairedAllyTechGroups || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Enemy Sciences/Technological groups" ids={entity.pairedEnemyTechGroups || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Vital Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Date of creation" value={entity.creationTime} />
                    <FieldRow label="Date of end" value={entity.endTIme} />
                    <FieldRow label="Member count" value={entity.population} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Used Languages" ids={entity.localLanguages || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Myths, legends and stories" ids={entity.pairedConnectedMyths || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Connections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Name for members/followers" value={entity.followerName} />
                    <FieldRow label="Follower/Subject count" value={entity.followers} />
                    <FieldRow label="Description & History" value={entity.description} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Leading Figures" ids={entity.leadingCharacters || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Common Species/Races/Flora/Fauna" ids={entity.connectedRaces || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected Locations" ids={entity.collectedLocations || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected Events" ids={entity.connectedEvents || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected Characters" ids={entity.pairedConnectionCharacter || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Prominent Members" ids={entity.pairedBelongingCharacter || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Occupations/Classes" ids={entity.pairedConnectedProfessions || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Afflictions/Boons/Conditions" ids={entity.pairedConditions || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Inventory & Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Important Resources/Materials" ids={entity.pairedConnectedResources || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Connected to Items" ids={entity.pairedConnectedItems || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            {entity.traditions && (
                <div className={`${t.card.panel} p-10 rounded-[2rem] mb-12`}>
                    <h3 className={`text-2xl font-serif font-bold ${t.colors.textHeading} mb-6 tracking-tight`}>Traditions & Customs</h3>
                    <p className={`${t.typography.body} whitespace-pre-wrap`}>{entity.traditions}</p>
                </div>
            )}
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Traditions & Customs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-2">
                        <LinksDisplay label="Connected to Cultures/Art" ids={entity.pairedConnectedCultures || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Interpersonal Web</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Prominent Allies" ids={entity.pairedAllyCharacter || []} all={allEntities} onNav={onNavigate} />
                        <LinksDisplay label="Prominent Enemies" ids={entity.pairedEnemyCharacter || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Stats & Knowledge</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Skills/Spells/Other" ids={entity.pairedSkills || []} all={allEntities} onNav={onNavigate} />
                    </div>
                </div>
            </div>
        </div>
    );
};
