"""
KapwaNet Agent Session Logic
============================

Core agent interaction functions for running autonomous coding sessions.
Uses Claude Agent SDK for real-time tool use output.
"""

import asyncio
import sys
from pathlib import Path
from typing import Optional
from datetime import datetime

from claude_code_sdk import ClaudeSDKClient

from client import create_client
from progress import (
    print_session_header,
    print_progress_summary,
    print_session_history,
    record_session_start,
    record_session_end,
    count_passing_features,
)
from prompts import load_prompt


# Configuration
AUTO_CONTINUE_DELAY_SECONDS = 3


class TeeOutput:
    """Write to both stdout and a log file."""

    def __init__(self, log_file: Path):
        self.terminal = sys.stdout
        self.log_file = open(log_file, "a", encoding="utf-8")

    def write(self, message):
        self.terminal.write(message)
        self.log_file.write(message)
        self.log_file.flush()

    def flush(self):
        self.terminal.flush()
        self.log_file.flush()

    def close(self):
        self.log_file.close()


async def run_agent_session(
    client: ClaudeSDKClient,
    message: str,
    project_dir: Path,
    phase: str,
    session_num: int,
) -> tuple[str, str]:
    """
    Run a single agent session using Claude Agent SDK.

    Args:
        client: Claude SDK client
        message: The prompt to send
        project_dir: Project directory path
        phase: Current sprint number
        session_num: Session number

    Returns:
        (status, response_text) where status is:
        - "continue" if agent should continue working
        - "error" if an error occurred
    """
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Sending prompt to Claude Agent SDK...\n")

    try:
        # Send the query
        await client.query(message)

        # Collect response text and show tool use
        response_text = ""
        tool_count = 0
        feature_marks = 0

        async for msg in client.receive_response():
            msg_type = type(msg).__name__

            # Handle AssistantMessage (text and tool use)
            if msg_type == "AssistantMessage" and hasattr(msg, "content"):
                for block in msg.content:
                    block_type = type(block).__name__

                    if block_type == "TextBlock" and hasattr(block, "text"):
                        response_text += block.text
                        # Only print short excerpts to avoid noise
                        text = block.text.strip()
                        if len(text) > 200:
                            print(f"  {text[:200]}...", flush=True)
                        elif text:
                            print(f"  {text}", flush=True)

                    elif block_type == "ToolUseBlock" and hasattr(block, "name"):
                        tool_count += 1
                        tool_name = block.name
                        timestamp = datetime.now().strftime('%H:%M:%S')
                        print(f"[{timestamp}] [Tool: {tool_name}]", flush=True)

                        # Show relevant input for debugging
                        if hasattr(block, "input"):
                            input_data = block.input
                            if isinstance(input_data, dict):
                                # Show file paths
                                if "file_path" in input_data:
                                    print(f"   File: {input_data['file_path']}", flush=True)
                                # Show commands (truncated)
                                elif "command" in input_data:
                                    cmd = input_data["command"]
                                    if len(cmd) > 100:
                                        cmd = cmd[:100] + "..."
                                    print(f"   Command: {cmd}", flush=True)
                                # Show patterns
                                elif "pattern" in input_data:
                                    print(f"   Pattern: {input_data['pattern']}", flush=True)

            # Handle UserMessage (tool results)
            elif msg_type == "UserMessage" and hasattr(msg, "content"):
                for block in msg.content:
                    block_type = type(block).__name__

                    if block_type == "ToolResultBlock":
                        result_content = getattr(block, "content", "")
                        is_error = getattr(block, "is_error", False)

                        # Check for blocked commands
                        if "blocked" in str(result_content).lower():
                            print(f"   [BLOCKED] {result_content}", flush=True)
                        elif is_error:
                            error_str = str(result_content)[:200]
                            print(f"   [Error] {error_str}", flush=True)
                        else:
                            # Check for feature marking
                            result_str = str(result_content)
                            if '"passes": true' in result_str or "'passes': true" in result_str.lower():
                                feature_marks += 1
                                print(f"   [FEATURE PASS] Feature marked as passing!", flush=True)
                            elif "pytest" in result_str.lower() or "passed" in result_str.lower():
                                print(f"   [TEST] Tests executed", flush=True)
                            else:
                                print("   [Done]", flush=True)

        print("\n" + "-" * 70)
        print(f"Session summary: {tool_count} tool calls, {feature_marks} features marked")
        print("-" * 70 + "\n")

        return "continue", response_text

    except Exception as e:
        print(f"Error during agent session: {e}")
        return "error", str(e)


async def run_autonomous_agent(
    project_dir: Path,
    model: str,
    phase: str,
    app_name: str,
    max_iterations: Optional[int] = None,
) -> None:
    """
    Run the autonomous agent loop using Claude SDK.

    Args:
        project_dir: Directory for the app
        model: Claude model to use
        phase: Sprint number (0, 1, 2)
        app_name: Name of the app being built
        max_iterations: Maximum number of iterations (None for unlimited)
    """
    # Ensure .claude directory exists and set up logging
    claude_dir = project_dir / ".claude"
    claude_dir.mkdir(parents=True, exist_ok=True)
    log_file = claude_dir / f"sprint{phase}_sdk_output.log"

    # Tee output to both terminal and log file
    tee = TeeOutput(log_file)
    original_stdout = sys.stdout
    sys.stdout = tee

    print("\n" + "=" * 70)
    print(f"  {app_name.upper()} - SDK HARNESS")
    print("=" * 70)
    print(f"\nProject directory: {project_dir}")
    print(f"Model: {model}")
    print(f"Sprint: {phase}")
    print(f"Log file: {log_file}")
    if max_iterations:
        print(f"Max iterations: {max_iterations}")
    else:
        print("Max iterations: Unlimited (will run until completion)")
    print()

    # Ensure project directory exists
    project_dir.mkdir(parents=True, exist_ok=True)

    # Check if feature list exists
    feature_file = project_dir / ".claude" / f"sprint{phase}_feature_list.json"
    is_first_run = not feature_file.exists()

    if is_first_run:
        print(f"Fresh start - Sprint {phase} feature list not found")
        print("The agent will need to use the existing feature list or create one")
    else:
        print_session_history(project_dir, phase)
        print_progress_summary(project_dir, phase)

    # Main loop
    iteration = 0

    while True:
        iteration += 1

        # Check max iterations
        if max_iterations and iteration > max_iterations:
            print(f"\nReached max iterations ({max_iterations})")
            print("To continue, run the script again without --max-iterations")
            break

        # Record session start
        session_num = record_session_start(project_dir, phase)

        # Print session header
        print_session_header(session_num, phase, app_name, is_initializer=is_first_run)

        # Create client (fresh context)
        client = create_client(project_dir, model, phase, app_name)

        # Load prompt
        prompt = load_prompt(project_dir, f"sprint{phase}_coding")

        # Run session with async context manager
        async with client:
            status, response = await run_agent_session(
                client, prompt, project_dir, phase, session_num
            )

        # Record session end
        record_session_end(project_dir, phase, session_num)

        # After first run, switch to regular coding mode
        is_first_run = False

        # Check if sprint is complete (100%)
        passing, total = count_passing_features(project_dir, phase)
        if total > 0 and passing == total:
            print(f"\n{'=' * 70}")
            print(f"  SPRINT {phase} COMPLETE! ({passing}/{total} features)")
            print(f"{'=' * 70}")
            print("\nAll features passing. Stopping harness.")
            print("To start the next sprint, run: python run_harness.py --sprint <next>")
            break

        # Handle status
        if status == "continue":
            print(f"\nAgent will auto-continue in {AUTO_CONTINUE_DELAY_SECONDS}s...")
            print_progress_summary(project_dir, phase)
            await asyncio.sleep(AUTO_CONTINUE_DELAY_SECONDS)

        elif status == "error":
            print("\nSession encountered an error")
            print("Will retry with a fresh session...")
            await asyncio.sleep(AUTO_CONTINUE_DELAY_SECONDS)

        # Small delay between sessions
        if max_iterations is None or iteration < max_iterations:
            print("\nPreparing next session...\n")
            await asyncio.sleep(1)

    # Final summary
    print("\n" + "=" * 70)
    print("  SESSION COMPLETE")
    print("=" * 70)
    print(f"\nProject directory: {project_dir}")
    print_progress_summary(project_dir, phase)
    print_session_history(project_dir, phase)

    print("\nDone!")

    # Restore stdout and close log file
    sys.stdout = original_stdout
    tee.close()
    print(f"\nLog saved to: {log_file}")
