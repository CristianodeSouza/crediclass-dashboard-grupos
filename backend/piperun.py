import re
from html import unescape
import httpx

PIPERUN_TOKEN = "db120d1ef2e5c7dec30e8bacbfd307ae"
PIPERUN_BASE = "https://api.pipe.run/v1"

FIELD_MAP = {
    "Para qual tipo de operação você deseja atendimento?": "operacao",
    "Qual é o valor do imóvel?": "valor_imovel",
    "Qual valor do imóvel desejado?": "valor_imovel",
    "Informe o valor máximo para Entrada / Lance?": "lance_maximo",
    "Recurso próprio máximo disponível": "lance_maximo",
    "Informe o valor máximo para Mensalidade?": "mensalidade_maxima",
    "Parcela máxima disponível": "mensalidade_maxima",
    "Nome Completo": "nome",
    "Email": "email",
    "Celular": "celular",
    "CPF": "cpf",
    "Data de Nascimento": "nascimento",
    "Estado Civil": "estado_civil",
    "Renda Mensal": "renda_mensal",
    "Profissão principal": "profissao",
    "Profissão": "profissao",
    "Categoria": "categoria_cliente",
    "Categoria Profissional": "categoria_cliente",
    "Pretende adquirir em quanto tempo?": "prazo_aquisicao",
    "Qual é o tipo do imóvel desejado?": "tipo_imovel_condicao",
    "Qual o tipo do imóvel?": "tipo_imovel",
    "Qual é o tipo de imóvel desejado?": "tipo_imovel",
    "Em qual titularidade você deseja prosseguir?": "titularidade",
    "Quais métodos você deseja incluir em seu Estudo Financeiro personalizado?": "metodos_estudo",
    "Qual é a localização do imóvel desejado?": "localizacao",
    "Qual localização do imóvel?": "localizacao",
    "Você já definiu o imóvel?": "imovel_definido",
    "Quais bancos você possui relacionamento?": "bancos",
    "Preenchido por": "preenchido_por",
    "Qual a origem deste atendimento?": "origem",
    "Deseja incluir as custas (Escritura/ITBI/Cartório/Despachante)?": "incluir_custas",
    "Você possui outra renda?": "outra_renda",
    "Possui outra renda?": "outra_renda",
    "A decisão é tomada por quem?": "decisao_por",
    "Tipo de Formulário Comunicação E-mail": "tipo_formulario",
}


def _strip_html(text: str) -> str:
    text = text.replace("<br>", "\n").replace("<br/>", "\n").replace("<br />", "\n")
    text = text.replace("</p>", "\n").replace("</div>", "\n")
    text = re.sub(r"<[^>]+>", "", text)
    return unescape(text)


def _parse_num(v: str) -> float | None:
    if not v:
        return None
    cleaned = re.sub(r"[^\d,.]", "", str(v))

    # Brazilian format detection:
    # 1. "600.000,00" → has both . and , → remove . and convert , to .
    # 2. "2.500" → has only . → it's a thousands separator (remove it)
    # 3. "2,5" → has only , → it's a decimal separator (convert to .)
    # 4. "2500" → no . or , → integer

    if "," in cleaned and "." in cleaned:
        # Format: 600.000,00 (thousands sep + decimal sep)
        cleaned = cleaned.replace(".", "").replace(",", ".")
    elif "." in cleaned and "," not in cleaned:
        # Format: 2500 or 2.500 (thousands separator)
        # Count digits after last dot
        parts = cleaned.split(".")
        if len(parts[-1]) == 3:
            # Likely thousands separator (e.g., "2.500" or "600.000")
            cleaned = cleaned.replace(".", "")
        else:
            # Likely decimal separator (e.g., "2.5")
            # Keep it as-is for now
            pass
    elif "," in cleaned and "." not in cleaned:
        # Format: 2,5 or 600,00 (decimal separator)
        cleaned = cleaned.replace(",", ".")

    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_note_text(html_text: str) -> dict:
    text = _strip_html(html_text)
    result = {}

    for line in text.split("\n"):
        line = line.strip()
        if not line or "=" * 5 in line or line.startswith("INFORMAÇÕES"):
            continue
        for label, key in FIELD_MAP.items():
            if line.startswith(label):
                remainder = line[len(label):].lstrip(":? ")
                if remainder:
                    result[key] = remainder
                    break

    for field in ("valor_imovel", "lance_maximo", "mensalidade_maxima", "renda_mensal"):
        if field in result:
            result[f"{field}_num"] = _parse_num(result[field])

    v_imovel = result.get("valor_imovel_num")
    v_lance = result.get("lance_maximo_num")
    if v_imovel and v_lance and v_imovel > 0:
        result["pct_lance_disponivel"] = round(v_lance / v_imovel * 100, 1)

    return result


async def fetch_oportunidade(deal_id: str) -> dict:
    headers = {"token": PIPERUN_TOKEN, "accept": "application/json"}

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            f"{PIPERUN_BASE}/notes",
            params={"cursor": '""', "deal_id": deal_id},
            headers=headers,
        )
        resp.raise_for_status()
        notes_json = resp.json()

    notes = notes_json.get("data", [])

    form_note = next(
        (n for n in notes if "DADOS DO FORMULÁRIO" in (n.get("text") or "")),
        None,
    )

    todas_notas = [
        {
            "id": n["id"],
            "resumo": _strip_html(n.get("text") or "")[:120].strip(),
            "criado_em": n.get("created_at", ""),
        }
        for n in notes
    ]

    if not form_note:
        return {
            "deal_id": deal_id,
            "formulario": {},
            "todas_notas": todas_notas,
            "aviso": "Nenhuma nota com formulário encontrada nesta oportunidade.",
        }

    return {
        "deal_id": deal_id,
        "nota_id": form_note["id"],
        "criado_em": form_note.get("created_at", ""),
        "formulario": parse_note_text(form_note["text"]),
        "todas_notas": todas_notas,
    }
