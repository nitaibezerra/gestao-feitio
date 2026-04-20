/**
 * Repositório de eventos — append-only + leitura por feitio.
 *
 * Cada teste abre um banco novo (isolamento) e fecha ao final.
 * fake-indexeddb é carregado globalmente em vitest.setup.ts.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { criarEvento, type Evento } from '../../domain/events/tipos';
import { criarDb, type GestaoFeitioDb } from './dexie-db';
import { criarRepositorioEventos } from './repositorio-eventos';

let db: GestaoFeitioDb;

async function aguardarAte(condicao: () => boolean, timeoutMs = 1000): Promise<void> {
  const inicio = Date.now();
  while (!condicao()) {
    if (Date.now() - inicio > timeoutMs) {
      throw new Error(`timeout ${timeoutMs}ms esperando condição`);
    }
    await new Promise((r) => setTimeout(r, 5));
  }
}

beforeEach(async () => {
  db = criarDb(`gestao-feitio-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await db.open();
});

afterEach(async () => {
  db.close();
  await db.delete();
});

describe('RepositorioEventos.append + listarPorFeitio', () => {
  it('append de evento → listarPorFeitio retorna o evento', async () => {
    const repo = criarRepositorioEventos(db);
    const evento = criarEvento('feitio-1', {
      tipo: 'feitio_iniciado',
      payload: { nome: 'Feitio de teste', feitor: 'Alice', qtdBocas: 5 }
    });

    await repo.append(evento);
    const eventos = await repo.listarPorFeitio('feitio-1');

    expect(eventos).toHaveLength(1);
    expect(eventos[0].id).toBe(evento.id);
    expect(eventos[0].tipo).toBe('feitio_iniciado');
  });

  it('dois eventos em ordem → listarPorFeitio preserva ordem por momento', async () => {
    const repo = criarRepositorioEventos(db);
    const primeiro = criarEvento('feitio-1', {
      tipo: 'panela_montada',
      payload: { panelaId: 'p1', numero: 1 }
    });
    // força momento posterior (criarEvento usa Date.now via toISOString)
    await new Promise((r) => setTimeout(r, 5));
    const segundo = criarEvento('feitio-1', {
      tipo: 'panela_montada',
      payload: { panelaId: 'p2', numero: 2 }
    });

    await repo.append(segundo);
    await repo.append(primeiro);

    const eventos = await repo.listarPorFeitio('feitio-1');
    expect(eventos.map((e) => e.id)).toEqual([primeiro.id, segundo.id]);
  });

  it('eventos de feitios diferentes não se misturam', async () => {
    const repo = criarRepositorioEventos(db);
    const a = criarEvento('feitio-A', {
      tipo: 'panela_montada',
      payload: { panelaId: 'pa', numero: 1 }
    });
    const b = criarEvento('feitio-B', {
      tipo: 'panela_montada',
      payload: { panelaId: 'pb', numero: 1 }
    });
    await repo.append(a);
    await repo.append(b);

    const eventosA = await repo.listarPorFeitio('feitio-A');
    const eventosB = await repo.listarPorFeitio('feitio-B');
    expect(eventosA.map((e) => e.id)).toEqual([a.id]);
    expect(eventosB.map((e) => e.id)).toEqual([b.id]);
  });

  it('validação rejeita evento inválido antes de persistir', async () => {
    const repo = criarRepositorioEventos(db);
    const invalido = {
      id: 'x',
      feitioId: 'feitio-1',
      momento: new Date().toISOString(),
      versao: 1,
      tipo: 'feitio_iniciado',
      payload: { nome: '', feitor: '', qtdBocas: 0 }
    } as unknown as Evento;

    await expect(repo.append(invalido)).rejects.toThrow();
    const eventos = await repo.listarPorFeitio('feitio-1');
    expect(eventos).toHaveLength(0);
  });

  it('streamPorFeitio emite estado inicial e após novo append', async () => {
    const repo = criarRepositorioEventos(db);
    const primeiro = criarEvento('feitio-1', {
      tipo: 'panela_montada',
      payload: { panelaId: 'p1', numero: 1 }
    });
    await repo.append(primeiro);

    const observable = repo.streamPorFeitio('feitio-1');
    const emissoes: Evento[][] = [];
    const sub = observable.subscribe((evs) => {
      emissoes.push(evs);
    });

    await aguardarAte(() => emissoes.length >= 1);
    expect(emissoes[0]).toHaveLength(1);

    const segundo = criarEvento('feitio-1', {
      tipo: 'panela_montada',
      payload: { panelaId: 'p2', numero: 2 }
    });
    await repo.append(segundo);

    await aguardarAte(() => emissoes.length >= 2);
    expect(emissoes[emissoes.length - 1]).toHaveLength(2);
    sub.unsubscribe();
  });
});
