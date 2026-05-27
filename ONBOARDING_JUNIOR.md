# 🚀 ONBOARDING JUNIOR - CREDICLASS DASHBOARD GRUPOS

**Bem-vindo ao time!** Este guia te ajuda a rodar o projeto em 15 minutos e começar a contribuir.

---

## ⏱️ SETUP EM 15 MINUTOS

### 1. Clonar o Repositório (2 min)

```bash
cd C:\Users\User
git clone https://github.com/CristianodeSouza/crediclass-dashboard-grupos.git
cd crediclass-dashboard-grupos
```

### 2. Instalar Dependências (5 min)

```bash
# Criar venv (opcional, mas recomendado)
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows PowerShell

# Instalar requirements
pip install -r requirements.txt
```

**Dependências principais:**
- `fastapi` — backend HTTP
- `google-auth-oauthlib` — autenticação Google Sheets
- `requests` — chamadas HTTP (Piperun)
- `uvicorn` — servidor ASGI

### 3. Configurar Credenciais (3 min)

**Google Sheets:**
1. Arquivo: `backend/credenciais_google.json` (já deve existir)
2. Se não existir, pedir ao Cristiano ou ao adm do projeto

**Piperun Token:**
1. Criar arquivo `backend/.env`
2. Adicionar: `PIPERUN_TOKEN=db120d1ef2e5c7dec30e8bacbfd307ae`

### 4. Rodar Localmente (5 min)

```bash
# Terminal 1 — Backend
cd C:\Users\User\crediclass-dashboard-grupos
python main.py
# → Backend rodando em http://localhost:8000

# Terminal 2 — Navegador (não precisa iniciar nada)
# Acesse http://localhost:8000
# Login: adm / cristiano
```

**Esperado:**
- ✅ Dashboard carrega com 5 abas
- ✅ Dados aparecem na aba "Mapa de Grupos"
- ✅ Calculadora funciona (clica no botão "Executar Cálculo")
- ✅ Sem erros vermelhos no console do navegador (F12)

---

## 📁 ESTRUTURA DE PASTAS — QUAL ARQUIVO EDITAR PARA QUÊ?

```
crediclass-dashboard-grupos/
│
├── main.py ⭐ ENTRY POINT
│   └─ Inicializa FastAPI, registra rotas, serve frontend
│
├── backend/
│   ├── sheets.py 📊 Google Sheets
│   │   ├─ fetch_grupos()      # Busca grupos da planilha
│   │   ├─ sincronizar_grupo() # Escreve grupo na planilha
│   │   └─ build_history()     # Monta histórico 36 meses
│   │
│   ├── piperun.py 🔗 Piperun CRM
│   │   ├─ fetch_oportunidade()  # Busca deal no CRM
│   │   └─ FIELD_MAP            # Mapeamento de campos
│   │
│   ├── calculadora.py 🧮 LÓGICA FINANCEIRA
│   │   ├─ calcular_score()
│   │   ├─ calcular_lance_esperado()
│   │   └─ calcular_viabilidade()
│   │
│   ├── models.py 📋 Estrutura de Dados
│   │   ├─ class Grupo        # Pydantic model
│   │   ├─ class AuditoriaEntry
│   │   └─ class SimulacaoRequest
│   │
│   ├── rotas.py 🌐 ENDPOINTS (29+ rotas)
│   │   ├─ GET  /api/grupos
│   │   ├─ POST /api/grupos
│   │   ├─ PUT  /api/grupos/{id}
│   │   ├─ DELETE /api/grupos/{id}
│   │   ├─ POST /api/teste-calculadora
│   │   ├─ GET  /api/piperun/{deal_id}
│   │   └─ POST /api/importar/excel
│   │
│   ├── validacoes.py ✅ Validação de Dados
│   │   ├─ validar_grupo()
│   │   ├─ validar_crédito()
│   │   └─ validar_prazo()
│   │
│   └── requirements.txt 📦 Dependências
│
├── frontend/
│   ├── index.html 📄 INTERFACE PRINCIPAL
│   │   ├─ <div x-data="dashboard()"> Alpine.js
│   │   ├─ 5 abas (Mapa, Calculadora, Gerenciador, Import/Export, Analytics)
│   │   └─ <script src="/static/js/app.js" defer></script>
│   │
│   ├── js/
│   │   └── app.js 🎨 LÓGICA FRONTEND
│   │       ├─ function dashboard()  # Componente Alpine
│   │       ├─ function init()       # Inicialização
│   │       ├─ async function buscarGrupos()
│   │       ├─ async function criarGrupo()
│   │       ├─ async function executarCalculadora()
│   │       └─ mostrarGraficos()     # Chart.js
│   │
│   ├── css/
│   │   └── style.css 🎨 Estilos Tailwind
│   │
│   └── static/
│       ├── js/
│       │   └── charts.js # Gráficos (Chart.js)
│       └── data/
│           └── grupos.json # Cache local
│
├── data/
│   ├── grupos.json 💾 CACHE LOCAL (~1.8K grupos)
│   ├── auditoria.json 📝 Log de alterações
│   └── sync_queue.json 🔄 Fila de sync
│
├── docs/
│   ├── ROADMAP.md 🗺️ Tarefas e datas
│   ├── FEATURES.md 📋 Features com status
│   ├── QUICK_START.md 🏃 Setup detalhado
│   └── HISTORICO.md 📜 Histórico de mudanças
│
├── tests/ (futuro)
│   ├── test_sheets.py
│   ├── test_calculadora.py
│   └── test_rotas.py
│
├── CLAUDE.md ❓ Guia geral do projeto
├── Dockerfile 🐳 Deploy Render
├── render.yaml 🚀 Configuração Render
└── ONBOARDING_JUNIOR.md 👈 VOCÊ ESTÁ AQUI
```

### 🎯 Exemplos Práticos: "Preciso editar X, onde fico?"

| Tarefa | Arquivo | Função | Exemplo |
|--------|---------|--------|---------|
| Adicionar novo campo no grupo | `backend/models.py` | `class Grupo` | `novo_campo: str` |
| Mudar fórmula de cálculo | `backend/calculadora.py` | `calcular_score()` | Alterar peso % |
| Adicionar aba nova | `frontend/index.html` | `<div x-show="tab == 'nova'">` | HTML + Alpine |
| Novo botão na aba | `frontend/index.html` + `app.js` | `<button @click="...">` + função | Bind evento |
| Nova rota API | `backend/rotas.py` | `@app.post("/api/...")` | Adicionar endpoint |
| Bugfix em validação | `backend/validacoes.py` | `validar_grupo()` | Corrigir regra |
| Mudar estilo de botão | `frontend/css/style.css` | Classes Tailwind | `class="bg-blue-500"` |

---

## 🏗️ ARQUITETURA VISUAL (5 MIN)

### Fluxo de uma Ação do Usuário

```
USUÁRIO NA ABA CALCULADORA
           ↓
        (clica em "Executar Cálculo")
           ↓
    [FRONTEND - app.js]
    async function executarCalculadora() {
      const req = {
        credito: 50000,
        prazo: 120,
        ...
      }
      const resp = await fetch('/api/teste-calculadora', {
        method: 'POST',
        body: JSON.stringify(req)
      })
    }
           ↓
    [HTTP POST] → /api/teste-calculadora
           ↓
    [BACKEND - rotas.py]
    @app.post("/api/teste-calculadora")
    async def teste_calculadora(req: SimulacaoRequest):
      resultado = calcular_simulacao(req)
      return resultado
           ↓
    [BACKEND - calculadora.py]
    def calcular_simulacao(req):
      score = calcular_score(req)
      lance = calcular_lance_esperado(req)
      viabilidade = calcular_viabilidade(score)
      return {score, lance, viabilidade}
           ↓
    [Retorna JSON] ← HTTP 200
           ↓
    [FRONTEND - app.js]
    Recebe resposta, atualiza variáveis Alpine
    resultado.score = 85
    resultado.lances = [...]
           ↓
    [Alpine.js] Renderiza com reatividade
    <div x-text="resultado.score">
    Mostra "85" automaticamente
           ↓
    USUÁRIO VÊ O RESULTADO NA TELA
```

### Camadas da Aplicação

```
┌─────────────────────────────────────┐
│  INTERFACE (Frontend)               │
│  - index.html (5 abas)              │
│  - app.js (lógica Alpine.js)        │
│  - style.css (Tailwind)             │
│  - charts.js (Chart.js)             │
└────────────────────┬────────────────┘
                     ↓ HTTP
┌─────────────────────────────────────┐
│  API (Backend - FastAPI)            │
│  - rotas.py (29+ endpoints)         │
│  - models.py (validação)            │
│  - validacoes.py (regras)           │
└────────────────┬─────────┬──────────┘
                 ↓         ↓
        ┌─────────────┐  ┌──────────────┐
        │  Sheets API │  │ Piperun CRM  │
        │ (Google)    │  │ (integração) │
        └─────────────┘  └──────────────┘
                 ↓         ↓
┌─────────────────────────────────────┐
│  DATA LAYER (Persistência)          │
│  - data/grupos.json (cache local)   │
│  - Google Sheets (source of truth)  │
│  - auditoria.json (log)             │
└─────────────────────────────────────┘
```

---

## 📚 PADRÕES DE CÓDIGO COM EXEMPLOS

### 1. Adicionar um Novo Campo no Grupo

**ANTES:** Grupo tem 156 campos
**OBJETIVO:** Adicionar campo `novo_campo_teste: str`

**Passo 1:** Editar `backend/models.py`

```python
from pydantic import BaseModel

class Grupo(BaseModel):
    id: str
    nome: str
    administradora: str
    valor_credito: float
    # ... outros 153 campos ...
    
    # ✅ NOVO CAMPO AQUI
    novo_campo_teste: str = "valor_padrão"
    
    class Config:
        from_attributes = True  # Para converter ORM → Pydantic
```

**Passo 2:** Atualizar `data/grupos.json` (adicionar campo em cada grupo)

```json
{
  "grupos": [
    {
      "id": "001",
      "nome": "Grupo A",
      ...
      "novo_campo_teste": "valor_padrão"  ← NOVO
    }
  ]
}
```

**Passo 3:** Usar na rota (example em `backend/rotas.py`)

```python
@app.get("/api/grupos")
async def listar_grupos():
    grupos = await fetch_grupos()
    return {
        "total": len(grupos),
        "grupos": grupos  # ✅ Agora tem novo_campo_teste
    }
```

---

### 2. Criar uma Nova Aba no Dashboard

**OBJETIVO:** Adicionar aba "Relatório" ao dashboard

**Passo 1:** Editar `frontend/index.html` (adicionar botão da aba)

```html
<!-- Abas (no topo) -->
<div class="flex gap-2 mb-4">
  <button @click="tab = 'mapa'" :class="{...}">Mapa</button>
  <button @click="tab = 'calculadora'" :class="{...}">Calculadora</button>
  <button @click="tab = 'gerenciador'" :class="{...}">Gerenciador</button>
  
  <!-- ✅ NOVA ABA -->
  <button @click="tab = 'relatorio'" :class="{...}">Relatório</button>
</div>

<!-- Conteúdo da Aba -->
<div x-show="tab == 'relatorio'" class="p-4">
  <h2>Relatório de Grupos</h2>
  <p>Total de grupos: <span x-text="grupos.length"></span></p>
  <button @click="gerarRelatorio()">Gerar PDF</button>
</div>
```

**Passo 2:** Adicionar função em `frontend/js/app.js`

```javascript
function dashboard() {
  return {
    tab: 'mapa',
    grupos: [],
    
    async gerarRelatorio() {
      const resp = await fetch('/api/relatorio/gerar');
      const data = await resp.json();
      console.log('Relatório:', data);
      alert('Relatório gerado!');
    },
    
    // ... outras funções ...
  }
}
```

**Passo 3:** Criar rota no backend (`backend/rotas.py`)

```python
@app.get("/api/relatorio/gerar")
async def gerar_relatorio():
    grupos = await fetch_grupos()
    return {
        "total": len(grupos),
        "data_geracao": datetime.now(),
        "url_download": "/relatorio.pdf"
    }
```

---

### 3. Validar Entrada do Usuário

**OBJETIVO:** Validar que crédito não pode ser negativo

**Em `backend/validacoes.py`:**

```python
def validar_credito(valor: float) -> tuple[bool, str]:
    """
    Valida se o crédito é válido.
    
    Args:
        valor: Valor do crédito em R$
        
    Returns:
        (is_valid, mensagem_erro)
    """
    if valor <= 0:
        return False, "Crédito deve ser maior que R$ 0"
    
    if valor > 1_000_000:
        return False, "Crédito não pode exceder R$ 1.000.000"
    
    return True, ""
```

**Na rota (`backend/rotas.py`):**

```python
@app.post("/api/teste-calculadora")
async def teste_calculadora(req: SimulacaoRequest):
    # ✅ Validar entrada
    is_valid, erro = validar_credito(req.credito)
    if not is_valid:
        raise HTTPException(status_code=400, detail=erro)
    
    # Prosseguir com cálculo
    resultado = calcular_simulacao(req)
    return resultado
```

**No frontend (`frontend/js/app.js`):**

```javascript
async function executarCalculadora() {
  const credito = parseFloat(document.getElementById('credito').value);
  
  if (credito <= 0) {
    alert('❌ Crédito deve ser maior que 0');
    return;
  }
  
  const resp = await fetch('/api/teste-calculadora', {
    method: 'POST',
    body: JSON.stringify({credito, ...})
  });
  
  if (!resp.ok) {
    const erro = await resp.json();
    alert('❌ ' + erro.detail);
    return;
  }
  
  const resultado = await resp.json();
  console.log('✅ Cálculo realizado:', resultado);
}
```

---

## 🐛 TROUBLESHOOTING COMUM

### ❌ "Erro: ModuleNotFoundError: No module named 'fastapi'"

**Solução:**
```bash
pip install -r requirements.txt
```

### ❌ "Erro 401 Google Sheets: Invalid credentials"

**Solução:**
1. Verificar se `backend/credenciais_google.json` existe
2. Se não existir, pedir ao Cristiano
3. Se existir, verificar se o token não expirou:
   ```bash
   python backend/sheets.py  # Testa conexão
   ```

### ❌ "Tela em branco / Dashboard não carrega"

**Checklist:**
1. ✅ Backend rodando? (`python main.py`)
2. ✅ URL correta? (`http://localhost:8000`)
3. ✅ Console do navegador tem erros? (F12 → Console)
4. ✅ `data/grupos.json` existe e tem dados?

**Solução rápida:**
```bash
# Verificar se JSON está vazio
type data\grupos.json | findstr "grupos"

# Regenerar cache
python backend/sheets.py  # Isso reconstrói grupos.json
```

### ❌ "Erro ao fazer login: 401 Unauthorized"

**Credenciais corretas:**
- Usuário: `adm` | Senha: `cristiano`
- Usuário: `operador1` | Senha: `teste123`

**Se não funcionar:**
1. Verificar em `backend/rotas.py` a função `login`:
   ```python
   @app.post("/api/login")
   async def login(credenciais: LoginRequest):
       # Aqui valida usuário/senha
   ```

### ❌ "Erro: PYTHONPATH não definido"

**Solução:**
```bash
# Windows PowerShell
$env:PYTHONPATH = "$env:PYTHONPATH;C:\Users\User\crediclass-dashboard-grupos"
python main.py
```

### ❌ "Charts não aparecem na aba Analytics"

**Checklist:**
1. ✅ `frontend/js/charts.js` existe?
2. ✅ Chart.js está carregado em `index.html`?
   ```html
   <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3"></script>
   ```
3. ✅ Dados estão sendo buscados?
   ```javascript
   console.log('Grupos para gráfico:', grupos);
   ```

---

## 🚀 FLUXO DE DESENVOLVIMENTO

### Como Fazer Uma Mudança (Git Workflow)

```bash
# 1. Criar branch para sua tarefa
git checkout -b feature/adicionar-campo-novo
# ou
git checkout -b bugfix/corrigir-validacao

# 2. Fazer mudanças nos arquivos
# (ex: editar backend/models.py)

# 3. Testar localmente
python main.py
# Abrir http://localhost:8000 e testar manualmente

# 4. Commit
git add .
git commit -m "feat: adicionar novo campo na aba gerenciador"
# ✅ Pre-commit hooks rodam automaticamente
# Valida frontend e Dockerfile

# 5. Push
git push origin feature/adicionar-campo-novo

# 6. Criar Pull Request (GitHub)
# Descrever o que foi mudado e por quê

# 7. Code Review + Merge
# Cristiano/time revisa e aprova
```

### Padrão de Commit Message

```
# Formato
<tipo>: <descrição curta>

# Tipos
feat:      nova feature
fix:       bugfix
refactor:  mudança de código sem alterar comportamento
docs:      documentação
test:      testes
perf:      melhoria de performance

# Exemplos
feat: adicionar campo "status" ao Grupo
fix: corrigir cálculo de lance fixo para prazo > 100
refactor: extrair lógica de validação em novo arquivo
docs: adicionar exemplos em ONBOARDING_JUNIOR.md
```

### Testes Antes de Fazer PR

```bash
# 1. Testar manualmente (navegador)
python main.py
# Acesse http://localhost:8000
# Teste todas as abas e funcionalidades

# 2. Verificar console do navegador (F12)
# ❌ Não deve ter erros vermelhos

# 3. Verificar API manualmente
curl http://localhost:8000/api/grupos?limit=1
# Deve retornar JSON com dados

# 4. Se houver testes automatizados
pytest tests/
# (futura implementação)
```

---

## 📋 PRIMEIRAS TAREFAS FÁCEIS (PICK ONE!)

Escolha uma para começar hoje:

### ✅ Tarefa 1: "Debug" — Adicionar Log na Calculadora (30 min)

**Objetivo:** Entender o fluxo backend-frontend

**Passos:**
1. Abrir `backend/calculadora.py`
2. Adicionar `print()` na função `calcular_score()`
3. Rodar backend (`python main.py`)
4. Na aba Calculadora, clicar em "Executar Cálculo"
5. Ver o print no terminal
6. **Entregável:** Screenshot do print + uma linha explicando o que viu

---

### ✅ Tarefa 2: "UI Fix" — Adicionar Tooltips aos Campos (45 min)

**Objetivo:** Melhorar UX com dicas ao passar mouse

**Passos:**
1. Editar `frontend/index.html`
2. Adicionar atributo `title="Crédito desejado em R$"` aos inputs
3. Testar no navegador (passar mouse nos campos)
4. **Entregável:** Pull request com mudanças

---

### ✅ Tarefa 3: "Validação" — Corrigir Validação de Prazo (1 hora)

**Objetivo:** Prazo não pode ser 0 ou negativo

**Passos:**
1. Editar `backend/validacoes.py`
2. Criar função `validar_prazo()`
3. Adicionar a validação em `teste_calculadora()`
4. Testar com valor inválido (prazo = -5)
5. Deve retornar erro HTTP 400
6. **Entregável:** Pull request com testes

---

### ✅ Tarefa 4: "Cache" — Regenerar grupos.json (30 min)

**Objetivo:** Aprender integração com Google Sheets

**Passos:**
1. Abrir terminal
2. Rodar:
   ```bash
   python backend/sheets.py
   ```
3. Verificar que `data/grupos.json` foi atualizado
4. Contar quantos grupos foram sincronizados
5. **Entregável:** Print do terminal + número de grupos

---

### ✅ Tarefa 5: "Documentação" — Adicionar Exemplos de API (1 hora)

**Objetivo:** Melhorar docs e aprender as rotas

**Passos:**
1. Abrir `TUDO_SOBRE_CREDICLASS.md`
2. Adicionar exemplos curl para 5 endpoints
3. Testar cada curl no terminal
4. Documentar o resultado esperado
5. **Entregável:** Pull request com exemplos

---

## 🎓 RECURSOS ÚTEIS

| Recurso | Link | Para Aprender |
|---------|------|--------------|
| **Documentação Técnica** | `TUDO_SOBRE_CREDICLASS.md` | Tudo sobre o projeto |
| **Roadmap & Tarefas** | `docs/ROADMAP.md` | O que vem depois |
| **FastAPI Docs** | http://localhost:8000/docs | APIs em tempo real (quando rodando) |
| **Alpine.js Docs** | https://alpinejs.dev | Frontend reativo |
| **Chart.js Docs** | https://www.chartjs.org | Gráficos |
| **Google Sheets API** | [Docs](https://developers.google.com/sheets/api) | Integração |
| **Piperun API** | [Docs](https://api.piperun.com) | CRM |

---

## ❓ PRECISA DE AJUDA?

### Mensagens Úteis para Pedir Help

```
"Estou fazendo a tarefa de [descrição], rodei [comando],
e recebi esse erro: [colar erro]. Já tentei [o que tentou].
Próximo passo?"
```

### Pessoas para Perguntar

- **Cristiano** (@CristianodeSouza) — Criador do projeto, tudo
- **Time Dev** — Code review, dúvidas arquitetura

---

## ✅ CHECKLIST DO SEU PRIMEIRO DIA

- [ ] Clonar repo
- [ ] Rodar `pip install -r requirements.txt`
- [ ] Rodar `python main.py`
- [ ] Dashboard carrega em `http://localhost:8000`
- [ ] Login com `adm / cristiano`
- [ ] Explorar as 5 abas
- [ ] Testar calculadora
- [ ] Ler `TUDO_SOBRE_CREDICLASS.md` (primeiras seções)
- [ ] Escolher **1 tarefa fácil** acima
- [ ] Fazer PR com a tarefa
- [ ] Code review com Cristiano

**Estimated time:** 2-3 horas

---

## 🔴 MAPEAMENTO DE ERROS DE CARREGAMENTO DE DADOS (DEBUG)

Esta seção documenta **todos os erros de carregamento** que ocorreram no frontend, **como foram resolvidos**, **o que NÃO funcionou**, e **o que funcionou**.

### 📊 TABELA RESUMIDA

| Erro | Sintoma | ✅ Solução que Funcionou | ❌ Tentativas que Falharam | Root Cause |
|------|---------|--------------------------|------------------------------|-----------|
| [#1 Dados vazios na aba Mapa](#erro-1) | `"total": 0` em `/api/grupos` | Copiar `data/grupos.json` no Dockerfile | Limpar cache apenas | `COPY data/` faltava no Dockerfile |
| [#2 Templates não renderizam](#erro-2) | `{{ }}` aparecem como texto | Adicionar `defer` em scripts Alpine | Carregar Alpine sem defer | Script carregava antes de DOM pronto |
| [#3 API retorna 500](#erro-3) | "Internal Server Error" em `/api/teste-calculadora` | Adicionar validação Pydantic | Try/except genérico | Request faltava campos obrigatórios |
| [#4 CORS erro ao chamar Piperun](#erro-4) | "No 'Access-Control-Allow-Origin'" | Proxy via backend `/api/piperun` | Chamar direto da Piperun no frontend | Browser bloqueia cross-origin |
| [#5 Grupos carregam, mas lentamente](#erro-5) | Dashboard leva 5+ segundos | Usar cache `grupos.json` | Sempre chamar Google Sheets | Cache reduz latência de 5s → 200ms |
| [#6 Gráficos não aparecem](#erro-6) | Canvas vazio em Analytics | Carregar Chart.js ANTES de app.js | Script order incorreta | Função `mostrarGraficos()` chamava Chart undefined |
| [#7 Filtros não funcionam](#erro-7) | Filtro aplicado mas lista não atualiza | Usar `@change` em inputs + chamar API | Usar apenas variável Alpine local | Alpine não disparava fetch ao mudar input |
| [#8 Login falha silenciosamente](#erro-8) | Form submetido mas sem resposta | Adicionar tratamento de erro em fetch | Assumir que sempre sucede | Error handling ausente |

---

### ERRO #1: Dados Vazios no Dashboard (API Retorna `"total": 0`)

#### 🔴 Sintoma
```
GET http://localhost:8000/api/grupos
Response: {"total": 0, "grupos": []}
```
Dashboard carrega mas sem dados, tela vazia.

#### 🔍 Investigação
**Console do navegador (F12):**
```javascript
fetch('/api/grupos').then(r => r.json()).then(d => console.log(d));
// Retorna: {total: 0, grupos: []}
```

**Backend (`python main.py`):**
```
INFO:     Iniciando servidor...
INFO:     GET /api/grupos → Buscando em data/grupos.json
ERROR:    Arquivo grupos.json não encontrado ou está vazio
```

#### ✅ Solução que Funcionou

**Adicionar `COPY data/ ./data/` no Dockerfile:**

```dockerfile
# Dockerfile (linha 36)
COPY data/ ./data/

# Isso garante que em produção (Render) o arquivo grupos.json
# seja copiado para o container
```

**Por quê:**
- Em desenvolvimento, `data/grupos.json` é local ✅
- Em produção (Render), Docker não copia diretórios se não especificado ❌
- Resultado: API retorna vazio em produção
- Fix: Explicitamente copiar `COPY data/` ao lado de `backend/` e `frontend/`

**Verificação:**
```bash
# Local
curl http://localhost:8000/api/grupos?limit=1
# {"total": 342, "grupos": [...]}

# Produção (após fix)
curl https://crediclass.csrtecnologia.com.br/api/grupos?limit=1
# {"total": 342, "grupos": [...]}  ← Agora funciona!
```

#### ❌ Tentativas que NÃO funcionaram

| Tentativa | Por quê falhou |
|-----------|---------------|
| Limpar cache com `rm data/grupos.json` | Problema não era cache local, era deploy |
| Recriar `grupos.json` via API | Arquivo seria recriado em runtime, perdido no próximo deploy |
| Usar banco de dados PostgreSQL | Over-engineering; cache JSON é suficiente |
| Chamar Google Sheets direto sempre | Muito lento (5+ segundos por request) |
| Usar Redis em produção | Render free tier não suporta add-ons |

#### 📋 Checklist para Evitar Novamente

- [ ] Dockerfile tem `COPY data/ ./data/`
- [ ] `data/grupos.json` tem > 0 grupos
- [ ] Após deploy, chamar `/api/grupos` e verificar `"total" > 0`
- [ ] Se vazio em produção, rodar pre-commit hook: `python backend/dockerfile_validator.py`

---

### ERRO #2: Templates Alpine.js Não Renderizam (`{{ }}` Aparecem Como Texto)

#### 🔴 Sintoma
```html
Página mostra literalmente: {{ grupo.nome }}
Em vez de: "Grupo A"
```

Console do navegador (F12 → Console):
```javascript
Alpine Warning: Unable to initialize
```

#### 🔍 Investigação

**index.html (problema):**
```html
<!-- ❌ Sem defer — Alpine não inicializa -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1"></script>
<script src="/static/js/app.js"></script>
```

**O quê acontecia:**
1. Browser carrega HTML
2. Encontra `<script src="alpinejs">` — BLOQUEIA rendering
3. Carrega e executa Alpine
4. Carrega app.js que chama `dashboard()`
5. Mas `<body x-data="dashboard()">` JÁ foi parseado sem Alpine
6. Resultado: Alpine não encontra nada para bindar
7. Templates `{{ }}` aparecem como texto literal

#### ✅ Solução que Funcionou

**Adicionar atributo `defer` em TODOS os scripts:**

```html
<!-- ✅ CERTO -->
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1" defer></script>
<script src="/static/js/app.js" defer></script>
```

**Por quê `defer` funciona:**
- Browser carrega script **em background** (não bloqueia)
- Parsing do HTML continua normalmente
- `<div x-data="dashboard()">` é parseado e está pronto
- Após HTML totalmente parseado, `defer` scripts executam
- Alpine.js agora encontra elementos e funciona
- Templates `{{ }}` renderizam corretamente

**Verificação:**
```javascript
// Console do navegador (F12)
console.log(Alpine);  // Deve mostrar objeto Alpine
console.log(window.dashboard);  // Deve mostrar função dashboard()
// Se aparecer "undefined", defer não funcionou
```

#### ❌ Tentativas que NÃO funcionaram

| Tentativa | Por quê falhou | Aprendizado |
|-----------|---------------|-----------|
| Usar `async` em vez de `defer` | Script executava antes do DOM | `async` = qualquer hora; `defer` = após DOM |
| Colocar `<script>` no final de `</body>` | Ajudava, mas não era solução total | Order importa, mas `defer` é mais robusto |
| Usar `document.addEventListener('DOMContentLoaded')` | Funcionava às vezes, race condition | Melhor deixar browser gerenciar com `defer` |
| Inicializar Alpine.js manualmente com `Alpine.start()` | Overcomplicated, não era necessário | Deixar Alpine auto-inicializar é mais simples |
| Chamar `dashboard()` inline em HTML | Funcionava, mas quebrava reatividade | Função deve retornar objeto reativo |

#### 📋 Checklist para Evitar Novamente

- [ ] **TODOS** os `<script>` tags têm `defer`
- [ ] Alpine.js script tem `defer`
- [ ] app.js script tem `defer`
- [ ] Order correto: Alpine → app.js
- [ ] Console F12 não mostra erros sobre Alpine
- [ ] Templates `{{ }}` renderizam (não aparecem como texto)
- [ ] Pre-commit hook valida: `python backend/frontend_validator.py`

---

### ERRO #3: API Retorna HTTP 500 (Internal Server Error)

#### 🔴 Sintoma
```
POST http://localhost:8000/api/teste-calculadora
Response: HTTP 500
Body: {"detail": "Internal server error"}
```

#### 🔍 Investigação

**Frontend (app.js):**
```javascript
async function executarCalculadora() {
  const req = {
    credito: 50000,
    prazo: 120
    // ❌ Faltam campos obrigatórios
  };
  
  const resp = await fetch('/api/teste-calculadora', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(req)
  });
  
  if (!resp.ok) {
    console.log(resp.status, resp.statusText);  // 500 Internal Server Error
  }
}
```

**Backend (rotas.py - erro):**
```python
@app.post("/api/teste-calculadora")
async def teste_calculadora(req: SimulacaoRequest):
    # Request vem com apenas {credito, prazo}
    # Mas SimulacaoRequest requer {credito, prazo, renda, parcela, fgts}
    # → Pydantic validation falha
    # → FastAPI retorna HTTP 422, mas sem mensagem útil
```

**Terminal (backend):**
```
ERROR:    Exception in ASGI application
  File "pydantic/main.py", line 123
  ValidationError: [{'type': 'missing', 'loc': ('body', 'renda'), ...}]
```

#### ✅ Solução que Funcionou

**1. Enviar TODOS os campos obrigatórios:**

```javascript
// ✅ Certo
async function executarCalculadora() {
  const req = {
    credito: parseFloat(document.getElementById('credito').value),
    prazo: parseInt(document.getElementById('prazo').value),
    renda: parseFloat(document.getElementById('renda').value),
    parcela: parseFloat(document.getElementById('parcela').value),
    fgts: parseFloat(document.getElementById('fgts').value),
    modalidade: document.getElementById('modalidade').value
  };
  
  const resp = await fetch('/api/teste-calculadora', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(req)
  });
  
  if (!resp.ok) {
    const erro = await resp.json();
    console.error('❌ Erro:', erro);  // Agora mostra erro útil
    return;
  }
  
  const resultado = await resp.json();
  console.log('✅ Sucesso:', resultado);
}
```

**2. Adicionar validação no backend:**

```python
# backend/rotas.py
@app.post("/api/teste-calculadora")
async def teste_calculadora(req: SimulacaoRequest):
    # Pydantic valida automaticamente
    
    # Validação adicional (regras de negócio)
    is_valid, erro = validar_credito(req.credito)
    if not is_valid:
        raise HTTPException(status_code=400, detail=erro)
    
    is_valid, erro = validar_prazo(req.prazo)
    if not is_valid:
        raise HTTPException(status_code=400, detail=erro)
    
    # Se chegou aqui, tudo está válido
    resultado = calcular_simulacao(req)
    return resultado
```

**Verificação:**
```bash
# ❌ Antes (HTTP 500)
curl -X POST http://localhost:8000/api/teste-calculadora \
  -H "Content-Type: application/json" \
  -d '{"credito": 50000}'
# {"detail": "Internal server error"}

# ✅ Depois (HTTP 422 com erro claro)
curl -X POST http://localhost:8000/api/teste-calculadora \
  -H "Content-Type: application/json" \
  -d '{"credito": 50000}'
# {"detail": [{"type": "missing", "loc": ["body", "renda"], ...}]}

# ✅ Com todos os campos (HTTP 200)
curl -X POST http://localhost:8000/api/teste-calculadora \
  -H "Content-Type: application/json" \
  -d '{"credito": 50000, "prazo": 120, "renda": 5000, "parcela": 500, "fgts": 0, "modalidade": "sorteio"}'
# {"score": 85, "lancamento": {...}}
```

#### ❌ Tentativas que NÃO funcionaram

| Tentativa | Por quê falhou |
|-----------|---------------|
| Usar `try/except` genérico | Esconde erro real; mensagem fica genérica |
| Passar valores como strings | Pydantic espera tipo correto (float/int) |
| Omitir campos e usar defaults | Pydantic fields não tinham default definido |
| Fazer validação apenas frontend | Backend deveria ser a fonte de verdade |

#### 📋 Checklist para Evitar Novamente

- [ ] Request JSON tem TODOS os campos obrigatórios
- [ ] Tipos são corretos (número, string, boolean)
- [ ] Backend tem validação Pydantic (automática)
- [ ] Backend tem validação de negócio (manual com raise HTTPException)
- [ ] Frontend trata erro com `if (!resp.ok)`
- [ ] Terminal backend mostra erro claro (não "Internal Server Error" genérico)

---

### ERRO #4: CORS Error ao Chamar Piperun CRM

#### 🔴 Sintoma
```javascript
// Frontend tenta chamar Piperun direto
fetch('https://api.piperun.com/deals/12345', {
  headers: {'Authorization': 'Bearer TOKEN'}
})
```

**Console do navegador:**
```
Access to XMLHttpRequest at 'https://api.piperun.com/deals/12345'
from origin 'http://localhost:8000' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

#### 🔍 Investigação

**Por quê acontece:**
- Frontend (http://localhost:8000) tenta chamar Piperun (https://api.piperun.com)
- Domínios diferentes = cross-origin request
- Browser bloqueia por segurança (CORS policy)
- Piperun não configura `Access-Control-Allow-Origin: http://localhost:8000`
- Resultado: Erro CORS

#### ✅ Solução que Funcionou

**Fazer chamada via backend (proxy pattern):**

```javascript
// ❌ ANTES — Chamada direta (bloqueada)
async function buscarOportunidade(dealId) {
  const resp = await fetch(`https://api.piperun.com/deals/${dealId}`, {
    headers: {'Authorization': 'Bearer TOKEN'}
  });
  // → CORS Error
}

// ✅ DEPOIS — Via backend proxy
async function buscarOportunidade(dealId) {
  const resp = await fetch(`/api/piperun/${dealId}`);
  // → Backend faz chamada, browser não bloqueia
  const data = await resp.json();
  return data;
}
```

**Backend (rotas.py):**
```python
@app.get("/api/piperun/{deal_id}")
async def buscar_oportunidade(deal_id: str):
    """
    Proxy para Piperun API.
    Frontend não pode chamar Piperun direto (CORS).
    Backend faz chamada server-to-server (sem CORS).
    """
    try:
        oportunidade = await fetch_oportunidade(deal_id)
        return oportunidade
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao buscar: {str(e)}")
```

**Por quê funciona:**
- Backend chama Piperun (server-to-server, sem CORS)
- Frontend chama backend local (same-origin, sem CORS)
- Sem bloqueio de CORS

#### ❌ Tentativas que NÃO funcionaram

| Tentativa | Por quê falhou |
|-----------|---------------|
| Adicionar `mode: 'no-cors'` em fetch | Funciona mas retorna response vazio |
| Usar JSONP | Piperun API não suporta callback |
| Desabilitar CORS no navegador | Usuário final não pode fazer isso |
| Pedir Piperun para adicionar CORS | Leva tempo, não controlamos |
| Usar iframe | Overcomplicated, mesma restrição |

#### 📋 Checklist para Evitar Novamente

- [ ] Nenhuma chamada direta de frontend para APIs externas
- [ ] Sempre fazer proxy via backend (`/api/...`)
- [ ] Backend usa `requests` ou `aiohttp` (sem CORS)
- [ ] Frontend chama apenas backend local

---

### ERRO #5: Dashboard Carrega Lentamente (5+ Segundos)

#### 🔴 Sintoma
```
Usuário acessa http://localhost:8000
Espera 5+ segundos
Dados aparecem lentamente
```

**Network tab (F12 → Network):**
```
GET /api/grupos → 5234ms (SLOW!)
```

#### 🔍 Investigação

**Backend (problema):**
```python
@app.get("/api/grupos")
async def listar_grupos():
    # ❌ Chama Google Sheets toda vez
    grupos = await fetch_grupos()  # 5+ segundos!
    return {"total": len(grupos), "grupos": grupos}
```

**Fluxo:**
1. Browser faz GET /api/grupos
2. Backend chama Google Sheets API
3. Google Sheets leva 5+ segundos para responder
4. Backend retorna para frontend
5. Usuário vê delay

#### ✅ Solução que Funcionou

**Usar cache local `data/grupos.json`:**

```python
# backend/sheets.py
def fetch_grupos():
    """
    Busca grupos do cache local (rápido).
    Se cache ausente, sincroniza com Google Sheets.
    """
    cache_file = "data/grupos.json"
    
    # ✅ Primeiro, tenta cache local
    if os.path.exists(cache_file):
        with open(cache_file, 'r') as f:
            data = json.load(f)
            if data.get('grupos'):  # Se tiver dados
                return data['grupos']  # Retorna imediatamente (< 200ms)
    
    # ❌ Se cache vazio, sincroniza com Sheets (lento)
    print("⚠️  Cache vazio, sincronizando com Google Sheets...")
    grupos = _sincronizar_com_sheets()  # 5+ segundos
    
    # Salva no cache para próxima vez
    with open(cache_file, 'w') as f:
        json.dump({'grupos': grupos}, f)
    
    return grupos
```

**Verificação:**
```bash
# ❌ Antes (sem cache)
time curl http://localhost:8000/api/grupos
# real    0m5.234s

# ✅ Depois (com cache)
time curl http://localhost:8000/api/grupos
# real    0m0.187s

# 28x mais rápido! 🚀
```

**Refresh do cache:**
```bash
# Background worker faz sync periódico
python backend/sync_worker.py  # Roda a cada 1 hora

# Ou manualmente
python backend/sheets.py  # Reconstrói cache
```

#### ❌ Tentativas que NÃO funcionaram

| Tentativa | Por quê falhou |
|-----------|---------------|
| Reduzir timeout no fetch | Ainda lento, só dava erro |
| Usar paginação no Google Sheets | Ajudava pouco, ainda era lento |
| Comprimir JSON | Ínfimo (10-20ms), problema era latência Sheets |
| Usar CDN para cache | Overkill, cache JSON local é suficiente |

#### 📋 Checklist para Evitar Novamente

- [ ] Cache JSON local em `data/grupos.json`
- [ ] Endpoint `/api/grupos` lê cache local (< 200ms)
- [ ] Background worker sincroniza cada hora
- [ ] Após mudança manual, rodar `python backend/sheets.py`

---

### ERRO #6: Gráficos em Branco na Aba Analytics

#### 🔴 Sintoma
```
Aba Analytics carrega
Canvas/div para gráfico está lá, mas vazio
Sem erros no console
```

**HTML:**
```html
<canvas id="grafico-adms"></canvas>
```

**Resultado:**
Canvas existe, mas está branco/vazio.

#### 🔍 Investigação

**index.html (problema):**
```html
<!-- ❌ Order incorreta -->
<script src="/static/js/app.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3"></script>
```

**app.js tenta usar Chart.js:**
```javascript
function mostrarGraficos(grupos) {
  const ctx = document.getElementById('grafico-adms');
  const chart = new Chart(ctx, {...});  // ❌ Chart undefined!
}
```

**O quê acontecia:**
1. app.js carrega (executa `mostrarGraficos()`)
2. app.js tenta usar `Chart` global
3. Chart.js ainda não foi carregado
4. `Chart` is undefined
5. Erro silencioso (canvas não renderiza)

#### ✅ Solução que Funcionou

**Carregar Chart.js ANTES de app.js:**

```html
<!-- ✅ Order correta -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3" defer></script>
<script src="/static/js/charts.js" defer></script>
<script src="/static/js/app.js" defer></script>
```

**Por quê funciona:**
1. Todos com `defer`
2. Browser executa em order: Chart.js → charts.js → app.js
3. Quando app.js executa, `Chart` já existe
4. `new Chart(...)` funciona
5. Gráficos renderizam

**Verificação:**
```javascript
// Console (F12)
console.log(typeof Chart);  // 'function' (OK)
console.log(typeof Chart.Doughnut);  // 'function' (OK)

// Se undefined, Chart.js não carregou na order correta
```

#### ❌ Tentativas que NÃO funcionaram

| Tentativa | Por quê falhou |
|-----------|---------------|
| Colocar Chart.js no final de body | Funcionava às vezes, race condition |
| Usar `async` ao invés de `defer` | Ordem não garantida |
| Inicializar Chart dentro de `setTimeout` | Workaround, não é solução |
| Usar `if (typeof Chart === 'undefined')` | Ainda quebrava, melhor é order correta |

#### 📋 Checklist para Evitar Novamente

- [ ] Chart.js está na HTML
- [ ] Chart.js vem ANTES de app.js
- [ ] Ambos têm `defer`
- [ ] `console.log(Chart)` não é undefined
- [ ] Canvas tem id correto (`id="grafico-..."`)
- [ ] Função `mostrarGraficos()` é chamada após dados carregarem

---

### ERRO #7: Filtro Não Atualiza a Lista

#### 🔴 Sintoma
```
Usuário seleciona filtro (ex: Administradora)
Seleciona "CNP"
Lista NÃO atualiza — continua mostrando todas
```

#### 🔍 Investigação

**index.html (problema):**
```html
<!-- ❌ Input sem evento -->
<select id="filtro-adm">
  <option value="">Todas</option>
  <option value="CNP">CNP</option>
  <option value="ITAÚ">ITAÚ</option>
</select>

<!-- Lista (não atualiza) -->
<div x-data="dashboard()">
  <template x-for="grupo in grupos">
    <div x-text="grupo.nome"></div>
  </template>
</div>
```

**app.js (problema):**
```javascript
function dashboard() {
  return {
    grupos: [],
    filtro: '',
    
    // ❌ Só muda variável, não busca dados filtrados
    mudarFiltro(valor) {
      this.filtro = valor;
      // Falta chamar API!
    }
  };
}
```

**O quê acontecia:**
1. Usuário muda select
2. Variável Alpine `filtro` muda
3. Mas API não é chamada
4. `grupos` continua com dados antigos
5. Lista não atualiza visualmente

#### ✅ Solução que Funcionou

**Adicionar evento `@change` que chama API:**

```html
<!-- ✅ Com @change -->
<select x-model="filtro" @change="buscarGruposComFiltro()">
  <option value="">Todas</option>
  <option value="CNP">CNP</option>
  <option value="ITAÚ">ITAÚ</option>
</select>
```

**app.js:**
```javascript
function dashboard() {
  return {
    grupos: [],
    filtro: '',
    
    // ✅ Busca grupos com filtro aplicado
    async buscarGruposComFiltro() {
      const url = `/api/grupos?administradora=${this.filtro}`;
      const resp = await fetch(url);
      const data = await resp.json();
      this.grupos = data.grupos;  // ← Atualiza dados
    }
  };
}
```

**Backend (rotas.py):**
```python
@app.get("/api/grupos")
async def listar_grupos(administradora: str = None):
    """
    GET /api/grupos → todos
    GET /api/grupos?administradora=CNP → apenas CNP
    """
    grupos = await fetch_grupos()
    
    # Filtrar
    if administradora:
        grupos = [g for g in grupos if g.administradora == administradora]
    
    return {"total": len(grupos), "grupos": grupos}
```

**Verificação:**
```bash
# ❌ Antes (sem filtro no backend)
curl http://localhost:8000/api/grupos
# [1809 grupos] (tudo)

# ✅ Depois (com filtro)
curl http://localhost:8000/api/grupos?administradora=CNP
# [342 grupos] (só CNP)
```

#### ❌ Tentativas que NÃO funcionaram

| Tentativa | Por quê falhou |
|-----------|---------------|
| Usar `x-change` | Event correto é `@change` |
| Filtrar apenas frontend com JS | Não escala (1809 grupos em memória) |
| Usar computed property | Funcionava mas refetch era ineficiente |

#### 📋 Checklist para Evitar Novamente

- [ ] Input filtro tem `@change="funcao()"`
- [ ] Função chama API com parâmetro: `/api/grupos?campo=valor`
- [ ] Backend filtra baseado em query param
- [ ] Frontend atualiza `this.grupos` com resultado
- [ ] Alpine reatividade renderiza nova lista

---

### ERRO #8: Login Falha Silenciosamente

#### 🔴 Sintoma
```
Usuário clica botão "Login"
Form desaparece
Mas nada acontece — nenhuma aba carrega
Sem erro no console
```

#### 🔍 Investigação

**app.js (problema):**
```javascript
async function fazerLogin() {
  const user = document.getElementById('user').value;
  const pass = document.getElementById('password').value;
  
  const resp = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({usuario: user, senha: pass})
  });
  
  const data = await resp.json();
  // ❌ Não trata erro!
  // Se HTTP 401, o quê faz?
}
```

**O quê acontecia:**
1. Request enviado
2. Server retorna HTTP 401 (Unauthorized)
3. Frontend ignora o erro
4. Tenta fazer `resp.json()`
5. Erro silencioso em background
6. Usuário vê nada acontecendo

#### ✅ Solução que Funcionou

**Adicionar tratamento de erro:**

```javascript
async function fazerLogin() {
  const user = document.getElementById('user').value;
  const pass = document.getElementById('password').value;
  
  try {
    const resp = await fetch('/api/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({usuario: user, senha: pass})
    });
    
    // ✅ Verificar status
    if (!resp.ok) {
      const erro = await resp.json();
      alert(`❌ Login falhou: ${erro.detail}`);
      return;
    }
    
    const data = await resp.json();
    
    // ✅ Sucesso — salvar token e redirecionar
    localStorage.setItem('token', data.token);
    window.location.href = '/';  // Ir para dashboard
    
  } catch (error) {
    // ✅ Erro de rede
    console.error('Erro de login:', error);
    alert('❌ Erro de conexão. Tente novamente.');
  }
}
```

**Backend (rotas.py):**
```python
@app.post("/api/login")
async def login(credenciais: LoginRequest):
    usuario = credenciais.usuario
    senha = credenciais.senha
    
    # Validar
    usuarios_validos = {
        'adm': 'cristiano',
        'operador1': 'teste123'
    }
    
    if usuario not in usuarios_validos or usuarios_validos[usuario] != senha:
        raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
    
    # Sucesso
    return {
        "token": f"fake-token-{usuario}",
        "usuario": usuario,
        "permissao": "admin" if usuario == "adm" else "leitura"
    }
```

**Verificação:**
```bash
# ❌ Antes (sem erro)
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "admin", "senha": "wrong"}'
# Sem resposta clara

# ✅ Depois (com erro)
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "admin", "senha": "wrong"}'
# HTTP 401
# {"detail": "Usuário ou senha incorretos"}
```

#### ❌ Tentativas que NÃO funcionaram

| Tentativa | Por quê falhou |
|-----------|---------------|
| Assumir que sempre funciona | Usuário fica confuso |
| Usar apenas `console.error()` | Desenvolvedor vê, usuário não |
| Redirecionar sempre | Mata usuários com erro |

#### 📋 Checklist para Evitar Novamente

- [ ] Toda chamada fetch trata `if (!resp.ok)`
- [ ] Erro mostra mensagem útil ao usuário (alert/toast)
- [ ] Try/catch para erros de rede
- [ ] Backend retorna HTTP correto (401 para auth, 400 para validação)

---

## 🗺️ RESUMO: O QUE DEU CERTO vs O QUE NÃO DEU

### ✅ Soluções que Funcionaram

| Solução | Por quê | Relevância |
|---------|--------|-----------|
| `COPY data/` no Dockerfile | Garante cache em produção | CRÍTICA |
| `defer` em scripts | Executa após DOM pronto | CRÍTICA |
| Validação Pydantic | FastAPI valida entrada | ALTA |
| Proxy backend para APIs externas | Evita CORS | ALTA |
| Cache JSON local | 28x mais rápido | ALTA |
| Order correta de scripts | Chart.js antes de app.js | ALTA |
| Event handlers com @change | Filtros funcionam | MÉDIA |
| Tratamento de erro em fetch | User feedback | MÉDIA |

### ❌ Coisas que NÃO funcionaram

| Tentativa | Por quê falhou | Alternativa |
|-----------|---------------|-----------|
| Ignorar CORS | Browser bloqueia | Proxy backend |
| Try/catch genérico | Esconde erro | Mensagem específica |
| Scripts sem order | Race condition | Usar `defer` + order |
| Assumir que sempre funciona | Silent failures | Tratamento de erro |
| Alterar inputs sem fetch | Dados não atualizam | @change + API call |

---

**Bem-vindo! 🎉**

Qualquer dúvida, olha aqui primeiro, depois pergunta no grupo/Slack.

Boa sorte! 🚀
