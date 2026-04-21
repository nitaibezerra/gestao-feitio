<script lang="ts">
  import type { TipoConteudo, OrdemCozimento } from '../../domain/entities/panela';
  import type { Tonel } from '../../domain/entities/tonel';
  import { conteudoLabel } from '../labels';
  import BtnPill from './primitivos/BtnPill.svelte';
  import FieldGroup from './primitivos/FieldGroup.svelte';
  import Pill from './primitivos/Pill.svelte';
  import PillRow from './primitivos/PillRow.svelte';

  export type PayloadNovaPanela = {
    bocaNumero: number;
    conteudo: TipoConteudo;
    volumeL: number;
    metaTiragemL: number;
  };

  type Props = {
    bocasVazias: number[];
    toneis: Array<Pick<Tonel, 'tipo' | 'ordem' | 'volumeL'>>;
    onClose: () => void;
    onConfirm: (p: PayloadNovaPanela) => void;
  };
  let { bocasVazias, toneis, onClose, onConfirm }: Props = $props();

  let bocaSelecionada = $state<number>(0);
  let conteudoKey = $state<string>('agua');
  let volume = $state<number>(60);
  let meta = $state<number>(30);

  $effect(() => {
    if (bocaSelecionada === 0 || !bocasVazias.includes(bocaSelecionada)) {
      bocaSelecionada = bocasVazias[0] ?? 1;
    }
  });

  const opcoesConteudo = $derived.by<Array<{ key: string; label: string; c: TipoConteudo }>>(() => {
    const base: Array<{ key: string; label: string; c: TipoConteudo }> = [
      { key: 'agua', label: 'Água', c: { tipo: 'agua' } }
    ];
    for (const t of toneis) {
      if (t.tipo === 'cozimento' && t.ordem && t.volumeL > 0) {
        base.push({
          key: `coz${t.ordem}`,
          label: `${t.ordem}º coz. · ${t.volumeL} L`,
          c: { tipo: 'cozimento', ordem: t.ordem as OrdemCozimento }
        });
      }
    }
    return base;
  });

  const conteudoSelecionado = $derived(
    opcoesConteudo.find((o) => o.key === conteudoKey) ?? opcoesConteudo[0]
  );

  function confirmar() {
    if (!conteudoSelecionado) return;
    onConfirm({
      bocaNumero: bocaSelecionada,
      conteudo: conteudoSelecionado.c,
      volumeL: volume,
      metaTiragemL: meta
    });
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onClose()} />

<div class="overlay" role="presentation">
  <button class="close-area" aria-label="Fechar modal" onclick={onClose}></button>
  <div class="modal" role="dialog" aria-modal="true" aria-label="Nova panela">
    <div class="cabecalho">
      <div class="mono eyebrow">criar</div>
      <div class="serif titulo">Nova panela na fornalha</div>
      <div class="hint">
        {bocasVazias.length} boca{bocasVazias.length !== 1 ? 's' : ''} livre{bocasVazias.length !== 1 ? 's' : ''}:
        {bocasVazias.join(', ') || '—'}
      </div>
    </div>

    <div class="corpo">
      {#if bocasVazias.length > 1}
        <FieldGroup label="qual boca">
          <PillRow>
            {#each bocasVazias as b (b)}
              <Pill active={bocaSelecionada === b} onclick={() => (bocaSelecionada = b)}>
                Boca {b}
              </Pill>
            {/each}
          </PillRow>
        </FieldGroup>
      {/if}

      <FieldGroup label="entra com">
        <PillRow>
          {#each opcoesConteudo as o (o.key)}
            <Pill active={conteudoKey === o.key} onclick={() => (conteudoKey = o.key)}>
              {o.label}
            </Pill>
          {/each}
        </PillRow>
      </FieldGroup>

      <FieldGroup label="volume">
        <div class="volume-grande">
          <input
            class="serif num input-num"
            type="number"
            min="0"
            bind:value={volume}
            aria-label="volume da panela"
          />
          <span class="mono u">L</span>
        </div>
        <PillRow>
          {#each [50, 55, 60, 65] as v (v)}
            <Pill active={volume === v} onclick={() => (volume = v)}>{v} L</Pill>
          {/each}
        </PillRow>
      </FieldGroup>

      <FieldGroup label="vai tirar em">
        <div class="volume-grande">
          <input
            class="serif num-m input-num"
            type="number"
            min="0"
            bind:value={meta}
            aria-label="meta de tiragem"
          />
          <span class="mono u">L</span>
        </div>
        <PillRow>
          {#each [30, 40, 50] as v (v)}
            <Pill active={meta === v} onclick={() => (meta = v)}>{v} L</Pill>
          {/each}
        </PillRow>
      </FieldGroup>

      <div class="preview mono">
        Vai entrar <span class="forte">{conteudoLabel(conteudoSelecionado.c)}</span>
        na <span class="forte">boca {bocaSelecionada}</span> com
        <span class="forte">{volume} L</span>, meta
        <span class="forte">{meta} L</span>
      </div>
    </div>

    <div class="rodape">
      <BtnPill variante="ghost" onclick={onClose}>Cancelar</BtnPill>
      <BtnPill variante="primary" onclick={confirmar}>Entrar no fogo</BtnPill>
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
    font-size: 12px;
    color: var(--ink-faint);
    margin-top: 8px;
  }

  .corpo {
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .volume-grande {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 10px;
  }
  .num {
    font-size: 48px;
    font-weight: 200;
    letter-spacing: -0.03em;
    color: var(--ink);
  }
  .num-m {
    font-size: 32px;
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

  .preview {
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.05em;
  }
  .preview .forte {
    color: var(--ink);
  }

  .rodape {
    padding: 20px 32px;
    border-top: 1px solid var(--linha);
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
</style>
