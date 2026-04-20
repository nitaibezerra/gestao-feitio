/**
 * Repositório de eventos — única porta de escrita para o log append-only.
 *
 * Todo evento passa por `validarEvento` antes de ser persistido.
 * Leitura por feitio é ordenada por `momento`; empates são resolvidos por
 * um contador `seq` atribuído no append (ordem causal da gravação, não
 * visível para o domínio).
 *
 * `streamPorFeitio` retorna um Observable Dexie que reemite a cada mutação.
 */

import { liveQuery, type Observable } from 'dexie';
import { validarEvento, type Evento } from '../../domain/events/tipos';
import type { EventoPersistido, GestaoFeitioDb } from './dexie-db';

export type RepositorioEventos = {
  append(evento: Evento): Promise<void>;
  listarPorFeitio(feitioId: string): Promise<Evento[]>;
  streamPorFeitio(feitioId: string): Observable<Evento[]>;
};

export function criarRepositorioEventos(db: GestaoFeitioDb): RepositorioEventos {
  async function proximaSeq(feitioId: string): Promise<number> {
    const ultimos = await db.eventos
      .where('feitioId')
      .equals(feitioId)
      .reverse()
      .sortBy('seq');
    return (ultimos[0]?.seq ?? 0) + 1;
  }

  async function listarPorFeitio(feitioId: string): Promise<Evento[]> {
    const persistidos = await db.eventos.where('feitioId').equals(feitioId).toArray();
    persistidos.sort((a, b) => {
      if (a.momento !== b.momento) return a.momento < b.momento ? -1 : 1;
      return a.seq - b.seq;
    });
    return persistidos.map(({ seq: _s, ...e }) => e) as Evento[];
  }

  return {
    async append(evento) {
      const resultado = validarEvento(evento);
      if (!resultado.ok) {
        throw new Error(`evento inválido: ${resultado.erros.join('; ')}`);
      }
      const seq = await proximaSeq(evento.feitioId);
      const persistido: EventoPersistido = { ...evento, seq };
      await db.eventos.add(persistido);
    },
    listarPorFeitio,
    streamPorFeitio(feitioId) {
      return liveQuery(() => listarPorFeitio(feitioId));
    }
  };
}
