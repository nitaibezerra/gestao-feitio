/**
 * Formatação de evento → texto curto para o footer.
 *
 * O footer mostra a última ação do feitor de forma telegrafada:
 *   "Panela 03 — Tirou 18 L (3º cozimento) → Tonel 3"
 *
 * Recebe o evento e a lista completa de panelas (para achar o número).
 */

import type { Evento } from '../domain/events/tipos';
import type { Panela } from '../domain/entities/panela';
import { conteudoLabel, tiragemLabel } from './labels';

export type EventoResumo = { texto: string; momento: Date };

export function resumirEvento(e: Evento, panelas: Panela[]): EventoResumo {
  const momento = new Date(e.momento);
  const nPanela = (id: string) => {
    const p = panelas.find((x) => x.id === id);
    return p ? String(p.numero).padStart(2, '0') : '??';
  };

  switch (e.tipo) {
    case 'feitio_iniciado':
      return { texto: `Feitio iniciado — ${e.payload.nome}`, momento };
    case 'panela_montada':
      return { texto: `Panela ${String(e.payload.numero).padStart(2, '0')} montada`, momento };
    case 'panela_entra_fogo':
      return {
        texto: `Panela ${nPanela(e.payload.panelaId)} entrou no fogo (${conteudoLabel(
          e.payload.conteudo
        )}, ${e.payload.volumeL} L, boca ${e.payload.bocaNumero})`,
        momento
      };
    case 'tiragem_registrada':
      return {
        texto: `Panela ${nPanela(e.payload.panelaId)} — Tirou ${e.payload.volumeL} L (${tiragemLabel(
          e.payload.tipoTiragem
        )})`,
        momento
      };
    case 'reposicao_registrada':
      return {
        texto: `Panela ${nPanela(e.payload.panelaId)} — Repôs ${e.payload.volumeL} L (${conteudoLabel(
          e.payload.conteudo
        )})`,
        momento
      };
    case 'volume_ajustado':
      return {
        texto: `Panela ${nPanela(e.payload.panelaId)} — Ajustou ${e.payload.deltaL > 0 ? '+' : ''}${e.payload.deltaL} L`,
        momento
      };
    case 'tempo_pausado':
      return { texto: `Panela ${nPanela(e.payload.panelaId)} — Pausada`, momento };
    case 'tempo_retomado':
      return { texto: `Panela ${nPanela(e.payload.panelaId)} — Retomada`, momento };
    case 'troca_bocas':
      return {
        texto: `Trocou boca entre panela ${nPanela(e.payload.panelaAId)} e ${nPanela(e.payload.panelaBId)}`,
        momento
      };
    case 'panela_descartada':
      return { texto: `Panela ${nPanela(e.payload.panelaId)} — Descartada`, momento };
    case 'panela_editada': {
      const mudancas = Object.keys(e.payload.campos ?? {});
      return {
        texto: `Panela ${nPanela(e.payload.panelaId)} — Editada (${mudancas.join(', ') || '—'})`,
        momento
      };
    }
    case 'evento_desfeito':
      return { texto: `Desfeito: evento anterior revertido`, momento };
    case 'feitio_encerrado':
      return { texto: 'Feitio encerrado', momento };
  }
}
