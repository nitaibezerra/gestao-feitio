/**
 * Projeção da fornalha — fold de eventos → estado atual.
 *
 * Entrada: lista ordenada (por `momento`) de eventos do feitio.
 * Saída: estado derivado com feitio, panelas, tonéis.
 *
 * Regras-chave:
 *   - tonéis são criados sob demanda quando aparecem como destino de tiragem
 *   - quando a panela entra no fogo com cozimento, desconta do tonel de origem
 *   - ao tirar água forte, a panela entra em emCicloAguaForte (flag absorvente)
 *   - eventos `evento_desfeito` removem o efeito do evento apontado
 */

import type { Evento } from '../events/tipos';
import type { Feitio } from '../entities/feitio';
import type { Panela, TipoConteudo } from '../entities/panela';
import type { Tonel, TipoTonel } from '../entities/tonel';

export type EstadoFornalha = {
  feitio: Feitio | null;
  panelas: Panela[];
  toneis: Tonel[];
};

export function projetarFornalha(eventos: Evento[]): EstadoFornalha {
  const estado: EstadoFornalha = { feitio: null, panelas: [], toneis: [] };

  const revertidos = new Set<string>(
    eventos
      .filter((e) => e.tipo === 'evento_desfeito')
      .map((e) => (e.tipo === 'evento_desfeito' ? e.payload.eventoRevertidoId : ''))
      .filter(Boolean)
  );

  for (const evento of eventos) {
    if (revertidos.has(evento.id)) continue;
    aplicarEvento(estado, evento);
  }

  return estado;
}

function aplicarEvento(estado: EstadoFornalha, evento: Evento): void {
  switch (evento.tipo) {
    case 'feitio_iniciado':
      estado.feitio = {
        id: evento.feitioId,
        nome: evento.payload.nome,
        feitor: evento.payload.feitor,
        foguista: evento.payload.foguista,
        casinha: evento.payload.casinha,
        qtdBocas: evento.payload.qtdBocas,
        inicio: new Date(evento.momento),
        status: 'em_andamento'
      };
      return;

    case 'feitio_encerrado':
      if (estado.feitio) {
        estado.feitio.fim = new Date(evento.momento);
        estado.feitio.status = 'encerrado';
      }
      return;

    case 'panela_montada':
      estado.panelas.push({
        id: evento.payload.panelaId,
        numero: evento.payload.numero,
        conteudo: null,
        emCicloAguaForte: false,
        tiragens: [],
        estado: 'montada',
        bocaAtual: null,
        volumeAtualL: 0,
        entradaFogoEm: null,
        tempoPausado: false
      });
      return;

    case 'panela_entra_fogo': {
      const p = buscarPanela(estado, evento.payload.panelaId);
      if (!p) return;
      p.conteudo = evento.payload.conteudo;
      p.volumeAtualL = evento.payload.volumeL;
      p.bocaAtual = evento.payload.bocaNumero;
      p.estado = 'no_fogo';
      p.entradaFogoEm = new Date(evento.momento);
      p.tempoPausado = false;
      p.encostadaDesde = null;
      if (evento.payload.metaTiragemL !== undefined) {
        p.metaTiragemL = evento.payload.metaTiragemL;
      }
      descontarTonelSeCozimento(estado, evento.payload.conteudo, evento.payload.volumeL);
      return;
    }

    case 'tiragem_registrada': {
      const p = buscarPanela(estado, evento.payload.panelaId);
      if (!p) return;
      p.tiragens.push({
        sequencia: p.tiragens.length + 1,
        tipo: evento.payload.tipoTiragem,
        volumeL: evento.payload.volumeL,
        momento: new Date(evento.momento)
      });
      p.volumeAtualL = Math.max(0, (p.volumeAtualL ?? 0) - evento.payload.volumeL);
      p.estado = 'aguardando_reposicao';
      if (evento.payload.tipoTiragem.tipo === 'agua_forte') {
        p.emCicloAguaForte = true;
      }
      depositarNoTonel(estado, evento.payload);
      return;
    }

    case 'reposicao_registrada': {
      const p = buscarPanela(estado, evento.payload.panelaId);
      if (!p) return;
      p.conteudo = evento.payload.conteudo;
      p.volumeAtualL = evento.payload.volumeL;
      p.estado = 'no_fogo';
      p.entradaFogoEm = new Date(evento.momento);
      descontarTonelSeCozimento(estado, evento.payload.conteudo, evento.payload.volumeL);
      return;
    }

    case 'volume_ajustado': {
      const p = buscarPanela(estado, evento.payload.panelaId);
      if (!p) return;
      p.volumeAtualL = (p.volumeAtualL ?? 0) + evento.payload.deltaL;
      return;
    }

    case 'tempo_pausado': {
      const p = buscarPanela(estado, evento.payload.panelaId);
      if (!p) return;
      p.tempoPausado = true;
      p.estado = 'fora_do_fogo';
      // Encostar libera a boca e marca o momento — outra panela pode ocupar.
      p.bocaAtual = null;
      p.encostadaDesde = new Date(evento.momento);
      return;
    }

    case 'tempo_retomado': {
      const p = buscarPanela(estado, evento.payload.panelaId);
      if (!p) return;
      p.tempoPausado = false;
      p.estado = 'no_fogo';
      p.encostadaDesde = null;
      return;
    }

    case 'troca_bocas': {
      const a = buscarPanela(estado, evento.payload.panelaAId);
      const b = buscarPanela(estado, evento.payload.panelaBId);
      if (!a || !b) return;
      const tmp = a.bocaAtual;
      a.bocaAtual = b.bocaAtual;
      b.bocaAtual = tmp;
      return;
    }

    case 'panela_descartada': {
      const p = buscarPanela(estado, evento.payload.panelaId);
      if (!p) return;
      p.estado = 'descartada';
      p.bocaAtual = null;
      return;
    }

    case 'panela_editada': {
      const p = buscarPanela(estado, evento.payload.panelaId);
      if (!p) return;
      const campos = evento.payload.campos;
      if (campos.numero !== undefined) p.numero = campos.numero;
      if (campos.volumeAtualL !== undefined) p.volumeAtualL = campos.volumeAtualL;
      if (campos.metaTiragemL !== undefined) p.metaTiragemL = campos.metaTiragemL;
      if (campos.entradaFogoEm !== undefined) {
        p.entradaFogoEm = new Date(campos.entradaFogoEm);
      }
      return;
    }

    case 'evento_desfeito':
      // já tratado no pré-filtro
      return;
  }
}

function buscarPanela(estado: EstadoFornalha, id: string): Panela | undefined {
  return estado.panelas.find((p) => p.id === id);
}

function depositarNoTonel(
  estado: EstadoFornalha,
  payload: Extract<Evento, { tipo: 'tiragem_registrada' }>['payload']
): void {
  let tonel = estado.toneis.find((t) => t.id === payload.tonelDestinoId);
  if (!tonel) {
    tonel = criarTonelParaTiragem(payload.tonelDestinoId, payload.tipoTiragem);
    estado.toneis.push(tonel);
  }
  tonel.volumeL += payload.volumeL;
}

function criarTonelParaTiragem(id: string, tipoTiragem: Extract<Evento, { tipo: 'tiragem_registrada' }>['payload']['tipoTiragem']): Tonel {
  if (tipoTiragem.tipo === 'cozimento') {
    return { id, tipo: 'cozimento', ordem: tipoTiragem.ordem, volumeL: 0 };
  }
  if (tipoTiragem.tipo === 'daime') {
    return { id, tipo: 'daime', grau: tipoTiragem.grau, volumeL: 0 };
  }
  return { id, tipo: 'agua_forte', volumeL: 0 };
}

function descontarTonelSeCozimento(
  estado: EstadoFornalha,
  conteudo: TipoConteudo,
  volumeL: number
): void {
  if (conteudo.tipo !== 'cozimento') return;
  const tonel = estado.toneis.find(
    (t) => t.tipo === ('cozimento' as TipoTonel) && t.ordem === conteudo.ordem
  );
  if (!tonel) return;
  tonel.volumeL = Math.max(0, tonel.volumeL - volumeL);
}
