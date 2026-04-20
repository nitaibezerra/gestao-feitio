import { describe, it, expect } from 'vitest';
import { sugerirCorrecaoDupla, type SugestaoCorrecao } from './correcao-duplas';

/**
 * Contexto: duas panelas "em dupla" alimentam um tonel que precisa de ~60 L
 * para compor uma panela nova no dia seguinte. Cada uma deveria dar ~30 L.
 *
 * Regra de ouro do tutorial (§9.1): "sobrar nunca é problema, faltar é
 * problema — mire sempre um pouquinho a mais". Então a meta real é
 * levemente acima do mínimo (ex.: 62 L para uma panela de 60 L).
 */

describe('sugerirCorrecaoDupla — antes da 1ª tiragem da dupla', () => {
  it('sem tiragens ainda, meta 62 L, duas panelas → mira 31 L na primeira', () => {
    const r = sugerirCorrecaoDupla({ metaTonelL: 62, tiragensAnteriores: [] });
    expect(r).toEqual<SugestaoCorrecao>({
      sugestaoL: 31,
      faltamL: 62,
      restantesPanelas: 2,
      justificativa: expect.stringMatching(/meta.*62.*duas panelas/i)
    });
  });

  it('meta 60 L, duas panelas → mira 30 L cada', () => {
    const r = sugerirCorrecaoDupla({ metaTonelL: 60, tiragensAnteriores: [] });
    expect(r.sugestaoL).toBe(30);
  });
});

describe('sugerirCorrecaoDupla — após a 1ª tiragem (corrige na 2ª)', () => {
  it('primeira deu 33 L (3 acima do planejado), meta 62 L → 2ª mira 29 L', () => {
    const r = sugerirCorrecaoDupla({ metaTonelL: 62, tiragensAnteriores: [33] });
    expect(r.sugestaoL).toBe(29);
    expect(r.faltamL).toBe(29);
  });

  it('primeira deu 30 L (abaixo), meta 62 L → 2ª mira 32 L', () => {
    const r = sugerirCorrecaoDupla({ metaTonelL: 62, tiragensAnteriores: [30] });
    expect(r.sugestaoL).toBe(32);
  });

  it('primeira deu exatamente 31, meta 62 → 2ª também mira 31', () => {
    const r = sugerirCorrecaoDupla({ metaTonelL: 62, tiragensAnteriores: [31] });
    expect(r.sugestaoL).toBe(31);
  });

  it('justificativa explica o estado da dupla', () => {
    const r = sugerirCorrecaoDupla({ metaTonelL: 62, tiragensAnteriores: [33] });
    expect(r.justificativa).toMatch(/33/);
    expect(r.justificativa).toMatch(/29|mire/);
  });
});

describe('sugerirCorrecaoDupla — tonel já atingiu ou ultrapassou meta', () => {
  it('primeira deu 62 L (atingiu meta sozinha) → próxima pode tirar qualquer valor (sugestão 0)', () => {
    const r = sugerirCorrecaoDupla({ metaTonelL: 62, tiragensAnteriores: [62] });
    expect(r.sugestaoL).toBe(0);
    expect(r.faltamL).toBe(0);
  });

  it('primeira deu 70 L (acima da meta!) → sugestão 0 e sobrou 8 L', () => {
    const r = sugerirCorrecaoDupla({ metaTonelL: 62, tiragensAnteriores: [70] });
    expect(r.sugestaoL).toBe(0);
    expect(r.faltamL).toBe(0);
    expect(r.sobrouL).toBe(8);
  });
});

describe('sugerirCorrecaoDupla — configuração alternativa (trio, solo)', () => {
  it('3 panelas na composição, meta 90 L → 1ª mira 30 L', () => {
    const r = sugerirCorrecaoDupla({
      metaTonelL: 90,
      tiragensAnteriores: [],
      totalPanelas: 3
    });
    expect(r.sugestaoL).toBe(30);
    expect(r.restantesPanelas).toBe(3);
  });

  it('1 panela solo, meta 60 L → mira 60 L de uma vez', () => {
    const r = sugerirCorrecaoDupla({
      metaTonelL: 60,
      tiragensAnteriores: [],
      totalPanelas: 1
    });
    expect(r.sugestaoL).toBe(60);
  });
});

describe('sugerirCorrecaoDupla — validações de entrada', () => {
  it('meta negativa → erro', () => {
    expect(() => sugerirCorrecaoDupla({ metaTonelL: -1, tiragensAnteriores: [] })).toThrow();
  });

  it('tiragens anteriores excedem o planejado (ex.: 3 tiragens em dupla) → erro', () => {
    expect(() =>
      sugerirCorrecaoDupla({ metaTonelL: 62, tiragensAnteriores: [30, 30, 30] })
    ).toThrow(/excede/i);
  });
});

describe('sugerirCorrecaoDupla — cenário do tutorial (§9.1)', () => {
  it('"tirou 30 na 1ª e 31 na 2ª → tem 61 L (faltou 1)" — tela de ajuste no 3º cozimento', () => {
    // Fecha a dupla com 61. Agora começa nova rodada de cozimento com meta 62.
    // Mas esse teste é só sobre a meta da rodada — chamada separada.
    const r = sugerirCorrecaoDupla({
      metaTonelL: 63,
      tiragensAnteriores: [],
      totalPanelas: 2
    });
    // Mira 32 para "corrigir o 1 que faltou" no cozimento anterior + margem
    // de 2 para a segunda. O usuário do sistema decide — nós só sugerimos
    // a divisão da meta.
    expect(r.sugestaoL).toBeCloseTo(32, 0);
  });
});
