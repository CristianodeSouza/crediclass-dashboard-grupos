# 📊 Análise Completa das Colunas da Planilha Base

**Planilha:** Tabela de Grupos 3.0  
**ID:** 1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM  
**Intervalo:** A:EF (156 colunas)  
**Status:** Ativa e em produção  

---

## 📋 Colunas Mapeadas para o Frontend

### **Seção 1: Identificação do Grupo**

| # | Coluna | Campo | Tipo | Descrição | Uso |
|---|--------|-------|------|-----------|-----|
| 1 | **A** | `adm` | Text | **Administradora** - Nome da empresa gestora (ITAÚ, CAOA, PORTO, EMBRACON, RODOBENS, CNP, etc) | Filtro principal, card header, comparativo |
| 2 | **B** | `grupo` | Text | **ID do Grupo** - Identificador único do consórcio | PK, busca, detalhe, gerenciador |
| 3 | **C** | `tipo_bem` | Text | **Tipo de Bem** - Imóvel, Auto, outros | Filtro, categoria, segmentação |

---

### **Seção 2: Cronograma e Vigência**

| # | Coluna | Campo | Tipo | Descrição | Uso |
|---|--------|-------|------|-----------|-----|
| 4 | **D** | `primeira_assembleia` | Date | **Primeira Assembleia** - Data de início do grupo (ex: 9/29/2021) | Timeline, cálculo de meses |
| 5 | **E** | `prazo_grupo` | Integer | **Prazo Total** - Duração total do grupo em meses (ex: 80) | Cálculo de vida, progressão |
| 6 | **F** | `prazo_restante` | Integer | **Prazo Restante** - Meses até encerramento (ex: 26) | Status, urgência, indicador |
| 7 | **G** | `meses_corridos` | Integer | **Meses Corridos** - Quantos meses já passaram (ex: 54) | Progressão visual, gráfico |
| 8 | **H** | `data_termino` | Date | **Data de Término** - Quando o grupo encerra (ex: 5/29/2028) | Previsão, status, contagem regressiva |
| 9 | **I** | `vida_grupo_pct` | Percentage | **Vida do Grupo %** - Percentual de conclusão (ex: 68%) | Barra de progresso, status visual |

---

### **Seção 3: Configuração de Crédito e Valores**

| # | Coluna | Campo | Tipo | Descrição | Uso |
|---|--------|-------|------|-----------|-----|
| 10 | **K** | `venc` | Text | **Vencimento** - Dia do mês (ex: "15") | Referência de parcela |
| 11 | **L** | `menor_credito` | Currency | **Menor Crédito** - Valor mínimo de financiamento (ex: 28.502,34) | Filtro min, card, comparativo |
| 12 | **M** | `maior_credito` | Currency | **Maior Crédito** - Valor máximo de financiamento (ex: 51.304,20) | Filtro max, card, simulador |

---

### **Seção 4: Taxas e Custos**

| # | Coluna | Campo | Tipo | Descrição | Uso |
|---|--------|-------|------|-----------|-----|
| 13 | **N** | `taxa_adm` | Percentage | **Taxa de Administração** - Percentual cobrado pela ADM (ex: 17%) | Comparativo, cálculo total |
| 14 | **Q** | `taxa_promocao` | Percentage | **Taxa de Promoção** - Custo de marketing/promoção | Custo adicional |
| 15 | **T** | `fundo_rsv` | Percentage | **Fundo de Reserva** - Percentual para fundo (ex: 3%) | Custo operacional |

---

### **Seção 5: Parcelas e Valores de Entrada**

| # | Coluna | Campo | Tipo | Descrição | Uso |
|---|--------|-------|------|-----------|-----|
| 16 | **U** | `prestacao_integral` | Currency | **Prestação Integral** - Valor cheio da mensalidade | Comparativo, cálculo |
| 17 | **V** | `meia_reduzida` | Currency | **Meia Reduzida** - 50% da prestação integral | Opção alternativa |
| 18 | **AM** | `parcela_inicial` | Currency | **Parcela Inicial** - Primeira parcela do consórcio (ex: 1.253,17) | Simulador, entrada |

---

### **Seção 6: Simulações de Modalidades (% de Lance)**

| # | Coluna | Campo | Tipo | Descrição | Uso |
|---|--------|-------|------|-----------|-----|
| 19 | **AA** | `investidor` | Percentage | **Investidor** - Lance fixo inicial para quem investe | Modalidade investidor |
| 20 | **AB** | `conservador_24m` | Percentage | **Conservador (24m)** - Lance crescente a cada 24 meses (ex: 39%) | Simulador, modalidade |
| 21 | **AC** | `moderado_12m` | Percentage | **Moderado (12m)** - Lance crescente a cada 12 meses (ex: 39%) | Simulador, modalidade |
| 22 | **AD** | `agressivo_6m` | Percentage | **Agressivo (6m)** - Lance crescente a cada 6 meses (ex: 39%) | Simulador, modalidade |
| 23 | **AE** | `super_agressivo_3m` | Percentage | **Super Agressivo (3m)** - Lance crescente a cada 3 meses (ex: 39%) | Simulador, modalidade |

---

### **Seção 7: Estatísticas de Lance**

| # | Coluna | Campo | Tipo | Descrição | Uso |
|---|--------|-------|------|-----------|-----|
| 24 | **AF** | `lance_quitacao` | Percentage | **Lance de Quitação** - Desconto para quem paga tudo (ex: xx%) | Benefício, quitação |
| 25 | **AG** | `media_lance` | Percentage | **Média de Lance** - Média histórica de lances no mês (ex: 25,42%) | Estatística, comparação |
| 26 | **AH** | `media_contemp` | Percentage | **Média de Contemplação** - Taxa média de contemplação | Previsão, probabilidade |

---

### **Seção 8: Categorização**

| # | Coluna | Campo | Tipo | Descrição | Uso |
|---|--------|-------|------|-----------|-----|
| 27 | **AL** | `categoria` | Text | **Categoria** - Classificação adicional (ex: "350887,9") | Segmentação, filtro avançado |

---

### **Seção 9: Histórico de Lances (Dinâmico)**

| # | Coluna Padrão | Campo | Tipo | Descrição | Uso |
|---|---|---|------|-----------|-----|
| 28+ | **Variável** | `historico` | Array | **Histórico de 36 meses** - Para cada mês (JAN-24 até JUN-26): | Gráfico de tendência |
| | | `mes` | Text | Mês em formato "MMM-YY" | Eixo X |
| | | `maior` | Percentage | Maior lance do mês | Gráfico, máximo |
| | | `menor` | Percentage | Menor lance do mês | Gráfico, mínimo |
| | | `qtd` | Integer | Quantidade de contemplados | Volume, análise |

**Padrão de coluna:** `"JAN-24\nMaior Lance"`, `"JAN-24\nMenor Lance"`, `"JAN-24\nQtd"`  
**Meses cobertos:** 36 meses (JAN-24 até JUN-26)  
**Construído dinamicamente** no código a partir dos dados brutos

---

## 🔄 Fluxo de Dados

```
Google Sheets (Tabela de Grupos 3.0)
    ↓
sheets.py: fetch_grupos() → parse columns A:EF
    ↓
Processamento de dados:
  - Parse de percentuais (replace %, replace . com ,)
  - Parse de moeda (remove pontos de milhar, substitui , por .)
  - Parse de inteiros
  - Construção de histórico (36 meses)
    ↓
Cache local: data/grupos.json (atualizado a cada refresh)
    ↓
FastAPI endpoints:
  - /api/grupos → listar com filtros
  - /api/stats → estatísticas agregadas
  - /api/grupos-gerenciador → CRUD de grupos
    ↓
Frontend: index.html (Alpine.js + Chart.js)
  - Aba "Calculadora": simulação com filtros
  - Aba "Gerenciador": CRUD completo
  - Visualizações: cards, tabelas, gráficos
```

---

## 🛠️ Transformações Aplicadas

### 1. **Parse de Percentuais**
```python
# Input: "39%" → Output: 39.0
value.replace("%", "").replace(",", ".").strip()
```

### 2. **Parse de Moeda**
```python
# Input: "1.253,17" → Output: 1253.17
value.replace(".", "").replace(",", ".").strip()
```

### 3. **Parse de Inteiros**
```python
# Input: "80" → Output: 80
int(str(value).strip())
```

### 4. **Construção de Histórico**
- Itera sobre 36 meses (JAN-24 até JUN-26)
- Procura 3 colunas por mês: `{MES}\nMaior Lance`, `{MES}\nMenor Lance`, `{MES}\nQtd`
- Cada entrada tem: `{"mes": "JAN-24", "maior": 58.75, "menor": 58.75, "qtd": 14}`

---

## ⚠️ Campos Opcionais (podem ser NULL)

Estes campos podem não estar presentes em todas as linhas:
- `taxa_promocao` (Coluna Q)
- `prestacao_integral` (Coluna U)
- `meia_reduzida` (Coluna V)
- `investidor` (Coluna AA)
- `historia` (se não houver meses com dados)

---

## 📊 Totais na Planilha (Status Atual)

| Métrica | Valor |
|---------|-------|
| **Total de Grupos** | 342 |
| **Administradoras Únicas** | 9 (ITAÚ, CAOA, PORTO, EMBRACON, RODOBENS, CNP, AUTO-ITAÚ, AUTO-CAOA, AUTO-CAIXA, CAIXA, CANOPUS) |
| **Tipos de Bem** | 3 (Imóvel, Auto, em branco) |
| **Colunas Totais** | 156 (A:EF) |
| **Colunas Mapeadas** | 27 |
| **Meses de Histórico** | 36 (JAN-24 até JUN-26) |
| **Média de Lance Geral** | 53,89% |

---

## 🔍 Colunas Não Mapeadas

Existem ~129 colunas na planilha que **não estão sendo utilizadas** no frontend atual. Estas podem ser:
- Dados históricos arquivados
- Cálculos intermediários da planilha
- Informações administrativas internas
- Campos para funcionalidades futuras

**Se necessário consultar essas colunas**, o intervalo é `A:EF` (todas as 156 colunas estão disponíveis na API).

---

## 🚀 Como Adicionar Nova Coluna

1. **Na planilha Google Sheets:** Adicione a coluna com dados
2. **No sheets.py:** Encontre o índice da coluna (conte a partir de 0)
3. **Adicione ao mapeamento:**
   ```python
   "novo_campo": parse_percent(row[INDEX] if len(row) > INDEX else ""),
   ```
4. **Teste localmente:** `python main.py` e acesse a API
5. **Commit e deploy:** Git push → Render vai fazer redeploy automático

---

## 📝 Última Atualização

- **Data:** 2026-05-19
- **Fonte:** Análise do código `backend/sheets.py`
- **Planilha sincronizada:** Sim ✓
- **Deploy:** Render.com (https://crediclass-dashboard-grupos.onrender.com)
