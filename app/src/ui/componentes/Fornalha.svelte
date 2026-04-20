<script lang="ts">
  import type { PanelaVisao } from '../visao';
  import Panela from './Panela.svelte';
  import SectionHead from './SectionHead.svelte';

  type Props = {
    panelas: PanelaVisao[];
    bocas: number;
    onPanelaClick: (p: PanelaVisao) => void;
    onEmptyClick: (boca: number) => void;
    selecionadasIds?: string[];
  };
  let {
    panelas,
    bocas,
    onPanelaClick,
    onEmptyClick,
    selecionadasIds = []
  }: Props = $props();

  const bocasArr = $derived(Array.from({ length: bocas }, (_, i) => i + 1));
</script>

<section>
  <SectionHead title="Fornalha" subtitle="panelas no fogo" />
  <div class="grid" style:grid-template-columns="repeat({bocas}, 1fr)">
    {#each bocasArr as b (b)}
      {@const panela = panelas.find((p) => p.boca === b)}
      <Panela
        boca={b}
        {panela}
        selecionada={panela ? selecionadasIds.includes(panela.id) : false}
        onclick={() => panela && onPanelaClick(panela)}
        onclickEmpty={() => onEmptyClick(b)}
      />
    {/each}
  </div>
</section>

<style>
  .grid {
    display: grid;
    gap: 14px;
  }
</style>
