<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { paletaStore } from '../ui/paleta-store.svelte';

  let { children } = $props();

  onMount(() => {
    paletaStore.hidratar();
  });
</script>

{@render children()}
