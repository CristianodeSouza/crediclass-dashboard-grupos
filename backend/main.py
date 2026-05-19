import os
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sheets import fetch_grupos, atualizar_grupo_sheets, criar_grupo, deletar_grupo, duplicar_grupo, obter_auditoria_grupo, obter_auditoria_grupo_detalhada
from piperun import fetch_oportunidade
from pydantic import BaseModel
from typing import Optional, Any

load_dotenv()

app = FastAPI(title="Crediclass Dashboard Grupos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")


class GrupoUpdate(BaseModel):
    adm: Optional[str] = None
    grupo: Optional[str] = None
    tipo_bem: Optional[str] = None
    maior_credito: Optional[float] = None
    menor_credito: Optional[float] = None
    taxa_adm: Optional[float] = None
    fundo_rsv: Optional[float] = None
    investidor: Optional[float] = None
    conservador_24m: Optional[float] = None
    moderado_12m: Optional[float] = None
    status: Optional[str] = None
    dados_adicionais: Optional[dict] = None


class GrupoCreate(BaseModel):
    adm: str
    grupo: Optional[str] = None
    tipo_bem: str
    maior_credito: float
    menor_credito: float
    taxa_adm: float
    fundo_rsv: float
    investidor: float
    conservador_24m: float
    moderado_12m: float
    dados_adicionais: Optional[dict] = None
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


@app.get("/")
def index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))


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
        return {"total": 0, "grupos": [], "aviso": "Dados não carregados. Configure as credenciais Google."}

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


@app.get("/api/grupos/{grupo_id}")
def detalhe_grupo(grupo_id: str):
    try:
        grupos = fetch_grupos()
    except Exception:
        raise HTTPException(status_code=503, detail="Dados não disponíveis")
    for g in grupos:
        if str(g["grupo"]) == str(grupo_id):
            return g
    raise HTTPException(status_code=404, detail="Grupo não encontrado")


@app.get("/api/stats")
def estatisticas():
    try:
        grupos = fetch_grupos()
    except Exception:
        return {"total_grupos": 0, "por_administradora": {}, "por_tipo_bem": {},
                "media_lance_geral": 0, "administradoras": [], "tipos_bem": []}

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


# ===== GERENCIADOR DE GRUPOS =====

@app.get("/api/grupos-gerenciador")
def listar_grupos_gerenciador(
    adm: str = Query(None),
    status: str = Query(None),
    credito_min: float = Query(None),
    credito_max: float = Query(None),
    busca: str = Query(None),
    ordenar_por: str = Query("adm"),
    ordem: str = Query("asc"),
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1)
):
    try:
        grupos = fetch_grupos()
    except Exception:
        return {"total": 0, "grupos": [], "pagina": 1, "total_paginas": 0, "aviso": "Dados não carregados"}

    # Filtros
    if adm:
        grupos = [g for g in grupos if g["adm"].upper() == adm.upper()]
    if status:
        grupos = [g for g in grupos if g.get("status", "ativo").lower() == status.lower()]
    else:
        grupos = [g for g in grupos if g.get("status", "ativo") != "deletado"]

    if credito_min is not None:
        grupos = [g for g in grupos if g["maior_credito"] and g["maior_credito"] >= credito_min]
    if credito_max is not None:
        grupos = [g for g in grupos if g["maior_credito"] and g["maior_credito"] <= credito_max]

    if busca:
        b = busca.lower()
        grupos = [
            g for g in grupos
            if b in str(g.get("grupo", "")).lower() or
               b in g["adm"].lower() or
               b in g["tipo_bem"].lower()
        ]

    # Ordenação
    reverse = ordem.lower() == "desc"
    if ordenar_por == "grupo":
        grupos.sort(key=lambda g: g.get("grupo", ""), reverse=reverse)
    elif ordenar_por == "credito":
        grupos.sort(key=lambda g: g["maior_credito"] or 0, reverse=reverse)
    else:
        grupos.sort(key=lambda g: g["adm"], reverse=reverse)

    # Paginação
    total = len(grupos)
    total_paginas = (total + por_pagina - 1) // por_pagina
    inicio = (pagina - 1) * por_pagina
    fim = inicio + por_pagina
    grupos_pag = grupos[inicio:fim]

    return {
        "total": total,
        "grupos": grupos_pag,
        "pagina": pagina,
        "total_paginas": total_paginas,
        "por_pagina": por_pagina
    }


@app.get("/api/administradoras")
def listar_todas_administradoras():
    try:
        grupos = fetch_grupos()
    except Exception:
        return {"administradoras": [], "total": 0}

    # Extrai todas as administradoras únicas do dataset completo
    adms_set = set()
    for g in grupos:
        adm = g.get("adm", "").strip()
        if adm and g.get("status", "ativo") != "deletado":
            adms_set.add(adm)

    adms_list = sorted(list(adms_set))

    return {
        "administradoras": adms_list,
        "total": len(adms_list)
    }


@app.post("/api/grupos")
def criar_novo_grupo(grupo: GrupoCreate, usuario: str = Query("operador")):
    try:
        dados = grupo.dict(exclude_none=True)
        novo_id = criar_grupo(dados, usuario)

        if novo_id:
            return {"message": "Grupo criado com sucesso", "grupo_id": novo_id, "status": "sucesso"}
        else:
            raise HTTPException(status_code=500, detail="Erro ao criar grupo")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar grupo: {str(e)}")


@app.put("/api/grupos/{grupo_id}")
def editar_grupo(grupo_id: str, grupo: GrupoUpdate, usuario: str = Query("operador")):
    try:
        grupos = fetch_grupos()

        # Verifica se grupo existe
        existe = any(str(g.get("grupo")) == str(grupo_id) for g in grupos)
        if not existe:
            raise HTTPException(status_code=404, detail="Grupo não encontrado")

        dados = grupo.dict(exclude_none=True)
        dados["editado_em"] = datetime.now().isoformat() if "datetime" in dir() else ""

        if atualizar_grupo_sheets(grupo_id, dados, usuario):
            return {"message": "Grupo atualizado com sucesso", "status": "sucesso"}
        else:
            raise HTTPException(status_code=500, detail="Erro ao atualizar grupo")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao editar grupo: {str(e)}")


@app.delete("/api/grupos/{grupo_id}")
def apagar_grupo(grupo_id: str, usuario: str = Query("operador"), soft: bool = Query(True)):
    try:
        grupos = fetch_grupos()

        existe = any(str(g.get("grupo")) == str(grupo_id) for g in grupos)
        if not existe:
            raise HTTPException(status_code=404, detail="Grupo não encontrado")

        if deletar_grupo(grupo_id, usuario, soft):
            acao = "desativado" if soft else "deletado"
            return {"message": f"Grupo {acao} com sucesso", "status": "sucesso"}
        else:
            raise HTTPException(status_code=500, detail="Erro ao deletar grupo")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao deletar grupo: {str(e)}")


@app.patch("/api/grupos/{grupo_id}/status")
def mudar_status_grupo(grupo_id: str, novo_status: str = Body(...), usuario: str = Query("operador")):
    try:
        # P2.4 — Status Avançado com validação de transições
        status_validos = ["ativo", "inativo", "encerrado", "arquivado", "em_revisao", "deletado"]
        if novo_status not in status_validos:
            raise HTTPException(status_code=400, detail=f"Status inválido. Valores aceitos: {', '.join(status_validos)}")

        grupos = fetch_grupos()
        grupo_atual = None
        for g in grupos:
            if str(g.get("grupo")) == str(grupo_id):
                grupo_atual = g
                break

        if not grupo_atual:
            raise HTTPException(status_code=404, detail="Grupo não encontrado")

        status_atual = grupo_atual.get("status", "ativo")

        # P2.4 — Validação de transições de status
        transicoes_bloqueadas = {
            "encerrado": ["ativo", "inativo", "em_revisao", "arquivado"],  # encerrado é final
            "deletado": ["ativo", "inativo", "em_revisao", "arquivado", "encerrado"]  # deletado é final
        }

        if status_atual in transicoes_bloqueadas and novo_status in transicoes_bloqueadas[status_atual]:
            raise HTTPException(
                status_code=400,
                detail=f"Transição inválida: Grupo em status '{status_atual}' não pode ir para '{novo_status}'"
            )

        # Registrar alteração de status com auditoria
        dados_alteracao = {"status": novo_status}
        if atualizar_grupo_sheets(grupo_id, dados_alteracao, usuario):
            return {
                "message": f"Status alterado de '{status_atual}' para '{novo_status}'",
                "status": "sucesso",
                "status_anterior": status_atual,
                "novo_status": novo_status
            }
        else:
            raise HTTPException(status_code=500, detail="Erro ao mudar status")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao mudar status: {str(e)}")


@app.post("/api/grupos/{grupo_id}/duplicar")
def duplicar_novo_grupo(grupo_id: str, usuario: str = Query("operador")):
    try:
        grupos = fetch_grupos()
        existe = any(str(g.get("grupo")) == str(grupo_id) for g in grupos)
        if not existe:
            raise HTTPException(status_code=404, detail="Grupo não encontrado")

        novo_id = duplicar_grupo(grupo_id, usuario)
        if novo_id:
            return {"message": "Grupo duplicado com sucesso", "novo_grupo_id": novo_id, "status": "sucesso"}
        else:
            raise HTTPException(status_code=500, detail="Erro ao duplicar grupo")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao duplicar grupo: {str(e)}")


@app.post("/api/sync-sheets")
def sincronizar_com_sheets(usuario: str = Query("operador")):
    try:
        # Força recarregamento do cache que sincroniza com sheets
        grupos = fetch_grupos(force_refresh=True)
        timestamp_sincronizacao = datetime.now().isoformat()
        data_formatada = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

        return {
            "message": "Sincronização concluída com sucesso",
            "total_grupos": len(grupos),
            "timestamp": timestamp_sincronizacao,
            "data_formatada": data_formatada,
            "status": "sucesso"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao sincronizar: {str(e)}")


@app.post("/api/reload-sheets")
def recarregar_de_sheets(usuario: str = Query("operador")):
    try:
        # Força refresh e sincroniza dados
        grupos = fetch_grupos(force_refresh=True)
        timestamp_sincronizacao = datetime.now().isoformat()
        data_formatada = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

        return {
            "message": "Dados recarregados com sucesso",
            "total_grupos": len(grupos),
            "timestamp": timestamp_sincronizacao,
            "data_formatada": data_formatada,
            "status": "sucesso"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao recarregar: {str(e)}")


@app.get("/api/grupos/{grupo_id}/auditoria")
def obter_historico_grupo(grupo_id: str):
    try:
        auditoria = obter_auditoria_grupo_detalhada(grupo_id)
        return {
            "grupo_id": grupo_id,
            "total_alteracoes": len(auditoria),
            "historico": auditoria
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao obter auditoria: {str(e)}")


@app.post("/api/refresh")
def refresh_dados():
    try:
        grupos = fetch_grupos(force_refresh=True)
        return {"message": "Dados atualizados", "total": len(grupos)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
