/**
 * Máquina de estados da panela (requisitos.md §4).
 *
 * Função pura que valida se um comando é permitido no estado atual.
 * Não muta — retorna novo estado ou erro descritivo.
 */

import type { EstadoPanela } from '../entities/panela';

export type Comando =
  | { tipo: 'entrar_no_fogo' }
  | { tipo: 'pausar' }
  | { tipo: 'retomar' }
  | { tipo: 'retirar_do_fogo' }
  | { tipo: 'registrar_tiragem' }
  | { tipo: 'repor_e_play' }
  | { tipo: 'descartar' };

export type ResultadoTransicao =
  | { ok: true; estado: EstadoPanela }
  | { ok: false; motivo: string };

type TransicoesMap = {
  [E in EstadoPanela]?: {
    [C in Comando['tipo']]?: EstadoPanela;
  };
};

const TRANSICOES: TransicoesMap = {
  montada: {
    entrar_no_fogo: 'no_fogo'
  },
  no_fogo: {
    pausar: 'fora_do_fogo',
    retirar_do_fogo: 'na_biqueira',
    // `registrar_tiragem` direto de `no_fogo` mantido para fluxo legado
    // (tirar e medir num único passo). Novo fluxo padrão: retirar_do_fogo
    // primeiro, registrar_tiragem depois com panela já `na_biqueira`.
    registrar_tiragem: 'na_biqueira',
    descartar: 'descartada'
  },
  fora_do_fogo: {
    retomar: 'no_fogo',
    retirar_do_fogo: 'na_biqueira',
    registrar_tiragem: 'na_biqueira'
  },
  na_biqueira: {
    // self-loop: registra o volume da tiragem após a panela já ter sido
    // retirada do fogo. A máquina não controla a pendência em si — ela é
    // enforced pelo command handler (ver `app/comandos.ts`).
    registrar_tiragem: 'na_biqueira',
    repor_e_play: 'no_fogo',
    pausar: 'fora_do_fogo',
    descartar: 'descartada'
  },
  descartada: {}
};

export function transicao(estado: EstadoPanela, comando: Comando): ResultadoTransicao {
  const proximo = TRANSICOES[estado]?.[comando.tipo];
  if (!proximo) {
    return {
      ok: false,
      motivo: `transição não permitida: estado "${estado}" + comando "${comando.tipo}"`
    };
  }
  return { ok: true, estado: proximo };
}
