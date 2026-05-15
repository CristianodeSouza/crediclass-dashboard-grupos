# Quick Start — Setup & Troubleshooting

## 1️⃣ Instalação (Primeira Vez)

### Pré-requisitos
- Python 3.11+
- Google Account (com Google Sheets API habilitada)
- Pip instalado

### Passos

#### 1. Clonar / Abrir Projeto
```bash
cd C:\Users\User\crediclass-dashboard-grupos
```

#### 2. Setup Google Sheets (CRÍTICO)
```bash
python setup_google.py
```
Isso abre navegador pedindo permissão para acessar Google Sheets → gera `token.json` e `credentials.json`.

**⚠️ IMPORTANTE:** 
- `credentials.json` → baixar do [Google Cloud Console](https://console.cloud.google.com)
- `token.json` → gerado automaticamente após autorização
- **Nunca commitar** ambos os arquivos (`.gitignore` já protege)

#### 3. Instalar Dependências
```bash
cd backend
pip install -r requirements.txt
```

Dependências principais:
- `fastapi` — framework web
- `google-auth-oauthlib` — OAuth Google
- `google-sheets-api` (via `google-client-core`)
- `uvicorn` — ASGI server
- `requests` — HTTP client (para Piperun)

#### 4. Iniciar Backend
```bash
python main.py
```
Deve aparecer:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

#### 5. Abrir Frontend
Browser: **http://localhost:8000**

---

## 2️⃣ Uso Diário

### Iniciar Projeto (Normal)
```bash
# Terminal 1 — Backend (da pasta root)
cd backend && python main.py

# Terminal 2 — Browser
# Abra http://localhost:8000
```

**Ou use o script:**
```bash
start.bat  # Abre backend + browser automaticamente
```

---

## 3️⃣ Endpoints Principais

### GET `/api/grupos`
Retorna lista de grupos com filtros

**Query Parameters:**
- `adm` → filtrar por administradora (ex: "ITAÚ")
- `tipo_bem` → tipo de bem (ex: "Imóvel")
- `busca` → buscar por numero/descricao
- `prazo_restante_min`, `prazo_restante_max` → range em meses
- `limit` → quantidade de resultados (default: 50)

**Exemplo:**
```
GET http://localhost:8000/api/grupos?adm=ITAÚ&tipo_bem=Imóvel&limit=20
```

### GET `/api/grupos/{id}`
Detalhe completo de um grupo + histórico

**Exemplo:**
```
GET http://localhost:8000/api/grupos/123456
```

### GET `/api/stats`
Estatísticas gerais (total grupos, distribuição por ADM, etc)

### POST `/api/refresh`
Força atualização da cache (relê Google Sheets)

**Body:** nenhum

### GET `/api/piperun/{deal_id}`
Busca oportunidade no Piperun e extrai dados

**Exemplo:**
```
GET http://localhost:8000/api/piperun/59393258
```

**Retorna:**
```json
{
  "nome_cliente": "João Silva",
  "email": "joao@email.com",
  "valor_imovel": 450000,
  "parcela_desejada": 6000,
  "lance_maximo": 150000,
  "renda_mensal": 8000,
  "cpf": "123.456.789-00"
}
```

---

## 4️⃣ Troubleshooting

### ❌ "ModuleNotFoundError: No module named 'fastapi'"
```bash
pip install -r backend/requirements.txt
```

### ❌ "Error: OAuth token expired"
Delete `token.json` e rode:
```bash
python setup_google.py
```
Re-autorize no browser.

### ❌ "Connection refused on port 8000"
Verifique se outro processo está usando a porta:
```bash
netstat -ano | findstr :8000
# Mate o processo ou mude a porta em main.py
```

### ❌ "No data in grupos.json"
Força refresh:
```bash
curl -X POST http://localhost:8000/api/refresh
# Ou clique no botão no frontend
```

### ❌ "Calculadora não exibe grupos"
- Verifique filtro de compatibilidade em `app.js` (linha ~180)
- Cheque console do browser (F12 → Console)
- Veja dados em `http://localhost:8000/api/grupos?adm=ITAÚ`

### ❌ "Piperun retorna erro 404"
- Verifique `deal_id` está correto
- Confirme campos no Piperun CRM (nomes podem variar)
- Ver mapa de campos em `backend/piperun.py`

---

## 5️⃣ Arquivos-Chave

| Arquivo | Responsabilidade |
|---------|------------------|
| `backend/main.py` | FastAPI app + rotas principales |
| `backend/sheets.py` | Leitura Google Sheets API |
| `backend/piperun.py` | Extração dados Piperun |
| `frontend/js/app.js` | Lógica calculadora (Alpine.js) |
| `frontend/index.html` | Estrutura HTML |
| `frontend/css/style.css` | Estilos |
| `data/grupos.json` | Cache grupos (atualiza a cada refresh) |

---

## 6️⃣ Variáveis de Ambiente (Opcional)

Se precisar, crie `.env` na raiz:
```bash
GOOGLE_SHEET_ID=1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
PIPERUN_API_URL=https://seu-piperun-domain.com
DEBUG=true  # Para logs verbose
```

Carregue com:
```python
from dotenv import load_dotenv
import os
load_dotenv()
SHEET_ID = os.getenv('GOOGLE_SHEET_ID', '1DlaihGVraM8...')
```

---

## 7️⃣ Próximas Etapas

- Leia `docs/ROADMAP.md` para tarefas em progresso
- Leia `docs/FEATURES.md` para detalhes de cada feature
- Consulte `docs/HISTORICO.md` para mudanças recentes

