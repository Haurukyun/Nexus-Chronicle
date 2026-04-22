import React from 'react';
import { Note, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';

interface Props {
    entity: Note;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
    backlinks?: any;
}

export const NoteSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, isWikiMode, backlinks }) => {
    return (
        <div className="space-y-8">
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Connections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Note list" value={entity.notes} isWikiMode={isWikiMode} />
                    <FieldRow label="Free-form notes" value={entity.textNote} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Chapters" ids={entity.pairedConnectedChapters || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNote || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Characters" ids={entity.pairedConnectedCharacter || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Locations/Geography" ids={entity.pairedConnectedLocation || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Events" ids={entity.pairedConnectedEvents || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Species/Races/Flora/Fauna" ids={entity.pairedConnectedRaces || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Occupations/Classes" ids={entity.pairedConnectedProfessions || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Afflictions/Boons/Conditions" ids={entity.pairedConnectedConditions || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Vital Records</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Myths/Legends/Stories" ids={entity.pairedConnectedMyths || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Languages" ids={entity.localLanguages || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Traditions & Customs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-2">
                        <LinksDisplay label="Connected to Culture/Art" ids={entity.pairedConnectedCultures || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
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
                        <LinksDisplay label="Connected to Sciences/Technological groups" ids={entity.pairedConnectedTechGroups || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Stats & Knowledge</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Skills/Spells/Other" ids={entity.pairedConnectedSkills || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl">
                <h3 className="text-xs font-black uppercase mb-6 tracking-widest text-[#fef08a]">Inventory & Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Items" ids={entity.pairedConnectedItems || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Resources/Materials" ids={entity.pairedConnectedResources || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                        <LinksDisplay label="Connected to Currencies" ids={entity.localCurrencies || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
        </div>
    );
};
