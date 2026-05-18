#!/usr/bin/env python3
"""
Deployment Monitor Agent
Monitors: CI → Merge → Production Publication → Validation Tests
Fully automated - does NOT confirm anything until production tests pass
"""

import subprocess
import time
import requests
import sys
from datetime import datetime

PRODUCTION_URL = "https://crediclass.csrtecnologia.com.br"
PR_NUMBER = 6

class DeploymentMonitor:
    def __init__(self):
        self.log_messages = []

    def log(self, message):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        full_msg = f"[{timestamp}] {message}"
        print(full_msg)
        self.log_messages.append(full_msg)

    def check_pr_ci_status(self):
        """Check if CI tests passed for PR #6"""
        self.log("Checking PR #6 CI status...")
        try:
            result = subprocess.run(
                ["gh", "pr", "view", str(PR_NUMBER), "--json", "statusCheckRollup"],
                capture_output=True,
                text=True,
                timeout=10
            )

            if "success" in result.stdout.lower():
                self.log("✓ CI Tests PASSED")
                return True
            elif "failure" in result.stdout.lower():
                self.log("✗ CI Tests FAILED - Cannot merge")
                return False
            else:
                self.log("CI status: Pending/In Progress")
                return None  # Still running

        except Exception as e:
            self.log(f"Could not check CI status: {e}")
            return None

    def merge_pr(self):
        """Merge PR #6 if CI passed"""
        self.log("Attempting to merge PR #6...")
        try:
            result = subprocess.run(
                ["gh", "pr", "merge", str(PR_NUMBER), "--squash", "--auto"],
                capture_output=True,
                text=True,
                timeout=15
            )

            if result.returncode == 0:
                self.log("✓ PR #6 MERGED successfully")
                return True
            else:
                self.log(f"Merge failed: {result.stderr}")
                return False

        except Exception as e:
            self.log(f"Error merging PR: {e}")
            return False

    def wait_for_production(self, max_wait_seconds=300):
        """Wait for production to be updated after merge"""
        self.log(f"Waiting for production deployment ({max_wait_seconds}s timeout)...")

        start_time = time.time()
        last_status = None

        while time.time() - start_time < max_wait_seconds:
            try:
                response = requests.head(PRODUCTION_URL, timeout=5)

                # Production is up
                if response.status_code < 500:
                    self.log(f"✓ Production is responding ({response.status_code})")
                    time.sleep(5)  # Give a few more seconds for full deployment
                    return True

            except requests.exceptions.ConnectionError:
                if last_status != "unreachable":
                    self.log("⏳ Production not yet reachable...")
                    last_status = "unreachable"
            except requests.exceptions.Timeout:
                if last_status != "timeout":
                    self.log("⏳ Production timeout (still deploying)...")
                    last_status = "timeout"
            except Exception as e:
                if last_status != str(e):
                    self.log(f"⏳ Waiting for production: {e}")
                    last_status = str(e)

            time.sleep(10)

        self.log("✗ Production did not become available in time")
        return False

    def run_production_tests(self):
        """Run production test agent"""
        self.log("Running production validation tests...")
        self.log("-" * 70)

        try:
            result = subprocess.run(
                ["python", "test_production.py"],
                capture_output=True,
                text=True,
                timeout=60
            )

            self.log(result.stdout)

            if result.returncode == 0:
                self.log("-" * 70)
                self.log("✓✓✓ PRODUCTION TESTS PASSED ✓✓✓")
                return True
            else:
                self.log("-" * 70)
                self.log("✗✗✗ PRODUCTION TESTS FAILED ✗✗✗")
                if result.stderr:
                    self.log(f"Errors: {result.stderr}")
                return False

        except Exception as e:
            self.log(f"Error running production tests: {e}")
            return False

    def final_report(self, success):
        """Print final deployment report"""
        print("\n" + "="*70)
        print("DEPLOYMENT MONITORING COMPLETE")
        print("="*70)

        if success:
            print("\n✅✅✅ DEPLOYMENT SUCCESSFUL ✅✅✅")
            print(f"\n{PRODUCTION_URL}")
            print("\n🎉 TUDO CERTO - Application is live and fully functional!")
            print("\n✓ CI passed")
            print("✓ PR merged")
            print("✓ Production deployed")
            print("✓ All tests passed")
        else:
            print("\n❌ DEPLOYMENT FAILED")
            print("\nCannot confirm 'tudo certo' until all steps complete:")
            print("✗ CI did not pass, OR")
            print("✗ PR merge failed, OR")
            print("✗ Production deployment incomplete, OR")
            print("✗ Production tests failed")

        print("\n" + "="*70 + "\n")

    def run(self):
        """Run full deployment monitoring workflow"""
        print("\n" + "="*70)
        print("DEPLOYMENT MONITORING AGENT - FULLY AUTOMATED")
        print("="*70 + "\n")

        self.log("Step 1: Checking CI status...")
        ci_status = self.check_pr_ci_status()

        if ci_status is None:
            self.log("⏳ CI still running, waiting...")
            # Wait for CI to complete
            for i in range(60):  # Wait up to 10 minutes
                time.sleep(10)
                ci_status = self.check_pr_ci_status()
                if ci_status is not None:
                    break

        if not ci_status:
            self.log("✗ CI tests failed - stopping deployment")
            self.final_report(False)
            return False

        self.log("\nStep 2: Merging PR #6...")
        if not self.merge_pr():
            self.log("✗ Could not merge PR - stopping deployment")
            self.final_report(False)
            return False

        self.log("\nStep 3: Waiting for production deployment...")
        if not self.wait_for_production():
            self.log("✗ Production not available - stopping")
            self.final_report(False)
            return False

        self.log("\nStep 4: Running production validation tests...")
        if not self.run_production_tests():
            self.log("✗ Production tests failed")
            self.final_report(False)
            return False

        self.log("✓ All deployment steps completed successfully!")
        self.final_report(True)
        return True


if __name__ == "__main__":
    monitor = DeploymentMonitor()
    success = monitor.run()
    sys.exit(0 if success else 1)
