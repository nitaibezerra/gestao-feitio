<script lang="ts">
  type Props = { children: import('svelte').Snippet };
  let { children }: Props = $props();
</script>

<div>{@render children()}</div>

<style>
  div {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
</style>
