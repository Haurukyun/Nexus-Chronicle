import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Moon, BookMarked, Crown } from 'lucide-react';
import { ThemeMode } from '../../types';

interface ThemeSwitcherProps {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    compact?: boolean;
}

const THEME_OPTIONS: { id: ThemeMode; label: string; sub: string; icon: React.FC<{ size?: number; className?: string }>; badgeColor: string }[] = [
    {
        id: 'sovereign',
        label: 'Sovereign Scribe',
        sub: 'Dark Obsidian & Warm Gold',
        icon: Moon,
        badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    {
        id: 'wiki',
        label: 'Wiki Mode',
        sub: 'Classic Parchment & Burgundy',
        icon: BookMarked,
        badgeColor: 'bg-rose-500/20 text-rose-700 border-rose-500/30'
    },
    {
        id: 'royal-codex',
        label: 'Royal Codex',
        sub: 'Illuminated Manuscript & Crimson Gold',
        icon: Crown,
        badgeColor: 'bg-amber-500/20 text-amber-800 border-amber-500/40'
    }
];

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme, compact = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentOption = THEME_OPTIONS.find(t => t.id === theme) || THEME_OPTIONS[0];
    const Icon = currentOption.icon;

    return (
        <div ref={containerRef} className="relative inline-block text-left">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 border ${
                    theme === 'royal-codex'
                        ? 'bg-[#f3ebd9] text-[#881337] border-[#d97706]/40 hover:bg-[#ebdcb9]'
                        : theme === 'wiki'
                        ? 'bg-[#f5e6d3] text-[#b91c1c] border-[#d4c8af] hover:bg-[#ead9c1]'
                        : 'bg-slate-900/80 text-yellow-400 border-slate-700 hover:bg-slate-800'
                }`}
                title="Switch Application Theme"
            >
                <Palette size={14} className="animate-pulse" />
                {!compact && <span>{currentOption.label}</span>}
                <span className="text-[9px] opacity-60">▼</span>
            </button>

            {isOpen && (
                <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    theme === 'royal-codex'
                        ? 'bg-[#faf6ee] border-[#d97706]/40 text-[#451a03]'
                        : theme === 'wiki'
                        ? 'bg-[#fdfcf0] border-[#d4c8af] text-[#1a1a1a]'
                        : 'bg-slate-900 border-slate-700 text-slate-200'
                }`}>
                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest opacity-50 border-b border-current/10 mb-1">
                        Select Codex Theme
                    </div>
                    {THEME_OPTIONS.map((opt) => {
                        const OptIcon = opt.icon;
                        const isSelected = theme === opt.id;
                        return (
                            <button
                                key={opt.id}
                                onClick={() => {
                                    setTheme(opt.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl transition-all ${
                                    isSelected
                                        ? (theme === 'royal-codex' ? 'bg-[#881337] text-white shadow-md' : theme === 'wiki' ? 'bg-[#b91c1c] text-white' : 'bg-yellow-500/20 text-yellow-300')
                                        : 'hover:bg-current/5'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg border ${opt.badgeColor}`}>
                                        <OptIcon size={14} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold">{opt.label}</div>
                                        <div className="text-[10px] opacity-70">{opt.sub}</div>
                                    </div>
                                </div>
                                {isSelected && <Check size={14} className="ml-2" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
