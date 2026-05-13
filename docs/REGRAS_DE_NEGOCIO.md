# Regras de Negócio — Crediclass Dashboard

## 1. Perfis de Lance

Cada grupo de consórcio possui 5 indicadores de lance mínimo, correspondendo ao perfil de urgência do cliente:

| Perfil | Urgência | Lance típico | Campo interno |
|---|---|---|---|
| 🔴 Agressivo | 1–3 meses | ≥ 50% | `agressivo_3m` |
| 🟠 Moderado | 4–6 meses | 40–50% | `moderado_12m` |
| 🟡 Conservador | 7–12 meses | 30–40% | `conservador_24m` |
| 🔵 Super Conservador | 13–24 meses | 20–30% | — |
| 🟢 Investidor | Sem pressa | 0–20% | `investidor` |

---

## 2. Score de Compatibilidade (0–3 pontos)

Avalia o grupo contra o perfil do cliente em 3 critérios independentes:

| Critério | Condição de aprovação | +Pontos |
|---|---|---|
| Cobertura de crédito | `maior_credito ≥ valor_imovel × 0.90` | +1 |
| Orçamento mensal | `parcela_inicial ≤ mensalidade_maxima × 1.10` | +1 |
| Lance disponível | `pct_lance_disponivel ≥ menor_lance_do_grupo` | +1 |

> **Critério de lance:** usa o menor lance exigido entre os perfis disponíveis no grupo (ordem: investidor → conservador_24m → moderado_12m). Se o cliente tem recursos suficientes para o perfil mais conservador, o critério é satisfeito.

---

## 3. Filtro Inteligente de Compatibilidade

O toggle "Mostrar apenas compatíveis" aplica simultaneamente:
- Crédito do grupo cobre **≥ 90%** do valor do imóvel
- Parcela inicial **≤ 110%** da mensalidade máxima declarada

É ativado automaticamente ao buscar uma oportunidade Piperun que contenha `valor_imovel_num`.

---

## 4. Fórmulas (f)(g)(h) — Estudo Financeiro

### (f) Crédito a contratar
```
crédito_necessário = valor_imovel / (1 - pct_lance_embutido_adm)
```
Dimensiona o crédito real considerando que parte do lance é extraída do próprio crédito.

### (g) Lance máximo percentual
```
lance_total = lance_recursos_proprios + (crédito_necessário × pct_embutido_adm)
pct_lance_maximo = lance_total / crédito_necessário × 100
```

### (h) Prazo mínimo de contemplação
Com base no `pct_lance_maximo`, identifica o perfil atingido:
- `pct ≥ agressivo_3m` → contemplação em 1–3 meses
- `pct ≥ moderado_12m` → contemplação em 4–6 meses
- `pct ≥ conservador_24m` → contemplação em 7–12 meses
- `pct ≥ investidor` → contemplação em 13–24 meses
- `pct < investidor` → apenas sorteio (prazo indefinido)

---

## 5. Regra da Parcela — 30% da Renda

A parcela do consórcio não deve ultrapassar **30% da renda mensal familiar**:
```
parcela_maxima_permitida = renda_mensal_num × 0.30
```
- Grupos com parcela acima desse limite devem ser destacados visualmente (vermelho)
- O filtro de orçamento usa o campo `mensalidade_maxima` do formulário (declarado pelo cliente), não a regra dos 30% automaticamente

---

## 6. Lance Embutido por Administradora

Permite usar parte do crédito para pagar o lance:

| Administradora | % Embutido máximo |
|---|---|
| ITAÚ | 30% |
| CNP | 50% |
| CAOA | 30% |
| PORTO | 30% |
| EMBRACON | 25% |
| RODOBENS | 0% (verificar) |
| CAIXA | 0% (verificar) |

---

## 7. Colorização de Lance (tabela)

| Faixa | Cor | Significado |
|---|---|---|
| ≥ 70% | Vermelho | Lance muito alto — grupo difícil |
| 55–70% | Amarelo | Lance moderado |
| < 55% | Verde | Lance acessível |

---

## 8. Colorização de Vida do Grupo

| Faixa | Cor | Significado |
|---|---|---|
| ≥ 75% | Vermelho | Grupo muito consumido — poucos sorteios restantes |
| 50–75% | Amarelo | Grupo em fase intermediária |
| < 50% | Verde | Grupo jovem — boa quantidade de sorteios restantes |

---

## 9. Seleção para Estudo Financeiro

- Máximo de **5 grupos** podem ser selecionados simultaneamente
- Ao clicar em "Gerar Estudo Financeiro", os grupos selecionados + o perfil do cliente serão usados para montar o documento final
- O Estudo Financeiro deve apresentar **4 estratégias** por grupo: Sorteio, Lance Fixo, Conservador e Moderado

---

## 10. Regras de Exibição do Histórico

- O gráfico exibe a série temporal dos lances **Maior** (linha sólida azul) e **Menor** (linha tracejada verde)
- Dados de até **36 meses** (JAN-24 a DEZ-26)
- Meses sem dados são omitidos da série
