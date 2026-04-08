import React from 'react';

export const TaperedDivider = () => (
    <div className="w-full h-1.5 my-2 relative flex items-center">
        <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="w-full h-full">
            <path d="M 0 5 Q 50 1 100 5 Q 50 9 0 5" fill="#7a200d" />
        </svg>
    </div>
);
