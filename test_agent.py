#!/usr/bin/env python3
"""
Automated Test Agent for Crediclass Dashboard Grupos
Tests all critical endpoints and features before deployment
"""

import subprocess
import time
import requests
import sys
import json
import signal
import os

BASE_URL = "http://127.0.0.1:8000"
TIMEOUT = 5

class TestAgent:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        self.server_process = None

    def log(self, message, level="INFO"):
        prefix = "✓" if level == "PASS" else "✗" if level == "FAIL" else "→"
        print(f"[{prefix}] {message}")

    def start_server(self):
        """Start the FastAPI server"""
        try:
            self.log("Starting FastAPI server...", "INFO")
            self.server_process = subprocess.Popen(
                ["python", "main.py"],
                cwd="backend",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            time.sleep(3)  # Give server time to start
            self.log("Server started (PID: {})".format(self.server_process.pid), "INFO")
            return True
        except Exception as e:
            self.log(f"Failed to start server: {e}", "FAIL")
            self.failed += 1
            self.errors.append(f"Server startup: {e}")
            return False

    def stop_server(self):
        """Stop the FastAPI server"""
        if self.server_process:
            self.log("Stopping server...", "INFO")
            self.server_process.terminate()
            try:
                self.server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.server_process.kill()

    def test_health_endpoint(self):
        """Test /health endpoint"""
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok":
                    self.log("Health endpoint responding correctly", "PASS")
                    self.passed += 1
                    return True
            self.log(f"Health endpoint returned unexpected: {response.status_code}", "FAIL")
            self.failed += 1
            self.errors.append(f"Health status code: {response.status_code}")
            return False
        except Exception as e:
            self.log(f"Health endpoint error: {e}", "FAIL")
            self.failed += 1
            self.errors.append(f"Health endpoint: {e}")
            return False

    def test_api_grupos(self):
        """Test /api/grupos endpoint"""
        try:
            response = requests.get(f"{BASE_URL}/api/grupos", timeout=TIMEOUT)
            if response.status_code == 200:
                data = response.json()
                if "total" in data and "grupos" in data:
                    total = data.get("total", 0)
                    self.log(f"API /grupos returns {total} grupos", "PASS")
                    self.passed += 1
                    return True
            self.log(f"API /grupos unexpected response: {response.status_code}", "FAIL")
            self.failed += 1
            self.errors.append(f"API grupos status: {response.status_code}")
            return False
        except Exception as e:
            self.log(f"API /grupos error: {e}", "FAIL")
            self.failed += 1
            self.errors.append(f"API grupos: {e}")
            return False

    def test_grupos_gerenciador(self):
        """Test /api/grupos-gerenciador endpoint with pagination"""
        try:
            response = requests.get(f"{BASE_URL}/api/grupos-gerenciador?pagina=1&por_pagina=20", timeout=TIMEOUT)
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total", "pagina", "por_pagina", "total_paginas", "grupos"]
                if all(field in data for field in required_fields):
                    total = data.get("total")
                    paginas = data.get("total_paginas")
                    grupos_count = len(data.get("grupos", []))
                    self.log(f"Gerenciador: {total} grupos em {paginas} páginas, página 1 com {grupos_count} itens", "PASS")
                    self.passed += 1
                    return True
            self.log(f"Gerenciador unexpected response: {response.status_code}", "FAIL")
            self.failed += 1
            self.errors.append(f"Gerenciador status: {response.status_code}")
            return False
        except Exception as e:
            self.log(f"Gerenciador error: {e}", "FAIL")
            self.failed += 1
            self.errors.append(f"Gerenciador: {e}")
            return False

    def test_stats_endpoint(self):
        """Test /api/stats endpoint"""
        try:
            response = requests.get(f"{BASE_URL}/api/stats", timeout=TIMEOUT)
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_grupos", "por_administradora", "por_tipo_bem"]
                if all(field in data for field in required_fields):
                    total = data.get("total_grupos")
                    adms = list(data.get("por_administradora", {}).keys())
                    self.log(f"Stats: {total} grupos, {len(adms)} administradoras", "PASS")
                    self.passed += 1
                    return True
            self.log(f"Stats unexpected response: {response.status_code}", "FAIL")
            self.failed += 1
            self.errors.append(f"Stats status: {response.status_code}")
            return False
        except Exception as e:
            self.log(f"Stats error: {e}", "FAIL")
            self.failed += 1
            self.errors.append(f"Stats: {e}")
            return False

    def test_grupo_detail(self):
        """Test /api/grupos/{id} endpoint"""
        try:
            # First get a valid ID
            response = requests.get(f"{BASE_URL}/api/grupos", timeout=TIMEOUT)
            if response.status_code == 200:
                grupos = response.json().get("grupos", [])
                if grupos:
                    grupo_id = grupos[0].get("grupo")
                    # Test detail endpoint
                    detail_response = requests.get(f"{BASE_URL}/api/grupos/{grupo_id}", timeout=TIMEOUT)
                    if detail_response.status_code == 200:
                        self.log(f"Detail endpoint works for grupo {grupo_id}", "PASS")
                        self.passed += 1
                        return True
        except Exception as e:
            self.log(f"Detail endpoint error: {e}", "FAIL")
            self.failed += 1
            self.errors.append(f"Detail endpoint: {e}")
            return False

        self.log("Could not test detail endpoint", "FAIL")
        self.failed += 1
        self.errors.append("Detail endpoint: no grupos found")
        return False

    def test_frontend_static_files(self):
        """Test that frontend static files are being served"""
        try:
            response = requests.get(f"{BASE_URL}/", timeout=TIMEOUT)
            if response.status_code == 200:
                content = response.text
                if "<!DOCTYPE html>" in content or "<html" in content:
                    self.log("Frontend index.html served correctly", "PASS")
                    self.passed += 1
                    return True
            self.log(f"Frontend index unexpected status: {response.status_code}", "FAIL")
            self.failed += 1
            self.errors.append(f"Frontend status: {response.status_code}")
            return False
        except Exception as e:
            self.log(f"Frontend error: {e}", "FAIL")
            self.failed += 1
            self.errors.append(f"Frontend: {e}")
            return False

    def test_javascript_files(self):
        """Test that JavaScript files are being served"""
        try:
            response = requests.get(f"{BASE_URL}/js/app.js", timeout=TIMEOUT)
            if response.status_code == 200:
                content = response.text
                if "window.dashboard" in content and "window.init" in content:
                    self.log("app.js served with window exports", "PASS")
                    self.passed += 1
                    return True
            self.log(f"app.js unexpected response: {response.status_code}", "FAIL")
            self.failed += 1
            self.errors.append(f"app.js status: {response.status_code}")
            return False
        except Exception as e:
            self.log(f"app.js error: {e}", "FAIL")
            self.failed += 1
            self.errors.append(f"app.js: {e}")
            return False

    def test_debug_endpoint(self):
        """Test /debug endpoint for diagnostics"""
        try:
            response = requests.get(f"{BASE_URL}/debug", timeout=TIMEOUT)
            if response.status_code == 200:
                data = response.json()
                if data.get("frontend_exists"):
                    self.log("Debug endpoint shows frontend is available", "PASS")
                    self.passed += 1
                    return True
            self.log(f"Debug endpoint failed: {response.status_code}", "FAIL")
            self.failed += 1
            self.errors.append(f"Debug endpoint: {response.status_code}")
            return False
        except Exception as e:
            self.log(f"Debug endpoint error: {e}", "FAIL")
            self.failed += 1
            self.errors.append(f"Debug endpoint: {e}")
            return False

    def run_all_tests(self):
        """Run all tests"""
        print("\n" + "="*60)
        print("CREDICLASS DASHBOARD GRUPOS - AUTOMATED TEST SUITE")
        print("="*60 + "\n")

        if not self.start_server():
            print("\n❌ TESTS FAILED: Server could not start\n")
            return False

        try:
            print("Running tests...\n")
            self.test_health_endpoint()
            self.test_frontend_static_files()
            self.test_javascript_files()
            self.test_api_grupos()
            self.test_grupos_gerenciador()
            self.test_stats_endpoint()
            self.test_grupo_detail()
            self.test_debug_endpoint()

        finally:
            self.stop_server()

        print("\n" + "="*60)
        print(f"TEST RESULTS: {self.passed} passed, {self.failed} failed")
        print("="*60)

        if self.errors:
            print("\nErrors encountered:")
            for error in self.errors:
                print(f"  - {error}")

        success = self.failed == 0
        if success:
            print("\n✓ ALL TESTS PASSED - Application is ready for deployment")
        else:
            print(f"\n✗ {self.failed} TEST(S) FAILED - Do NOT deploy until fixed")

        print("\n")
        return success


if __name__ == "__main__":
    agent = TestAgent()
    success = agent.run_all_tests()
    sys.exit(0 if success else 1)
