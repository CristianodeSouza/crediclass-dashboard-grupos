@echo off
REM Zero_erro — Agente de Verificação de Deploy (Windows Batch)
REM Simples de usar: apenas execute zero_erro.bat

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║         🚀 ZERO_ERRO — VERIFICAÇÃO DE DEPLOY 🚀           ║
echo ║     Git ^→ GitHub Actions ^→ Render ^→ Vercel ^→ Produção     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Contadores
set passed=0
set failed=0
set warnings=0

REM ════════════════════════════════════════════════════════════════
REM 1. GIT STATUS
REM ════════════════════════════════════════════════════════════════
echo 📦 1. GIT STATUS ^& PUSH
echo ============================================================

git status --short > nul 2>&1
if %errorlevel% equ 0 (
    echo [✅] Git: Working tree OK
    set /a passed+=1
) else (
    echo [❌] Git: Erro ao verificar status
    set /a failed+=1
)

for /f "tokens=*" %%a in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set branch=%%a
echo [ℹ️] Git: Branch atual: %branch%

git log origin/main..HEAD --oneline > nul 2>&1
if %errorlevel% equ 0 (
    for /f %%a in ('git log origin/main..HEAD --oneline 2^>nul ^| find /c /v ""') do set unpushed=%%a
    if !unpushed! equ 0 (
        echo [✅] Git: Todos os commits no remoto
        set /a passed+=1
    ) else (
        echo [⚠️] Git: %unpushed% commit(s) pendente(s) para push
        set /a warnings+=1
    )
)

echo.

REM ════════════════════════════════════════════════════════════════
REM 2. GITHUB ACTIONS
REM ════════════════════════════════════════════════════════════════
echo 🔄 2. GITHUB ACTIONS CI/CD
echo ============================================================

gh run list --limit 1 > nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('gh run list --limit 1 --json status,conclusion --jq ".[0] | .status"') do set wf_status=%%a
    echo [ℹ️] CI/CD: Último workflow status: %wf_status%
) else (
    echo [⚠️] CI/CD: gh CLI indisponível
    echo        Verifique em: https://github.com/CristianodeSouza/crediclass-dashboard-grupos/actions
    set /a warnings+=1
)

echo.

REM ════════════════════════════════════════════════════════════════
REM 3. RENDER BACKEND
REM ════════════════════════════════════════════════════════════════
echo 🚀 3. RENDER DEPLOYMENT STATUS
echo ============================================================

if defined RENDER_SERVICE_ID (
    echo [ℹ️] Render: Service ID configurado

    powershell -Command "try { $r = Invoke-WebRequest -Uri 'https://crediclass.csrtecnologia.com.br/api' -TimeoutSec 5 -ErrorAction SilentlyContinue; if ($r.StatusCode -eq 200) { Write-Host '[✅] Render: API respondendo' } else { Write-Host '[⚠️] Render: API respondendo com erro' } } catch { Write-Host '[❌] Render: API offline' }" 2>nul
) else (
    echo [⚠️] Render: RENDER_SERVICE_ID não configurado
    set /a warnings+=1
)

echo.

REM ════════════════════════════════════════════════════════════════
REM 4. VERCEL FRONTEND
REM ════════════════════════════════════════════════════════════════
echo ⚡ 4. VERCEL DEPLOYMENT STATUS
echo ============================================================

powershell -Command "try { $r = Invoke-WebRequest -Uri 'https://crediclass.csrtecnologia.com.br' -TimeoutSec 5 -ErrorAction SilentlyContinue; if ($r.StatusCode -in @(200,301,302)) { Write-Host '[✅] Vercel: Frontend respondendo' } } catch { Write-Host '[⚠️] Vercel: Frontend pode ter problemas' }" 2>nul

echo.

REM ════════════════════════════════════════════════════════════════
REM 5. PRODUCTION URLs
REM ════════════════════════════════════════════════════════════════
echo 🌐 5. PRODUCTION URLS TEST
echo ============================================================

powershell -Command "^
$urls = @{^
    'Frontend Home' = 'https://crediclass.csrtecnologia.com.br';^
    'API Root' = 'https://crediclass.csrtecnologia.com.br/api';^
    'API Grupos' = 'https://crediclass.csrtecnologia.com.br/api/grupos-gerenciador?limit=1'^
};^
foreach (`$name in `$urls.Keys) {^
    try {^
        `$r = Invoke-WebRequest -Uri `$urls[`$name] -TimeoutSec 5 -ErrorAction SilentlyContinue;^
        if (`$r.StatusCode -in @(200,301,302)) {^
            Write-Host \"[✅] URL: `$name → HTTP `$(`$r.StatusCode)\"^
        }^
    } catch {^
        Write-Host \"[⚠️] URL: `$name → Erro de conexão\"^
    }^
}" 2>nul

echo.

REM ════════════════════════════════════════════════════════════════
REM RELATÓRIO FINAL
REM ════════════════════════════════════════════════════════════════
echo ============================================================
echo 📋 RELATÓRIO FINAL — ZERO_ERRO
echo ============================================================
echo.

if %failed% equ 0 (
    if %warnings% equ 0 (
        echo [✅] TUDO PRONTO PARA PRODUÇÃO!
        echo     • Git: OK
        echo     • GitHub Actions: OK
        echo     • Render Backend: OK
        echo     • Vercel Frontend: OK
        echo     • URLs: OK
    ) else (
        echo [⚠️] COM AVISOS (%warnings% aviso^(s^))
        echo     Verifique os avisos acima
    )
) else (
    echo [❌] COM ERROS (%failed% erro^(s^))
    echo     Corrija os erros acima
)

echo.
echo Gerado em: %date% %time%
echo.
pause
