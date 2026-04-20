<script lang="ts">
  type Props = {
    active?: boolean;
    onclick?: () => void;
    children: import('svelte').Snippet;
  };
  let { active = false, onclick, children }: Props = $props();
</script>

<button class:active {onclick}>
  {@render children()}
</button>

<style>
  button {
    padding: 9px 16px;
    border-radius: 999px;
    border: 1px solid var(--linha);
    background: transparent;
    color: var(--ink-soft);
    font-size: 13px;
    font-weight: 400;
    transition: all 0.15s;
  }
  button:hover {
    border-color: var(--linha-strong);
    color: var(--ink);
  }
  button.active {
    border-color: var(--azul);
    background: color-mix(in oklab, var(--azul) 8%, transparent);
    color: var(--azul-profundo);
  }
</style>
