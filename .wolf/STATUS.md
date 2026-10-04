---
description: session handoff, regenerate with /handoff when a quest finishes
budget_tokens: 1000
---
# STATUS — nexus-chronicle

> Single source of truth for resuming work. Read this FIRST when starting a session.
> Update this file at the end of every work phase so the next `/clear` resumes in 1 read.
> Last updated: 2026-10-04 (05:27)

---

## ✅ Done

- **Phase 0 cleanup** — Removed dead deps (RN/GenAI, ~330 packages), removed Vite `GEMINI_API_KEY` injection, added `src/index.css`, fixed CDN double-React risk, bumped Vite to 6.4.3 (0 vulnerabilities)
- **Phase P0 Core Fixes** —
  - Fixed **BUG-001**: Synchronized backlink scanning across all `paired*` fields, relationships, group affiliations, and legacy aliases in `backlinkUtils.ts`.
  - Fixed **BUG-005**: Synchronized Timeline date reading (`birthDate`/`deathDate` on Character, `startDate`/`endDate` on Event) in `TimelineView.tsx`.
  - Fixed **BUG-003**: Added visual truncation warning badge on `NexusTreeView.tsx` when tree exceeds depth 5, improved root/child discovery bidirectionally, and fixed living/ancestral status.
  - Fixed **Options World Reset**: Added missing `mapConnections` and `worldPhase` to reset payload in `OptionsView.tsx`.
  - Fixed **Vite Port Conflict**: Changed default server port to 5173 with `host: true` in `vite.config.ts`.
  - Fixed **TypeScript 0-Error Build**: Installed `@types/react` & `@types/react-dom`, resolved all interface inheritance errors (`TS2430`), added missing aliases (`tech`, `currency`, Location aliases). `npm run typecheck` and `npm run build` now pass with 0 errors.
- **Phase P1 UX Fixes** —
  - Fixed **BUG-004**: Replaced `window.prompt()` in `WorldMap.tsx` with full inline React modals for anchor placement and ley-line type selection. Marker creation routes through `handleCreate` for schema defaults.
  - Fixed **BUG-002**: Stabilized `DashboardView` insights with `seed` state + deterministic prime math. Added "Consult the Oracle" reroll button.
  - Fixed **BUG-003 UX**: Added collapse/expand chevron buttons on `NexusTreeView` nodes for navigating deep family trees.
- **Phase P2 Features & Enhancements** —
  - Implemented **P2 #8 Interactive Nexus Graph** (`NexusGraphView.tsx`) — Full SVG force-directed relationship graph supporting all 20 entity types. Features interactive force simulation, dynamic curved connection ribbons color-coded by connection kind (Family, Ally, Enemy, Member, Connected, Event, Location), Category Glow filters, category filters (Story, World, Groups, Details), zoom in/out, fit-to-view, pan, clickable node inspection card with deep backlink connections, double-click / "Open Entry" navigation, and multi-view toggle between Interactive Graph and Bloodline Tree in `NexusTreeView.tsx`.
  - Fixed **Tree Missing Entries Bug (Aurelius the Great)** — Implemented `getSafeParentId()` with recursive circular reference guards and strict type validation in `Sidebar.tsx`. Ensured orphaned children whose parents were deleted or invalid are safely classified as root items and never lost. Added self-healing `useEffect` in `Sidebar.tsx` to automatically sanitize corrupt `parentId` values. Updated `handleSaveDraft` and `handleDeleteToTrash` in `useWorldStore.ts` to reparent surviving children and prevent self-parenting or circular loops. Updated `NexusTreeView.tsx` root detection to prevent any character from vanishing.
  - Fixed **Permanent Locked Entry Bug** — Added `updateEntityLock(id, isReadOnly)` action to `useWorldStore.ts`. Updated `ViewerHeaders.tsx` (`CodexHeader`, `WikiHeader`, `RoyalHeader`) to render a prominent golden `Locked (Click to Unlock)` button on locked records and a discreet lock toggle on unlocked records, enabling users to unlock and edit protected records directly from the viewer with one click.
  - Implemented **Markdown + Wikilinks** — New `MarkdownEditor` and `MarkdownRenderer` components. `[[Entity Name]]` wikilinks are auto-linked in both editor and viewer. Editor has a split Write/Preview/Split mode toolbar with bold/italic/heading/list/wikilink buttons and keyboard-driven autocomplete dropdown. Viewer renders markdown with full prose styling for both Sovereign and Wiki themes.
  - Implemented **Keybinds System & Grimoire Modal** — Global keyboard shortcuts: `Ctrl+Enter` / `Cmd+Enter` to commit draft to chronicle, `Ctrl+S` to quick-save, `Ctrl+E` to toggle edit mode, `Escape` to abandon scrawl or dismiss modals, `Ctrl+K` to focus sidebar search, `Alt+1` to `Alt+7` to switch system realms, and `?` to summon the shortcuts grimoire. Added discreet "Keybinds" button in top header next to ThemeSwitcher. Created responsive `KeybindsModal` component supporting Sovereign, Wiki, and Royal Codex themes.
  - Implemented **Sidebar Drag & Drop Tree Reparenting & Reordering** — Native HTML5 drag-and-drop on `Sidebar.tsx` `EntityItem`. Supports dragging an entry onto another entry to reparent as a nested child (`parentId = target.id`), dragging top or bottom edge to reorder as sibling before/after, and dragging onto category/type header to unparent to root level. Added circular dependency detection (`isDescendant` check) to prevent cycles. Added `reorderAndReparentEntity` action in `useWorldStore.ts`.
  - Fixed **Belongs Under Self-Reference Bug** — Added `excludeIds` prop to `SmartSelect` and passed `excludeIds={[entity.id]}` in `EntityEditor` to prevent entities from selecting themselves as parent.
  - Implemented **Atlas Anchor Smart Selection & Duplicate Prevention (BUG-007)** (`WorldMap.tsx`) — Click-to-anchor modal features two tabs: "Pin Existing Location" (searchable list of existing locations with anchored status badge, and two-step "Confirm Replace" relocation warning if already anchored) and "Create New Location" (with live warning hint and hard submit block against identical/duplicate names across the codex). Auto-incremented default entity names in `handleCreate` (`useWorldStore.ts`) to avoid identical name collisions across all creation paths.
  - Implemented **P2 #11 Multi-World Management & Multiverse Registry** (`useWorldStore.ts`, `RealmSwitcher.tsx`, `NewRealmModal.tsx`, `OptionsView.tsx`) — Full multi-campaign world architecture allowing worldbuilders to create, clone, switch, and manage multiple independent realms. Features:
    - **Sidebar Realm Switcher Header**: Interactive dropdown widget displaying active realm name, phase aura pill, entity count, and quick switch selector with search.
    - **Found New Realm Modal**: Custom realm creation dialog with world name, synopsis/preface, starting World Phase selector with live visual color previews, and starting Atlas map preset selection (High Fantasy Cartography, Archaic Archipelago, Celestial Starchart, or custom URL).
    - **Multiverse Registry in System Settings**: Dedicated management grid to enter realms, fork/duplicate campaigns with full entity preservation, rename and edit lore, export individual realm JSONs, or delete worlds (with protection against deleting the last remaining realm).
    - **Universal Backup & Multiverse Archive**: Export single realms or the complete multiverse universe archive (`UniverseArchive`) into a single file. Smart JSON import automatically detects single realms vs universe archives, offering the option to import as a new separate realm or overwrite the active realm.
    - **Zero-Loss Data Migration**: Backward-compatible persist rehydration that automatically encapsulates legacy single-world stores into the new multi-world schema without data loss.
  - Implemented **P2 #11 3-Way Synergy Save System** (`assetStore.ts`, `nexusArchive.ts`, `nexusBeam.ts`, `NexusBeamModal.tsx`, `NexusImage.tsx`, `AssetImageUploader.tsx`, `OptionsView.tsx`) — Full cross-device portable save system:
    - **IndexedDB Asset Vault** (`assetStore.ts`): Binary blob storage for 100+ uncompressed HD images bypassing localStorage 5MB cap.
    - **.nexus Archive Format** (`nexusArchive.ts`): Single portable container bundling lore JSON + all asset binaries with exact byte offsets. Supports single realm and full universe export/import.
    - **NexusBeam P2P Transfer** (`nexusBeam.ts`): WebRTC DataChannel-based direct device-to-device binary streaming (no cloud, global via STUN, no size limits).
    - **NexusBeamModal** (`NexusBeamModal.tsx`): Full UI for Send/Receive/File modes including WebRTC offer/answer token exchange and real-time progress display.
    - **System Settings Integration** (`OptionsView.tsx`): "Nexus Archive (.nexus)" section in System Settings with Active Realm (.nexus), Full Multiverse (.nexus), Restore .nexus, and NexusBeam (P2P) buttons alongside classic JSON backup section.
  - Fixed **"Found a New Realm" Modal Squished in Sidebar Bug** (`NewRealmModal.tsx`, `NexusBeamModal.tsx`): Wrapped modals in `createPortal(..., document.body)` with `z-[9999]`. Previously, rendering inside `RealmSwitcher` placed the modal inside `<aside className="w-56 backdrop-blur-md">` where CSS `backdrop-filter` forced the sidebar to act as the containing block for `fixed` positioning, squishing the modal into the 224px sidebar. Portaling to `document.body` ensures it renders as a full-viewport centered overlay across the main page.
  - Implemented **Dissolve Realm Confirmation Modal & Hardened Deletion** (`DeleteRealmModal.tsx`, `OptionsView.tsx`, `RealmSwitcher.tsx`, `useWorldStore.ts`): Replaced browser `confirm()` with custom in-app modal featuring warning text, entity obliteration count, and sole-realm protection. Added delete actions to both System Settings Multiverse Registry and Sidebar Realm Switcher dropdown.
  - Fixed **Chromium/Edge Blob GUID Download Bug** (`nexusArchive.ts`, `useWorldStore.ts`): Created `downloadFileToDevice` using the native File System Access API (`showSaveFilePicker`) for desktop Chromium, Data URL fallback for files under 25MB, and native mobile share. Bypasses Edge/Chrome's bug where `blob:` URLs discard `a.download` attributes and save files as raw GUID strings (e.g. `278eaac1-...`). All downloads now save with proper file names and `.nexus` / `.json` extensions.
  - Implemented **P1 WorldMap Custom Floating Modals & Full Schema Anchor Creation** (`WorldMap.tsx`): Completely replaced all `window.prompt()` usage with custom inline React modals portaled to `document.body` (`z-[9999]`). Creating new locations on the map routes through `handleCreate('location', name, false)` to ensure 100% complete schema defaults before applying coordinates. Also supports pinning existing locations with duplicate detection.
  - Implemented **P1 Journey View Quick Pinning & Location Editor Shortcut** (`JourneyView.tsx`): Added direct "Pin" and "Re-pin" quick actions on Origin and Destination dropdowns as well as the Unanchored Warning banner. Worldbuilders can open an interactive full-map canvas modal (`createPortal`), click anywhere to set coordinates, and commit directly to `world.entities` with live percentage readouts without leaving The Grand Voyager. Also added a 1-click "Editor" button to navigate directly to the location and immediately enter edit mode.
  - Fixed **EntityEditor Layout, Spacious Separate Cards & DM Notes Markdown** (`EntityEditor.tsx`, `AssetImageUploader.tsx`, `EntityViewer.tsx`): Kept "Portrait & Imagery" and "Description & History" as two distinct spacious `EditorGroup` cards. Portrait card uses `col-span-12 max-w-2xl mx-auto` for a centered, expanded dropzone/preview. Description card uses `col-span-12` for full-width MarkdownEditor. Fixed DM Confidential Notes in viewer: replaced raw `<p className="font-mono">` with `<MarkdownRenderer>` so headers, bold, strikethrough, and wikilinks render with full prose styling.
  - Fixed **Royal Codex Contrast & Readability Pass**: Eliminated yellow `#fef08a` text on parchment/cream backgrounds across all views (`JourneyView`, `TimelineView`, `NexusTreeView`, `DashboardView`, `OptionsView`, `WorldMap`, `NexusGraphView`, `ViewerHeaders`, `WikiInfobox`, `CharacterStatBlock`, `KeybindsModal`). Swapped headings to dark crimson `#3d0a10`, accents to deep crimson `#70121e`, and button text on crimson backgrounds to warm ivory `#fff8e7`.
  - Implemented **Extensible Theme Architecture & Primitives**: Built `src/theme/types.ts` (`ThemeDefinition`), `themeRegistry.ts`, `useTheme()`, and targeted UI primitives (`ThemeButton`, `ThemeCard`, `ThemeBadge`). Themes can now bundle completely different typography (serif, sans, mono), layout frames (book padding, wood grain, glassmorphism), color palettes, and ornate flourishes (`royal-filigree`, `tech-corners`), allowing new themes to be created in a single file without modifying views.
  - Implemented **Universal Two-Way Bidirectional Relationship Sync**: Created `src/utils/bidirectionalSync.ts` with exhaustive pairwise rules across all 20 entity types. Saving an entity now automatically synchronizes reverse relation fields on all connected entities (e.g. Melly adding Bébé Tigre as child updates Bébé Tigre's parents; adding Curse of the Tigrito as a boon updates the condition's affected characters). Integrated deletion reference cleanup, active drafts synchronization, persist rehydration auto-healing for legacy records, and updated `CharacterSpecificsViewer.tsx` to display real inventory and boons/afflictions in Royal Codex mode.
  - Implemented **CharacterStatBlock Theme Adaptation & Redundancy Removal** (`CharacterStatBlock.tsx`, `EntityViewer.tsx`): Completely overhauled the non-Royal character sidebar stat blocks. Removed all redundant duplicate fields (name, biography, vital records, boons/inventory, interpersonal links) already shown in the viewer cards. Sovereign theme now displays a dark glassmorphic card with a glowing pulse vitality badge, high-contrast `#fef08a` radar chart, and modern 3x2 attribute tiles with calculated modifiers. Wiki theme displays a clean, crisp parchment infobox with high-contrast radar chart and attribute grid. Royal Codex is 100% untouched and pixel-identical.
  - Implemented **Universal Image Duplication & Living Entry Portraits** (`WikiInfobox.tsx`, `CharacterStatBlock.tsx`, `EntityViewer.tsx`): Images now appear inside sidebar cards and stat blocks across all themes. Replaced the empty grey globe placeholder in `WikiInfobox` with `NexusImage` when `entity.imageUri` is set. Added dedicated portrait illustration frames to `CharacterStatBlock` for living character entries across Wiki and Sovereign modes (matching `WikiInfobox` proportions with fallback placeholders when empty). Added portrait display to Sovereign and Royal Record Vitals cards.
  - Implemented **Header Layout Balancing & Image Crop / Reposition System** (`ViewerHeaders.tsx`, `ImageCropModal.tsx`, `AssetImageUploader.tsx`):
    - Removed redundant duplicate thumbnail images next to entry names in `ViewerHeaders.tsx` (`CodexHeader`, `WikiHeader`, `RoyalHeader`), keeping images focused in their dedicated sidebars, infoboxes, and vitals cards.
    - Scaled down oversized `text-[7rem]` typography in `CodexHeader` to clean, balanced responsive sizing (`text-5xl md:text-6xl lg:text-7xl`) with `leading-[0.9]`.
    - Created `ImageCropModal.tsx` (`createPortal` overlay) with HTML5 canvas export, interactive drag-to-pan with boundary clamping, zoom slider + mouse wheel zoom, aspect ratio modes (1:1 Card Standard, 4:5 portrait, 16:9 wide), rule-of-thirds composition grid, and direct integration with the IndexedDB asset store.
    - Integrated crop modal into `AssetImageUploader.tsx` with automatic modal summon on file upload/drop, "Use Full Original" option, and a 1-click "Crop / Center" repositioning button on existing images.
    - Synchronized **1:1 Visual Parity between Editor & Viewing Mode** (`AssetImageUploader.tsx`, `CharacterStatBlock.tsx`, `EntityViewer.tsx`, `WikiInfobox.tsx`, `ImageCropModal.tsx`): Replaced previously mismatched containers (`aspect-[16/10]` in editor vs `h-56` in viewer vs `4:5` in crop tool) with unified `aspect-square` (1:1) and `rounded-2xl` styling across the entire suite. Crop modal defaults to `1:1 (Card Standard)` so what is cropped in the modal matches the editor card preview and the viewing mode card pixel-for-pixel.
- **Phase P3 Developer & Agent Workflow Stack** —
  - **Vitest Test Suite** (`vitest` + `@vitest/ui`): Sub-second test runner (`npm run test`) validating bidirectional relations, SQLite recursive graph checks, WCAG contrast ratios, and `.nexus` container roundtrips (4 suites, 9 tests in ~200ms).
  - **SQLite In-Memory Graph Verification** (`graphSqliteVerification.ts`): Better-sqlite3 engine validating 20-entity relationship graphs, detecting circular ancestry loops via Recursive CTEs, and catching dangling cross-entity pointers.
  - **Automated WCAG Theme Contrast Suite** (`themeContrast.test.ts`): Algorithmic luminance and contrast calculations guaranteeing AA/AAA readability across Sovereign, Wiki, and Royal Codex modes and preventing illegible yellow-on-parchment regressions.
  - **Lossless `.nexus` Container Archive Test** (`nexusArchive.test.ts`): Automated testing of `manifest.json` packaging, `STORE` uncompressed image bundling, and `fflate` binary unpack fidelity.
  - **Zero-Friction Dev State Sync Engine** (`vite.config.ts`, `useWorldStore.ts`): Lightweight Vite dev plugin listening on `POST /__dev_state` coupled with debounced Zustand store subscriber in `import.meta.env.DEV`. Automatically updates `.dev-state.json` silently as worldbuilders edit lore without adding any production bundle size or backend dependencies.
  - **Workspace-Scoped MCP Plugin (`nexus-chronicle-tools`)** (`.agents/plugins/nexus-chronicle-tools/`): Namespaced, workspace-scoped Antigravity MCP integration hosting `nexus-openwolf` (`tools/openwolf-mcp.mjs`) and `nexus-state-inspector` (`tools/state-inspector-mcp.mjs`). Guarantees zero global path collisions or pollution in other IDE projects.
  - **State Inspector MCP & Dev Snapshot UI** (`tools/state-inspector-mcp.mjs`, `OptionsView.tsx`): 1-click `EXPORT DEV SNAPSHOT (.dev-state.json)` in System Settings and MCP inspection tools (`get_active_realm_summary`, `query_dev_entities`) for live campaign inspection.
- **Phase P4 Tauri v2 Desktop Packaging** —
  - **Tauri v2 Scaffold** (`src-tauri/`): Full `cargo tauri init` scaffold with `Cargo.toml` (nexus-chronicle, `tauri-plugin-fs`, `tauri-plugin-dialog`, `tauri-plugin-shell`, `tauri-plugin-log`), `build.rs`, and `src/main.rs` + `src/lib.rs` registering all plugins.
  - **Window Configuration** (`tauri.conf.json`): App ID `com.haurukyun.nexuschronicle`, 1280×800 default, 900×600 minimum, centered, resizable. Asset protocol enabled (`assetProtocol.enable: true`, scope `**`) for local image display (portraits, maps). CSP permits `asset:`, `blob:`, `data:`, and Google Fonts.
  - **Capabilities** (`src-tauri/capabilities/default.json`): Full `fs:*`, `dialog:allow-open/save`, `shell:allow-open` permission set using correct Tauri v2 identifiers. Scoped to `appdata`, `download`, and `document` directories.
  - **PATH injection npm scripts**: `tauri:dev` and `tauri:build` scripts self-inject `~/.cargo/bin` into PATH at runtime so they work regardless of whether the terminal was opened before or after Rust was installed.
  - **Desktop app confirmed working**: App launches with native chrome, displays all UI and data correctly in Tauri WebView (WebView2 on Windows).
  - **CAS + Project Vault (Phase 2)** (`tauriAssetVault.ts`, `assetStore.ts`, `lib.rs`): Two-tier asset storage. L1 = IndexedDB (always); L2 = disk vault at `$APPDATA/.../assets/<hash>.<ext>`. Every `saveAsset()` write-throughs to disk. `resolveAssetUrl()` resolves via `convertFileSrc()` on desktop for zero-copy WebView2 streaming. Lazy `promoteAssetToDisk()` promotes IDB-only blobs on first render. Both tiers mirrored on delete and prune. Custom Rust command `get_app_data_dir` registered via `tauri::generate_handler!` without adding `tauri-plugin-path`.
- **Initial Architecture** — Full entity type system (20 types), Zustand persist store, editor/viewer split per entity type
- **Roleplay Theme V1** — `royal-codex` theme with parchment textures, quill pen overlay, woodgrain bg
- **Multi-Theme system** — `sovereign` (dark), `wiki` (light), `royal-codex` (fantasy parchment)
- **World Phase Aura** — 5 world phases (creation, golden, shadow, eclipse, ruin) each applying CSS filter + bg overlay
- **Map + Marker System** — WorldMap with click-to-place location anchors and connection lines (trade/magic/diplomatic/war)
- **Timeline View** — Chronos timeline renders character lifespans and dated events as horizontal ribbons
- **Nexus Tree View** — Character family/lineage tree with recursive depth rendering
- **Journey View (P2 #10)** — Travel distance calculator with interactive Atlas coordinate pickers in Location editor (`LocationSpecifics.tsx`), trajectory projection mini-map in `JourneyView.tsx`, auto-calculated league distance from pin coordinates, manual override, terrain multipliers, party logistics (rations/camps)
- **Backlink System** — `backlinkUtils.ts` performs deep cross-entity backlink scanning
- **GitHub repo** — https://github.com/Haurukyun/Nexus-Chronicle (main branch)

---

## 🚀 Next phase

**Goal:** _Phase P5: Layout / Theme Decoupling — In Progress_

### Completed this session
- **ThemeDefinition.layoutMode** — Added `LayoutMode = 'studio' | 'wiki' | 'manuscript'` type to `src/theme/types.ts` and `layoutMode` field to `ThemeDefinition` interface
- **Theme Registry** — Each theme now declares its layout mode: `sovereign → 'studio'`, `wiki → 'wiki'`, `royal-codex → 'manuscript'`, `grand-voyager → 'studio'`
- **useTheme() hook** — Now exposes `layoutMode: LayoutMode` and `themeId: ThemeMode` directly. Components read `layoutMode` for structure, `t.*` for visuals, `themeId` for per-theme identity
- **App.tsx shell** — All structural geometry reads from `t.layout.*` and `t.button.*` tokens — zero raw `theme === 'royal-codex'` layout guards remain in App.tsx
- **Full `isWikiMode` / `isRoyal` / `isSovereign` / `isVoyager` deprecation** — Entire codebase migrated from legacy boolean flags to canonical `useTheme()`. Every affected file (EditorGroup, LocationSpecifics, LocationSpecificsViewer, LinksDisplay, ImageCropModal, FormToggle, Sidebar, ExpandedImageModal, ThemeSwitcher, DashboardView, NexusGraphView, OptionsView) now reads `themeId` / `layoutMode` directly.
- **Grand Voyager theme full redesign** — Complete palette overhaul: dark jungle-canopy app bg (`#090d08`), dark mahogany timber sidebar (`#180c04`), tropical jungle-green header (`#0c1a0e`), teal-jade accent (`#2dd4bf`), warm parchment text (`#f0dca8`), brass-doubloon primary buttons. Removed cold blue/navy palette entirely.
- **TropicalSceneBackground** (`src/components/ui/TropicalSceneBackground.tsx`) — Pure SVG/CSS procedural tropical cove scene: golden-hour sky gradient, sun with rotating rays and outer glow, soft blurred clouds, distant headland silhouettes, 3-layer animated ocean waves with foam crests, glittering sun-path reflection on water, sandy beach with ripple lines, distant ship, bird silhouettes, and glassmorphism overlay. No trees (removed at user request). Injected in `App.tsx` as `absolute inset-0` behind main content when `themeId === 'grand-voyager'`.

### Key known gaps / potential next features
1. **Grand Voyager card/panel transparency** — Cards (`t.card.base`, `t.card.panel`) use dark timber backgrounds. Consider making them semi-transparent glassmorphic panels so the tropical scene bleeds through (`bg-[#140a02]/60 backdrop-blur-sm`) for even more immersion.
2. **App icon** — Replace placeholder icons in `src-tauri/icons/` with Nexus Chronicle branded artwork
3. **`git push` pending** — branch is multiple commits ahead of origin
4. **System views theme usage** — Some system views may still have residual legacy `isWikiMode` prop references or computed booleans; audit if issues appear

### Closed decisions
- State management: **Zustand with `persist` middleware** (localStorage-based, no backend)
- Styling: **TailwindCSS** (inline class strings) — NOTE: no `tailwind.config.js` found; may be using CDN or Vite plugin
- Build tool: **Vite 6 + @vitejs/plugin-react**
- React version: **19.2.3**
- No database — all data lives in browser localStorage via Zustand persist
- Markdown rendering: **marked** + **DOMPurify** (installed, no prose external lib needed)

### Open decisions
- Should `.wolf/` be committed to git? (currently untracked, `.wolf/.gitignore` excludes machine-state but not core files)
- What is the next feature to build?


---

## 📁 Active architecture

- **Stack:** React 19, TypeScript 5.8, Vite 6, Zustand 5, TailwindCSS 3, Lucide React, **Tauri v2** (`tauri-plugin-fs`, `tauri-plugin-dialog`, `tauri-plugin-shell`, `tauri-plugin-log`)
- **Entry:** `index.html` → `src/index.tsx` → `src/App.tsx`
- **State:** `src/store/useWorldStore.ts` — single Zustand store, persisted to localStorage under key `nexus-world-storage`
- **Types:** `src/types.ts` — `EntityType` union (20 types), `WorldEntity` = union of all specifics, `WorldData` = `{ name, entities[], trash[], mapImage, mapConnections[], worldPhase }`
- **Sidebar:** `src/components/layout/Sidebar.tsx` — categorized entity list with search, create, delete-to-trash
- **Entity flow:** Sidebar → `handleOpenEntity(id)` → tabs in `App.tsx` → `EntityViewer` (view) or `EntityEditor` (edit)
- **Editor specifics:** `src/components/editor/specifics/` — one file per EntityType, registered in `EntitySpecificsRegistry.tsx`
- **Viewer specifics:** `src/components/viewer/specifics/` — one file per EntityType, registered in `EntitySpecificsViewerRegistry.tsx`
- **Themes:** `ThemeMode` = `'sovereign' | 'wiki' | 'royal-codex' | 'grand-voyager'`; theme in Zustand store; `useTheme()` hook exposes `{ t, themeId, layoutMode }`. All legacy boolean flags (`isWikiMode`, `isRoyal`, etc.) removed.
- **Views:** Dashboard, Timeline, NexusTree, Journey, WorldMap, Trash, Options — all system tabs, never closed
- **Patterns:**
  - All entity-specific fields use `paired*` prefix convention for cross-entity link arrays
  - All `paired*` arrays store **entity IDs** (strings), not names
  - `groupConnections` object on every entity stores 5 group-type buckets (political/organization/religious/magic/science), each with 5 role arrays
  - `handleCreate()` in store initializes all fields for the given type; do NOT create entities without going through this action

---

## ⚠️ External blockers (don't block coding)

- GitHub repo requires manual `git push` (1 commit pending: `a42247f`)
- No CI/CD pipeline; deployment is manual
- No backend — all data is localStorage; no multi-user or sync capability

---

## 🔧 Useful commands

```bash
npm run tauri:dev    # Launch desktop app (starts Vite + Tauri window) ← PRIMARY DEV COMMAND
npm run dev          # Vite only (browser, fast hot-reload for UI-only work)
npm run build        # Production build to dist/
npm run tauri:build  # Full desktop bundle (dist/ + Tauri installer)
npm run typecheck    # Run tsc --noEmit
npm run test         # Vitest unit tests
git log --oneline    # Review commit history
git push             # Push pending commits
```

---

## 📚 References (read IF needed)

- `.wolf/cerebrum.md` — User Preferences + Do-Not-Repeat + Decision Log
- `.wolf/anatomy.md` — token-efficient file index
- `.wolf/buglog.json` — known bugs + fixes
- `src/types.ts` — full type definitions (923 lines, ~14k tok)
- `src/store/useWorldStore.ts` — full store + actions (1006 lines, ~13k tok)
