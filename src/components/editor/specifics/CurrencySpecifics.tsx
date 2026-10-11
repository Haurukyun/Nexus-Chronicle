import React from 'react';
import { Currency, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { useTheme } from '../../../theme';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { Anchor, Gem, Globe, Scroll, Sparkles } from 'lucide-react';

interface Props {
    entity: Currency;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Currency>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
}

export const CurrencySpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew }) => {
    const { layoutMode, themeId } = useTheme();
    const isWiki = layoutMode === 'wiki';
    const isRoyal = themeId === 'royal-codex';

    const textareaClass = isRoyal
        ? 'w-full bg-[#fbf8ef] border border-[#c8a96e]/60 rounded-xl px-4 py-3 outline-none resize-none text-sm shadow-inner text-[#2b1810] font-serif focus:ring-1 focus:ring-[#70121e]'
        : isWiki
            ? 'w-full bg-white border border-[#d4c8af] rounded-xl px-4 py-3 outline-none resize-none text-sm shadow-sm'
            : 'w-full bg-slate-800/40 border border-slate-700 rounded-xl px-4 py-3 outline-none resize-none text-sm shadow-sm';

    const labelClass = `text-[10px] uppercase tracking-widest pl-1 mb-1 block ${
        isRoyal ? 'text-[#451a03] font-serif font-bold' : isWiki ? 'text-[#854d0e] font-black' : 'text-slate-500 font-black'
    }`;
    return (
        <>
            <EditorGroup title="Possessions" icon={Gem}>
                <SmartSelect label="Connected to Items" ids={entity.pairedItems || []} type="item" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedItems: ids })} onCreate={onCreateNew} />
                <FormInput label="Exchange rates to other Currencies" value={entity.priceCurrencies || ""} onChange={(v: string) => onUpdate({ ...entity, priceCurrencies: v })} />
                <FormInput label="Made from Resources/Materials" value={entity.madeFromResources || ""} onChange={(v: string) => onUpdate({ ...entity, madeFromResources: v })} />
            </EditorGroup>
            <EditorGroup title="Traits" icon={Sparkles}>
                <div className="lg:col-span-3">
                    <label className={labelClass}>Defining Features/Traits</label>
                    <textarea className={`${textareaClass} h-32`} value={entity.traits || ''} onChange={e => onUpdate({ ...entity, traits: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Connections" icon={Globe}>
                <SmartSelect label="Used in Locations" ids={entity.pairedLocations || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedLocations: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="note" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Details" icon={Scroll}>
                <SmartSelect label="Used by Races" ids={entity.usedByRaces || []} type="species" all={allEntities} onChange={(ids) => onUpdate({ ...entity, usedByRaces: ids })} onCreate={onCreateNew} />
                <div className="lg:col-span-3">
                    <label className={labelClass}>Description & History</label>
                    <textarea className={`${textareaClass} h-32`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                </div>
                <div className="lg:col-span-3">
                    <label className={labelClass}>Secrets/Spoilers/DM notes</label>
                    <textarea className={`${textareaClass} h-32`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Governance" icon={Anchor}>
                <SmartSelect label="Used by Ideologies/Political groups" ids={entity.usedInPoliticalGroups || []} type="political" all={allEntities} onChange={(ids) => onUpdate({ ...entity, usedInPoliticalGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Used by Organizations/Other groups" ids={entity.usedInOtherGroups || []} type="organization" all={allEntities} onChange={(ids) => onUpdate({ ...entity, usedInOtherGroups: ids })} onCreate={onCreateNew} />
            </EditorGroup>
        </>
    );
};
