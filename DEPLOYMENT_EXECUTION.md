# 🚀 GUIA DE EXECUÇÃO — Deploy Crediclass

**Status:** ✅ Código pronto | ⏳ Aguardando execução manual
**Data:** 2026-05-18

---

## ✅ O que foi feito (AUTOMÁTICO)

- ✅ `backend/main.py` — CORS configurado para `crediclass.csrtecnologia.com.br`
- ✅ `render.yaml` — Configuração de deploy automático
- ✅ `PRODUCTION_ARCHITECTURE.md` — Documentação completa
- ✅ `DEPLOYMENT_SETUP.md` — Guia de checklist
- ✅ Código commitado e pushado para GitHub (main branch)

---

## 📋 O que VOCÊ precisa fazer (MANUAL)

### **FASE 1️⃣ — CLOUDFLARE (5 minutos)**

```
🔗 Acesse: https://dash.cloudflare.com
```

1. Selecione domínio: **csrtecnologia.com.br**
2. Vá para: **DNS** → **Records**
3. Clique em: **+ Add Record**
4. Preencha:
   ```
   Type:    CNAME
   Name:    crediclass
   Content: cname.vercel.app (⚠️ Vercel fornecerá o valor exato)
   Proxy:   Proxied (deve ficar LARANJA)
   TTL:     Auto
   ```
5. Clique: **Save**

✅ **Resultado esperado:**
```
crediclass.csrtecnologia.com.br → CNAME → cname.vercel.app (Proxied)
```

---

### **FASE 2️⃣ — RENDER (AUTOMÁTICO)**

```
🔗 Acesse: https://dashboard.render.com
```

O Render está configurado para fazer **deploy automático** quando você faz push para GitHub.

#### **2.1 — Verificar Deploy**
1. Acesse: https://dashboard.render.com
2. Seu projeto **crediclass-dashboard** deve estar na lista
3. Clique para ver **Logs** e confirmar que o build foi bem-sucedido
4. URL do serviço será algo como: `crediclass-dashboard-xyz.onrender.com`

✅ **Resultado:**
```
Build successful + Service is live
```

#### **2.2 — Domínio Customizado**
Já está configurado no Cloudflare! Basta validar que aponta para Render:

1. No dashboard Cloudflare, vá para **DNS**
2. Verifique CNAME: `crediclass` → `onrender.com`
3. Proxy deve estar **Proxied** (laranja)
4. Aguarde validação (5-10 minutos)

✅ **Esperado:** 
```
✓ crediclass.csrtecnologia.com.br aponta para Render
```

---

### **FASE 3️⃣ — BACKEND NO RENDER (AUTOMÁTICO)**

```
🔗 Acesse: https://dashboard.render.com
```

O Render já está configurado com `render.yaml` para fazer deploy automático do backend.

#### **O que acontece automaticamente:**
1. Push para GitHub → Render detecta
2. Render executa: `pip install -r backend/requirements.txt`
3. Render inicia: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Frontend e Backend **já estão no mesmo serviço Render**

✅ **Resultado:**
```
Build successful → Backend servindo em https://crediclass-dashboard-xyz.onrender.com
```

#### **Variáveis de Ambiente**
Você precisa configurar no Render Dashboard:
```
GOOGLE_SHEETS_ID = 1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
GOOGLE_API_KEY = sua-chave-aqui
PIPERUN_API_KEY = sua-chave-aqui
ENVIRONMENT = production
DEBUG = false
```

Se não conseguir acessar o Dashboard, consulte `RENDER_SETUP.md`.

---

### **FASE 4️⃣ — INTEGRAÇÃO AUTOMÁTICA (JÁ FEITA)**

✅ **Frontend e Backend já estão integrados no Render!**

O `render.yaml` define que:
1. Frontend (arquivos estáticos) é servido de `/frontend`
2. Backend (FastAPI) responde em `/api`
3. Routing automático: `/api/*` → FastAPI, `/*` → Frontend

**Nada a fazer!** Tudo acontece automaticamente quando você faz push para GitHub.

---

## 🧪 TESTES PÓS-DEPLOY

### **Teste 1️⃣ — Frontend Carrega?**
```
🌐 Acesse: https://crediclass.csrtecnologia.com.br
```
✅ Deve carregar com logo, calculadora e tabela

---

### **Teste 2️⃣ — API Funciona?**
```bash
curl "https://crediclass.csrtecnologia.com.br/api/stats"
```
✅ Esperado:
```json
{
  "total_grupos": 1809,
  "por_administradora": {...},
  "por_tipo_bem": {...},
  "media_lance_geral": 12500.5
}
```

---

### **Teste 3️⃣ — Filtros Funcionam?**
```bash
curl "https://crediclass.csrtecnologia.com.br/api/grupos?adm=ITAU&tipo_bem=Imóvel"
```
✅ Deve retornar grupos filtrados

---

### **Teste 4️⃣ — CORS Funciona?**
Abra console do navegador (F12) em `crediclass.csrtecnologia.com.br`:
```javascript
fetch('/api/stats').then(r => r.json()).then(console.log)
```
✅ Não deve ter erro de CORS

---

## ⚠️ TROUBLESHOOTING

| Problema | Solução |
|----------|---------|
| **DNS não valida** | Aguarde 15-30 min, DNS se propaga devagar |
| **Vercel mostra 404** | Verifique root directory = `frontend/` |
| **API retorna 503** | Backend offline, verifique logs em Railway/Heroku |
| **CORS error no console** | Backend/CORS pode estar desatualizado |
| **Domínio não resolve** | Cloudflare CNAME pode estar errado |

---

## 📞 RESUMO DO PLANO

```
1. Cloudflare       → CNAME crediclass → onrender.com
                      (5 min)
                      ↓
2. Render Deploy    → Automático via GitHub (render.yaml)
                      (2-3 min, automático)
                      ↓
3. Variáveis ENV    → Configurar em Render Dashboard
                      (5 min)
                      ↓
4. Verificar DNS    → CNAME validado e proxied
                      (5-10 min, aguardar propagação)
                      ↓
5. Testes           → Verificar tudo funcionando
                      (5 min)

⏱️  TEMPO TOTAL: ~22-28 minutos
```

---

## ✅ CHECKLIST FINAL

- [ ] Cloudflare: CNAME criado e proxied (laranja), apontando para `onrender.com`
- [ ] Render: Deploy bem-sucedido com render.yaml
- [ ] Render: Variáveis de ambiente configuradas
- [ ] DNS: CNAME propagado e validado
- [ ] Frontend carrega em https://crediclass.csrtecnologia.com.br
- [ ] `/api/stats` retorna dados
- [ ] Sem erros de CORS
- [ ] Calculadora funciona
- [ ] Filtros funcionam

---

**🎉 SE TUDO PASSAR NO CHECKLIST, SEU APP ESTÁ LIVE! 🚀**

Quer ajuda com alguma etapa? Me avisa!
