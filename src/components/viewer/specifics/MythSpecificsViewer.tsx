import React from 'react';
import { Myth, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';

interface Props {
    entity: Myth;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
    backlinks?: any;
}

export const MythSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, isWikiMode, backlinks }) => {
    return (
        <div className="space-y-8">
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Connections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Description & History" value={entity.description} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected Characters" ids={entity.pairedConnectedCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected Locations" ids={entity.pairedConnectedLocations || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Events" ids={entity.pairedEvents || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Species/Races/Flora/Fauna" ids={entity.pairedConnectedRaces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Occupations/Classes" ids={entity.pairedProfessions || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Afflictions/Boons/Conditions" ids={entity.pairedConditions || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Vital Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Connected Traditions & Customs to the myth, legend or story" value={entity.traditions} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to other Myths, legends and stories" ids={entity.pairedOtherMyths || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Traditions & Customs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-2">
                        <LinksDisplay label="Connected to Cultures/Art" ids={entity.pairedCultures || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Governance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Ideologies/Political groups" ids={entity.pairedConnectedPolGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Teachings/Religious groups" ids={entity.pairedConnectedRelGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Technologies/Sciences" ids={entity.pairedConnectedTechGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Stats & Knowledge</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Skills/Spells/Other" ids={entity.pairedSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Inventory & Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Items" ids={entity.pairedItems || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Resources/Materials" ids={entity.pairedResources || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
        </div>
    );
};
