/**
 * Nexus Chronicle - Tauri Project Vault Adapter
 *
 * When running as a native Tauri desktop app, this module provides a second
 * storage tier underneath the primary IndexedDB CAS engine:
 *
 *   L1 - IndexedDB (assetStore.ts)    Fast in-memory blob cache for rendering
 *   L2 - Tauri AppData FS             Durable disk store at:
 *                                     $APPDATA/nexus-chronicle/assets/<hash>.<ext>
 *
 * The virtual URI abstraction (asset://sha256_<hash>.<ext>) is preserved
 * throughout. No consumer (NexusImage, AssetImageUploader, nexusArchive) needs
 * to change - only resolveAssetUrl() gains transparent dual-tier routing.
 *
 * Disk layout (Syncthing / Git friendly):
 *   %APPDATA%/com.haurukyun.nexuschronicle/assets/
 *     sha256_e3b0c44298fc1c14...png
 *     sha256_aabbcc1122334455...jpg
 *
 * The folder is flat, content-addressed, extension-keyed, and fully portable.
 */

import { invoke, convertFileSrc } from '@tauri-apps/api/core';
import { isDesktopApp } from './nativeFileBridge';

// Cached resolved AppData path so we only invoke the Rust command once per session.
let _vaultDir: string | null = null;

/**
 * Returns the absolute on-disk path to the assets vault directory.
 * Lazily resolved on first call; result is cached for the session lifetime.
 * Creates the directory if it does not yet exist.
 */
export async function getVaultDir(): Promise<string> {
    if (_vaultDir) return _vaultDir;

    // Call our custom Rust command registered in lib.rs via tauri::generate_handler!
    const appDataDir = await invoke<string>('get_app_data_dir');
    const dir = `${appDataDir}/assets`;

    try {
        await invoke('plugin:fs|mkdir', { path: dir, options: { recursive: true } });
    } catch {
        // Directory may already exist - not an error
    }

    _vaultDir = dir;
    return dir;
}


/** Converts a virtual asset URI to its physical on-disk filename. */
function uriToFileName(uri: string): string {
    return uri.replace(/^asset:\/\//, '');
}

/**
 * Writes a Blob to the disk vault. Returns silently when not running in Tauri.
 * Skips the write if an identical file already exists (CAS deduplication).
 */
export async function writeVaultAsset(uri: string, blob: Blob): Promise<void> {
    if (!isDesktopApp()) return;

    try {
        const dir = await getVaultDir();
        const filePath = `${dir}/${uriToFileName(uri)}`;

        // CAS: skip write if content-identical file already exists
        try {
            await invoke('plugin:fs|stat', { path: filePath });
            return; // File already present
        } catch {
            // File doesn't exist yet - proceed to write
        }

        const arrayBuffer = await blob.arrayBuffer();
        const bytes = Array.from(new Uint8Array(arrayBuffer));
        await invoke('plugin:fs|write_file', { path: filePath, data: bytes });
    } catch (err) {
        // Non-fatal: IDB remains as the fallback. User data is safe.
        console.warn('[tauriAssetVault] writeVaultAsset failed:', err);
    }
}

/**
 * Reads a Blob from the disk vault. Returns null if not on desktop,
 * if the file is missing, or on any error.
 */
export async function readVaultAsset(uri: string): Promise<Blob | null> {
    if (!isDesktopApp()) return null;

    try {
        const dir = await getVaultDir();
        const filePath = `${dir}/${uriToFileName(uri)}`;
        const rawBytes = await invoke<number[]>('plugin:fs|read_file', { path: filePath });
        const bytes = new Uint8Array(rawBytes);
        const ext = uriToFileName(uri).split('.').pop()?.toLowerCase() || 'png';
        return new Blob([bytes], { type: extToMime(ext) });
    } catch {
        return null;
    }
}

/**
 * Returns a WebView2-safe URL for a vault file using Tauri's convertFileSrc.
 *
 * WebView2 blocks raw file:// URLs in <img> src. convertFileSrc produces an
 * asset://localhost/<path> URL that Tauri's assetProtocol (enabled in
 * tauri.conf.json) whitelists for the webview, allowing native image rendering
 * without going through IndexedDB or blob: URLs at all.
 *
 * Returns null if not on desktop or if the file is not yet on disk.
 */
export async function resolveVaultUrl(uri: string): Promise<string | null> {
    if (!isDesktopApp()) return null;

    try {
        const dir = await getVaultDir();
        const filePath = `${dir}/${uriToFileName(uri)}`;

        // Verify the file exists before returning a potentially broken URL
        try {
            await invoke('plugin:fs|stat', { path: filePath });
        } catch {
            return null; // Not on disk yet - caller should fall back to IDB blob URL
        }

        return convertFileSrc(filePath);
    } catch (err) {
        console.warn('[tauriAssetVault] resolveVaultUrl failed:', err);
        return null;
    }
}

/**
 * Deletes a single asset file from the vault directory.
 * Silently no-ops if not on desktop or the file doesn't exist.
 */
export async function deleteVaultAsset(uri: string): Promise<void> {
    if (!isDesktopApp()) return;

    try {
        const dir = await getVaultDir();
        await invoke('plugin:fs|remove', { path: `${dir}/${uriToFileName(uri)}` });
    } catch {
        // File may not exist (IDB-only asset) - not an error
    }
}

/**
 * Lists all virtual asset URIs currently stored on disk in the vault.
 * Used by garbage collection to find disk files not referenced by any world.
 */
export async function listVaultAssets(): Promise<string[]> {
    if (!isDesktopApp()) return [];

    try {
        const dir = await getVaultDir();
        type DirEntry = { name: string; isFile: boolean };
        const entries = await invoke<DirEntry[]>('plugin:fs|read_dir', { path: dir });
        return entries
            .filter((e) => e.isFile && !!e.name)
            .map((e) => `asset://${e.name}`);
    } catch (err) {
        console.warn('[tauriAssetVault] listVaultAssets failed:', err);
        return [];
    }
}

/**
 * Garbage-collects orphaned disk files from the vault that are no longer
 * referenced by any active world or trash record. Runs in parallel with
 * pruneOrphanAssets() in assetStore.ts for full two-tier cleanup.
 */
export async function pruneVaultOrphans(
    activeUris: Set<string>
): Promise<{ deletedCount: number; bytesReclaimed: number }> {
    if (!isDesktopApp()) return { deletedCount: 0, bytesReclaimed: 0 };

    let deletedCount = 0;
    let bytesReclaimed = 0;

    try {
        const dir = await getVaultDir();
        type DirEntry = { name: string; isFile: boolean };
        const entries = await invoke<DirEntry[]>('plugin:fs|read_dir', { path: dir });

        for (const entry of entries) {
            if (!entry.isFile || !entry.name) continue;
            const uri = `asset://${entry.name}`;
            if (activeUris.has(uri)) continue;

            try {
                type StatResult = { size: number };
                const stat = await invoke<StatResult>('plugin:fs|stat', {
                    path: `${dir}/${entry.name}`
                });
                bytesReclaimed += stat.size || 0;
            } catch { /* stat failed - still attempt deletion */ }

            await deleteVaultAsset(uri);
            deletedCount++;
        }
    } catch (err) {
        console.warn('[tauriAssetVault] pruneVaultOrphans failed:', err);
    }

    return { deletedCount, bytesReclaimed };
}

/**
 * Promotes an asset from IndexedDB into the disk vault if it isn't there yet.
 * Called lazily when resolving an asset URL on desktop and the disk file is absent
 * (e.g. first desktop launch after data was created in the browser, or after a
 * .nexus import that only populated IDB).
 */
export async function promoteAssetToDisk(uri: string, blob: Blob): Promise<void> {
    if (!isDesktopApp()) return;
    await writeVaultAsset(uri, blob);
}

// --- Internal helpers --------------------------------------------------------

function extToMime(ext: string): string {
    const map: Record<string, string> = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        avif: 'image/avif',
    };
    return map[ext] || 'application/octet-stream';
}
