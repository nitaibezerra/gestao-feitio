/**
 * Testes do hook `useWakeLock` — confere o caminho feliz (API disponível),
 * o fallback silencioso (API indisponível) e o release.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWakeLock } from './wake-lock.svelte';

type SentinelFake = {
  readonly released: boolean;
  release: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
};

function fakeSentinel(): SentinelFake {
  const s: SentinelFake = {
    released: false,
    release: vi.fn().mockResolvedValue(undefined),
    addEventListener: vi.fn()
  };
  return s;
}

describe('useWakeLock', () => {
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    // reset documento — jsdom fornece um
    (globalThis as unknown as { navigator: Navigator }).navigator = {
      ...originalNavigator
    };
  });

  afterEach(() => {
    (globalThis as unknown as { navigator: Navigator }).navigator = originalNavigator;
  });

  it('ativar chama navigator.wakeLock.request("screen")', async () => {
    const sentinel = fakeSentinel();
    const request = vi.fn().mockResolvedValue(sentinel);
    (globalThis.navigator as unknown as { wakeLock: unknown }).wakeLock = { request };

    const wl = useWakeLock();
    expect(wl.ativo()).toBe(false);
    await wl.ativar();

    expect(request).toHaveBeenCalledWith('screen');
    expect(wl.ativo()).toBe(true);
  });

  it('liberar libera a sentinel', async () => {
    const sentinel = fakeSentinel();
    (globalThis.navigator as unknown as { wakeLock: unknown }).wakeLock = {
      request: vi.fn().mockResolvedValue(sentinel)
    };

    const wl = useWakeLock();
    await wl.ativar();
    await wl.liberar();

    expect(sentinel.release).toHaveBeenCalled();
    expect(wl.ativo()).toBe(false);
  });

  it('API indisponível: ativar não lança e ativo() segue false', async () => {
    // navigator sem wakeLock
    delete (globalThis.navigator as unknown as Record<string, unknown>).wakeLock;

    const wl = useWakeLock();
    await wl.ativar();
    expect(wl.ativo()).toBe(false);
    // liberar tb é silencioso
    await wl.liberar();
  });

  it('falha em request() é silenciosa — ativo segue false', async () => {
    (globalThis.navigator as unknown as { wakeLock: unknown }).wakeLock = {
      request: vi.fn().mockRejectedValue(new Error('denied'))
    };

    const wl = useWakeLock();
    await wl.ativar();
    expect(wl.ativo()).toBe(false);
  });
});
