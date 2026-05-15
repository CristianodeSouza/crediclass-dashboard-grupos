# Crediclass Dashboard Grupos — Guia Claude Desktop

Dashboard de análise financeira de grupos de consórcio imobiliário com simulador de modalidades e comparativo entre 6 administradoras.

**Status:** Em desenvolvimento | Última atualização: 2026-05-15

---

## 🚀 Início Rápido

```bash
# Terminal 1 (Backend)
cd backend
pip install -r requirements.txt
python main.py
# → http://localhost:8000

# Terminal 2 (Frontend)
# Acesse diretamente:
# → http://localhost:8000
```

**Setup inicial (primeira vez):**
```bash
python setup_google.py  # Configura OAuth Google Sheets
```

---

## 📁 Estrutura do Projeto

```
crediclass-dashboard-grupos/
├── backend/
│   ├── main.py           # FastAPI + rotas
│   ├── sheets.py         # Leitura Google Sheets API
│   ├── piperun.py        # Integração Piperun CRM
│   └── requirements.txt
├── frontend/
│   ├── index.html        # Dashboard SPA
│   ├── estudo-financeiro.html  # Página estudo (TODO)
│   ├── js/app.js         # Alpine.js + lógica calculadora
│   └── css/style.css
├── data/
│   └── grupos.json       # Cache local (~1809 grupos)
├── docs/
│   ├── ROADMAP.md        # Tarefas e progresso
│   ├── QUICK_START.md    # Detalhes de setup
│   ├── FEATURES.md       # Features com status
│   └── HISTORICO.md      # Mudanças recentes
└── CLAUDE.md             # Este arquivo
```

---

## 🎯 Features Principais

### ✅ Calculadora Financeira (Implementada)
- **Inputs:** crédito desejado, prazo, parcela, FGTS, renda
- **Outputs:** comparativo de 6 ADMs + groups compatíveis
- **Simulações:** 4 modalidades (sorteio, lance fixo, conservador, moderado)
- **Validações:** score de viabilidade (0-100)

### ✅ Buscar Oportunidade (Implementada)
- Integração com Piperun CRM
- Auto-fill automático de campos

### ⏳ TODO — Próximas Prioridades
Veja `docs/ROADMAP.md` para lista completa e datas.

---

## 🔗 Referências Importantes

| Recurso | Link |
|---------|------|
| **Planilha Grupos** | [Google Sheets](https://docs.google.com/spreadsheets/d/1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM/) |
| **Roadmap & TODO** | `docs/ROADMAP.md` |
| **Features Status** | `docs/FEATURES.md` |
| **Setup Detalhado** | `docs/QUICK_START.md` |
| **Histórico Mudanças** | `docs/HISTORICO.md` |

---

## 📊 Dados Gerais

- **Planilha:** Tabela de Grupos 3.0
- **Grupos:** ~1.809 ativos
- **Colunas:** 156
- **Administradoras:** CNP, ITAÚ, CAOA, PORTO, EMBRACON, RODOBENS

---

## 🛠️ Stack Técnico

| Componente | Tecnologia |
|-----------|-----------|
| Backend | FastAPI + Python 3.11+ |
| Frontend | Alpine.js + Chart.js |
| API Sheets | Google Sheets API v4 |
| CRM | Piperun (integração JSON) |
| Deploy | Vercel (frontend) |
| Cache | JSON local (`data/grupos.json`) |

---

## 📝 Documentação

- **[ROADMAP.md](docs/ROADMAP.md)** — Tarefas, prazos e status de cada feature
- **[QUICK_START.md](docs/QUICK_START.md)** — Setup detalhado, troubleshooting, credenciais
- **[FEATURES.md](docs/FEATURES.md)** — Cada feature com uso, fórmulas, estado
- **[HISTORICO.md](docs/HISTORICO.md)** — Log de mudanças, PRs, testes

---

## 👤 Contato & Suporte

Para dúvidas sobre o projeto, consulte `docs/ROADMAP.md` ou `docs/QUICK_START.md`.

