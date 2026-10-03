import { describe, it, expect } from 'vitest';
import { zipSync, unzipSync, strToU8, strFromU8, Zippable } from 'fflate';
import { WorldData } from '../types';
import { ArchiveManifest } from './nexusArchive';

describe('nexus archive container layout', () => {
    it('packages manifest.json and binary assets into standard uncompressed zip layout and unpacks losslessly', () => {
        const dummyWorld: WorldData = {
            id: 'realm-test-1',
            name: 'Aethelgard Test Realm',
            description: 'A test realm for .nexus container verification',
            createdAt: 1700000000000,
            lastModified: 1700000000000,
            entities: [
                {
                    id: 'char-1',
                    type: 'character',
                    name: 'Aurelius',
                    status: 'draft',
                    createdAt: 1700000000000,
                    updatedAt: 1700000000000,
                    description: 'The Founder',
                    isReadOnly: false,
                } as any
            ],
            trash: [],
            mapImage: 'https://example.com/map.jpg',
            mapConnections: [],
            worldPhase: 'golden'
        };

        const sampleBinary = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // PNG header bytes
        const assetPath = 'assets/asset_test1.png';

        const manifest: ArchiveManifest = {
            version: 2,
            format: 'zip',
            createdAt: Date.now(),
            appVersion: '1.3.0-multiverse',
            world: dummyWorld,
            assets: [
                {
                    id: 'asset://asset_test1',
                    mimeType: 'image/png',
                    size: sampleBinary.byteLength,
                    fileName: assetPath,
                    originalName: 'test.png'
                }
            ]
        };

        const zipEntries: Zippable = {
            'manifest.json': strToU8(JSON.stringify(manifest, null, 2)),
            [assetPath]: [sampleBinary, { level: 0 }] // STORE mode
        };

        // 1. Pack
        const zipped = zipSync(zipEntries);
        expect(zipped).toBeDefined();
        expect(zipped.byteLength).toBeGreaterThan(0);

        // 2. Unpack
        const unzipped = unzipSync(zipped);
        expect(unzipped['manifest.json']).toBeDefined();
        expect(unzipped[assetPath]).toBeDefined();

        const restoredManifest: ArchiveManifest = JSON.parse(strFromU8(unzipped['manifest.json']));
        expect(restoredManifest.version).toBe(2);
        expect(restoredManifest.format).toBe('zip');
        expect(restoredManifest.world?.name).toBe('Aethelgard Test Realm');
        expect(restoredManifest.assets.length).toBe(1);

        const restoredBytes = unzipped[assetPath];
        expect(Array.from(restoredBytes)).toEqual(Array.from(sampleBinary));
    });
});
