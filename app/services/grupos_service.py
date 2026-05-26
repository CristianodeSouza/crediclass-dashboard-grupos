from typing import List, Dict, Optional, Tuple
from datetime import datetime
from .cache_service import carregar_grupos_cache, salvar_grupo_cache, deletar_grupo_cache


def listar_grupos(
    administradora: Optional[str] = None,
    tipo_bem: Optional[str] = None,
    busca: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> Tuple[int, List[Dict]]:
    """Listar grupos com filtros e paginação"""
    grupos = carregar_grupos_cache()

    # Aplicar filtros
    if administradora:
        grupos = [g for g in grupos if g.get("adm", "").upper() == administradora.upper()]

    if tipo_bem:
        grupos = [g for g in grupos if g.get("tipo_bem", "").upper() == tipo_bem.upper()]

    if busca:
        b = busca.lower()
        grupos = [
            g for g in grupos
            if b in str(g.get("grupo", "")).lower()
            or b in g.get("adm", "").lower()
            or b in g.get("tipo_bem", "").lower()
        ]

    total = len(grupos)

    # Aplicar paginação
    grupos_paginados = grupos[offset : offset + limit]

    return total, grupos_paginados


def obter_grupo(grupo_id: str) -> Optional[Dict]:
    """Obter detalhes de um grupo específico"""
    grupos = carregar_grupos_cache()
    for g in grupos:
        if str(g.get("grupo", "")) == str(grupo_id):
            return g
    return None


def criar_grupo(dados: Dict) -> Dict:
    """Criar novo grupo"""
    grupo = {
        "grupo": dados.get("grupo"),
        "adm": dados.get("adm"),
        "tipo_bem": dados.get("tipo_bem"),
        "maior_credito": dados.get("maior_credito"),
        "menor_credito": dados.get("menor_credito"),
        "taxa_adm": dados.get("taxa_adm"),
        "fundo_rsv": dados.get("fundo_rsv"),
        "investidor": dados.get("investidor"),
        "conservador_24m": dados.get("conservador_24m"),
        "moderado_12m": dados.get("moderado_12m"),
        "status": dados.get("status", "ativo"),
        "criado_em": datetime.now().isoformat(),
    }
    salvar_grupo_cache(grupo)
    return grupo


def editar_grupo(grupo_id: str, dados: Dict) -> Optional[Dict]:
    """Editar um grupo existente"""
    grupo = obter_grupo(grupo_id)
    if not grupo:
        return None

    # Atualizar campos
    for chave, valor in dados.items():
        if valor is not None:
            grupo[chave] = valor

    grupo["editado_em"] = datetime.now().isoformat()
    salvar_grupo_cache(grupo)
    return grupo


def deletar_grupo(grupo_id: str) -> bool:
    """Deletar um grupo"""
    grupo = obter_grupo(grupo_id)
    if not grupo:
        return False

    deletar_grupo_cache(grupo_id)
    return True


def obter_estatisticas() -> Dict:
    """Obter estatísticas dos grupos"""
    grupos = carregar_grupos_cache()

    adms = {}
    tipos_bem = {}

    for g in grupos:
        adm = g.get("adm", "N/A")
        tipo = g.get("tipo_bem", "N/A")

        adms[adm] = adms.get(adm, 0) + 1
        tipos_bem[tipo] = tipos_bem.get(tipo, 0) + 1

    adms_ordenado = sorted(adms.items(), key=lambda x: x[1], reverse=True)
    tipos_ordenado = sorted(tipos_bem.items(), key=lambda x: x[1], reverse=True)

    return {
        "total_grupos": len(grupos),
        "por_administradora": adms,
        "por_tipo_bem": tipos_bem,
        "por_administradora_ordenado": adms_ordenado,
        "por_tipo_bem_ordenado": tipos_ordenado,
        "administradoras": sorted(adms.keys()),
        "tipos_bem": sorted(tipos_bem.keys()),
    }
