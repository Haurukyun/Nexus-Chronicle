/**
 * Nexus Chronicle - Lore Export & Sharing Utilities
 * 
 * Supports:
 * 1. Markdown with YAML frontmatter (Obsidian/Notion/Fantasia Archive compatible)
 * 2. Standalone styled HTML document with embedded responsive CSS & print stylesheet
 * 3. Batch category JSON export
 */

import { WorldEntity, EntityType } from '../types';
import { TYPE_LABELS } from '../constants';
import { isEntityDeceased, isEntityFinished, isEntityCategory, isEntityMinor, getEntityAliases } from './documentModeUtils';
import { getEntityRelationshipSummary, formatFieldLabel, getRelationalNote } from './relationalNotesUtils';
import { downloadFileToDevice } from './nexusArchive';

/**
 * Escapes YAML string values.
 */
function escapeYaml(val: string): string {
    return JSON.stringify(val);
}

/**
 * Generates rich Markdown with standard YAML frontmatter for an entity.
 */
export function generateEntityMarkdown(entity: WorldEntity, allEntities: WorldEntity[]): string {
    const isDeceased = isEntityDeceased(entity);
    const isFinished = isEntityFinished(entity);
    const isCategory = isEntityCategory(entity);
    const isMinor = isEntityMinor(entity);
    const aliases = getEntityAliases(entity);

    const typeLabel = TYPE_LABELS[entity.type as EntityType] || entity.type;

    // Build YAML frontmatter
    const frontmatterLines: string[] = [
        '---',
        `title: ${escapeYaml(entity.name)}`,
        `type: ${escapeYaml(entity.type)}`,
        `type_label: ${escapeYaml(typeLabel)}`,
        `status: ${escapeYaml(isDeceased ? 'Deceased / Fallen' : 'Active')}`,
        `finished: ${isFinished}`,
        `category_folder: ${isCategory}`,
        `minor_entry: ${isMinor}`,
    ];

    if (aliases.length > 0) {
        frontmatterLines.push('aliases:');
        aliases.forEach(a => frontmatterLines.push(`  - ${escapeYaml(a)}`));
    }

    if (entity.tags && entity.tags.length > 0) {
        frontmatterLines.push('tags:');
        entity.tags.forEach(t => frontmatterLines.push(`  - ${escapeYaml(t)}`));
    }

    if (entity.lastModified) {
        frontmatterLines.push(`last_modified: ${escapeYaml(new Date(entity.lastModified).toISOString())}`);
    }

    frontmatterLines.push('---');
    frontmatterLines.push('');

    // Document body
    const bodyLines: string[] = [];
    bodyLines.push(`# ${entity.name}${isDeceased ? ' †' : ''}`);
    bodyLines.push('');

    if (aliases.length > 0) {
        bodyLines.push(`*Also known as: ${aliases.join(', ')}*`);
        bodyLines.push('');
    }

    // Vitals table for characters
    const anyEnt = entity as any;
    if (entity.type === 'character') {
        const vitals = ([
            ['Species / Race', anyEnt.pairedRace?.map((id: string) => allEntities.find(e => e.id === id)?.name).filter(Boolean).join(', ')],
            ['Occupation / Class', anyEnt.pairedProfession?.map((id: string) => allEntities.find(e => e.id === id)?.name).filter(Boolean).join(', ')],
            ['Sex / Gender', anyEnt.sex],
            ['Age', anyEnt.age],
            ['Birth Date', anyEnt.birthDate],
            ['Death Date', anyEnt.deathDate],
            ['Combat Rating', anyEnt.powerLevel],
        ] as [string, string | undefined][]).filter(([_, v]) => Boolean(v && typeof v === 'string' && v.trim()));

        if (vitals.length > 0) {
            bodyLines.push('### Vitals & Attributes');
            bodyLines.push('');
            bodyLines.push('| Attribute | Value |');
            bodyLines.push('| :--- | :--- |');
            vitals.forEach(([k, v]) => bodyLines.push(`| **${k}** | ${v} |`));
            bodyLines.push('');
        }
    } else if (entity.type === 'location') {
        const vitals = ([
            ['Location Type', anyEnt.locationType],
            ['Population', anyEnt.population],
            ['Manifested / Founded', anyEnt.creationTime],
            ['Coordinates', anyEnt.coordinates ? `X: ${anyEnt.coordinates.x}%, Y: ${anyEnt.coordinates.y}%` : undefined],
        ] as [string, string | undefined][]).filter(([_, v]) => Boolean(v && typeof v === 'string' && v.trim()));

        if (vitals.length > 0) {
            bodyLines.push('### Geographic Vitals');
            bodyLines.push('');
            bodyLines.push('| Property | Value |');
            bodyLines.push('| :--- | :--- |');
            vitals.forEach(([k, v]) => bodyLines.push(`| **${k}** | ${v} |`));
            bodyLines.push('');
        }
    }

    // Description / Lore prose
    bodyLines.push('## Description & Lore');
    bodyLines.push('');
    if (entity.description && entity.description.trim()) {
        bodyLines.push(entity.description.trim());
    } else {
        bodyLines.push('*No description recorded in the codex.*');
    }
    bodyLines.push('');

    // Relationships & Connections (with Relational Notes)
    const relationships: Array<{ fieldName: string; targetName: string; note?: string }> = [];

    // Helper to gather links
    const checkLinks = (ids: string[] | undefined, fieldKey: string, fieldTitle: string) => {
        if (!ids || ids.length === 0) return;
        ids.forEach(id => {
            const target = allEntities.find(e => e.id === id);
            if (!target) return;
            const note = getRelationalNote(entity.relationalNotes, fieldKey, id);
            relationships.push({
                fieldName: fieldTitle,
                targetName: target.name,
                note: note || undefined,
            });
        });
    };

    checkLinks(anyEnt.parentsOfCharacter, 'parentsOfCharacter', 'Parents');
    checkLinks(anyEnt.childOfCharacter, 'childOfCharacter', 'Children');
    checkLinks(anyEnt.relativesOfCharacter, 'relativesOfCharacter', 'Relatives');
    checkLinks(anyEnt.allyResCharacter, 'allyResCharacter', 'Allies & Friends');
    checkLinks(anyEnt.enemydResCharacter, 'enemydResCharacter', 'Enemies & Adversaries');
    checkLinks(anyEnt.complicatedResCharacter, 'complicatedResCharacter', 'Complicated Ties');
    checkLinks(anyEnt.pairedConnectedItems, 'pairedConnectedItems', 'Possessions & Items');
    checkLinks(anyEnt.pairedSkills, 'pairedSkills', 'Known Abilities & Skills');
    checkLinks(anyEnt.pairedEvent, 'pairedEvent', 'Events');

    if (relationships.length > 0) {
        bodyLines.push('## Relationships & Relational Web');
        bodyLines.push('');
        relationships.forEach(rel => {
            const noteStr = rel.note ? ` — *Note: ${rel.note}*` : '';
            bodyLines.push(`- **${rel.fieldName}**: [[${rel.targetName}]]${noteStr}`);
        });
        bodyLines.push('');
    }

    // Folder contents if category
    if (isCategory) {
        const children = allEntities.filter(e => e.parentId === entity.id);
        if (children.length > 0) {
            bodyLines.push('## Folder Contents');
            bodyLines.push('');
            children.forEach(c => {
                bodyLines.push(`- [[${c.name}]] (${TYPE_LABELS[c.type as EntityType] || c.type}${isEntityDeceased(c) ? ' †' : ''})`);
            });
            bodyLines.push('');
        }
    }

    // Private / DM Confidential Notes
    if (entity.privateNotes && entity.privateNotes.trim()) {
        bodyLines.push('---');
        bodyLines.push('');
        bodyLines.push('> [!NOTE] DM Confidential Notes');
        bodyLines.push('> ' + entity.privateNotes.trim().split('\n').join('\n> '));
        bodyLines.push('');
    }

    return frontmatterLines.join('\n') + bodyLines.join('\n');
}

/**
 * Escapes HTML characters.
 */
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Generates a self-contained, standalone styled HTML document.
 */
export function generateEntityHtml(
    entity: WorldEntity,
    allEntities: WorldEntity[],
    theme: string = 'sovereign'
): string {
    const isDeceased = isEntityDeceased(entity);
    const isFinished = isEntityFinished(entity);
    const isCategory = isEntityCategory(entity);
    const aliases = getEntityAliases(entity);
    const typeLabel = TYPE_LABELS[entity.type as EntityType] || entity.type;

    const isLight = theme === 'wiki';
    const isRoyal = theme === 'royal-codex';

    const bg = isRoyal ? '#f5eedb' : isLight ? '#fdfaf4' : '#0f172a';
    const text = isRoyal ? '#2b1810' : isLight ? '#1c1917' : '#f8fafc';
    const cardBg = isRoyal ? '#ede2cc' : isLight ? '#ffffff' : '#1e293b';
    const border = isRoyal ? '#c8a96e' : isLight ? '#e7e5e4' : '#334155';
    const accent = isRoyal ? '#70121e' : isLight ? '#b91c1c' : '#facc15';

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(entity.name)} — Nexus Chronicle</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --bg: ${bg};
      --text: ${text};
      --card-bg: ${cardBg};
      --border: ${border};
      --accent: ${accent};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: ${isRoyal ? "'Cinzel', Georgia, serif" : "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"};
      line-height: 1.6;
      padding: 2.5rem 1rem;
    }
    .container {
      max-width: 860px;
      margin: 0 auto;
    }
    .badge {
      display: inline-block;
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      border: 1px solid var(--border);
      margin-right: 0.5rem;
      margin-bottom: 0.75rem;
    }
    .badge-accent {
      background: rgba(250, 204, 21, 0.15);
      color: var(--accent);
      border-color: var(--accent);
    }
    .badge-deceased {
      background: rgba(225, 29, 72, 0.15);
      color: #f43f5e;
      border-color: #f43f5e;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 900;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
      line-height: 1.1;
    }
    .aliases {
      font-style: italic;
      opacity: 0.7;
      margin-bottom: 2rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .card h2 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--accent);
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
    }
    .prose {
      font-size: 1rem;
      line-height: 1.8;
      white-space: pre-wrap;
    }
    .rel-item {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(128,128,128,0.15);
    }
    .rel-item:last-child { border-bottom: none; }
    .rel-role {
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      opacity: 0.6;
      width: 140px;
      flex-shrink: 0;
    }
    .rel-name {
      font-weight: 700;
    }
    .rel-note {
      font-size: 0.85rem;
      font-style: italic;
      opacity: 0.85;
      color: var(--accent);
    }
    .footer {
      text-align: center;
      margin-top: 3rem;
      font-size: 0.75rem;
      opacity: 0.5;
    }
    @media print {
      body { background: white !important; color: black !important; padding: 0 !important; }
      .card { box-shadow: none !important; border: 1px solid #ccc !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div>
      <span class="badge badge-accent">${escapeHtml(typeLabel)}</span>
      ${isDeceased ? '<span class="badge badge-deceased">† Fallen / Deceased</span>' : ''}
      ${isFinished ? '<span class="badge">● Completed</span>' : ''}
      ${isCategory ? '<span class="badge">📁 Folder Category</span>' : ''}
    </div>
    <h1>${escapeHtml(entity.name)}${isDeceased ? ' †' : ''}</h1>
    ${aliases.length > 0 ? `<p class="aliases">Also known as: ${escapeHtml(aliases.join(', '))}</p>` : ''}

    <div class="card">
      <h2>Description & Lore</h2>
      <div class="prose">${escapeHtml(entity.description?.trim() || 'No description recorded in the codex.')}</div>
    </div>
`;

    // Relationships in HTML
    const anyEnt = entity as any;
    const rels: Array<{ role: string; name: string; note: string }> = [];

    const addRelGroup = (ids: string[] | undefined, fieldKey: string, roleName: string) => {
        if (!ids || ids.length === 0) return;
        ids.forEach(id => {
            const target = allEntities.find(e => e.id === id);
            if (!target) return;
            const note = getRelationalNote(entity.relationalNotes, fieldKey, id);
            rels.push({ role: roleName, name: target.name, note });
        });
    };

    addRelGroup(anyEnt.parentsOfCharacter, 'parentsOfCharacter', 'Parent');
    addRelGroup(anyEnt.childOfCharacter, 'childOfCharacter', 'Child');
    addRelGroup(anyEnt.relativesOfCharacter, 'relativesOfCharacter', 'Relative');
    addRelGroup(anyEnt.allyResCharacter, 'allyResCharacter', 'Ally / Friend');
    addRelGroup(anyEnt.enemydResCharacter, 'enemydResCharacter', 'Enemy');
    addRelGroup(anyEnt.complicatedResCharacter, 'complicatedResCharacter', 'Complicated');
    addRelGroup(anyEnt.pairedConnectedItems, 'pairedConnectedItems', 'Item');
    addRelGroup(anyEnt.pairedSkills, 'pairedSkills', 'Skill');

    if (rels.length > 0) {
        html += `
    <div class="card">
      <h2>Relational Web & Context Notes</h2>
      <div>
`;
        rels.forEach(r => {
            html += `        <div class="rel-item">
          <span class="rel-role">${escapeHtml(r.role)}</span>
          <span class="rel-name">${escapeHtml(r.name)}</span>
          ${r.note ? `<span class="rel-note">— "${escapeHtml(r.note)}"</span>` : ''}
        </div>\n`;
        });
        html += `      </div>
    </div>\n`;
    }

    // DM Notes in HTML
    if (entity.privateNotes && entity.privateNotes.trim()) {
        html += `
    <div class="card" style="border-left: 4px solid var(--accent);">
      <h2>DM Confidential Notes</h2>
      <div class="prose" style="font-family: monospace; font-size: 0.9rem;">${escapeHtml(entity.privateNotes.trim())}</div>
    </div>\n`;
    }

    html += `    <div class="footer">
      Generated from Nexus Chronicle Codex &bull; ${new Date().toLocaleDateString()}
    </div>
  </div>
</body>
</html>`;

    return html;
}

/**
 * Exports an array of entities of a category as pretty-printed JSON.
 */
export function exportCategoryAsJson(categoryOrType: string, entities: WorldEntity[]): string {
    const filtered = entities.filter(e => e.type === categoryOrType);
    return JSON.stringify(filtered, null, 2);
}

/**
 * Triggers a file download using Nexus Chronicle's universal file saver bridge.
 */
export async function downloadTextFile(
    content: string,
    fileName: string,
    mimeType: string = 'text/plain'
): Promise<void> {
    const blob = new Blob([content], { type: mimeType });
    await downloadFileToDevice(blob, fileName, mimeType);
}
