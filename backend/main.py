import os
import json
import sys
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Query, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sheets import fetch_grupos
from piperun import fetch_oportunidade

app = FastAPI(title="Crediclass Dashboard Grupos")

# Robust path resolution for frontend directory
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BACKEND_DIR, "..", "frontend"))

# Diagnostics logging
_DIAGNOSTICS = {
    "backend_dir": BACKEND_DIR,
    "frontend_dir": FRONTEND_DIR,
    "frontend_exists": os.path.exists(FRONTEND_DIR),
    "cwd": os.getcwd(),
    "script_file": __file__,
}

print(f"[STARTUP] Backend dir: {BACKEND_DIR}")
print(f"[STARTUP] Frontend dir: {FRONTEND_DIR}")
print(f"[STARTUP] Frontend exists: {_DIAGNOSTICS['frontend_exists']}")
print(f"[STARTUP] Current working dir: {os.getcwd()}")

if not os.path.exists(FRONTEND_DIR):
    print(f"[ERROR] Frontend directory not found: {FRONTEND_DIR}")
    print(f"[ERROR] This will cause static files to not be served!")
    sys.exit(1)

GRUPOS_STORAGE = [
    {
        "grupo": "ABC-001",
        "adm": "ITAU",
        "tipo_bem": "Imóvel",
        "categoria": "Apto",
        "maior_credito": 500000,
        "prazo_restante": 60,
        "vida_grupo_pct": 45.5,
        "media_lance": 15000.0
    },
    {
        "grupo": "ABC-002",
        "adm": "CNP",
        "tipo_bem": "Imóvel",
        "categoria": "Casa",
        "maior_credito": 450000,
        "prazo_restante": 48,
        "vida_grupo_pct": 50.0,
        "media_lance": 12000.0
    },
    {
        "grupo": "ABC-003",
        "adm": "CAOA",
        "tipo_bem": "Veículo",
        "categoria": "Carro",
        "maior_credito": 80000,
        "prazo_restante": 24,
        "vida_grupo_pct": 70.0,
        "media_lance": 5000.0
    }
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)

# Mount static files for frontend
print(f"[SETUP] Attempting to mount StaticFiles at / from {FRONTEND_DIR}")
if os.path.exists(FRONTEND_DIR):
    contents = os.listdir(FRONTEND_DIR)
    print(f"[SETUP] Frontend directory contents: {contents}")

    # Verify key files exist
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if not os.path.exists(index_path):
        print(f"[WARNING] index.html not found at {index_path}")
    else:
        print(f"[SETUP] ✓ index.html found")

    js_app_path = os.path.join(FRONTEND_DIR, "js", "app.js")
    if not os.path.exists(js_app_path):
        print(f"[WARNING] js/app.js not found at {js_app_path}")
    else:
        print(f"[SETUP] ✓ js/app.js found")

else:
    print(f"[ERROR] FRONTEND_DIR does not exist: {FRONTEND_DIR}")
    print(f"[ERROR] This is a critical error - static files will not be served!")
    sys.exit(1)


class GrupoUpdate(BaseModel):
    grupo: Optional[str] = None
    adm: Optional[str] = None
    tipo_bem: Optional[str] = None
    categoria: Optional[str] = None
    status: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/debug")
def debug_info():
    """Comprehensive debugging endpoint for diagnosing static file serving issues."""
    frontend_exists = os.path.exists(FRONTEND_DIR)
    frontend_contents = []
    file_checks = {}

    if frontend_exists:
        try:
            frontend_contents = os.listdir(FRONTEND_DIR)
            # Check specific files
            index_path = os.path.join(FRONTEND_DIR, "index.html")
            js_app_path = os.path.join(FRONTEND_DIR, "js", "app.js")
            css_path = os.path.join(FRONTEND_DIR, "css", "style.css")

            file_checks = {
                "index_html": os.path.exists(index_path),
                "js_app": os.path.exists(js_app_path),
                "css_style": os.path.exists(css_path),
            }

            # Check permissions (unix-like systems)
            if os.name == "posix":
                index_stat = os.stat(index_path) if os.path.exists(index_path) else None
                if index_stat:
                    file_checks["index_readable"] = bool(index_stat.st_mode & 0o400)
                    file_checks["index_mode"] = oct(index_stat.st_mode)
        except Exception as e:
            frontend_contents = f"Error listing: {str(e)}"

    return {
        "status": "ok" if frontend_exists else "error",
        "frontend_dir": FRONTEND_DIR,
        "frontend_exists": frontend_exists,
        "frontend_contents": frontend_contents,
        "file_checks": file_checks,
        "working_dir": os.getcwd(),
        "backend_dir": BACKEND_DIR,
        "script_file": __file__,
        "python_version": sys.version,
        "platform": sys.platform,
    }


@app.get("/api/grupos")
def listar_grupos(
    adm: str = Query(None),
    tipo_bem: str = Query(None),
    categoria: str = Query(None),
    prazo_restante_min: int = Query(None),
    prazo_restante_max: int = Query(None),
    vida_min: float = Query(None),
    vida_max: float = Query(None),
    credito_min: float = Query(None),
    busca: str = Query(None),
):
    try:
        grupos = fetch_grupos()
    except Exception:
        grupos = GRUPOS_STORAGE.copy()

    if adm:
        grupos = [g for g in grupos if g["adm"].upper() == adm.upper()]
    if tipo_bem:
        grupos = [g for g in grupos if g["tipo_bem"].lower() == tipo_bem.lower()]
    if categoria:
        grupos = [g for g in grupos if g["categoria"].lower() == categoria.lower()]
    if prazo_restante_min is not None:
        grupos = [g for g in grupos if g["prazo_restante"] and g["prazo_restante"] >= prazo_restante_min]
    if prazo_restante_max is not None:
        grupos = [g for g in grupos if g["prazo_restante"] and g["prazo_restante"] <= prazo_restante_max]
    if vida_min is not None:
        grupos = [g for g in grupos if g["vida_grupo_pct"] and g["vida_grupo_pct"] >= vida_min]
    if vida_max is not None:
        grupos = [g for g in grupos if g["vida_grupo_pct"] and g["vida_grupo_pct"] <= vida_max]
    if credito_min is not None:
        grupos = [g for g in grupos if g["maior_credito"] and g["maior_credito"] >= credito_min]
    if busca:
        b = busca.lower()
        grupos = [
            g for g in grupos
            if b in str(g["grupo"]).lower() or b in g["adm"].lower() or b in g["tipo_bem"].lower()
        ]

    return {"total": len(grupos), "grupos": grupos}


@app.get("/api/grupos-gerenciador")
def listar_grupos_gerenciador(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=500),
):
    try:
        grupos = fetch_grupos()
    except Exception:
        grupos = GRUPOS_STORAGE.copy()

    total = len(grupos)
    inicio = (pagina - 1) * por_pagina
    fim = inicio + por_pagina
    grupos_paginado = grupos[inicio:fim]

    return {
        "total": total,
        "pagina": pagina,
        "por_pagina": por_pagina,
        "total_paginas": (total + por_pagina - 1) // por_pagina,
        "grupos": grupos_paginado
    }


@app.get("/api/grupos/{grupo_id}")
def detalhe_grupo(grupo_id: str):
    try:
        grupos = fetch_grupos()
    except Exception:
        grupos = GRUPOS_STORAGE.copy()
    for g in grupos:
        if str(g["grupo"]) == str(grupo_id):
            return g
    raise HTTPException(status_code=404, detail="Grupo não encontrado")


@app.put("/api/grupos/{grupo_id}")
def atualizar_grupo(grupo_id: str, grupo_update: GrupoUpdate):
    try:
        grupos = fetch_grupos()
    except Exception:
        grupos = GRUPOS_STORAGE.copy()

    for g in grupos:
        if str(g["grupo"]) == str(grupo_id):
            if grupo_update.grupo is not None:
                g["grupo"] = grupo_update.grupo
            if grupo_update.adm is not None:
                g["adm"] = grupo_update.adm
            if grupo_update.tipo_bem is not None:
                g["tipo_bem"] = grupo_update.tipo_bem
            if grupo_update.categoria is not None:
                g["categoria"] = grupo_update.categoria
            if grupo_update.status is not None:
                g["status"] = grupo_update.status
            g["editado_em"] = datetime.now().isoformat()
            return g

    raise HTTPException(status_code=404, detail="Grupo não encontrado")


@app.post("/api/grupos", status_code=status.HTTP_201_CREATED)
def criar_grupo(grupo_data: GrupoUpdate):
    try:
        grupos = fetch_grupos()
    except Exception:
        grupos = GRUPOS_STORAGE

    new_grupo = {
        "grupo": grupo_data.grupo,
        "adm": grupo_data.adm,
        "tipo_bem": grupo_data.tipo_bem,
        "categoria": grupo_data.categoria,
        "status": grupo_data.status or "ativo",
        "criado_em": datetime.now().isoformat(),
    }

    return new_grupo


@app.delete("/api/grupos/{grupo_id}")
def excluir_grupo(grupo_id: str):
    try:
        grupos = fetch_grupos()
    except Exception:
        grupos = GRUPOS_STORAGE

    for i, g in enumerate(grupos):
        if str(g["grupo"]) == str(grupo_id):
            grupos.pop(i)
            return {"message": "Grupo excluído com sucesso", "grupo_id": grupo_id}

    raise HTTPException(status_code=404, detail="Grupo não encontrado")


@app.get("/api/stats")
def estatisticas():
    try:
        grupos = fetch_grupos()
    except Exception:
        grupos = GRUPOS_STORAGE.copy()

    adms, tipos = {}, {}
    for g in grupos:
        adms[g["adm"]] = adms.get(g["adm"], 0) + 1
        tipos[g["tipo_bem"]] = tipos.get(g["tipo_bem"], 0) + 1

    medias = [g["media_lance"] for g in grupos if g["media_lance"] is not None]
    media_geral = sum(medias) / len(medias) if medias else 0

    return {
        "total_grupos": len(grupos),
        "por_administradora": adms,
        "por_tipo_bem": tipos,
        "media_lance_geral": round(media_geral, 2),
        "administradoras": sorted(adms.keys()),
        "tipos_bem": sorted(tipos.keys()),
    }


@app.get("/api/piperun/{deal_id}")
async def buscar_oportunidade(deal_id: str):
    try:
        data = await fetch_oportunidade(deal_id)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao buscar oportunidade: {str(e)}")


@app.post("/api/refresh")
def refresh_dados():
    try:
        grupos = fetch_grupos(force_refresh=True)
        return {"message": "Dados atualizados", "total": len(grupos)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ┌─ MOUNT STATIC FILES LAST ─┐
# StaticFiles must be mounted AFTER all API routes,
# otherwise it will intercept all requests
if os.path.exists(FRONTEND_DIR):
    try:
        app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")
        print("[SETUP] ✓ StaticFiles mounted successfully at / (AFTER all API routes)")
    except Exception as e:
        print(f"[ERROR] Failed to mount StaticFiles: {e}")
        sys.exit(1)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
