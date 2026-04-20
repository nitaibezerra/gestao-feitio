/**
 * Store da paleta ativa — persistido em localStorage.
 * Sobrevive a reloads; é aplicado uma vez no layout inicial e reaplicado
 * quando o usuário troca.
 */

import { aplicarPaleta, type PaletaKey, PALETAS } from './paletas';

const CHAVE = 'gestao-feitio.paleta';
const PADRAO: PaletaKey = 'luz-rainha';

function lerPaletaSalva(): PaletaKey {
  if (typeof window === 'undefined') return PADRAO;
  const salva = window.localStorage.getItem(CHAVE);
  if (salva && salva in PALETAS) return salva as PaletaKey;
  return PADRAO;
}

function salvar(key: PaletaKey): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CHAVE, key);
}

export function criarPaletaStore() {
  let atual = $state<PaletaKey>(PADRAO);

  return {
    get valor() {
      return atual;
    },
    hidratar() {
      atual = lerPaletaSalva();
      aplicarPaleta(atual);
    },
    escolher(key: PaletaKey) {
      atual = key;
      salvar(key);
      aplicarPaleta(key);
    }
  };
}

/** Instância global única. Hidratada no +layout.svelte. */
export const paletaStore = criarPaletaStore();
