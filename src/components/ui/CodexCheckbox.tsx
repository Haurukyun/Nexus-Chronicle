import React from 'react';
import { Check } from 'lucide-react';
import { useTheme } from '../../theme';

interface CodexCheckboxProps {
    checked: boolean;
    onChange?: (checked: boolean) => void;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    disabled?: boolean;
    title?: string;
}

export const CodexCheckbox: React.FC<CodexCheckboxProps> = ({
    checked,
    onChange,
    size = 'md',
    className = '',
    disabled = false,
    title
}) => {
    const { themeId, layoutMode } = useTheme();

    const sizeClasses = {
        sm: 'w-3 h-3 rounded-[2.5px]',
        md: 'w-3.5 h-3.5 rounded-[3px]',
        lg: 'w-4 h-4 rounded-[4px]',
    }[size];

    const iconSizes = {
        sm: 9,
        md: 11,
        lg: 13,
    }[size];

    let themeStyle = '';

    if (checked) {
        if (themeId === 'royal-codex') {
            themeStyle = 'bg-[#611620] border-[#c8a96e] text-[#fef08a] shadow-[0_0_8px_rgba(200,169,110,0.4)]';
        } else if (themeId === 'grand-voyager') {
            themeStyle = 'bg-[#0f766e] border-[#2dd4bf] text-[#f5ebd7] shadow-[0_0_8px_rgba(45,212,191,0.4)]';
        } else if (layoutMode === 'wiki') {
            themeStyle = 'bg-[#8b0000] border-[#500000] text-[#fbf8ef] shadow-sm';
        } else {
            // sovereign (default dark)
            themeStyle = 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.3)]';
        }
    } else {
        if (themeId === 'royal-codex') {
            themeStyle = 'border-[#c8a96e]/45 bg-[#140b06] hover:border-[#c8a96e] hover:bg-[#1f1109] shadow-[inset_0_1px_2px_rgba(0,0,0,0.7)]';
        } else if (themeId === 'grand-voyager') {
            themeStyle = 'border-[#2dd4bf]/35 bg-[#061416] hover:border-[#2dd4bf] hover:bg-[#0c2225] shadow-[inset_0_1px_2px_rgba(0,0,0,0.7)]';
        } else if (layoutMode === 'wiki') {
            themeStyle = 'border-[#b8a48b] bg-[#fbf8ef] hover:border-[#8b0000] hover:bg-white shadow-sm';
        } else {
            // sovereign
            themeStyle = 'border-slate-700 bg-slate-900/80 hover:border-slate-500 hover:bg-slate-800 shadow-inner';
        }
    }

    const element = (
        <span
            className={`border flex items-center justify-center shrink-0 transition-all select-none pointer-events-none ${sizeClasses} ${themeStyle} ${className}`}
            title={title}
        >
            {checked && <Check size={iconSizes} strokeWidth={3} className="shrink-0" />}
        </span>
    );

    if (onChange) {
        return (
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) onChange(!checked);
                }}
                disabled={disabled}
                className="inline-flex items-center justify-center cursor-pointer p-0.5 focus:outline-none"
                title={title}
            >
                {element}
            </button>
        );
    }

    return element;
};
