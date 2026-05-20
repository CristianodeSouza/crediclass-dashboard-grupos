"""
Validador de Scripts Frontend  Detecta problemas antes de deploy
Uso: python -m backend.frontend_validator
"""

import os
import re
from pathlib import Path
from typing import List, Dict, Tuple


class FrontendValidator:
    """Valida integridade de scripts e carregamento de recursos frontend"""

    REQUIRED_SCRIPTS = [
        ("Alpine.js", "alpinejs@3"),
        ("App.js", "/static/js/app.js"),
        ("Chart.js", "chart.js"),
        ("Tailwind", "tailwindcss"),
    ]

    # Remove emojis para compatibilidade com Windows encoding
    EMOJI_ERROR = "[ERRO]"
    EMOJI_WARN = "[AVISO]"
    EMOJI_OK = "[OK]"

    REQUIRED_SCRIPT_TAGS_IN_APP_JS = [
        "function dashboard()",
        "async init()",
        "async refresh()",
    ]

    # Scripts que DEVEM ter atributo 'defer' (carregamento não-bloqueante)
    SCRIPTS_REQUIRE_DEFER = [
        ("app.js", "/static/js/app.js"),
    ]

    # Scripts que DEVEM NÃO ter 'defer' (carregamento sincronamente - necessário antes do body usar x-data)
    SCRIPTS_MUST_NOT_HAVE_DEFER = [
        ("Alpine.js", "alpinejs@3"),
    ]

    def __init__(self, frontend_dir: str = None):
        if frontend_dir is None:
            frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
        self.frontend_dir = frontend_dir
        self.html_file = os.path.join(frontend_dir, "index.html")
        self.app_js_file = os.path.join(frontend_dir, "js", "app.js")
        self.errors: List[str] = []
        self.warnings: List[str] = []

    def validate(self) -> Tuple[bool, List[str], List[str]]:
        """
        Executa todas as validaes.

        Returns:
            (sucesso: bool, erros: List[str], avisos: List[str])
        """
        self.errors = []
        self.warnings = []

        self._check_files_exist()
        self._check_html_structure()
        self._check_required_scripts()
        self._check_defer_attributes()
        self._check_script_order()
        self._check_app_js_content()
        self._check_x_data_binding()

        return len(self.errors) == 0, self.errors, self.warnings

    def _check_files_exist(self) -> None:
        """Verifica se arquivos crticos existem"""
        if not os.path.exists(self.html_file):
            self.errors.append(f"[ERRO] index.html nao encontrado: {self.html_file}")
        if not os.path.exists(self.app_js_file):
            self.errors.append(f"[ERRO] app.js nao encontrado: {self.app_js_file}")

    def _check_html_structure(self) -> None:
        """Valida estrutura bsica do HTML"""
        if not os.path.exists(self.html_file):
            return

        with open(self.html_file, "r", encoding="utf-8") as f:
            content = f.read()

        if "<!DOCTYPE html>" not in content:
            self.warnings.append("  HTML5 DOCTYPE no encontrado")
        if "<html" not in content:
            self.errors.append(" Tag <html> no encontrada")
        if "<head>" not in content and "<HEAD>" not in content:
            self.errors.append(" Tag <head> no encontrada")

    def _check_required_scripts(self) -> None:
        """Verifica se todos os scripts obrigatrios esto presentes"""
        if not os.path.exists(self.html_file):
            return

        with open(self.html_file, "r", encoding="utf-8") as f:
            html_content = f.read()

        for name, identifier in self.REQUIRED_SCRIPTS:
            if identifier not in html_content:
                self.errors.append(
                    f" {name} no encontrado (procurando por: '{identifier}')"
                )

    def _check_defer_attributes(self) -> None:
        """Verifica se scripts têm defer correto:
        - app.js DEVE ter defer (carregamento não-bloqueante)
        - Alpine.js NÃO deve ter defer (deve carregar sincronamente antes do body usar x-data)
        """
        if not os.path.exists(self.html_file):
            return

        with open(self.html_file, "r", encoding="utf-8") as f:
            html_content = f.read()

        # Validar scripts que EXIGEM defer
        for name, identifier in self.SCRIPTS_REQUIRE_DEFER:
            pattern = r'<script[^>]*src="[^"]*' + re.escape(identifier) + r'[^"]*"[^>]*>'
            match = re.search(pattern, html_content, re.IGNORECASE)

            if match:
                script_tag = match.group(0)
                if "defer" not in script_tag.lower():
                    self.errors.append(
                        f" CRITICO: {name} nao tem atributo 'defer'\n"
                        f"    Adicione: <script defer src=\"...{identifier}...\"></script>\n"
                        f"    Tag encontrada: {script_tag[:80]}..."
                    )

        # Validar scripts que NÃO devem ter defer
        for name, identifier in self.SCRIPTS_MUST_NOT_HAVE_DEFER:
            pattern = r'<script[^>]*src="[^"]*' + re.escape(identifier) + r'[^"]*"[^>]*>'
            match = re.search(pattern, html_content, re.IGNORECASE)

            if match:
                script_tag = match.group(0)
                if "defer" in script_tag.lower():
                    self.errors.append(
                        f" CRITICO: {name} tem atributo 'defer' (ERRADO!)\n"
                        f"    {name} DEVE carregar sincronamente ANTES do body usar x-data\n"
                        f"    Remova: <script defer ...> → <script ...>\n"
                        f"    Tag encontrada: {script_tag[:80]}..."
                    )

    def _check_script_order(self) -> None:
        """Verifica se Alpine.js carrega ANTES de app.js"""
        if not os.path.exists(self.html_file):
            return

        with open(self.html_file, "r", encoding="utf-8") as f:
            content = f.read()

        alpine_pos = content.find("alpinejs@3")
        app_pos = content.find("/static/js/app.js")

        if alpine_pos == -1 or app_pos == -1:
            return  # Erro j reportado em _check_required_scripts

        if alpine_pos > app_pos:
            self.errors.append(
                " ORDEM ERRADA: app.js carrega ANTES de Alpine.js\n"
                "    Mova Alpine.js para ANTES de app.js no <head>"
            )

    def _check_app_js_content(self) -> None:
        """Verifica se app.js contm funes crticas"""
        if not os.path.exists(self.app_js_file):
            return

        with open(self.app_js_file, "r", encoding="utf-8") as f:
            content = f.read()

        for func in self.REQUIRED_SCRIPT_TAGS_IN_APP_JS:
            if func not in content:
                self.errors.append(
                    f" Funo '{func}' no encontrada em app.js\n"
                    f"    app.js pode estar corrompido ou vazio"
                )

    def _check_x_data_binding(self) -> None:
        """Verifica se x-data="dashboard()" est presente e correto"""
        if not os.path.exists(self.html_file):
            return

        with open(self.html_file, "r", encoding="utf-8") as f:
            content = f.read()

        if 'x-data="dashboard()"' not in content:
            self.errors.append(" x-data='dashboard()' no encontrado no <body>")

        if 'x-init="init()"' not in content:
            self.errors.append(" x-init='init()' no encontrado no <body>")

    def print_report(self) -> None:
        """Imprime relatrio formatado"""
        success, errors, warnings = self.validate()

        print("\n" + "=" * 70)
        print("VALIDACAO DE FRONTEND - Integridade de Scripts")
        print("=" * 70)

        if errors:
            print(f"\n[ERROS CRITICOS] ({len(errors)}):")
            for error in errors:
                print(f"  {error}")

        if warnings:
            print(f"\n[AVISOS] ({len(warnings)}):")
            for warning in warnings:
                print(f"  {warning}")

        if success:
            print("\n[OK] TUDO OK! Frontend validado com sucesso.")
            print("   -> Seguro fazer deploy")
        else:
            print("\n[ERRO] BLOQUEADO! Corrija os erros acima antes de fazer deploy.")

        print("\n" + "=" * 70 + "\n")

        return success


def main():
    """Entry point para validao"""
    validator = FrontendValidator()
    success, errors, warnings = validator.validate()
    validator.print_report()
    exit(0 if success else 1)


if __name__ == "__main__":
    main()
