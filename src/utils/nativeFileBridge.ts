import { isTauri, invoke } from '@tauri-apps/api/core';

export interface FileFilter {
    name: string;
    extensions: string[];
}

/**
 * Checks if the application is currently running inside the native Tauri desktop shell.
 */
export const isDesktopApp = (): boolean => {
    try {
        return typeof window !== 'undefined' && isTauri();
    } catch {
        return false;
    }
};

/**
 * Web browser fallback file downloader supporting:
 * 1. Chromium desktop: Native File System Access API (showSaveFilePicker)
 * 2. Mobile (iOS / Android): Web Share API (navigator.share)
 * 3. Fallback: Data URL or anchor tag click with delayed revocation
 */
export const downloadBlobWeb = async (
    blob: Blob,
    fileName: string,
    mimeType: string = 'application/octet-stream'
): Promise<void> => {
    // 1. Desktop Chromium: Native File System Access API
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
            const ext = fileName.includes('.') ? `.${fileName.split('.').pop()}` : '.nexus';
            const handle = await (window as any).showSaveFilePicker({
                suggestedName: fileName,
                types: [
                    {
                        description: ext === '.json' ? 'JSON Codex Document' : 'Nexus Campaign Archive',
                        accept: { [mimeType]: [ext] }
                    }
                ]
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        } catch (err: any) {
            if (err?.name === 'AbortError') {
                return;
            }
            console.warn('[nativeFileBridge] showSaveFilePicker skipped/failed, proceeding to fallback:', err);
        }
    }

    // 2. Mobile Native Share (iOS / Android)
    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || '');
    if (isMobile && typeof navigator.canShare === 'function') {
        const file = new File([blob], fileName, { type: mimeType });
        if (navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: fileName,
                    text: 'Nexus Chronicle campaign chronicle archive.',
                    files: [file]
                });
                return;
            } catch (err: any) {
                if (err?.name === 'AbortError') return;
            }
        }
    }

    // 3. Data URL for files under 25MB (prevents Edge from ever seeing a blob: URL GUID)
    if (blob.size < 25 * 1024 * 1024) {
        try {
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = dataUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                if (document.body.contains(a)) document.body.removeChild(a);
            }, 2000);
            return;
        } catch {
            // Fall through to object URL fallback
        }
    }

    // 4. Standard Object URL fallback
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        if (document.body.contains(a)) {
            document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
    }, 2000);
};

/**
 * Universal file saver:
 * 1. Inside Tauri: Displays the OS native Windows File Explorer Save dialog,
 *    then writes binary data directly to disk without browser download trays.
 * 2. On Web / Mobile: Gracefully falls back to downloadBlobWeb.
 */
export const saveFileNative = async (
    data: Uint8Array | Blob | string,
    defaultFileName: string,
    filters?: FileFilter[],
    mimeType: string = 'application/octet-stream'
): Promise<{ success: boolean; filePath?: string; cancelled?: boolean }> => {
    const ext = defaultFileName.includes('.') ? defaultFileName.split('.').pop()! : 'nexus';
    const effectiveFilters = filters || [
        {
            name: ext === 'json' ? 'JSON Codex Document' : 'Nexus Campaign Archive',
            extensions: [ext]
        }
    ];

    if (isDesktopApp()) {
        try {
            // 1. Open native OS Save Dialog
            let selectedPath: string | null = null;
            try {
                selectedPath = await invoke<string | null>('plugin:dialog|save', {
                    options: {
                        title: 'Save File',
                        defaultPath: defaultFileName,
                        filters: effectiveFilters
                    }
                });
            } catch {
                selectedPath = await invoke<string | null>('plugin:dialog|save', {
                    defaultPath: defaultFileName,
                    filters: effectiveFilters
                });
            }

            if (!selectedPath) {
                return { success: false, cancelled: true };
            }

            // 2. Prepare raw bytes
            let bytes: Uint8Array;
            if (data instanceof Uint8Array) {
                bytes = data;
            } else if (data instanceof Blob) {
                const arrayBuffer = await data.arrayBuffer();
                bytes = new Uint8Array(arrayBuffer);
            } else {
                bytes = new TextEncoder().encode(data);
            }

            // 3. Write directly to disk
            const dataPayload = Array.from(bytes);
            try {
                await invoke('plugin:fs|write_file', {
                    path: selectedPath,
                    data: dataPayload
                });
            } catch {
                await invoke('plugin:fs|write', {
                    path: selectedPath,
                    data: dataPayload
                });
            }

            return { success: true, filePath: selectedPath };
        } catch (err) {
            console.warn('[nativeFileBridge] Tauri native save failed, using web fallback:', err);
        }
    }

    // Web Fallback
    const blob = data instanceof Blob 
        ? data 
        : new Blob([data as any], { type: mimeType });

    await downloadBlobWeb(blob, defaultFileName, mimeType);
    return { success: true };
};

/**
 * Universal file opener:
 * 1. Inside Tauri: Displays the OS native Windows File Explorer Open dialog,
 *    then reads binary data directly from disk.
 * 2. Returns the file name, raw bytes, and decoded UTF-8 text content.
 */
export const openFileNative = async (
    filters: FileFilter[] = [{ name: 'Nexus Archive', extensions: ['nexus'] }]
): Promise<{ fileName: string; data: Uint8Array; text: string } | null> => {
    if (isDesktopApp()) {
        try {
            let selectedPath: string | null = null;
            try {
                selectedPath = await invoke<string | null>('plugin:dialog|open', {
                    options: {
                        title: 'Open File',
                        multiple: false,
                        directory: false,
                        filters
                    }
                });
            } catch {
                selectedPath = await invoke<string | null>('plugin:dialog|open', {
                    multiple: false,
                    directory: false,
                    filters
                });
            }

            if (!selectedPath) {
                return null;
            }

            let rawBytes: number[];
            try {
                rawBytes = await invoke<number[]>('plugin:fs|read_file', {
                    path: selectedPath
                });
            } catch {
                rawBytes = await invoke<number[]>('plugin:fs|read', {
                    path: selectedPath
                });
            }

            const bytes = new Uint8Array(rawBytes);
            const fileName = selectedPath.split(/[/\\]/).pop() || 'imported_file';
            const text = new TextDecoder('utf-8').decode(bytes);

            return { fileName, data: bytes, text };
        } catch (err) {
            console.warn('[nativeFileBridge] Tauri native open failed:', err);
            return null;
        }
    }

    return null;
};
