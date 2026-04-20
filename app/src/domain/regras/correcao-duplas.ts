/**
 * Correção de duplas (RF-17) — sugere quantos litros tirar na próxima panela
 * da dupla para fechar a meta do tonel destino.
 *
 * Filosofia do feitor (tutorial §9.1):
 *   - "sobrar nunca é problema, faltar é problema"
 *   - mirar sempre um pouquinho a mais
 *   - corrigir dentro da própria dupla se der; senão, corrigir na rodada seguinte
 *
 * Esta função é puramente aritmética: divide o volume que falta pelas panelas
 * restantes da composição. Não tenta "mirar a mais" sozinha — quem faz isso
 * é o feitor ao configurar a meta do tonel (ex.: meta 62 L para panela de 60 L).
 */

export type EntradaCorrecao = {
  /** Volume alvo do tonel após todas as tiragens da dupla. */
  metaTonelL: number;
  /** Volumes já tirados pelas panelas anteriores desta composição. */
  tiragensAnteriores: number[];
  /** Total de panelas que compõem essa meta (padrão: dupla = 2). */
  totalPanelas?: number;
};

export type SugestaoCorrecao = {
  /** Quantos litros mirar na próxima tiragem. 0 se a meta já foi atingida. */
  sugestaoL: number;
  /** Quantos litros ainda faltam para atingir a meta (>= 0). */
  faltamL: number;
  /** Quantas panelas ainda vão tirar nesta composição (inclui a atual). */
  restantesPanelas: number;
  /** Se as tiragens anteriores já ultrapassaram a meta, quanto sobrou. */
  sobrouL?: number;
  /** Texto curto em português para exibir ao feitor. */
  justificativa: string;
};

export function sugerirCorrecaoDupla(entrada: EntradaCorrecao): SugestaoCorrecao {
  const { metaTonelL, tiragensAnteriores, totalPanelas = 2 } = entrada;

  if (metaTonelL < 0) {
    throw new Error(`meta do tonel não pode ser negativa (recebido ${metaTonelL})`);
  }
  if (tiragensAnteriores.length >= totalPanelas) {
    throw new Error(
      `número de tiragens anteriores (${tiragensAnteriores.length}) excede o total de panelas (${totalPanelas})`
    );
  }

  const somaAnteriores = tiragensAnteriores.reduce((s, v) => s + v, 0);
  const restantes = totalPanelas - tiragensAnteriores.length;

  if (somaAnteriores >= metaTonelL) {
    return {
      sugestaoL: 0,
      faltamL: 0,
      restantesPanelas: restantes,
      sobrouL: somaAnteriores - metaTonelL,
      justificativa:
        somaAnteriores > metaTonelL
          ? `já passou ${somaAnteriores - metaTonelL} L da meta (${metaTonelL} L); próxima pode tirar o que for`
          : `meta do tonel (${metaTonelL} L) já atingida pelas tiragens anteriores`
    };
  }

  const faltamL = metaTonelL - somaAnteriores;
  const sugestaoL = Math.round(faltamL / restantes);

  const justificativa =
    tiragensAnteriores.length === 0
      ? `meta ${metaTonelL} L dividida entre ${totalPanelas === 2 ? 'duas panelas' : `${totalPanelas} panelas`} — mire ${sugestaoL} L`
      : `tiragens anteriores: ${tiragensAnteriores.join(' + ')} = ${somaAnteriores} L. Faltam ${faltamL} L em ${restantes} panela${restantes > 1 ? 's' : ''} — mire ${sugestaoL} L`;

  return {
    sugestaoL,
    faltamL,
    restantesPanelas: restantes,
    justificativa
  };
}
