---
description: session handoff, regenerate with /handoff when a quest finishes
budget_tokens: 1000
---
# STATUS — nexus-chronicle

> Single source of truth for resuming work. Read this FIRST when starting a session.
> Update this file at the end of every work phase so the next `/clear` resumes in 1 read.
> Last updated: 2026-09-30

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

**Goal:** _Phase P2 Continued: Multi-World management (P2 #11)_

### Key known gaps / potential next features
1. Multi-World management — World switcher for multiple campaigns (P2 #11)
2. `git push` pending — branch is multiple commits ahead of origin (BUG-006)
3. `.wolf/`, `.claude/`, `.cursor/`, `.opencode/`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` are untracked — decide whether to commit or gitignore them

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

- **Stack:** React 19, TypeScript 5.8, Vite 6, Zustand 5, TailwindCSS 3, Lucide React
- **Entry:** `index.html` → `src/index.tsx` → `src/App.tsx`
- **State:** `src/store/useWorldStore.ts` — single Zustand store, persisted to localStorage under key `nexus-world-storage`
- **Types:** `src/types.ts` — `EntityType` union (20 types), `WorldEntity` = union of all specifics, `WorldData` = `{ name, entities[], trash[], mapImage, mapConnections[], worldPhase }`
- **Sidebar:** `src/components/layout/Sidebar.tsx` — categorized entity list with search, create, delete-to-trash
- **Entity flow:** Sidebar → `handleOpenEntity(id)` → tabs in `App.tsx` → `EntityViewer` (view) or `EntityEditor` (edit)
- **Editor specifics:** `src/components/editor/specifics/` — one file per EntityType, registered in `EntitySpecificsRegistry.tsx`
- **Viewer specifics:** `src/components/viewer/specifics/` — one file per EntityType, registered in `EntitySpecificsViewerRegistry.tsx`
- **Themes:** `ThemeMode` = `'sovereign' | 'wiki' | 'royal-codex'`; theme in Zustand store; `isWikiMode` is a derived boolean flag
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
npm run dev          # Start Vite dev server
npm run build        # Production build to dist/
npm run typecheck    # Run tsc --noEmit (no emit, just check)
git log --oneline    # Review commit history
git push             # Push pending Phase 0 cleanup commit
```

---

## 📚 References (read IF needed)

- `.wolf/cerebrum.md` — User Preferences + Do-Not-Repeat + Decision Log
- `.wolf/anatomy.md` — token-efficient file index
- `.wolf/buglog.json` — known bugs + fixes
- `src/types.ts` — full type definitions (923 lines, ~14k tok)
- `src/store/useWorldStore.ts` — full store + actions (1006 lines, ~13k tok)
