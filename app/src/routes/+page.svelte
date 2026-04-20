<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // v1: único feitio ativo (mock). Redireciona direto para o dashboard.
  // Fase 4 passa a verificar se existe feitio em_andamento no IndexedDB.
  onMount(() => {
    goto('/feitio/atual', { replaceState: true });
  });
</script>

<main class="app-shell">
  <div class="carregando">
    <div class="serif titulo">Gestão de Feitio</div>
    <div class="mono sub">carregando…</div>
  </div>
</main>

<style>
  .carregando {
    margin: auto;
    text-align: center;
  }
  .titulo {
    font-size: 36px;
    font-weight: 200;
    letter-spacing: -0.03em;
    color: var(--ink);
  }
  .sub {
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.25em;
    text-transform: uppercase;
    margin-top: 12px;
  }
</style>
