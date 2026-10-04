import { useWorldStore } from '../store/useWorldStore';
import { getTheme } from './themeRegistry';
import { ThemeDefinition, LayoutMode } from './types';

export interface UseThemeResult {
  themeId: string;
  t: ThemeDefinition;
  /** Structural geometry mode — use for layout decisions (sidebar width, reader vs. studio shell, book framing).
   *  'studio' = dark glassmorphic dashboard  |  'wiki' = light encyclopedia reader  |  'manuscript' = illuminated book frame */
  layoutMode: LayoutMode;
  /** @deprecated Prefer `layoutMode === 'wiki'` for layout decisions; keep for visual material checks. */
  isWikiMode: boolean;
  isRoyal: boolean;
  isSovereign: boolean;
}

/**
 * Universal theme hook for components.
 * Returns active theme contract `t`, the structural `layoutMode`, and convenient boolean flags.
 * 
 * Layout decisions → use `layoutMode`
 * Visual material decisions (colors, glassmorphism) → use `t.*` tokens
 */
export function useTheme(): UseThemeResult {
  const theme = useWorldStore((s) => s.theme);
  const isWikiModeStore = useWorldStore((s) => s.isWikiMode);
  const t = getTheme(theme);

  return {
    themeId: theme,
    t,
    layoutMode: t.layoutMode,
    isWikiMode: theme === 'wiki' || isWikiModeStore,
    isRoyal: theme === 'royal-codex',
    isSovereign: theme === 'sovereign',
  };
}
