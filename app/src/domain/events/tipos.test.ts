import { describe, it, expect } from 'vitest';
import {
  criarEvento,
  validarEvento,
  type Evento,
  type TipoEvento
} from './tipos';

/**
 * Eventos são append-only e imutáveis. Cada evento tem:
 *   - id (uuid)
 *   - feitioId
 *   - tipo (discriminante)
 *   - momento (ISO string)
 *   - payload (específico por tipo)
 *   - versao (para migração de schema)
 *
 * validarEvento retorna { ok:true } ou { ok:false, erros: string[] }.
 */

function base() {
  return {
    id: 'evt-1',
    feitioId: 'feitio-1',
    momento: '2026-04-20T15:00:00.000Z',
    versao: 1
  };
}

describe('criarEvento — fabrica eventos com id e momento preenchidos', () => {
  it('cria evento do tipo informado com payload', () => {
    const e = criarEvento('feitio-1', {
      tipo: 'panela_montada',
      payload: { panelaId: 'p1', numero: 1 }
    });
    expect(e.feitioId).toBe('feitio-1');
    expect(e.tipo).toBe('panela_montada');
    expect(e.id).toMatch(/[-a-f0-9]/);
    expect(new Date(e.momento).getTime()).not.toBeNaN();
    expect(e.versao).toBe(1);
  });
});

describe('validarEvento — tipos válidos', () => {
  const casos: Array<[TipoEvento, object]> = [
    ['feitio_iniciado', { nome: 'Feitio Abril/2026', feitor: 'José', qtdBocas: 5 }],
    ['panela_montada', { panelaId: 'p1', numero: 1 }],
    [
      'panela_entra_fogo',
      { panelaId: 'p1', bocaNumero: 1, conteudo: { tipo: 'agua' }, volumeL: 60 }
    ],
    [
      'tiragem_registrada',
      {
        panelaId: 'p1',
        volumeL: 31,
        tonelDestinoId: 't1',
        tipoTiragem: { tipo: 'cozimento', ordem: 1 }
      }
    ],
    [
      'reposicao_registrada',
      { panelaId: 'p1', conteudo: { tipo: 'agua' }, volumeL: 55 }
    ],
    ['volume_ajustado', { panelaId: 'p1', deltaL: 3 }],
    ['tempo_pausado', { panelaId: 'p1' }],
    ['tempo_retomado', { panelaId: 'p1' }],
    ['troca_bocas', { panelaAId: 'p1', panelaBId: 'p2' }],
    ['panela_descartada', { panelaId: 'p1' }],
    ['evento_desfeito', { eventoRevertidoId: 'evt-99' }],
    ['feitio_encerrado', {}]
  ];

  for (const [tipo, payload] of casos) {
    it(`${tipo} com payload válido → ok`, () => {
      const evento = { ...base(), tipo, payload } as Evento;
      const r = validarEvento(evento);
      expect(r.ok, JSON.stringify(r)).toBe(true);
    });
  }
});

describe('validarEvento — rejeita campos faltando', () => {
  it('sem id → erro', () => {
    const e = { ...base(), id: '', tipo: 'panela_montada', payload: { panelaId: 'p1', numero: 1 } } as Evento;
    const r = validarEvento(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/id/i);
  });

  it('sem feitioId → erro', () => {
    const e = { ...base(), feitioId: '', tipo: 'panela_montada', payload: { panelaId: 'p1', numero: 1 } } as Evento;
    const r = validarEvento(e);
    expect(r.ok).toBe(false);
  });

  it('momento inválido → erro', () => {
    const e = { ...base(), momento: 'nao-data', tipo: 'panela_montada', payload: { panelaId: 'p1', numero: 1 } } as Evento;
    const r = validarEvento(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/momento/i);
  });

  it('tipo desconhecido → erro', () => {
    const e = { ...base(), tipo: 'inventado', payload: {} } as unknown as Evento;
    const r = validarEvento(e);
    expect(r.ok).toBe(false);
  });
});

describe('validarEvento — payload específico por tipo', () => {
  it('panela_montada sem panelaId → erro', () => {
    const e = { ...base(), tipo: 'panela_montada', payload: { numero: 1 } } as unknown as Evento;
    const r = validarEvento(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/panelaId/);
  });

  it('tiragem_registrada com volumeL negativo → erro', () => {
    const e: Evento = {
      ...base(),
      tipo: 'tiragem_registrada',
      payload: {
        panelaId: 'p1',
        volumeL: -5,
        tonelDestinoId: 't1',
        tipoTiragem: { tipo: 'cozimento', ordem: 1 }
      }
    };
    const r = validarEvento(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/volume/i);
  });

  it('panela_entra_fogo com bocaNumero <= 0 → erro', () => {
    const e: Evento = {
      ...base(),
      tipo: 'panela_entra_fogo',
      payload: { panelaId: 'p1', bocaNumero: 0, conteudo: { tipo: 'agua' }, volumeL: 60 }
    };
    const r = validarEvento(e);
    expect(r.ok).toBe(false);
  });

  it('feitio_iniciado com qtdBocas <= 0 → erro', () => {
    const e: Evento = {
      ...base(),
      tipo: 'feitio_iniciado',
      payload: { nome: 'x', feitor: 'y', qtdBocas: 0 }
    };
    const r = validarEvento(e);
    expect(r.ok).toBe(false);
  });

  it('panela_entra_fogo com metaTiragemL positiva → ok', () => {
    const e: Evento = {
      ...base(),
      tipo: 'panela_entra_fogo',
      payload: {
        panelaId: 'p1',
        bocaNumero: 1,
        conteudo: { tipo: 'agua' },
        volumeL: 60,
        metaTiragemL: 30
      }
    };
    const r = validarEvento(e);
    expect(r.ok).toBe(true);
  });

  it('panela_entra_fogo com metaTiragemL negativa → erro', () => {
    const e: Evento = {
      ...base(),
      tipo: 'panela_entra_fogo',
      payload: {
        panelaId: 'p1',
        bocaNumero: 1,
        conteudo: { tipo: 'agua' },
        volumeL: 60,
        metaTiragemL: -5
      }
    };
    const r = validarEvento(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/metaTiragemL/);
  });
});
