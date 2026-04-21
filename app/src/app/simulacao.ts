/**
 * Simulação de teste — popula um feitio com estado rico para demo.
 *
 * Cenário:
 *   - Panelas 1 e 2 no fogo com água, cada uma já tirou 4 cozimentos.
 *     Próxima tiragem de ambas = 5º cozimento. Entrada no fogo visível
 *     ~1h30 atrás (momento da última reposição).
 *   - 4 tonéis de cozimento (1º a 4º) acumulados. Total de cada entre 59
 *     e 68 L, exceto o 1º que é fixado em 65 L para compor o cenário da
 *     panela 3 abaixo.
 *   - Panela 3 no fogo com 1º cozimento 60 L, prestes a tirar Daime 1º
 *     grau. Consome o 1º cozimento do tonel — sobram 5 L no tonel.
 *   - Panela 4 encostada com 30 L de 2º cozimento. Esses 30 L foram
 *     descontados do tonel de 2º cozimento via projeção automática.
 *
 * Usa apenas a API pública de comandos — zero acesso direto ao event log.
 */

import type { Comandos } from './comandos';

export type ResultadoSimulacao =
  | { ok: true; feitioId: string }
  | { ok: false; motivo: string };

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Divide um total em 2 valores com leve variação (dupla de panelas). */
function dividir(total: number): [number, number] {
  const metade = Math.floor(total / 2);
  const jitter = randomInt(-2, 2);
  const volP1 = metade + jitter;
  const volP2 = total - volP1;
  return [volP1, volP2];
}

export async function carregarSimulacao(
  comandos: Comandos,
  novoId: () => string
): Promise<ResultadoSimulacao> {
  const feitioId = novoId();
  const agora = Date.now();
  const horasAtras = (h: number): string =>
    new Date(agora - h * 3_600_000).toISOString();

  const r = await comandos.iniciarFeitio({
    feitioId,
    nome: 'Feitio de Demonstração',
    feitor: 'Tiago',
    foguista: 'Swidou',
    casinha: 'Casinha da Sede',
    qtdBocas: 5
  });
  if (!r.ok) return r;

  const p1 = novoId();
  const p2 = novoId();
  const p3 = novoId();
  const p4 = novoId();
  const toneisCoz = [novoId(), novoId(), novoId(), novoId()];

  // 1º tonel = 65 L fixo (panela 3 consome 60 → sobra 5)
  // Demais = aleatório entre 59 e 68
  const totais = [65, randomInt(59, 68), randomInt(59, 68), randomInt(59, 68)];

  // Panelas 1 e 2 entram no fogo com água
  await comandos.montarPanela({ feitioId, panelaId: p1, numero: 1 });
  await comandos.entrarNoFogo({
    feitioId,
    panelaId: p1,
    bocaNumero: 1,
    conteudo: { tipo: 'agua' },
    volumeL: 60,
    metaTiragemL: 30
  });
  await comandos.montarPanela({ feitioId, panelaId: p2, numero: 2 });
  await comandos.entrarNoFogo({
    feitioId,
    panelaId: p2,
    bocaNumero: 2,
    conteudo: { tipo: 'agua' },
    volumeL: 60,
    metaTiragemL: 30
  });

  // 4 ciclos de tiragem+reposição: geram tonéis do 1º ao 4º cozimento.
  // Próxima tiragem após isso = 5º cozimento.
  for (let i = 0; i < 4; i++) {
    const [volP1, volP2] = dividir(totais[i]);
    const tonelId = toneisCoz[i];

    await comandos.registrarTiragem({
      feitioId,
      panelaId: p1,
      volumeL: volP1,
      tonelDestinoId: tonelId
    });
    await comandos.registrarTiragem({
      feitioId,
      panelaId: p2,
      volumeL: volP2,
      tonelDestinoId: tonelId
    });
    await comandos.reporLiquido({
      feitioId,
      panelaId: p1,
      bocaNumero: 1,
      conteudo: { tipo: 'agua' },
      volumeL: 55
    });
    await comandos.reporLiquido({
      feitioId,
      panelaId: p2,
      bocaNumero: 2,
      conteudo: { tipo: 'agua' },
      volumeL: 55
    });
  }

  // Mostra as panelas "há ~1h30" no fogo (desde a última reposição)
  await comandos.editarPanela({
    feitioId,
    panelaId: p1,
    campos: { entradaFogoEm: horasAtras(1.5) }
  });
  await comandos.editarPanela({
    feitioId,
    panelaId: p2,
    campos: { entradaFogoEm: horasAtras(1.5) }
  });

  // Panela 3 — nova, alimentada com 1º cozimento (60 L).
  // Consome 60 do tonel 1º (projeção subtrai automaticamente). Fica com 5 L.
  // Próxima tiragem dela = Daime 1º grau.
  await comandos.montarPanela({ feitioId, panelaId: p3, numero: 3 });
  await comandos.entrarNoFogo({
    feitioId,
    panelaId: p3,
    bocaNumero: 3,
    conteudo: { tipo: 'cozimento', ordem: 1 },
    volumeL: 60,
    metaTiragemL: 20
  });
  await comandos.editarPanela({
    feitioId,
    panelaId: p3,
    campos: { entradaFogoEm: horasAtras(0.5) }
  });

  // Panela 4 — alimentada com 30 L de 2º cozimento (tonel 2º perde 30)
  // e imediatamente encostada, entrando na seção "Panelas encostadas".
  await comandos.montarPanela({ feitioId, panelaId: p4, numero: 4 });
  await comandos.entrarNoFogo({
    feitioId,
    panelaId: p4,
    bocaNumero: 4,
    conteudo: { tipo: 'cozimento', ordem: 2 },
    volumeL: 30,
    metaTiragemL: 15
  });
  await comandos.pausar({ feitioId, panelaId: p4 });

  return { ok: true, feitioId };
}
