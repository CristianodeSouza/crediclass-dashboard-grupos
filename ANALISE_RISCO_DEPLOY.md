# ANÁLISE DE RISCO — DEPLOY EM PRODUÇÃO

**Data:** 27/05/2026  
**Projeto:** Crediclass Dashboard Grupos  
**Avaliador:** QA Validation Suite  
**Verdict:** ⚠️ **NÃO RECOMENDADO PARA DEPLOY** (críticos devem ser corrigidos primeiro)

---

## MATRIZ DE RISCO

| Severidade | Qty | Bloquer Deploy? | Impacto |
|-----------|-----|-----------------|---------|
| CRÍTICO | 2 | SIM | Perda de dados, corrupção |
| ALTO | 2 | SIM* | Dados desatualizados |
| MÉDIO | 4 | NÃO | Performance, edge cases |
| **Total** | **8** | **SIM** | **Não seguro** |

*SIM para PROB-004 em ambiente com muita latência de rede

---

## RISK SCORES

### PROB-001: get_service() não valida build()
```
Probabilidade de erro: ALTA (80%)
  - Google API pode falhar em qualquer momento
  - Não há timeout explícito
  - Ambiente Render pode ter latência variável

Impacto se falhar: CRÍTICO
  - Service = None
  - Sincronização retorna False silenciosamente
  - Usuário não sabe que falhou

Score CVSS: 7.5 (ALTO)
  - Confidentialidade: NENHUMA
  - Integridade: ALTA (dados não sincronizados)
  - Disponibilidade: MÉDIA (funciona mas sem sync)

Risco Total: CRÍTICO
```

### PROB-007: atualizar_grupo_sheets() cache ANTES de sync
```
Probabilidade de erro: ALTA (70%)
  - Sincronização falha se API está instável
  - Network timeouts são comuns em produção

Impacto se falhar: CRÍTICO
  - Cache tem dados nunca validados
  - Discrepância entre local (cache) e remoto (Sheets)
  - Impossível recuperar estado anterior
  - Próxima leitura retorna dados inconsistentes

Score CVSS: 8.5 (CRÍTICO)
  - Confidentialidade: NENHUMA
  - Integridade: CRÍTICA (dados inconsistentes)
  - Disponibilidade: ALTA (sistema desorientado)

Risco Total: CRÍTICO
```

### PROB-002: Campos não mapeados ignorados
```
Probabilidade de erro: MÉDIA (40%)
  - Ocorre apenas se novo campo adicionado

Impacto se falhar: ALTO
  - Dados perdidos silenciosamente
  - Usuário não sabe

Score CVSS: 5.0 (MÉDIO)
  - Integridade: ALTA

Risco Total: ALTO
```

### PROB-004: fetch_grupos() retorna cache desatualizado
```
Probabilidade de erro: MÉDIA (60%)
  - Ocorre se Google API falha ou está lenta

Impacto se falhar: ALTO
  - Usuário vê dados de 1-7 dias atrás
  - Sem indicação visual de problema
  - Recomendações baseadas em dados desatualizados

Score CVSS: 6.0 (MÉDIO-ALTO)
  - Confidentialidade: NENHUMA
  - Integridade: MÉDIA (dados desatualizados)
  - Disponibilidade: ALTA (vê dados antigos)

Risco Total: ALTO
```

---

## CENÁRIOS DE FALHA

### Cenário 1: Google Sheets API timeout (15-30s)
**Como ocorre:** Render instância lenta, latência de rede alta
**Fluxo:**
1. Usuário edita grupo
2. PUT /api/grupos/2125
3. atualizar_grupo_sheets() é chamado
4. sincronizar_grupo_ao_sheets() tenta conectar Google Sheets
5. **TIMEOUT em 30s**
6. Retorna False
7. **Cache já foi atualizado (PROB-007)**
8. Usuário vê "sucesso" mas Google Sheets não sincronizou

**Consequência:** Discrepância entre cache local e Google Sheets

**Probabilidade em produção:** MUITO ALTA (25-40% em Render)

---

### Cenário 2: Novo campo adicionado (ex: "comissao_vendedor")
**Como ocorre:** Developer adiciona novo campo sem atualizar mapa
**Fluxo:**
1. Nova coluna adicionada ao Google Sheets
2. Frontend envia: `{"maior_credito": 350000, "comissao_vendedor": 5.5}`
3. sincronizar_grupo_ao_sheets() recebe dados
4. Campo "comissao_vendedor" NÃO está em mapa_campo_para_coluna()
5. **É ignorado silenciosamente (PROB-002)**
6. Google Sheets não é atualizado
7. Cache é atualizado (sem o campo)

**Consequência:** Dados perdidos, usuário não sabe

**Probabilidade em produção:** MÉDIA (ocorre quando novo campo é adicionado)

---

### Cenário 3: Network instável — fetch_grupos() falha
**Como ocorre:** Render ↔ Google API latência alta
**Fluxo:**
1. Frontend requisita /api/grupos
2. fetch_grupos() tenta API
3. **TIMEOUT ou erro de conexão**
4. Retorna cache antigo (sem metadados)
5. Usuário vê dados de 5 dias atrás
6. **Sem saber que é stale**

**Consequência:** Decisões baseadas em dados antigos

**Probabilidade em produção:** ALTA (especialmente em horários de pico)

---

## IMPACTO FINANCEIRO

Se sincronização falha silenciosamente:

1. **Grupo 2125 com maior_credito desatualizado**
   - Usuário vê valor de semana passada
   - Recomenda modalidade baseada em valor antigo
   - Cliente pega crédito menor que poderia
   - Perda: ~1-5% de conversão por grupo

2. **Discrepância com Google Sheets**
   - Gerenciador vê um valor
   - Sistema vê outro
   - Confusão no acompanhamento

3. **Multiplicado por 342 grupos**
   - Se 10% dos updates falham silenciosamente
   - ~34 grupos com dados incorretos por dia
   - Impacto acumulativo

---

## COMPARAÇÃO: ANTES vs. DEPOIS DE CORRIGIR

### ANTES (Status Atual)
```
PUT /api/grupos/2125
├─ atualizar_grupo_sheets()
│  ├─ fetch_grupos(force_refresh=True)   ✓
│  ├─ find grupo_idx                      ✓
│  ├─ registrar mudanças                  ✓
│  ├─ grupos[idx].update(dados)          ✓
│  ├─ save cache (SEM VALIDAÇÃO)         ✗ PROB-007
│  ├─ sincronizar_grupo_ao_sheets()
│  │  ├─ get_service()                   ✗ PROB-001 (sem try/except)
│  │  ├─ validate dados                  ✗ PROB-003 (insuficiente)
│  │  ├─ avisar campos não mapeados      ✗ PROB-002 (silencioso)
│  │  └─ sync result = False (timeout)
│  └─ return False ← Cache já foi atualizado!
└─ HTTP 200 "sucesso"

RESULTADO: Cache ≠ Google Sheets
DETECTÁVEL: NÃO (sem metadados em PROB-004)
RECUPERÁVEL: NÃO
```

### DEPOIS (Após Corrigir)
```
PUT /api/grupos/2125
├─ atualizar_grupo_sheets()
│  ├─ fetch_grupos(force_refresh=True)   ✓
│  ├─ find grupo_idx                      ✓
│  ├─ VALIDAR dados                      ✓ (Pydantic schema)
│  ├─ sincronizar_grupo_ao_sheets()
│  │  ├─ get_service() com try/except    ✓ PROB-001 FIXADO
│  │  ├─ if not service: return False    ✓
│  │  ├─ avisar campos não mapeados      ✓ PROB-002 FIXADO
│  │  ├─ avisar se duplicado             ✓ PROB-005 FIXADO
│  │  ├─ sync to Google Sheets           ✓
│  │  └─ return True
│  ├─ if sync_result:
│  │  └─ save cache com metadados        ✓ PROB-004 FIXADO
│  └─ registrar auditoria                ✓
└─ HTTP 200 "sucesso"

RESULTADO: Cache === Google Sheets
DETECTÁVEL: SIM (metadados contêm source)
RECUPERÁVEL: SIM (sync antes de cache)
```

---

## RECOMENDAÇÃO FINAL

### Opção A: Deploy HOJE (NÃO RECOMENDADO)
**Riscos:**
- CRÍTICO: Corrupção de dados (PROB-001, PROB-007)
- ALTO: Dados desatualizados sem aviso (PROB-004)
- Impacto: Múltiplos grupos com sincronização falhando silenciosamente

**Mitigação:** Monitoramento 24/7, rollback plan pronto
**Viabilidade:** NÃO — sem monitoramento adequado em Render

---

### Opção B: Corrigir CRÍTICOS hoje, deploy amanhã (RECOMENDADO)
**Cronograma:**
- **Hoje:**
  - Corrigir PROB-001 (2-3h)
  - Corrigir PROB-007 (1-2h)
  - Testar com 10-20 grupos
  - Commit e push

- **Amanhã:**
  - Corrigir PROB-002, 004 (1-2h)
  - Testes finais (1h)
  - Deploy em produção

**Riscos:** BAIXO
**Impacto:** Sincronização robusta e detectável

---

### Opção C: Corrigir TUDO (mais seguro)
**Cronograma:** 1-2 dias completos
**Resultado:** Sistema enterprise-ready

---

## CHECKLIST ANTES DE DEPLOY

- [ ] PROB-001 corrigido
- [ ] PROB-007 corrigido
- [ ] Teste com grupo 2125
- [ ] Teste de rollback (falha simulada)
- [ ] Verificar Google Sheets foi atualizado
- [ ] Logs não contêm [ERRO CRÍTICO]
- [ ] Fila de sincronização vazia
- [ ] Auditoria registrou tudo
- [ ] Nenhuma discrepância cache/Sheets

---

## MONITORAMENTO RECOMENDADO

Após deploy, monitore:

```bash
# 1. Erros de sincronização
grep "\[ERRO CRÍTICO\]" production.log | wc -l
# Esperado: 0

# 2. Campos não sincronizados
grep "\[AVISO\].*não.*sincronizados" production.log
# Esperado: 0

# 3. Fila pendente
curl https://api.example.com/api/sync-queue/status
# Esperado: {"pendentes": 0}

# 4. Cache vs Sheets discrepâncias
# Comparar amostra de 10 grupos
```

---

## CONCLUSÃO

**Status:** NÃO SEGURO PARA DEPLOY IMEDIATO

**Recomendação:** Seguir **Opção B**
- Corrigir CRÍTICOS hoje (3-4 horas)
- Deploy amanhã (seguro)

**Próximo passo:** Começar com PROB-001 e PROB-007 agora.

---

**Documentos relacionados:**
- `VALIDACAO_CRITICA_SINCRONIZACAO.md` — Detalhes de cada problema
- `SEGURANCA_SINCRONIZACAO_CHECKLIST.md` — Passo a passo de correção

**Contato para dúvidas:** Ver `VALIDACAO_CRITICA_SINCRONIZACAO.md`
