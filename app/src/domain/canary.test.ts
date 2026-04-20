import { describe, it, expect } from 'vitest';

/**
 * Canary de domínio — vale como "o Vitest roda em modo node/jsdom e o
 * caminho src/domain/ está coberto".
 * Qualquer commit na Fase 1 substitui este teste por testes reais.
 */
describe('canary de domínio', () => {
  it('soma dois números — só para validar setup', () => {
    expect(1 + 1).toBe(2);
  });
});
