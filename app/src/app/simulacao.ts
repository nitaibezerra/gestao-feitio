/**
 * Simulação de teste — popula um feitio com estado rico para demo.
 *
 * Cria um cenário que exercita as seções visuais da UI:
 *   - Fornalha: 2 panelas no fogo com algumas horas acumuladas
 *   - Biqueira: 1 panela tirada aguardando reposição
 *   - Panelas encostadas: 1 panela fora do fogo
 *   - Tonéis: 1º cozimento com líquido acumulado
 *
 * Usa apenas os comandos públicos — não toca diretamente no event log.
 * As horas de entrada no fogo são ajustadas via `editarPanela` para
 * simular que o feitio já está em andamento há horas.
 */

import type { Comandos } from './comandos';

export type ResultadoSimulacao =
  | { ok: true; feitioId: string }
  | { ok: false; motivo: string };

export async function carregarSimulacao(
  comandos: Comandos,
  novoId: () => string
): Promise<ResultadoSimulacao> {
  const agora = Date.now();
  const horasAtras = (h: number): string => new Date(agora - h * 3600 * 1000).toISOString();

  const feitioId = novoId();

  const r = await comandos.iniciarFeitio({
    feitioId,
    nome: 'Feitio de Demonstração',
    feitor: 'Tiago',
    foguista: 'Cícero',
    casinha: 'Casinha da Sede',
    qtdBocas: 5
  });
  if (!r.ok) return r;

  const p1 = novoId();
  const p2 = novoId();
  const p3 = novoId();
  const p4 = novoId();
  const tonelCoz1 = novoId();

  // Panela 1 — boca 1, água 60L, 2h de fogo.
  await comandos.montarPanela({ feitioId, panelaId: p1, numero: 1 });
  await comandos.entrarNoFogo({
    feitioId,
    panelaId: p1,
    bocaNumero: 1,
    conteudo: { tipo: 'agua' },
    volumeL: 60,
    metaTiragemL: 30
  });
  await comandos.editarPanela({
    feitioId,
    panelaId: p1,
    campos: { entradaFogoEm: horasAtras(2) }
  });

  // Panela 2 — boca 2, água 58L, 1h30 de fogo.
  await comandos.montarPanela({ feitioId, panelaId: p2, numero: 2 });
  await comandos.entrarNoFogo({
    feitioId,
    panelaId: p2,
    bocaNumero: 2,
    conteudo: { tipo: 'agua' },
    volumeL: 58,
    metaTiragemL: 30
  });
  await comandos.editarPanela({
    feitioId,
    panelaId: p2,
    campos: { entradaFogoEm: horasAtras(1.5) }
  });

  // Panela 3 — já tirou 1º cozimento 30L, agora está na biqueira.
  await comandos.montarPanela({ feitioId, panelaId: p3, numero: 3 });
  await comandos.entrarNoFogo({
    feitioId,
    panelaId: p3,
    bocaNumero: 3,
    conteudo: { tipo: 'agua' },
    volumeL: 60,
    metaTiragemL: 30
  });
  await comandos.registrarTiragem({
    feitioId,
    panelaId: p3,
    volumeL: 30,
    tonelDestinoId: tonelCoz1
  });

  // Panela 4 — entrou e foi encostada (demonstra seção "Panelas encostadas").
  await comandos.montarPanela({ feitioId, panelaId: p4, numero: 4 });
  await comandos.entrarNoFogo({
    feitioId,
    panelaId: p4,
    bocaNumero: 4,
    conteudo: { tipo: 'agua' },
    volumeL: 55,
    metaTiragemL: 30
  });
  await comandos.editarPanela({
    feitioId,
    panelaId: p4,
    campos: { entradaFogoEm: horasAtras(1) }
  });
  await comandos.pausar({ feitioId, panelaId: p4 });

  return { ok: true, feitioId };
}
