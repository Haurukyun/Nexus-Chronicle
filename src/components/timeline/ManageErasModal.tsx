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

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10 select-none">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
                onClick={onClose} 
            />

            {/* Modal Dialog Card */}
            <div className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden z-10 transition-all ${
                themeId === 'grand-voyager'
                    ? 'bg-[#180c04] border-[#3d2617] text-[#f0dca8]'
                    : themeId === 'royal-codex'
                    ? 'bg-[#1c140d] border-[#c8a96e]/30 text-[#fff8e7] font-serif'
                    : layoutMode === 'wiki'
                    ? 'bg-[#fcfbf9] border-[#d4c8af] text-[#2b1810]'
                    : 'bg-slate-900 border-slate-700/80 text-slate-100'
            }`}>
                {/* Header */}
                <div className="px-6 py-5 border-b border-current/10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${
                            themeId === 'grand-voyager' ? 'bg-[#2dd4bf]/15 text-[#2dd4bf]' :
                            themeId === 'royal-codex' ? 'bg-[#c8a96e]/20 text-[#c8a96e]' :
                            layoutMode === 'wiki' ? 'bg-red-500/10 text-red-600' :
                            'bg-yellow-400/10 text-yellow-400'
                        }`}>
                            <Clock size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-wider">Fantasy Eras &amp; Epochs</h2>
                            <p className="text-xs opacity-50 font-serif italic">Configure custom cosmological ages, abbreviations, and time offsets.</p>
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
                    <div className="p-4 rounded-2xl border border-current/10 bg-current/5 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider opacity-70">
                            <Sparkles size={13} className="text-amber-400" /> Quick Era Presets
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(DEFAULT_ERA_PRESETS).map(([key, preset]) => (
                                <button
                                    key={key}
                                    onClick={() => handleApplyPreset(key)}
                                    className="px-3 py-1.5 rounded-xl border border-current/20 text-xs font-bold hover:bg-current/10 transition-colors flex items-center gap-1.5"
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
                                                isEditing ? 'border-current/40 ring-1 ring-current/20 bg-current/5' : 'border-current/10 bg-current/[0.02]'
                                            }`}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <span 
                                                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                                                        style={{ backgroundColor: era.color || '#fbbf24' }} 
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
                                                            className="w-full px-3 py-1.5 rounded-xl bg-black/20 border border-current/20 text-xs outline-none focus:border-current"
                                                            placeholder="e.g. Third Age"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-wider opacity-60 block mb-1">Abbreviation / Tag</label>
                                                        <input
                                                            value={era.abbreviation || ''}
                                                            onChange={e => handleUpdateEra(era.id, { abbreviation: e.target.value })}
                                                            className="w-full px-3 py-1.5 rounded-xl bg-black/20 border border-current/20 text-xs font-mono outline-none focus:border-current"
                                                            placeholder="e.g. 3A"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-wider opacity-60 block mb-1">Start Year</label>
                                                        <input
                                                            type="number"
                                                            value={era.startYear}
                                                            onChange={e => handleUpdateEra(era.id, { startYear: parseInt(e.target.value) || 0 })}
                                                            className="w-full px-3 py-1.5 rounded-xl bg-black/20 border border-current/20 text-xs font-mono outline-none focus:border-current"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-wider opacity-60 block mb-1">End Year (optional)</label>
                                                        <input
                                                            type="number"
                                                            value={era.endYear ?? ''}
                                                            onChange={e => handleUpdateEra(era.id, { endYear: e.target.value ? parseInt(e.target.value) : undefined })}
                                                            className="w-full px-3 py-1.5 rounded-xl bg-black/20 border border-current/20 text-xs font-mono outline-none focus:border-current"
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
                <div className="px-6 py-4 border-t border-current/10 flex items-center justify-between shrink-0 bg-current/[0.02]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-bold opacity-60 hover:opacity-100 transition-opacity"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all ${
                            themeId === 'grand-voyager' ? 'bg-[#2dd4bf] text-[#090d08] hover:bg-[#14b8a6]' :
                            themeId === 'royal-codex' ? 'bg-[#c8a96e] text-[#1c140d] hover:bg-[#dfc48e]' :
                            layoutMode === 'wiki' ? 'bg-[#b91c1c] text-white hover:bg-red-800' :
                            'bg-yellow-400 text-black hover:bg-yellow-300'
                        }`}
                    >
                        <Check size={14} /> Commit Eras to Codex
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
