<script lang="ts">
  import type { TonelMock } from '../mock-feitio';
  import SectionHead from './SectionHead.svelte';
  import Tonel from './Tonel.svelte';

  type Props = { toneis: TonelMock[] };
  let { toneis }: Props = $props();
</script>

<section>
  <SectionHead title="Tonéis" subtitle="colheita guardada" />
  <div class="grid" style:grid-template-columns="repeat({toneis.length}, 1fr)">
    {#each toneis as tonel (tonel.id)}
      <Tonel {tonel} />
    {/each}
  </div>
</section>

<style>
  .grid {
    display: grid;
    gap: 14px;
  }
</style>
