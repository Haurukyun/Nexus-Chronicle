import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Sparkles, Check, Clock, Palette } from 'lucide-react';
import { FantasyEra } from '../../types';
import { DEFAULT_ERA_PRESETS } from '../../utils/timelineUtils';
import { useTheme } from '../../theme';

interface ManageErasModalProps {
    isOpen: boolean;
    onClose: () => void;
    eras: FantasyEra[];
    onSaveEras: (eras: FantasyEra[]) => void;
}

const PRESET_COLORS = [
    '#38bdf8', '#fbbf24', '#f87171', '#4ade80',
    '#c084fc', '#f472b6', '#2dd4bf', '#fb923c'
];

export const ManageErasModal: React.FC<ManageErasModalProps> = ({
    isOpen,
    onClose,
    eras,
    onSaveEras
}) => {
    const { themeId, layoutMode } = useTheme();
    const [localEras, setLocalEras] = useState<FantasyEra[]>(() => {
        return eras && eras.length > 0 ? [...eras] : [...DEFAULT_ERA_PRESETS.mythic.eras];
    });

    const [editingEra, setEditingEra] = useState<FantasyEra | null>(null);

    if (!isOpen) return null;

    const handleApplyPreset = (presetKey: string) => {
        const preset = DEFAULT_ERA_PRESETS[presetKey];
        if (preset) {
            setLocalEras([...preset.eras]);
        }
    };

    const handleAddEra = () => {
        const lastEra = localEras[localEras.length - 1];
        const start = lastEra?.endYear !== undefined ? lastEra.endYear + 1 : 1000;
        const newEra: FantasyEra = {
            id: crypto.randomUUID(),
            name: `New Era ${localEras.length + 1}`,
            abbreviation: `E${localEras.length + 1}`,
            startYear: start,
            endYear: start + 500,
            color: PRESET_COLORS[localEras.length % PRESET_COLORS.length],
            description: ''
        };
        setLocalEras([...localEras, newEra]);
        setEditingEra(newEra);
    };

    const handleDeleteEra = (id: string) => {
        setLocalEras(localEras.filter(e => e.id !== id));
        if (editingEra?.id === id) setEditingEra(null);
    };

    const handleUpdateEra = (id: string, updates: Partial<FantasyEra>) => {
        setLocalEras(localEras.map(e => e.id === id ? { ...e, ...updates } : e));
        if (editingEra?.id === id) {
            setEditingEra({ ...editingEra, ...updates });
        }
    };

    const handleSave = () => {
        const sorted = [...localEras].sort((a, b) => a.startYear - b.startYear);
        onSaveEras(sorted);
        onClose();
    };

    const isSovereign = themeId === 'sovereign';
    const isVoyager   = themeId === 'grand-voyager';
    const isRoyal     = themeId === 'royal-codex';
    const isWiki      = layoutMode === 'wiki';

    const modalCard = isVoyager
        ? 'bg-[#180c04]/90 border-[#3d2617]/80 text-[#f0dca8]'
        : isRoyal
        ? 'bg-[#1c140d]/90 border-[#c8a96e]/25 text-[#fff8e7] font-serif'
        : isWiki
        ? 'bg-[#fcfbf9]/95 border-[#d4c8af] text-[#2b1810]'
        : 'bg-slate-900/85 border-slate-700/50 text-slate-100';

    const iconAccent = isVoyager ? 'bg-[#2dd4bf]/15 text-[#2dd4bf]'
                     : isRoyal   ? 'bg-[#c8a96e]/20 text-[#c8a96e]'
                     : isWiki    ? 'bg-red-500/10 text-red-600'
                     :             'bg-[#fef08a]/10 text-[#fef08a]';

    const inputCls = isVoyager ? 'bg-[#241208] border-[#3d2617]/80 text-[#f0dca8] focus:border-[#2dd4bf]/50'
                   : isRoyal   ? 'bg-[#2b1810] border-[#c8a96e]/25 text-[#fff8e7] focus:border-[#c8a96e]/50'
                   : isWiki    ? 'bg-white border-[#d4c8af] text-[#2b1810] focus:border-red-400'
                   :             'bg-slate-800/80 border-slate-700/60 text-slate-100 focus:border-[#fef08a]/40';

    const saveBtnCls = isVoyager ? 'bg-[#2dd4bf] text-[#090d08] hover:bg-[#14b8a6] shadow-[0_0_16px_rgba(45,212,191,0.3)]'
                     : isRoyal   ? 'bg-[#c8a96e] text-[#1c140d] hover:bg-[#dfc48e]'
                     : isWiki    ? 'bg-[#b91c1c] text-white hover:bg-red-800'
                     :             'bg-[#fef08a] text-black hover:bg-yellow-300 shadow-[0_0_18px_rgba(254,240,138,0.30)]';

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10 select-none">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/75 backdrop-blur-xl transition-opacity" 
                onClick={onClose} 
            />

            {/* Modal Dialog Card */}
            <div className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden z-10 backdrop-blur-xl ${modalCard}`}>
                {/* Header */}
                <div className="px-6 py-5 border-b border-current/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${iconAccent}`}>
                            <Clock size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-wider">Fantasy Eras &amp; Epochs</h2>
                            <p className="text-xs opacity-45 font-serif italic">Configure custom cosmological ages, abbreviations, and time offsets.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-xl opacity-50 hover:opacity-100 hover:bg-current/10 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Presets Bar */}
                    <div className={`p-4 rounded-2xl border space-y-2 ${
                        isSovereign ? 'bg-[#fef08a]/5 border-[#fef08a]/10'
                        : isVoyager ? 'bg-[#2dd4bf]/5 border-[#2dd4bf]/10'
                        : isRoyal   ? 'bg-[#c8a96e]/5 border-[#c8a96e]/10'
                        : isWiki    ? 'bg-[#d4c8af]/20 border-[#d4c8af]'
                        :             'bg-white/[0.03] border-white/[0.06]'
                    }`}>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider opacity-60">
                            <Sparkles size={13} className={isSovereign ? 'text-[#fef08a]' : isVoyager ? 'text-[#2dd4bf]' : 'text-amber-400'} /> Quick Era Presets
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(DEFAULT_ERA_PRESETS).map(([key, preset]) => (
                                <button
                                    key={key}
                                    onClick={() => handleApplyPreset(key)}
                                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold hover:brightness-110 transition-all flex items-center gap-1.5 ${
                                        isSovereign ? 'border-[#fef08a]/20 text-[#fef08a]/80 hover:bg-[#fef08a]/10'
                                        : isVoyager ? 'border-[#2dd4bf]/20 text-[#2dd4bf]/80 hover:bg-[#2dd4bf]/10'
                                        : 'border-current/20 hover:bg-current/10'
                                    }`}
                                    title={preset.description}
                                >
                                    <span>{preset.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Eras List */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider opacity-70">Configured Eras ({localEras.length})</span>
                            <button
                                onClick={handleAddEra}
                                className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border border-current/20 hover:bg-current/10 transition-colors flex items-center gap-1.5"
                            >
                                <Plus size={13} /> Add Era
                            </button>
                        </div>

                        {localEras.length === 0 ? (
                            <div className="p-8 text-center rounded-2xl border border-dashed border-current/20 opacity-40 text-xs italic">
                                No custom eras configured. The timeline will use raw numeric years.
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {localEras.map(era => {
                                    const isEditing = editingEra?.id === era.id;
                                    return (
                                        <div
                                            key={era.id}
                                            className={`p-4 rounded-2xl border transition-all ${
                                                isEditing
                                                    ? isSovereign ? 'border-[#fef08a]/30 bg-[#fef08a]/[0.04] ring-1 ring-[#fef08a]/10'
                                                      : isVoyager ? 'border-[#2dd4bf]/30 bg-[#2dd4bf]/[0.04] ring-1 ring-[#2dd4bf]/10'
                                                      : 'border-current/40 ring-1 ring-current/20 bg-current/5'
                                                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10'
                                            }`}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <span 
                                                        className="w-3 h-3 rounded-full shrink-0"
                                                        style={{ backgroundColor: era.color || '#fbbf24', boxShadow: `0 0 7px ${era.color || '#fbbf24'}` }} 
                                                    />
                                                    <div>
                                                        <span className="font-bold text-sm">{era.name}</span>
                                                        {era.abbreviation && (
                                                            <span className="ml-2 text-xs font-mono opacity-60 px-1.5 py-0.5 rounded border border-current/20">
                                                                {era.abbreviation}
                                                            </span>
                                                        )}
                                                        <span className="ml-3 text-xs opacity-50 font-mono">
                                                            {era.startYear} — {era.endYear !== undefined ? era.endYear : 'Present'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setEditingEra(isEditing ? null : era)}
                                                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 transition-colors"
                                                    >
                                                        {isEditing ? 'Done' : 'Edit'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteEra(era.id)}
                                                        className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                        title="Delete Era"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Inline Editing Form */}
                                            {isEditing && (
                                                <div className="mt-4 pt-4 border-t border-current/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-200">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-wider opacity-60 block mb-1">Era Name</label>
                                                        <input
                                                            value={era.name}
                                                            onChange={e => handleUpdateEra(era.id, { name: e.target.value })}
                                                            className="w-full px-3 py-1.5 rounded-xl border text-xs outline-none focus:ring-1 focus:ring-current/20 transition-colors"
                                            style={{ background: 'none' }}
                                                            placeholder="e.g. Third Age"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-wider opacity-60 block mb-1">Abbreviation / Tag</label>
                                                        <input
                                                            value={era.abbreviation || ''}
                                                            onChange={e => handleUpdateEra(era.id, { abbreviation: e.target.value })}
                                                            className="w-full px-3 py-1.5 rounded-xl border text-xs font-mono outline-none focus:ring-1 focus:ring-current/20 transition-colors"
                                            style={{ background: 'none' }}
                                                            placeholder="e.g. 3A"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-wider opacity-60 block mb-1">Start Year</label>
                                                        <input
                                                            type="number"
                                                            value={era.startYear}
                                                            onChange={e => handleUpdateEra(era.id, { startYear: parseInt(e.target.value) || 0 })}
                                                            className="w-full px-3 py-1.5 rounded-xl border text-xs font-mono outline-none focus:ring-1 focus:ring-current/20 transition-colors"
                                            style={{ background: 'none' }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-wider opacity-60 block mb-1">End Year (optional)</label>
                                                        <input
                                                            type="number"
                                                            value={era.endYear ?? ''}
                                                            onChange={e => handleUpdateEra(era.id, { endYear: e.target.value ? parseInt(e.target.value) : undefined })}
                                                            className="w-full px-3 py-1.5 rounded-xl border text-xs font-mono outline-none focus:ring-1 focus:ring-current/20 transition-colors"
                                            style={{ background: 'none' }}
                                                            placeholder="Leave empty if ongoing"
                                                        />
                                                    </div>

                                                    <div className="col-span-full flex items-center gap-2 pt-2">
                                                        <label className="text-[10px] font-black uppercase tracking-wider opacity-60 shrink-0">Color Aura:</label>
                                                        <div className="flex items-center gap-1.5">
                                                            {PRESET_COLORS.map(c => (
                                                                <button
                                                                    key={c}
                                                                    type="button"
                                                                    onClick={() => handleUpdateEra(era.id, { color: c })}
                                                                    className={`w-5 h-5 rounded-full transition-transform ${era.color === c ? 'scale-125 ring-2 ring-white shadow-md' : 'hover:scale-110'}`}
                                                                    style={{ backgroundColor: c }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className={`px-6 py-4 border-t flex items-center justify-between shrink-0 ${
                    isWiki ? 'border-[#d4c8af]/60 bg-[#f0ead8]/50' : 'border-white/[0.06] bg-white/[0.02]'
                }`}>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-bold opacity-50 hover:opacity-100 transition-opacity"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all ${saveBtnCls}`}
                    >
                        <Check size={14} /> Commit Eras to Codex
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
