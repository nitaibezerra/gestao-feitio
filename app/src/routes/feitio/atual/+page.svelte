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
    type PayloadRepor,
    type PayloadEditar
  } from '../../../ui/componentes/PanelaModal.svelte';
  import NovaPanelaModal, {
    type PayloadNovaPanela
  } from '../../../ui/componentes/NovaPanelaModal.svelte';
  import PanelasEncostadas from '../../../ui/componentes/PanelasEncostadas.svelte';
  import PanelaEncostadaModal, {
    type PayloadVoltarAoFogo,
    type PayloadTirarDireto
  } from '../../../ui/componentes/PanelaEncostadaModal.svelte';
  import { bootstrapAtivo, comandos, feitioAtivo, novoId, repo } from '../../../app/runtime';
  import type { EstadoFornalha } from '../../../domain/projecoes/fornalha';
  import type { Evento } from '../../../domain/events/tipos';
  import type { TipoTiragem, Panela } from '../../../domain/entities/panela';
  import { panelasNaFornalha, toneisVisao, type PanelaVisao } from '../../../ui/visao';
  import { resumirEvento } from '../../../ui/evento-label';
  import { useWakeLock } from '../../../ui/wake-lock.svelte';
  import { calcularTipoTiragem } from '../../../domain/regras/nomenclatura';

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

  // RNF-04: mantém a tela ligada enquanto esta rota estiver montada.
  const wakeLock = useWakeLock();
  $effect(() => {
    void wakeLock.ativar();
    return () => {
      void wakeLock.liberar();
    };
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
  let encostadaId = $state<string | null>(null);

  // Modo "trocar bocas": clicar numa panela seleciona; segundo clique troca.
  let modoTrocar = $state(false);
  let trocarAId = $state<string | null>(null);

  // Passa sempre a versão atual da panela ao modal — vem da projeção.
  const selecionada = $derived(
    selecionadaId ? panelasUI.find((p) => p.id === selecionadaId) ?? null : null
  );

  const panelasEncostadas = $derived(
    estado?.panelas.filter((p) => p.estado === 'fora_do_fogo') ?? []
  );
  const encostadaSelecionada = $derived(
    encostadaId ? panelasEncostadas.find((p) => p.id === encostadaId) ?? null : null
  );

  const selecionadasTrocar = $derived(trocarAId ? [trocarAId] : []);
  const hintTrocar = $derived.by(() => {
    if (!modoTrocar) return undefined;
    if (!trocarAId) return 'selecione a primeira panela';
    const a = panelasUI.find((p) => p.id === trocarAId);
    return a ? `panela ${String(a.numero).padStart(2, '0')} selecionada — escolha a outra` : 'selecione a primeira panela';
  });

  function abrirNova(_boca?: number) {
    // v1: a boca escolhida vem do próprio modal (PillRow quando há múltiplas).
    novaOpen = true;
  }

  function iniciarTrocar() {
    modoTrocar = true;
    trocarAId = null;
    selecionadaId = null;
  }

  function cancelarTrocar() {
    modoTrocar = false;
    trocarAId = null;
  }

  async function onPanelaClick(p: PanelaVisao) {
    if (!modoTrocar) {
      selecionadaId = p.id;
      return;
    }
    // Modo trocar:
    if (!trocarAId) {
      trocarAId = p.id;
      return;
    }
    if (trocarAId === p.id) {
      trocarAId = null; // desseleciona
      return;
    }
    if (!feitio) return;
    await comandos().trocarBocas({
      feitioId: feitio.id,
      panelaAId: trocarAId,
      panelaBId: p.id
    });
    modoTrocar = false;
    trocarAId = null;
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
      volumeL: p.volumeL,
      metaTiragemL: p.metaTiragemL
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

  async function onEditar(p: PayloadEditar) {
    if (!feitio || !selecionada) return;
    await comandos().editarPanela({
      feitioId: feitio.id,
      panelaId: selecionada.id,
      campos: p
    });
  }

  async function onVoltarAoFogo(p: PayloadVoltarAoFogo) {
    if (!feitio || !encostadaSelecionada) return;
    const r = await comandos().voltarAoFogo({
      feitioId: feitio.id,
      panelaId: encostadaSelecionada.id,
      bocaNumero: p.bocaNumero
    });
    if (r.ok) encostadaId = null;
  }

  async function onTirarDireto(p: PayloadTirarDireto) {
    if (!feitio || !encostadaSelecionada) return;
    const tipoT = tonelDestinoParaTiragemDeEncostada(encostadaSelecionada);
    const r = await comandos().registrarTiragem({
      feitioId: feitio.id,
      panelaId: encostadaSelecionada.id,
      volumeL: p.volumeL,
      tonelDestinoId: tipoT
    });
    if (r.ok) encostadaId = null;
  }

  function tonelDestinoParaTiragemDeEncostada(p: Panela): string {
    // Reusa a lógica de `tonelDestinoPara` simulando a proxTiragem via calcularTipoTiragem
    // já aplicada em panelasNaFornalha; aqui chamamos via helper compartilhado.
    // Para manter simples, usamos o mesmo helper em estado atual.
    const tipo = proxTiragemDe(p);
    return tonelDestinoPara(tipo, estado!);
  }

  function proxTiragemDe(p: Panela): TipoTiragem {
    // import dinâmico seria custoso; reusa import estático.
    return calcularTipoTiragem(p);
  }

  async function onUndo() {
    if (!feitio) return;
    await comandos().desfazerUltimoEvento({ feitioId: feitio.id });
  }

  async function onEncerrar() {
    if (!feitio) return;
    if (typeof window !== 'undefined' && !window.confirm('Encerrar este feitio? Essa ação marca o feitio como concluído.')) {
      return;
    }
    const r = await comandos().encerrarFeitio({ feitioId: feitio.id });
    if (r.ok) {
      await goto('/feitio/resumo');
    }
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
      onPanelaClick={onPanelaClick}
      onEmptyClick={(b) => abrirNova(b)}
      selecionadasIds={selecionadasTrocar}
    />

    <Toneis toneis={toneisUI} />

    <PanelasEncostadas
      panelas={panelasEncostadas}
      onClick={(p) => (encostadaId = p.id)}
    />

    <Footer
      {ultimoEvento}
      onNova={() => abrirNova()}
      onUndo={onUndo}
      onTrocar={iniciarTrocar}
      onCancelarTrocar={cancelarTrocar}
      onEncerrar={onEncerrar}
      {modoTrocar}
      {hintTrocar}
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
      {onEditar}
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

  {#if encostadaSelecionada}
    <PanelaEncostadaModal
      panela={encostadaSelecionada}
      {bocasVazias}
      onClose={() => (encostadaId = null)}
      onVoltar={onVoltarAoFogo}
      onTirarDireto={onTirarDireto}
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
