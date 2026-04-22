import React from 'react';
import { Chapter, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { FileText } from 'lucide-react';

interface Props {
    entity: Chapter;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Chapter>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const ChapterSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <EditorGroup title="Chapter Specifics" icon={FileText} isWikiMode={isWikiMode}>
            <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Chapter content</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.content || ''} onChange={e => onUpdate({ ...entity, content: e.target.value })} />
            </div>
            <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Secrets/Spoilers/DM notes</label>
                <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
            </div>
        </EditorGroup>
    );
};
