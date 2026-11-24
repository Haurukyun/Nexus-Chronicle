---
description: session handoff, regenerate with /handoff when a quest finishes
budget_tokens: 1000
---
# STATUS — nexus-chronicle

> Single source of truth for resuming work. Read this FIRST when starting a session.
> Update this file at the end of every work phase so the next `/clear` resumes in 1 read.
> Last updated: 2026-11-24 (08:30)

---

## ✅ Done

- **feat: Portable Install-Folder Data Vault (Choice 1) & Mairimashita Reference Test Realm (`lib.rs`, `portableVault.ts`, `tauriAssetVault.ts`, `OptionsView.tsx`, `mairimashitaWorld.ts`) (2026-11-24)**:
  - **Portable Vault Engine (Choice 1 Architecture)**:
    - Added Rust native backend vault resolver in `src-tauri/src/lib.rs` that detects whether the application is running from a portable directory (e.g. USB drive or custom folder outside `Program Files`) with write permissions.
    - Stores all codex JSON data and media assets directly in `./data/` alongside the executable (`./data/codex.json` and `./data/assets/`).
    - Gracefully falls back to system AppData if installed in read-only directories like `C:\Program Files\`.
    - Added atomic file write with `.tmp` staging and replace, plus `open_vault_folder` command to reveal data in Windows Explorer.
    - Created `src/utils/portableVault.ts` bridging Zustand and disk with debounced auto-save subscriptions and hydration on startup.
    - Integrated with `tauriAssetVault.ts` so all media attachments route to `./data/assets/` in portable mode.
    - Added Storage & Vault dashboard in `src/views/OptionsView.tsx` with directory display, Explorer reveal, and manual sync buttons.
  - **Mairimashita! Iruma-kun Reference World Dataset (`src/data/mairimashitaWorld.ts`)**:
    - Created complete, rich test realm based on *Mairimashita! Iruma-kun* (Babyls Demon School, Netherworld).
    - Fully populated at least 2 entries for **every single one of the 21 entity categories** (Chapters, Lore Notes, Myths, Characters, Locations, Events, Species, Languages, Cultures, Political Groups, Religious Groups, Organizations, Magic Groups, Science Groups, Technologies, Skills/Spells, Items, Occupations, Conditions, Resources, Currencies).
    - Every field filled: combat ratings, RPG-d20 stats, custom stats (Crisis Evasion, Ring Charge), relationships, bloodline traits, etc.
    - Added 1-click "Load Iruma-kun Realm" button in `OptionsView.tsx` header.
  - Added unit tests: `src/data/mairimashitaWorld.test.ts` (4 tests) and `src/utils/portableVault.test.ts` (1 test).
  - Verified: `npm run typecheck` (0 errors), `npm run test` (116/116 passing across 25 test files), `npm run build` (clean), `cargo check` (clean).

- **feat: Continuity & Timeline Conflict Detector (`continuityDetector.ts`, `ContinuityAuditorModal.tsx`, `EntityViewer.tsx`, `App.tsx`) (2026-11-24)**:
  - **Conflict Detection Engine (`src/utils/continuityDetector.ts`)**:
    - Comprehensive offline, local rule-based engine detecting 9 distinct conflict types:
      - Inverted lifespans (birth year after death year).
      - Inverted event durations (start year after end year).
      - Posthumous and pre-natal event participation.
      - Temporal kinship paradoxes (parent born after child, or child born >1 year posthumously).
      - Self-referential kinship paradoxes (entity listed as its own parent/child/relative).
      - Circular ancestry loops (DFS cycle detection).
      - Deceased characters listed as active residents of locations.
      - Dangling broken entity references to deleted or missing entity IDs across relationship and residency arrays.
    - Exports `detectContinuityIssues(world)`, `getEntityContinuityIssues(entityId, world)`, and `getContinuitySummary(issues)`.
  - **Diagnostic Modal (`src/components/continuity/ContinuityAuditorModal.tsx`)**:
    - Portal-mounted full diagnostic auditor modal with 4 health counters (Total, Critical, Warnings, Broken Links).
    - Category filtering pills (All, Lifespans, Event Sync, Ancestry, Broken Links) and real-time search filter.
    - Issue cards with severity accent borders, suggested fix hints, "Jump to Entity" and "View Related Entity" navigation triggers.
    - Royal Codex styling with `VectorFiligreeCorner` decorations.
  - **Passive Inline Entity Alerts & Header Action Trigger**:
    - Embedded passive continuity alert pills directly below the header in `EntityViewer.tsx` flagging entity-specific issues.
    - Added header action tool button with dynamic live counter badge in `App.tsx` tray.
  - Added unit tests in `src/utils/continuityDetector.test.ts` (12 tests) and `src/components/continuity/ContinuityAuditorModal.test.tsx` (2 tests).
  - Verified: `npm run typecheck` (0 errors), `npm run test` (111/111 passing across 23 test files), `npm run build` (clean).

- **fix: eliminate corner halo bleed, overhaul category customizer & add in-context suggestions (`App.tsx`, `Sidebar.tsx`, `CategoryManagerModal.tsx`, `TraitListEditor.tsx`, `constants.ts`, `themeRegistry.ts`, `specifics`) (2026-11-24)**:
  - **Eliminated top-right corner halo bleed & jagged edges**:
    - Restructured content layout in `src/App.tsx`: elevated `<header>` to the content column's root (`shrink-0 z-[100]`), spanning 100% full width above `<main>`'s scrollable viewport. Completely eliminated the vertical scrollbar gutter and light cream `#eee2cb` bleed beside the dark header bar, ensuring the top-right corner clips `<header>` seamlessly against the outer dark shell.
    - Added `shapeRendering="geometricPrecision"` and `vectorEffect="non-scaling-stroke"` to `VectorFiligreeCorner.tsx`.
    - Removed stray `top-right` and `bottom-right` filigree corner brackets from `Sidebar.tsx` (left book spine now has clean `top-left` and `bottom-left` corners only).
    - Removed conflicting `border-r-2 border-[#110e0b]` from `royalCodexTheme` sidebar layout in `src/theme/themeRegistry.ts`.
  - **Fixed duplicate category labels in `src/constants.ts`**:
    - Resolved duplicate `'Technological Groups'` label by renaming `science` to `'Scientific Groups'` while preserving `tech` as `'Technologies & Inventions'`.
  - **Overhauled Category & Blueprints Customization UI (`src/components/layout/CategoryManagerModal.tsx`)**:
    - Replaced the cramped `w-56` inline popover with a spacious, illuminated Royal Codex modal (`w-[768px] max-w-[95vw]` via `createPortal`).
    - Features full genre preset titles (`✨ All Categories`, `⚔️ High Fantasy`, `🚀 Sci-Fi & Cyberpunk`, `☕ Modern & Urban`, `🛸 Alien Invasion`, `👁️ Cosmic Horror`) without text truncation.
    - Two organized tabs: `Categories & Blueprints` (2-column category grid with entity counters and `CodexCheckbox` switches) and `Sidebar Group Order` (reordering groups up/down with reset).
  - **Implemented in-context Suggestion Editor for Pages (`src/components/editor/TraitListEditor.tsx`)**:
    - Added `suggestionCategory?: EntityType` prop to `TraitListEditor.tsx`.
    - Added in-context "Edit Suggestions" button with live counter badge next to suggested quick-picks.
    - Added dedicated in-place "Suggestion Bank" modal for adding, removing, and clearing custom suggestions on the fly, syncing reactively with `world.customSuggestions` in Zustand.
    - Wired `suggestionCategory` into `CharacterSpecifics.tsx` (`character`), `LocationSpecifics.tsx` (`location`), `OrganizationSpecifics.tsx` (`organization`), `PoliticalGroupSpecifics.tsx` (`political`), and `ReligionSpecifics.tsx` (`religious`).
  - Added unit test `src/components/layout/CategoryManagerModal.test.tsx` (3 tests).
  - Verified: `npm run typecheck` (0 errors), `npm run test` (97/97 passing across 21 test files), `npm run build` (clean in 3.93s).

- **fix: anti-alias vector filigrees and enable direct dropdown switching (`VectorFiligreeCorner.tsx`, `App.tsx`) (2026-11-23)**:
  - Eliminated pixelated/stair-stepped SVG corners: replaced CSS element rotations (`rotate-90`) with native SVG coordinate transformations (`rotate(angle 12 12)`), preventing HTML rasterization aliasing; added subtle Gaussian metallic illumination aura (`feDropShadow`) and `strokeLinejoin="round"`.
  - Anti-aliased header and active ribbon gold borders with `[background-clip:padding-box]` and subpixel coverage ring shadows (`shadow-[0_0_0_1px_rgba(200,169,110,0.25)]`), eliminating jagged borders on Windows display scaling.
  - Fixed dropdown switching: elevated navigation ribbon to `z-[9995]` above backdrop (`z-[9990]`), enabling direct 1-click switching to another dropdown (and auto-switching on hover when a dropdown is already active) without requiring a click-away first.
  - Added unit test `src/components/ui/VectorFiligreeCorner.test.tsx` (3 tests).
  - Verified: `npm run typecheck` (0 errors), `npm run test` (94/94 passing across 20 test files), `npm run build` (clean).

- **fix: restore header dropdown nav groups and VectorFiligreeCorner (`src/App.tsx`, `src/views/OptionsView.tsx`) (2026-11-23)**:
  - Restored categorized header navigation dropdowns (`Chronicles` [Gazette, Chronos, Sessions], `Cartography` [Atlas, Journey], `The Web` [Threads, Factions, Nexus Lines, Ledger]) in `src/App.tsx`.
  - Restored click-outside backdrop listener and active group indicator badges.
  - Restored `VectorFiligreeCorner` (size 24) on all 4 corners of the manuscript parchment view.
  - Verified: `npm run typecheck` (0 errors), `npm run test` (91/91 passing across 19 test files), `npm run build` (clean).

- **feat: Sidebar Group Ordering, Field Visibility Engine & Genre Templates (Approaches 2, 6, 7) (`sidebarConfig.ts`, `fieldVisibilityUtils.ts`, `genreTemplates.ts`, `Sidebar.tsx`, `EntityViewer.tsx`, `ViewerHeaders.tsx`, specifics, `OptionsView.tsx`) (2026-11-23)**:
  - **Approach 2 (Sidebar Group Custom Reordering)**:
    - Added `sidebarGroupOrder?: string[]` to `WorldData` in `types.ts`.
    - Implemented `src/utils/sidebarConfig.ts` with `getOrderedHierarchy()`, `reorderGroups()`, and `moveGroup()`. Tested with 5/5 unit tests in `sidebarConfig.test.ts`.
    - Added two-tab manager to `Sidebar.tsx` (Categories tab + Group Order tab with up/down controls and reset).
  - **Approach 6 (Field-Level Visibility & Hide Empty Fields Engine)**:
    - Added `hiddenFields?: Partial<Record<EntityType, string[]>>` and `hideEmptyFieldsDefault?: boolean` to `WorldData`; added `hideEmptyFieldsOverride?: boolean` to `BaseEntity`.
    - Created `src/utils/fieldVisibilityUtils.ts` with `CONFIGURABLE_FIELDS`, `isFieldVisible()`, `toggleFieldHidden()`, `isFieldValueEmpty()`, and `shouldHideEmptyFields()`. Tested with 5/5 unit tests.
    - Added per-entry `Eye`/`EyeOff` toggle button across all three viewer headers (`CodexHeader`, `WikiHeader`, `RoyalHeader`).
    - Gated vital records, traits, features, and inventory sections in `CharacterSpecificsViewer.tsx`, `LocationSpecificsViewer.tsx`, and `OrganizationSpecificsViewer.tsx`.
    - Gated editor fields in `CharacterSpecifics.tsx` using `showField()`.
    - Added dedicated "Field Visibility per Entity Type" manager in `OptionsView.tsx`.
  - **Approach 7 (Genre-Switchable Entity & Realm Templates)**:
    - Added `genreTemplate?: 'fantasy' | 'scifi' | 'modern' | 'horror' | 'universal'` to `WorldData` and `entityTemplate?: 'inherit' | 'fantasy' | 'scifi' | 'modern' | 'horror'` to `BaseEntity`.
    - Implemented `src/utils/genreTemplates.ts` with `GENRE_TEMPLATES` (universal, fantasy, scifi, modern, horror), field label overrides, suggested hidden field presets, and `getActiveGenreTemplate()`, `getGenreFieldLabel()`, and `applyGenreTemplateToWorld()`. Tested with 3/3 unit tests.
    - Added interactive 5-tile "Genre-Switchable Realm Template" selector in `OptionsView.tsx` with one-click activation and optional recommended field visibility sync.
    - Integrated adaptive genre labels across `CharacterSpecifics.tsx` and `CharacterSpecificsViewer.tsx` (e.g. Threat Level vs Combat Rating in Sci-Fi, Arcane Tier in Fantasy).
  - Verified: `npm run typecheck` (0 errors), `npm run test` (91/91 passing across 19 test files), `npm run build` (clean in 2.63s).
  - **Step 3 (Approach 3) — Custom Suggestion Banks**:
    - Added `customSuggestions?: Partial<Record<EntityType, string[]>>` to `WorldData` in `src/types.ts`.
    - Created `src/utils/suggestionUtils.ts` with `mergeSuggestions(builtIn, custom)` helper: prepends custom suggestions, deduplicates case-insensitively, and trims whitespace. Unit tested with 6/6 tests passing in `suggestionUtils.test.ts`.
    - Added dedicated "Custom Suggestion Banks" manager section in `src/views/OptionsView.tsx` with all 21 category pills, active badge counters, inline text input with Enter support, interactive tag chips with removal, and category clear actions.
    - Wired `mergeSuggestions` into `CharacterSpecifics.tsx` (traits, features, and custom stat suggestions), `LocationSpecifics.tsx` (defenses, hazards, landmarks, climate), `OrganizationSpecifics.tsx`, `PoliticalGroupSpecifics.tsx`, and `ReligionSpecifics.tsx`.
    - Verified: `npm run typecheck` (0 errors), `npm run test` (78/78 passing across 16 test files), `npm run build` (clean).

- **feat: Sidebar Category Manager & Stat Block Engine (Step 2) (`Sidebar.tsx`, `CharacterSpecifics.tsx`, `CharacterStatBlock.tsx`, `EntityViewer.tsx`, `types.ts`) (2026-11-22)**:
  - **In-Place Sidebar Category Manager**:
    - Added dedicated `Sliders` button in the sidebar search row next to the multi-select tool, opening an in-place Category Customizer popover with 1-click genre presets (Fantasy, Sci-Fi, Modern, Invasion, Horror, All) and `CodexCheckbox` switches for all 21 categories.
    - Added an `EyeOff` quick-hide button on hover directly on every category header row (`CHARACTERS`, `LOCATIONS`, `MYTHS`, `MAGIC`, etc.), allowing users to dismiss unneeded categories right on the tree.
  - **Step 2 (Approach 4) — Flexible Stat Block Engine**:
    - Updated `Character` in `src/types.ts` with `statBlockMode?: 'rpg-d20' | 'custom' | 'none'` and `customStats?: Array<{ id: string; label: string; value: string; max?: string }>`.
    - `CharacterSpecifics.tsx`: added 3-way mode switch (`D20 Array`, `Custom Stats`, `None`), quick-pick stat chips (`Health`, `Sanity`, `Cyberware`, `Resolve`, `Street Cred`, etc.), dynamic value and optional max cap inputs, and narrative notice when set to `None`.
    - `CharacterStatBlock.tsx` & `EntityViewer.tsx`: renders custom stats as illuminated gauges and chips across Royal Codex, Grand Voyager, Wiki, and Sovereign themes; cleanly falls back to Record Vitals when `none`.
    - Unit tests: `src/utils/statBlockEngine.test.tsx` (3 tests).
    - Verified: `npm run typecheck` (0 errors), `npm run test` (72/72 passing), `npm run build` (passing).
    - **Next quest:** Step 3 — Approach 3: Custom Suggestion Banks (`customSuggestions?: Record<EntityType, string[]>` in `WorldData`, editable in Options, merged into specifics editors).

- **Fix: Restore Active Sidebar Contrast & Thematic Checkbox Architecture (`Sidebar.tsx`, `CodexCheckbox.tsx`, `OptionsView.tsx`, `TrashView.tsx`, BUG-027) (2026-11-22)**:
  - Fixed active entity in sidebar displaying as black/illegible text: `customStyle` was applying `color: entity.documentColor` unconditionally, allowing dark/black hex values (common from Fantasia Archive defaults) to override the theme's active text color (`text-[#fff8e7]` on Royal Codex). Now `isActive` forces `color: undefined` so active styles always rule, and inactive custom colors are guarded by `isColorLegibleOnDark` / `isColorLegibleOnLight` luminance checks.
  - Replaced generic Lucide slate `<Square>` / `<CheckSquare>` wireframe checkboxes with a custom `CodexCheckbox` component adapted across all 4 themes:
    - Royal Codex: illuminated gold antique border, deep velvet crimson fill (`#611620`), glowing gold checkmark (`#fef08a`), and golden aura shadow.
    - Grand Voyager: nautical deep teal fill (`#0f766e`), turquoise border (`#2dd4bf`), oceanic aura shadow.
    - Wiki: scholastic rubricated ledger mark (`#8b0000`).
    - Sovereign: gold/amber illuminated mark on slate.
  - Replaced checkboxes in Sidebar tree items, Sidebar multi-select toggle, OptionsView blueprint matrix, and TrashView.
  - Added unit test `src/components/ui/CodexCheckbox.test.tsx` (3 tests).
  - Verified: `npm run typecheck` (0 errors), `npm run test` (69/69 passing), `npm run build` (passing).
  - Recorded in `.wolf/buglog.json` as `BUG-027`.

- **Fix: Add Root ErrorBoundary and Diagnostic Crash Banner (`src/index.tsx`, BUG-026) (2026-11-22)**:
  - Fixed blue screen (#0f172a body background) when unhandled runtime exceptions occur during mount or render: wrapped root `<App />` in `<ErrorBoundary>` and added global window `error` and `unhandledrejection` listeners that render a visible diagnostic crash banner with stack trace and reload button.
  - Recorded in `.wolf/buglog.json` as `BUG-026`.
  - Verified: `npm run typecheck` (0 errors), `npm run test` (66/66 passing), `npm run build` (passing).

- **feat: Realm Blueprints & Engine Module system — Step 1 (`types.ts`, `constants.ts`, `realmConfig.ts`, `Sidebar.tsx`, `CommandPalette.tsx`, `App.tsx`, `CharacterSpecifics.tsx`, `EntityViewer.tsx`, `OptionsView.tsx`) (2026-11-22)**:
  - Added `RealmModuleConfig` interface + `activeEntityTypes`, `activeModules`, `hideEmptyFieldsDefault` to `WorldData` in `types.ts`.
  - New `src/utils/realmConfig.ts`: `isEntityTypeActive`, `isModuleActive`, `getActiveEntityTypes`, `getActiveModules`, `REALM_PRESETS` (6 presets: All, High Fantasy, Sci-Fi, Modern, Alien Invasion, Cosmic Horror). Covered by 5 unit tests in `realmConfig.test.ts`.
  - `Sidebar.tsx`: filters `HIERARCHY_CONFIG` groups/types to only render active entity types per realm.
  - `CommandPalette.tsx`: filters quick-create list and system realm suggestions by active modules/types.
  - `App.tsx`: `activeRealmNavGroups` memo filtering module-gated nav items; auto-redirect from deactivated tab to dashboard.
  - `CharacterSpecifics.tsx` + `EntityViewer.tsx`: Core Attributes / CharacterStatBlock gated on `combatStats` module across all 3 theme branches.
  - `OptionsView.tsx`: Full "Realm Blueprints & Engine Modules" section — 6 genre preset cards, 5 engine module toggles, 21-type blueprint matrix, global hide-empty-fields toggle.
  - Commit `222c8c9` pushed to `origin/main`. 66/66 tests, 0 TS errors, build clean.
  - **Next quest:** Step 2 — Approach 4 (Stat Block Engine / Flexible Attributes): `statBlockMode` + `customStats` on Character type, Stat Block Mode selector in `CharacterSpecifics.tsx`, dynamic rendering in `CharacterStatBlock.tsx`.

- **Fix: Restore Document Vertical Scrolling & Header Collisions on Small Windows (`App.tsx`, `ViewerHeaders.tsx`, `EntityEditor.tsx`, `WorldMap.tsx`) (2026-11-22)**:
  - Fixed frozen vertical scroll ("can't even scroll down"): removed inadvertent `overflow-hidden` on the manuscript wrapper (`App.tsx`), allowing the manuscript to expand to full content height and trigger `<main>`'s vertical scrollbar cleanly.
  - Fixed title/buttons collision and overlap in Codex Record viewer headers (`ViewerHeaders.tsx`): changed from rigid `sm:flex-row` to `md:flex-row` with `break-words` on title, and `flex-wrap` on action buttons. Below 768px, buttons sit cleanly on their own row without overlapping the title text.
  - Fixed Editor header button cutoff in narrow windows (`EntityEditor.tsx`): buttons now have responsive padding, `w-full sm:w-auto`, and wrap naturally without pushing "Abandon Scrawl" off the right edge.
  - Fixed Atlas header instruction text wrapping awkwardly (`WorldMap.tsx`): hidden on `<lg` screens (`hidden lg:flex`) to preserve clean title, anchor count, and search controls.
  - Verified: `npm run typecheck` (0 errors), `npm run test` (61/61 passing), `npm run build` (passing).

- **Eliminate UI Cutoff & Overflow Across Viewport Widths and Heights (`App.tsx`, `EntityEditor.tsx`, `EntityViewer.tsx`, `TraitListEditor.tsx`, `EditorGroup.tsx`) (2026-11-22)**:
  - Fixed root cause of horizontal cutoff at thin widths: nested containers lacked `min-w-0`, and cumulative nested horizontal padding (outer shell + body content + leather binding + inner vellum + editor cards) consumed ~250px before content began, forcing child cards outside the window bounds.
  - Added `min-w-0 w-full` across all flex levels: app container flex row, `<main>`, body content container, manuscript leather binding, inner vellum page, `EntityEditor`, and `EntityViewer`.
  - Streamlined nested padding across breakpoints (`p-1.5 sm:p-3 md:p-5` on leather binding, `p-3 sm:p-5 md:p-8 lg:p-10` on inner vellum, `p-3 sm:p-4 md:p-6` on EditorGroup), recovering over 120px of usable content width on narrow viewports.
  - Made decorative manuscript fanning layers (`-bottom-3 -left-4`, `-top-3 -right-4`) visible only on `2xl` viewports (`hidden 2xl:block`) and added `overflow-hidden` to the manuscript wrapper, eliminating the cream corner poking into the window border and getting chopped off.
  - Made `EntityEditor` header wrap responsively (`flex-col sm:flex-row items-start sm:items-end`) with responsive title scaling and button padding, preventing the header from enforcing a 750px minimum width.
  - Hid `Click 📝 to annotate notes` helper text on `<xl` screens (`hidden xl:inline`), allowing TraitListEditor columns to shrink cleanly without title line overflow.
  - Verified: `npm run typecheck` (0 errors), `npm run test` (61/61 passing), `npm run build` (passing).

- **Compact 2-Column TraitListEditor Scaling on Thin Windows (`TraitListEditor.tsx`, `EditorGroup.tsx`, `EntityEditor.tsx`, specifics) (2026-11-22)**:
  - Preserved the user's preferred 2-column side-by-side layout (`gridSpan={6}`) across all specifics cards without collapsing into a single stacked column.
  - Made the 2-column layout compact when the window is thin:
    - Added `min-w-0` to `TraitListEditor` container, input row, `<input>`, chip list, and suggestions wrapper so CSS Grid tracks can shrink below content min-widths.
    - Added `truncate` and responsive tracking to header labels and tags to prevent text width blowout.
    - Hid repetitive `Click 📝 to annotate notes` helper text on `<sm` viewports (`hidden sm:inline`).
    - Made `EditorGroup` padding and gap responsive (`p-3.5 sm:p-6`, `gap-3 sm:gap-5`) to reclaim ~25px of horizontal margin on narrow windows without overflow clipping.
    - Added `min-w-0` to `EntityEditor` `<fieldset>` to prevent native browser fieldset min-content expansion.
  - Verified: `npm run typecheck` (0 errors), `npm run test` (61/61 passing), `npm run build` (passing).

- **UI Bug Fixes — Map Dropdown Z-Index & Location Viewer Atlas Anchor Layout (`App.tsx`, `LocationSpecificsViewer.tsx`) (2026-11-22)**:
  - Fixed nav dropdown panels being hidden behind the World Atlas map view by raising dropdown z-index from `z-50` → `z-[9999]` in `App.tsx`.
  - Fixed Atlas Anchor coordinates rendering as awkwardly wrapped multi-line text (`X:`, newline, `42.4%,`, newline, `Y:`, newline, `31.2%`) in the Royal Codex two-column grid — split into two separate `FieldRow` rows (`Anchor X` / `Anchor Y`).
  - Fixed "ATLAS ANCHOR PIN" and "OPEN IN WORLD ATLAS" text stacking in a narrow column in the Royal Codex layout — moved the entire map preview section out of the 2-column grid into a full-width block below, with the label and "Open in World Atlas" button inline in the same header row.
  - Verified: `npm run typecheck` (0 errors), `npm run test` (61/61 passing), `npm run build` (passing).

- **Faction & Organization Specifics Polish — Hierarchy, Tenets & Assets (`OrganizationSpecifics.tsx`, `PoliticalGroupSpecifics.tsx`, `ReligionSpecifics.tsx`, `OrganizationSpecificsViewer.tsx`, `PoliticalGroupSpecificsViewer.tsx`, `ReligionSpecificsViewer.tsx`, `EntityViewer.tsx`, `types.ts`) (2026-11-22)**:
  - Extended `Organization`, `PoliticalGroup`, and `Religion` models with structured fields: `hierarchyRanks`, `coreTenets`, and `factionAssets`.
  - Added interactive `TraitListEditor` groups across Organization, Political Group, and Religion editors with customized quick-pick suggestions and note annotation modals.
  - Built themed `StructuredListDisplay` with `ViewerSectionCard` cards across Royal Codex, Wiki, Sovereign, and Grand Voyager.
  - Connected hierarchy, tenets, and assets sections to `EntityViewer.tsx` quick-jump navigation rail and live scroll spy.
  - Verified: `npm run typecheck` (0 errors), `npm run test` (61/61 passing), `npm run build` (passing).

- **Header Trays Vertical Harmony & Responsive Thin Scaling (`App.tsx`, `ThemeSwitcher.tsx`) (2026-11-22)**:
  - Unified both header trays (Nav Dropdowns & Action Tools) to exact pixel-matched `h-9` (36px) bounding containers with identical `p-1` padding.
  - Standardized all child buttons across both trays to uniform `h-7` (28px) with `border border-transparent` base state to eliminate fractional-pixel height mismatches and layout shifting.
  - Eliminated text wrapping and button collision on thin/narrow viewports via `whitespace-nowrap shrink-0` across all dropdown triggers.
  - Added responsive label collapsing: inactive dropdown triggers show icons only on narrow viewports (`hidden md:inline` for label), while active views always remain explicitly visible.
  - Added responsive collapsing for Action Tools (`Jump` label hidden on `<lg`, `Ctrl+K` on `<2xl`, `Scratchpad`/`Keybinds` text on `<xl`, `ThemeSwitcher` label on `<xl`).
  - Right-aligned "The Web" dropdown panel on edge viewports (`right-0`) to prevent off-screen horizontal clipping.
  - Verified: `npm run typecheck` (0 errors), `npm run test` (61/61 passing), `npm run build` (passing).

- **Location Specifics Polish — Defenses, Hazards, Landmarks & Climate (`LocationSpecifics.tsx`, `LocationSpecificsViewer.tsx`, `EntityViewer.tsx`, `types.ts`) (2026-11-22)**:
  - Extended `Location` model with structured fields: `defenses`, `hazards`, `notableLandmarks`, and `climateNotes`.
  - Built interactive `TraitListEditor` groups inside `LocationSpecifics.tsx` with curated quick-pick suggestions and note annotation modals.
  - Implemented rich `StructuredListDisplay` with `ViewerSectionCard` in `LocationSpecificsViewer.tsx` across all 4 themes (Royal Codex, Wiki, Sovereign, Grand Voyager).
  - Integrated location specific sections into `EntityViewer.tsx` quick-jump navigation rail and dynamic intersection observer.
  - Verified: `npm run typecheck` (0 errors), `npm run test` (61/61 passing), `npm run build` (passing).

- **Categorized Dropdown Nav & Full VectorFiligreeCorner Rollout (`App.tsx`, `Sidebar.tsx`, `ViewerSectionCard.tsx`, `GazetteView.tsx`, `CharacterStatBlock.tsx`, `ThemeCard.tsx`, `VectorFiligreeCorner.tsx`) (2026-11-22)**:
  - Replaced flat scrollable header ribbon with 3 categorized dropdown menus: **Chronicles** (Gazette, Chronos, Sessions), **Cartography** (Atlas, Journey), **The Web** (Threads, Factions, Nexus Lines, Ledger).
  - Each dropdown button shows active child label and group badge; panels have item icon, label, description, shortcut kbd.
  - Added `VectorFiligreeCorner` SVG component (`geometricPrecision`, `non-scaling-stroke`) — crisp HD corner ornaments at any DPI, eliminating pixelated WebView2 fractional-pixel CSS corners.
  - Rolled out VectorFiligreeCorner to all remaining CSS bracket corners: GazetteView broadsheet masthead (size=28), CharacterStatBlock portrait frame (size=16), ThemeCard ornate prop (size=10), Sidebar spine (size=20), manuscript page (size=24), ViewerSectionCard (size=10).
  - Applied global antialiased font/shape rendering in `index.css`.
  - Commits: `26fb6c7` (dropdown nav + initial corners), `0e8c603` (remaining corner sweep).
  - Verified: `npm run typecheck` (0 errors), `npm run test` (61/61 passing).

- **Header Bar Harmony, Grey Slider Elimination & Realm Switcher Contrast Fix (`App.tsx`, `RealmSwitcher.tsx`, `Sidebar.tsx`, `index.css`) (2026-11-22)**:
  - Eliminated the ugly grey Windows WebView2 scrollbar slider beneath the navigation ribbon by enforcing `.no-scrollbar` and `.custom-scrollbar-hidden` with `display: none !important; width: 0 !important; scrollbar-width: none !important;`.
  - Added natural `onWheel` horizontal scroll translation to the ribbon navigation container for fluid mousewheel and trackpad panning across all 9 realm views.
  - Resolved invisible brown-on-dark metadata text in `RealmSwitcher.tsx` under realm titles (e.g. `8 entities • Golden Age`), styling it with crisp warm ivory `text-[#ebd9bd]/80` in Royal Codex and `text-[#2dd4bf]/80` in Grand Voyager.
  - Set explicit `text-[#ebd9bd]` on the sidebar container to permanently prevent document body text color inheritance leakage.
  - Streamlined ribbon labels ("Threads", "Nexus") and action tools tray (icon undo/redo, responsive scratchpad/keybinds) to preserve horizontal breathing room and prevent early ribbon truncation.
  - Upgraded header trays with rich gilded manuscript framing (`bg-[#140b07]/90 border-[#c8a96e]/40 shadow-inner`) and added an illuminated gold hairline divider between the header and the manuscript page.
  - Upgraded active ribbon button with rich imperial crimson gradient `bg-gradient-to-b from-[#881326] to-[#5b0e18]` and warm gilded ivory text on inactive items.
  - Verified: `npm run typecheck` (0 errors), `npm run test` (61/61 passing), `npm run build` (passing).

- **EntityViewer Read-Mode Quick-Jump Navigation Rail (`EntityViewer.tsx`, `ViewerSectionCard.tsx`, `CharacterSpecificsViewer.tsx`) (2026-11-22)**:
  - Brought the sticky category navigation rail into dossier reading mode, making long worldbuilding entries instantly navigable without endless scrolling.
  - Built responsive desktop sticky rail (`hidden xl:block`) supporting both full expanded mode (`w-52`) with text and chevron indicators, and ultra-compact collapsed strip (`w-11`) with centered icon buttons and hover tooltips.
  - Added mobile & tablet floating quick jump button (`xl:hidden fixed bottom-6 right-6`) with smooth backdrop-blurred category picker modal.
  - Dynamic category indexing tailored per entity type: Overview/Biography, Folder Contents (category containers), Vital Records, Traits & Quirks, Unique Features, Inventory & Gear, Kinship & Ties, Affiliations, Type Vitals, Secrets/Spoilers, Ties & Backlinks with counter badge, DM Confidential Notes, and Custom Attributes.
  - Added `id?: string` to `ViewerSectionCard.tsx` across all theme templates, tagging sections in `EntityViewer.tsx` and `CharacterSpecificsViewer.tsx`.
  - Integrated live `IntersectionObserver` highlighting the active section with theme-specific glows.
  - Built intelligent Royal Codex tab switching: navigating to Interpersonal Web, Kinship, or Affiliations automatically activates the "Relations" tab; navigating to Inventory & Gear activates "Inventory"; all others switch to "Overview".
  - Full exhaustive theme styling across Royal Codex, Wiki, Grand Voyager, and Sovereign.
  - 100% verified: `npm run typecheck` (0 errors), `npm run test` (61/61 passing), `npm run build` (passing).

- **Cohesive Architectural Header Ribbon & Hover Performance Fix (`App.tsx`) (2026-11-20)**:
  - Eliminated hover lag by removing nested `backdrop-filter: blur(24px)` layers, costly `box-shadow` spread transitions, and `transition-all`.
  - Replaced mobile-style `rounded-full` pills with the app's established architectural codex language (`rounded-xl` trays, `rounded-lg` buttons, Cinzel/Lora serif typography, crisp borders).
  - Aligned active and inactive states directly with `Sidebar.tsx` and `ViewerHeaders.tsx` (`#70121e` crimson on `#c8a96e` antique gold in Royal Codex, `#fef08a` on slate in Sovereign).
  - Switched to zero-latency `transition-colors duration-150` for instantaneous, silky-smooth hover response.

- **Glassmorphic Floating Header Ribbon & Bulletproof Character/Relation Sheet Printing (2026-11-20)**:
  1. **Glassmorphic Header Ribbon Overhaul (`App.tsx`)**:
     - Upgraded the top header bar from a flat utility strip into an integrated, translucent floating console with multi-stop gradients, delicate specular highlights (`inset 0 1px 0`), dynamic backdrop blur (`backdrop-blur-2xl`), and theme-adapted lighting.
     - Crafted floating glass capsule containers (`rounded-full`) for both the primary navigation ribbon and the right-hand action tools tray.
     - Re-engineered active state styling with glowing gemstone pills (imperial crimson bloom in Royal Codex, celestial amber-gold in Sovereign, aurora teal in Grand Voyager, scholar burgundy in Wiki).
     - Elevated dossier tabs in Tier 2 with translucent glass pills, clear active illumination, and smooth close buttons.
  2. **Bulletproof Print Engine (`characterSheetUtils.ts`)**:
     - Replaced fragile `window.open` popup mechanism with an in-page hidden iframe printing sandbox (`nexus-print-sandbox`).
     - Directly triggers native browser Print / "Save as PDF" dialog without being blocked by browser popup blockers or sandboxed webviews.
     - Added automatic script injection to guarantee printing triggers reliably once styles and assets settle, with secondary Blob URL fallback.
  3. **Print Relation Sheet & Kinship Web Engine (`characterSheetUtils.ts`)**:
     - Created `generateRelationSheetHtml()`: generates high-fidelity standalone A4/Letter relationship sheets featuring ancestry/parents, children/descendants, sworn allies, adversaries/rivals, complicated ties, faction orders, and relational context notes.
     - Wired "Print Relation Sheet" into `ViewerHeaders.tsx` (`ExportDropdown`), `CharacterStatBlock.tsx` (across all 3 themes), and `EntityViewer.tsx` under the Relations tab.

- **Royal Codex Theme Contrast Pass, Faction Matrix Fixes & The Chronicle Gazette**:
  1. **Theme Contrast Fix in Two-Tier Ribbon (Royal Codex & Voyager)**:
     - Fixed invisibility of inactive realm buttons in `App.tsx` where `text-[#2b1810]` rendered dark brown on `#2a170d` dark mahogany header leather.
     - Switched Royal Codex inactive buttons to warm gilded ivory (`text-[#ebd9bd] bg-[#3a2215]/80 border border-[#c8a96e]/30 hover:text-[#fff8e7] hover:bg-[#523321]`).
     - Enhanced active button styling with `bg-[#70121e] text-[#fff8e7] border-2 border-[#c8a96e] shadow-lg shadow-black/40 font-serif font-black`.
     - Updated `.wolf/cerebrum.md` with explicit rule regarding header vs body background inversion traps.
  2. **Faction Matrix View Cleanup & Polish**:
     - Removed redundant duplicated green slider bar beneath the tension score input.
     - Upgraded relation cards, inputs, and selects to crisp high-contrast parchment containers (`border-2 border-[#c8a96e]/70 bg-[#fffcf5] text-[#2b1810] shadow-md`).
     - Styled disabled state for the add button (`disabled:bg-[#3a2215]/10 disabled:text-[#2b1810]/30 disabled:border-[#c8a96e]/30`) preventing washed-out pink blobs.
  3. **The Chronicle Gazette (Living World Newspaper & Procedural Dispatches)**:
     - Built `GazetteView.tsx`: 100% offline, deterministic broadsheet generator synthesizing living lore from pure client-side state (0 AI, 0 external APIs).
     - Procedural dispatches:
       - *Diplomatic & Faction Accords*: Sworn alliances, treaties, hostile borders, and total war with graceful world name handling (`in the world of ${world.name}` or stops cleanly at `are allied.` if unnamed).
       - *Dynastic & Bloodline Chronicles*: Dynastic heirs (2+ children), succession branches, and court rivalries/blood feuds.
       - *Historical Eras & Convergences*: Multi-year saga chronicles, omitting boring single-point birth records.
       - *The Mystery Desk*: Clue investigations, unsolved mysteries, and resolved plot threads.
     - Interactive broadsheet UI with masthead, dateline strip, category filters, real-time search, and 1-click entity chip navigation to dossiers.
     - Registered `Alt+G` keyboard shortcut, Tier 1 realm ribbon navigation button, and `CommandPalette.tsx` integration.

- **UI Shell Debloat & Two-Tier Header Redesign**:
  1. **Sidebar Pure Codex Focus**:
     - Removed the vertical stack of 10 system buttons from the bottom of `Sidebar.tsx`, recovering ~350px of vertical space.
     - The Codex hierarchy tree now expands to the full height of the viewport, eliminating cramped tree scrolling.
     - Added a clean, minimal footer row containing only `Trash / Forgotten Depth` (with counter badge) and `System Archive / Settings`.
  2. **Two-Tier Header in `App.tsx`**:
     - **Tier 1 (Top Realm Ribbon & Actions)**: Full-width ribbon housing the 8 primary realm tool views (`Atlas`, `Chronos`, `Sessions`, `Plot Threads`, `Factions`, `Nexus Lines`, `Journey`, `Ledger`) as theme-aware pill buttons with keyboard shortcut tooltips, alongside the glassmorphic quick-actions toolbar (`Jump`, `Undo`, `Redo`, `Scratchpad`, `Keybinds`, `Theme Switcher`).
     - **Tier 2 (Entity Document Tabs Bar)**: Dedicated dossier tab bar displaying open entity documents with close buttons, active editing states, and open tab count.

- **Phase P5 Option 4: Narrative & Simulation Tools (The Conspiracy Board & Balance of Power)**:
  1. **The Conspiracy Board (Plot Threads & Clue Web Tracker)**:
     - Added `PlotThread` and `PlotClue` interfaces to `types.ts` and store actions (`addPlotThread`, `updatePlotThread`, `deletePlotThread`, `addClueToThread`, `removeClueFromThread`) to `useWorldStore.ts`.
     - Built `PlotThreadsView.tsx`: thread board with status cycling (`Open`, `Dormant`, `Resolved`, `Red Herring`), inline markdown description with wikilinks, dynamic entity chip linking to any Codex record, clue reveal/hide toggles, and customizable card accent colors.
  2. **Balance of Power (Faction Influence & Tension Matrix)**:
     - Added `FactionRelation` interface and store actions (`upsertFactionRelation`, `deleteFactionRelation`) to `useWorldStore.ts`.
     - Built `FactionMatrixView.tsx`: dual-mode view featuring an interactive List with bidirectional sliders (-100 At War to +100 Sworn Allies) and notes, plus an N×N Heat Map matrix grid with color-coded tension cells and 1-click dossier navigation.
  3. **System Navigation & Accessibility**:
     - Pinned both views into `Sidebar.tsx` footer nav with theme-aware styling.
     - Added keyboard shortcuts (`Alt+9` for Plot Threads, `Alt+0` for Balance of Power) registered in `App.tsx` and `KeybindsModal.tsx`.
     - Added fuzzy search targets into `CommandPalette.tsx` (`Ctrl+K`).
     - Verified: 100% offline, 0 external APIs, 0 AI models, purely local Zustand persistence.

- **Entity Sheet Ergonomics, Wikilinks Engine & Codex Crafting Suite**:
  1. **Quick-Jump Category Navigation Sidepanel**:
     - Built a responsive category navigation system in `EntityEditor.tsx` with a desktop sticky side rail (`xl:block`) and a mobile floating navigator (`xl:hidden`).
     - Added smooth scrolling to all sections: Document Settings, Portrait & Imagery, Description & History, Basic Info, Characteristics & Stats, Relationships, Groups & Affiliations, Cultural Context, World & Details, Custom Attributes, Secrets & Notes, and Backlinks.
     - Added live scroll spy with `IntersectionObserver` highlighting the active section with theme-specific styling.
  2. **Relation Note Quick Suggestions in SmartSelect**:
     - Computed dynamic, contextual note suggestions for relation popups based on field category (e.g. for Parents: "Father", "Mother", "Step-father", "Step-mother", "Adoptive Father", "Guardian"; for Relatives: "Sibling", "Cousin", "Uncle", "Aunt"; for Friends/Enemies/Complicated).
     - Rendered interactive 1-click chip buttons in the relational note annotation modal.
  3. **Royal Codex Full-Height Book Contour & Illuminated Footer**:
     - Resolved the cutoff where leather contours stopped early at "Portrait & Imagery". Updated manuscript container with `relative flex-1 flex flex-col min-h-full` and added permanent illuminated parchment footers (`Finis Chronicorum ❖`) and corner filigrees spanning the entire scroll height.
  4. **[[Wikilinks]] Navigation Engine Overhaul**:
     - Overhauled `MarkdownRenderer.tsx` and `MarkdownEditor.tsx` to reliably navigate to linked entities.
     - Added support for piped alias wikilinks (`[[Target Entity|Custom Display Label]]`).
     - Indexed both primary names, lowercase IDs, and `otherNames` epithets.
     - Added fallback to `useWorldStore.getState().handleOpenEntity(id)` when `onNavigate` is not explicitly passed.
  5. **Default Markdown Mode to Live Preview**:
     - Set default mode in `MarkdownEditor.tsx` to Live Preview (`'preview'`) across Description & History, Private Ruminations, and Session Codex.
  6. **Structured Traits & Features Bullet List with Notes & Suggestions**:
     - Replaced raw textareas for "Traits & Characteristics" and "Unique/Unusual Features" with `TraitListEditor.tsx`.
     - Features chip bullets with individual custom notes, remove button, quick-pick suggestions ("Honest", "Cynical", "Heterochromia", "Scar across eye"), and backward-compatible JSON/plaintext serialization.
     - Updated `CharacterSpecificsViewer.tsx` to render structured bullet items with annotations in read mode.
  7. **Ultra-Compact Core Attributes Block**:
     - Redesigned the 6 Core Attributes (STR, DEX, CON, INT, WIS, CHA) from a 500px vertical stack into a compact 6-column grid displaying full stat names in parentheses (e.g., `STR (Strength)`, `DEX (Dexterity)`) and calculated D20 modifiers (e.g., `+2`).

- **MarkdownRenderer Multi-Theme Prose & Wikilink Contrast Pass**:
  - Eliminated the binary `isWikiMode ? prose-nexus-wiki : prose-nexus-dark` fallback bug that misidentified Royal Codex as a dark theme, causing yellow `#fef08a` text and washed-out gray on cream parchment.
  - Added `.prose-nexus-royal` (deep crimson `#70121e` wikilinks with >12:1 contrast ratio, dark ink text `#2b1810`, serif headings `#5c2a12`) and `.prose-nexus-voyager` (teal `#2dd4bf` wikilinks, warm parchment text `#f5e9d0`) to `src/index.css`.
  - Updated `MarkdownRenderer.tsx` and `MarkdownEditor.tsx` with explicit exhaustive theme branches for all 4 themes.
  - Added WCAG compliance tests in `src/theme/themeContrast.test.ts` verifying all 4 themes maintain >= 4.5:1 (AA) and >= 7:1 (AAA) contrast ratios.

- **Fixes & Refinements for Session Codex, Character Relations, Nexus Lines, Atlas Cartography & Lineage Export**:
  1. **Session Codex Focus Loss Fixed**:
     - Extracted `SessionFormPanel` from inside `SessionLogView.tsx` into a top-level component, eliminating the keystroke remount bug that dropped input focus on every character.
     - Preserved live markdown preview and `[[` wikilink autocomplete.
  2. **Character Relations Removal & Self-Linking Bug Fixed**:
     - In `SmartSelect.tsx`, removed duplicate/stale `onRelationalNotesChange` invocation in `toggleId` that was racing and reverting ID removals. Fixed tag removal button with explicit `<button type="button">` and event propagation stops.
     - In `CharacterSpecifics.tsx`, passed `excludeIds={[entity.id]}` across Parents, Children, Relatives, Friends, Enemies, and Complicated fields, making self-linking impossible.
  3. **Nexus Lines Islands Default & Button Contrast Fixed**:
     - Defaulted `isClustered = true` in `NexusGraphView.tsx`.
     - Fixed HUD button active states: removed conflicting `wikiPanel` class from active state so deep crimson (`bg-[#70121e]`) text stays crisp and readable (`text-[#fff8e7]`) in Royal Codex and light modes.
  4. **Atlas View Map Container Sizing**:
     - Updated `App.tsx` and `WorldMap.tsx` with responsive flex containment (`p-2 sm:p-3`, `min-h-0`, `overflow-hidden`), ensuring the atlas fits 100% on screen without clipping or overflow.
  5. **Functional Cartography Overlays & Territory Drawing Engine**:
     - Replaced static hatched SVG rectangles with real `CartographyRegion` polygon and polyline overlays.
     - Added interactive polygon/route boundary drawing directly on the map with live point previews and undo.
     - Added "Auto-Generate Atlas Layout" creating thematic realm borders, climate zones, and travel routes.
     - Added polygon centroid badge rendering for realm labels in SVG layer.
  6. **Bloodline Tree Handout Export (PDF & HTML)**:
     - Built `lineageExportUtils.ts` with dedicated pedigree campaign handouts (A4/Letter landscape, genealogical connector trees, deceased markings, generation badges) and zero app UI chrome.
     - Wired Print Handout (PDF) and HTML export into `NexusTreeView.tsx`.

- **Phase P4: High-Impact Worldbuilding Power Tools Suite (Completed in Order)**:
  1. **Rich Markdown Editor with `[[` Autocomplete**:
     - Upgraded `MarkdownEditor.tsx` with Live Preview by default, `Ctrl+Enter` mode toggle, click-to-edit preview pane, and live `[[` wikilink autocomplete popup with arrow key navigation.
     - Added wikilink autocomplete and Live Preview to `ScratchpadDrawer.tsx`. Removed redundant raw `<textarea>` from `CharacterSpecifics.tsx`.
  2. **Multi-Layer World Atlas & Cartography Overlays**:
     - Added `MapOverlayLayer` type and `mapOverlayLayers` to `WorldData` and `updateMapOverlayLayer` to Zustand store.
     - Implemented Cartography Overlays control panel on `WorldMap.tsx` with toggleable visibility and opacity sliders for Political Borders, Climate / Biomes, and Travel Routes.
     - Rendered dynamic SVG overlay patterns that scale and pan seamlessly with the atlas image.
  3. **Global Codex Search & Replace / Entity Renaming Engine**:
     - Built `entityRenaming.ts` (`renameEntityInWorld`) replacing `[[OldName]]` and `[[OldName|Alias]]` across entity descriptions, private notes, lore notes, summaries, and relational notes without breaking links.
     - Created `RenameEntityModal.tsx` with live propagation preview showing affected occurrences and entity names.
     - Wired "Rename & Propagate" action button into `CodexHeader`, `WikiHeader`, and `RoyalHeader` in `ViewerHeaders.tsx`. Added unit tests in `entityRenaming.test.ts` (passing).
  4. **Nexus Graph / Bloodline Tree Image Export (SVG & PNG)**:
     - Built `graphExport.ts` with `exportSvg` and `exportPng` (with retina 2x resolution and background injection).
     - Added "Export SVG" and "Export PNG" buttons to `NexusGraphView.tsx` toolbar. Added Print / PDF export button to `NexusTreeView.tsx` lineage tree header.
  5. **Campaign Session Logs / Dated Journal**:
     - Added `SessionLog` interface to `src/types.ts` and store actions (`addSessionLog`, `updateSessionLog`, `deleteSessionLog`) to `useWorldStore.ts`.
     - Built full-featured `SessionLogView.tsx` with session numbers, real dates, fantasy dates, markdown chronicles, attending character tags with codex jump links, visited location chips, and quest milestones.
     - Integrated `'session-logs'` tab into `App.tsx` router and added "Session Codex" navigation button (`BookOpen`) in `Sidebar.tsx`.
  - All verified: `npm run typecheck` ✅, `npm run test` ✅ (59/59 tests pass), `npm run build` ✅.

- **Layout Expansion, Contrast Fixes & Responsive Viewport Ergonomics** (commits `9984b16` & `a80d280`):
  - **Fullscreen Expansion**: Replaced `max-w-[1500px]` cap on Royal Codex mode with responsive wide bounds (`w-full max-w-none 2xl:max-w-[2400px]`) and trimmed padding; expanded `EntityViewer` containers and `OptionsView` grid.
  - **Royal Codex & Wiki Contrast Pass**: Resolved washed-out text across Data Integrity, Developer Diagnostics, Oblivion Protocol, and Lore Archive in `OptionsView.tsx`.
  - **Grand Voyager Theme Repair**: Fixed broken pitch-black containers in `JourneyView.tsx` under Royal Codex; migrated to canonical illuminated parchment cards (`#f5ead0` with `#c8a96e` borders) and dark ink text.
  - **Narrow Viewport Responsive Layout**: Converted `EntityViewer` from forced `flex-row` to `flex-col lg:flex-row`, preventing left-column description cutoff and aside overlap on compact screens. Added adaptive wrapping to `RoyalHeader` and tab ribbons.
  - **NexusGraph Visibility & Control Labels**: Category letters in graph nodes now render in bold dark ink (`#1a1008`) in light mode; node labels use deep ink (`#2b1810`) with white halo shadows (`0 0 3px #ffffff`); added explicit visible text labels to all control buttons below Filters (Zoom In/Out, Reset, Fit View, Islands, Focus Mode, Legend).

- **P3 Suite — Royal Portraits, Editor Backlinks, Calendar Reckoning Bridge, Scratchpad Live Preview, Printable Character Sheets, Asset Vault & NexusGraph Enhancements** (this commit):
  - **Royal Codex Portraits**: Added ornate gold-filigreed portrait frame to `CharacterStatBlock.tsx` and 64×64 thumbnail portrait with inspect modal to `RoyalHeader` in `ViewerHeaders.tsx`.
  - **Editor Inverse Link Visibility (P3 #18)**: Built "Incoming Ties & Backlinks" inspector into `EntityEditor.tsx`, categorizing incoming connections (Events, Residents, Members, Successors, Allies) into interactive chips.
  - **Calendar Reckoning Bridge (P3 #20)**: Implemented cross-calendar projection in `AnnualCalendarView.tsx` converting dates between fantasy calendars (Harptos, Tamriel, Shire, Solar) via day-of-year fraction mapping.
  - **Scratchpad Live Preview (Obsidian Style)**: Replaced write-first default with Live Preview by default in `ScratchpadDrawer.tsx`. Clicking rendered markdown opens edit mode; added `Ctrl+Enter` preview hotkey and mode buttons.
  - **Printable Character Sheets & Lore PDF Export (P3 #16)**: Built `characterSheetUtils.ts` generating ornate RPG character sheets formatted for A4/Letter printing, PDF export, and archiving. Added print sheet action to `ViewerHeaders.tsx` (ExportDropdown) and `CharacterStatBlock.tsx` across all themes. Added tests (57/57 passing).
  - **Asset & Image Vault Manager (P3 #17)**: Created `AssetVaultModal.tsx` displaying all CAS IndexedDB media assets with storage quotas, referenced entity chips, orphan filters, fullscreen previews, and batch orphan pruning. Wired into `OptionsView.tsx`.
  - **NexusGraph Enhancements (P3 #19)**: Upgraded `NexusGraphView.tsx` with Zoom-to-Fit (`Scan`), Category Island Clustering (`Layers`) with quad-cluster attractor forces and quadrant halos, and Isolate Neighbors Focus Mode (`Crosshair`).

- **P2 Fixes — Undo/Redo Engine, Per-Event Timeline Colors, Trash Bulk Operations, Sidebar Multi-Select, Character Date Composer & Scratchpad Persistence**:
  - **Undo / Redo (P2 #12)**: Implemented in-memory history stack (`historyPast`, `historyFuture`, `undo`, `redo`, `canUndo`, `canRedo`) integrated with `syncWorld`.
  - **Per-Event Timeline Colors (P2 #9)**: Added `color?: string` to `Event` interface in `src/types.ts`.
  - **Trash Bulk Operations (P2 #11)**: Completely modernized `TrashView.tsx` with multi-select checkboxes and bulk restore/erase.
  - **Sidebar Multi-Select & Bulk Operations (P2 #14)**: Added multi-select mode and Ctrl/Cmd+click selection in `Sidebar.tsx`.
  - **Character Lifecycle Date Composer (P2 #8)**: Replaced raw text inputs in `CharacterSpecifics.tsx` with `FantasyDatePicker`.
  - **Scratchpad Persistence (P2 #15)**: Added `scratchpadNote` to Zustand `partialize` configuration in `useWorldStore.ts`.
  - **Journey Coordinate Nudge (P2 #13)**: Validated existing quick-pin modal, coordinate readout, and unanchored warning callouts in `JourneyView.tsx`.

- **P1 Fixes — Tree Depth Expansion, Viewer Tags Display & Command Palette Supercharged Search**:
  - **NexusTreeView On-Demand Depth Expansion**: Interactive expansion button (`Show deeper (+N descendants)`).
  - **Viewer Headers Tags Display**: `#tag` badges across `CodexHeader`, `WikiHeader`, and `RoyalHeader`.
  - **Command Palette Advanced Filters & Instant Create**: `tag:`, `type:`, `attr:`, and instant `+<type> <name>`.

- **P0 Fixes — Backlinks Symmetry & Dual Event Date Surface De-duplication**:
  - **Backlinks Symmetry**: Updated `backlinkUtils.ts` to properly scan and categorize Character relations.
  - **Type Isolation**: Fixed non-event entities being pushed into `results.events`.
  - **Event Date Surface De-duplication**: Single unified `FantasyDatePicker` without duplicated text inputs.

- **Chronos Timeline — Point vs Span Events & Annual Calendar Integration** (this session):
  - **P0 Fix**: Events with only `startDate` (no `endDate`) now render as diamond markers at exact year position — point-in-time events (battles, coronations, festivals). Events with both `startDate` and `endDate` render as ribbons. Added `isPointEvent` to `ProcessedTimelineItem`. Updated quick-create to set only `startDate` (no legacy `date` field).
  - **P0 Fix**: Annual Calendar View now fully integrated with events. Extended `AnnualCalendarViewProps` with `events[]`, `onEventClick`, `onDayClick`, `displayYear`, `onYearChange`. Day grid shows event dots; clicking navigates to timeline/codex; clicking empty day triggers quick-create with fantasy date.
  - **P0 Fix**: Chronos ↔ Annual Calendar year sync. TimelineView computes `displayYear` from viewport camera center. `onYearChange=handleJumpToYear` syncs camera when user navigates years in Annual Calendar.

- **Chronos Timeline — Zoom Flicker/Stutter & Edge Pill Fix** (`TimelineView.tsx`):
  - Frame-accumulated wheel delta via `wheelAccumulatorRef` + `requestAnimationFrame` for silky 60fps zoom.
  - Locked focal anchor ratio (`zoomFocalAnchorRef`) eliminates ratio drift during rapid wheel bursts.
  - Fixed `edgeItems` visibility with `CANVAS_PADDING_LEFT = 24px` offset.

- **Chronos Timeline — Visual Masterwork** (`TimelineView.tsx`):
  - Glassmorphic toolbar with 6 natural zoom presets (2K–40K), invariant button geometry.
  - Luminous era bands, interactive temporal scrubber, precision Chronos rail.
  - Magnificent empty-state altar with quick actions.

- **Custom Fantasy Calendar System** (`ManageCalendarModal.tsx`, `AnnualCalendarView.tsx`):
  - Harptos, Shire Reckoning, Tamriel presets; B.C./A.C. Christian Era default.
  - Separate Festivals & Intercalary Days tab (never mixed into month grid).
  - Custom preset creation, deletion, JSON import/export.

- **Annual Calendar View** (`AnnualCalendarView.tsx`):
  - Full-year month grid with custom week lengths (7-day, 10-day Tenday).
  - Season indicators, day-of-year ranges, leap year recognition.
  - Festival cards with leap cycle association.

- **Phase P8 Relational Context & Lore Export**:
  - `relationalNotes` on `BaseEntity` (composite keys `field:targetId`).
  - SmartSelect contextual note editing, LinksDisplay viewer rendering.
  - Single-entry & batch Markdown/HTML export (Obsidian-ready).

- **Phase P7 Document Modes & Codex Ergonomics**:
  - `documentModeUtils.ts` canonical helpers (`isEntityDeceased`, `isEntityFinished`, etc.).
  - Sidebar advanced search: `is:dead`, `is:finished`, `is:minor`, `type:`, `tag:`.
  - Fantasia Archive migration tool (ZIP, PouchDB, CouchDB).

- **Event Specifics — Fantasy Date Composer & Universal Calendar Switcher** (this commit):
  - **P0 Redesign**: Replaced the legacy month-chip container with a compact, modern, sleek single-container `FantasyDatePicker` positioned directly below the Start Date and End Date inputs.
  - **Dual Target Date Controls**: Instant segmented toggle (`Target: Start` / `Target: End`) with active pill highlighting, allowing authors to compose either start date or end date from the same sleek console.
  - **Unified Day, Year, and Month Ribbon**:
    - Compact day and year stepper inputs with decrement/increment controls, wheel scroll, and direct numeric input.
    - Responsive month pill ribbon with active month illumination and season details.
    - Dedicated intercalary festival pills (`✦ Midwinter`, `✦ Greengrass`, etc.) for calendars with seasonal holidays.
  - **Spacious Calendar System & Format Converter Modal**:
    - Replaced cramped 180px dropdown with a full-width, detailed modal (`createPortal` to body).
    - Features rich cards for all default calendars (Tamrielic / Skyrim, Harptos / Faerûn, Solar Gregorian, Kings' Reckoning / Middle-earth, Absalom / Pathfinder) and custom user presets.
    - Each card displays universe lore tag, era suffix (`4E`, `DR`, `CE`, `TA`), month structure, and a live "Converts To: ..." preview showing how the active date is translated into that calendar's reckoning.
    - Includes a toggle to also update the world's active timeline calendar.
  - All verified: `npm run build` ✅, `npm run typecheck` ✅, `npm run test` ✅ (51/51).

- **WorldMap/Atlas — Z-Index Fix & Top Toolbar Redesign** (this commit):
  - Fixed z-index hierarchy: top toolbar now `z-[100]` with `data-interactive-ui=true`, WorldMap elements capped at `z-[50]` (pins), `z-[35]` (dossier/filters), `z-[25]` (HUDs), `z-[15]` (ley-lines)
  - Redesigned top toolbar buttons (Jump, Scratchpad, Keybinds, Theme) with premium glassmorphism: gradient backgrounds, shine overlays, hover scale animations, enhanced shadows, theme-aware styling
  - ThemeSwitcher dropdown raised to `z-[110]` to stay above toolbar
  - All verified: `npm run build` ✅, `npm run typecheck` ✅, `npm run test` ✅ (51/51)

- **Chronos Timeline — Milestone Pin Smart Links & Axis Temporal Event Indicators** (commit `5ec0de2`):
  - **P0 Smart Links for Milestone Pins**: Added automatic Codex entity linking when planting or inspecting milestone pins. In `AddMilestoneModal`, added auto-matching for existing Codex entries and an automatic "Create linked Historical Event in Codex" toggle. In `TimelineInspectorCard`, unlinked milestones (like *"Canardage de Cannarbello"*) now feature prominent 1-click `[ ⚡ Create Event in Codex & Link ]` and `[ 🔗 Link to Existing ]` smart action buttons, ensuring no milestone pin is ever an unlinked orphan.
  - **P0 Axis Rail Event Anchor Indicators**: Historical events now render luminous anchor pips directly on the Chronos ruler rail line at `item.start`. When hovering or inspecting any event (like *"Bébé Tigre tombe enceinte 2015–2016"*), the rail anchor pip scales up, illuminates with a glowing aura, and displays an animated year tag badge (`📍 Yr 2015 · Bébé Tigre...`) directly on the axis rail.
  - **P0 Vertical Dropline Guidelines**: Connected every event ribbon and short-span chip to the axis rail via an honest vertical dropline spanning from the ruler track through the canvas down to the ribbon. Event chips feature an upward pointer anchor linking into the dropline and an unambiguous `📍 Yr 2015–2016` pill, making temporal positioning on the timeline 100% intuitive at any zoom level.
  - All verified: `npm run build` ✅, `npm run typecheck` ✅, `npm run test` ✅ (51/51).

- **Chronos Timeline & Annual Calendar — Visual Masterwork, Short-Span Fix & Smart Links** (this commit):
  - **P0 Fix (1-3 Year Events Cut Off)**: Root cause was twofold: (1) `minRibbonPx` dropped to small values at overview zooms, crushing text, and (2) `packTimelineLanes` packed adjacent short events into the same lane almost immediately because item duration was only 1-3 years while rendered ribbons occupy ~200px. Fixed by setting `minRibbonPx = Math.max(200, Math.min(280, pxPerYear * 3))` and extending each item's effective duration in `packedItems` using `visualMinYears`, guaranteeing adjacent events are assigned to separate lanes and never overlap or cut each other off.
  - **P0 Fix (Timeline Bar Lowering & Marker Room)**: Increased top Era bands bottom margin from `mb-6` (24px) to `mb-16` (64px), lowering the ruler track and pins. Realigned milestone pin beams and diamond caps so they sit cleanly above the rail line.
  - **P0 Fix (Masterwork Glassmorphism Tooltip at Top)**: Redesigned the scrubber hover date tooltip into a jewel-like floating pill at `top-[60px]` with double-ring specular shine, theme-specific glowing gradient backdrop (Sovereign gold, Voyager teal, Royal gilded ivory, Wiki crisp parchment), animated pulsing crystal beacon dot, and a micro-pointer arrow directing towards the temporal laser beam. Positioned safely in the 64px clearance between Era bands and ruler markers with zero overlap.
  - **P0 Fix (Smart Navigation Links between Calendar & Events)**: Added `focusTimelineEvent` to `useWorldStore` allowing 1-click deep-linking from any event page into Timeline or Annual Calendar. Built a smart navigation banner in `EventSpecificsViewer` with "View on Timeline" (jump camera + open inspector) and "Annual Calendar" shortcuts. Added a Fantasy Date Composer in `EventSpecifics` editor with calendar month insertion. Added an Annual Chronicle banner and interactive day popover modal in `AnnualCalendarView` for viewing and managing events on any given day.
  - All verified: `npm run build` ✅, `npm run typecheck` ✅, `npm run test` ✅ (51/51)

- **Phase P10: Freeform Custom Lore Attributes**:
  - **types.ts**: Added `customAttributes?: Record<string, string>` to `BaseEntity`
  - **EntityEditor.tsx**: Built `CustomAttributesEditor` component with drag-reorderable rows, inline edit on click, add/delete buttons, theme-aware styling (Royal/Wiki/Sovereign/Voyager)
  - **EntityViewer.tsx**: Added Custom Attributes display in right sidebar — responsive 2-column grid with key/value pairs, theme-aware colors
  - Zustand persist handles storage automatically via existing `nexus-world-storage`
  - All verified: `npm run build` ✅, `npm run typecheck` ✅, `npm run test` ✅ (51/51)

---

## 🚀 Next Quest

**Goal:** _Phase P5 — Sheet & Viewer Consistency Pass (Option 1)_

### 🔴 Active: Option 1 — Sheet & Viewer Consistency Pass
- [x] **EntityViewer Read-Mode Quick-Jump Rail:** Built collapsible sticky category nav rail on desktop and floating compass navigator on mobile/tablet with dynamic category indexing and Royal Codex auto-tab activation.
- [x] **Location Specifics Polish:** Defenses, hazards, notable landmarks, climate notes as structured bullet lists with notes (like TraitListEditor).
- [x] **Organization/Faction Specifics Polish:** Hierarchy ranks, assets, tenet lists as structured fields.
- [x] **Full 5-sided Pennant & Shield Vector Contours (`CharacterStatBlock.tsx`, `ViewerSectionCard.tsx`)**:
  - Replaced clipped CSS rectangular borders on the main CharacterStatBlock pennant container with an SVG dual gold polygon contour (`vectorEffect="non-scaling-stroke"`), fully restoring the angled bottom edges with zero border loss or pixelation.
- [x] **Viewer header buttons overlap & attribute score contour (`ViewerHeaders.tsx`, `CharacterStatBlock.tsx`, `ViewerSectionCard.tsx`)**:
  - In `ViewerHeaders.tsx`, switched `RoyalHeader`, `WikiHeader`, and `CodexHeader` from `md:flex-row` to `lg:flex-row`, stacking the title and action buttons on viewports below 1024px so the action buttons no longer overlap the title text on compact windows. Added `min-w-0 [overflow-wrap:anywhere] break-words` to `h1`.
  - In `CharacterStatBlock.tsx`, replaced clipped rectangular CSS borders on the 6 Attribute Score shield badges with an SVG `<polygon>` contour with `vectorEffect="non-scaling-stroke"`, fully drawing all 5 perimeter edges (including the bottom chevron slopes) with dual gold borders.
  - In `ViewerSectionCard.tsx`, added the same SVG 5-sided shield contour to the letter shield badge.
- [x] **Dropdown z-index / card overflow / editor buttons (`8207a39`)**: Nav dropdown panels now float cleanly above Tier 2 dossier tabs and page content. Cards (`ViewerSectionCard`) have `w-full min-w-0 max-w-full` and responsive padding. Vital Records / Inventory grids collapse at `md` breakpoint only. Editor header buttons wrap at `md`, labels shorten on `<sm`.
- **Item & Spell Specifics Polish:** Attunement/components, spell school, rarity tier as compact chips.

### 🟡 Queued: Option 2 — Session Codex & Campaign Play Tools
- **Session Recap Handout Export:** Clean printable/PDF session chronicle per session (title, date, attending characters, summary, notes). Like the lineage tree export — standalone HTML, no app chrome.
- **Timeline & Event Auto-Sync:** 1-click "Record as Chronos Event" inside a session log block to pin it onto the timeline ruler automatically.
- **Attendance, XP & Loot Log:** Per-session block: attending character checkboxes, milestone/XP awarded, acquired items linked to Codex entries.

### 🟡 Queued: Option 3 — Atlas & Cartography Deepening
- **Faction Territory Binding:** Link drawn polygon territories to Political/Religious/Magic factions so borders adopt the faction's sigil color dynamically.
- **Pin Clustering & Faction Filtering:** Toggle map pins by allegiance/faction, show travel route distances in fantasy leagues/days.
- **Anchor Pins to Entities:** Each map pin links back to a location entity — clicking it opens the entity dossier without navigating away from the map.

### 🟡 Queued: Option 5 — Writer & Storyteller Tools (Genre-Agnostic)
- **Story Arc / Chapter Planner:** Structured outline board mapping acts, chapters, scenes — each beat linked to characters, locations, and events. Works for any genre (sci-fi arcs, relationship progressions, fantasy quests).
- **Character Relationship Dynamics Tracker:** Track the emotional arc of a relationship over time between two characters. Mini-timeline per pair showing how they went from strangers → rivals → allies, etc.
- **World Rules & Laws Editor:** Dedicated space to document internal world logic: physics, magic systems, tech limits, social laws, cultural taboos. Each rule can link to entities that break or embody it. (Works for hard sci-fi, fantasy, modern realism alike.)

### 🟡 Queued: Option 6 — World Architecture & Setting Tools
- **Genre-Switchable Entity Templates:** A genre template system where character/entity sheets adapt their fields to the selected genre. "Fantasy" shows magic affinity; "Sci-Fi" shows cybernetics; "Modern/Realistic" shows career/social class. Users pick a template; fields adapt without breaking existing data.
- **Language & Naming Convention Builder:** Build constructed languages or naming rules for any context (Martian colony naming, elven kingdom conventions, 1920s crime family naming). Syllable patterns, forbidden sounds, example vocabulary.
- **World Premise & Tone Document:** A pinned master document per world: elevator pitch, genre tags, tone (dark/hopeful/satirical), inspirations, and thematic questions. Acts as the creative north star that all entries orbit.

### 🟡 Queued: Option 7 — Continuity & Export Tools
- **Continuity Conflict Detector:** Scans linked entities for logical contradictions (character born in Year 50 attending an event in Year 40; location "destroyed Year 200" referenced as active in Year 350). Flags issues passively without being prescriptive.
- **World Bible Export:** Export the entire Codex (or a filtered subset) as a clean, formatted World Bible document (PDF/HTML) — the kind you'd hand to a co-author, editor, artist, or publisher. Auto-structured from the entity hierarchy.
- **D&D-Specific Variant (Deferred):** A genre-specific extension of the Rolling Table system strictly for tabletop RPG use (encounter tables, NPC quirk tables, random dungeon events). Planned for a later phase as a D&D plugin/mode, not a core feature.

---

## ⚠️ Absolute Rules (Never Break)

- **100% Offline & Local — ZERO AI integrations:** The app is strictly local-first and offline. NEVER integrate, link to, embed, or call any AI model, AI API, cloud AI service, or AI-generated asset pipeline (images, text, suggestions from an external model). All content is authored by the user. All assets are uploaded locally. All suggestions/autocomplete come from the user's own Codex data. This applies permanently — no exceptions, no future "optional" AI toggles.
- **No backend:** All data in localStorage via Zustand persist (`nexus-world-storage`). No server, no database, no API calls to external services of any kind.

---

## Context

- **Branch:** main
- **Build:** `npm run build` ✅ (0 TS errors, 59/59 tests pass)
- **Dev:** `npm run tauri:dev` — primary (Vite + Tauri window)
- **OpenWolf hooks:** Active — anatomy, memory, buglog auto-maintained
- **Tauri v2:** Desktop app confirmed working (WebView2 on Windows)
- **No backend:** All data in localStorage via Zustand persist (`nexus-world-storage`)