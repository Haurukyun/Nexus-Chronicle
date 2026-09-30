/**
 * Nexus Chronicle - Unified .nexus Archive Bundler (ZIP Format)
 *
 * The .nexus file is a standard ZIP archive openable in any OS file manager
 * (7-Zip, WinRAR, macOS Archive Utility, Android file apps).
 *
 * Internal layout:
 *   manifest.json      ← world/universe lore JSON + asset index
 *   assets/
 *     <assetId>.<ext>  ← every HD image/media file, uncompressed (STORE mode)
 *
 * Uses fflate for fast streaming ZIP assembly with zero compression on binary
 * blobs (images are already compressed by their codec — double-compressing
 * would waste time and increase file size).
 */

import { zipSync, unzipSync, strToU8, strFromU8, Zippable } from 'fflate';
import { WorldData, UniverseArchive } from '../types';
import { importAssets, StoredAsset, getAllAssets } from './assetStore';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AssetManifestEntry {
    id: string;
    mimeType: string;
    size: number;
    fileName: string; // e.g. "assets/asset_abc123.jpg" — the ZIP entry path
    originalName?: string;
}

export interface ArchiveManifest {
    version: 2;
    format: 'zip';
    createdAt: number;
    appVersion: string;
    world?: WorldData;
    universe?: UniverseArchive;
    assets: AssetManifestEntry[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Resolve a MIME type to a common file extension. */
const mimeToExt = (mime: string): string => {
    const map: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/svg+xml': 'svg',
        'image/avif': 'avif',
        'image/bmp': 'bmp',
        'image/tiff': 'tiff',
        'video/mp4': 'mp4',
        'video/webm': 'webm',
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
        'application/pdf': 'pdf',
    };
    return map[mime] ?? 'bin';
};

/**
 * Scan a value tree for all asset:// URIs referenced in the world/universe.
 * These are the only assets we need to bundle for a single-realm export.
 */
export const extractReferencedAssetIds = (obj: any): Set<string> => {
    const ids = new Set<string>();
    const scan = (val: any) => {
        if (!val) return;
        if (typeof val === 'string') {
            if (val.startsWith('asset://')) ids.add(val);
        } else if (Array.isArray(val)) {
            val.forEach(scan);
        } else if (typeof val === 'object') {
            Object.values(val).forEach(scan);
        }
    };
    scan(obj);
    return ids;
};

// ─── Pack ────────────────────────────────────────────────────────────────────

/**
 * Creates a .nexus ZIP archive from a WorldData or UniverseArchive.
 * Assets are stored uncompressed (STORE mode) for maximum speed and fidelity.
 */
export const createNexusArchive = async (
    target: { world?: WorldData; universe?: UniverseArchive }
): Promise<Blob> => {
    // 1. Determine which assets to include
    const referencedIds = extractReferencedAssetIds(target.world || target.universe);
    const allDbAssets = await getAllAssets();

    // For a single realm we only bundle referenced assets.
    // For a universe we bundle every asset in the vault.
    const assetsToInclude = allDbAssets.filter(a =>
        target.universe ? true : referencedIds.has(a.id)
    );

    // 2. Build manifest + ZIP entries simultaneously
    const assetManifestEntries: AssetManifestEntry[] = [];
    const zipEntries: Zippable = {};

    for (const asset of assetsToInclude) {
        const ext = asset.fileName
            ? asset.fileName.split('.').pop() ?? mimeToExt(asset.mimeType)
            : mimeToExt(asset.mimeType);

        // ZIP path: assets/<id>.<ext>
        // Using asset ID as filename guarantees uniqueness.
        const zipPath = `assets/${asset.id}.${ext}`;

        const arrayBuffer = await asset.blob.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);

        // [0] = STORE (no compression), keeps 100% fidelity for image data
        zipEntries[zipPath] = [uint8, { level: 0 }];

        assetManifestEntries.push({
            id: asset.id,
            mimeType: asset.mimeType,
            size: asset.size,
            fileName: zipPath,
            originalName: asset.fileName,
        });
    }

    // 3. Build manifest JSON
    const manifest: ArchiveManifest = {
        version: 2,
        format: 'zip',
        createdAt: Date.now(),
        appVersion: '1.3.0-multiverse',
        world: target.world,
        universe: target.universe,
        assets: assetManifestEntries,
    };

    // manifest.json is small text — light compression is fine
    zipEntries['manifest.json'] = strToU8(JSON.stringify(manifest, null, 2));

    // 4. Zip synchronously (fflate is fast enough for typical world sizes)
    //    For very large worlds (100+ HD photos), this may take ~1-2s.
    const zipped = zipSync(zipEntries);

    return new Blob([zipped], { type: 'application/zip' });
};

// ─── Unpack ──────────────────────────────────────────────────────────────────

/**
 * Parses and unpacks a .nexus (ZIP) archive.
 * Automatically saves all contained uncompressed HD image blobs to IndexedDB.
 * Returns the parsed manifest and count of assets imported.
 */
export const unpackNexusArchive = async (
    archiveFile: File | Blob
): Promise<{ manifest: ArchiveManifest; assetsImported: number }> => {
    const arrayBuffer = await archiveFile.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    // Unzip all entries
    let unzipped: ReturnType<typeof unzipSync>;
    try {
        unzipped = unzipSync(uint8);
    } catch (err) {
        // Fallback: try parsing as legacy V1 binary format
        throw new Error(
            'Not a valid Nexus Chronicle archive. Make sure you selected a .nexus file exported from Nexus Chronicle.'
        );
    }

    // Read manifest.json
    const manifestEntry = unzipped['manifest.json'];
    if (!manifestEntry) {
        throw new Error('Archive is missing manifest.json — the file may be corrupted.');
    }

    const manifest: ArchiveManifest = JSON.parse(strFromU8(manifestEntry));

    if (manifest.version !== 2 || manifest.format !== 'zip') {
        throw new Error(
            `Unsupported archive format (version ${(manifest as any).version}). ` +
            'Please export a new archive from Nexus Chronicle.'
        );
    }

    // 2. Reconstruct asset blobs from ZIP entries
    const storedAssets: StoredAsset[] = [];

    for (const entry of manifest.assets) {
        const data = unzipped[entry.fileName];
        if (!data) continue; // missing entry — skip gracefully

        const blob = new Blob([data], { type: entry.mimeType });
        storedAssets.push({
            id: entry.id,
            blob,
            mimeType: entry.mimeType,
            fileName: entry.originalName,
            size: entry.size,
            createdAt: Date.now(),
        });
    }

    // 3. Inscribe all assets to IndexedDB vault
    const assetsImported = await importAssets(storedAssets);

    return { manifest, assetsImported };
};

// ─── Export helper ───────────────────────────────────────────────────────────

/**
 * Downloads or shares the .nexus archive to the user's device.
 * Uses Web Share API on mobile for native AirDrop / Save to Files / Google Drive.
 * Falls back to standard browser download on desktop.
 */
export const exportNexusArchiveFile = async (
    target: { world?: WorldData; universe?: UniverseArchive }
): Promise<void> => {
    const archiveBlob = await createNexusArchive(target);
    const worldName = target.world?.name || target.universe ? 'Nexus_Multiverse' : 'Chronicle';
    const cleanName = worldName.toLowerCase().replace(/[^a-z0-9]/gi, '_');
    const fileName = `${cleanName}_chronicle.nexus`;

    // Try Web Share API (native sheet on iOS / Android)
    if (typeof navigator !== 'undefined' && navigator.canShare) {
        const file = new File([archiveBlob], fileName, { type: 'application/zip' });
        if (navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: `${worldName} — Nexus Chronicle`,
                    text: 'Complete campaign chronicle archive with uncompressed assets.',
                    files: [file],
                });
                return;
            } catch (err: any) {
                if (err.name === 'AbortError') return; // user dismissed sheet
            }
        }
    }

    // Standard desktop download
    const url = URL.createObjectURL(archiveBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
};
