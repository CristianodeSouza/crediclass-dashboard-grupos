# 📊 Gerenciador de Grupos - 3ª Aba

**Status:** 🟡 Planejamento  
**Versão:** v0.4.0  
**Data de Criação:** 2026-05-18  
**Prioridade:** 🔴 ALTA  
**Prazo Estimado:** 7-9 dias (FASE 1 + FASE 2 + FASE 3)

---

## 📋 Visão Geral

A **3ª Aba "Gerenciador de Grupos"** é uma interface de **CRUD completo** que permite operadores humanos **consultar, editar, criar e sincronizar dados dos grupos de consórcios** diretamente na dashboard, sem precisar acessar a planilha Google Sheets manualmente.

### Objetivo
- ✅ Operador visualiza dados de grupos por administradora
- ✅ Operador edita informações incorretas ou desatualizadas
- ✅ Operador adiciona/duplica/deleta grupos
- ✅ Alterações sincronizam **automaticamente** com Google Sheets
- ✅ Histórico completo de quem editou o quê e quando

### Dados Fonte
- **Origem:** Planilha `Mapa de Grupos 3.0 Novo 2026 Cristiano.xlsx` (Google Sheets)
- **URL:** https://docs.google.com/spreadsheets/d/1_AcI6kFekvHnbqx3UArkyGBVt7R8gcg9/edit
- **Sincronização:** Backend atualiza `data/grupos.json` via Google Sheets API v4

---

## 🎯 Escopo Consolidado

### Funcionalidades Prioritárias

#### **1️⃣ CONSULTA & VISUALIZAÇÃO DE DADOS**
- [x] Tabela completa de grupos com colunas principais
- [x] Filtro por Administradora (ITAÚ, CNP, CAOA, PORTO, EMBRACON, RODOBENS)
- [x] Busca por ID do grupo
- [x] Visualização detalhada em modal/drawer (sem editar)
- [x] Filtros avançados (faixa crédito, taxa ADM, status, etc.)

#### **2️⃣ EDIÇÃO & ATUALIZAÇÃO DE DADOS**
- [x] Botão "Editar" abre modal com todos os campos
- [x] Validação em tempo real (ranges, tipos, obrigatórios)
- [x] Confirmação antes de salvar
- [x] Feedback visual (toast/notificação)
- [x] Histórico: registra quem editou, quando, o que mudou

#### **3️⃣ GERENCIAMENTO DE REGISTROS (CRUD)**
- [x] **Create:** Adicionar novo grupo (formulário pré-preenchido)
- [x] **Read:** Visualizar lista + detalhes
- [x] **Update:** Editar campos existentes
- [x] **Delete:** Deletar ou marcar como inativo
- [x] **Duplicar:** Clonar grupo existente com novo ID
- [x] **Ativar/Desativar:** Flag de status

#### **4️⃣ SINCRONIZAÇÃO COM GOOGLE SHEETS**
- [x] Botão "Sincronizar com Sheets" (push alterações)
- [x] Botão "Recarregar Dados" (pull dados frescos)
- [x] Indicador de status (✅ Sincronizado / ⏳ Pendente / ❌ Erro)
- [x] Histórico de sincronizações com timestamp
- [x] Auto-update de `grupos.json` após sincronizar

#### **5️⃣ FILTROS & BUSCAS INTELIGENTES**
- [x] Multi-filtro combinável (ADM + Crédito + Taxa + Status)
- [x] Ordenação por coluna (clicável no header)
- [x] Busca full-text por ID ou nome
- [x] Auto-filtrar ao mudar (sem need de botão "Pesquisar")
- [x] Botão "Limpar Filtros"

#### **9️⃣ UX/UI AMIGÁVEL**
- [x] Tabela responsiva (horizontal scroll em mobile)
- [x] Modal limpo com validação visual
- [x] Breadcrumb/Navegação clara
- [x] Confirmações antes de ações destrutivas
- [x] Toasts de sucesso/erro
- [x] Ícones e cores consistentes com design system

---

## 🏗️ Arquitetura Proposta

### Frontend (3ª Aba - `frontend/index.html` + `frontend/js/app.js`)

```
ABA "GERENCIADOR DE GRUPOS"
│
├── 🔍 BARRA DE FILTROS (Topo)
│   ├── Select: Administradora (ITAÚ, CNP, CAOA, PORTO, EMBRACON, RODOBENS)
│   ├── Input: Busca por ID
│   ├── Range Slider: Faixa de Crédito (Min - Max)
│   ├── Select: Status (Ativo / Inativo / Todos)
│   └── Botão: Limpar Filtros
│
├── 📊 TABELA DE GRUPOS
│   ├── Coluna: Adm.
│   ├── Coluna: ID Grupo
│   ├── Coluna: Menor Crédito
│   ├── Coluna: Maior Crédito
│   ├── Coluna: Taxa ADM
│   ├── Coluna: Status (badge verde/vermelho)
│   ├── Coluna: Ações (botões Editar, Duplicar, Deletar)
│   ├── Linhas clicáveis → Expandir detalhes completos
│   ├── Ordenação clicável no header
│   └── Pagination / Lazy Load
│
├── ➕ BOTÃO AÇÕES RÁPIDAS (Barra lateral)
│   ├── "+ Novo Grupo"
│   ├── "Sincronizar Agora"
│   └── "Recarregar Dados"
│
├── 🔄 STATUS DE SINCRONIZAÇÃO (Card Info)
│   ├── Último sincronizado: [timestamp]
│   ├── Status: ✅ Sincronizado / ⏳ Pendente (X alterações)
│   ├── Botão: "Sincronizar com Sheets"
│   └── Botão: "Recarregar Dados"
│
├── 📝 MODAIS / DRAWERS
│   ├── Modal Editar Grupo
│   │   ├── Formulário com todos os campos
│   │   ├── Validação em tempo real
│   │   ├── Mostrar "Editado por X em Y"
│   │   └── Botões: Cancelar, Salvar
│   │
│   ├── Modal Adicionar Novo Grupo
│   │   ├── Formulário vazio ou com defaults
│   │   ├── Mesmo layout do Editar
│   │   └── Botões: Cancelar, Criar
│   │
│   ├── Modal Duplicar Grupo
│   │   ├── Copia dados do grupo selecionado
│   │   ├── Permite editar antes de salvar
│   │   └── Botões: Cancelar, Duplicar
│   │
│   └── Dialog Confirmação (Deletar/Desativar)
│       ├── "Tem certeza que deseja deletar?"
│       ├── Radio: Deletar vs. Marcar como inativo
│       └── Botões: Cancelar, Confirmar
│
├── 📋 LOG DE AUDITORIA (Collapse/Expand)
│   ├── Mostra últimas edições
│   ├── "Cristiano editou Grupo 126 em 18/05 14:30 (Taxa: 24% → 20%)"
│   ├── Expandir para ver mais
│   └── Ordenado por data (mais recente primeiro)
│
└── 🚨 TRATAMENTO DE ERROS
    ├── Toast: "Erro ao salvar: [mensagem]"
    ├── Retry automático ou manual
    └── Offline detection
```

### Backend (Novos Endpoints - `backend/main.py`)

```python
# GET - Listar grupos com filtros
GET /api/grupos-gerenciador
  Params:
    - adm: str (ITAÚ, CNP, etc.)
    - status: str (ativo, inativo, todos)
    - credito_min: float
    - credito_max: float
    - search: str (busca por ID)
    - page: int
    - limit: int
    - sort_by: str (coluna)
    - order: str (asc, desc)
  Response: { grupos: [...], total: N, page: X, limit: Y }

# POST - Criar novo grupo
POST /api/grupos
  Body: { adm, grupo, menor_credito, maior_credito, taxa_adm, ... }
  Response: { id, mensagem: "Grupo criado com sucesso" }
  Log Auditoria: Quem criou, quando, valores

# PUT - Editar grupo existente
PUT /api/grupos/{id}
  Body: { campo: novo_valor, ... }
  Response: { id, mensagem: "Atualizado com sucesso" }
  Log Auditoria: Quem editou, quando, mudanças (old → new)
  Validação: ranges, tipos, obrigatórios

# DELETE - Deletar grupo
DELETE /api/grupos/{id}
  Query: ?soft=true (marcar inativo) ou ?soft=false (hard delete)
  Response: { mensagem: "Grupo deletado" }
  Log Auditoria: Quem deletou, quando

# PATCH - Ativar/Desativar grupo
PATCH /api/grupos/{id}/status
  Body: { status: "ativo" | "inativo" }
  Response: { id, status, mensagem: "Status atualizado" }
  Log Auditoria: Mudança de status

# POST - Duplicar grupo
POST /api/grupos/{id}/duplicar
  Body: { novo_id: XYZ (opcional, se não gera automaticamente) }
  Response: { id, mensagem: "Grupo duplicado com sucesso" }
  Log Auditoria: Clonado de ID original

# POST - Sincronizar alterações → Google Sheets
POST /api/sync-sheets
  Body: (vazio — detecta alterações locais em cache)
  Response: { 
    sucesso: true,
    grupos_sincronizados: N,
    timestamp: "2026-05-18T14:30:00Z",
    mensagem: "Sincronização concluída"
  }
  Ação: Atualiza planilha via Google Sheets API

# POST - Recarregar dados → Google Sheets
POST /api/reload-sheets
  Body: (vazio)
  Response: {
    sucesso: true,
    grupos_carregados: N,
    timestamp: "2026-05-18T14:30:00Z",
    mensagem: "Dados recarregados"
  }
  Ação: Puxa dados frescos, atualiza grupos.json

# GET - Auditoria de um grupo
GET /api/grupos/{id}/auditoria
  Response: {
    grupo_id: 126,
    edições: [
      {
        usuario: "Cristiano",
        timestamp: "2026-05-18T14:30:00Z",
        acao: "editou",
        mudancas: { taxa_adm: { old: 24, new: 20 } }
      },
      ...
    ]
  }
```

### Database / Cache

```
data/grupos.json (LOCAL CACHE)
├── Atualizado via Google Sheets API
├── Estrutura: { grupos: [...], ultima_sincronizacao: "...", ... }
└── Usa: backend/sheets.py → GoogleSheetsAPI

backend/sheets.py (EXPANSÃO)
├── Função existente: fetch_grupos()
├── Funções novas:
│   ├── criar_grupo(dados)
│   ├── atualizar_grupo(id, dados)
│   ├── deletar_grupo(id, soft=true)
│   ├── duplicar_grupo(id)
│   ├── sincronizar_sheets(alterações)
│   └── recarregar_sheets()
└── Log de auditoria em arquivo separado ou cache
```

---

## 📋 Lista de Tarefas por Fase

### **FASE 1: Backend Essencial** (2-3 dias)

**Arquivo:** `backend/main.py` + `backend/sheets.py`

- [ ] **Endpoint GET `/api/grupos-gerenciador`** com filtros
  - [ ] Filtrar por: adm, status, faixa crédito, busca ID
  - [ ] Suportar pagination (page, limit)
  - [ ] Suportar ordenação (sort_by, order)
  - [ ] Retornar: { grupos: [...], total: N }

- [ ] **Endpoint POST `/api/grupos`** - Criar novo grupo
  - [ ] Validar campos obrigatórios (adm, grupo, creditos, taxa)
  - [ ] Gerar ID único automaticamente
  - [ ] Registrar log de auditoria (quem, quando, valores)
  - [ ] Atualizar Google Sheets
  - [ ] Return: { id, mensagem }

- [ ] **Endpoint PUT `/api/grupos/{id}`** - Editar grupo
  - [ ] Validar campos (ranges, tipos, obrigatórios)
  - [ ] Detectar mudanças (old vs. new)
  - [ ] Log de auditoria detalhado (quem, quando, mudanças)
  - [ ] Sincronizar com Google Sheets
  - [ ] Return: { id, sucesso }

- [ ] **Endpoint DELETE `/api/grupos/{id}`** - Deletar
  - [ ] Suportar soft delete (marcar inativo) e hard delete
  - [ ] Log de auditoria (quem, quando)
  - [ ] Atualizar Google Sheets

- [ ] **Endpoint PATCH `/api/grupos/{id}/status`** - Ativar/Desativar
  - [ ] Muda flag `status` (ativo/inativo)
  - [ ] Log de auditoria
  - [ ] Return: { id, status }

- [ ] **Endpoint POST `/api/grupos/{id}/duplicar`** - Clonar
  - [ ] Copia todos os campos de um grupo
  - [ ] Gera novo ID automaticamente
  - [ ] Log de auditoria (clonado de ID X)
  - [ ] Return: { novo_id, mensagem }

- [ ] **Endpoint POST `/api/sync-sheets`** - Sincronizar → Google Sheets
  - [ ] Detecta alterações em cache local
  - [ ] Atualiza linhas na planilha Google
  - [ ] Log de sincronização (timestamp, qtde registros)
  - [ ] Return: { sucesso, grupos_sincronizados, timestamp }

- [ ] **Endpoint POST `/api/reload-sheets`** - Recarregar dados
  - [ ] Puxa dados frescos da Google Sheets
  - [ ] Atualiza `grupos.json`
  - [ ] Log de sincronização
  - [ ] Return: { sucesso, grupos_carregados, timestamp }

- [ ] **Endpoint GET `/api/grupos/{id}/auditoria`** - Log de edições
  - [ ] Retorna quem editou, quando, o que mudou
  - [ ] Ordenado por data (mais recente primeiro)
  - [ ] Return: { grupo_id, edições: [...] }

- [ ] **Função auxiliar: Validação de campos**
  - [ ] Verificar ranges (ex: taxa ADM 15-30%)
  - [ ] Verificar tipos (ex: creditos são floats)
  - [ ] Verificar obrigatórios
  - [ ] Retornar lista de erros se houver

- [ ] **Sistema de Auditoria**
  - [ ] Arquivo ou tabela para registrar: usuario, timestamp, acao, mudancas
  - [ ] Integrar em todos os endpoints (POST, PUT, DELETE, PATCH)

---

### **FASE 2: Frontend - 3ª Aba** (3-4 dias)

**Arquivo:** `frontend/index.html` + `frontend/js/app.js`

**HTML:**
- [ ] Adicionar botão na nav: `<button @click="abaAtiva = 'gerenciador'">📊 Gerenciador</button>`
- [ ] Estrutura HTML da aba (div com `@show="abaAtiva === 'gerenciador'"`)

**JavaScript (Alpine.js):**
- [ ] **Dados:** Array `grupos`, objeto `filtros`, estado `sincronizando`
- [ ] **Funções de Consulta:**
  - [ ] `carregarGrupos()` — GET `/api/grupos-gerenciador` com filtros
  - [ ] `buscarGrupo(id)` — busca um grupo específico
  - [ ] `abrirDetalhes(grupo)` — abre modal com dados completos

- [ ] **Funções de CRUD:**
  - [ ] `abrirModalCriar()` — abre form novo grupo
  - [ ] `criarGrupo(dados)` — POST `/api/grupos`
  - [ ] `abrirModalEditar(grupo)` — abre form com dados existentes
  - [ ] `salvarEdicao(id, dados)` — PUT `/api/grupos/{id}`
  - [ ] `abrirConfirmacaoDeletar(grupo)` — dialog confirma
  - [ ] `deletarGrupo(id, soft)` — DELETE `/api/grupos/{id}`
  - [ ] `duplicarGrupo(id)` — POST `/api/grupos/{id}/duplicar`
  - [ ] `mudarStatus(id, status)` — PATCH `/api/grupos/{id}/status`

- [ ] **Funções de Filtro:**
  - [ ] `aplicarFiltros()` — triggered quando mudar qualquer filtro
  - [ ] `limparFiltros()` — reseta todos os filtros
  - [ ] `atualizarOrdenacao(coluna)` — sort by clicável

- [ ] **Funções de Sincronização:**
  - [ ] `sincronizarComSheets()` — POST `/api/sync-sheets`
  - [ ] `recarregarDados()` — POST `/api/reload-sheets`
  - [ ] `atualizarStatusSincronizacao()` — mostra status

- [ ] **Validação Frontend:**
  - [ ] Validar campos obrigatórios (visual)
  - [ ] Validar ranges (ex: Taxa 15-30%)
  - [ ] Validar tipos (creditos são números)
  - [ ] Mostrar erros inline no form

- [ ] **UI Components:**
  - [ ] Tabela com Alpine `@click="carregarGrupos()"` on mount
  - [ ] Barra de filtros (Select, Input, RangeSlider, Select)
  - [ ] Modal Editar (form com validação)
  - [ ] Modal Criar (form vazio com defaults)
  - [ ] Modal Duplicar (form pré-preenchido)
  - [ ] Dialog Deletar (confirmação)
  - [ ] Card Status Sincronização (com spinner)
  - [ ] Log Auditoria (collapse/expand)

- [ ] **Tratamento de Erros:**
  - [ ] Função `mostrarErro(mensagem)` — toast/notificação
  - [ ] Função `mostrarSucesso(mensagem)` — toast/notificação
  - [ ] Retry automático ou botão retry em caso de erro
  - [ ] Offline detection (alerta se sem conexão)

- [ ] **Responsividade:**
  - [ ] Tabela horizontal scroll em mobile
  - [ ] Modais fullscreen em mobile (sem scroll quebrado)
  - [ ] Botões e inputs com tamanho tátil (>44px)
  - [ ] Filtros empilhados verticalmente em mobile

---

### **FASE 3: Testes & Refinamento** (2 dias)

**Testes Manuais:**
- [ ] Carregar tabela com filtros (adm, crédito, status)
- [ ] Editar um grupo (alterar taxa, creditos, etc.)
- [ ] Criar novo grupo
- [ ] Duplicar grupo
- [ ] Deletar/Desativar grupo
- [ ] Sincronizar com Sheets (verificar planilha foi atualizada)
- [ ] Recarregar dados (verify grupos atualizados se alterado externamente)
- [ ] Histórico de auditoria (mostrar quem editou o quê)
- [ ] Validação (tentar salvar com dados inválidos)
- [ ] Offline (desligar internet, tentar operação, reconnect)

**Testes Responsividade:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x812)

**Performance:**
- [ ] Carregar 1000+ grupos não deve travar
- [ ] Filtros executam < 1 segundo
- [ ] Sincronização < 3 segundos

**Edge Cases:**
- [ ] 2 operadores editam mesmo grupo (avisar?)
- [ ] Editar enquanto sincronizando
- [ ] Deletar grupo enquanto outro operador tá editando
- [ ] Internet cai durante sincronização

---

## 🔧 Stack Técnico

| Componente | Tecnologia | Arquivo |
|------------|-----------|---------|
| **Frontend** | Alpine.js | `frontend/js/app.js` |
| **HTML** | Estrutura aba | `frontend/index.html` |
| **Styling** | TailwindCSS | `frontend/css/style.css` |
| **Backend** | FastAPI (Python 3.11) | `backend/main.py` |
| **Data Access** | Google Sheets API v4 | `backend/sheets.py` |
| **Cache** | JSON local | `data/grupos.json` |
| **Validação Backend** | Pydantic | `backend/main.py` |
| **Validação Frontend** | JavaScript + HTML5 | `frontend/js/app.js` |
| **Log de Auditoria** | JSON ou arquivo txt | `data/auditoria.json` |

---

## ⏱️ Estimativa de Esforço

| Fase | Tarefas | Estimativa | Status |
|------|---------|-----------|--------|
| 1 | Backend (9 endpoints + validação) | 2-3 dias | ⏳ TODO |
| 2 | Frontend (8+ componentes) | 3-4 dias | ⏳ TODO |
| 3 | Testes, QA, refinamento | 2 dias | ⏳ TODO |
| **TOTAL** | **Gerenciador de Grupos** | **7-9 dias** | — |

---

## 🚀 Roadmap de Implementação

### Timeline Proposta

```
Semana de 2026-05-20 a 2026-05-24
├── 2026-05-20 (Seg-Ter) — FASE 1: Backend
│   └── Endpoints + Validação + Auditoria pronto
├── 2026-05-22 (Qua-Qui) — FASE 2: Frontend
│   └── UI + Modais + Filtros pronto
└── 2026-05-24 (Sex) — FASE 3: Testes
    └── QA manual, edge cases, deploy candidato

Resultado esperado: 2026-05-24 (Sexta)
├── MVP completo e testado
├── Documentação de usuário (manual operador)
└── Pronto para deploy em produção

```

---

## 📚 Integração com Outras Features

### Impacto na Calculadora (2ª Aba)
- ✅ Usa dados de `grupos.json` que é atualizado pelo Gerenciador
- ✅ Se operador edita grupo no Gerenciador, próxima simulação usa dados novos
- ✅ Sem breaking changes na Calculadora

### Impacto na Busca Piperun
- ✅ Operador pode editar grupo DEPOIS de buscar Piperun
- ✅ Fluxo: Busca Piperun → Calcula → Se grupo errado, edita no Gerenciador → Recalcula

### Impacto no PDF Generator (TODO)
- ✅ Pdf é gerado com dados mais atualizados (do Gerenciador)
- ✅ Sem impacto, apenas benefício

---

## 🔐 Considerações de Segurança

### Autenticação
- [ ] Verificar se usuário está logado (implementar se necessário)
- [ ] Tokens JWT ou Sessions

### Autorização
- [ ] Apenas operadores autorizados podem editar
- [ ] Audit trail completo (quem fez o quê)

### Validação
- [ ] Validar entrada (backend + frontend)
- [ ] Sanitizar dados antes de salvar em Sheets
- [ ] Verificar ranges e tipos

### Sincronização Google Sheets
- [ ] Usar credenciais seguras (service account)
- [ ] Logs de erros (mas sem expor senhas)
- [ ] Retry com backoff exponencial

---

## 📖 Documentação Adicional Necessária

- [ ] **Manual do Operador** — Como usar o Gerenciador
- [ ] **Guia de Validação** — Quais campos são obrigatórios, ranges, etc.
- [ ] **Guia de Sincronização** — Como funciona o push/pull
- [ ] **Troubleshooting** — Erros comuns e soluções

---

## 🔗 Referências & Documentação Relacionada

- [ROADMAP.md](ROADMAP.md) — Roadmap geral do projeto
- [FEATURES.md](FEATURES.md) — Detalhes técnicos das outras features
- [HISTORICO.md](HISTORICO.md) — Histórico de mudanças
- [ARQUITETURA_TECNICA.md](ARQUITETURA_TECNICA.md) — Arquitetura geral
- [QUICK_START.md](QUICK_START.md) — Setup do projeto

---

## ✅ Checklist de Pronto para Deploy

- [ ] Todos os endpoints implementados e testados
- [ ] Frontend responsivo (desktop + tablet + mobile)
- [ ] Validação funcionando (frontend + backend)
- [ ] Sincronização com Sheets funciona
- [ ] Auditoria registra corretamente
- [ ] Testes manuais 10+ casos ✓
- [ ] Sem erros em console (frontend + backend)
- [ ] Performance OK (< 2s para carregar 1000 grupos)
- [ ] Manual do operador escrito
- [ ] Deploy em staging testado
- [ ] Pronto para produção ✅

---

**Próximo passo:** Iniciar FASE 1 (Backend) — 2026-05-20

