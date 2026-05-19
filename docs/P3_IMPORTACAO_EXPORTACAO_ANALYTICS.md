# P3.1 & P3.2 — Importação/Exportação + Dashboard Analítico

**Data:** 2026-05-19  
**Status:** Em Implementação  
**Responsável:** Claude Code  
**Escopo:** P3.1 (15-20h) + P3.2 (20-25h) = **35-45h total**

---

## 📋 Visão Geral

### P3.1 — Importação/Exportação
**Objetivo:** Permitir upload de Excel e download em múltiplos formatos.

**Features:**
- ✅ Upload de arquivo Excel (.xlsx, .csv)
- ✅ Validação e preview de dados
- ✅ Importação com merge inteligente (atualizar existentes, inserir novos)
- ✅ Exportar todas as colunas → Excel
- ✅ Exportar relatórios por ADM → Excel
- ✅ Exportar relatórios por Grupo → PDF/Excel

### P3.2 — Dashboard Analítico
**Objetivo:** Visualizar tendências e KPIs dos grupos.

**Features:**
- ✅ Comparativo de lances por ADM (tabela + gráfico)
- ✅ Tendência mensal de lances (line chart)
- ✅ Distribuição de créditos (pie chart)
- ✅ KPIs: grupos ativos, vida média, prazo restante
- ✅ Top 10 grupos por critério (maior crédito, menor lance, melhor rating)

---

## 🏗️ Arquitetura Técnica

### **Backend (FastAPI) — Novos Endpoints**

#### P3.1 — Importação/Exportação

```
POST   /api/import                      # Upload + preview + validação
POST   /api/import/confirm              # Confirmar importação
GET    /api/export/excel                # Exportar tudo (Excel)
GET    /api/export/por-adm              # Exportar por ADM (Excel)
GET    /api/export/por-grupo/{id}       # Exportar grupo (PDF/Excel)
GET    /api/export/relatorio/{tipo}     # Relatórios customizados
```

#### P3.2 — Analytics

```
GET    /api/analytics/summary           # KPIs gerais
GET    /api/analytics/lances-por-adm    # Comparativo ADMs
GET    /api/analytics/tendencias        # Séries temporais
GET    /api/analytics/distribuicao      # Créditos por faixa
GET    /api/analytics/top-grupos        # Rankings
```

---

### **Frontend (Alpine.js) — Novas Abas**

#### P3.1
- Nova aba: **📥 Importação/Exportação**
  - Upload drop-zone (arrastar arquivo)
  - Preview em tabela (primeiras 10 linhas)
  - Detecção de colunas
  - Botão "Confirmar Importação"
  - Status: linhas processadas, duplicatas, erros
  
- Menu de Exportação:
  - Botão "📊 Exportar Tudo" → Excel
  - Botão "📈 Relatório por ADM" → Excel
  - Botão "📋 Relatório Grupo" → PDF

#### P3.2
- Nova aba: **📊 Dashboard Analítico**
  - Card com KPIs gerais (grupos ativos, vida média, etc)
  - Gráfico de lances por ADM (bar chart)
  - Gráfico de tendência mensal (line chart)
  - Gráfico de distribuição de créditos (pie chart)
  - Tabela de top 10 grupos
  - Filtros: data range, ADM, tipo bem

---

## 💻 Implementação Passo a Passo

### **FASE 1: Backend — Importação/Exportação (P3.1)**
**Tempo: 8-10h**

#### 1.1 Criar `backend/import_export.py`

```python
# Funções de importação
- validar_arquivo_excel(arquivo)
- extrair_dados_excel(arquivo)
- validar_schema(dados)
- preview_importacao(dados, limite=10)
- processar_importacao(dados, modo="insert_update")

# Funções de exportação
- exportar_excel_completo()
- exportar_por_adm(adm)
- exportar_grupo(grupo_id, formato="excel")
```

**Dependências:** `openpyxl`, `pandas`

---

#### 1.2 Endpoints em `backend/main.py`

```python
@app.post("/api/import")
async def importar_arquivo(file: UploadFile):
    # Receber arquivo, validar, retornar preview
    
@app.post("/api/import/confirm")
async def confirmar_importacao(modo: str, dados: list):
    # Processar e salvar dados
    
@app.get("/api/export/excel")
async def exportar_excel():
    # Retornar Excel completo
    
@app.get("/api/export/por-adm")
async def exportar_por_adm(adm: str):
    # Retornar Excel filtrado por ADM
```

---

### **FASE 2: Frontend — Upload Interface (P3.1)**
**Tempo: 6-8h**

#### 2.1 Adicionar aba em `frontend/index.html`

```html
<!-- NAV -->
<button @click="abaAtiva = 'import-export'">
  📥 Importação/Exportação
</button>

<!-- CONTEÚDO -->
<template x-if="abaAtiva === 'import-export'">
  <div class="p-6">
    <!-- Drop Zone -->
    <div @drop="handleFileDrop" class="border-2 dashed">
      Arraste arquivo Excel ou clique para selecionar
    </div>
    
    <!-- Preview -->
    <div x-show="previewDados.length > 0">
      <table>
        <tr x-for="linha in previewDados">...</tr>
      </table>
    </div>
    
    <!-- Botões Exportação -->
    <div class="flex gap-2">
      <button @click="exportarCompleto">📊 Exportar Tudo</button>
      <button @click="exportarPorAdm">📈 Por ADM</button>
    </div>
  </div>
</template>
```

#### 2.2 Funções em `frontend/js/app.js`

```javascript
handleFileDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) enviarParaImporte(file);
}

enviarParaImporte(arquivo) {
  const formData = new FormData();
  formData.append("file", arquivo);
  
  fetch("/api/import", { method: "POST", body: formData })
    .then(r => r.json())
    .then(dados => {
      this.previewDados = dados.preview;
      this.importStatus = dados.status;
    });
}

confirmarImportacao() {
  fetch("/api/import/confirm", {
    method: "POST",
    body: JSON.stringify({ dados: this.previewDados, modo: "insert_update" })
  })
  .then(() => {
    this.mensagem = "✓ Importação concluída com sucesso!";
    this.refresh(); // Recarregar grupos
  });
}

exportarCompleto() {
  window.location.href = "/api/export/excel";
}

exportarPorAdm(adm) {
  window.location.href = `/api/export/por-adm?adm=${adm}`;
}
```

---

### **FASE 3: Backend — Analytics (P3.2)**
**Tempo: 8-10h**

#### 3.1 Criar `backend/analytics.py`

```python
def calcular_kpis():
    grupos = fetch_grupos()
    return {
        "total_grupos": len(grupos),
        "grupos_ativos": count(g for g in grupos if g["status"] == "Ativo"),
        "vida_media": average(g["vida_grupo_pct"] for g in grupos),
        "prazo_restante_medio": average(g["prazo_restante"] for g in grupos),
        "credito_total": sum(g["maior_credito"] for g in grupos)
    }

def lances_por_adm():
    grupos = fetch_grupos()
    resultado = {}
    for adm in set(g["adm"] for g in grupos):
        grupos_adm = [g for g in grupos if g["adm"] == adm]
        resultado[adm] = {
            "maior_lance_medio": average(g["maior_lance_pct"] for g in grupos_adm),
            "menor_lance_medio": average(g["menor_lance_pct"] for g in grupos_adm),
            "qtd_grupos": len(grupos_adm)
        }
    return resultado

def tendencias_mensais():
    # Calcular média de lances por mês (últimos 12 meses)
    passar

def distribuicao_creditos():
    grupos = fetch_grupos()
    faixas = {
        "0-100k": 0,
        "100k-250k": 0,
        "250k-500k": 0,
        "500k-1m": 0,
        "1m+": 0
    }
    for g in grupos:
        credito = g["maior_credito"]
        if credito <= 100000:
            faixas["0-100k"] += 1
        elif credito <= 250000:
            faixas["100k-250k"] += 1
        # ... etc
    return faixas

def top_grupos(criterio="maior_credito", limite=10):
    grupos = fetch_grupos()
    grupos_ordenados = sorted(grupos, key=lambda g: g[criterio], reverse=True)
    return grupos_ordenados[:limite]
```

---

#### 3.2 Endpoints em `backend/main.py`

```python
@app.get("/api/analytics/summary")
def analytics_summary():
    return calcular_kpis()

@app.get("/api/analytics/lances-por-adm")
def analytics_lances():
    return lances_por_adm()

@app.get("/api/analytics/tendencias")
def analytics_tendencias():
    return tendencias_mensais()

@app.get("/api/analytics/distribuicao")
def analytics_distribuicao():
    return distribuicao_creditos()

@app.get("/api/analytics/top-grupos")
def analytics_top(criterio: str = "maior_credito", limite: int = 10):
    return top_grupos(criterio, limite)
```

---

### **FASE 4: Frontend — Dashboard Analítico (P3.2)**
**Tempo: 10-12h**

#### 4.1 Adicionar aba em `frontend/index.html`

```html
<button @click="abaAtiva = 'analytics'">
  📊 Dashboard Analítico
</button>

<template x-if="abaAtiva === 'analytics'">
  <div class="p-6 overflow-y-auto">
    <!-- KPIs Cards -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-slate-800 p-4 rounded">
        <p class="text-xs text-slate-400">Grupos Ativos</p>
        <p class="text-2xl font-bold" x-text="analytics.grupos_ativos"></p>
      </div>
      <div class="bg-slate-800 p-4 rounded">
        <p class="text-xs text-slate-400">Vida Média (%)</p>
        <p class="text-2xl font-bold" x-text="(analytics.vida_media || 0).toFixed(1)"></p>
      </div>
      <div class="bg-slate-800 p-4 rounded">
        <p class="text-xs text-slate-400">Prazo Restante (meses)</p>
        <p class="text-2xl font-bold" x-text="(analytics.prazo_restante_medio || 0).toFixed(0)"></p>
      </div>
      <div class="bg-slate-800 p-4 rounded">
        <p class="text-xs text-slate-400">Crédito Total (R$)</p>
        <p class="text-xl font-bold" x-text="formatarMoeda(analytics.credito_total || 0)"></p>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-2 gap-6 mb-6">
      <!-- Lances por ADM -->
      <div class="bg-slate-800 p-4 rounded">
        <h3 class="font-semibold mb-4">Lances por Administradora</h3>
        <canvas id="chartLancesAdm"></canvas>
      </div>

      <!-- Distribuição Créditos -->
      <div class="bg-slate-800 p-4 rounded">
        <h3 class="font-semibold mb-4">Distribuição de Créditos</h3>
        <canvas id="chartDistribuicao"></canvas>
      </div>
    </div>

    <!-- Tendências -->
    <div class="bg-slate-800 p-4 rounded mb-6">
      <h3 class="font-semibold mb-4">Tendência de Lances (últimos 12 meses)</h3>
      <canvas id="chartTendencias"></canvas>
    </div>

    <!-- Top 10 Grupos -->
    <div class="bg-slate-800 p-4 rounded">
      <h3 class="font-semibold mb-4">Top 10 Grupos</h3>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-700">
            <th class="text-left py-2">Grupo</th>
            <th class="text-left">ADM</th>
            <th class="text-right">Crédito Máx</th>
            <th class="text-right">Vida (%)</th>
          </tr>
        </thead>
        <tbody>
          <tr x-for="g in analytics.topGrupos" class="border-b border-slate-700">
            <td class="py-2" x-text="g.grupo"></td>
            <td x-text="g.adm"></td>
            <td class="text-right" x-text="formatarMoeda(g.maior_credito)"></td>
            <td class="text-right" x-text="(g.vida_grupo_pct || 0).toFixed(1) + '%'"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
```

#### 4.2 Funções em `frontend/js/app.js`

```javascript
async carregarAnalytics() {
  try {
    const [summary, lances, tendencias, distribuicao, top] = await Promise.all([
      fetch("/api/analytics/summary").then(r => r.json()),
      fetch("/api/analytics/lances-por-adm").then(r => r.json()),
      fetch("/api/analytics/tendencias").then(r => r.json()),
      fetch("/api/analytics/distribuicao").then(r => r.json()),
      fetch("/api/analytics/top-grupos").then(r => r.json())
    ]);
    
    this.analytics = {
      ...summary,
      lances,
      tendencias,
      distribuicao,
      topGrupos: top
    };
    
    // Renderizar gráficos
    this.renderizarGraficos();
  } catch (e) {
    console.error("Erro ao carregar analytics:", e);
  }
}

renderizarGraficos() {
  // Chart.js - Lances por ADM
  new Chart(document.getElementById("chartLancesAdm"), {
    type: "bar",
    data: {
      labels: Object.keys(this.analytics.lances),
      datasets: [{
        label: "Maior Lance (%)",
        data: Object.values(this.analytics.lances).map(a => a.maior_lance_medio),
        backgroundColor: "#3b82f6"
      }]
    }
  });

  // Chart.js - Distribuição
  new Chart(document.getElementById("chartDistribuicao"), {
    type: "pie",
    data: {
      labels: Object.keys(this.analytics.distribuicao),
      datasets: [{
        data: Object.values(this.analytics.distribuicao),
        backgroundColor: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]
      }]
    }
  });

  // Chart.js - Tendências
  new Chart(document.getElementById("chartTendencias"), {
    type: "line",
    data: {
      labels: this.analytics.tendencias.meses,
      datasets: [{
        label: "Maior Lance Médio (%)",
        data: this.analytics.tendencias.valores,
        borderColor: "#3b82f6",
        tension: 0.4
      }]
    }
  });
}

formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valor);
}
```

---

## 📅 Cronograma de Implementação

| Fase | Tarefas | Tempo | Status |
|------|---------|-------|--------|
| **1** | Backend: import_export.py | 3-4h | ⏳ TODO |
| **2** | Backend: endpoints importação | 2-3h | ⏳ TODO |
| **3** | Frontend: upload interface | 4-5h | ⏳ TODO |
| **4** | Testes importação | 2-3h | ⏳ TODO |
| **5** | Backend: analytics.py | 4-5h | ⏳ TODO |
| **6** | Backend: endpoints analytics | 3-4h | ⏳ TODO |
| **7** | Frontend: dashboard analytics | 6-8h | ⏳ TODO |
| **8** | Testes analytics + integração | 2-3h | ⏳ TODO |
| **9** | Deploy e validação | 1-2h | ⏳ TODO |

**Total: 35-45h**

---

## ✅ Critérios de Aceitação

- [ ] Upload de Excel funciona com preview
- [ ] Importação com merge (atualizar/inserir)
- [ ] Exportação em Excel (tudo, por ADM, por grupo)
- [ ] Dashboard mostra KPIs corretos
- [ ] Gráficos renderizam sem erros
- [ ] Tendências calculadas corretamente
- [ ] Performance < 2s para carregar analytics
- [ ] Testes cobrem 80% do código novo
- [ ] Zero erros em console
- [ ] Responsividade mobile ok

---

## 🚀 Próximos Passos

1. ✅ Criar estrutura `backend/import_export.py`
2. ✅ Implementar endpoints importação
3. ✅ Criar interface frontend upload
4. ✅ Testes importação
5. ✅ Criar `backend/analytics.py`
6. ✅ Implementar endpoints analytics
7. ✅ Dashboard com gráficos
8. ✅ Deploy e validação

---
