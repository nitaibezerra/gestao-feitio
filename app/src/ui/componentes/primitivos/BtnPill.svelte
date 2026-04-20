<script lang="ts">
  type Props = {
    variante?: 'primary' | 'ghost';
    accent?: string;
    onclick?: () => void;
    children: import('svelte').Snippet;
    href?: string;
  };
  let { variante = 'ghost', accent, onclick, children, href }: Props = $props();
</script>

{#if href}
  <a {href} class={variante} style:background={variante === 'primary' ? (accent ?? 'var(--azul-profundo)') : undefined}>
    {@render children()}
  </a>
{:else}
  <button {onclick} class={variante} style:background={variante === 'primary' ? (accent ?? 'var(--azul-profundo)') : undefined}>
    {@render children()}
  </button>
{/if}

<style>
  button, a {
    padding: 11px 22px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.01em;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s, background 0.15s;
  }
  button:hover, a:hover {
    transform: translateY(-1px);
  }
  .primary {
    background: var(--azul-profundo);
    color: #fff;
    border: none;
  }
  .ghost {
    background: transparent;
    color: var(--ink-soft);
    border: 1px solid var(--linha);
  }
  .ghost:hover {
    border-color: var(--linha-strong);
    color: var(--ink);
  }
</style>
