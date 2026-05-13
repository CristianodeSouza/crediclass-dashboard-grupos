# 🚀 Guia de CI/CD Automatizado com GitHub + Vercel

## Fluxo Resumido

```
Local (git push) → GitHub → Actions (testa) → Vercel (deploy) → Produção
```

Quando você faz `git push main`, tudo acontece automaticamente! ✨

---

## 📋 Checklist de Setup (Faça Uma Vez)

### 1️⃣ GitHub Repository

```bash
cd C:\Users\User\crediclass-dashboard-grupos

# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "Initial commit: Calculadora Imóvel com CI/CD"

# Conectar ao repositório remoto no GitHub
git remote add origin https://github.com/SEU_USER/crediclass-dashboard-grupos.git

# Criar branch main (se necessário)
git branch -M main

# Push para GitHub
git push -u origin main
```

### 2️⃣ Criar Repositório no GitHub

1. Vá para https://github.com/new
2. Nome: `crediclass-dashboard-grupos`
3. Descrição: `Calculadora Imóvel - Análise de Consórcios`
4. Private ou Public (recomendo Private para credenciais)
5. Clique "Create repository"

### 3️⃣ Configurar Vercel

#### Opção A: CLI (Mais Rápido)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy inicial (vai criar projeto automaticamente)
vercel

# Salvar os secrets (veja Passo 4)
```

#### Opção B: Dashboard (Recomendado)

1. Vá para https://vercel.com/dashboard
2. Clique "Add New..." → "Project"
3. Selecione "Import Git Repository"
4. Cole: `https://github.com/SEU_USER/crediclass-dashboard-grupos`
5. Clique "Import"
6. Vercel vai detectar automaticamente a configuração (vercel.json)

### 4️⃣ Configurar GitHub Secrets para CI/CD

No GitHub, vá para:
- `Settings` → `Secrets and variables` → `Actions`

Adicione esses secrets:

**`VERCEL_TOKEN`** (seu token Vercel)
```bash
# Gerar em: https://vercel.com/account/tokens
# Copie e cole no GitHub
```

**`VERCEL_ORG_ID`** (ID da sua organização/conta Vercel)
```bash
# Vá para https://vercel.com/account/settings/organizations
# Copie o ID (formato: "xxxxxxx")
```

**`VERCEL_PROJECT_ID`** (ID do projeto criado)
```bash
# Depois de criar o projeto no Vercel:
# Vá para Settings → General
# Procure por "Project ID"
# Copie e cole aqui
```

Para encontrar esses IDs facilmente:

```bash
# Se usou Vercel CLI, vá para o projeto e execute:
vercel env pull

# Isso cria .vercel/project.json com os IDs
```

---

## 🔄 Fluxo de Uso (Dia a Dia)

### Fazer uma Mudança Local

```bash
# 1. Editar arquivo (ex: frontend/index.html ou backend/main.py)

# 2. Verificar mudanças
git status

# 3. Adicionar mudanças
git add .

# 4. Commitar com mensagem descritiva
git commit -m "Feat: adicionar botão de gerar PDF no estudo financeiro"

# 5. Push para GitHub (dispara CI/CD automaticamente)
git push origin main
```

### Monitorar Deploy

1. Vá para seu repositório no GitHub
2. Clique em "Actions"
3. Veja o workflow `Deploy to Vercel` rodando
4. Assim que passar os testes (✓), Vercel faz deploy automático
5. Veja a URL de produção em: https://vercel.com/dashboard

---

## 🌳 Branches e Ambientes

Configuramos 2 branches:

| Branch | Ambiente | Automático? | Uso |
|--------|----------|-------------|-----|
| `main` | Produção | ✅ Sim | Versão estável, release |
| `develop` | Staging | ✅ Sim | Testes antes de produção |

### Fluxo Recomendado

```bash
# 1. Trabalhar na develop (ambiente de testes)
git checkout develop
git add .
git commit -m "WIP: testando nova feature"
git push origin develop

# 2. Depois de testar, fazer Pull Request para main
# (No GitHub, clique "New Pull Request" → develop → main)

# 3. GitHub Actions vai:
#    - Rodar testes
#    - Verificar sintaxe
#    - Deixar um comentário no PR

# 4. Se tudo passar, mergear para main
# (Isso dispara deploy em produção)

git checkout main
git pull origin main
```

---

## 🔍 O Que o GitHub Actions Faz

Quando você faz `git push`:

1. ✅ **Instala dependências Python**
   - `pip install -r backend/requirements.txt`

2. ✅ **Verifica sintaxe Python**
   - Lint com flake8
   - Compile check com py_compile

3. ✅ **Valida frontend**
   - Verifica se index.html existe
   - Verifica se app.js existe

4. ✅ **Deploy automático** (se testes passar)
   - Envia para Vercel
   - Vercel faz build e deploy
   - Seu site está online em ~2 min

---

## 📊 Cloudflare (Adicional)

Se quiser usar Cloudflare para:

### DNS (Recomendado)
1. Registre seu domínio (ex: meuprojeto.com)
2. Configure nameservers para Cloudflare
3. Aponte o domínio para seu projeto Vercel

### CDN (Cache)
- Cloudflare automaticamente cacheia assets (CSS, JS, imagens)
- Torna o site mais rápido globalmente

### WAF (Proteção)
- Ativa proteção contra ataques
- Muito útil para produção

**Setup Cloudflare:**
1. Vá para https://dash.cloudflare.com
2. Clique "Add a Site"
3. Digite seu domínio
4. Siga o wizard de setup
5. Configure nameservers (seu registrador)
6. Aponte CNAME para: `cname.vercel-dns.com`

---

## 🚨 Troubleshooting

### "GitHub Actions falhando"
```bash
# Verificar logs:
# GitHub → Actions → Clique no workflow que falhou → Ver output

# Erro comum: Missing VERCEL_TOKEN
# → Vá para GitHub Settings → Secrets → Adicione o token
```

### "Deploy para Vercel não aparece"
```bash
# Verifique se production está configurado
# GitHub → Settings → Secrets → VERCEL_ORG_ID e VERCEL_PROJECT_ID

# Ou redeploy manual:
vercel deploy --prod
```

### "Arquivo credentials.json foi commitado"
```bash
# CUIDADO! Nunca commite credenciais
# Se aconteceu:

# 1. Remove do histórico (GitHub.com instructions)
# 2. Regenera a credencial (Google Cloud)
# 3. Adiciona .gitignore (já feito aqui)

# Para não fazer isso novamente:
git rm --cached credentials.json token.json
git add .gitignore
git commit -m "Remove credentials from tracking"
git push
```

---

## ✅ Verificar se Tudo Está Funcionando

### Teste Local
```bash
# Antes de fazer push, teste localmente:
python backend/main.py
# Acesse http://localhost:8000
```

### Teste GitHub Actions
```bash
# Após push para develop:
# GitHub → Actions → Veja o workflow rodar
# Deve ter ✓ em todos os passos
```

### Teste Vercel
```bash
# Após deploy automático:
# Vercel Dashboard → Seu projeto
# Clique em "Visit" para ver seu site ao vivo
```

---

## 📚 Próximos Passos

- [ ] Fazer commit inicial para GitHub
- [ ] Configurar Vercel
- [ ] Adicionar GitHub Secrets
- [ ] Fazer uma mudança de teste e fazer push
- [ ] Verificar se GitHub Actions rodou
- [ ] Confirmar que Vercel fez deploy automático
- [ ] Acessar site em produção

---

## 🎯 Resumo: Depois de Setup

**Você nunca mais precisa:**
- ❌ Fazer build manualmente
- ❌ Fazer deploy via FTP/SSH
- ❌ Preocupar com inconsistências entre local e produção

**Você só faz:**
- ✅ `git add .`
- ✅ `git commit -m "..."`
- ✅ `git push origin main`
- ✅ Esperar ~2 minutos
- ✅ Site está em produção! 🎉

---

## 📞 Suporte

Se algo der errado:
1. Verifique GitHub Actions → Actions → Veja logs detalhados
2. Verifique Vercel Dashboard → Deployments → Veja build logs
3. Verifique secrets estão corretos (GitHub → Settings → Secrets)

Qualquer dúvida, me chama! 🚀

