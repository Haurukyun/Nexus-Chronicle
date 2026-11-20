/**
 * Nexus Chronicle - Lineage Tree & Bloodline Handout Generator
 * 
 * Generates an ornate, high-fidelity genealogical family tree document formatted
 * for Landscape printing, PDF generation (via browser print), and campaign handouts.
 */

import { WorldData, Character } from '../types';
import { openPrintableDocument } from './characterSheetUtils';

function escapeHtml(str: string | undefined | null): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderCharacterCard(c: Character, all: Character[], depth: number, visited: Set<string>): string {
    if (visited.has(c.id)) {
        return `<div class="node-card looped"><span class="name">${escapeHtml(c.name)}</span> <span class="tag">Loop reference</span></div>`;
    }
    visited.add(c.id);

    // Find direct children
    const directChildIds = new Set<string>([
        ...(c.childOfCharacter || []),
        ...(c.childrenIds || [])
    ]);
    all.forEach(other => {
        if (other.parentId === c.id || other.parentsOfCharacter?.includes(c.id) || other.parentIds?.includes(c.id)) {
            directChildIds.add(other.id);
        }
    });
    directChildIds.delete(c.id);

    const children = all.filter(other => directChildIds.has(other.id));

    const isDeceased = Boolean(c.isDead || c.deadSwitch);

    const aliases = Array.isArray(c.otherNames) ? c.otherNames.join(', ') : c.otherNamesAndEpithets || '';
    const race = Array.isArray(c.pairedRace) ? c.pairedRace.join(', ') : c.ethnicity || '';
    const statusText = isDeceased ? 'Deceased' : 'Living';

    let html = `
    <div class="tree-node">
        <div class="node-card ${isDeceased ? 'deceased' : ''}">
            <div class="card-depth">GENERATION ${depth}</div>
            <div class="card-name">
                ${escapeHtml(c.name)}
                ${isDeceased ? '<span class="cross" title="Deceased">†</span>' : ''}
            </div>
            ${c.titles ? `<div class="card-title">${escapeHtml(c.titles)}</div>` : ''}
            ${aliases ? `<div class="card-alias">"${escapeHtml(aliases)}"</div>` : ''}
            ${race ? `<div class="card-meta">Species: ${escapeHtml(race)}</div>` : ''}
            <div class="card-status">Status: ${escapeHtml(statusText)}</div>
        </div>
    `;

    if (children.length > 0) {
        html += `<div class="children-branch">`;
        children.forEach(child => {
            html += renderCharacterCard(child, all, depth + 1, new Set(visited));
        });
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

export function generateLineageHtml(
    world: WorldData,
    lineageData: { roots: Character[]; all: Character[] },
    theme: string
): string {
    const isRoyal = theme === 'royal-codex';
    const isWiki = theme === 'wiki';

    const primaryColor = isRoyal ? '#70121e' : isWiki ? '#b91c1c' : '#0f172a';
    const accentColor = isRoyal ? '#c8a96e' : isWiki ? '#b91c1c' : '#f59e0b';
    const bgPaper = isRoyal ? '#fbf8ef' : isWiki ? '#fdfcf0' : '#ffffff';

    const treeContent = lineageData.roots.map(root => 
        renderCharacterCard(root, lineageData.all, 0, new Set())
    ).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(world.name)} — Lineage & Bloodline Tree</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <style>
        @page {
            size: landscape;
            margin: 12mm 15mm;
        }

        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background-color: ${bgPaper};
            color: #1e130c;
            margin: 0;
            padding: 24px;
            font-size: 11px;
            line-height: 1.4;
        }

        .header-banner {
            border-bottom: 2px solid ${accentColor};
            padding-bottom: 16px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .realm-sub {
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            color: ${primaryColor};
            font-weight: 700;
        }

        .doc-title {
            font-family: 'Cinzel', serif;
            font-size: 26px;
            font-weight: 900;
            color: ${primaryColor};
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 4px 0 0 0;
        }

        .meta-stat {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            color: #555;
            text-align: right;
        }

        .lineage-forest {
            display: flex;
            flex-direction: column;
            gap: 32px;
        }

        .tree-node {
            display: flex;
            align-items: flex-start;
            position: relative;
            margin: 8px 0;
        }

        .node-card {
            background: #ffffff;
            border: 1.5px solid ${accentColor};
            border-radius: 10px;
            padding: 10px 14px;
            min-width: 170px;
            max-width: 220px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            position: relative;
            z-index: 2;
        }

        .node-card.deceased {
            background: #faf6f5;
            border-color: #d1a898;
        }

        .card-depth {
            font-family: 'JetBrains Mono', monospace;
            font-size: 7.5px;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: #8c6d48;
            font-weight: 700;
            margin-bottom: 2px;
        }

        .card-name {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 14px;
            font-weight: 800;
            color: ${primaryColor};
            line-height: 1.2;
        }

        .cross {
            color: #b91c1c;
            font-size: 14px;
            margin-left: 2px;
        }

        .card-title {
            font-size: 9px;
            font-style: italic;
            color: #666;
            margin-top: 2px;
        }

        .card-alias {
            font-size: 8.5px;
            color: #8c6d48;
            font-family: 'Playfair Display', serif;
        }

        .card-meta, .card-status {
            font-size: 8px;
            font-family: 'JetBrains Mono', monospace;
            color: #555;
            margin-top: 4px;
        }

        .children-branch {
            display: flex;
            flex-direction: column;
            padding-left: 28px;
            position: relative;
        }

        .children-branch::before {
            content: '';
            position: absolute;
            left: 10px;
            top: 24px;
            bottom: 24px;
            width: 2px;
            background: ${accentColor};
            opacity: 0.6;
        }

        .children-branch > .tree-node::before {
            content: '';
            position: absolute;
            left: -18px;
            top: 24px;
            width: 18px;
            height: 2px;
            background: ${accentColor};
            opacity: 0.6;
        }

        .footer {
            margin-top: 40px;
            border-top: 1px solid #ddd;
            padding-top: 8px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 8px;
            color: #888;
            display: flex;
            justify-content: space-between;
        }

        @media screen {
            body {
                max-width: 1200px;
                margin: 20px auto;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                border: 1px solid #e0d6c3;
                border-radius: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="header-banner">
        <div>
            <div class="realm-sub">${escapeHtml(world.name)} · Codex Archives</div>
            <h1 class="doc-title">The Nexus Lineages</h1>
            <div style="font-size: 10px; font-style: italic; color: #666; margin-top: 2px;">Official Pedigree & Bloodline Chronicle Handout</div>
        </div>
        <div class="meta-stat">
            <div><strong>${lineageData.all.length}</strong> Characters Catalogued</div>
            <div>Generated: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
    </div>

    <div class="lineage-forest">
        ${treeContent || '<p style="text-align: center; opacity: 0.5; padding: 40px;">No character lineages recorded in realm.</p>'}
    </div>

    <div class="footer">
        <span>Nexus Chronicle · Campaign Master Archive</span>
        <span>Confidential & Authentic Lore Handout</span>
    </div>

    <script>
        window.addEventListener('load', () => {
            // Auto open print if opened in dedicated window
            setTimeout(() => { window.print(); }, 400);
        });
    </script>
</body>
</html>`;
}

export function exportLineagePrintable(
    world: WorldData,
    lineageData: { roots: Character[]; all: Character[] },
    theme: string
): void {
    const html = generateLineageHtml(world, lineageData, theme);
    openPrintableDocument(html);
}
