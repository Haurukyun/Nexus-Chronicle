import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { WorldEntity } from '../../types';
import { useTheme } from '../../theme';
import { useWorldStore } from '../../store/useWorldStore';

interface MarkdownRendererProps {
    content: string;
    allEntities: WorldEntity[];
    onNavigate?: (id: string) => void;
    isWikiMode?: boolean;
    /** Extra class names on the outer wrapper */
    className?: string;
}

// Build a name→id lookup for wikilinks
function buildNameMap(entities: WorldEntity[]): Map<string, string> {
    const map = new Map<string, string>();
    entities.forEach(e => {
        if (!e) return;
        if (e.name) {
            map.set(e.name.trim().toLowerCase(), e.id);
        }
        if (e.id) {
            map.set(e.id.toLowerCase(), e.id);
        }
        // Common aliases
        if ((e as any).otherNamesAndEpithets) {
            String((e as any).otherNamesAndEpithets)
                .split(',')
                .map((s: string) => s.trim().toLowerCase())
                .filter(Boolean)
                .forEach((alias: string) => map.set(alias, e.id));
        }
        if (Array.isArray((e as any).otherNames)) {
            (e as any).otherNames.forEach((alias: any) => {
                if (typeof alias === 'string' && alias.trim()) {
                    map.set(alias.trim().toLowerCase(), e.id);
                }
            });
        }
    });
    return map;
}

/**
 * Converts [[Entity Name]] or [[Entity Name|Display Text]] wikilinks to anchor tags.
 */
function processWikilinks(text: string, nameMap: Map<string, string>): string {
    return text.replace(/\[\[([^\]]+)\]\]/g, (_match, rawTarget: string) => {
        const parts = rawTarget.split('|');
        const target = parts[0].trim();
        const display = parts.length > 1 ? parts.slice(1).join('|').trim() : target;
        const id = nameMap.get(target.toLowerCase());
        if (id) {
            return `<a href="#" data-entity-id="${id}" class="wikilink" title="Jump to ${target}">${display}</a>`;
        }
        // Unresolved wikilink — show with a dashed underline
        return `<span class="wikilink wikilink--broken" title="Unresolved entity link">${display}</span>`;
    });
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
    content,
    allEntities,
    onNavigate,
    className = '',
}) => {
    const { themeId, layoutMode } = useTheme();
    const isWiki = layoutMode === 'wiki';
    const isRoyal = themeId === 'royal-codex';
    const isVoyager = themeId === 'grand-voyager';

    const nameMap = useMemo(() => buildNameMap(allEntities), [allEntities]);

    const html = useMemo(() => {
        const withWikilinks = processWikilinks(content, nameMap);
        const raw = marked.parse(withWikilinks, { async: false }) as string;
        return DOMPurify.sanitize(raw, {
            ADD_ATTR: ['data-entity-id'],
            ALLOWED_TAGS: [
                'p', 'br', 'strong', 'em', 'del', 's', 'code', 'pre',
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'ul', 'ol', 'li', 'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
                'a', 'span',
            ],
        });
    }, [content, nameMap]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const link = target.closest<HTMLAnchorElement>('a[data-entity-id]');
        if (link) {
            e.preventDefault();
            e.stopPropagation();
            const id = link.getAttribute('data-entity-id');
            if (id) {
                if (onNavigate) {
                    onNavigate(id);
                } else {
                    useWorldStore.getState().handleOpenEntity(id);
                }
            }
        }
    };

    const proseClass = isRoyal
        ? 'prose-nexus-royal'
        : isWiki
        ? 'prose-nexus-wiki'
        : isVoyager
        ? 'prose-nexus-voyager'
        : 'prose-nexus-dark';

    return (
        <div
            className={`prose-nexus ${proseClass} ${className}`}
            onClick={handleClick}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};
