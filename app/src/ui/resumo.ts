/**
 * Resumo de feitio encerrado — consolida totais a partir da projeção.
 *
 * Usado na tela `/feitio/resumo`. Pura: só lê do `EstadoFornalha`.
 */

import type { EstadoFornalha } from '../domain/projecoes/fornalha';

export type ResumoFeitio = {
  totalPanelas: number;
  totalPanelasDescartadas: number;
  tiragensPorTipo: {
    /** volume total por ordem de cozimento (1-6) */
    cozimento: Record<number, number>;
    /** volume total por grau de Daime (1-4) */
    daime: Record<number, number>;
    /** volume total de água forte */
    agua_forte: number;
  };
  volumeTotalL: number;
  toneis: Array<{
    id: string;
    label: string;
    volumeL: number;
  }>;
};

export function resumirFeitio(s: EstadoFornalha): ResumoFeitio {
  const cozimento: Record<number, number> = {};
  const daime: Record<number, number> = {};
  let aguaForte = 0;
  let volumeTotalL = 0;
  const toneis: ResumoFeitio['toneis'] = [];

  for (const t of s.toneis) {
    volumeTotalL += t.volumeL;
    if (t.tipo === 'cozimento' && t.ordem !== undefined) {
      cozimento[t.ordem] = (cozimento[t.ordem] ?? 0) + t.volumeL;
      toneis.push({ id: t.id, label: `${t.ordem}º Cozimento`, volumeL: t.volumeL });
    } else if (t.tipo === 'daime' && t.grau !== undefined) {
      daime[t.grau] = (daime[t.grau] ?? 0) + t.volumeL;
      toneis.push({ id: t.id, label: `Daime ${t.grau}º grau`, volumeL: t.volumeL });
    } else if (t.tipo === 'agua_forte') {
      aguaForte += t.volumeL;
      toneis.push({ id: t.id, label: 'Água Forte', volumeL: t.volumeL });
    }
  }

  return {
    totalPanelas: s.panelas.length,
    totalPanelasDescartadas: s.panelas.filter((p) => p.estado === 'descartada').length,
    tiragensPorTipo: { cozimento, daime, agua_forte: aguaForte },
    volumeTotalL,
    toneis
  };
}
