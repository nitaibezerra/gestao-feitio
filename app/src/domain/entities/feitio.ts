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
  /**
   * Encarregado — papel assumido quando o feitor está ausente.
   * Visível apenas quando `feitorAusente === true`.
   */
  encarregado?: string;
  /**
   * Marca que o feitor titular não está presente. UI exibe "(ausente)"
   * ao lado do nome e mostra o encarregado na linha abaixo.
   */
  feitorAusente?: boolean;
};
