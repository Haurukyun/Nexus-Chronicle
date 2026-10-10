# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-10-05T16:41:04.931Z
> Files: 145 tracked | Anatomy hits: 0 | Misses: 0

> Project structure index. Auto-maintained by OpenWolf hooks and daemon.
> Run `openwolf scan` to generate, or wait for the first Claude Code session.
> Status: Pending initial scan

## ./

- `.eslintrc.js` — ESLint configuration (~20 tok)
- `.gitattributes` — Git attributes (~21 tok)
- `.gitignore` — Git ignore rules (~347 tok)
- `.prettierrc.js` (~43 tok)
- `AGENTS.md` — OpenWolf (~75 tok)
- `assemble.py` — Exports EntityType (~1319 tok)
- `CLAUDE.md` — OpenWolf (~99 tok)
- `GEMINI.md` — OpenWolf (~75 tok)
- `generate_components.py` — generate_editor_components, get_category (~2640 tok)
- `generate_viewers.py` — generate_viewer_components, get_category (~2296 tok)
- `index.html` — Chronicle Codex - Worldbuilding Suite (~319 tok)
- `metadata.json` (~77 tok)
- `package.json` — Node.js package manifest (~478 tok)
- `postcss.config.js` — PostCSS configuration (~17 tok)
- `README.md` — Project documentation (~1 tok)
- `tailwind.config.js` — Tailwind CSS configuration (~53 tok)
- `tsconfig.json` — TypeScript configuration (~188 tok)
- `vite.config.ts` — Vite build configuration (~393 tok)

## src-tauri/

- `.gitignore` — Git ignore rules (~24 tok)
- `build.rs` (~12 tok)
- `Cargo.toml` — Rust package manifest (~213 tok)
- `tauri.conf.json` (~376 tok)

## src-tauri/capabilities/

- `default.json` (~216 tok)

## src-tauri/icons/

- `icon.icns` (~69984 tok)

## src-tauri/src/

- `lib.rs` — Returns the platform-specific app data directory as an absolute path string. (~366 tok)
- `main.rs` — Prevents additional console window on Windows in release, DO NOT REMOVE!! (~53 tok)

## src/

- `App.tsx` — App — renders chart — uses useEffect, useMemo, useState (~5511 tok)
- `constants.ts` — Exports TYPE_LABELS, HIERARCHY_CONFIG (~385 tok)
- `index.css` — Styles: 32 rules (~816 tok)
- `index.tsx` — rootElement (~105 tok)
- `types.ts` — Exports EntityType, WorldPhase, ThemeMode, MapConnection + 6 more (~14684 tok)

## src/components/editor/

- `EditorGroup.tsx` — EditorGroup (~586 tok)
- `EntityEditor.tsx` — EntityEditor — renders form (~3277 tok)
- `GroupRoleGroup.tsx` — GroupRoleGroup (~521 tok)
- `index.ts` (~28 tok)

## src/components/editor/specifics/

- `AbilitySpecifics.tsx` — AbilitySpecifics — renders form (~3029 tok)
- `ChapterSpecifics.tsx` — ChapterSpecifics — renders form (~524 tok)
- `CharacterSpecifics.tsx` — CharacterSpecifics — renders form (~4520 tok)
- `ConditionSpecifics.tsx` — ConditionSpecifics — renders form (~3610 tok)
- `CultureSpecifics.tsx` — CultureSpecifics — renders form (~2380 tok)
- `CurrencySpecifics.tsx` — CurrencySpecifics — renders form (~1313 tok)
- `EntitySpecificsRegistry.tsx` — EntitySpecificsRegistry (~1160 tok)
- `EventSpecifics.tsx` — EventSpecifics — renders form (~2070 tok)
- `index.ts` (~214 tok)
- `ItemSpecifics.tsx` — ItemSpecifics — renders form (~2995 tok)
- `LanguageSpecifics.tsx` — LanguageSpecifics — renders form (~1722 tok)
- `LocationSpecifics.tsx` — LocationSpecifics — renders form, chart, map (~6172 tok)
- `MagicSpecifics.tsx` — MagicSpecifics — renders form (~3862 tok)
- `MythSpecifics.tsx` — MythSpecifics (~2043 tok)
- `NoteSpecifics.tsx` — NoteSpecifics — renders form (~2147 tok)
- `OccupationSpecifics.tsx` — OccupationSpecifics — renders form (~2453 tok)
- `OrganizationSpecifics.tsx` — OrganizationSpecifics — renders form (~3437 tok)
- `PoliticalGroupSpecifics.tsx` — PoliticalGroupSpecifics — renders form (~3788 tok)
- `ReligionSpecifics.tsx` — ReligionSpecifics — renders form (~3758 tok)
- `ResourceSpecifics.tsx` — ResourceSpecifics — renders form (~3090 tok)
- `SpeciesSpecifics.tsx` — SpeciesSpecifics — renders form (~3341 tok)
- `TechSpecifics.tsx` — TechSpecifics — renders form (~3814 tok)

## src/components/layout/

- `RealmSwitcher.tsx` — PHASE_COLORS — uses useState, useEffect, useMemo (~5000 tok)
- `Sidebar.tsx` — Safely resolves the parent ID of an entity. (~10645 tok)

## src/components/ui/

- `AssetImageUploader.tsx` — AssetImageUploader — uses useState (~3627 tok)
- `DeleteRealmModal.tsx` — DeleteRealmModal — uses useEffect (~1631 tok)
- `EmeraldGem.tsx` — EmeraldGem (~943 tok)
- `ErrorBoundary.tsx` — Exports ErrorBoundary (~553 tok)
- `ExpandedImageModal.tsx` — ExpandedImageModal — uses useCallback, useEffect (~1130 tok)
- `FieldRow.tsx` — FieldRow (~330 tok)
- `FormInput.tsx` — FormInput — uses useState, useEffect (~1017 tok)
- `FormToggle.tsx` — FormToggle (~410 tok)
- `ImageCropModal.tsx` — ImageCropModal — uses useRef, useCallback, useEffect (~5446 tok)
- `index.ts` (~181 tok)
- `KeybindsModal.tsx` — KeybindsModal — renders chart (~3346 tok)
- `LinksDisplay.tsx` — LinksDisplay (~790 tok)
- `MarkdownEditor.tsx` — MarkdownEditor — uses useState, useCallback, useEffect (~3646 tok)
- `MarkdownRenderer.tsx` — Extra class names on the outer wrapper (~919 tok)
- `NewRealmModal.tsx` — MAP_PRESETS — renders form, chart — uses useState (~4008 tok)
- `NexusBeamModal.tsx` — NexusBeamModal — uses useState, useEffect (~7284 tok)
- `NexusImage.tsx` — NexusImage — uses useEffect (~777 tok)
- `RadarChart.tsx` — RadarChart — renders chart (~1212 tok)
- `SmartSelect.tsx` — SmartSelect — uses useState, useEffect (~1433 tok)
- `TaperedDivider.tsx` — TaperedDivider (~92 tok)
- `ThemeBadge.tsx` — ThemeBadge (~181 tok)
- `ThemeButton.tsx` — ThemeButton (~417 tok)
- `ThemeCard.tsx` — ThemeCard (~407 tok)
- `ThemeSwitcher.tsx` — THEME_OPTIONS — uses useState, useEffect (~1779 tok)
- `TropicalSceneBackground.tsx` — TropicalSceneBackground — Grand Voyager theme (~4281 tok)
- `WikiInfoboxRow.tsx` — WikiInfoboxRow (~144 tok)
- `WikiRows.tsx` — WikiStatRow (~274 tok)
- `WikiStatRow.tsx` — WikiStatRow (~138 tok)
- `WipeRealmModal.tsx` — WipeRealmModal — uses useEffect (~1484 tok)

## src/components/viewer/

- `CharacterStatBlock.tsx` — CharacterStatBlock — renders chart (~6160 tok)
- `EntityViewer.tsx` — EntityViewer — uses useMemo (~4269 tok)
- `index.ts` (~39 tok)
- `ViewerHeaders.tsx` — Two-click delete confirm. First click shows "Sure?", second confirms, blur cancels. (~2003 tok)
- `ViewerSectionCard.tsx` — ViewerSectionCard (~1205 tok)
- `WikiInfobox.tsx` — WikiInfobox — renders table, chart (~2855 tok)

## src/components/viewer/specifics/

- `AbilitySpecificsViewer.tsx` — AbilitySpecificsViewer (~2450 tok)
- `ChapterSpecificsViewer.tsx` — ChapterSpecificsViewer (~350 tok)
- `CharacterSpecificsViewer.tsx` — CharacterSpecificsViewer (~4474 tok)
- `ConditionSpecificsViewer.tsx` — ConditionSpecificsViewer (~2721 tok)
- `CultureSpecificsViewer.tsx` — CultureSpecificsViewer (~2043 tok)
- `CurrencySpecificsViewer.tsx` — CurrencySpecificsViewer (~990 tok)
- `EntitySpecificsViewerRegistry.tsx` — EntitySpecificsViewerRegistry (~1079 tok)
- `EventSpecificsViewer.tsx` — EventSpecificsViewer (~1940 tok)
- `index.ts` (~248 tok)
- `ItemSpecificsViewer.tsx` — ItemSpecificsViewer (~2561 tok)
- `LanguageSpecificsViewer.tsx` — LanguageSpecificsViewer (~1195 tok)
- `LocationSpecificsViewer.tsx` — LocationSpecificsViewer — renders map (~1856 tok)
- `MagicSpecificsViewer.tsx` — MagicSpecificsViewer (~3102 tok)
- `MythSpecificsViewer.tsx` — MythSpecificsViewer (~1738 tok)
- `NoteSpecificsViewer.tsx` — NoteSpecificsViewer (~1868 tok)
- `OccupationSpecificsViewer.tsx` — OccupationSpecificsViewer (~2064 tok)
- `OrganizationSpecificsViewer.tsx` — OrganizationSpecificsViewer (~3013 tok)
- `PoliticalGroupSpecificsViewer.tsx` — PoliticalGroupSpecificsViewer (~3057 tok)
- `ReligionSpecificsViewer.tsx` — ReligionSpecificsViewer (~3034 tok)
- `ResourceSpecificsViewer.tsx` — ResourceSpecificsViewer (~2562 tok)
- `SpeciesSpecificsViewer.tsx` — SpeciesSpecificsViewer (~2710 tok)
- `TechSpecificsViewer.tsx` — TechSpecificsViewer (~3075 tok)

## src/store/

- `useWorldStore.ts` — Exports DEFAULT_REALM_MAP, useWorldStore (~20130 tok)

## src/theme/

- `index.ts` (~25 tok)
- `themeContrast.test.ts` — Calculates WCAG 2.1 relative luminance for an sRGB hex color. (~707 tok)
- `themeRegistry.ts` — Exports sovereignTheme, wikiTheme, royalCodexTheme, grandVoyagerTheme (~3909 tok)
- `types.ts` — Controls which structural layout the app renders. (~571 tok)
- `useTheme.ts` — The raw theme identifier string, e.g. 'wiki', 'royal-codex', 'sovereign', 'grand-voyager'. (~363 tok)

## src/utils/

- `assetStore.test.ts` — Declares bytesA (~982 tok)
- `assetStore.ts` — Nexus Chronicle - Content-Addressable Storage (CAS) IndexedDB Asset Engine (~3886 tok)
- `backlinkUtils.ts` — Exports CategorizedBacklinks, getCategorizedBacklinks (~2582 tok)
- `bidirectionalSync.test.ts` — Declares prevChar (~806 tok)
- `bidirectionalSync.ts` — Exports RelationPairDef, RELATION_PAIRS (~9850 tok)
- `graphSqliteVerification.test.ts` — Declares charA (~398 tok)
- `graphSqliteVerification.ts` — Creates an in-memory SQLite relational graph of entities to test (~1062 tok)
- `nativeFileBridge.ts` — Checks if the application is currently running inside the native Tauri desktop shell. (~2477 tok)
- `nexusArchive.test.ts` — Declares dummyWorld (~828 tok)
- `nexusArchive.ts` — Nexus Chronicle - Unified .nexus Archive Bundler (ZIP Format) (~2521 tok)
- `nexusBeam.ts` — Nexus Beam - High-Speed Direct P2P WebRTC Transfer Engine (~3623 tok)
- `tauriAssetVault.ts` — Nexus Chronicle - Tauri Project Vault Adapter (~2360 tok)

## src/views/

- `DashboardView.tsx` — DashboardView — renders chart — uses useMemo (~2502 tok)
- `index.ts` (~26 tok)
- `JourneyView.tsx` — TRAVEL_SPEEDS — renders map — uses useMemo (~14894 tok)
- `NexusGraphView.tsx` — CATEGORY_COLORS (~10230 tok)
- `NexusTreeView.tsx` — NexusTreeView — uses useMemo, useState (~4224 tok)
- `OptionsView.tsx` — PHASE_COLORS — uses useState, useMemo (~13076 tok)
- `TimelineView.tsx` — TimelineView — uses useMemo (~2454 tok)
- `TrashView.tsx` — TrashView (~1412 tok)
- `WorldMap.tsx` — WorldMap — uses useState, useMemo (~10524 tok)

## tools/

- `openwolf-mcp.mjs` — PROJECT_ROOT: run (~1557 tok)
- `state-inspector-mcp.mjs` — PROJECT_ROOT: readDevState, run (~1123 tok)
