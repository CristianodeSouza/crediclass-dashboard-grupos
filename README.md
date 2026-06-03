# Crediclass Dashboard Grupos V2

Dashboard operacional simples para gerenciar grupos de consorcio diretamente na Google Sheets.

## Stack

- Python 3.12
- FastAPI
- Uvicorn
- Google Sheets API
- HTML, Bootstrap 5 e JavaScript vanilla

## Configuracao

Crie um `.env` local ou configure as variaveis no Render:

```env
GOOGLE_SHEETS_ID=
GOOGLE_API_KEY=
GOOGLE_SERVICE_ACCOUNT_JSON=
GOOGLE_SHEET_NAME=Tabela de Grupos 3.0
ENVIRONMENT=production
DEBUG=false
```

`GOOGLE_SERVICE_ACCOUNT_JSON` deve receber o JSON completo da service account ou o caminho local para um arquivo JSON fora do Git.

## Executar localmente

```bash
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload
```

Acesse `http://127.0.0.1:8000`.

## Endpoints

- `GET /api/grupos`
- `GET /api/grupos/{grupo_id}`
- `POST /api/grupos`
- `PUT /api/grupos/{grupo_id}`
- `DELETE /api/grupos/{grupo_id}`
- `POST /api/reload`

## Seguranca

Credenciais reais nao devem ser versionadas. Use apenas variaveis de ambiente, `.env` local ignorado pelo Git ou secrets do ambiente.
