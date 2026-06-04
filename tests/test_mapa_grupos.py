import unittest
from unittest.mock import patch

from backend.main import grupos
from backend.sheets_client import row_to_grupo


class MapaGruposTest(unittest.TestCase):
    def test_row_to_grupo_uses_header_names(self):
        row = {
            "Administradora": "Itau Consorcios",
            "Grupo": "128",
            "Tipo de Bem": "Imovel",
            "Credito Minimo": "100.000,00",
            "Credito Maximo": "1.000.000,00",
            "Taxa Administracao": "20%",
            "Prazo Total": "222",
            "Primeira Assembleia": "2023-03-15",
            "Ultima Assembleia": "2041-03-15",
            "Status": "Ativo",
        }

        result = row_to_grupo(row)

        self.assertEqual(result["grupo_id"], "ITAU-CONSORCIOS-128-IMOVEL")
        self.assertEqual(result["credito_minimo"], 100000)
        self.assertEqual(result["credito_maximo"], 1000000)
        self.assertEqual(result["taxa_adm"], 0.2)
        self.assertEqual(result["prazo_total"], 222)

    def test_grupos_endpoint_filters_and_paginates(self):
        fake_items = [
            {
                "grupo_id": "ITAU-128-IMOVEL",
                "administradora": "Itau",
                "grupo": "128",
                "tipo_bem": "Imovel",
                "credito_minimo": 100000,
                "credito_maximo": 1000000,
                "taxa_adm": 0.2,
                "prazo_total": 222,
                "primeira_assembleia": "2023-03-15",
                "ultima_assembleia": "2041-03-15",
                "status": "Ativo",
            },
            {
                "grupo_id": "CNP-017-IMOVEL",
                "administradora": "CNP",
                "grupo": "017",
                "tipo_bem": "Imovel",
                "credito_minimo": 50000,
                "credito_maximo": 300000,
                "taxa_adm": 0.18,
                "prazo_total": 180,
                "primeira_assembleia": "2024-01-20",
                "ultima_assembleia": "2039-01-20",
                "status": "Ativo",
            },
        ]

        with patch("backend.main.list_grupos", return_value=fake_items):
            result = grupos(administradora="Itau", page=1, page_size=10)

        self.assertEqual(result["total"], 1)
        self.assertEqual(result["items"][0]["grupo_id"], "ITAU-128-IMOVEL")


if __name__ == "__main__":
    unittest.main()
