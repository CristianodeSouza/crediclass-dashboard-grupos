import unittest
from types import SimpleNamespace
from unittest.mock import patch

from backend import sheets


class SheetsMappingTest(unittest.TestCase):
    def setUp(self):
        self.headers = [
            "Administradora",
            "Grupo",
            "Tipo de Bem",
            "Menor Credito",
            "Maior Credito",
            "Status",
            "JAN-24\nMaior Lance",
            "JAN-24\nMenor Lance",
            "JAN-24\nQtd",
            "DEC-26\nMaior Lance",
            "DEC-26\nMenor Lance",
            "DEC-26\nQtd",
        ]
        self.row = [
            "Porto Seguro",
            "123",
            "Imovel",
            "300000",
            "900000",
            "Ativo",
            "45%",
            "22%",
            "3",
            "55%",
            "33%",
            "2",
        ]

    def test_row_to_group_builds_friendly_history_by_year(self):
        group = sheets.row_to_group(self.row, self.headers)

        self.assertEqual(group["grupo_id"], "Porto Seguro-123")
        self.assertEqual(group["administradora"], "Porto Seguro")
        self.assertEqual(group["historico"]["2024"][0], {
            "mes": "JAN-24",
            "maior_lance": "45%",
            "menor_lance": "22%",
            "qtd_contemplacoes": "3",
        })
        self.assertEqual(group["historico"]["2026"][-1], {
            "mes": "DEC-26",
            "maior_lance": "55%",
            "menor_lance": "33%",
            "qtd_contemplacoes": "2",
        })

    def test_build_updates_only_includes_sent_fields(self):
        payload = {
            "dados_gerais": {"maior_credito": "950000"},
            "historico": {
                "2024": [{"mes": "JAN-24", "maior_lance": "47%"}],
                "2026": [{"mes": "DEC-26", "qtd_contemplacoes": "4"}],
            },
        }

        with patch("backend.sheets.sheet_range", lambda cell_range: f"Sheet!{cell_range}"):
            updates = sheets.build_updates(self.headers, 2, payload)

        self.assertEqual(updates, [
            {"range": "Sheet!E2", "values": [["950000"]]},
            {"range": "Sheet!G2", "values": [["47%"]]},
            {"range": "Sheet!L2", "values": [["4"]]},
        ])

    def test_write_service_requires_service_account(self):
        settings = SimpleNamespace(
            google_sheets_id="sheet-id",
            google_api_key="read-key",
            service_account_info=None,
        )

        sheets.get_service.cache_clear()
        try:
            with patch("backend.sheets.get_settings", return_value=settings):
                with self.assertRaisesRegex(RuntimeError, "GOOGLE_SERVICE_ACCOUNT_JSON"):
                    sheets.get_service(write=True)
        finally:
            sheets.get_service.cache_clear()


if __name__ == "__main__":
    unittest.main()
