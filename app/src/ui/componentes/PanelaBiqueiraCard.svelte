<script lang="ts">
  import type { Panela } from '../../domain/entities/panela';
  import { conteudoLabel } from '../labels';

  type Props = {
    panela: Panela;
    onclick?: () => void;
  };
  let { panela, onclick }: Props = $props();
</script>

<button
  class="card"
  {onclick}
  aria-label="Panela na biqueira {String(panela.numero).padStart(2, '0')}"
>
  <div class="topo">
    <span class="mono eyebrow">Panela</span>
    <span class="serif numero">{String(panela.numero).padStart(2, '0')}</span>
  </div>
  <div class="conteudo">
    <span class="mono eyebrow">contém</span>
    <span class="valor">{conteudoLabel(panela.conteudo)}</span>
  </div>
  <div class="volume">
    <span class="mono eyebrow">volume</span>
    <span class="serif valor-destaque">{panela.volumeAtualL ?? 0} <span class="mono u">L</span></span>
  </div>
</button>

<style>
  .card {
    padding: 14px;
    border-radius: 14px;
    background: var(--surface);
    border: 1px solid var(--linha);
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 150px;
    width: 180px;
    text-align: left;
    transition: border-color 0.15s, transform 0.15s;
  }
  .card:hover {
    border-color: var(--linha-strong);
    transform: translateY(-1px);
  }
  .topo {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .eyebrow {
    font-size: 9px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }
  .numero {
    font-size: 22px;
    font-weight: 300;
    letter-spacing: -0.02em;
    color: var(--ink);
  }
  .conteudo,
  .volume {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .valor {
    font-size: 13px;
    color: var(--ink);
  }
  .valor-destaque {
    font-size: 28px;
    font-weight: 200;
    letter-spacing: -0.02em;
    color: var(--ink);
  }
  .u {
    font-size: 11px;
    color: var(--ink-faint);
    font-family: var(--mono, ui-monospace, monospace);
    margin-left: 2px;
  }
</style>
