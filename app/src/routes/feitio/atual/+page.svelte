<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Header from '../../../ui/componentes/Header.svelte';
  import Creditos from '../../../ui/componentes/Creditos.svelte';
  import Fornalha from '../../../ui/componentes/Fornalha.svelte';
  import Toneis from '../../../ui/componentes/Toneis.svelte';
  import Footer from '../../../ui/componentes/Footer.svelte';
  import PanelaModal, {
    type PayloadTirar,
    type PayloadRepor
  } from '../../../ui/componentes/PanelaModal.svelte';
  import NovaPanelaModal, {
    type PayloadNovaPanela
  } from '../../../ui/componentes/NovaPanelaModal.svelte';
  import { bootstrapAtivo, comandos, feitioAtivo, novoId, repo } from '../../../app/runtime';
  import type { EstadoFornalha } from '../../../domain/projecoes/fornalha';
  import type { Evento } from '../../../domain/events/tipos';
  import type { TipoTiragem, Panela } from '../../../domain/entities/panela';
  import { panelasNaFornalha, toneisVisao, type PanelaVisao } from '../../../ui/visao';
  import { resumirEvento } from '../../../ui/evento-label';

  const fornalha = feitioAtivo();

  let carregando = $state(true);
  let estado = $state<EstadoFornalha | null>(null);
  let eventos = $state<Evento[]>([]);

  // Atualiza a lista de eventos sempre que o estado muda, via repo.
  fornalha.subscribe(async (v) => {
    carregando = false;
    estado = v;
    if (v?.feitio) {
      eventos = await repo().listarPorFeitio(v.feitio.id);
    } else {
      eventos = [];
    }
  });

  // Sem feitio: redireciona para criar um (após a carga inicial).
  onMount(async () => {
    const id = await bootstrapAtivo();
    if (!id) {
      await goto('/feitio/novo', { replaceState: true });
    }
  });

  // Derivações da visão:
  const feitio = $derived(estado?.feitio ?? null);
  const panelasUI = $derived<PanelaVisao[]>(
    estado ? panelasNaFornalha(estado.panelas) : []
  );
  const toneisUI = $derived(estado ? toneisVisao(estado.toneis) : []);
  const bocasOcupadas = $derived(panelasUI.map((p) => p.boca));
  const bocasVazias = $derived(
    feitio
      ? Array.from({ length: feitio.qtdBocas }, (_, i) => i + 1).filter(
          (b) => !bocasOcupadas.includes(b)
        )
      : []
  );
  const ultimoEvento = $derived.by(() => {
    if (eventos.length === 0) return undefined;
    const e = eventos[eventos.length - 1];
    return resumirEvento(e, estado?.panelas ?? []);
  });

  let selecionadaId = $state<string | null>(null);
  let novaOpen = $state(false);

  // Passa sempre a versão atual da panela ao modal — vem da projeção.
  const selecionada = $derived(
    selecionadaId ? panelasUI.find((p) => p.id === selecionadaId) ?? null : null
  );

  function abrirNova(_boca?: number) {
    // v1: a boca escolhida vem do próprio modal (PillRow quando há múltiplas).
    novaOpen = true;
  }

  async function onNovaConfirm(p: PayloadNovaPanela) {
    if (!feitio) return;
    const panelaId = novoId();
    const numero = proximoNumeroPanela(estado!.panelas);
    const rMontar = await comandos().montarPanela({
      feitioId: feitio.id,
      panelaId,
      numero
    });
    if (!rMontar.ok) return;
    await comandos().entrarNoFogo({
      feitioId: feitio.id,
      panelaId,
      bocaNumero: p.bocaNumero,
      conteudo: p.conteudo,
      volumeL: p.volumeL
    });
    novaOpen = false;
  }

  async function onTirar(p: PayloadTirar) {
    if (!feitio || !selecionada) return;
    const tonelDestinoId = tonelDestinoPara(selecionada.proxTiragem, estado!);
    await comandos().registrarTiragem({
      feitioId: feitio.id,
      panelaId: selecionada.id,
      volumeL: p.volumeL,
      tonelDestinoId
    });
  }

  async function onRepor(p: PayloadRepor) {
    if (!feitio || !selecionada) return;
    await comandos().reporLiquido({
      feitioId: feitio.id,
      panelaId: selecionada.id,
      conteudo: p.conteudo,
      volumeL: p.volumeL
    });
  }

  async function onPausar() {
    if (!feitio || !selecionada) return;
    await comandos().pausar({ feitioId: feitio.id, panelaId: selecionada.id });
  }

  async function onRetomar() {
    if (!feitio || !selecionada) return;
    await comandos().retomar({ feitioId: feitio.id, panelaId: selecionada.id });
  }

  async function onDescartar() {
    if (!feitio || !selecionada) return;
    await comandos().descartarPanela({ feitioId: feitio.id, panelaId: selecionada.id });
    selecionadaId = null;
  }

  async function onUndo() {
    if (!feitio) return;
    await comandos().desfazerUltimoEvento({ feitioId: feitio.id });
  }

  function proximoNumeroPanela(panelas: Panela[]): number {
    const max = panelas.reduce((a, p) => Math.max(a, p.numero), 0);
    return max + 1;
  }

  /**
   * Descobre (ou inventa) o id do tonel destino da tiragem baseado no tipo.
   * Regra: um tonel por (tipo, chave). Se já existe, reusa. Se não, gera
   * novo id — o projeção cria o tonel na aplicação do evento.
   */
  function tonelDestinoPara(t: TipoTiragem, s: EstadoFornalha): string {
    const match = s.toneis.find((x) => {
      if (t.tipo === 'cozimento') return x.tipo === 'cozimento' && x.ordem === t.ordem;
      if (t.tipo === 'daime') return x.tipo === 'daime' && x.grau === t.grau;
      return x.tipo === 'agua_forte';
    });
    return match?.id ?? novoId();
  }
</script>

<svelte:head>
  <title>Gestão de Feitio</title>
</svelte:head>

{#if carregando}
  <main class="app-shell">
    <div class="carregando mono">carregando…</div>
  </main>
{:else if feitio}
  <div class="app-shell">
    <Header {feitio} />

    <Creditos
      {feitio}
      qtdPanelasAtivas={panelasUI.length}
      bocas={feitio.qtdBocas}
      toneis={toneisUI}
    />

    <Fornalha
      panelas={panelasUI}
      bocas={feitio.qtdBocas}
      onPanelaClick={(p) => (selecionadaId = p.id)}
      onEmptyClick={(b) => abrirNova(b)}
    />

    <Toneis toneis={toneisUI} />

    <Footer
      {ultimoEvento}
      onNova={() => abrirNova()}
      onUndo={onUndo}
    />
  </div>

  {#if selecionada}
    <PanelaModal
      panela={selecionada}
      toneis={estado?.toneis ?? []}
      onClose={() => (selecionadaId = null)}
      {onTirar}
      {onRepor}
      {onPausar}
      {onRetomar}
      {onDescartar}
    />
  {/if}

  {#if novaOpen}
    <NovaPanelaModal
      {bocasVazias}
      toneis={estado?.toneis ?? []}
      onClose={() => (novaOpen = false)}
      onConfirm={onNovaConfirm}
    />
  {/if}
{/if}

<style>
  .carregando {
    margin: auto;
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }
</style>
