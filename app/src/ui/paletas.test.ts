import { describe, it, expect, beforeEach } from 'vitest';
import { PALETAS, aplicarPaleta, type PaletaKey } from './paletas';

describe('PALETAS', () => {
  it('contém as 5 paletas do design', () => {
    const keys = Object.keys(PALETAS);
    expect(keys).toEqual([
      'fogo',
      'daime-mata',
      'daime-firmamento',
      'daime-cruzeiro',
      'daime-rainha'
    ]);
  });

  it('cada paleta tem nome, subtitulo, fire, fireGlow, ember, bgTop, bgBottom', () => {
    for (const key of Object.keys(PALETAS) as PaletaKey[]) {
      const p = PALETAS[key];
      expect(p.nome).toBeTypeOf('string');
      expect(p.subtitulo).toBeTypeOf('string');
      expect(p.fire).toMatch(/^oklch/);
      expect(p.fireGlow).toMatch(/^oklch/);
      expect(p.ember).toMatch(/^oklch/);
      expect(p.bgTop).toMatch(/^oklch/);
      expect(p.bgBottom).toMatch(/^oklch/);
    }
  });

  it('paleta "daime-rainha" tem nome "Rainha da Floresta"', () => {
    expect(PALETAS['daime-rainha'].nome).toBe('Rainha da Floresta');
  });
});

describe('aplicarPaleta', () => {
  beforeEach(() => {
    // limpar custom props
    const s = document.documentElement.style;
    [
      '--fire', '--fire-glow', '--ember',
      '--fire-soft-04', '--fire-soft-08', '--fire-soft-25', '--fire-soft-30',
      '--fire-glow-soft-35',
      '--ember-soft-08', '--ember-soft-12', '--ember-soft-15', '--ember-soft-25',
      '--bg-aura-1', '--bg-aura-2'
    ].forEach(p => s.removeProperty(p));
  });

  it('aplica --fire da paleta escolhida em document.documentElement', () => {
    aplicarPaleta('daime-rainha');
    expect(document.documentElement.style.getPropertyValue('--fire'))
      .toBe(PALETAS['daime-rainha'].fire);
  });

  it('aplica --ember e --fire-glow', () => {
    aplicarPaleta('daime-firmamento');
    const s = document.documentElement.style;
    expect(s.getPropertyValue('--fire-glow')).toBe(PALETAS['daime-firmamento'].fireGlow);
    expect(s.getPropertyValue('--ember')).toBe(PALETAS['daime-firmamento'].ember);
  });

  it('aplica as 9 variantes soft (color-mix com alpha)', () => {
    aplicarPaleta('fogo');
    const s = document.documentElement.style;
    for (const prop of [
      '--fire-soft-04', '--fire-soft-08', '--fire-soft-25', '--fire-soft-30',
      '--fire-glow-soft-35',
      '--ember-soft-08', '--ember-soft-12', '--ember-soft-15', '--ember-soft-25'
    ]) {
      expect(s.getPropertyValue(prop)).toMatch(/color-mix/);
    }
  });

  it('aplica auroras de fundo (--bg-aura-1 e --bg-aura-2)', () => {
    aplicarPaleta('daime-cruzeiro');
    const s = document.documentElement.style;
    expect(s.getPropertyValue('--bg-aura-1')).toBe(PALETAS['daime-cruzeiro'].bgTop);
    expect(s.getPropertyValue('--bg-aura-2')).toBe(PALETAS['daime-cruzeiro'].bgBottom);
  });

  it('chamar com paleta inválida não explode — aplica fogo por fallback', () => {
    aplicarPaleta('inexistente' as PaletaKey);
    const s = document.documentElement.style;
    expect(s.getPropertyValue('--fire')).toBe(PALETAS['fogo'].fire);
  });
});
