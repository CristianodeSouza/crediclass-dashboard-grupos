"""
Módulo de Analytics — Dashboard Analítico de Grupos
Responsável por: KPIs, comparativos ADMs, tendências, distribuição de créditos
"""

from typing import List, Dict, Any
from .sheets import fetch_grupos


def calcular_summary_analytics() -> Dict[str, Any]:
    """
    Calcula métricas resumidas para o dashboard.

    Retorna:
    - total_grupos: qtd total de grupos ativos
    - total_credito: soma de todos os créditos maiores
    - credito_medio: média de crédito por grupo
    - taxa_adm_media: média das taxas de administração
    - grupos_por_adm: dict com qtd de grupos por administradora
    - principais_adms: top 3 administradoras por qtd de grupos
    """
    grupos = fetch_grupos()
    grupos_ativos = [g for g in grupos if g.get("status", "ativo") != "deletado"]

    if not grupos_ativos:
        return {
            "total_grupos": 0,
            "total_credito": 0,
            "credito_medio": 0,
            "taxa_adm_media": 0,
            "grupos_por_adm": {},
            "principais_adms": [],
            "timestamp": ""
        }

    # Cálculos básicos
    total_grupos = len(grupos_ativos)
    total_credito = sum((g.get("maior_credito") or 0) for g in grupos_ativos)
    credito_medio = total_credito / total_grupos if total_grupos > 0 else 0

    # Taxa ADM média
    taxas_validas = [g.get("taxa_adm", 0) for g in grupos_ativos if g.get("taxa_adm") is not None]
    taxa_adm_media = sum(taxas_validas) / len(taxas_validas) if taxas_validas else 0

    # Grupos por ADM
    grupos_por_adm = {}
    for g in grupos_ativos:
        adm = g.get("adm", "N/A")
        grupos_por_adm[adm] = grupos_por_adm.get(adm, 0) + 1

    # Top 3 ADMs
    principais_adms = sorted(
        grupos_por_adm.items(),
        key=lambda x: x[1],
        reverse=True
    )[:3]

    return {
        "total_grupos": total_grupos,
        "total_credito": round(total_credito, 2),
        "credito_medio": round(credito_medio, 2),
        "taxa_adm_media": round(taxa_adm_media, 2),
        "grupos_por_adm": grupos_por_adm,
        "principais_adms": [{"adm": adm, "total": total} for adm, total in principais_adms]
    }


def calcular_comparativo_adms() -> Dict[str, Any]:
    """
    Compara métricas de todas as administradoras.

    Retorna lista com:
    - nome da ADM
    - total de grupos
    - total de crédito
    - crédito médio
    - taxa ADM média
    - vida média dos grupos (em %)
    """
    grupos = fetch_grupos()
    grupos_ativos = [g for g in grupos if g.get("status", "ativo") != "deletado"]

    # Agrupar por ADM
    adms_data = {}
    for g in grupos_ativos:
        adm = g.get("adm", "N/A")
        if adm not in adms_data:
            adms_data[adm] = {
                "total_grupos": 0,
                "total_credito": 0,
                "taxas": [],
                "vidas": []
            }

        adms_data[adm]["total_grupos"] += 1
        adms_data[adm]["total_credito"] += (g.get("maior_credito") or 0)

        taxa = g.get("taxa_adm")
        if taxa is not None:
            adms_data[adm]["taxas"].append(taxa)

        vida = g.get("vida_grupo_pct")
        if vida is not None:
            adms_data[adm]["vidas"].append(vida)

    # Montar resultado
    resultado = []
    for adm, dados in sorted(adms_data.items()):
        credito_medio = dados["total_credito"] / dados["total_grupos"] if dados["total_grupos"] > 0 else 0
        taxa_media = sum(dados["taxas"]) / len(dados["taxas"]) if dados["taxas"] else 0
        vida_media = sum(dados["vidas"]) / len(dados["vidas"]) if dados["vidas"] else 0

        resultado.append({
            "administradora": adm,
            "total_grupos": dados["total_grupos"],
            "total_credito": round(dados["total_credito"], 2),
            "credito_medio": round(credito_medio, 2),
            "taxa_adm_media": round(taxa_media, 2),
            "vida_media_pct": round(vida_media, 2)
        })

    return {
        "comparativo": resultado,
        "total_adms": len(resultado)
    }


def calcular_tendencias_mensais() -> Dict[str, Any]:
    """
    Analisa tendências do histórico mensal (últimos 12 meses).

    Retorna:
    - meses: lista de meses (MES-ANO)
    - maior_lance_media: média dos maiores lances por mês
    - menor_lance_media: média dos menores lances por mês
    - contemplacoes_total: total de contemplações por mês
    - historico: lista com dados de cada mês
    """
    grupos = fetch_grupos()
    grupos_ativos = [g for g in grupos if g.get("status", "ativo") != "deletado"]

    if not grupos_ativos:
        return {
            "meses": [],
            "maior_lance_media": [],
            "menor_lance_media": [],
            "contemplacoes_total": [],
            "historico": []
        }

    # Coletar histórico de todos os grupos
    historico_consolidado = {}

    for g in grupos_ativos:
        historico = g.get("historico", [])
        if not isinstance(historico, list):
            continue

        for entrada in historico:
            if not isinstance(entrada, dict):
                continue

            mes = entrada.get("mes", "").strip()
            if not mes:
                continue

            if mes not in historico_consolidado:
                historico_consolidado[mes] = {
                    "maiores": [],
                    "menores": [],
                    "contemplacoes": 0
                }

            maior = entrada.get("maior")
            if maior is not None and maior != "":
                try:
                    historico_consolidado[mes]["maiores"].append(float(maior))
                except (ValueError, TypeError):
                    pass

            menor = entrada.get("menor")
            if menor is not None and menor != "":
                try:
                    historico_consolidado[mes]["menores"].append(float(menor))
                except (ValueError, TypeError):
                    pass

            qtd = entrada.get("qtd")
            if qtd is not None:
                try:
                    historico_consolidado[mes]["contemplacoes"] += int(qtd) if qtd else 0
                except (ValueError, TypeError):
                    pass

    # Montar resultado ordenado por mês
    meses_ordenados = sorted(historico_consolidado.keys())
    historico_processado = []
    maiores_media = []
    menores_media = []
    contemplacoes_total = []

    for mes in meses_ordenados[-12:]:  # Últimos 12 meses
        dados = historico_consolidado[mes]
        maior_media = sum(dados["maiores"]) / len(dados["maiores"]) if dados["maiores"] else 0
        menor_media = sum(dados["menores"]) / len(dados["menores"]) if dados["menores"] else 0

        historico_processado.append({
            "mes": mes,
            "maior_lance_media": round(maior_media, 2),
            "menor_lance_media": round(menor_media, 2),
            "contemplacoes_total": dados["contemplacoes"]
        })

        maiores_media.append(round(maior_media, 2))
        menores_media.append(round(menor_media, 2))
        contemplacoes_total.append(dados["contemplacoes"])

    return {
        "meses": meses_ordenados[-12:],
        "maior_lance_media": maiores_media,
        "menor_lance_media": menores_media,
        "contemplacoes_total": contemplacoes_total,
        "historico": historico_processado
    }


def calcular_distribuicao_creditos() -> Dict[str, Any]:
    """
    Analisa distribuição de créditos por faixa.

    Retorna:
    - faixas: lista de faixas de crédito
    - contagem: qtd de grupos em cada faixa
    - percentual: percentual de grupos em cada faixa
    - faixas_detalhadas: lista completa com todas informações
    """
    grupos = fetch_grupos()
    grupos_ativos = [g for g in grupos if g.get("status", "ativo") != "deletado"]

    if not grupos_ativos:
        return {
            "faixas": [],
            "contagem": [],
            "percentual": [],
            "faixas_detalhadas": []
        }

    # Definir faixas de crédito (em R$ mil)
    faixas_definicao = [
        {"faixa": "0-50k", "min": 0, "max": 50000},
        {"faixa": "50k-100k", "min": 50000, "max": 100000},
        {"faixa": "100k-200k", "min": 100000, "max": 200000},
        {"faixa": "200k-500k", "min": 200000, "max": 500000},
        {"faixa": "500k+", "min": 500000, "max": float("inf")}
    ]

    # Contar grupos em cada faixa
    total = len(grupos_ativos)
    faixas_dados = []

    for faixa_def in faixas_definicao:
        contagem = sum(
            1 for g in grupos_ativos
            if faixa_def["min"] <= (g.get("maior_credito") or 0) < faixa_def["max"]
        )
        percentual = (contagem / total * 100) if total > 0 else 0

        faixas_dados.append({
            "faixa": faixa_def["faixa"],
            "contagem": contagem,
            "percentual": round(percentual, 2),
            "grupos": contagem
        })

    return {
        "faixas": [f["faixa"] for f in faixas_dados],
        "contagem": [f["contagem"] for f in faixas_dados],
        "percentual": [f["percentual"] for f in faixas_dados],
        "faixas_detalhadas": faixas_dados
    }


def calcular_estatisticas_detalhadas() -> Dict[str, Any]:
    """
    Calcula estatísticas detalhadas de todos os grupos.

    Retorna:
    - credito_minimo: menor crédito entre todos
    - credito_maximo: maior crédito entre todos
    - credito_mediana: valor mediano
    - desvio_padrao: medida de variação
    - taxa_adm_minima: menor taxa
    - taxa_adm_maxima: maior taxa
    - vida_minima: menor % de vida
    - vida_maxima: maior % de vida
    """
    grupos = fetch_grupos()
    grupos_ativos = [g for g in grupos if g.get("status", "ativo") != "deletado"]

    if not grupos_ativos:
        return {
            "credito_minimo": 0,
            "credito_maximo": 0,
            "credito_mediana": 0,
            "taxa_adm_minima": 0,
            "taxa_adm_maxima": 0,
            "vida_minima": 0,
            "vida_maxima": 0,
            "grupos_por_tipo_bem": {}
        }

    # Créditos
    creditos = sorted([(g.get("maior_credito") or 0) for g in grupos_ativos if g.get("maior_credito")])
    credito_minimo = creditos[0] if creditos else 0
    credito_maximo = creditos[-1] if creditos else 0
    credito_mediana = creditos[len(creditos) // 2] if creditos else 0

    # Taxa ADM
    taxas = [g.get("taxa_adm", 0) for g in grupos_ativos if g.get("taxa_adm") is not None]
    taxa_adm_minima = min(taxas) if taxas else 0
    taxa_adm_maxima = max(taxas) if taxas else 0

    # Vida do grupo
    vidas = [g.get("vida_grupo_pct", 0) for g in grupos_ativos if g.get("vida_grupo_pct") is not None]
    vida_minima = min(vidas) if vidas else 0
    vida_maxima = max(vidas) if vidas else 0

    # Grupos por tipo de bem
    tipos_bem = {}
    for g in grupos_ativos:
        tipo = g.get("tipo_bem", "N/A")
        tipos_bem[tipo] = tipos_bem.get(tipo, 0) + 1

    return {
        "credito_minimo": round(credito_minimo, 2),
        "credito_maximo": round(credito_maximo, 2),
        "credito_mediana": round(credito_mediana, 2),
        "taxa_adm_minima": round(taxa_adm_minima, 2),
        "taxa_adm_maxima": round(taxa_adm_maxima, 2),
        "vida_minima": round(vida_minima, 2),
        "vida_maxima": round(vida_maxima, 2),
        "grupos_por_tipo_bem": tipos_bem
    }
