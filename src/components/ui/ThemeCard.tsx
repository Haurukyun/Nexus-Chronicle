import React from 'react';
import { useTheme } from '../../theme/useTheme';
import { VectorFiligreeCorner } from './VectorFiligreeCorner';

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
          <VectorFiligreeCorner position="top-left"     size={10} color="#855325" className="absolute top-1.5 left-1.5"     />
          <VectorFiligreeCorner position="top-right"    size={10} color="#855325" className="absolute top-1.5 right-1.5"    />
          <VectorFiligreeCorner position="bottom-left"  size={10} color="#855325" className="absolute bottom-1.5 left-1.5"  />
          <VectorFiligreeCorner position="bottom-right" size={10} color="#855325" className="absolute bottom-1.5 right-1.5" />
        </>
      )}

      {children}
    </div>
  );
};
