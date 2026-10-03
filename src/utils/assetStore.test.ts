import { describe, it, expect } from 'vitest';
import { computeBlobHash, deriveExtension, extractActiveAssetUris } from './assetStore';
import { WorldData } from '../types';

describe('Content-Addressable Storage (CAS) Asset Engine', () => {
    it('computes deterministic SHA-256 hash across identical binary inputs', async () => {
        const bytesA = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        const bytesB = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        const bytesC = new Uint8Array([8, 7, 6, 5, 4, 3, 2, 1]);

        const blobA = new Blob([bytesA], { type: 'image/png' });
        const blobB = new Blob([bytesB], { type: 'image/png' });
        const blobC = new Blob([bytesC], { type: 'image/png' });

        const hashA = await computeBlobHash(blobA);
        const hashB = await computeBlobHash(blobB);
        const hashC = await computeBlobHash(blobC);

        // Identical content must produce identical hash (deduplication guarantee)
        expect(hashA).toBe(hashB);
        expect(hashA).toHaveLength(64); // SHA-256 hex string length

        // Different content produces different hash
        expect(hashA).not.toBe(hashC);
    });

    it('derives correct file extensions from mime types and file names', () => {
        expect(deriveExtension('image/jpeg')).toBe('jpg');
        expect(deriveExtension('image/jpg')).toBe('jpg');
        expect(deriveExtension('image/png')).toBe('png');
        expect(deriveExtension('image/webp')).toBe('webp');
        expect(deriveExtension('image/svg+xml')).toBe('svg');
        expect(deriveExtension('image/avif')).toBe('avif');
        expect(deriveExtension('application/octet-stream', 'map_campaign.webp')).toBe('webp');
    });

    it('extracts all active asset URIs from entities, maps, and markdown text', () => {
        const dummyWorld: WorldData = {
            id: 'world-1',
            name: 'Valerius',
            createdAt: 1000,
            lastModified: 1000,
            mapImage: 'asset://sha256_map123.jpg',
            entities: [
                {
                    id: 'char-1',
                    type: 'character',
                    name: 'Kaelen',
                    imageUri: 'asset://sha256_portrait123.png',
                    description: 'Carries an amulet: ![sigil](asset://sha256_sigil456.svg)',
                    privateNotes: 'See secret map at asset://sha256_secret789.webp',
                } as any
            ],
            trash: [
                {
                    id: 'loc-1',
                    type: 'location',
                    name: 'Lost Temple',
                    imageUri: 'asset://sha256_temple999.png',
                } as any
            ],
            mapConnections: [],
            worldPhase: 'golden'
        };

        const activeUris = extractActiveAssetUris(dummyWorld);

        // Should find map image, character portrait, description markdown link,
        // privateNotes link, AND trash image (to protect restorable items from pruning)
        expect(activeUris.has('asset://sha256_map123.jpg')).toBe(true);
        expect(activeUris.has('asset://sha256_portrait123.png')).toBe(true);
        expect(activeUris.has('asset://sha256_sigil456.svg')).toBe(true);
        expect(activeUris.has('asset://sha256_secret789.webp')).toBe(true);
        expect(activeUris.has('asset://sha256_temple999.png')).toBe(true);
        expect(activeUris.size).toBe(5);
    });
});
