"""
Execute este script UMA VEZ para configurar as credenciais do Google.

Passos:
1. Acesse: https://console.cloud.google.com/
2. Crie um projeto (ou use um existente)
3. Ative a API: "Google Sheets API"
4. Crie credenciais OAuth 2.0 (Tipo: Aplicativo de desktop)
5. Baixe o JSON e salve como 'credentials.json' nesta pasta
6. Execute: python setup_google.py
"""
import os
import sys

CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), "credentials.json")

if not os.path.exists(CREDENTIALS_FILE):
    print("ERRO: credentials.json não encontrado!")
    print("Siga as instruções no cabeçalho deste arquivo.")
    sys.exit(1)

# Adiciona backend ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from sheets import get_service, fetch_grupos

print("Autenticando com Google...")
service = get_service()
print("Autenticado com sucesso!")

print("\nBaixando dados da planilha...")
grupos = fetch_grupos(force_refresh=True)
print(f"Dados carregados: {len(grupos)} grupos")
print("\nSetup concluído! Execute start.bat para iniciar o dashboard.")
