<script lang="ts">
  type Props = {
    volPct: number; // 0..100
    metaPct: number; // 0..100
    cor: string;
  };
  let { volPct, metaPct, cor }: Props = $props();

  const r = 16;
  const c = $derived(2 * Math.PI * r);
  const dashArray = $derived(`${(volPct / 100) * c} ${c}`);
  const metaAngleDeg = $derived((metaPct / 100) * 360 - 90);
  const metaRad = $derived((metaAngleDeg * Math.PI) / 180);
  const mx = $derived(20 + r * Math.cos(metaRad));
  const my = $derived(20 + r * Math.sin(metaRad));
</script>

<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
  <circle cx="20" cy="20" r={r} fill="none" stroke="var(--linha)" stroke-width="2" />
  <circle
    cx="20"
    cy="20"
    r={r}
    fill="none"
    stroke={cor}
    stroke-width="2"
    stroke-linecap="round"
    stroke-dasharray={dashArray}
    transform="rotate(-90 20 20)"
  />
  <circle cx={mx} cy={my} r="2" fill="var(--ink)" />
</svg>

<style>
  svg {
    flex-shrink: 0;
  }
</style>
