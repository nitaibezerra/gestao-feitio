<script lang="ts">
  import type { PanelaVisao } from '../visao';
  import { fmtDuracao, tiragemCor, tiragemLabel } from '../labels';
  import { useRelogio } from '../relogio.svelte';
  import VolRing from './VolRing.svelte';

  type Props = {
    boca: number;
    panela?: PanelaVisao;
    onclick?: () => void;
    onclickEmpty?: () => void;
  };
  let { boca, panela, onclick, onclickEmpty }: Props = $props();

  const relogio = useRelogio();
  const CAPACIDADE_L = 120;

  const tempoMs = $derived(
    panela?.entradaFogoEm ? relogio.valor.getTime() - panela.entradaFogoEm.getTime() : 0
  );
  const volPct = $derived(
    panela ? Math.min(100, ((panela.volumeAtualL ?? 0) / CAPACIDADE_L) * 100) : 0
  );
  const metaPct = $derived(
    panela ? Math.min(100, (panela.metaTiragemL / CAPACIDADE_L) * 100) : 0
  );
  const cor = $derived(panela ? tiragemCor(panela.proxTiragem) : 'var(--ink-soft)');
</script>

{#if !panela}
  <button class="vazia" onclick={onclickEmpty}>
    <span class="mono eyebrow">Boca {boca}</span>
    <span class="plus">+</span>
  </button>
{:else}
  <button class="card" {onclick}>
    <div class="topo">
      <span class="mono eyebrow">Boca {boca}</span>
      <span class="mono tempo">{fmtDuracao(tempoMs)}</span>
    </div>

    <div class="serif numero">
      {String(panela.numero).padStart(2, '0')}
    </div>

    <div class="vai-tirar">
      <div class="mono eyebrow">vai tirar</div>
      <div class="label" style:color={cor}>
        {tiragemLabel(panela.proxTiragem)}
      </div>
    </div>

    <div class="volume">
      <VolRing {volPct} {metaPct} {cor} />
      <div>
        <div class="volume-num">
          <span class="v">{panela.volumeAtualL ?? 0}</span>
          <span class="mono u">L</span>
        </div>
        <div class="mono meta">meta {panela.metaTiragemL}</div>
      </div>
    </div>
  </button>
{/if}

<style>
  .vazia,
  .card {
    min-height: 200px;
    border-radius: 16px;
    background: var(--surface);
    padding: 16px 14px 14px;
    text-align: left;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  }
  .vazia {
    border: 1px dashed var(--linha);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 8px;
    color: var(--ink-faint);
  }
  .vazia:hover {
    border-color: var(--azul-claro);
  }
  .vazia .plus {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--linha);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 200;
  }

  .card {
    border: 1px solid var(--linha);
    display: flex;
    flex-direction: column;
    box-shadow:
      0 1px 2px rgba(40, 60, 90, 0.04),
      0 8px 24px rgba(40, 60, 90, 0.03);
  }
  .card:hover {
    border-color: var(--linha-strong);
    transform: translateY(-1px);
    box-shadow:
      0 1px 2px rgba(40, 60, 90, 0.06),
      0 12px 32px rgba(40, 60, 90, 0.05);
  }

  .topo {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 14px;
  }

  .eyebrow {
    font-size: 9px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }
  .vazia .eyebrow {
    font-size: 9px;
    letter-spacing: 0.3em;
  }

  .tempo {
    font-size: 11px;
    color: var(--ink-soft);
    font-variant-numeric: tabular-nums;
  }

  .numero {
    font-size: 64px;
    line-height: 0.85;
    font-weight: 200;
    color: var(--ink);
    letter-spacing: -0.04em;
    margin-bottom: 10px;
  }

  .vai-tirar {
    margin-bottom: 14px;
  }
  .vai-tirar .eyebrow {
    margin-bottom: 2px;
  }
  .vai-tirar .label {
    font-size: 16px;
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.15;
  }

  .volume {
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .volume-num {
    display: flex;
    align-items: baseline;
    gap: 2px;
  }
  .volume-num .v {
    font-size: 20px;
    font-weight: 400;
    color: var(--ink);
    letter-spacing: -0.02em;
  }
  .volume-num .u {
    font-size: 10px;
    color: var(--ink-faint);
  }
  .meta {
    font-size: 9px;
    color: var(--ink-faint);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
</style>
