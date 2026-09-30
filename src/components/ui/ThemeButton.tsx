import React from 'react';
import { useTheme } from '../../theme/useTheme';

export interface ThemeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.FC<{ size?: number; className?: string }>;
  iconRight?: React.FC<{ size?: number; className?: string }>;
}

export const ThemeButton: React.FC<ThemeButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const { t } = useTheme();

  const variantClass = t.button[variant] || t.button.primary;

  const sizeClasses = {
    xs: 'px-2.5 py-1 text-[10px] rounded-lg gap-1.5',
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-2',
    md: 'px-5 py-2.5 text-xs rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-sm rounded-2xl gap-2.5',
  }[size];

  const iconSizes = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
  }[size];

  return (
    <button
      {...props}
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all ${sizeClasses} ${variantClass} ${
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
    >
      {Icon && <Icon size={iconSizes} className="shrink-0" />}
      {children}
      {IconRight && <IconRight size={iconSizes} className="shrink-0" />}
    </button>
  );
};
