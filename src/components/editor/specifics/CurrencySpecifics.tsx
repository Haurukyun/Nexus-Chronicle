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
    return (
        <>
            <EditorGroup title="Possessions" icon={Gem}>
                <SmartSelect label="Connected to Items" ids={entity.pairedItems || []} type="item" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedItems: ids })} onCreate={onCreateNew} />
                <FormInput label="Exchange rates to other Currencies" value={entity.priceCurrencies || ""} onChange={(v: string) => onUpdate({ ...entity, priceCurrencies: v })} />
                <FormInput label="Made from Resources/Materials" value={entity.madeFromResources || ""} onChange={(v: string) => onUpdate({ ...entity, madeFromResources: v })} />
            </EditorGroup>
            <EditorGroup title="Traits" icon={Sparkles}>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Defining Features/Traits</label>
                    <textarea className={`w-full ${(layoutMode === 'wiki') ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traits || ''} onChange={e => onUpdate({ ...entity, traits: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Connections" icon={Globe}>
                <SmartSelect label="Used in Locations" ids={entity.pairedLocations || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedLocations: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Connected to Lore notes/Other notes" ids={entity.pairedConnectedNotes || []} type="note" all={allEntities} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} />
            </EditorGroup>
            <EditorGroup title="Details" icon={Scroll}>
                <SmartSelect label="Used by Races" ids={entity.usedByRaces || []} type="species" all={allEntities} onChange={(ids) => onUpdate({ ...entity, usedByRaces: ids })} onCreate={onCreateNew} />
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                    <textarea className={`w-full ${(layoutMode === 'wiki') ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                </div>
                <div className="lg:col-span-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Secrets/Spoilers/DM notes</label>
                    <textarea className={`w-full ${(layoutMode === 'wiki') ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
                </div>
            </EditorGroup>
            <EditorGroup title="Governance" icon={Anchor}>
                <SmartSelect label="Used by Ideologies/Political groups" ids={entity.usedInPoliticalGroups || []} type="political" all={allEntities} onChange={(ids) => onUpdate({ ...entity, usedInPoliticalGroups: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Used by Organizations/Other groups" ids={entity.usedInOtherGroups || []} type="organization" all={allEntities} onChange={(ids) => onUpdate({ ...entity, usedInOtherGroups: ids })} onCreate={onCreateNew} />
            </EditorGroup>
        </>
    );
};
