<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { bootstrapAtivo } from '../app/runtime';

  // Bootstrap da raiz: se existe feitio ativo, vai ao dashboard; senão,
  // ao formulário de criar um novo.
  onMount(async () => {
    const id = await bootstrapAtivo();
    if (id) {
      await goto('/feitio/atual', { replaceState: true });
    } else {
      await goto('/feitio/novo', { replaceState: true });
    }
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
