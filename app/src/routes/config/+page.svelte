<script lang="ts">
  import { PALETAS, type PaletaKey } from '../../ui/paletas';
  import { paletaStore } from '../../ui/paleta-store.svelte';
  import BtnPill from '../../ui/componentes/primitivos/BtnPill.svelte';

  const chaves = Object.keys(PALETAS) as PaletaKey[];

  function escolher(k: PaletaKey) {
    paletaStore.escolher(k);
  }
</script>

<svelte:head>
  <title>Gestão de Feitio — Configurações</title>
</svelte:head>

<main class="app-shell">
  <header class="topo">
    <a href="/feitio/atual" class="voltar mono" aria-label="Voltar ao dashboard">
      ← voltar
    </a>
    <div>
      <div class="mono eyebrow">configurações · identidade</div>
      <h1 class="serif">Paleta</h1>
      <p class="lead">
        A família <em>Luz Branca</em> oferece quatro variações. Todas mantêm o fundo de
        papel claro e as auroras sutis; o que muda é a cor dominante de ação e o tom
        das auroras.
      </p>
    </div>
  </header>

  <div class="grade">
    {#each chaves as k (k)}
      {@const p = PALETAS[k]}
      {@const ativa = paletaStore.valor === k}
      <button
        class="opcao"
        class:ativa
        onclick={() => escolher(k)}
        aria-pressed={ativa}
      >
        <div class="swatch">
          <span class="sw" style:background={p.azulProfundo}></span>
          <span class="sw" style:background={p.azul}></span>
          <span class="sw" style:background={p.azulClaro}></span>
        </div>
        <div class="info">
          <div class="serif nome">{p.nome}</div>
          <div class="mono sub">{p.sub}</div>
        </div>
        {#if ativa}
          <span class="mono selo" style:color={p.azulProfundo}>Ativa</span>
        {/if}
      </button>
    {/each}
  </div>

  <footer class="rodape">
    <BtnPill variante="ghost" href="/feitio/atual">Voltar ao feitio</BtnPill>
  </footer>
</main>

<style>
  .topo {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .voltar {
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    text-decoration: none;
    align-self: flex-start;
  }
  .voltar:hover {
    color: var(--ink-soft);
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
    max-width: 580px;
    font-size: 15px;
    line-height: 1.6;
    color: var(--ink-soft);
    font-weight: 300;
  }
  .lead em {
    font-style: italic;
    color: var(--ink);
  }

  .grade {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 16px;
  }
  .opcao {
    position: relative;
    padding: 18px 20px;
    border-radius: 16px;
    background: var(--surface);
    border: 1px solid var(--linha);
    display: flex;
    align-items: center;
    gap: 16px;
    text-align: left;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  }
  .opcao:hover {
    border-color: var(--linha-strong);
    transform: translateY(-1px);
  }
  .opcao.ativa {
    border-color: var(--azul);
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--azul) 12%, transparent);
  }
  .swatch {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }
  .sw {
    width: 14px;
    height: 28px;
    border-radius: 3px;
  }
  .info {
    flex: 1;
    min-width: 0;
  }
  .nome {
    font-size: 20px;
    font-weight: 400;
    color: var(--ink);
  }
  .sub {
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.08em;
    margin-top: 2px;
  }
  .selo {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-weight: 500;
  }

  .rodape {
    margin-top: auto;
    padding-top: 24px;
    border-top: 1px solid var(--linha);
  }
</style>
