import React from 'react';
import { Chapter, WorldEntity } from '../../../types';
import { FieldRow, LinksDisplay } from '../../ui';
import { useTheme } from '../../../theme';

interface Props {
    entity: Chapter;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isWikiMode: boolean;
    backlinks?: any;
}

export const ChapterSpecificsViewer: React.FC<Props> = ({ entity, allEntities, onNavigate, isWikiMode, backlinks }) => {
    const { t } = useTheme();
    return (
        <div className="space-y-8">
            <div className={`${t.card.base} p-8 rounded-2xl`}>
                <h3 className={`text-xs font-black uppercase mb-6 tracking-widest ${t.colors.textAccent}`}>Connections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <FieldRow label="Chapter content" value={entity.content} isWikiMode={isWikiMode} />
                    <div className="col-span-full mt-4 space-y-4 border-t border-slate-800/60 pt-4">
                        <LinksDisplay label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} all={allEntities} onNav={onNavigate} isWikiMode={isWikiMode} />
                    </div>
                </div>
            </div>
        </div>
    );
};
