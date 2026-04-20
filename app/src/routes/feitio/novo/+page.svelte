<script lang="ts">
  import BtnPill from '../../../ui/componentes/primitivos/BtnPill.svelte';
  import FieldGroup from '../../../ui/componentes/primitivos/FieldGroup.svelte';
  import Pill from '../../../ui/componentes/primitivos/Pill.svelte';
  import PillRow from '../../../ui/componentes/primitivos/PillRow.svelte';

  let nome = $state(
    `Feitio de ${new Date().toLocaleString('pt-BR', { month: 'long' })}/${new Date().getFullYear()}`
  );
  let feitor = $state('');
  let foguista = $state('');
  let casinha = $state('Casinha da Sede');
  let qtdBocas = $state(5);
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

  <form
    class="formulario"
    onsubmit={(e) => {
      e.preventDefault();
      // Fase 4 aciona comando iniciarFeitio. Por ora redireciona para o dashboard.
      window.location.assign('/feitio/atual');
    }}
  >
    <FieldGroup label="nome do feitio">
      <input type="text" bind:value={nome} />
    </FieldGroup>

    <div class="linha">
      <FieldGroup label="feitor">
        <input type="text" bind:value={feitor} placeholder="quem comanda" required />
      </FieldGroup>
      <FieldGroup label="foguista">
        <input type="text" bind:value={foguista} placeholder="quem cuida do fogo" />
      </FieldGroup>
    </div>

    <FieldGroup label="casinha">
      <input type="text" bind:value={casinha} />
    </FieldGroup>

    <FieldGroup label="bocas da fornalha">
      <PillRow>
        {#each [3, 4, 5, 6, 7] as n (n)}
          <Pill active={qtdBocas === n} onclick={() => (qtdBocas = n)}>{n} bocas</Pill>
        {/each}
      </PillRow>
    </FieldGroup>

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

  .acoes {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 12px;
  }
</style>
