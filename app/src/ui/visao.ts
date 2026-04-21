/**
 * Tipos e adaptadores de *visão* (view) — derivam da projeção do domínio
 * (`Panela`, `Tonel`) e adicionam campos exclusivos da UI como `boca`,
 * `metaTiragemL`, `proxTiragem`, `numero` (do tonel).
 *
 * Os componentes visuais consomem `PanelaVisao`/`TonelVisao`, que são
 * **puramente derivados** — nenhuma fonte da verdade nova. Atualização
 * simples: recalcular a partir da projeção.
 */

import type { Panela, TipoTiragem } from '../domain/entities/panela';
import type { Tonel } from '../domain/entities/tonel';
import { calcularTipoTiragem } from '../domain/regras/nomenclatura';

export type PanelaVisao = Panela & {
  boca: number;
  metaTiragemL: number;
  proxTiragem: TipoTiragem;
};

export type TonelVisao = Tonel & {
  numero: number;
};

/**
 * Meta de tiragem: preferir o valor informado pelo feitor ao entrar no fogo;
 * se ausente, heurística "metade do volume atual".
 */
export function metaTiragemSugerida(panela: Panela): number {
  if (typeof panela.metaTiragemL === 'number') return panela.metaTiragemL;
  return Math.floor((panela.volumeAtualL ?? 0) / 2);
}

/**
 * Panelas visíveis na fornalha — só as que estão em boca (ignoramos as
 * descartadas). A projeção já garante `bocaAtual` correto.
 */
export function panelasNaFornalha(panelas: Panela[]): PanelaVisao[] {
  const visiveis: PanelaVisao[] = [];
  for (const p of panelas) {
    if (p.estado === 'descartada') continue;
    if (!p.bocaAtual) continue;
    if (!p.conteudo) continue;
    visiveis.push({
      ...p,
      boca: p.bocaAtual,
      metaTiragemL: metaTiragemSugerida(p),
      proxTiragem: calcularTipoTiragem(p)
    });
  }
  return visiveis;
}

export function toneisVisao(toneis: Tonel[]): TonelVisao[] {
  return toneis.map((t, i) => ({
    ...t,
    numero: i + 1
  }));
}
