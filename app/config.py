import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

# Diretórios
BASE_DIR = Path(__file__).parent.parent
TEMPLATES_DIR = Path(__file__).parent / "templates"
STATIC_DIR = BASE_DIR / "frontend"  # frontend/js e frontend/css servidos como /static/js e /static/css
DATA_DIR = BASE_DIR / "data"

# Aplicação
APP_TITLE = "Crediclass Dashboard Grupos"
APP_VERSION = "2.0.0"

# Google Sheets
GOOGLE_SHEETS_ID = os.getenv("GOOGLE_SHEETS_ID", "")
GOOGLE_SERVICE_ACCOUNT = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "")

# Piperun CRM
PIPERUN_API_KEY = os.getenv("PIPERUN_API_KEY", "")
PIPERUN_BASE_URL = "https://api.piperun.com"

# Environment
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
