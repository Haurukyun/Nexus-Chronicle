/**
 * Nexus Chronicle - IndexedDB Asset Engine
 * High-capacity client-side binary storage for uncompressed HD images, cartography maps,
 * audio files, and media attachments across PC and Mobile.
 */

export interface StoredAsset {
    id: string; // e.g. "asset://a7f29b4c-..."
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
 * Saves a raw binary File or Blob into IndexedDB.
 * Returns the stable canonical URI (e.g. "asset://[uuid]").
 */
export const saveAsset = async (
    fileOrBlob: File | Blob,
    customId?: string
): Promise<string> => {
    const db = await getAssetDb();
    const id = customId || `asset://${crypto.randomUUID()}`;
    const fileName = fileOrBlob instanceof File ? fileOrBlob.name : undefined;
    const mimeType = fileOrBlob.type || 'image/png';
    const size = fileOrBlob.size;

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
            // Revoke old cached URL if it exists
            if (objectUrlCache.has(id)) {
                URL.revokeObjectURL(objectUrlCache.get(id)!);
                objectUrlCache.delete(id);
            }
            resolve(id);
        };
        req.onerror = () => reject(req.error);
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
 * Returns a temporary browser Object URL for rendering in <img> or CSS.
 * If the input is already a standard URL (http, https, data:), returns it directly.
 */
export const resolveAssetUrl = async (uriOrUrl: string | undefined): Promise<string> => {
    if (!uriOrUrl) return '';
    if (!uriOrUrl.startsWith('asset://')) return uriOrUrl;

    if (objectUrlCache.has(uriOrUrl)) {
        return objectUrlCache.get(uriOrUrl)!;
    }

    const blob = await getAsset(uriOrUrl);
    if (!blob) return '';

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

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
};

/**
 * Returns all stored assets (used for bundle exports and P2P transfers).
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
 * Batch imports assets into IndexedDB.
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
