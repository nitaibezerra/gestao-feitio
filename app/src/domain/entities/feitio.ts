/**
 * Feitio — uma realização individual do trabalho de produção do Daime.
 */

export type StatusFeitio = 'em_preparo' | 'em_andamento' | 'encerrado';

export type Feitio = {
  id: string;
  nome: string;
  feitor: string;
  foguista?: string;
  casinha?: string;
  qtdBocas: number;
  inicio: Date;
  fim?: Date | null;
  status: StatusFeitio;
};
