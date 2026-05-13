# Análise: Aba "Qualificador de Cliente" - Mapa de Grupos 2.0

**Data:** 13 de Maio de 2026  
**Fonte:** Mapa de Grupos 2.0 - Jan 2026 (Joyce) - Arquivo: `Cópia de Mapa de Grupos 2.0 - Jan 2026 -Joyce 16_03_26.xlsx`  
**Aba:** "Qualificador de Cliente " (80 linhas x 40 colunas)

---

## 📋 ESTRUTURA GERAL

A aba "Qualificador de Cliente" é um **formulário interativo de simulação** que permite:
1. Inserir dados do cliente (crédito, prazo, renda, etc)
2. Calcular automaticamente limitações (parcela máxima, idade, prazo máximo)
3. Comparar 3 tipos de contratação por diferentes administradoras
4. Identificar público-alvo e modalidades compatíveis

---

## 📥 SEÇÃO 1: INPUTS DO CLIENTE (Linhas 5-11)

| Campo | Célula | Descrição | Tipo | Exemplo |
|-------|--------|-----------|------|---------|
| **Crédito desejado** | B5 | Valor total de crédito que o cliente quer | Numérico | 6.000.000 |
| **Prazo desejado contemplação (m)** | B6 | Quantos meses deseja até contemplação | Numérico | 3 |
| **Recursos para Lance** | B7 | Fórmula: =B5*35% | Calculado | 2.100.000 |
| **Parcela desejada** | B8 | Parcela mensal desejada | Numérico | (vazio no exemplo) |
| **Renda informada** | B9 | Renda mensal bruta do cliente | Numérico | (vazio) |
| **Data Nascimento** | B10 | Data de nascimento (DD/MM/YYYY) | Data | (vazio) |

---

## 🧮 SEÇÃO 2: CÁLCULOS AUTOMÁTICOS (Linhas 5-11)

| Cálculo | Fórmula | Descrição | Célula |
|---------|---------|-----------|--------|
| **Fração RP x Lance** | =IFERROR(B7/B5,"") | Percentual de Lance disponível | F7 |
| **Parcela Máxima** | =B9*30% | Máximo 30% da renda para parcela | F9 |
| **Idade do Cliente** | =IF(B10="","",DATEDIF(B10,K8,"Y")) | Calcula idade a partir do nascimento | F10 |
| **Prazo Máximo do Grupo** | =IF(B11<0,0,B11) | Prazo máximo que o grupo suporta | F11 |

---

## 🏦 SEÇÃO 3: ANÁLISE POR ADMINISTRADORA (Linhas 13-35+)

A aba contém análises para **3 tipos principais de contratação:**

### 1. **Contratação COM Lance Embutido**
   - **Foco:** Público rápido + Investidor
   - **Administradoras:** CNP, ITAÚ, CANOPUS

   **Características:**
   - Lance Livre, Fixo e Sorteio (mesma assembleia)
   - Adaptado para diferentes perfis
   - Fórmulas customizadas por ADM

### 2. **Contratação ITAÚ (Lance Livre)**
   - **Foco:** Contemplação Rápida
   - **Características:** Lance Livre e Sorteio

### 3. **Contratação CANOPUS (Lance Fixo)**
   - **Foco:** Investidor com Parcela Reduzida
   - **Características:** Lance Fixo, limitado, Sorteio e Livre

---

## 📊 DADOS QUE PODEM SER IMPORTADOS PARA CALCULADORA

### ✅ DADOS DIRETAMENTE APLICÁVEIS

1. **Inputs do Cliente** (já temos isso na Calculadora, mas Qualificador tem labels mais detalhados)
   - Crédito Desejado
   - Prazo Desejado
   - Parcela Desejada
   - Renda Mensal
   - Data Nascimento

2. **Cálculos Automáticos** (podemos usar mesmas fórmulas)
   - Fração de Lance (35% ou X% do crédito)
   - Parcela Máxima (30% renda)
   - Idade do Cliente
   - Prazo Máximo do Grupo

3. **Público-Alvo / Perfis de Cliente**
   - Contemplação Rápida (até 4 meses)
   - Investidor (prazo longo, parcela reduzida)
   - Moderado (5-7 meses)
   - Agressivo (8-12 meses)

4. **Modalidades de Lance**
   - Lance Livre
   - Lance Fixo
   - Sorteio Geral

---

## 📐 INTEGRAÇÃO SUGERIDA COM CALCULADORA IMÓVEL

### Na Aba de Estudo Financeiro, Adicionar:

#### 1. **Card de Qualificação do Cliente**
```
┌─────────────────────────────────────────┐
│ QUALIFICAÇÃO DO CLIENTE                 │
├─────────────────────────────────────────┤
│ Perfil: Investidor / Contemplação Rápida│
│ Faixa de Prazo: 5-7 meses               │
│ Lance Sugerido: Fixo 40% (baseado em RP)│
│ Risco do Perfil: Moderado               │
└─────────────────────────────────────────┘
```

#### 2. **Novo Campo: Percentual de Lance Automático**
Usar lógica do Qualificador:
- Lance sugerido = Crédito × 35% (ou 40%, 50% conforme perfil)
- Exibir como sugestão automática

#### 3. **Novo Campo: Perfil de Cliente**
Classificar automaticamente:
```
SE prazo_desejado <= 4 meses → "Contemplação Rápida"
SE prazo_desejado 5-7 meses → "Moderado"
SE prazo_desejado 8-12 meses → "Agressivo"
SE prazo_desejado > 12 meses → "Investidor"
```

#### 4. **Novo Card: Modalidades Recomendadas**
Mostrar quais modalidades se aplicam:
```
✓ Lance Livre (máxima flexibilidade)
✓ Lance Fixo (segurança de contemplação)
✓ Sorteio (menor comprometimento)
```

---

## 🔄 MAPEAMENTO DE CAMPOS

### Calculadora Imóvel → Qualificador de Cliente

| Calculadora | Qualificador | Ação |
|-------------|--------------|------|
| `creditoDesejado` | B5 | ← Importar |
| `prazoDesejado` | B6 | ← Importar |
| `rendaTitular` | B9 | ← Importar |
| `parcelaDesejada` | B8 | ← Importar |
| `nascimentoTitular` | B10 | ← Importar |
| `lancemaximo` | → | ← Sugerir (B5 * 35%) |
| - | F7 | ← Calcular (fração lance) |
| - | F9 | ← Calcular (parcela máxima) |
| - | F10 | ← Calcular (idade) |
| - | F11 | ← Calcular (prazo máximo) |

---

## 🎯 CASO DE USO: INTEGRAÇÃO NA PRÁTICA

**Cenário:** Cliente Ramon Gomes Reis, oportunidade 59393258

**Entrada (Auto-fill do Piperun):**
```
Crédito: 400.000
Prazo: Não definido
Renda: 200.000
Parcela: 2.500
Nascimento: 24/05/1975 (50 anos)
```

**Cálculos do Qualificador (a importar):**
```
Fração Lance: 400.000 * 35% = 140.000
Parcela Máxima: 200.000 * 30% = 60.000
Idade: 50 anos ✓ (maior de idade)
Prazo Máximo: ?
```

**Qualificação do Cliente:**
```
Perfil: INVESTIDOR
  - Prazo indefinido (agressivo)
  - Lance disponível: 140.000 (35% crédito)
  - Parcela: 2.500 (bem abaixo do máximo de 60.000)
  
Recomendação:
  - Usar Lance Fixo (segurança)
  - Percentual: 40-50%
  - Prazo esperado: 12-24 meses
```

---

## 📋 PRÓXIMAS AÇÕES

### Fase 1: Análise Completa (Esta semana)
- [x] Entender estrutura da aba Qualificador
- [x] Identificar campos importáveis
- [x] Mapear relações com Calculadora

### Fase 2: Prototipagem (Próxima semana)
- [ ] Adicionar card de "Perfil do Cliente" na Calculadora
- [ ] Implementar cálculo de "Percentual Lance Sugerido"
- [ ] Implementar cálculo de "Parcela Máxima"
- [ ] Mostrar "Modalidades Recomendadas"

### Fase 3: Integração Completa (2 semanas)
- [ ] Importar fórmulas do Qualificador
- [ ] Testar com 10+ oportunidades reais
- [ ] Validar recomendações

---

## ✅ BENEFÍCIOS DA INTEGRAÇÃO

| Benefício | Impacto | Dificuldade |
|-----------|---------|------------|
| Qualificação automática do cliente | Alto | Baixa |
| Sugestão de percentual de lance | Alto | Média |
| Modalidades recomendadas | Médio | Baixa |
| Validação de compatibilidade | Alto | Média |
| Educação do operador | Alto | Baixa |

---

## 📝 RECOMENDAÇÃO FINAL

**Valor:** Importar dados de "Qualificador de Cliente" para enriquecer a análise da Calculadora Imóvel

**Prioridade:** MÉDIA (melhora UX, mas não é bloqueador)

**Complexidade:** BAIXA (fórmulas bem definidas, mapeamento direto)

**Tempo Estimado:** 4-6 horas de desenvolvimento + testes

**ROI:** Alto - Operador recebe qualificação automática + recomendações, reduzindo confusão e erros

---

Documento preparado em: 13/05/2026  
Status: ANÁLISE COMPLETADA ✅
