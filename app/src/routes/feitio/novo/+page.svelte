<script lang="ts">
  import { goto } from '$app/navigation';
  import BtnPill from '../../../ui/componentes/primitivos/BtnPill.svelte';
  import FieldGroup from '../../../ui/componentes/primitivos/FieldGroup.svelte';
  import Pill from '../../../ui/componentes/primitivos/Pill.svelte';
  import PillRow from '../../../ui/componentes/primitivos/PillRow.svelte';
  import { comandos, novoId } from '../../../app/runtime';

  let nome = $state(
    `Feitio de ${new Date().toLocaleString('pt-BR', { month: 'long' })}/${new Date().getFullYear()}`
  );
  let feitor = $state('');
  let foguista = $state('');
  let casinha = $state('Casinha da Sede');
  let qtdBocas = $state(5);
  let erro = $state<string | null>(null);
  let enviando = $state(false);

  async function enviar(e: SubmitEvent) {
    e.preventDefault();
    if (enviando) return;
    enviando = true;
    erro = null;
    const feitioId = novoId();
    const r = await comandos().iniciarFeitio({
      feitioId,
      nome,
      feitor,
      foguista: foguista || undefined,
      casinha: casinha || undefined,
      qtdBocas
    });
    enviando = false;
    if (r.ok) {
      await goto('/feitio/atual');
    } else {
      erro = r.motivo;
    }
  }
</script>

<svelte:head>
  <title>Gestão de Feitio — Novo feitio</title>
</svelte:head>

<main class="app-shell">
  <header>
    <a href="/" class="voltar mono">← início</a>
    <div>
      <div class="mono eyebrow">começar</div>
      <h1 class="serif">Iniciar novo feitio</h1>
      <p class="lead">
        Registre as informações de base. O feitio fica ativo até você encerrar.
      </p>
    </div>
  </header>

  <form class="formulario" onsubmit={enviar}>
    <FieldGroup label="nome do feitio">
      <input type="text" bind:value={nome} aria-label="nome do feitio" />
    </FieldGroup>

    <div class="linha">
      <FieldGroup label="feitor">
        <input
          type="text"
          bind:value={feitor}
          placeholder="quem comanda"
          aria-label="feitor"
          required
        />
      </FieldGroup>
      <FieldGroup label="foguista">
        <input
          type="text"
          bind:value={foguista}
          placeholder="quem cuida do fogo"
          aria-label="foguista"
        />
      </FieldGroup>
    </div>

    <FieldGroup label="casinha">
      <input type="text" bind:value={casinha} aria-label="casinha" />
    </FieldGroup>

    <FieldGroup label="bocas da fornalha">
      <PillRow>
        {#each [3, 4, 5, 6, 7] as n (n)}
          <Pill active={qtdBocas === n} onclick={() => (qtdBocas = n)}>{n} bocas</Pill>
        {/each}
      </PillRow>
    </FieldGroup>

    {#if erro}
      <div class="erro mono" role="alert">{erro}</div>
    {/if}

    <div class="acoes">
      <BtnPill variante="ghost" href="/">Cancelar</BtnPill>
      <BtnPill variante="primary">Entrar no fogo</BtnPill>
    </div>
  </form>
</main>

<style>
  header {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .voltar {
    font-size: 11px;
    color: var(--ink-faint);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    text-decoration: none;
    align-self: flex-start;
  }
  .eyebrow {
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }
  h1 {
    margin: 4px 0 0;
    font-size: 44px;
    font-weight: 200;
    letter-spacing: -0.03em;
    color: var(--ink);
  }
  .lead {
    margin: 14px 0 0;
    max-width: 540px;
    font-size: 15px;
    line-height: 1.6;
    color: var(--ink-soft);
    font-weight: 300;
  }

  .formulario {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 680px;
  }
  .linha {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  input[type='text'] {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--linha);
    border-radius: 999px;
    background: var(--surface);
    color: var(--ink);
    font-family: inherit;
    font-size: 14px;
    font-weight: 300;
    transition: border-color 0.15s;
  }
  input[type='text']:focus {
    outline: none;
    border-color: var(--azul);
  }

  .erro {
    font-size: 12px;
    color: #b23a48;
    padding: 10px 14px;
    border: 1px solid #e7c3c8;
    border-radius: 8px;
    background: #fdf6f6;
  }

  .acoes {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 12px;
  }
</style>
