/**
 * Tonel — balde grande que armazena líquido tirado das panelas.
 * Tipos: cozimento (com ordem 1-6), daime (com grau 1-4), agua_forte,
 * apuracao, mel_dagua.
 */

export type TipoTonel = 'cozimento' | 'daime' | 'agua_forte' | 'apuracao' | 'mel_dagua';

export type Tonel = {
  id: string;
  tipo: TipoTonel;
  ordem?: number; // só para cozimento
  grau?: number; // só para daime
  volumeL: number;
};
