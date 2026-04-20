<script lang="ts">
  import { fmtHora } from '../labels';
  import BtnPill from './primitivos/BtnPill.svelte';

  type UltimoEvento = { texto: string; momento: Date };

  type Props = {
    ultimoEvento?: UltimoEvento;
    onNova?: () => void;
    onUndo?: () => void;
  };
  let { ultimoEvento, onNova, onUndo }: Props = $props();
</script>

<footer>
  <div class="evento">
    {#if ultimoEvento}
      <span class="mono rotulo">último</span>
      <span class="texto">{ultimoEvento.texto}</span>
      <span class="mono hora">{fmtHora(ultimoEvento.momento)}</span>
    {/if}
  </div>
  <div class="acoes">
    <BtnPill variante="ghost" onclick={onUndo}>Desfazer</BtnPill>
    <BtnPill variante="primary" onclick={onNova}>Nova panela</BtnPill>
  </div>
</footer>

<style>
  footer {
    margin-top: auto;
    padding-top: 24px;
    border-top: 1px solid var(--linha);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }
  .evento {
    font-size: 12px;
    color: var(--ink-soft);
    display: flex;
    align-items: baseline;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }
  .rotulo {
    color: var(--ink-faint);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-size: 10px;
  }
  .texto {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .hora {
    color: var(--ink-faint);
  }
  .acoes {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
  }
</style>
