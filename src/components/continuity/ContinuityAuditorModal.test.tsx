import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ContinuityAuditorModal } from './ContinuityAuditorModal';
import { WorldData } from '../../types';

const mockWorld: WorldData = {
    id: 'test-realm',
    name: 'Aethelgard',
    worldPhase: 'golden',
    entities: [
        {
            id: 'char_1',
            type: 'character',
            name: 'Paradox Hero',
            birthDate: '1500',
            deathDate: '1400'
        }
    ]
} as any;

describe('ContinuityAuditorModal Component', () => {
    it('returns empty when isOpen is false', () => {
        const html = renderToString(
            <ContinuityAuditorModal isOpen={false} onClose={() => {}} world={mockWorld} onNavigate={() => {}} />
        );
        expect(html).toBe('');
    });

    it('renders open modal with continuity metrics and issues', () => {
        const html = renderToString(
            <ContinuityAuditorModal isOpen={true} onClose={() => {}} world={mockWorld} onNavigate={() => {}} />
        );
        expect(html).toContain('Continuity &amp; Timeline Auditor');
        expect(html).toContain('Critical Paradoxes');
        expect(html).toContain('Paradox Hero');
        expect(html).toContain('Inverted Lifespan');
    });
});
