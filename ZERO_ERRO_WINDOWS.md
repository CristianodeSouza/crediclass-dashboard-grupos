# 🚀 Zero_erro — Guia Windows PowerShell

Agente de verificação de deploy para **Windows PowerShell**.

## 📋 Requisitos

- Windows 10+
- PowerShell 5.1+ (ou PowerShell Core)
- Git instalado
- Python 3.8+ (opcional, para alguns testes)

## ⚡ Instalação Rápida

### 1. Permitir execução de scripts PowerShell

```powershell
# Abra PowerShell como Administrador e execute:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. Criar alias no PowerShell

Adicione ao seu perfil PowerShell (editar em Notepad):

**Local do arquivo:**
```
C:\Users\SeuUsuario\Documents\PowerShell\profile.ps1
```

**Adicione esta linha:**
```powershell
Set-Alias -Name zero_erro -Value "python3 C:\caminho\para\crediclass-dashboard-grupos\zero_erro.ps1"
```

Ou se preferir usar Python:
```powershell
Set-Alias -Name zero_erro -Value "python3 C:\Users\SeuUsuario\crediclass-dashboard-grupos\zero_erro.py"
```

### 3. Recarregar PowerShell

Feche e abra uma nova janela PowerShell.

## 🚀 Como Usar

### Opção 1: Executar direto
```powershell
& "C:\Users\SeuUsuario\crediclass-dashboard-grupos\zero_erro.ps1"
```

### Opção 2: Usar alias (após instalação)
```powershell
zero_erro
```

### Opção 3: Com Python (se preferir)
```powershell
python3 "C:\Users\SeuUsuario\crediclass-dashboard-grupos\zero_erro.py"
```

## 📊 Exemplo de Output

```
╔════════════════════════════════════════════════════════════╗
║         🚀 ZERO_ERRO — VERIFICAÇÃO DE DEPLOY 🚀           ║
║     Git → GitHub Actions → Render → Vercel → Produção     ║
╚════════════════════════════════════════════════════════════╝

📦 1. GIT STATUS & PUSH
============================================================
[11:24:16] ✅ Git: Working tree limpo
[11:24:16] ℹ️ Git: Branch atual: main
[11:24:16] ✅ Git: Todos os commits estão no remoto

🔄 2. GITHUB ACTIONS CI/CD
============================================================
[11:24:17] ⚠️ CI/CD: gh CLI não disponível

🚀 3. RENDER DEPLOYMENT STATUS
============================================================
[11:24:17] ✅ Render: Backend respondendo corretamente

⚡ 4. VERCEL DEPLOYMENT STATUS
============================================================
[11:24:18] ✅ Vercel: Frontend respondendo corretamente

🌐 5. PRODUCTION URLS TEST
============================================================
[11:24:19] ✅ URL: Frontend Home → HTTP 200
[11:24:19] ✅ URL: API Root → HTTP 200

📋 RELATÓRIO FINAL — ZERO_ERRO
============================================================

Status Geral: 8/8 verificações

✅ TUDO PRONTO PARA PRODUÇÃO!
```

## 🔧 Configuração de Variáveis (Opcional)

Para monitorar Render com API key:

### Opção 1: Variáveis de Ambiente Permanentes

1. **Abra "Variáveis de Ambiente"**
   - Pressione `Win + X` → Clique "Sistema"
   - Clique "Variáveis de Ambiente" (lado direito)
   - Clique "Novas..." em "Variáveis de usuário"

2. **Adicione:**
   ```
   Nome: RENDER_SERVICE_ID
   Valor: srv-xxxxxxxxxxxx
   ```

3. **Repita para:**
   ```
   Nome: RENDER_API_KEY
   Valor: rnd_xxxxxxxxxxxx
   ```

4. **Reinicie PowerShell**

### Opção 2: Variáveis Temporárias (Sessão atual)

```powershell
$env:RENDER_SERVICE_ID = "srv-xxxxxxxxxxxx"
$env:RENDER_API_KEY = "rnd_xxxxxxxxxxxx"
zero_erro
```

## 🔗 GitHub CLI (Opcional)

Para monitorar GitHub Actions:

### Instalar no Windows
```powershell
# Com Winget (Windows 11)
winget install GitHub.cli

# Com Chocolatey
choco install gh

# Com Scoop
scoop install gh
```

### Configurar
```powershell
gh auth login
```

## 📝 Fluxo de Trabalho Recomendado

```powershell
# 1. Fazer alterações
git add .
git commit -m "feat: descrição"

# 2. Fazer push
git push origin main

# 3. Verificar deploy (aguarde 2-3 minutos)
zero_erro

# 4. Aguardar até ✅ TUDO PRONTO PARA PRODUÇÃO!
```

## 🐛 Troubleshooting Windows

### "Set-ExecutionPolicy : O acesso foi negado"
Execute PowerShell como Administrador:
- Clique direito no PowerShell → "Executar como administrador"

### "zero_erro : O termo 'zero_erro' não é reconhecido"
O alias não foi criado corretamente:
```powershell
# Verifique se o perfil existe
Test-Path $PROFILE

# Se não existir, crie:
New-Item -ItemType File -Path $PROFILE -Force

# Abra em editor
notepad $PROFILE

# Adicione o alias e salve
# Depois execute:
. $PROFILE
```

### "Arquivo não encontrado"
Verifique o caminho:
```powershell
# Listar arquivo
Get-ChildItem "C:\Users\$env:USERNAME\crediclass-dashboard-grupos\zero_erro.ps1"
```

### "Erro de conexão nas URLs"
Se estiver usando VPN ou proxy corporativo, configure:
```powershell
# Adicionar ao seu profile.ps1
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor [System.Net.SecurityProtocolType]::Tls12
```

## 📚 Documentação Completa

Para mais informações, veja: `ZERO_ERRO.md`

## 🎯 Atalho Rápido (VSCode Terminal)

Se usar VSCode, adicione ao `.vscode/settings.json`:
```json
{
    "terminal.integrated.defaultProfile.windows": "PowerShell",
    "terminal.integrated.profiles.windows": {
        "PowerShell": {
            "source": "PowerShell",
            "icon": "terminal-powershell"
        }
    }
}
```

Depois use `Ctrl+`` para abrir terminal e rodar `zero_erro` direto.

---

**Criado em**: 2026-05-29  
**Versão**: 1.0.0 (Windows)  
**Status**: ✅ Pronto para usar
