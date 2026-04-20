<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { aplicarPaleta } from '../ui/paletas';

  let { children } = $props();

  onMount(() => {
    aplicarPaleta('luz-rainha');
  });
</script>

{@render children()}
