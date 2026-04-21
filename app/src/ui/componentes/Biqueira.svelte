<script lang="ts">
  import type { Panela } from '../../domain/entities/panela';
  import SectionHead from './SectionHead.svelte';
  import PanelaBiqueiraCard from './PanelaBiqueiraCard.svelte';

  type Props = {
    panelas: Panela[];
    onClick: (p: Panela) => void;
  };
  let { panelas, onClick }: Props = $props();
</script>

{#if panelas.length > 0}
  <section>
    <SectionHead title="Biqueira" subtitle="panela virada" />
    <div class="grid">
      {#each panelas as p (p.id)}
        <PanelaBiqueiraCard panela={p} onclick={() => onClick(p)} />
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
