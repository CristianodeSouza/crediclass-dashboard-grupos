# 🔗 INTEGRAÇÃO FINAL — Frontend + Backend

**Quando usar este arquivo:** Após ter as URLs de Vercel e Railway  
**Tempo:** ~5 minutos

---

## 📍 Passo 1: Obter URLs

Você vai precisar de **2 URLs**:

### **URL do Vercel (Frontend)**
```
Acessível em: https://crediclass.csrtecnologia.com.br
(ou seu domínio provisório: crediclass-dashboard-grupos-xxx.vercel.app)
```

### **URL do Railway (Backend)**
```
Exemplo: https://seu-app.railway.app
(Você obtém isso em Railway Dashboard → Environment)
```

---

## 🔄 Passo 2: Atualizar vercel.json

**Arquivo:** `vercel.json`

**Procure por:**
```json
"destination": "https://your-backend-railway.app/api/:path*"
```

**Substitua por sua URL real:**
```json
"destination": "https://seu-app.railway.app/api/:path*"
```

**Exemplo completo:**
```json
{
  "version": 2,
  "buildCommand": "cd frontend && echo 'Frontend build complete'",
  "outputDirectory": "frontend",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://seu-backend.railway.app/api/:path*"
    }
  ]
}
```

---

## 🔐 Passo 3: Verificar CORS

**Arquivo:** `backend/main.py` (linhas 48-55)

✅ Já está configurado para:
```python
allow_origins=[
    "https://crediclass.csrtecnologia.com.br",
    "http://localhost:3000",
    "http://localhost:8000",
]
```

**Se seu domínio é diferente, atualize a primeira linha!**

---

## 📤 Passo 4: Commit e Push

```bash
cd /home/user/crediclass-dashboard-grupos

# Se atualizou vercel.json:
git add vercel.json

# Se atualizou backend/main.py:
git add backend/main.py

# Commit
git commit -m "config: Integrate frontend and backend URLs for production

- Updated vercel.json with Railway backend URL
- Verified CORS configuration"

# Push
git push origin main
```

**Vercel vai fazer redeploy automaticamente!** (2-3 minutos)

---

## 🧪 Passo 5: Testar Integração

### **Teste 1: Frontend carrega?**
```
🌐 Acesse: https://crediclass.csrtecnologia.com.br
✅ Deve mostrar calculadora + tabela
```

### **Teste 2: API funciona?**
Abra o console (F12) e execute:
```javascript
fetch('/api/stats')
  .then(r => r.json())
  .then(d => console.log(d))
```
✅ Deve mostrar JSON com estatísticas

### **Teste 3: Filtros funcionam?**
```javascript
fetch('/api/grupos?adm=ITAU')
  .then(r => r.json())
  .then(d => console.log(d.grupos))
```
✅ Deve mostrar grupos da ITAU

### **Teste 4: Calculadora funciona?**
1. Abra https://crediclass.csrtecnologia.com.br
2. Preencha valores na calculadora
3. Clique em "Simular"
✅ Deve aparecer resultado

---

## ✅ Checklist Final

- [ ] URL do Railway obtida
- [ ] vercel.json atualizado com URL real
- [ ] CORS verificado em backend/main.py
- [ ] Commit e push feito
- [ ] Aguardou Vercel redeploy (2-3 min)
- [ ] https://crediclass.csrtecnologia.com.br carrega
- [ ] /api/stats retorna dados
- [ ] Calculadora funciona
- [ ] Filtros funcionam

---

## 🚀 PRONTO!

Se tudo passou no checklist, seu app está **100% LIVE** em produção! 🎉

```
✅ Frontend: https://crediclass.csrtecnologia.com.br
✅ Backend: https://seu-app.railway.app/api/*
✅ DNS: Cloudflare (CNAME proxied)
✅ Integração: vercel.json com rewrite
✅ CORS: Configurado
```

---

## 📞 Suporte

Se algo não funcionar:

1. **Verifique DNS** (pode levar 30 min para propagar)
2. **Verifique logs** no Railway Dashboard
3. **Verifique console** (F12) para erros CORS
4. **Teste endpoint diretamente:**
   ```bash
   curl https://seu-app.railway.app/api/stats
   ```

---

**Parabéns! Você tem um app em produção!** 🚀
