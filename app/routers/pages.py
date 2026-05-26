from fastapi import APIRouter, Request, Query, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path
from ..services.grupos_service import (
    listar_grupos,
    obter_grupo,
    obter_estatisticas,
    criar_grupo,
    editar_grupo,
    deletar_grupo,
)
from ..config import TEMPLATES_DIR, APP_TITLE

router = APIRouter()
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


@router.get("/", response_class=HTMLResponse)
def home_page(request: Request):
    """Serve SPA original (calculadora + mapa de grupos)"""
    from pathlib import Path
    index_path = Path(__file__).parent.parent.parent / "frontend" / "index.html"
    with open(index_path, "r", encoding="utf-8") as f:
        return f.read()


@router.get("/grupos", response_class=HTMLResponse)
def listar_grupos_page(
    request: Request,
    busca: str = Query(None),
    administradora: str = Query(None),
    tipo_bem: str = Query(None),
    limit: int = Query(50),
    offset: int = Query(0),
):
    """Página de listagem de grupos (novo SSR)"""
    total, grupos = listar_grupos(
        administradora=administradora,
        tipo_bem=tipo_bem,
        busca=busca,
        limit=limit,
        offset=offset,
    )

    stats = obter_estatisticas()

    return templates.TemplateResponse(
        "grupos.html",
        {
            "request": request,
            "app_title": APP_TITLE,
            "total": total,
            "grupos": grupos,
            "busca": busca,
            "administradora": administradora,
            "tipo_bem": tipo_bem,
            "administradoras": stats["administradoras"],
            "tipos_bem": stats["tipos_bem"],
        },
    )


@router.get("/grupos/novo", response_class=HTMLResponse)
def novo_grupo_page(request: Request):
    """Página para criar novo grupo"""
    stats = obter_estatisticas()

    return templates.TemplateResponse(
        "grupo_form.html",
        {
            "request": request,
            "app_title": APP_TITLE,
            "modo": "novo",
            "administradoras": stats["administradoras"],
            "tipos_bem": stats["tipos_bem"],
        },
    )


@router.get("/grupos/{grupo_id}/editar", response_class=HTMLResponse)
def editar_grupo_page(request: Request, grupo_id: str):
    """Página para editar um grupo"""
    grupo = obter_grupo(grupo_id)

    if not grupo:
        return templates.TemplateResponse(
            "erro.html",
            {
                "request": request,
                "app_title": APP_TITLE,
                "mensagem": "Grupo não encontrado",
            },
            status_code=404,
        )

    stats = obter_estatisticas()

    return templates.TemplateResponse(
        "grupo_form.html",
        {
            "request": request,
            "app_title": APP_TITLE,
            "modo": "editar",
            "grupo": grupo,
            "administradoras": stats["administradoras"],
            "tipos_bem": stats["tipos_bem"],
        },
    )


@router.get("/grupos/{grupo_id}", response_class=HTMLResponse)
def detalhe_grupo_page(request: Request, grupo_id: str):
    """Página de detalhe de um grupo"""
    grupo = obter_grupo(grupo_id)

    if not grupo:
        return templates.TemplateResponse(
            "erro.html",
            {
                "request": request,
                "app_title": APP_TITLE,
                "mensagem": "Grupo não encontrado",
            },
            status_code=404,
        )

    return templates.TemplateResponse(
        "grupo_detalhe.html",
        {
            "request": request,
            "app_title": APP_TITLE,
            "grupo": grupo,
        },
    )


@router.get("/calculadora", response_class=HTMLResponse)
def calculadora_page(request: Request):
    """Página da calculadora"""
    stats = obter_estatisticas()

    return templates.TemplateResponse(
        "calculadora.html",
        {
            "request": request,
            "app_title": APP_TITLE,
            "administradoras": stats["administradoras"],
        },
    )


@router.get("/gerenciador", response_class=HTMLResponse)
def gerenciador_page(request: Request):
    """Página do gerenciador (CRUD)"""
    return templates.TemplateResponse(
        "gerenciador.html",
        {
            "request": request,
            "app_title": APP_TITLE,
        },
    )


@router.get("/analytics", response_class=HTMLResponse)
def analytics_page(request: Request):
    """Página de analytics"""
    stats = obter_estatisticas()

    return templates.TemplateResponse(
        "analytics.html",
        {
            "request": request,
            "app_title": APP_TITLE,
            "stats": stats,
        },
    )


@router.post("/grupos/novo", response_class=HTMLResponse)
def criar_grupo_post(
    request: Request,
    grupo: str = Form(...),
    adm: str = Form(...),
    tipo_bem: str = Form(...),
    maior_credito: float = Form(default=0),
    menor_credito: float = Form(default=0),
    taxa_adm: float = Form(default=0),
    fundo_rsv: float = Form(default=0),
    investidor: float = Form(default=0),
    conservador_24m: float = Form(default=0),
    moderado_12m: float = Form(default=0),
):
    """Criar novo grupo"""
    novo_grupo = {
        "grupo": grupo,
        "adm": adm,
        "tipo_bem": tipo_bem,
        "maior_credito": maior_credito,
        "menor_credito": menor_credito,
        "taxa_adm": taxa_adm,
        "fundo_rsv": fundo_rsv,
        "investidor": investidor,
        "conservador_24m": conservador_24m,
        "moderado_12m": moderado_12m,
    }

    criar_grupo(novo_grupo)
    return RedirectResponse(url="/", status_code=303)


@router.post("/grupos/{grupo_id}/editar", response_class=HTMLResponse)
def editar_grupo_post(
    request: Request,
    grupo_id: str,
    adm: str = Form(...),
    tipo_bem: str = Form(...),
    maior_credito: float = Form(default=0),
    menor_credito: float = Form(default=0),
    taxa_adm: float = Form(default=0),
    fundo_rsv: float = Form(default=0),
    investidor: float = Form(default=0),
    conservador_24m: float = Form(default=0),
    moderado_12m: float = Form(default=0),
):
    """Editar grupo existente"""
    grupo_atualizado = {
        "grupo": grupo_id,
        "adm": adm,
        "tipo_bem": tipo_bem,
        "maior_credito": maior_credito,
        "menor_credito": menor_credito,
        "taxa_adm": taxa_adm,
        "fundo_rsv": fundo_rsv,
        "investidor": investidor,
        "conservador_24m": conservador_24m,
        "moderado_12m": moderado_12m,
    }

    editar_grupo(grupo_id, grupo_atualizado)
    return RedirectResponse(url="/", status_code=303)


@router.delete("/api/grupos/{grupo_id}", response_class=HTMLResponse)
def deletar_grupo_api(grupo_id: str):
    """Deletar grupo via API (HTMX)"""
    deletar_grupo(grupo_id)
    return ""
