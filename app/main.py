import os
import asyncio
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from .config import STATIC_DIR, APP_TITLE
from .routers import pages
from .api_legacy import router as legacy_router

load_dotenv()

app = FastAPI(title=APP_TITLE)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas de páginas (renderizadas com Jinja2)
app.include_router(pages.router)

# Rotas de API legacy (original SPA backend)
app.include_router(legacy_router)

# Servir arquivos estáticos
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# BACKGROUND JOB: Sincronização com Google Sheets
async def background_sync_worker():
    """Background job para sincronizar com Google Sheets"""
    while True:
        try:
            await asyncio.sleep(15)
            # TODO: Implementar sincronização real com Google Sheets
            # resultado = await processar_fila_sincronizacao()
        except Exception as e:
            print(f"[SYNC] Erro: {e}")
            await asyncio.sleep(15)


@app.on_event("startup")
async def startup_event():
    """Inicializa aplicação"""
    print("[STARTUP] Iniciando Crediclass Dashboard...")
    asyncio.create_task(background_sync_worker())
