#!/usr/bin/env python3
"""
KapwaNet Autonomous Harness Runner
==================================

Autonomous coding harness for KapwaNet using Claude Agent SDK.
Implements features across sprints with real-time tool use output and regression testing.

Usage:
    # Run Sprint 0 (Foundation & Repo Setup)
    python run_harness.py --sprint 0

    # Run Sprint 1 (Styling Engine & Templates)
    python run_harness.py --sprint 1

    # Run with iteration limit (testing)
    python run_harness.py --sprint 0 --max-iterations 3
"""

import argparse
import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from agent import run_autonomous_agent


# KapwaNet project root (harness is inside the project)
KAPWANET_ROOT = Path(__file__).parent.parent

# Model shortcuts
MODELS = {
    "sonnet": "claude-sonnet-4-20250514",     # Fast, cost-effective (Sonnet 4)
    "opus": "claude-opus-4-5-20251101",       # Most capable - RECOMMENDED (Opus 4.5)
    "haiku": "claude-3-5-haiku-20241022",     # Fastest, cheapest
}
DEFAULT_MODEL = "opus"


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="KapwaNet Autonomous Harness - Community Platform Builder",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run Sprint 0 (Foundation & Repo Setup)
  python run_harness.py --sprint 0

  # Run Sprint 1 (Styling Engine & Templates)
  python run_harness.py --sprint 1

  # Run Sprint 0 with Sonnet (faster, cheaper)
  python run_harness.py --sprint 0 --model sonnet

  # Limit iterations for testing
  python run_harness.py --sprint 0 --max-iterations 5

Sprints:
  Sprint 0 - Foundation & Repo Setup
    Monorepo structure, Docker Compose, backend/frontend skeletons
    Success: docker compose up brings all services up cleanly

  Sprint 1 - Styling Engine & Templates (Key Differentiator)
    Organization model, theme tokens, block renderer, template library
    Success: Changing theme JSON changes site colors/fonts

  Sprint 2 - Core Community Features
    Membership & roles, Bayanihan help, item sharing, messaging, moderation
    Success: Full bayanihan flow works end-to-end

Model Comparison:
  opus    - Most capable, best for complex coding (RECOMMENDED)
  sonnet  - Fast, cost-effective, excellent for coding
  haiku   - Fastest, cheapest, less capable

Authentication:
  Uses Claude CLI authentication (Anthropic Max or ANTHROPIC_API_KEY env var)

Tech Stack:
  - Next.js (React frontend)
  - Django + Wagtail (backend CMS)
  - PostgreSQL (database)
  - Docker Compose (deployment)
        """,
    )

    parser.add_argument(
        "--sprint",
        type=int,
        required=True,
        choices=[0, 1, 2],
        help="Sprint to work on: 0, 1, or 2",
    )

    parser.add_argument(
        "--max-iterations",
        type=int,
        default=None,
        help="Maximum number of agent iterations (default: unlimited)",
    )

    parser.add_argument(
        "--model",
        type=str,
        default=DEFAULT_MODEL,
        choices=list(MODELS.keys()) + list(MODELS.values()),
        help=f"Model: opus (powerful), sonnet (fast), haiku (fastest). Default: {DEFAULT_MODEL}",
    )

    return parser.parse_args()


def resolve_model(model_arg: str) -> str:
    """Resolve model shortcut to full model ID."""
    return MODELS.get(model_arg, model_arg)


def check_sdk_installed() -> bool:
    """Check if claude-code-sdk is installed."""
    try:
        import claude_code_sdk
        return True
    except ImportError:
        return False


def check_python_version() -> bool:
    """Check if Python 3.10+ is available."""
    import sys
    return sys.version_info >= (3, 10)


def check_docker_installed() -> bool:
    """Check if Docker is available."""
    import subprocess
    try:
        result = subprocess.run(
            ["docker", "--version"],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def check_node_installed() -> bool:
    """Check if Node.js is available."""
    import subprocess
    try:
        result = subprocess.run(
            ["node", "--version"],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def main() -> None:
    """Main entry point."""
    args = parse_args()

    print("\n" + "=" * 70)
    print("  KAPWANET - Community Platform Builder")
    print("  Autonomous Harness powered by Claude Agent SDK")
    print("=" * 70)

    # Check for SDK
    if not check_sdk_installed():
        print("\n[X] Error: claude-code-sdk is not installed")
        print("\nInstall it with:")
        print("  cd /home/orion/Projects/KapwaNet/harness")
        print("  python -m venv venv")
        print("  source venv/bin/activate")
        print("  pip install -r requirements.txt")
        return

    # Check Python version
    if not check_python_version():
        print("\n[X] Error: Python 3.10+ is required")
        return

    # Check for Docker
    if not check_docker_installed():
        print("\n[!] Warning: Docker not found in PATH")
        print("  The agent will need to work on Docker installation")
        print("\nTo install Docker on Ubuntu:")
        print("  sudo apt-get install docker.io docker-compose")
        print()

    # Check for Node.js
    if not check_node_installed():
        print("\n[!] Warning: Node.js not found in PATH")
        print("  The agent will need to work on Node.js installation")
        print("\nTo install Node.js on Ubuntu:")
        print("  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -")
        print("  sudo apt-get install -y nodejs")
        print()

    sprint = args.sprint

    # Resolve model shortcut
    model = resolve_model(args.model)

    print(f"\nProject: KapwaNet")
    print(f"Project Directory: {KAPWANET_ROOT}")
    print(f"Sprint: {sprint}")
    print(f"Model: {model}")
    if args.max_iterations:
        print(f"Max Iterations: {args.max_iterations}")
    else:
        print("Max Iterations: Unlimited (will run until completion)")
    print()

    # Run the agent
    try:
        asyncio.run(
            run_autonomous_agent(
                project_dir=KAPWANET_ROOT,
                model=model,
                phase=str(sprint),
                app_name="kapwanet",
                max_iterations=args.max_iterations,
            )
        )
    except KeyboardInterrupt:
        print("\n\n[!] Interrupted by user")
        print("To resume, run the same command again")
        print(f"Progress is saved in .claude/sprint{sprint}_feature_list.json")
    except Exception as e:
        print(f"\n[X] Fatal error: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    main()
