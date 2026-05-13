# Crediclass Dashboard Grupos

Dashboard de análise de grupos de consórcio.

## Planilha Base (MCP Google Drive)
- **ID:** `1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM`
- **URL:** https://docs.google.com/spreadsheets/d/1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM/edit
- **Aba:** Tabela de Grupos 3.0
- **Dados:** ~1809 grupos, 156 colunas

## Estrutura
```
backend/
  main.py         — FastAPI (porta 8000)
  sheets.py       — leitura Google Sheets API
  requirements.txt
frontend/
  index.html      — dashboard SPA
  css/style.css
  js/app.js       — Alpine.js + Chart.js
data/
  grupos.json     — cache local dos dados
credentials.json  — OAuth Google (NÃO commitar)
token.json        — token OAuth (NÃO commitar)
```

## Como iniciar
```
start.bat
```
Acesse: http://localhost:8000

## Setup inicial (apenas 1 vez)
1. Baixar credentials.json do Google Cloud Console (Sheets API, OAuth Desktop)
2. `python setup_google.py`

## Atualizar dados via MCP (Claude Code)
Para buscar dados frescos da planilha sem credenciais locais, use o MCP Google Drive:
- File ID: `1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM`
- Ferramenta: `mcp__claude_ai_Google_Drive__read_file_content`

## API Endpoints
- `GET /api/grupos` — lista com filtros (adm, tipo_bem, busca, prazo_restante_min/max)
- `GET /api/grupos/{id}` — detalhe com histórico
- `GET /api/stats` — estatísticas gerais
- `POST /api/refresh` — força atualização da planilha
- `GET /api/piperun/{deal_id}` — busca oportunidade no CRM Piperun e extrai dados do formulário

---

## 🧮 ABA: CALCULADORA IMÓVEL

### Descrição
Nova aba para análise financeira comparativa entre administradoras de consórcio e simulação de modalidades de contemplação. Operador fornece dados do cliente e seleciona a melhor estratégia de consórcio.

### Fluxo de Uso (4 Passos)

#### **Passo 1: Inputs & Cálculo**
- **Esquerda (Sidebar):** Formulário com campos:
  - `creditoDesejado` (default: 450.000)
  - `prazoDesejado` (dropdown: 1a3, 3a5, etc)
  - `conceitoLance` (dropdown: conservador, moderado, agressivo)
  - `lancemaximo` (default: 150.000)
  - `fgtsTitular` + `fgtsCunjuge` (FGTS disponível)
  - `nascimentoTitular` + `nascimentoCunjuge`
  - `rendaTitular` + `rendaCunjuge` (default: 3.500)
  - `parcelaDesejada` (default: 6.000)
- **Botão:** "🧮 Executar Cálculo"

#### **Passo 2: Comparativo de ADMs**
Após clicar em "Executar Cálculo", tabela mostra resultados para 6 administradoras:
- **CNP**, **ITAÚ**, **CAOA**, **PORTO**, **EMBRACON**, **RODOBENS**

Colunas:
- `Taxa ADM` (anual)
- `Fundo Reserva` (anual)
- `% Lance Embutido`
- `Crédito a Contratar` (valor)
- `Lance Máximo %`
- `Prazo Mínimo` (meses)
- **Botão:** "Ver grupos →"

**Fórmulas calculadas:**
```
(f) Crédito a Contratar = creditoDesejado / (1 - pctLanceEmbutido)
(g) Lance Máximo % = (Crédito × % Lance + Lance + FGTS) / (Crédito × (1 + Taxa + Fundo))
(h) Prazo Mínimo = (Crédito × (1 + Taxa + Fundo) - (Crédito × % Lance + Lance + FGTS)) / Parcela Desejada
```

#### **Passo 3: Seleção de Grupos**
Ao clicar "Ver grupos →" em uma ADM, lista de **grupos compatíveis** (crédito máx >= valor imóvel × 0.9):
- Grid com cards mostrando:
  - Número do grupo
  - Crédito Máximo
  - Parcela 30% reduzida
  - Prazo restante
  - Média de lances históricos
- **Botão:** "Selecionar →"

#### **Passo 4: Preview do Estudo**
Ao selecionar um grupo, exibe **preview** com:
- **Cards de resumo:** Crédito Máx, Parcela 30%, Prazo, Taxa ADM, Fundo RSV
- **4 Simulações de Contemplação:**
  1. **Sorteio Geral** (0% lance, participação em sorteio)
  2. **Lance Fixo 40%** (40% lance fixo, menor recurso próprio)
  3. **Lance Conservador** (usa `grupo.conservador_24m`, 1 das últimas 17 assembleias)
  4. **Lance Moderado** (usa `grupo.moderado_12m`, 3 das últimas 17 assembleias)

Cada simulação mostra:
- Lance Total (R$)
- Crédito Disponível (R$)
- Recurso Próprio (R$)
- Parcela Estimada (R$)
- Prazo Estimado (meses)

- **Botão:** "✓ Gerar Estudo Financeiro Final" (placeholder — TODO: PDF)

### State Management (app.js)

```javascript
// Fluxo da Calculadora
admSelecionada: null,           // nome da ADM selecionada ("ITAÚ", etc)
gruposAdmFiltrados: [],         // grupos compatíveis da ADM
grupoSelecionado: null,         // grupo escolhido para simulação
simulacoesEstudo: [],           // array com 4 simulações
erroSimulacao: "",              // mensagem de erro se houver

// Inputs do formulário
calc: {
  creditoDesejado: 450000,
  prazoDesejado: "1a3",
  conceitoLance: "agressivo",
  lancemaximo: 150000,
  fgtsTitular: 0,
  fgtsCunjuge: 0,
  nascimentoTitular: "",
  nascimentoCunjuge: "",
  rendaTitular: 3500,
  rendaCunjuge: 0,
  parcelaDesejada: 6000,
  resultados: []  // resultados por ADM
}
```

### Métodos Principais

**`executarCalculo()`**
- Valida inputs
- Calcula resultados para 6 ADMs
- Popula `calc.resultados[]`

**`selecionarAdm(adm)`**
- Filtra grupos da planilha por ADM
- Compatibilidade: `grupo.maior_credito >= creditoDesejado × 0.9`
- Popula `gruposAdmFiltrados`

**`selecionarGrupo(grupo)`**
- Define `grupoSelecionado`
- Chama `gerarSimulacoes(grupo)`

**`gerarSimulacoes(grupo)`**
- Cria array com 4 simulações
- Calcula para cada modalidade: lance, crédito, recurso próprio, parcela

**`gerarEstudoFinal()`**
- TODO: Gera PDF com modelo do Estudo Financeiro
- Deve incluir: cabeçalho cliente, quadro resumo, 4 simulações, histórico de lances

**`buscarOportunidade()`** ✅ NOVO (2026-05-13)
- Busca dados da oportunidade via GET /api/piperun/{id}
- Auto-preenche campos: creditoDesejado, lancemaximo, parcelaDesejada, rendaTitular
- Reduz tempo de preenchimento de ~5 min para ~10 segundos
- Evita erros de digitação

**`validarViabilidade()`** ✅ NOVO (2026-05-13)
- Calcula score de viabilidade (0-100)
- Valida parcela vs renda (máx 30% renda)
- Avisa prazos altos (> 180 meses)
- Detecta lance muito agressivo (> 80% imóvel)
- Exibe avisos e score visual na sidebar

### Melhorias Implementadas (2026-05-13)

#### 1. ✅ Buscar Oportunidade + Auto-fill
- Botão "🔍" com input para ID da oportunidade
- Auto-preenche todos os campos do formulário via Piperun
- Mostra nome e email do cliente carregado
- Status: **FUNCIONAL, testado com 59393258**

#### 2. ✅ Filtro de Compatibilidade Flexível
- **Antes:** `grupo.maior_credito >= valor * 0.9` (muito restritivo)
- **Depois:** `grupo.maior_credito >= valor * 0.70 OR (credito + lance) >= valor * 0.95`
- Aumenta compatibilidade: ex: de 0 para 18 grupos com imóvel R$ 400k
- Status: **FUNCIONAL**

#### 3. ✅ Validações de Viabilidade com Score
- Score de viabilidade exibido após cálculo
- 3 validações automáticas (parcela, prazo, lance)
- Indicador visual (verde/amarelo/vermelho)
- Avisos educacionais para operador
- Status: **FUNCIONAL**

### Integração com Piperun CRM

**Endpoint:** `GET /api/piperun/{deal_id}`

**Extrai do formulário:**
- `valor_imovel_num` — valor do imóvel (auto-popula `creditoDesejado`)
- `mensalidade_maxima_num` — parcela máxima (auto-popula `parcelaDesejada`)
- `lance_maximo_num` — lance máximo (auto-popula `lancemaximo`)
- `pct_lance_disponivel` — percentual de lance disponível (para filtro compatível)
- Nome cliente, email, CPF, renda, etc

**Atualizado `piperun.py`:**
- FIELD_MAP expandido para capturar variações de rótulos:
  - "Qual valor do imóvel desejado?" → `valor_imovel`
  - "Recurso próprio máximo disponível" → `lance_maximo`
  - "Parcela máxima disponível" → `mensalidade_maxima`
  - "Renda Mensal" → `renda_mensal`
  - "Profissão" → `profissao`
  - Etc.

### Dados das Administradoras

6 ADMs com parâmetros reais (extraídos da planilha Mapa de Grupos):

| ADM | Taxa ADM | Fundo RSV | % Lance Embutido | Tem Furo |
|---|---|---|---|---|
| CNP | 0,15 (15%) | 0,05 (5%) | 0,50 (50%) | 0,15 |
| ITAÚ | 0,20 (20%) | 0,03 (3%) | 0,30 (30%) | 0,20 |
| CAOA | 0,20 (20%) | 0,01 (1%) | 0,30 (30%) | 0,15 |
| PORTO | 0,15 (15%) | 0,005 (0.5%) | 0,30 (30%) | 0,15 |
| EMBRACON | 0,15 (15%) | 0,02 (2%) | 0,25 (25%) | 0,20 |
| RODOBENS | 0,18 (18%) | 0,05 (5%) | 0,30 (30%) | 0,15 |

### TODO (Próximas Fases)

- [ ] **Gerar Estudo Financeiro em PDF** (modelo baseado em EF_Melhores_Consórcios-Itaú.pdf)
  - Cabeçalho com dados do cliente
  - Quadro resumo financeiro
  - 4 simulações de modalidades
  - Histórico de lances gráfico
  - Estratégias de contemplação sugeridas
  - Datas limite para adesão

- [ ] **Auto-fill do formulário via Piperun**
  - Botão "Buscar Oportunidade" na calculadora
  - Carrega dados da aba "Mapa de Grupos" (cliente/valor/parcela)

- [ ] **Melhorias UI**
  - Botões de voltar com transições suaves
  - Modo escuro otimizado para impressão PDF
  - Cards de simulação mais visuais com gráficos

- [ ] **Validações avançadas**
  - Avisos quando parcela < renda × 0.30
  - Compatibilidade com critérios do cliente
  - Score de viabilidade (0-100)

### Referências
- **Estudo Financeiro modelo:** Desktop/EF_Melhores_Consórcios-Itaú-Reduzida_30%-Irmão_da_Bruna-Parcela_de_1.6k.pdf
- **Planilha base:** Mapa de Grupos 2.0 - Jan 2026 (Google Sheets ID acima)
