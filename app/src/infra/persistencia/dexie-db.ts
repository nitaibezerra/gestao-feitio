/**
 * Banco Dexie — schema único do aplicativo.
 *
 * Tabelas:
 *   - eventos: log append-only de eventos de domínio (source of truth)
 *   - feitios: cache de projeção do feitio (consulta rápida de status)
 *   - pessoas: cadastro de feitores/foguistas para reuso entre feitios
 *   - configuracoes: pares chave/valor (paleta atual, preferências)
 */

import Dexie, { type Table } from 'dexie';
import type { Evento } from '../../domain/events/tipos';

export type FeitioRegistro = {
  id: string;
  nome: string;
  status: 'em_preparo' | 'em_andamento' | 'encerrado';
  inicio: string;
  fim?: string | null;
};

export type PessoaRegistro = {
  id: string;
  nome: string;
  papeis: Array<'feitor' | 'foguista' | 'apurador'>;
};

export type ConfiguracaoRegistro = {
  chave: string;
  valor: unknown;
};

export class GestaoFeitioDb extends Dexie {
  eventos!: Table<Evento, string>;
  feitios!: Table<FeitioRegistro, string>;
  pessoas!: Table<PessoaRegistro, string>;
  configuracoes!: Table<ConfiguracaoRegistro, string>;

  constructor(nome: string) {
    super(nome);
    this.version(1).stores({
      eventos: 'id, feitioId, momento, tipo, [feitioId+momento]',
      feitios: 'id, status, inicio',
      pessoas: 'id, nome',
      configuracoes: 'chave'
    });
  }
}

export function criarDb(nome = 'gestao-feitio'): GestaoFeitioDb {
  return new GestaoFeitioDb(nome);
}
