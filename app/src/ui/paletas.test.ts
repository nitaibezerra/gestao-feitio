import { describe, it, expect, beforeEach } from 'vitest';
import { PALETAS, aplicarPaleta, type PaletaKey } from './paletas';

/**
 * Paletas da família "Luz Branca" — todas são variações claras do
 * mesmo sistema: azul dominante + auroras sutis de fundo.
 * (design/project/Gestao de Feitio.html linhas 82-87)
 */

describe('PALETAS', () => {
  it('contém as 4 paletas da família Luz Branca', () => {
    expect(Object.keys(PALETAS)).toEqual([
      'luz-branca',
      'luz-mata',
      'luz-firmamento',
      'luz-rainha'
    ]);
  });

  it('cada paleta tem nome, sub, azul, azulClaro, azulProfundo, auraTop, auraBottom', () => {
    for (const key of Object.keys(PALETAS) as PaletaKey[]) {
      const p = PALETAS[key];
      expect(p.nome).toBeTypeOf('string');
      expect(p.sub).toBeTypeOf('string');
      expect(p.azul).toMatch(/^#/);
      expect(p.azulClaro).toMatch(/^#/);
      expect(p.azulProfundo).toMatch(/^#/);
      expect(p.auraTop).toMatch(/^rgba\(/);
      expect(p.auraBottom).toMatch(/^rgba\(/);
    }
  });

  it('"luz-rainha" tem nome "Rainha" (padrão do produto)', () => {
    expect(PALETAS['luz-rainha'].nome).toBe('Rainha');
  });

  it('"luz-branca" tem azul firmamento #6b8cb8', () => {
    expect(PALETAS['luz-branca'].azul).toBe('#6b8cb8');
  });

  it('"luz-mata" usa verde folha', () => {
    expect(PALETAS['luz-mata'].azul).toBe('#7ba88c');
  });
});

describe('aplicarPaleta', () => {
  const PROPRIEDADES = [
    '--azul',
    '--azul-claro',
    '--azul-profundo',
    '--aura-top',
    '--aura-bottom'
  ] as const;

  beforeEach(() => {
    const s = document.documentElement.style;
    PROPRIEDADES.forEach((p) => s.removeProperty(p));
  });

  it('aplica --azul da paleta escolhida', () => {
    aplicarPaleta('luz-rainha');
    expect(document.documentElement.style.getPropertyValue('--azul')).toBe(
      PALETAS['luz-rainha'].azul
    );
  });

  it('aplica --azul-claro e --azul-profundo', () => {
    aplicarPaleta('luz-firmamento');
    const s = document.documentElement.style;
    expect(s.getPropertyValue('--azul-claro')).toBe(PALETAS['luz-firmamento'].azulClaro);
    expect(s.getPropertyValue('--azul-profundo')).toBe(PALETAS['luz-firmamento'].azulProfundo);
  });

  it('aplica auroras --aura-top e --aura-bottom', () => {
    aplicarPaleta('luz-mata');
    const s = document.documentElement.style;
    expect(s.getPropertyValue('--aura-top')).toBe(PALETAS['luz-mata'].auraTop);
    expect(s.getPropertyValue('--aura-bottom')).toBe(PALETAS['luz-mata'].auraBottom);
  });

  it('paleta inválida cai em "luz-branca" (fallback)', () => {
    aplicarPaleta('inexistente' as PaletaKey);
    expect(document.documentElement.style.getPropertyValue('--azul')).toBe(
      PALETAS['luz-branca'].azul
    );
  });
});
