<script lang="ts">
  import type { Panela } from '../../domain/entities/panela';
  import { conteudoLabel, fmtDuracao } from '../labels';
  import { useRelogio } from '../relogio.svelte';

  type Props = {
    panela: Panela;
    onclick?: () => void;
  };
  let { panela, onclick }: Props = $props();

  const relogio = useRelogio();
  const tempoParadoMs = $derived(
    panela.encostadaDesde
      ? relogio.valor.getTime() - panela.encostadaDesde.getTime()
      : 0
  );
</script>

<button
  class="card"
  {onclick}
  aria-label="Panela encostada {String(panela.numero).padStart(2, '0')}"
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
    <span class="valor">{panela.volumeAtualL ?? 0} L</span>
  </div>
  <div class="parada">
    <span class="mono eyebrow">parada há</span>
    <span class="mono valor">{fmtDuracao(tempoParadoMs)}</span>
  </div>
</button>

<style>
  .card {
    padding: 14px;
    border-radius: 14px;
    background: var(--surface);
    border: 1px dashed var(--linha);
    display: flex;
    flex-direction: column;
    gap: 8px;
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
  .volume,
  .parada {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .valor {
    font-size: 13px;
    color: var(--ink);
  }
  .parada .valor {
    font-size: 12px;
    color: var(--ink-soft);
    font-variant-numeric: tabular-nums;
  }
</style>
