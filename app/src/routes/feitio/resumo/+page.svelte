<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import BtnPill from '../../../ui/componentes/primitivos/BtnPill.svelte';
  import { repo, ultimoEncerrado } from '../../../app/runtime';
  import { projetarFornalha, type EstadoFornalha } from '../../../domain/projecoes/fornalha';
  import { resumirFeitio, type ResumoFeitio } from '../../../ui/resumo';
  import type { Evento } from '../../../domain/events/tipos';
  import { fmtDuracao } from '../../../ui/labels';

  let carregando = $state(true);
  let estado = $state<EstadoFornalha | null>(null);
  let eventos = $state<Evento[]>([]);
  let resumo = $state<ResumoFeitio | null>(null);

  onMount(async () => {
    const feitioId = await ultimoEncerrado();
    if (!feitioId) {
      await goto('/feitio/novo', { replaceState: true });
      return;
    }
    eventos = await repo().listarPorFeitio(feitioId);
    estado = projetarFornalha(eventos);
    resumo = resumirFeitio(estado);
    carregando = false;
  });

  const duracaoMs = $derived.by(() => {
    if (!estado?.feitio?.fim || !estado.feitio.inicio) return 0;
    return estado.feitio.fim.getTime() - estado.feitio.inicio.getTime();
  });

  function exportarJSON() {
    if (!estado?.feitio) return;
    const payload = {
      feitio: estado.feitio,
      eventos,
      exportadoEm: new Date().toISOString(),
      versao: 1
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dataIso = new Date().toISOString().slice(0, 10);
    a.download = `feitio-${estado.feitio.id.slice(0, 8)}-${dataIso}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
</script>

<svelte:head>
  <title>Gestão de Feitio — Resumo</title>
</svelte:head>

{#if carregando}
  <main class="app-shell">
    <div class="carregando mono">carregando…</div>
  </main>
{:else if estado?.feitio && resumo}
  <main class="app-shell">
    <header class="topo">
      <div class="mono eyebrow">feitio encerrado</div>
      <h1 class="serif">{estado.feitio.nome}</h1>
      <p class="lead">
        Feitor <span class="forte">{estado.feitio.feitor}</span>
        {#if estado.feitio.foguista}· foguista <span class="forte">{estado.feitio.foguista}</span>{/if}
        {#if estado.feitio.casinha}· {estado.feitio.casinha}{/if}
        · duração <span class="mono forte">{fmtDuracao(duracaoMs)}</span>
      </p>
    </header>

    <section class="totais">
      <div class="card">
        <div class="mono eyebrow">panelas</div>
        <div class="serif numero">{resumo.totalPanelas}</div>
        <div class="sub">
          {resumo.totalPanelasDescartadas} descartada{resumo.totalPanelasDescartadas !== 1 ? 's' : ''}
        </div>
      </div>
      <div class="card">
        <div class="mono eyebrow">volume total</div>
        <div class="serif numero">{resumo.volumeTotalL}</div>
        <div class="sub">litros nos tonéis</div>
      </div>
      <div class="card">
        <div class="mono eyebrow">eventos</div>
        <div class="serif numero">{eventos.length}</div>
        <div class="sub">registrados no log</div>
      </div>
    </section>

    <section class="toneis">
      <h2 class="mono section-title">tonéis finais</h2>
      {#if resumo.toneis.length === 0}
        <div class="empty">Nenhum tonel produzido.</div>
      {:else}
        <div class="grade">
          {#each resumo.toneis as t (t.id)}
            <div class="tonel-row">
              <span class="label">{t.label}</span>
              <span class="serif vol">{t.volumeL}</span>
              <span class="mono u">L</span>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <footer class="rodape">
      <button class="link" onclick={exportarJSON}>Exportar JSON</button>
      <div class="espaco"></div>
      <BtnPill variante="ghost" href="/">Início</BtnPill>
      <BtnPill variante="primary" href="/feitio/novo">Novo feitio</BtnPill>
    </footer>
  </main>
{/if}

<style>
  .carregando {
    margin: auto;
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }
  .topo {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .eyebrow {
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }
  h1 {
    margin: 4px 0 0;
    font-size: 44px;
    font-weight: 200;
    letter-spacing: -0.03em;
    color: var(--ink);
  }
  .lead {
    margin: 14px 0 0;
    font-size: 14px;
    color: var(--ink-soft);
    font-weight: 300;
  }
  .forte {
    color: var(--ink);
  }

  .totais {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .card {
    padding: 24px 24px 20px;
    border-radius: 16px;
    background: var(--surface);
    border: 1px solid var(--linha);
  }
  .numero {
    font-size: 56px;
    font-weight: 200;
    letter-spacing: -0.04em;
    color: var(--ink);
    margin-top: 4px;
    line-height: 1;
  }
  .sub {
    font-size: 12px;
    color: var(--ink-faint);
    margin-top: 8px;
  }

  .toneis {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .section-title {
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin: 0;
    font-weight: 400;
  }
  .empty {
    font-size: 13px;
    color: var(--ink-faint);
    font-style: italic;
  }
  .grade {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 10px;
  }
  .tonel-row {
    padding: 14px 18px;
    background: var(--surface);
    border: 1px solid var(--linha);
    border-radius: 12px;
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  .label {
    flex: 1;
    font-size: 14px;
    color: var(--ink);
  }
  .vol {
    font-size: 24px;
    font-weight: 300;
    color: var(--ink);
  }
  .u {
    font-size: 11px;
    color: var(--ink-faint);
  }

  .rodape {
    margin-top: auto;
    padding-top: 24px;
    border-top: 1px solid var(--linha);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .link {
    font-size: 12px;
    color: var(--ink-soft);
    text-decoration: underline;
    text-underline-offset: 3px;
    background: none;
    border: 0;
    cursor: pointer;
    padding: 8px 0;
  }
  .link:hover {
    color: var(--ink);
  }
  .espaco {
    flex: 1;
  }
</style>
