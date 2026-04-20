/**
 * Mock de dados para desenvolvimento visual da Fase 3.
 *
 * TEMPORÁRIO — substituído por stores reativos do Dexie na Fase 4.
 * Espelha o `initialState` do design Luz Branca
 * (design/project/Gestao de Feitio.html linhas 90-147).
 *
 * Cenário: Feitio de Abril/2026 na sexta 17/abr às 14:32.
 */

import type { Panela, Tiragem, TipoTiragem } from '../domain/entities/panela';
import type { Tonel } from '../domain/entities/tonel';
import type { Feitio } from '../domain/entities/feitio';

export const AGORA_MOCK = new Date(2026, 3, 17, 14, 32, 0);

export const feitioMock: Feitio = {
  id: 'feitio-mock',
  nome: 'Feitio de Abril/2026',
  feitor: 'José',
  foguista: 'Cícero',
  casinha: 'Casinha da Sede',
  qtdBocas: 5,
  inicio: new Date(2026, 3, 16, 7, 0),
  status: 'em_andamento'
};

export type PanelaMock = Panela & {
  boca: number;
  metaTiragemL: number;
  proxTiragem: TipoTiragem;
};

function t(tipo: TipoTiragem, sequencia: number, volumeL: number, h: [number, number, number]): Tiragem {
  const [dia, hh, mm] = h;
  return { sequencia, tipo, volumeL, momento: new Date(2026, 3, dia, hh, mm) };
}

export const panelasMock: PanelaMock[] = [
  {
    id: 'p1',
    numero: 1,
    boca: 1,
    estado: 'no_fogo',
    conteudo: { tipo: 'agua' },
    volumeAtualL: 58,
    entradaFogoEm: new Date(2026, 3, 17, 12, 40),
    metaTiragemL: 40,
    tempoPausado: false,
    emCicloAguaForte: false,
    tiragens: [
      t({ tipo: 'cozimento', ordem: 1 }, 1, 31, [16, 10, 15]),
      t({ tipo: 'cozimento', ordem: 2 }, 2, 30, [16, 14, 40])
    ],
    proxTiragem: { tipo: 'cozimento', ordem: 1 }
  },
  {
    id: 'p2',
    numero: 2,
    boca: 2,
    estado: 'no_fogo',
    conteudo: { tipo: 'cozimento', ordem: 2 },
    volumeAtualL: 72,
    entradaFogoEm: new Date(2026, 3, 17, 10, 15),
    metaTiragemL: 45,
    tempoPausado: false,
    emCicloAguaForte: false,
    tiragens: [
      t({ tipo: 'cozimento', ordem: 1 }, 1, 30, [16, 10, 20]),
      t({ tipo: 'cozimento', ordem: 2 }, 2, 30, [16, 14, 45])
    ],
    proxTiragem: { tipo: 'cozimento', ordem: 3 }
  },
  {
    id: 'p3',
    numero: 3,
    boca: 3,
    estado: 'no_fogo',
    conteudo: { tipo: 'cozimento', ordem: 3 },
    volumeAtualL: 48,
    entradaFogoEm: new Date(2026, 3, 17, 8, 45),
    metaTiragemL: 30,
    tempoPausado: false,
    emCicloAguaForte: false,
    tiragens: [],
    proxTiragem: { tipo: 'daime', grau: 1 }
  },
  {
    id: 'p4',
    numero: 4,
    boca: 4,
    estado: 'no_fogo',
    conteudo: { tipo: 'cozimento', ordem: 4 },
    volumeAtualL: 36,
    entradaFogoEm: new Date(2026, 3, 17, 11, 20),
    metaTiragemL: 20,
    tempoPausado: false,
    emCicloAguaForte: false,
    tiragens: [],
    proxTiragem: { tipo: 'daime', grau: 2 }
  }
];

export type TonelMock = Tonel & { numero: number; capacidadeL: number };

export const toneisMock: TonelMock[] = [
  { id: 't1', numero: 1, tipo: 'cozimento', ordem: 1, volumeL: 52, capacidadeL: 120 },
  { id: 't2', numero: 2, tipo: 'cozimento', ordem: 2, volumeL: 40, capacidadeL: 120 },
  { id: 't3', numero: 3, tipo: 'cozimento', ordem: 3, volumeL: 30, capacidadeL: 80 },
  { id: 't4', numero: 4, tipo: 'cozimento', ordem: 4, volumeL: 18, capacidadeL: 80 },
  { id: 't5', numero: 5, tipo: 'daime', grau: 1, volumeL: 24, capacidadeL: 60 },
  { id: 't6', numero: 6, tipo: 'daime', grau: 2, volumeL: 12, capacidadeL: 60 },
  { id: 't7', numero: 7, tipo: 'agua_forte', volumeL: 8, capacidadeL: 40 }
];

export type EventoLog = { id: string; momento: Date; texto: string };

export const eventosMock: EventoLog[] = [
  { id: 'e1', momento: new Date(2026, 3, 17, 14, 10), texto: 'Panela 3 — Tirou 18 L (3º cozimento) → Tonel 3' },
  { id: 'e2', momento: new Date(2026, 3, 17, 13, 30), texto: 'Panela 1 — Acrescentou 3 L' },
  { id: 'e3', momento: new Date(2026, 3, 17, 11, 20), texto: 'Panela 2 — Tirou 30 L (3º cozimento) → Tonel 3' }
];
