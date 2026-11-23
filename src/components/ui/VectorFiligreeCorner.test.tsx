import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { VectorFiligreeCorner } from './VectorFiligreeCorner';

describe('VectorFiligreeCorner Component', () => {
    it('renders all four corner positions with appropriate SVG group transforms', () => {
        const tl = renderToString(<VectorFiligreeCorner position="top-left" />);
        const tr = renderToString(<VectorFiligreeCorner position="top-right" />);
        const br = renderToString(<VectorFiligreeCorner position="bottom-right" />);
        const bl = renderToString(<VectorFiligreeCorner position="bottom-left" />);

        expect(tl).toContain('rotate(0 12 12)');
        expect(tr).toContain('rotate(90 12 12)');
        expect(br).toContain('rotate(180 12 12)');
        expect(bl).toContain('rotate(270 12 12)');
    });

    it('renders glow filter definition to prevent pixelation on fractional display scaling', () => {
        const html = renderToString(<VectorFiligreeCorner position="top-left" color="#c8a96e" />);
        expect(html).toContain('feDropShadow');
        expect(html).toContain('flood-color="#c8a96e"');
    });

    it('applies custom size and class names', () => {
        const html = renderToString(<VectorFiligreeCorner position="top-left" size={28} className="custom-class" />);
        expect(html).toContain('width="28"');
        expect(html).toContain('height="28"');
        expect(html).toContain('custom-class');
    });
});
