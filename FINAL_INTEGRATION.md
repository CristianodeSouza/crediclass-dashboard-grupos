# 🔗 INTEGRAÇÃO FINAL — Render Unified Service

**Quando usar este arquivo:** Após ter o deploy Render rodando  
**Tempo:** ~5 minutos para validação

---

## 📍 Arquitetura Unificada

No novo setup, **Frontend + Backend rodam no mesmo serviço Render**:

```
┌─────────────────────────────────────┐
│  Render Unified Service             │
├─────────────────────────────────────┤
│                                     │
│  Frontend (Static Files)            │
│  ├─ / → index.html                  │
│  ├─ /static/* → assets              │
│  └─ /* → SPA routing                │
│                                     │
│  Backend (FastAPI — Uvicorn)       │
│  └─ /api/* → FastAPI routes         │
│                                     │
└─────────────────────────────────────┘
         ↓
   crediclass.csrtecnologia.com.br
```

**Não há mais:**
- ❌ `vercel.json` (não existe no Render)
- ❌ `build command` para frontend separadamente
- ❌ Rewrite rules
- ✅ **Tudo funciona em um único serviço**

---

## 🔐 Passo 1: Verificar render.yaml

**Arquivo:** `render.yaml` (na raiz do repositório)

Já deve estar configurado assim:

```yaml
services:
  - type: web
    name: crediclass-dashboard
    runtime: python
    pythonVersion: 3.11
    buildCommand: pip install -r backend/requirements.txt
    startCommand: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
    staticPublicPath: frontend
    routes:
      - path: /api/*
        destination: http://0.0.0.0:$PORT/api/$1
      - path: /*
        destination: http://0.0.0.0:$PORT/$1
```

**Se alguma linha está diferente, atualize agora!**

---

## 🔐 Passo 2: Verificar CORS

**Arquivo:** `backend/main.py` (linhas 1-60)

Deve estar configurado para aceitar requisições do domínio:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://crediclass.csrtecnologia.com.br",
        "http://localhost:8000",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**✅ Já está correto!** Frontend e backend no mesmo serviço não precisam de CORS complexo, mas está configurado para segurança.

---

## 🔐 Passo 3: Verificar Variáveis de Ambiente

**No Render Dashboard:**

1. Acesse seu serviço `crediclass-dashboard`
2. Vá para **Environment**
3. Verifique que estas variáveis estão configuradas:

```
GOOGLE_SHEETS_ID=1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
GOOGLE_API_KEY=sua-chave-aqui
PIPERUN_API_KEY=sua-chave-aqui
ENVIRONMENT=production
DEBUG=false
```

Se faltam, adicione agora. **Render faz redeploy automático!**

---

## 📤 Passo 4: Commit e Push

Se fez alguma mudança em `render.yaml` ou `backend/main.py`:

```bash
cd C:\Users\User\crediclass-dashboard-grupos

# Se atualizou render.yaml:
git add render.yaml

# Se atualizou backend/main.py:
git add backend/main.py

# Commit
git commit -m "config: Unified Render deployment configuration

- Verified render.yaml for unified frontend + backend service
- Verified CORS configuration for production domain"

# Push
git push origin main
```

**Render vai fazer redeploy automaticamente!** (2-3 minutos)

---

## 🧪 Passo 5: Testar Integração

### **Teste 1: Frontend carrega?**
```
🌐 Acesse: https://crediclass.csrtecnologia.com.br
✅ Deve mostrar calculadora + tabela de grupos
```

### **Teste 2: Arquivos estáticos carregam?**
```
🌐 Acesse: https://crediclass.csrtecnologia.com.br/static/
✅ Deve listar arquivos CSS, JS, imagens
```

### **Teste 3: API funciona?**
Abra o console (F12) e execute:
```javascript
fetch('/api/stats')
  .then(r => r.json())
  .then(d => console.log(d))
```
✅ Deve mostrar JSON com estatísticas

### **Teste 4: Filtros funcionam?**
```javascript
fetch('/api/grupos?adm=ITAU')
  .then(r => r.json())
  .then(d => console.log(d.grupos))
```
✅ Deve mostrar grupos da ITAU

### **Teste 5: Calculadora funciona?**
1. Acesse https://crediclass.csrtecnologia.com.br
2. Preencha valores na calculadora
3. Clique em "Simular"
✅ Deve aparecer resultado com comparativo

---

## ✅ Checklist Final

- [ ] render.yaml está presente e correto
- [ ] Variáveis de ambiente configuradas no Render
- [ ] Commit e push feito (se houve mudanças)
- [ ] Aguardou Render redeploy (2-3 min)
- [ ] https://crediclass.csrtecnologia.com.br carrega
- [ ] Arquivos estáticos (/static/*) servindo
- [ ] /api/stats retorna dados
- [ ] Filtros funcionam (/api/grupos?adm=X)
- [ ] Calculadora responde
- [ ] Console (F12) sem erros CORS

---

## 🚀 PRONTO!

Se tudo passou no checklist, seu app está **100% LIVE** em produção! 🎉

```
✅ Frontend: https://crediclass.csrtecnologia.com.br
✅ Backend: /api/* (mesmo serviço Render)
✅ Static Files: /static/* (Render serving)
✅ DNS: Cloudflare CNAME → onrender.com
✅ CORS: Configurado para production
✅ Unificado: Render Unified Service
```

---

## 📞 Suporte

Se algo não funcionar:

1. **Verifique Render logs:**
   ```
   Render Dashboard → seu serviço → Logs
   ```

2. **Verifique DNS propagação** (pode levar 30 min)
   ```bash
   nslookup crediclass.csrtecnologia.com.br
   # Deve retornar: onrender.com
   ```

3. **Verifique console do navegador** (F12)
   - Erros de CORS?
   - Errros de 404?
   - Network tab mostra respostas?

4. **Teste endpoint diretamente:**
   ```bash
   curl https://crediclass.csrtecnologia.com.br/api/stats
   ```

---

**Parabéns! Você tem um app em produção com Render Unified!** 🚀
