<script lang="ts">
  import Header from '../../../ui/componentes/Header.svelte';
  import Creditos from '../../../ui/componentes/Creditos.svelte';
  import Fornalha from '../../../ui/componentes/Fornalha.svelte';
  import Toneis from '../../../ui/componentes/Toneis.svelte';
  import Footer from '../../../ui/componentes/Footer.svelte';
  import PanelaModal from '../../../ui/componentes/PanelaModal.svelte';
  import NovaPanelaModal from '../../../ui/componentes/NovaPanelaModal.svelte';
  import {
    eventosMock,
    feitioMock,
    panelasMock,
    toneisMock,
    type PanelaMock
  } from '../../../ui/mock-feitio';

  let selecionada = $state<PanelaMock | null>(null);
  let novaOpen = $state(false);

  const bocasOcupadas = $derived(panelasMock.map((p) => p.boca));
  const bocasVazias = $derived(
    Array.from({ length: feitioMock.qtdBocas }, (_, i) => i + 1).filter(
      (b) => !bocasOcupadas.includes(b)
    )
  );
</script>

<svelte:head>
  <title>Gestão de Feitio</title>
</svelte:head>

<div class="app-shell">
  <Header feitio={feitioMock} />

  <Creditos
    feitio={feitioMock}
    qtdPanelasAtivas={panelasMock.length}
    bocas={feitioMock.qtdBocas}
    toneis={toneisMock}
  />

  <Fornalha
    panelas={panelasMock}
    bocas={feitioMock.qtdBocas}
    onPanelaClick={(p) => (selecionada = p)}
    onEmptyClick={() => (novaOpen = true)}
  />

  <Toneis toneis={toneisMock} />

  <Footer
    ultimoEvento={eventosMock[0]}
    onNova={() => (novaOpen = true)}
    onUndo={() => {}}
  />
</div>

{#if selecionada}
  <PanelaModal panela={selecionada} onClose={() => (selecionada = null)} />
{/if}

{#if novaOpen}
  <NovaPanelaModal {bocasVazias} onClose={() => (novaOpen = false)} />
{/if}
