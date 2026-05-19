# 🗺️ Roadmap & Tarefas

Status de cada feature e tarefas em aberto. Atualizado regularmente.

---

## 📊 Visão Geral

| Feature | Status | Prioridade | Prazo |
|---------|--------|-----------|-------|
| Calculadora Base | ✅ Pronto | — | — |
| Buscar Oportunidade (Piperun) | ✅ Pronto | — | — |
| Filtro de Compatibilidade | ✅ Pronto | — | — |
| Score de Viabilidade | ✅ Pronto | — | — |
| **Gerar PDF (Estudo Financeiro)** | ⏳ TODO | 🔴 Alta | 2026-05-31 |
| **Melhorias UI/UX** | ⏳ TODO | 🟡 Média | — |
| **Testes Automatizados** | ⏳ TODO | 🟡 Média | — |
| **Deploy em Produção** | ⏳ TODO | 🟠 Crítica | 2026-06-15 |

---

## 🟢 Pronto (Implementado)

### ✅ Calculadora Financeira
**O que faz:** Simula esquema de consórcio comparando 6 administradoras.

**Fluxo:**
1. Usuario preenche: crédito, prazo, parcela, FGTS, renda
2. Backend calcula para 6 ADMs
3. Usuario seleciona ADM → exibe grupos compatíveis
4. Usuario seleciona grupo → mostra 4 simulações

**Localização:** `frontend/js/app.js` (métodos: `executarCalculo`, `selecionarAdm`, `selecionarGrupo`, `gerarSimulacoes`)

**Fórmulas:**
```
Crédito a Contratar = creditoDesejado / (1 - pctLanceEmbutido)
Lance Máximo % = (Crédito × % Lance + Lance + FGTS) / (Crédito × (1 + Taxa + Fundo))
Prazo Mínimo = (Crédito × (1 + Taxa + Fundo) - (Crédito × % Lance + Lance + FGTS)) / Parcela
```

**Testado com:** Imóvel R$ 400k, parcela R$ 6k, prazo 1-3 anos ✓

---

### ✅ Buscar Oportunidade (Piperun CRM)
**O que faz:** Busca dados da oportunidade no CRM e auto-preenche formulário.

**Endpoint:** `GET /api/piperun/{deal_id}`

**Campos Extraídos:**
- `valor_imovel` → creditoDesejado
- `parcela_maxima` → parcelaDesejada
- `lance_maximo` → lancemaximo
- `renda_mensal` → rendaTitular
- Nome, email, CPF do cliente

**Localização:** `backend/piperun.py` (função `extrair_dados_piperun`)

**Testado com:** Deal #59393258 ✓

---

### ✅ Filtro de Compatibilidade Flexível
**O que faz:** Seleciona grupos cuja capacidade de crédito é suficiente.

**Lógica:**
```javascript
grupo.maior_credito >= (creditoDesejado × 0.70) 
  OR 
(creditoDesejado + lancemaximo) >= (creditoDesejado × 0.95)
```

**Antes:** Muito restritivo (0 grupos para imóvel R$ 400k)
**Depois:** 18+ grupos encontrados ✓

---

### ✅ Score de Viabilidade
**O que faz:** Calcula viabilidade da operação (0-100) com avisos.

**Validações:**
1. **Parcela vs Renda:** parcela ≤ renda × 30%
2. **Prazo Longo:** alerta se prazo > 180 meses
3. **Lance Agressivo:** alerta se lance > 80% do imóvel

**Score:**
- 🟢 Verde (> 75): Viável
- 🟡 Amarelo (50-75): Atenção
- 🔴 Vermelho (< 50): Risco alto

**Localização:** `frontend/js/app.js` (método `validarViabilidade`)

---

### ✅ CRUD de Grupos (Novo - 2026-05-18)
**O que faz:** Operações completas de criar, ler, atualizar e deletar grupos.

**Bugs Corrigidos:**
- 🐛 **#1**: Paginação rejeitava `por_pagina > 100` → Agora aceita até 500
- 🐛 **#2**: Import datetime faltando → Adicionado
- 🐛 **#3**: Campo status faltando em GrupoUpdate → Adicionado
- 🐛 **#4**: POST retornava 200 em vez de 201 → Corrigido

**Endpoints Implementados:**
1. `GET /api/grupos-gerenciador?pagina=1&por_pagina=100` — Listar com paginação
2. `GET /api/grupos/{grupo_id}` — Obter detalhe
3. `PUT /api/grupos/{grupo_id}` — Atualizar grupo
4. `POST /api/grupos` — Criar novo grupo

**Localização:** `backend/main.py` (linhas 25-158)

**Testado:** ✅ Todos os endpoints respondendo corretamente

---

## 🟡 Em Progresso / TODO

### 🔄 Gerar Estudo Financeiro em PDF
**Prioridade:** 🔴 ALTA  
**Prazo:** 2026-05-31

**O que faz:** Exporte simulações em PDF profissional.

**Conteúdo esperado:**
```
┌─────────────────────────────┐
│  ESTUDO FINANCEIRO          │
│  Crediclass Consórcios      │
├─────────────────────────────┤
│ Cliente: João da Silva      │
│ CPF: 123.456.789-00         │
│ Imóvel: R$ 450.000          │
├─────────────────────────────┤
│ QUADRO RESUMO               │
│ • Crédito Máx: R$ 500k      │
│ • Parcela 30%: R$ 4.500     │
│ • Prazo: 60 meses           │
│ • Taxa ADM: 15%             │
├─────────────────────────────┤
│ 4 SIMULAÇÕES                │
│ 1. Sorteio (0% lance)       │
│ 2. Lance Fixo 40%           │
│ 3. Conservador              │
│ 4. Moderado                 │
├─────────────────────────────┤
│ HISTÓRICO DE LANCES (gráfico)
└─────────────────────────────┘
```

**Referência:** `Desktop/EF_Melhores_Consórcios-Itaú-Reduzida_30%-Irmão_da_Bruna-Parcela_de_1.6k.pdf`

**Tecnologia recomendada:** `reportlab` ou `weasyprint`

**Localização prevista:** `backend/pdf_generator.py` + endpoint `POST /api/gerar-pdf`

**Subtarefas:**
- [ ] Instalar `reportlab` em `requirements.txt`
- [ ] Criar função `gerar_pdf_estudo(cliente, grupo, simulacoes)`
- [ ] Endpoint FastAPI que recebe dados e retorna PDF
- [ ] Botão "Gerar Estudo" no frontend chama endpoint
- [ ] Testes com 5+ casos reais

---

### 🎨 Melhorias UI/UX
**Prioridade:** 🟡 MÉDIA  
**Prazo:** Aberto

**Tarefas:**
- [ ] Botões "Voltar" com transições suaves
- [ ] Modo escuro otimizado para impressão
- [ ] Cards de simulação mais visuais (mini-gráficos)
- [ ] Tooltips explicativos nas fórmulas
- [ ] Validação em tempo real (feedback imediato)
- [ ] Responsividade mobile melhorada

**Localização:** `frontend/css/style.css` + `frontend/js/app.js`

---

### 🧪 Testes Automatizados
**Prioridade:** 🟡 MÉDIA  
**Prazo:** Aberto

**Testes necessários:**
1. **Backend (pytest)**
   - [ ] Teste cálculo de crédito a contratar
   - [ ] Teste lance máximo %
   - [ ] Teste prazo mínimo
   - [ ] Teste filtro compatibilidade
   - [ ] Teste score viabilidade

2. **Frontend (Cypress / Playwright)**
   - [ ] Fluxo completo: inputs → cálculo → resultado
   - [ ] Validações de entrada
   - [ ] Buscar oportunidade Piperun
   - [ ] Navegação entre abas

**Localização prevista:** `tests/` com `test_backend.py` + `tests/e2e/`

---

### 🚀 Deploy em Produção
**Prioridade:** 🔴 CRÍTICA  
**Prazo:** 2026-06-15

**Tarefas:**
- [ ] Configurar Vercel (frontend) — vide `GUIA_CI_CD_VERCEL.md`
- [ ] Setup backend em servidor (AWS/Railway/Heroku)
- [ ] Configurar variáveis de ambiente (.env)
- [ ] SSL/HTTPS
- [ ] CI/CD pipeline (.github/workflows)
- [ ] Monitoramento & logging
- [ ] Backup automático de `dados.json`

**Referência:** `.github/workflows/deploy.yml` (parcialmente configurado)

---

## 📋 Checklist de QA (Antes de Deploy)

- [ ] Calculadora funciona com 10+ casos reais
- [ ] PDF gera sem erros
- [ ] Piperun integração testada (5+ deals)
- [ ] Mobile responsivo (testar em 3+ devices)
- [ ] Performance: load time < 2s
- [ ] Segurança: sem XSS, CSRF, SQL injection
- [ ] Backup automático funciona
- [ ] Logs estão sendo capturados
- [ ] Documentação atualizada
- [ ] Testes de regressão passam

---

## 📅 Timeline

| Data | Milestone |
|------|-----------|
| 2026-05-15 | ✓ Documentação organizada (HOJE) |
| 2026-05-20 | PDF gerador implementado |
| 2026-05-25 | Testes automatizados em 50% |
| 2026-05-31 | **FREEZE FEATURES** |
| 2026-06-01 | Phase de testes & bugfixes |
| 2026-06-10 | QA final & sign-off |
| 2026-06-15 | **DEPLOY PRODUÇÃO** |

---

## 🔗 Documentação Relacionada

- [FEATURES.md](FEATURES.md) — detalhes técnicos de cada feature
- [HISTORICO.md](HISTORICO.md) — log de mudanças
- [QUICK_START.md](QUICK_START.md) — setup & troubleshooting
- [../CLAUDE.md](../CLAUDE.md) — overview geral do projeto

