/**
 * Testes do resumo de feitio — consolida totais a partir do EstadoFornalha.
 */

import { describe, expect, it } from 'vitest';
import { resumirFeitio, type ResumoFeitio } from './resumo';
import type { EstadoFornalha } from '../domain/projecoes/fornalha';

function estadoVazio(): EstadoFornalha {
  return {
    feitio: {
      id: 'f1',
      nome: 'Feitio Teste',
      feitor: 'José',
      qtdBocas: 5,
      inicio: new Date('2026-04-18T06:00:00'),
      status: 'encerrado',
      fim: new Date('2026-04-19T18:00:00')
    },
    panelas: [],
    toneis: []
  };
}

describe('resumirFeitio', () => {
  it('feitio vazio devolve totais zerados', () => {
    const r = resumirFeitio(estadoVazio());
    expect(r.totalPanelas).toBe(0);
    expect(r.tiragensPorTipo.cozimento).toEqual({});
    expect(r.tiragensPorTipo.daime).toEqual({});
    expect(r.tiragensPorTipo.agua_forte).toBe(0);
    expect(r.volumeTotalL).toBe(0);
  });

  it('soma tonéis por tipo e calcula volume total', () => {
    const s = estadoVazio();
    s.toneis = [
      { id: 't1', tipo: 'cozimento', ordem: 1, volumeL: 31 },
      { id: 't2', tipo: 'cozimento', ordem: 2, volumeL: 28 },
      { id: 't3', tipo: 'daime', grau: 1, volumeL: 18 },
      { id: 't4', tipo: 'agua_forte', volumeL: 12 }
    ];
    const r: ResumoFeitio = resumirFeitio(s);
    expect(r.tiragensPorTipo.cozimento).toEqual({ 1: 31, 2: 28 });
    expect(r.tiragensPorTipo.daime).toEqual({ 1: 18 });
    expect(r.tiragensPorTipo.agua_forte).toBe(12);
    expect(r.volumeTotalL).toBe(89);
  });

  it('conta panelas ativas e descartadas separadamente', () => {
    const s = estadoVazio();
    s.panelas = [
      {
        id: 'p1',
        numero: 1,
        estado: 'no_fogo',
        bocaAtual: 1,
        conteudo: { tipo: 'agua' },
        emCicloAguaForte: false,
        tiragens: [],
        volumeAtualL: 60,
        entradaFogoEm: new Date()
      },
      {
        id: 'p2',
        numero: 2,
        estado: 'descartada',
        bocaAtual: null,
        conteudo: null,
        emCicloAguaForte: false,
        tiragens: [],
        volumeAtualL: 0,
        entradaFogoEm: null
      }
    ];
    const r = resumirFeitio(s);
    expect(r.totalPanelas).toBe(2);
    expect(r.totalPanelasDescartadas).toBe(1);
  });
});
