import { ThemeDefinition } from './types';
import { ThemeMode } from '../types';

export const sovereignTheme: ThemeDefinition = {
  id: 'sovereign',
  name: 'Sovereign Scribe',
  description: 'Dark Obsidian & Warm Gold — sleek modern high fantasy with glassmorphism',
  layoutMode: 'studio',
  typography: {
    fontFamily: 'font-sans',
    heading: 'font-sans font-black uppercase tracking-tight',
    body: 'font-sans text-slate-300',
    subtext: 'font-sans text-xs uppercase tracking-widest text-slate-500',
    quote: 'font-serif italic text-slate-400',
    mono: 'font-mono text-xs',
  },
  layout: {
    appBg: 'bg-[#070b14]',
    pageBg: 'bg-gradient-to-br from-transparent to-black/30',
    sidebarBg: 'bg-[#0f172a]/80 backdrop-blur-md',
    sidebarBorder: 'border-slate-800/60',
    headerBg: 'bg-slate-900/60 backdrop-blur-md border-b border-slate-800',
  },
  colors: {
    textHeading: 'text-white',
    textBody: 'text-slate-300',
    textMuted: 'text-slate-500',
    textAccent: 'text-[#fef08a]',
    accentHex: '#fef08a',
    accentBg: 'bg-[#fef08a]',
    borderDefault: 'border-slate-800',
    borderAccent: 'border-yellow-500/50',
    divider: 'bg-slate-800',
  },
  card: {
    base: 'bg-slate-900/50 border border-slate-800 shadow-2xl backdrop-blur-sm text-slate-200',
    panel: 'bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md text-slate-100',
    highlight: 'bg-yellow-400/10 border border-yellow-400/50 ring-1 ring-yellow-400/50 shadow-lg',
    ornateType: 'none',
  },
  button: {
    primary: 'bg-[#fef08a] text-black font-black uppercase tracking-wider hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 active:scale-95 transition-all',
    secondary: 'bg-white/10 text-white font-bold uppercase tracking-wider hover:bg-white/20 border border-white/10 active:scale-95 transition-all',
    accent: 'bg-amber-500/20 text-yellow-300 border border-yellow-500/40 hover:bg-amber-500/30 active:scale-95 transition-all',
    danger: 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 active:scale-95 transition-all',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all',
    toggleActive: 'bg-[#fef08a] text-black shadow-md font-bold',
    toggleInactive: 'opacity-50 hover:opacity-100 text-slate-400',
    tabActive: 'bg-[#fef08a] text-black border-[#fef08a] shadow-md font-black',
    tabInactive: 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-200',
  },
  input: {
    base: 'bg-black/30 border border-slate-700 text-white placeholder-slate-500 rounded-xl outline-none transition-all',
    focus: 'focus:border-[#fef08a] focus:ring-1 focus:ring-[#fef08a]/50',
    selectDropdown: 'bg-slate-900 border border-slate-700 text-white shadow-2xl',
  },
  badge: {
    primary: 'bg-yellow-400 text-black font-bold uppercase',
    subtle: 'bg-[#fef08a]/10 text-[#fef08a] border border-[#fef08a]/20 font-bold',
  },
};

export const wikiTheme: ThemeDefinition = {
  id: 'wiki',
  name: 'Wiki Mode',
  description: 'Classic Parchment & Burgundy — scholarly encyclopedia aesthetics',
  layoutMode: 'wiki',
  typography: {
    fontFamily: 'font-serif',
    heading: 'font-serif font-black uppercase tracking-tight',
    body: 'font-sans text-[#1a1a1a]',
    subtext: 'font-serif italic text-xs text-[#705030]',
    quote: 'font-serif italic text-[#3d2b1f]',
    mono: 'font-mono text-xs',
  },
  layout: {
    appBg: 'bg-[#fdfcf0]',
    pageBg: 'bg-[#fdfcf0]',
    sidebarBg: 'bg-[#fdf6e3]',
    sidebarBorder: 'border-[#d4c8af]',
    headerBg: 'bg-[#f5e6d3] border-b border-[#d4c8af]',
  },
  colors: {
    textHeading: 'text-[#b91c1c]',
    textBody: 'text-[#1a1a1a]',
    textMuted: 'text-[#854d0e]',
    textAccent: 'text-[#b91c1c]',
    accentHex: '#b91c1c',
    accentBg: 'bg-[#b91c1c]',
    borderDefault: 'border-[#d4c8af]',
    borderAccent: 'border-[#b91c1c]',
    divider: 'bg-[#d4c8af]',
  },
  card: {
    base: 'bg-white border border-[#d4c8af] rounded-2xl shadow-sm text-[#1a1a1a]',
    panel: 'bg-[#fbf6ea] border border-[#d4c8af] shadow-xl text-[#2b1810]',
    highlight: 'bg-[#b91c1c]/10 border border-[#b91c1c] ring-1 ring-[#b91c1c]',
    ornateType: 'clean-border',
  },
  button: {
    primary: 'bg-[#b91c1c] text-white font-black uppercase tracking-wider hover:bg-[#991b1b] shadow-md active:scale-95 transition-all',
    secondary: 'bg-[#f0e8d8] text-[#2b1810] font-bold uppercase tracking-wider hover:bg-[#e4d6bf] border border-[#d4c8af] active:scale-95 transition-all',
    accent: 'bg-[#b91c1c]/15 text-[#b91c1c] border border-[#b91c1c]/40 hover:bg-[#b91c1c]/25 active:scale-95 transition-all',
    danger: 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200 active:scale-95 transition-all',
    ghost: 'text-[#705030] hover:text-[#1a1a1a] hover:bg-black/5 rounded-xl transition-all',
    toggleActive: 'bg-[#b91c1c] text-white shadow-sm font-bold',
    toggleInactive: 'opacity-60 hover:opacity-100 text-[#705030]',
    tabActive: 'bg-[#b91c1c] text-white border-[#b91c1c] shadow-md font-bold',
    tabInactive: 'bg-white border-[#d4c8af] text-slate-600 hover:bg-slate-100',
  },
  input: {
    base: 'bg-white border border-[#d4c8af] text-[#2b1810] placeholder-[#b0a090] rounded-xl outline-none transition-all',
    focus: 'focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c]/40',
    selectDropdown: 'bg-[#fdfcf0] border border-[#d4c8af] text-[#2b1810] shadow-xl',
  },
  badge: {
    primary: 'bg-[#b91c1c] text-white font-bold uppercase',
    subtle: 'bg-[#b91c1c]/10 text-[#b91c1c] border border-[#b91c1c]/30 font-bold',
  },
};

export const royalCodexTheme: ThemeDefinition = {
  id: 'royal-codex',
  name: 'Royal Codex',
  description: 'Illuminated Manuscript & Crimson Gold — fantasy parchment with ornate filigree & warm ivory highlights',
  layoutMode: 'manuscript',
  typography: {
    fontFamily: 'font-serif',
    heading: 'font-serif font-black uppercase tracking-tight',
    body: 'font-serif text-[#2b1810]',
    subtext: 'font-serif italic text-xs text-[#70121e]/80',
    quote: 'font-serif italic text-[#451a03]',
    mono: 'font-mono text-xs',
  },
  layout: {
    appBg: 'bg-[#3b2b20] bg-[url("https://www.transparenttextures.com/patterns/wood-pattern.png")] bg-blend-multiply shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]',
    pageBg: 'bg-[#eee2cb]',
    sidebarBg: 'bg-[#181410] border-r-2 border-[#110e0b] shadow-[5px_0_15px_rgba(0,0,0,0.8)]',
    sidebarBorder: 'border-[#c8a96e]/20',
    headerBg: 'bg-[#2a170d] border-b border-[#c8a96e]/30',
    bookFramePadding: 'p-4 md:p-8 lg:p-12',
    bookFrameShadow: 'shadow-[0_40px_100px_rgba(0,0,0,0.95)]',
  },
  colors: {
    textHeading: 'text-[#3d0a10]', // Deep dark crimson/brown - ultra readable on cream parchment
    textBody: 'text-[#2b1810]',
    textMuted: 'text-[#5a3825]',
    textAccent: 'text-[#70121e]', // Rich deep crimson
    accentHex: '#70121e',
    accentBg: 'bg-[#70121e]',
    borderDefault: 'border-[#c8a96e]/50', // Warm antique brass/gold
    borderAccent: 'border-[#70121e]',
    divider: 'bg-[#c8a96e]/40',
  },
  card: {
    base: 'bg-[#f5ead0] border-2 border-[#c8a96e]/50 rounded-2xl shadow-md text-[#2b1810]',
    panel: 'bg-[#f5ead0] border-2 border-[#c8a96e] shadow-2xl text-[#2b1810]',
    highlight: 'bg-[#70121e]/15 border-2 border-[#70121e] ring-1 ring-[#70121e]',
    ornateType: 'royal-filigree',
  },
  button: {
    // Buttons in Royal Codex use deep crimson background with crisp warm ivory text (NO yellow)
    primary: 'bg-[#70121e] text-[#fff8e7] font-serif font-black uppercase tracking-wider hover:bg-[#881337] border border-[#c8a96e] shadow-md active:scale-95 transition-all',
    secondary: 'bg-[#e2d2b4] text-[#3d0a10] font-serif font-bold uppercase tracking-wider hover:bg-[#d4be99] border border-[#c8a96e]/60 active:scale-95 transition-all',
    accent: 'bg-[#70121e]/20 text-[#70121e] font-serif font-bold border border-[#70121e]/40 hover:bg-[#70121e]/30 active:scale-95 transition-all',
    danger: 'bg-[#5c0e18] text-[#fff8e7] font-serif font-bold border border-[#c8a96e]/60 hover:bg-[#751320] active:scale-95 transition-all',
    ghost: 'text-[#70121e] hover:bg-[#70121e]/10 rounded-xl transition-all',
    toggleActive: 'bg-[#70121e] text-[#fff8e7] shadow-sm font-serif font-bold',
    toggleInactive: 'opacity-60 hover:opacity-100 text-[#451a03]',
    tabActive: 'bg-[#70121e] text-[#fff8e7] border-2 border-[#c8a96e] shadow-lg font-serif font-bold',
    tabInactive: 'bg-[#4a2e1d] border border-[#c8a96e]/30 text-[#c8a96e] hover:bg-[#523522]',
  },
  input: {
    base: 'bg-[#fcf5e9] border border-[#c8a96e]/50 text-[#2b1810] placeholder-[#a08a70] rounded-xl outline-none transition-all',
    focus: 'focus:border-[#70121e] focus:ring-1 focus:ring-[#70121e]/40',
    selectDropdown: 'bg-[#f5ead0] border-2 border-[#c8a96e] text-[#2b1810] shadow-2xl',
  },
  badge: {
    primary: 'bg-[#70121e] text-[#fff8e7] font-serif font-bold uppercase tracking-wider border border-[#c8a96e]',
    subtle: 'bg-[#70121e]/10 text-[#70121e] border border-[#70121e]/30 font-serif font-bold',
  },
};

export const grandVoyagerTheme: ThemeDefinition = {
  id: 'grand-voyager',
  name: 'Grand Voyager',
  description: 'Tropical High Seas & Teak Timber — sun-drenched lagoon turquoise, weathered galleon oak & nautical brass',
  layoutMode: 'studio',
  typography: {
    fontFamily: 'font-sans',
    heading: 'font-serif font-black uppercase tracking-tight',
    body: 'font-sans text-slate-100',
    subtext: 'font-serif italic text-xs text-[#38bdf8]/80',
    quote: 'font-serif italic text-[#f6d365]',
    mono: 'font-mono text-xs',
  },
  layout: {
    appBg: 'bg-gradient-to-br from-[#041421] via-[#082236] to-[#020b12] text-slate-100',
    pageBg: 'bg-gradient-to-b from-[#061926]/40 via-[#071d2e]/30 to-[#020c14]/80',
    sidebarBg: 'bg-[#140e0a]/95 border-r-2 border-[#3d2617]/80 shadow-[5px_0_25px_rgba(0,0,0,0.85)] backdrop-blur-md',
    sidebarBorder: 'border-[#422919]/70',
    headerBg: 'bg-[#071927]/90 backdrop-blur-md border-b border-[#1b3d54]/70',
  },
  colors: {
    textHeading: 'text-[#f0f9ff]', // Crisp ocean sunlight white
    textBody: 'text-[#cbd5e1]',
    textMuted: 'text-[#7096b0]',
    textAccent: 'text-[#38bdf8]', // Tropical turquoise / seafoam
    accentHex: '#0ea5e9',
    accentBg: 'bg-[#0ea5e9]',
    borderDefault: 'border-[#1b3d54]/70',
    borderAccent: 'border-[#38bdf8]/80',
    divider: 'bg-[#1b3d54]/50',
  },
  card: {
    base: 'bg-[#0a2033]/70 border border-[#1d4766]/70 rounded-2xl shadow-xl backdrop-blur-md text-slate-100 hover:border-[#38bdf8]/50 transition-all',
    panel: 'bg-[#0c253b]/95 border border-[#2b5d80]/80 rounded-2xl shadow-2xl backdrop-blur-lg text-slate-100',
    highlight: 'bg-[#0284c7]/15 border border-[#38bdf8]/70 ring-1 ring-[#38bdf8]/50 shadow-[0_0_25px_rgba(14,165,233,0.3)]',
    ornateType: 'clean-border',
  },
  button: {
    // Warm doubloon gold primary with rich dark navy text
    primary: 'bg-gradient-to-r from-[#d4af37] via-[#f59e0b] to-[#eab308] text-[#051420] font-serif font-black uppercase tracking-wider hover:from-[#c5a028] hover:to-[#d97706] shadow-lg shadow-amber-500/25 active:scale-95 transition-all border border-[#fef08a]/60',
    // Polished galleon teak wood with brass border
    secondary: 'bg-[#1c130d]/90 text-[#f5ebd7] font-serif font-bold uppercase tracking-wider hover:bg-[#2b1c13] border border-[#5c3e27] shadow-md active:scale-95 transition-all',
    // Ocean turquoise accent button
    accent: 'bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/50 hover:bg-[#0284c7]/35 active:scale-95 transition-all',
    danger: 'bg-red-500/20 text-rose-300 border border-red-500/40 hover:bg-red-500/30 active:scale-95 transition-all',
    ghost: 'text-[#7fa5be] hover:text-[#38bdf8] hover:bg-[#0284c7]/10 rounded-xl transition-all',
    toggleActive: 'bg-gradient-to-r from-[#0284c7] to-[#0d9488] text-white shadow-md font-bold',
    toggleInactive: 'opacity-50 hover:opacity-100 text-[#7fa5be]',
    tabActive: 'bg-[#0284c7] text-white border-b-2 border-[#38bdf8] shadow-md shadow-sky-500/20 font-bold',
    tabInactive: 'bg-[#061826]/70 border-[#1b3d54]/50 text-[#7fa5be] hover:text-slate-100 hover:bg-[#0a2336]',
  },
  input: {
    base: 'bg-[#061724]/80 border border-[#1b3d54] text-slate-100 placeholder-[#4c738c] rounded-xl outline-none transition-all',
    focus: 'focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/50',
    selectDropdown: 'bg-[#091f30] border border-[#234d6b] text-slate-100 shadow-2xl',
  },
  badge: {
    primary: 'bg-[#0284c7] text-white font-bold uppercase tracking-wider border border-[#38bdf8]/40 shadow-sm',
    subtle: 'bg-[#0284c7]/15 text-[#38bdf8] border border-[#0284c7]/30 font-bold',
  },
};

// Global Themes Map — Easily add or register new themes anytime!
export const THEME_REGISTRY: Record<string, ThemeDefinition> = {
  'sovereign': sovereignTheme,
  'wiki': wikiTheme,
  'royal-codex': royalCodexTheme,
  'grand-voyager': grandVoyagerTheme,
};

/**
 * Register a completely custom theme dynamically at runtime or in config
 */
export function registerTheme(customTheme: ThemeDefinition) {
  THEME_REGISTRY[customTheme.id] = customTheme;
}

/**
 * Retrieve a theme definition by ID with sovereign fallback
 */
export function getTheme(id?: string): ThemeDefinition {
  if (!id) return sovereignTheme;
  return THEME_REGISTRY[id] || sovereignTheme;
}
