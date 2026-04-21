<script lang="ts">
  import type { TonelVisao } from '../visao';
  import { tonelLabel } from '../labels';

  type Props = { tonel: TonelVisao };
  let { tonel }: Props = $props();
</script>

<div class="card">
  <div class="topo">
    <span class="mono eyebrow">T{tonel.numero}</span>
    <span class="serif numero">{tonel.volumeL}</span>
  </div>
  <div class="label">{tonelLabel(tonel)}</div>
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
    min-height: 110px;
    width: 180px;
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
</style>
