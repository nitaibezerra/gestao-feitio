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

## Documentação relacionada

- [Plano de implementação](../projeto/plano-implementacao.md) — fases 0 a 5
- [Tutorial de produção](../projeto/tutorial-producao-daime.md)
- [Requisitos](../projeto/requisitos.md)
- [Projeto](../projeto/projeto.md)

## Status

MVP completo (Fases 0-5). 145+ testes unit + 21 E2E verdes.
