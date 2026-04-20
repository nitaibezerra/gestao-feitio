<script lang="ts">
  import { fmtHora } from '../labels';
  import BtnPill from './primitivos/BtnPill.svelte';

  type UltimoEvento = { texto: string; momento: Date };

  type Props = {
    ultimoEvento?: UltimoEvento;
    onNova?: () => void;
    onUndo?: () => void;
    onTrocar?: () => void;
    onCancelarTrocar?: () => void;
    onEncerrar?: () => void;
    modoTrocar?: boolean;
    hintTrocar?: string;
  };
  let {
    ultimoEvento,
    onNova,
    onUndo,
    onTrocar,
    onCancelarTrocar,
    onEncerrar,
    modoTrocar = false,
    hintTrocar
  }: Props = $props();
</script>

<footer>
  <div class="evento">
    {#if modoTrocar}
      <span class="mono rotulo">trocar</span>
      <span class="texto">{hintTrocar ?? 'clique em duas panelas para trocar as bocas'}</span>
    {:else if ultimoEvento}
      <span class="mono rotulo">último</span>
      <span class="texto">{ultimoEvento.texto}</span>
      <span class="mono hora">{fmtHora(ultimoEvento.momento)}</span>
    {/if}
  </div>
  <div class="acoes">
    {#if modoTrocar}
      <BtnPill variante="ghost" onclick={onCancelarTrocar}>Cancelar</BtnPill>
    {:else}
      {#if onEncerrar}
        <button class="encerrar mono" onclick={onEncerrar}>Encerrar feitio</button>
      {/if}
      <BtnPill variante="ghost" onclick={onTrocar}>Trocar posição</BtnPill>
      <BtnPill variante="ghost" onclick={onUndo}>Desfazer</BtnPill>
      <BtnPill variante="primary" onclick={onNova}>Nova panela</BtnPill>
    {/if}
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
    align-items: center;
  }
  .encerrar {
    font-size: 11px;
    color: var(--ink-faint);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    background: none;
    border: none;
    padding: 8px 12px;
    cursor: pointer;
    transition: color 0.15s;
  }
  .encerrar:hover {
    color: var(--ink-soft);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
