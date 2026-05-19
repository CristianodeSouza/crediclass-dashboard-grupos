#!/usr/bin/env python3
"""
Script de Validação Frontend — Roda ANTES de fazer push para Git
Uso: python scripts/validate_frontend.py
"""

import sys
import os

# Adiciona backend ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.frontend_validator import FrontendValidator


def main():
    """Executa validação e bloqueia push se houver problemas"""
    print("\n" + "=" * 70)
    print("VALIDACAO PRE-DEPLOY - Frontend Scripts")
    print("=" * 70 + "\n")

    # Determina diretório frontend
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    frontend_dir = os.path.join(project_dir, "frontend")

    validator = FrontendValidator(frontend_dir)
    success, errors, warnings = validator.validate()

    # Print report
    validator.print_report()

    # Se houver erros, bloqueia
    if not success:
        print("[COMO CORRIGIR]")
        print("  1. Abra frontend/index.html")
        print("  2. Verifique se <script src='/static/js/app.js' defer></script> esta presente")
        print("  3. Certifique-se de que Alpine.js carrega ANTES de app.js")
        print("  4. Verifique se frontend/js/app.js existe e nao esta vazio")
        print("  5. Execute este script novamente: python scripts/validate_frontend.py\n")
        sys.exit(1)
    else:
        print("[OK] Voce pode fazer push com seguranca!")
        print("   -> git add . && git commit -m 'message' && git push\n")
        sys.exit(0)


if __name__ == "__main__":
    main()
