<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { aplicarPaleta } from '../ui/paletas';

  let { children } = $props();

  onMount(() => {
    aplicarPaleta('daime-rainha');
  });
</script>

{@render children()}
