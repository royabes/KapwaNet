"""
KapwaNet Prompt Loading Utilities
=================================

Functions for loading prompt templates from the app's prompts directory.
"""

from pathlib import Path


def load_prompt(project_dir: Path, name: str) -> str:
    """
    Load a prompt template from the harness prompts directory.

    Args:
        project_dir: The app's project directory
        name: Name of the prompt (without .md extension)

    Returns:
        The prompt content as a string
    """
    # Look in harness/prompts/ directory
    prompt_path = project_dir / "harness" / "prompts" / f"{name}.md"

    if not prompt_path.exists():
        raise FileNotFoundError(f"Prompt file not found: {prompt_path}")

    return prompt_path.read_text()
