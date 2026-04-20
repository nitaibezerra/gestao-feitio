/**
 * Paletas do design Gestão de Feitio — 5 opções do universo Daime.
 * Base (fundo, cinzas) não muda. O que muda é a matiz do "fogo/brasa/ember"
 * e as auroras de fundo.
 *
 * Referência: design/project/Gestao de Feitio.html linhas 102-148
 */

export type Paleta = {
  nome: string;
  subtitulo: string;
  bgTop: string;
  bgBottom: string;
  fire: string;
  fireGlow: string;
  ember: string;
};

export const PALETAS = {
  'fogo': {
    nome: 'Fogo & Brasa',
    subtitulo: 'o feitio no fogo',
    bgTop: 'oklch(0.62 0.17 40 / 0.08)',
    bgBottom: 'oklch(0.55 0.08 230 / 0.05)',
    fire: 'oklch(0.62 0.17 40)',
    fireGlow: 'oklch(0.72 0.16 45)',
    ember: 'oklch(0.78 0.15 75)'
  },
  'daime-mata': {
    nome: 'Mata verde',
    subtitulo: 'verde da mata + azul firmamento',
    bgTop: 'oklch(0.55 0.14 155 / 0.09)',
    bgBottom: 'oklch(0.55 0.12 230 / 0.07)',
    fire: 'oklch(0.52 0.13 155)',
    fireGlow: 'oklch(0.68 0.15 155)',
    ember: 'oklch(0.82 0.09 210)'
  },
  'daime-firmamento': {
    nome: 'Firmamento',
    subtitulo: 'azul profundo + branco',
    bgTop: 'oklch(0.50 0.13 245 / 0.10)',
    bgBottom: 'oklch(0.60 0.08 180 / 0.05)',
    fire: 'oklch(0.48 0.14 245)',
    fireGlow: 'oklch(0.65 0.15 235)',
    ember: 'oklch(0.92 0.02 230)'
  },
  'daime-cruzeiro': {
    nome: 'Cruzeiro',
    subtitulo: 'verde, azul e branco juntos',
    bgTop: 'oklch(0.55 0.13 160 / 0.08)',
    bgBottom: 'oklch(0.50 0.13 245 / 0.08)',
    fire: 'oklch(0.50 0.14 160)',
    fireGlow: 'oklch(0.55 0.15 235)',
    ember: 'oklch(0.94 0.02 200)'
  },
  'daime-rainha': {
    nome: 'Rainha da Floresta',
    subtitulo: 'verde claro + branco luz',
    bgTop: 'oklch(0.62 0.14 145 / 0.10)',
    bgBottom: 'oklch(0.82 0.04 180 / 0.04)',
    fire: 'oklch(0.58 0.15 145)',
    fireGlow: 'oklch(0.75 0.17 140)',
    ember: 'oklch(0.95 0.03 160)'
  }
} as const satisfies Record<string, Paleta>;

export type PaletaKey = keyof typeof PALETAS;

const SOFT_ALPHAS = {
  '--fire-soft-04': { color: 'fire', alpha: 4 },
  '--fire-soft-08': { color: 'fire', alpha: 8 },
  '--fire-soft-25': { color: 'fire', alpha: 25 },
  '--fire-soft-30': { color: 'fire', alpha: 30 },
  '--fire-glow-soft-35': { color: 'fireGlow', alpha: 35 },
  '--ember-soft-08': { color: 'ember', alpha: 8 },
  '--ember-soft-12': { color: 'ember', alpha: 12 },
  '--ember-soft-15': { color: 'ember', alpha: 15 },
  '--ember-soft-25': { color: 'ember', alpha: 25 }
} as const;

/**
 * Aplica uma paleta ao :root via CSS custom properties.
 * Paletas inválidas caem em 'fogo' (fallback seguro).
 */
export function aplicarPaleta(key: PaletaKey): void {
  const pal = (PALETAS as Record<string, Paleta>)[key] ?? PALETAS['fogo'];
  const s = document.documentElement.style;

  s.setProperty('--fire', pal.fire);
  s.setProperty('--fire-glow', pal.fireGlow);
  s.setProperty('--ember', pal.ember);

  for (const [prop, { color, alpha }] of Object.entries(SOFT_ALPHAS)) {
    s.setProperty(
      prop,
      `color-mix(in oklab, ${pal[color as keyof Paleta]} ${alpha}%, transparent)`
    );
  }

  s.setProperty('--bg-aura-1', pal.bgTop);
  s.setProperty('--bg-aura-2', pal.bgBottom);
}
