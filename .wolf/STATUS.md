---
description: session handoff, regenerate with /handoff when a quest finishes
budget_tokens: 1000
---
# STATUS — nexus-chronicle

> Single source of truth for resuming work. Read this FIRST when starting a session.
> Update this file at the end of every work phase so the next `/clear` resumes in 1 read.
> Last updated: 2026-11-19 (05:00)

---

## ✅ Done

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

**Goal:** _Phase P5: Advanced World Simulation & Narrative Tools_

- Awaiting user instruction or refinement on Phase P5 features (e.g. Faction Influence & Territory Control Simulator, Random Lore & Encounter Generator Tables, or Soundscape / Ambience Audio Mixer for tabletop sessions).

---

## Context

- **Branch:** main
- **Build:** `npm run build` ✅ (0 TS errors, 59/59 tests pass)
- **Dev:** `npm run tauri:dev` — primary (Vite + Tauri window)
- **OpenWolf hooks:** Active — anatomy, memory, buglog auto-maintained
- **Tauri v2:** Desktop app confirmed working (WebView2 on Windows)
- **No backend:** All data in localStorage via Zustand persist (`nexus-world-storage`)