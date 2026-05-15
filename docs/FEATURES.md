# 🎯 Features — Detalhes Técnicos

Cada feature com fórmulas, estado, localização no código e exemplos.

---

## 1️⃣ Calculadora Financeira

### Status: ✅ Pronto (Testado)

### O que faz
Simula esquema de consórcio para imóvel, comparando 6 administradoras e gerando 4 modalidades de contemplação.

### Fluxo Visual
```
┌─────────────────────┐
│   Formulário Inputs │
│  (credit, prazo...) │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Executar Cálculo   │ ← Clique botão
│  (6 ADMs)           │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ Tabela Comparativo  │ ← "Ver grupos" em uma ADM
│ (6 linhas)          │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Lista Grupos       │ ← Selecionar 1 grupo
│  (cards)            │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  4 Simulações       │ ← Preview + botão PDF
│  (modalidades)      │
└─────────────────────┘
```

### Inputs do Formulário

| Campo | Tipo | Default | Range | Descrição |
|-------|------|---------|-------|-----------|
| `creditoDesejado` | number | 450.000 | 50k-5M | Valor do imóvel (R$) |
| `prazoDesejado` | dropdown | "1a3" | 1a3, 3a5, 5a10 | Prazo em anos |
| `conceitoLance` | dropdown | "agressivo" | conservador, moderado, agressivo | Perfil risco |
| `lancemaximo` | number | 150.000 | 10k-500k | Lance máximo permitido (R$) |
| `fgtsTitular` | number | 0 | 0-500k | FGTS titular disponível (R$) |
| `fgtsCunjuge` | number | 0 | 0-500k | FGTS cônjuge disponível (R$) |
| `rendaTitular` | number | 3.500 | 500-50k | Renda mensal titular (R$) |
| `rendaCunjuge` | number | 0 | 0-50k | Renda mensal cônjuge (R$) |
| `parcelaDesejada` | number | 6.000 | 500-50k | Parcela máxima aceitável (R$) |

### Fórmulas de Cálculo

#### (A) Crédito a Contratar
```
Crédito = creditoDesejado / (1 - pctLanceEmbutido)
```
**Exemplo:** crédito desejado R$ 450k, lance embutido 30% (Itaú)
```
Crédito = 450.000 / (1 - 0.30) = 450.000 / 0.70 = 642.857
```

#### (B) Lance Máximo (%)
```
Numerador = (Crédito × % Lance) + Lance + (FGTS Titular + FGTS Cônjuge)
Denominador = Crédito × (1 + Taxa ADM + Fundo Reserva)
Lance Máximo % = Numerador / Denominador
```

**Exemplo:** com crédito 642k, lance 40%, taxa 20%, fundo 3%
```
Num = (642.857 × 0.40) + 150.000 + (50.000) = 432.143
Den = 642.857 × (1 + 0.20 + 0.03) = 789.297
Lance % = 432.143 / 789.297 = 54.8%
```

#### (C) Prazo Mínimo (meses)
```
Recurso Faltante = (Crédito × (1 + Taxa + Fundo)) 
                   - (Crédito × % Lance + Lance + FGTS)
Prazo = Recurso Faltante / Parcela Desejada
```

**Exemplo:**
```
Recurso = 789.297 - 432.143 = 357.154
Prazo = 357.154 / 6.000 = ~60 meses
```

### Dados das Administradoras

```javascript
const ADM_DATA = {
  CNP: { taxa: 0.15, fundo: 0.05, pctLance: 0.50 },
  ITAÚ: { taxa: 0.20, fundo: 0.03, pctLance: 0.30 },
  CAOA: { taxa: 0.20, fundo: 0.01, pctLance: 0.30 },
  PORTO: { taxa: 0.15, fundo: 0.005, pctLance: 0.30 },
  EMBRACON: { taxa: 0.15, fundo: 0.02, pctLance: 0.25 },
  RODOBENS: { taxa: 0.18, fundo: 0.05, pctLance: 0.30 }
};
```

### Localização no Código
- **Frontend:** `frontend/js/app.js`
  - Método: `executarCalculo()` (linha ~150)
  - Método: `selecionarAdm(adm)` (linha ~200)
  - Método: `selecionarGrupo(grupo)` (linha ~230)
  - Método: `gerarSimulacoes(grupo)` (linha ~250)
  - Objetos de estado: `app.calc`, `app.admSelecionada`, `app.grupoSelecionado`, `app.simulacoesEstudo`

---

## 2️⃣ Buscar Oportunidade (Piperun CRM)

### Status: ✅ Pronto (Testado com deal #59393258)

### O que faz
Busca dados da oportunidade no Piperun CRM e auto-preenche o formulário da calculadora.

### Endpoint
```
GET /api/piperun/{deal_id}
```

### Response
```json
{
  "nome_cliente": "João da Silva",
  "email": "joao@email.com",
  "cpf": "123.456.789-00",
  "valor_imovel": 450000,
  "parcela_desejada": 6000,
  "lance_maximo": 150000,
  "renda_mensal": 8000,
  "profissao": "Engenheiro"
}
```

### Mapeamento de Campos

No `backend/piperun.py`, função `extrair_dados_piperun()`:

```python
FIELD_MAP = {
    "valor_imovel": [
        "Qual valor do imóvel desejado?",
        "Valor do Imóvel",
        "Valor imóvel"
    ],
    "parcela_maxima": [
        "Parcela máxima disponível",
        "Mensalidade máxima",
        "Parcela máxima"
    ],
    "lance_maximo": [
        "Recurso próprio máximo disponível",
        "Lance máximo",
        "Valor máximo lance"
    ],
    "renda_mensal": [
        "Renda Mensal",
        "Renda mensal",
        "Qual sua renda?"
    ],
    # ... etc
}
```

### Frontend Integration

```javascript
// No app.js, método buscarOportunidade()
async buscarOportunidade() {
  const dealId = this.busca_deal_id;
  const res = await fetch(`/api/piperun/${dealId}`);
  const dados = await res.json();
  
  // Auto-preenche campos
  this.calc.creditoDesejado = dados.valor_imovel;
  this.calc.parcelaDesejada = dados.parcela_desejada;
  this.calc.lancemaximo = dados.lance_maximo;
  this.calc.rendaTitular = dados.renda_mensal;
  this.nomeClienteCarregado = dados.nome_cliente;
}
```

### Localização no Código
- **Backend:** `backend/piperun.py` (função `extrair_dados_piperun`)
- **Backend:** `backend/main.py` (rota `GET /api/piperun/{deal_id}`)
- **Frontend:** `frontend/js/app.js` (método `buscarOportunidade()`)

---

## 3️⃣ Filtro de Compatibilidade

### Status: ✅ Pronto (Testado)

### O que faz
Seleciona apenas grupos cuja capacidade de crédito é suficiente para a operação.

### Lógica de Filtro

**Condição:** Um grupo é compatível se:
```javascript
grupo.maior_credito >= (creditoDesejado × 0.70)
  OR
(creditoDesejado + lancemaximo) >= (creditoDesejado × 0.95)
```

**Interpretação:**
- **Opção 1:** Crédito máximo do grupo cobre 70% do imóvel
- **Opção 2:** Imóvel + lance máximo cobrem 95% do crédito

### Exemplo

**Cenário:** Imóvel R$ 400k, lance máximo R$ 150k

**Opção 1:** Grupo com crédito máximo ≥ 280k (400 × 0.70)
**Opção 2:** Grupo com crédito ≥ 379k (400 × 0.95 - 150)

**Resultado:** Ambas as opções são aceitas (compatível)

### Versão Anterior (Descartada)

```javascript
// ❌ Muito restritivo
grupo.maior_credito >= creditoDesejado × 0.90
```

**Problema:** Para imóvel de R$ 400k, exigia crédito ≥ R$ 360k → encontrava 0 grupos

**Solução:** Relaxar para 0.70 + aceitar option 2 → agora encontra 18+ grupos

### Localização no Código
- **Frontend:** `frontend/js/app.js`, método `selecionarAdm()` (linha ~200)

---

## 4️⃣ Score de Viabilidade

### Status: ✅ Pronto (Testado)

### O que faz
Calcula score (0-100) avaliando viabilidade da operação com 3 validações.

### Validações

#### 1️⃣ Parcela vs Renda
```
Renda Total = rendaTitular + rendaCunjuge
Max Parcela Permitida = Renda Total × 0.30  // Regra 30%
Score 1 = (parcelaDesejada / Max Parcela Permitida) × 100
```

**Interpretação:**
- Score < 100 → OK (parcela dentro do limite)
- Score ≥ 100 → Aviso vermelho

**Exemplo:**
```
Renda = 8.000
Max Parcela = 8.000 × 0.30 = 2.400
Se parcela = 6.000:
Score = (2.400 / 6.000) × 100 = 40 → 🔴 Risco alto
```

#### 2️⃣ Prazo Longo
```
Score 2 = 100 se prazo ≤ 180 meses
Score 2 = 80 - (prazo - 180) / 10 se prazo > 180
```

**Interpretação:**
- Prazo ≤ 180 meses (15 anos) → OK
- Prazo > 180 → descontar pontos (envelhece renda no futuro)

#### 3️⃣ Lance Agressivo
```
Pct Lance = lancemaximo / creditoDesejado
Score 3 = 100 se pct ≤ 0.50
Score 3 = 50 se 0.50 < pct ≤ 0.80
Score 3 = 20 se pct > 0.80
```

**Interpretação:**
- Lance ≤ 50% do imóvel → OK
- 50-80% → Moderado
- > 80% → Agressivo (risco alto)

#### Score Final
```
Score = (Score 1 + Score 2 + Score 3) / 3
```

**Cor:**
- 🟢 Score ≥ 75: Verde (viável)
- 🟡 50 ≤ Score < 75: Amarelo (atenção)
- 🔴 Score < 50: Vermelho (risco alto)

### Localização no Código
- **Frontend:** `frontend/js/app.js`, método `validarViabilidade()` (linha ~280)

---

## 5️⃣ Gerar PDF (Estudo Financeiro)

### Status: ⏳ TODO (Prazo: 2026-05-31)

### O que faz
Exporta simulações em documento PDF profissional para apresentação ao cliente.

### Conteúdo Esperado

```
┌────────────────────────────────┐
│    ESTUDO FINANCEIRO            │
│    Crediclass Consórcios        │
├────────────────────────────────┤
│ Data: 15/05/2026               │
│ Validade: 30 dias              │
├────────────────────────────────┤
│ CLIENTE                         │
│ Nome: João da Silva             │
│ CPF: 123.456.789-00             │
│ Email: joao@email.com           │
│ Renda: R$ 8.000                 │
├────────────────────────────────┤
│ IMÓVEL                          │
│ Valor: R$ 450.000               │
│ Lance Máximo: R$ 150.000        │
│ Parcela Desejada: R$ 6.000      │
├────────────────────────────────┤
│ QUADRO RESUMO - ITAÚ            │
│ Crédito Máx: R$ 642.857         │
│ Parcela 30%: R$ 4.500           │
│ Prazo: 60 meses                 │
│ Taxa ADM: 20% a.a.              │
│ Fundo Reserva: 3% a.a.          │
├────────────────────────────────┤
│ 4 SIMULAÇÕES                    │
│                                  │
│ 1. SORTEIO GERAL (0% Lance)     │
│    Lance Total: R$ 0             │
│    Crédito: R$ 642.857           │
│    Recurso Próprio: R$ 150.000  │
│    Parcela Est.: R$ 8.000       │
│    Prazo Est.: 80 meses         │
│                                  │
│ 2. LANCE FIXO 40%               │
│    Lance Total: R$ 257.143      │
│    Crédito: R$ 642.857           │
│    Recurso Próprio: R$ 75.000   │
│    Parcela Est.: R$ 5.000       │
│    Prazo Est.: 45 meses         │
│                                  │
│ 3. LANCE CONSERVADOR (Hist. 24m)│
│    ...                           │
│                                  │
│ 4. LANCE MODERADO (Hist. 12m)   │
│    ...                           │
├────────────────────────────────┤
│ HISTÓRICO DE LANCES (Gráfico)   │
│ [Gráfico de barras últimas 17 asm]
├────────────────────────────────┤
│ RECOMENDAÇÕES                   │
│ • Simulação 2 (Lance Fixo 40%)  │
│   oferece melhor balanço risco-  │
│   retorno com prazo mais curto   │
│                                  │
│ • Considerar adesão em até 30d  │
│   para garantir melhor posição   │
│   na fila de contemplação        │
├────────────────────────────────┤
│ Crediclass Análise Consórcios   │
│ csrdesouza@gmail.com            │
└────────────────────────────────┘
```

### Implementação Recomendada

**Biblioteca:** `reportlab` (Python)
```bash
pip install reportlab
```

**Arquivo:** `backend/pdf_generator.py` (novo)

**Função:**
```python
def gerar_pdf_estudo(cliente: dict, grupo: dict, simulacoes: list) -> bytes:
    """
    Gera PDF de estudo financeiro.
    
    Args:
        cliente: {nome, cpf, email, renda_total, valor_imovel}
        grupo: {nome, adm, maior_credito, parcela_30pct, prazo_restante}
        simulacoes: [{tipo, lance, credito, proprio, parcela, prazo}, ...]
    
    Returns:
        PDF em bytes
    """
    # Criar document
    # Adicionar cabeçalho com dados cliente
    # Adicionar quadro resumo
    # Adicionar 4 simulações
    # Gerar gráfico histórico lances
    # Retornar PDF
```

**Endpoint FastAPI:**
```python
@app.post("/api/gerar-pdf")
async def gerar_pdf(payload: dict):
    """POST com cliente, grupo, simulacoes → retorna PDF"""
    pdf_bytes = gerar_pdf_estudo(
        cliente=payload['cliente'],
        grupo=payload['grupo'],
        simulacoes=payload['simulacoes']
    )
    return FileResponse(
        pdf_bytes, 
        media_type="application/pdf",
        filename=f"EF_{payload['cliente']['nome']}.pdf"
    )
```

**Frontend:**
```javascript
async gerarEstudoFinal() {
  const payload = {
    cliente: { /* dados */ },
    grupo: this.grupoSelecionado,
    simulacoes: this.simulacoesEstudo
  };
  
  const res = await fetch('/api/gerar-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `EF_${this.nomeClienteCarregado}.pdf`;
  a.click();
}
```

---

## 📌 Resumo de Status

| Feature | Pronto? | Testado? | Deploy? | Notes |
|---------|---------|----------|---------|-------|
| Calculadora | ✅ | ✅ | ✅ | Pronto em produção |
| Buscar Oportunidade | ✅ | ✅ | ✅ | Deal #59393258 OK |
| Filtro Compatibilidade | ✅ | ✅ | ✅ | Relaxado para 0.70 |
| Score Viabilidade | ✅ | ✅ | ✅ | 3 validações ativas |
| Gerar PDF | ⏳ | ❌ | ❌ | Prazo 2026-05-31 |
| UI/UX Melhorias | ⏳ | ❌ | ❌ | Mobile + dark mode |
| Testes Automatizados | ⏳ | ❌ | ❌ | pytest + Cypress |

