/**
 * Hook `useWakeLock` — mantém a tela do tablet ligada enquanto a página
 * ativa estiver montada. Satisfaz RNF-04 (tela do feitio sempre viva).
 *
 * API:
 *   const wl = useWakeLock();
 *   wl.ativar();    // chama navegador.wakeLock.request('screen')
 *   wl.liberar();   // libera a sentinel
 *
 * Uso típico via `$effect`:
 *   $effect(() => {
 *     const wl = useWakeLock();
 *     wl.ativar();
 *     return () => wl.liberar();
 *   });
 *
 * Tratamento de erros: silencioso. Browsers que não suportam a API (iOS
 * Safari < 16.4, Chrome em iframes, etc.) simplesmente não recebem wake
 * lock — o dashboard continua funcionando. Quando a aba perde foco o
 * navegador solta automaticamente; ao voltar o `visibilitychange` re-solicita.
 */

// Tipo mínimo — o navegador expõe `navigator.wakeLock`, mas nem todos
// os ambientes têm types atualizados.
type WakeLockSentinel = {
  readonly released: boolean;
  release(): Promise<void>;
  addEventListener(type: 'release', listener: () => void): void;
};

type NavigatorComWakeLock = Navigator & {
  wakeLock?: {
    request(type: 'screen'): Promise<WakeLockSentinel>;
  };
};

export type WakeLock = {
  ativo: () => boolean;
  ativar: () => Promise<void>;
  liberar: () => Promise<void>;
};

export function useWakeLock(): WakeLock {
  let sentinel: WakeLockSentinel | null = null;
  let desejado = false;

  async function solicitar(): Promise<void> {
    if (typeof navigator === 'undefined') return;
    const nav = navigator as NavigatorComWakeLock;
    if (!nav.wakeLock?.request) return;
    try {
      sentinel = await nav.wakeLock.request('screen');
      sentinel.addEventListener('release', () => {
        sentinel = null;
      });
    } catch {
      // Permissão negada ou contexto inválido — seguimos sem wake lock.
      sentinel = null;
    }
  }

  async function onVisibility(): Promise<void> {
    if (typeof document === 'undefined') return;
    if (desejado && document.visibilityState === 'visible' && !sentinel) {
      await solicitar();
    }
  }

  return {
    ativo: () => sentinel !== null,
    async ativar() {
      desejado = true;
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', onVisibility);
      }
      await solicitar();
    },
    async liberar() {
      desejado = false;
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility);
      }
      if (sentinel && !sentinel.released) {
        try {
          await sentinel.release();
        } catch {
          /* ignore */
        }
      }
      sentinel = null;
    }
  };
}
