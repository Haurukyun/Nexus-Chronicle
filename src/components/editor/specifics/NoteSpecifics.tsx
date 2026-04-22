import React from 'react';
import { Note, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { Anchor, Gem, Globe, Info, Scroll, Tent, Zap } from 'lucide-react';

interface Props {
    entity: Note;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Note>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const NoteSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <>
            <EditorGroup title="Details" icon={Scroll} isWikiMode={isWikiMode}>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Note list</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.notes || ''} onChange={e => onUpdate({ ...entity, notes: e.target.value })} />
                </div>
                <FormInput label="Free-form notes" value={entity.textNote || ""} onChange={(v: string) => onUpdate({ ...entity, textNote: v })} isWikiMode={isWikiMode} />
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Secrets/Spoilers/DM notes</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Connections" icon={Globe} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Chapters" ids={entity.pairedConnectedChapters || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedChapters: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNote || []} type="note" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNote: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Characters" ids={entity.pairedConnectedCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedCharacter: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Locations/Geography" ids={entity.pairedConnectedLocation || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedLocation: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Events" ids={entity.pairedConnectedEvents || []} type="event" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedEvents: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Species/Races/Flora/Fauna" ids={entity.pairedConnectedRaces || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedRaces: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Organizations/Other groups" ids={entity.pairedConnectedOtherGroups || []} type="organization" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedOtherGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Occupations/Classes" ids={entity.pairedConnectedProfessions || []} type="occupation" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedProfessions: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Afflictions/Boons/Conditions" ids={entity.pairedConnectedConditions || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedConditions: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Basic" icon={Info} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Myths/Legends/Stories" ids={entity.pairedConnectedMyths || []} type="myth" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMyths: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Languages" ids={entity.localLanguages || []} type="language" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, localLanguages: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Traditions" icon={Tent} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Culture/Art" ids={entity.pairedConnectedCultures || []} type="culture" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedCultures: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Governance" icon={Anchor} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Ideologies/Political groups" ids={entity.pairedConnectedPolGroups || []} type="political" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedPolGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Teachings/Religious groups" ids={entity.pairedConnectedRelGroups || []} type="religious" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedRelGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Schools of Magic/Magical groups" ids={entity.pairedConnectedMagicGroups || []} type="magic" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMagicGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Sciences/Technological groups" ids={entity.pairedConnectedTechGroups || []} type="tech" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedTechGroups: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Stats" icon={Zap} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Skills/Spells/Other" ids={entity.pairedConnectedSkills || []} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedSkills: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Possessions" icon={Gem} isWikiMode={isWikiMode}>
                <SmartSelect label="Connected to Items" ids={entity.pairedConnectedItems || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedItems: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Resources/Materials" ids={entity.pairedConnectedResources || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedResources: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Currencies" ids={entity.localCurrencies || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, localCurrencies: ids })} onCreate={onCreateNew} />
            </EditorGroup>
        </>
    );
};
