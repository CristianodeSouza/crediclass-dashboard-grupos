# Docker Troubleshooting: `/js/app.js` 404/503 em Render.com

## Problema
Frontend não carrega em produção (Render.com):
- `index.html` carrega OK (Alpine.js loads)
- `/js/app.js` retorna 404 ou 503
- Mesmo problema pode afetar `/css/style.css`

## Causa Raiz (Análise Profunda)

### 1. Docker COPY Mechanics
```dockerfile
WORKDIR /app
COPY . .
```

Este comando copia tudo do build context:
```
/app/
├── backend/      ← copiado
├── frontend/     ← copiado AQUI
├── data/
├── docs/
└── ...
```

**Possíveis problemas:**
- Build context errado em Render.com
- `.dockerignore` (se existir) exclui `frontend/`
- Docker cache reutiliza layer anterior (não copia novamente)
- Permissões de arquivo quebradas

### 2. Path Resolution
```python
# Em /app/backend/main.py (executado com uvicorn)
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")
# = /app/backend/../frontend
# = /app/frontend ✓
```

**Issues:**
- Se `__file__` é relativo (improvável), quebra
- Se working directory muda, paths relativos quebram
- **SOLUÇÃO:** Use `os.path.abspath()` sempre

### 3. StaticFiles Serving
```python
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")
```

**Como funciona:**
- `GET /js/app.js` → procura `{FRONTEND_DIR}/js/app.js`
- Se arquivo não existe → 404
- Se arquivo não é legível → 503

**Possíveis problemas:**
- Arquivo não foi copiado
- Permissões não-legíveis

## Solução: 4 Passos

### Passo 1: Atualizar Dockerfile (✓ Já feito)

**Arquivo:** `/Dockerfile` e `/backend/Dockerfile`

```dockerfile
# Adicionar após RUN pip install:
RUN if [ -d /app/frontend ]; then \
      chmod -R 755 /app/frontend && \
      find /app/frontend -type f -exec chmod 644 {} \;; \
    fi
```

**Por quê:** Garante que todos os arquivos em `frontend/` são legíveis pelo processo uvicorn.

### Passo 2: Criar `.dockerignore` (✓ Já feito)

**Arquivo:** `/.dockerignore`

Explicita que:
- Não ignora `frontend/` (copiado)
- Remove arquivos desnecessários (reduz tamanho)

### Passo 3: Melhorar Diagnósticos (✓ Já feito)

**Arquivo:** `/backend/main.py`

Mudanças:
- Path resolution robusta com `abspath()`
- Logs de startup detalhados
- Verificação de existência de arquivo
- Exit com erro se `frontend/` não existe
- Endpoint `/debug` melhorado

**Como usar:**
```bash
curl https://seu-app.render.com/debug
```

Resposta esperada:
```json
{
  "status": "ok",
  "frontend_dir": "/app/frontend",
  "frontend_exists": true,
  "frontend_contents": ["index.html", "estudo-financeiro.html", "css", "js"],
  "file_checks": {
    "index_html": true,
    "js_app": true,
    "css_style": true
  },
  "working_dir": "/app/backend"
}
```

### Passo 4: Force Rebuild em Render.com

**Na dashboard do Render.com:**

1. Vá para sua app
2. Settings → Environment
3. Clique em "Clear build cache"
4. Trigger a new deploy

**Ou via CLI:**
```bash
# Se você tem Render CLI instalado
render deploy --service <SERVICE_ID>
```

## Diagnóstico: O Que Procurar

### Cenário 1: `/debug` retorna `"frontend_exists": false`
```json
{
  "status": "error",
  "frontend_exists": false,
  "frontend_contents": "NOT FOUND"
}
```

**Causa:** COPY não copiou `frontend/`

**Solução:**
- Verificar Dockerfile: `COPY . .` existe?
- Force rebuild sem cache
- Verificar `.dockerignore`: não está excluindo `frontend/`?

### Cenário 2: `/debug` retorna `frontend_exists: true` mas `js/app.js` não existe
```json
{
  "file_checks": {
    "js_app": false
  }
}
```

**Causa:** Arquivos não foram copiados dentro de `frontend/`

**Solução:** Mesmo que Cenário 1 - verificar COPY

### Cenário 3: `/debug` mostra tudo OK, pero `/js/app.js` retorna 403/503

**Causa:** Permissões de arquivo

**Solução:** O Dockerfile agora inclui:
```dockerfile
chmod -R 755 /app/frontend
find /app/frontend -type f -exec chmod 644 {} \;
```

Se mesmo assim falhar:
```dockerfile
# Fallback: Ser mais permissivo
RUN chmod -R 777 /app/frontend
```

### Cenário 4: Tudo parece OK, mas ainda falha

**Debug adicional:**

a) Verificar logs de startup:
```
curl https://seu-app.render.com/logs
# Procurar por [STARTUP] ou [ERROR]
```

b) Verificar estrutura no container (se tiver acesso shell):
```bash
docker exec <container> ls -laR /app/frontend
```

c) Verificar se Alpine.js carrega:
- Abrir DevTools do navegador (F12)
- Aba "Console" → procurar erros de Alpine
- Aba "Network" → verificar `/js/app.js` status code

## Checklist Final

- [ ] Dockerfile atualizado com `chmod`
- [ ] `.dockerignore` criado
- [ ] `backend/main.py` atualizado com diagnostics
- [ ] Force rebuild em Render.com (clear cache)
- [ ] Verificar `/debug` endpoint
- [ ] `index.html` carrega? ✓
- [ ] `/js/app.js` carrega? ✓
- [ ] Alpine.js functions? ✓

## Referências

- [FastAPI Static Files Docs](https://fastapi.tiangolo.com/advanced/static-files/)
- [Render.com Docker Docs](https://render.com/docs/docker)
- [Docker COPY Documentation](https://docs.docker.com/engine/reference/builder/#copy)

---

**Última atualização:** 2025-05-18
**Criado para:** Crediclass Dashboard Grupos
