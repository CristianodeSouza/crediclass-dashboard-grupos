# Zero_erro — Agente de Verificação End-to-End (PowerShell/Windows)
# Verifica: Git → GitHub Actions → Render → Vercel → URLs em Produção

param(
    [switch]$Verbose = $false
)

# Cores para terminal Windows
function Write-ColorOutput([string]$Message, [string]$Color = "White") {
    $colors = @{
        "Green"  = [System.ConsoleColor]::Green
        "Red"    = [System.ConsoleColor]::Red
        "Yellow" = [System.ConsoleColor]::Yellow
        "Cyan"   = [System.ConsoleColor]::Cyan
        "Blue"   = [System.ConsoleColor]::Blue
    }

    $currentColor = [System.Console]::ForegroundColor
    [System.Console]::ForegroundColor = $colors[$Color]
    Write-Host $Message
    [System.Console]::ForegroundColor = $currentColor
}

# Header
Write-Host ""
Write-ColorOutput "╔════════════════════════════════════════════════════════════╗" "Cyan"
Write-ColorOutput "║         🚀 ZERO_ERRO — VERIFICAÇÃO DE DEPLOY 🚀           ║" "Cyan"
Write-ColorOutput "║     Git → GitHub Actions → Render → Vercel → Produção     ║" "Cyan"
Write-ColorOutput "╚════════════════════════════════════════════════════════════╝" "Cyan"
Write-Host ""

# Contadores
$passedChecks = 0
$failedChecks = 0
$warnings = @()

function Test-Timestamp {
    return (Get-Date).ToString("HH:mm:ss")
}

function Log-Check([string]$Category, [string]$Status, [string]$Message, [string]$Details = "") {
    $timestamp = Test-Timestamp

    $statusColors = @{
        "✅" = "Green"
        "❌" = "Red"
        "⚠️" = "Yellow"
        "ℹ️" = "Cyan"
    }

    $color = $statusColors[$Status]

    Write-Host "[$timestamp] " -NoNewline
    Write-ColorOutput "$Status $Category`: $Message" $color

    if ($Details) {
        Write-Host "    $Details"
    }

    if ($Status -eq "✅") {
        $global:passedChecks++
    } elseif ($Status -eq "❌") {
        $global:failedChecks++
    } elseif ($Status -eq "⚠️") {
        $global:warnings += "$Category: $Message"
    }
}

# ════════════════════════════════════════════════════════════════
# 1. VERIFICAR GIT STATUS E PUSH
# ════════════════════════════════════════════════════════════════
Write-Host ""
Write-ColorOutput "📦 1. GIT STATUS & PUSH" "Cyan"
Write-Host "=" * 60

try {
    # Status atual
    $status = git status --short 2>&1
    if ($LASTEXITCODE -eq 0) {
        if ($status) {
            Log-Check "Git" "⚠️" "Arquivos não commitados" "$status"
        } else {
            Log-Check "Git" "✅" "Working tree limpo"
        }
    } else {
        Log-Check "Git" "❌" "Erro ao verificar status"
    }

    # Branch atual
    $branch = git rev-parse --abbrev-ref HEAD 2>&1
    if ($LASTEXITCODE -eq 0) {
        Log-Check "Git" "ℹ️" "Branch atual: $branch"
    }

    # Commits não enviados
    $unpushed = git log origin/main..HEAD --oneline 2>&1
    if ($LASTEXITCODE -eq 0) {
        if ($unpushed) {
            $count = ($unpushed | Measure-Object -Line).Lines
            Log-Check "Git" "⚠️" "Há $count commit(s) não enviado(s)" "$unpushed"
        } else {
            Log-Check "Git" "✅" "Todos os commits estão no remoto"
        }
    }

    # Sincronização com origin/main
    $diff = git diff main origin/main 2>&1
    if ($LASTEXITCODE -eq 0) {
        if (-not $diff) {
            Log-Check "Git" "✅" "main sincronizada com origin/main"
        } else {
            Log-Check "Git" "⚠️" "main diferente de origin/main"
        }
    }
} catch {
    Log-Check "Git" "❌" "Erro: $_"
}

# ════════════════════════════════════════════════════════════════
# 2. MONITORAR CI/CD NO GITHUB ACTIONS
# ════════════════════════════════════════════════════════════════
Write-Host ""
Write-ColorOutput "🔄 2. GITHUB ACTIONS CI/CD" "Cyan"
Write-Host "=" * 60

try {
    # Tentar usar gh CLI
    $ghAvailable = $null -ne (Get-Command gh -ErrorAction SilentlyContinue)

    if ($ghAvailable) {
        $workflows = gh run list --limit 3 --json status,conclusion,name 2>&1 | ConvertFrom-Json
        if ($workflows -and $workflows.Count -gt 0) {
            Log-Check "CI/CD" "ℹ️" "Últimos 3 workflows:"
            foreach ($workflow in $workflows) {
                Write-Host "    $($workflow.name) | $($workflow.status) | $($workflow.conclusion)"
            }

            # Verificar se há falhas
            $hasFailed = $workflows | Where-Object { $_.conclusion -eq "failure" }
            if ($hasFailed) {
                Log-Check "CI/CD" "❌" "Há workflows com falha"
            } else {
                Log-Check "CI/CD" "✅" "Workflows rodando ou completados com sucesso"
            }
        } else {
            Log-Check "CI/CD" "ℹ️" "Nenhum workflow encontrado"
        }
    } else {
        Log-Check "CI/CD" "⚠️" "gh CLI não disponível" "Verifique em: https://github.com/CristianodeSouza/crediclass-dashboard-grupos/actions"
        $warnings += "GitHub Actions não pode ser verificado automaticamente"
    }
} catch {
    Log-Check "CI/CD" "⚠️" "Erro ao verificar CI/CD" "Verifique em: https://github.com/CristianodeSouza/crediclass-dashboard-grupos/actions"
}

# ════════════════════════════════════════════════════════════════
# 3. VERIFICAR STATUS DO RENDER
# ════════════════════════════════════════════════════════════════
Write-Host ""
Write-ColorOutput "🚀 3. RENDER DEPLOYMENT STATUS" "Cyan"
Write-Host "=" * 60

try {
    $renderServiceId = $env:RENDER_SERVICE_ID

    if (-not $renderServiceId) {
        Log-Check "Render" "⚠️" "RENDER_SERVICE_ID não configurado" "Configure em: https://dashboard.render.com → Settings → API Key"
        $warnings += "RENDER_SERVICE_ID não configurado"
    } else {
        $lastChars = $renderServiceId.Substring([Math]::Max(0, $renderServiceId.Length - 8))
        Log-Check "Render" "ℹ️" "Service ID encontrado (últimos 8): ...$lastChars"

        # Testar endpoint
        try {
            $response = Invoke-WebRequest -Uri "https://crediclass.csrtecnologia.com.br/api" -TimeoutSec 10 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200 -and $response.Content -like "*Crediclass*") {
                Log-Check "Render" "✅" "Backend respondendo corretamente"
                Log-Check "Render" "✅" "Endpoint /api está online"
            } else {
                Log-Check "Render" "⚠️" "Backend respondendo mas sem dados esperados"
            }
        } catch {
            Log-Check "Render" "❌" "Backend não está respondendo"
        }
    }
} catch {
    Log-Check "Render" "❌" "Erro ao verificar Render: $_"
}

# ════════════════════════════════════════════════════════════════
# 4. VERIFICAR STATUS DO VERCEL
# ════════════════════════════════════════════════════════════════
Write-Host ""
Write-ColorOutput "⚡ 4. VERCEL DEPLOYMENT STATUS" "Cyan"
Write-Host "=" * 60

try {
    $response = Invoke-WebRequest -Uri "https://crediclass.csrtecnologia.com.br" -TimeoutSec 10 -ErrorAction SilentlyContinue
    if ($response.StatusCode -in @(200, 301, 302)) {
        Log-Check "Vercel" "✅" "Frontend (Vercel) respondendo corretamente"
    } else {
        Log-Check "Vercel" "⚠️" "Frontend pode ter problemas" "Verifique em: https://vercel.com/dashboard"
        $warnings += "Frontend pode ter problemas"
    }
} catch {
    Log-Check "Vercel" "⚠️" "Frontend pode ter problemas" "Verifique em: https://vercel.com/dashboard"
}

# ════════════════════════════════════════════════════════════════
# 5. TESTAR URLS EM PRODUÇÃO
# ════════════════════════════════════════════════════════════════
Write-Host ""
Write-ColorOutput "🌐 5. PRODUCTION URLS TEST" "Cyan"
Write-Host "=" * 60

$urlsToTest = @{
    "Frontend Home"    = "https://crediclass.csrtecnologia.com.br"
    "API Root"         = "https://crediclass.csrtecnologia.com.br/api"
    "API Grupos"       = "https://crediclass.csrtecnologia.com.br/api/grupos-gerenciador?limit=1"
    "API Stats"        = "https://crediclass.csrtecnologia.com.br/api/stats"
    "API Health"       = "https://crediclass.csrtecnologia.com.br/api/health"
}

foreach ($urlName in $urlsToTest.Keys) {
    $url = $urlsToTest[$urlName]
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -ErrorAction SilentlyContinue
        $httpCode = $response.StatusCode
        if ($httpCode -in @(200, 301, 302)) {
            Log-Check "URL" "✅" "$urlName → HTTP $httpCode"
        } else {
            Log-Check "URL" "⚠️" "$urlName → HTTP $httpCode"
        }
    } catch {
        Log-Check "URL" "❌" "$urlName → Erro de conexão"
    }
}

# ════════════════════════════════════════════════════════════════
# RELATÓRIO FINAL
# ════════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "=" * 60
Write-ColorOutput "📋 RELATÓRIO FINAL — ZERO_ERRO" "Cyan"
Write-Host "=" * 60

$total = $passedChecks + $failedChecks
Write-Host ""
Write-Host "Status Geral: $passedChecks/$($passedChecks + $failedChecks + @($warnings).Count) verificações"

if ($failedChecks -gt 0) {
    Write-ColorOutput "❌ ERROS ENCONTRADOS" "Red"
    Write-Host "Verifique os ❌ acima"
}

if ($warnings.Count -gt 0) {
    Write-ColorOutput "⚠️ AVISOS:" "Yellow"
    foreach ($warning in $warnings) {
        Write-Host "  • $warning"
    }
}

if ($failedChecks -eq 0 -and $warnings.Count -eq 0) {
    Write-ColorOutput "✅ TUDO PRONTO PARA PRODUÇÃO!" "Green"
    Write-Host "• Git status: OK"
    Write-Host "• GitHub Actions: OK"
    Write-Host "• Render Backend: OK"
    Write-Host "• Vercel Frontend: OK"
    Write-Host "• URLs de Produção: OK"
} elseif ($failedChecks -gt 0) {
    Write-ColorOutput "❌ AÇÃO NECESSÁRIA" "Red"
    Write-Host "Corrija os erros acima antes de considerar o deploy como completo."
} else {
    Write-ColorOutput "⚠️ AÇÃO RECOMENDADA" "Yellow"
    Write-Host "Verifique os avisos acima antes de considerar o deploy como completo."
}

Write-Host ""
Write-ColorOutput "Gerado em: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Blue"
Write-Host ""
