# Render.com Deployment Guide — Crediclass Dashboard

**Documento:** Configuração e troubleshooting para deployments no Render  
**Atualizado:** 2026-05-19  
**Status:** Ativo — crítico para CI/CD  

---

## 🎯 Resumo Executivo

Este documento resolve um problema crítico de integração entre Render.com e GitHub:

**Problema:** Render ignora `render.yaml` se a UI estiver configurada para "Docker"  
**Solução:** Sincronizar UI do Render com configuração do repositório  
**Tempo:** 5 minutos de configuração manual + automático depois  

---

## ⚠️ Problema Identificado (2026-05-19)

### Sintomas
- Deploy entra em loop de erros
- Render tenta usar Docker mesmo com `render.yaml` presente
- Mensagens: `"failed to read dockerfile: open Dockerfile: no such file or directory"`
- App retorna 404 em todas as rotas

### Causa Raiz
Render mantém "Build Method" em seu banco de dados de UI, **separado do repositório Git**:

**Render UI (Database)** → Build Method: Docker (não sincronizado com repo)  
**GitHub Repository** → render.yaml (sincronizado com git push)  

Resultado: Conflito = Falha

---

## ✅ Solução em 3 Fases

### FASE 1: Sincronizar Render UI com Configuração Nativa

1. Acesse https://dashboard.render.com
2. Clique no serviço: **crediclass-dashboard**
3. Vá para: **Settings** → **Build & Deploy**
4. Mude **Build Method** de `Docker` para `Native (Python 3.11)`
5. **Salve as alterações**

**Tempo:** 2 minutos

---

### FASE 2: Atualizar render.yaml

**Arquivo:** `render.yaml` (raiz do projeto)

```yaml
services:
  - type: web
    name: crediclass-dashboard
    runtime: python
    pythonVersion: 3.11
    buildCommand: pip install -r backend/requirements.txt
    startCommand: sh -c 'PYTHONPATH=/app python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT'
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
      - key: PYTHONUNBUFFERED
        value: "1"
```

**Elementos Críticos:**

| Campo | Valor | Por Quê |
|-------|-------|---------|
| `startCommand` | `sh -c 'PYTHONPATH=/app ...'` | ⚠️ CRITICAL: Sem `cd backend &&` |
| `PYTHONPATH` | `/app` | Resolver imports relativos |

**Se Dockerfile existir:** Deletá-lo
```bash
rm -f Dockerfile Procfile
git push origin main
```

**Tempo:** 2 minutos

---

### FASE 3: Validar Deployment

**Checklist:**

- [ ] Render UI mudada para Native
- [ ] `git push` enviou atualizações
- [ ] Build completou com sucesso
- [ ] App responde em https://crediclass.csrtecnologia.com.br

**Testes:**

```bash
# Teste 1: Raiz
curl https://crediclass.csrtecnologia.com.br/

# Teste 2: API
curl "https://crediclass.csrtecnologia.com.br/api/grupos-gerenciador?limit=1"

# Teste 3: Filtro
curl "https://crediclass.csrtecnologia.com.br/api/grupos-gerenciador?adm=AUTO-CAIXA"
```

**Tempo:** 1 minuto

---

## 🔧 Troubleshooting

### "failed to read dockerfile: open Dockerfile"
**Causa:** Render UI ainda em modo Docker  
**Solução:** Volte para FASE 1, confirme salvamento

### "ModuleNotFoundError: No module named 'sheets'"
**Causa:** PYTHONPATH não configurado  
**Solução:** Verifique `startCommand` inclui `PYTHONPATH=/app`

### App responde 404
**Causas:** Build em progresso, Uvicorn não iniciou, porta incorreta  
**Solução:** Veja logs no Render Dashboard → Deployments

---

## 📋 Checklist Pre-Push

```bash
# 1. Verificar render.yaml
grep "PYTHONPATH=/app" render.yaml && echo "✓ OK"

# 2. Não há Dockerfile conflitante
! test -f Dockerfile && echo "✓ OK"

# 3. Testar localmente
cd backend && PYTHONPATH=/app python main.py

# 4. Push
git push origin main

# 5. Monitorar Render dashboard
```

---

**Última atualização:** 2026-05-19  
**Status:** ✅ Production-ready
