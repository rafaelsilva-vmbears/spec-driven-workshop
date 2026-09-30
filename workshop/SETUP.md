# Etapa 0 — Setup do Workshop (do zero)

O workshop roda **dentro do template de backend da empresa**, sobre a codebase, as regras (`.agents/rules/`), as skills (`.agents/skills/`) e o `AGENTS.md` que o template já possui. **Nada do workshop vem pré-configurado**: o participante executa cada passo abaixo na sua branch de exercício. Ao final, tudo que foi criado fica na branch e o `main` do template permanece intocado.

Os dois trilhos ([A: Matt Pocock](./mattpocock-skills.md) e [B: OpenSpec](./openspec.md)) começam por esta página. Faça a seção 1, a seção 2 e depois **só a seção do seu trilho** (3 ou 4). A seção 5 vale para os dois.

**A configuração é independente de editor.** Você pode instalar para vários agentes de uma vez e alternar entre eles durante o workshop, por exemplo Claude Code em uma etapa e Antigravity na seguinte, sobre a mesma branch. Os exemplos abaixo usam esses dois; troque ou acrescente ids conforme a tabela da seção 1.

---

## 1. Pré-requisitos

| Ferramenta | Versão | Verificação |
|---|---|---|
| Node.js | 22+ | `node --version` |
| pnpm | 11+ | `pnpm --version` |
| Docker + Compose | recente | `docker compose version` |
| Editor com agente | Claude Code, Zed, Antigravity ou Codex | — |
| OpenSpec CLI (só trilho B) | 1.13+ | `npm i -g @fission-ai/openspec@latest && openspec --version` |

Ids do seu editor nas CLIs usadas abaixo (os nomes diferem entre as duas ferramentas):

| Editor | Skills do template (`.agents/skills/`) | `openspec init --tools` | O que o OpenSpec gera | Sintaxe dos comandos OpenSpec |
|---|---|---|---|---|
| Claude Code | precisa de symlinks em `.claude/skills/` (seção 3) | `claude` | `.claude/skills/openspec-*` + `.claude/commands/opsx/` | `/opsx:propose` |
| Antigravity | lê direto, nada a fazer | `antigravity` | `.agents/skills/openspec-*` + `.agents/workflows/opsx-*.md` | `/opsx-propose` |
| Zed | lê direto, nada a fazer | `zed` | `.agents/skills/openspec-*` | `/openspec-propose` |
| Codex | lê direto, nada a fazer | `codex` | `.agents/skills/openspec-*` | `$openspec-propose` |

As skills do Matt Pocock (`/to-spec`, `/implement`, ...) têm o mesmo nome em todos os editores. Só a sintaxe dos comandos do OpenSpec muda; os guias escrevem `/opsx-<ação>` e você traduz pela coluna da direita.

---

## 2. Preparar o template e a branch de exercício

```bash
git clone <url-do-template> && cd backend-nestjs-template
git checkout -b workshop/<seu-nome>-<a|b> main     # branch descartável
pnpm install
# crie o .env conforme o README da raiz
docker compose up -d
pnpm migrate:run
pnpm check && pnpm build && pnpm test              # tudo verde antes de começar
```

O que já existe e você **não** precisa criar:
- A codebase sem nenhuma feature de exemplo: só a estrutura das camadas em `src/`, banco com Drizzle, health check, logger, OpenTelemetry e OpenAPI. O domínio de Tarefas nasce inteiro no workshop.
- `AGENTS.md`, `.agents/rules/` e as skills do template em `.agents/skills/` (arquitetura NestJS, API design, Drizzle, testes, clean code, observabilidade).
- As skills do Matt Pocock em `.agents/skills/` (`grill-with-docs`, `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, `ask-matt`, ...), já com a trava de **não comitar sem autorização** em `implement/SKILL.md`.
- As User Stories do exercício em [`workshop/user-stories/`](./user-stories/README.md). Elas são material do workshop, não do template.

O que **não** existe ainda e nasce durante o workshop: `docs/agents/` e a seção `## Agent skills` do `AGENTS.md` (Etapa 0 do trilho A), `CONTEXT.md`, `docs/adr/`, `.scratch/` (trilho A), `openspec/` (trilho B), os arquivos dos editores que você usar (`.claude/`, `.agents/workflows/`), o Playwright (Etapa 12) e todo o código das US-001..007.

---

## 3. Trilho A — instalar as skills no seu editor

As skills já estão no template, em `.agents/skills/`, com a trava de **não comitar sem autorização** aplicada em `implement/SKILL.md`. **Não reinstale.**

> ⚠️ Não rode `npx skills add mattpocock/skills ...` nem `scripts/setup-ai-skills.mjs` no workshop. O `npx skills add` baixa a versão upstream por cima da do template e **reabre o commit automático** em `implement/SKILL.md`; o script ainda gera `docs/agents/` e `CONTEXT.md` sozinho, decisões que aqui são suas. Se algum dos dois for executado por engano, restaure com `git checkout -- .agents/skills`, apague `skills-lock.json` e refaça os symlinks do Claude Code abaixo.

- **Antigravity, Zed e Codex** leem `.agents/skills/` diretamente. Nada a fazer.
- **Claude Code** só enxerga `.claude/skills/`. Espelhe as skills do template com symlinks **por arquivo** (um symlink por diretório quebra o hook de pre-commit, porque o `lefthook` calcula o changeset com `git hash-object` e não consegue hashear um link para diretório):

```bash
mkdir -p .claude/skills
(cd .agents/skills && find . -type f ! -path '*/agents/openai.yaml') | while read -r f; do
  f=${f#./}
  dir=".claude/skills/$(dirname "$f")"
  mkdir -p "$dir"
  up=$(printf '../%.0s' $(seq 1 $(($(echo "$dir" | tr -cd '/' | wc -c) + 1))))
  ln -sfn "${up}.agents/skills/$f" ".claude/skills/$f"
done
find .claude/skills -type l ! -exec test -e {} \; -print   # vazio = todos os links resolvem
```

No Windows sem Developer Mode (symlinks bloqueados), copie em vez de linkar: `cp -r .agents/skills/* .claude/skills/`. A cópia perde a fonte única, então refaça-a se editar algo em `.agents/skills/`.

Os symlinks podem ser comitados na sua branch de exercício e continuam apontando para a cópia única do template, então qualquer ajuste em `.agents/skills/` vale para todos os editores ao mesmo tempo. Reinicie o Claude Code para ele recarregar a lista de skills.

Depois, no chat do agente:

```text
/setup-matt-pocock-skills
```

A skill entrevista você: escolha **Local markdown** (`.scratch/`) como issue tracker e **Single-context** (`CONTEXT.md` na raiz + `docs/adr/`) como layout de domínio. Ela então cria `docs/agents/issue-tracker.md` e `docs/agents/domain.md` e acrescenta a seção `## Agent skills` ao `AGENTS.md`. Todas as outras skills leem esses arquivos para saber onde publicar specs e tickets. Siga para a [Etapa 1 do trilho A](./mattpocock-skills.md#etapa-1--bootstrap-e-deep-modules).

---

## 4. Trilho B — inicializar o OpenSpec

```bash
openspec init --tools claude,antigravity --no-animation .   # um id por editor, separados por vírgula
openspec list --json                                        # "root" deve apontar para a raiz do projeto
```

O comando cria `openspec/config.yaml`, `openspec/specs/`, `openspec/changes/` e, por editor:
- **Claude Code:** `.claude/skills/openspec-*` e `.claude/commands/opsx/*.md` (`/opsx:explore`, `/opsx:propose`, ...).
- **Antigravity:** `.agents/skills/openspec-*` e `.agents/workflows/opsx-*.md` (`/opsx-explore`, `/opsx-propose`, ...).
- **Zed / Codex:** `.agents/skills/openspec-*` (`/openspec-explore`, `$openspec-explore`, ...).

Ele **não** remove nem altera as skills do template. Para acrescentar um editor depois, rode `openspec init --tools <id>` de novo; para atualizar os arquivos gerados após um upgrade da CLI, `openspec update`. Reinicie o editor para ele recarregar os comandos.

Em seguida, cole no `openspec/config.yaml` o contexto do template e a política de commits, para que `/opsx:propose`, `/opsx:apply` e `/opsx:archive` sigam as mesmas regras que o `AGENTS.md` impõe:

```yaml
schema: spec-driven

context: |
  Company NestJS backend template (Clean Architecture, NestJS 11, TypeScript strict,
  Drizzle ORM, PostgreSQL, Vitest, Biome). Read AGENTS.md first: it routes to the
  architecture rules (.agents/rules/, .agents/skills/nestjs-architecture), coding
  standards (docs/CODING_STANDARDS.md), domain glossary (CONTEXT.md) and ADRs (docs/adr/).
  Domain never imports from adapters. No `any`. Use cases need unit tests, routes need e2e tests.
  Specs, tickets and comments in pt-br; code, commits and API docs in en.

rules:
  proposal:
    - Reference the User Story ids (US-00x) from workshop/user-stories/README.md when the change comes from them
    - Always include a "Non-goals" section
  design:
    - Name the public seams where the change will be tested (use case port, HTTP controller, journey)
    - Respect existing ADRs in docs/adr/; flag conflicts explicitly instead of overriding them
  tasks:
    - Slice vertically (tracer bullets): each task cuts DTO -> controller -> use case -> port -> adapter -> test
    - One task per fresh context window; never a horizontal "all schemas then all controllers" split

operations:
  apply:
    guidance:
      - Use TDD at the agreed seams (red -> green -> refactor); run `pnpm check`, `pnpm build` and `pnpm test` before marking a task done
      - NEVER run `git commit` on your own. Show `git status -s`, propose a Conventional Commit message and wait for the developer's explicit authorization (AGENTS.md rule 4, .agents/rules/universal-rules.md)
  archive:
    guidance:
      - Summarize the archive outcome and the resulting durable specs before finishing
      - Do not commit the archive; propose the commit message and wait for authorization
```

Confirme que a política chegou ao agente:

```bash
openspec new change smoke-test --json >/dev/null
openspec instructions apply --change smoke-test --json | grep -c "NEVER run"   # esperado: 1
rm -rf openspec/changes/smoke-test
```

Siga para a [Etapa 1 do trilho B](./openspec.md#etapa-1--bootstrap-e-análise-arquitetural).

---

## 5. Regras que valem nos dois trilhos

| Preocupação | Trilho A | Trilho B |
|---|---|---|
| Spec | `.scratch/<feature>/spec.md` | `openspec/changes/<change>/specs/<capability>/spec.md` (delta) e `openspec/specs/` (durável) |
| Tarefas | `.scratch/<feature>/issues/NN-<slug>.md` com `Blocked by:` | `openspec/changes/<change>/tasks.md` |
| Design | dentro da spec + ADRs em `docs/adr/` | `openspec/changes/<change>/design.md` + ADRs em `docs/adr/` |
| Glossário | `CONTEXT.md`, criado na Etapa 2 | `CONTEXT.md`, criado na Etapa 2 |
| Code review | `/code-review <ref>` acha a spec em `.scratch/` | `/code-review <ref>` recebe o caminho da spec do OpenSpec |
| Commits | o agente propõe, **você** autoriza | idem (via `operations.*.guidance`) |
| Grafia dos comandos | `/to-spec`, `/implement`, ... em todos os editores | `/opsx:<ação>` no Claude Code, `/opsx-<ação>` no Antigravity, `/openspec-<ação>` no Zed, `$openspec-<ação>` no Codex |
| Trocar de editor no meio | nada a fazer; só o Claude Code precisa dos symlinks da seção 3 | nada a fazer se ele já estava em `--tools`; senão, repita o `openspec init --tools <id>` |

Ao terminar o workshop, descarte a branch de exercício (`git branch -D workshop/...`). O template não guarda nada do que foi produzido.

---

## 6. Preparar o Playwright (antes da Etapa 12)

O template não traz o Playwright. Os dois trilhos o instalam na branch de exercício, no início da Etapa 12, para os testes de jornada na costura pública máxima.

```bash
pnpm add -D @playwright/test
npm pkg set scripts.test:pw="playwright test" scripts.test:pw:report="playwright show-report"
mkdir -p tests/playwright
```

Crie `playwright.config.ts` na raiz:

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/playwright',
  testMatch: '**/*.pw.ts',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
  webServer: {
    command: 'pnpm start',
    url: 'http://localhost:3000/actuator/health',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})
```

> **Use o sufixo `.pw.ts`, nunca `.spec.ts`.** O Vitest do template coleta todo `**/*.spec.ts`; um teste do Playwright com esse nome seria executado pelo `pnpm test` e pelo hook de pre-commit, e falharia. O `testMatch` acima faz o Playwright procurar só `*.pw.ts`, sem alterar a configuração do template.

Confira que o ambiente está pronto antes de pedir ao agente para escrever a jornada:

```bash
pnpm build
pnpm test:pw --list      # lista zero testes, sem erro de configuração
pnpm test                # continua verde: o Vitest ignora tests/playwright/*.pw.ts
```

