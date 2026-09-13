#!/usr/bin/env node

/**
 * setup-ai-skills.mjs
 *
 * Standalone, Zero-Dependency Setup Script for Matt Pocock's SDD AI Skills & Governance.
 * Designed to be executed INSIDE the target project root.
 *
 * It uses the official `npx skills@latest add mattpocock/skills` CLI to fetch skills directly
 * from the upstream repository, cleans legacy OpenSpec files, and creates canonical SDD governance.
 *
 * Usage inside any project:
 *   node setup-ai-skills.mjs [--tracker local|github]
 *
 * Or from remote/npx:
 *   npx skills@latest add mattpocock/skills ...
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Parse arguments
const args = process.argv.slice(2);
let tracker = 'local'; // 'local' or 'github'

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tracker' && args[i + 1]) {
        tracker = args[++i].toLowerCase();
    } else if (args[i] === '--help' || args[i] === '-h') {
        console.log(`
Universal Standalone AI Skills & Governance Setup
Runs directly INSIDE the project you want to configure.

Usage:
  node setup-ai-skills.mjs [--tracker local|github]

Options:
  --tracker <type>   Issue tracker: 'local' (default: .scratch/) or 'github' (GitHub Issues)
  --help, -h         Show this help message
    `);
        process.exit(0);
    }
}

const TARGET_DIR = process.cwd();

console.log('\n======================================================');
console.log('🚀 Setup Autônomo de Skills de IA (Matt Pocock SDD)');
console.log('======================================================');
console.log(`📁 Diretório Atual:  ${TARGET_DIR}`);
console.log(`🎯 Issue Tracker:    ${tracker}`);

// 1. Limpeza de Legados OpenSpec
console.log('\n[1/4] Verificando e limpando resquícios do OpenSpec...');
const legacyPaths = [
    path.join(TARGET_DIR, 'openspec'),
    path.join(TARGET_DIR, '.agents', 'workflows'),
    path.join(TARGET_DIR, '.agents', 'skills', '.openspec-target'),
];

for (const p of legacyPaths) {
    if (fs.existsSync(p)) {
        fs.rmSync(p, { recursive: true, force: true });
        console.log(`  [-] Removido: ${path.relative(TARGET_DIR, p)}`);
    }
}

const skillsDir = path.join(TARGET_DIR, '.agents', 'skills');
if (fs.existsSync(skillsDir)) {
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name.startsWith('openspec')) {
            const fullPath = path.join(skillsDir, entry.name);
            fs.rmSync(fullPath, { recursive: true, force: true });
            console.log(`  [-] Removido: .agents/skills/${entry.name}`);
        }
    }
}

// 2. Instalação Oficial via npx skills@latest add mattpocock/skills
console.log('\n[2/4] Baixando skills canônicas diretamente do repositório oficial (npx skills)...');
const skillsToInstall = [
    'setup-matt-pocock-skills',
    'grill-with-docs',
    'grill-me',
    'grilling',
    'domain-modeling',
    'codebase-design',
    'to-spec',
    'to-tickets',
    'implement',
    'tdd',
    'code-review',
    'diagnosing-bugs',
    'ask-matt',
];

const skillsArg = skillsToInstall.join(' ');
const cmd = `npx skills@latest add mattpocock/skills --skill ${skillsArg} -y`;

console.log(`  Executando: ${cmd}\n`);
try {
    execSync(cmd, { stdio: 'inherit', cwd: TARGET_DIR });
} catch (error) {
    console.warn('\n  [!] Aviso: npx skills concluiu com aviso ou código não-zero, continuando configuração de governança.');
}

// 2.1 Desabilitar commits automáticos em implement/SKILL.md por padrão
const implementSkillPath = path.join(TARGET_DIR, '.agents', 'skills', 'implement', 'SKILL.md');
if (fs.existsSync(implementSkillPath)) {
    let implementContent = fs.readFileSync(implementSkillPath, 'utf-8');
    implementContent = implementContent.replace(
        /Commit your work to the current branch\./g,
        "Do NOT commit automatically. Propose a Conventional Commit message and ask for the user's explicit authorization before committing, or leave the changes uncommitted for the user to review."
    );
    fs.writeFileSync(implementSkillPath, implementContent, 'utf-8');
    console.log('  [+] Trava aplicada: commits automáticos desabilitados por default em implement/SKILL.md.');
}

// 3. Estruturação da Governança em docs/agents/
console.log('\n[3/4] Criando governança e Single Source of Truth...');

// 3.1 docs/agents/
const docsAgentsDir = path.join(TARGET_DIR, 'docs', 'agents');
fs.mkdirSync(docsAgentsDir, { recursive: true });

fs.writeFileSync(
    path.join(docsAgentsDir, 'domain.md'),
    `# Domain docs: single-context\n\nSingle \`CONTEXT.md\` at the repo root and an ADR directory at \`docs/adr/\`.\n\nRead \`CONTEXT.md\` when entering this project to pick up its vocabulary and concepts. When working on a feature, consult the ADRs in \`docs/adr/\` that relate to the areas you are touching.\n`,
    'utf-8'
);

fs.writeFileSync(
    path.join(docsAgentsDir, 'triage-labels.md'),
    `# Triage labels\n\nThe canonical triage roles are:\n\n- \`needs-triage\`: New issue awaiting classification.\n- \`needs-info\`: Blocked on missing requirements or repro.\n- \`ready-for-agent\`: Unambiguous spec, ready for agent execution.\n- \`ready-for-human\`: Requires human judgement or architectural decision.\n- \`wontfix\`: Intentional decision to not do this.\n`,
    'utf-8'
);

if (tracker === 'github') {
    fs.writeFileSync(
        path.join(docsAgentsDir, 'issue-tracker.md'),
        `# Issue tracker: GitHub Issues\n\nIssues for this repo live in GitHub Issues and are accessed via the \`gh\` CLI.\n\n## Conventions\n\n- Read issues: \`gh issue view <number> --json title,body,labels,comments\`\n- Create issues: \`gh issue create --title "<title>" --body "<body>"\`\n- Triage labels: set on creation or with \`gh issue edit <number> --add-label "<label>"\`\n`,
        'utf-8'
    );
} else {
    fs.writeFileSync(
        path.join(docsAgentsDir, 'issue-tracker.md'),
        `# Issue tracker: Local Markdown\n\nIssues and specs for this repo live as markdown files in \`.scratch/\`.\n\n## Conventions\n\n- One feature per directory: \`.scratch/<feature-slug>/\`\n- The spec is \`.scratch/<feature-slug>/spec.md\`\n- Implementation issues are one file per ticket at \`.scratch/<feature-slug>/issues/<NN>-<slug>.md\`, numbered from \`01\`, never a single combined tickets file\n- Triage state is recorded as a \`Status:\` line near the top of each issue file (see \`triage-labels.md\` for the role strings)\n- Comments and conversation history append to the bottom of the file under a \`## Comments\` heading\n\n## When a skill says "publish to the issue tracker"\n\nCreate a new file under \`.scratch/<feature-slug>/\` (creating the directory if needed).\n\n## When a skill says "fetch the relevant ticket"\n\nRead the file at the referenced path. The user will normally pass the path or the issue number directly.\n`,
        'utf-8'
    );
}
console.log(`  [+] Configurado: docs/agents/ (tracker: ${tracker})`);

// 3.2 docs/adr/
const adrDir = path.join(TARGET_DIR, 'docs', 'adr');
if (!fs.existsSync(adrDir)) {
    fs.mkdirSync(adrDir, { recursive: true });
    console.log('  [+] Criado diretório: docs/adr/');
}

// 3.3 CONTEXT.md
const contextPath = path.join(TARGET_DIR, 'CONTEXT.md');
if (!fs.existsSync(contextPath)) {
    fs.writeFileSync(
        contextPath,
        `# CONTEXT — Domain Model & Ubiquitous Language\n\nEste documento define o glossário ubíquo e as definições canônicas de negócio para este repositório. Não contém detalhes de implementação de frameworks ou código volátil — apenas a linguagem de domínio compartilhada entre Engenharia e Produto.\n\n---\n\n## Termos Canônicos\n\n### EntidadePrincipal\nDefinição concisa da principal entidade de negócio tratada por este serviço.\n\n### AçãoChave\nOperação de negócio executada neste domínio e suas regras semânticas fundamentais.\n\n---\n\n## Invariantes de Negócio\n\n1. **Regra de Consistência:** Toda operação deve preservar a integridade das entidades de domínio.\n2. **Idempotência:** Requisições repetidas com os mesmos parâmetros devem produzir o mesmo estado final sem efeitos colaterais indesejados.\n`,
        'utf-8'
    );
    console.log('  [+] Criado template: CONTEXT.md');
} else {
    console.log('  [=] CONTEXT.md existente preservado.');
}

// 3.4 docs/CODING_STANDARDS.md
const codingStandardsPath = path.join(TARGET_DIR, 'docs', 'CODING_STANDARDS.md');
if (!fs.existsSync(codingStandardsPath)) {
    fs.writeFileSync(
        codingStandardsPath,
        `# Coding Standards & Code Review Guide\n\nEste documento define os padrões de qualidade e o catálogo de boas práticas avaliados nas revisões automatizadas com \`/code-review\`.\n\n---\n\n## 1. Princípios Universais de Engenharia\n\n- **Separação de Responsabilidades:** Mantenha regras de negócio, dados e integrações externas claramente desacoplados.\n- **Módulos Profundos (Deep Modules):** Interfaces públicas simples e enxutas que ocultam implementações ricas e bem isoladas.\n- **Legibilidade e Expressividade:** Nomes semânticos, funções/keywords coesas e eliminação proativa de código morto ou duplicado.\n- **Testabilidade:** Mantenha costuras públicas claras para testes automatizados confiáveis, rápidos e isolados.\n- **Anti-patterns (Fowler Smells):** Evite Large Class/File, Long Method, Feature Envy, Primitive Obsession e Shotgun Surgery.\n\n---\n\n## 2. Padrões Específicos do Projeto\n\n> 💡 *Adapte esta seção para a stack do seu projeto:*\n> - **TypeScript / Back-end:** Tipagem estrita sem \`any\`, DTOs validados, Clean Architecture (Domínio puro e isolado de frameworks).\n> - **Automação de Testes (Robot Framework / Playwright / Cypress):** Page Objects / Resource Keywords desacoplados dos casos de teste; locators centralizados e resilientes; asserções explícitas; proibir esperas arbitrárias (\`Sleep\`).\n> - **Front-end (React / Vue):** Componentes puros, separação entre lógica de estado e renderização visual, acessibilidade (a11y).\n`,
        'utf-8'
    );
    console.log('  [+] Criado template: docs/CODING_STANDARDS.md');
}

// 3.5 docs/DEVELOPMENT_WORKFLOW.md
const workflowPath = path.join(TARGET_DIR, 'docs', 'DEVELOPMENT_WORKFLOW.md');
if (!fs.existsSync(workflowPath)) {
    fs.writeFileSync(
        workflowPath,
        `# Guia de Desenvolvimento com IA (Spec-Driven Development)\n\nEste guia documenta o fluxo de trabalho em 6 etapas utilizando as *Skills for Real Engineers* do Matt Pocock:\n\n\`\`\`text\nSabatina (/grill-with-docs) ──► Design (/codebase-design) ──► Especificação (/to-spec)\n                                                                    │\nRevisão (/code-review)      ◄── Implementação (/implement + TDD) ◄── Fatiamento (/to-tickets)\n\`\`\`\n\n## Ciclo de Desenvolvimento\n\n1. **Sabatina de Requisitos:** \`/grill-with-docs <descrição da demanda>\`\n2. **Design de Módulos:** \`/codebase-design <módulo alvo>\`\n3. **Especificação Técnica:** \`/to-spec <objetivo da feature>\`\n4. **Fatiamento em Tracer Bullets:** \`/to-tickets\`\n5. **Implementação Guiada por Testes:** \`/implement .scratch/<feature>/issues/<ticket>.md\`\n6. **Revisão Automatizada:** \`/code-review HEAD~1...HEAD\`\n`,
        'utf-8'
    );
    console.log('  [+] Criado: docs/DEVELOPMENT_WORKFLOW.md');
}

// 4. Calibração do AGENTS.md
console.log('\n[4/4] Configurando AGENTS.md...');
const agentsPath = path.join(TARGET_DIR, 'AGENTS.md');
const agentSkillsBlock = `## Agent skills\n\n### Issue tracker\n${tracker === 'github'
        ? 'GitHub Issues via `gh` CLI. See `docs/agents/issue-tracker.md`.'
        : 'Local markdown files under `.scratch/<feature-slug>/issues/`. See `docs/agents/issue-tracker.md`.'
    }\n\n### Triage labels\nDefault triage roles (\`needs-triage\`, \`needs-info\`, \`ready-for-agent\`, \`ready-for-human\`, \`wontfix\`). See \`docs/agents/triage-labels.md\`.\n\n### Domain docs\nSingle-context (\`CONTEXT.md\` at root and \`docs/adr/\`). See \`docs/agents/domain.md\`.\n`;

if (fs.existsSync(agentsPath)) {
    let content = fs.readFileSync(agentsPath, 'utf-8');
    if (!content.includes('## Agent skills')) {
        content = content.trimEnd() + '\n\n---\n\n' + agentSkillsBlock;
    }
    if (!content.includes('CONTEXT.md')) {
        if (content.includes('## 2. Roteamento de Contexto')) {
            content = content.replace(
                '## 2. Roteamento de Contexto',
                `## 2. Roteamento de Contexto\n\n- **Domínio e Contexto do Projeto:**\n  > 📖 Leia \`CONTEXT.md\` na raiz para o glossário ubíquo e \`docs/adr/\` para decisões arquiteturais duráveis.`
            );
        } else {
            content = content.trimEnd() + '\n\n## Roteamento de Contexto\n\n- **Domínio do Projeto:** Leia `CONTEXT.md` na raiz e `docs/adr/`.\n- **Padrões de Código:** Leia `docs/CODING_STANDARDS.md`.\n';
        }
    }
    fs.writeFileSync(agentsPath, content, 'utf-8');
    console.log('  [+] AGENTS.md atualizado.');
} else {
    fs.writeFileSync(
        agentsPath,
        `# AGENTS.md — Agent Constitution & Context Router\n\n> **Constituição do Agente:** Leia este arquivo antes de qualquer ação.\n\n---\n\n## 1. O Que É Este Projeto\n\nDescreva o propósito deste repositório.\n\n---\n\n## 2. Roteamento de Contexto\n\n- **Domínio do Projeto:** Leia \`CONTEXT.md\` na raiz e \`docs/adr/\`.\n- **Padrões:** Leia \`docs/CODING_STANDARDS.md\` e \`docs/DEVELOPMENT_WORKFLOW.md\`.\n\n---\n\n${agentSkillsBlock}`,
        'utf-8'
    );
    console.log('  [+] Criado novo AGENTS.md.');
}

console.log('\n======================================================');
console.log('🎉 Setup concluído com sucesso!');
console.log('👉 Próximos passos:');
console.log('   1. Personalize o CONTEXT.md com o glossário ubíquo do seu projeto.');
console.log('   2. Revise docs/CODING_STANDARDS.md com os padrões da sua stack.');
console.log('   3. No chat do agente (Antigravity/Cursor), inicie uma demanda com:');
console.log('      /grill-with-docs <sua demanda>');
console.log('======================================================\n');
