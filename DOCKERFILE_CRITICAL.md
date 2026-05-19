# ⚠️ CRÍTICO — Problema no Dockerfile que causou Black Screen (2026-05-19)

**Status:** Resolvido | **Data:** 2026-05-19 | **Impacto:** Produção inteira ficou inoperante

---

## 🔴 O Problema

### Sintomas em Produção
- **URL:** https://crediclass.csrtecnologia.com.br → tela preta
- **Frontend:** Alpine.js carregava OK, templates renderizavam
- **API:** `/api/refresh` retornava HTTP 200 OK
- **Dados:** `{"total": 0, "grupos": []}` — zero grupos carregados
- **Causa:** `grupos.json` não existia em produção

### Raiz do Problema

O Dockerfile **não estava copiando o diretório `/data/`** para o container Render:

```dockerfile
# ❌ ANTES (ERRADO)
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY frontend/ ./frontend/
# ❌ FALTAVA: COPY data/ ./data/
ENV PYTHONPATH=/app
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Consequência:** Na produção Render, o arquivo `/data/grupos.json` (676 KB com ~1.809 grupos) não existia.

O backend (`sheets.py`) tenta carregar cache:
```python
CACHE_FILE = "/app/data/grupos.json"

if os.path.exists(CACHE_FILE):  # ❌ Retorna False em produção
    with open(CACHE_FILE) as f:
        return json.load(f)
```

Sem o cache, a API tenta buscar da Google Sheets, mas sem dados locais, retorna lista vazia.

---

## ✅ A Solução

### Fix #1: Adicionar COPY data/ ao Dockerfile

```dockerfile
# ✅ DEPOIS (CORRETO)
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY data/ ./data/           # ← FIX CRÍTICO
ENV PYTHONPATH=/app
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Implementado em commit:** `7c53504`

### Fix #2: Adicionar import json no main.py

O debug endpoint `/api/debug/cache-status` usava `json` sem importar:
```python
# ❌ ANTES
import os
from fastapi import FastAPI

# ✅ DEPOIS
import os
import json  # ← Adicionado
from fastapi import FastAPI
```

**Implementado em commit:** `50a1bce`

---

## 🔍 Como Detectamos

1. **Página carregava, mas sem dados** → problema não era Alpine.js ou frontend
2. **API retornava 200 OK** → problema não era HTTP error
3. **Verificação manual:**
   ```bash
   curl https://crediclass.csrtecnologia.com.br/api/debug/cache-status
   # Retornava: "cache_file": "/app/data/grupos.json", "exists": false
   ```
4. **Conclusão:** Arquivo não copiado ao container

---

## 🛡️ PREVENÇÃO PERMANENTE

### 1️⃣ Validação Automática no Pre-Commit Hook

Adicionado script `backend/dockerfile_validator.py` que é executado antes de cada commit:

```python
# .git/hooks/pre-commit
#!/bin/bash
python backend/dockerfile_validator.py
if [ $? -ne 0 ]; then
    echo "❌ Dockerfile validation failed"
    exit 1
fi
```

**O que valida:**
- ✅ Arquivo `Dockerfile` existe
- ✅ Linha `COPY data/ ./data/` está presente
- ✅ Linha `COPY backend/ ./backend/` está presente
- ✅ Linha `COPY frontend/ ./frontend/` está presente
- ✅ Ordem das COPY directives está correta
- ✅ `PYTHONPATH=/app` está definido
- ✅ `CMD` usa `uvicorn`

### 2️⃣ Checklist Pré-Deploy Atualizado

Adicionar ao checklist em CLAUDE.md:

```markdown
### 📋 Validação Dockerfile
- [ ] `Dockerfile` valida (run: python backend/dockerfile_validator.py)
- [ ] `COPY data/ ./data/` presente
- [ ] `COPY backend/ ./backend/` presente
- [ ] `COPY frontend/ ./frontend/` presente
- [ ] Todos os diretórios críticos copiados
```

### 3️⃣ Documentação de Diretórios Críticos

**Diretórios que DEVEM ser copiados para produção:**

| Diretório | Conteúdo | Crítico? | Motivo |
|-----------|----------|---------|--------|
| `/backend/` | main.py, sheets.py, etc | ✅ SIM | Código da API |
| `/frontend/` | index.html, app.js, css/ | ✅ SIM | Interface UI |
| `/data/` | grupos.json (cache) | ✅ **CRÍTICO** | Dados offline, fallback de Google Sheets |
| `/docs/` | Markdown (ROADMAP, etc) | ❌ NÃO | Apenas para referência local |

---

## 🧠 Por Que Isso Aconteceu?

1. **Arquivo `.gitignore`** não tinha `/data/` listado → estava sendo commitado
2. **Dockerfile copiava componentes principais** (backend, frontend) mas **esqueceu da cache**
3. **Teste em localhost funcionava** porque `/data/grupos.json` existia localmente
4. **Deploy em Render falhou silenciosamente** porque API retorna 200 OK mesmo sem dados

**Lição:** Diretórios que são `.gitignore`'d precisam de documentação explícita no Dockerfile.

---

## 📊 Verificação Pós-Fix

Após aplicar o fix, a API começou retornando dados:

```bash
# Terminal
curl https://crediclass.csrtecnologia.com.br/api/grupos-gerenciador?limit=3

# ✅ Resposta
{
  "total": 342,
  "grupos": [
    {
      "id": 1,
      "grupo_id": "CNP-001",
      "administradora": "CNP",
      ...
    },
    ...
  ]
}
```

**Confirmação:** Cache carregou com sucesso, dashboard voltou a funcionar.

---

## 🚨 Checklist para Não Repetir

- [ ] Dockerfile foi validado? (run: `python backend/dockerfile_validator.py`)
- [ ] `/data/grupos.json` existe no repositório?
- [ ] `COPY data/ ./data/` está no Dockerfile?
- [ ] Pre-commit hook está ativo? (check: `.git/hooks/pre-commit`)
- [ ] Deploy em Render foi testado? (curl para `/api/grupos-gerenciador`)
- [ ] Frontend carrega dados? (abrir https://crediclass.csrtecnologia.com.br no navegador)

---

## 📚 Documentação Relacionada

- [CLAUDE.md](CLAUDE.md) — Guia geral do projeto
- [RENDER_SETUP.md](RENDER_SETUP.md) — Configuração Render específica
- `backend/dockerfile_validator.py` — Script de validação
- `backend/sheets.py` — Lógica de cache (linhas 75-140)

---

## 🔗 Commits Relacionados

- `7c53504` — fix: Copy data/ directory in Dockerfile to include grupos.json cache in Render deployment
- `50a1bce` — fix: Add missing json import in main.py
- `81f0a62` — debug: Add cache status debug endpoint for troubleshooting

---

**Autor:** Claude Code (via diagnóstico 2026-05-19)  
**Status:** ✅ Resolvido em produção
