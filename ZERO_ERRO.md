# 🚀 Zero_erro — Agente de Verificação End-to-End de Deploy

Agente automatizado que verifica **todo o pipeline de deploy**: Git → GitHub Actions → Render → Vercel → URLs em Produção.

## 📋 O que ele verifica

- ✅ **Git Status & Push** — Commits não enviados, arquivos não commitados
- ✅ **GitHub Actions** — Status dos workflows de CI/CD
- ✅ **Render Backend** — API respondendo, endpoints funcionando
- ✅ **Vercel Frontend** — Frontend acessível e carregando
- ✅ **Production URLs** — Teste de todas as URLs principais

## 🚀 Como usar

### Uso básico

```bash
python3 zero_erro.py
```

### Exemplo de output

```
╔════════════════════════════════════════════════════════════╗
║         🚀 ZERO_ERRO — VERIFICAÇÃO DE DEPLOY 🚀           ║
║     Git → GitHub Actions → Render → Vercel → Produção     ║
╚════════════════════════════════════════════════════════════╝

📦 1. GIT STATUS & PUSH
============================================================
✅ Git: Working tree limpo
ℹ️ Git: Branch atual: main
✅ Git: Todos os commits estão no remoto
✅ Git: main sincronizada com origin/main

🔄 2. GITHUB ACTIONS CI/CD
============================================================
ℹ️ CI/CD: Últimos 3 workflows:
    Deploy to Render | completed | success
    Tests & Build Check | completed | success

🚀 3. RENDER DEPLOYMENT STATUS
============================================================
ℹ️ Render: Service ID encontrado
✅ Render: Backend respondendo corretamente
✅ Render: Endpoint /api está online

⚡ 4. VERCEL DEPLOYMENT STATUS
============================================================
✅ Vercel: Frontend (Vercel) respondendo corretamente

🌐 5. PRODUCTION URLS TEST
============================================================
✅ URL: Frontend Home → HTTP 200
✅ URL: API Root → HTTP 200
✅ URL: API Grupos → HTTP 200
✅ URL: API Stats → HTTP 200
✅ URL: API Health → HTTP 200

📋 RELATÓRIO FINAL — ZERO_ERRO
============================================================

Status Geral: 5/5 verificações passaram

✅ TUDO PRONTO PARA PRODUÇÃO!
• Git status: OK
• GitHub Actions: OK
• Render Backend: OK
• Vercel Frontend: OK
• URLs de Produção: OK
```

## 🔧 Configuração Necessária

### 1. GitHub CLI (para monitorar GitHub Actions)

```bash
# Instalar (MacOS)
brew install gh

# Instalar (Linux)
sudo apt install gh

# Fazer login
gh auth login
```

### 2. Render API Key (para monitorar deploy automático)

```bash
# Adicionar variável de ambiente
export RENDER_SERVICE_ID="seu_service_id_aqui"
export RENDER_API_KEY="sua_api_key_aqui"

# Ou adicionar a .env
RENDER_SERVICE_ID=srv-xxx
RENDER_API_KEY=rnd_xxx
```

Encontrar em: https://dashboard.render.com → Settings → API Key

## 📊 O que cada verificação faz

### 1️⃣ Git Status & Push
- Verifica se há arquivos não commitados
- Verifica se há commits não enviados para remoto
- Confirma que `main` está sincronizada com `origin/main`

### 2️⃣ GitHub Actions
- Lista os últimos 3 workflows executados
- Detecta se há workflows com falha
- Fornece link para o dashboard se CLI não estiver disponível

### 3️⃣ Render Backend
- Verifica se `RENDER_SERVICE_ID` está configurado
- Testa se o endpoint `/api` está respondendo
- Valida resposta esperada da API

### 4️⃣ Vercel Frontend
- Testa conectividade com o frontend
- Verifica se resposta inclui HTTP 200/301/302
- Fornece link para dashboard se houver problemas

### 5️⃣ Production URLs
Testa 5 URLs principais:
- Frontend home: `https://crediclass.csrtecnologia.com.br`
- API root: `https://crediclass.csrtecnologia.com.br/api`
- API grupos: `https://crediclass.csrtecnologia.com.br/api/grupos-gerenciador?limit=1`
- API stats: `https://crediclass.csrtecnologia.com.br/api/stats`
- API health: `https://crediclass.csrtecnologia.com.br/api/health`

## 🎯 Casos de Uso

### Após fazer commit e push
```bash
# Verificar se o deploy foi bem-sucedido
python3 zero_erro.py
```

### Monitoramento contínuo
```bash
# Verificar a cada 5 minutos
while true; do
    python3 zero_erro.py
    sleep 300
done
```

### No CI/CD (GitHub Actions)
Adicionar ao workflow `.github/workflows/deploy.yml`:

```yaml
- name: Verify Deployment
  run: python3 zero_erro.py
```

## 📈 Saída de Cores

- 🟢 **Verde (✅)** — Verificação passou
- 🔴 **Vermelho (❌)** — Erro crítico
- 🟡 **Amarelo (⚠️)** — Aviso/Atenção necessária
- 🔵 **Azul (ℹ️)** — Informação

## 🐛 Troubleshooting

### "gh CLI não disponível"
Instale GitHub CLI:
```bash
brew install gh  # macOS
sudo apt install gh  # Linux
gh auth login
```

### "RENDER_SERVICE_ID não configurado"
Configure a variável de ambiente:
```bash
export RENDER_SERVICE_ID="srv-xxx"
```

### "Frontend pode ter problemas"
Verifique em: https://vercel.com/dashboard

### "Backend não está respondendo"
Verifique em: https://dashboard.render.com

## 📝 Fluxo de Trabalho Recomendado

1. **Fazer alterações no código**
   ```bash
   git add .
   git commit -m "feat: descrição"
   ```

2. **Fazer push**
   ```bash
   git push -u origin main
   ```

3. **Verificar deploy**
   ```bash
   python3 zero_erro.py
   ```

4. **Aguardar até ✅ TUDO PRONTO PARA PRODUÇÃO!**

## 🔗 Links Úteis

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Actions**: https://github.com/CristianodeSouza/crediclass-dashboard-grupos/actions
- **Produção**: https://crediclass.csrtecnologia.com.br

---

**Criado em**: 2026-05-29  
**Versão**: 1.0.0  
**Status**: ✅ Produção
