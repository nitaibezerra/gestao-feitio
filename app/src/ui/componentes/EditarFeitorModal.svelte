<script lang="ts">
  import type { Feitio } from '../../domain/entities/feitio';
  import BtnPill from './primitivos/BtnPill.svelte';
  import FieldGroup from './primitivos/FieldGroup.svelte';

  export type PayloadEditarFeitor = {
    encarregado?: string;
    feitorAusente?: boolean;
  };

  type Props = {
    feitio: Feitio;
    onClose: () => void;
    onConfirm: (p: PayloadEditarFeitor) => void;
  };
  let { feitio, onClose, onConfirm }: Props = $props();

  // Modo local: "presente" mostra o feitor e um CTA para definir encarregado.
  // Modo "ausente" mostra input de encarregado e botão para marcar retorno.
  type Modo = 'presente' | 'ausente';
  // Inicialização a partir da prop via $derived.by (avalia uma vez, em ordem).
  let modo = $state<Modo>('presente');
  let encarregado = $state<string>('');
  let inicializado = false;
  $effect(() => {
    if (inicializado) return;
    inicializado = true;
    modo = feitio.feitorAusente ? 'ausente' : 'presente';
    encarregado = feitio.encarregado ?? '';
  });

  function definirEncarregado() {
    modo = 'ausente';
  }

  function confirmarAusencia() {
    const nome = encarregado.trim();
    if (!nome) return; // botão fica desabilitado
    onConfirm({ encarregado: nome, feitorAusente: true });
  }

  function feitorVoltou() {
    onConfirm({ feitorAusente: false });
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onClose()} />

<div class="overlay" role="presentation">
  <button class="close-area" aria-label="Fechar modal" onclick={onClose}></button>
  <div class="modal" role="dialog" aria-modal="true" aria-label="Editar feitor">
    <div class="cabecalho">
      <div class="mono eyebrow">papel</div>
      <div class="serif titulo">Feitor</div>
      <div class="hint">
        {feitio.feitor}{#if modo === 'ausente'} <span class="ausente">(ausente)</span>{/if}
      </div>
    </div>

    <div class="corpo">
      {#if modo === 'presente'}
        <p class="info mono">
          O feitor titular está presente. Se precisar sair, defina um encarregado
          que cobrirá sua ausência.
        </p>
        <div class="rodape">
          <BtnPill variante="ghost" onclick={onClose}>Cancelar</BtnPill>
          <BtnPill variante="primary" onclick={definirEncarregado}>
            Definir encarregado
          </BtnPill>
        </div>
      {:else}
        <FieldGroup label="encarregado">
          <input
            class="input-txt"
            type="text"
            bind:value={encarregado}
            placeholder="nome do encarregado"
            aria-label="nome do encarregado"
          />
        </FieldGroup>
        <div class="rodape">
          <BtnPill variante="ghost" onclick={feitorVoltou}>Feitor voltou</BtnPill>
          <div class="espaco"></div>
          <BtnPill variante="ghost" onclick={onClose}>Cancelar</BtnPill>
          <BtnPill variante="primary" onclick={confirmarAusencia}>Confirmar</BtnPill>
        </div>
      {/if}
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
  .hint {
    font-size: 13px;
    color: var(--ink-soft);
    margin-top: 8px;
  }
  .ausente {
    color: var(--ink-faint);
    font-style: italic;
  }
  .corpo {
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .info {
    font-size: 12px;
    color: var(--ink-soft);
    letter-spacing: 0.02em;
    line-height: 1.6;
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
    align-items: center;
    justify-content: flex-end;
  }
  .espaco {
    flex: 1;
  }
</style>
