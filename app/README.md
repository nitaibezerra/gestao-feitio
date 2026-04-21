# Gestão de Feitio — App

Aplicativo offline-first para gestão de feitio do Santo Daime, otimizado
para tablet em landscape (1280×800). PWA instalável, identidade visual
**Luz Branca** (paleta padrão: Rainha da Floresta).

## Stack

- **Framework:** SvelteKit 2.57 + Svelte 5.55 (Runes)
- **Linguagem:** TypeScript estrito
- **Estilo:** CSS variáveis + Tailwind utilitário
- **Persistência:** Dexie (IndexedDB) + event sourcing
- **PWA:** `@vite-pwa/sveltekit` (Workbox, autoUpdate)
- **Testes:** Vitest (unit + componente) + Playwright (E2E)

Arquitetura em camadas, regras de negócio puras isoladas em `src/domain/`,
event log persistido em `src/infra/persistencia/`, comandos orquestram
domínio + persistência em `src/app/`, UI em `src/ui/` + `src/routes/`.

## Comandos

```bash
pnpm dev            # servidor de desenvolvimento (porta 5173)
pnpm build          # build de produção (gera build/ + service worker)
pnpm preview        # preview local do build (testa SW + PWA)
pnpm check          # type-check com svelte-check (0 erros 0 warnings)
pnpm test           # vitest run — testes unit + componente
pnpm test:e2e       # playwright test — todos os fluxos E2E
pnpm gerar-icones   # regera os ícones PWA a partir de SVG (requer ImageMagick)
```

## Como testar offline (RNF-01)

1. `pnpm build && pnpm preview` (porta padrão 4173)
2. Abrir `http://localhost:4173` no Chrome
3. DevTools → Application → Service Workers — confirmar `sw.js` ativo
4. DevTools → Network → marcar "Offline"
5. Recarregar — a página continua funcionando (cache do precache)

## Instalação como PWA no tablet

### Android (Chrome)
1. Abrir o app no Chrome
2. Menu (⋮) → "Adicionar à tela inicial"
3. Confirmar — surge ícone com o orbe ✦

### iOS (Safari, iPad)
1. Abrir o app no Safari
2. Compartilhar → "Adicionar à Tela de Início"
3. Confirmar

Na primeira abertura instalada, a tela trava em modo standalone landscape;
a IndexedDB persiste entre sessões. Wake Lock mantém a tela acesa enquanto
a rota `/feitio/atual` está aberta (RNF-04).

## Fluxos avançados (Fase 6)

### Editar panela (correção append-only)
Ao clicar numa panela no fogo, o modal mostra botão **Editar**. O sub-form
permite mudar número, volume atual, meta de tiragem e hora da entrada no fogo
(`datetime-local`). Ao salvar, o sistema emite um evento `panela_editada`
com apenas os campos alterados — eventos históricos permanecem intactos, o
override é aplicado pela projeção.

### Encostar + voltar ao fogo
"Encostar" substitui "Pausar" — ao encostar, a panela sai da fornalha,
**libera a boca** e aparece na seção **"Panelas encostadas"** (abaixo dos
Tonéis). O card mostra volume, conteúdo e "parada há HHhMM". Clique abre
modal com duas ações:
- **Voltar ao fogo** → escolhe uma boca livre → emite `tempo_retomado` +
  `panela_entra_fogo` atomicamente.
- **Tirar material direto** → sub-form de tiragem; `registrar_tiragem` é
  permitido em `fora_do_fogo` pela máquina de estados.

### Meta de tiragem no formulário de nova panela
`NovaPanelaModal` ganha seção "vai tirar em" com pills 30/40/50 L + input
livre. O valor é opcional — quando ausente, a UI usa heurística `volume/2`.
O campo acompanha a panela entre entradas no fogo e é exibido como
"meta NN" no card.

## Documentação relacionada

- [Plano de implementação](../projeto/plano-implementacao.md) — fases 0 a 6
- [Tutorial de produção](../projeto/tutorial-producao-daime.md)
- [Requisitos](../projeto/requisitos.md)
- [Projeto](../projeto/projeto.md)

## Status

Fase 6 completa (iteração pós-testes do MVP). 175 testes unit + 26 E2E verdes.
