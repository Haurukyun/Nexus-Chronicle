---
description: session handoff, regenerate with /handoff when a quest finishes
budget_tokens: 1000
---
# STATUS — nexus-chronicle

> Single source of truth for resuming work. Read this FIRST when starting a session.
> Update this file at the end of every work phase so the next `/clear` resumes in 1 read.
> Last updated: 2026-11-15 (08:45)

---

## ✅ Done

- **P0 Fixes — Backlinks Symmetry & Dual Event Date Surface De-duplication** (this commit):
  - **Backlinks Symmetry**: Updated `backlinkUtils.ts` to properly scan and categorize Character relations (`pairedCurrentLocationNew`, `pairedOriginLocationNew`, `pairedDemiseLocationNew`, `pairedRace`, `pairedProfession`, `pairedSkills`), Location (`livingCharacterIds`, `originatedCharacterIds`, `deceasedCharacterIds`, `succeedingLocationIds`, `precedingLocationIds`), Species (`pairedCharacter`), Occupation (`pairedCharacter`), Ability (`pairedCharacterSkills`), and Item.
  - **Type Isolation**: Fixed critical bug where non-event entities with `pairedCharacter` were erroneously pushed into `results.events`.
  - **Viewer Integration**: Updated `LocationSpecificsViewer`, `SpeciesSpecificsViewer`, and `OccupationSpecificsViewer` to merge backlinks into their respective displays (natives, residents, passed here, members, and practitioners).
  - **Event Date Surface De-duplication**: Removed redundant `FormInput` rows in `EventSpecifics.tsx`. Added direct text input with one-click clear button (`X`) directly in `FantasyDatePicker.tsx` for the active target, allowing seamless point/span toggling and date editing without duplicated inputs.
  - **Loop Immunity**: Hardened `detectCalendarForDate` in `FantasyDatePicker.tsx` to prioritize `defaultCal` when already matching, eliminating any oscillation risk.
  - **Test Suite**: Added `src/utils/backlinkUtils.test.ts` (4 new tests, 55/55 passing).

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

**Goal:** _Phase P11: Lore Search & Global Command Palette Enhancements_
- Extend CommandPalette with custom attribute search (`attr:key=value`)
- Add quick-create from palette with pre-filled custom attributes
- Fuzzy search across all entity fields including custom attributes

**Files to touch:** `src/components/CommandPalette.tsx`, `src/utils/searchUtils.ts`

---

## Context

- **Branch:** main (clean working tree except .wolf/ auto-updates)
- **Build:** `npm run build` ✅ (0 TS errors, 51/51 tests pass)
- **Dev:** `npm run tauri:dev` — primary (Vite + Tauri window)
- **OpenWolf hooks:** Active — anatomy, memory, buglog auto-maintained
- **Tauri v2:** Desktop app confirmed working (WebView2 on Windows)
- **No backend:** All data in localStorage via Zustand persist (`nexus-world-storage`)