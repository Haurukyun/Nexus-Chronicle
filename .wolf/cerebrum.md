---
description: learned preferences, project conventions, and Do-Not-Repeat rules
budget_tokens: 2000
---
# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-09-29

## User Preferences

- **Project identity:** The app is called **Nexus Chronicle** — a fantasy/storyline codex and database manager for worldbuilders to link characters, locations, items, and other entities to one another.
- **Tone:** Fantasy/lore-flavored UI copy (e.g. "Chronos Timeline", "The Grand Voyager", "Forgotten Depth"); maintain this in new UI text.
- **Theme richness:** Design is intentionally rich and layered — do not simplify or flatten UI; maintain glassmorphism, serif fonts, and high contrast.
- **No backend:** The user explicitly wants a purely client-side app; all data is in localStorage via Zustand persist. Do NOT propose adding a server, database, or API.
- **TailwindCSS inline classes:** All styling is done via inline Tailwind classes. There is no separate CSS file for component styles. Do not create `*.module.css` or non-index CSS files.

## Key Learnings

- **Project:** nexus-chronicle
- **GitHub:** https://github.com/Haurukyun/Nexus-Chronicle (main branch)
- **Zustand store key:** `nexus-world-storage` (used by `persist` middleware in `useWorldStore.ts`)
- **Entity creation pattern:** Always use `handleCreate(type, name?, shouldOpen?)` from the store. It initializes ALL required fields for the given entity type. Creating a raw entity object manually will miss many fields and cause UI crashes.
- **EntityType union:** `'chapter' | 'note' | 'myth' | 'character' | 'location' | 'event' | 'species' | 'language' | 'culture' | 'political' | 'religious' | 'organization' | 'magic' | 'science' | 'ability' | 'item' | 'occupation' | 'condition' | 'resource'` — 20 types total.
- **paired* fields are ID arrays:** Every `paired*` field (e.g. `pairedCurrentLocationNew`, `pairedRace`, `pairedSkills`) stores an array of entity UUIDs, NOT display names.
- **groupConnections structure:** `{ political, organization, religious, magic, science }` — each with `{ leadingFigureOf, connectedTo, memberOf, allyOf, enemyOf }` arrays of entity IDs. This is on EVERY entity.
- **Theme-conditional rendering:** Three themes: `sovereign` (dark slate, yellow accent), `wiki` (light parchment, red accent `#b91c1c`), `royal-codex` (fantasy woodgrain bg, parchment content area). The `isWikiMode` boolean is derived from `theme === 'wiki'` but also has an override path via `setIsWikiMode()`.
- **Sidebar categories:** 4 groups: Story/Lore (chapter, note, myth), World (character, location, event, species, language, culture), Groups/Teachings (political, religious, organization, magic, science), Details (ability, item, occupation, condition, resource).
- **System tabs:** `map`, `trash`, `options`, `dashboard`, `timeline`, `nexus`, `journey` — these are never in `openTabIds` and are always accessible via sidebar nav buttons.
- **Stale error logs:** `ts_errors.log`, `tsc_errors.log`, `ts_errors_utf8.log`, `tsc_errors_utf8.log` in the root are **stale artifacts** from a prior session. Run `npm run typecheck` to get live TS errors.
- **Python scripts:** `assemble.py`, `generate_components.py`, `generate_viewers.py` are codegen helpers for scaffolding new entity type editor/viewer components. Check these before manually writing a new specifics component.
- **Backlinkutils field mismatch (known bug):** `backlinkUtils.ts` references `placeOfResidenceId`, `placeOfOriginId`, `placeOfDemiseId`, `speciesIds`, `occupationIds`, `skillIds`, `spellIds`, `equipmentIds`, `wealthIds`, `belongsUnderId` — but the actual Character type uses `pairedCurrentLocationNew`, `pairedOriginLocationNew`, `pairedDemiseLocationNew`, `pairedRace`, `pairedProfession`, `pairedSkills`, etc. Backlinks for these specific relations silently return empty arrays.
- **WorldMap uses `prompt()`:** Adding location markers and connections on the World Map relies on `window.prompt()`, which is not accessible or mobile-friendly. It is a known limitation.
- **NexusTreeView depth cap:** The tree is rendered recursively but silently stops at depth 5 (`depth < 5` guard). There is no user indication that the tree is truncated.
- **Timeline requires date strings:** Characters need `dateOfBirth`/`dateOfDeath` fields and Events need a `date` field (as string; regex extracts first integer). Entities without these are omitted from the timeline entirely.
- **DashboardView random insights bug:** `insights` memo depends on `world.entities` and `world.trash`, but `Math.random()` is called inside — insights will re-roll on any unrelated state change.
- **Tailwind config:** No `tailwind.config.js` was found at the root. Tailwind may be loaded via the Vite plugin or PostCSS. Do not assume custom theme tokens exist; use arbitrary values (`text-[#fef08a]`) as the codebase already does.

## Do-Not-Repeat

- **[2026-09-29]** Do NOT inject `GEMINI_API_KEY` or any API key into `vite.config.ts` `define` block — this was a security risk that was cleaned up in Phase 0. Keys must never be client-side.
- **[2026-09-29]** Do NOT add CDN `<script type="importmap">` or `<script src="esm.sh/...">` tags to `index.html` — this caused a double-React instance bug. All deps go via `npm install` and Vite bundle.
- **[2026-09-29]** Do NOT create entities by constructing raw objects — always use `handleCreate()` from the store. Missing fields break specifics editors.
- **[2026-09-29]** Do NOT read `anatomy.md` whole as a doc — grep it for the specific path you need. It is a 6878-byte index.
- **[2026-09-30]** Do NOT allow circular parent references when reparenting entities — always check `isDescendant(targetId, draggedId, entities)` before applying `parentId` change, otherwise both entities disappear from the root-driven sidebar tree.
- **[2026-09-30]** When configuring `SmartSelect` for hierarchical parents ("Belongs under"), always pass `excludeIds={[entity.id]}` to block an entity from selecting itself.
- **[2026-09-30]** Do NOT allow cross-category / cross-type drag and drop — an entity can ONLY be reparented or reordered within entities of its exact same EntityType. Never allow dragging a character under a location or dropping onto a different category's header.
- **[2026-09-30]** ALWAYS use `getSafeParentId()` when calculating roots and children in tree views — an entity must ONLY be considered a child if its parent exists, is of the exact same type, and does not form a circular dependency. If any check fails, the entity MUST be treated as a root so it can NEVER be lost or hidden from view.
- **[2026-09-30]** NEVER hide edit controls on locked records without providing an explicit, prominent "Unlock" action. In `ViewerHeaders.tsx`, locked records must render `Locked (Click to Unlock)` to guarantee records can always be recovered and edited.

## Decision Log

- **[2026-09-29] State management: Zustand + persist** — Chosen over Context API for better devtools, selector performance, and clean action colocation. `persist` targets localStorage for zero-backend data durability.
- **[2026-09-29] Editor/Viewer split per EntityType** — Each entity type has a dedicated `*Specifics.tsx` (editor) and `*SpecificsViewer.tsx`. This is verbose but keeps forms isolated and independently editable. Registry pattern (`EntitySpecificsRegistry`, `EntitySpecificsViewerRegistry`) maps type strings to components.
- **[2026-09-29] TailwindCSS for all styling** — No CSS modules or styled-components. All conditional styles are string interpolation of Tailwind classes. This is the established pattern — don't introduce a second styling system.
- **[2026-09-29] WorldPhase as CSS filter overlay** — Instead of re-theming components per phase, a `filter` style on the root `div` and an overlay `div` achieve the phase aesthetic globally without per-component logic.
- **[2026-09-30] Native HTML5 Drag and Drop over external libs** — Implemented zero-dependency native HTML5 drag and drop for sidebar tree reparenting and sibling reordering to keep the bundle lean and performant.
- **[2026-09-30] Universal Keyboard Shortcuts & Grimoire** — Global window keydown listener combined with in-form `onKeyDown` allows seamless `Ctrl+Enter` commit from text inputs/markdown editors, with a discreet header trigger and `?` key to inspect all available keybinds.
- **[2026-09-30] Dual-Mode Nexus Lines (Force Graph & Bloodline Tree)** — Integrated SVG force-directed simulation for multi-entity relationship visualization alongside the generational bloodline tree, accessible via a header toggle.

