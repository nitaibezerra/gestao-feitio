/**
 * Rune reativa de "agora" — um só timer global, componentes assinam.
 */

import { onMount } from 'svelte';

export function useRelogio(inicial: Date = new Date()) {
  let agora = $state(new Date(inicial));

  onMount(() => {
    const id = setInterval(() => {
      agora = new Date();
    }, 1000);
    return () => clearInterval(id);
  });

  return {
    get valor() {
      return agora;
    }
  };
}
