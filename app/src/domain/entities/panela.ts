/**
 * Entidade Panela — objeto central do domínio.
 * Mapeamento direto para termos do feitio (ver tutorial e requisitos).
 */

export type EstadoPanela =
  | 'montada'
  | 'no_fogo'
  | 'fora_do_fogo'
  | 'aguardando_reposicao'
  | 'descartada';

export type OrdemCozimento = 1 | 2 | 3 | 4 | 5 | 6;
export type GrauDaime = 1 | 2 | 3 | 4;

export type TipoConteudo =
  | { tipo: 'agua' }
  | { tipo: 'cozimento'; ordem: OrdemCozimento }
  | { tipo: 'agua_forte' };

export type TipoTiragem =
  | { tipo: 'cozimento'; ordem: OrdemCozimento }
  | { tipo: 'daime'; grau: GrauDaime }
  | { tipo: 'agua_forte' };

export type Tiragem = {
  sequencia: number;
  tipo: TipoTiragem;
  volumeL: number;
  momento: Date;
};

export type Panela = {
  id: string;
  numero: number;
  conteudo: TipoConteudo | null;
  /**
   * Uma vez em ciclo de água forte, toda tiragem é água forte.
   * A panela continua voltando ao fogo (sempre com água) até ser descartada.
   */
  emCicloAguaForte: boolean;
  tiragens: Tiragem[];
  estado?: EstadoPanela;
  bocaAtual?: number | null;
  volumeAtualL?: number;
  entradaFogoEm?: Date | null;
  tempoPausado?: boolean;
  /**
   * Meta de tiragem informada pelo feitor no momento em que a panela entrou no
   * fogo. Opcional — quando ausente, UI cai em heurística.
   */
  metaTiragemL?: number;
  /**
   * Momento do último `tempo_pausado`; limpo em `tempo_retomado` ou em nova
   * entrada no fogo. Usado para exibir há quanto tempo uma panela está
   * encostada.
   */
  encostadaDesde?: Date | null;
};
