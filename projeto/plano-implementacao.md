# Plano de Implementação — MVP do Aplicativo de Gestão de Feitio

> Plano de execução **orientado a TDD** para implementar o [Gestão de Feitio Dashboard](../design/project/Gestao%20de%20Feitio.html) — protótipo de alta fidelidade recebido via Claude Design.
>
> Documentos base: [Tutorial](./tutorial-producao-daime.md) · [Requisitos](./requisitos.md) · [Projeto](./projeto.md)

---

## 0. Metodologia: TDD (Red · Green · Refactor)

Todo código da camada **domain** e **app** é escrito via ciclo TDD clássico:

1. **Red** — escrever um teste Vitest que falha, descrevendo o comportamento desejado com nomes do domínio (português).
2. **Green** — escrever **o código mínimo** para o teste passar. Sem generalização prematura.
3. **Refactor** — limpar duplicação, melhorar nomes, extrair funções. Testes continuam verdes.

Camadas e nível de teste:

| Camada | Tipo de teste | Ferramenta | TDD estrito? |
|---|---|---|---|
| `domain/*` (regras, nomenclatura, máquina de estados, projeções) | Unitário puro | Vitest | **Sim** — red first |
| `infra/persistencia` | Integração com fake IndexedDB | Vitest + `fake-indexeddb` | Sim |
| `app/comandos.ts` | Integração domínio + persistência | Vitest | Sim |
| `ui/componentes/*.svelte` | Teste de componente | Vitest + `@testing-library/svelte` | Parcial — snapshot visual guia |
| Fluxos end-to-end | E2E | Playwright | Acceptance test primeiro |

**Disciplina:**
- Nunca escrever código de produção sem um teste vermelho apontando para ele.
- Commits pequenos, um por ciclo RGR quando fizer sentido agrupar.
- Cobertura ≥ 90% no `domain/` é consequência, não meta.
- Se um teste requer setup complexo, o problema é o desenho — refactor antes de continuar.

---

## 1. Contexto

O design entregue (`design/project/Gestao de Feitio.html`) é um **protótipo React single-file** (1516 linhas) renderizado via Babel standalone, com React 18 + Babel via CDN. Contém:

- **Dashboard principal** para tablet landscape (1280×800).
- **Dados simulados** de um feitio na sexta-feira (4 panelas ativas, 5 bocas, tonéis parcialmente cheios).
- **Sistema visual** com paleta Daime (5 opções via tweaks: Fogo & Brasa, Mata verde, Firmamento, Cruzeiro, Rainha da Floresta) baseado em `oklch` + `color-mix`.
- **Tipografia:** Instrument Serif (títulos/numerais rituais), Inter (UI), JetBrains Mono (metadados).
- **Componentes:** `TopBar`, `Fornalha` (grade 3+2 ou simples), `BocaCard`/`PanelaCard`, `VolumeBar`, `ToneisPanel`, `PanelaDetailModal`, `TirarForm`, `ReporForm`, `NovaPanelaModal`, `ActionBar`, `TweaksPanel`.

Do chat (`design/chats/chat1.md`), ficaram explícitas as decisões:

- **Nome da panela = próxima tiragem** (ex: "1º Cozimento", "1º Grau") — não o conteúdo atual, que vira subtítulo.
- **Paleta Rainha da Floresta como padrão** (verde + branco luz).
- **Tweaks** (layout, compacto, timeline, paleta) devem ter efeito real.

### 1.1. O que o protótipo **entrega** da v1 (Fase 1 do projeto.md)

✅ RF-02 (dashboard da fornalha) — layout completo, timers vivos, cores por tipo, barra de meta
✅ RF-03 (criar panela) — modal "Nova panela" com quantidade, conteúdo inicial e volume
✅ RF-07/08 (tirar + nomenclatura automática) — `proxTiragem` pré-calculado no estado, form de tiragem
✅ RF-09 (repor) — form com sugestões
✅ RF-12 (tonéis) — painel lateral com summary e barras de nível
✅ RF-15 (histórico da panela) — lista de tiragens no modal de detalhe
✅ RF-17 (correção de duplas) — dica "Panela 1 deu 31 L. Mire 31 L" no TirarForm
✅ RF-20 (desfazer) — botão no ActionBar

### 1.2. O que o protótipo **não entrega** (precisa ser construído)

- **Interatividade real**: callbacks `onTirar`/`onRepor`/`onUndo` estão vazios — nada persiste.
- **Máquina de estados** e **cálculo de `proxTiragem`** (vem pré-computado no `initialState`).
- **Persistência** (IndexedDB, eventos).
- **Pausar/retomar tempo**, **trocar bocas**, **descartar**, **apuração**, **litragem**, **encerrar feitio**.
- **Criação de feitio inicial** (hoje o `initialState` é hardcoded).
- **Ciclo de água forte** (múltiplas tiragens) — flag existe no modelo mas não é exercitada.
- **Lógica offline** (service worker, wake lock, manifest).

---

## 2. Decisão de stack: portar para SvelteKit (conforme `projeto.md`)

O design é React puro. A decisão original (documento de projeto) é SvelteKit + TypeScript + Dexie. Opções:

| Opção | Prós | Contras |
|---|---|---|
| **A. Portar para SvelteKit** (recomendada) | Segue arquitetura do projeto, bundle menor, tipagem, event sourcing | Retrabalho do React → Svelte (estimado 3-5 dias) |
| B. Manter React + Vite + Dexie | Aproveita 100% do JSX existente | Contradiz projeto.md; time precisa dois ecossistemas |
| C. Empacotar HTML atual como PWA direto | Mais rápido para demo | Sem tipagem, sem testes, sem domínio isolado, difícil evoluir |

**Recomendação: A.** O README do design diz explicitamente: *"Match the visual output; don't copy the prototype's internal structure unless it happens to fit."* O protótipo é referência visual, não referência de código.

---

## 3. Plano de entrega por fases

### Fase 0 — Setup + guard-rails de teste (~1 dia)

Ordem importa: **Vitest operante antes de qualquer linha de domínio**.

1. `mkdir app && cd app && pnpm create svelte@latest .` (skeleton + TS).
2. Instalar: `dexie`, `fake-indexeddb` (dev), `vitest`, `@testing-library/svelte`, `@playwright/test`, `@vite-pwa/sveltekit`, `tailwindcss`, `date-fns`, `lucide-svelte`.
3. Configurar `vitest.config.ts` — `environment: 'jsdom'` para componentes, `environment: 'node'` para `domain/`.
4. Configurar `playwright.config.ts` — projeto `chromium` em viewport 1280×800.
5. Escrever **um teste canary** em cada nível (unitário, componente, E2E) que valida que o setup funciona. Todos falham com `not implemented`.
6. Fontes Google + variáveis CSS (`app/src/app.css`) — espelho do design.
7. `app/src/ui/paletas.ts` — 5 paletas + `aplicarPaleta(key)` com teste de roundtrip (aplica → lê `getPropertyValue` → confere).
8. `manifest.webmanifest` com `short_name: "Feitio"`, `name: "Gestão de Feitio"`, `display: "standalone"`, `orientation: "landscape"`, `theme_color` da Rainha da Floresta.
9. Smoke: `pnpm dev` abre; `pnpm test` roda canaries; `pnpm exec playwright test` abre chromium.

**Arquivos novos:**
- `app/package.json`, `app/svelte.config.js`, `app/vite.config.ts`, `app/vitest.config.ts`, `app/playwright.config.ts`
- `app/src/app.css` (variáveis + keyframes `pulse`, `flicker`)
- `app/src/ui/paletas.ts` + `app/src/ui/paletas.test.ts`
- `app/tests/e2e/canary.spec.ts`
- `app/static/manifest.webmanifest`

### Fase 1 — Domínio puro + projeções (~2-3 dias, TDD estrito)

Ordem **red first**: cada arquivo `.ts` de domínio nasce de um `.test.ts` falhando.

**Ciclo 1 — Nomenclatura automática (RF-08)**
- Red: `nomenclatura.test.ts` — "panela com água nova, 1ª tiragem → cozimento ordem 1"
- Green: tipos mínimos de `Panela`/`Tiragem`/`TipoTiragem` + função retornando cozimento 1
- Repetir red→green para: 2º, 3º... 6º cozimento → água forte → múltiplas tiragens de água forte → panela com cozimento vira Daime 1º grau → 2º/3º/4º grau → panela pós-Daime volta à água → produz cozimento que vai ao tonel do 1º → limite 4º grau salta para água forte
- Refactor final: `calcularTipoTiragem` pura em `domain/regras/nomenclatura.ts`

**Ciclo 2 — Máquina de estados da panela**
- Red: `maquina-estados.test.ts` — tabela de transições permitidas/proibidas (um teste por célula)
- Green: função `transicao(estado, comando) → estado | erro`
- Cobertura exaustiva: `montada × comandos`, `no_fogo × comandos`, etc.

**Ciclo 3 — Correção de duplas (RF-17)**
- Red: "tirou 33 na primeira panela, meta do tonel 62 → sugere 29 na segunda"
- Green: `sugerirCorrecaoDupla(tiragensAnteriores, metaTonel)` em `domain/regras/correcao-duplas.ts`

**Ciclo 4 — Eventos (union discriminada)**
- Red: teste de validação de payload por tipo de evento
- Green: `domain/events/tipos.ts` + validadores

**Ciclo 5 — Projeções (event sourcing)**
- Red: "dados eventos [feitio_iniciado, panela_montada, panela_entra_fogo, tiragem_registrada] → panela com conteúdo e tiragens corretos"
- Green: `domain/projecoes/panelas.ts`, `toneis.ts`, `fornalha.ts` — folds puros
- Testes reproduzem os 3 cenários do tutorial (quinta, sexta-Daime, transição para água forte)

**Critério para encerrar Fase 1:**
- Todos os cenários do tutorial passam como testes.
- `pnpm test:unit --coverage` reporta ≥ 90% em `src/domain/`.
- Nenhum arquivo em `domain/` foi criado sem um teste prévio (conferir ordem dos commits).

### Fase 2 — Persistência + stores (~1-2 dias, TDD com `fake-indexeddb`)

**Ciclo 1 — Repositório de eventos (append-only)**
- Red: "append de evento → `streamByFeitio` emite o evento" (usando `fake-indexeddb`)
- Red: "dois eventos em ordem → stream preserva ordem por `momento`"
- Green: `infra/persistencia/dexie-db.ts` + `repositorio-eventos.ts`

**Ciclo 2 — Command handlers**
- Red: "comando `RegistrarTiragem` em panela `no_fogo` com volume válido → persiste evento + panela vai para `aguardando_reposicao`"
- Red: "comando inválido (tirar de panela `descartada`) → erro claro, nada persistido"
- Green: `app/comandos.ts` — orquestra domínio (validação) + repositório (persistência)

**Ciclo 3 — Stores reativos**
- Red: "ao appendar evento, `fornalhaStore` re-projeta e notifica assinantes"
- Green: `app/stores.ts` com `liveQuery` do Dexie

**Critério:** commands do tutorial (quinta/sexta) rodam end-to-end em Vitest — sem UI ainda.

### Fase 3 — UI: portar dashboard (~3-4 dias, ATDD leve)

**Abordagem de teste:**
- **E2E primeiro** (Playwright) — para cada fluxo principal, escrever o teste de aceitação antes da UI. Red: "navego para `/feitio/atual`, vejo 5 bocas, clico na Panela 3, vejo modal com timer e próxima tiragem Daime 1º grau".
- **Teste de componente** com `@testing-library/svelte` para lógica não trivial (volume bar, timer, cálculo visual de meta).
- **Visual** conferido side-by-side com o design original (iframe em dev).

Recriar os componentes do design em Svelte, **mantendo fidelidade visual**:

| Componente React (design) | Componente Svelte (alvo) | Notas |
|---|---|---|
| `TopBar` | `ui/componentes/TopBar.svelte` | Relógio vivo via `onMount` + `setInterval` |
| `StatusPill` | embutido em TopBar | — |
| `Fornalha` | `ui/componentes/Fornalha.svelte` | Layout 3+2 com `grid-column` ou "simples" |
| `BocaCard` / `PanelaCard` | `ui/componentes/PanelaCard.svelte` | Timer reativo, volume bar com marcador |
| `VolumeBar` | `ui/componentes/VolumeBar.svelte` | — |
| `FornalhaLegenda` | embutido | — |
| `ToneisPanel` + `TonelRow` + `SummaryStat` | `ui/componentes/ToneisPanel.svelte` | — |
| `PanelaDetailModal` | `ui/componentes/PanelaDetailModal.svelte` | Estado `view` local (detail/tirar/repor) |
| `TirarForm` | `ui/componentes/TirarForm.svelte` | — |
| `ReporForm` | `ui/componentes/ReporForm.svelte` | — |
| `NovaPanelaModal` | `ui/componentes/NovaPanelaModal.svelte` | — |
| `ActionBar` | `ui/componentes/ActionBar.svelte` | — |
| `TweaksPanel` (design only) | `routes/config/+page.svelte` | Só seletor de paleta (layout/compacto/timeline descartados) |
| `ActionBtn`, `QuickBtn`, `TonelRadio`, `ReporOption` | `ui/componentes/primitivos/*.svelte` | Componentes pequenos reutilizados |

**Roteamento SvelteKit (v1, feitio único):**
- `/` — redireciona automaticamente:
  - Se existe feitio com `status == 'em_andamento'` → `/feitio/atual`
  - Senão → tela simples "Iniciar novo feitio" com formulário (RF-01)
- `/feitio/atual` — dashboard (rota principal; sempre mostra o único feitio ativo)
- `/config` — oculta; seletor de paleta entre as 5 opções do design
- Modais são blocos `{#if}` em cima do dashboard, não rotas separadas (preserva estado do painel).

**Animações:** portar keyframes `pulse` e `flicker` para `app.css`.

### Fase 4 — Interatividade completa (~2 dias, driven pelo E2E)

Cada comando ganha um Playwright E2E "de fora pra dentro":

1. Red E2E: usuário clica no botão → estado esperado (DOM + evento persistido).
2. Green: wire up do handler Svelte → comando já testado da Fase 2.
3. Refactor: extrair pequenos componentes, reduzir duplicação de modais.

Comandos a ligar:
- `Tirar` → `TiragemRegistrada` → atualiza panela e tonel destino → panela vai para `aguardando_reposicao`.
- `Repor` → desconta do tonel origem → `ReposicaoRegistrada` → panela volta para `no_fogo`.
- `Pausar` / `Retomar` → eventos `TempoPausado` / `TempoRetomado`.
- `Trocar boca` → seleção dupla + `TrocaBocas`.
- `Nova panela` → `PanelaMontada` + `PanelaEntraFogo`.
- `Desfazer última` → evento compensatório (seguir RF-20).

### Fase 5 — PWA + polish (~1 dia)

- `manifest.webmanifest`, ícones, service worker.
- Wake Lock quando feitio está `em_andamento`.
- Export JSON do feitio.
- Teste E2E Playwright dos 3 fluxos do tutorial (quinta, sexta-Daime, água forte).

---

## 4. Arquivos-chave a criar

```
gestao-feitio/
├── app/                                   ← NOVO
│   ├── package.json
│   ├── svelte.config.js
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── app.html
│   │   ├── app.css
│   │   ├── domain/                        ← Fase 1 (TDD red-first)
│   │   │   ├── entities/{panela,tonel,feitio,fornalha}.ts
│   │   │   ├── events/tipos.ts + tipos.test.ts
│   │   │   ├── regras/{nomenclatura,maquina-estados,correcao-duplas}.ts + .test.ts
│   │   │   └── projecoes/{fornalha,panelas,toneis}.ts + .test.ts
│   │   ├── infra/                         ← Fase 2
│   │   │   └── persistencia/{dexie-db,repositorio-eventos}.ts + .test.ts
│   │   ├── app/                           ← Fase 2
│   │   │   ├── stores.ts
│   │   │   └── comandos.ts + comandos.test.ts
│   │   ├── ui/                            ← Fase 3
│   │   │   ├── paletas.ts
│   │   │   ├── componentes/
│   │   │   │   ├── TopBar.svelte
│   │   │   │   ├── Fornalha.svelte
│   │   │   │   ├── PanelaCard.svelte
│   │   │   │   ├── VolumeBar.svelte
│   │   │   │   ├── ToneisPanel.svelte
│   │   │   │   ├── PanelaDetailModal.svelte
│   │   │   │   ├── TirarForm.svelte
│   │   │   │   ├── ReporForm.svelte
│   │   │   │   ├── NovaPanelaModal.svelte
│   │   │   │   ├── ActionBar.svelte
│   │   │   │   └── primitivos/{ActionBtn,QuickBtn,TonelRadio,ReporOption}.svelte
│   │   └── routes/
│   │       ├── +layout.svelte
│   │       ├── +page.svelte               ← redireciona p/ /feitio/atual ou /feitio/novo
│   │       ├── feitio/
│   │       │   ├── novo/+page.svelte      ← RF-01 cadastro de feitio
│   │       │   └── atual/+page.svelte     ← dashboard (rota principal)
│   │       └── config/+page.svelte        ← seletor de paleta
│   ├── static/
│   │   ├── manifest.webmanifest
│   │   └── icons/
│   └── tests/
│       ├── domain/                        ← Vitest
│       └── e2e/                           ← Playwright
└── design/                                ← JÁ COPIADO
    ├── README.md
    ├── chats/chat1.md
    └── project/Gestao de Feitio.html
```

---

## 5. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Portar React → Svelte perde detalhes visuais | Colocar design original ao lado em iframe durante dev para comparar pixel a pixel |
| `oklch` + `color-mix` em tablets antigos | Tablet alvo precisa suportar CSS Color Module 4 (Chromium 111+, Safari 15.4+); fallback hex é trivial |
| Timers em vários componentes consomem bateria | Um único `setInterval` global num store, componentes assinam; reduz work |
| Design não cobre "novo feitio" | V1 com feitio único: rota `/feitio/novo` é formulário simples (RF-01); dashboard é o foco visual |
| `Desfazer` é complexo com múltiplos tipos de evento | Começar com subset (tiragem, reposição, volume_ajustado); expandir |

---

## 6. Decisões tomadas (defaults confirmados)

| # | Pergunta | Decisão |
|---|---|---|
| 1 | Stack | **SvelteKit + TypeScript + Dexie** (conforme `projeto.md`). React do protótipo serve apenas de referência visual. |
| 2 | Paleta padrão | **Rainha da Floresta** (verde claro + branco). Demais 4 paletas ficam disponíveis num `/config` oculto (acessível por gesto ou URL direta). |
| 3 | Nome do app | UI: **"Gestão de Feitio"**. Manifest PWA `short_name`: **"Feitio"** (cabe no ícone da home). |
| 4 | Tablet alvo | **Genérico landscape 1280×800** (Android 10+ / iPad iOS 14+). Layout responde de 1024 px para cima sem regressão. |
| 5 | Multi-feitio v1 | **Um feitio ativo por vez.** Rota raiz `/` redireciona para `/feitio/atual` se existir; senão mostra "Criar feitio". Lista histórica fica para v1.1. |
| 6 | TweaksPanel | **Não portar.** Tweaks eram overlay do Claude Design. O único tweak relevante (paleta) vira uma tela `/config`. |

---

## 7. Como verificar ao final (end-to-end)

- **Visual**: abrir side-by-side com `design/project/Gestao de Feitio.html` em tablet 1280×800; comparar cada componente.
- **Domínio**: `pnpm test:unit` passa com ≥ 90% no `domain/`.
- **Fluxo real**: Playwright roda os 3 cenários do tutorial — quinta 1º/2º/3º cozimento, sexta Daime 1º grau, panela entra em água forte e gera múltiplas tiragens.
- **Offline**: instalar como PWA, desligar wifi, continuar usando; fechar app, reabrir, estado preservado.
- **Legibilidade**: colocar tablet a 2 m e ler todos os números das bocas sem forçar a vista.

---

## 8. Estimativa total

Ajustada para TDD (tempo de escrever o teste antes é pequeno, mas real):

- Fase 0: 1 dia (inclui canaries e config Vitest/Playwright)
- Fase 1: 2-3 dias (TDD estrito)
- Fase 2: 1-2 dias
- Fase 3: 3-4 dias (frontend-design skill acelera aqui)
- Fase 4: 2 dias
- Fase 5: 1 dia

**Total: ~10-13 dias.** Entrega incremental — após Fase 3 já é demonstrável visualmente; Fase 4 torna interativo.

---

## 9. Próximo passo imediato

Com as 6 decisões fechadas em §6, o plano está executável. A Fase 0 começa com:

1. `mkdir app && cd app && pnpm create svelte@latest .` (template skeleton + TS).
2. Instalar dependências: `svelte@5`, `@sveltejs/kit`, `typescript`, `vite`, `tailwindcss`, `dexie`, `dexie-svelte` (ou wrapper custom), `vitest`, `@playwright/test`, `@vite-pwa/sveltekit`, `date-fns`, `lucide-svelte`.
3. Copiar fontes Google no `app.html`: Instrument Serif, Inter, JetBrains Mono.
4. Criar `app/src/app.css` com todas as variáveis CSS do design (`--bg`, `--fire`, `--ember`, `--agua`, etc.) e keyframes `pulse`, `flicker`.
5. Criar `app/src/ui/paletas.ts` com as 5 paletas do design e função `aplicarPaleta(key)`.
6. Inicializar `manifest.webmanifest` com `short_name: "Feitio"`, `name: "Gestão de Feitio"`, `theme_color` da paleta Rainha da Floresta, `display: "standalone"`, `orientation: "landscape"`.
7. Smoke test: `pnpm dev`, abrir em `localhost`, conferir que o CSS variáveis já respondem.

Depois disso, Fase 1 (domínio puro) começa — sem bloqueios externos.
