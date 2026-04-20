/**
 * Runtime do app — instância única do banco Dexie, do repositório e dos
 * comandos. Serve como composition-root: páginas Svelte importam daqui
 * em vez de construir a stack manualmente.
 *
 * Também expõe helpers para descobrir o feitio ativo (v1: derivado dos
 * eventos — procura `feitio_iniciado` sem `feitio_encerrado` correspondente).
 */

import { readable, type Readable } from 'svelte/store';
import { criarComandos, type Comandos } from './comandos';
import { criarFornalhaStore } from './stores';
import { criarDb, type GestaoFeitioDb } from '../infra/persistencia/dexie-db';
import { criarRepositorioEventos, type RepositorioEventos } from '../infra/persistencia/repositorio-eventos';
import type { EstadoFornalha } from '../domain/projecoes/fornalha';

let _db: GestaoFeitioDb | null = null;
let _repo: RepositorioEventos | null = null;
let _comandos: Comandos | null = null;

export function db(): GestaoFeitioDb {
  if (!_db) _db = criarDb('gestao-feitio');
  return _db;
}

export function repo(): RepositorioEventos {
  if (!_repo) _repo = criarRepositorioEventos(db());
  return _repo;
}

export function comandos(): Comandos {
  if (!_comandos) _comandos = criarComandos(repo());
  return _comandos;
}

/**
 * Procura o feitio ativo (único em v1). Critério: existe `feitio_iniciado`
 * cujo `feitioId` NÃO tem `feitio_encerrado` correspondente.
 *
 * Retorna o id ou null. Consulta rápida: query direta no event log do Dexie.
 */
export async function bootstrapAtivo(): Promise<string | null> {
  const eventos = await db().eventos.toArray();
  const iniciados = new Set<string>();
  const encerrados = new Set<string>();
  for (const e of eventos) {
    if (e.tipo === 'feitio_iniciado') iniciados.add(e.feitioId);
    else if (e.tipo === 'feitio_encerrado') encerrados.add(e.feitioId);
  }
  for (const id of iniciados) {
    if (!encerrados.has(id)) return id;
  }
  return null;
}

/**
 * Store reativo do feitio ativo. Se não há feitio, emite `null`. Se há,
 * assina a stream do repositório e projeta a fornalha a cada evento.
 *
 * Re-checa a cada segundo nos primeiros 2s se precisa — na raiz é comum
 * usarmos `bootstrapAtivo` diretamente; este store é para a tela `/atual`.
 */
export function feitioAtivo(): Readable<EstadoFornalha | null> {
  return readable<EstadoFornalha | null>(null, (set) => {
    let cancelado = false;
    let unsub: (() => void) | null = null;
    (async () => {
      const id = await bootstrapAtivo();
      if (cancelado) return;
      if (!id) {
        set(null);
        return;
      }
      const inner = criarFornalhaStore(repo(), id);
      unsub = inner.subscribe((v) => set(v));
    })();
    return () => {
      cancelado = true;
      unsub?.();
    };
  });
}

/**
 * Gera um id curto via `crypto.randomUUID` quando disponível, fallback
 * determinístico para testes.
 */
export function novoId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
