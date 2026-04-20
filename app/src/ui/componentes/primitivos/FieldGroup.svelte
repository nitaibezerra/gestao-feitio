<script lang="ts">
  type Props = {
    label: string;
    children: import('svelte').Snippet;
  };
  let { label, children }: Props = $props();
</script>

<div>
  <div class="mono eyebrow">{label}</div>
  {@render children()}
</div>

<style>
  .eyebrow {
    font-size: 10px;
    color: var(--ink-faint);
    letter-spacing: 0.28em;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
</style>
