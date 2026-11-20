import React, { useState, useMemo } from 'react';
import {
    Plus, X, ChevronDown, ChevronRight, Eye, EyeOff,
    CheckCircle2, Circle, AlertTriangle, Moon, Trash2,
    Link2, Search, FileText, ExternalLink, Lightbulb
} from 'lucide-react';
import { WorldData, PlotThread, PlotThreadStatus, PlotClue, WorldEntity } from '../types';
import { useWorldStore } from '../store/useWorldStore';
import { useTheme } from '../theme';
import { MarkdownEditor } from '../components/ui/MarkdownEditor';

interface Props {
    world: WorldData;
    onNavigate: (id: string) => void;
}

const STATUS_CONFIG: Record<PlotThreadStatus, { label: string; icon: any; color: string }> = {
    open:         { label: 'Open',        icon: Circle,         color: '#3b82f6' },
    resolved:     { label: 'Resolved',    icon: CheckCircle2,   color: '#22c55e' },
    'red-herring':{ label: 'Red Herring', icon: AlertTriangle,  color: '#ef4444' },
    dormant:      { label: 'Dormant',     icon: Moon,           color: '#94a3b8' },
};

const FACTION_TYPES = ['political', 'religious', 'organization', 'magic', 'science'];

function EntityChip({ id, all, onNavigate }: { id: string; all: WorldEntity[]; onNavigate: (id: string) => void }) {
    const entity = all.find(e => e.id === id);
    if (!entity) return null;
    return (
        <button
            type="button"
            onClick={() => onNavigate(id)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium border border-current/20 hover:scale-105 transition-all"
        >
            {entity.name}
            <ExternalLink size={9} className="opacity-50" />
        </button>
    );
}

interface ThreadCardProps {
    thread: PlotThread;
    allEntities: WorldEntity[];
    onNavigate: (id: string) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
    isRoyal: boolean;
    isWiki: boolean;
    accent: string;
    cardBg: string;
    inputCls: string;
}

const ThreadCard: React.FC<ThreadCardProps> = ({
    thread, allEntities, onNavigate, isExpanded, onToggleExpand,
    isRoyal, isWiki, accent, cardBg, inputCls
}) => {
    const { addClueToThread, removeClueFromThread, updatePlotThread, deletePlotThread } = useWorldStore();
    const [newClueText, setNewClueText] = useState('');
    const [editingDesc, setEditingDesc] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const cfg = STATUS_CONFIG[thread.status];
    const StatusIcon = cfg.icon;

    const handleStatusCycle = () => {
        const statuses: PlotThreadStatus[] = ['open', 'dormant', 'resolved', 'red-herring'];
        const next = statuses[(statuses.indexOf(thread.status) + 1) % statuses.length];
        updatePlotThread(thread.id, { status: next });
    };

    const handleAddClue = () => {
        const text = newClueText.trim();
        if (!text) return;
        addClueToThread(thread.id, { text, linkedEntityIds: [], isRevealed: false });
        setNewClueText('');
    };

    const handleToggleClueRevealed = (clue: PlotClue) => {
        const updated = thread.clues.map(c => c.id === clue.id ? { ...c, isRevealed: !c.isRevealed } : c);
        updatePlotThread(thread.id, { clues: updated });
    };

    const borderColor = isRoyal ? '#c8a96e' : isWiki ? '#d4c8af' : '#334155';

    return (
        <div
            className={`rounded-2xl border shadow-md transition-all ${cardBg}`}
            style={{ borderColor, borderLeftColor: thread.color || cfg.color, borderLeftWidth: 4 }}
        >
            {/* Card Header */}
            <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                onClick={onToggleExpand}
            >
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleStatusCycle(); }}
                    className="shrink-0 hover:scale-110 transition-transform"
                    title={`Status: ${cfg.label} — click to cycle`}
                    style={{ color: cfg.color }}
                >
                    <StatusIcon size={18} />
                </button>

                <div className="flex-1 min-w-0">
                    <input
                        type="text"
                        value={thread.title}
                        onChange={e => updatePlotThread(thread.id, { title: e.target.value })}
                        onClick={e => e.stopPropagation()}
                        className={`w-full font-bold text-sm bg-transparent border-none outline-none ${
                            isRoyal ? 'text-[#2b1810] font-serif' : isWiki ? 'text-[#2d2d2d]' : 'text-white'
                        }`}
                        placeholder="Thread title..."
                    />
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: cfg.color }}>
                            {cfg.label}
                        </span>
                        <span className="text-[10px] opacity-40">·</span>
                        <span className="text-[10px] opacity-50">{thread.clues.length} clue{thread.clues.length !== 1 ? 's' : ''}</span>
                        <span className="text-[10px] opacity-40">·</span>
                        <span className="text-[10px] opacity-50">{thread.linkedEntityIds.length} linked</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {confirmDelete ? (
                        <>
                            <button type="button" onClick={(e) => { e.stopPropagation(); deletePlotThread(thread.id); }} className="text-red-500 text-[11px] font-bold px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors">Confirm</button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }} className="opacity-50 text-[11px] px-2 py-1 rounded-lg hover:bg-black/10 transition-colors">Cancel</button>
                        </>
                    ) : (
                        <button type="button" onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }} className="p-1.5 rounded-lg opacity-30 hover:opacity-80 hover:text-red-500 transition-all">
                            <Trash2 size={13} />
                        </button>
                    )}
                    {isExpanded ? <ChevronDown size={16} className="opacity-40" /> : <ChevronRight size={16} className="opacity-40" />}
                </div>
            </div>

            {/* Expanded Body */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-current/10 pt-3">
                    {/* Description */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[10px] uppercase tracking-widest font-bold opacity-60 ${isRoyal ? 'font-serif' : ''}`}>Description</span>
                            <button type="button" onClick={() => setEditingDesc(!editingDesc)} className="text-[10px] opacity-50 hover:opacity-100 transition-opacity">
                                {editingDesc ? 'Done' : 'Edit'}
                            </button>
                        </div>
                        {editingDesc ? (
                            <MarkdownEditor
                                value={thread.description}
                                onChange={v => updatePlotThread(thread.id, { description: v })}
                                allEntities={allEntities}
                                onNavigate={onNavigate}
                                minHeight="h-24"
                            />
                        ) : (
                            <p className={`text-sm opacity-70 italic leading-relaxed ${thread.description ? '' : 'opacity-30'}`}>
                                {thread.description || 'No description yet. Click Edit to add.'}
                            </p>
                        )}
                    </div>

                    {/* Linked Entities */}
                    <div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold opacity-60 block mb-1.5 ${isRoyal ? 'font-serif' : ''}`}>
                            Linked to Codex
                        </span>
                        <div className={`flex flex-wrap gap-1.5 ${isRoyal ? 'text-[#70121e]' : isWiki ? 'text-[#b91c1c]' : 'text-blue-400'}`}>
                            {thread.linkedEntityIds.map(id => (
                                <EntityChip key={id} id={id} all={allEntities} onNavigate={onNavigate} />
                            ))}
                            <div className="relative group">
                                <select
                                    className={`text-[11px] px-2 py-0.5 rounded-lg border opacity-50 hover:opacity-100 cursor-pointer transition-opacity bg-transparent ${inputCls}`}
                                    value=""
                                    onChange={e => {
                                        const id = e.target.value;
                                        if (id && !thread.linkedEntityIds.includes(id)) {
                                            updatePlotThread(thread.id, { linkedEntityIds: [...thread.linkedEntityIds, id] });
                                        }
                                    }}
                                >
                                    <option value="">+ Link entity...</option>
                                    {allEntities
                                        .filter(e => !thread.linkedEntityIds.includes(e.id))
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map(e => <option key={e.id} value={e.id}>{e.name} ({e.type})</option>)}
                                </select>
                            </div>
                            {thread.linkedEntityIds.map(id => {
                                const e = allEntities.find(en => en.id === id);
                                if (!e) return null;
                                return (
                                    <button key={`unlink-${id}`} type="button"
                                        onClick={() => updatePlotThread(thread.id, { linkedEntityIds: thread.linkedEntityIds.filter(x => x !== id) })}
                                        className="hidden"
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Clues */}
                    <div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold opacity-60 block mb-1.5 ${isRoyal ? 'font-serif' : ''}`}>
                            Clues & Evidence ({thread.clues.length})
                        </span>
                        <div className="space-y-1.5">
                            {thread.clues.map(clue => (
                                <div
                                    key={clue.id}
                                    className={`flex items-start gap-2 p-2.5 rounded-xl border transition-all ${
                                        clue.isRevealed
                                            ? isRoyal ? 'bg-[#f0eada] border-[#c8a96e]/40' : 'bg-green-500/5 border-green-500/20'
                                            : isRoyal ? 'bg-[#fbf8ef] border-[#c8a96e]/20' : 'bg-black/10 border-white/5'
                                    }`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleToggleClueRevealed(clue)}
                                        className="shrink-0 mt-0.5"
                                        title={clue.isRevealed ? 'Mark hidden' : 'Mark revealed'}
                                        style={{ color: clue.isRevealed ? '#22c55e' : '#94a3b8' }}
                                    >
                                        {clue.isRevealed ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                    <span className={`text-sm flex-1 ${clue.isRevealed ? 'opacity-100' : 'opacity-60'}`}>
                                        {clue.text}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeClueFromThread(thread.id, clue.id)}
                                        className="shrink-0 opacity-20 hover:opacity-70 hover:text-red-500 transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add clue */}
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="text"
                                value={newClueText}
                                onChange={e => setNewClueText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddClue()}
                                placeholder="Add a clue or piece of evidence..."
                                className={`flex-1 text-sm px-3 py-1.5 rounded-xl border outline-none ${inputCls}`}
                            />
                            <button
                                type="button"
                                onClick={handleAddClue}
                                disabled={!newClueText.trim()}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-30 transition-all active:scale-95 ${
                                    isRoyal ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#881337]'
                                    : isWiki ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b]'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Accent Color Picker */}
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-widest opacity-50 ${isRoyal ? 'font-serif' : ''}`}>Card color</span>
                        <input
                            type="color"
                            value={thread.color || cfg.color}
                            onChange={e => updatePlotThread(thread.id, { color: e.target.value })}
                            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <button type="button" onClick={() => updatePlotThread(thread.id, { color: undefined })} className="text-[10px] opacity-40 hover:opacity-80">Reset</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const PlotThreadsView: React.FC<Props> = ({ world, onNavigate }) => {
    const { themeId, layoutMode } = useTheme();
    const isRoyal = themeId === 'royal-codex';
    const isWiki = layoutMode === 'wiki';

    const { addPlotThread } = useWorldStore();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [filterStatus, setFilterStatus] = useState<PlotThreadStatus | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const accent = isRoyal ? '#70121e' : isWiki ? '#b91c1c' : '#3b82f6';
    const cardBg = isRoyal ? 'bg-[#f7f0e1]' : isWiki ? 'bg-white' : 'bg-slate-800/60';
    const inputCls = isRoyal
        ? 'border-[#c8a96e]/50 bg-[#fbf8ef] text-[#2b1810] placeholder-[#2b1810]/30 focus:border-[#70121e]'
        : isWiki
            ? 'border-[#d4c8af] bg-white text-[#2d2d2d] placeholder-[#2d2d2d]/30 focus:border-[#b91c1c]'
            : 'border-slate-600 bg-slate-900/80 text-white placeholder-white/30 focus:border-blue-500';

    const threads = world.plotThreads || [];

    const filtered = useMemo(() => threads
        .filter(t => filterStatus === 'all' || t.status === filterStatus)
        .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            const order: Record<PlotThreadStatus, number> = { open: 0, dormant: 1, 'red-herring': 2, resolved: 3 };
            return order[a.status] - order[b.status] || b.lastModified - a.lastModified;
        }),
        [threads, filterStatus, searchQuery]
    );

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleNewThread = () => {
        const id = addPlotThread({
            title: 'New Plot Thread',
            status: 'open',
            description: '',
            linkedEntityIds: [],
            clues: [],
        });
        setExpandedIds(prev => new Set([...prev, id]));
    };

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: threads.length };
        threads.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
        return counts;
    }, [threads]);

    const headerText = isRoyal ? 'text-[#2b1810] font-serif' : isWiki ? 'text-[#2d2d2d]' : 'text-white';
    const subText = isRoyal ? 'text-[#5c2a12]' : isWiki ? 'text-[#854d0e]' : 'text-slate-400';

    return (
        <div className="max-w-4xl mx-auto w-full space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className={`text-3xl font-serif font-black uppercase tracking-tight ${headerText}`}>
                        The Conspiracy Board
                    </h1>
                    <p className={`text-xs mt-1 opacity-70 ${subText}`}>
                        Plot threads, clues, mysteries & narrative hooks — link to any entry in the Codex
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleNewThread}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shrink-0 shadow-lg transition-all active:scale-95 hover:scale-105 ${
                        isRoyal ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e]'
                        : isWiki ? 'bg-[#b91c1c] text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                >
                    <Plus size={15} />
                    New Thread
                </button>
            </div>

            {/* Filter Bar */}
            <div className={`flex flex-wrap items-center gap-2 p-3 rounded-2xl border ${
                isRoyal ? 'bg-[#f7f0e1] border-[#c8a96e]/40' : isWiki ? 'bg-white border-[#d4c8af]' : 'bg-slate-800/40 border-slate-700/40'
            }`}>
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <Search size={14} className="opacity-40 shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search threads..."
                        className="bg-transparent text-sm outline-none flex-1 min-w-0"
                    />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                    {(['all', 'open', 'dormant', 'resolved', 'red-herring'] as const).map(s => {
                        const label = s === 'all' ? 'All' : STATUS_CONFIG[s].label;
                        const count = statusCounts[s] || 0;
                        const isActive = filterStatus === s;
                        return (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setFilterStatus(s)}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                                    isActive
                                        ? isRoyal ? 'bg-[#70121e] text-[#fff8e7]' : isWiki ? 'bg-[#b91c1c] text-white' : 'bg-blue-600 text-white'
                                        : 'opacity-50 hover:opacity-100'
                                }`}
                            >
                                {label} {count > 0 && <span className="opacity-70">({count})</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Thread List */}
            {filtered.length === 0 ? (
                <div className={`text-center py-20 rounded-3xl border border-dashed ${
                    isRoyal ? 'border-[#c8a96e]/30 text-[#5c2a12]' : isWiki ? 'border-[#d4c8af] text-[#854d0e]' : 'border-slate-700 text-slate-500'
                }`}>
                    <Lightbulb size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-bold uppercase tracking-wider opacity-50">No threads yet</p>
                    <p className="text-xs opacity-30 mt-1">Create your first plot thread above</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(thread => (
                        <ThreadCard
                            key={thread.id}
                            thread={thread}
                            allEntities={world.entities}
                            onNavigate={onNavigate}
                            isExpanded={expandedIds.has(thread.id)}
                            onToggleExpand={() => toggleExpand(thread.id)}
                            isRoyal={isRoyal}
                            isWiki={isWiki}
                            accent={accent}
                            cardBg={cardBg}
                            inputCls={inputCls}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
