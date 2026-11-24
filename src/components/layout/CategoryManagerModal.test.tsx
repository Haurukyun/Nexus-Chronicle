import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CategoryManagerModal } from './CategoryManagerModal';
import { TYPE_LABELS } from '../../constants';
import { WorldData } from '../../types';

const mockWorld: WorldData = {
    id: 'test-realm',
    name: 'Aethelgard',
    description: 'Test realm',
    worldPhase: 'golden',
    entities: [],
    customSuggestions: {
        character: ['Brave', 'Cynical']
    },
    activeEntityTypes: ['character', 'location', 'chapter'],
    sidebarGroupOrder: ['story', 'world', 'groups', 'details']
} as any;

describe('CategoryManagerModal & Blueprint Configuration', () => {
    it('returns empty when isOpen is false', () => {
        const html = renderToString(
            <CategoryManagerModal isOpen={false} onClose={() => {}} world={mockWorld} />
        );
        expect(html).toBe('');
    });

    it('renders open modal with blueprints and categories', () => {
        const html = renderToString(
            <CategoryManagerModal isOpen={true} onClose={() => {}} world={mockWorld} />
        );
        expect(html).toContain('Codex Categories &amp; Realm Blueprints');
        expect(html).toContain('Genre Blueprints &amp; Presets');
        expect(html).toContain('Sidebar Group Order');
    });

    it('verifies science and tech have distinct non-duplicate labels', () => {
        expect(TYPE_LABELS.science).toBe('Scientific Groups');
        expect(TYPE_LABELS.tech).toBe('Technologies & Inventions');
        expect(TYPE_LABELS.science).not.toEqual(TYPE_LABELS.tech);
    });
});
