/**
 * Rune reativa de "agora" — um só timer global, componentes assinam.
 * Base em AGORA_MOCK durante a Fase 3. Na Fase 4 usa `new Date()` real.
 */

import { onMount } from 'svelte';
import { AGORA_MOCK } from './mock-feitio';

export function useRelogio(inicial: Date = AGORA_MOCK) {
  let agora = $state(new Date(inicial));

  onMount(() => {
    const id = setInterval(() => {
      agora = new Date(agora.getTime() + 1000);
    }, 1000);
    return () => clearInterval(id);
  });

  return {
    get valor() {
      return agora;
    }
  };
}
