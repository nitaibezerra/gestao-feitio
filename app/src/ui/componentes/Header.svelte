<script lang="ts">
  import type { Feitio } from '../../domain/entities/feitio';
  import { fmtDuracao, fmtHora } from '../labels';
  import { useRelogio } from '../relogio.svelte';

  type Props = { feitio: Feitio };
  let { feitio }: Props = $props();

  const relogio = useRelogio();
  const duracao = $derived(relogio.valor.getTime() - feitio.inicio.getTime());
</script>

<header>
  <a href="/config" class="orbe" aria-label="Abrir configurações">✦</a>
  <div>
    <div class="mono eyebrow">
      Feitio{feitio.casinha ? ` · ${feitio.casinha}` : ''}
    </div>
    <h1 class="serif">{feitio.nome}</h1>
  </div>
  <div class="relogio">
    <div class="serif hora">{fmtHora(relogio.valor)}</div>
    <div class="mono duracao">Dia 2 · {fmtDuracao(duracao)}</div>
  </div>
</header>

<style>
  header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 40px;
  }
  .orbe {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--azul-claro);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--azul);
    font-size: 18px;
    font-weight: 300;
    background: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
  }
  .orbe:hover {
    background: rgba(255, 255, 255, 0.9);
    border-color: var(--azul);
    transform: rotate(90deg);
  }
  .eyebrow {
    font-size: 10px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }
  h1 {
    margin: 4px 0 0;
    font-size: 30px;
    font-weight: 300;
    color: var(--ink);
  }
  .relogio {
    text-align: right;
  }
  .hora {
    font-size: 42px;
    font-weight: 200;
    letter-spacing: -0.02em;
    color: var(--ink);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .duracao {
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.15em;
    margin-top: 4px;
    text-transform: uppercase;
  }
</style>
