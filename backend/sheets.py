import re
import unicodedata
from functools import lru_cache
from typing import Any

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from .config import get_settings

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
MONTHS_BY_YEAR = {
    "2024": ["JAN-24", "FEB-24", "MAR-24", "APR-24", "MAY-24", "JUN-24", "JUL-24", "AUG-24", "SEP-24", "OCT-24", "NOV-24", "DEC-24"],
    "2025": ["JAN-25", "FEB-25", "MAR-25", "APR-25", "MAY-25", "JUN-25", "JUL-25", "AUG-25", "SEP-25", "OCT-25", "NOV-25", "DEC-25"],
    "2026": ["JAN-26", "FEB-26", "MAR-26", "APR-26", "MAY-26", "JUN-26", "JUL-26", "AUG-26", "SEP-26", "OCT-26", "NOV-26", "DEC-26"],
}

FIELD_ALIASES = {
    "administradora": ["administradora", "adm"],
    "grupo": ["grupo", "grupo id", "id grupo", "numero grupo"],
    "tipo_bem": ["tipo de bem", "tipo bem"],
    "primeira_assembleia": ["primeira assembleia", "1 assembleia", "1a assembleia"],
    "data_termino": ["data de termino", "termino", "data termino"],
    "prazo_grupo": ["prazo grupo", "prazo total"],
    "prazo_restante": ["prazo restante"],
    "menor_credito": ["menor credito"],
    "maior_credito": ["maior credito"],
    "taxa_administracao": ["taxa administracao", "taxa adm"],
    "fundo_reserva": ["fundo reserva", "fundo rsv"],
    "prestacao_integral": ["prestacao integral"],
    "categoria": ["categoria"],
    "status": ["status"],
}


def sheet_range(cell_range: str) -> str:
    sheet_name = get_settings().google_sheet_name.replace("'", "''")
    return f"'{sheet_name}'!{cell_range}"


def normalize(value: Any) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-zA-Z0-9]+", " ", text).strip().lower()
    return re.sub(r"\s+", " ", text)


def col_to_a1(index: int) -> str:
    letters = ""
    index += 1
    while index:
        index, rem = divmod(index - 1, 26)
        letters = chr(65 + rem) + letters
    return letters


@lru_cache
def get_service(write: bool = False):
    settings = get_settings()
    if not settings.google_sheets_id:
        raise RuntimeError("GOOGLE_SHEETS_ID nao configurado")

    service_account_info = settings.service_account_info
    if service_account_info:
        credentials = Credentials.from_service_account_info(service_account_info, scopes=SCOPES)
        return build("sheets", "v4", credentials=credentials, cache_discovery=False)

    if write:
        raise RuntimeError("GOOGLE_SERVICE_ACCOUNT_JSON e obrigatorio para criar, atualizar ou excluir grupos")

    if settings.google_api_key:
        return build("sheets", "v4", developerKey=settings.google_api_key, cache_discovery=False)

    raise RuntimeError("Configure GOOGLE_SERVICE_ACCOUNT_JSON ou GOOGLE_API_KEY")


def read_all_rows() -> list[list[str]]:
    result = get_service().spreadsheets().values().get(
        spreadsheetId=get_settings().google_sheets_id,
        range=sheet_range("A:ZZ"),
    ).execute()
    return result.get("values", [])


def get_headers() -> list[str]:
    rows = read_all_rows()
    if not rows:
        return []
    return rows[0]


def header_index(headers: list[str]) -> dict[str, int]:
    normalized_headers = {normalize(header): idx for idx, header in enumerate(headers)}
    mapping: dict[str, int] = {}

    for field, aliases in FIELD_ALIASES.items():
        for alias in aliases:
            alias_norm = normalize(alias)
            if alias_norm in normalized_headers:
                mapping[field] = normalized_headers[alias_norm]
                break
        if field not in mapping:
            for idx, header in enumerate(headers):
                header_norm = normalize(header)
                if any(normalize(alias) in header_norm for alias in aliases):
                    mapping[field] = idx
                    break

    return mapping


def find_history_columns(headers: list[str]) -> dict[tuple[str, str], int]:
    columns: dict[tuple[str, str], int] = {}
    for idx, header in enumerate(headers):
        header_norm = normalize(header)
        for months in MONTHS_BY_YEAR.values():
            for month in months:
                month_norm = normalize(month)
                if month_norm not in header_norm:
                    continue
                if "maior lance" in header_norm:
                    columns[(month, "maior_lance")] = idx
                elif "menor lance" in header_norm:
                    columns[(month, "menor_lance")] = idx
                elif "qtd" in header_norm or "contemplac" in header_norm:
                    columns[(month, "qtd_contemplacoes")] = idx
    return columns


def value_at(row: list[str], index: int | None) -> str:
    if index is None or index >= len(row):
        return ""
    return row[index]


def make_group_id(group: dict[str, Any]) -> str:
    raw_id = str(group.get("grupo_id") or "").strip()
    if raw_id:
        return raw_id

    administradora = str(group.get("administradora") or "").strip()
    grupo = str(group.get("grupo") or "").strip()
    return f"{administradora}-{grupo}".strip("-") or grupo


def row_to_group(row: list[str], headers: list[str]) -> dict[str, Any]:
    fields = header_index(headers)
    history_cols = find_history_columns(headers)
    group = {field: value_at(row, idx) for field, idx in fields.items()}
    group["grupo_id"] = make_group_id(group)
    group["historico"] = {}

    for year, months in MONTHS_BY_YEAR.items():
        group["historico"][year] = []
        for month in months:
            group["historico"][year].append({
                "mes": month,
                "maior_lance": value_at(row, history_cols.get((month, "maior_lance"))),
                "menor_lance": value_at(row, history_cols.get((month, "menor_lance"))),
                "qtd_contemplacoes": value_at(row, history_cols.get((month, "qtd_contemplacoes"))),
            })

    return group


def active_group(group: dict[str, Any]) -> bool:
    return normalize(group.get("status")) not in {"excluido", "deletado", "deleted"}


def list_groups(include_deleted: bool = False) -> list[dict[str, Any]]:
    rows = read_all_rows()
    if not rows:
        return []
    headers = rows[0]
    groups = [row_to_group(row, headers) for row in rows[1:] if any(str(cell).strip() for cell in row)]
    if include_deleted:
        return groups
    return [group for group in groups if active_group(group)]


def find_group_row(grupo_id: str) -> tuple[int, list[str], list[str]]:
    rows = read_all_rows()
    if not rows:
        raise ValueError("Planilha vazia")

    headers = rows[0]
    wanted = str(grupo_id)
    for zero_idx, row in enumerate(rows[1:], start=1):
        group = row_to_group(row, headers)
        if str(group.get("grupo_id")) == wanted or str(group.get("grupo")) == wanted:
            return zero_idx + 1, headers, row

    raise KeyError(f"Grupo {grupo_id} nao encontrado")


def flatten_history(payload: dict[str, Any]) -> list[dict[str, Any]]:
    history = payload.get("historico") or {}
    if isinstance(history, list):
        return history

    flattened: list[dict[str, Any]] = []
    for items in history.values():
        if isinstance(items, list):
            flattened.extend(items)
    return flattened


def build_updates(headers: list[str], row_number: int, payload: dict[str, Any]) -> list[dict[str, Any]]:
    fields = header_index(headers)
    history_cols = find_history_columns(headers)
    updates: list[dict[str, Any]] = []

    data = payload.get("dados_gerais") or {}
    for field, value in data.items():
        col_idx = fields.get(field)
        if col_idx is None:
            continue
        updates.append({"range": sheet_range(f"{col_to_a1(col_idx)}{row_number}"), "values": [[value if value is not None else ""]]})

    for item in flatten_history(payload):
        month = item.get("mes")
        if not month:
            continue
        for key in ("maior_lance", "menor_lance", "qtd_contemplacoes"):
            if key not in item:
                continue
            col_idx = history_cols.get((month, key))
            if col_idx is None:
                continue
            updates.append({"range": sheet_range(f"{col_to_a1(col_idx)}{row_number}"), "values": [[item[key] if item[key] is not None else ""]]})

    return updates


def update_group(grupo_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    row_number, headers, _row = find_group_row(grupo_id)
    updates = build_updates(headers, row_number, payload)
    if updates:
        get_service(write=True).spreadsheets().values().batchUpdate(
            spreadsheetId=get_settings().google_sheets_id,
            body={"valueInputOption": "USER_ENTERED", "data": updates},
        ).execute()
    rows = read_all_rows()
    return row_to_group(rows[row_number - 1], rows[0]) if len(rows) >= row_number else get_group(grupo_id)


def append_group(payload: dict[str, Any]) -> dict[str, Any]:
    rows = read_all_rows()
    if not rows:
        raise ValueError("A planilha precisa ter cabecalhos na primeira linha")

    headers = rows[0]
    fields = header_index(headers)
    history_cols = find_history_columns(headers)
    new_row = [""] * len(headers)

    for field, value in (payload.get("dados_gerais") or {}).items():
        col_idx = fields.get(field)
        if col_idx is not None:
            new_row[col_idx] = value if value is not None else ""

    for item in flatten_history(payload):
        month = item.get("mes")
        for key in ("maior_lance", "menor_lance", "qtd_contemplacoes"):
            if month and key in item:
                col_idx = history_cols.get((month, key))
                if col_idx is not None:
                    new_row[col_idx] = item[key] if item[key] is not None else ""

    get_service(write=True).spreadsheets().values().append(
        spreadsheetId=get_settings().google_sheets_id,
        range=sheet_range("A:ZZ"),
        valueInputOption="USER_ENTERED",
        insertDataOption="INSERT_ROWS",
        body={"values": [new_row]},
    ).execute()

    grupo_id = make_group_id(row_to_group(new_row, headers))
    return get_group(grupo_id)


def delete_group(grupo_id: str, soft: bool = False) -> None:
    row_number, headers, _row = find_group_row(grupo_id)
    if soft:
        status_idx = header_index(headers).get("status")
        if status_idx is None:
            raise ValueError("Coluna Status nao encontrada para exclusao logica")
        get_service(write=True).spreadsheets().values().update(
            spreadsheetId=get_settings().google_sheets_id,
            range=sheet_range(f"{col_to_a1(status_idx)}{row_number}"),
            valueInputOption="USER_ENTERED",
            body={"values": [["Excluido"]]},
        ).execute()
        return

    service = get_service(write=True)
    metadata = service.spreadsheets().get(spreadsheetId=get_settings().google_sheets_id).execute()
    sheet_id = None
    for sheet in metadata.get("sheets", []):
        if sheet["properties"]["title"] == get_settings().google_sheet_name:
            sheet_id = sheet["properties"]["sheetId"]
            break
    if sheet_id is None:
        raise ValueError("Aba da planilha nao encontrada")

    service.spreadsheets().batchUpdate(
        spreadsheetId=get_settings().google_sheets_id,
        body={"requests": [{"deleteDimension": {"range": {"sheetId": sheet_id, "dimension": "ROWS", "startIndex": row_number - 1, "endIndex": row_number}}}]},
    ).execute()


def get_group(grupo_id: str) -> dict[str, Any]:
    row_number, headers, row = find_group_row(grupo_id)
    group = row_to_group(row, headers)
    group["linha_planilha"] = row_number
    return group


def reload_data() -> dict[str, Any]:
    try:
        groups = list_groups()
        return {"status": "success", "total": len(groups)}
    except HttpError:
        raise
