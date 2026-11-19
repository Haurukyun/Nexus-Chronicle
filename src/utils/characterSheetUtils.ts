/**
 * Nexus Chronicle - Printable Character Sheet & PDF Lore Export Engine
 * 
 * Generates an ornate, high-fidelity fantasy RPG Character Sheet formatted for
 * A4/Letter printing, PDF generation (via browser print), and digital archiving.
 */

import { WorldEntity, Character, EntityType } from '../types';
import { TYPE_LABELS } from '../constants';
import { isEntityDeceased, getEntityAliases } from './documentModeUtils';
import { getRelationalNote } from './relationalNotesUtils';

/**
 * Escapes HTML characters.
 */
function escapeHtml(str: string | undefined | null): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Resolves an array of entity IDs into formatted names.
 */
function resolveEntityNames(ids: string[] | undefined, allEntities: WorldEntity[]): string[] {
    if (!ids || !Array.isArray(ids)) return [];
    return ids
        .map(id => allEntities.find(e => e.id === id)?.name)
        .filter((name): name is string => Boolean(name && name.trim()));
}

/**
 * Generates a complete standalone HTML document representing a printable character sheet.
 */
export function generateCharacterSheetHtml(
    character: Character,
    allEntities: WorldEntity[],
    options: { includeDmNotes?: boolean; theme?: string } = {}
): string {
    const isDeceased = isEntityDeceased(character);
    const aliases = getEntityAliases(character);
    const anyChar = character as any;

    // Resolve relationships & entities
    const races = resolveEntityNames(anyChar.pairedRace, allEntities);
    const professions = resolveEntityNames(anyChar.pairedProfession, allEntities);
    const originLocation = resolveEntityNames(anyChar.pairedOriginLocationNew, allEntities);
    const currentLocation = resolveEntityNames(anyChar.pairedCurrentLocationNew, allEntities);
    const demiseLocation = resolveEntityNames(anyChar.pairedDemiseLocationNew, allEntities);
    const items = resolveEntityNames(anyChar.pairedConnectedItems, allEntities);
    const abilities = resolveEntityNames(anyChar.pairedSkills, allEntities);
    const magicSchools = resolveEntityNames(anyChar.pairedMagic, allEntities);
    const techBranches = resolveEntityNames(anyChar.pairedTech, allEntities);

    // Relatives & Kin
    const parents = resolveEntityNames(anyChar.parentsOfCharacter, allEntities);
    const children = resolveEntityNames(anyChar.childOfCharacter, allEntities);
    const relatives = resolveEntityNames(anyChar.relativesOfCharacter, allEntities);
    const allies = resolveEntityNames(anyChar.allyResCharacter, allEntities);
    const enemies = resolveEntityNames(anyChar.enemydResCharacter, allEntities);

    // Group affiliations
    const factions: Array<{ role: string; name: string }> = [];
    const checkGroupArray = (ids: string[] | undefined, roleLabel: string) => {
        if (!ids) return;
        ids.forEach(id => {
            const ent = allEntities.find(e => e.id === id);
            if (ent) factions.push({ role: roleLabel, name: ent.name });
        });
    };
    checkGroupArray(anyChar.pairedBelongingPolGroup, 'Political Order');
    checkGroupArray(anyChar.pairedBelongingRelGroup, 'Religious Order');
    checkGroupArray(anyChar.pairedBelongingMagicGroup, 'Magic Circle');
    checkGroupArray(anyChar.pairedBelongingTechGroup, 'Academy / Guild');
    checkGroupArray(anyChar.pairedBelongingOtherGroups, 'Organization');

    // Stats / Attributes (Support custom attributes or D&D stats)
    const stats: Array<{ key: string; val: string }> = [];
    if (anyChar.customAttributes && typeof anyChar.customAttributes === 'object') {
        Object.entries(anyChar.customAttributes).forEach(([k, v]) => {
            if (v && String(v).trim()) stats.push({ key: k, val: String(v).trim() });
        });
    }

    // Default core RPG stats if not present in customAttributes
    const coreVitals: Array<{ label: string; value: string }> = [
        { label: 'Species / Race', value: races.join(', ') || 'Unspecified' },
        { label: 'Class / Calling', value: professions.join(', ') || 'Unspecified' },
        { label: 'Gender / Sex', value: anyChar.sex || 'Unspecified' },
        { label: 'Age', value: anyChar.age ? `${anyChar.age} years` : 'Unspecified' },
        { label: 'Birth Date', value: anyChar.birthDate || anyChar.dateOfBirth || 'Unknown' },
        ...(isDeceased ? [{ label: 'Death Date', value: anyChar.deathDate || anyChar.dateOfDeath || 'Unknown' }] : []),
        { label: 'Status', value: isDeceased ? 'Deceased / Fallen †' : 'Living' },
        { label: 'Origin Realm', value: originLocation.join(', ') || 'Unknown' },
        { label: 'Current Anchor', value: currentLocation.join(', ') || 'Wandering' },
        ...(demiseLocation.length > 0 ? [{ label: 'Resting Place', value: demiseLocation.join(', ') }] : []),
        ...(anyChar.powerLevel ? [{ label: 'Power / Rating', value: String(anyChar.powerLevel) }] : []),
    ];

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(character.name)} — Character Dossier</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Lora:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #fcfbf7;
            --paper: #ffffff;
            --text-main: #1c1917;
            --text-muted: #57534e;
            --gold: #9a7322;
            --gold-light: #d4af37;
            --crimson: #70121e;
            --border-color: #d6cfbe;
            --border-dark: #8c7853;
            --accent-glow: rgba(154, 115, 34, 0.15);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg);
            color: var(--text-main);
            font-family: 'Lora', Georgia, serif;
            line-height: 1.5;
            font-size: 13px;
            padding: 24px;
        }

        .screen-toolbar {
            max-width: 900px;
            margin: 0 auto 20px auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 18px;
            background: #2a1b12;
            color: #f7efe0;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.18);
        }

        .print-btn {
            background: #70121e;
            color: #fff8e7;
            border: 1px solid #c8a96e;
            padding: 8px 18px;
            border-radius: 8px;
            font-family: 'Cinzel', serif;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            transition: all 0.2s ease;
        }

        .print-btn:hover {
            background: #8b1827;
            transform: translateY(-1px);
        }

        .sheet-container {
            max-width: 900px;
            margin: 0 auto;
            background: var(--paper);
            border: 2px solid var(--border-dark);
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            position: relative;
            padding: 32px 36px;
        }

        /* Ornate filigree double border */
        .sheet-container::before {
            content: '';
            position: absolute;
            top: 6px;
            left: 6px;
            right: 6px;
            bottom: 6px;
            border: 1px solid var(--border-color);
            pointer-events: none;
        }

        .sheet-header {
            display: flex;
            align-items: center;
            gap: 24px;
            border-bottom: 2px solid var(--gold);
            padding-bottom: 20px;
            margin-bottom: 20px;
            position: relative;
        }

        .portrait-frame {
            width: 140px;
            height: 175px;
            flex-shrink: 0;
            border: 2px solid var(--gold);
            background: #f7f3ea;
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .portrait-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .portrait-placeholder {
            text-align: center;
            color: var(--gold);
            padding: 12px;
            font-size: 11px;
            font-family: 'Cinzel', serif;
        }

        .header-content {
            flex: 1;
            min-width: 0;
        }

        .header-eyebrow {
            font-family: 'Cinzel', serif;
            font-size: 11px;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--crimson);
            font-weight: 700;
            margin-bottom: 4px;
        }

        .character-title {
            font-family: 'Cinzel', serif;
            font-size: 32px;
            font-weight: 900;
            line-height: 1.1;
            color: #2b1810;
            margin-bottom: 6px;
            letter-spacing: 0.02em;
        }

        .character-aliases {
            font-style: italic;
            color: var(--text-muted);
            font-size: 13px;
            margin-bottom: 12px;
        }

        .badges-row {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .tag-badge {
            background: #f4ede0;
            border: 1px solid var(--border-color);
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-family: 'JetBrains Mono', monospace;
            color: var(--text-muted);
        }

        .status-badge {
            font-family: 'Cinzel', serif;
            font-weight: 700;
            font-size: 10px;
            padding: 3px 10px;
            border-radius: 4px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .status-living {
            background: #ecfdf5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }

        .status-deceased {
            background: #fef2f2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }

        /* Layout Grid */
        .sheet-grid {
            display: grid;
            grid-template-columns: 290px 1fr;
            gap: 24px;
        }

        .sheet-section {
            margin-bottom: 20px;
            break-inside: avoid;
        }

        .section-title {
            font-family: 'Cinzel', serif;
            font-size: 13px;
            font-weight: 700;
            color: var(--crimson);
            text-transform: uppercase;
            letter-spacing: 0.12em;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 4px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .vitals-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11.5px;
        }

        .vitals-table tr {
            border-bottom: 1px dashed #e8e3d5;
        }

        .vitals-table tr:last-child {
            border-bottom: none;
        }

        .vitals-table td {
            padding: 4.5px 0;
            vertical-align: top;
        }

        .vitals-label {
            font-weight: 600;
            color: var(--text-muted);
            width: 42%;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }

        .vitals-value {
            color: #1c1917;
            font-weight: 500;
        }

        /* Stats Radar / Custom Attributes Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin-top: 8px;
        }

        .stat-card {
            background: #faf7f0;
            border: 1px solid var(--border-color);
            padding: 6px 10px;
            border-radius: 4px;
            text-align: center;
        }

        .stat-key {
            font-size: 9.5px;
            font-family: 'Cinzel', serif;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .stat-val {
            font-size: 16px;
            font-weight: 700;
            color: #2b1810;
            font-family: 'JetBrains Mono', monospace;
        }

        /* Biography & Lore */
        .bio-prose {
            font-size: 12.5px;
            line-height: 1.6;
            color: #262321;
            white-space: pre-wrap;
            text-align: justify;
        }

        .chip-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .lore-chip {
            background: #fbf9f4;
            border: 1px solid var(--border-color);
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 11px;
            color: #2b1810;
        }

        .lore-chip strong {
            color: var(--crimson);
            font-weight: 600;
        }

        .sheet-footer {
            margin-top: 28px;
            border-top: 1px solid var(--gold);
            padding-top: 10px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: var(--text-muted);
            font-family: 'Cinzel', serif;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        /* Dedicated Print Styles */
        @media print {
            body {
                background: white !important;
                padding: 0 !important;
                font-size: 11.5px !important;
            }

            .screen-toolbar {
                display: none !important;
            }

            .sheet-container {
                box-shadow: none !important;
                border: 1px solid #777 !important;
                padding: 20px 24px !important;
                max-width: 100% !important;
            }

            .sheet-container::before {
                display: none;
            }

            @page {
                size: A4 portrait;
                margin: 10mm;
            }

            .sheet-section {
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="screen-toolbar">
        <div>
            <strong style="font-family: 'Cinzel', serif; letter-spacing: 0.1em; text-transform: uppercase;">Nexus Chronicle Codex</strong>
            <span style="opacity: 0.6; font-size: 11px; margin-left: 10px;">Printable Fantasy Character Sheet</span>
        </div>
        <button class="print-btn" onclick="window.print()">
            🖨️ Print Sheet / Save as PDF
        </button>
    </div>

    <div class="sheet-container">
        <!-- Header -->
        <header class="sheet-header">
            <div class="portrait-frame">
                ${character.imageUri ? `
                    <img class="portrait-img" src="${escapeHtml(character.imageUri)}" alt="${escapeHtml(character.name)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                    <div class="portrait-placeholder" style="display: none;">
                        ✦<br/><strong>${escapeHtml(character.name)}</strong>
                    </div>
                ` : `
                    <div class="portrait-placeholder">
                        ✦<br/><strong>${escapeHtml(character.name)}</strong><br/><br/>
                        <span style="font-size: 9px; opacity: 0.7;">No portrait cataloged</span>
                    </div>
                `}
            </div>

            <div class="header-content">
                <div class="header-eyebrow">Codex Character Dossier</div>
                <h1 class="character-title">${escapeHtml(character.name)}</h1>
                ${aliases.length > 0 ? `<div class="character-aliases">Known as: ${escapeHtml(aliases.join(' · '))}</div>` : ''}

                <div class="badges-row">
                    <span class="status-badge ${isDeceased ? 'status-deceased' : 'status-living'}">
                        ${isDeceased ? 'Fallen / Deceased †' : 'Living Entity'}
                    </span>
                    ${professions.map(p => `<span class="tag-badge">🛡️ ${escapeHtml(p)}</span>`).join('')}
                    ${races.map(r => `<span class="tag-badge">🧬 ${escapeHtml(r)}</span>`).join('')}
                    ${character.tags?.map(t => `<span class="tag-badge">#${escapeHtml(t)}</span>`).join('') || ''}
                </div>
            </div>
        </header>

        <!-- Main Content Grid -->
        <main class="sheet-grid">
            <!-- Left Column: Vitals, Stats, Affiliations -->
            <aside>
                <section class="sheet-section">
                    <h2 class="section-title">Character Vitals</h2>
                    <table class="vitals-table">
                        <tbody>
                            ${coreVitals.map(v => `
                                <tr>
                                    <td class="vitals-label">${escapeHtml(v.label)}</td>
                                    <td class="vitals-value">${escapeHtml(v.value)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </section>

                ${stats.length > 0 ? `
                    <section class="sheet-section">
                        <h2 class="section-title">Attributes & Scores</h2>
                        <div class="stats-grid">
                            ${stats.map(s => `
                                <div class="stat-card">
                                    <div class="stat-key">${escapeHtml(s.key)}</div>
                                    <div class="stat-val">${escapeHtml(s.val)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}

                ${factions.length > 0 ? `
                    <section class="sheet-section">
                        <h2 class="section-title">Affiliations & Factions</h2>
                        <div class="chip-list">
                            ${factions.map(f => `
                                <div class="lore-chip">
                                    <strong>${escapeHtml(f.role)}:</strong> ${escapeHtml(f.name)}
                                </div>
                            `).join('')}
                        </div>
                    </section>
                ` : ''}

                ${(parents.length > 0 || children.length > 0 || relatives.length > 0) ? `
                    <section class="sheet-section">
                        <h2 class="section-title">Lineage & Kinship</h2>
                        <table class="vitals-table">
                            <tbody>
                                ${parents.length > 0 ? `
                                    <tr>
                                        <td class="vitals-label">Parents</td>
                                        <td class="vitals-value">${escapeHtml(parents.join(', '))}</td>
                                    </tr>
                                ` : ''}
                                ${children.length > 0 ? `
                                    <tr>
                                        <td class="vitals-label">Children</td>
                                        <td class="vitals-value">${escapeHtml(children.join(', '))}</td>
                                    </tr>
                                ` : ''}
                                ${relatives.length > 0 ? `
                                    <tr>
                                        <td class="vitals-label">Kin</td>
                                        <td class="vitals-value">${escapeHtml(relatives.join(', '))}</td>
                                    </tr>
                                ` : ''}
                            </tbody>
                        </table>
                    </section>
                ` : ''}

                ${(allies.length > 0 || enemies.length > 0) ? `
                    <section class="sheet-section">
                        <h2 class="section-title">Interpersonal Ties</h2>
                        <div class="chip-list">
                            ${allies.map(a => `<span class="lore-chip">🤝 <strong>Ally:</strong> ${escapeHtml(a)}</span>`).join('')}
                            ${enemies.map(e => `<span class="lore-chip" style="border-color:#fca5a5;">⚔️ <strong>Adversary:</strong> ${escapeHtml(e)}</span>`).join('')}
                        </div>
                    </section>
                ` : ''}
            </aside>

            <!-- Right Column: Biography, Abilities, Armaments, DM Notes -->
            <div>
                <section class="sheet-section">
                    <h2 class="section-title">Biography & Chronicle</h2>
                    <div class="bio-prose">
                        ${character.description?.trim() ? escapeHtml(character.description.trim()) : '<em>No written chronicle or description recorded in the codex archives.</em>'}
                    </div>
                </section>

                ${(abilities.length > 0 || magicSchools.length > 0 || techBranches.length > 0) ? `
                    <section class="sheet-section">
                        <h2 class="section-title">Abilities, Magic & Disciplines</h2>
                        <div class="chip-list">
                            ${abilities.map(a => `<span class="lore-chip">⚡ ${escapeHtml(a)}</span>`).join('')}
                            ${magicSchools.map(m => `<span class="lore-chip">✨ ${escapeHtml(m)}</span>`).join('')}
                            ${techBranches.map(t => `<span class="lore-chip">⚙️ ${escapeHtml(t)}</span>`).join('')}
                        </div>
                    </section>
                ` : ''}

                ${items.length > 0 ? `
                    <section class="sheet-section">
                        <h2 class="section-title">Armaments, Relics & Possessions</h2>
                        <div class="chip-list">
                            ${items.map(i => `<span class="lore-chip">🗡️ ${escapeHtml(i)}</span>`).join('')}
                        </div>
                    </section>
                ` : ''}

                ${(options.includeDmNotes && character.privateNotes?.trim()) ? `
                    <section class="sheet-section" style="border-left: 3px solid var(--crimson); padding-left: 12px; background: #faf5ee; padding: 10px;">
                        <h2 class="section-title" style="color: var(--crimson);">DM Confidential Notes</h2>
                        <div class="bio-prose" style="font-family: 'JetBrains Mono', monospace; font-size: 11px;">
                            ${escapeHtml(character.privateNotes.trim())}
                        </div>
                    </section>
                ` : ''}
            </div>
        </main>

        <footer class="sheet-footer">
            <span>Nexus Chronicle Archive Edition</span>
            <span>Recorded: ${new Date().toLocaleDateString()}</span>
            <span>Canonical World Codex</span>
        </footer>
    </div>
</body>
</html>`;
}

/**
 * Opens a printable HTML document in a new window and triggers print dialog.
 */
export function openPrintableDocument(html: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        // Fallback for popup blocker: download as standalone HTML
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `character-sheet-${Date.now()}.html`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
}
