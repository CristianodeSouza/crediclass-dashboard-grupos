import json
import os
from functools import lru_cache
from typing import Any

from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()


class Settings(BaseModel):
    google_sheets_id: str = ""
    google_api_key: str = ""
    google_service_account_json: str = ""
    google_sheet_name: str = "Tabela de Grupos 3.0"
    environment: str = "production"
    debug: bool = False

    @property
    def service_account_info(self) -> dict[str, Any] | None:
        raw = self.google_service_account_json.strip()
        if not raw:
            return None

        if raw.startswith("{"):
            return json.loads(raw)

        if os.path.exists(raw):
            with open(raw, "r", encoding="utf-8") as file:
                return json.load(file)

        return json.loads(raw)


@lru_cache
def get_settings() -> Settings:
    return Settings(
        google_sheets_id=os.getenv("GOOGLE_SHEETS_ID", ""),
        google_api_key=os.getenv("GOOGLE_API_KEY", ""),
        google_service_account_json=os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", ""),
        google_sheet_name=os.getenv("GOOGLE_SHEET_NAME", "Tabela de Grupos 3.0"),
        environment=os.getenv("ENVIRONMENT", "production"),
        debug=os.getenv("DEBUG", "false").lower() == "true",
    )
