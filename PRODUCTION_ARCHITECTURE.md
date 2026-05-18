# 🏗️ ARQUITETURA DE PRODUÇÃO — Crediclass v0.4.1

**Data:** 2026-05-18  
**Domínio:** `crediclass.csrtecnologia.com.br`  
**Status:** 📋 Planejado e documentado

---

## 🌐 ARQUITETURA GERAL

```
┌─────────────────────────────────────────────────────────────┐
│         crediclass.csrtecnologia.com.br                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐        ┌──────────────────────┐  │
│  │   FRONTEND (Vercel) │        │  CLOUDFLARE (DNS)    │  │
│  ├─────────────────────┤        ├──────────────────────┤  │
│  │ • / → index.html    │◄───────┤ • CNAME Record       │  │
│  │ • /static → assets  │        │ • Proxy Rules        │  │
│  │ • /api/* → Proxy    │        │ • SSL/TLS            │  │
│  └─────────────────────┘        └──────────────────────┘  │
│           │                                                  │
│           │ (rewrite /api/*)                                │
│           ▼                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │      BACKEND (Railway/Heroku)                       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ • FastAPI + Uvicorn                                │   │
│  │ • Python 3.11+                                     │   │
│  │ • Endpoints: /api/grupos, /api/stats, etc.        │   │
│  │ • Database: PostgreSQL (futuro)                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 COMPONENTES

### **Frontend (Vercel)**
| Componente | Detalhes |
|-----------|----------|
| **Plataforma** | Vercel |
| **Código** | `frontend/` (HTML/CSS/JS + Alpine.js) |
| **Assets** | `frontend/static/` (imagens, CSS, JS) |
| **URL** | `crediclass.csrtecnologia.com.br` |
| **Deploy** | Automático via git (main branch) |
| **Rewrite de API** | `/api/*` → Backend Railway |

### **Backend (Railway/Heroku)**
| Componente | Detalhes |
|-----------|----------|
| **Plataforma** | Railway (ou Heroku) |
| **Código** | `backend/main.py` (FastAPI) |
| **Language** | Python 3.11+ |
| **Port** | 8000 (Railway expõe na porta padrão) |
| **Endpoints** | `/api/grupos`, `/api/stats`, `/api/piperun`, etc. |
| **Database** | Em memória (v0.4.1) → PostgreSQL (futuro) |
| **Variáveis de Ambiente** | `.env` com Google Sheets credentials |

### **DNS & Proxy (Cloudflare)**
| Componente | Detalhes |
|-----------|----------|
| **Plataforma** | Cloudflare |
| **Domínio** | `csrtecnologia.com.br` (registro.br) |
| **Subdomínio** | `crediclass` |
| **Tipo Record** | CNAME |
| **Valor** | `cname.vercel.app` (fornecido por Vercel) |
| **Proxy** | Ativado (laranja no Cloudflare) |
| **SSL/TLS** | Full (Vercel + Cloudflare) |

---

## 🔄 FLUXO DE REQUISIÇÃO

```
1. Usuário acessa crediclass.csrtecnologia.com.br
   ↓
2. Cloudflare resolve DNS → Vercel
   ↓
3. Vercel serve frontend (index.html)
   ↓
4. Frontend (JS) faz requisição para /api/grupos
   ↓
5. Vercel rewrite: /api/grupos → https://seu-backend.railway.app/api/grupos
   ↓
6. Railway responde com dados
   ↓
7. Frontend recebe e renderiza
```

---

## 📋 PASSO A PASSO DE SETUP

### **Fase 1: Cloudflare (DNS)**

#### 1.1 Acessar Cloudflare
```
1. Acesse: https://dash.cloudflare.com
2. Selecione domínio: csrtecnologia.com.br
3. Vá para: DNS → Records
```

#### 1.2 Criar CNAME para Vercel
```
Nome:        crediclass
Tipo:        CNAME
Valor:       cname.vercel.app (será fornecido por Vercel)
Proxy:       Proxied (deve estar laranja)
TTL:         Auto
```

**Resultado esperado:**
```
crediclass.csrtecnologia.com.br CNAME → cname.vercel.app
```

---

### **Fase 2: Vercel (Frontend)**

#### 2.1 Preparar Projeto
```bash
# 1. Committar todas as mudanças
cd /home/user/crediclass-dashboard-grupos
git add -A
git commit -m "feat: Prepare for production deployment to Vercel"
git push origin main

# 2. Garantir que vercel.json existe
cat vercel.json
```

**Conteúdo esperado de vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "^/api/(.*)",
      "dest": "https://seu-backend-railway.app/api/$1"
    },
    {
      "src": "^/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "^/(?!static|api).*",
      "dest": "/index.html"
    }
  ]
}
```

#### 2.2 Fazer Deploy no Vercel
```bash
# 1. Acesse: https://vercel.com
# 2. Sign in com GitHub
# 3. Clique "New Project"
# 4. Selecione repositório: crediclass-dashboard-grupos
# 5. Configure:
#    - Framework: Other (Static)
#    - Root Directory: frontend/
#    - Build Command: (deixar vazio)
#    - Output Directory: frontend/
# 6. Deploy
```

#### 2.3 Adicionar Domínio Customizado
```bash
# No dashboard Vercel:
# 1. Vá para: Project → Settings → Domains
# 2. Adicione: crediclass.csrtecnologia.com.br
# 3. Vercel vai validar CNAME automaticamente com Cloudflare
# 4. Aguarde validação (pode levar 5-10 minutos)
```

---

### **Fase 3: Railway/Heroku (Backend)**

#### 3.1 Preparar Backend para Deploy
```bash
# 1. Verificar backend/requirements.txt
cat backend/requirements.txt

# Esperado:
# fastapi==0.115.0
# uvicorn==0.30.6
# google-api-python-client==2.139.0
# google-auth-httplib2==0.2.0
# google-auth-oauthlib==1.2.1
# python-dotenv==1.0.1
# httpx==0.27.2

# 2. Criar arquivo Procfile (Heroku)
cat > backend/Procfile << 'EOF'
web: uvicorn main:app --host 0.0.0.0 --port $PORT
EOF

# 3. Criar .env.example (para Railway/Heroku)
cat > backend/.env.example << 'EOF'
GOOGLE_SHEETS_ID=seu-id-aqui
GOOGLE_API_KEY=sua-chave-aqui
PIPERUN_API_KEY=sua-chave-piperun
EOF
```

#### 3.2 Deploy em Railway (Recomendado)
```bash
# 1. Acesse: https://railway.app
# 2. Sign in com GitHub
# 3. Clique "New Project"
# 4. Selecione repositório: crediclass-dashboard-grupos
# 5. Configure:
#    - Root Directory: backend/
#    - Build Command: pip install -r requirements.txt
#    - Start Command: uvicorn main:app --host 0.0.0.0 --port 8000
# 6. Adicione Variáveis de Ambiente:
#    - GOOGLE_SHEETS_ID
#    - GOOGLE_API_KEY
#    - PIPERUN_API_KEY
# 7. Deploy
```

**Ou Deploy em Heroku:**
```bash
# 1. Instale Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# 2. Login
heroku login

# 3. Crie app
heroku create crediclass-api

# 4. Faça deploy
git push heroku main

# 5. Configure variáveis
heroku config:set GOOGLE_SHEETS_ID=seu-id
heroku config:set GOOGLE_API_KEY=sua-chave

# 6. Obtenha URL
heroku open
```

---

### **Fase 4: Conectar Frontend ao Backend**

#### 4.1 Atualizar vercel.json com URL do Backend
```bash
# Após o deploy do backend, você terá uma URL como:
# Railway: seu-app.railway.app
# Heroku: crediclass-api.herokuapp.com

# Atualize vercel.json:
cat > vercel.json << 'EOF'
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://seu-backend-railway.app/api/:path*"
    }
  ]
}
EOF

# Commit e push
git add vercel.json
git commit -m "config: Update backend URL in vercel.json"
git push origin main
```

#### 4.2 Configurar CORS no Backend
```bash
# Editar backend/main.py
# Linha ~14 (CORSMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://crediclass.csrtecnologia.com.br",
        "http://localhost:8000",
        "http://localhost:3000"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Commit
git add backend/main.py
git commit -m "config: Configure CORS for production domain"
git push origin main
```

---

## 🔐 VARIÁVEIS DE AMBIENTE

### **Backend (.env no Railway/Heroku)**
```bash
# Google Sheets
GOOGLE_SHEETS_ID=1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
GOOGLE_API_KEY=seu-api-key-aqui

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
  - [ ] CNAME record criado: `crediclass` → `cname.vercel.app`
  - [ ] Proxy ativado (laranja)
  - [ ] SSL/TLS em Full

- [ ] **Vercel**
  - [ ] Repositório conectado
  - [ ] Build configurado
  - [ ] Domínio customizado adicionado
  - [ ] CNAME validado
  - [ ] Deploy bem-sucedido

- [ ] **Railway/Heroku**
  - [ ] Repositório conectado
  - [ ] Requirements.txt instalados
  - [ ] Variáveis de ambiente configuradas
  - [ ] Deploy bem-sucedido
  - [ ] URL obtida (e.g., `seu-app.railway.app`)

- [ ] **Integração**
  - [ ] vercel.json atualizado com URL do backend
  - [ ] CORS configurado no backend
  - [ ] Testes de API funcionando
  - [ ] Frontend carregando dados via API

- [ ] **Testes de Produção**
  - [ ] Acesse `crediclass.csrtecnologia.com.br`
  - [ ] Frontend carrega
  - [ ] Endpoints `/api/*` respondendo
  - [ ] Calculadora funciona
  - [ ] Google Sheets integração (se configurada)

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
| **CNAME não valida** | DNS não propagou | Aguarde 15-30 min, limpe cache |
| **404 no frontend** | Build incorreto | Verifique root directory em Vercel |
| **API retorna 503** | Backend offline | Verifique logs em Railway/Heroku |
| **CORS error** | CORS não configurado | Atualize backend/main.py com domínio |
| **Imagens não carregam** | Path incorreto | Verifique `/static/` em vercel.json |

---

## 📞 PRÓXIMAS FASES

### **Curto Prazo (2-4 semanas)**
- [ ] SSL/TLS configurado (automático Vercel + Cloudflare)
- [ ] Monitoramento e alertas (Vercel Analytics + Cloudflare)
- [ ] CI/CD pipeline (.github/workflows)
- [ ] Backup automático de dados

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

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Cloudflare DNS Setup](https://developers.cloudflare.com/dns/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [CORS in FastAPI](https://fastapi.tiangolo.com/tutorial/cors/)

---

## 👤 Responsável

**Documento criado:** 2026-05-18  
**Última atualização:** 2026-05-18  
**Status:** 📋 Planejado — Aguardando execução

---

**🟢 PRONTO PARA DEPLOYMENT**

Siga as 4 fases e seu projeto estará online em `crediclass.csrtecnologia.com.br`!
