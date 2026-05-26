import json
import os
from pathlib import Path
from typing import List, Dict, Optional

CACHE_DIR = Path(__file__).parent.parent.parent / "data"
CACHE_FILE = CACHE_DIR / "grupos.json"


def carregar_grupos_cache() -> List[Dict]:
    """Carregar grupos do cache local (data/grupos.json)"""
    if not CACHE_FILE.exists():
        return []

    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            dados = json.load(f)
            if isinstance(dados, dict):
                return list(dados.values())
            return dados if isinstance(dados, list) else []
    except Exception as e:
        print(f"[CACHE] Erro ao carregar: {e}")
        return []


def salvar_grupo_cache(grupo: Dict) -> None:
    """Salvar ou atualizar um grupo no cache"""
    grupos = carregar_grupos_cache()

    # Converter para dicionário se for lista
    grupos_dict = {}
    for g in grupos:
        grupos_dict[str(g.get("grupo", ""))] = g

    # Atualizar grupo
    grupos_dict[str(grupo.get("grupo", ""))] = grupo

    # Salvar
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(grupos_dict, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[CACHE] Erro ao salvar: {e}")


def deletar_grupo_cache(grupo_id: str) -> None:
    """Deletar um grupo do cache"""
    grupos = carregar_grupos_cache()
    grupos_filtrados = [g for g in grupos if str(g.get("grupo", "")) != str(grupo_id)]

    # Converter para dicionário
    grupos_dict = {}
    for g in grupos_filtrados:
        grupos_dict[str(g.get("grupo", ""))] = g

    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(grupos_dict, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[CACHE] Erro ao deletar: {e}")
