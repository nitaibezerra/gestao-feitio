<script lang="ts">
  import type { TonelVisao } from '../visao';
  import SectionHead from './SectionHead.svelte';
  import Tonel from './Tonel.svelte';

  type Props = { toneis: TonelVisao[] };
  let { toneis }: Props = $props();
</script>

<section>
  <SectionHead title="Tonéis" subtitle="colheita guardada" />
  {#if toneis.length === 0}
    <div class="empty mono">
      nenhum tonel ainda — aparece após a primeira tiragem.
    </div>
  {:else}
    <div class="grid" style:grid-template-columns="repeat({toneis.length}, 1fr)">
      {#each toneis as tonel (tonel.id)}
        <Tonel {tonel} />
      {/each}
    </div>
  {/if}
</section>

<style>
  .grid {
    display: grid;
    gap: 14px;
  }
  .empty {
    padding: 24px 16px;
    border: 1px dashed var(--linha);
    border-radius: 12px;
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.08em;
    text-align: center;
  }
</style>
