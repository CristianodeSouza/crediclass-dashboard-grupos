# 🚀 Deployment Setup — crediclass.csrtecnologia.com.br

**Data:** 2026-05-18  
**Status:** ✅ Documentado e Pronto para Deploy  
**Responsável:** Cristiano de Souza

---

## 📐 Arquitetura de Deployment

```
crediclass.csrtecnologia.com.br
│
└── Render (Unified Service)
    ├── Frontend (Static Files)
    │   ├── / → index.html
    │   ├── /static → assets (CSS, JS, imagens)
    │   └── /* → SPA routing
    │
    └── Backend (FastAPI)
        └── /api/* → FastAPI
            ├── /api/grupos
            ├── /api/stats
            ├── /api/piperun/{deal_id}
            ├── /api/refresh
            └── /api/grupos-gerenciador (management)
```

---

## 🏗️ Componentes

### **Frontend + Backend — Render (Unified)**
- **Plataforma:** Render.com
- **Linguagem:** Python 3.11 (FastAPI)
- **Runtime:** Python 3
- **Diretórios:**
  - `frontend/` — Static files (HTML, CSS, JS, assets)
  - `backend/` — FastAPI application
- **URL:** `crediclass.csrtecnologia.com.br`
- **Deploy:** Automático via GitHub (arquivo: `render.yaml`)
- **Build:** `pip install -r backend/requirements.txt`
- **Start:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

### **Endpoints**
  - `GET /api/grupos` — Lista grupos com filtros
  - `GET /api/stats` — Estatísticas gerais
  - `GET /api/piperun/{deal_id}` — Busca oportunidade Piperun
  - `POST /api/refresh` — Atualiza dados
  - `GET /api/grupos-gerenciador` — Lista paginada
  - `GET /api/grupos/{id}` — Detalhe grupo
  - `PUT /api/grupos/{id}` — Atualizar grupo
  - `POST /api/grupos` — Criar grupo
  - `DELETE /api/grupos/{id}` — Deletar (soft delete)
  - `PATCH /api/grupos/{id}/status` — Mudar status

### **DNS — Cloudflare**
- **Domínio:** `csrtecnologia.com.br` (registro.br)
- **Subdomínio:** `crediclass`
- **Record:** CNAME → `onrender.com` (Render CNAME)
- **Proxy:** Ativado (Cloudflare Orange)
- **SSL/TLS:** Full (Render + Cloudflare)

---

## 🔄 Fluxo de Requisição

```
1. Usuário → crediclass.csrtecnologia.com.br
   ↓
2. Cloudflare resolve DNS → Render
   ↓
3. Render serve frontend (index.html)
   ↓
4. JavaScript faz requisição para /api/grupos
   ↓
5. Render routing: /api/* → FastAPI backend
   ↓
6. Backend (FastAPI) processa e responde
   ↓
7. Frontend recebe dados e renderiza
```

---

## 📝 Arquivos de Configuração

### **render.yaml** (Deployment Configuration)
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

**Nota:** Arquivo já configurado corretamente. Deploy automático ao fazer push para GitHub.

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

### **Arquivo de início (definido em render.yaml)**
```
startCommand: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
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
  - [ ] CNAME record: `crediclass` → `onrender.com`
  - [ ] Proxy ativado (laranja)
  - [ ] SSL/TLS em Full

- [ ] **GitHub**
  - [ ] Repositório conectado ao Render
  - [ ] Código pushado para main branch
  - [ ] render.yaml presente na raiz

- [ ] **Render (Deployment)**
  - [ ] Serviço criado: `crediclass-dashboard`
  - [ ] Build bem-sucedido
  - [ ] Variáveis de ambiente configuradas
  - [ ] Deploy ativo e rodando
  - [ ] URL do serviço obtida (ex: `crediclass-dashboard-xyz.onrender.com`)

- [ ] **Domínio Customizado**
  - [ ] CNAME configurado no Cloudflare
  - [ ] DNS validado
  - [ ] CORS configurado no backend para domínio
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
| **CNAME não valida** | Aguarde 15-30 min, DNS se propaga devagar. Verifique se está apontando para `onrender.com` |
| **404 no frontend** | Verifique `staticPublicPath: frontend` em `render.yaml` |
| **API retorna 503** | Backend offline, verifique logs em Render Dashboard |
| **CORS error** | Atualize CORSMiddleware em `backend/main.py` com domínio |
| **Build falha no Render** | Verifique `requirements.txt`, verifique logs no Render Dashboard |
| **Variáveis de ambiente não carregam** | Configure em Render Dashboard → Environment, não em `.env` |

---

## 📚 Referências

- [Render Documentation](https://render.com/docs)
- [Render Python Deployment](https://render.com/docs/deploy-python)
- [Cloudflare DNS](https://developers.cloudflare.com/dns/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [RENDER_SETUP.md](RENDER_SETUP.md) — Guia detalhado de setup no Render

---

**🟢 PRONTO PARA DEPLOYMENT**

Siga o checklist acima e seu projeto estará online em `crediclass.csrtecnologia.com.br`!
