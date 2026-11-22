import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CodexCheckbox } from './CodexCheckbox';

describe('CodexCheckbox Component', () => {
    it('renders unchecked checkbox without crashing', () => {
        const html = renderToString(<CodexCheckbox checked={false} />);
        expect(html).toBeDefined();
        expect(html).toContain('border');
    });

    it('renders checked checkbox with check icon', () => {
        const html = renderToString(<CodexCheckbox checked={true} />);
        expect(html).toBeDefined();
        expect(html).toContain('svg');
    });

    it('supports different sizes (sm, md, lg)', () => {
        const smHtml = renderToString(<CodexCheckbox checked={true} size="sm" />);
        const mdHtml = renderToString(<CodexCheckbox checked={true} size="md" />);
        const lgHtml = renderToString(<CodexCheckbox checked={true} size="lg" />);

        expect(smHtml).toContain('w-3 h-3');
        expect(mdHtml).toContain('w-3.5 h-3.5');
        expect(lgHtml).toContain('w-4 h-4');
    });
});
