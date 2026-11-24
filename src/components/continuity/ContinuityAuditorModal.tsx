import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, 
    Search, ArrowRight, Filter, Clock, Calendar, Users, Link2,
    RefreshCw
} from 'lucide-react';
import { WorldData, EntityType } from '../../types';
import { useTheme } from '../../theme';
import { TYPE_LABELS } from '../../constants';
import { 
    detectContinuityIssues, 
    getContinuitySummary, 
    ContinuityIssue, 
    ContinuityCategory,
    ContinuitySeverity 
} from '../../utils/continuityDetector';
import { VectorFiligreeCorner } from '../ui/VectorFiligreeCorner';

interface ContinuityAuditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    world: WorldData;
    onNavigate: (entityId: string) => void;
}

export const ContinuityAuditorModal: React.FC<ContinuityAuditorModalProps> = ({
    isOpen,
    onClose,
    world,
    onNavigate
}) => {
    const { themeId, layoutMode } = useTheme();
    const isRoyal = themeId === 'royal-codex';
    const isWiki = layoutMode === 'wiki';
    const isGrandVoyager = themeId === 'grand-voyager';

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ContinuityCategory | 'all'>('all');
    const [selectedSeverity, setSelectedSeverity] = useState<ContinuitySeverity | 'all'>('all');

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const allIssues = useMemo(() => {
        if (!isOpen) return [];
        return detectContinuityIssues(world);
    }, [isOpen, world]);

    const summary = useMemo(() => getContinuitySummary(allIssues), [allIssues]);

    const filteredIssues = useMemo(() => {
        return allIssues.filter(issue => {
            if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;
            if (selectedSeverity !== 'all' && issue.severity !== selectedSeverity) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchName = issue.entityName.toLowerCase().includes(q);
                const matchTitle = issue.title.toLowerCase().includes(q);
                const matchDesc = issue.description.toLowerCase().includes(q);
                const matchRelated = issue.relatedEntityName?.toLowerCase().includes(q);
                if (!matchName && !matchTitle && !matchDesc && !matchRelated) return false;
            }
            return true;
        });
    }, [allIssues, selectedCategory, selectedSeverity, searchQuery]);

    if (!isOpen) return null;

    const handleJump = (id: string) => {
        onNavigate(id);
        onClose();
    };

    // Theming styles
    const modalBg = isRoyal
        ? 'bg-[#18110b] border-2 border-[#c8a96e]/70 text-[#f5ebd7] shadow-[0_25px_70px_rgba(0,0,0,0.95)]'
        : isWiki
        ? 'bg-[#fdfcf0] border-2 border-[#d4c8af] text-[#2b1810] shadow-2xl'
        : isGrandVoyager
        ? 'bg-[#061517] border-2 border-[#2dd4bf]/40 text-[#f5e9d0] shadow-[0_25px_70px_rgba(0,0,0,0.95)]'
        : 'bg-slate-900 border-2 border-slate-700 text-slate-100 shadow-2xl';

    const cardBg = isRoyal
        ? 'bg-[#22160d] border-[#c8a96e]/25 text-[#f5ebd7]'
        : isWiki
        ? 'bg-white border-[#d4c8af] text-[#2b1810]'
        : isGrandVoyager
        ? 'bg-[#0d2225] border-[#2dd4bf]/25 text-[#f5e9d0]'
        : 'bg-slate-800/80 border-slate-700 text-slate-100';

    const modalContent = (
        <div 
            data-interactive-ui="true" 
            className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className={`relative w-full max-w-4xl rounded-3xl border flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 ${modalBg}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Royal Codex Ornate Vector Filigree Corners */}
                {isRoyal && (
                    <>
                        <VectorFiligreeCorner position="top-left" className="absolute top-2 left-2 z-20" size={24} />
                        <VectorFiligreeCorner position="top-right" className="absolute top-2 right-2 z-20" size={24} />
                        <VectorFiligreeCorner position="bottom-left" className="absolute bottom-2 left-2 z-20" size={24} />
                        <VectorFiligreeCorner position="bottom-right" className="absolute bottom-2 right-2 z-20" size={24} />
                    </>
                )}

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-current/15 relative z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                            summary.total > 0
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        }`}>
                            {summary.total > 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-serif font-black uppercase tracking-tight">
                                Continuity & Timeline Auditor
                            </h2>
                            <p className="text-[11px] font-sans opacity-70">
                                Passive detection of chronological paradoxes, impossible lifespans, and broken entity ties.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/20 transition-all cursor-pointer shrink-0"
                        title="Close (Escape)"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Metric Health Counter Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-6 py-3 border-b border-current/10 bg-black/10 shrink-0">
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${cardBg}`}>
                        <div>
                            <div className="text-[9px] font-mono uppercase tracking-wider opacity-60">Total Flagged</div>
                            <div className="text-lg font-serif font-black">{summary.total}</div>
                        </div>
                        <Clock size={16} className="opacity-40" />
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        summary.criticalCount > 0 ? 'bg-red-500/10 border-red-500/30 text-red-400' : cardBg
                    }`}>
                        <div>
                            <div className="text-[9px] font-mono uppercase tracking-wider opacity-60">Critical Paradoxes</div>
                            <div className="text-lg font-serif font-black">{summary.criticalCount}</div>
                        </div>
                        <ShieldAlert size={16} className={summary.criticalCount > 0 ? 'text-red-400' : 'opacity-40'} />
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        summary.warningCount > 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : cardBg
                    }`}>
                        <div>
                            <div className="text-[9px] font-mono uppercase tracking-wider opacity-60">Warnings</div>
                            <div className="text-lg font-serif font-black">{summary.warningCount}</div>
                        </div>
                        <AlertTriangle size={16} className={summary.warningCount > 0 ? 'text-amber-400' : 'opacity-40'} />
                    </div>

                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${cardBg}`}>
                        <div>
                            <div className="text-[9px] font-mono uppercase tracking-wider opacity-60">Broken References</div>
                            <div className="text-lg font-serif font-black">{summary.byCategory.broken_link}</div>
                        </div>
                        <Link2 size={16} className="opacity-40" />
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="px-6 py-2.5 border-b border-current/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-serif">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                selectedCategory === 'all'
                                    ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e]' : 'bg-amber-400 text-black'
                                    : 'opacity-60 hover:opacity-100 hover:bg-black/10'
                            }`}
                        >
                            All ({summary.total})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('lifespan')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                selectedCategory === 'lifespan'
                                    ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e]' : 'bg-amber-400 text-black'
                                    : 'opacity-60 hover:opacity-100 hover:bg-black/10'
                            }`}
                        >
                            Lifespans ({summary.byCategory.lifespan})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('chronology')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                selectedCategory === 'chronology'
                                    ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e]' : 'bg-amber-400 text-black'
                                    : 'opacity-60 hover:opacity-100 hover:bg-black/10'
                            }`}
                        >
                            Event Sync ({summary.byCategory.chronology + summary.byCategory.event})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('ancestry')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                selectedCategory === 'ancestry'
                                    ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e]' : 'bg-amber-400 text-black'
                                    : 'opacity-60 hover:opacity-100 hover:bg-black/10'
                            }`}
                        >
                            Ancestry ({summary.byCategory.ancestry})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('broken_link')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                selectedCategory === 'broken_link'
                                    ? isRoyal ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e]' : 'bg-amber-400 text-black'
                                    : 'opacity-60 hover:opacity-100 hover:bg-black/10'
                            }`}
                        >
                            Broken Links ({summary.byCategory.broken_link})
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative min-w-[200px]">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-40" />
                        <input
                            type="text"
                            placeholder="Filter by entity or title..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className={`w-full pl-8 pr-3 py-1 rounded-xl text-xs outline-none border transition-all ${
                                isRoyal
                                    ? 'bg-[#22160d] border-[#c8a96e]/30 placeholder-[#c8a96e]/40 text-[#f5ebd7]'
                                    : isWiki
                                    ? 'bg-white border-[#d4c8af] text-[#2b1810]'
                                    : 'bg-slate-800 border-slate-700 text-slate-100'
                            }`}
                        />
                    </div>
                </div>

                {/* Issues List Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                    {summary.total === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
                                <Sparkles size={28} />
                            </div>
                            <h3 className="font-serif font-black text-lg text-emerald-400 uppercase tracking-tight">
                                ❖ All Chronologies & Lineages Aligned
                            </h3>
                            <p className="text-xs max-w-md opacity-75 font-serif italic">
                                Zero chronological paradoxes, inverted lifespans, or broken reciprocal references found across all {world.entities.length} records in this realm.
                            </p>
                        </div>
                    ) : filteredIssues.length === 0 ? (
                        <div className="py-12 text-center text-xs opacity-60 font-serif italic">
                            No conflicts matching your active category or search filter.
                        </div>
                    ) : (
                        filteredIssues.map(issue => (
                            <div 
                                key={issue.id}
                                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cardBg} ${
                                    issue.severity === 'critical'
                                        ? 'border-l-4 border-l-red-500'
                                        : issue.severity === 'warning'
                                        ? 'border-l-4 border-l-amber-500'
                                        : 'border-l-4 border-l-sky-500'
                                }`}
                            >
                                <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`text-[9px] font-mono uppercase font-black px-2 py-0.5 rounded-full border ${
                                            issue.severity === 'critical'
                                                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                                : issue.severity === 'warning'
                                                ? 'bg-amber-500/20 text-yellow-300 border-amber-500/40'
                                                : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                        }`}>
                                            {issue.severity}
                                        </span>

                                        <span className="text-[10px] font-mono opacity-50 uppercase tracking-wider">
                                            {TYPE_LABELS[issue.entityType] || issue.entityType}
                                        </span>

                                        <span className="font-serif font-black text-sm">
                                            {issue.title}
                                        </span>
                                    </div>

                                    <div className="text-xs font-sans opacity-85 leading-relaxed pt-0.5">
                                        {issue.description}
                                    </div>

                                    {issue.suggestedFix && (
                                        <div className="text-[11px] font-mono opacity-65 flex items-center gap-1.5 pt-1">
                                            <span className="text-amber-400">💡 Suggested fix:</span>
                                            <span>{issue.suggestedFix}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                                    <button
                                        type="button"
                                        onClick={() => handleJump(issue.entityId)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border ${
                                            isRoyal
                                                ? 'bg-[#70121e] text-[#fff8e7] border-[#c8a96e] hover:bg-[#881326]'
                                                : isWiki
                                                ? 'bg-[#b91c1c] text-white hover:bg-red-800'
                                                : isGrandVoyager
                                                ? 'bg-[#2dd4bf] text-[#041e1e] hover:bg-teal-300'
                                                : 'bg-amber-400 text-black font-black hover:bg-yellow-400'
                                        }`}
                                    >
                                        <span>Open {issue.entityName}</span>
                                        <ArrowRight size={12} />
                                    </button>

                                    {issue.relatedEntityId && (
                                        <button
                                            type="button"
                                            onClick={() => handleJump(issue.relatedEntityId!)}
                                            className="px-2.5 py-1.5 rounded-xl text-xs font-serif opacity-75 hover:opacity-100 hover:bg-black/10 border border-current/20 transition-all cursor-pointer"
                                            title={`Inspect related entity: ${issue.relatedEntityName || 'Related'}`}
                                        >
                                            View Related
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3.5 border-t border-current/15 flex items-center justify-between bg-black/15 shrink-0">
                    <span className="text-[11px] font-mono opacity-60">
                        {summary.total} continuity alerts flagged across {world.entities.length} records.
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-5 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md ${
                            isRoyal
                                ? 'bg-[#70121e] text-[#fff8e7] border border-[#c8a96e] hover:bg-[#881326]'
                                : isWiki
                                ? 'bg-[#b91c1c] text-white hover:bg-red-800'
                                : isGrandVoyager
                                ? 'bg-[#2dd4bf] text-[#041e1e] hover:bg-teal-300'
                                : 'bg-amber-400 text-black hover:bg-yellow-400 font-black'
                        }`}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
