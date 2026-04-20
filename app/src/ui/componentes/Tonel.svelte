<script lang="ts">
  import type { TonelVisao } from '../visao';
  import { tonelCor, tonelLabel } from '../labels';

  type Props = { tonel: TonelVisao };
  let { tonel }: Props = $props();

  const pct = $derived((tonel.volumeL / tonel.capacidadeL) * 100);
  const cor = $derived(tonelCor(tonel));
</script>

<div class="card">
  <div class="topo">
    <span class="mono eyebrow">T{tonel.numero}</span>
    <span class="serif numero">{tonel.volumeL}</span>
  </div>
  <div class="label">{tonelLabel(tonel)}</div>
  <div class="footer">
    <div class="barra"><div class="fill" style:width="{pct}%" style:background={cor}></div></div>
    <div class="mono legenda">
      {Math.round(pct)}% · {tonel.capacidadeL} L
    </div>
  </div>
</div>

<style>
  .card {
    padding: 14px;
    border-radius: 14px;
    background: var(--surface);
    border: 1px solid var(--linha);
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 130px;
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
    font-size: 20px;
    font-weight: 300;
    color: var(--ink);
    letter-spacing: -0.02em;
  }
  .label {
    font-size: 12px;
    font-weight: 500;
    color: var(--ink);
    letter-spacing: -0.01em;
    line-height: 1.2;
  }
  .footer {
    margin-top: auto;
  }
  .barra {
    height: 3px;
    background: var(--linha);
    border-radius: 2px;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.4s ease-out;
  }
  .legenda {
    font-size: 9px;
    color: var(--ink-faint);
    margin-top: 4px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
</style>
