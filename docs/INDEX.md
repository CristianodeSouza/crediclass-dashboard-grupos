# 📚 Índice de Documentação

Navegação central da documentação do projeto Crediclass Dashboard Grupos.

---

## 🎯 Por Onde Começar?

### Primeiro Acesso?
→ Leia **[QUICK_START.md](QUICK_START.md)** (setup + como rodar)

### Quer Saber o Que Existe?
→ Leia **[../CLAUDE.md](../CLAUDE.md)** (overview geral em 2 min)

### Quer Acompanhar Tarefas?
→ Leia **[ROADMAP.md](ROADMAP.md)** (tarefas + timeline + status)

### Quer Entender Técnico?
→ Leia **[FEATURES.md](FEATURES.md)** (fórmulas + código)

### Quer Ver Mudanças Recentes?
→ Leia **[HISTORICO.md](HISTORICO.md)** (log de atualizações)

---

## 📖 Documentos Disponíveis

### 🚀 [QUICK_START.md](QUICK_START.md)
**Conteúdo:** Setup, instalação, primeiros passos  
**Seções:**
- Instalação (primeira vez)
- Uso diário
- Endpoints principais
- Troubleshooting comum
- Arquivos-chave

**Público:** Developers que querem rodar o projeto

---

### 🗺️ [ROADMAP.md](ROADMAP.md)
**Conteúdo:** Tarefas, status, timeline, prioridades  
**Seções:**
- Visão geral (tabela features vs status)
- Features prontas (✅ Calculadora, Piperun, Filtro, Score)
- Features TODO (🔄 PDF, UI/UX, Testes, Deploy)
- Timeline 2026-05-15 até 2026-06-15
- Checklist QA pré-deploy

**Público:** PMs, líderes técnicos, qualquer um acompanhando progresso

---

### 🎯 [FEATURES.md](FEATURES.md)
**Conteúdo:** Detalhes técnicos de cada feature  
**Seções:**
- 1️⃣ Calculadora Financeira (fórmulas + exemplo)
- 2️⃣ Buscar Oportunidade (Piperun API)
- 3️⃣ Filtro de Compatibilidade (lógica + evolução)
- 4️⃣ Score de Viabilidade (3 validações)
- 5️⃣ Gerar PDF (planejamento)

**Público:** Developers implementando ou refatorando features

---

### 📜 [HISTORICO.md](HISTORICO.md)
**Conteúdo:** Log de mudanças + changelog  
**Seções:**
- 2026-05-15: Documentação reorganizada
- 2026-05-13: Validações + Piperun
- 2026-05-12: Filtro flexível
- 2026-05-10: Calculadora base
- 2026-05-05: Backend setup
- 2026-05-01: Projeto inicializado
- Resumo releases (v0.1-v1.0)

**Público:** Qualquer um curioso sobre evolução do projeto

---

### 📚 [../CLAUDE.md](../CLAUDE.md)
**Localização:** Raiz do projeto  
**Conteúdo:** Overview geral (2-3 min)  
**Seções:**
- Início rápido (3 comandos)
- Estrutura do projeto
- Features principais (resumo)
- Referências importantes
- Stack técnico

**Público:** Qualquer um (entry point)

---

## 🔍 Buscar por Tópico

### 🧮 Calculadora
- Como funciona → [FEATURES.md#1️⃣](FEATURES.md#1️⃣-calculadora-financeira)
- Fórmulas → [FEATURES.md#fórmulas-de-cálculo](FEATURES.md#fórmulas-de-cálculo)
- Status → [ROADMAP.md](ROADMAP.md) (✅ Pronto)

### 🔍 Buscar Oportunidade (Piperun)
- Como funciona → [FEATURES.md#2️⃣](FEATURES.md#2️⃣-buscar-oportunidade-piperun-crm)
- Endpoint → [QUICK_START.md#get-apipiperun](QUICK_START.md#get-apipiperun)
- Mapeamento campos → [FEATURES.md#mapeamento-de-campos](FEATURES.md#mapeamento-de-campos)
- Status → [ROADMAP.md](ROADMAP.md) (✅ Pronto)

### 📊 Score de Viabilidade
- Cálculo → [FEATURES.md#4️⃣](FEATURES.md#4️⃣-score-de-viabilidade)
- 3 validações → [FEATURES.md#validações](FEATURES.md#validações)
- Status → [ROADMAP.md](ROADMAP.md) (✅ Pronto)

### 📄 Gerar PDF
- Planejamento → [FEATURES.md#5️⃣](FEATURES.md#5️⃣-gerar-pdf-estudo-financeiro)
- Timeline → [ROADMAP.md#-gerar-estudo-financeiro-em-pdf](ROADMAP.md#-gerar-estudo-financeiro-em-pdf)
- Status → [ROADMAP.md](ROADMAP.md) (⏳ TODO, prazo 2026-05-31)

### 🚀 Deploy
- Setup → [ROADMAP.md#-deploy-em-produção](ROADMAP.md#-deploy-em-produção)
- Guia CI/CD → arquivo `../GUIA_CI_CD_VERCEL.md` (raiz)
- Timeline → [ROADMAP.md](ROADMAP.md) (2026-06-15)

### 🐛 Troubleshooting
- Problemas comuns → [QUICK_START.md#4️⃣-troubleshooting](QUICK_START.md#4️⃣-troubleshooting)
- Setup Google Sheets → [QUICK_START.md#2️⃣-setup-google-sheets-crítico](QUICK_START.md#2️⃣-setup-google-sheets-crítico)

### 📝 Histórico
- Mudanças recentes → [HISTORICO.md](HISTORICO.md)
- Versões → [HISTORICO.md#-resumo-de-releases](HISTORICO.md#-resumo-de-releases)

---

## 📊 Tabela de Referência Rápida

| Pergunta | Resposta | Link |
|----------|----------|------|
| Como rodar o projeto? | 3 comandos | [QUICK_START.md](QUICK_START.md) |
| Qual é a fórmula da calculadora? | 3 fórmulas matemáticas | [FEATURES.md](FEATURES.md) |
| O que foi implementado? | 5 features, 4 prontas | [ROADMAP.md](ROADMAP.md) |
| O que falta fazer? | PDF, UI, testes, deploy | [ROADMAP.md](ROADMAP.md) |
| Quando vai para produção? | 2026-06-15 | [ROADMAP.md](ROADMAP.md) |
| Qual API do Piperun? | GET /api/piperun/{id} | [QUICK_START.md](QUICK_START.md) |
| Erro ao iniciar? | Ver troubleshooting | [QUICK_START.md](QUICK_START.md) |
| O que mudou recentemente? | Documentação organizada | [HISTORICO.md](HISTORICO.md) |

---

## 🔗 Estrutura de Pastas

```
crediclass-dashboard-grupos/
├── CLAUDE.md                    ← Overview geral (leia primeiro!)
├── docs/
│   ├── INDEX.md                 ← Você está aqui
│   ├── QUICK_START.md           ← Setup e troubleshooting
│   ├── ROADMAP.md               ← Tarefas e timeline
│   ├── FEATURES.md              ← Detalhes técnicos
│   └── HISTORICO.md             ← Changelog
├── backend/
│   ├── main.py                  ← FastAPI app
│   ├── sheets.py                ← Google Sheets
│   ├── piperun.py               ← Piperun CRM
│   └── requirements.txt
├── frontend/
│   ├── index.html               ← Dashboard
│   ├── js/app.js                ← Lógica (Alpine.js)
│   └── css/style.css            ← Estilos
├── data/
│   └── grupos.json              ← Cache (~1809 grupos)
└── ... (outros arquivos de config)
```

---

## 💡 Dicas de Navegação

### No Claude Desktop
1. Abra **[../CLAUDE.md](../CLAUDE.md)** primeiro (overview 2 min)
2. Se quer rodar: **[QUICK_START.md](QUICK_START.md)**
3. Se quer acompanhar: **[ROADMAP.md](ROADMAP.md)**
4. Se quer entender técnico: **[FEATURES.md](FEATURES.md)**
5. Se quer histórico: **[HISTORICO.md](HISTORICO.md)**

### Em Terminal
```bash
# Ver estrutura
tree crediclass-dashboard-grupos

# Buscar em documentos
grep -r "PDF" docs/  # Busca por "PDF"

# Abrir arquivo
code docs/ROADMAP.md  # Em VS Code
```

---

## 📞 Ajuda

- **Dúvida sobre setup?** → [QUICK_START.md](QUICK_START.md)
- **Dúvida sobre features?** → [FEATURES.md](FEATURES.md)
- **Dúvida sobre tarefas?** → [ROADMAP.md](ROADMAP.md)
- **Dúvida sobre evolução?** → [HISTORICO.md](HISTORICO.md)
- **Dúvida geral?** → [../CLAUDE.md](../CLAUDE.md)

---

**Última atualização:** 2026-05-15  
**Próxima revisão:** 2026-05-31 (após PDF implementado)

