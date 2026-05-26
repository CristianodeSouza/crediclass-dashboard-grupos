# 🧪 Testes em Produção — SPA Restaurado

**Data**: 2026-05-26  
**URL**: https://crediclass.csrtecnologia.com.br  
**Status Deploy**: ⏳ Em andamento (aguarde 5-10 min)

---

## ⏳ Aguardar Deploy Render

Após fazer `git push origin main`, Render irá:

1. **Detectar novo commit** (1-2 min)
2. **Build**: pip install requirements.txt (2-3 min)
3. **Start**: python -m uvicorn main:app (1-2 min)
4. **Pronto**: ~5-10 minutos no total

Se der erro:
- Verificar https://dashboard.render.com → Build logs
- Se erro é "tela preta": Ctrl+Shift+Delete para limpar cache

---

## ✅ Testes — SPA Original (GET /)

### 1️⃣ Página Principal carrega

```
URL: https://crediclass.csrtecnologia.com.br/
```

**Checklist:**
- [ ] Página carrega (não é erro 500)
- [ ] Vê título "CREDICLASS" no topo
- [ ] Tem 4 abas: **Calculadora | Mapa de Grupos | Gerenciador | Analytics**
- [ ] Console sem erros (F12 → Console)

**Se vir tela preta ou código HTML**:
- Render ainda tem versão antiga
- Aguarde mais 5 min e recarregue com Ctrl+Shift+Delete

---

### 2️⃣ Aba Calculadora

```
URL: https://crediclass.csrtecnologia.com.br/ → Aba "Calculadora"
```

**Esperado:**
- [ ] Formulário visível com campos:
  - Crédito desejado (R$)
  - Prazo máximo (meses)
  - Parcela máxima (R$)
  - Renda mensal (R$)
  - FGTS disponível (R$)
- [ ] Botão "Executar Cálculo" funciona
- [ ] Após click, mostra tabela com:
  - 6 ADMs: CNP, ITAÚ, CAOA, PORTO, EMBRACON, RODOBENS
  - Colunas: Taxa ADM %, Fundo RSV %, Crédito, Lance Máximo, Prazo Mínimo
- [ ] Gráfico comparativo aparece (Chart.js)

**Teste prático:**
```
Crédito: 450.000
Prazo: 120 meses
Parcela: 6.000
Renda: 3.500
FGTS: 50.000
→ Clicar "Executar Cálculo"
→ Ver 6 ADMs com resultados diferentes
```

---

### 3️⃣ Aba Mapa de Grupos

```
URL: https://crediclass.csrtecnologia.com.br/ → Aba "Mapa de Grupos"
```

**Esperado:**
- [ ] Tabela grande com grupos carregados
- [ ] Colunas: Grupo, ADM, Tipo Bem, Crédito, Status
- [ ] Filtros funcionam:
  - Filtro por Administradora (dropdown)
  - Filtro por Tipo de Bem (dropdown)
  - Busca por nome (input texto)
- [ ] Paginação (próxima página, etc)
- [ ] Click em grupo abre detalhes

---

### 4️⃣ Aba Gerenciador

```
URL: https://crediclass.csrtecnologia.com.br/ → Aba "Gerenciador"
```

**Esperado:**
- [ ] Interface de gerenciamento CRUD
- [ ] Tabela com grupos editáveis
- [ ] Botões de ação:
  - Editar (lápis)
  - Deletar (lixo)
  - Duplicar (copiar)
- [ ] Formulário inline para edição
- [ ] Validações funcionam (campos obrigatórios)

---

### 5️⃣ Aba Analytics

```
URL: https://crediclass.csrtecnologia.com.br/ → Aba "Analytics"
```

**Esperado:**
- [ ] Cartões com estatísticas:
  - Total de Grupos
  - Administradoras
  - Tipos de Bem
  - Status (Ativo)
- [ ] Gráfico Doughnut (Administradoras)
- [ ] Gráfico Bar (Tipos de Bem)
- [ ] Tabela "Top Administradoras"
- [ ] Tabela "Tipos de Bem"

---

## ✅ Testes — API Legacy (/api/*)

### 6️⃣ Endpoint: GET /api/grupos

```bash
curl https://crediclass.csrtecnologia.com.br/api/grupos?limit=1
```

**Esperado:**
```json
{
  "total": 342,
  "grupos": [
    {
      "adm": "AUTO-CAIXA",
      "grupo": "2125",
      "tipo_bem": "Auto",
      ...
    }
  ]
}
```

**Checklist:**
- [ ] HTTP 200 OK
- [ ] "total": 342 (não 0)
- [ ] "grupos" array com objetos
- [ ] Cada grupo tem: adm, grupo, tipo_bem

---

### 7️⃣ Endpoint: GET /api/stats

```bash
curl https://crediclass.csrtecnologia.com.br/api/stats
```

**Esperado:**
```json
{
  "total_grupos": 342,
  "por_administradora": {
    "AUTO-CAIXA": 45,
    "BANCO-CNP": 80,
    ...
  },
  "por_tipo_bem": {
    "Auto": 150,
    "Imovel": 192,
    ...
  },
  "media_lance_geral": 125000.50,
  "administradoras": [...],
  "tipos_bem": [...]
}
```

**Checklist:**
- [ ] HTTP 200 OK
- [ ] "total_grupos": > 0
- [ ] "por_administradora" é objeto não-vazio
- [ ] "por_tipo_bem" é objeto não-vazio

---

### 8️⃣ Endpoint: GET /api/grupos-gerenciador

```bash
curl https://crediclass.csrtecnologia.com.br/api/grupos-gerenciador?limit=5
```

**Esperado:**
- [ ] HTTP 200 OK
- [ ] "total": número de grupos
- [ ] "grupos": array com 5 itens
- [ ] "pagina": 1
- [ ] "total_paginas": número correto

---

### 9️⃣ Endpoint: GET /api/piperun/{deal_id}

```bash
curl https://crediclass.csrtecnologia.com.br/api/piperun/1234567
```

**Esperado:**
- [ ] Se deal existe: JSON com dados
- [ ] Se deal não existe: HTTP 400 com mensagem de erro
- [ ] Endpoint responde (não 404)

---

### 🔟 Endpoint: GET /api/health/frontend

```bash
curl https://crediclass.csrtecnologia.com.br/api/health/frontend
```

**Esperado:**
```json
{
  "status": "healthy",
  "checks": {
    "app_js_accessible": true,
    "scripts_valid": true,
    "html_structure_valid": true
  },
  "errors": [],
  "warnings": []
}
```

**Checklist:**
- [ ] HTTP 200 OK
- [ ] "status": "healthy" (não "degraded")
- [ ] "app_js_accessible": true
- [ ] "errors": [] vazio

---

## ✅ Testes — SSR Novo (/grupos, /analytics)

### 1️⃣ Página SSR: GET /grupos

```
URL: https://crediclass.csrtecnologia.com.br/grupos
```

**Esperado:**
- [ ] Página HTML renderizada (SSR)
- [ ] Tabela com grupos
- [ ] Filtros: Administradora, Tipo de Bem
- [ ] Campo de busca
- [ ] Paginação

---

### 2️⃣ Página SSR: GET /analytics

```
URL: https://crediclass.csrtecnologia.com.br/analytics
```

**Esperado:**
- [ ] Página HTML renderizada (SSR)
- [ ] Cartões com estatísticas
- [ ] Gráfico Doughnut
- [ ] Gráfico Bar
- [ ] Tabelas

---

### 3️⃣ Formulário SSR: GET /grupos/novo

```
URL: https://crediclass.csrtecnologia.com.br/grupos/novo
```

**Esperado:**
- [ ] Formulário carrega
- [ ] Campos: Grupo, ADM, Tipo Bem, etc
- [ ] Botão "Salvar"

---

### 4️⃣ Detalhe SSR: GET /grupos/{id}

```
URL: https://crediclass.csrtecnologia.com.br/grupos/126
```

**Esperado:**
- [ ] Detalhes do grupo 126
- [ ] Link para editar

---

## ❌ Se Algo Falhar

### Tela Preta ou Código HTML Visível

**Causa**: Render ainda tem versão antiga

**Solução**:
1. Aguarde mais 5 minutos
2. Recarregue com Ctrl+Shift+Delete (limpar cache)
3. Se persiste: Verificar Render logs em https://dashboard.render.com

---

### API retorna "total": 0

**Causa**: dados/grupos.json não foi copiado ao container

**Solução**:
1. Verificar Render build logs
2. Verificar se /data/grupos.json existe localmente
3. Verificar Dockerfile tem `COPY data/ ./data/`

---

### Console mostra erros Alpine.js

**Causa**: app.js não foi restaurado corretamente

**Solução**:
1. Verificar se frontend/js/app.js existe
2. Verificar se index.html referencia app.js com caminho correto
3. Verificar `/api/health/frontend` endpoint

---

### Endpoint API retorna erro 404

**Causa**: API legacy não foi integrada em main.py

**Solução**:
1. Verificar app/main.py tem: `from .api_legacy import router as legacy_router`
2. Verificar: `app.include_router(legacy_router)`
3. Verificar app/api_legacy.py existe

---

## 📊 Resumo de Testes

| # | Teste | Status | Esperado |
|---|-------|--------|----------|
| SPA-1 | Página principal carrega | [ ] | Abas visíveis, sem erros |
| SPA-2 | Calculadora funciona | [ ] | 6 ADMs, gráfico |
| SPA-3 | Mapa de Grupos | [ ] | Tabela, filtros, paginação |
| SPA-4 | Gerenciador CRUD | [ ] | Editar, deletar, duplicar |
| SPA-5 | Analytics | [ ] | Cartões, gráficos, tabelas |
| API-1 | GET /api/grupos | [ ] | JSON, total > 0 |
| API-2 | GET /api/stats | [ ] | Estatísticas |
| API-3 | GET /api/grupos-gerenciador | [ ] | Paginação |
| API-4 | GET /api/piperun/* | [ ] | Responde |
| API-5 | GET /api/health/frontend | [ ] | status: healthy |
| SSR-1 | GET /grupos | [ ] | Tabela renderizada |
| SSR-2 | GET /analytics | [ ] | Dashboard renderizado |
| SSR-3 | GET /grupos/novo | [ ] | Formulário renderizado |
| SSR-4 | GET /grupos/{id} | [ ] | Detalhe renderizado |

**Total esperado**: 14 testes passando ✅

---

## 🎯 Resultado Final

Se TODOS os testes passarem:
- ✅ SPA original restaurado com 100% de funcionalidade
- ✅ API legacy funcionando com 29 endpoints
- ✅ SSR novo funcionando em paralelo
- ✅ Modo híbrido operacional

Significa: **Recuperadas 100% das funcionalidades perdidas** 🎉

---

**Próximo passo**: Executar testes em https://crediclass.csrtecnologia.com.br (após Render deploy estar pronto)

Última atualização: 2026-05-26 21:35 UTC
