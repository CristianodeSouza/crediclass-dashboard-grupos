import os
import json
import base64
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
SPREADSHEET_ID = "1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM"
SHEET_RANGE = "Tabela de Grupos 3.0!A:EF"

CACHE_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "grupos.json")


def get_service():
    # Option 1: Simple API key (for publicly shared spreadsheets)
    api_key = os.getenv("GOOGLE_API_KEY")
    if api_key:
        return build("sheets", "v4", developerKey=api_key)

    # Option 2: Service account credentials (JSON, optionally base64-encoded)
    creds_json_str = os.getenv("GOOGLE_CREDENTIALS")
    if not creds_json_str:
        raise ValueError(
            "Set GOOGLE_API_KEY (for public sheets) or GOOGLE_CREDENTIALS (service account JSON)"
        )

    try:
        creds_json_str = base64.b64decode(creds_json_str).decode("utf-8")
    except Exception:
        pass

    creds_dict = json.loads(creds_json_str)
    creds = Credentials.from_service_account_info(creds_dict, scopes=SCOPES)
    return build("sheets", "v4", credentials=creds)


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
