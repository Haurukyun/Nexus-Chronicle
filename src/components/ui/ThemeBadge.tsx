import React from 'react';
import { useTheme } from '../../theme/useTheme';

export interface ThemeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'subtle';
}

export const ThemeBadge: React.FC<ThemeBadgeProps> = ({
  variant = 'subtle',
  className = '',
  children,
  ...props
}) => {
  const { t } = useTheme();

  const variantClass = t.badge[variant] || t.badge.subtle;

  return (
    <span
      {...props}
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] tracking-wider transition-all ${variantClass} ${className}`}
    >
      {children}
    </span>
  );
};
