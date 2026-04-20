<script lang="ts">
  import BtnPill from './primitivos/BtnPill.svelte';
  import FieldGroup from './primitivos/FieldGroup.svelte';
  import Pill from './primitivos/Pill.svelte';
  import PillRow from './primitivos/PillRow.svelte';

  type Props = {
    bocasVazias: number[];
    onClose: () => void;
    onConfirm?: () => void;
  };
  let { bocasVazias, onClose, onConfirm }: Props = $props();

  let qtd = $state<1 | 2>(1);
  let conteudo = $state<'agua' | 'coz1' | 'coz2'>('agua');
  let volume = $state(60);

  $effect(() => {
    qtd = bocasVazias.length >= 2 ? 2 : 1;
  });
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onClose()} />

<div class="overlay" role="presentation">
  <button class="close-area" aria-label="Fechar modal" onclick={onClose}></button>
  <div class="modal" role="dialog" aria-modal="true" aria-label="Nova panela">
    <div class="cabecalho">
      <div class="mono eyebrow">criar</div>
      <div class="serif titulo">Nova panela na fornalha</div>
      <div class="hint">
        {bocasVazias.length} boca{bocasVazias.length !== 1 ? 's' : ''} livre{bocasVazias.length !== 1 ? 's' : ''}:
        {bocasVazias.join(', ') || '—'}
      </div>
    </div>

    <div class="corpo">
      <FieldGroup label="quantas">
        <PillRow>
          <Pill active={qtd === 1} onclick={() => (qtd = 1)}>1 panela</Pill>
          {#if bocasVazias.length >= 2}
            <Pill active={qtd === 2} onclick={() => (qtd = 2)}>Dupla (2)</Pill>
          {/if}
        </PillRow>
      </FieldGroup>

      <FieldGroup label="entra com">
        <PillRow>
          <Pill active={conteudo === 'agua'} onclick={() => (conteudo = 'agua')}>Água</Pill>
          <Pill active={conteudo === 'coz1'} onclick={() => (conteudo = 'coz1')}>
            1º coz. · 52 L
          </Pill>
          <Pill active={conteudo === 'coz2'} onclick={() => (conteudo = 'coz2')}>
            2º coz. · 40 L
          </Pill>
        </PillRow>
      </FieldGroup>

      <FieldGroup label="volume cada">
        <div class="volume-grande">
          <span class="serif num">{volume}</span>
          <span class="mono u">L</span>
        </div>
        <PillRow>
          {#each [50, 55, 60, 65] as v (v)}
            <Pill active={volume === v} onclick={() => (volume = v)}>{v} L</Pill>
          {/each}
        </PillRow>
      </FieldGroup>
    </div>

    <div class="rodape">
      <BtnPill variante="ghost" onclick={onClose}>Cancelar</BtnPill>
      <BtnPill variante="primary" onclick={() => (onConfirm ?? onClose)()}>
        Entrar no fogo
      </BtnPill>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(28, 32, 36, 0.22);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 24px;
  }
  .close-area {
    position: absolute;
    inset: 0;
    cursor: pointer;
    background: transparent;
    border: 0;
  }
  .modal {
    position: relative;
    width: 100%;
    max-width: 560px;
    background: var(--surface);
    border-radius: 18px;
    border: 1px solid var(--linha);
    box-shadow: 0 24px 60px rgba(40, 60, 90, 0.18);
    overflow: hidden;
  }

  .cabecalho {
    padding: 28px 32px 20px;
    border-bottom: 1px solid var(--linha);
  }
  .eyebrow {
    font-size: 10px;
    color: var(--ink-faint);
    letter-spacing: 0.3em;
    text-transform: uppercase;
  }
  .titulo {
    font-size: 32px;
    font-weight: 200;
    letter-spacing: -0.03em;
    margin-top: 6px;
    color: var(--ink);
  }
  .hint {
    font-size: 12px;
    color: var(--ink-faint);
    margin-top: 8px;
  }

  .corpo {
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .volume-grande {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 10px;
  }
  .num {
    font-size: 48px;
    font-weight: 200;
    letter-spacing: -0.03em;
    color: var(--ink);
  }
  .u {
    font-size: 12px;
    color: var(--ink-faint);
  }

  .rodape {
    padding: 20px 32px;
    border-top: 1px solid var(--linha);
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
</style>
