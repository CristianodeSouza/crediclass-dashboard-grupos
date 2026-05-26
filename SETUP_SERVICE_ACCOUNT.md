# 🔐 Configurar Service Account para Sincronização com Google Sheets

## ❌ Problema Identificado

O "Gerenciador" não estava atualizando dados na planilha do Google Sheets porque:

- **API Key pública** (atual) = apenas **LEITURA** ✅
- **Sincronização (escrita)** = requer **Service Account OAuth2** ❌

## ✅ Solução: Setup Service Account

### Passo 1: Criar Service Account no Google Cloud

1. Abrir: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Selecionar projeto (ou criar novo)
3. Clicar "Criar Service Account"
4. Nome: `crediclass-sheets`
5. Descrição: "Service Account para sincronização de dados Crediclass"
6. Clicar "Criar e Continuar"
7. Conceder papel: "Editor" ou "Google Sheets Editor"
8. Prosseguir até "Chaves"

### Passo 2: Gerar Chave JSON

1. Na aba "Chaves", clicar "Adicionar Chave"
2. Tipo: "JSON"
3. Download automático: `[seu-projeto]-[hash].json`

### Passo 3: Copiar Arquivo

```bash
# Copiar o arquivo JSON baixado para:
C:\Users\User\crediclass-dashboard-grupos\backend\service-account-key.json
```

### Passo 4: Compartilhar Planilha com Service Account

O arquivo JSON contém um email como: `crediclass-sheets@seu-projeto.iam.gserviceaccount.com`

1. Abrir Google Sheets: 
   https://docs.google.com/spreadsheets/d/1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM/
2. Clicar "Compartilhar" (canto superior direito)
3. Colar o email do Service Account
4. Permissão: "Editor"
5. Clicar "Compartilhar"

### Passo 5: Testar

```bash
# Rodar o teste novamente
cd C:\Users\User\crediclass-dashboard-grupos
python test_sync_sheets.py
```

Se vir:
```
OK: Update bem-sucedido!
OK: Valor atualizado corretamente em cache
```

E **não houver** o erro de `CREDENTIALS_MISSING`, então está funcionando!

---

## ✨ Resultado Esperado

Após configurar:

1. **Usuário edita grupo no "Gerenciador"**
2. **Clica "Salvar"**
3. ✅ Atualiza em tempo real no Google Sheets
4. ✅ Atualiza cache local
5. ✅ Registra auditoria

---

## 🛠️ Troubleshooting

### "Erro: Service Account file not found"

- Verificar se arquivo está em: `C:\Users\User\crediclass-dashboard-grupos\backend\service-account-key.json`
- Nomes de arquivo devem corresponder exatamente

### "Erro: Spreadsheet not found"

- Verificar se o Service Account tem permissão de "Editor" na planilha
- Ir em Google Sheets > Compartilhar > verificar permissões

### "Erro: API keys invalid"

- Usar arquivo JSON correto (não confundir com API Key pública)

---

## 📚 Referência

- **Google Cloud Console**: https://console.cloud.google.com
- **Service Accounts**: https://cloud.google.com/iam/docs/service-accounts
- **Google Sheets API**: https://developers.google.com/sheets/api

---

## ⚡ Quick Test

```bash
# Após copiar o arquivo service-account-key.json
cd C:\Users\User\crediclass-dashboard-grupos

# Teste simples
python -c "
from backend.sheets import get_service_account_credentials
creds = get_service_account_credentials()
if creds:
    print('OK: Service Account carregado com sucesso')
else:
    print('ERRO: Nao conseguiu carregar Service Account')
"
```
