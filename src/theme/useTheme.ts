import { useWorldStore } from '../store/useWorldStore';
import { getTheme } from './themeRegistry';
import { ThemeDefinition } from './types';

export interface UseThemeResult {
  themeId: string;
  t: ThemeDefinition;
  isRoyal: boolean;
  isWikiMode: boolean;
  isSovereign: boolean;
}

/**
 * Universal theme hook for components.
 * Returns active theme contract `t` plus convenient boolean flags.
 */
export function useTheme(): UseThemeResult {
  const theme = useWorldStore((s) => s.theme);
  const isWikiModeStore = useWorldStore((s) => s.isWikiMode);
  const t = getTheme(theme);

  return {
    themeId: theme,
    t,
    isRoyal: theme === 'royal-codex',
    isWikiMode: theme === 'wiki' || isWikiModeStore,
    isSovereign: theme === 'sovereign',
  };
}
