<script lang="ts">
  type Props = {
    label: string;
    value: string;
    highlight?: boolean;
  };
  let { label, value, highlight = false }: Props = $props();
</script>

<div>
  <div class="mono eyebrow">{label}</div>
  <div class="value" class:highlight class:serif={highlight}>{value}</div>
</div>

<style>
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
</style>
