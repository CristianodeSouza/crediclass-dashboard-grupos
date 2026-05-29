# 🚀 Plano de Setup do Zero — Crediclass Dashboard Grupos

**Status:** ✅ LIMPEZA COMPLETADA | Todos os projetos deletados | Repositório GitHub preservado

---

## ✅ O que foi feito

### Limpeza Realizada (29 de Maio de 2026)

- ✅ **Render**: Serviço `crediclass-dashboard-grupos` deletado permanentemente
  - Método: Settings → Delete Web Service (confirmação textual)
  - Status: Removido ✅
  - Recursos deletados: Deployments, domínios, variáveis de ambiente

- ✅ **Vercel**: Projeto `crediclass-dashboard-grupos-v2` deletado permanentemente
  - Método: Project Settings → Delete Project (confirmação: nome do projeto)
  - Status: Removido ✅
  - Recursos deletados: Deployments, domínios, variáveis de ambiente, preview URLs

- ✅ **Removido acesso a produção** (URLs antigas inativas)

- ✅ **Repositório GitHub intacto** com código limpo e sem imports inválidos

---

## 🔧 Próximas Etapas para Novo Setup

### 1. **Verificar Credenciais e Variáveis de Ambiente**

Antes de fazer deploy, você PRECISA ter:

```env
# Backend (.env ou Render environment)
GOOGLE_SHEETS_ID=1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
GOOGLE_API_KEY=<sua-chave-google-api>
PIPERUN_API_KEY=<sua-chave-piperun>
ENVIRONMENT=production
DEBUG=false
PORT=8000
```

**Onde obter:**
- **GOOGLE_API_KEY**: [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
- **PIPERUN_API_KEY**: [PipeRun Dashboard](https://app.piperun.com) → Settings → API
- **GOOGLE_SHEETS_ID**: Já configurado (tabela Grupos 3.0)

---

### 2. **Setup Local (Desenvolvimento)**

```bash
# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# → http://localhost:8000/api

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

Teste se os dados carregam:
- Frontend: http://localhost:3000
- API: http://localhost:8000/api/grupos-gerenciador?limit=1

---

### 3. **Deploy no Render (Backend)**

1. **Acesse** https://dashboard.render.com
2. **Criar novo serviço** → "New Web Service"
3. **Conectar repositório**: CristianodeSouza/crediclass-dashboard-grupos
4. **Configuração**:
   - **Name**: crediclass-dashboard-api
   - **Runtime**: Python 3.11
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `sh -c 'PYTHONPATH=/app python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT'`
   - **Root Directory**: (deixar vazio — vai usar root do repo)

5. **Environment Variables**:
   ```
   GOOGLE_SHEETS_ID=1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM
   GOOGLE_API_KEY=<sua-chave>
   PIPERUN_API_KEY=<sua-chave>
   ENVIRONMENT=production
   DEBUG=false
   ```

6. **Deploy** → Aguarde ~5-10 minutos

---

### 4. **Deploy no Vercel (Frontend)**

1. **Acesse** https://vercel.com/dashboard
2. **Criar novo projeto** → "Add New..." → "Project"
3. **Importar repositório**: CristianodeSouza/crediclass-dashboard-grupos
4. **Configuração**:
   - **Framework Preset**: Next.js
   - **Root Directory**: frontend

5. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=<sua-url-render-backend>
   NEXT_PUBLIC_APP_NAME=Crediclass Dashboard Grupos
   ```

6. **Deploy** → Aguarde ~3-5 minutos

---

### 5. **Teste Completo**

Após ambos os deploys:

```bash
# Execute o script de verificação
python3 zero_erro.py
```

Deve ver:
- ✅ Git: Working tree limpo
- ✅ Render: Backend respondendo
- ✅ Vercel: Frontend respondendo
- ✅ URLs de Produção: HTTP 200/301

---

## 📊 URLs de Produção (após setup)

| Serviço | URL |
|---------|-----|
| Frontend | `https://<seu-dominio-vercel>.vercel.app` |
| Backend API | `https://<seu-dominio-render>.onrender.com/api` |

---

## 🔍 Troubleshooting

### Dados não carregam no frontend
1. Verifique `NEXT_PUBLIC_API_URL` no Vercel
2. Verifique CORS no backend (deve permitir "*")
3. Teste backend diretamente: `curl https://<backend>/api/grupos-gerenciador?limit=1`

### Backend retorna 500
1. Verifique `GOOGLE_API_KEY` está correto
2. Verifique logs no Render Dashboard
3. Teste localmente: `python3 -m uvicorn backend.main:app`

### Google Sheets API não autorizado
1. Confirme `GOOGLE_API_KEY` tem permissão de leitura
2. Confirme ID da planilha está correto
3. Planilha deve estar compartilhada publicamente (ou em modo leitura)

---

## 📝 Documentação de Referência

- **CLAUDE.md**: Guia de desenvolvimento local
- **README.md**: Documentação geral do projeto
- **render.yaml**: Configuração do Render
- **.env.example**: Template de variáveis de ambiente

---

**Última atualização**: 29 de Maio de 2026
**Status**: Pronto para novo deploy
