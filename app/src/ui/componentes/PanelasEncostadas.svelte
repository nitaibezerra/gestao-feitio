<script lang="ts">
  import type { Panela } from '../../domain/entities/panela';
  import SectionHead from './SectionHead.svelte';
  import PanelaEncostadaCard from './PanelaEncostadaCard.svelte';

  type Props = {
    panelas: Panela[];
    onClick: (p: Panela) => void;
  };
  let { panelas, onClick }: Props = $props();
</script>

{#if panelas.length > 0}
  <section>
    <SectionHead title="Panelas encostadas" subtitle="fora do fogo" />
    <div class="grid">
      {#each panelas as p (p.id)}
        <PanelaEncostadaCard panela={p} onclick={() => onClick(p)} />
      {/each}
    </div>
  </section>
{/if}

<style>
  .grid {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    overflow-x: auto;
  }
</style>
