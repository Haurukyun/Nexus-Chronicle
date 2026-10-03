/**
 * Nexus Chronicle - Content-Addressable Storage (CAS) IndexedDB Asset Engine
 * High-capacity client-side binary storage with SHA-256 deduplication for
 * HD images, cartography maps, audio files, and media attachments across PC and Mobile.
 *
 * Storage tiers (desktop only):
 *   L1 - IndexedDB (this file)        Fast in-process blob cache, always available
 *   L2 - Tauri Project Vault          Durable AppData disk store, Syncthing/Git friendly
 *                                     see: src/utils/tauriAssetVault.ts
 */

import { WorldData } from '../types';
import {
    writeVaultAsset,
    resolveVaultUrl,
    deleteVaultAsset,
    pruneVaultOrphans,
    promoteAssetToDisk,
} from './tauriAssetVault';

export interface StoredAsset {
    id: string; // e.g. "asset://sha256_e3b0c442...png" or legacy "asset://<uuid>"
    blob: Blob;
    mimeType: string;
    fileName?: string;
    size: number;
    createdAt: number;
}

const DB_NAME = 'nexus_chronicle_assets_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_assets';

let dbInstance: IDBDatabase | null = null;
const objectUrlCache = new Map<string, string>();

/**
 * Computes a standard SHA-256 lowercase hex hash string for a given binary Blob.
 */
export async function computeBlobHash(blob: Blob): Promise<string> {
    const arrayBuffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Derives a clean, standard file extension from a mime-type or file name.
 */
export function deriveExtension(mimeType: string, fileName?: string): string {
    if (fileName && fileName.includes('.')) {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext && ext.length <= 5 && !ext.includes(' ')) return ext;
    }
    const cleanMime = (mimeType || 'image/png').toLowerCase().trim();
    if (cleanMime.includes('jpeg') || cleanMime.includes('jpg')) return 'jpg';
    if (cleanMime.includes('png')) return 'png';
    if (cleanMime.includes('webp')) return 'webp';
    if (cleanMime.includes('gif')) return 'gif';
    if (cleanMime.includes('svg')) return 'svg';
    if (cleanMime.includes('avif')) return 'avif';
    return cleanMime.split('/')[1]?.replace('+xml', '') || 'png';
}

/**
 * Initializes and opens the IndexedDB database.
 */
export const getAssetDb = (): Promise<IDBDatabase> => {
    if (dbInstance) return Promise.resolve(dbInstance);

    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
            reject(new Error('IndexedDB is not supported in this environment.'));
            return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            dbInstance = (event.target as IDBOpenDBRequest).result;
            dbInstance.onversionchange = () => {
                dbInstance?.close();
                dbInstance = null;
            };
            resolve(dbInstance);
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
};

/**
 * Retrieves a raw Blob by asset ID.
 */
export const getAsset = async (id: string): Promise<Blob | null> => {
    if (!id || !id.startsWith('asset://')) return null;
    const db = await getAssetDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => {
            const result = req.result as StoredAsset | undefined;
            resolve(result ? result.blob : null);
        };
        req.onerror = () => reject(req.error);
    });
};

/**
 * Saves a raw binary File or Blob using Content-Addressable Storage (CAS).
 * 1. Automatically computes SHA-256 cryptographic hash of the content.
 * 2. If the identical image bytes already exist in IndexedDB, returns the existing
 *    canonical URI immediately without duplicate disk allocation (instant deduplication).
 * 3. Persists with clean extension formatting: "asset://sha256_<hash>.<ext>".
 */
export const saveAsset = async (
    fileOrBlob: File | Blob,
    customId?: string
): Promise<string> => {
    const db = await getAssetDb();
    const fileName = fileOrBlob instanceof File ? fileOrBlob.name : undefined;
    const mimeType = fileOrBlob.type || 'image/png';
    const size = fileOrBlob.size;

    let id = customId;
    if (!id) {
        const hashHex = await computeBlobHash(fileOrBlob);
        const ext = deriveExtension(mimeType, fileName);
        id = `asset://sha256_${hashHex}.${ext}`;
    }

    // Fast-path: check if content hash already exists in storage
    const existingBlob = await getAsset(id);
    if (existingBlob) {
        // Content deduplicated instantly! Return existing URI without redundant write
        return id;
    }

    const record: StoredAsset = {
        id,
        blob: fileOrBlob,
        mimeType,
        fileName,
        size,
        createdAt: Date.now()
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(record);

        req.onsuccess = () => {
            if (objectUrlCache.has(id!)) {
                URL.revokeObjectURL(objectUrlCache.get(id!)!);
                objectUrlCache.delete(id!);
            }
            // L2 write-through: persist to disk vault for durability and Syncthing sync.
            // Fire-and-forget; IDB is the source of truth if vault write fails.
            writeVaultAsset(id!, fileOrBlob).catch((e) =>
                console.warn('[assetStore] vault write-through skipped:', e)
            );
            resolve(id!);
        };
        req.onerror = () => reject(req.error);
    });
};

/**
 * Returns a temporary browser Object URL for rendering in <img> or CSS.
 * If the input is already a standard URL (http, https, data:), returns it directly.
 */
export const resolveAssetUrl = async (uriOrUrl: string | undefined): Promise<string> => {
    if (!uriOrUrl) return '';
    if (!uriOrUrl.startsWith('asset://')) return uriOrUrl;

    // L1 cache: object URL still valid from a previous resolve this session
    if (objectUrlCache.has(uriOrUrl)) {
        return objectUrlCache.get(uriOrUrl)!;
    }

    // L2 (desktop only): Try disk vault first via Tauri's asset:// protocol.
    // Gives WebView2 a native-path URL it can stream directly without buffering
    // the entire blob into JS memory via IDB + URL.createObjectURL.
    const vaultUrl = await resolveVaultUrl(uriOrUrl);
    if (vaultUrl) {
        objectUrlCache.set(uriOrUrl, vaultUrl);
        return vaultUrl;
    }

    // L1 fallback: read from IndexedDB
    const blob = await getAsset(uriOrUrl);
    if (!blob) return '';

    // Lazily promote IDB blob to disk vault so future resolves skip IDB
    promoteAssetToDisk(uriOrUrl, blob).catch(() => {/* no-op */});

    const objUrl = URL.createObjectURL(blob);
    objectUrlCache.set(uriOrUrl, objUrl);
    return objUrl;
};

/**
 * Deletes an asset by ID from IndexedDB.
 */
export const deleteAsset = async (id: string): Promise<void> => {
    if (!id || !id.startsWith('asset://')) return;
    const db = await getAssetDb();

    if (objectUrlCache.has(id)) {
        URL.revokeObjectURL(objectUrlCache.get(id)!);
        objectUrlCache.delete(id);
    }

    // Mirror deletion to disk vault (fire-and-forget)
    deleteVaultAsset(id).catch(() => {/* no-op */});

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
};

/**
 * Returns all stored assets (used for bundle exports, P2P sync, and pruning audits).
 */
export const getAllAssets = async (): Promise<StoredAsset[]> => {
    const db = await getAssetDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
            resolve((req.result as StoredAsset[]) || []);
        };
        req.onerror = () => reject(req.error);
    });
};

/**
 * Batch imports assets into IndexedDB (used during .nexus archive restoration).
 */
export const importAssets = async (assets: StoredAsset[]): Promise<number> => {
    if (!assets || assets.length === 0) return 0;
    const db = await getAssetDb();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        let count = 0;

        for (const asset of assets) {
            store.put(asset);
            count++;
        }

        tx.oncomplete = () => resolve(count);
        tx.onerror = () => reject(tx.error);
    });
};

/**
 * Garbage collection: Scans all stored assets in IndexedDB and removes any asset
 * not present in activeAssetUris.
 * Returns the count and total bytes reclaimed.
 */
export const pruneOrphanAssets = async (
    activeAssetUris: Set<string> | string[]
): Promise<{ deletedCount: number; bytesReclaimed: number }> => {
    const db = await getAssetDb();
    const activeSet = activeAssetUris instanceof Set ? activeAssetUris : new Set(activeAssetUris);
    const allAssets = await getAllAssets();

    let bytesReclaimed = 0;
    const toDelete: string[] = [];

    for (const asset of allAssets) {
        if (!activeSet.has(asset.id)) {
            toDelete.push(asset.id);
            bytesReclaimed += asset.size || 0;
        }
    }

    // L2: in parallel, prune any orphaned disk files not in the active set
    const vaultResult = await pruneVaultOrphans(activeSet);
    bytesReclaimed += vaultResult.bytesReclaimed;

    if (toDelete.length === 0) {
        return { deletedCount: vaultResult.deletedCount, bytesReclaimed };
    }

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        for (const id of toDelete) {
            store.delete(id);
            if (objectUrlCache.has(id)) {
                URL.revokeObjectURL(objectUrlCache.get(id)!);
                objectUrlCache.delete(id);
            }
        }

        tx.oncomplete = () => {
            resolve({
                deletedCount: toDelete.length + vaultResult.deletedCount,
                bytesReclaimed
            });
        };
        tx.onerror = () => reject(tx.error);
    });
};

/**
 * Scans all entities, map layers, trash records, and markdown notes
 * in the active campaign world(s) to extract all referenced asset:// URIs.
 */
export function extractActiveAssetUris(worlds: WorldData[] | WorldData): Set<string> {
    const list = Array.isArray(worlds) ? worlds : [worlds];
    const uris = new Set<string>();

    for (const world of list) {
        if (world.mapImage && world.mapImage.startsWith('asset://')) {
            uris.add(world.mapImage);
        }

        const allEntities = [...(world.entities || []), ...(world.trash || [])];
        for (const entity of allEntities) {
            if (entity.imageUri && entity.imageUri.startsWith('asset://')) {
                uris.add(entity.imageUri);
            }
            if ((entity as any).headerImageUri && (entity as any).headerImageUri.startsWith('asset://')) {
                uris.add((entity as any).headerImageUri);
            }

            // Also scan description / privateNotes for embedded asset:// links
            const textFields = [entity.description, entity.privateNotes];
            for (const text of textFields) {
                if (typeof text === 'string' && text.includes('asset://')) {
                    const matches = text.match(/asset:\/\/[a-zA-Z0-9_\-.]+/g);
                    if (matches) {
                        matches.forEach((m) => uris.add(m));
                    }
                }
            }
        }
    }

    return uris;
}

/**
 * Requests persistent storage from the browser (protects iOS & mobile from cache eviction).
 */
export const requestPersistentStorage = async (): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
        return await navigator.storage.persist();
    }
    return false;
};

/**
 * Gets storage estimate in bytes and percentage.
 */
export const getStorageEstimate = async (): Promise<{ usedBytes: number; quotaBytes: number; percentage: number }> => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const usedBytes = estimate.usage || 0;
        const quotaBytes = estimate.quota || 0;
        const percentage = quotaBytes > 0 ? (usedBytes / quotaBytes) * 100 : 0;
        return { usedBytes, quotaBytes, percentage };
    }
    return { usedBytes: 0, quotaBytes: 0, percentage: 0 };
};
