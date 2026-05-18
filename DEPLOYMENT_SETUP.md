# 🚀 Deployment Setup — crediclass.csrtecnologia.com.br

**Data:** 2026-05-18  
**Status:** ✅ Documentado e Pronto para Deploy  
**Responsável:** Cristiano de Souza

---

## 📐 Arquitetura de Deployment

```
crediclass.csrtecnologia.com.br
│
├── Frontend (Vercel)
│   ├── / → index.html
│   ├── /static → assets (CSS, JS, imagens)
│   └── /api/* → proxy para backend
│
└── Backend (Railway/Heroku)
    └── /api/* → FastAPI
        ├── /api/grupos
        ├── /api/stats
        ├── /api/piperun/{deal_id}
        └── /api/refresh
```

---

## 🏗️ Componentes

### **Frontend — Vercel**
- **Plataforma:** Vercel
- **Diretório:** `frontend/`
- **Arquivos:** `index.html`, `/static/`, `app.js`
- **URL:** `crediclass.csrtecnologia.com.br`
- **Deploy:** Automático via GitHub (main branch)
- **Proxy de API:** `/api/*` → Backend Railway/Heroku

### **Backend — Railway/Heroku**
- **Plataforma:** Railway ou Heroku
- **Linguagem:** Python 3.11+ (FastAPI + Uvicorn)
- **Diretório:** `backend/`
- **Porta:** 8000
- **Endpoints:**
  - `GET /api/grupos` — Lista grupos com filtros
  - `GET /api/stats` — Estatísticas gerais
  - `GET /api/piperun/{deal_id}` — Busca oportunidade Piperun
  - `POST /api/refresh` — Atualiza dados
  - `GET /api/grupos-gerenciador` — Lista paginada
  - `GET /api/grupos/{id}` — Detalhe grupo
  - `PUT /api/grupos/{id}` — Atualizar grupo
  - `POST /api/grupos` — Criar grupo

### **DNS — Cloudflare**
- **Domínio:** `csrtecnologia.com.br` (registro.br)
- **Subdomínio:** `crediclass`
- **Record:** CNAME → `cname.vercel.app` (fornecido por Vercel)
- **Proxy:** Ativado (Cloudflare Orange)
- **SSL/TLS:** Full (Vercel + Cloudflare)

---

## 🔄 Fluxo de Requisição

```
1. Usuário → crediclass.csrtecnologia.com.br
   ↓
2. Cloudflare resolve DNS → Vercel
   ↓
3. Vercel serve frontend (index.html)
   ↓
4. JavaScript faz requisição para /api/grupos
   ↓
5. Vercel rewrite: /api/grupos → https://seu-backend-railway.app/api/grupos
   ↓
6. Backend (Railway/Heroku) processa e responde
   ↓
7. Frontend recebe dados e renderiza
```

---

## 📝 Arquivos de Configuração

### **vercel.json** (Frontend)
```json
{
  "version": 2,
  "buildCommand": "cd frontend && ls -la",
  "outputDirectory": "frontend",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://seu-backend-railway.app/api/$1"
    },
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "^/(?!api|static).*",
      "dest": "/index.html"
    }
  ]
}
```

**Nota:** Substituir `seu-backend-railway.app` pela URL real do seu backend após deploy no Railway/Heroku.

### **backend/requirements.txt**
```
fastapi==0.115.0
uvicorn==0.30.6
google-api-python-client==2.139.0
google-auth-httplib2==0.2.0
google-auth-oauthlib==1.2.1
python-dotenv==1.0.1
httpx==0.27.2
```

### **backend/Procfile** (Heroku)
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## 🔐 Variáveis de Ambiente

### **Backend (Railway/Heroku .env)**
```bash
GOOGLE_SHEETS_ID=1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
GOOGLE_API_KEY=sua-chave-aqui
PIPERUN_API_KEY=sua-chave-piperun
ENVIRONMENT=production
DEBUG=false
```

---

## ✅ Checklist de Deployment

- [ ] **Cloudflare (DNS)**
  - [ ] CNAME record: `crediclass` → `cname.vercel.app`
  - [ ] Proxy ativado (laranja)
  - [ ] SSL/TLS em Full

- [ ] **Vercel (Frontend)**
  - [ ] Repositório conectado ao GitHub
  - [ ] Root directory: `frontend/`
  - [ ] Domínio customizado: `crediclass.csrtecnologia.com.br`
  - [ ] vercel.json configurado
  - [ ] Deploy bem-sucedido

- [ ] **Railway/Heroku (Backend)**
  - [ ] Repositório conectado
  - [ ] Root directory: `backend/`
  - [ ] Variáveis de ambiente configuradas
  - [ ] Deploy bem-sucedido
  - [ ] URL obtida (ex: `seu-app.railway.app`)

- [ ] **Integração**
  - [ ] vercel.json atualizado com URL real do backend
  - [ ] CORS configurado no backend
  - [ ] Testes de API funcionando
  - [ ] Frontend carregando dados

---

## 🧪 Teste Pós-Deploy

```bash
# 1. Acesse o frontend
https://crediclass.csrtecnologia.com.br

# 2. Teste endpoint
curl https://crediclass.csrtecnologia.com.br/api/stats

# 3. Esperado
{
  "total_grupos": 1809,
  "por_administradora": {...},
  "por_tipo_bem": {...},
  "media_lance_geral": 12500.50
}
```

---

## 🚨 Troubleshooting

| Problema | Solução |
|----------|---------|
| **CNAME não valida** | Aguarde 15-30 min, DNS se propaga devagar |
| **404 no frontend** | Verifique root directory em Vercel = `frontend/` |
| **API retorna 503** | Backend offline, verifique logs em Railway/Heroku |
| **CORS error** | Atualize CORSMiddleware em `backend/main.py` com domínio |
| **Imagens não carregam** | Verifique paths em `vercel.json` |

---

## 📚 Referências

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Heroku Documentation](https://devcenter.heroku.com)
- [Cloudflare DNS](https://developers.cloudflare.com/dns/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

**🟢 PRONTO PARA DEPLOYMENT**

Siga o checklist acima e seu projeto estará online em `crediclass.csrtecnologia.com.br`!
