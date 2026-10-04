import { useWorldStore } from '../store/useWorldStore';
import { getTheme } from './themeRegistry';
import { ThemeDefinition, LayoutMode } from './types';

export interface UseThemeResult {
  /** The raw theme identifier string, e.g. 'wiki', 'royal-codex', 'sovereign', 'grand-voyager'. */
  themeId: string;
  /** Full theme token contract — use `t.*` for all visual/color/typography decisions. */
  t: ThemeDefinition;
  /** Structural geometry mode — use for layout decisions (sidebar width, reader vs. studio shell, book framing).
   *  'studio' = dark glassmorphic dashboard  |  'wiki' = light encyclopedia reader  |  'manuscript' = illuminated book frame */
  layoutMode: LayoutMode;
}

/**
 * Universal theme hook for components.
 *
 * Usage:
 *   const { themeId, t, layoutMode } = useTheme();
 *
 *   Layout/shell decisions  → layoutMode === 'wiki' | 'manuscript' | 'studio'
 *   Per-theme identity      → themeId === 'royal-codex' | 'sovereign' | 'wiki' | 'grand-voyager'
 *   Visual tokens           → t.colors.textAccent, t.card.base, t.button.primary, etc.
 */
export function useTheme(): UseThemeResult {
  const themeId = useWorldStore((s) => s.theme);
  const t = getTheme(themeId);

  return {
    themeId,
    t,
    layoutMode: t.layoutMode,
  };
}
