<script lang="ts">
  type Props = { title: string; subtitle: string };
  let { title, subtitle }: Props = $props();
</script>

<div>
  <h2 class="serif">{title}</h2>
  <span class="mono">{subtitle}</span>
</div>

<style>
  div {
    display: flex;
    align-items: baseline;
    gap: 24px;
    margin-bottom: 24px;
  }
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 400;
    letter-spacing: 0.01em;
    color: var(--ink);
  }
  span {
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
</style>
