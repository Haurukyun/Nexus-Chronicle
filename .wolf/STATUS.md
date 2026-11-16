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

- **WorldMap/Atlas — Z-Index Fix & Top Toolbar Redesign** (this commit):
  - Fixed z-index hierarchy: top toolbar now `z-[100]` with `data-interactive-ui=true`, WorldMap elements capped at `z-[50]` (pins), `z-[35]` (dossier/filters), `z-[25]` (HUDs), `z-[15]` (ley-lines)
  - Redesigned top toolbar buttons (Jump, Scratchpad, Keybinds, Theme) with premium glassmorphism: gradient backgrounds, shine overlays, hover scale animations, enhanced shadows, theme-aware styling
  - ThemeSwitcher dropdown raised to `z-[110]` to stay above toolbar
  - All verified: `npm run build` ✅, `npm run typecheck` ✅, `npm run test` ✅ (51/51)

- **Chronos Timeline — Short-Span Event Honesty, Axis De-Clutter & Top Toolbar Glassmorphism** (commit `15a2f97`):
  - **P0 Fix — Eliminate 100-Year Visual Distortion for Short Events**: Removed artificial `minWidth: minRibbonPx` (200px) from the ribbon container which previously stretched 1–4 year events across a century on overview zoom levels. Short-span events (`actualWidthPx < 140px` or `end - start <= 4`) now render a true chronological duration bracket (`[Math.max(actualWidthPx, 10)px]`) showing the exact years with an anchored, non-stretching callout tag. Titles and dates remain 100% legible without misleading visual spans. Long events continue to render proportional ribbons.
  - **P0 Fix — Axis Clutter & Collision Elimination**: Lowered `chronos-ruler-track` with 96px clearance (`mb-24`) below Era bands. Milestone diamond markers now sit directly on the rail line, while milestone flag labels are elevated above the diamonds (`bottom-6`), keeping the rail line and tick marks completely unblocked.
  - **P0 Fix — Playhead & Scrubber Collision Elimination**: Anchored the playhead cap marker (`Yr {currentYear}`) with a dedicated vertical tier close to the rail (`bottom-1.5`) with needle indicator, preventing collision with milestone flags. Elevated the mouse hover scrubber date tooltip to `top-[62px]`, giving 60px+ of clear air above the rail markers so it never covers them.
  - **P0 Fix — Top Action Toolbar Glassmorphism Redesign**: Redesigned Jump, Scratchpad, Keybinds, and ThemeSwitcher from bulky, dated dark-slate bubbles with harsh yellow text into a cohesive, floating frosted glass dock with refined typography (`font-medium text-xs`), matching pill geometry, subtle specular borders, and seamless theme integration.
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