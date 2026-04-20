import { describe, it, expect } from 'vitest';
import { transicao, type Comando, type ResultadoTransicao } from './maquina-estados';
import type { EstadoPanela } from '../entities/panela';

/**
 * Tabela de transições permitidas (requisitos.md §4):
 *
 *   montada              → no_fogo              via 'entrar_no_fogo'
 *   no_fogo              → fora_do_fogo         via 'pausar'
 *   fora_do_fogo         → no_fogo              via 'retomar'
 *   no_fogo              → aguardando_reposicao via 'registrar_tiragem'
 *   fora_do_fogo         → aguardando_reposicao via 'registrar_tiragem'
 *   aguardando_reposicao → no_fogo              via 'repor_e_play'
 *   aguardando_reposicao → descartada           via 'descartar'
 *   no_fogo              → descartada           via 'descartar' (excepcional)
 *
 * Tudo o mais é proibido.
 */

describe('transicao — transições permitidas', () => {
  it('montada + entrar_no_fogo → no_fogo', () => {
    expect(transicao('montada', { tipo: 'entrar_no_fogo' })).toEqual<ResultadoTransicao>({
      ok: true,
      estado: 'no_fogo'
    });
  });

  it('no_fogo + pausar → fora_do_fogo', () => {
    expect(transicao('no_fogo', { tipo: 'pausar' })).toEqual<ResultadoTransicao>({
      ok: true,
      estado: 'fora_do_fogo'
    });
  });

  it('fora_do_fogo + retomar → no_fogo', () => {
    expect(transicao('fora_do_fogo', { tipo: 'retomar' })).toEqual<ResultadoTransicao>({
      ok: true,
      estado: 'no_fogo'
    });
  });

  it('no_fogo + registrar_tiragem → aguardando_reposicao', () => {
    expect(transicao('no_fogo', { tipo: 'registrar_tiragem' })).toEqual<ResultadoTransicao>({
      ok: true,
      estado: 'aguardando_reposicao'
    });
  });

  it('fora_do_fogo + registrar_tiragem → aguardando_reposicao', () => {
    expect(
      transicao('fora_do_fogo', { tipo: 'registrar_tiragem' })
    ).toEqual<ResultadoTransicao>({ ok: true, estado: 'aguardando_reposicao' });
  });

  it('aguardando_reposicao + repor_e_play → no_fogo', () => {
    expect(transicao('aguardando_reposicao', { tipo: 'repor_e_play' })).toEqual<ResultadoTransicao>({
      ok: true,
      estado: 'no_fogo'
    });
  });

  it('aguardando_reposicao + descartar → descartada', () => {
    expect(transicao('aguardando_reposicao', { tipo: 'descartar' })).toEqual<ResultadoTransicao>({
      ok: true,
      estado: 'descartada'
    });
  });

  it('no_fogo + descartar → descartada (caso excepcional)', () => {
    expect(transicao('no_fogo', { tipo: 'descartar' })).toEqual<ResultadoTransicao>({
      ok: true,
      estado: 'descartada'
    });
  });
});

describe('transicao — transições proibidas', () => {
  // montada só aceita entrar_no_fogo
  const proibidas: Array<[EstadoPanela, Comando['tipo']]> = [
    ['montada', 'pausar'],
    ['montada', 'retomar'],
    ['montada', 'registrar_tiragem'],
    ['montada', 'repor_e_play'],
    ['montada', 'descartar'],

    ['no_fogo', 'entrar_no_fogo'],
    ['no_fogo', 'retomar'],
    ['no_fogo', 'repor_e_play'],

    ['fora_do_fogo', 'entrar_no_fogo'],
    ['fora_do_fogo', 'pausar'],
    ['fora_do_fogo', 'repor_e_play'],
    ['fora_do_fogo', 'descartar'],

    ['aguardando_reposicao', 'entrar_no_fogo'],
    ['aguardando_reposicao', 'pausar'],
    ['aguardando_reposicao', 'retomar'],
    ['aguardando_reposicao', 'registrar_tiragem']
  ];

  for (const [estado, comando] of proibidas) {
    it(`${estado} + ${comando} → erro`, () => {
      const r = transicao(estado, { tipo: comando } as Comando);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.motivo).toMatch(/não permitid|invalid|proibid/i);
      }
    });
  }

  it('estado descartada é terminal — rejeita qualquer comando', () => {
    const comandos: Comando['tipo'][] = [
      'entrar_no_fogo',
      'pausar',
      'retomar',
      'registrar_tiragem',
      'repor_e_play',
      'descartar'
    ];
    for (const tipo of comandos) {
      const r = transicao('descartada', { tipo } as Comando);
      expect(r.ok).toBe(false);
    }
  });
});

describe('transicao — resposta de erro tem informação útil', () => {
  it('erro inclui estado e comando no motivo', () => {
    const r = transicao('montada', { tipo: 'pausar' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.motivo).toContain('montada');
      expect(r.motivo).toContain('pausar');
    }
  });
});
