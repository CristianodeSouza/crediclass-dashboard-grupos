from pydantic import BaseModel, Field


class GrupoResumo(BaseModel):
    grupo_id: str
    administradora: str = ""
    grupo: str = ""
    tipo_bem: str = ""
    credito_minimo: float | None = None
    credito_maximo: float | None = None
    taxa_adm: float | None = None
    prazo_total: int | None = None
    primeira_assembleia: str = ""
    ultima_assembleia: str = ""
    status: str = "Ativo"


class GruposResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[GrupoResumo] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
