<script lang="ts">
  import type { PanelaMock } from '../mock-feitio';
  import {
    conteudoLabel,
    fmtDuracao,
    fmtHora,
    tiragemCor,
    tiragemLabel
  } from '../labels';
  import { useRelogio } from '../relogio.svelte';
  import BtnPill from './primitivos/BtnPill.svelte';

  type Props = {
    panela: PanelaMock;
    onClose: () => void;
  };
  let { panela, onClose }: Props = $props();

  const relogio = useRelogio();
  const tempoMs = $derived(
    panela.entradaFogoEm ? relogio.valor.getTime() - panela.entradaFogoEm.getTime() : 0
  );
  const cor = $derived(tiragemCor(panela.proxTiragem));
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onClose()} />

<div class="overlay" role="presentation">
  <button class="close-area" aria-label="Fechar modal" onclick={onClose}></button>
  <div class="modal" role="dialog" aria-modal="true" aria-label="Detalhe da panela {panela.numero}">
    <!-- Cabeçalho -->
    <div class="cabecalho">
      <div>
        <div class="mono eyebrow">Boca {panela.boca}</div>
        <div class="serif titulo">
          Panela {String(panela.numero).padStart(2, '0')}
        </div>
        <div class="subt">
          com <span class="forte">{conteudoLabel(panela.conteudo).toLowerCase()}</span>
          <span class="sep">·</span>
          há <span class="mono forte">{fmtDuracao(tempoMs)}</span> no fogo
        </div>
      </div>
      <button class="fechar" onclick={onClose} aria-label="Fechar">×</button>
    </div>

    <!-- Próxima tiragem + volume -->
    <div class="linha-dupla">
      <div class="cell">
        <div class="mono eyebrow">vai tirar</div>
        <div class="serif big" style:color={cor}>
          {tiragemLabel(panela.proxTiragem)}
        </div>
      </div>
      <div class="cell sep-esq">
        <div class="mono eyebrow">volume · meta</div>
        <div class="vol">
          <span class="serif big-ink">{panela.volumeAtualL ?? 0}</span>
          <span class="mono u">L</span>
          <span class="slash">/</span>
          <span class="meta">{panela.metaTiragemL} L</span>
        </div>
      </div>
    </div>

    <!-- Tiragens anteriores -->
    <div class="tiragens">
      <div class="mono eyebrow">
        tiragens anteriores · {panela.tiragens.length}
      </div>
      {#if panela.tiragens.length === 0}
        <div class="empty">Primeira tiragem ainda não foi feita.</div>
      {:else}
        <div class="lista">
          {#each panela.tiragens as t, i (i)}
            <div class="row" class:primeira={i === 0}>
              <span class="mono ord">{t.sequencia}ª</span>
              <span class="label">{tiragemLabel(t.tipo)}</span>
              <span>
                <span class="serif vol-num">{t.volumeL}</span>
                <span class="mono vol-u">L</span>
              </span>
              <span class="mono hora">{fmtHora(t.momento)}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Ações -->
    <div class="acoes">
      <BtnPill variante="primary" accent={cor}>
        Tirar — {tiragemLabel(panela.proxTiragem).toLowerCase()}
      </BtnPill>
      <BtnPill variante="ghost">Repor</BtnPill>
      <BtnPill variante="ghost">Pausar</BtnPill>
      <div class="espaco"></div>
      <button class="link">histórico completo</button>
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
    max-width: 640px;
    background: var(--surface);
    border: 1px solid var(--linha);
    border-radius: 18px;
    box-shadow: 0 24px 60px rgba(40, 60, 90, 0.18);
    overflow: hidden;
  }

  .cabecalho {
    padding: 28px 32px 24px;
    border-bottom: 1px solid var(--linha);
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .eyebrow {
    font-size: 10px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }
  .titulo {
    font-size: 56px;
    line-height: 0.9;
    font-weight: 200;
    letter-spacing: -0.04em;
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

  .linha-dupla {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid var(--linha);
  }
  .cell {
    padding: 24px 32px;
  }
  .sep-esq {
    border-left: 1px solid var(--linha);
  }
  .big {
    font-size: 26px;
    font-weight: 300;
    letter-spacing: -0.02em;
    margin-top: 6px;
  }
  .vol {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-top: 6px;
  }
  .big-ink {
    font-size: 26px;
    font-weight: 300;
    color: var(--ink);
  }
  .u {
    font-size: 12px;
    color: var(--ink-faint);
  }
  .slash {
    color: var(--ink-faint);
    margin: 0 6px;
  }
  .meta {
    font-size: 16px;
    color: var(--ink-soft);
  }

  .tiragens {
    padding: 24px 32px;
  }
  .tiragens .eyebrow {
    margin-bottom: 14px;
  }
  .empty {
    font-size: 13px;
    color: var(--ink-faint);
    font-style: italic;
    padding: 12px 0;
  }
  .lista {
    display: flex;
    flex-direction: column;
  }
  .row {
    display: grid;
    grid-template-columns: 32px 1fr auto auto;
    gap: 16px;
    align-items: baseline;
    padding: 12px 0;
    border-top: 1px solid var(--linha);
  }
  .row.primeira {
    border-top: none;
  }
  .ord {
    font-size: 11px;
    color: var(--ink-faint);
  }
  .label {
    font-size: 14px;
    color: var(--ink);
  }
  .vol-num {
    font-size: 18px;
  }
  .vol-u {
    font-size: 10px;
    color: var(--ink-faint);
    margin-left: 2px;
  }
  .hora {
    font-size: 11px;
    color: var(--ink-faint);
  }

  .acoes {
    padding: 20px 32px;
    border-top: 1px solid var(--linha);
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }
  .espaco {
    flex: 1;
  }
  .link {
    font-size: 12px;
    color: var(--ink-faint);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .link:hover {
    color: var(--ink-soft);
  }
</style>
