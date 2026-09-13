# Setup Autônomo de Skills de IA (Matt Pocock SDD)

Este guia explica como configurar **qualquer projeto novo ou existente** (Node.js, TypeScript, Python, Go, Robot Framework, React, etc.) com as **Skills for Real Engineers** do Matt Pocock direto da fonte oficial via `npx`, gerando toda a estrutura de governança do zero de forma agnóstica.

---

## 1. Como Configurar Qualquer Projeto Alvo

Abra o terminal **diretamente dentro da pasta raiz do projeto que você quer configurar** (ex: `C:\Projetos\meu-servico` ou `/home/user/meu-servico`):

### Opção A: Executar o Script Automatizado (Recomendado)

O script realiza o download oficial, limpa legados e cria toda a estrutura de governança em uma única execução.

No Bash / Terminal:
```bash
# Estando dentro da pasta do projeto que quer configurar:
node <caminho-para-este-repositorio>/scripts/setup-ai-skills.mjs

# Exemplo com caminho absoluto no Windows:
node C:/Users/raffsilva/Documents/spec-driven-workshop/scripts/setup-ai-skills.mjs
```

Ou no PowerShell:
```powershell
# Estando dentro da pasta do projeto que quer configurar:
powershell -ExecutionPolicy Bypass -File <caminho-para-este-repositorio>\scripts\setup-ai-skills.ps1

# Exemplo com caminho absoluto:
powershell -ExecutionPolicy Bypass -File C:\Users\raffsilva\Documents\spec-driven-workshop\scripts\setup-ai-skills.ps1
```

> **Dica:** Por padrão o issue tracker é o **Markdown Local** (`.scratch/`). Se quiser usar **GitHub Issues**, adicione o parâmetro `--tracker github`.

---

### Opção B: Instalação Manual Interativa (100% Nativo Matt Pocock)

Se preferir não rodar o script e deixar o agente criar tudo interativamente:

```bash
# 1. Baixa as skills direto do repositório oficial do Matt Pocock para o Antigravity / Cursor
npx skills@latest add mattpocock/skills --skill setup-matt-pocock-skills grill-with-docs grill-me grilling domain-modeling codebase-design to-spec to-tickets implement tdd code-review diagnosing-bugs ask-matt -y

# 2. No chat do agente dentro do projeto alvo, execute:
/setup-matt-pocock-skills
```

O comando interativo `/setup-matt-pocock-skills` fará uma breve entrevista no chat para identificar o projeto, escolher o issue tracker e gerar os arquivos de governança.

---

## 2. O Que o Script `setup-ai-skills.mjs` Faz Automaticamente

1. **Purga de Legados:** Remove pastas e resquícios de OpenSpec (`openspec/`, `.agents/workflows/`, `.agents/skills/openspec-*`) se existirem.
2. **Download Oficial Upstream:** Executa `npx skills@latest add mattpocock/skills ...` para baixar as skills canônicas direto da nuvem oficial.
3. **Trava de Segurança contra Auto-commits:** Calibra `implement/SKILL.md` para proibir commits automáticos desavisados, exigindo confirmação explícita do desenvolvedor com mensagem Conventional Commits.
4. **Governança Canônica (`docs/agents/`):** Cria `domain.md`, `triage-labels.md` e `issue-tracker.md` com os contratos oficiais do Matt Pocock.
5. **Single Source of Truth:**
   - `CONTEXT.md`: Glossário ubíquo e invariantes de negócio.
   - `docs/adr/`: Diretório para Architecture Decision Records duráveis.
   - `docs/CODING_STANDARDS.md`: Padrões universais de engenharia e catálogo de code smells (facilmente customizável para qualquer stack).
   - `docs/DEVELOPMENT_WORKFLOW.md`: Guia de ciclo de vida SDD em 6 etapas.
6. **Calibração do `AGENTS.md`:** Garante o registro de skills e o roteamento de contexto no arquivo constitucional do agente.

---

## 3. Próximos Passos no Projeto Configurado

### Se você usou o Script Automatizado (Opção A):
Toda a infraestrutura já está pronta!
1. Abra o projeto no Antigravity / Cursor.
2. Personalize o `CONTEXT.md` com o vocabulário de negócio do seu projeto.
3. Ajuste `docs/CODING_STANDARDS.md` para as particularidades da sua stack tecnológica.
4. Inicie o ciclo de desenvolvimento chamando no chat:
   ```text
   /grill-with-docs <descrição do que deseja construir ou alterar>
   ```

### Se você usou a Instalação Manual (Opção B):
1. Execute `/setup-matt-pocock-skills` no chat para responder à entrevista inicial do assistente.
2. Prossiga normalmente com `/grill-with-docs`.

