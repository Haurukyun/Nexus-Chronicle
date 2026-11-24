/**
 * Nexus Chronicle - Portable Vault Adapter (Choice 1 Architecture)
 *
 * Provides a direct bridge to local file-based storage:
 * - When in Portable Mode (running from USB or non-Program-Files folder),
 *   stores codex.json and media assets in `./data/` alongside the application.
 * - Auto-detects write permissions and falls back safely to AppData if installed in Program Files.
 * - Reconciles and syncs Zustand state with disk codex.json atomically.
 */

import { invoke } from '@tauri-apps/api/core';
import { isDesktopApp } from './nativeFileBridge';
import { useWorldStore } from '../store/useWorldStore';

export interface VaultInfo {
    is_portable: boolean;
    vault_dir: string;
    assets_dir: string;
    codex_file: string;
}

let _vaultInfo: VaultInfo | null = null;
let _isInitialized = false;
let _saveDebounceTimer: any = null;
let _isApplyingDiskState = false;

/**
 * Returns cached or freshly queried vault path and portability info from Rust.
 */
export async function getVaultInfo(): Promise<VaultInfo | null> {
    if (!isDesktopApp()) return null;
    if (_vaultInfo) return _vaultInfo;
    try {
        _vaultInfo = await invoke<VaultInfo>('get_vault_info');
        return _vaultInfo;
    } catch (err) {
        console.warn('[portableVault] getVaultInfo failed:', err);
        return null;
    }
}

/**
 * Opens the active vault directory in Windows Explorer (or default OS file manager).
 */
export async function openVaultFolder(): Promise<void> {
    if (!isDesktopApp()) return;
    try {
        await invoke('open_vault_folder');
    } catch (err) {
        console.warn('[portableVault] openVaultFolder failed:', err);
    }
}

/**
 * Loads codex JSON content from disk if available.
 */
export async function loadCodexFromDisk(): Promise<any | null> {
    if (!isDesktopApp()) return null;
    try {
        const raw = await invoke<string | null>('load_codex_from_disk');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (err) {
        console.warn('[portableVault] loadCodexFromDisk error:', err);
        return null;
    }
}

/**
 * Saves given state to disk codex.json atomically.
 */
export async function saveCodexToDisk(data: any): Promise<boolean> {
    if (!isDesktopApp()) return false;
    try {
        const payload = JSON.stringify(data, null, 2);
        await invoke('save_codex_to_disk', { content: payload });
        return true;
    } catch (err) {
        console.warn('[portableVault] saveCodexToDisk error:', err);
        return false;
    }
}

/**
 * Initializes two-way vault synchronization between Zustand store and disk:
 * 1. Checks if disk codex.json exists. If so, hydrates store with disk state.
 * 2. If not, commits current initial state to disk to seed the vault.
 * 3. Registers reactive subscription that debounce-saves every change to disk.
 */
export async function initPortableVault(): Promise<VaultInfo | null> {
    if (!isDesktopApp()) return null;
    if (_isInitialized) return _vaultInfo;

    const info = await getVaultInfo();
    if (!info) return null;

    try {
        const diskData = await loadCodexFromDisk();
        if (diskData && (diskData.world || Array.isArray(diskData.worlds))) {
            _isApplyingDiskState = true;
            useWorldStore.setState({
                worlds: Array.isArray(diskData.worlds) ? diskData.worlds : [diskData.world],
                world: diskData.world || diskData.worlds?.[0],
                activeWorldId: diskData.activeWorldId || diskData.world?.id || diskData.worlds?.[0]?.id,
                theme: diskData.theme || useWorldStore.getState().theme,
                scratchpadNote: diskData.scratchpadNote ?? useWorldStore.getState().scratchpadNote
            });
            _isApplyingDiskState = false;
        } else {
            // First run with empty disk vault: seed disk with current state
            const state = useWorldStore.getState();
            await saveCodexToDisk({
                worlds: state.worlds,
                activeWorldId: state.activeWorldId,
                world: state.world,
                theme: state.theme,
                scratchpadNote: state.scratchpadNote
            });
        }

        // Setup reactive disk auto-save subscription
        useWorldStore.subscribe((state) => {
            if (_isApplyingDiskState) return;

            if (_saveDebounceTimer) clearTimeout(_saveDebounceTimer);
            _saveDebounceTimer = setTimeout(async () => {
                const snapshot = {
                    worlds: state.worlds,
                    activeWorldId: state.activeWorldId,
                    world: state.world,
                    theme: state.theme,
                    scratchpadNote: state.scratchpadNote
                };
                await saveCodexToDisk(snapshot);
            }, 800);
        });

        _isInitialized = true;
    } catch (err) {
        console.warn('[portableVault] initPortableVault encountered an issue:', err);
    }

    return info;
}
