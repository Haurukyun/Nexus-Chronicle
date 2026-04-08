import React, { useMemo } from 'react';
import { Network, UserPlus, GitBranch, GitMerge } from 'lucide-react';
import { WorldData, WorldEntity, Character } from '../types';

interface NexusTreeViewProps {
    world: WorldData;
    isWikiMode: boolean;
    onNavigate: (id: string) => void;
}

export const NexusTreeView: React.FC<NexusTreeViewProps> = ({ world, isWikiMode, onNavigate }) => {
    const lineageData = useMemo(() => {
        const characters = world.entities.filter(e => e.type === 'character') as Character[];
        
        // Find "Roots" (those without parents documented)
        const roots = characters.filter(c => !c.parentIds || c.parentIds.length === 0);
        
        return { roots, all: characters };
    }, [world.entities]);

    const accent = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const bgCard = isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-900/40 border-slate-800/60';

    return (
        <div className="p-12 h-full flex flex-col space-y-12 overflow-auto custom-scrollbar">
            <header className="space-y-4">
                <h1 className={`text-7xl font-serif font-black uppercase tracking-tighter ${isWikiMode ? 'text-[#b91c1c]' : 'text-white'}`}>The nexus lineages</h1>
                <p className="opacity-50 text-sm tracking-[0.3em] uppercase ml-2 italic">Tree of Blood and Organizations</p>
            </header>

            <div className="flex-1 flex flex-col items-center">
                {lineageData.roots.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-24 py-12">
                        {lineageData.roots.map(root => (
                            <TreeNode 
                                key={root.id} 
                                entity={root} 
                                all={lineageData.all} 
                                onNavigate={onNavigate} 
                                isWikiMode={isWikiMode}
                                accent={accent}
                                bg={bgCard}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 gap-6">
                        <Network size={120} />
                        <p className="text-xl font-serif uppercase tracking-widest">No relationships documented</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const TreeNode = ({ entity, all, onNavigate, isWikiMode, accent, bg, depth = 0 }: any) => {
    const childrenCount = entity.childrenIds?.length || 0;
    const hasChildren = childrenCount > 0;
    
    // Find child objects
    const children = useMemo(() => {
        return (entity.childrenIds || [])
            .map((id: string) => all.find((e: any) => e.id === id))
            .filter(Boolean);
    }, [entity.childrenIds, all]);

    return (
        <div className="flex flex-col items-center relative">
            {/* The Node Block */}
            <div 
                onClick={() => onNavigate(entity.id)}
                className={`w-56 p-6 rounded-[2rem] border-2 ${bg} shadow-2xl cursor-pointer hover:border-yellow-500 hover:scale-105 transition-all group z-10`}
            >
                <div className="flex flex-col items-center text-center space-y-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity flex items-center gap-1`}>
                        {depth === 0 ? <GitMerge size={10} /> : <GitBranch size={10} />} Depth {depth}
                    </span>
                    <h4 className="text-sm font-black uppercase tracking-tight truncate w-full">{entity.name}</h4>
                    {entity.type === 'character' && (
                        <div className={`px-3 py-0.5 rounded-full text-[8px] font-bold ${isWikiMode ? 'bg-[#b91c1c]/10 text-[#b91c1c]' : 'bg-[#fef08a]/10 text-[#fef08a]'}`}>
                            {entity.isDead ? 'Ancestral' : 'Living'}
                        </div>
                    )}
                </div>
            </div>

            {/* Connecting Lines */}
            {hasChildren && depth < 5 && (
                <div className="flex flex-col items-center mt-12 w-full">
                    <div className={`w-px h-12 ${isWikiMode ? 'bg-[#d4c8af]' : 'bg-slate-800'}`} />
                    <div className="flex gap-12 relative">
                        {/* Horizontal connector for multiple siblings */}
                        {children.length > 1 && (
                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-px ${isWikiMode ? 'bg-[#d4c8af]' : 'bg-slate-800'}`} 
                                style={{ width: `calc(100% - 4rem)` }} />
                        )}
                        {children.map((child: any) => (
                            <TreeNode 
                                key={child.id} 
                                entity={child} 
                                all={all} 
                                onNavigate={onNavigate} 
                                isWikiMode={isWikiMode}
                                accent={accent}
                                bg={bg}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
