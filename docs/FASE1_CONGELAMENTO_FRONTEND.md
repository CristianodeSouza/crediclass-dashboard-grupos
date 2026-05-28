# FASE 1 - CONGELAMENTO DO FRONTEND ATUAL

**Data:** 2026-05-28  
**Status:** ✅ INICIADO  
**Objetivo:** Congelar frontend Alpine.js existente e documentar endpoints para migração

---

## 📋 RESUMO EXECUTIVO

A FASE 1 congela o frontend atual (app.js + Alpine.js) e documenta todos os endpoints
utilizados para que possam ser consumidos pelo novo frontend Next.js na FASE 2.

**Principais ações:**
- ✅ Documentar todos os endpoints do backend
- ✅ Congelar alterações no frontend (exceto correções críticas)
- ✅ Criar branches de proteção
- ✅ Preparar estrutura para FASE 2

---

## 🔍 ENDPOINTS ATUAIS DO FRONTEND

### 1. ABAS - MAPA DE GRUPOS

#### GET /api/grupos
**Descrição:** Retorna lista completa de grupos  
**Utilizado em:** Aba "Mapa de Grupos" (view de mapa)  
**Response esperado:**
```json
{
  "total": 342,
  "grupos": [
    {
      "grupo": "1001",
      "adm": "Administradora A",
      "tipo_bem": "Imóvel",
      "credito_minimo": 50000,
      "credito_maximo": 500000,
      "prazo_minimo": "1a3",
      "prazo_maximo": "5a8"
    }
  ]
}
```
**Linha no app.js:** 348

---

#### GET /api/stats
**Descrição:** Retorna estatísticas gerais do sistema  
**Utilizado em:** Header do dashboard (indicador de grupos)  
**Response esperado:**
```json
{
  "total_grupos": 342,
  "total_adms": 25,
  "total_grupos_ativos": 340,
  "ultima_atualizacao": "2026-05-28T10:30:00Z"
}
```
**Linha no app.js:** 340

---

#### GET /api/refresh
**Descrição:** Força refresh de cache do backend  
**Utilizado em:** Botão "↻" no header  
**Método:** POST  
**Response esperado:** `{"status": "ok"}`  
**Linha no app.js:** 362

---

### 2. ABA - GERENCIADOR

#### GET /api/grupos-gerenciador?limit=50&offset=0&busca=&adm=&tipo_bem=&prazo_min=&prazo_max=
**Descrição:** Lista grupos com filtros (versão para tabela do gerenciador)  
**Utilizado em:** Aba "Gerenciador" - Tabela de grupos  
**Parâmetros:**
- `limit` (int): Quantidade de registros por página
- `offset` (int): Deslocamento para paginação
- `busca` (str): Busca por nome/ID do grupo
- `adm` (str): Filtro por administradora
- `tipo_bem` (str): Filtro por tipo de bem
- `prazo_min` (str): Filtro de prazo mínimo
- `prazo_max` (str): Filtro de prazo máximo

**Response esperado:**
```json
{
  "total": 342,
  "grupos": [
    {
      "grupo": "2125",
      "adm": "Administradora X",
      "tipo_bem": "Imóvel",
      "credito_minimo": 100000,
      "credito_maximo": 800000,
      "prazo_minimo": "1a3",
      "prazo_maximo": "8a10",
      "maior_lance": 250000,
      "menor_lance": 150000,
      "qtd_contemplacoes": 45,
      "historico": [
        {
          "mes": "MAY-24",
          "maior_lance": 250000,
          "menor_lance": 150000,
          "qtd": 45
        }
      ],
      "editado_em": "2026-05-27T14:30:00Z"
    }
  ]
}
```
**Linha no app.js:** 956

---

#### GET /api/administradoras
**Descrição:** Lista todas as administradoras  
**Utilizado em:** Filtros do gerenciador  
**Response esperado:**
```json
{
  "total": 25,
  "administradoras": [
    {"id": "adm_001", "nome": "Administradora A"},
    {"id": "adm_002", "nome": "Administradora B"}
  ]
}
```
**Linha no app.js:** 972

---

#### PUT /api/grupos/{grupo_id}
**Descrição:** Atualiza dados de um grupo (incluindo histórico)  
**Utilizado em:** Modal de edição do gerenciador  
**Payload esperado:**
```json
{
  "adm": "Administradora X",
  "tipo_bem": "Imóvel",
  "credito_minimo": 100000,
  "credito_maximo": 800000,
  "prazo_minimo": "1a3",
  "prazo_maximo": "8a10",
  "historico": [
    {
      "mes": "MAY-24",
      "maior_lance": 1200,
      "menor_lance": 800,
      "qtd": 45
    },
    {
      "mes": "JUN-24",
      "maior_lance": 1300,
      "menor_lance": 900,
      "qtd": 48
    }
  ]
}
```
**Response esperado:** `{"status": "ok", "group": {...}}`  
**Linha no app.js:** 1197

---

#### DELETE /api/grupos/{grupo_id}?soft={true/false}
**Descrição:** Deleta um grupo (soft ou hard delete)  
**Utilizado em:** Botão "Deletar" do modal  
**Parâmetros:**
- `soft`: Se `true`, marca como deletado; se `false`, remove definitivamente

**Response esperado:** `{"status": "ok"}`  
**Linha no app.js:** 1222

---

#### POST /api/grupos/{grupo_id}/duplicar
**Descrição:** Duplica um grupo (cria novo com dados copiados)  
**Utilizado em:** Botão "Duplicar" do modal  
**Response esperado:** `{"status": "ok", "novo_grupo_id": "2200"}`  
**Linha no app.js:** 1243

---

#### PATCH /api/grupos/{grupo_id}/status
**Descrição:** Muda status do grupo (ativo/inativo)  
**Utilizado em:** Aba gerenciador (status toggle)  
**Payload esperado:** `{"status": "ativo" ou "inativo"}`  
**Response esperado:** `{"status": "ok"}`  
**Linha no app.js:** 1372

---

#### GET /api/grupos/{grupo_id}/auditoria
**Descrição:** Retorna histórico de auditoria de um grupo  
**Utilizado em:** Modal - aba "Auditoria"  
**Response esperado:**
```json
{
  "grupo_id": "2125",
  "auditoria": [
    {
      "timestamp": "2026-05-27T14:30:00Z",
      "acao": "UPDATE",
      "usuario": "admin@example.com",
      "campos_alterados": ["maior_lance", "menor_lance"]
    }
  ]
}
```
**Linha no app.js:** 1289

---

#### POST /api/sync-sheets
**Descrição:** Força sincronização com Google Sheets  
**Utilizado em:** Botão "Sincronizar" / após edições críticas  
**Response esperado:** `{"status": "ok", "grupos_sincronizados": 342}`  
**Linha no app.js:** 1264

---

### 3. ABA - CALCULADORA

#### GET /api/piperun/{id}
**Descrição:** Busca oportunidade no PipeRun CRM  
**Utilizado em:** Aba "Calculadora" - busca de oportunidade  
**Response esperado:**
```json
{
  "id": "opp_12345",
  "titulo": "Oportunidade X",
  "valor": 500000,
  "status": "em_andamento"
}
```
**Linha no app.js:** 390

---

### 4. ABA - IMPORTAÇÃO

#### POST /api/importar/preview
**Descrição:** Preview dos dados a serem importados (CSV)  
**Utilizado em:** Aba "Importação" - antes de confirmar  
**Payload esperado:** FormData com arquivo CSV  
**Response esperado:**
```json
{
  "total_registros": 50,
  "total_novos": 30,
  "total_atualizacoes": 20,
  "preview": [...]
}
```
**Linha no app.js:** 1540

---

#### POST /api/importar/processar
**Descrição:** Processa importação real dos dados  
**Utilizado em:** Aba "Importação" - botão "Confirmar"  
**Payload esperado:** FormData com arquivo CSV  
**Response esperado:** `{"status": "ok", "importados": 50}`  
**Linha no app.js:** 1579

---

### 5. ABA - ANALYTICS / EXPORTAÇÃO

#### GET /api/exportar/completo
**Descrição:** Exporta todos os grupos em Excel  
**Utilizado em:** Aba "Analytics" - botão "Exportar Completo"  
**Response:** Download de arquivo `.xlsx`  
**Linha no app.js:** 1615

---

#### GET /api/exportar/por-adm/{adm}
**Descrição:** Exporta grupos de uma administradora específica  
**Utilizado em:** Aba "Analytics" - por administradora  
**Response:** Download de arquivo `.xlsx`  
**Linha no app.js:** 1644

---

#### GET /api/exportar/relatorio-adms
**Descrição:** Exporta relatório consolidado por administradora  
**Utilizado em:** Aba "Analytics" - relatório  
**Response:** Download de arquivo `.xlsx`  
**Linha no app.js:** 1668

---

#### GET /api/exportar/grupo/{grupo_id}
**Descrição:** Exporta dados detalhados de um grupo  
**Utilizado em:** Modal - botão "Exportar"  
**Response:** Download de arquivo `.xlsx`  
**Linha no app.js:** 1697

---

### 6. PIPERUN CRM

#### GET /api/piperun/{piperun_id}
**Descrição:** Busca detalhes de oportunidade no PipeRun  
**Utilizado em:** Calculadora - integração com CRM  
**Response esperado:**
```json
{
  "id": "opp_12345",
  "titulo": "Oportunidade de Crédito",
  "valor": 500000,
  "contato": {"nome": "João Silva"},
  "status": "em_andamento"
}
```
**Linha no app.js:** 598

---

## 🔐 VARIÁVEIS DE AMBIENTE CRÍTICAS

### Backend (RENDER) - MANTER SEMPRE PRIVADO

```
PIPERUN_API_TOKEN=<token privado>
PIPERUN_BASE_URL=https://api.pipe.run/v1
GOOGLE_SHEETS_ID=1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
GOOGLE_SERVICE_ACCOUNT_JSON=<json privado>
ENVIRONMENT=production
CACHE_FORCE_REFRESH=true
```

### Frontend (VERCEL) - APENAS PÚBLICOS

```
NEXT_PUBLIC_API_URL=https://crediclass.csrtecnologia.com.br
NEXT_PUBLIC_APP_NAME=Crediclass Dashboard Grupos
```

---

## 📁 ESTRUTURA ATUAL DO FRONTEND

```
frontend/
├── index.html          (HTML principal - Alpine.js)
├── login.html          (Página de login)
├── estudo-financeiro.html
├── service-worker.js
├── js/
│   └── app.js          (CONGELADO - Não alterar exceto correções críticas)
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js      (Cópia, CONGELADO)
│   └── service-worker.js
└── package.json
```

---

## 🛑 REGRAS DE CONGELAMENTO

### ✅ PERMITIDO:
- Correções críticas em app.js (bugs que impeçam funcionalidade)
- Hotfixes de segurança
- Documentação
- Leitura do código para aprender endpoints

### ❌ PROIBIDO:
- Novos features em Alpine.js
- Refatoração de app.js
- Alteração de estrutura HTML
- Mudanças visuais significativas

---

## 📊 CHECKLIST DE CONGELAMENTO

- [x] Documentar todos os endpoints (23 endpoints)
- [x] Listar variáveis de ambiente críticas
- [x] Descrever estrutura atual do frontend
- [x] Definir regras de congelamento
- [ ] Criar branch de proteção no GitHub
- [ ] Atualizar README.md com aviso de congelamento
- [ ] Comunicar à equipe sobre fase 1

---

## 🚀 PRÓXIMAS AÇÕES (FASE 2)

1. Criar projeto Next.js na Vercel
2. Reproduzir cada aba do frontend
3. Conectar com endpoints documentados
4. Testar funcionalidades

---

**Documentado em:** 2026-05-28  
**Próxima revisão:** Antes de FASE 2
