import React, { useMemo, useState } from 'react';
import { Network, GitBranch, GitMerge, ChevronDown, ChevronRight, Share2, Layers } from 'lucide-react';
import { WorldData, WorldEntity, Character } from '../types';
import { NexusGraphView } from './NexusGraphView';

interface NexusTreeViewProps {
    world: WorldData;
    isWikiMode: boolean;
    onNavigate: (id: string) => void;
}

export const NexusTreeView: React.FC<NexusTreeViewProps> = ({ world, isWikiMode, onNavigate }) => {
    const [viewMode, setViewMode] = useState<'graph' | 'tree'>('graph');

    const lineageData = useMemo(() => {
        const characters = world.entities.filter(e => e.type === 'character') as Character[];
        const characterMap = new Map(characters.map(c => [c.id, c]));

        // Check if character c has at least one valid, existing parent
        const getExistingParentIds = (c: Character): string[] => {
            const ids = new Set<string>();
            if (c.parentId && c.parentId !== c.id && characterMap.has(c.parentId)) {
                ids.add(c.parentId);
            }
            (c.parentsOfCharacter || []).forEach(pid => {
                if (pid && pid !== c.id && characterMap.has(pid)) ids.add(pid);
            });
            (c.parentIds || []).forEach(pid => {
                if (pid && pid !== c.id && characterMap.has(pid)) ids.add(pid);
            });
            characters.forEach(other => {
                if (other.id !== c.id) {
                    if (other.childOfCharacter?.includes(c.id) || other.childrenIds?.includes(c.id)) {
                        ids.add(other.id);
                    }
                }
            });
            return Array.from(ids);
        };

        // Determine roots safely: no character is EVER dropped
        const roots: Character[] = [];
        const visitedInTree = new Set<string>();

        // Characters with 0 existing parents in current characters are roots
        characters.forEach(c => {
            const parents = getExistingParentIds(c);
            if (parents.length === 0) {
                roots.push(c);
                visitedInTree.add(c.id);
            }
        });

        // Safety against disconnected cycles: if a group of characters points to each other in a loop,
        // at least one of them MUST be placed in roots so they are never lost!
        characters.forEach(c => {
            if (!visitedInTree.has(c.id)) {
                const queue = [c.id];
                const seen = new Set<string>([c.id]);
                let reachesRoot = false;

                while (queue.length > 0) {
                    const id = queue.shift()!;
                    if (roots.some(r => r.id === id)) {
                        reachesRoot = true;
                        break;
                    }
                    const ch = characterMap.get(id);
                    if (ch) {
                        const pids = getExistingParentIds(ch);
                        for (const pid of pids) {
                            if (!seen.has(pid)) {
                                seen.add(pid);
                                queue.push(pid);
                            }
                        }
                    }
                }

                if (!reachesRoot) {
                    // Loop or orphan island detected! Add as root so they are NEVER hidden
                    roots.push(c);
                    visitedInTree.add(c.id);
                }
            }
        });

        return { roots, all: characters };
    }, [world.entities]);

    const accent = isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';
    const bgCard = isWikiMode ? 'bg-white border-[#d4c8af]' : 'bg-slate-900/40 border-slate-800/60';

    return (
        <div className="h-full flex flex-col overflow-hidden relative">
            {/* View Mode Switcher Header */}
            <div className={`p-4 border-b flex items-center justify-between z-20 ${
                isWikiMode 
                    ? 'bg-[#f7f3ea] border-[#d4c8af]' 
                    : 'bg-[#0f172a]/90 border-slate-800 backdrop-blur-md'
            }`}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/20 border border-white/5">
                        <button
                            onClick={() => setViewMode('graph')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                viewMode === 'graph'
                                    ? isWikiMode
                                        ? 'bg-[#b91c1c] text-white shadow-sm'
                                        : 'bg-[#fef08a] text-black shadow-md'
                                    : 'opacity-50 hover:opacity-100'
                            }`}
                        >
                            <Share2 size={13} />
                            Interactive Graph (All Entities)
                        </button>
                        <button
                            onClick={() => setViewMode('tree')}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                viewMode === 'tree'
                                    ? isWikiMode
                                        ? 'bg-[#b91c1c] text-white shadow-sm'
                                        : 'bg-[#fef08a] text-black shadow-md'
                                    : 'opacity-50 hover:opacity-100'
                            }`}
                        >
                            <Layers size={13} />
                            Bloodline Tree (Characters)
                        </button>
                    </div>
                </div>

                <div className="text-[10px] font-mono opacity-40 uppercase tracking-widest">
                    {viewMode === 'graph' ? 'Multi-Entity Force Graph' : `${lineageData.all.length} Characters Catalogued`}
                </div>
            </div>

            {/* View Body */}
            {viewMode === 'graph' ? (
                <div className="flex-1 w-full h-full relative overflow-hidden">
                    <NexusGraphView world={world} isWikiMode={isWikiMode} onNavigate={onNavigate} />
                </div>
            ) : (
                <div className="flex-1 p-12 overflow-auto custom-scrollbar space-y-12">
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
                                        visitedIds={new Set([root.id])}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 gap-6 my-24">
                                <Network size={120} />
                                <p className="text-xl font-serif uppercase tracking-widest">No relationships documented</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const TreeNode = ({ entity, all, onNavigate, isWikiMode, accent, bg, depth = 0, visitedIds = new Set<string>() }: any) => {
    // Find child objects bidirectionally, filtering out any visited ancestors to prevent infinite recursion
    const children = useMemo(() => {
        const directChildIds = new Set<string>([
            ...(entity.childOfCharacter || []),
            ...(entity.childrenIds || [])
        ]);

        all.forEach((other: any) => {
            if (other.id === entity.id) return;
            if (other.parentId === entity.id ||
                other.parentsOfCharacter?.includes(entity.id) ||
                other.parentIds?.includes(entity.id)) {
                directChildIds.add(other.id);
            }
        });

        return Array.from(directChildIds)
            .filter((id: string) => !visitedIds.has(id)) // Prevents infinite recursion
            .map((id: string) => all.find((e: any) => e.id === id))
            .filter(Boolean);
    }, [entity, all, visitedIds]);

    const hasChildren = children.length > 0;
    const isAncestral = Boolean(entity.deathDate?.trim() || entity.deadSwitch || entity.isDead);
    const [collapsed, setCollapsed] = useState(false);

    const nextVisited = new Set(visitedIds);
    nextVisited.add(entity.id);

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
                            {isAncestral ? 'Ancestral' : 'Living'}
                        </div>
                    )}
                </div>
            </div>

            {/* Expand / Collapse Toggle for Branches */}
            {hasChildren && depth < 5 && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setCollapsed(!collapsed);
                    }}
                    className={`mt-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 z-20 border transition-all ${
                        isWikiMode 
                            ? 'bg-white border-[#d4c8af] text-[#b91c1c] hover:bg-slate-100 shadow-sm' 
                            : 'bg-slate-900 border-slate-700 text-[#fef08a] hover:bg-slate-800 shadow-md'
                    }`}
                >
                    {collapsed ? (
                        <>
                            <ChevronRight size={12} /> Expand ({children.length})
                        </>
                    ) : (
                        <>
                            <ChevronDown size={12} /> Collapse
                        </>
                    )}
                </button>
            )}

            {/* Truncation Indicator if Depth Limit Reached */}
            {hasChildren && depth >= 5 && (
                <div className={`mt-4 px-3 py-1 rounded-full text-[9px] font-bold border border-dashed opacity-60 ${accent}`}>
                    +{children.length} descendant{children.length > 1 ? 's' : ''} (depth limit)
                </div>
            )}

            {/* Connecting Lines */}
            {hasChildren && !collapsed && depth < 5 && (
                <div className="flex flex-col items-center mt-6 w-full">
                    <div className={`w-px h-10 ${isWikiMode ? 'bg-[#d4c8af]' : 'bg-slate-800'}`} />
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
                                visitedIds={nextVisited}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
