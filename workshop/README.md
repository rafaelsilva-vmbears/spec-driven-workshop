# Workshop: Spec-Driven Development — Dois Trilhos

> Este repositório é o **template de backend da empresa**. O workshop de Spec-Driven Development (SDD) roda **dentro dele**, usando a codebase, as regras (`.agents/rules/`), as skills e o `AGENTS.md` que o template já tem. Com ou sem o workshop, o template segue sua vida; o workshop apenas exercita o que ele oferece, em **dois trilhos** sobre a mesma API de Gestão de Tarefas.

## Três camadas, três lugares

| Camada | O que é | Onde fica | Quem altera |
|---|---|---|---|
| **Template** | Codebase, configs, `AGENTS.md`, `.agents/rules/`, `.agents/skills/` (skills do template e do Matt Pocock, com a trava de commit), `docs/` (`CODING_STANDARDS.md`, `DEVELOPMENT_WORKFLOW.md`, `SETUP_AI_SKILLS.md`), `scripts/` | raiz do repositório | o time do template, independentemente do workshop |
| **Material do workshop** | Estes guias e as User Stories do exercício (US-001..007, gestão de tarefas) | `workshop/` | quem mantém o workshop |
| **Produção do participante** | Configuração da Etapa 0, glossário, ADRs, specs, tickets, changes e código das US | raiz, **somente na branch de exercício** | o participante, durante o workshop |

O template não referencia `workshop/`, e nada da terceira camada existe no template. A tabela abaixo detalha o que o participante cria e em qual etapa:

| Etapa | Artefato | Trilho |
|---|---|---|
| 0 | `.claude/skills/` (symlinks, só Claude Code) | A e B |
| 0 | `docs/agents/issue-tracker.md`, `docs/agents/domain.md` e a seção `## Agent skills` do `AGENTS.md` | A |
| 0 | `openspec/`, `.claude/skills/openspec-*`, `.claude/commands/opsx/`, `.agents/skills/openspec-*`, `.agents/workflows/opsx-*` | B |
| 2 | `CONTEXT.md`, `docs/adr/` | A e B |
| 3–4 | `.scratch/<feature>/spec.md` e `.scratch/<feature>/issues/` | A |
| 3, 6 | `openspec/changes/<change>/` | B |
| 4–11 | código e testes em `src/` e `test/` | A e B |
| 12 | `@playwright/test`, `playwright.config.ts`, scripts `test:pw`, `tests/playwright/*.pw.ts` | A e B |
| 13 | `openspec/specs/`, `openspec/changes/archive/` | B |

Regras do template que valem **durante** o workshop, em qualquer trilho:
- **Clean Architecture** e tipagem estrita do `AGENTS.md`; domain nunca importa adapters.
- **Commits apenas sob autorização.** Nenhuma skill comita sozinha: `/implement` já vem com a trava no template, e o trilho B recebe a mesma instrução no `openspec/config.yaml` durante a Etapa 0. O agente mostra o diff, sugere a mensagem e espera o desenvolvedor.
- **Testes obrigatórios** e quality gates (`pnpm check`, `pnpm build`, `pnpm test`) antes de dar uma etapa por concluída.

## Antes de começar

Nada vem pré-configurado. A **[Etapa 0 (SETUP.md)](./SETUP.md)** é executada por você: clonar o template, criar a branch de exercício, apontar os editores que pretende usar (Claude Code, Antigravity, Zed, Codex, um ou vários) para as skills que o template já traz e, no trilho B, inicializar o OpenSpec para os mesmos editores. Só depois comece a Etapa 1 do trilho escolhido. Trocar de editor no meio do workshop é normal; a configuração é a mesma para todos.

## Qual trilho escolher?

- **Trilho A** quando o objetivo é praticar a cadeia modular do Matt Pocock: sabatina profunda, spec sintetizada da conversa, tickets como grafo de dependências, `/ask-matt` como roteador.
- **Trilho B** quando o objetivo é praticar um ciclo de vida de mudanças com CLI e validação: proposal, design, delta spec, `tasks.md`, `openspec validate`, sync e archive.
- Os dois são executados sobre o template, em branches de exercício criadas a partir de `main` (ex.: `workshop/trilho-a`, `workshop/trilho-b`). Essas branches são descartáveis; o `main` do template não muda por causa do workshop.

## Regra de convivência

Cada trilho escreve apenas nos seus diretórios. O trilho A nunca toca em `openspec/`; o trilho B nunca toca em `.scratch/`. O script de setup e o `openspec init` não apagam nada um do outro, então os dois trilhos podem ser feitos na mesma máquina em branches diferentes (ver [SETUP.md](./SETUP.md)).
