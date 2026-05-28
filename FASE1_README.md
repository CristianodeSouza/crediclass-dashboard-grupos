# ⚠️ FASE 1 - FRONTEND CONGELADO

**Data de Início:** 2026-05-28  
**Status:** 🟡 EM PROGRESSO

---

## 📢 AVISO IMPORTANTE

O frontend Alpine.js (`frontend/`) está **CONGELADO** para permitir a reestruturação da arquitetura.

### ❌ O QUE NÃO FAZER

- ❌ **Alterar `frontend/js/app.js`** (exceto correções críticas de bugs)
- ❌ **Modificar estrutura HTML** de `frontend/index.html`
- ❌ **Implementar novos features** no Alpine.js
- ❌ **Refatorar código** do frontend
- ❌ **Fazer mudanças visuais** significativas

### ✅ O QUE É PERMITIDO

- ✅ Correções críticas de bugs (que afetam funcionalidade)
- ✅ Hotfixes de segurança
- ✅ Documentação e comentários
- ✅ Leitura do código para entender endpoints

---

## 📋 DOCUMENTAÇÃO DISPONÍVEL

### Endpoints do Frontend (23 total)
📄 **Arquivo:** [`docs/FASE1_CONGELAMENTO_FRONTEND.md`](docs/FASE1_CONGELAMENTO_FRONTEND.md)

Contém documentação completa de todos os endpoints utilizados pelo frontend atual:
- Descrição do endpoint
- Parâmetros esperados
- Response esperado
- Linha no código (`app.js`)

### Arquitetura da Reestruturação
📄 **Arquivo:** [`TUDO_SOBRE_CREDICLASS_REESTRUTURADO_STACK_v2.txt`](TUDO_SOBRE_CREDICLASS_REESTRUTURADO_STACK_v2.txt)

Documentação completa da nova arquitetura com 5 fases:
- FASE 1: Congelamento ✅ (em progresso)
- FASE 2: Criar frontend Next.js
- FASE 3: Conectar com FastAPI
- FASE 4: Homologação
- FASE 5: Cutover

---

## 🗂️ ESTRUTURA DO PROJETO

### Frontend (Congelado)
```
frontend/
├── index.html          # 🔒 HTML principal (Alpine.js)
├── js/
│   └── app.js          # 🔒 CONGELADO - Lógica do dashboard
├── static/
│   ├── css/style.css   # 🔒 CONGELADO
│   └── js/app.js       # 🔒 CONGELADO
├── login.html          # 🔒 CONGELADO
└── estudo-financeiro.html
```

### Backend (Ativo)
```
backend/
├── main.py             # FastAPI - endpoints
├── sheets.py           # Google Sheets integration
├── piperun.py          # PipeRun CRM integration
├── models.py           # Pydantic models
├── cache.py            # Cache local JSON
└── sync_queue.py       # SyncQueue assíncrona
```

---

## 🚀 PRÓXIMAS FASES

### FASE 2: Frontend Next.js (Vercel)
- [ ] Criar projeto Next.js + TypeScript + Tailwind
- [ ] Reproduzir cada aba do frontend atual
- [ ] Conectar com endpoints documentados

### FASE 3: Integração com Backend
- [ ] Validar comunicação com FastAPI
- [ ] Testar sincronização de dados
- [ ] Testar Google Sheets

### FASE 4: Homologação
- [ ] Testar todas as funcionalidades
- [ ] Validar em URL temporária
- [ ] Testes de carga

### FASE 5: Cutover
- [ ] Trocar domínio para Vercel
- [ ] Manter API no Render
- [ ] Teste final de ponta a ponta

---

## 📚 ENDPOINTS DOCUMENTADOS

### Abas - Mapa de Grupos
- `GET /api/grupos` - Lista completa
- `GET /api/stats` - Estatísticas
- `POST /api/refresh` - Force refresh

### Gerenciador
- `GET /api/grupos-gerenciador?limit=50&offset=0&...`
- `GET /api/administradoras`
- `PUT /api/grupos/{id}` - Atualiza (inclui histórico)
- `DELETE /api/grupos/{id}?soft={true/false}`
- `POST /api/grupos/{id}/duplicar`
- `PATCH /api/grupos/{id}/status`
- `GET /api/grupos/{id}/auditoria`
- `POST /api/sync-sheets`

### Calculadora
- `GET /api/piperun/{id}`

### Importação
- `POST /api/importar/preview`
- `POST /api/importar/processar`

### Exportação
- `GET /api/exportar/completo`
- `GET /api/exportar/por-adm/{adm}`
- `GET /api/exportar/relatorio-adms`
- `GET /api/exportar/grupo/{id}`

**Veja detalhes em:** [`docs/FASE1_CONGELAMENTO_FRONTEND.md`](docs/FASE1_CONGELAMENTO_FRONTEND.md)

---

## 🔐 Variáveis de Ambiente

### Backend (Render) - PRIVADO ⚠️
```
PIPERUN_API_TOKEN=<token>
PIPERUN_BASE_URL=https://api.pipe.run/v1
GOOGLE_SHEETS_ID=1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
GOOGLE_SERVICE_ACCOUNT_JSON=<json>
ENVIRONMENT=production
CACHE_FORCE_REFRESH=true
```

### Frontend (Vercel) - PÚBLICO ✅
```
NEXT_PUBLIC_API_URL=https://crediclass.csrtecnologia.com.br
NEXT_PUBLIC_APP_NAME=Crediclass Dashboard Grupos
```

---

## 💡 DÚVIDAS?

1. **Como funciona um endpoint específico?**  
   → Veja [`docs/FASE1_CONGELAMENTO_FRONTEND.md`](docs/FASE1_CONGELAMENTO_FRONTEND.md)

2. **Preciso fazer uma alteração no frontend?**  
   → Contacte o time. Apenas correções críticas são permitidas.

3. **Quando começa a FASE 2?**  
   → Veja [`TUDO_SOBRE_CREDICLASS_REESTRUTURADO_STACK_v2.txt`](TUDO_SOBRE_CREDICLASS_REESTRUTURADO_STACK_v2.txt)

---

**Documentação criada:** 2026-05-28  
**Commit:** 9735091  
**Status:** ✅ FASE 1 - Documentação concluída
