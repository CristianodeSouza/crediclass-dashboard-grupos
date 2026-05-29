#!/usr/bin/env python3
"""
Zero_erro — Agente de Verificação End-to-End de Deploy
Verifica: Git → GitHub Actions → Render → Vercel → URLs em Produção
"""

import subprocess
import json
import time
import sys
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import re

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

class ZeroErro:
    def __init__(self):
        self.results = {}
        self.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.errors = []
        self.warnings = []

    def log(self, category: str, status: str, message: str, details: str = ""):
        """Log com formatação de cores"""
        timestamp = datetime.now().strftime("%H:%M:%S")

        if status == "✅":
            color = Colors.GREEN
        elif status == "❌":
            color = Colors.RED
        elif status == "⚠️":
            color = Colors.YELLOW
        elif status == "ℹ️":
            color = Colors.BLUE
        else:
            color = Colors.RESET

        print(f"{color}[{timestamp}] {status} {category}: {message}{Colors.RESET}")
        if details:
            print(f"    {details}")

        self.results[category] = {
            "status": status,
            "message": message,
            "details": details,
            "timestamp": timestamp
        }

    def run_command(self, cmd: str, silent: bool = False) -> Tuple[bool, str]:
        """Executa comando e retorna (sucesso, output)"""
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30
            )
            output = result.stdout.strip()
            if not silent and result.returncode != 0:
                self.errors.append(f"Command failed: {cmd}\n{result.stderr}")
            return result.returncode == 0, output
        except subprocess.TimeoutExpired:
            self.errors.append(f"Command timeout: {cmd}")
            return False, ""
        except Exception as e:
            self.errors.append(f"Command error: {str(e)}")
            return False, ""

    # ════════════════════════════════════════════════════════════════
    # 1. VERIFICAR GIT STATUS E PUSH
    # ════════════════════════════════════════════════════════════════
    def check_git(self) -> bool:
        """Verifica status do git e se precisa fazer push"""
        print(f"\n{Colors.BOLD}📦 1. GIT STATUS & PUSH{Colors.RESET}")
        print("=" * 60)

        all_good = True

        # Status atual
        success, status = self.run_command("git status --short")
        if success:
            if status:
                self.log("Git", "⚠️", "Arquivos não commitados", status)
                self.warnings.append("Há mudanças não commitadas")
                all_good = False
            else:
                self.log("Git", "✅", "Working tree limpo")
        else:
            self.log("Git", "❌", "Erro ao verificar status")
            all_good = False
            return False

        # Verificar branch
        success, branch = self.run_command("git rev-parse --abbrev-ref HEAD")
        if success:
            self.log("Git", "ℹ️", f"Branch atual: {branch}")

        # Verificar se há commits a fazer push
        success, unpushed = self.run_command("git log origin/main..HEAD --oneline")
        if success:
            if unpushed:
                count = len(unpushed.split('\n'))
                self.log("Git", "⚠️", f"Há {count} commit(s) não enviado(s)", unpushed)
                self.warnings.append(f"Commits pendentes para push: {count}")
                all_good = False
            else:
                self.log("Git", "✅", "Todos os commits estão no remoto")

        # Verificar se main está atualizada com origin/main
        success, diff = self.run_command("git diff main origin/main")
        if success and not diff:
            self.log("Git", "✅", "main sincronizada com origin/main")
        elif success and diff:
            self.log("Git", "⚠️", "main diferente de origin/main")
            all_good = False

        return all_good

    # ════════════════════════════════════════════════════════════════
    # 2. MONITORAR CI/CD NO GITHUB ACTIONS
    # ════════════════════════════════════════════════════════════════
    def check_github_actions(self) -> bool:
        """Verifica status do GitHub Actions"""
        print(f"\n{Colors.BOLD}🔄 2. GITHUB ACTIONS CI/CD{Colors.RESET}")
        print("=" * 60)

        all_good = True

        # Tenta usar gh CLI
        success, workflows = self.run_command(
            "gh run list --limit 3 --json status,conclusion,name,createdAt --template '{{range .}}{{.name}} | {{.status}} | {{.conclusion}}\n{{end}}'",
            silent=True
        )

        if success and workflows:
            self.log("CI/CD", "ℹ️", "Últimos 3 workflows:")
            for line in workflows.split('\n'):
                if line.strip():
                    print(f"    {line}")

            # Verificar se há algum failing
            if "failure" in workflows.lower() or "failed" in workflows.lower():
                self.log("CI/CD", "❌", "Há workflows com falha")
                all_good = False
            else:
                self.log("CI/CD", "✅", "Workflows rodando ou completados com sucesso")
        else:
            self.log("CI/CD", "⚠️", "gh CLI não disponível ou erro ao acessar",
                    "Você pode verificar em: https://github.com/CristianodeSouza/crediclass-dashboard-grupos/actions")
            self.warnings.append("Não foi possível verificar GitHub Actions via CLI")

        return all_good

    # ════════════════════════════════════════════════════════════════
    # 3. VERIFICAR STATUS DO RENDER
    # ════════════════════════════════════════════════════════════════
    def check_render(self) -> bool:
        """Verifica status do Render via API"""
        print(f"\n{Colors.BOLD}🚀 3. RENDER DEPLOYMENT STATUS{Colors.RESET}")
        print("=" * 60)

        all_good = True

        # Verificar se RENDER_SERVICE_ID está setado
        success, service_id = self.run_command("echo $RENDER_SERVICE_ID", silent=True)

        if not service_id:
            self.log("Render", "⚠️", "RENDER_SERVICE_ID não configurado",
                    "Configure em: https://dashboard.render.com → Settings → API Key")
            self.warnings.append("RENDER_SERVICE_ID não configurado")
            all_good = False
        else:
            self.log("Render", "ℹ️", f"Service ID encontrado (últimos 8 caracteres): ...{service_id[-8:]}")

            # Tenta pingar o endpoint
            success, response = self.run_command(
                "curl -s https://crediclass.csrtecnologia.com.br/api --max-time 10",
                silent=True
            )

            if success and "Crediclass" in response:
                self.log("Render", "✅", "Backend respondendo corretamente")
                self.log("Render", "✅", "Endpoint /api está online")
            elif success:
                self.log("Render", "⚠️", "Backend respondendo mas sem dados esperados")
                all_good = False
            else:
                self.log("Render", "❌", "Backend não está respondendo")
                all_good = False

        return all_good

    # ════════════════════════════════════════════════════════════════
    # 4. VERIFICAR STATUS DO VERCEL
    # ════════════════════════════════════════════════════════════════
    def check_vercel(self) -> bool:
        """Verifica status do Vercel"""
        print(f"\n{Colors.BOLD}⚡ 4. VERCEL DEPLOYMENT STATUS{Colors.RESET}")
        print("=" * 60)

        all_good = True

        # Tentar acessar o frontend
        success, response = self.run_command(
            "curl -s -I https://crediclass.csrtecnologia.com.br --max-time 10 | head -5",
            silent=True
        )

        if success and ("200" in response or "301" in response or "302" in response):
            self.log("Vercel", "✅", "Frontend (Vercel) respondendo corretamente")
        else:
            self.log("Vercel", "⚠️", "Frontend pode ter problemas",
                    "Verifique em: https://vercel.com/dashboard")
            self.warnings.append("Frontend pode ter problemas")
            all_good = False

        return all_good

    # ════════════════════════════════════════════════════════════════
    # 5. TESTAR URLS EM PRODUÇÃO
    # ════════════════════════════════════════════════════════════════
    def check_production_urls(self) -> bool:
        """Testa URLs principais em produção"""
        print(f"\n{Colors.BOLD}🌐 5. PRODUCTION URLS TEST{Colors.RESET}")
        print("=" * 60)

        all_good = True

        urls_to_test = {
            "Frontend Home": "https://crediclass.csrtecnologia.com.br",
            "API Root": "https://crediclass.csrtecnologia.com.br/api",
            "API Grupos": "https://crediclass.csrtecnologia.com.br/api/grupos-gerenciador?limit=1",
            "API Stats": "https://crediclass.csrtecnologia.com.br/api/stats",
            "API Health": "https://crediclass.csrtecnologia.com.br/api/health",
        }

        for name, url in urls_to_test.items():
            success, response = self.run_command(
                f"curl -s -w '%{{http_code}}' -o /dev/null {url} --max-time 10",
                silent=True
            )

            if success:
                http_code = response.strip()
                if http_code.startswith("200") or http_code.startswith("301"):
                    self.log("URL", "✅", f"{name} → HTTP {http_code}")
                else:
                    self.log("URL", "⚠️", f"{name} → HTTP {http_code}")
                    all_good = False
            else:
                self.log("URL", "❌", f"{name} → Erro de conexão")
                all_good = False

        return all_good

    # ════════════════════════════════════════════════════════════════
    # RELATÓRIO FINAL
    # ════════════════════════════════════════════════════════════════
    def generate_report(self):
        """Gera relatório final"""
        print(f"\n{Colors.BOLD}{'=' * 60}{Colors.RESET}")
        print(f"{Colors.BOLD}📋 RELATÓRIO FINAL — ZERO_ERRO{Colors.RESET}")
        print(f"{Colors.BOLD}{'=' * 60}{Colors.RESET}")

        passed = sum(1 for r in self.results.values() if "✅" in r["status"])
        total = len(self.results)

        print(f"\n{Colors.BOLD}Status Geral:{Colors.RESET} {passed}/{total} verificações passaram")

        if self.errors:
            print(f"\n{Colors.RED}{Colors.BOLD}❌ Erros:{Colors.RESET}")
            for error in self.errors:
                print(f"  • {error}")

        if self.warnings:
            print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠️ Avisos:{Colors.RESET}")
            for warning in self.warnings:
                print(f"  • {warning}")

        if not self.errors and not self.warnings:
            print(f"\n{Colors.GREEN}{Colors.BOLD}✅ TUDO PRONTO PARA PRODUÇÃO!{Colors.RESET}")
            print("• Git status: OK")
            print("• GitHub Actions: OK")
            print("• Render Backend: OK")
            print("• Vercel Frontend: OK")
            print("• URLs de Produção: OK")
        else:
            print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠️ AÇÃO NECESSÁRIA{Colors.RESET}")
            print("Verifique os erros e avisos acima antes de considerar o deploy como completo.")

        print(f"\n{Colors.BLUE}Gerado em: {self.timestamp}{Colors.RESET}\n")

    def run(self):
        """Executa todas as verificações"""
        print(f"{Colors.BOLD}{Colors.BLUE}")
        print("╔════════════════════════════════════════════════════════════╗")
        print("║         🚀 ZERO_ERRO — VERIFICAÇÃO DE DEPLOY 🚀           ║")
        print("║     Git → GitHub Actions → Render → Vercel → Produção     ║")
        print("╚════════════════════════════════════════════════════════════╝")
        print(f"{Colors.RESET}\n")

        try:
            self.check_git()
            self.check_github_actions()
            self.check_render()
            self.check_vercel()
            self.check_production_urls()
        except KeyboardInterrupt:
            print(f"\n{Colors.YELLOW}Verificação interrompida pelo usuário{Colors.RESET}")
            sys.exit(1)
        except Exception as e:
            print(f"{Colors.RED}Erro inesperado: {e}{Colors.RESET}")
            self.errors.append(str(e))

        self.generate_report()

if __name__ == "__main__":
    agent = ZeroErro()
    agent.run()
