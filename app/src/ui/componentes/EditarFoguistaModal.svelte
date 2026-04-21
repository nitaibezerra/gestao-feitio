<script lang="ts">
  import type { Feitio } from '../../domain/entities/feitio';
  import BtnPill from './primitivos/BtnPill.svelte';
  import FieldGroup from './primitivos/FieldGroup.svelte';

  export type PayloadEditarFoguista = { foguista: string };

  type Props = {
    feitio: Feitio;
    onClose: () => void;
    onConfirm: (p: PayloadEditarFoguista) => void;
  };
  let { feitio, onClose, onConfirm }: Props = $props();

  let foguista = $state<string>('');
  let inicializado = false;
  $effect(() => {
    if (inicializado) return;
    inicializado = true;
    foguista = feitio.foguista ?? '';
  });

  function confirmar() {
    onConfirm({ foguista: foguista.trim() });
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onClose()} />

<div class="overlay" role="presentation">
  <button class="close-area" aria-label="Fechar modal" onclick={onClose}></button>
  <div class="modal" role="dialog" aria-modal="true" aria-label="Editar foguista">
    <div class="cabecalho">
      <div class="mono eyebrow">papel</div>
      <div class="serif titulo">Foguista</div>
    </div>

    <div class="corpo">
      <FieldGroup label="nome do foguista">
        <input
          class="input-txt"
          type="text"
          bind:value={foguista}
          placeholder="nome do foguista"
          aria-label="nome do foguista"
        />
      </FieldGroup>
      <div class="rodape">
        <BtnPill variante="ghost" onclick={onClose}>Cancelar</BtnPill>
        <BtnPill variante="primary" onclick={confirmar}>Confirmar</BtnPill>
      </div>
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
    max-width: 480px;
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
  .corpo {
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .input-txt {
    width: 100%;
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--linha);
    color: var(--ink);
    font-family: inherit;
    font-size: 20px;
    font-weight: 300;
    padding: 6px 4px;
    transition: border-color 0.15s;
  }
  .input-txt:focus {
    outline: none;
    border-bottom-color: var(--azul);
  }
  .rodape {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
</style>
