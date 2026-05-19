# 🏗️ ARQUITETURA DE PRODUÇÃO — Crediclass v0.4.1

**Data:** 2026-05-19  
**Domínio:** `crediclass.csrtecnologia.com.br`  
**Status:** ✅ Pronto para produção (Render unificado)

---

## 🌐 ARQUITETURA GERAL

```
┌──────────────────────────────────────────────────────────┐
│    crediclass.csrtecnologia.com.br (Cloudflare DNS)     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│     RENDER (Unified Service — Frontend + Backend)       │
│  ┌────────────────────────────────────────────────────┐ │
│  │                                                    │ │
│  │  Frontend (Static Files)                          │ │
│  │  • / → index.html                                 │ │
│  │  • /static/ → assets (CSS, JS, imagens)           │ │
│  │  • /* → SPA routing                               │ │
│  │                                                    │ │
│  │  ┌────────────────────────────────────────────┐   │ │
│  │  │  Backend (FastAPI + Uvicorn — Same Service)│   │ │
│  │  │  • /api/grupos   — Lista grupos            │   │ │
│  │  │  • /api/stats    — Estatísticas            │   │ │
│  │  │  • /api/piperun  — Integração CRM          │   │ │
│  │  │  • /api/*        — Outros endpoints         │   │ │
│  │  │  • Python 3.11+                            │   │ │
│  │  │  • Uvicorn server                          │   │ │
│  │  └────────────────────────────────────────────┘   │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 📦 COMPONENTES

### **Render (Unified Service)**
| Componente | Detalhes |
|-----------|----------|
| **Plataforma** | Render.com |
| **Código** | `frontend/` (HTML/CSS/JS + Alpine.js) + `backend/` (FastAPI) |
| **Runtime** | Python 3.11 |
| **Build Command** | `pip install -r backend/requirements.txt` |
| **Start Command** | `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` |
| **Static Files** | `/frontend` → Servidos como root (/) |
| **API Routing** | `/api/*` → FastAPI backend (mesmo serviço) |
| **URL** | `crediclass.csrtecnologia.com.br` |
| **Deploy** | Automático via GitHub (render.yaml) |
| **Database** | Em memória (v0.4.1) → PostgreSQL (futuro) |
| **Variáveis de Ambiente** | GOOGLE_SHEETS_ID, GOOGLE_API_KEY, PIPERUN_API_KEY, etc. |

### **DNS & Proxy (Cloudflare)**
| Componente | Detalhes |
|-----------|----------|
| **Plataforma** | Cloudflare |
| **Domínio** | `csrtecnologia.com.br` (registro.br) |
| **Subdomínio** | `crediclass` |
| **Tipo Record** | CNAME |
| **Valor** | `onrender.com` (fornecido por Render) |
| **Proxy** | Ativado (laranja no Cloudflare) |
| **SSL/TLS** | Full (Render + Cloudflare) |

---

## 🔄 FLUXO DE REQUISIÇÃO

```
1. Usuário acessa crediclass.csrtecnologia.com.br
   ↓
2. Cloudflare resolve DNS → Render (onrender.com)
   ↓
3. Render serve frontend (index.html)
   ↓
4. Frontend (JS) faz requisição para /api/grupos
   ↓
5. Render routing automático: /api/* → FastAPI backend (mesmo serviço)
   ↓
6. FastAPI responde com dados (em memória ou Google Sheets)
   ↓
7. Frontend recebe e renderiza
```

---

## 📋 PASSO A PASSO DE SETUP

### **Fase 1: GitHub + Render**

#### 1.1 Preparar Repositório
```bash
# 1. Commitar todas as mudanças
cd crediclass-dashboard-grupos
git add -A
git commit -m "feat: Prepare for Render deployment"
git push origin main

# 2. Verificar que render.yaml existe
cat render.yaml
```

**Conteúdo esperado de render.yaml:**
```yaml
services:
  - type: web
    name: crediclass-dashboard
    runtime: python
    pythonVersion: 3.11
    buildCommand: pip install -r backend/requirements.txt
    startCommand: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
    staticPublicPath: frontend
    routes:
      - path: /api/*
        destination: http://0.0.0.0:$PORT/api/$1
      - path: /*
        destination: http://0.0.0.0:$PORT/$1
```

#### 1.2 Deploy Automático no Render
```bash
# 1. Acesse: https://dashboard.render.com
# 2. Sign in com GitHub
# 3. Clique "New +"
# 4. Selecione "Web Service"
# 5. Conecte repositório: crediclass-dashboard-grupos
# 6. Configure:
#    - Name: crediclass-dashboard
#    - Runtime: Python 3
#    - Build Command: pip install -r backend/requirements.txt
#    - Start Command: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
#    - Plan: Standard ($12/mês recomendado)
# 7. Clique "Create Web Service"
```

#### 1.3 Adicionar Variáveis de Ambiente no Render
```bash
# No Render Dashboard → seu serviço → Environment:
# 1. Adicione cada variável:
```

| Chave | Valor |
|-------|-------|
| `GOOGLE_SHEETS_ID` | `1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM` |
| `GOOGLE_API_KEY` | sua-chave-api-google |
| `PIPERUN_API_KEY` | sua-chave-piperun |
| `ENVIRONMENT` | `production` |
| `DEBUG` | `false` |

```bash
# Render redeploy automático após salvar variáveis
```

#### 1.4 Obter URL do Serviço Render
```
Após o deploy (2-3 minutos):
1. Vá para Render Dashboard
2. Seu serviço: crediclass-dashboard
3. Procure por "On-render URL"
4. Exemplo: https://crediclass-dashboard-xyz.onrender.com
```

---

### **Fase 2: Cloudflare (DNS)**

#### 2.1 Acessar Cloudflare
```
1. Acesse: https://dash.cloudflare.com
2. Selecione domínio: csrtecnologia.com.br
3. Vá para: DNS → Records
```

#### 2.2 Criar CNAME para Render
```
Nome:        crediclass
Tipo:        CNAME
Valor:       onrender.com
Proxy:       Proxied (deve estar LARANJA)
TTL:         Auto
```

**Resultado esperado:**
```
crediclass.csrtecnologia.com.br CNAME → onrender.com (Proxied)
```

#### 2.3 Validação de DNS
```bash
# Aguarde 5-10 minutos pela propagação
# Teste:
curl https://crediclass.csrtecnologia.com.br/api/stats
```

---

## 🔐 VARIÁVEIS DE AMBIENTE

### **Backend (Render Environment Variables)**
```bash
# Google Sheets
GOOGLE_SHEETS_ID=1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
GOOGLE_API_KEY=sua-chave-aqui

# Piperun (CRM)
PIPERUN_API_KEY=sua-chave-piperun

# FastAPI
ENVIRONMENT=production
DEBUG=false
```

### **Cloudflare (Configurações)**
```bash
# SSL/TLS
Mode: Full (Strict recomendado)

# Rules (Opcional)
- Redirecionar HTTP → HTTPS
- Cache controle de assets (/static/*)
- Minify (CSS, JS, HTML)
```

---

## ✅ CHECKLIST DE DEPLOYMENT

- [ ] **Cloudflare**
  - [ ] CNAME record criado: `crediclass` → `onrender.com`
  - [ ] Proxy ativado (laranja)
  - [ ] SSL/TLS em Full

- [ ] **GitHub + Render**
  - [ ] Repositório conectado ao Render
  - [ ] render.yaml presente na raiz
  - [ ] Código pushado para branch main
  - [ ] Build bem-sucedido no Render
  - [ ] Variáveis de ambiente configuradas no Render Dashboard

- [ ] **Integração**
  - [ ] CORS configurado em backend/main.py para crediclass.csrtecnologia.com.br
  - [ ] Testes de API funcionando
  - [ ] Frontend carregando dados via /api/*

- [ ] **Testes de Produção**
  - [ ] Acesse `crediclass.csrtecnologia.com.br`
  - [ ] Frontend carrega
  - [ ] Endpoints `/api/*` respondendo
  - [ ] Calculadora funciona
  - [ ] Google Sheets integração funcionando

---

## 🧪 TESTES PÓS-DEPLOY

### **Teste Frontend**
```bash
# 1. Abra navegador
https://crediclass.csrtecnologia.com.br

# 2. Verifique:
# - Layout carrega corretamente
# - Calculadora responde
# - Dados aparecem
```

### **Teste API**
```bash
# 1. Teste endpoint
curl "https://crediclass.csrtecnologia.com.br/api/stats"

# 2. Esperado:
# {"total_grupos": ..., "por_administradora": {...}, ...}
```

### **Teste de Performance**
```bash
# 1. Acesse: https://pagespeed.web.dev
# 2. Digite: crediclass.csrtecnologia.com.br
# 3. Analise performance

# 2. Cloudflare Analytics
# - Acesse: Cloudflare Dashboard → Analytics
# - Verifique: Cache Hit Rate, Requests, Bandwidth
```

---

## 🚨 TROUBLESHOOTING

| Problema | Causa | Solução |
|----------|-------|---------|
| **CNAME não valida** | DNS não propagou | Aguarde 15-30 min, limpe cache, verifique se aponta para `onrender.com` |
| **404 no frontend** | Build incorreto no Render | Verifique `staticPublicPath: frontend` em render.yaml |
| **API retorna 503** | Backend offline | Verifique logs em Render Dashboard |
| **CORS error** | CORS não configurado | Atualize CORSMiddleware em backend/main.py com domínio crediclass.csrtecnologia.com.br |
| **Imagens não carregam** | Path incorreto | Verifique `/static/` está sendo servido corretamente |

---

## 📞 PRÓXIMAS FASES

### **Curto Prazo (2-4 semanas)**
- [ ] SSL/TLS configurado (automático Render + Cloudflare)
- [ ] Monitoramento e alertas (Render + Cloudflare Analytics)
- [ ] CI/CD pipeline avançado (.github/workflows)
- [ ] Backup automático de dados (Google Sheets sync)

### **Médio Prazo (1-3 meses)**
- [ ] Database PostgreSQL
- [ ] Autenticação JWT
- [ ] Rate Limiting
- [ ] Gerar PDF (Feature #5)

### **Longo Prazo (3+ meses)**
- [ ] Testes automatizados (pytest + Cypress)
- [ ] Load balancing
- [ ] CDN global
- [ ] Analytics avançado

---

## 📚 REFERÊNCIAS

- [Render Documentation](https://render.com/docs)
- [Render Python Deployment](https://render.com/docs/deploy-python)
- [Cloudflare DNS Setup](https://developers.cloudflare.com/dns/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [CORS in FastAPI](https://fastapi.tiangolo.com/tutorial/cors/)

---

## 👤 Responsável

**Documento criado:** 2026-05-18  
**Última atualização:** 2026-05-19  
**Status:** ✅ Render Unified Setup — Pronto para Execução

---

**🟢 PRONTO PARA DEPLOYMENT**

Stack Render unificado (Frontend + Backend no mesmo serviço). Siga as 2 fases e seu projeto estará online em `crediclass.csrtecnologia.com.br`!
