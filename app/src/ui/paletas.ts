/**
 * Paletas da família "Luz Branca" — identidade visual oficial do produto.
 *
 * Todas são variações claras do mesmo sistema (fundo papel + azul ou verde
 * firmamento + auroras suaves ao fundo). A base (fundo, cinzas, tinta)
 * não muda. O que muda é a cor dominante de ação e as auroras radiais.
 *
 * Referência: design/project/Gestao de Feitio.html linhas 82-87.
 */

export type Paleta = {
  nome: string;
  sub: string;
  azul: string;
  azulClaro: string;
  azulProfundo: string;
  auraTop: string;
  auraBottom: string;
};

export const PALETAS = {
  'luz-branca': {
    nome: 'Luz Branca',
    sub: 'azul sobre papel',
    azul: '#6b8cb8',
    azulClaro: '#b8cce0',
    azulProfundo: '#3a5a82',
    auraTop: 'rgba(184,204,224,0.28)',
    auraBottom: 'rgba(184,204,224,0.08)'
  },
  'luz-mata': {
    nome: 'Luz & Mata',
    sub: 'verde folha + papel',
    azul: '#7ba88c',
    azulClaro: '#c6dcc8',
    azulProfundo: '#4a7a5a',
    auraTop: 'rgba(123,168,140,0.22)',
    auraBottom: 'rgba(184,204,224,0.08)'
  },
  'luz-firmamento': {
    nome: 'Firmamento',
    sub: 'azul profundo, firmeza',
    azul: '#4a7ab0',
    azulClaro: '#a8c0de',
    azulProfundo: '#2d4a70',
    auraTop: 'rgba(107,140,184,0.28)',
    auraBottom: 'rgba(184,204,224,0.10)'
  },
  'luz-rainha': {
    nome: 'Rainha',
    sub: 'verde luz, branco puro',
    azul: '#8bb062',
    azulClaro: '#c8d8b2',
    azulProfundo: '#5a7a3e',
    auraTop: 'rgba(168,200,150,0.20)',
    auraBottom: 'rgba(223,232,210,0.14)'
  }
} as const satisfies Record<string, Paleta>;

export type PaletaKey = keyof typeof PALETAS;

const PROPRIEDADES = [
  ['--azul', 'azul'],
  ['--azul-claro', 'azulClaro'],
  ['--azul-profundo', 'azulProfundo'],
  ['--aura-top', 'auraTop'],
  ['--aura-bottom', 'auraBottom']
] as const;

export function aplicarPaleta(key: PaletaKey): void {
  const pal = (PALETAS as Record<string, Paleta>)[key] ?? PALETAS['luz-branca'];
  const s = document.documentElement.style;
  for (const [css, prop] of PROPRIEDADES) {
    s.setProperty(css, pal[prop]);
  }
}
