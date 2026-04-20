/**
 * Regra de nomenclatura automática da tiragem (RF-08).
 *
 * Calcula o tipo (cozimento N / daime grau N / água forte) a partir do
 * conteúdo atual da panela e do histórico de tiragens.
 *
 * Regras-chave (ver tutorial e projeto.md §4.3):
 *
 *   1. Ciclo de água forte é absorvente — uma vez dentro, sempre água forte.
 *
 *   2. Panela com água:
 *      - sem Daime no histórico → cozimento com ordem (qtd de cozimentos + 1),
 *        até ordem 6; acima disso transita para água forte.
 *      - com Daime no histórico → cozimento ordem 1 (mistura no tonel do 1º).
 *
 *   3. Panela com cozimento:
 *      - grau = ordem do cozimento que entrou na panela (regra explicita do
 *        tutorial: "a segunda panela nova, que entrou com o segundo cozimento,
 *        chamamos isso de segundo grau"). Ordem máxima para Daime é 4; acima
 *        disso transita para água forte.
 */

import type { GrauDaime, OrdemCozimento, Panela, TipoTiragem } from '../entities/panela';

const ORDEM_MAX_COZIMENTO: OrdemCozimento = 6;
const GRAU_MAX_DAIME: GrauDaime = 4;

export function calcularTipoTiragem(panela: Panela): TipoTiragem {
  if (panela.emCicloAguaForte) return { tipo: 'agua_forte' };

  const conteudo = panela.conteudo;
  if (!conteudo) throw new Error('Panela sem conteúdo — não há o que tirar');

  if (conteudo.tipo === 'agua') return daguaParaCozimentoOuAguaForte(panela);
  if (conteudo.tipo === 'cozimento') return deCozimentoParaDaimeOuAguaForte(conteudo.ordem);
  return { tipo: 'agua_forte' };
}

function daguaParaCozimentoOuAguaForte(panela: Panela): TipoTiragem {
  const jaDeuDaime = panela.tiragens.some((t) => t.tipo.tipo === 'daime');
  if (jaDeuDaime) return { tipo: 'cozimento', ordem: 1 };

  const qtdCoz = panela.tiragens.filter((t) => t.tipo.tipo === 'cozimento').length;
  const proxima = qtdCoz + 1;
  if (proxima > ORDEM_MAX_COZIMENTO) return { tipo: 'agua_forte' };
  return { tipo: 'cozimento', ordem: proxima as OrdemCozimento };
}

function deCozimentoParaDaimeOuAguaForte(ordem: OrdemCozimento): TipoTiragem {
  if (ordem > GRAU_MAX_DAIME) return { tipo: 'agua_forte' };
  return { tipo: 'daime', grau: ordem as GrauDaime };
}
