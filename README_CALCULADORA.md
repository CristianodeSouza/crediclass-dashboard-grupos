# 🧮 Calculadora Imóvel - Guia Rápido

## ✅ Status Atual
**Versão:** Beta Funcional  
**Data:** 13/05/2026  
**Status:** Pronto para testes em produção

---

## 🚀 Como Usar

### 1. **Buscar Oportunidade do Piperun** (NOVO)
```
1. Aba "Calculadora Imóvel"
2. Campo: "📋 Buscar Oportunidade"
3. Digite ID: 59393258 (exemplo)
4. Clique "🔍"
5. Campos auto-preenchidos ✓
```

### 2. **Executar Cálculo**
```
1. Ajuste valores se necessário
2. Clique "🧮 Executar Cálculo"
3. Veja score de viabilidade + avisos
4. Se score baixo, ajuste e recalcule
```

### 3. **Selecionar Administradora**
```
1. Veja tabela com 6 ADMs
2. Clique em uma (ex: PORTO)
3. Sistema filtra grupos compatíveis
4. Agora ver ~18 grupos disponíveis ✓
```

### 4. **Selecionar Grupo**
```
1. Grid mostra grupos compatíveis
2. Clique "Selecionar →"
3. Veja 4 simulações de contemplação
```

### 5. **Gerar Estudo Financeiro**
```
1. Clique "✓ Gerar Estudo Financeiro Final"
2. (Próxima fase: PDF será gerado)
```

---

## 📊 3 Melhorias Principais

| # | Melhoria | Impacto | Status |
|---|----------|---------|--------|
| 1 | Auto-fill Piperun | ⏱️ -5 min | ✅ |
| 2 | Filtro flexível | 📈 0→18 grupos | ✅ |
| 3 | Score viabilidade | 📚 Educação | ✅ |

---

## 🎯 Dados de Teste

**Oportunidade:** 59393258  
**Cliente:** Ramon Gomes Reis  
**Imóvel:** R$ 400.000  
**Lance:** R$ 400.000  
**Parcela:** R$ 2.500  
**Renda:** R$ 200.000

**Resultado:** ✅ Tudo funcionando

---

## ⚠️ Bugs Conhecidos

| Problema | Severidade | Fix |
|----------|-----------|-----|
| Aviso de parcela invertido | 🟡 Menor | < 10 min |
| PDF não implementado | 🚧 Planejado | 2-3 h |

---

## 📚 Documentação Completa

- **TESTE_USABILIDADE.md** — Análise detalhada de UX/fluxo
- **MELHORIAS_IMPLEMENTADAS.md** — Técnicas das 3 melhorias
- **TESTE_PRATICO_OPERADOR.md** — Simulação real com tempo
- **RELATORIO_EXECUTIVO.md** — Resumo executivo completo

---

## 🔧 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `frontend/js/app.js` | +3 métodos, +2 validações |
| `frontend/index.html` | +input Piperun, +score card |
| `backend/piperun.py` | Corrigido parser (double colons) |
| `CLAUDE.md` | Documentação atualizada |

---

## 📞 Para Testar

1. Abra: http://localhost:8000
2. Clique aba: "Calculadora Imóvel"
3. Digite ID: 59393258
4. Clique 🔍
5. Clique "Executar Cálculo"
6. Veja resultados + avisos

---

## ⏭️ Próximas Fases

- [ ] Fix do aviso de parcela (10 min)
- [ ] Testes com 10 oportunidades (1 h)
- [ ] Ranking ADMs/Simulações (2 h)
- [ ] PDF Final (2-3 h)
- [ ] Deploy em produção (20/05)

---

**Última atualização:** 13/05/2026 às 14:30
