<#
.SYNOPSIS
    Script PowerShell autônomo para Setup das Skills do Matt Pocock (SDD).

.DESCRIPTION
    Deve ser executado DENTRO da pasta do projeto que deseja configurar.
    Usa o instalador oficial (npx skills) para baixar as skills direto do repositório
    do Matt Pocock, limpa OpenSpec antigo e cria a governança canônica do zero.

.PARAMETER Tracker
    Tipo do issue tracker: 'local' (padrão, .scratch/) ou 'github' (GitHub Issues).

.EXAMPLE
    cd C:\Projetos\qualquer-projeto
    powershell -ExecutionPolicy Bypass -File C:\caminho\para\scripts\setup-ai-skills.ps1
    ou
    .\setup-ai-skills.ps1 -Tracker github
#>

param(
    [ValidateSet("local", "github")]
    [string]$Tracker = "local",
    [switch]$Help
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$mjsScript = Join-Path $scriptDir "setup-ai-skills.mjs"

if ($Help) {
    node "$mjsScript" --help
    exit 0
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js não foi encontrado no PATH. Instale o Node.js v18+ para executar o setup."
    exit 1
}

# Executa dentro do diretório atual (Get-Location)
node "$mjsScript" --tracker $Tracker
