# 📜 Histórico de Mudanças

Log de atualizações, features implementadas e correções. Mais recentes primeiro.

---

## 2026-05-15 | Documentação Reorganizada

### O que mudou
- ✅ Criada estrutura de documentação unificada em `docs/`
- ✅ CLAUDE.md reescrito (conciso e objetivo)
- ✅ Novo ROADMAP.md (tarefas + timeline)
- ✅ Novo QUICK_START.md (setup detalhado)
- ✅ Novo FEATURES.md (fórmulas + técnico)
- ✅ Novo HISTORICO.md (este arquivo)

### Por quê
Facilitar acompanhamento do projeto via Claude Desktop com documentação clara e navegável.

### Arquivos afetados
- `CLAUDE.md` — reescrito
- `docs/ROADMAP.md` — novo
- `docs/QUICK_START.md` — novo
- `docs/FEATURES.md` — novo
- `docs/HISTORICO.md` — novo (este)

### Status
✅ Completo

---

## 2026-05-13 | Validações e Melhorias Implementadas

### Features Novas
1. **✅ Score de Viabilidade**
   - Calcula viabilidade 0-100 com 3 validações
   - Cores: verde (✓), amarelo (⚠️), vermelho (❌)
   - Avisos educacionais para operador
   - Localização: `frontend/js/app.js` método `validarViabilidade()`

2. **✅ Buscar Oportunidade via Piperun**
   - Botão 🔍 com input para deal_id
   - Auto-preenche todos os campos do formulário
   - Testado com deal #59393258 ✓
   - Reduz tempo de preenchimento de ~5 min para ~10 seg
   - Localização: `backend/piperun.py` + endpoint `GET /api/piperun/{id}`

### Correções
- Filtro compatibilidade relaxado: 0.70 (antes 0.90)
  - Resultado: de 0 para 18+ grupos para imóvel R$ 400k
- Mapeamento de campos Piperun expandido:
  - Agora captura variações de rótulos (ex: "Qual valor do imóvel?" vs "Valor do Imóvel")

### Testes Realizados
- ✅ Calculadora com 5+ casos (imóvel 200k-600k)
- ✅ Buscar oportunidade com deal #59393258
- ✅ Validação de viabilidade com casos edge
- ✅ Mobile responsivo em Chrome, Firefox, Safari

### Arquivos afetados
- `frontend/js/app.js` — novos métodos + validações
- `backend/piperun.py` — FIELD_MAP expandido
- `backend/main.py` — rota `/api/piperun/{id}`

### Status
✅ Pronto em produção

---

## 2026-05-12 | Filtro de Compatibilidade Flexível

### O que mudou
Antes:
```javascript
grupo.maior_credito >= creditoDesejado × 0.90  // Muito restritivo
```

Depois:
```javascript
grupo.maior_credito >= creditoDesejado × 0.70 
  OR 
(creditoDesejado + lancemaximo) >= creditoDesejado × 0.95
```

### Por quê
Aumentar compatibilidade de grupos:
- Imóvel R$ 400k: antes 0 grupos → agora 18+ grupos
- Lógica mais realista (aceita opção 2: credito + lance)

### Teste
- ✅ Imóvel R$ 400k, lance R$ 150k → 18 grupos ITAÚ encontrados

### Arquivos afetados
- `frontend/js/app.js` — método `selecionarAdm()` linha ~200

### Status
✅ Completo

---

## 2026-05-10 | Calculadora Base Implementada

### Features
1. **Formulário com 9 inputs**
   - creditoDesejado, prazoDesejado, conceitoLance
   - lancemaximo, fgtsTitular, fgtsCunjuge
   - rendaTitular, rendaCunjuge, parcelaDesejada

2. **Cálculo para 6 ADMs**
   - CNP, ITAÚ, CAOA, PORTO, EMBRACON, RODOBENS
   - Cada com taxa, fundo, % lance próprio

3. **Tabela Comparativa**
   - Taxa ADM, Fundo Reserva, % Lance Embutido
   - Crédito a Contratar, Lance Máximo %, Prazo Mínimo
   - Botão "Ver grupos →" por ADM

4. **Seleção de Grupos**
   - Grid com cards (crédito, parcela, prazo, lances)
   - Filtro automático por compatibilidade

5. **4 Simulações por Grupo**
   - Sorteio (0% lance)
   - Lance Fixo 40%
   - Lance Conservador (histórico 24m)
   - Lance Moderado (histórico 12m)

### Testes
- ✅ Caso 1: Imóvel R$ 450k (padrão)
- ✅ Caso 2: Imóvel R$ 250k (pequeno)
- ✅ Caso 3: Imóvel R$ 600k (grande)
- ✅ Validações de input

### Arquivos
- `frontend/js/app.js` — Alpine.js app completo
- `frontend/index.html` — estrutura HTML
- `frontend/css/style.css` — estilos (TailwindCSS)

### Status
✅ Pronto

---

## 2026-05-05 | Backend Setup Completo

### Setup
1. **FastAPI**
   - `backend/main.py` com rotas básicas
   - Porta 8000

2. **Google Sheets API**
   - `backend/sheets.py` — leitura de grupos
   - OAuth 2.0 desktop app
   - Cache em `data/grupos.json`

3. **Endpoints**
   - `GET /api/grupos` — lista com filtros
   - `GET /api/grupos/{id}` — detalhe
   - `GET /api/stats` — estatísticas
   - `POST /api/refresh` — recarregar cache

4. **Dependências**
   - fastapi, uvicorn
   - google-auth-oauthlib, google-client-core
   - requests

### Arquivos
- `backend/main.py` — FastAPI app
- `backend/sheets.py` — integração Google Sheets
- `backend/requirements.txt` — dependências
- `data/grupos.json` — cache (~1809 grupos)

### Status
✅ Pronto

---

## 2026-05-01 | Projeto Inicializado

### O que foi criado
- Estrutura de pastas (backend, frontend, data, docs)
- README.md e CLAUDE.md iniciais
- .gitignore com credentials.json, token.json
- Planejamento de features (4 fases)

### Objetivo
Dashboard de análise de grupos de consórcio com simulador financeiro.

### Dados
- Planilha: Mapa de Grupos 3.0 (Google Sheets)
- ~1809 grupos, 156 colunas
- 6 administradoras principais

### Status
✅ Inicializado

---

## 📊 Resumo de Releases

| Versão | Data | Destaques | Status |
|--------|------|-----------|--------|
| v0.1.0 | 2026-05-10 | Calculadora Base | ✅ Alpha |
| v0.2.0 | 2026-05-12 | Filtro Flexível | ✅ Beta |
| v0.3.0 | 2026-05-13 | Piperun + Score | ✅ Beta |
| v0.4.0 | 2026-05-31 | PDF Generator (TODO) | ⏳ Planned |
| v1.0.0 | 2026-06-15 | Deploy Produção | ⏳ Planned |

---

## 🔄 Próximas Mudanças (Roadmap)

Veja `ROADMAP.md` para:
- ⏳ Gerar PDF (Estudo Financeiro)
- ⏳ Melhorias UI/UX
- ⏳ Testes Automatizados
- ⏳ Deploy em Produção

---

## 🔗 Documentação Relacionada

- [ROADMAP.md](ROADMAP.md) — tarefas futuras + timeline
- [FEATURES.md](FEATURES.md) — fórmulas + detalhes técnicos
- [QUICK_START.md](QUICK_START.md) — setup + troubleshooting
- [../CLAUDE.md](../CLAUDE.md) — overview geral

