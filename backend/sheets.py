import os
import json
from datetime import datetime
from dotenv import load_dotenv
from googleapiclient.discovery import build

load_dotenv()

SPREADSHEET_ID = os.getenv("GOOGLE_SHEETS_ID", "1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM")
SHEET_RANGE = "Tabela de Grupos 3.0!A:EF"
API_KEY = os.getenv("GOOGLE_API_KEY", "AIzaSyBTQeZkVls2uwJT0XeNJS0ZrTLZUPWCESM")

CACHE_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "grupos.json")


def get_service():
    return build("sheets", "v4", developerKey=API_KEY)


def parse_percent(value: str) -> float | None:
    if not value:
        return None
    try:
        return float(value.replace("%", "").replace(",", ".").strip())
    except (ValueError, AttributeError):
        return None


def parse_currency(value: str) -> float | None:
    if not value:
        return None
    try:
        return float(value.replace(".", "").replace(",", ".").strip())
    except (ValueError, AttributeError):
        return None


def parse_int(value: str) -> int | None:
    if not value:
        return None
    try:
        return int(str(value).strip())
    except (ValueError, AttributeError):
        return None


def build_history(row: list, headers: list) -> list:
    months = [
        "JAN-24","FEB-24","MAR-24","APR-24","MAY-24","JUN-24",
        "JUL-24","AUG-24","SEP-24","OCT-24","NOV-24","DEC-24",
        "JAN-25","FEB-25","MAR-25","APR-25","MAY-25","JUN-25",
        "JUL-25","AUG-25","SEP-25","OCT-25","NOV-25","DEC-25",
        "JAN-26","FEB-26","MAR-26","APR-26","MAY-26","JUN-26",
        "JUL-26","AUG-26","SEP-26","OCT-26","NOV-26","DEC-26",
    ]
    history = []
    for month in months:
        maior_key = f"{month}\nMaior Lance"
        menor_key = f"{month}\nMenor Lance"
        qtd_key = f"{month}\nQtd"
        try:
            maior_idx = headers.index(maior_key)
            menor_idx = headers.index(menor_key)
            qtd_idx = headers.index(qtd_key)
            maior = parse_percent(row[maior_idx] if maior_idx < len(row) else "")
            menor = parse_percent(row[menor_idx] if menor_idx < len(row) else "")
            qtd = parse_int(row[qtd_idx] if qtd_idx < len(row) else "")
            if maior is not None or menor is not None:
                history.append({"mes": month, "maior": maior, "menor": menor, "qtd": qtd})
        except ValueError:
            continue
    return history


def fetch_grupos(force_refresh: bool = False) -> list[dict]:
    if not force_refresh and os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    try:
        service = get_service()
        result = (
            service.spreadsheets()
            .values()
            .get(spreadsheetId=SPREADSHEET_ID, range=SHEET_RANGE)
            .execute()
        )
        rows = result.get("values", [])
        if not rows:
            return []

        headers = rows[0]
        grupos = []

        for row in rows[1:]:
            if not row or not row[0]:
                continue
            grupo = {
                "adm": row[0] if len(row) > 0 else "",
                "grupo": row[1] if len(row) > 1 else "",
                "tipo_bem": row[2] if len(row) > 2 else "",
                "primeira_assembleia": row[3] if len(row) > 3 else "",
                "prazo_grupo": parse_int(row[4] if len(row) > 4 else ""),
                "prazo_restante": parse_int(row[5] if len(row) > 5 else ""),
                "meses_corridos": parse_int(row[6] if len(row) > 6 else ""),
                "data_termino": row[7] if len(row) > 7 else "",
                "vida_grupo_pct": parse_percent(row[8] if len(row) > 8 else ""),
                "venc": row[10] if len(row) > 10 else "",
                "menor_credito": parse_currency(row[11] if len(row) > 11 else ""),
                "maior_credito": parse_currency(row[12] if len(row) > 12 else ""),
                "taxa_adm": parse_percent(row[13] if len(row) > 13 else ""),
                "taxa_promocao": parse_percent(row[16] if len(row) > 16 else ""),
                "fundo_rsv": parse_percent(row[19] if len(row) > 19 else ""),
                "prestacao_integral": parse_currency(row[20] if len(row) > 20 else ""),
                "meia_reduzida": parse_currency(row[21] if len(row) > 21 else ""),
                "investidor": parse_percent(row[26] if len(row) > 26 else ""),
                "conservador_24m": parse_percent(row[27] if len(row) > 27 else ""),
                "moderado_12m": parse_percent(row[28] if len(row) > 28 else ""),
                "agressivo_6m": parse_percent(row[29] if len(row) > 29 else ""),
                "super_agressivo_3m": parse_percent(row[30] if len(row) > 30 else ""),
                "lance_quitacao": parse_percent(row[31] if len(row) > 31 else ""),
                "media_lance": parse_percent(row[32] if len(row) > 32 else ""),
                "media_contemp": parse_percent(row[33] if len(row) > 33 else ""),
                "categoria": row[37] if len(row) > 37 else "",
                "parcela_inicial": parse_currency(row[38] if len(row) > 38 else ""),
                "historico": build_history(row, headers),
            }
            grupos.append(grupo)

        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(grupos, f, ensure_ascii=False, indent=2)

        return grupos
    except Exception as e:
        print(f"Erro ao carregar dados do Google Sheets: {e}")
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        return []


def registrar_auditoria(usuario: str, acao: str, grupo_id: str, mudancas: dict = None):
    from datetime import datetime

    AUDIT_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "auditoria.json")
    os.makedirs(os.path.dirname(AUDIT_FILE), exist_ok=True)

    auditoria = []
    if os.path.exists(AUDIT_FILE):
        with open(AUDIT_FILE, "r", encoding="utf-8") as f:
            auditoria = json.load(f)

    registro = {
        "timestamp": datetime.now().isoformat(),
        "usuario": usuario,
        "acao": acao,
        "grupo_id": str(grupo_id),
        "mudancas": mudancas or {}
    }
    auditoria.append(registro)

    with open(AUDIT_FILE, "w", encoding="utf-8") as f:
        json.dump(auditoria, f, ensure_ascii=False, indent=2)


def atualizar_grupo_sheets(grupo_id: str, dados: dict, usuario: str = "sistema") -> bool:
    try:
        grupos = fetch_grupos()

        # Encontra índice do grupo
        grupo_idx = None
        for i, g in enumerate(grupos):
            if str(g.get("grupo")) == str(grupo_id):
                grupo_idx = i
                break

        if grupo_idx is None:
            return False

        # Registra alterações para auditoria
        mudancas = {}
        for chave, valor in dados.items():
            if grupos[grupo_idx].get(chave) != valor:
                mudancas[chave] = {"antes": grupos[grupo_idx].get(chave), "depois": valor}

        # Atualiza grupo em cache
        grupos[grupo_idx].update(dados)

        # Salva cache atualizado
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(grupos, f, ensure_ascii=False, indent=2)

        # Registra auditoria
        if mudancas:
            registrar_auditoria(usuario, "EDITAR", grupo_id, mudancas)

        return True
    except Exception as e:
        print(f"Erro ao atualizar grupo: {e}")
        return False


def criar_grupo(dados: dict, usuario: str = "sistema") -> str | None:
    try:
        grupos = fetch_grupos()

        # Gera novo ID baseado no próximo número disponível
        ids = [str(g.get("grupo", "")) for g in grupos]
        novo_id = str(max([int(id) for id in ids if id.isdigit()] + [0]) + 1)

        novo_grupo = {
            "grupo": novo_id,
            "status": "ativo",
            "criado_em": datetime.now().isoformat(),
            "editado_em": datetime.now().isoformat()
        }
        novo_grupo.update(dados)

        grupos.append(novo_grupo)

        # Salva cache
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(grupos, f, ensure_ascii=False, indent=2)

        registrar_auditoria(usuario, "CRIAR", novo_id, dados)

        return novo_id
    except Exception as e:
        print(f"Erro ao criar grupo: {e}")
        return None


def deletar_grupo(grupo_id: str, usuario: str = "sistema", soft: bool = True) -> bool:
    try:
        grupos = fetch_grupos()

        grupo_idx = None
        for i, g in enumerate(grupos):
            if str(g.get("grupo")) == str(grupo_id):
                grupo_idx = i
                break

        if grupo_idx is None:
            return False

        if soft:
            # Soft delete: marca como inativo
            grupos[grupo_idx]["status"] = "inativo"
            grupos[grupo_idx]["deletado_em"] = datetime.now().isoformat()
            registrar_auditoria(usuario, "DESATIVAR", grupo_id)
        else:
            # Hard delete: remove completamente
            grupos.pop(grupo_idx)
            registrar_auditoria(usuario, "DELETAR", grupo_id)

        # Salva cache
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(grupos, f, ensure_ascii=False, indent=2)

        return True
    except Exception as e:
        print(f"Erro ao deletar grupo: {e}")
        return False


def duplicar_grupo(grupo_id: str, usuario: str = "sistema") -> str | None:
    try:
        grupos = fetch_grupos()

        # Encontra grupo original
        grupo_original = None
        for g in grupos:
            if str(g.get("grupo")) == str(grupo_id):
                grupo_original = g.copy()
                break

        if not grupo_original:
            return None

        # Cria cópia sem o ID original
        copia = grupo_original.copy()

        # Gera novo ID
        ids = [str(g.get("grupo", "")) for g in grupos]
        novo_id = str(max([int(id) for id in ids if id.isdigit()] + [0]) + 1)

        copia["grupo"] = novo_id
        copia["status"] = "ativo"
        copia["criado_em"] = datetime.now().isoformat()
        copia["editado_em"] = datetime.now().isoformat()

        grupos.append(copia)

        # Salva cache
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(grupos, f, ensure_ascii=False, indent=2)

        registrar_auditoria(usuario, "DUPLICAR", novo_id, {"origem": str(grupo_id)})

        return novo_id
    except Exception as e:
        print(f"Erro ao duplicar grupo: {e}")
        return None


# Mapa de tradução de nomes de campos
CAMPO_TRADUCAO = {
    "adm": "Administradora",
    "grupo": "ID do Grupo",
    "tipo_bem": "Tipo de Bem",
    "primeira_assembleia": "1ª Assembleia",
    "prazo_grupo": "Prazo Total",
    "prazo_restante": "Prazo Restante",
    "meses_corridos": "Meses Corridos",
    "data_termino": "Data de Término",
    "vida_grupo_pct": "Vida do Grupo (%)",
    "venc": "Vencimento",
    "menor_credito": "Menor Crédito",
    "maior_credito": "Maior Crédito",
    "taxa_adm": "Taxa ADM",
    "taxa_promocao": "Taxa Promoção",
    "fundo_rsv": "Fundo de Reserva",
    "prestacao_integral": "Prestação Integral",
    "meia_reduzida": "Meia Reduzida",
    "investidor": "Investidor",
    "conservador_24m": "Conservador 24M",
    "moderado_12m": "Moderado 12M",
    "agressivo_6m": "Agressivo 6M",
    "super_agressivo_3m": "Super Agressivo 3M",
    "lance_quitacao": "Lance Quitação",
    "media_lance": "Média Lance",
    "media_contemp": "Média Contemplação",
    "categoria": "Categoria",
    "parcela_inicial": "Parcela Inicial",
    "status": "Status",
    "historico": "Histórico Mensal",
    "criado_em": "Criado em",
    "editado_em": "Editado em",
    "deletado_em": "Deletado em",
}

ACAO_TRADUCAO = {
    "CRIAR": "Criado",
    "EDITAR": "Editado",
    "DESATIVAR": "Desativado",
    "DELETAR": "Deletado",
    "DUPLICAR": "Duplicado",
}


def formatar_valor(valor):
    """Formata valor para exibição"""
    if valor is None:
        return "—"
    if isinstance(valor, (int, float)):
        if isinstance(valor, float) and 0 <= valor <= 100:
            return f"{valor:.1f}%"
        if isinstance(valor, float) and valor > 100:
            return f"R$ {valor:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")
        return str(valor)
    return str(valor)


def obter_auditoria_grupo(grupo_id: str) -> list:
    AUDIT_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "auditoria.json")

    if not os.path.exists(AUDIT_FILE):
        return []

    with open(AUDIT_FILE, "r", encoding="utf-8") as f:
        auditoria = json.load(f)

    return [a for a in auditoria if str(a.get("grupo_id")) == str(grupo_id)]


def obter_auditoria_grupo_detalhada(grupo_id: str) -> list:
    """Retorna auditoria com nomes de campos traduzidos e valores formatados"""
    auditoria_bruta = obter_auditoria_grupo(grupo_id)
    auditoria_detalhada = []

    for registro in auditoria_bruta:
        timestamp = registro.get("timestamp", "")
        # Formata timestamp para exibição pt-BR
        try:
            dt = datetime.fromisoformat(timestamp)
            data_formatada = dt.strftime("%d/%m/%Y %H:%M:%S")
        except:
            data_formatada = timestamp

        acao = registro.get("acao", "")
        acao_traduzida = ACAO_TRADUCAO.get(acao, acao)

        mudancas = registro.get("mudancas", {})
        mudancas_detalhadas = []

        for campo, mudanca in mudancas.items():
            if isinstance(mudanca, dict):
                campo_traduzido = CAMPO_TRADUCAO.get(campo, campo)
                antes = formatar_valor(mudanca.get("antes"))
                depois = formatar_valor(mudanca.get("depois"))
                mudancas_detalhadas.append({
                    "campo": campo_traduzido,
                    "antes": antes,
                    "depois": depois
                })
            elif campo == "origem":
                mudancas_detalhadas.append({
                    "campo": "Originário do Grupo",
                    "antes": "—",
                    "depois": mudanca
                })

        auditoria_detalhada.append({
            "timestamp": timestamp,
            "data_formatada": data_formatada,
            "usuario": registro.get("usuario", "sistema"),
            "acao": acao,
            "acao_traduzida": acao_traduzida,
            "grupo_id": registro.get("grupo_id"),
            "mudancas": mudancas_detalhadas
        })

    # Ordena por timestamp descendente (mais recente primeiro)
    auditoria_detalhada.sort(key=lambda x: x["timestamp"], reverse=True)

    return auditoria_detalhada
