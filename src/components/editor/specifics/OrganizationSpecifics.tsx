import React from 'react';
import { Organization, WorldEntity, EntityType } from '../../../types';
import { FormInput, SmartSelect, FormToggle } from '../../ui';
import { EditorGroup } from '../EditorGroup';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { Anchor, Gem, Globe, Info, Scroll, Tent, Zap } from 'lucide-react';

interface Props {
    entity: Organization;
    allEntities: WorldEntity[];
    onUpdate: (data: Partial<Organization>) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const OrganizationSpecifics: React.FC<Props> = ({ entity, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <>
            <EditorGroup title="Governance" icon={Anchor} isWikiMode={isWikiMode}>
                <FormInput label="Leading Figures (legacy)" value={entity.leaders || ""} onChange={(v: string) => onUpdate({ ...entity, leaders: v })} isWikiMode={isWikiMode} gridSpan={12} />
                <SmartSelect label="Succeeding Groups" ids={entity.succedingOtherGroup || []} type="organization" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, succedingOtherGroup: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Preceding Groups" ids={entity.preceedingOtherGroup || []} type="organization" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, preceedingOtherGroup: ids })} onCreate={onCreateNew} gridSpan={6} />
                
                <SmartSelect label="Headquarters" ids={entity.headquarters || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, headquarters: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Ruled Locations" ids={entity.governLocations || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, governLocations: ids })} onCreate={onCreateNew} gridSpan={6} />
                
                <div className="col-span-12 grid grid-cols-3 gap-4 p-4 rounded-xl border border-slate-500/10 bg-black/5">
                    <h4 className="col-span-full text-[8px] font-black uppercase text-slate-500 tracking-widest mb-2 opacity-50">Diplomatic Relations</h4>
                    <SmartSelect label="Connected Politics" ids={entity.pairedConnectedPolGroups || []} type="political" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedPolGroups: ids })} onCreate={onCreateNew} />
                    <SmartSelect label="Allied Politics" ids={entity.pairedAllyPolGroups || []} type="political" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyPolGroups: ids })} onCreate={onCreateNew} />
                    <SmartSelect label="Enemy Politics" ids={entity.pairedEnemyPolGroups || []} type="political" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyPolGroups: ids })} onCreate={onCreateNew} />
                    
                    <SmartSelect label="Connected Religions" ids={entity.pairedConnectedReligiousGroups || []} type="religious" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedReligiousGroups: ids })} onCreate={onCreateNew} />
                    <SmartSelect label="Allied Religions" ids={entity.pairedAllyReligiousGroups || []} type="religious" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyReligiousGroups: ids })} onCreate={onCreateNew} />
                    <SmartSelect label="Enemy Religions" ids={entity.pairedEnemyReligiousGroups || []} type="religious" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyReligiousGroups: ids })} onCreate={onCreateNew} />
                </div>
            </EditorGroup>

            <EditorGroup title="Chronology & Scale" icon={Info} isWikiMode={isWikiMode}>
                <FormInput label="Date of creation" value={entity.creationTime || ""} onChange={(v: string) => onUpdate({ ...entity, creationTime: v })} isWikiMode={isWikiMode} gridSpan={6} />
                <FormInput label="Date of end" value={entity.endTIme || ""} onChange={(v: string) => onUpdate({ ...entity, endTIme: v })} isWikiMode={isWikiMode} gridSpan={6} />
                <FormInput label="Member count" value={entity.population || ""} onChange={(v: string) => onUpdate({ ...entity, population: v })} isWikiMode={isWikiMode} gridSpan={6} />
                <FormInput label="Type of group" value={entity.groupType || ""} onChange={(v: string) => onUpdate({ ...entity, groupType: v })} isWikiMode={isWikiMode} gridSpan={6} />
                <SmartSelect label="Used Languages" ids={entity.localLanguages || []} type="language" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, localLanguages: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Myths & Legends" ids={entity.pairedConnectedMyths || []} type="myth" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedMyths: ids })} onCreate={onCreateNew} gridSpan={6} />
            </EditorGroup>
            <EditorGroup title="Connections" icon={Globe} isWikiMode={isWikiMode}>
                <FormInput label="Member Name" value={entity.followerName || ""} onChange={(v: string) => onUpdate({ ...entity, followerName: v })} isWikiMode={isWikiMode} gridSpan={6} />
                <SmartSelect label="Common Species" ids={entity.connectedRaces || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedRaces: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Locations" ids={entity.connectedLocations || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedLocations: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Events" ids={entity.connectedEvents || []} type="event" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, connectedEvents: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Notes" ids={entity.pairedConnectedNotes || []} type="note" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedNotes: ids })} onCreate={onCreateNew} gridSpan={4} />
                
                <div className="col-span-12 grid grid-cols-4 gap-4 p-4 rounded-xl border border-slate-500/10 bg-black/5">
                    <h4 className="col-span-full text-[8px] font-black uppercase text-slate-500 tracking-widest mb-2 opacity-50">Prominent Figures</h4>
                    <SmartSelect label="Connected" ids={entity.pairedConnectionCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectionCharacter: ids })} onCreate={onCreateNew} />
                    <SmartSelect label="Members" ids={entity.pairedBelongingCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedBelongingCharacter: ids })} onCreate={onCreateNew} />
                    <SmartSelect label="Allies" ids={entity.pairedAllyCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyCharacter: ids })} onCreate={onCreateNew} />
                    <SmartSelect label="Enemies" ids={entity.pairedEnemyCharacter || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyCharacter: ids })} onCreate={onCreateNew} />
                </div>

                <SmartSelect label="Linked Orgs" ids={entity.pairedConnectedOtherGroups || []} type="organization" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedOtherGroups: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Allied Orgs" ids={entity.pairedAllyOtherGroups || []} type="organization" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedAllyOtherGroups: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Enemy Orgs" ids={entity.pairedEnemyOtherGroups || []} type="organization" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedEnemyOtherGroups: ids })} onCreate={onCreateNew} gridSpan={4} />
                
                <SmartSelect label="Occupations" ids={entity.pairedConnectedProfessions || []} type="occupation" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedProfessions: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Conditions" ids={entity.pairedConditions || []} type="condition" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConditions: ids })} onCreate={onCreateNew} gridSpan={6} />
            </EditorGroup>

            <EditorGroup title="Details & Spoilers" icon={Scroll} isWikiMode={isWikiMode}>
                <FormInput label="Follower count" value={entity.followers || ""} onChange={(v: string) => onUpdate({ ...entity, followers: v })} isWikiMode={isWikiMode} gridSpan={4} />
                <SmartSelect label="Leading Figures" ids={entity.leadingCharacters || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, leadingCharacters: ids })} onCreate={onCreateNew} gridSpan={8} />
                <div className="col-span-6">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Description & History</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.description || ''} onChange={e => onUpdate({ ...entity, description: e.target.value })} />
                </div>
                <div className="col-span-6">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Secrets & Spoilers</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-[#fff5f5] border-rose-100 text-rose-900' : 'bg-slate-900/40 border-rose-900/20'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.spoilerNotes || ''} onChange={e => onUpdate({ ...entity, spoilerNotes: e.target.value })} />
                </div>
            </EditorGroup>

            <EditorGroup title="Possessions & Traditions" icon={Gem} isWikiMode={isWikiMode}>
                <SmartSelect label="Currencies" ids={entity.localCurrencies || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, localCurrencies: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Resources" ids={entity.pairedConnectedResources || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedResources: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Items" ids={entity.pairedConnectedItems || []} type="item" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedItems: ids })} onCreate={onCreateNew} gridSpan={4} />
                
                <div className="col-span-12 mt-4">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">Traditions & Customs</label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={entity.traditions || ''} onChange={e => onUpdate({ ...entity, traditions: e.target.value })} />
                </div>
                <SmartSelect label="Connected Cultures" ids={entity.pairedConnectedCultures || []} type="culture" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedConnectedCultures: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Connected Skills" ids={entity.pairedSkills || []} type="ability" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...entity, pairedSkills: ids })} onCreate={onCreateNew} gridSpan={6} />
            </EditorGroup>
        </>
    );
};
