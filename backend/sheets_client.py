import json
import logging
import re
import unicodedata
from functools import lru_cache
from typing import Any

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

from .config import get_settings

logger = logging.getLogger("crediclass.sheets")
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


def normalize_header(value: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-zA-Z0-9]+", " ", text).strip().lower()
    return re.sub(r"\s+", " ", text)


FIELD_ALIASES = {
    "administradora": ["administradora"],
    "grupo": ["grupo"],
    "tipo_bem": ["tipo de bem", "tipo bem"],
    "credito_minimo": ["credito minimo", "menor credito", "credito min"],
    "credito_maximo": ["credito maximo", "maior credito", "credito max"],
    "taxa_adm": ["taxa administracao", "taxa adm", "taxa de administracao"],
    "prazo_total": ["prazo total", "prazo do grupo", "prazo grupo"],
    "primeira_assembleia": ["primeira assembleia", "1 assembleia", "1a assembleia"],
    "ultima_assembleia": ["ultima assembleia"],
    "status": ["status"],
}


@lru_cache
def get_service():
    settings = get_settings()
    if not settings.google_sheets_id:
        raise RuntimeError("GOOGLE_SHEETS_ID nao configurado")
    if not settings.google_service_account_json:
        raise RuntimeError("GOOGLE_SERVICE_ACCOUNT_JSON nao configurado")

    credentials_info = json.loads(settings.google_service_account_json)
    credentials = Credentials.from_service_account_info(credentials_info, scopes=SCOPES)
    return build("sheets", "v4", credentials=credentials, cache_discovery=False)


def read_sheet_rows() -> list[dict[str, Any]]:
    settings = get_settings()
    logger.info("Lendo Google Sheets: %s", settings.google_sheet_name)
    result = get_service().spreadsheets().values().get(
        spreadsheetId=settings.google_sheets_id,
        range=f"'{settings.google_sheet_name}'!A:ZZ",
    ).execute()
    values = result.get("values", [])
    if not values:
        return []

    headers = values[0]
    rows = []
    for row in values[1:]:
        row_dict = {}
        for index, header in enumerate(headers):
            row_dict[str(header).strip()] = row[index] if index < len(row) else ""
        if any(str(value).strip() for value in row_dict.values()):
            rows.append(row_dict)
    return rows


def get_field(row: dict[str, Any], field: str) -> Any:
    normalized = {normalize_header(key): value for key, value in row.items()}
    for alias in FIELD_ALIASES[field]:
        value = normalized.get(normalize_header(alias))
        if value not in (None, ""):
            return value
    return ""


def parse_number(value: Any) -> float | None:
    text = str(value or "").strip()
    if not text:
        return None
    text = text.replace("R$", "").replace("%", "").replace(" ", "")
    if "," in text:
        text = text.replace(".", "").replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return None


def parse_int(value: Any) -> int | None:
    number = parse_number(value)
    if number is None:
        return None
    return int(number)


def parse_percent(value: Any) -> float | None:
    number = parse_number(value)
    if number is None:
        return None
    return number / 100 if number > 1 else number


def build_grupo_id(row: dict[str, Any]) -> str:
    administradora = str(get_field(row, "administradora")).strip().upper().replace(" ", "-")
    grupo = str(get_field(row, "grupo")).strip().upper().replace(" ", "-")
    tipo_bem = str(get_field(row, "tipo_bem")).strip().upper().replace(" ", "-")
    return "-".join(part for part in [administradora, grupo, tipo_bem] if part)


def row_to_grupo(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "grupo_id": build_grupo_id(row),
        "administradora": str(get_field(row, "administradora")),
        "grupo": str(get_field(row, "grupo")),
        "tipo_bem": str(get_field(row, "tipo_bem")),
        "credito_minimo": parse_number(get_field(row, "credito_minimo")),
        "credito_maximo": parse_number(get_field(row, "credito_maximo")),
        "taxa_adm": parse_percent(get_field(row, "taxa_adm")),
        "prazo_total": parse_int(get_field(row, "prazo_total")),
        "primeira_assembleia": str(get_field(row, "primeira_assembleia")),
        "ultima_assembleia": str(get_field(row, "ultima_assembleia")),
        "status": str(get_field(row, "status") or "Ativo"),
    }


def list_grupos() -> list[dict[str, Any]]:
    return [row_to_grupo(row) for row in read_sheet_rows()]
