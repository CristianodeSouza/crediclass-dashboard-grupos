# Setup Render.com — Crediclass Backend

## ✅ Pré-requisitos
- [x] Conta Render.com criada
- [x] GitHub conectado ao Render (SSO)
- [x] Credenciais Google Sheets API prontas
- [x] Piperun API key pronta (se usar)

---

## 🚀 Passo 1: Criar Novo Serviço no Render

1. Acesse https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Selecione seu repositório: `crediclass-dashboard-grupos`
4. Clique **"Connect"**

---

## ⚙️ Passo 2: Configurar o Serviço

Na tela de configuração, preencha:

| Campo | Valor |
|-------|-------|
| **Name** | `crediclass-backend` |
| **Environment** | `Python 3` |
| **Region** | `US (Ohio)` ou sua preferência |
| **Branch** | `claude/migrate-render` |
| **Build Command** | `pip install -r backend/requirements.txt` |
| **Start Command** | `uvicorn backend.main:app --host 0.0.0.0 --port 10000` |
| **Plan** | `Free` (ou `Starter` se quiser mais confiabilidade) |

---

## 🔐 Passo 3: Adicionar Variáveis de Ambiente

1. Vá até a seção **"Environment"**
2. Clique **"Add Environment Variable"**
3. Adicione cada uma:

### Google Sheets API (OBRIGATÓRIO)
- **Key:** `GOOGLE_SHEETS_CREDENTIALS_JSON`
- **Value:** Cole todo o JSON de credenciais do Google

Exemplo:
```json
{"type":"service_account","project_id":"seu-projeto","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"seu@email.com",...}
```

### Piperun API (Opcional - se usar)
- **Key:** `PIPERUN_API_KEY`
- **Value:** Sua chave de API do Piperun

---

## ✨ Passo 4: Deploy

1. Clique **"Create Web Service"**
2. Aguarde o build e deploy (2-3 minutos)
3. Se tudo OK, você verá:
   - ✅ Build successful
   - ✅ Service is live
   - 🔗 URL do serviço (tipo: `crediclass-backend.onrender.com`)

---

## 🧪 Passo 5: Testar Endpoints

```bash
# Teste healthcheck
curl https://crediclass-backend.onrender.com/health

# Teste API
curl https://crediclass-backend.onrender.com/api/stats
```

---

## 📝 Passo 6: Domínio Customizado (Cloudflare)

Após o backend estar rodando no Render, configure o domínio customizado:

1. Acesse Cloudflare Dashboard
2. DNS → Add Record
3. Type: CNAME
4. Name: `crediclass`
5. Content: `onrender.com`
6. Proxy: Proxied (laranja)
7. Save

**Resultado esperado:**
```
crediclass.csrtecnologia.com.br → CNAME → onrender.com (Proxied)
```

Aguarde 5-10 minutos pela propagação DNS.

---

## 🐛 Troubleshooting

| Erro | Solução |
|------|---------|
| **"Application failed to respond"** | Verifique se `/health` endpoint está respondendo |
| **"Build failed"** | Verificar `requirements.txt` — alguma dependência pode estar faltando |
| **"Health check failing"** | Certificar que `@app.get("/health")` existe em `backend/main.py` |
| **"500 Internal Server Error"** | Verificar se variáveis de ambiente estão configuradas corretamente |
| **CNAME não valida** | Aguarde 15-30 minutos. DNS se propaga devagar. Verifique se aponta para `onrender.com` |

---

## 💡 Dicas

- **Free Plan:** Serviço dorme após 15 min sem requisições. Para produção, use **Standard** ($12/mês)
- **Auto-redeploy:** Render redeploy automático quando você faz push para `main` branch
- **Logs:** Acesse em **Logs** do serviço no dashboard para debugging
- **Unified Service:** Frontend e Backend rodam no mesmo serviço Render

---

**Pronto! Você está no ar! 🚀**
