# Plano de Implementação — MVP do Aplicativo de Gestão de Feitio

> Plano de execução para implementar o [Gestão de Feitio Dashboard](../design/project/Gestao%20de%20Feitio.html) — protótipo de alta fidelidade recebido via Claude Design.
>
> Documentos base: [Tutorial](./tutorial-producao-daime.md) · [Requisitos](./requisitos.md) · [Projeto](./projeto.md)

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

### Fase 0 — Setup (~1 dia)

- Criar pasta `app/` em `gestao-feitio/` com SvelteKit + TypeScript + Tailwind.
- Configurar `@vite-pwa/sveltekit`, Dexie, Vitest, Playwright.
- Importar fontes Google (Instrument Serif, Inter, JetBrains Mono).
- Criar variáveis CSS no `:root` espelhando o design (`--fire`, `--ember`, `--agua`, `--cozimento`, `--daime`, `--agua-forte`, softs via `color-mix`).
- Implementar seletor de **paleta** (5 paletas do design) em `app/src/ui/paletas.ts`, aplicada via `document.documentElement.style.setProperty`.

**Arquivos novos:**
- `app/package.json`, `app/svelte.config.js`, `app/vite.config.ts`
- `app/src/app.css` (variáveis + keyframes `pulse`, `flicker`)
- `app/src/ui/paletas.ts`

### Fase 1 — Domínio puro + projeções (~2 dias)

Implementar em TypeScript puro (sem Svelte):

- `domain/entities/panela.ts` — tipos `Panela`, `EstadoPanela`, `TipoConteudo`, `TipoTiragem`, `Tiragem`.
- `domain/entities/tonel.ts`, `feitio.ts`, `fornalha.ts`.
- `domain/events/tipos.ts` — união discriminada completa.
- `domain/regras/nomenclatura.ts` — `calcularTipoTiragem(panela)` com cobertura do ciclo de água forte (seguir `projeto.md` §4.3).
- `domain/regras/maquina-estados.ts` — `transicao(estado, comando)`.
- `domain/projecoes/fornalha.ts`, `panelas.ts`, `toneis.ts` — folds de eventos → estado.
- `domain/regras/correcao-duplas.ts` — sugestão "mire X L" baseada em dupla.

**Testes Vitest** (Fase 1 termina com cobertura ≥ 90% do domínio):
- Todos os cenários do tutorial (quinta-feira, sexta-feira, entrada em água forte, múltiplas tiragens de água forte).
- Máquina de estados com tabela exaustiva.
- Nomenclatura automática com fixtures do design (`initialState`).

### Fase 2 — Persistência + stores (~1 dia)

- `infra/persistencia/dexie-db.ts` — schema IndexedDB (tabelas `eventos`, `feitios`, `pessoas`, `configuracoes`).
- `infra/persistencia/repositorio-eventos.ts` — `append()`, `streamByFeitio()`.
- `app/stores.ts` — stores Svelte derivados das projeções, reativos via `liveQuery`.
- `app/comandos.ts` — command handlers que validam no domínio, apendam evento, atualizam store.

### Fase 3 — UI: portar dashboard (~3-4 dias)

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

### Fase 4 — Interatividade completa (~2 dias)

Ligar os botões aos commands:
- `Tirar` → valida via domínio → `TiragemRegistrada` → atualiza panela e tonel destino → panela vai para `aguardando_reposicao`.
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
│   │   ├── domain/                        ← Fase 1
│   │   │   ├── entities/{panela,tonel,feitio,fornalha}.ts
│   │   │   ├── events/tipos.ts
│   │   │   ├── regras/{nomenclatura,maquina-estados,correcao-duplas}.ts
│   │   │   └── projecoes/{fornalha,panelas,toneis}.ts
│   │   ├── infra/                         ← Fase 2
│   │   │   └── persistencia/{dexie-db,repositorio-eventos}.ts
│   │   ├── app/                           ← Fase 2
│   │   │   ├── stores.ts
│   │   │   └── comandos.ts
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

- Fase 0: 1 dia
- Fase 1: 2 dias
- Fase 2: 1 dia
- Fase 3: 3-4 dias
- Fase 4: 2 dias
- Fase 5: 1 dia

**Total: ~10-11 dias de trabalho focado.** Pode ser entregue incrementalmente — após Fase 3 já é demonstrável visualmente.

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
