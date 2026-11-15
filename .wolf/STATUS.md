---
description: session handoff, regenerate with /handoff when a quest finishes
budget_tokens: 1000
---
# STATUS — nexus-chronicle

> Single source of truth for resuming work. Read this FIRST when starting a session.
> Update this file at the end of every work phase so the next `/clear` resumes in 1 read.
> Last updated: 2026-11-15 (08:30)

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

- **Chronos Timeline — 1-Year Event Ribbon Text + Timeline Bar Overlap Fix** (this commit):
  - **Fix**: 1-year span events (e.g., 2015–2016) now show full name on hover. Used CSS variable (`--ribbon-width`) for base width so Tailwind's `hover:width-auto` can override inline style (inline styles have higher specificity). Increased hover min-width from 280px → 320px.
  - **Fix**: Timeline bar (`chronos-ruler-track`) no longer overlaps scrubber hover tooltip. Increased `mb-16` → `mb-24` (16px → 24px gap) so tooltip at `top-16` has breathing room before ribbon canvas starts.
  - All verified: `npm run build` ✅, `npm run typecheck` ✅, `npm run test` ✅ (51/51)

---

## 🚀 Next Quest

**Goal:** _Phase P10: Freeform Custom Lore Attributes_
- Add `customAttributes: Record<string, string>` to `BaseEntity` in `types.ts`
- Key-value editor card in `EntityEditor.tsx`
- Structured badge/table display in `EntityViewer.tsx`
- Zustand persist handles storage automatically

**Files to touch:** `src/types.ts`, `src/components/editor/EntityEditor.tsx`, `src/components/viewer/EntityViewer.tsx`, `src/components/editor/specifics/` (per-type specifics if needed)

---

## Context

- **Branch:** main (clean working tree except .wolf/ auto-updates)
- **Build:** `npm run build` ✅ (0 TS errors, 51/51 tests pass)
- **Dev:** `npm run tauri:dev` — primary (Vite + Tauri window)
- **OpenWolf hooks:** Active — anatomy, memory, buglog auto-maintained
- **Tauri v2:** Desktop app confirmed working (WebView2 on Windows)
- **No backend:** All data in localStorage via Zustand persist (`nexus-world-storage`)