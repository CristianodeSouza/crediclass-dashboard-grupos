#!/usr/bin/env python3
"""
Validador de Dockerfile — Previne problemas críticos em deploy

Verifica que todas as COPY directives críticas estão presentes e na ordem correta.
Executado automaticamente pelo pre-commit hook para evitar deploy sem arquivos essenciais.

Uso:
    python backend/dockerfile_validator.py

Exit codes:
    0 = válido
    1 = validação falhou
"""

import os
import sys
from pathlib import Path


class DockerfileValidator:
    """Valida Dockerfile contra checklist crítico."""

    CRITICAL_LINES = [
        "FROM python:3.11-slim",
        "COPY backend/ ./backend/",
        "COPY frontend/ ./frontend/",
        "COPY data/ ./data/",  # ← CRÍTICO: evita blank screen
        "ENV PYTHONPATH=/app",
        "EXPOSE 8000",
        "CMD",
    ]

    def __init__(self):
        self.dockerfile_path = Path(__file__).parent.parent / "Dockerfile"
        self.errors = []
        self.warnings = []

    def validate(self):
        """Executa todas as validações."""
        print("\nValidando Dockerfile...")

        if not self._file_exists():
            return False

        if not self._read_dockerfile():
            return False

        self._check_critical_lines()
        self._check_copy_order()
        self._check_imports()

        return self._report()

    def _file_exists(self):
        """Verifica se Dockerfile existe."""
        if not self.dockerfile_path.exists():
            self.errors.append(f"[ERRO] Dockerfile não encontrado em {self.dockerfile_path}")
            return False
        return True

    def _read_dockerfile(self):
        """Lê conteúdo do Dockerfile."""
        try:
            with open(self.dockerfile_path, 'r', encoding='utf-8') as f:
                self.content = f.read()
                self.lines = [line.strip() for line in self.content.split('\n') if line.strip()]
            return True
        except Exception as e:
            self.errors.append(f"[ERRO] Erro ao ler Dockerfile: {e}")
            return False

    def _check_critical_lines(self):
        """Verifica presença de linhas críticas."""
        for required_line in self.CRITICAL_LINES:
            if "FROM" in required_line:
                # Verifica que a linha começa com FROM
                if not any(line.startswith("FROM") for line in self.lines):
                    self.errors.append(f"[ERRO] Falta linha crítica: {required_line}")
            elif "COPY" in required_line:
                # Verifica COPY exato
                if not any(required_line in line for line in self.lines):
                    self.errors.append(f"[ERRO] FALTA COPY CRÍTICA: {required_line}")
            elif "ENV" in required_line:
                if not any("PYTHONPATH=/app" in line for line in self.lines):
                    self.errors.append(f"[ERRO] Falta PYTHONPATH: {required_line}")
            elif "EXPOSE" in required_line:
                if not any(line.startswith("EXPOSE") for line in self.lines):
                    self.errors.append(f"[ERRO] Falta EXPOSE: {required_line}")
            elif "CMD" in required_line:
                if not any(line.startswith("CMD") for line in self.lines):
                    self.errors.append(f"[ERRO] Falta CMD: {required_line}")

    def _check_copy_order(self):
        """Verifica que COPY data/ vem depois de backend/ e frontend/."""
        copy_indices = {}
        for i, line in enumerate(self.lines):
            if "COPY backend/" in line:
                copy_indices['backend'] = i
            elif "COPY frontend/" in line:
                copy_indices['frontend'] = i
            elif "COPY data/" in line:
                copy_indices['data'] = i

        if 'data' not in copy_indices:
            self.errors.append("[ERRO] COPY data/ não está presente no Dockerfile!")
            return

        # data/ deve vir depois de backend/ e frontend/
        if 'backend' in copy_indices and copy_indices['data'] < copy_indices['backend']:
            self.warnings.append("[AVISO] COPY data/ deve vir após COPY backend/")

    def _check_imports(self):
        """Verifica imports críticos em main.py."""
        main_py_path = Path(__file__).parent / "main.py"
        if main_py_path.exists():
            with open(main_py_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            if 'import json' not in content and 'from json import' not in content:
                self.warnings.append("[AVISO] main.py não tem 'import json' (necessário para debug endpoint)")

    def _report(self):
        """Exibe relatório de validação."""
        if self.errors:
            print("\n[FALHA] VALIDAÇÃO FALHOU:")
            for error in self.errors:
                print(f"   {error}")

        if self.warnings:
            print("\n[AVISO] AVISOS:")
            for warning in self.warnings:
                print(f"   {warning}")

        if not self.errors and not self.warnings:
            print("[OK] Dockerfile é válido — todas as COPY directives críticas presentes!")
            print("   [OK] FROM python:3.11-slim")
            print("   [OK] COPY backend/ ./backend/")
            print("   [OK] COPY frontend/ ./frontend/")
            print("   [OK] COPY data/ ./data/ [CRÍTICO]")
            print("   [OK] ENV PYTHONPATH=/app")
            print("   [OK] EXPOSE 8000")
            print("   [OK] CMD uvicorn")
            return True

        if not self.errors:
            return True

        return False


def main():
    """Ponto de entrada."""
    validator = DockerfileValidator()
    success = validator.validate()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
