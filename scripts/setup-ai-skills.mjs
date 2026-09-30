#!/usr/bin/env node

/**
 * setup-ai-skills.mjs
 *
 * Standalone, Zero-Dependency Setup Script for Matt Pocock's SDD AI Skills & Governance.
 * Designed to be executed INSIDE the target project root.
 *
 * It uses the official `npx skills@latest add mattpocock/skills` CLI to fetch skills directly
 * from the upstream repository and creates canonical SDD governance.
 * Coexists with OpenSpec — no legacy cleanup is performed.
 *
 * Usage inside any project:
 *   node setup-ai-skills.mjs [--tracker local|github] [--agents claude-code,zed,...] [--openspec]
 *
 * Or from remote/npx:
 *   npx skills@latest add mattpocock/skills ...
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Node.js version check (ESM + modern APIs require v18+)
const nodeVersion = parseInt(process.version.slice(1), 10);
if (nodeVersion < 18) {
    console.error(`[✗] Node.js v18+ é necessário (encontrado: ${process.version}).`);
    process.exit(1);
}

// Parse arguments
const args = process.argv.slice(2);
let tracker = 'local'; // 'local' or 'github'
// Agents that receive the skills (ids of `npx skills add -a`). `.agents/skills/` is always the canonical copy.
let agents = ['claude-code', 'zed', 'antigravity', 'codex'];
// Also initialize OpenSpec (Explore/Propose/Apply/Sync/Archive) alongside Matt Pocock's skills.
let withOpenSpec = false;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tracker' && args[i + 1]) {
        tracker = args[++i].toLowerCase();
    } else if (args[i] === '--agents' && args[i + 1]) {
        agents = args[++i].split(',').map((a) => a.trim()).filter(Boolean);
    } else if (args[i] === '--openspec') {
        withOpenSpec = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
        console.log(`
Universal Standalone AI Skills & Governance Setup
Runs directly INSIDE the project you want to configure.

Usage:
  node setup-ai-skills.mjs [--tracker local|github] [--agents <ids>] [--openspec]

Options:
  --tracker <type>   Issue tracker: 'local' (default: .scratch/) or 'github' (GitHub Issues)
  --agents <ids>     Comma-separated agent ids for 'npx skills add -a' (default: claude-code,zed,antigravity,codex)
  --openspec         Also run 'openspec init' for the same agents (OpenSpec + Matt Pocock skills coexist)
  --help, -h         Show this help message
    `);
        process.exit(0);
    }
}

// Validate tracker value
if (tracker !== 'local' && tracker !== 'github') {
    console.error(`[✗] Valor inválido para --tracker: '${tracker}'. Use 'local' ou 'github'.`);
    process.exit(1);
}

const TARGET_DIR = process.cwd();

console.log('\n======================================================');
console.log('🚀 Setup Autônomo de Skills de IA (Matt Pocock SDD)');
console.log('======================================================');
console.log(`📁 Diretório Atual:  ${TARGET_DIR}`);
console.log(`🎯 Issue Tracker:    ${tracker}`);
console.log(`🤖 Agentes:          ${agents.join(', ')}`);
console.log(`📐 OpenSpec:         ${withOpenSpec ? 'sim' : 'não (use --openspec)'}`);

// 1. Instalação Oficial via npx skills@latest add mattpocock/skills
console.log('\n[1/3] Baixando skills canônicas diretamente do repositório oficial (npx skills)...');
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
const agentsArg = agents.map((a) => `-a ${a}`).join(' ');
const cmd = `npx skills@latest add mattpocock/skills --skill ${skillsArg} ${agentsArg} -y`;

let skillsInstalled = false;
console.log(`  Executando: ${cmd}\n`);
try {
    execSync(cmd, { stdio: 'inherit', cwd: TARGET_DIR, env: { ...process.env, CI: '1' } });
    skillsInstalled = true;
} catch (error) {
    console.warn('\n  [!] Aviso: npx skills concluiu com aviso ou código não-zero.');
}

// Post-install verification
const verifySkillPath = path.join(TARGET_DIR, '.agents', 'skills', 'implement', 'SKILL.md');
if (!skillsInstalled && !fs.existsSync(verifySkillPath)) {
    console.error('\n  [✗] ERRO: Nenhuma skill foi instalada e nenhuma instalação anterior foi encontrada.');
    console.error('      Verifique sua conexão de rede e tente novamente.');
    process.exit(1);
}
if (!skillsInstalled && fs.existsSync(verifySkillPath)) {
    console.log('  [=] Skills já existem localmente de uma execução anterior, continuando configuração de governança.');
}

// 1.1 Desabilitar commits automáticos em implement/SKILL.md por padrão
const implementSkillPath = path.join(TARGET_DIR, '.agents', 'skills', 'implement', 'SKILL.md');
if (fs.existsSync(implementSkillPath)) {
    const originalContent = fs.readFileSync(implementSkillPath, 'utf-8');
    const patchedContent = originalContent.replace(
        /Commit your work to the current branch\./g,
        "Do NOT commit automatically. Propose a Conventional Commit message and ask for the user's explicit authorization before committing, or leave the changes uncommitted for the user to review."
    );
    if (patchedContent !== originalContent) {
        fs.writeFileSync(implementSkillPath, patchedContent, 'utf-8');
        console.log('  [+] Trava aplicada: commits automáticos desabilitados por default em implement/SKILL.md.');
    } else {
        console.warn('  [!] Aviso: texto alvo para patch de commits não encontrado em implement/SKILL.md (pode já ter sido patcheado ou o upstream mudou).');
    }
}

// 2. Estruturação da Governança em docs/agents/
console.log('\n[2/3] Criando governança e Single Source of Truth...');

// 2.1 docs/agents/
const docsAgentsDir = path.join(TARGET_DIR, 'docs', 'agents');
fs.mkdirSync(docsAgentsDir, { recursive: true });

const writeIfMissing = (filePath, content) => {
    if (fs.existsSync(filePath)) {
        console.log(`  [=] Preservado: ${path.relative(TARGET_DIR, filePath)}`);
        return;
    }
    fs.writeFileSync(filePath, content, 'utf-8');
};

writeIfMissing(
    path.join(docsAgentsDir, 'domain.md'),
    `# Domain docs: single-context\n\nSingle \`CONTEXT.md\` at the repo root and an ADR directory at \`docs/adr/\`.\n\nRead \`CONTEXT.md\` when entering this project to pick up its vocabulary and concepts. When working on a feature, consult the ADRs in \`docs/adr/\` that relate to the areas you are touching.\n`
);

writeIfMissing(
    path.join(docsAgentsDir, 'triage-labels.md'),
    `# Triage labels\n\nThe canonical triage roles are:\n\n- \`needs-triage\`: New issue awaiting classification.\n- \`needs-info\`: Blocked on missing requirements or repro.\n- \`ready-for-agent\`: Unambiguous spec, ready for agent execution.\n- \`ready-for-human\`: Requires human judgement or architectural decision.\n- \`wontfix\`: Intentional decision to not do this.\n`
);

if (tracker === 'github') {
    writeIfMissing(
        path.join(docsAgentsDir, 'issue-tracker.md'),
        `# Issue tracker: GitHub Issues\n\nIssues for this repo live in GitHub Issues and are accessed via the \`gh\` CLI.\n\n## Conventions\n\n- Read issues: \`gh issue view <number> --json title,body,labels,comments\`\n- Create issues: \`gh issue create --title "<title>" --body "<body>"\`\n- Triage labels: set on creation or with \`gh issue edit <number> --add-label "<label>"\`\n`
    );
} else {
    writeIfMissing(
        path.join(docsAgentsDir, 'issue-tracker.md'),
        `# Issue tracker: Local Markdown\n\nIssues and specs for this repo live as markdown files in \`.scratch/\`.\n\n## Conventions\n\n- One feature per directory: \`.scratch/<feature-slug>/\`\n- The spec is \`.scratch/<feature-slug>/spec.md\`\n- Implementation issues are one file per ticket at \`.scratch/<feature-slug>/issues/<NN>-<slug>.md\`, numbered from \`01\`, never a single combined tickets file\n- Triage state is recorded as a \`Status:\` line near the top of each issue file (see \`triage-labels.md\` for the role strings)\n- Comments and conversation history append to the bottom of the file under a \`## Comments\` heading\n\n## When a skill says "publish to the issue tracker"\n\nCreate a new file under \`.scratch/<feature-slug>/\` (creating the directory if needed).\n\n## When a skill says "fetch the relevant ticket"\n\nRead the file at the referenced path. The user will normally pass the path or the issue number directly.\n`
    );
}
console.log(`  [+] Configurado: docs/agents/ (tracker: ${tracker})`);

// 2.2 docs/adr/
const adrDir = path.join(TARGET_DIR, 'docs', 'adr');
if (!fs.existsSync(adrDir)) {
    fs.mkdirSync(adrDir, { recursive: true });
    console.log('  [+] Criado diretório: docs/adr/');
}

// 2.3 CONTEXT.md
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

// 2.4 docs/CODING_STANDARDS.md
const codingStandardsPath = path.join(TARGET_DIR, 'docs', 'CODING_STANDARDS.md');
if (!fs.existsSync(codingStandardsPath)) {
    fs.writeFileSync(
        codingStandardsPath,
        `# Coding Standards & Code Review Guide\n\nEste documento define os padrões de qualidade e o catálogo de code smells avaliados nas revisões automatizadas com \`/code-review\`.\n\n---\n\n## 1. Princípios de Engenharia\n\n- **Clean Architecture & DIP:** Camadas de domínio nunca dependem de frameworks ou detalhes de infraestrutura.\n- **Tipagem Estrita:** Proibido uso de \`any\`. Todas as interfaces, DTOs e funções devem ser estritamente tipadas.\n- **Testes Obrigatórios:** Use Cases exigem testes unitários focados na costura pública; endpoints exigem testes de integração.\n- **Fowler Smells:** Evite Large Class, Long Method, Feature Envy, Primitive Obsession e Shotgun Surgery.\n`,
        'utf-8'
    );
    console.log('  [+] Criado template: docs/CODING_STANDARDS.md');
}

// 2.5 docs/DEVELOPMENT_WORKFLOW.md
const workflowPath = path.join(TARGET_DIR, 'docs', 'DEVELOPMENT_WORKFLOW.md');
if (!fs.existsSync(workflowPath)) {
    fs.writeFileSync(
        workflowPath,
        `# Guia de Desenvolvimento com IA (Spec-Driven Development)\n\nEste guia documenta o fluxo de trabalho em 6 etapas utilizando as *Skills for Real Engineers* do Matt Pocock:\n\n\`\`\`text\nSabatina (/grill-with-docs) ──► Design (/codebase-design) ──► Especificação (/to-spec)\n                                                                    │\nRevisão (/code-review)      ◄── Implementação (/implement + TDD) ◄── Fatiamento (/to-tickets)\n\`\`\`\n\n## Ciclo de Desenvolvimento\n\n1. **Sabatina de Requisitos:** \`/grill-with-docs <descrição da demanda>\`\n2. **Design de Módulos:** \`/codebase-design <módulo alvo>\`\n3. **Especificação Técnica:** \`/to-spec <objetivo da feature>\`\n4. **Fatiamento em Tracer Bullets:** \`/to-tickets\`\n5. **Implementação Guiada por Testes:** \`/implement .scratch/<feature>/issues/<ticket>.md\`\n6. **Revisão Automatizada:** \`/code-review HEAD~1...HEAD\`\n`,
        'utf-8'
    );
    console.log('  [+] Criado: docs/DEVELOPMENT_WORKFLOW.md');
}

// 3. Calibração do AGENTS.md
console.log('\n[3/3] Configurando AGENTS.md...');
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
        content = content.replace(
            '## 2. Roteamento de Contexto',
            `## 2. Roteamento de Contexto\n\n- **Domínio e Contexto do Projeto:**\n  > 📖 Leia \`CONTEXT.md\` na raiz para o glossário ubíquo e \`docs/adr/\` para decisões arquiteturais duráveis.`
        );
    }
    fs.writeFileSync(agentsPath, content, 'utf-8');
    console.log('  [+] AGENTS.md atualizado.');
} else {
    fs.writeFileSync(
        agentsPath,
        `# AGENTS.md — Agent Constitution & Context Router\n\n> **Constituição do Agente:** Leia este arquivo antes de qualquer ação.\n\n---\n\n## 1. O Que É Este Projeto\n\nDescreva o propósito deste serviço.\n\n---\n\n## 2. Roteamento de Contexto\n\n- **Domínio do Projeto:** Leia \`CONTEXT.md\` na raiz e \`docs/adr/\`.\n- **Padrões:** Leia \`docs/CODING_STANDARDS.md\` e \`docs/DEVELOPMENT_WORKFLOW.md\`.\n\n---\n\n${agentSkillsBlock}`,
        'utf-8'
    );
    console.log('  [+] Criado novo AGENTS.md.');
}

// 4. (Opcional) OpenSpec ao lado das skills do Matt Pocock
if (withOpenSpec) {
    console.log('\n[extra] Inicializando OpenSpec para os mesmos agentes...');
    // Map `npx skills` agent ids to `openspec init --tools` ids (only the ones that differ).
    const openspecToolMap = { 'claude-code': 'claude', 'gemini-cli': 'gemini', 'kimi-code-cli': 'kimi', roo: 'roocode' };
    const tools = agents.map((a) => openspecToolMap[a] ?? a).join(',');
    const openspecCmd = `npx -y @fission-ai/openspec@latest init --tools ${tools} --no-animation .`;
    console.log(`  Executando: ${openspecCmd}\n`);
    try {
        execSync(openspecCmd, { stdio: 'inherit', cwd: TARGET_DIR, env: { ...process.env, CI: '1' } });
        console.log('  [+] OpenSpec configurado (openspec/config.yaml + skills/comandos por agente).');
    } catch (error) {
        console.warn('  [!] Aviso: openspec init terminou com código não-zero. Rode manualmente: ' + openspecCmd);
    }
}

console.log('\n======================================================');
console.log('🎉 Setup concluído com sucesso!');
console.log('👉 Próximo passo: Abra seu agente (Claude Code / Antigravity / Zed) e rode:');
console.log('   /setup-matt-pocock-skills');
if (withOpenSpec) console.log('   /opsx:explore (Claude Code) ou /openspec-explore (Zed/Codex) para o trilho OpenSpec');
console.log('======================================================\n');
