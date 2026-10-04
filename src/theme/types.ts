import { ThemeMode } from '../types';

export type OrnateDecorationType = 'royal-filigree' | 'clean-border' | 'tech-corners' | 'none';

/** Controls which structural layout the app renders.
 *  - 'studio'     — Dark dashboard / glassmorphic (Sovereign Scribe default)
 *  - 'wiki'       — Light 2-column encyclopedia reader layout
 *  - 'manuscript' — Illuminated book frame with wood-grain outer shell (Royal Codex)
 */
export type LayoutMode = 'studio' | 'wiki' | 'manuscript';

export interface ThemeDefinition {
  id: ThemeMode | string;
  name: string;
  description: string;
  /** Drives structural geometry decisions (sidebar width, reader vs. studio shell, book framing). */
  layoutMode: LayoutMode;
  
  // Typography
  typography: {
    fontFamily: string;
    heading: string;
    body: string;
    subtext: string;
    quote: string;
    mono: string;
  };

  // Layout & Global Surfaces
  layout: {
    appBg: string;
    pageBg: string;
    sidebarBg: string;
    sidebarBorder: string;
    headerBg: string;
    bookFramePadding?: string; // Optional wrapper padding (e.g. Royal Codex book margins)
    bookFrameShadow?: string;
  };

  // Color Tokens
  colors: {
    textHeading: string;
    textBody: string;
    textMuted: string;
    textAccent: string;
    accentHex: string; // Raw hex for SVG, charts, canvas
    accentBg: string;
    borderDefault: string;
    borderAccent: string;
    divider: string;
  };

  // Surface Cards
  card: {
    base: string;
    panel: string;
    highlight: string;
    ornateType?: OrnateDecorationType;
  };

  // Interactive Buttons
  button: {
    primary: string;
    secondary: string;
    accent: string;
    danger: string;
    ghost: string;
    toggleActive: string;
    toggleInactive: string;
    tabActive: string;
    tabInactive: string;
  };

  // Form Controls
  input: {
    base: string;
    focus: string;
    selectDropdown: string;
  };

  // Badges & Pills
  badge: {
    primary: string;
    subtle: string;
  };
}
