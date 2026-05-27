import os
import json
from datetime import datetime
from dotenv import load_dotenv
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
from typing import Dict, Any, List, Optional

load_dotenv()

SPREADSHEET_ID = os.getenv("GOOGLE_SHEETS_ID", "1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM")
SHEET_RANGE = "Tabela de Grupos 3.0!A:EF"
API_KEY = os.getenv("GOOGLE_API_KEY", "AIzaSyBTQeZkVls2uwJT0XeNJS0ZrTLZUPWCESM")

CACHE_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "grupos.json")
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(__file__), "service-account-key.json")

# Cache para o service (para não recriar toda vez)
_service_cache = None


def get_service_account_credentials():
    """Carrega credenciais de Service Account de arquivo ou variável de ambiente"""
    try:
        # Tenta primeiro a variável de ambiente (prioridade para Render/produção)
        sa_b64 = os.getenv("GOOGLE_SERVICE_ACCOUNT_B64")
        if sa_b64:
            import base64
            import json
            try:
                print(f"[DEBUG] Tentando decodificar GOOGLE_SERVICE_ACCOUNT_B64 (length: {len(sa_b64)})")
                sa_json = base64.b64decode(sa_b64).decode('utf-8')
                sa_dict = json.loads(sa_json)
                credentials = Credentials.from_service_account_info(
                    sa_dict,
                    scopes=["https://www.googleapis.com/auth/spreadsheets"]
                )
                print("[STARTUP] [OK] Service Account carregado de GOOGLE_SERVICE_ACCOUNT_B64")
                return credentials
            except Exception as e:
                print(f"[AVISO] Erro ao decodificar GOOGLE_SERVICE_ACCOUNT_B64: {e}")
                import traceback
                traceback.print_exc()

        # Fallback: carrega do arquivo local (desenvolvimento)
        if os.path.exists(SERVICE_ACCOUNT_FILE):
            print(f"[DEBUG] Carregando Service Account de arquivo: {SERVICE_ACCOUNT_FILE}")
            credentials = Credentials.from_service_account_file(
                SERVICE_ACCOUNT_FILE,
                scopes=["https://www.googleapis.com/auth/spreadsheets"]
            )
            print("[STARTUP] [OK] Service Account carregado de arquivo local")
            return credentials
        else:
            print(f"[DEBUG] Arquivo local NÃO encontrado: {SERVICE_ACCOUNT_FILE}")
    except Exception as e:
        print(f"[ERRO] Nao conseguiu carregar Service Account: {e}")
        import traceback
        traceback.print_exc()

    print("[ERRO CRÍTICO] Service Account NÃO carregado! Sincronização com Google Sheets será impossível.")
    return None


def get_service(use_write_permissions: bool = False):
    """Retorna serviço Google Sheets com permissões apropriadas"""
    global _service_cache

    if use_write_permissions:
        # Tenta usar Service Account para escrita
        credentials = get_service_account_credentials()
        if credentials:
            try:
                service = build("sheets", "v4", credentials=credentials)
                print("[OK] Service com write permissions criado")
                return service
            except Exception as e:
                print(f"[ERRO CRÍTICO] Falha ao criar service com write permissions: {e}")
                import traceback
                traceback.print_exc()
                return None
        else:
            print("[ERRO CRÍTICO] Service Account nao disponivel. Sincronizacao com Sheets impossível!")
            return None  # ← CRÍTICO: Retornar None, não API_KEY de leitura!

    # Fallback: API Key para leitura (somente leitura)
    try:
        service = build("sheets", "v4", developerKey=API_KEY)
        print("[OK] Service com API Key criado")
        return service
    except Exception as e:
        print(f"[ERRO CRÍTICO] Falha ao criar service com API Key: {e}")
        import traceback
        traceback.print_exc()
        return None


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
                history.append({"mes": month, "maior_lance": maior, "menor_lance": menor, "qtd": qtd})
        except ValueError:
            continue
    return history


def fetch_grupos(force_refresh: bool = False) -> Dict[str, Any]:
    """Fetch groups from Google Sheets API or cache

    Returns dict with structure:
    {
        'grupos': [...],
        'metadata': {
            'source': 'api' | 'cache' | 'cache_fallback',
            'timestamp': ISO timestamp,
            'error': None or error message
        }
    }
    """
    # PROB-004: Try cache first (if not forcing refresh)
    if not force_refresh and os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                grupos = data if isinstance(data, list) else list(data.values()) if isinstance(data, dict) else []
                return {
                    'grupos': grupos,
                    'metadata': {
                        'source': 'cache',
                        'timestamp': datetime.now().isoformat(),
                        'error': None
                    }
                }
        except Exception as e:
            print(f"[AVISO] Erro ao ler cache: {e}")

    try:
        service = get_service()
        if not service:
            # API Key also failed - try cache fallback
            if os.path.exists(CACHE_FILE):
                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    grupos = data if isinstance(data, list) else list(data.values()) if isinstance(data, dict) else []
                    return {
                        'grupos': grupos,
                        'metadata': {
                            'source': 'cache_fallback',
                            'timestamp': datetime.now().isoformat(),
                            'error': 'Google Sheets API indisponível, usando cache antigo'
                        }
                    }
            return {
                'grupos': [],
                'metadata': {
                    'source': 'none',
                    'timestamp': datetime.now().isoformat(),
                    'error': 'Google Sheets API indisponível e cache não encontrado'
                }
            }

        result = (
            service.spreadsheets()
            .values()
            .get(spreadsheetId=SPREADSHEET_ID, range=SHEET_RANGE)
            .execute()
        )
        rows = result.get("values", [])
        if not rows:
            return {
                'grupos': [],
                'metadata': {
                    'source': 'api',
                    'timestamp': datetime.now().isoformat(),
                    'error': 'Planilha vazia'
                }
            }

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

        return {
            'grupos': grupos,
            'metadata': {
                'source': 'api',
                'timestamp': datetime.now().isoformat(),
                'error': None
            }
        }
    except Exception as e:
        print(f"[ERRO] Erro ao carregar dados do Google Sheets: {e}")
        import traceback
        traceback.print_exc()

        # PROB-004: Cache fallback with error info
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    grupos = data if isinstance(data, list) else list(data.values()) if isinstance(data, dict) else []
                    return {
                        'grupos': grupos,
                        'metadata': {
                            'source': 'cache_fallback',
                            'timestamp': datetime.now().isoformat(),
                            'error': f'API error: {str(e)}'
                        }
                    }
            except Exception as cache_err:
                print(f"[ERRO] Erro ao ler cache fallback: {cache_err}")

        return {
            'grupos': [],
            'metadata': {
                'source': 'none',
                'timestamp': datetime.now().isoformat(),
                'error': f'API indisponível e cache não pode ser carregado: {str(e)}'
            }
        }


def criar_aba_auditoria_se_nao_existe():
    """Cria aba 'Auditoria' com headers se não existir"""
    try:
        service = get_service(use_write_permissions=True)

        # Obter lista de abas
        sheet_metadata = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
        sheets = sheet_metadata.get('sheets', [])

        # Verificar se aba Auditoria já existe
        for sheet in sheets:
            if sheet['properties']['title'] == 'Auditoria':
                return  # Já existe

        # Criar aba Auditoria
        batch_update_request = {
            'requests': [
                {
                    'addSheet': {
                        'properties': {
                            'title': 'Auditoria',
                            'gridProperties': {
                                'rowCount': 10000,
                                'columnCount': 8
                            }
                        }
                    }
                }
            ]
        }
        service.spreadsheets().batchUpdate(spreadsheetId=SPREADSHEET_ID, body=batch_update_request).execute()

        # Adicionar headers
        headers = [['Timestamp', 'Usuario', 'Grupo ID', 'Campo', 'Valor Antigo (Backup)', 'Valor Novo', 'Acao', 'Origem']]
        service.spreadsheets().values().update(
            spreadsheetId=SPREADSHEET_ID,
            range='Auditoria!A1:H1',
            valueInputOption='USER_ENTERED',
            body={'values': headers}
        ).execute()

        print("Auditoria: Aba criada com sucesso")

    except Exception as e:
        print(f"Aviso: Nao conseguiu criar aba Auditoria: {e}")


def registrar_auditoria(usuario: str, acao: str, grupo_id: str, mudancas: dict = None, origem: str = "Dashboard"):
    """
    Registra auditoria em Google Sheets aba 'Auditoria'

    Args:
        usuario: nome do usuário (adm/operador)
        acao: tipo de ação (INSERT, UPDATE, DELETE)
        grupo_id: ID do grupo modificado
        mudancas: dict com {'campo': {'antes': x, 'depois': y}}
        origem: onde veio a ação (Dashboard, GoogleSheets, Sync)
    """
    from datetime import datetime

    AUDIT_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "auditoria.json")
    os.makedirs(os.path.dirname(AUDIT_FILE), exist_ok=True)
    auditoria = []
    if os.path.exists(AUDIT_FILE):
        with open(AUDIT_FILE, "r", encoding="utf-8") as f:
            auditoria = json.load(f)

    if mudancas:
        for campo, valores in mudancas.items():
            valor_antes = valores.get("antes", "")
            valor_depois = valores.get("depois", "")

            registro = {
                "timestamp": datetime.now().isoformat(),
                "usuario": usuario,
                "acao": acao,
                "grupo_id": str(grupo_id),
                "origem": origem,
                "campo": campo,
                "valor_antes": str(valor_antes),
                "valor_depois": str(valor_depois)
            }
            auditoria.append(registro)
    else:
        registro = {
            "timestamp": datetime.now().isoformat(),
            "usuario": usuario,
            "acao": acao,
            "grupo_id": str(grupo_id),
            "origem": origem,
            "mudancas": mudancas or {}
        }
        auditoria.append(registro)

    with open(AUDIT_FILE, "w", encoding="utf-8") as f:
        json.dump(auditoria, f, ensure_ascii=False, indent=2)


def indice_para_coluna(col_idx: int) -> str:
    """Converte índice de coluna (0-based) para letra(s) Excel: A, B, ..., Z, AA, AB, ..."""
    col_letra = ""
    while col_idx >= 0:
        col_letra = chr(65 + (col_idx % 26)) + col_letra
        col_idx = col_idx // 26 - 1
    return col_letra


def mapa_campo_para_coluna() -> dict:
    """Retorna mapeamento de campo para índice de coluna no Google Sheets"""
    return {
        "adm": 0,
        "grupo": 1,
        "tipo_bem": 2,
        "primeira_assembleia": 3,
        "prazo_grupo": 4,
        "prazo_restante": 5,
        "meses_corridos": 6,
        "data_termino": 7,
        "vida_grupo_pct": 8,
        "venc": 10,
        "menor_credito": 11,
        "maior_credito": 12,
        "taxa_adm": 13,
        "taxa_promocao": 16,
        "fundo_rsv": 19,
        "prestacao_integral": 20,
        "meia_reduzida": 21,
        "investidor": 26,
        "conservador_24m": 27,
        "moderado_12m": 28,
        "agressivo_6m": 29,
        "super_agressivo_3m": 30,
        "lance_quitacao": 31,
        "media_lance": 32,
        "media_contemp": 33,
        "categoria": 37,
        "parcela_inicial": 38,
    }


def sincronizar_grupo_ao_sheets(grupo_id: str, dados: Dict[str, Any]) -> bool:
    """Sincroniza alterações de grupo com Google Sheets via API

    Tenta usar Service Account. Se nao disponivel, retorna False silenciosamente
    e aviso eh registrado (cache sera atualizado normalmente).
    """
    try:
        print(f"[DEBUG] Iniciando sincronizacao de grupo {grupo_id} com Google Sheets...")
        print(f"[DEBUG] Dados recebidos para sincronizar: {len(dados)} campos")
        print(f"[DEBUG] Valores numéricos: maior_credito={dados.get('maior_credito')} (type: {type(dados.get('maior_credito')).__name__}), menor_credito={dados.get('menor_credito')} (type: {type(dados.get('menor_credito')).__name__})")

        # VALIDAÇÃO: Garante que dados não estão vazios
        if not dados:
            print(f"[ERRO] Dados vazio para grupo {grupo_id}!")
            return False
        service = get_service(use_write_permissions=True)

        # Verifica se conseguiu credenciais de escrita
        if not service:
            print(f"AVISO: Nao foi possivel sincronizar com Google Sheets (Service Account nao configurado)")
            return False

        print(f"[DEBUG] Service obtido com sucesso. Campos a atualizar: {list(dados.keys())}")

        # Lê todos os dados do Sheets
        print(f"[DEBUG] Lendo dados do Sheets (range: A:EF)...")
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range="Tabela de Grupos 3.0!A:EF"
        ).execute()

        rows = result.get("values", [])
        print(f"[DEBUG] Google Sheets retornou {len(rows)} linhas")
        if not rows:
            print(f"[DEBUG] ERRO: Sheets vazio!")
            return False

        # Encontra TODAS as linhas do grupo (pode haver duplicatas)
        grupo_row_indices = []
        print(f"[DEBUG] Procurando grupo {grupo_id} em {len(rows)} linhas do Sheets...")
        for i, row in enumerate(rows):
            if i == 0:  # Skip header
                continue
            if len(row) > 1 and str(row[1]) == str(grupo_id):
                row_idx = i + 1  # i é 0-based, +1 para converter a 1-based (linha do Sheets)
                grupo_row_indices.append(row_idx)
                print(f"[DEBUG] Grupo encontrado na linha {row_idx}")

        if not grupo_row_indices:
            print(f"[DEBUG] ERRO: Grupo {grupo_id} NÃO encontrado no Google Sheets!")
            return False

        if len(grupo_row_indices) > 1:
            print(f"[DEBUG] AVISO: Grupo {grupo_id} encontrado em {len(grupo_row_indices)} linhas. Atualizando todas.")

        # Mapeia campos para colunas
        campo_para_coluna = mapa_campo_para_coluna()

        # Prepara updates para a API (para TODAS as linhas encontradas)
        updates = []

        # PROB-002: Rastreia campos não mapeados
        unmapped_fields = []
        synced_fields = []

        # Extrai historico se presente (para tratamento especial) - NÃO modifica dados original
        historico = dados.get("historico", None)

        # Itera por cada linha encontrada
        for grupo_row_idx in grupo_row_indices:
            for campo, valor in dados.items():
                # Pula historico (tratado separadamente)
                if campo == "historico":
                    continue
                if campo in campo_para_coluna:
                    synced_fields.append(campo)
                    col_idx = campo_para_coluna[campo]
                    col_letra = indice_para_coluna(col_idx)
                    cell_ref = f"Tabela de Grupos 3.0!{col_letra}{grupo_row_idx}"  # grupo_row_idx já é linha 1-based

                    # Formata o valor corretamente
                    if valor is None:
                        valor_str = ""
                    elif isinstance(valor, float):
                        # Numeros: enviar com ponto decimal (Google Sheets converte para locale automaticamente)
                        valor_str = f"{valor:.2f}"  # NÃO substituir ponto por vírgula - deixar Sheets fazer isso
                    elif isinstance(valor, (int, bool)):
                        valor_str = str(valor)
                    else:
                        valor_str = str(valor)

                    updates.append({
                        "range": cell_ref,
                        "values": [[valor_str]]
                    })
                else:
                    # PROB-002: Campo não encontrado no mapa
                    if campo not in unmapped_fields and campo != "historico":
                        unmapped_fields.append(campo)

        # Processa historico (dados mensais) para TODAS as linhas
        if historico and isinstance(historico, list):
            # Lê headers para encontrar colunas de histórico
            result_headers = service.spreadsheets().values().get(
                spreadsheetId=SPREADSHEET_ID,
                range="Tabela de Grupos 3.0!A1:EF1"
            ).execute()
            headers = result_headers.get("values", [[]])[0]

            for grupo_row_idx in grupo_row_indices:
                for hist_item in historico:
                    mes = hist_item.get("mes")
                    maior_lance = hist_item.get("maior_lance")
                    menor_lance = hist_item.get("menor_lance")
                    qtd = hist_item.get("qtd")

                    if not mes:
                        continue

                    # Procura colunas para este mês
                    maior_key = f"{mes}\nMaior Lance"
                    menor_key = f"{mes}\nMenor Lance"
                    qtd_key = f"{mes}\nQtd"

                    try:
                        if maior_key in headers:
                            col_idx = headers.index(maior_key)
                            col_letra = indice_para_coluna(col_idx)
                            cell_ref = f"Tabela de Grupos 3.0!{col_letra}{grupo_row_idx}"  # já é 1-based
                            valor_str = f"{maior_lance:.2f}" if maior_lance is not None else ""
                            updates.append({"range": cell_ref, "values": [[valor_str]]})

                        if menor_key in headers:
                            col_idx = headers.index(menor_key)
                            col_letra = indice_para_coluna(col_idx)
                            cell_ref = f"Tabela de Grupos 3.0!{col_letra}{grupo_row_idx}"  # já é 1-based
                            valor_str = f"{menor_lance:.2f}" if menor_lance is not None else ""
                            updates.append({"range": cell_ref, "values": [[valor_str]]})

                        if qtd_key in headers:
                            col_idx = headers.index(qtd_key)
                            col_letra = indice_para_coluna(col_idx)
                            cell_ref = f"Tabela de Grupos 3.0!{col_letra}{grupo_row_idx}"  # já é 1-based
                            valor_str = str(qtd) if qtd is not None else ""
                            updates.append({"range": cell_ref, "values": [[valor_str]]})
                    except (ValueError, IndexError):
                        continue

        # PROB-002: Aviso sobre campos não mapeados
        if unmapped_fields:
            print(f"[AVISO PROB-002] Campos NÃO SINCRONIZADOS (não encontrados no mapa):")
            for field in unmapped_fields:
                print(f"  - {field}")
            print(f"[RESUMO PROB-002] Total de campos não mapeados: {len(unmapped_fields)}/{len(dados)} campos recebidos")
            print(f"[RESUMO PROB-002] Campos que SERÃO sincronizados: {len(set(synced_fields))} únicos")
        else:
            print(f"[OK PROB-002] Todos os {len(set(synced_fields))} campos estão mapeados e serão sincronizados")

        if not updates:
            print(f"[DEBUG] Nenhum update a fazer para grupo {grupo_id}")
            return False

        print(f"[DEBUG] Executando {len(updates)} updates para grupo {grupo_id} ({len(grupo_row_indices)} linhas)...")

        # LOG DE DEBUG: mostra EXATAMENTE o que está sendo enviado
        for idx, upd in enumerate(updates[:5]):  # mostra primeiros 5
            print(f"[DEBUG_UPDATE_{idx}] Range: {upd.get('range')} = Value: {upd.get('values')}")

        # Executa batch update na API
        response = service.spreadsheets().values().batchUpdate(
            spreadsheetId=SPREADSHEET_ID,
            body={"data": updates, "valueInputOption": "USER_ENTERED"}
        ).execute()

        # Log completo de TODAS as respostas para debug
        responses = response.get('responses', [])
        print(f"[SUCESSO] Grupo {grupo_id} sincronizado. {len(responses)} respostas recebidas")
        for idx, resp in enumerate(responses):
            if resp and 'updatedCells' in resp:
                print(f"[RESP_{idx}] Range: {resp.get('updatedRange')} → Cells: {resp.get('updatedCells')}")
            elif resp:
                print(f"[RESP_{idx}] ERROR: {resp}")
        return True
    except Exception as e:
        print(f"[ERRO CRÍTICO] Erro ao sincronizar com Google Sheets: {e}")
        import traceback
        traceback.print_exc()
        return False


def atualizar_grupo_sheets(grupo_id: str, dados: Dict[str, Any], usuario: str = "sistema", origem: str = "Dashboard") -> bool:
    try:
        print(f"[UPDATE_GRUPO] Atualizando grupo {grupo_id}. Usuario: {usuario}, Origem: {origem}")
        print(f"[UPDATE_GRUPO] Dados RECEBIDOS: maior_credito={dados.get('maior_credito')}, menor_credito={dados.get('menor_credito')}, taxa_adm={dados.get('taxa_adm')}")
        result = fetch_grupos(force_refresh=True)
        grupos = result['grupos']
        metadata = result['metadata']
        if metadata['source'] == 'cache_fallback':
            print(f"[AVISO] Dados carregados do cache (API indisponível): {metadata['error']}")

        # Encontra índice do grupo
        grupo_idx = None
        for i, g in enumerate(grupos):
            if str(g.get("grupo")) == str(grupo_id):
                grupo_idx = i
                break

        if grupo_idx is None:
            print(f"[UPDATE_GRUPO] ERRO: Grupo {grupo_id} nao encontrado na lista de grupos")
            return False

        # Registra alteracoes para auditoria (com BACKUP dos valores antigos)
        mudancas = {}
        for chave, valor in dados.items():
            valor_antigo = grupos[grupo_idx].get(chave)
            if valor_antigo != valor:
                # BACKUP: registra valor antigo como backup
                mudancas[chave] = {"antes": valor_antigo, "depois": valor}

        # ⚠️ CRÍTICO (PROB-007): SINCRONIZAR COM GOOGLE SHEETS PRIMEIRO
        # Não salve em cache até validar que a sincronização foi bem-sucedida
        print(f"[UPDATE_GRUPO] [1/3] Sincronizando com Google Sheets...")
        sync_result = sincronizar_grupo_ao_sheets(grupo_id, dados)

        if not sync_result:
            print(f"[ERRO CRÍTICO] Sincronização com Google Sheets FALHOU. Cache NÃO será atualizado.")
            return False

        print(f"[UPDATE_GRUPO] [2/3] Google Sheets sincronizado com sucesso!")

        # ✓ Só agora atualiza cache (após validação de sucesso)
        grupos[grupo_idx].update(dados)

        # Salva cache atualizado
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(grupos, f, ensure_ascii=False, indent=2)

        print(f"[UPDATE_GRUPO] [3/3] Cache local atualizado")

        # Registra auditoria com origem
        if mudancas:
            print(f"[UPDATE_GRUPO] Registrando auditoria: {len(mudancas)} campos alterados")
            registrar_auditoria(usuario, "UPDATE", grupo_id, mudancas, origem)
        else:
            print(f"[UPDATE_GRUPO] Nenhuma mudança detectada (dados identicos)")

        print(f"[UPDATE_GRUPO] [OK] Grupo {grupo_id} atualizado com sucesso!")
        return True
    except Exception as e:
        print(f"[ERRO] Erro ao atualizar grupo: {e}")
        import traceback
        traceback.print_exc()
        return False


def criar_grupo(dados: dict, usuario: str = "sistema") -> str | None:
    try:
        result = fetch_grupos()
        grupos = result['grupos']

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
        result = fetch_grupos()
        grupos = result['grupos']

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
        result = fetch_grupos()
        grupos = result['grupos']

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
