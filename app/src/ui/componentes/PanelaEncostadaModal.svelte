<script lang="ts">
  import type { Panela } from '../../domain/entities/panela';
  import { conteudoLabel, fmtDuracao } from '../labels';
  import { useRelogio } from '../relogio.svelte';
  import BtnPill from './primitivos/BtnPill.svelte';
  import FieldGroup from './primitivos/FieldGroup.svelte';
  import Pill from './primitivos/Pill.svelte';
  import PillRow from './primitivos/PillRow.svelte';

  export type PayloadVoltarAoFogo = { bocaNumero: number };
  export type PayloadTirarDireto = { volumeL: number };

  type Props = {
    panela: Panela;
    bocasVazias: number[];
    onClose: () => void;
    onVoltar: (p: PayloadVoltarAoFogo) => void;
    onTirarDireto: (p: PayloadTirarDireto) => void;
  };
  let { panela, bocasVazias, onClose, onVoltar, onTirarDireto }: Props = $props();

  type Modo = 'escolha' | 'voltar' | 'tirar';
  let modo = $state<Modo>('escolha');

  const relogio = useRelogio();
  const tempoParadoMs = $derived(
    panela.encostadaDesde
      ? relogio.valor.getTime() - panela.encostadaDesde.getTime()
      : 0
  );

  let bocaSelecionada = $state<number>(0);
  $effect(() => {
    if (modo === 'voltar' && (bocaSelecionada === 0 || !bocasVazias.includes(bocaSelecionada))) {
      bocaSelecionada = bocasVazias[0] ?? 1;
    }
  });

  let volumeTirar = $state(0);
  const metaSugerida = $derived(Math.max(1, Math.floor((panela.volumeAtualL ?? 0) / 2)));
  $effect(() => {
    if (modo === 'tirar') volumeTirar = metaSugerida;
  });

  function confirmarVoltar() {
    onVoltar({ bocaNumero: bocaSelecionada });
  }

  function confirmarTirar() {
    onTirarDireto({ volumeL: volumeTirar });
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onClose()} />

<div class="overlay" role="presentation">
  <button class="close-area" aria-label="Fechar modal" onclick={onClose}></button>
  <div class="modal" role="dialog" aria-modal="true" aria-label="Panela encostada {panela.numero}">
    <div class="cabecalho">
      <div>
        <div class="mono eyebrow">encostada</div>
        <div class="serif titulo">
          Panela {String(panela.numero).padStart(2, '0')}
        </div>
        <div class="subt">
          com <span class="forte">{conteudoLabel(panela.conteudo).toLowerCase()}</span>
          <span class="sep">·</span>
          parada há <span class="mono forte">{fmtDuracao(tempoParadoMs)}</span>
        </div>
      </div>
      <button class="fechar" onclick={onClose} aria-label="Fechar">×</button>
    </div>

    <div class="corpo">
      {#if modo === 'escolha'}
        <div class="escolha">
          <BtnPill variante="primary" onclick={() => (modo = 'voltar')}>
            Voltar ao fogo
          </BtnPill>
          <BtnPill variante="ghost" onclick={() => (modo = 'tirar')}>
            Tirar material direto
          </BtnPill>
        </div>
      {:else if modo === 'voltar'}
        {#if bocasVazias.length === 0}
          <div class="aviso mono">Não há boca livre — libere uma antes.</div>
          <div class="acoes">
            <BtnPill variante="ghost" onclick={() => (modo = 'escolha')}>Voltar</BtnPill>
          </div>
        {:else}
          <FieldGroup label="qual boca">
            <PillRow>
              {#each bocasVazias as b (b)}
                <Pill active={bocaSelecionada === b} onclick={() => (bocaSelecionada = b)}>
                  Boca {b}
                </Pill>
              {/each}
            </PillRow>
          </FieldGroup>
          <div class="acoes">
            <BtnPill variante="ghost" onclick={() => (modo = 'escolha')}>Cancelar</BtnPill>
            <BtnPill variante="primary" onclick={confirmarVoltar}>Voltar ao fogo</BtnPill>
          </div>
        {/if}
      {:else if modo === 'tirar'}
        <FieldGroup label="volume da tiragem">
          <div class="volume-grande">
            <input
              class="serif num input-num"
              type="number"
              min="0"
              max={panela.volumeAtualL ?? 0}
              bind:value={volumeTirar}
              aria-label="volume da tiragem"
            />
            <span class="mono u">L</span>
          </div>
          <PillRow>
            {#each [metaSugerida, metaSugerida - 5, metaSugerida + 5].filter((v) => v > 0 && v <= (panela.volumeAtualL ?? 0)) as v (v)}
              <Pill active={volumeTirar === v} onclick={() => (volumeTirar = v)}>{v} L</Pill>
            {/each}
          </PillRow>
        </FieldGroup>
        <div class="acoes">
          <BtnPill variante="ghost" onclick={() => (modo = 'escolha')}>Cancelar</BtnPill>
          <BtnPill variante="primary" onclick={confirmarTirar}>Confirmar tiragem</BtnPill>
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
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .eyebrow {
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }
  .titulo {
    font-size: 40px;
    font-weight: 200;
    letter-spacing: -0.03em;
    margin-top: 6px;
    color: var(--ink);
  }
  .subt {
    margin-top: 10px;
    font-size: 13px;
    color: var(--ink-soft);
  }
  .forte {
    color: var(--ink);
  }
  .sep {
    color: var(--ink-faint);
    margin: 0 8px;
  }
  .fechar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--linha);
    color: var(--ink-soft);
    font-size: 16px;
    transition: border-color 0.15s;
  }
  .fechar:hover {
    border-color: var(--linha-strong);
    color: var(--ink);
  }
  .corpo {
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .escolha {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .volume-grande {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 10px;
  }
  .num {
    font-size: 40px;
    font-weight: 200;
    letter-spacing: -0.03em;
    color: var(--ink);
  }
  .input-num {
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--linha);
    color: var(--ink);
    font-family: inherit;
    width: 5ch;
    padding: 0 4px 4px;
    text-align: left;
    transition: border-color 0.15s;
    -moz-appearance: textfield;
    appearance: textfield;
  }
  .input-num:focus {
    outline: none;
    border-bottom-color: var(--azul);
  }
  .input-num::-webkit-inner-spin-button,
  .input-num::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .u {
    font-size: 12px;
    color: var(--ink-faint);
  }
  .acoes {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  .aviso {
    font-size: 12px;
    color: var(--ink-soft);
    padding: 12px;
    background: var(--surface-mute, var(--linha));
    border-radius: 8px;
  }
</style>
