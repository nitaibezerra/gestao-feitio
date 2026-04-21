<script lang="ts">
  import type { PanelaVisao } from '../visao';
  import type { TipoConteudo, OrdemCozimento } from '../../domain/entities/panela';
  import type { Tonel } from '../../domain/entities/tonel';
  import {
    conteudoLabel,
    fmtDuracao,
    fmtHora,
    tiragemCor,
    tiragemLabel
  } from '../labels';
  import { useRelogio } from '../relogio.svelte';
  import BtnPill from './primitivos/BtnPill.svelte';
  import Pill from './primitivos/Pill.svelte';
  import PillRow from './primitivos/PillRow.svelte';
  import FieldGroup from './primitivos/FieldGroup.svelte';

  export type PayloadTirar = { volumeL: number };
  export type PayloadRepor = { conteudo: TipoConteudo; volumeL: number };
  export type PayloadEditar = {
    numero?: number;
    volumeAtualL?: number;
    metaTiragemL?: number;
    entradaFogoEm?: string;
  };

  type Props = {
    panela: PanelaVisao;
    toneis: Array<Pick<Tonel, 'tipo' | 'ordem' | 'volumeL'>>;
    onClose: () => void;
    onTirar: (p: PayloadTirar) => void;
    onRepor: (p: PayloadRepor) => void;
    onPausar: () => void;
    onRetomar: () => void;
    onDescartar: () => void;
    onEditar: (p: PayloadEditar) => void;
  };
  let {
    panela,
    toneis,
    onClose,
    onTirar,
    onRepor,
    onPausar,
    onRetomar,
    onDescartar,
    onEditar
  }: Props = $props();

  const relogio = useRelogio();
  const tempoMs = $derived(
    panela.entradaFogoEm ? relogio.valor.getTime() - panela.entradaFogoEm.getTime() : 0
  );
  const cor = $derived(tiragemCor(panela.proxTiragem));

  // Sub-formulários:
  type Modo = 'principal' | 'tirar' | 'repor' | 'editar';
  let modo = $state<Modo>('principal');

  // Estado do sub-form de Tirar
  const metaSugerida = $derived(Math.max(1, Math.floor((panela.volumeAtualL ?? 0) / 2)));
  let volumeTirar = $state(0);
  $effect(() => {
    if (modo === 'tirar') {
      volumeTirar = metaSugerida;
    }
  });

  // Estado do sub-form de Repor
  let volumeRepor = $state(60);
  let conteudoReporKey = $state<string>('agua');

  // Estado do sub-form de Editar
  let editarNumero = $state(0);
  let editarVolume = $state(0);
  let editarMeta = $state(0);
  let editarEntrada = $state<string>('');
  $effect(() => {
    if (modo === 'editar') {
      editarNumero = panela.numero;
      editarVolume = panela.volumeAtualL ?? 0;
      editarMeta = panela.metaTiragemL ?? 0;
      editarEntrada = panela.entradaFogoEm
        ? toLocalDatetimeInput(panela.entradaFogoEm)
        : '';
    }
  });

  function toLocalDatetimeInput(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const opcoesConteudoRepor = $derived.by<Array<{ key: string; label: string; c: TipoConteudo }>>(() => {
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
  const conteudoReporSelecionado = $derived(
    opcoesConteudoRepor.find((o) => o.key === conteudoReporKey) ?? opcoesConteudoRepor[0]
  );

  const pausado = $derived(panela.estado === 'fora_do_fogo' || panela.tempoPausado === true);
  const podeTirar = $derived(panela.estado === 'no_fogo');
  const podeRepor = $derived(panela.estado === 'na_biqueira');

  function confirmarTirar() {
    onTirar({ volumeL: volumeTirar });
    modo = 'principal';
  }

  function confirmarRepor() {
    if (!conteudoReporSelecionado) return;
    onRepor({ conteudo: conteudoReporSelecionado.c, volumeL: volumeRepor });
    modo = 'principal';
  }

  function confirmarEditar() {
    const p: PayloadEditar = {};
    if (editarNumero !== panela.numero) p.numero = editarNumero;
    if (editarVolume !== (panela.volumeAtualL ?? 0)) p.volumeAtualL = editarVolume;
    if (editarMeta !== (panela.metaTiragemL ?? 0)) p.metaTiragemL = editarMeta;
    if (editarEntrada) {
      const novoIso = new Date(editarEntrada).toISOString();
      const atualIso = panela.entradaFogoEm
        ? panela.entradaFogoEm.toISOString()
        : '';
      if (novoIso !== atualIso) p.entradaFogoEm = novoIso;
    }
    if (Object.keys(p).length === 0) {
      modo = 'principal';
      return;
    }
    onEditar(p);
    modo = 'principal';
  }

  function descartar() {
    if (typeof window !== 'undefined' && !window.confirm('Descartar esta panela?')) return;
    onDescartar();
  }
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onClose()} />

<div class="overlay" role="presentation">
  <button class="close-area" aria-label="Fechar modal" onclick={onClose}></button>
  <div class="modal" role="dialog" aria-modal="true" aria-label="Detalhe da panela {panela.numero}">
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

    {#if modo === 'tirar'}
      <div class="sub-form sub-form-tirar">
        <div class="mono eyebrow centrado">volume da tiragem</div>
        <div class="volume-hero">
          <input
            class="serif num-hero input-num"
            type="number"
            min="0"
            max={panela.volumeAtualL ?? 0}
            bind:value={volumeTirar}
            aria-label="volume da tiragem"
          />
          <span class="mono u-hero">L</span>
        </div>
        <PillRow>
          {#each [metaSugerida, metaSugerida - 5, metaSugerida + 5, metaSugerida * 2].filter((v) => v > 0 && v <= (panela.volumeAtualL ?? 0)) as v (v)}
            <Pill active={volumeTirar === v} onclick={() => (volumeTirar = v)}>{v} L</Pill>
          {/each}
        </PillRow>
        <div class="preview mono centrado">
          Tira em <span class="forte">{tiragemLabel(panela.proxTiragem).toLowerCase()}</span> — destino automático
        </div>
        <div class="acoes">
          <BtnPill variante="ghost" onclick={() => (modo = 'principal')}>Cancelar</BtnPill>
          <BtnPill variante="primary" accent={cor} onclick={confirmarTirar}>
            Confirmar tiragem
          </BtnPill>
        </div>
      </div>
    {:else if modo === 'repor'}
      <div class="sub-form">
        <FieldGroup label="repor com">
          <PillRow>
            {#each opcoesConteudoRepor as o (o.key)}
              <Pill active={conteudoReporKey === o.key} onclick={() => (conteudoReporKey = o.key)}>
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
              bind:value={volumeRepor}
              aria-label="volume da reposição"
            />
            <span class="mono u">L</span>
          </div>
          <PillRow>
            {#each [45, 50, 55, 60, 65] as v (v)}
              <Pill active={volumeRepor === v} onclick={() => (volumeRepor = v)}>{v} L</Pill>
            {/each}
          </PillRow>
        </FieldGroup>
        <div class="acoes">
          <BtnPill variante="ghost" onclick={() => (modo = 'principal')}>Cancelar</BtnPill>
          <BtnPill variante="primary" onclick={confirmarRepor}>Confirmar reposição</BtnPill>
        </div>
      </div>
    {:else if modo === 'editar'}
      <div class="sub-form">
        <FieldGroup label="número da panela">
          <input
            class="serif num-m input-num"
            type="number"
            min="1"
            bind:value={editarNumero}
            aria-label="número da panela"
          />
        </FieldGroup>
        <FieldGroup label="volume atual">
          <div class="volume-grande">
            <input
              class="serif num-m input-num"
              type="number"
              min="0"
              bind:value={editarVolume}
              aria-label="volume atual"
            />
            <span class="mono u">L</span>
          </div>
        </FieldGroup>
        <FieldGroup label="meta de tiragem">
          <div class="volume-grande">
            <input
              class="serif num-m input-num"
              type="number"
              min="0"
              bind:value={editarMeta}
              aria-label="meta de tiragem"
            />
            <span class="mono u">L</span>
          </div>
        </FieldGroup>
        <FieldGroup label="hora da entrada no fogo">
          <input
            class="mono datetime"
            type="datetime-local"
            bind:value={editarEntrada}
            aria-label="hora da entrada no fogo"
          />
        </FieldGroup>
        <div class="acoes">
          <BtnPill variante="ghost" onclick={() => (modo = 'principal')}>Cancelar</BtnPill>
          <BtnPill variante="primary" onclick={confirmarEditar}>Salvar</BtnPill>
        </div>
      </div>
    {:else}
      <div class="acoes">
        {#if podeTirar}
          <BtnPill variante="primary" accent={cor} onclick={() => (modo = 'tirar')}>
            Tirar — {tiragemLabel(panela.proxTiragem).toLowerCase()}
          </BtnPill>
        {/if}
        {#if podeRepor}
          <BtnPill variante="primary" accent={cor} onclick={() => (modo = 'repor')}>Repor</BtnPill>
        {/if}
        {#if !pausado}
          <BtnPill variante="ghost" onclick={onPausar}>Encostar</BtnPill>
        {/if}
        <BtnPill variante="ghost" onclick={() => (modo = 'editar')}>Editar</BtnPill>
        <div class="espaco"></div>
        <button class="link" onclick={descartar}>descartar panela</button>
      </div>
    {/if}
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

  .sub-form {
    padding: 20px 32px;
    border-top: 1px solid var(--linha);
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .sub-form-tirar {
    align-items: center;
    padding: 28px 32px 24px;
    gap: 14px;
  }
  .centrado {
    text-align: center;
  }
  .volume-hero {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 10px;
    margin: 4px 0 8px;
  }
  .num-hero {
    font-size: 96px;
    font-weight: 200;
    letter-spacing: -0.04em;
    line-height: 1;
    color: var(--ink);
    width: 4ch;
    text-align: center;
  }
  .u-hero {
    font-size: 18px;
    color: var(--ink-faint);
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
  .input-num {
    -moz-appearance: textfield;
    appearance: textfield;
  }
  .preview {
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.05em;
  }
  .preview .forte {
    color: var(--ink);
  }

  .acoes {
    padding: 20px 32px;
    border-top: 1px solid var(--linha);
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }
  .sub-form .acoes {
    padding: 0;
    border-top: 0;
    justify-content: flex-end;
  }
  .sub-form-tirar .acoes {
    justify-content: center;
    margin-top: 8px;
    width: 100%;
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
