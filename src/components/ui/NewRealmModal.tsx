import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Globe, Compass, Check, BookOpen, AlertCircle } from 'lucide-react';
import { WorldPhase, ThemeMode } from '../../types';
import { DEFAULT_REALM_MAP } from '../../store/useWorldStore';

interface NewRealmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, description: string, mapImage: string, phase: WorldPhase) => void;
    theme: ThemeMode;
    isWikiMode: boolean;
}

const MAP_PRESETS = [
    {
        id: 'cartography',
        name: 'Prime Cartography',
        desc: 'Classic antique continent map',
        url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000'
    },
    {
        id: 'parchment',
        name: 'Archaic Archipelago',
        desc: 'Parchment coastal islands and leylines',
        url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=2000'
    },
    {
        id: 'astral',
        name: 'Celestial Starchart',
        desc: 'Constellations, nebulae and cosmic rifts',
        url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=2000'
    },
    {
        id: 'custom',
        name: 'Custom Cartography URL',
        desc: 'Specify your own map image URL',
        url: ''
    }
];

const PHASE_OPTIONS: { id: WorldPhase; name: string; aura: string; desc: string }[] = [
    { id: 'creation', name: 'Age of Genesis', aura: '#c084fc', desc: 'Mystic creation aura & boundless arcane currents' },
    { id: 'golden', name: 'Golden Zenith', aura: '#fef08a', desc: 'Radiant prosperity, sovereign balance & warmth' },
    { id: 'shadow', name: 'Twilit Gloom', aura: '#818cf8', desc: 'Veiled secrecy, forgotten secrets & nightfall' },
    { id: 'eclipse', name: 'Blood Eclipse', aura: '#f87171', desc: 'Violent omen, impending cataclysm & discord' },
    { id: 'ruin', name: 'Forsaken Ruin', aura: '#4ade80', desc: 'Weathered antiquity, ash & reclaim by wild overgrowth' },
];

export const NewRealmModal: React.FC<NewRealmModalProps> = ({
    isOpen,
    onClose,
    onCreate,
    theme,
    isWikiMode
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPhase, setSelectedPhase] = useState<WorldPhase>('golden');
    const [selectedPreset, setSelectedPreset] = useState<string>('cartography');
    const [customMapUrl, setCustomMapUrl] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const isRoyal = theme === 'royal-codex';

    const modalBg = isRoyal
        ? 'bg-[#181410] border-[#c8a96e]/40 text-[#f5ebd7]'
        : isWikiMode
        ? 'bg-[#fbf6ea] border-[#d4c8af] text-[#2b1810]'
        : 'bg-slate-900 border-slate-700 text-slate-100';

    const accentText = isRoyal
        ? 'text-[#d4af37]'
        : isWikiMode ? 'text-[#b91c1c]' : 'text-[#fef08a]';

    const inputCls = isRoyal
        ? 'bg-[#0f0a07] border-[#c8a96e]/30 text-[#f5ebd7] placeholder-[#c8a96e]/30 focus:border-[#d4af37]'
        : isWikiMode
        ? 'bg-white border-[#d4c8af] text-[#2b1810] placeholder-[#b0a090] focus:border-[#b91c1c]'
        : 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-[#fef08a]';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setError('Please specify a title for this realm.');
            return;
        }

        let finalMap = DEFAULT_REALM_MAP;
        if (selectedPreset === 'custom' && customMapUrl.trim()) {
            finalMap = customMapUrl.trim();
        } else {
            const preset = MAP_PRESETS.find(p => p.id === selectedPreset);
            if (preset && preset.url) finalMap = preset.url;
        }

        onCreate(trimmed, description.trim(), finalMap, selectedPhase);
        setName('');
        setDescription('');
        setCustomMapUrl('');
        setError('');
        onClose();
    };

    const modalElement = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-xl p-8 rounded-3xl border shadow-2xl space-y-6 ${modalBg} relative max-h-[90vh] overflow-y-auto`}>
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4 border-current/10">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl ${isWikiMode ? 'bg-[#b91c1c]/10' : 'bg-yellow-400/10'}`}>
                            <Globe size={24} className={accentText} />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-black uppercase tracking-tight">Found a New Realm</h2>
                            <p className="text-[11px] opacity-60 font-serif italic">Inscribe a new universe or campaign into your eternal codex.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="opacity-50 hover:opacity-100 transition-opacity p-1.5 rounded-xl hover:bg-white/5"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Realm Name */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block">
                            Realm Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. Aethelgard, The Shattered Expanse, Valoria..."
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(''); }}
                            className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${inputCls}`}
                        />
                        {error && (
                            <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
                                <AlertCircle size={13} /> {error}
                            </p>
                        )}
                    </div>

                    {/* Synopsis */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block">
                            Realm Synopsis & Lore Preface
                        </label>
                        <textarea
                            rows={3}
                            placeholder="A brief history, campaign premise, or overarching mystery of this world..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none transition-all resize-none ${inputCls}`}
                        />
                    </div>

                    {/* World Phase Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block">
                            Starting World Phase & Aura
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {PHASE_OPTIONS.map((phase) => {
                                const isSelected = selectedPhase === phase.id;
                                return (
                                    <button
                                        key={phase.id}
                                        type="button"
                                        onClick={() => setSelectedPhase(phase.id)}
                                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all text-xs ${
                                            isSelected
                                                ? isWikiMode
                                                    ? 'bg-[#b91c1c]/10 border-[#b91c1c] ring-1 ring-[#b91c1c]'
                                                    : 'bg-yellow-400/10 border-yellow-400/60 ring-1 ring-yellow-400/60'
                                                : 'border-current/10 opacity-70 hover:opacity-100 hover:bg-white/5'
                                        }`}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full mt-0.5 shrink-0 shadow-sm"
                                            style={{ backgroundColor: phase.aura }}
                                        />
                                        <div className="min-w-0">
                                            <p className="font-bold uppercase tracking-wider text-[11px] truncate">
                                                {phase.name}
                                            </p>
                                            <p className="text-[10px] opacity-60 leading-tight line-clamp-1">
                                                {phase.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Starting Atlas Map */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-60 block">
                            Starting Atlas Cartography
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {MAP_PRESETS.map((preset) => {
                                const isSelected = selectedPreset === preset.id;
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => setSelectedPreset(preset.id)}
                                        className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                                            isSelected
                                                ? isWikiMode
                                                    ? 'bg-[#b91c1c]/10 border-[#b91c1c] ring-1 ring-[#b91c1c]'
                                                    : 'bg-yellow-400/10 border-yellow-400/60 ring-1 ring-yellow-400/60'
                                                : 'border-current/10 opacity-70 hover:opacity-100 hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider">{preset.name}</span>
                                            {isSelected && <Check size={12} className={accentText} />}
                                        </div>
                                        <span className="text-[10px] opacity-60">{preset.desc}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {selectedPreset === 'custom' && (
                            <input
                                type="text"
                                placeholder="https://example.com/map.jpg"
                                value={customMapUrl}
                                onChange={(e) => setCustomMapUrl(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border text-xs outline-none transition-all mt-2 ${inputCls}`}
                            />
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-current/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase opacity-60 hover:opacity-100 transition-opacity"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                isWikiMode
                                    ? 'bg-[#b91c1c] text-white hover:bg-[#991b1b] disabled:opacity-40'
                                    : 'bg-[#fef08a] text-black hover:bg-yellow-400 disabled:opacity-40 shadow-lg shadow-yellow-500/20'
                            }`}
                        >
                            Found Realm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalElement, document.body) : modalElement;
};
