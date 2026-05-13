# Arquitetura Técnica — Crediclass Dashboard Grupos

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Backend | Python + FastAPI | 3.12 / 0.115.0 |
| Servidor ASGI | Uvicorn | 0.30.6 |
| HTTP Client | HTTPX | 0.27.2 |
| Google Sheets | google-api-python-client | 2.139.0 |
| Frontend | Alpine.js | 3.x (CDN) |
| Estilos | Tailwind CSS | Play CDN |
| Gráficos | Chart.js | 4.4.3 (CDN) |
| CRM | Piperun REST API | v1 |

---

## Estrutura de Diretórios

```
crediclass-dashboard-grupos/
├── backend/
│   ├── main.py          # FastAPI — endpoints REST + serve frontend
│   ├── sheets.py        # Google Sheets API v4 + cache JSON
│   ├── piperun.py       # Client Piperun CRM + parser de nota HTML
│   ├── requirements.txt
│   ├── credentials.json # OAuth Google (NÃO versionar)
│   └── token.json       # Token OAuth renovável (NÃO versionar)
├── data/
│   └── grupos.json      # Cache dos grupos (342 grupos)
├── frontend/
│   ├── index.html       # SPA única — todo o dashboard
│   └── js/
│       └── app.js       # Componente Alpine.js (dashboard())
└── docs/
    ├── documentacao.html
    ├── ARQUITETURA_TECNICA.md
    └── REGRAS_DE_NEGOCIO.md
```

---

## API Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Serve index.html |
| `GET` | `/api/grupos` | Lista grupos com filtros query string |
| `GET` | `/api/grupos/{id}` | Detalhe de um grupo |
| `GET` | `/api/stats` | Totais, ADMs, tipos, média de lance |
| `GET` | `/api/piperun/{deal_id}` | Busca oportunidade no CRM |
| `POST` | `/api/refresh` | Força recarga da planilha Google Sheets |
| `GET` | `/static/*` | Arquivos estáticos do frontend |

### Filtros disponíveis em `/api/grupos`
`adm`, `tipo_bem`, `categoria`, `prazo_restante_min`, `prazo_restante_max`, `vida_min`, `vida_max`, `credito_min`, `busca`

---

## Módulo `sheets.py`

- **SPREADSHEET_ID:** `1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM`
- **Aba:** `Tabela de Grupos 3.0`
- **Cache:** `data/grupos.json` (TTL = 3600s)
- Autenticação: OAuth 2.0 Desktop (`credentials.json` + `token.json`)
- Fallback: se `credentials.json` ausente, usa cache existente ou retorna erro amigável

### Processamento de campos numéricos
- Créditos e parcelas: Python `float` direto do openpyxl — **não converter via string**
- Percentuais: Excel armazena como decimal (0.68 = 68%) → detectar com `abs(v) <= 2` e multiplicar por 100
- Histórico de lances: 36 meses × 3 colunas (Maior, Menor, Qtd) = 108 colunas de histórico

---

## Módulo `piperun.py`

- **Base URL:** `https://api.pipe.run/v1`
- **Token:** header `token: <value>`
- **Endpoint:** `GET /notes?cursor=""&deal_id={id}`

### Fluxo de parsing
1. Buscar todas as notas da oportunidade
2. Localizar nota com `"DADOS DO FORMULÁRIO"` no texto
3. Remover tags HTML (`<br>` → `\n`, strip demais tags)
4. Parsear linhas no formato `Label: Valor`
5. Mapear via `FIELD_MAP` (~25 campos)
6. Converter campos monetários (formato pt-BR: `R$ 600.000,00` → `600000.0`)
7. Calcular `pct_lance_disponivel = lance_maximo / valor_imovel × 100`

---

## Frontend (Alpine.js)

### Componente `dashboard()`

Estado gerenciado pelo Alpine sem Vuex/Redux. Toda a reatividade é declarativa.

**Computed properties principais:**
- `gruposFiltrados` — aplica filtros + sort (recalculado automaticamente)
- `gruposPaginados` — fatia paginada de `gruposFiltrados`
- `gruposCompativeis` — lista completa para contagem de compatíveis
- `formulario` — atalho para `oportunidade.formulario`

**Ciclo de vida:**
```
init() → loadStats() + loadGrupos() [paralelo via Promise.all]
```

**Auto-filtro ao buscar Piperun:**
```javascript
if (this.oportunidade.formulario?.valor_imovel_num) {
  this.filtrarCompativeis = true;
  this.pagina = 1;
}
```

---

## Dados dos Grupos

### Planilha base
- **Nome:** Mapa de Grupos 2.0 — Jan 2026 — Base de cálculo CRIS
- **Aba de dados:** Tabela de Grupos 3.0
- **Total de grupos:** 342

### Distribuição por ADM
| ADM | Grupos |
|---|---|
| ITAÚ | 132 |
| PORTO | 107 |
| RODOBENS | 36 |
| AUTO-ITAÚ | 28 |
| CAIXA | 22 |
| CAOA | ~11 |
| CANOPUS | 3 |

### Schema do objeto de grupo
```json
{
  "adm": "ITAÚ",
  "grupo": "4573",
  "tipo_bem": "Imóvel",
  "prazo_restante": 180,
  "vida_grupo_pct": 42.5,
  "maior_credito": 229396.69,
  "parcela_inicial": 1890.00,
  "investidor": 18.2,
  "conservador_24m": 22.5,
  "moderado_12m": 30.1,
  "agressivo_3m": 55.0,
  "media_lance": 32.4,
  "historico": [
    { "mes": "JAN-24", "maior": 45.2, "menor": 28.0, "qtd": 3 }
  ]
}
```

---

## Segurança

- Token Piperun hardcoded em `piperun.py` — mover para variável de ambiente em produção
- `credentials.json` e `token.json` não devem ser versionados (adicionar ao `.gitignore`)
- CORS configurado com `allow_origins=["*"]` — adequado para uso interno/local
- Sem autenticação de usuário — ferramenta de uso interno

---

## Como executar

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
python main.py
# Acessa em: http://localhost:8000
```

---

## Decisões técnicas relevantes

| Decisão | Motivo |
|---|---|
| Cache JSON em disco | Evita latência da API Google em cada requisição |
| Alpine.js sem build | Zero fricção para ferramenta interna — sem webpack/npm |
| Tailwind CDN | Aceitável para uso interno (ferramenta não pública) |
| openpyxl como fallback | Permite popular cache sem OAuth Google quando necessário |
| `porPagina = 50` | Equilibra performance e usabilidade com 342 grupos |
| Score 0–3 (não booleano) | Permite ranking gradual sem filtro binário rígido |
