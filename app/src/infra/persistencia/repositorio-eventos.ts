/**
 * Repositório de eventos — única porta de escrita para o log append-only.
 *
 * Todo evento passa por `validarEvento` antes de ser persistido.
 * Leitura por feitio é ordenada por `momento` (ISO string, ordenável).
 * `streamPorFeitio` retorna um Observable Dexie que reemite a cada mutação.
 */

import { liveQuery, type Observable } from 'dexie';
import { validarEvento, type Evento } from '../../domain/events/tipos';
import type { GestaoFeitioDb } from './dexie-db';

export type RepositorioEventos = {
  append(evento: Evento): Promise<void>;
  listarPorFeitio(feitioId: string): Promise<Evento[]>;
  streamPorFeitio(feitioId: string): Observable<Evento[]>;
};

export function criarRepositorioEventos(db: GestaoFeitioDb): RepositorioEventos {
  async function listarPorFeitio(feitioId: string): Promise<Evento[]> {
    return db.eventos.where('feitioId').equals(feitioId).sortBy('momento');
  }

  return {
    async append(evento) {
      const resultado = validarEvento(evento);
      if (!resultado.ok) {
        throw new Error(`evento inválido: ${resultado.erros.join('; ')}`);
      }
      await db.eventos.add(evento);
    },
    listarPorFeitio,
    streamPorFeitio(feitioId) {
      return liveQuery(() => listarPorFeitio(feitioId));
    }
  };
}
