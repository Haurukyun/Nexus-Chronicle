import React from 'react';
import { Myth, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { Anchor, Gem, Globe, Info, Scroll, Tent, Zap } from 'lucide-react';

interface Props {
    entity: Myth;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Myth>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const MythSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <>
            <EditorGroup title="Details" icon={Scroll} isWikiMode={isWikiMode}>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                </div>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Secrets/Spoilers/DM notes</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Basic" icon={Info} isWikiMode={isWikiMode}>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Connected Traditions & Customs to the myth, legend or story</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traditions || ''} onChange={e => onUpdate({ ...entity, traditions: e.target.value })} />
                </div>
                <SmartSelect label="Connected to other Myths, legends and stories" ids={entity.pairedOtherMyths || []} type="myth" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedOtherMyths: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Connections" icon={Globe} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="note" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected Characters" ids={entity.pairedConnectedCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected Locations" ids={entity.pairedConnectedLocations || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedLocations: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Events" ids={entity.pairedEvents || []} type="event" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEvents: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Species/Races/Flora/Fauna" ids={entity.pairedConnectedRaces || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedRaces: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} type="organization" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedOtherGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Occupations/Classes" ids={entity.pairedProfessions || []} type="occupation" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedProfessions: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Afflictions/Boons/Conditions" ids={entity.pairedConditions || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditions: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Traditions" icon={Tent} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Cultures/Art" ids={entity.pairedCultures || []} type="culture" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedCultures: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Governance" icon={Anchor} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Ideologies/Political groups" ids={entity.pairedConnectedPolGroups || []} type="political" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedPolGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Teachings/Religious groups" ids={entity.pairedConnectedRelGroups || []} type="religious" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedRelGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicGroups || []} type="magic" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMagicGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Technologies/Sciences" ids={entity.pairedConnectedTechGroups || []} type="tech" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedTechGroups: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Stats" icon={Zap} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Skills/Spells/Other" ids={entity.pairedSkills || []} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkills: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Possessions" icon={Gem} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Items" ids={entity.pairedItems || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedItems: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Resources/Materials" ids={entity.pairedResources || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedResources: ids })} onCreate={onCreateNew} />
            </EditorGroup>
        </>
    );
};
