# ✅ Deployment Checklist — Versão 0.4.1

**Release Date:** 2026-05-18  
**Status:** 🟢 READY FOR PRODUCTION  
**Version:** v0.4.1

---

## 📋 Pre-Deployment

- [ ] **Verificar Branch**
  ```bash
  git branch
  # Esperado: claude/fix-pagination-validation-qqCUj
  ```

- [ ] **Verificar Commit**
  ```bash
  git log -1 --oneline
  # Esperado: 4170628 Fix: Resolve pagination validation and CRUD operation bugs
  ```

- [ ] **Verificar Status**
  ```bash
  git status
  # Esperado: working tree clean
  ```

- [ ] **Revisar Mudanças**
  ```bash
  git diff main..HEAD
  # Revisar: backend/main.py com 80 insertions, 1 deletion
  ```

- [ ] **Ler Release Notes**
  ```
  ✓ RELEASE_NOTES.md
  ✓ HISTORICO.md
  ✓ FEATURES.md
  ```

---

## 🧪 Testing

### Local Tests
- [ ] **Verificar Python**
  ```bash
  python --version
  # Esperado: Python 3.11+
  ```

- [ ] **Instalar Dependências**
  ```bash
  cd backend
  pip install -r requirements.txt
  ```

- [ ] **Compilar Código**
  ```bash
  python -m py_compile main.py
  # Esperado: Sem erros
  ```

- [ ] **Verificar Importações**
  ```bash
  python -c "import fastapi; import sheets; print('✓ OK')"
  ```

- [ ] **Iniciar Servidor**
  ```bash
  python main.py
  # Esperado: Uvicorn server running on http://127.0.0.1:8000
  ```

### API Tests
- [ ] **Teste GET /api/grupos-gerenciador**
  ```bash
  curl "http://localhost:8000/api/grupos-gerenciador?pagina=1&por_pagina=10"
  # Esperado: {"total": ..., "pagina": 1, "por_pagina": 10, "grupos": [...]}
  ```

- [ ] **Teste GET /api/stats**
  ```bash
  curl "http://localhost:8000/api/stats"
  # Esperado: {"total_grupos": ..., "por_administradora": {...}, ...}
  ```

- [ ] **Teste GET /api/grupos/{id}**
  ```bash
  # Se houver dados: curl "http://localhost:8000/api/grupos/ABC-001"
  # Status: 200 ou 404 (aceito)
  ```

- [ ] **Teste Frontend**
  ```
  Abrir: http://localhost:8000/
  Esperado: Dashboard carregando corretamente
  ```

---

## 📦 Build Validation

- [ ] **Verificar Arquivos Alterados**
  ```bash
  git diff --name-only main..HEAD
  # Esperado: backend/main.py
  ```

- [ ] **Verificar Linha de Alteração**
  ```bash
  git diff main..HEAD | head -50
  # Verificar imports e endpoints novos
  ```

- [ ] **Size Check**
  ```bash
  wc -l backend/main.py
  # Antes: ~129 linhas
  # Depois: ~208 linhas (80 novas)
  ```

---

## 🔐 Security Checks

- [ ] **Verificar Credenciais**
  ```bash
  grep -r "password\|secret\|token" backend/main.py
  # Esperado: Nada (ou apenas no .env)
  ```

- [ ] **Verificar .gitignore**
  ```bash
  cat .gitignore | grep -E "credentials|token|\.env"
  # Esperado: Credenciais listadas
  ```

- [ ] **Verificar CORS**
  ```bash
  grep -A 3 "CORSMiddleware" backend/main.py
  # Verificar: allow_origins está seguro
  ```

---

## 📝 Documentation Checks

- [ ] **RELEASE_NOTES.md**
  - [ ] Todos os 4 bugs listados
  - [ ] Endpoints documentados
  - [ ] Status code corretos

- [ ] **HISTORICO.md**
  - [ ] Seção 2026-05-18 completa
  - [ ] Commit hash correto
  - [ ] Status "PRONTO PARA PRODUÇÃO"

- [ ] **FEATURES.md**
  - [ ] Seção 6️⃣ CRUD completa
  - [ ] Exemplos cURL funcionando
  - [ ] Status table atualizada

- [ ] **ROADMAP.md**
  - [ ] CRUD listado em "Pronto"
  - [ ] Próximas prioridades listadas

- [ ] **README.md**
  - [ ] Instruções iniciais claras
  - [ ] Links para documentação

---

## 🚀 Deployment Steps

### 1. Code Merge
- [ ] **Checkout Main**
  ```bash
  git checkout main
  ```

- [ ] **Pull Latest**
  ```bash
  git pull origin main
  ```

- [ ] **Merge Feature Branch**
  ```bash
  git merge claude/fix-pagination-validation-qqCUj
  ```

- [ ] **Verify Merge**
  ```bash
  git log -1 --oneline
  # Esperado: Commit visível
  ```

### 2. Push to Repository
- [ ] **Push to Main**
  ```bash
  git push origin main
  ```

- [ ] **Verify on GitHub**
  - [ ] Branch `main` atualizada
  - [ ] PR #1 mostrado como merged
  - [ ] Commit 4170628 visível

### 3. Deploy to Production
- [ ] **SSH para Servidor**
  ```bash
  ssh user@production-server.com
  ```

- [ ] **Pull Latest Code**
  ```bash
  cd /var/www/crediclass-dashboard
  git pull origin main
  ```

- [ ] **Install Dependencies**
  ```bash
  pip install -r backend/requirements.txt --upgrade
  ```

- [ ] **Run Migrations (se houver)**
  ```bash
  # N/A para v0.4.1 (dados em memória)
  ```

- [ ] **Restart Services**
  ```bash
  # Opção 1: systemd
  sudo systemctl restart crediclass-api
  
  # Opção 2: Docker
  docker-compose restart api
  
  # Opção 3: Manual
  pkill -f "python main.py"
  nohup python main.py > /var/log/crediclass.log 2>&1 &
  ```

### 4. Verify Production
- [ ] **Health Check**
  ```bash
  curl https://crediclass.com/api/stats
  # Esperado: 200 OK com dados
  ```

- [ ] **API Test**
  ```bash
  curl "https://crediclass.com/api/grupos-gerenciador?pagina=1&por_pagina=10"
  # Esperado: 200 OK com 10 itens
  ```

- [ ] **Frontend Test**
  ```
  Abrir: https://crediclass.com/
  Esperado: Dashboard responsivo, todas features funcionando
  ```

- [ ] **Logs**
  ```bash
  tail -f /var/log/crediclass.log
  # Esperado: Sem erros
  ```

---

## ⚠️ Rollback Plan (Se Necessário)

### Rollback Automático
- [ ] **Revert Commit**
  ```bash
  git revert 4170628
  git push origin main
  ```

- [ ] **Restart Service**
  ```bash
  sudo systemctl restart crediclass-api
  ```

### Manual Rollback
- [ ] **Restore Previous Version**
  ```bash
  git checkout main~1
  git push origin main --force
  # ⚠️ Use com cuidado!
  ```

- [ ] **Communicate Issue**
  - [ ] Notificar stakeholders
  - [ ] Log do erro em issue
  - [ ] Post-mortem

---

## 📞 Monitoring Post-Deployment

- [ ] **Setup Alerts**
  - [ ] CPU usage > 80%
  - [ ] Memory usage > 85%
  - [ ] Error rate > 1%
  - [ ] Response time > 2s

- [ ] **Monitor Metrics**
  - [ ] Daily API calls
  - [ ] Average response time
  - [ ] Error count
  - [ ] User feedback

- [ ] **Weekly Review**
  - [ ] Performance metrics
  - [ ] Bug reports
  - [ ] Feature requests
  - [ ] User feedback

---

## ✅ Sign-Off

| Role | Name | Date | Sign |
|------|------|------|------|
| Developer | Claude AI | 2026-05-18 | ✅ |
| QA | — | — | ⏳ |
| DevOps | — | — | ⏳ |
| Manager | — | — | ⏳ |

---

## 📌 Important Notes

1. **Backup Antes do Deploy**
   - Faça backup de todos os dados sensíveis

2. **Teste em Staging Primeiro**
   - Sempre teste em staging antes de produção

3. **Comunicar Downtime**
   - Se houver downtime, avise usuários antecipadamente

4. **Monitore Logs**
   - Observe os logs por 24 horas após deploy

5. **Tenha Plano B**
   - Mantenha versão anterior disponível para rollback rápido

---

**Status: 🟢 PRONTO PARA DEPLOY**

**Last Updated:** 2026-05-18  
**Next Review:** 2026-05-25
