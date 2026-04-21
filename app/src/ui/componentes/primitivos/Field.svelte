<script lang="ts">
  type Props = {
    label: string;
    value: string;
    highlight?: boolean;
    /**
     * Quando presente, o Field vira um botão clicável (cursor pointer,
     * hover sutil). Usado para abrir modais de edição inline.
     */
    onclick?: () => void;
    /**
     * Linha auxiliar exibida abaixo do valor — usada, por exemplo, para
     * mostrar "encarregado: X" quando o feitor está ausente.
     */
    subvalue?: string;
  };
  let { label, value, highlight = false, onclick, subvalue }: Props = $props();
</script>

{#if onclick}
  <button type="button" class="field clickable" {onclick}>
    <div class="mono eyebrow">{label}</div>
    <div class="value" class:highlight class:serif={highlight}>{value}</div>
    {#if subvalue}
      <div class="subvalue mono">{subvalue}</div>
    {/if}
  </button>
{:else}
  <div class="field">
    <div class="mono eyebrow">{label}</div>
    <div class="value" class:highlight class:serif={highlight}>{value}</div>
    {#if subvalue}
      <div class="subvalue mono">{subvalue}</div>
    {/if}
  </div>
{/if}

<style>
  .field {
    display: block;
    text-align: left;
    background: transparent;
    border: 0;
    padding: 0;
    font-family: inherit;
    color: inherit;
  }
  .clickable {
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .clickable:hover {
    opacity: 0.72;
  }
  .clickable:focus-visible {
    outline: 1px dashed var(--linha-strong);
    outline-offset: 4px;
    border-radius: 2px;
  }
  .eyebrow {
    font-size: 10px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin-bottom: 4px;
  }
  .value {
    font-size: 18px;
    font-weight: 400;
    color: var(--ink);
    letter-spacing: -0.01em;
  }
  .value.highlight {
    font-size: 26px;
    font-weight: 300;
    color: var(--azul-profundo);
  }
  .subvalue {
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.05em;
    margin-top: 4px;
  }
</style>
