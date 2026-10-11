import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bookmark, Trash2, Calendar, Link as LinkIcon, Check, Palette } from 'lucide-react';
import { MilestonePin, WorldEntity } from '../../types';
import { extractYear } from '../../utils/timelineUtils';
import { useTheme } from '../../theme';

interface AddMilestoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveMilestone: (milestone: MilestonePin) => void;
    onDeleteMilestone?: (id: string) => void;
    initialMilestone?: MilestonePin | null;
    initialYear?: number;
    existingEntities?: WorldEntity[];
}

const PRESET_COLORS = [
    '#f59e0b', // Amber / Gold
    '#ef4444', // Crimson / Red
    '#3b82f6', // Sapphire / Blue
    '#10b981', // Emerald / Green
    '#8b5cf6', // Amethyst / Purple
    '#ec4899', // Rose
    '#06b6d4', // Cyan
    '#f97316'  // Orange
];

export const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({
    isOpen,
    onClose,
    onSaveMilestone,
    onDeleteMilestone,
    initialMilestone,
    initialYear,
    existingEntities = []
}) => {
    const { themeId, layoutMode } = useTheme();

    const [name, setName] = useState('');
    const [yearInput, setYearInput] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const [entityId, setEntityId] = useState<string>('');
    const [filterSearch, setFilterSearch] = useState('');
    const [showEntityPicker, setShowEntityPicker] = useState(false);

    useEffect(() => {
        if (initialMilestone) {
            setName(initialMilestone.name);
            setYearInput(initialMilestone.year.toString());
            setDescription(initialMilestone.description || '');
            setColor(initialMilestone.color || PRESET_COLORS[0]);
            setEntityId(initialMilestone.entityId || '');
        } else {
            setName('');
            setYearInput(initialYear !== undefined ? initialYear.toString() : '1000');
            setDescription('');
            setColor(PRESET_COLORS[0]);
            setEntityId('');
        }
        setShowEntityPicker(false);
        setFilterSearch('');
    }, [initialMilestone, initialYear, isOpen]);

    if (!isOpen) return null;

    const parsedYear = extractYear(yearInput);

    const handleSave = () => {
        if (!name.trim()) return;
        const validYear = parsedYear !== null ? parsedYear : 0;

        const milestone: MilestonePin = {
            id: initialMilestone ? initialMilestone.id : crypto.randomUUID(),
            name: name.trim(),
            year: validYear,
            description: description.trim() || undefined,
            color,
            entityId: entityId || undefined
        };

        onSaveMilestone(milestone);
        onClose();
    };

    const selectedEntity = existingEntities.find(e => e.id === entityId);
    const filteredEntities = existingEntities.filter(e => {
        if (!filterSearch) return true;
        const q = filterSearch.toLowerCase();
        return e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q);
    }).slice(0, 30);

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 select-none">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
                onClick={onClose} 
            />

            {/* Modal Dialog Card */}
            {(() => {
                const isRoyal = themeId === 'royal-codex';
                const isWiki = layoutMode === 'wiki';
                const isLightModal = isWiki || isRoyal;

                const modalCard = themeId === 'grand-voyager'
                    ? 'bg-[#180c04]/90 border-[#3d2617]/90 text-[#f0dca8] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-[#2dd4bf]/20'
                    : isRoyal
                    ? 'bg-[#fcfaf2] border-2 border-[#c8a96e]/80 text-[#2b1810] shadow-[0_25px_60px_-15px_rgba(60,30,10,0.4)] font-serif'
                    : isWiki
                    ? 'bg-[#fcfbf9]/95 border-[#d4c8af] text-[#2b1810] shadow-[0_25px_60px_-15px_rgba(80,50,20,0.2)]'
                    : 'bg-slate-900/85 border-slate-700/60 text-slate-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/10';

                const inputCls = themeId === 'grand-voyager'
                    ? 'bg-[#241208] border-[#3d2617] text-[#f0dca8] focus:ring-[#2dd4bf]/40'
                    : isRoyal
                    ? 'bg-white border-2 border-[#c8a96e]/60 text-[#2b1810] placeholder:text-[#2b1810]/40 focus:border-[#70121e] focus:ring-1 focus:ring-[#70121e]/30 shadow-xs font-serif'
                    : isWiki
                    ? 'bg-white border border-[#d4c8af] text-[#2b1810] placeholder:text-stone-400 focus:border-red-500 focus:ring-1 focus:ring-red-400 shadow-xs'
                    : 'bg-slate-800 border-slate-700 text-slate-100 focus:ring-amber-400/40';

                return (
                    <div className={`relative w-full max-w-lg flex flex-col rounded-3xl border shadow-2xl overflow-hidden z-10 backdrop-blur-2xl transition-all ${modalCard}`}>
                        {/* Header */}
                        <div className={`px-6 py-5 border-b flex items-center justify-between shrink-0 ${
                            isRoyal ? 'border-[#c8a96e]/40 bg-[#f4efe4]/30' : isWiki ? 'border-[#d4c8af]' : 'border-current/10'
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl border ${
                                    themeId === 'grand-voyager' ? 'bg-[#2dd4bf]/15 text-[#2dd4bf] border-[#2dd4bf]/30' :
                                    isRoyal ? 'bg-[#70121e]/10 text-[#70121e] border-[#70121e]/30' :
                                    isWiki ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                    'bg-amber-400/10 text-amber-300 border-amber-400/30'
                                }`}>
                                    <Bookmark size={20} />
                                </div>
                                <div>
                                    <h2 className={`text-lg font-bold tracking-wide ${
                                        isRoyal ? 'text-[#3d0a10] font-serif font-black' : isWiki ? 'text-[#881337]' : ''
                                    }`}>
                                        {initialMilestone ? 'Edit Milestone Pin' : 'Create Milestone Pin'}
                                    </h2>
                                    <p className={`text-xs ${isLightModal ? 'text-[#2b1810]/70' : 'opacity-60'}`}>
                                        Anchor a pivotal turning point to the Chronos ribbons
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className={`p-1.5 rounded-lg transition-colors ${
                                    isLightModal ? 'text-[#2b1810] hover:bg-black/10' : 'opacity-60 hover:opacity-100 hover:bg-current/10'
                                }`}
                                title="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider opacity-75 mb-1.5">
                                    Milestone Title *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. The Shattering of Sol, Treaty of Valdor"
                                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${inputCls}`}
                                />
                            </div>

                            {/* Year Input */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                                        Year / Epoch Anchor *
                                    </label>
                                    {parsedYear !== null && (
                                        <span className={`text-[10px] font-mono ${isLightModal ? 'text-[#2b1810]/70' : 'opacity-60'}`}>
                                            Parsed as: {parsedYear} {parsedYear < 0 ? '(BCE)' : ''}
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={yearInput}
                                        onChange={e => setYearInput(e.target.value)}
                                        placeholder="e.g. 1450, -500, or 350 BCE"
                                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${inputCls}`}
                                    />
                                    <Calendar size={15} className={`absolute left-3 top-3 ${isLightModal ? 'text-[#2b1810]/50' : 'opacity-40'}`} />
                                </div>
                            </div>

                            {/* Aura Color Picker */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-75 mb-2">
                                    <Palette size={13} /> Milestone Pin Color
                                </label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {PRESET_COLORS.map(c => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-7 h-7 rounded-full border-2 transition-transform ${
                                                color === c ? 'scale-125 border-white shadow-lg' : 'border-transparent hover:scale-110 opacity-70 hover:opacity-100'
                                            }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={e => setColor(e.target.value)}
                                        className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0"
                                        title="Custom color"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider opacity-75 mb-1.5">
                                    Description / Historical Significance
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Detail the cataclysm, discovery, or watershed treaty that altered world history..."
                                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 resize-none ${inputCls}`}
                                />
                            </div>

                    {/* Linked Entity Picker */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-75 mb-1.5">
                            <LinkIcon size={13} /> Link to Codex Entry (Optional)
                        </label>

                        {selectedEntity ? (
                            <div className="flex items-center justify-between p-2.5 rounded-xl border border-current/15 bg-current/5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-0.5 rounded-md uppercase font-bold tracking-wider opacity-70 bg-current/10">
                                        {selectedEntity.type}
                                    </span>
                                    <span className="text-sm font-medium">{selectedEntity.name}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEntityId('')}
                                    className="p-1 rounded opacity-50 hover:opacity-100 hover:bg-current/10 text-xs"
                                >
                                    Unlink
                                </button>
                            </div>
                        ) : (
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setShowEntityPicker(!showEntityPicker)}
                                    className="w-full text-left px-3.5 py-2 rounded-xl border border-dashed border-current/20 text-xs opacity-70 hover:opacity-100 transition-colors"
                                >
                                    {showEntityPicker ? 'Hide Codex List' : '+ Link an Event, Myth, or Character'}
                                </button>

                                {showEntityPicker && (
                                    <div className="mt-2 p-2 rounded-xl border border-current/10 bg-current/5 space-y-2">
                                        <input
                                            type="text"
                                            value={filterSearch}
                                            onChange={e => setFilterSearch(e.target.value)}
                                            placeholder="Search entities..."
                                            className={`w-full px-2.5 py-1.5 text-xs rounded-lg border focus:outline-none ${
                                                isRoyal ? 'bg-white border-[#c8a96e]/60 text-[#2b1810]'
                                                : isWiki ? 'bg-white border-[#d4c8af] text-[#2b1810]'
                                                : 'border-current/15 bg-black/20'
                                            }`}
                                        />
                                        <div className="max-h-36 overflow-y-auto space-y-1 custom-scrollbar">
                                            {filteredEntities.map(ent => (
                                                <button
                                                    key={ent.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setEntityId(ent.id);
                                                        setShowEntityPicker(false);
                                                    }}
                                                    className="w-full text-left flex items-center justify-between px-2 py-1 rounded text-xs hover:bg-current/10 transition-colors"
                                                >
                                                    <span className="truncate">{ent.name}</span>
                                                    <span className="text-[10px] opacity-60 uppercase">{ent.type}</span>
                                                </button>
                                            ))}
                                            {filteredEntities.length === 0 && (
                                                <div className="text-center py-2 text-xs opacity-40">No entries found</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className={`px-6 py-4 border-t flex items-center justify-between shrink-0 ${
                    isRoyal ? 'border-[#c8a96e]/40 bg-[#f4efe4]/60'
                    : isWiki ? 'border-[#d4c8af]/60 bg-[#f0ead8]/50'
                    : 'border-current/10 bg-current/5'
                }`}>
                    {initialMilestone && onDeleteMilestone ? (
                        <button
                            type="button"
                            onClick={() => {
                                onDeleteMilestone(initialMilestone.id);
                                onClose();
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                            <Trash2 size={14} /> Delete Pin
                        </button>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                isRoyal ? 'border border-[#c8a96e]/60 text-[#2b1810] hover:bg-black/5 bg-white font-serif'
                                : isWiki ? 'border border-[#d4c8af] text-[#2b1810] hover:bg-black/5 bg-white'
                                : 'opacity-75 hover:opacity-100'
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!name.trim()}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md ${
                                themeId === 'grand-voyager'
                                    ? 'bg-[#2dd4bf] text-[#180c04] hover:bg-[#2dd4bf]/90'
                                    : themeId === 'royal-codex'
                                    ? 'bg-[#70121e] text-[#fff8e7] hover:bg-[#851624]'
                                    : layoutMode === 'wiki'
                                    ? 'bg-red-700 text-white hover:bg-red-800'
                                    : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                            }`}
                        >
                            <Check size={14} /> Save Milestone
                        </button>
                    </div>
                </div>
            </div>
            );
        })()}
        </div>
    );

    return createPortal(modalContent, document.body);
};
