/**
 * Tipos e adaptadores de *visão* (view) — derivam da projeção do domínio
 * (`Panela`, `Tonel`) e adicionam campos exclusivos da UI como `boca`,
 * `metaTiragemL`, `proxTiragem`, `capacidadeL`.
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
  capacidadeL: number;
};

/**
 * Capacidade padrão por tipo de tonel. Fase 4: valores fixos razoáveis;
 * Fase 5+ pode permitir edição.
 */
export function capacidadeDefault(tonel: Tonel): number {
  if (tonel.tipo === 'daime') return 60;
  if (tonel.tipo === 'agua_forte') return 40;
  return 120;
}

/**
 * Meta de tiragem: heurística "metade do volume atual" — valor razoável
 * para o feitor ajustar na hora de tirar.
 */
export function metaTiragemSugerida(panela: Panela): number {
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
    numero: i + 1,
    capacidadeL: capacidadeDefault(t)
  }));
}
