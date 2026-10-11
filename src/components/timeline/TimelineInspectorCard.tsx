import React from 'react';
import { X, ExternalLink, Calendar, Bookmark, User, Clock, Edit2 } from 'lucide-react';
import { FantasyEra, MilestonePin } from '../../types';
import { formatYearWithEra } from '../../utils/timelineUtils';
import { useTheme } from '../../theme';

export interface InspectedTimelineItem {
    type: 'character' | 'event' | 'milestone';
    id: string;
    name: string;
    startYear: number;
    endYear?: number;
    isDead?: boolean;
    description?: string;
    color?: string;
    entityId?: string;
    rawMilestone?: MilestonePin;
    eventType?: string;
}

interface TimelineInspectorCardProps {
    item: InspectedTimelineItem | null;
    eras?: FantasyEra[];
    onClose: () => void;
    onNavigate: (id: string) => void;
    onEditMilestone?: (milestone: MilestonePin) => void;
}

export const TimelineInspectorCard: React.FC<TimelineInspectorCardProps> = ({
    item,
    eras = [],
    onClose,
    onNavigate,
    onEditMilestone
}) => {
    const { themeId, layoutMode } = useTheme();
    const isSovereign = themeId === 'sovereign';
    const isVoyager   = themeId === 'grand-voyager';
    const isRoyal     = themeId === 'royal-codex';
    const isWiki      = layoutMode === 'wiki';

    if (!item) return null;

    const formattedStart = formatYearWithEra(item.startYear, eras);
    const formattedEnd = item.endYear !== undefined ? formatYearWithEra(item.endYear, eras) : null;
    const duration = item.endYear !== undefined ? Math.abs(item.endYear - item.startYear) : null;

    return (
        <div className={`relative p-5 rounded-2xl border shadow-2xl transition-all ${
            isVoyager   ? 'bg-[#180c04]/90 border-[#3d2617]/80 text-[#f0dca8] backdrop-blur-xl'
            : isRoyal   ? 'bg-[#1c140d]/90 border-[#c8a96e]/30 text-[#fff8e7] backdrop-blur-xl font-serif'
            : isWiki    ? 'bg-[#fcfbf9]/95 border-[#d4c8af] text-[#2b1810] backdrop-blur-sm shadow-amber-900/10'
            :              'bg-slate-900/80 border-slate-700/40 text-slate-100 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
        }`}>
            {/* Top Bar */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Badge type */}
                    <span 
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm border"
                        style={{
                            backgroundColor: item.color ? `${item.color}18` : 'transparent',
                            borderColor: item.color ? `${item.color}40` : 'currentColor',
                            color: item.color || undefined
                        }}
                    >
                        {item.type === 'character' && <User size={11} />}
                        {item.type === 'event' && <Calendar size={11} />}
                        {item.type === 'milestone' && <Bookmark size={11} />}
                        {item.type === 'character' ? (item.isDead ? 'Lifespan (Deceased)' : 'Lifespan (Living)') :
                         item.type === 'event' ? (item.eventType ? `Event: ${item.eventType}` : 'Historical Event') :
                         'Milestone Epoch'}
                    </span>

                    {/* Formatted Era Year */}
                    <span className="text-[10px] font-mono opacity-65 flex items-center gap-1">
                        <Clock size={11} /> {formattedStart}
                        {formattedEnd && formattedEnd !== formattedStart && ` — ${formattedEnd}`}
                    </span>
                </div>

                <button
                    onClick={onClose}
                    className="p-1 rounded-lg opacity-50 hover:opacity-100 hover:bg-current/10 transition-colors"
                    title="Close Inspector"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-2">
                {item.color && (
                    <div 
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}70` }} 
                    />
                )}
                {item.name}
            </h3>

            {/* Subtitle / Duration */}
            {duration !== null && duration > 0 && (
                <p className="text-xs opacity-60 mb-3">
                    Timespan: {duration} {duration === 1 ? 'Year' : 'Years'}
                </p>
            )}

            {/* Description */}
            {item.description ? (
                <div className="text-xs opacity-80 leading-relaxed mb-4 max-h-32 overflow-y-auto custom-scrollbar pr-1 border-t border-current/10 pt-2">
                    {item.description}
                </div>
            ) : (
                <div className="text-xs opacity-40 italic mb-4 border-t border-current/10 pt-2">
                    No chronicle notes documented for this entry.
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-current/10">
                {/* Navigate to Entity */}
                {(item.type !== 'milestone' || item.entityId) && (
                    <button
                        onClick={() => {
                            const targetId = item.type === 'milestone' ? item.entityId! : item.id;
                            onNavigate(targetId);
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                            isVoyager ? 'bg-[#2dd4bf] text-[#180c04] hover:bg-[#2dd4bf]/90 shadow-[0_0_12px_rgba(45,212,191,0.3)]'
                            : isRoyal ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#851624]'
                            : isWiki  ? 'bg-red-700 text-white hover:bg-red-800'
                            :           'bg-[#fef08a] text-slate-950 hover:bg-yellow-300 shadow-[0_0_14px_rgba(254,240,138,0.25)]'
                        }`}
                    >
                        <ExternalLink size={13} /> Open in Codex
                    </button>
                )}

                {/* Edit Milestone */}
                {item.type === 'milestone' && item.rawMilestone && onEditMilestone && (
                    <button
                        onClick={() => onEditMilestone(item.rawMilestone!)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-current/20 hover:bg-current/10 transition-colors"
                    >
                        <Edit2 size={13} /> Edit Pin
                    </button>
                )}
            </div>
        </div>
    );
};
