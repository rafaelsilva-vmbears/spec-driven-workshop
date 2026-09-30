<#
.SYNOPSIS
    Script PowerShell autônomo para Setup das Skills do Matt Pocock (SDD).

.DESCRIPTION
    Deve ser executado DENTRO da pasta do projeto que deseja configurar.
    Usa o instalador oficial (npx skills) para baixar as skills direto do repositório
    do Matt Pocock e cria a governança canônica. Convive com OpenSpec (nada é removido).

.PARAMETER Tracker
    Tipo do issue tracker: 'local' (padrão, .scratch/) ou 'github' (GitHub Issues).

.PARAMETER Agents
    Ids de agentes para 'npx skills add -a' (padrão: claude-code,zed,antigravity,codex).

.PARAMETER OpenSpec
    Também executa 'openspec init' para os mesmos agentes (trilho OpenSpec).

.EXAMPLE
    cd C:\Projetos\qualquer-projeto
    powershell -File C:\Projetos\backend-nestjs-template\scripts\setup-ai-skills.ps1
    ou
    .\setup-ai-skills.ps1 -Tracker github
    ou
    .\setup-ai-skills.ps1 -OpenSpec -Agents "claude-code,zed"
#>

param(
    [ValidateSet("local", "github")]
    [string]$Tracker = "local",
    [string]$Agents = "claude-code,zed,antigravity,codex",
    [switch]$OpenSpec,
    [switch]$Help
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mjsScript = Join-Path $scriptDir "setup-ai-skills.mjs"

if ($Help) {
    node $mjsScript --help
    exit 0
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js não foi encontrado no PATH. Instale o Node.js v18+ para executar o setup."
    exit 1
}

# Executa dentro do diretório atual (Get-Location)
$extraArgs = @("--tracker", $Tracker, "--agents", $Agents)
if ($OpenSpec) { $extraArgs += "--openspec" }
node $mjsScript @extraArgs
exit $LASTEXITCODE
