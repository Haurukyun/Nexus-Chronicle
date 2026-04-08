import React from 'react';

interface RadarChartProps {
    stats: {
        strength?: string;
        dexterity?: string;
        constitution?: string;
        intelligence?: string;
        wisdom?: string;
        charisma?: string;
    };
    compareStats?: any;
    isWikiMode: boolean;
}

export const RadarChart = ({ stats, compareStats, isWikiMode }: RadarChartProps) => {
    const parseStat = (val: string | undefined) => {
        if (!val) return 10;
        const match = val.match(/\d+/);
        return match ? parseInt(match[0]) : 10;
    };

    const keys = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    const values = [
        parseStat(stats.strength),
        parseStat(stats.dexterity),
        parseStat(stats.constitution),
        parseStat(stats.intelligence),
        parseStat(stats.wisdom),
        parseStat(stats.charisma)
    ];

    const size = 300;
    const center = size / 2;
    const radius = 100;
    const maxVal = 20;

    const getX = (val: number, i: number) => {
        const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
        const normalizedVal = Math.min(val, maxVal) / maxVal;
        return center + radius * normalizedVal * Math.cos(angle);
    };

    const getY = (val: number, i: number) => {
        const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
        const normalizedVal = Math.min(val, maxVal) / maxVal;
        return center + radius * normalizedVal * Math.sin(angle);
    };

    const points = values.map((v, i) => `${getX(v, i)},${getY(v, i)}`).join(' ');
    
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    const accentColor = isWikiMode ? '#7a200d' : '#fef08a';

    return (
        <div className="flex justify-center items-center py-6">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-2xl">
                {/* Grid */}
                {gridLevels.map((lvl, idx) => (
                    <polygon
                        key={idx}
                        points={keys.map((_, i) => `${center + radius * lvl * Math.cos((Math.PI * 2 * i) / keys.length - Math.PI / 2)},${center + radius * lvl * Math.sin((Math.PI * 2 * i) / keys.length - Math.PI / 2)}`).join(' ')}
                        fill="none"
                        stroke={isWikiMode ? '#00000022' : '#ffffff11'}
                        strokeWidth="1"
                    />
                ))}
                
                {/* Axis lines */}
                {keys.map((_, i) => (
                    <line
                        key={i}
                        x1={center} y1={center}
                        x2={center + radius * Math.cos((Math.PI * 2 * i) / keys.length - Math.PI / 2)}
                        y2={center + radius * Math.sin((Math.PI * 2 * i) / keys.length - Math.PI / 2)}
                        stroke={isWikiMode ? '#00000011' : '#ffffff08'}
                        strokeWidth="1"
                    />
                ))}

                {/* Data Polygon */}
                <polygon
                    points={points}
                    fill={accentColor + '44'}
                    stroke={accentColor}
                    strokeWidth="3"
                    className="animate-in fade-in duration-1000"
                />

                {/* Labels */}
                {keys.map((k, i) => {
                    const x = center + (radius + 25) * Math.cos((Math.PI * 2 * i) / keys.length - Math.PI / 2);
                    const y = center + (radius + 25) * Math.sin((Math.PI * 2 * i) / keys.length - Math.PI / 2);
                    return (
                        <text
                            key={i}
                            x={x} y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className={`text-[10px] font-black uppercase tracking-widest ${isWikiMode ? 'fill-[#7a200d]' : 'fill-[#fef08a]'}`}
                        >
                            {k}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};
