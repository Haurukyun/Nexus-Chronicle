import React from 'react';
import { Location, WorldEntity, EntityType } from '../../../types';
import { EditorGroup } from '../EditorGroup';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { FormInput, SmartSelect } from '../../ui';
import { Info, MapPin, Calendar, Hourglass, Sparkles, Anchor, Users, Maximize, MessageSquare, Coins, Home, Pickaxe, Gem, Tent, UserCircle, User, Leaf, Globe } from 'lucide-react';

interface Props {
    entity: Location;
    allEntities: WorldEntity[];
    onUpdate: (data: Location) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
    isWikiMode: boolean;
}

export const LocationSpecifics: React.FC<Props> = ({ entity: loc, allEntities, onUpdate, onCreateNew, isWikiMode }) => {
    return (
        <>
            <EditorGroup title="Basic information" icon={Info} isWikiMode={isWikiMode}>
                <SmartSelect label="Succeeding Locations/Geography" icon={MapPin} ids={loc.succeedingLocationIds || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, succeedingLocationIds: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Preceding Locations/Geography" icon={MapPin} ids={loc.precedingLocationIds || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, precedingLocationIds: ids })} onCreate={onCreateNew} />
                <FormInput label="Date of creation" icon={Calendar} value={loc.dateOfCreation || ""} onChange={(v: string) => onUpdate({ ...loc, dateOfCreation: v })} isWikiMode={isWikiMode} />
                <FormInput label="Date of end" icon={Hourglass} value={loc.dateOfEnd || ""} onChange={(v: string) => onUpdate({ ...loc, dateOfEnd: v })} isWikiMode={isWikiMode} />
                
                <div className="lg:col-span-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 flex items-center gap-2">
                        <Sparkles size={12} className="opacity-60" /> Unusual features/Traits
                    </label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={loc.unusualFeatures || ""} onChange={e => onUpdate({ ...loc, unusualFeatures: e.target.value })} />
                </div>

                <FormInput label="Location type" icon={Anchor} value={loc.locationType || ""} options={['Settlement', 'Dungeon', 'Empire', 'Wilderness', 'Holy Ground', 'Ruins', 'Planar Overlay']} onChange={(v: string) => onUpdate({ ...loc, locationType: v })} isWikiMode={isWikiMode} />
                <FormInput label="Population" icon={Users} value={loc.population || ""} onChange={(v: string) => onUpdate({ ...loc, population: v })} isWikiMode={isWikiMode} />
                <FormInput label="Size" icon={Maximize} value={loc.size || ""} onChange={(v: string) => onUpdate({ ...loc, size: v })} isWikiMode={isWikiMode} />
                
                <SmartSelect label="Local Languages" icon={MessageSquare} ids={loc.localLanguageIds || []} type="language" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, localLanguageIds: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Local Currencies" icon={Coins} ids={loc.localCurrencyIds || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, localCurrencyIds: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Local Cultures/Art" icon={Home} ids={loc.localCultureIds || []} type="culture" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, localCultureIds: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Common Occupations/Classes" icon={Pickaxe} ids={loc.commonOccupationIds || []} type="occupation" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, commonOccupationIds: ids })} onCreate={onCreateNew} />
                <SmartSelect label="Local Resources/Materials" icon={Gem} ids={loc.localResourceIds || []} type="resource" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, localResourceIds: ids })} onCreate={onCreateNew} />
                
                <div className="lg:col-span-1.5 md:col-span-1">
                    <SmartSelect label="Neighbouring Locations" icon={MapPin} ids={loc.neighbouringLocationIds || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, neighbouringLocationIds: ids })} onCreate={onCreateNew} />
                </div>
                <div className="lg:col-span-1.5 md:col-span-1">
                    <SmartSelect label="Other connected Locations" icon={MapPin} ids={loc.otherConnectedLocationIds || []} type="location" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, otherConnectedLocationIds: ids })} onCreate={onCreateNew} />
                </div>
            </EditorGroup>

            <EditorGroup title="Traditions & Customs" icon={Tent} isWikiMode={isWikiMode}>
                <div className="lg:col-span-3 space-y-2">
                    <div className={`w-full p-4 rounded-xl border border-dashed text-[10px] font-bold uppercase opacity-40 text-center ${isWikiMode ? 'border-black/20' : 'border-white/20'}`}>
                        📜 Local Customs, Rituals & Cultural Nuances
                    </div>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-6 py-5 h-64 outline-none text-lg leading-relaxed shadow-sm`} 
                        placeholder="Describe the heartbeat of this place..."
                        value={loc.traditionsAndCustoms || ""} onChange={e => onUpdate({ ...loc, traditionsAndCustoms: e.target.value })} />
                </div>
            </EditorGroup>

            <EditorGroup title="Resident information" icon={UserCircle} isWikiMode={isWikiMode}>
                <div className="lg:col-span-1">
                    <SmartSelect label="Characters originated from the location" icon={User} ids={loc.originatedCharacterIds || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, originatedCharacterIds: ids })} onCreate={onCreateNew} />
                </div>
                <div className="lg:col-span-1">
                    <SmartSelect label="Characters currently living in the location" icon={User} ids={loc.livingCharacterIds || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, livingCharacterIds: ids })} onCreate={onCreateNew} />
                </div>
                <div className="lg:col-span-1">
                    <SmartSelect label="Characters deceased at the location" icon={User} ids={loc.deceasedCharacterIds || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, deceasedCharacterIds: ids })} onCreate={onCreateNew} />
                </div>
                <div className="lg:col-span-1.5 md:col-span-1">
                    <SmartSelect label="Other connected Characters" icon={User} ids={loc.connectedCharacterIds || []} type="character" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, connectedCharacterIds: ids })} onCreate={onCreateNew} />
                </div>
                <div className="lg:col-span-1.5 md:col-span-1">
                    <SmartSelect label="Local Species/Races/Flora/Fauna" icon={Leaf} ids={loc.localSpeciesIds || []} type="species" all={allEntities} isWikiMode={isWikiMode} onChange={(ids) => onUpdate({ ...loc, localSpeciesIds: ids })} onCreate={onCreateNew} />
                </div>
            </EditorGroup>

            <EditorGroup title="Governance Connections" icon={Anchor} isWikiMode={isWikiMode}>
                <div className="lg:col-span-3 border-b border-slate-500/10 pb-4 mb-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Governing Authorities</h3>
                    <p className="text-[9px] opacity-40 italic">Groups that wield primary power over this territory</p>
                </div>
                <GroupRoleGroup label="Governing Ideologies/Political groups" roleKey="political" isWikiMode={isWikiMode} entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, governingGroupConnections: {...loc.governingGroupConnections, political: d.groupConnections.political}})} onCreateNew={onCreateNew} isCustomGoverning />
                <GroupRoleGroup label="Governing Organizations/Other groups" roleKey="organization" isWikiMode={isWikiMode} entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, governingGroupConnections: {...loc.governingGroupConnections, organization: d.groupConnections.organization}})} onCreateNew={onCreateNew} isCustomGoverning />
                <GroupRoleGroup label="Governing Teachings/Religious groups" roleKey="religious" isWikiMode={isWikiMode} entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, governingGroupConnections: {...loc.governingGroupConnections, religious: d.groupConnections.religious}})} onCreateNew={onCreateNew} isCustomGoverning />
                <GroupRoleGroup label="Governing Schools of Magic/Magical groups" roleKey="magic" isWikiMode={isWikiMode} entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, governingGroupConnections: {...loc.governingGroupConnections, magic: d.groupConnections.magic}})} onCreateNew={onCreateNew} isCustomGoverning />
                <GroupRoleGroup label="Governing Sciences/Technological groups" roleKey="science" isWikiMode={isWikiMode} entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, governingGroupConnections: {...loc.governingGroupConnections, science: d.groupConnections.science}})} onCreateNew={onCreateNew} isCustomGoverning />
            </EditorGroup>

            <EditorGroup title="Influential Connections" icon={Globe} isWikiMode={isWikiMode}>
                <div className="lg:col-span-3 border-b border-slate-500/10 pb-4 mb-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Connected Entities</h3>
                    <p className="text-[9px] opacity-40 italic">Groups with significant influence but no formal authority</p>
                </div>
                <GroupRoleGroup label="Connected Ideologies/Political groups" roleKey="political" isWikiMode={isWikiMode} entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, connectedGroupConnections: {...loc.connectedGroupConnections, political: d.groupConnections.political}})} onCreateNew={onCreateNew} />
                <GroupRoleGroup label="Connected Organizations/Other groups" roleKey="organization" isWikiMode={isWikiMode} entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, connectedGroupConnections: {...loc.connectedGroupConnections, organization: d.groupConnections.organization}})} onCreateNew={onCreateNew} />
                <GroupRoleGroup label="Connected Teachings/Religious groups" roleKey="religious" isWikiMode={isWikiMode} entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, connectedGroupConnections: {...loc.connectedGroupConnections, religious: d.groupConnections.religious}})} onCreateNew={onCreateNew} />
                <GroupRoleGroup label="Connected Schools of Magic/Magical groups" roleKey="magic" isWikiMode={isWikiMode} entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, connectedGroupConnections: {...loc.connectedGroupConnections, magic: d.groupConnections.magic}})} onCreateNew={onCreateNew} />
                <GroupRoleGroup label="Connected Sciences/Technological groups" roleKey="science" isWikiMode={isWikiMode} entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, connectedGroupConnections: {...loc.connectedGroupConnections, science: d.groupConnections.science}})} onCreateNew={onCreateNew} />
            </EditorGroup>
        </>
    );
};
