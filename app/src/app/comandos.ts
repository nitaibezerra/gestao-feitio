/**
 * Command handlers — orquestração domínio + persistência.
 *
 * Cada comando:
 *   1. Busca eventos do feitio e projeta o estado atual.
 *   2. Valida invariantes do domínio (existência, transição de estado,
 *      volumes, etc.).
 *   3. Cria o evento via `criarEvento` + `validarEvento` e persiste.
 *   4. Retorna `{ ok: true, eventoId }` ou `{ ok: false, motivo }`.
 *
 * Regras de nomenclatura da tiragem: o tipo (cozimento N / daime N / água
 * forte) é calculado pelo domínio a partir do conteúdo da panela e do
 * histórico, **não vem do chamador**. O handler anexa antes de persistir.
 */

import type { EstadoFornalha } from '../domain/projecoes/fornalha';
import { projetarFornalha } from '../domain/projecoes/fornalha';
import type { Panela, TipoConteudo } from '../domain/entities/panela';
import { criarEvento, type Evento, validarEvento } from '../domain/events/tipos';
import { calcularTipoTiragem } from '../domain/regras/nomenclatura';
import { transicao } from '../domain/regras/maquina-estados';
import type { RepositorioEventos } from '../infra/persistencia/repositorio-eventos';

export type ResultadoComando =
  | { ok: true; eventoId: string }
  | { ok: false; motivo: string };

type Ctx = { feitioId: string };

export type ComandoIniciarFeitio = Ctx & {
  nome: string;
  feitor: string;
  foguista?: string;
  casinha?: string;
  qtdBocas: number;
};

export type ComandoMontarPanela = Ctx & { panelaId: string; numero: number };

export type ComandoEntrarNoFogo = Ctx & {
  panelaId: string;
  bocaNumero: number;
  conteudo: TipoConteudo;
  volumeL: number;
  metaTiragemL?: number;
};

export type ComandoTiragem = Ctx & {
  panelaId: string;
  volumeL: number;
  tonelDestinoId: string;
};

export type ComandoReposicao = Ctx & {
  panelaId: string;
  conteudo: TipoConteudo;
  volumeL: number;
};

export type ComandoPanelaAlvo = Ctx & { panelaId: string };

export type ComandoTrocaBocas = Ctx & { panelaAId: string; panelaBId: string };

export type ComandoAjusteVolume = Ctx & { panelaId: string; deltaL: number };

export type ComandoEditarPanela = Ctx & {
  panelaId: string;
  campos: {
    numero?: number;
    volumeAtualL?: number;
    metaTiragemL?: number;
    entradaFogoEm?: string; // ISO datetime
  };
};

export type Comandos = {
  iniciarFeitio(c: ComandoIniciarFeitio): Promise<ResultadoComando>;
  montarPanela(c: ComandoMontarPanela): Promise<ResultadoComando>;
  entrarNoFogo(c: ComandoEntrarNoFogo): Promise<ResultadoComando>;
  registrarTiragem(c: ComandoTiragem): Promise<ResultadoComando>;
  reporLiquido(c: ComandoReposicao): Promise<ResultadoComando>;
  pausar(c: ComandoPanelaAlvo): Promise<ResultadoComando>;
  retomar(c: ComandoPanelaAlvo): Promise<ResultadoComando>;
  trocarBocas(c: ComandoTrocaBocas): Promise<ResultadoComando>;
  descartarPanela(c: ComandoPanelaAlvo): Promise<ResultadoComando>;
  ajustarVolume(c: ComandoAjusteVolume): Promise<ResultadoComando>;
  editarPanela(c: ComandoEditarPanela): Promise<ResultadoComando>;
  desfazerUltimoEvento(c: Ctx): Promise<ResultadoComando>;
  encerrarFeitio(c: Ctx): Promise<ResultadoComando>;
};

export function criarComandos(repo: RepositorioEventos): Comandos {
  async function estadoAtual(feitioId: string): Promise<{
    eventos: Evento[];
    fornalha: EstadoFornalha;
  }> {
    const eventos = await repo.listarPorFeitio(feitioId);
    return { eventos, fornalha: projetarFornalha(eventos) };
  }

  async function persistir(evento: Evento): Promise<ResultadoComando> {
    const v = validarEvento(evento);
    if (!v.ok) return { ok: false, motivo: v.erros.join('; ') };
    await repo.append(evento);
    return { ok: true, eventoId: evento.id };
  }

  function buscarPanela(fornalha: EstadoFornalha, panelaId: string): Panela | null {
    return fornalha.panelas.find((p) => p.id === panelaId) ?? null;
  }

  return {
    async iniciarFeitio(c) {
      if (!c.nome?.trim()) return { ok: false, motivo: 'nome obrigatório' };
      if (!c.feitor?.trim()) return { ok: false, motivo: 'feitor obrigatório' };
      if (!(c.qtdBocas > 0)) return { ok: false, motivo: 'qtdBocas deve ser > 0' };
      const evento = criarEvento(c.feitioId, {
        tipo: 'feitio_iniciado',
        payload: {
          nome: c.nome,
          feitor: c.feitor,
          foguista: c.foguista,
          casinha: c.casinha,
          qtdBocas: c.qtdBocas
        }
      });
      return persistir(evento);
    },

    async montarPanela(c) {
      const { fornalha } = await estadoAtual(c.feitioId);
      if (!fornalha.feitio) return { ok: false, motivo: 'feitio não iniciado' };
      if (fornalha.panelas.some((p) => p.id === c.panelaId)) {
        return { ok: false, motivo: `panela ${c.panelaId} já existe` };
      }
      const evento = criarEvento(c.feitioId, {
        tipo: 'panela_montada',
        payload: { panelaId: c.panelaId, numero: c.numero }
      });
      return persistir(evento);
    },

    async entrarNoFogo(c) {
      if (c.metaTiragemL !== undefined && c.metaTiragemL < 0) {
        return { ok: false, motivo: 'metaTiragemL deve ser >= 0' };
      }
      const { fornalha } = await estadoAtual(c.feitioId);
      const panela = buscarPanela(fornalha, c.panelaId);
      if (!panela) return { ok: false, motivo: `panela ${c.panelaId} não encontrada` };
      const t = transicao(panela.estado ?? 'montada', { tipo: 'entrar_no_fogo' });
      if (!t.ok) return { ok: false, motivo: t.motivo };
      const evento = criarEvento(c.feitioId, {
        tipo: 'panela_entra_fogo',
        payload: {
          panelaId: c.panelaId,
          bocaNumero: c.bocaNumero,
          conteudo: c.conteudo,
          volumeL: c.volumeL,
          ...(c.metaTiragemL !== undefined ? { metaTiragemL: c.metaTiragemL } : {})
        }
      });
      return persistir(evento);
    },

    async registrarTiragem(c) {
      if (c.volumeL < 0) return { ok: false, motivo: 'volumeL deve ser >= 0' };
      const { fornalha } = await estadoAtual(c.feitioId);
      const panela = buscarPanela(fornalha, c.panelaId);
      if (!panela) return { ok: false, motivo: `panela ${c.panelaId} não encontrada` };
      const t = transicao(panela.estado ?? 'montada', { tipo: 'registrar_tiragem' });
      if (!t.ok) return { ok: false, motivo: t.motivo };
      if (c.volumeL > (panela.volumeAtualL ?? 0)) {
        return {
          ok: false,
          motivo: `volume (${c.volumeL} L) excede o volume atual da panela (${panela.volumeAtualL ?? 0} L)`
        };
      }
      const tipoTiragem = calcularTipoTiragem(panela);
      const evento = criarEvento(c.feitioId, {
        tipo: 'tiragem_registrada',
        payload: {
          panelaId: c.panelaId,
          volumeL: c.volumeL,
          tonelDestinoId: c.tonelDestinoId,
          tipoTiragem
        }
      });
      return persistir(evento);
    },

    async reporLiquido(c) {
      const { fornalha } = await estadoAtual(c.feitioId);
      const panela = buscarPanela(fornalha, c.panelaId);
      if (!panela) return { ok: false, motivo: `panela ${c.panelaId} não encontrada` };
      const t = transicao(panela.estado ?? 'montada', { tipo: 'repor_e_play' });
      if (!t.ok) return { ok: false, motivo: t.motivo };
      const evento = criarEvento(c.feitioId, {
        tipo: 'reposicao_registrada',
        payload: { panelaId: c.panelaId, conteudo: c.conteudo, volumeL: c.volumeL }
      });
      return persistir(evento);
    },

    async pausar(c) {
      const { fornalha } = await estadoAtual(c.feitioId);
      const panela = buscarPanela(fornalha, c.panelaId);
      if (!panela) return { ok: false, motivo: `panela ${c.panelaId} não encontrada` };
      const t = transicao(panela.estado ?? 'montada', { tipo: 'pausar' });
      if (!t.ok) return { ok: false, motivo: t.motivo };
      const evento = criarEvento(c.feitioId, {
        tipo: 'tempo_pausado',
        payload: { panelaId: c.panelaId }
      });
      return persistir(evento);
    },

    async retomar(c) {
      const { fornalha } = await estadoAtual(c.feitioId);
      const panela = buscarPanela(fornalha, c.panelaId);
      if (!panela) return { ok: false, motivo: `panela ${c.panelaId} não encontrada` };
      const t = transicao(panela.estado ?? 'montada', { tipo: 'retomar' });
      if (!t.ok) return { ok: false, motivo: t.motivo };
      const evento = criarEvento(c.feitioId, {
        tipo: 'tempo_retomado',
        payload: { panelaId: c.panelaId }
      });
      return persistir(evento);
    },

    async trocarBocas(c) {
      const { fornalha } = await estadoAtual(c.feitioId);
      const a = buscarPanela(fornalha, c.panelaAId);
      const b = buscarPanela(fornalha, c.panelaBId);
      if (!a) return { ok: false, motivo: `panela ${c.panelaAId} não encontrada` };
      if (!b) return { ok: false, motivo: `panela ${c.panelaBId} não encontrada` };
      if (a.estado === 'descartada' || b.estado === 'descartada') {
        return { ok: false, motivo: 'não é possível trocar boca de panela descartada' };
      }
      const evento = criarEvento(c.feitioId, {
        tipo: 'troca_bocas',
        payload: { panelaAId: c.panelaAId, panelaBId: c.panelaBId }
      });
      return persistir(evento);
    },

    async descartarPanela(c) {
      const { fornalha } = await estadoAtual(c.feitioId);
      const panela = buscarPanela(fornalha, c.panelaId);
      if (!panela) return { ok: false, motivo: `panela ${c.panelaId} não encontrada` };
      const t = transicao(panela.estado ?? 'montada', { tipo: 'descartar' });
      if (!t.ok) return { ok: false, motivo: t.motivo };
      const evento = criarEvento(c.feitioId, {
        tipo: 'panela_descartada',
        payload: { panelaId: c.panelaId }
      });
      return persistir(evento);
    },

    async ajustarVolume(c) {
      const { fornalha } = await estadoAtual(c.feitioId);
      const panela = buscarPanela(fornalha, c.panelaId);
      if (!panela) return { ok: false, motivo: `panela ${c.panelaId} não encontrada` };
      const novoVolume = (panela.volumeAtualL ?? 0) + c.deltaL;
      if (novoVolume < 0) {
        return { ok: false, motivo: `ajuste levaria volume a ${novoVolume} L (< 0)` };
      }
      const evento = criarEvento(c.feitioId, {
        tipo: 'volume_ajustado',
        payload: { panelaId: c.panelaId, deltaL: c.deltaL }
      });
      return persistir(evento);
    },

    async editarPanela(c) {
      const { fornalha } = await estadoAtual(c.feitioId);
      const panela = buscarPanela(fornalha, c.panelaId);
      if (!panela) return { ok: false, motivo: `panela ${c.panelaId} não encontrada` };
      const campos = c.campos ?? {};
      const chaves = Object.keys(campos).filter(
        (k) => (campos as Record<string, unknown>)[k] !== undefined
      );
      if (chaves.length === 0) {
        return { ok: false, motivo: 'nenhum campo para editar' };
      }
      if (campos.numero !== undefined && !(campos.numero > 0)) {
        return { ok: false, motivo: 'numero deve ser > 0' };
      }
      if (campos.volumeAtualL !== undefined && !(campos.volumeAtualL >= 0)) {
        return { ok: false, motivo: 'volumeAtualL deve ser >= 0' };
      }
      if (campos.metaTiragemL !== undefined && !(campos.metaTiragemL >= 0)) {
        return { ok: false, motivo: 'metaTiragemL deve ser >= 0' };
      }
      if (campos.entradaFogoEm !== undefined) {
        const t = new Date(campos.entradaFogoEm).getTime();
        if (Number.isNaN(t)) {
          return { ok: false, motivo: 'entradaFogoEm inválido' };
        }
      }
      const evento = criarEvento(c.feitioId, {
        tipo: 'panela_editada',
        payload: { panelaId: c.panelaId, campos }
      });
      return persistir(evento);
    },

    async desfazerUltimoEvento(c) {
      const { eventos } = await estadoAtual(c.feitioId);
      const compensaveis = eventos.filter(
        (e) => e.tipo !== 'evento_desfeito' && e.tipo !== 'feitio_iniciado'
      );
      const alvo = compensaveis[compensaveis.length - 1];
      if (!alvo) return { ok: false, motivo: 'sem eventos para desfazer' };
      const evento = criarEvento(c.feitioId, {
        tipo: 'evento_desfeito',
        payload: { eventoRevertidoId: alvo.id }
      });
      return persistir(evento);
    },

    async encerrarFeitio(c) {
      const { fornalha } = await estadoAtual(c.feitioId);
      if (!fornalha.feitio) return { ok: false, motivo: 'feitio não existe' };
      if (fornalha.feitio.status === 'encerrado') {
        return { ok: false, motivo: 'feitio já encerrado' };
      }
      const evento = criarEvento(c.feitioId, {
        tipo: 'feitio_encerrado',
        payload: {}
      });
      return persistir(evento);
    }
  };
}
