# Crediclass Dashboard Grupos — Guia Claude Code

Dashboard de análise financeira de grupos de consórcio imobiliário com simulador de modalidades e comparativo entre 6 administradoras.

**Status:** ✅ Produção | Última atualização: 2026-05-29  
**Stack:** Frontend (Next.js/Vercel) + Backend (FastAPI/Render)

---

## 🚀 Início Rápido

### Terminal 1 — Backend (Render)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# → http://localhost:8000/api
```

### Terminal 2 — Frontend (Vercel)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

**Variáveis de Ambiente:** Copie de `.env.example` (ou configure no deploy)

---

## 📁 Estrutura do Projeto

```
crediclass-dashboard-grupos/
│
├── frontend/                    # Next.js + TypeScript
│   ├── app/                     # Rotas e páginas
│   ├── components/              # Componentes React
│   ├── lib/                      # API client, tipos, validadores
│   ├── css/                      # Estilos Tailwind
│   ├── public/                   # Assets estáticos
│   ├── next.config.ts           # Configuração Next.js
│   ├── tailwind.config.ts       # Configuração Tailwind
│   ├── tsconfig.json            # TypeScript
│   └── package.json
│
├── backend/                      # FastAPI + Python 3.11
│   ├── main.py                  # Aplicação FastAPI com todas as rotas
│   ├── sheets.py                # Integração Google Sheets API
│   ├── piperun.py               # Integração PipeRun CRM
│   ├── sync_queue.py            # Fila de sincronização assíncrona
│   ├── requirements.txt          # Python dependencies
│   └── __init__.py
│
├── data/                         # Cache local
│   └── grupos.json              # ~1.809 grupos (sincronizado com Google Sheets)
│
├── docs/                         # Documentação (limpeza recente)
├── README.md                     # Documentação principal
├── CLAUDE.md                     # Este arquivo (guia para development)
├── Dockerfile                    # Build do backend (Render)
├── render.yaml                   # Configuração Render
├── vercel.json                   # Configuração Vercel
├── .env.example                  # Template de variáveis de ambiente
└── .gitignore
```

---

## 🎯 Capacidades Principais

- **Análise Financeira:** Dashboard com 1.809 grupos de consórcio imobiliário
- **Comparativo de Administradoras:** CNP, ITAÚ, CAOA, PORTO, EMBRACON, RODOBENS
- **Histórico Mensal:** 18 meses de dados (MAY-24 até DEC-25) com maior_lance, menor_lance, qtd_contemplações
- **Integração PipeRun:** Sincronização de oportunidades via CRM
- **API RESTful:** Endpoints para filtros, detalhes, atualização de grupos
- **Google Sheets:** Base de dados principal com 156 colunas
- **Cache Local:** JSON sincronizado para performance

---

## 🌐 URLs Principais

| Ambiente | URL |
|----------|-----|
| **Produção** | https://crediclass.csrtecnologia.com.br |
| **Backend API** | https://crediclass.csrtecnologia.com.br/api |
| **GitHub** | https://github.com/CristianodeSouza/crediclass-dashboard-grupos |
| **Render Dashboard** | https://dashboard.render.com |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Google Sheets** | [Tabela de Grupos 3.0](https://docs.google.com/spreadsheets/d/1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM/) |

---

## 📊 Dataset

- **Total de Grupos:** ~1.809 ativos gerenciados
- **Colunas na Planilha:** 156 campos
- **Administradoras:** CNP, ITAÚ, CAOA, PORTO, EMBRACON, RODOBENS (6 total)
- **Histórico Mensal:** 18 meses (MAY-24 até DEC-25)
- **Campos Históricos:** maior_lance, menor_lance, qtd_contemplações
- **Fonte Principal:** Google Sheets API v4 (Tabela de Grupos 3.0)
- **Cache Local:** `/data/grupos.json` (sincronizado automaticamente)

---

## 🛠️ Stack Técnico

| Componente | Tecnologia |
|-----------|-----------|
| **Frontend** | Next.js 15 + TypeScript + Tailwind CSS |
| **Backend** | FastAPI + Python 3.11 |
| **Hospedagem Frontend** | Vercel |
| **Hospedagem Backend** | Render (Native Python) |
| **Banco de Dados** | Google Sheets API v4 |
| **CRM** | PipeRun (integração JSON) |
| **DNS/CDN** | Cloudflare |
| **Versionamento** | GitHub |
| **Cache** | JSON local (`data/grupos.json`) |

---

## 🔌 API Endpoints Principais

**Base URL:** `https://crediclass.csrtecnologia.com.br/api` (ou `http://localhost:8000/api` em desenvolvimento)

```
GET    /grupos-gerenciador       # Lista grupos com filtros (query: limit, offset, filters)
GET    /grupos/{id}              # Detalhes do grupo + histórico completo
PUT    /grupos/{id}              # Atualizar grupo (requer histórico completo no body)
GET    /stats                    # Estatísticas gerais (total grupos, administradoras, etc)
POST   /refresh                  # Forçar atualização do cache (fetch_grupos com force_refresh=True)
GET    /piperun/{deal_id}        # Dados do deal no PipeRun CRM
```

## ⚙️ Variáveis de Ambiente

### Backend (`.env` ou Render environment)

```env
GOOGLE_SHEETS_ID=1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
GOOGLE_API_KEY=<sua-chave-google-api>
PIPERUN_API_KEY=<sua-chave-piperun>
ENVIRONMENT=production    # ou 'development' localmente
DEBUG=false
PORT=8000
```

### Frontend (Vercel environment ou `.env.local`)

```env
NEXT_PUBLIC_API_URL=https://crediclass.csrtecnologia.com.br
NEXT_PUBLIC_APP_NAME=Crediclass Dashboard Grupos
```

⚠️ **NUNCA commitar `.env` com credenciais reais.** Usar `.env.example` como template.

---

## 🚀 Deploy

### Render (Backend)

1. Conectar repositório GitHub
2. Build Method: **Python 3.11 (Native)**
3. Start Command: `sh -c 'PYTHONPATH=/app python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT'`
4. Adicionar variáveis de ambiente
5. Deploy automático em cada push para `main`

### Vercel (Frontend)

1. Conectar repositório GitHub
2. Framework: **Next.js**
3. Adicionar `NEXT_PUBLIC_API_URL` nas variáveis
4. Deploy automático em cada push para `main`

**Verificação Pós-Deploy:**
```bash
curl https://crediclass.csrtecnologia.com.br/api/grupos-gerenciador?limit=1
# Esperado: JSON com dados, HTTP 200
```

---

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Commit: `git commit -m "feat: descrição"`
3. Push: `git push origin feature/sua-feature`
4. Abra um Pull Request

---

## 👤 Contato & Suporte

Para dúvidas sobre o projeto, consulte o README.md ou entre em contato:

**Desenvolvedor:** Cristiano de Souza  
**Email:** csrdesouza@gmail.com  
**GitHub:** [@CristianodeSouza](https://github.com/CristianodeSouza)

