/**
 * Command handlers — orquestram domínio (validação) + repositório (persistência).
 *
 * Cada comando:
 *  1. Lê eventos do feitio e projeta estado atual.
 *  2. Valida contra máquina de estados e invariantes.
 *  3. Cria evento via criarEvento, valida com validarEvento, persiste.
 *  4. Retorna { ok: true, eventoId } ou { ok: false, motivo }.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { projetarFornalha } from '../domain/projecoes/fornalha';
import { criarDb, type GestaoFeitioDb } from '../infra/persistencia/dexie-db';
import {
  criarRepositorioEventos,
  type RepositorioEventos
} from '../infra/persistencia/repositorio-eventos';
import { criarComandos, type Comandos } from './comandos';

let db: GestaoFeitioDb;
let repo: RepositorioEventos;
let comandos: Comandos;

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

async function estado(feitioId: string) {
  const eventos = await repo.listarPorFeitio(feitioId);
  return projetarFornalha(eventos);
}

describe('iniciarFeitio', () => {
  it('com nome e feitor → feitio criado e visível em projeção', async () => {
    const r = await comandos.iniciarFeitio({
      feitioId: 'f1',
      nome: 'Feitio Abril',
      feitor: 'José',
      qtdBocas: 5
    });
    expect(r.ok).toBe(true);

    const estadoFinal = await estado('f1');
    expect(estadoFinal.feitio).toMatchObject({ nome: 'Feitio Abril', feitor: 'José', qtdBocas: 5 });
    expect(estadoFinal.feitio?.status).toBe('em_andamento');
  });

  it('sem nome → erro, nada persistido', async () => {
    const r = await comandos.iniciarFeitio({
      feitioId: 'f1',
      nome: '',
      feitor: 'J',
      qtdBocas: 5
    });
    expect(r.ok).toBe(false);

    const estadoFinal = await estado('f1');
    expect(estadoFinal.feitio).toBeNull();
  });
});

describe('montarPanela + entrarNoFogo', () => {
  it('monta panela → estado montada com número correto', async () => {
    await comandos.iniciarFeitio({ feitioId: 'f1', nome: 'F', feitor: 'J', qtdBocas: 5 });
    const r = await comandos.montarPanela({ feitioId: 'f1', panelaId: 'p1', numero: 1 });
    expect(r.ok).toBe(true);

    const f = await estado('f1');
    const p1 = f.panelas.find((p) => p.id === 'p1');
    expect(p1?.estado).toBe('montada');
    expect(p1?.numero).toBe(1);
  });

  it('entrar no fogo em panela montada → estado no_fogo', async () => {
    await comandos.iniciarFeitio({ feitioId: 'f1', nome: 'F', feitor: 'J', qtdBocas: 5 });
    await comandos.montarPanela({ feitioId: 'f1', panelaId: 'p1', numero: 1 });
    const r = await comandos.entrarNoFogo({
      feitioId: 'f1',
      panelaId: 'p1',
      bocaNumero: 1,
      conteudo: { tipo: 'agua' },
      volumeL: 60
    });
    expect(r.ok).toBe(true);

    const f = await estado('f1');
    const p1 = f.panelas.find((p) => p.id === 'p1')!;
    expect(p1.estado).toBe('no_fogo');
    expect(p1.bocaAtual).toBe(1);
    expect(p1.volumeAtualL).toBe(60);
  });

  it('entrar no fogo em panela já em fogo → erro', async () => {
    await comandos.iniciarFeitio({ feitioId: 'f1', nome: 'F', feitor: 'J', qtdBocas: 5 });
    await comandos.montarPanela({ feitioId: 'f1', panelaId: 'p1', numero: 1 });
    await comandos.entrarNoFogo({
      feitioId: 'f1',
      panelaId: 'p1',
      bocaNumero: 1,
      conteudo: { tipo: 'agua' },
      volumeL: 60
    });
    const r = await comandos.entrarNoFogo({
      feitioId: 'f1',
      panelaId: 'p1',
      bocaNumero: 2,
      conteudo: { tipo: 'agua' },
      volumeL: 60
    });
    expect(r.ok).toBe(false);
  });

  it('entrar no fogo em panela inexistente → erro', async () => {
    await comandos.iniciarFeitio({ feitioId: 'f1', nome: 'F', feitor: 'J', qtdBocas: 5 });
    const r = await comandos.entrarNoFogo({
      feitioId: 'f1',
      panelaId: 'fantasma',
      bocaNumero: 1,
      conteudo: { tipo: 'agua' },
      volumeL: 60
    });
    expect(r.ok).toBe(false);
  });

  it('entrar no fogo com metaTiragemL → projeção preenche panela.metaTiragemL', async () => {
    await comandos.iniciarFeitio({ feitioId: 'f1', nome: 'F', feitor: 'J', qtdBocas: 5 });
    await comandos.montarPanela({ feitioId: 'f1', panelaId: 'p1', numero: 1 });
    const r = await comandos.entrarNoFogo({
      feitioId: 'f1',
      panelaId: 'p1',
      bocaNumero: 1,
      conteudo: { tipo: 'agua' },
      volumeL: 60,
      metaTiragemL: 45
    });
    expect(r.ok).toBe(true);

    const f = await estado('f1');
    const p1 = f.panelas.find((p) => p.id === 'p1')!;
    expect(p1.metaTiragemL).toBe(45);
  });

  it('entrar no fogo com metaTiragemL negativa → erro', async () => {
    await comandos.iniciarFeitio({ feitioId: 'f1', nome: 'F', feitor: 'J', qtdBocas: 5 });
    await comandos.montarPanela({ feitioId: 'f1', panelaId: 'p1', numero: 1 });
    const r = await comandos.entrarNoFogo({
      feitioId: 'f1',
      panelaId: 'p1',
      bocaNumero: 1,
      conteudo: { tipo: 'agua' },
      volumeL: 60,
      metaTiragemL: -3
    });
    expect(r.ok).toBe(false);
  });
});

describe('registrarTiragem', () => {
  async function prepararPanelaNoFogo() {
    await comandos.iniciarFeitio({ feitioId: 'f1', nome: 'F', feitor: 'J', qtdBocas: 5 });
    await comandos.montarPanela({ feitioId: 'f1', panelaId: 'p1', numero: 1 });
    await comandos.entrarNoFogo({
      feitioId: 'f1',
      panelaId: 'p1',
      bocaNumero: 1,
      conteudo: { tipo: 'agua' },
      volumeL: 60
    });
  }

  it('tiragem em panela no_fogo → evento persistido, panela em aguardando_reposicao', async () => {
    await prepararPanelaNoFogo();
    const r = await comandos.registrarTiragem({
      feitioId: 'f1',
      panelaId: 'p1',
      volumeL: 31,
      tonelDestinoId: 't-c1'
    });
    expect(r.ok).toBe(true);

    const f = await estado('f1');
    const p1 = f.panelas.find((p) => p.id === 'p1')!;
    expect(p1.estado).toBe('aguardando_reposicao');
    expect(p1.tiragens).toHaveLength(1);
    expect(p1.tiragens[0].tipo).toEqual({ tipo: 'cozimento', ordem: 1 });
  });

  it('tiragem em panela descartada → erro', async () => {
    await prepararPanelaNoFogo();
    await comandos.descartarPanela({ feitioId: 'f1', panelaId: 'p1' });
    const r = await comandos.registrarTiragem({
      feitioId: 'f1',
      panelaId: 'p1',
      volumeL: 10,
      tonelDestinoId: 't-c1'
    });
    expect(r.ok).toBe(false);
  });

  it('tiragem com volume > volumeAtual → erro', async () => {
    await prepararPanelaNoFogo();
    const r = await comandos.registrarTiragem({
      feitioId: 'f1',
      panelaId: 'p1',
      volumeL: 120,
      tonelDestinoId: 't-c1'
    });
    expect(r.ok).toBe(false);
  });

  it('tiragem com volume negativo → erro', async () => {
    await prepararPanelaNoFogo();
    const r = await comandos.registrarTiragem({
      feitioId: 'f1',
      panelaId: 'p1',
      volumeL: -5,
      tonelDestinoId: 't-c1'
    });
    expect(r.ok).toBe(false);
  });

  it('duas tiragens consecutivas com reposição entre → numeração correta', async () => {
    await prepararPanelaNoFogo();
    await comandos.registrarTiragem({
      feitioId: 'f1',
      panelaId: 'p1',
      volumeL: 30,
      tonelDestinoId: 't-c1'
    });
    await comandos.reporLiquido({
      feitioId: 'f1',
      panelaId: 'p1',
      conteudo: { tipo: 'agua' },
      volumeL: 55
    });
    await comandos.registrarTiragem({
      feitioId: 'f1',
      panelaId: 'p1',
      volumeL: 30,
      tonelDestinoId: 't-c2'
    });

    const f = await estado('f1');
    const p1 = f.panelas.find((p) => p.id === 'p1')!;
    expect(p1.tiragens).toHaveLength(2);
    expect(p1.tiragens[1].tipo).toEqual({ tipo: 'cozimento', ordem: 2 });
  });
});

describe('pausar + retomar', () => {
  async function prepararPanelaNoFogo() {
    await comandos.iniciarFeitio({ feitioId: 'f1', nome: 'F', feitor: 'J', qtdBocas: 5 });
    await comandos.montarPanela({ feitioId: 'f1', panelaId: 'p1', numero: 1 });
    await comandos.entrarNoFogo({
      feitioId: 'f1',
      panelaId: 'p1',
      bocaNumero: 1,
      conteudo: { tipo: 'agua' },
      volumeL: 60
    });
  }

  it('pausar panela no fogo → estado fora_do_fogo', async () => {
    await prepararPanelaNoFogo();
    const r = await comandos.pausar({ feitioId: 'f1', panelaId: 'p1' });
    expect(r.ok).toBe(true);

    const f = await estado('f1');
    expect(f.panelas[0].estado).toBe('fora_do_fogo');
  });

  it('retomar panela pausada → volta a no_fogo', async () => {
    await prepararPanelaNoFogo();
    await comandos.pausar({ feitioId: 'f1', panelaId: 'p1' });
    const r = await comandos.retomar({ feitioId: 'f1', panelaId: 'p1' });
    expect(r.ok).toBe(true);

    const f = await estado('f1');
    expect(f.panelas[0].estado).toBe('no_fogo');
  });

  it('pausar panela descartada → erro', async () => {
    await prepararPanelaNoFogo();
    await comandos.descartarPanela({ feitioId: 'f1', panelaId: 'p1' });
    const r = await comandos.pausar({ feitioId: 'f1', panelaId: 'p1' });
    expect(r.ok).toBe(false);
  });
});

describe('trocarBocas', () => {
  it('trocar bocas entre duas panelas no fogo → invertem bocas', async () => {
    await comandos.iniciarFeitio({ feitioId: 'f1', nome: 'F', feitor: 'J', qtdBocas: 5 });
    await comandos.montarPanela({ feitioId: 'f1', panelaId: 'p1', numero: 1 });
    await comandos.montarPanela({ feitioId: 'f1', panelaId: 'p2', numero: 2 });
    await comandos.entrarNoFogo({
      feitioId: 'f1',
      panelaId: 'p1',
      bocaNumero: 1,
      conteudo: { tipo: 'agua' },
      volumeL: 60
    });
    await comandos.entrarNoFogo({
      feitioId: 'f1',
      panelaId: 'p2',
      bocaNumero: 2,
      conteudo: { tipo: 'agua' },
      volumeL: 60
    });

    const r = await comandos.trocarBocas({ feitioId: 'f1', panelaAId: 'p1', panelaBId: 'p2' });
    expect(r.ok).toBe(true);

    const f = await estado('f1');
    expect(f.panelas.find((p) => p.id === 'p1')?.bocaAtual).toBe(2);
    expect(f.panelas.find((p) => p.id === 'p2')?.bocaAtual).toBe(1);
  });

  it('trocar bocas com panela inexistente → erro', async () => {
    await comandos.iniciarFeitio({ feitioId: 'f1', nome: 'F', feitor: 'J', qtdBocas: 5 });
    const r = await comandos.trocarBocas({ feitioId: 'f1', panelaAId: 'p1', panelaBId: 'p2' });
    expect(r.ok).toBe(false);
  });
});

describe('ajustarVolume', () => {
  it('ajuste positivo → volumeAtualL aumenta', async () => {
    await comandos.iniciarFeitio({ feitioId: 'f1', nome: 'F', feitor: 'J', qtdBocas: 5 });
    await comandos.montarPanela({ feitioId: 'f1', panelaId: 'p1', numero: 1 });
    await comandos.entrarNoFogo({
      feitioId: 'f1',
      panelaId: 'p1',
      bocaNumero: 1,
      conteudo: { tipo: 'agua' },
      volumeL: 60
    });
    const r = await comandos.ajustarVolume({ feitioId: 'f1', panelaId: 'p1', deltaL: 5 });
    expect(r.ok).toBe(true);

    const f = await estado('f1');
    expect(f.panelas[0].volumeAtualL).toBe(65);
  });
});

describe('desfazerUltimoEvento', () => {
  it('desfaz tiragem → panela volta ao estado anterior', async () => {
    await comandos.iniciarFeitio({ feitioId: 'f1', nome: 'F', feitor: 'J', qtdBocas: 5 });
    await comandos.montarPanela({ feitioId: 'f1', panelaId: 'p1', numero: 1 });
    await comandos.entrarNoFogo({
      feitioId: 'f1',
      panelaId: 'p1',
      bocaNumero: 1,
      conteudo: { tipo: 'agua' },
      volumeL: 60
    });
    await comandos.registrarTiragem({
      feitioId: 'f1',
      panelaId: 'p1',
      volumeL: 30,
      tonelDestinoId: 't-c1'
    });

    const r = await comandos.desfazerUltimoEvento({ feitioId: 'f1' });
    expect(r.ok).toBe(true);

    const f = await estado('f1');
    const p1 = f.panelas.find((p) => p.id === 'p1')!;
    expect(p1.tiragens).toHaveLength(0);
    expect(p1.estado).toBe('no_fogo');
  });

  it('desfazer quando não há evento compensável → erro', async () => {
    const r = await comandos.desfazerUltimoEvento({ feitioId: 'fantasma' });
    expect(r.ok).toBe(false);
  });
});

describe('encerrarFeitio', () => {
  it('encerra feitio → status encerrado', async () => {
    await comandos.iniciarFeitio({ feitioId: 'f1', nome: 'F', feitor: 'J', qtdBocas: 5 });
    const r = await comandos.encerrarFeitio({ feitioId: 'f1' });
    expect(r.ok).toBe(true);

    const f = await estado('f1');
    expect(f.feitio?.status).toBe('encerrado');
  });

  it('encerrar feitio inexistente → erro', async () => {
    const r = await comandos.encerrarFeitio({ feitioId: 'fantasma' });
    expect(r.ok).toBe(false);
  });
});

describe('cenário integrado quinta + sexta via comandos', () => {
  it('fluxo inteiro chega no mesmo estado que projeção direta', async () => {
    await comandos.iniciarFeitio({
      feitioId: 'fq',
      nome: 'Feitio Abril',
      feitor: 'José',
      qtdBocas: 5
    });
    // Quinta — 2 panelas água, 1º e 2º cozimento cada
    await comandos.montarPanela({ feitioId: 'fq', panelaId: 'p1', numero: 1 });
    await comandos.montarPanela({ feitioId: 'fq', panelaId: 'p2', numero: 2 });
    await comandos.entrarNoFogo({
      feitioId: 'fq',
      panelaId: 'p1',
      bocaNumero: 1,
      conteudo: { tipo: 'agua' },
      volumeL: 60
    });
    await comandos.entrarNoFogo({
      feitioId: 'fq',
      panelaId: 'p2',
      bocaNumero: 2,
      conteudo: { tipo: 'agua' },
      volumeL: 60
    });
    await comandos.registrarTiragem({
      feitioId: 'fq',
      panelaId: 'p1',
      volumeL: 30,
      tonelDestinoId: 't-c1'
    });
    await comandos.registrarTiragem({
      feitioId: 'fq',
      panelaId: 'p2',
      volumeL: 30,
      tonelDestinoId: 't-c1'
    });
    await comandos.reporLiquido({
      feitioId: 'fq',
      panelaId: 'p1',
      conteudo: { tipo: 'agua' },
      volumeL: 55
    });
    await comandos.reporLiquido({
      feitioId: 'fq',
      panelaId: 'p2',
      conteudo: { tipo: 'agua' },
      volumeL: 55
    });
    await comandos.registrarTiragem({
      feitioId: 'fq',
      panelaId: 'p1',
      volumeL: 30,
      tonelDestinoId: 't-c2'
    });
    await comandos.registrarTiragem({
      feitioId: 'fq',
      panelaId: 'p2',
      volumeL: 30,
      tonelDestinoId: 't-c2'
    });
    // Sexta — panela 3 nova com 1º cozimento, tira Daime
    await comandos.reporLiquido({
      feitioId: 'fq',
      panelaId: 'p1',
      conteudo: { tipo: 'cozimento', ordem: 1 },
      volumeL: 60
    });
    await comandos.registrarTiragem({
      feitioId: 'fq',
      panelaId: 'p1',
      volumeL: 18,
      tonelDestinoId: 't-d1'
    });

    const f = await estado('fq');
    const p1 = f.panelas.find((p) => p.id === 'p1')!;
    expect(p1.tiragens).toHaveLength(3);
    expect(p1.tiragens[2].tipo).toEqual({ tipo: 'daime', grau: 1 });
    expect(f.toneis.find((t) => t.id === 't-d1')?.volumeL).toBe(18);
    // c1 = 30 + 30 depositados - 60 consumido na reposição de p1 = 0
    expect(f.toneis.find((t) => t.id === 't-c1')?.volumeL).toBe(0);
    expect(f.toneis.find((t) => t.id === 't-c2')?.volumeL).toBe(60);
  });
});
