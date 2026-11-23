import React, { useId } from 'react';

interface VectorFiligreeCornerProps {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    className?: string;
    size?: number;
    color?: string;
}

export const VectorFiligreeCorner: React.FC<VectorFiligreeCornerProps> = ({
    position,
    className = '',
    size = 24,
    color = '#c8a96e'
}) => {
    const rawId = useId();
    const filterId = `vfc-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    // Native SVG rotation angle around center (12, 12)
    // Avoids CSS transform pixel-sampling/blurring on rotated HTML elements
    const angle = {
        'top-left': 0,
        'top-right': 90,
        'bottom-right': 180,
        'bottom-left': 270,
    }[position];

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={`pointer-events-none select-none shrink-0 ${className}`}
            style={{ overflow: 'visible' }}
            aria-hidden="true"
        >
            <defs>
                {/* Micro-glow filter that eliminates stair-stepping on fractional Windows display scaling */}
                <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="0" stdDeviation="0.65" floodColor={color} floodOpacity="0.45" />
                </filter>
            </defs>
            <g transform={`rotate(${angle} 12 12)`} filter={`url(#${filterId})`}>
                {/* Outer curved corner bracket */}
                <path
                    d="M 2 20 L 2 6 C 2 3.8 3.8 2 6 2 L 20 2"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Delicate inner accent arc */}
                <path
                    d="M 6 14 L 6 8 C 6 6.9 6.9 6 8 6 L 14 6"
                    stroke={color}
                    strokeWidth="1"
                    strokeOpacity="0.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Micro filigree accent node */}
                <circle cx="8" cy="8" r="1.5" fill={color} />
            </g>
        </svg>
    );
};
