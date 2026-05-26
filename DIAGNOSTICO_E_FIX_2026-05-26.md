# Diagnóstico e Fix - Crediclass Dashboard em Render (2026-05-26)

## Situação de Urgência

**Problema:** Produção em https://crediclass.csrtecnologia.com.br/ retorna tela preta
- API GET /api/grupos retorna: `{"total":0,"grupos":[]}`
- Localmente: fetch_grupos() retorna 346 grupos ✓
- Dados: `/data/grupos.json` existe (761 KB) ✓

## Diagnóstico Root Cause

### Estrutura do Projeto (Confusa após refactoring)

Existem 4 arquivos `main.py`:
1. `/main.py` (root) → Entry point para Render ✓
2. `/app/main.py` → New FastAPI + Jinja2 structure
3. `/backend/main.py` → Old structure (deprecated)
4. Confusão entre importações relativas e absolutas

### O Problema Real

O **Dockerfile estava incompleto**:

```dockerfile
# ❌ ESTAVA ASSIM (faltava backend/)
COPY app/ ./app/
COPY main.py ./main.py
COPY frontend/ ./frontend/
COPY data/ ./data/

# O que estava faltando:
# COPY backend/ ./backend/  ← CRÍTICO!
```

### Por Que Quebrou

1. `app/main.py` inclui `api_legacy.py`:
   ```python
   from .api_legacy import router as legacy_router
   ```

2. `app/api_legacy.py` tenta importar:
   ```python
   from backend.sheets import fetch_grupos, ...
   ```

3. Em Docker, sem `COPY backend/`:
   - Import falha silenciosamente (há try/except)
   - `fetch_grupos` vira `lambda *args, **kwargs: []`
   - API retorna 0 grupos
   - Frontend carrega mas sem dados = tela preta

## Solução Implementada

### Commit 725b008

Adicionado ao Dockerfile:
```dockerfile
# Copiar backend (módulos de negócio: sheets.py, piperun.py, etc)
COPY backend/ ./backend/
```

**Ordem correta agora:**
```dockerfile
COPY app/ ./app/
COPY backend/ ./backend/          # ← NOVO
COPY main.py ./main.py
COPY frontend/ ./frontend/
COPY data/ ./data/
```

### Por Que Funciona

- `sheets.py` calcula `CACHE_FILE` como:
  ```python
  CACHE_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "grupos.json")
  # Em Docker: /app/backend/sheets.py → /app/backend/../data/grupos.json → /app/data/grupos.json ✓
  ```

- Com `COPY backend/` + `COPY data/`, o container terá:
  - `/app/backend/sheets.py` ✓
  - `/app/data/grupos.json` ✓
  - Importações funcionam ✓
  - fetch_grupos() carrega cache ✓
  - API retorna dados ✓

## Teste Local

```bash
python3 << 'EOF'
from backend.sheets import fetch_grupos
grupos = fetch_grupos()
print(f"fetch_grupos() retornou {len(grupos)} grupos")
# Output: fetch_grupos() retornou 346 grupos ✓
EOF
```

## Deploy Status

- **Commit:** 725b008 (2026-05-26 18:25 UTC)
- **Pushing:** `git push origin main` ✓
- **Render:** Build automático disparado
- **ETA:** ~5-10 minutos para deploy completo
- **Validação:** Check https://crediclass.csrtecnologia.com.br/api/grupos-gerenciador?limit=1

### Teste Post-Deploy

```bash
curl https://crediclass.csrtecnologia.com.br/api/grupos-gerenciador?limit=1
# Esperado: HTTP 200 + JSON com dados
# NÃO esperado: {"total":0,"grupos":[]}
```

## Lições Aprendidas

1. **Dockerfile precisa listar TODOS os diretórios de código**, não apenas alguns
2. **ImportError silencioso é perigoso** — há fallbacks que mascaram o problema
3. **Teste de build local com `docker build .`** teria encontrado isso
4. **Checklist pre-commit já tinha validação Dockerfile** mas foi ignorada (validador era novo)

## Itens de Limpeza Recomendados (TODO)

- [ ] Remover `/backend/main.py` (deprecated)
- [ ] Remover `/app/main_new.py` (test file)
- [ ] Consolidar imports em `app/api_legacy.py` (simplificar sys.path manipulation)
- [ ] Documentar estrutura final do projeto em CLAUDE.md

## Arquivos Modificados

- `Dockerfile` — adicionado `COPY backend/ ./backend/` (linha 26-27)

## Impacto

- **Severity:** Critical (produção vazia)
- **Fix:** 1 linha no Dockerfile
- **Testing:** Validação automática passou
- **Rollback:** Instantâneo se necessário
