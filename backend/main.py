from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from googleapiclient.errors import HttpError

from .models import GroupPayload
from .sheets import append_group, delete_group, get_group, list_groups, reload_data, update_group

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(title="Crediclass Dashboard Grupos V2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


def api_error(error: Exception) -> HTTPException:
    if isinstance(error, KeyError):
        return HTTPException(status_code=404, detail=str(error))
    if isinstance(error, HttpError):
        return HTTPException(status_code=502, detail=error.reason)
    return HTTPException(status_code=400, detail=str(error))


@app.get("/")
def index():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/grupos")
def listar_grupos(
    administradora: str | None = Query(None),
    busca: str | None = Query(None),
    include_deleted: bool = Query(False),
) -> dict[str, Any]:
    try:
        grupos = list_groups(include_deleted=include_deleted)
    except Exception as error:
        raise api_error(error)

    if administradora:
        grupos = [g for g in grupos if str(g.get("administradora", "")).lower() == administradora.lower()]
    if busca:
        needle = busca.lower()
        grupos = [
            g for g in grupos
            if needle in str(g.get("grupo_id", "")).lower()
            or needle in str(g.get("grupo", "")).lower()
            or needle in str(g.get("administradora", "")).lower()
        ]

    resumo = []
    for group in grupos:
        resumo.append({
            "grupo_id": group.get("grupo_id"),
            "administradora": group.get("administradora", ""),
            "grupo": group.get("grupo", ""),
            "tipo_bem": group.get("tipo_bem", ""),
            "menor_credito": group.get("menor_credito", ""),
            "maior_credito": group.get("maior_credito", ""),
            "prazo_grupo": group.get("prazo_grupo", ""),
            "prazo_restante": group.get("prazo_restante", ""),
            "prestacao_integral": group.get("prestacao_integral", ""),
            "taxa_administracao": group.get("taxa_administracao", ""),
            "status": group.get("status", ""),
        })

    return {"total": len(resumo), "grupos": resumo}


@app.get("/api/grupos/{grupo_id}")
def obter_grupo(grupo_id: str) -> dict[str, Any]:
    try:
        return get_group(grupo_id)
    except Exception as error:
        raise api_error(error)


@app.post("/api/grupos", status_code=201)
def criar_grupo(payload: GroupPayload) -> dict[str, Any]:
    data = payload.model_dump()
    if not data["dados_gerais"].get("administradora") or not data["dados_gerais"].get("grupo"):
        raise HTTPException(status_code=422, detail="Administradora e Grupo sao obrigatorios")
    try:
        return append_group(data)
    except Exception as error:
        raise api_error(error)


@app.put("/api/grupos/{grupo_id}")
def atualizar_grupo(grupo_id: str, payload: GroupPayload) -> dict[str, Any]:
    try:
        return update_group(grupo_id, payload.model_dump(exclude_unset=True))
    except Exception as error:
        raise api_error(error)


@app.delete("/api/grupos/{grupo_id}")
def excluir_grupo(grupo_id: str, soft: bool = Query(False)) -> dict[str, str]:
    try:
        delete_group(grupo_id, soft=soft)
        return {"status": "success", "message": "Grupo excluido com sucesso"}
    except Exception as error:
        raise api_error(error)


@app.post("/api/reload")
def recarregar_dados() -> dict[str, Any]:
    try:
        result = reload_data()
        return {"status": "success", "message": "Dados recarregados da planilha", **result}
    except Exception as error:
        raise api_error(error)
