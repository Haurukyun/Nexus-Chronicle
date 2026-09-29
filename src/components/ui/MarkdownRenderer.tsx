import React, { useMemo } from 'react';
import { marked, Renderer } from 'marked';
import DOMPurify from 'dompurify';
import { WorldEntity } from '../../types';

interface MarkdownRendererProps {
    content: string;
    allEntities: WorldEntity[];
    onNavigate?: (id: string) => void;
    isWikiMode: boolean;
    /** Extra class names on the outer wrapper */
    className?: string;
}

// Build a name→id lookup for wikilinks
function buildNameMap(entities: WorldEntity[]): Map<string, string> {
    const map = new Map<string, string>();
    entities.forEach(e => {
        // Primary name
        map.set(e.name.toLowerCase(), e.id);
        // Common aliases
        if ((e as any).otherNamesAndEpithets) {
            String((e as any).otherNamesAndEpithets)
                .split(',')
                .map((s: string) => s.trim().toLowerCase())
                .filter(Boolean)
                .forEach((alias: string) => map.set(alias, e.id));
        }
    });
    return map;
}

/**
 * Converts [[Entity Name]] wikilinks to anchor tags with a custom data attribute.
 * The renderer replaces them before handing off to marked.
 */
function processWikilinks(text: string, nameMap: Map<string, string>): string {
    return text.replace(/\[\[([^\]]+)\]\]/g, (_match, name: string) => {
        const id = nameMap.get(name.toLowerCase());
        if (id) {
            return `<a href="#" data-entity-id="${id}" class="wikilink">${name}</a>`;
        }
        // Unresolved wikilink — show with a dashed underline
        return `<span class="wikilink wikilink--broken">${name}</span>`;
    });
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
    content,
    allEntities,
    onNavigate,
    isWikiMode,
    className = '',
}) => {
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
            const id = link.getAttribute('data-entity-id');
            if (id && onNavigate) onNavigate(id);
        }
    };

    const proseClass = isWikiMode
        ? 'prose-nexus-wiki'
        : 'prose-nexus-dark';

    return (
        <div
            className={`prose-nexus ${proseClass} ${className}`}
            onClick={handleClick}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};
