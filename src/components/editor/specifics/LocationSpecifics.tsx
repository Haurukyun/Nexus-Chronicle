import React from 'react';
import { Location, WorldEntity, EntityType } from '../../../types';
import { EditorGroup } from '../EditorGroup';
import { GroupRoleGroup } from '../GroupRoleGroup';
import { FormInput, SmartSelect } from '../../ui';
import { Info, MapPin, Calendar, Hourglass, Sparkles, Anchor, Users, Maximize, MessageSquare, Coins, Home, Pickaxe, Gem, Tent, UserCircle, User, Leaf, Globe, Compass, Crosshair, Trash2, Navigation } from 'lucide-react';
import { useWorldStore } from '../../../store/useWorldStore';
import { useTheme } from '../../../theme';

interface Props {
    entity: Location;
    allEntities: WorldEntity[];
    onUpdate: (data: Location) => void;
    onCreateNew: (type: EntityType, search: string, open: boolean) => string | void;
}

export const LocationSpecifics: React.FC<Props> = ({ entity: loc, allEntities, onUpdate, onCreateNew }) => {
    const mapImage = useWorldStore(state => state.world.mapImage);
    const { layoutMode } = useTheme();
    const isWikiMode = layoutMode === 'wiki';

    return (
        <>
            {/* Atlas Anchor & Coordinate Picker (P2 #10) */}
            <EditorGroup title="Atlas Anchor & Map Coordinates" icon={Compass}>
                <div className="col-span-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-black/10 border border-white/5">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider">Atlas Pin Status:</span>
                            {loc.coordinates ? (
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                    isWikiMode ? 'bg-[#b91c1c]/10 text-[#b91c1c]' : 'bg-[#fef08a]/20 text-[#fef08a]'
                                }`}>
                                    <MapPin size={11} /> Anchored (X: {loc.coordinates.x}%, Y: {loc.coordinates.y}%)
                                </span>
                            ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/20 text-slate-400">
                                    Unanchored (Abstract / Uncharted)
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] opacity-50 mt-1">
                            Coordinates anchor this location to the Atlas and enable automated League / Journey calculations in The Grand Voyager.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {loc.coordinates ? (
                            <button
                                type="button"
                                onClick={() => onUpdate({ ...loc, coordinates: undefined })}
                                className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                                title="Remove map coordinates"
                            >
                                <Trash2 size={12} /> Clear Pin
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => onUpdate({ ...loc, coordinates: { x: 50, y: 50 } })}
                                className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                                    isWikiMode 
                                        ? 'border-[#b91c1c]/40 text-[#b91c1c] hover:bg-[#b91c1c]/10' 
                                        : 'border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10'
                                }`}
                            >
                                <Crosshair size={12} /> Pin at Center (50%, 50%)
                            </button>
                        )}
                    </div>
                </div>

                {/* Coordinate Number Inputs */}
                <div className="col-span-6">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">
                        Coordinate X (% across map, 0 - 100)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="e.g. 45.2"
                        value={loc.coordinates?.x ?? ""}
                        onChange={(e) => {
                            const val = e.target.value === "" ? null : parseFloat(e.target.value);
                            if (val === null) {
                                if (!loc.coordinates?.y) onUpdate({ ...loc, coordinates: undefined });
                                else onUpdate({ ...loc, coordinates: { x: 0, y: loc.coordinates.y } });
                            } else {
                                onUpdate({ ...loc, coordinates: { x: Math.max(0, Math.min(100, val)), y: loc.coordinates?.y ?? 50 } });
                            }
                        }}
                        className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-yellow-500`}
                    />
                </div>

                <div className="col-span-6">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 block">
                        Coordinate Y (% down map, 0 - 100)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="e.g. 62.8"
                        value={loc.coordinates?.y ?? ""}
                        onChange={(e) => {
                            const val = e.target.value === "" ? null : parseFloat(e.target.value);
                            if (val === null) {
                                if (!loc.coordinates?.x) onUpdate({ ...loc, coordinates: undefined });
                                else onUpdate({ ...loc, coordinates: { x: loc.coordinates.x, y: 0 } });
                            } else {
                                onUpdate({ ...loc, coordinates: { x: loc.coordinates?.x ?? 50, y: Math.max(0, Math.min(100, val)) } });
                            }
                        }}
                        className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-yellow-500`}
                    />
                </div>

                {/* Interactive Mini-Map Canvas */}
                <div className="col-span-12 space-y-2">
                    <div className="flex items-center justify-between pl-1">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                            <Navigation size={12} className="opacity-60" /> Interactive Atlas Pin Picker
                        </span>
                        <span className="text-[9px] opacity-40 italic">
                            Click anywhere on the map below to place or move the pin
                        </span>
                    </div>

                    <div
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
                            const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
                            onUpdate({ ...loc, coordinates: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } });
                        }}
                        className={`relative w-full aspect-[21/9] rounded-2xl overflow-hidden border-2 cursor-crosshair shadow-lg group select-none ${
                            isWikiMode ? 'border-[#d4c8af] bg-[#eadecc]' : 'border-slate-700 bg-slate-950'
                        }`}
                    >
                        {/* Map Image */}
                        <img
                            src={mapImage}
                            alt="World Map"
                            className="w-full h-full object-cover pointer-events-none filter contrast-105"
                        />

                        {/* Subtle Grid Overlay */}
                        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

                        {/* Pin marker */}
                        {loc.coordinates && (
                            <div
                                style={{
                                    left: `${loc.coordinates.x}%`,
                                    top: `${loc.coordinates.y}%`
                                }}
                                className="absolute -translate-x-1/2 -translate-y-full pointer-events-none flex flex-col items-center animate-in zoom-in duration-200"
                            >
                                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mb-0.5 shadow-md whitespace-nowrap ${
                                    isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-black/90 text-yellow-300 border border-yellow-500/40'
                                }`}>
                                    {loc.name || 'Location'}
                                </div>
                                <div className={`relative flex items-center justify-center p-1.5 rounded-full shadow-2xl ${
                                    isWikiMode ? 'bg-[#b91c1c] text-white' : 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.8)]'
                                }`}>
                                    <MapPin size={18} fill="currentColor" />
                                </div>
                                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-md -mt-0.5" />
                            </div>
                        )}

                        {/* Hover hint */}
                        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[9px] font-mono text-white/70 pointer-events-none">
                            {loc.coordinates ? `Pin: ${loc.coordinates.x}%, ${loc.coordinates.y}%` : 'Click map to place pin'}
                        </div>
                    </div>
                </div>
            </EditorGroup>

            <EditorGroup title="Basic information" icon={Info}>
                <SmartSelect label="Succeeding Locations" icon={MapPin} ids={loc.succeedingLocationIds || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...loc, succeedingLocationIds: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Preceding Locations" icon={MapPin} ids={loc.precedingLocationIds || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...loc, precedingLocationIds: ids })} onCreate={onCreateNew} gridSpan={6} />
                
                <FormInput label="Date of creation" icon={Calendar} value={loc.dateOfCreation || ""} onChange={(v: string) => onUpdate({ ...loc, dateOfCreation: v })} gridSpan={6} />
                <FormInput label="Date of end" icon={Hourglass} value={loc.dateOfEnd || ""} onChange={(v: string) => onUpdate({ ...loc, dateOfEnd: v })} gridSpan={6} />
                
                <div className="col-span-12">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1 mb-1 flex items-center gap-2">
                        <Sparkles size={12} className="opacity-60" /> Unusual features/Traits
                    </label>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-4 py-3 h-32 outline-none resize-none text-sm shadow-sm`} value={loc.unusualFeatures || ""} onChange={e => onUpdate({ ...loc, unusualFeatures: e.target.value })} />
                </div>

                <FormInput label="Location type" icon={Anchor} value={loc.locationType || ""} options={['Settlement', 'Dungeon', 'Empire', 'Wilderness', 'Holy Ground', 'Ruins', 'Planar Overlay']} onChange={(v: string) => onUpdate({ ...loc, locationType: v })} gridSpan={4} />
                <FormInput label="Population" icon={Users} value={loc.population || ""} onChange={(v: string) => onUpdate({ ...loc, population: v })} gridSpan={4} />
                <FormInput label="Size" icon={Maximize} value={loc.size || ""} onChange={(v: string) => onUpdate({ ...loc, size: v })} gridSpan={4} />
                
                <SmartSelect label="Local Languages" icon={MessageSquare} ids={loc.localLanguageIds || []} type="language" all={allEntities} onChange={(ids) => onUpdate({ ...loc, localLanguageIds: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Local Currencies" icon={Coins} ids={loc.localCurrencyIds || []} type="resource" all={allEntities} onChange={(ids) => onUpdate({ ...loc, localCurrencyIds: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Local Cultures" icon={Home} ids={loc.localCultureIds || []} type="culture" all={allEntities} onChange={(ids) => onUpdate({ ...loc, localCultureIds: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Common Occupations" icon={Pickaxe} ids={loc.commonOccupationIds || []} type="occupation" all={allEntities} onChange={(ids) => onUpdate({ ...loc, commonOccupationIds: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Local Resources" icon={Gem} ids={loc.localResourceIds || []} type="resource" all={allEntities} onChange={(ids) => onUpdate({ ...loc, localResourceIds: ids })} onCreate={onCreateNew} gridSpan={12} />
                
                <SmartSelect label="Neighbouring Locations" icon={MapPin} ids={loc.neighbouringLocationIds || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...loc, neighbouringLocationIds: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Other connected Locations" icon={MapPin} ids={loc.otherConnectedLocationIds || []} type="location" all={allEntities} onChange={(ids) => onUpdate({ ...loc, otherConnectedLocationIds: ids })} onCreate={onCreateNew} gridSpan={6} />
            </EditorGroup>

            <EditorGroup title="Traditions & Customs" icon={Tent}>
                <div className="lg:col-span-3 space-y-2">
                    <div className={`w-full p-4 rounded-xl border border-dashed text-[10px] font-bold uppercase opacity-40 text-center ${isWikiMode ? 'border-black/20' : 'border-white/20'}`}>
                        📜 Local Customs, Rituals & Cultural Nuances
                    </div>
                    <textarea className={`w-full ${isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700'} border rounded-xl px-6 py-5 h-64 outline-none text-lg leading-relaxed shadow-sm`} 
                        placeholder="Describe the heartbeat of this place..."
                        value={loc.traditionsAndCustoms || ""} onChange={e => onUpdate({ ...loc, traditionsAndCustoms: e.target.value })} />
                </div>
            </EditorGroup>

            <EditorGroup title="Resident information" icon={UserCircle}>
                <SmartSelect label="Originated from" icon={User} ids={loc.originatedCharacterIds || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...loc, originatedCharacterIds: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Currently living" icon={User} ids={loc.livingCharacterIds || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...loc, livingCharacterIds: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Deceased here" icon={User} ids={loc.deceasedCharacterIds || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...loc, deceasedCharacterIds: ids })} onCreate={onCreateNew} gridSpan={4} />
                <SmartSelect label="Other connections" icon={User} ids={loc.connectedCharacterIds || []} type="character" all={allEntities} onChange={(ids) => onUpdate({ ...loc, connectedCharacterIds: ids })} onCreate={onCreateNew} gridSpan={6} />
                <SmartSelect label="Local Species/Flora/Fauna" icon={Leaf} ids={loc.localSpeciesIds || []} type="species" all={allEntities} onChange={(ids) => onUpdate({ ...loc, localSpeciesIds: ids })} onCreate={onCreateNew} gridSpan={6} />
            </EditorGroup>

            <EditorGroup title="Governance Connections" icon={Anchor}>
                <div className="lg:col-span-3 border-b border-slate-500/10 pb-4 mb-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Governing Authorities</h3>
                    <p className="text-[9px] opacity-40 italic">Groups that wield primary power over this territory</p>
                </div>
                <GroupRoleGroup label="Governing Ideologies/Political groups" roleKey="political" entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, governingGroupConnections: {...loc.governingGroupConnections, political: d.groupConnections.political}})} onCreateNew={onCreateNew} isCustomGoverning />
                <GroupRoleGroup label="Governing Organizations/Other groups" roleKey="organization" entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, governingGroupConnections: {...loc.governingGroupConnections, organization: d.groupConnections.organization}})} onCreateNew={onCreateNew} isCustomGoverning />
                <GroupRoleGroup label="Governing Teachings/Religious groups" roleKey="religious" entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, governingGroupConnections: {...loc.governingGroupConnections, religious: d.groupConnections.religious}})} onCreateNew={onCreateNew} isCustomGoverning />
                <GroupRoleGroup label="Governing Schools of Magic/Magical groups" roleKey="magic" entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, governingGroupConnections: {...loc.governingGroupConnections, magic: d.groupConnections.magic}})} onCreateNew={onCreateNew} isCustomGoverning />
                <GroupRoleGroup label="Governing Sciences/Technological groups" roleKey="science" entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, governingGroupConnections: {...loc.governingGroupConnections, science: d.groupConnections.science}})} onCreateNew={onCreateNew} isCustomGoverning />
            </EditorGroup>

            <EditorGroup title="Influential Connections" icon={Globe}>
                <div className="lg:col-span-3 border-b border-slate-500/10 pb-4 mb-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Connected Entities</h3>
                    <p className="text-[9px] opacity-40 italic">Groups with significant influence but no formal authority</p>
                </div>
                <GroupRoleGroup label="Connected Ideologies/Political groups" roleKey="political" entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, connectedGroupConnections: {...loc.connectedGroupConnections, political: d.groupConnections.political}})} onCreateNew={onCreateNew} />
                <GroupRoleGroup label="Connected Organizations/Other groups" roleKey="organization" entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, connectedGroupConnections: {...loc.connectedGroupConnections, organization: d.groupConnections.organization}})} onCreateNew={onCreateNew} />
                <GroupRoleGroup label="Connected Teachings/Religious groups" roleKey="religious" entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, connectedGroupConnections: {...loc.connectedGroupConnections, religious: d.groupConnections.religious}})} onCreateNew={onCreateNew} />
                <GroupRoleGroup label="Connected Schools of Magic/Magical groups" roleKey="magic" entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, connectedGroupConnections: {...loc.connectedGroupConnections, magic: d.groupConnections.magic}})} onCreateNew={onCreateNew} />
                <GroupRoleGroup label="Connected Sciences/Technological groups" roleKey="science" entity={loc as any} allEntities={allEntities} onUpdate={(d: any) => onUpdate({...loc, connectedGroupConnections: {...loc.connectedGroupConnections, science: d.groupConnections.science}})} onCreateNew={onCreateNew} />
            </EditorGroup>
        </>
    );
};
