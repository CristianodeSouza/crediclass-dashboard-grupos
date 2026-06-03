from typing import Any

from pydantic import BaseModel, Field


class MonthHistory(BaseModel):
    mes: str
    maior_lance: Any = None
    menor_lance: Any = None
    qtd_contemplacoes: Any = None


class GroupPayload(BaseModel):
    dados_gerais: dict[str, Any] = Field(default_factory=dict)
    historico: dict[str, list[MonthHistory]] = Field(default_factory=dict)


class ApiMessage(BaseModel):
    status: str
    message: str
