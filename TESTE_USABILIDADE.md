# Teste de Usabilidade - Calculadora Imóvel
## Oportunidade 59393258 - Ramon Gomes Reis

### Dados do Cliente (Extraídos do Piperun)
- **Nome:** Ramon Gomes Reis
- **Email:** beatrizcoimbra50@gmail.com
- **CPF:** 064.789.596.00
- **Nascimento:** 24/05/1975
- **Estado Civil:** União Estável - Separação de Bens
- **Profissão:** Empresário
- **Renda Mensal:** R$ 200.000

### Parâmetros da Oportunidade
- **Valor do Imóvel:** R$ 400.000
- **Recurso Próprio Máximo:** R$ 400.000
- **Parcela Desejada:** R$ 2.500
- **Prazo de Aquisição:** 6 meses
- **Imóvel Definido:** Não
- **Tipo de Imóvel:** Casa fora de condomínio
- **Localização:** Imóvel urbano (IPTU)

---

## Simulação do Fluxo do Operador

### PASSO 1: Auto-preenchimento via Piperun ❌ **MELHORIA CRÍTICA**

**Comportamento Esperado:**
- Operador clica em "Buscar Oportunidade" (novo botão)
- Digita deal_id: `59393258`
- Sistema faz GET /api/piperun/{deal_id}
- Campos são auto-preenchidos:
  - `creditoDesejado` ← 400.000
  - `lancemaximo` ← 400.000
  - `parcelaDesejada` ← 2.500
  - `rendaTitular` ← 200.000

**Status Atual:** ❌ Não implementado
- Falta botão "Buscar Oportunidade" no formulário
- Falta integração de auto-fill com /api/piperun
- Operador precisa digitar manualmente todos os campos

**Impacto:** Operador gasta ~5 min preenchendo dados que já existem no CRM

---

### PASSO 2: Cálculo com Dados Reais

**Inputs:**
```
creditoDesejado: 400000
parcelaDesejada: 2500
lancemaximo: 400000
rendaTitular: 200000
```

**Resultado:** Prazos muito altos (96-188 meses) porque parcela desejada é muito baixa

**MELHORORIA 1:** Validação de viabilidade
- Avisar se `parcelaDesejada < renda × 0.30` (máx 30% da renda)
- Avisar se prazo > 180 meses (fora dos limites)
- Score de viabilidade (0-100)

---

### PASSO 3: Compatibilidade de Grupos ❌ **CRÍTICO**

**Problema:** Filtro atual exige `maior_credito >= 400.000 × 0.9 = 360.000`

**Realidade:** Maioria dos grupos têm máximo de R$ 150k-300k

**Resultado:** Nenhum ou pouquíssimos grupos compatíveis

**MELHORORIA 2:** Redesenhar filtro de compatibilidade
```javascript
// Atual: grupo.maior_credito >= creditoDesejado * 0.9
// Proposto: grupo.maior_credito >= creditoDesejado * 0.70 OU
//           grupo.maior_credito + lance_disponivel >= creditoDesejado * 0.95
```

---

### PASSO 4: Indicadores de Risco ❌

**Problema:** Lance máximo = R$ 400.000 (100% do imóvel)
- Muito agressivo
- Reduz chance de contemplação

**Indicadores visuais propostos:**
- 🟢 Verde: 0-30% (conservador)
- 🟡 Amarelo: 30-60% (moderado)
- 🔴 Vermelho: 60%+ (agressivo/risco alto)

---

### PASSO 5: Recomendação de Simulação ❌

**Problema:** 4 simulações sem orientação
- Operador não sabe qual escolher
- Falta contexto de risco

**Solução:** Ranking com recomendações
1. **Lance Moderado:** "Bom balanço risco/segurança"
2. **Lance Conservador:** "Mais seguro, risco menor"
3. **Lance Fixo 40%:** "Equilibrado, tempo definido"
4. **Sorteio Geral:** "Risco máximo"

---

### PASSO 6: Gerar Estudo Financeiro ❌

**Status:** Placeholder não implementado

**Requerimentos:**
- Cabeçalho com dados do cliente
- Sumário executivo (viabilidade: ALTA/MÉDIA/BAIXA)
- Tabela comparativa de ADMs
- 4 simulações com gráficos
- Histórico de lances do grupo
- Matriz de risco
- Recomendação final com data de adesão

---

## 🎯 Melhorias Propostas (Ordem de Prioridade)

### **CRÍTICAS:**
1. ✅ **Buscar Oportunidade + Auto-fill** (implementar botão com Piperun)
2. ✅ **Flexibilizar filtro de grupos** (reduzir de 90% para 70-75%)
3. ✅ **Validações de viabilidade** (parcela, prazo, score)

### **ALTAS:**
4. **Indicadores visuais de risco** (cores para lance %)
5. **Ranking/recomendação de simulações**
6. **Clareza de termos financeiros** (tooltips, renomear colunas)

### **MÉDIAS:**
7. **Destaque da ADM mais vantajosa** (badge com recomendação)
8. **Validação de parcela realista**

### **BAIXAS:**
9. **Implementar PDF final**
10. **Histórico de lances gráfico**

---

## Conclusão

**Status:** ⚠️ Versão Beta - Funcional, mas com gaps críticos

**Recomendação:** Implementar as 3 melhorias críticas antes de usar em produção
