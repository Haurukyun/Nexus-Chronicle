import React from 'react';

export const EmeraldGem: React.FC<{ active?: boolean }> = ({ active = true }) => {
    return (
        <div className="flex flex-col items-center justify-center my-2">
            <div className="relative flex items-center justify-center w-12 h-16">
                {/* Emerald Radial Glow Behind Gem */}
                <div 
                    className="absolute inset-0 rounded-full blur-md opacity-80 animate-pulse"
                    style={{
                        background: active 
                            ? 'radial-gradient(circle, rgba(52,211,153,0.9) 0%, rgba(16,185,129,0.4) 60%, transparent 100%)' 
                            : 'radial-gradient(circle, rgba(239,68,68,0.9) 0%, rgba(185,28,28,0.4) 60%, transparent 100%)'
                    }}
                />

                {/* 3D Faceted Crystal SVG */}
                <svg 
                    viewBox="0 0 40 56" 
                    className="w-10 h-14 relative z-10 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)] transition-all"
                >
                    <defs>
                        <linearGradient id="gemTop" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a7f3d0" />
                            <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                        <linearGradient id="gemLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#34d399" />
                            <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        <linearGradient id="gemRight" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                        <linearGradient id="gemBottom" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#059669" />
                            <stop offset="100%" stopColor="#064e3b" />
                        </linearGradient>
                    </defs>

                    {/* Top Facet */}
                    <polygon points="20,2 34,14 6,14" fill="url(#gemTop)" />
                    {/* Upper Center Facet */}
                    <polygon points="6,14 34,14 20,28" fill="url(#gemLeft)" opacity="0.9" />
                    {/* Lower Left Facet */}
                    <polygon points="6,14 20,28 20,54" fill="url(#gemLeft)" />
                    {/* Lower Right Facet */}
                    <polygon points="34,14 20,28 20,54" fill="url(#gemRight)" />
                    {/* Highlight Lines */}
                    <line x1="20" y1="2" x2="20" y2="28" stroke="#ecfdf5" strokeWidth="1" opacity="0.6" />
                    <line x1="6" y1="14" x2="34" y2="14" stroke="#ecfdf5" strokeWidth="0.8" opacity="0.4" />
                </svg>
            </div>
            <span className={`text-[11px] font-serif font-black tracking-[0.25em] uppercase mt-1 ${active ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'text-rose-400'}`}>
                {active ? 'ACTIVE' : 'DECEASED'}
            </span>
        </div>
    );
};
