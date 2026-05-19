# 📋 ANÁLISE DETALHADA: GERENCIADOR DE GRUPOS

## 🎯 ESTRUTURA DE DADOS CRÍTICA

### Dados Disponíveis (Planilha Google Sheets)
- **Administradoras:** 9 no total (CNP, ITAÚ, CAOA, PORTO, EMBRACON, RODOBENS + 3 não identificadas)
- **Grupos:** 342 grupos ativos
- **Período Histórico:** JAN-24 até DEC-26 (36 meses)
- **Dados Mensais (CRÍTICOS):**
  - `Maior Lance` (maior leilão do mês)
  - `Menor Lance` (menor leilão do mês)
  - `DTE` (Quantidade de contemplações - MUITO IMPORTANTE)

### Dados Estruturados no Backend
```
historico: [
  { mes: "JAN-24", maior: X%, menor: Y%, qtd: Z },
  { mes: "FEB-24", maior: X%, menor: Y%, qtd: Z },
  ...
]
```

---

## ❌ PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1️⃣ DADOS HISTÓRICOS MENSAIS NÃO VISÍVEIS
- **Problema:** Tabela não mostra nenhum dado mensal
- **Impacto:** Operador IMPOSSÍVEL de analisar trends de maior/menor lances e contemplações
- **Solução Necessária:** Exibir dados mensais (pelo menos últimos 12 meses) em formato visual

### 2️⃣ CRUD PRIMITIVO E INCOMPLETO

#### Editar (EDIT)
- **Atual:** Apenas `prompt()` para mudar ADM - TERRÍVEL UX
- **Falta:** Campos não editáveis:
  - Tipo de bem
  - Categoria
  - Dados mensais (Maior Lance, Menor Lance, DTE)
  - Taxa ADM
  - Prazo Restante
  - Vida do Grupo (%)
- **Solução:** Modal com formulário completo com abas (dados básicos, histórico mensal, etc)

#### Criar (CREATE)
- **Atual:** Apenas 2 prompts (ADM + ID) - INSUFICIENTE
- **Falta:** Não permite inserir:
  - Histórico mensal (JAN-24 a DEC-26)
  - Tipo de bem
  - Categoria
  - Dados financeiros
- **Solução:** Modal com wizard multi-step ou abas (básico → histórico mensal)

#### Deletar (DELETE)
- **Atual:** Funciona mas sem confirmação visual clara
- **Problema:** Depois de deletar, não recarrega lista sem refresh manual
- **Solução:** Confirmação visual + reload automático

#### Visualizar (READ)
- **Problema:** Tabela mostra apenas 6 colunas, esconde dados críticos
- **Falta:** Histórico mensal, vida_grupo_pct, prazo_restante, taxa_adm, etc
- **Solução:** Tabela com mais colunas + detalhe expandível por grupo

---

## 📱 PROBLEMAS DE USABILIDADE (DESKTOP)

### Tabela Atual (Muito Limitada)
| Campo | Status | Problema |
|-------|--------|----------|
| ADM | ✅ Visível | OK |
| Grupo ID | ✅ Visível | OK |
| Menor Crédito | ✅ Visível (xl:) | OK |
| Maior Crédito | ✅ Visível | OK |
| Taxa ADM | ✅ Visível (sm:) | OK |
| **Ações** | ✅ Visível | Primitivo: prompt() |
| **Vida Grupo %** | ❌ Oculto | CRÍTICO |
| **Prazo Restante** | ❌ Oculto | CRÍTICO |
| **Histórico Mensal** | ❌ Oculto | **MUITO CRÍTICO** |
| **Meses Corridos** | ❌ Oculto | Importante |
| **Data Término** | ❌ Oculto | Importante |

---

## 📱 PROBLEMAS DE RESPONSIVIDADE (MOBILE)

### Problemas Atuais:
1. **Cards:** Mostram apenas 3 dados (ADM, Grupo, Maior Crédito, Taxa ADM)
2. **Falta:** Histórico mensal não é acessível em mobile
3. **Edição:** Prompt() é péssimo em mobile, precisa de modal
4. **Filtros:** Ocupam muito espaço, precisam melhor organização
5. **Overflow:** Dados podem não caber em telas pequenas

### Solução:
- Cards expandíveis com dados principais
- Abas dentro do card para dados adicionais
- Modal lateral para editar (em vez de prompt)
- Histórico mensal em gráfico mini ou lista expandível

---

## 🛠️ MUDANÇAS E MELHORIAS NECESSÁRIAS

### FASE 1: EXIBIÇÃO DE DADOS (Desktop + Mobile)

#### 1.1 Tabela Desktop - Adicionar Colunas
```
ADM | Grupo ID | Vida % | Prazo | Maior Crédito | Taxa ADM | Ações
```

#### 1.2 Tabela Desktop - Detalhe Expandível
Quando clicar em uma linha, expandir mostrando:
- Tipo de Bem / Categoria
- Meses Corridos / Data Término
- Histórico Mensal (tabela com últimos 12 meses)
- Todas as taxas (promoção, fundo rsv, etc)

#### 1.3 Cards Mobile - Expandíveis
Card principal com:
- ADM, Grupo ID, Vida %, Prazo
- Maior Crédito, Taxa ADM
- Botão "Expandir" para ver:
  - Dados completos
  - Histórico mensal
  - Ações (editar/deletar)

#### 1.4 Modal para Histórico Mensal
- Tabela com 36 meses (JAN-24 a DEC-26)
- Colunas: Mês | Maior Lance | Menor Lance | DTE (Qty)
- Filtros por ano/trimestre
- Gráfico mini de tendência

---

### FASE 2: CRUD COMPLETO

#### 2.1 Modal EDITAR (Substitui prompt())
**Abas:**
1. **Dados Básicos**
   - ADM (select com 9 opcões)
   - Tipo de Bem
   - Categoria
   - Status (ativo/inativo)

2. **Dados Financeiros**
   - Menor Crédito
   - Maior Crédito
   - Taxa ADM (%)
   - Taxa Promoção (%)
   - Fundo Reserva (%)
   - Parcela Integral / Meia Reduzida

3. **Prazos**
   - Prazo Total (Meses)
   - Prazo Restante (Meses)
   - Data Término

4. **Histórico Mensal** ← CRÍTICO
   - Tabela 12x3 (últimos 12 meses)
   - Colunas editáveis: Maior Lance | Menor Lance | DTE
   - Botão "Carregar todos 36 meses"

#### 2.2 Modal CRIAR (Wizard Multi-Step)
**Step 1: Dados Básicos**
- ADM (select obrigatório)
- Grupo ID (obrigatório)
- Tipo de Bem (obrigatório)
- Categoria (obrigatório)

**Step 2: Dados Financeiros**
- Menor/Maior Crédito
- Taxas (ADM, Promoção, etc)

**Step 3: Prazos**
- Data Primeira Assembleia
- Prazo Total / Restante
- Data Término

**Step 4: Histórico Mensal** (Importante)
- Input table para 36 meses (JAN-24 a DEC-26)
- Cada mês: Maior Lance | Menor Lance | DTE

**Step 5: Revisão e Salvar**
- Preview dos dados
- Botão "Criar Grupo"

#### 2.3 Função DELETAR - Melhorada
- Modal confirmação (não alert)
- Mostrar nome do grupo a deletar
- Botões: "Cancelar" e "Sim, Deletar"
- Após deletar: reload automático da lista

---

### FASE 3: FILTROS MELHORADOS

#### Filtros Atuais (Funciona, mas incompleto)
- ADM ✅
- Status ✅
- Crédito Mínimo ✅
- Crédito Máximo ✅
- Busca (ID/ADM) ✅

#### Filtros a Adicionar
- ❌ Tipo de Bem
- ❌ Categoria
- ❌ Prazo (min/max)
- ❌ Vida do Grupo % (min/max)
- ❌ Taxa ADM (min/max)

---

### FASE 4: VALIDAÇÃO E FEEDBACK

#### Validação de Entrada
- ✅ ADM: 9 opcões válidas
- ✅ Campos obrigatórios
- ✅ Valores numéricos corretos
- ✅ Datas válidas
- ✅ DTE (Qtd) = número inteiro

#### Feedback Visual
- ✅ Loading spinner durante operações
- ✅ Toast/Snackbar para sucesso/erro
- ✅ Validação em tempo real
- ✅ Confirmação antes de deletar

---

### FASE 5: SINCRONIZAÇÃO E PERSISTÊNCIA

#### Problema Atual
- Dados carregados de 500 grupos via API
- Edições NUNCA são salvas na Google Sheets
- Ao fazer refresh, alterações perdidas

#### Solução
- ✅ Backend deve salvar em Google Sheets (ou cache persistente)
- ✅ Endpoint PUT deve atualizar dados reais
- ✅ Endpoint POST deve adicionar grupo novo
- ✅ Endpoint DELETE deve remover grupo

---

## 📊 RESUMO DOS ERROS POR CATEGORIA

### Dados (crítico)
1. Histórico mensal não visível ❌
2. Apenas 6 colunas visíveis, 30+ campos escondidos ❌
3. Dados não persistem após edição ❌

### CRUD (muito crítico)
1. Editar = prompt() primitivo ❌
2. Criar = 2 inputs apenas ❌
3. Deletar sem confirmação visual adequada ❌
4. Nenhum campo mensal editável ❌

### UX (crítico)
1. Mobile: cards não mostram dados históricos ❌
2. Tabela desktop: muito limitada ❌
3. Sem modais para operações CRUD ❌
4. Sem validação de dados ❌

### Filtros (importante)
1. Faltam 5 filtros (tipo bem, categoria, prazo, vida%, taxa) ❌

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Backend: Endpoint PUT com persistência real
- [ ] Backend: Endpoint POST com todos os 40+ campos
- [ ] Frontend: Modal EDITAR com 4 abas
- [ ] Frontend: Modal CRIAR com 5 steps
- [ ] Frontend: Modal confirmação DELETAR
- [ ] Frontend: Tabela desktop com 8+ colunas + expand
- [ ] Frontend: Cards mobile expandíveis
- [ ] Frontend: Histórico mensal visual (tabela/gráfico)
- [ ] Frontend: 5 filtros adicionais
- [ ] Frontend: Validação e feedback visual
- [ ] Frontend: Responsividade completa
- [ ] Testes em produção
