# 🏢 Crediclass Dashboard Grupos

Dashboard de análise financeira de grupos de consórcio imobiliário com simulador de modalidades e comparativo entre 6 administradoras.

**Status:** ✅ Produção  
**Data de atualização:** 2026-05-29  
**Stack:** Frontend (Next.js/Vercel) + Backend (FastAPI/Render)

---

## 🚀 Quick Start

### Terminal 1 — Backend (Render)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# → http://localhost:8000
```

### Terminal 2 — Frontend (Vercel)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## 🌐 URLs Principais

| Ambiente | URL |
|----------|-----|
| **Produção** | https://crediclass.csrtecnologia.com.br |
| **GitHub** | https://github.com/CristianodeSouza/crediclass-dashboard-grupos |
| **Render Dashboard** | https://dashboard.render.com |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Google Sheets** | [Tabela de Grupos 3.0](https://docs.google.com/spreadsheets/d/1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM/) |

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
│   └── package.json
│
├── backend/                      # FastAPI + Python
│   ├── main.py                  # Aplicação FastAPI
│   ├── sheets.py                # Integração Google Sheets
│   ├── piperun.py               # Integração PipeRun CRM
│   ├── sync_queue.py            # Fila de sincronização
│   ├── requirements.txt
│   └── __init__.py
│
├── data/                         # Cache local
│   └── grupos.json              # ~1.809 grupos
│
├── docs/                         # Documentação
│   ├── ARQUITETURA_TECNICA.md
│   └── FEATURES.md
│
├── CLAUDE.md                     # Guia para Claude Code
├── .env.example                  # Variáveis de ambiente
├── Dockerfile                    # Build do backend (Render)
├── render.yaml                   # Configuração Render
├── vercel.json                   # Configuração Vercel
├── package.json                  # Dependencies globais (opcional)
└── .gitignore
```

---

## 🛠️ Stack Técnico

| Componente | Tecnologia |
|-----------|-----------|
| **Frontend** | Next.js 15 + TypeScript + Tailwind CSS |
| **Backend** | FastAPI + Python 3.11 |
| **Hospedagem Frontend** | Vercel |
| **Hospedagem Backend** | Render (Native Python) |
| **Banco de Dados** | Google Sheets API v4 |
| **CRM** | PipeRun |
| **DNS/CDN** | Cloudflare |
| **Versionamento** | GitHub |

---

## 📊 Dados Principais

- **~1.809 grupos ativos** gerenciados
- **156 colunas** na planilha Google Sheets
- **6 administradoras:** CNP, ITAÚ, CAOA, PORTO, EMBRACON, RODOBENS
- **Histórico mensal:** 18 meses (MAY-24 até DEC-25)

---

## 🔌 APIs Principais

### Backend (Render)

**Base URL:** `https://crediclass.csrtecnologia.com.br/api`

```
GET    /grupos-gerenciador    # Lista grupos com filtros
GET    /grupos/{id}           # Detalhes + histórico
PUT    /grupos/{id}           # Atualizar grupo
GET    /stats                 # Estatísticas gerais
POST   /refresh               # Forçar atualização cache
```

---

## ⚙️ Variáveis de Ambiente

### Backend (`.env`)

```env
GOOGLE_SHEETS_ID=1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
GOOGLE_API_KEY=AIzaSyBTQeZkVls2uwJT0XeNJS0ZrTLZUPWCESM
PIPERUN_API_KEY=db120d1ef2e5c7dec30e8bacbfd307ae
ENVIRONMENT=production
DEBUG=false
PORT=8000
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://crediclass.csrtecnologia.com.br
NEXT_PUBLIC_APP_NAME=Crediclass Dashboard Grupos
```

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

---

## 📝 Documentação

- **[CLAUDE.md](CLAUDE.md)** — Guia completo para desenvolvimento com Claude Code
- **[docs/ARQUITETURA_TECNICA.md](docs/ARQUITETURA_TECNICA.md)** — Arquitetura técnica
- **[docs/FEATURES.md](docs/FEATURES.md)** — Status das features

---

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Commit: `git commit -m "feat: descrição"`
3. Push: `git push origin feature/sua-feature`
4. Abra um Pull Request

---

## 👤 Autor

**Cristiano de Souza**  
Email: csrdesouza@gmail.com  
GitHub: [@CristianodeSouza](https://github.com/CristianodeSouza)

---

## 📄 Licença

MIT License
