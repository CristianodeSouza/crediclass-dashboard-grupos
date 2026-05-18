# 🚂 Railway Deployment — Crediclass Backend

**Status:** ✅ Backend pronto para deploy no Railway  
**Data:** 2026-05-18

---

## 🎯 O que fazer (4 PASSOS — ~10 minutos)

### **PASSO 1️⃣ — Criar conta Railway**

```
🔗 Acesse: https://railway.app
```

- Clique: **Sign in** → **GitHub**
- Autorize Railway acessar seu GitHub
- Pronto!

---

### **PASSO 2️⃣ — Criar novo projeto**

```
Railway Dashboard → + New Project
```

1. Selecione: **Deploy from GitHub repo**
2. Procure por: `crediclass-dashboard-grupos`
3. Selecione: CristianodeSouza/crediclass-dashboard-grupos
4. Clique: **Create**

**Railway vai começar o build automaticamente!**

---

### **PASSO 3️⃣ — Adicionar variáveis de ambiente**

Na página do projeto Railway:

1. Clique: **Settings**
2. Procure por: **Environment Variables**
3. Clique: **+ Add Variable**
4. Adicione **CADA UMA** das variáveis abaixo:

```
Nome:  GOOGLE_SHEETS_ID
Valor: 1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
```

```
Nome:  GOOGLE_API_KEY
Valor: sua-chave-aqui (você consegue em Google Cloud Console)
```

```
Nome:  PIPERUN_API_KEY
Valor: sua-chave-piperun (você consegue em Piperun)
```

```
Nome:  ENVIRONMENT
Valor: production
```

```
Nome:  DEBUG
Valor: false
```

**Clique "Deploy" após adicionar todas!**

---

### **PASSO 4️⃣ — Obter URL do backend**

Na página do projeto Railway:

1. Procure por: **Environment** ou **Deployment**
2. Procure por um domínio tipo:
   ```
   https://seu-app.railway.app
   ```
3. **Copie essa URL**

**⚠️ IMPORTANTE:** Você vai usar isso para atualizar `vercel.json`!

---

## 📋 Arquivo de Configuração (JÁ PRONTO!)

### **backend/Procfile**
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```
✅ Já está no repositório!

### **backend/requirements.txt**
```
fastapi==0.115.0
uvicorn==0.30.6
google-api-python-client==2.139.0
google-auth==2.32.0
python-dotenv==1.0.1
httpx==0.27.2
```
✅ Já está no repositório!

### **backend/.env.example**
```bash
GOOGLE_SHEETS_ID=1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
GOOGLE_API_KEY=sua-chave-aqui
PIPERUN_API_KEY=sua-chave-piperun
ENVIRONMENT=production
DEBUG=false
```
✅ Já está no repositório!

---

## 🧪 Teste o backend

Após deploy no Railway, você terá uma URL tipo: `https://seu-app.railway.app`

### **Teste 1: API funcionando?**
```bash
curl https://seu-app.railway.app/api/stats
```
✅ Deve retornar JSON com estatísticas

### **Teste 2: Filtros funcionam?**
```bash
curl "https://seu-app.railway.app/api/grupos?adm=ITAU"
```
✅ Deve retornar grupos da ITAU

### **Teste 3: Criar grupo?**
```bash
curl -X POST https://seu-app.railway.app/api/grupos \
  -H "Content-Type: application/json" \
  -d '{"grupo":"XYZ-001","adm":"TEST"}'
```
✅ Deve retornar HTTP 201 Created

---

## 🔗 PRÓXIMA ETAPA

Após obter a URL do Railway (ex: `https://seu-app.railway.app`):

1. Edite: `vercel.json`
2. Procure por: `"destination": "https://your-backend-railway.app/api/:path*"`
3. Substitua por: `"destination": "https://seu-app.railway.app/api/:path*"`
4. Commit e push:
   ```bash
   git add vercel.json
   git commit -m "config: Update backend URL for production"
   git push origin main
   ```
5. Vercel vai fazer redeploy automaticamente!

---

## ⚠️ Troubleshooting

| Problema | Solução |
|----------|---------|
| **Build falha** | Verifique logs em Railway → Logs |
| **500 error na API** | Cheque variáveis ENV no Railway Settings |
| **CORS error** | Verifique CORS em `backend/main.py` (já configurado!) |
| **Timeout** | Railway pode estar dormindo (free tier), aguarde |

---

## 📞 Endpoints Disponíveis

Após deploy, esses endpoints estarão disponíveis:

```
GET  /api/grupos                    — Lista grupos com filtros
GET  /api/grupos/{id}               — Detalhe de um grupo
POST /api/grupos                    — Criar novo grupo
PUT  /api/grupos/{id}               — Atualizar grupo

GET  /api/grupos-gerenciador        — Lista paginada (admin)

GET  /api/stats                     — Estatísticas gerais
GET  /api/piperun/{deal_id}         — Buscar oportunidade Piperun
POST /api/refresh                   — Atualizar dados
```

---

**✅ Backend pronto! Deploy leva ~5 minutos no Railway!** 🚀
