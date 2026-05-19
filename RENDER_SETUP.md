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

## 📝 Passo 6: Atualizar Vercel (Opcional)

Se usar domínio customizado, atualize o proxy no Vercel:

1. Atualize `api/[...path].js` para apontar para novo URL do Render
2. Ou configure DNS CNAME para `crediclass-backend.onrender.com`

---

## 🐛 Troubleshooting

| Erro | Solução |
|------|---------|
| **"Application failed to respond"** | Verifique se `/health` endpoint está respondendo |
| **"Build failed"** | Verificar `requirements.txt` — alguma dependência pode estar faltando |
| **"Health check failing"** | Certificar que `@app.get("/health")` existe em `backend/main.py` |
| **"500 Internal Server Error"** | Verificar se `GOOGLE_SHEETS_CREDENTIALS_JSON` está correto |

---

## 💡 Dicas

- **Free Plan:** Serviço dorme após 15 min sem requisições. Para produção, use **Starter** ($7/mês)
- **Auto-redeploy:** Render redeploy automático quando você faz push para `claude/migrate-render`
- **Logs:** Acesse em **Logs** do serviço no dashboard para debugging

---

**Pronto! Você está no ar! 🚀**
