<script lang="ts">
  import type { Feitio } from '../../domain/entities/feitio';
  import type { Tonel } from '../../domain/entities/tonel';
  import Field from './primitivos/Field.svelte';

  type Props = {
    feitio: Feitio;
    qtdPanelasAtivas: number;
    bocas: number;
    toneis: Array<Pick<Tonel, 'volumeL'>>;
    onEditarFeitor?: () => void;
    onEditarFoguista?: () => void;
  };
  let {
    feitio,
    qtdPanelasAtivas,
    bocas,
    toneis,
    onEditarFeitor,
    onEditarFoguista
  }: Props = $props();

  const noTonel = $derived(toneis.reduce((a, t) => a + t.volumeL, 0));
  const feitorLabel = $derived(
    feitio.feitorAusente ? `${feitio.feitor} (ausente)` : feitio.feitor
  );
  const feitorSubvalue = $derived(
    feitio.feitorAusente && feitio.encarregado
      ? `encarregado: ${feitio.encarregado}`
      : undefined
  );
</script>

<div>
  <Field
    label="Feitor"
    value={feitorLabel}
    subvalue={feitorSubvalue}
    onclick={onEditarFeitor}
  />
  <Field
    label="Foguista"
    value={feitio.foguista ?? '—'}
    onclick={onEditarFoguista}
  />
  <Field label="Bocas ao fogo" value={`${qtdPanelasAtivas} / ${bocas}`} />
  <Field label="No tonel" value={`${noTonel} L`} highlight />
</div>

<style>
  div {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 40px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--linha);
  }
</style>
