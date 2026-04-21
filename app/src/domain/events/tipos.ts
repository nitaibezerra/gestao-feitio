/**
 * Eventos de domínio — fonte única da verdade no event sourcing.
 * Append-only, imutáveis. Estado é projetado a partir deles.
 */

import type { TipoConteudo, TipoTiragem } from '../entities/panela';

export type TipoEvento =
  | 'feitio_iniciado'
  | 'feitio_editado'
  | 'panela_montada'
  | 'panela_entra_fogo'
  | 'panela_retirada_fogo'
  | 'panela_editada'
  | 'tiragem_registrada'
  | 'reposicao_registrada'
  | 'volume_ajustado'
  | 'tempo_pausado'
  | 'tempo_retomado'
  | 'troca_bocas'
  | 'panela_descartada'
  | 'evento_desfeito'
  | 'feitio_encerrado';

// ----- Payloads por tipo -----
export type PayloadFeitioIniciado = {
  nome: string;
  feitor: string;
  foguista?: string;
  casinha?: string;
  qtdBocas: number;
};
export type PayloadPanelaMontada = { panelaId: string; numero: number };
export type PayloadPanelaEntraFogo = {
  panelaId: string;
  bocaNumero: number;
  conteudo: TipoConteudo;
  volumeL: number;
  /**
   * Meta de tiragem em litros — quanto o feitor planeja tirar desta entrada.
   * Opcional (retrocompatibilidade): projeção usa heurística `volume/2`
   * quando ausente.
   */
  metaTiragemL?: number;
};
export type PayloadTiragemRegistrada = {
  panelaId: string;
  volumeL: number;
  tonelDestinoId: string;
  tipoTiragem: TipoTiragem;
};
export type PayloadReposicaoRegistrada = {
  panelaId: string;
  conteudo: TipoConteudo;
  volumeL: number;
  /**
   * Boca em que a panela volta ao fogo após a reposição. Opcional para
   * retrocompatibilidade com eventos antigos gravados antes da Fase 8 (quando
   * a panela nunca liberava a boca ao tirar). Nos novos eventos é obrigatório
   * porque `tiragem_registrada` agora solta a boca.
   */
  bocaNumero?: number;
};
export type PayloadVolumeAjustado = { panelaId: string; deltaL: number };
export type PayloadPanelaSimples = { panelaId: string };
export type PayloadTrocaBocas = { panelaAId: string; panelaBId: string };
export type PayloadEventoDesfeito = { eventoRevertidoId: string };

/**
 * Payload de `panela_editada` — append-only. `campos` registra apenas o que
 * mudou; pelo menos um campo obrigatório (validar não vazio).
 */
export type PayloadPanelaEditada = {
  panelaId: string;
  campos: {
    numero?: number;
    volumeAtualL?: number;
    metaTiragemL?: number;
    entradaFogoEm?: string; // ISO datetime
  };
};

/**
 * Payload de `feitio_editado` — mesma forma append-only de `panela_editada`.
 * `campos` registra apenas o que mudou.
 *   - `foguista` com string vazia significa **limpar** (remove o foguista).
 *   - `encarregado` com string vazia significa **limpar**.
 *   - `feitorAusente` liga/desliga a sinalização de ausência do feitor.
 */
export type PayloadFeitioEditado = {
  campos: {
    foguista?: string;
    encarregado?: string;
    feitorAusente?: boolean;
  };
};

// ----- Evento (união discriminada) -----
export type EventoBase = {
  id: string;
  feitioId: string;
  momento: string; // ISO datetime
  versao: number;
};

export type Evento = EventoBase &
  (
    | { tipo: 'feitio_iniciado'; payload: PayloadFeitioIniciado }
    | { tipo: 'feitio_editado'; payload: PayloadFeitioEditado }
    | { tipo: 'panela_montada'; payload: PayloadPanelaMontada }
    | { tipo: 'panela_entra_fogo'; payload: PayloadPanelaEntraFogo }
    | { tipo: 'panela_retirada_fogo'; payload: PayloadPanelaSimples }
    | { tipo: 'panela_editada'; payload: PayloadPanelaEditada }
    | { tipo: 'tiragem_registrada'; payload: PayloadTiragemRegistrada }
    | { tipo: 'reposicao_registrada'; payload: PayloadReposicaoRegistrada }
    | { tipo: 'volume_ajustado'; payload: PayloadVolumeAjustado }
    | { tipo: 'tempo_pausado'; payload: PayloadPanelaSimples }
    | { tipo: 'tempo_retomado'; payload: PayloadPanelaSimples }
    | { tipo: 'troca_bocas'; payload: PayloadTrocaBocas }
    | { tipo: 'panela_descartada'; payload: PayloadPanelaSimples }
    | { tipo: 'evento_desfeito'; payload: PayloadEventoDesfeito }
    | { tipo: 'feitio_encerrado'; payload: Record<string, never> }
  );

// ----- Factory -----
export type NovoEvento = {
  [T in Evento['tipo']]: { tipo: T; payload: Extract<Evento, { tipo: T }>['payload'] };
}[Evento['tipo']];

export function criarEvento(feitioId: string, novo: NovoEvento): Evento {
  return {
    id: geradorId(),
    feitioId,
    momento: new Date().toISOString(),
    versao: 1,
    ...novo
  } as Evento;
}

function geradorId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// ----- Validação -----
export type ResultadoValidacao = { ok: true } | { ok: false; erros: string[] };

const TIPOS_VALIDOS = new Set<TipoEvento>([
  'feitio_iniciado',
  'feitio_editado',
  'panela_montada',
  'panela_entra_fogo',
  'panela_retirada_fogo',
  'panela_editada',
  'tiragem_registrada',
  'reposicao_registrada',
  'volume_ajustado',
  'tempo_pausado',
  'tempo_retomado',
  'troca_bocas',
  'panela_descartada',
  'evento_desfeito',
  'feitio_encerrado'
]);

export function validarEvento(evento: Evento): ResultadoValidacao {
  const erros: string[] = [];

  if (!evento.id) erros.push('id obrigatório');
  if (!evento.feitioId) erros.push('feitioId obrigatório');
  if (!evento.momento || Number.isNaN(new Date(evento.momento).getTime())) {
    erros.push('momento inválido (esperado ISO datetime)');
  }
  if (!TIPOS_VALIDOS.has(evento.tipo)) {
    erros.push(`tipo desconhecido: ${String(evento.tipo)}`);
    return { ok: false, erros };
  }

  erros.push(...validarPayload(evento));

  return erros.length === 0 ? { ok: true } : { ok: false, erros };
}

function validarPayload(evento: Evento): string[] {
  const erros: string[] = [];
  const p = evento.payload as Record<string, unknown>;

  switch (evento.tipo) {
    case 'feitio_iniciado': {
      const payload = evento.payload;
      if (!payload.nome) erros.push('feitio_iniciado: nome obrigatório');
      if (!payload.feitor) erros.push('feitio_iniciado: feitor obrigatório');
      if (!(payload.qtdBocas > 0)) erros.push('feitio_iniciado: qtdBocas deve ser > 0');
      break;
    }
    case 'feitio_editado': {
      const payload = evento.payload;
      if (!payload.campos || typeof payload.campos !== 'object') {
        erros.push('feitio_editado: campos obrigatório');
        break;
      }
      const campos = payload.campos;
      const chaves = Object.keys(campos);
      if (chaves.length === 0) {
        erros.push('feitio_editado: nada para editar');
      }
      if (campos.feitorAusente !== undefined && typeof campos.feitorAusente !== 'boolean') {
        erros.push('feitio_editado: feitorAusente deve ser boolean');
      }
      if (campos.foguista !== undefined && typeof campos.foguista !== 'string') {
        erros.push('feitio_editado: foguista deve ser string');
      }
      if (campos.encarregado !== undefined && typeof campos.encarregado !== 'string') {
        erros.push('feitio_editado: encarregado deve ser string');
      }
      break;
    }
    case 'panela_montada': {
      if (!p.panelaId) erros.push('panela_montada: panelaId obrigatório');
      if (typeof p.numero !== 'number' || p.numero <= 0) {
        erros.push('panela_montada: numero deve ser > 0');
      }
      break;
    }
    case 'panela_entra_fogo': {
      const payload = evento.payload;
      if (!payload.panelaId) erros.push('panela_entra_fogo: panelaId obrigatório');
      if (!(payload.bocaNumero > 0)) erros.push('panela_entra_fogo: bocaNumero deve ser > 0');
      if (!payload.conteudo) erros.push('panela_entra_fogo: conteudo obrigatório');
      if (!(payload.volumeL >= 0)) erros.push('panela_entra_fogo: volumeL deve ser >= 0');
      if (payload.metaTiragemL !== undefined && !(payload.metaTiragemL >= 0)) {
        erros.push('panela_entra_fogo: metaTiragemL deve ser >= 0');
      }
      break;
    }
    case 'tiragem_registrada': {
      const payload = evento.payload;
      if (!payload.panelaId) erros.push('tiragem_registrada: panelaId obrigatório');
      if (!(payload.volumeL >= 0)) erros.push('tiragem_registrada: volume deve ser >= 0');
      if (!payload.tonelDestinoId) erros.push('tiragem_registrada: tonelDestinoId obrigatório');
      if (!payload.tipoTiragem) erros.push('tiragem_registrada: tipoTiragem obrigatório');
      break;
    }
    case 'reposicao_registrada': {
      const payload = evento.payload;
      if (!payload.panelaId) erros.push('reposicao_registrada: panelaId obrigatório');
      if (!payload.conteudo) erros.push('reposicao_registrada: conteudo obrigatório');
      if (!(payload.volumeL >= 0)) erros.push('reposicao_registrada: volumeL deve ser >= 0');
      if (payload.bocaNumero !== undefined && !(payload.bocaNumero > 0)) {
        erros.push('reposicao_registrada: bocaNumero deve ser > 0');
      }
      break;
    }
    case 'volume_ajustado': {
      if (!p.panelaId) erros.push('volume_ajustado: panelaId obrigatório');
      if (typeof p.deltaL !== 'number') erros.push('volume_ajustado: deltaL numérico obrigatório');
      break;
    }
    case 'tempo_pausado':
    case 'tempo_retomado':
    case 'panela_retirada_fogo':
    case 'panela_descartada': {
      if (!p.panelaId) erros.push(`${evento.tipo}: panelaId obrigatório`);
      break;
    }
    case 'panela_editada': {
      const payload = evento.payload;
      if (!payload.panelaId) erros.push('panela_editada: panelaId obrigatório');
      if (!payload.campos || typeof payload.campos !== 'object') {
        erros.push('panela_editada: campos obrigatório');
        break;
      }
      const campos = payload.campos;
      const chaves = Object.keys(campos);
      if (chaves.length === 0) {
        erros.push('panela_editada: ao menos um campo precisa mudar');
      }
      if (campos.numero !== undefined && !(campos.numero > 0)) {
        erros.push('panela_editada: numero deve ser > 0');
      }
      if (campos.volumeAtualL !== undefined && !(campos.volumeAtualL >= 0)) {
        erros.push('panela_editada: volumeAtualL deve ser >= 0');
      }
      if (campos.metaTiragemL !== undefined && !(campos.metaTiragemL >= 0)) {
        erros.push('panela_editada: metaTiragemL deve ser >= 0');
      }
      if (campos.entradaFogoEm !== undefined) {
        const t = new Date(campos.entradaFogoEm).getTime();
        if (Number.isNaN(t)) erros.push('panela_editada: entradaFogoEm inválido (esperado ISO datetime)');
      }
      break;
    }
    case 'troca_bocas': {
      if (!p.panelaAId || !p.panelaBId) {
        erros.push('troca_bocas: panelaAId e panelaBId obrigatórios');
      }
      break;
    }
    case 'evento_desfeito': {
      if (!p.eventoRevertidoId) erros.push('evento_desfeito: eventoRevertidoId obrigatório');
      break;
    }
    case 'feitio_encerrado':
      break;
  }

  return erros;
}
