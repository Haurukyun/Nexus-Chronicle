# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-09-30T02:38:51.869Z
> Files: 114 tracked | Anatomy hits: 0 | Misses: 0

> Project structure index. Auto-maintained by OpenWolf hooks and daemon.
> Run `openwolf scan` to generate, or wait for the first Claude Code session.
> Status: Pending initial scan

## ./

- `.eslintrc.js` — ESLint configuration (~20 tok)
- `.gitattributes` — Git attributes (~21 tok)
- `.gitignore` — Git ignore rules (~74 tok)
- `.prettierrc.js` (~43 tok)
- `AGENTS.md` — OpenWolf (~75 tok)
- `assemble.py` — Exports EntityType (~1289 tok)
- `CLAUDE.md` — OpenWolf (~99 tok)
- `GEMINI.md` — OpenWolf (~75 tok)
- `generate_components.py` — generate_editor_components, get_category (~2618 tok)
- `generate_viewers.py` — generate_viewer_components, get_category (~2272 tok)
- `index.html` — Chronicle Codex - Worldbuilding Suite (~319 tok)
- `metadata.json` (~77 tok)
- `package.json` — Node.js package manifest (~228 tok)
- `README.md` — Project documentation (~1 tok)
- `tsconfig.json` — TypeScript configuration (~163 tok)
- `vite.config.ts` — Vite build configuration (~96 tok)

## src/

- `App.tsx` — App — renders chart — uses useEffect, useMemo, useState (~6132 tok)
- `constants.ts` — Exports TYPE_LABELS, HIERARCHY_CONFIG (~385 tok)
- `index.css` — Styles: 32 rules (~816 tok)
- `index.tsx` — rootElement (~105 tok)
- `types.ts` — Exports EntityType, WorldPhase, ThemeMode, MapConnection + 6 more (~14762 tok)

## src/components/editor/

- `EditorGroup.tsx` — EditorGroup (~606 tok)
- `EntityEditor.tsx` — EntityEditor — renders form (~3489 tok)
- `GroupRoleGroup.tsx` — GroupRoleGroup (~540 tok)
- `index.ts` (~28 tok)

## src/components/editor/specifics/

- `AbilitySpecifics.tsx` — AbilitySpecifics — renders form (~3260 tok)
- `ChapterSpecifics.tsx` — ChapterSpecifics — renders form (~533 tok)
- `CharacterSpecifics.tsx` — CharacterSpecifics — renders form (~4854 tok)
- `ConditionSpecifics.tsx` — ConditionSpecifics — renders form (~3896 tok)
- `CultureSpecifics.tsx` — CultureSpecifics — renders form (~2550 tok)
- `CurrencySpecifics.tsx` — CurrencySpecifics — renders form (~1377 tok)
- `EntitySpecificsRegistry.tsx` — EntitySpecificsRegistry (~1321 tok)
- `EventSpecifics.tsx` — EventSpecifics — renders form (~2246 tok)
- `index.ts` (~214 tok)
- `ItemSpecifics.tsx` — ItemSpecifics — renders form (~3219 tok)
- `LanguageSpecifics.tsx` — LanguageSpecifics — renders form (~1820 tok)
- `LocationSpecifics.tsx` — LocationSpecifics — renders form, chart, map (~6459 tok)
- `MagicSpecifics.tsx` — MagicSpecifics — renders form (~4206 tok)
- `MythSpecifics.tsx` — MythSpecifics (~2182 tok)
- `NoteSpecifics.tsx` — NoteSpecifics — renders form (~2317 tok)
- `OccupationSpecifics.tsx` — OccupationSpecifics — renders form (~2629 tok)
- `OrganizationSpecifics.tsx` — OrganizationSpecifics — renders form (~3706 tok)
- `PoliticalGroupSpecifics.tsx` — PoliticalGroupSpecifics — renders form (~4118 tok)
- `ReligionSpecifics.tsx` — ReligionSpecifics — renders form (~4089 tok)
- `ResourceSpecifics.tsx` — ResourceSpecifics — renders form (~3335 tok)
- `SpeciesSpecifics.tsx` — SpeciesSpecifics — renders form (~3627 tok)
- `TechSpecifics.tsx` — TechSpecifics — renders form (~4151 tok)

## src/components/layout/

- `RealmSwitcher.tsx` — PHASE_COLORS — uses useState, useEffect, useMemo (~4970 tok)
- `Sidebar.tsx` — Safely resolves the parent ID of an entity. (~7748 tok)

## src/components/ui/

- `AssetImageUploader.tsx` — AssetImageUploader — uses useState (~2637 tok)
- `DeleteRealmModal.tsx` — DeleteRealmModal — uses useEffect (~1626 tok)
- `EmeraldGem.tsx` — EmeraldGem (~943 tok)
- `ErrorBoundary.tsx` — Exports ErrorBoundary (~553 tok)
- `FieldRow.tsx` — FieldRow (~358 tok)
- `FormInput.tsx` — FormInput — uses useState, useEffect (~1026 tok)
- `FormToggle.tsx` — FormToggle (~354 tok)
- `index.ts` (~126 tok)
- `KeybindsModal.tsx` — KeybindsModal — renders chart (~3293 tok)
- `LinksDisplay.tsx` — LinksDisplay (~800 tok)
- `MarkdownEditor.tsx` — MarkdownEditor — uses useState, useCallback, useEffect (~3631 tok)
- `MarkdownRenderer.tsx` — Extra class names on the outer wrapper (~887 tok)
- `NewRealmModal.tsx` — MAP_PRESETS — renders form, chart — uses useState (~3983 tok)
- `NexusBeamModal.tsx` — NexusBeamModal — uses useState, useEffect (~7259 tok)
- `NexusImage.tsx` — NexusImage — uses useEffect (~777 tok)
- `RadarChart.tsx` — RadarChart — renders chart (~1179 tok)
- `SmartSelect.tsx` — SmartSelect — uses useState, useEffect (~1401 tok)
- `TaperedDivider.tsx` — TaperedDivider (~92 tok)
- `ThemeSwitcher.tsx` — THEME_OPTIONS — uses useState, useEffect (~1517 tok)
- `WikiInfoboxRow.tsx` — WikiInfoboxRow (~144 tok)
- `WikiRows.tsx` — WikiStatRow (~274 tok)
- `WikiStatRow.tsx` — WikiStatRow (~138 tok)
- `WipeRealmModal.tsx` — WipeRealmModal — uses useEffect (~1494 tok)

## src/components/viewer/

- `CharacterStatBlock.tsx` — CharacterStatBlock — renders chart (~3380 tok)
- `EntityViewer.tsx` — EntityViewer — uses useMemo (~4098 tok)
- `index.ts` (~39 tok)
- `ViewerHeaders.tsx` — CodexHeader (~2102 tok)
- `ViewerSectionCard.tsx` — ViewerSectionCard (~1205 tok)
- `WikiInfobox.tsx` — WikiInfobox — renders table, chart (~2271 tok)

## src/components/viewer/specifics/

- `AbilitySpecificsViewer.tsx` — AbilitySpecificsViewer (~2764 tok)
- `ChapterSpecificsViewer.tsx` — ChapterSpecificsViewer (~357 tok)
- `CharacterSpecificsViewer.tsx` — CharacterSpecificsViewer (~4265 tok)
- `ConditionSpecificsViewer.tsx` — ConditionSpecificsViewer (~3085 tok)
- `CultureSpecificsViewer.tsx` — CultureSpecificsViewer (~2295 tok)
- `CurrencySpecificsViewer.tsx` — CurrencySpecificsViewer (~1097 tok)
- `EntitySpecificsViewerRegistry.tsx` — EntitySpecificsViewerRegistry (~1232 tok)
- `EventSpecificsViewer.tsx` — EventSpecificsViewer (~2113 tok)
- `index.ts` (~248 tok)
- `ItemSpecificsViewer.tsx` — ItemSpecificsViewer (~2871 tok)
- `LanguageSpecificsViewer.tsx` — LanguageSpecificsViewer (~1306 tok)
- `LocationSpecificsViewer.tsx` — LocationSpecificsViewer — renders map (~2049 tok)
- `MagicSpecificsViewer.tsx` — MagicSpecificsViewer (~3491 tok)
- `MythSpecificsViewer.tsx` — MythSpecificsViewer (~1880 tok)
- `NoteSpecificsViewer.tsx` — NoteSpecificsViewer (~2031 tok)
- `OccupationSpecificsViewer.tsx` — OccupationSpecificsViewer (~2322 tok)
- `OrganizationSpecificsViewer.tsx` — OrganizationSpecificsViewer (~3381 tok)
- `PoliticalGroupSpecificsViewer.tsx` — PoliticalGroupSpecificsViewer (~3432 tok)
- `ReligionSpecificsViewer.tsx` — ReligionSpecificsViewer (~3409 tok)
- `ResourceSpecificsViewer.tsx` — ResourceSpecificsViewer (~2893 tok)
- `SpeciesSpecificsViewer.tsx` — SpeciesSpecificsViewer (~3082 tok)
- `TechSpecificsViewer.tsx` — TechSpecificsViewer (~3458 tok)

## src/store/

- `useWorldStore.ts` — Exports DEFAULT_REALM_MAP, useWorldStore (~19311 tok)

## src/utils/

- `assetStore.ts` — Nexus Chronicle - IndexedDB Asset Engine (~1968 tok)
- `backlinkUtils.ts` — Exports CategorizedBacklinks, getCategorizedBacklinks (~2582 tok)
- `nexusArchive.ts` — Nexus Chronicle - Unified .nexus Archive Bundler (ZIP Format) (~3405 tok)
- `nexusBeam.ts` — Nexus Beam - High-Speed Direct P2P WebRTC Transfer Engine (~3623 tok)

## src/views/

- `DashboardView.tsx` — DashboardView — renders chart — uses useMemo, useState (~3898 tok)
- `index.ts` (~26 tok)
- `JourneyView.tsx` — TRAVEL_SPEEDS — renders map — uses useMemo (~14713 tok)
- `NexusGraphView.tsx` — CATEGORY_COLORS (~10052 tok)
- `NexusTreeView.tsx` — NexusTreeView — uses useMemo, useState (~3922 tok)
- `OptionsView.tsx` — PHASE_COLORS — uses useState, useMemo (~10461 tok)
- `TimelineView.tsx` — TimelineView — uses useMemo (~2270 tok)
- `TrashView.tsx` — TrashView (~570 tok)
- `WorldMap.tsx` — WorldMap — uses useState, useMemo (~9893 tok)
