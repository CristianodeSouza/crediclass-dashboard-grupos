# 🚀 GUIA DE EXECUÇÃO — Deploy Crediclass

**Status:** ✅ Código pronto | ⏳ Aguardando execução manual
**Data:** 2026-05-18

---

## ✅ O que foi feito (AUTOMÁTICO)

- ✅ `backend/main.py` — CORS configurado para `crediclass.csrtecnologia.com.br`
- ✅ `vercel.json` — Rewrites configurados para proxy de API
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

### **FASE 2️⃣ — VERCEL (10 minutos)**

```
🔗 Acesse: https://vercel.com/dashboard
```

#### **2.1 — Importar Projeto**
1. Clique: **Add New** → **Project**
2. Selecione: **Import an Existing Project**
3. Cole a URL ou selecione: `https://github.com/CristianodeSouza/crediclass-dashboard-grupos`
4. Clique: **Import**

#### **2.2 — Configurar Build**
```
Framework Preset:     Other
Root Directory:       frontend/
Build Command:        (deixar em branco)
Output Directory:     frontend/
Install Command:      (deixar em branco)
```

5. Clique: **Deploy**
6. Aguarde o deploy finalizar (2-3 minutos)

✅ **Resultado:**
```
Deployment Complete! → https://seu-projeto.vercel.app
```

#### **2.3 — Adicionar Domínio Customizado**
1. No dashboard Vercel, acesse seu projeto
2. Vá para: **Settings** → **Domains**
3. Clique: **Add Domain**
4. Digite: `crediclass.csrtecnologia.com.br`
5. Clique: **Add**
6. Aguarde validação (5-10 minutos)

✅ **Esperado:** 
```
✓ crediclass.csrtecnologia.com.br — Valid
```

---

### **FASE 3️⃣ — RAILWAY/HEROKU (15 minutos)**

#### **Opção A: Railway (RECOMENDADO)**

```
🔗 Acesse: https://railway.app
```

1. Clique: **New Project**
2. Selecione: **Deploy from GitHub**
3. Selecione repo: `crediclass-dashboard-grupos`
4. Clique: **Create**
5. Configure:
   ```
   Root Directory:   backend/
   Build Command:    pip install -r requirements.txt
   Start Command:    uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
6. Adicione **Variáveis de Ambiente:**
   ```
   GOOGLE_SHEETS_ID = 1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
   GOOGLE_API_KEY = sua-chave-aqui
   PIPERUN_API_KEY = sua-chave-aqui
   ENVIRONMENT = production
   DEBUG = false
   ```
7. Clique: **Deploy**

✅ **Resultado:**
```
Deployment Successful! → https://seu-backend.railway.app
```

#### **Opção B: Heroku (ALTERNATIVA)**

```
🔗 Acesse: https://heroku.com → Dashboard
```

1. Clique: **Create New App**
2. Nome: `crediclass-api`
3. Clique: **Create**
4. Abra: **Deploy** → **GitHub**
5. Conecte: `crediclass-dashboard-grupos`
6. Abra: **Settings** → **Config Vars**
7. Adicione:
   ```
   GOOGLE_SHEETS_ID = 1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
   GOOGLE_API_KEY = sua-chave-aqui
   PIPERUN_API_KEY = sua-chave-aqui
   ```
8. Clique: **Deploy Branch**

✅ **Resultado:**
```
https://crediclass-api.herokuapp.com
```

---

### **FASE 4️⃣ — INTEGRAR FRONTEND + BACKEND (5 minutos)**

Após obter a URL do backend (Railway ou Heroku):

#### **4.1 — Atualizar vercel.json**

1. Acesse repositório: https://github.com/CristianodeSouza/crediclass-dashboard-grupos
2. Abra arquivo: `vercel.json`
3. Procure por: `https://your-backend-railway.app`
4. Substitua pela URL real, ex:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://seu-backend.railway.app/api/:path*"
       }
     ]
   }
   ```
5. Commit e push:
   ```bash
   git add vercel.json
   git commit -m "config: Update backend URL for production"
   git push origin main
   ```

Vercel vai fazer redeploy automaticamente! (2-3 minutos)

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
1. Cloudflare       → CNAME crediclass → cname.vercel.app
                      (5 min)
                      ↓
2. Vercel Frontend  → Deploy + Domínio customizado
                      (10 min)
                      ↓
3. Railway Backend  → Deploy FastAPI + Variáveis ENV
                      (15 min)
                      ↓
4. Integração       → Atualizar vercel.json com URL real
                      (5 min)
                      ↓
5. Testes           → Verificar tudo funcionando
                      (5 min)

⏱️  TEMPO TOTAL: ~40 minutos
```

---

## ✅ CHECKLIST FINAL

- [ ] Cloudflare: CNAME criado e proxied (laranja)
- [ ] Vercel: Frontend deployado e domínio validado
- [ ] Railway/Heroku: Backend deployado com variáveis ENV
- [ ] vercel.json: Atualizado com URL real do backend
- [ ] Frontend carrega em https://crediclass.csrtecnologia.com.br
- [ ] `/api/stats` retorna dados
- [ ] Sem erros de CORS
- [ ] Calculadora funciona
- [ ] Filtros funcionam

---

**🎉 SE TUDO PASSAR NO CHECKLIST, SEU APP ESTÁ LIVE! 🚀**

Quer ajuda com alguma etapa? Me avisa!
