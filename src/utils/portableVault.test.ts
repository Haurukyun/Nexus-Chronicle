import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getVaultInfo, loadCodexFromDisk, saveCodexToDisk } from './portableVault';
import * as nativeFileBridge from './nativeFileBridge';

describe('portableVault', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null when not running in desktop app', async () => {
    vi.spyOn(nativeFileBridge, 'isDesktopApp').mockReturnValue(false);
    const info = await getVaultInfo();
    expect(info).toBeNull();

    const data = await loadCodexFromDisk();
    expect(data).toBeNull();

    const saved = await saveCodexToDisk({});
    expect(saved).toBe(false);
  });
});
