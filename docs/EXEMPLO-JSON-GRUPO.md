# 📋 Exemplo Real de Grupo em JSON

Aqui está um exemplo real de como os dados de um grupo aparecem após o processamento pelo backend:

```json
{
  "adm": "AUTO-CAIXA",
  "grupo": "2125",
  "tipo_bem": "Auto",
  "primeira_assembleia": "9/29/2021",
  "prazo_grupo": 80,
  "prazo_restante": 26,
  "meses_corridos": 54,
  "data_termino": "5/29/2028",
  "vida_grupo_pct": 68.0,
  "venc": "15",
  "menor_credito": 28502.34,
  "maior_credito": 51304.2,
  "taxa_adm": 17.0,
  "taxa_promocao": null,
  "fundo_rsv": 3.0,
  "prestacao_integral": null,
  "meia_reduzida": null,
  "investidor": null,
  "conservador_24m": 39.0,
  "moderado_12m": 39.0,
  "agressivo_6m": 39.0,
  "super_agressivo_3m": 39.0,
  "lance_quitacao": 34.64,
  "media_lance": 25.42,
  "media_contemp": 25.42,
  "categoria": "350887,9",
  "parcela_inicial": 1253.171071,
  "historico": [
    {
      "mes": "MAY-24",
      "maior": 58.75,
      "menor": 58.75,
      "qtd": 14
    },
    {
      "mes": "JUN-24",
      "maior": 57.5,
      "menor": 57.5,
      "qtd": 22
    },
    {
      "mes": "JUL-24",
      "maior": 56.25,
      "menor": 56.25,
      "qtd": 22
    },
    {
      "mes": "AUG-24",
      "maior": 55.0,
      "menor": 55.0,
      "qtd": 11
    },
    {
      "mes": "SEP-24",
      "maior": 53.75,
      "menor": 53.75,
      "qtd": 13
    },
    {
      "mes": "OCT-24",
      "maior": 52.5,
      "menor": 52.5,
      "qtd": 15
    },
    {
      "mes": "NOV-24",
      "maior": 51.25,
      "menor": 51.25,
      "qtd": 12
    },
    {
      "mes": "DEC-24",
      "maior": 50.0,
      "menor": 50.0,
      "qtd": 19
    },
    {
      "mes": "JAN-25",
      "maior": 48.75,
      "menor": 48.75,
      "qtd": 8
    },
    {
      "mes": "FEB-25",
      "maior": 47.5,
      "menor": 47.5,
      "qtd": 10
    },
    {
      "mes": "MAR-25",
      "maior": 46.25,
      "menor": 46.25,
      "qtd": 16
    },
    {
      "mes": "APR-25",
      "maior": 45.0,
      "menor": 45.0,
      "qtd": 14
    }
  ]
}
```

---

## 📊 Análise do Exemplo

### Identificação
- **Administradora:** AUTO-CAIXA (administra carros através da Caixa Econômica)
- **Grupo ID:** 2125 (identificador único)
- **Tipo de Bem:** Auto (financiamento de automóveis)

### Cronograma (Vigência)
- **Primeira Assembleia:** 29/09/2021 (quando começou)
- **Prazo Total:** 80 meses (6,67 anos)
- **Prazo Restante:** 26 meses (até encerramento)
- **Meses Corridos:** 54 meses (já decorridos)
- **Data de Término:** 29/05/2028 (quando vai encerrar)
- **Vida do Grupo:** 68% (54/80 = 67,5%, arredondado 68%)

### Crédito
- **Vencimento:** Dia 15 de cada mês
- **Crédito Mínimo:** R$ 28.502,34
- **Crédito Máximo:** R$ 51.304,20
- **Parcela Inicial:** R$ 1.253,17 (primeira entrada)

### Taxas
- **Taxa de Administração:** 17% (cobrado pela CAIXA)
- **Taxa de Promoção:** null (não aplicável)
- **Fundo de Reserva:** 3% (para constituição de fundo)

### Modalidades de Lance (para simulação)
Cada modalidade indica em que porcentagem do crédito máximo você pagaria de lance:
- **Investidor:** null (não disponível)
- **Conservador (24m):** 39% (cresce a cada 24 meses)
- **Moderado (12m):** 39% (cresce a cada 12 meses)
- **Agressivo (6m):** 39% (cresce a cada 6 meses)
- **Super Agressivo (3m):** 39% (cresce a cada 3 meses)
- **Lance Quitação:** 34,64% (desconto para quem paga tudo)

### Estatísticas
- **Média de Lance:** 25,42% (média histórica)
- **Média de Contemplação:** 25,42% (chance de ser contemplado)

### Histórico (últimos 12 meses na amostra)
Mostra a evolução dos lances mês a mês:
- **MAY-24:** Maior 58.75%, Menor 58.75%, 14 contemplados
- **JUN-24:** Maior 57.5%, Menor 57.5%, 22 contemplados
- ... (progressão decrescente, padrão típico)

---

## 🔄 Como Este Exemplo É Usado no Frontend

### Na Aba "Calculadora"
1. Usuario filtra por: **Administradora = AUTO-CAIXA**, **Tipo = Auto**
2. O grupo **2125** aparece nos resultados
3. Quando clica para simular:
   - Usa `menor_credito` (28.502,34) como mínimo permitido
   - Usa `maior_credito` (51.304,20) como máximo permitido
   - Aplica as percentagens de modalidades para calcular lances
   - Mostra histórico em gráfico

### Na Aba "Gerenciador"
1. Gerenciador vê o grupo na tabela
2. Pode editar qualquer campo (adm, tipo_bem, taxa_adm, etc)
3. Pode duplicar o grupo (cria novo com novos IDs)
4. Pode deletar/desativar (soft delete)
5. Histórico de auditoria registra todas as alterações

### No Card de Resumo
```
┌─────────────────────────┐
│ AUTO-CAIXA              │
│ Grupo 2125              │
│ Auto                    │
├─────────────────────────┤
│ Vida: 68% ▓▓▓▓░░░      │
│ Crédito: 28k ~ 51k      │
│ Taxa: 17% + 3% RSV      │
│ Prazo: 26 meses         │
├─────────────────────────┤
│ Lance Médio: 25,42%     │
│ Próx Vencimento: 15º    │
└─────────────────────────┘
```

---

## 🎯 Interpretações Práticas

### O que significa cada campo para o usuário:

| Campo | Significado | O que faz |
|-------|-------------|-----------|
| `vida_grupo_pct: 68%` | Grupo já está 68% vencido | Pode estar próximo do fim, menos tempo para contemplar |
| `prazo_restante: 26` | Apenas 26 meses faltam | Urgência maior para quem ainda quer participar |
| `taxa_adm: 17%` | Caixa cobra 17% de taxa | Seu crédito custa mais caro |
| `conservador_24m: 39%` | Lance cresce a cada 24m | Começa agressivo, depois cresce lentamente |
| `media_lance: 25.42%` | Média histórica 25% | Lance típico é ~25% do seu crédito |
| `historico` | Descida de 58% → 45% | Lances caindo com o tempo (tendência positiva) |

---

## 🔍 Validações Importantes

Ao editar este grupo, o frontend deve validar:

```javascript
// Validação de crédito
if (entrada < 28502.34 || entrada > 51304.20) {
  erro = "Fora do intervalo permitido"
}

// Validação de taxa
if (taxa_adm < 0 || taxa_adm > 100) {
  erro = "Taxa deve estar entre 0-100%"
}

// Validação de prazo
if (prazo_restante < 0) {
  aviso = "Grupo pode estar encerrado"
}

// Validação de vida
if (vida_grupo_pct > 100) {
  erro = "Vida do grupo não pode exceder 100%"
}
```

---

## 📈 Gráfico de Histórico

O histórico é visualizado no frontend como um gráfico de linhas/barras:

```
Lance (%)
    60 │     ╱\
    55 │    ╱  \
    50 │   ╱    \
    45 │  ╱      \
    40 │_╱        \
       └───────────────────
         MAY JUN JUL AUG SEP OCT NOV DEC JAN FEB MAR APR
         
    Linha vermelha: Maior lance do mês
    Linha azul: Menor lance do mês
    Barras: Quantidade de contemplados
```

Tendência: **Decrescente** (bom sinal - lances caindo ao longo do tempo)

---

## 🔗 APIs que Retornam Este Exemplo

1. **GET /api/grupos** - Retorna array de todos os grupos
2. **GET /api/grupos/{grupo_id}** - Retorna um grupo específico
3. **GET /api/grupos-gerenciador** - Retorna com paginação para CRUD
4. **POST /api/grupos** - Cria novo grupo (sem histórico inicialmente)

---

**Última atualização:** 2026-05-19  
**Dados extraídos de:** Render deployment ao vivo
