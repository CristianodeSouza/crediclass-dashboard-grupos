# Guia de Testes - Phase 1 (15-21 de Maio de 2026)

## 📋 Objetivo
Validar a Calculadora Imóvel em produção com 5 operadores pilotos usando 20-30 oportunidades reais.

---

## 👥 Operadores Pilotos
- [ ] Operador 1 (Experiência: ?)
- [ ] Operador 2 (Experiência: ?)
- [ ] Operador 3 (Experiência: ?)
- [ ] Operador 4 (Experiência: ?)
- [ ] Operador 5 (Experiência: ?)

---

## ✅ Checklist de Acesso
- [ ] Operadores têm acesso a http://localhost:8000
- [ ] Podem acessar a aba "Calculadora Imóvel"
- [ ] Conseguem digitar IDs de oportunidades no Piperun
- [ ] Recebem feedback visual após cada ação

---

## 🧪 Testes Recomendados

### Teste 1: Auto-fill do Piperun
**Oportunidade:** 59393258 (Ramon Gomes Reis)

1. Digite "59393258" no campo "🔍 Buscar Oportunidade"
2. Clique em 🔍
3. **Verificar auto-fill:**
   - [ ] Crédito Desejado: R$ 400.000,00 (não 400,00)
   - [ ] Lance Máximo: R$ 400.000,00 (não 400,00)
   - [ ] Parcela Desejada: R$ 2.500,00 (não 2,50)
   - [ ] Renda Titular: R$ 200.000,00 (não 200,00)
   - [ ] Nascimento: 24/05/1975 (convertido para formato correto)

4. **Verificar aviso:**
   - [ ] Card amarelo aparece listando dados do cônjuge faltantes
   - [ ] Mensagem mostra: "✓ Ramon Gomes Reis carregado (beatrizcoimbra50@gmail.com)"

---

### Teste 2: Cálculo de Viabilidade
Após auto-fill com 59393258:

1. Clique em "🧮 Executar Cálculo"
2. **Verificar resultado:**
   - [ ] Score de viabilidade aparece: 60% 🟡 (Moderado)
   - [ ] Avisos aparecem (mínimo 3 ADMs com prazo > 180 meses)
   - [ ] Avisos indicam: "Lance muito agressivo (100% imóvel)"

3. **Tabela de Administradoras:**
   - [ ] 6 ADMs aparecem (CNP, ITAÚ, CAOA, PORTO, EMBRACON, RODOBENS)
   - [ ] Todos os campos aparecem formatados corretamente
   - [ ] Botão "Ver grupos →" funciona para cada ADM

---

### Teste 3: Compatibilidade de Grupos
Com PORTO selecionado (melhor taxa):

1. Clique em "Ver grupos →" na linha PORTO
2. **Verificar resultado:**
   - [ ] Aparecem ~18 grupos compatíveis (não 0)
   - [ ] Cada grupo mostra:
     - Número do grupo
     - Crédito Máx. formatado (ex: R$ 500.000,00)
     - Parcela 30% formatada (ex: R$ 5.000,00)
     - Prazo restante em meses
     - Média de lances

---

### Teste 4: Fluxo Completo
1. Buscar oportunidade
2. Executar cálculo
3. Selecionar ADM
4. Selecionar grupo
5. **Verificar preview:**
   - [ ] Mostra 4 simulações
   - [ ] Cada simulação tem valores formatados corretamente
   - [ ] Botão "✓ Gerar Estudo Financeiro Final" aparece

---

## 🔍 Casos Extremos para Testar

### Caso A: Renda Baixa + Parcela Alta
```
Crédito: 300.000
Renda: 3.000
Parcela: 10.000
```
**Resultado esperado:**
- [ ] Score < 50% 🔴 (Alto risco)
- [ ] Aviso: "Parcela > 30% da renda"

### Caso B: Imóvel Pequeno + Lance Agressivo
```
Crédito: 100.000
Lance Máximo: 100.000
Parcela: 2.000
Renda: 10.000
```
**Resultado esperado:**
- [ ] Score < 60% 🟡 (Moderado)
- [ ] Aviso: "Lance muito agressivo (100% imóvel)"

### Caso C: Renda Alta + Parcela Pequena
```
Crédito: 500.000
Renda: 50.000
Parcela: 3.000
Lance: 150.000
```
**Resultado esperado:**
- [ ] Score > 80% 🟢 (Viável)
- [ ] Sem avisos críticos
- [ ] 18+ grupos compatíveis

---

## 📊 Métricas a Acompanhar

### Tempo de Fluxo
- [ ] Auto-fill: < 10 segundos
- [ ] Cálculo: < 5 segundos
- [ ] Seleção de grupo: < 2 segundos
- [ ] **Total por cliente: ~4 minutos**

### Taxa de Sucesso
- [ ] % de oportunidades com dados suficientes
- [ ] % de oportunidades com grupos compatíveis
- [ ] % de operadores conseguindo completar fluxo

### Qualidade de Dados
- [ ] Valores monetários exibidos corretamente
- [ ] Datas convertidas corretamente
- [ ] Avisos aparecem quando esperado

---

## 🐛 Bugs Conhecidos
Nenhum bug crítico identificado.

**Limitações (não bloqueadores):**
- ⚠️ PDF não implementado (placeholder)
- ⚠️ Ranking de ADMs não automático
- ⚠️ Ranking de simulações não automático

---

## 💬 Feedback a Coletar

### Do Operador:
1. Interface é intuitiva? (Sim/Não/Comentário)
2. Velocidade é aceitável? (Rápida/Normal/Lenta)
3. Valores parecem corretos? (Sim/Não/Alguns incorretos)
4. Avisos ajudam a tomar decisão? (Muito/Um pouco/Não ajudam)
5. Faltou algo? (Descrição)

### Do Sistema:
1. Erros ou crashes observados?
2. Performance aceitável (<10s por operação)?
3. Compatibilidade com diferentes oportunidades?

---

## ✅ Critério de Sucesso Phase 1

**PASSAR:**
- [ ] 0 bloqueadores críticos encontrados
- [ ] 100% das oportunidades testadas funcionam
- [ ] Tempo de fluxo < 5 minutos
- [ ] Operadores conseguem usar sem treinamento intenso
- [ ] Valores monetários sempre corretos

**FALHAR:**
- ❌ Crash da aplicação
- ❌ Valores monetários incorretos
- ❌ Auto-fill não funciona
- ❌ Grupos compatíveis = 0 quando deveriam haver

---

## 📅 Timeline

- **15/05 (Segunda):** Liberação para operadores + treinamento rápido
- **16-20/05 (Terça-Sexta):** Testes com ~20-30 oportunidades
- **21/05 (Sábado):** Coleta de feedback, análise de resultados
- **23/05 (Segunda):** Decisão para Phase 2 (expansão para 50% da equipe)

---

## 🎯 Checklist Final Antes de Liberar

- [ ] Servidor rodando sem erros
- [ ] Banco de dados Google Sheets acessível
- [ ] Piperun API respondendo
- [ ] Frontend carregando corretamente
- [ ] Documentação pronta para operadores
- [ ] Contatos dos 5 pilotos confirmados

---

**Preparado em:** 13/05/2026  
**Status:** PRONTO PARA PHASE 1 ✅

