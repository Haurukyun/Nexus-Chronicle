import React from 'react';
import { Users, Globe, Maximize2, Eye } from 'lucide-react';
import { WikiInfoboxRow, LinksDisplay } from '../ui';
import { WorldEntity } from '../../types';
import { TYPE_LABELS } from '../../constants';
import { useWorldStore } from '../../store/useWorldStore';

interface WikiInfoboxProps {
    entity: WorldEntity;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    onFocusMap: () => void;
}

export const WikiInfobox = ({ entity, allEntities, onNavigate, onFocusMap }: WikiInfoboxProps) => {
    const isChar = entity.type === 'character';
    const theme = useWorldStore(state => state.theme);
    const isRoyal = theme === 'royal-codex';

    if (isRoyal) {
        return (
            <aside className="lg:w-80 shrink-0 space-y-6">
                <div className="bg-[#3f0d19] text-[#fef08a] border-4 border-[#c8a96e] rounded-3xl shadow-2xl overflow-hidden">
                    <div className="bg-[#2a060e] p-3 text-center border-b border-[#c8a96e]/40">
                        <h3 className="font-serif font-bold text-xl uppercase tracking-tight text-[#e6c687]">{entity.name}</h3>
                    </div>

                    <div className="h-56 bg-[#21040a] flex items-center justify-center border-b border-[#c8a96e]/30 overflow-hidden relative">
                        {isChar ? <Users size={120} className="text-[#c8a96e]/30" /> : <Globe size={120} className="text-[#c8a96e]/30" />}
                        <div className="absolute bottom-2 right-2 bg-black/40 p-1.5 rounded-lg border border-[#c8a96e]/40 backdrop-blur-sm">
                            <Maximize2 size={14} className="text-[#e6c687]" />
                        </div>
                    </div>

                    <div className="p-3 border-b border-[#c8a96e]/30 flex justify-center items-center gap-2 text-xs">
                        <Eye size={14} className="text-[#e6c687]" />
                        <button onClick={() => alert("Transmitted to party members!")} className="text-[10px] font-bold text-[#e6c687] uppercase tracking-widest hover:underline">Show to Players</button>
                    </div>

                    <div>
                        <h4 className="bg-[#2a060e] p-2 text-center text-[10px] font-black text-[#e6c687] uppercase tracking-widest border-b border-[#c8a96e]/30">Details</h4>
                        <table className="w-full text-[11px] text-left border-collapse">
                            <tbody>
                                <WikiInfoboxRow label="Type" value={TYPE_LABELS[entity.type] || entity.type} />
                                <WikiInfoboxRow label="Tags" value={entity.tags?.join(', ')} />
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-[#c8a96e]/30">
                        <h4 className="bg-[#2a060e] p-2 text-center text-[10px] font-black text-[#e6c687] uppercase tracking-widest border-b border-[#c8a96e]/30">Atlas Coordinates</h4>
                        <div className="p-3 space-y-2">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-[#e6c687] font-bold uppercase">Coordinates</span>
                                <span className="font-mono text-white/80">{entity.coordinates ? `${Math.round(entity.coordinates.x)}, ${Math.round(entity.coordinates.y)}` : 'Uncharted'}</span>
                            </div>
                            <div className="flex justify-center pt-1">
                                <button onClick={onFocusMap} className="text-[9px] font-black text-[#e6c687] uppercase tracking-[0.2em] hover:text-white transition-colors">Focus on Atlas View</button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        );
    }

    return (
        <aside className="lg:w-80 shrink-0 space-y-6">
            <div className="bg-[#fefce8] border-2 border-[#d4c8af] rounded shadow-md overflow-hidden">
                <div className="bg-[#fef9c3] p-2 text-center border-b-2 border-[#d4c8af]">
                    <h3 className="font-serif font-bold text-xl uppercase tracking-tighter text-[#1a1a1a]">{entity.name}</h3>
                </div>

                {/* Image Placeholder */}
                <div className="h-56 bg-[#ccc5a8] flex items-center justify-center border-b border-[#d4c8af] overflow-hidden grayscale contrast-75 relative">
                    {isChar ? <Users size={120} className="text-[#a89d7d]" /> : <Globe size={120} className="text-[#a89d7d]" />}
                    <div className="absolute bottom-2 right-2 bg-black/20 p-1 rounded backdrop-blur-sm">
                        <Maximize2 size={14} className="text-white/60" />
                    </div>
                </div>

                <div className="p-3 border-b border-[#d4c8af] flex justify-center items-center gap-2">
                    <Eye size={14} className="text-[#b91c1c]" />
                    <button onClick={() => alert("Transmitted to party members!")} className="text-[10px] font-black text-[#b91c1c] uppercase tracking-widest hover:underline">Show to Players</button>
                    <div className="w-1 h-1 rounded-full bg-[#d4c8af]" />
                    <button onClick={() => alert(`Record age: ${Math.floor((Date.now() - entity.lastModified) / 1000 / 60)} minutes.`)} className="text-[10px] font-black text-[#854d0e] uppercase tracking-widest hover:underline">Version History</button>
                </div>

                <div className="p-0">
                    <h4 className="bg-[#f5e6d3] p-2 text-center text-[11px] font-black text-[#854d0e] uppercase tracking-widest border-b border-[#d4c8af]">Geography</h4>
                    <table className="w-full text-[11px] text-left border-collapse">
                        <tbody>
                            <WikiInfoboxRow label="Type" value={TYPE_LABELS[entity.type] || entity.type} />
                            <WikiInfoboxRow label="Tags" value={entity.tags?.join(', ')} />
                        </tbody>
                    </table>
                </div>

                <div className="p-0 border-t border-[#d4c8af]">
                    <h4 className="bg-[#f5e6d3] p-2 text-center text-[11px] font-black text-[#854d0e] uppercase tracking-widest border-b border-[#d4c8af]">Travel Information</h4>
                    <div className="p-3 space-y-2">
                        <div className="flex justify-between text-[10px]">
                            <span className="text-[#854d0e] font-bold uppercase">Coordinates</span>
                            <span className="font-mono text-slate-500">{entity.coordinates ? `${Math.round(entity.coordinates.x)}, ${Math.round(entity.coordinates.y)}` : 'Uncharted'}</span>
                        </div>
                        <div className="h-[1px] w-full bg-[#d4c8af]/40" />
                        <div className="flex justify-center">
                            <button onClick={onFocusMap} className="text-[9px] font-black text-[#b91c1c] uppercase tracking-[0.2em] hover:opacity-70">Focus on Atlas View</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white/50 border border-[#d4c8af] rounded space-y-4">
                <h4 className="text-[10px] font-black text-[#854d0e] uppercase border-b border-[#d4c8af] pb-1">Relations</h4>
                <div className="space-y-4">
                    <LinksDisplay label="Locations" ids={(entity as any).locationIds} all={allEntities} onNav={onNavigate} isWikiMode={true} />
                    <LinksDisplay label="Members" ids={(entity as any).memberOf} all={allEntities} onNav={onNavigate} isWikiMode={true} />
                </div>
            </div>
        </aside>
    );
};

