import React from 'react';

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
    // Rotation based on corner position
    const rotation = {
        'top-left': 'rotate-0',
        'top-right': 'rotate-90',
        'bottom-right': 'rotate-180',
        'bottom-left': '-rotate-90',
    }[position];

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={`pointer-events-none select-none ${rotation} ${className}`}
            style={{ shapeRendering: 'geometricPrecision' }}
            aria-hidden="true"
        >
            {/* Elegant outer curved corner line */}
            <path
                d="M 2 20 L 2 6 C 2 3.8 3.8 2 6 2 L 20 2"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
            />
            {/* Delicate inner accent arc */}
            <path
                d="M 6 14 L 6 8 C 6 6.9 6.9 6 8 6 L 14 6"
                stroke={color}
                strokeWidth="1"
                strokeOpacity="0.6"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
            />
            {/* Micro filigree accent dot */}
            <circle cx="8" cy="8" r="1.5" fill={color} />
        </svg>
    );
};
