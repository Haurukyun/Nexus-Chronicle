import React from 'react';
import { useTheme } from '../../theme/useTheme';

export interface ThemeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'panel' | 'highlight';
  ornate?: boolean;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({
  variant = 'base',
  ornate = false,
  className = '',
  children,
  ...props
}) => {
  const { t } = useTheme();

  const variantClass = t.card[variant] || t.card.base;
  const isOrnate = ornate && t.card.ornateType === 'royal-filigree';

  return (
    <div
      {...props}
      className={`relative transition-all ${variantClass} ${className}`}
    >
      {/* Decorative Ornate Corners for Royal Codex / Manuscripts */}
      {isOrnate && (
        <>
          <div className="absolute inset-1 border border-[#c8a96e]/30 pointer-events-none rounded-[inherit]" />
          <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-[#855325] pointer-events-none" />
          <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-[#855325] pointer-events-none" />
          <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-[#855325] pointer-events-none" />
          <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-[#855325] pointer-events-none" />
        </>
      )}

      {children}
    </div>
  );
};
