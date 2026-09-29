---
description: session handoff, regenerate with /handoff when a quest finishes
budget_tokens: 1000
---
# STATUS — nexus-chronicle

> Single source of truth for resuming work. Read this FIRST when starting a session.
> Update this file at the end of every work phase so the next `/clear` resumes in 1 read.
> Last updated: 2026-09-29

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
- **Initial Architecture** — Full entity type system (20 types), Zustand persist store, editor/viewer split per entity type
- **Roleplay Theme V1** — `royal-codex` theme with parchment textures, quill pen overlay, woodgrain bg
- **Multi-Theme system** — `sovereign` (dark), `wiki` (light), `royal-codex` (fantasy parchment)
- **World Phase Aura** — 5 world phases (creation, golden, shadow, eclipse, ruin) each applying CSS filter + bg overlay
- **Map + Marker System** — WorldMap with click-to-place location anchors and connection lines (trade/magic/diplomatic/war)
- **Timeline View** — Chronos timeline renders character lifespans and dated events as horizontal ribbons
- **Nexus Tree View** — Character family/lineage tree with recursive depth rendering
- **Journey View** — Travel distance calculator between locations using map coordinates
- **Backlink System** — `backlinkUtils.ts` performs deep cross-entity backlink scanning
- **GitHub repo** — https://github.com/Haurukyun/Nexus-Chronicle (main branch)

---

## 🚀 Next phase

**Goal:** _Phase P1 / P2: Replace WorldMap prompts with inline modal, stabilize Dashboard insights, and enhance Nexus Lineages._

### Key known gaps / potential next features
1. WorldMap connections & markers use `window.prompt()` — replace with inline modal/popover (BUG-004)
2. `DashboardView` insights use `Math.random()` on every render — add deterministic seed or manual reroll button (BUG-002)
3. `NexusTreeView` general graph view: expand lineage tree beyond characters to include organizations, religions, and factions
4. Markdown preview with inline wikilinks (`[[Entity Name]]`) for rich lore writing
5. `git push` pending — branch is 1 commit ahead of origin (Phase 0 cleanup commit not yet pushed) (BUG-006)
6. `.wolf/`, `.claude/`, `.cursor/`, `.opencode/`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` are untracked — decide whether to commit or gitignore them

### Closed decisions
- State management: **Zustand with `persist` middleware** (localStorage-based, no backend)
- Styling: **TailwindCSS** (inline class strings) — NOTE: no `tailwind.config.js` found; may be using CDN or Vite plugin
- Build tool: **Vite 6 + @vitejs/plugin-react**
- React version: **19.2.3**
- No database — all data lives in browser localStorage via Zustand persist

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
