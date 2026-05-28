# Deployment em Produção: Render + Vercel

**Data:** 2026-05-28  
**Status:** 🔄 Pronto para Deploy

## 📋 Resumo Executivo

Frontend Next.js e Backend FastAPI estão alinhados e testados localmente. Este documento descreve o passo-a-passo para colocar em produção no Vercel (frontend) e Render (backend).

---

## 1️⃣ BACKEND: Deploy no Render

### O que está rodando atualmente:
- **URL:** https://crediclass.csrtecnologia.com.br
- **Servidor:** Render (Web Service Python/FastAPI)
- **Status:** Online e respondendo corretamente

### O que mudou (FASE 2-3):
- ✅ Frontend types alinhados com `GrupoUpdate` Pydantic model
- ✅ `HistoricoData` structure: mes, maior_lance, menor_lance, qtd
- ✅ PUT /api/grupos/{id} endpoint pronto para receber payloads corretos

### ✅ NENHUMA mudança necessária no backend

**Razão:** O backend já implementa a estrutura esperada. O frontend foi ajustado para enviar dados no formato correto. A sincronização com Google Sheets continua funcionando normalmente.

**Verificar:**
```bash
curl -s https://crediclass.csrtecnologia.com.br/api/stats | jq .
# Deve retornar dados dos grupos
```

---

## 2️⃣ FRONTEND: Deploy na Vercel

### Situação atual:
- Código no GitHub: ✅ Push concluído
- Dependências: ✅ Instaladas (npm install)
- Build: ✅ Testado localmente (npm run build)
- Dev Server: ✅ Rodando em localhost:3000

### 📝 Passo a Passo para Vercel:

#### A. Conectar repositório à Vercel

1. **Acesse:** https://vercel.com/dashboard
2. **Clicar em:** "Add New Project"
3. **Selecionar repositório:** CristianodeSouza/crediclass-dashboard-grupos
4. **Framework:** Detectará automaticamente como Next.js ✅
5. **Root directory:** Deixar em branco (ou `frontend` se a estrutura mudou)

#### B. Configurar variáveis de ambiente

**Settings → Environment Variables**

```
NEXT_PUBLIC_API_URL=https://crediclass.csrtecnologia.com.br

# Opcional para produção:
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Crediclass Dashboard
```

⚠️ **IMPORTANTE:** 
- Sem a variável `NEXT_PUBLIC_API_URL`, o frontend tentará usar `http://localhost:8000` e falhará
- A variável DEVE ser `NEXT_PUBLIC_` para ser acessível no cliente

#### C. Build settings

**Settings → Build & Development Settings**

```
Build Command: next build
Output Directory: .next
Install Command: npm install
```

Deixar como padrão (Vercel detecta automaticamente).

#### D. Deploy

**Opção 1: Deploy automático (recomendado)**
```
Vercel monitorará git main branch
Cada push dispara deploy automático
```

**Opção 2: Deploy manual**
```bash
npm install -g vercel
cd frontend/
vercel --prod
```

### ✅ Validar após deploy:

1. **Acessar:** https://seu-projeto.vercel.app
2. **Verificar header:** Deve mostrar stats (342 grupos, 9 administradoras)
3. **Testar aba Gerenciador:** Deve listar grupos da API
4. **Testar edição:** Clicar em Editar → Salvar → Verificar resposta

---

## 3️⃣ CONFIGURAÇÃO CORS

### Frontend (Vercel):
- **URL:** https://seu-projeto.vercel.app

### Backend (Render):
**Verificar arquivo `main.py` - seção CORS:**

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://seu-projeto.vercel.app",  # ← ADICIONAR
        "http://localhost:3000",            # Já tem (dev)
        "https://crediclass.com.br",        # Se houver outro frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Se não tiver CORS configurado:**
```bash
# Acessar Render dashboard
# Selecionar seu Web Service
# Environment → Adicionar variável:
CORS_ORIGINS=https://seu-projeto.vercel.app,https://crediclass.com.br

# Depois redeployar o backend no Render
```

---

## 4️⃣ CERTIFICADO SSL / HTTPS

✅ **Vercel:** Fornece SSL automaticamente (incluído)
✅ **Render:** Fornece SSL automaticamente (incluído)

Sem ação necessária.

---

## 5️⃣ VARIÁVEIS DE AMBIENTE

### Frontend (NEXT_PUBLIC_* são públicas)

| Variável | Valor Prod | Descrição |
|----------|-----------|-----------|
| NEXT_PUBLIC_API_URL | https://crediclass.csrtecnologia.com.br | URL do backend |
| NODE_ENV | production | Modo produção |

### Backend (Render)

Verificar no Render Dashboard:
- `DATABASE_URL` (se usar banco)
- `GOOGLE_SHEETS_CREDS` (para sincronização)
- `CORS_ORIGINS` (adicionar Vercel URL)

---

## 6️⃣ CHECKLIST PRÉ-PRODUÇÃO

### Backend (Render)
- [x] FastAPI rodando com sucesso
- [x] GET /api/stats retorna dados
- [x] GET /api/grupos-gerenciador retorna histórico correto
- [ ] CORS configurado para Vercel URL
- [ ] Verificar logs no Render para erros
- [ ] Testar PUT /api/grupos/{id} com novo payload

### Frontend (Vercel)
- [ ] Repositório enviado ao GitHub ✅
- [ ] Variável NEXT_PUBLIC_API_URL configurada
- [ ] Build realizado com sucesso no Vercel
- [ ] Página carrega sem erros 404/500
- [ ] Header exibe stats corretamente
- [ ] Aba Gerenciador lista grupos
- [ ] Edição de grupo funciona e retorna sincronização

### Integração
- [ ] Frontend → Backend conectado (sem CORS errors)
- [ ] Dados sincronizam em ~15s após PUT
- [ ] Google Sheets atualiza conforme esperado

---

## 7️⃣ COMANDOS ÚTEIS

### Build local para testar antes de enviar
```bash
cd frontend/
npm run build
npm run start  # Inicia servidor de produção
# Acessar http://localhost:3000
```

### Ver logs no Render
```bash
# Via dashboard: https://dashboard.render.com
# Clicar no Web Service
# Aba "Logs"
```

### Ver logs no Vercel
```bash
# Via dashboard: https://vercel.com/dashboard
# Clicar no projeto
# Aba "Deployments" → Clicar em deployment
# Scroll down para ver build/runtime logs
```

### Testar API de produção
```bash
curl -s https://crediclass.csrtecnologia.com.br/api/stats | jq .
```

---

## 8️⃣ TROUBLESHOOTING

### "Frontend conecta mas API retorna erro CORS"
```
✅ Solução: Adicionar https://seu-projeto.vercel.app em CORS_ORIGINS no Render
```

### "Frontend mostra erro 401 Unauthorized"
```
✅ Solução: Verificar autenticação no backend
✅ O interceptor redireciona para /login (crie página de login se não existir)
```

### "Dados não atualizam após editar grupo"
```
✅ Solução: Verificar se PUT /api/grupos/{id} retorna 200
✅ Aguardar 15s para sincronização com Google Sheets
✅ Verificar logs do Render para erros de sincronização
```

### "Build falha no Vercel com erro TypeScript"
```
✅ Solução: Rodar localmente: npm run typecheck
✅ Corrigir erros e fazer push novo
```

---

## 9️⃣ PRÓXIMOS PASSOS (Após Deploy)

### Phase 1: Validação Básica (2-4 horas)
- [ ] Frontend carrega em https://seu-projeto.vercel.app
- [ ] Stats exibem corretamente
- [ ] Lista de grupos aparece
- [ ] Sem erros console (F12)

### Phase 2: Teste de Edição
- [ ] Clicar em "Editar" em um grupo
- [ ] Preencher histórico (JAN-24: maior_lance=1000, menor_lance=500, qtd=5)
- [ ] Clicar "Salvar"
- [ ] Verificar resposta: `{"status": "sucesso", "sincronizacao": "pendente"}`
- [ ] Aguardar 15-20s
- [ ] Verificar Google Sheets se dados foram sincronizados

### Phase 3: Testes de Regressão
- [ ] Testar aba Importação (upload de arquivo)
- [ ] Testar aba Analytics (gráficos carregam)
- [ ] Testar filtros (por administradora, tipo bem)
- [ ] Testar paginação na aba Gerenciador

### Phase 4: Monitoring
- [ ] Monitorar logs do Render (erros de sincronização)
- [ ] Monitorar performance (Vercel Analytics)
- [ ] Monitorar uptime (ambos os serviços)

---

## 🔟 ROLLBACK

Se algo der errado:

### Frontend (Vercel)
```
1. Dashboard Vercel → Deployments
2. Clicar em deployment anterior
3. Clicar "Rollback"
4. Esperar 1-2 minutos
```

### Backend (Render)
```
1. Dashboard Render → seu Web Service
2. Aba "Deploys"
3. Clicar em deploy anterior
4. Clicar "Deploy"
5. Esperar build completar (~2 min)
```

---

## 📞 Contatos e Documentação

- **Vercel Docs:** https://vercel.com/docs/platforms/v0-platform
- **Render Docs:** https://render.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com/

---

## 📊 Resumo de Commits

Commits enviados ao GitHub:
```
8a884cc FASE 3: Add comprehensive integration documentation
84967d3 FASE 3: Resolve histórico field mapping blocker (Option A)
3fdb93e docs: FASE 2 documentação detalhada de implementação
7336d83 FASE 2: Criar Frontend Next.js na Vercel
c6abde6 docs: Adicionar README da FASE 1 com instruções de congelamento
```

Todas as mudanças estão no repositório: https://github.com/CristianodeSouza/crediclass-dashboard-grupos

---

## ✅ Status Final

```
┌─────────────────────────────────────┐
│ FASE 1: Backend FastAPI             │ ✅ Concluída
│ FASE 2: Frontend Next.js             │ ✅ Concluída  
│ FASE 3: Integração Frontend+Backend  │ ✅ Concluída
│ DEPLOYMENT: Pronto para Produção     │ 🟡 Aguardando execução
└─────────────────────────────────────┘
```

**Próximo:** Executar deployment conforme passo a passo acima.
