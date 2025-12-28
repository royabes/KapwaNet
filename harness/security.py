"""
KapwaNet Security Hooks
=======================

Pre-tool-use hooks that validate bash commands for security.
Uses an allowlist approach - only explicitly permitted commands can run.
"""

import os
import shlex


# Allowed commands for KapwaNet development
ALLOWED_COMMANDS = {
    # File inspection
    "ls",
    "cat",
    "head",
    "tail",
    "wc",
    "grep",
    "find",
    # Output (for debugging)
    "echo",
    "printf",
    "true",
    # Utilities
    "which",
    "wget",
    "curl",
    "tar",
    "unzip",
    # File operations
    "cp",
    "mkdir",
    "chmod",
    "rm",
    "mv",
    "touch",
    # Directory
    "pwd",
    "cd",
    # Python development
    "python",
    "python3",
    "pip",
    "pip3",
    # Node.js development
    "node",
    "npm",
    "npx",
    "yarn",
    # Version control
    "git",
    # Docker
    "docker",
    "docker-compose",
    # Process management
    "ps",
    "lsof",
    "sleep",
    "pkill",
    "kill",
    # Script execution
    "bash",
    "sh",
    "source",
    # Environment
    "env",
    "export",
    # Django/Python tools
    "manage.py",
    "django-admin",
    "pytest",
    # JSON/YAML parsing
    "jq",
    "yq",
}

# Commands that need additional validation
COMMANDS_NEEDING_EXTRA_VALIDATION = {"pkill", "chmod", "rm", "kill"}


def extract_commands(command_string: str) -> list[str]:
    """
    Extract command names from a shell command string.

    Handles pipes, command chaining (&&, ||, ;), and subshells.
    Returns the base command names (without paths).
    """
    commands = []
    import re

    # First, split by && and || to handle chained commands
    segments = re.split(r'\s*(?:&&|\|\|)\s*', command_string)

    for segment in segments:
        segment = segment.strip()
        if not segment:
            continue

        # For complex commands with quotes, try to extract just the first word
        try:
            tokens = shlex.split(segment)
        except ValueError:
            # If shlex fails, fall back to simple split on first whitespace
            first_word = segment.split()[0] if segment.split() else None
            if first_word:
                cmd = os.path.basename(first_word)
                commands.append(cmd)
            continue

        if not tokens:
            continue

        # Track when we expect a command vs arguments
        expect_command = True

        for token in tokens:
            # Shell operators indicate a new command follows
            if token in ("|", "||", "&&", "&", ";"):
                expect_command = True
                continue

            # Skip shell keywords
            if token in ("if", "then", "else", "elif", "fi", "for", "while",
                        "until", "do", "done", "case", "esac", "in", "!", "{", "}"):
                continue

            # Skip flags/options
            if token.startswith("-"):
                continue

            # Skip variable assignments
            if "=" in token and not token.startswith("="):
                continue

            if expect_command:
                # Extract the base command name
                cmd = os.path.basename(token)
                commands.append(cmd)
                expect_command = False

    return commands


def validate_rm_command(command_string: str) -> tuple[bool, str]:
    """Validate rm commands - prevent destructive operations."""
    try:
        tokens = shlex.split(command_string)
    except ValueError:
        return False, "Could not parse rm command"

    # Block recursive force delete of important paths
    if "-rf" in tokens or "-fr" in tokens:
        for token in tokens:
            if token in ("/", "~", "$HOME", "/home", "/etc", "/var"):
                return False, f"Dangerous rm target: {token}"

    return True, ""


def validate_pkill_command(command_string: str) -> tuple[bool, str]:
    """Validate pkill commands - only allow killing dev-related processes."""
    allowed_process_names = {
        "python", "python3", "pytest",
        "node", "npm", "npx",
        "docker", "postgres", "redis",
        "uvicorn", "gunicorn",
        "next", "webpack",
    }

    try:
        tokens = shlex.split(command_string)
    except ValueError:
        return False, "Could not parse pkill command"

    if not tokens:
        return False, "Empty pkill command"

    # Get non-flag arguments
    args = [t for t in tokens[1:] if not t.startswith("-")]

    if not args:
        return False, "pkill requires a process name"

    target = args[-1]
    if " " in target:
        target = target.split()[0]

    if target in allowed_process_names:
        return True, ""
    return False, f"pkill only allowed for dev processes: {allowed_process_names}"


async def bash_security_hook(input_data, tool_use_id=None, context=None):
    """
    Pre-tool-use hook that validates bash commands using an allowlist.

    Returns:
        Empty dict to allow, or {"decision": "block", "reason": "..."} to block
    """
    if input_data.get("tool_name") != "Bash":
        return {}

    command = input_data.get("tool_input", {}).get("command", "")
    if not command:
        return {}

    # Extract all commands from the command string
    commands = extract_commands(command)

    if not commands:
        return {
            "decision": "block",
            "reason": f"Could not parse command for security validation: {command}",
        }

    # Check each command against the allowlist
    for cmd in commands:
        if cmd not in ALLOWED_COMMANDS:
            return {
                "decision": "block",
                "reason": f"Command '{cmd}' is not in the allowed commands list",
            }

        # Additional validation for sensitive commands
        if cmd in COMMANDS_NEEDING_EXTRA_VALIDATION:
            if cmd == "pkill" or cmd == "kill":
                allowed, reason = validate_pkill_command(command)
                if not allowed:
                    return {"decision": "block", "reason": reason}
            elif cmd == "rm":
                allowed, reason = validate_rm_command(command)
                if not allowed:
                    return {"decision": "block", "reason": reason}

    return {}
