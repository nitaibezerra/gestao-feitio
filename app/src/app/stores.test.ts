/**
 * Stores Svelte reativos — tradução liveQuery Dexie → store Svelte.
 *
 * A fornalha store subscreve o stream de eventos do repositório e reemite
 * o resultado de `projetarFornalha` a cada mudança.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { criarDb, type GestaoFeitioDb } from '../infra/persistencia/dexie-db';
import {
  criarRepositorioEventos,
  type RepositorioEventos
} from '../infra/persistencia/repositorio-eventos';
import { criarComandos, type Comandos } from './comandos';
import { criarFornalhaStore } from './stores';
import type { EstadoFornalha } from '../domain/projecoes/fornalha';

let db: GestaoFeitioDb;
let repo: RepositorioEventos;
let comandos: Comandos;

async function aguardarAte(
  condicao: () => boolean,
  timeoutMs = 1000
): Promise<void> {
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
  repo = criarRepositorioEventos(db);
  comandos = criarComandos(repo);
});

afterEach(async () => {
  db.close();
  await db.delete();
});

describe('criarFornalhaStore', () => {
  it('subscribe recebe estado inicial projetado', async () => {
    await comandos.iniciarFeitio({
      feitioId: 'f1',
      nome: 'Feitio Abril',
      feitor: 'José',
      qtdBocas: 5
    });

    const store = criarFornalhaStore(repo, 'f1');
    const emissoes: EstadoFornalha[] = [];
    const unsubscribe = store.subscribe((estado) => {
      emissoes.push(estado);
    });

    await aguardarAte(() => emissoes.some((e) => e.feitio?.nome === 'Feitio Abril'));
    const ultima = emissoes[emissoes.length - 1];
    expect(ultima.feitio?.nome).toBe('Feitio Abril');
    expect(ultima.feitio?.qtdBocas).toBe(5);
    unsubscribe();
  });

  it('após append de evento, subscribe é chamado com novo estado', async () => {
    await comandos.iniciarFeitio({
      feitioId: 'f1',
      nome: 'F',
      feitor: 'J',
      qtdBocas: 5
    });

    const store = criarFornalhaStore(repo, 'f1');
    const emissoes: EstadoFornalha[] = [];
    const unsubscribe = store.subscribe((estado) => {
      emissoes.push(estado);
    });

    await aguardarAte(() => emissoes.some((e) => e.feitio !== null));
    const panelasAntes = emissoes[emissoes.length - 1].panelas.length;

    await comandos.montarPanela({ feitioId: 'f1', panelaId: 'p1', numero: 1 });

    await aguardarAte(() => {
      const ultima = emissoes[emissoes.length - 1];
      return ultima.panelas.length > panelasAntes;
    });

    const ultima = emissoes[emissoes.length - 1];
    expect(ultima.panelas).toHaveLength(1);
    expect(ultima.panelas[0].id).toBe('p1');
    unsubscribe();
  });

  it('unsubscribe para de receber emissões', async () => {
    await comandos.iniciarFeitio({
      feitioId: 'f1',
      nome: 'F',
      feitor: 'J',
      qtdBocas: 5
    });

    const store = criarFornalhaStore(repo, 'f1');
    const emissoes: EstadoFornalha[] = [];
    const unsubscribe = store.subscribe((estado) => {
      emissoes.push(estado);
    });

    await aguardarAte(() => emissoes.some((e) => e.feitio !== null));
    const qtdNaPausa = emissoes.length;
    unsubscribe();

    await comandos.montarPanela({ feitioId: 'f1', panelaId: 'p1', numero: 1 });
    // espera o liveQuery propagar, mas store não deve receber
    await new Promise((r) => setTimeout(r, 50));

    expect(emissoes.length).toBe(qtdNaPausa);
  });

  it('feitio inexistente → emite estado vazio', async () => {
    const store = criarFornalhaStore(repo, 'fantasma');
    const emissoes: EstadoFornalha[] = [];
    const unsubscribe = store.subscribe((estado) => {
      emissoes.push(estado);
    });

    await aguardarAte(() => emissoes.length >= 1);
    const primeira = emissoes[0];
    expect(primeira.feitio).toBeNull();
    expect(primeira.panelas).toEqual([]);
    unsubscribe();
  });
});
