import { describe, it, expect } from 'vitest';
import { calcularTipoTiragem } from './nomenclatura';
import type { Panela, Tiragem, TipoTiragem } from '../entities/panela';

// ----- factories -----
function tiragem(tipo: TipoTiragem, sequencia: number, volumeL = 30): Tiragem {
  return { sequencia, tipo, volumeL, momento: new Date(2026, 3, 17, 10) };
}

function panelaComAgua(tiragens: Tiragem[] = [], emCicloAguaForte = false): Panela {
  return {
    id: 'p1',
    numero: 1,
    conteudo: { tipo: 'agua' },
    emCicloAguaForte,
    tiragens
  };
}

function panelaComCozimento(ordem: 1 | 2 | 3 | 4 | 5 | 6, tiragens: Tiragem[] = []): Panela {
  return {
    id: 'p2',
    numero: 2,
    conteudo: { tipo: 'cozimento', ordem },
    emCicloAguaForte: false,
    tiragens
  };
}

// ============================================================
// CICLO A — panela com água produz cozimento
// Regra: ordem = 1 + quantidade de cozimentos já tirados
// ============================================================
describe('panela com água produz cozimento (ordem crescente)', () => {
  it('1ª tiragem de panela nova com água → 1º cozimento', () => {
    expect(calcularTipoTiragem(panelaComAgua())).toEqual({ tipo: 'cozimento', ordem: 1 });
  });

  it('após 1 cozimento tirado → próxima é 2º cozimento', () => {
    const p = panelaComAgua([tiragem({ tipo: 'cozimento', ordem: 1 }, 1)]);
    expect(calcularTipoTiragem(p)).toEqual({ tipo: 'cozimento', ordem: 2 });
  });

  it('após 2 cozimentos tirados → próxima é 3º cozimento', () => {
    const p = panelaComAgua([
      tiragem({ tipo: 'cozimento', ordem: 1 }, 1),
      tiragem({ tipo: 'cozimento', ordem: 2 }, 2)
    ]);
    expect(calcularTipoTiragem(p)).toEqual({ tipo: 'cozimento', ordem: 3 });
  });

  it('após 5 cozimentos → próxima é 6º cozimento (ainda não é água forte)', () => {
    const anteriores = [1, 2, 3, 4, 5].map(i =>
      tiragem({ tipo: 'cozimento', ordem: i as 1 | 2 | 3 | 4 | 5 }, i)
    );
    expect(calcularTipoTiragem(panelaComAgua(anteriores))).toEqual({
      tipo: 'cozimento',
      ordem: 6
    });
  });

  it('após 6 cozimentos → próxima é água forte (transita para ciclo)', () => {
    const anteriores = [1, 2, 3, 4, 5, 6].map(i =>
      tiragem({ tipo: 'cozimento', ordem: i as 1 | 2 | 3 | 4 | 5 | 6 }, i)
    );
    expect(calcularTipoTiragem(panelaComAgua(anteriores))).toEqual({ tipo: 'agua_forte' });
  });
});

// ============================================================
// CICLO B — panela com cozimento produz Daime
// Regra corrigida: grau = ordem do cozimento que entrou na panela
// (Tutorial: "A segunda panela nova, que entrou com o segundo cozimento,
//  chamamos isso de segundo grau" — mesmo sem histórico de Daime)
// ============================================================
describe('panela com cozimento produz Daime (grau = ordem do cozimento)', () => {
  it('panela nova com 1º cozimento → Daime 1º grau (Daime do Mestre)', () => {
    expect(calcularTipoTiragem(panelaComCozimento(1))).toEqual({ tipo: 'daime', grau: 1 });
  });

  it('panela nova com 2º cozimento → Daime 2º grau (sem histórico de Daime!)', () => {
    expect(calcularTipoTiragem(panelaComCozimento(2))).toEqual({ tipo: 'daime', grau: 2 });
  });

  it('panela com 3º cozimento → Daime 3º grau', () => {
    expect(calcularTipoTiragem(panelaComCozimento(3))).toEqual({ tipo: 'daime', grau: 3 });
  });

  it('panela com 4º cozimento → Daime 4º grau', () => {
    expect(calcularTipoTiragem(panelaComCozimento(4))).toEqual({ tipo: 'daime', grau: 4 });
  });

  it('panela com 5º cozimento (caso defensivo) → água forte (não existe 5º grau)', () => {
    expect(calcularTipoTiragem(panelaComCozimento(5))).toEqual({ tipo: 'agua_forte' });
  });

  it('panela com 6º cozimento (caso defensivo) → água forte', () => {
    expect(calcularTipoTiragem(panelaComCozimento(6))).toEqual({ tipo: 'agua_forte' });
  });
});

// ============================================================
// CICLO C — panela pós-Daime volta com água, produz cozimento ordem 1
// ============================================================
describe('panela pós-Daime realimentada com água', () => {
  it('panela que já deu Daime, agora com água → cozimento ordem 1 (mistura tonel 1º)', () => {
    const p = panelaComAgua([
      tiragem({ tipo: 'daime', grau: 1 }, 1, 18),
      tiragem({ tipo: 'daime', grau: 2 }, 2, 20),
      tiragem({ tipo: 'daime', grau: 3 }, 3, 22),
      tiragem({ tipo: 'daime', grau: 4 }, 4, 24)
    ]);
    expect(calcularTipoTiragem(p)).toEqual({ tipo: 'cozimento', ordem: 1 });
  });

  it('panela que já deu só 1º grau e foi para água — ainda assim produz cozimento 1', () => {
    const p = panelaComAgua([tiragem({ tipo: 'daime', grau: 1 }, 1, 18)]);
    expect(calcularTipoTiragem(p)).toEqual({ tipo: 'cozimento', ordem: 1 });
  });
});

// ============================================================
// CICLO D — emCicloAguaForte é "absorvente"
// ============================================================
describe('panela em ciclo de água forte', () => {
  it('flag emCicloAguaForte=true com água → água forte', () => {
    expect(calcularTipoTiragem(panelaComAgua([], true))).toEqual({ tipo: 'agua_forte' });
  });

  it('múltiplas tiragens consecutivas de água forte retornam água forte', () => {
    const p: Panela = {
      id: 'p1',
      numero: 1,
      conteudo: { tipo: 'agua' },
      emCicloAguaForte: true,
      tiragens: [
        tiragem({ tipo: 'agua_forte' }, 1),
        tiragem({ tipo: 'agua_forte' }, 2),
        tiragem({ tipo: 'agua_forte' }, 3)
      ]
    };
    expect(calcularTipoTiragem(p)).toEqual({ tipo: 'agua_forte' });
  });

  it('flag vence mesmo se conteúdo for cozimento (estado defensivo)', () => {
    const p: Panela = {
      id: 'p1',
      numero: 1,
      conteudo: { tipo: 'cozimento', ordem: 1 },
      emCicloAguaForte: true,
      tiragens: []
    };
    expect(calcularTipoTiragem(p)).toEqual({ tipo: 'agua_forte' });
  });
});

// ============================================================
// CICLO E — entradas inválidas
// ============================================================
describe('entradas inválidas', () => {
  it('panela sem conteúdo lança erro descritivo', () => {
    const p: Panela = {
      id: 'p1',
      numero: 1,
      conteudo: null,
      emCicloAguaForte: false,
      tiragens: []
    };
    expect(() => calcularTipoTiragem(p)).toThrow(/sem conte/i);
  });
});

// ============================================================
// CENÁRIO COMPLETO DO TUTORIAL — fluxo real quinta/sexta/sábado
// ============================================================
describe('cenário real do tutorial (feitio de exemplo)', () => {
  // Quinta: panelas 1 e 2 entram com água
  it('quinta 1ª tiragem (panelas 1/2 com água) → 1º cozimento', () => {
    expect(calcularTipoTiragem(panelaComAgua())).toEqual({ tipo: 'cozimento', ordem: 1 });
  });

  it('quinta 3ª tiragem → 3º cozimento', () => {
    const p = panelaComAgua([
      tiragem({ tipo: 'cozimento', ordem: 1 }, 1, 31),
      tiragem({ tipo: 'cozimento', ordem: 2 }, 2, 30)
    ]);
    expect(calcularTipoTiragem(p)).toEqual({ tipo: 'cozimento', ordem: 3 });
  });

  // Sexta: panela 3 (nova) alimentada com 1º cozimento do tonel
  it('sexta panela 3 nova com 1º cozimento → Daime 1º grau', () => {
    expect(calcularTipoTiragem(panelaComCozimento(1))).toEqual({ tipo: 'daime', grau: 1 });
  });

  // Sexta: panela 4 (nova) alimentada com 2º cozimento → Daime 2º grau direto
  it('sexta panela 4 nova com 2º cozimento → Daime 2º grau direto (regra chave do domínio)', () => {
    expect(calcularTipoTiragem(panelaComCozimento(2))).toEqual({ tipo: 'daime', grau: 2 });
  });

  // Sábado: panela 3 já deu 1º grau, volta ao fogo com 3º coz → Daime 3º grau
  it('panela 3 após 1º grau, com 3º cozimento → Daime 3º grau', () => {
    const p = panelaComCozimento(3, [tiragem({ tipo: 'daime', grau: 1 }, 1, 18)]);
    expect(calcularTipoTiragem(p)).toEqual({ tipo: 'daime', grau: 3 });
  });
});
