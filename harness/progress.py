"""
KapwaNet Progress Tracking Utilities
====================================

Functions for tracking and displaying progress of the autonomous coding agent.
"""

import json
from pathlib import Path
from datetime import datetime


def count_passing_features(project_dir: Path, phase: str) -> tuple[int, int]:
    """
    Count passing and total features in sprint feature list.

    Args:
        project_dir: Directory containing .claude folder
        phase: Sprint number (0, 1, 2)

    Returns:
        (passing_count, total_count)
    """
    feature_file = project_dir / ".claude" / f"sprint{phase}_feature_list.json"

    if not feature_file.exists():
        return 0, 0

    try:
        with open(feature_file, "r") as f:
            data = json.load(f)

        features = data.get("features", [])
        total = len(features)
        passing = sum(1 for f in features if f.get("passes", False) is True)

        return passing, total
    except (json.JSONDecodeError, IOError):
        return 0, 0


def get_session_history(project_dir: Path, phase: str) -> list[dict]:
    """
    Get session history for a sprint.

    Returns list of dicts with:
        - session_num
        - start_features
        - end_features
        - features_completed
        - timestamp
    """
    history_file = project_dir / ".claude" / f"sprint{phase}_history.json"

    if not history_file.exists():
        return []

    try:
        with open(history_file, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def save_session_history(project_dir: Path, phase: str, history: list[dict]) -> None:
    """Save session history for a sprint."""
    history_file = project_dir / ".claude" / f"sprint{phase}_history.json"
    history_file.parent.mkdir(parents=True, exist_ok=True)

    with open(history_file, "w") as f:
        json.dump(history, f, indent=2)


def record_session_start(project_dir: Path, phase: str) -> int:
    """
    Record the start of a new session.

    Returns the session number.
    """
    history = get_session_history(project_dir, phase)
    passing, total = count_passing_features(project_dir, phase)

    session_num = len(history) + 1
    history.append({
        "session_num": session_num,
        "start_features": passing,
        "end_features": passing,
        "features_completed": 0,
        "timestamp": datetime.now().isoformat(),
        "status": "in_progress"
    })

    save_session_history(project_dir, phase, history)
    return session_num


def record_session_end(project_dir: Path, phase: str, session_num: int) -> None:
    """Record the end of a session with final feature count."""
    history = get_session_history(project_dir, phase)
    passing, total = count_passing_features(project_dir, phase)

    for session in history:
        if session["session_num"] == session_num:
            session["end_features"] = passing
            session["features_completed"] = passing - session["start_features"]
            session["status"] = "completed"
            break

    save_session_history(project_dir, phase, history)


def print_session_header(session_num: int, phase: str, app_name: str, is_initializer: bool = False) -> None:
    """Print a formatted header for the session."""
    session_type = "INITIALIZER" if is_initializer else "CODING AGENT"

    print("\n" + "=" * 70)
    print(f"  {app_name.upper()} - SPRINT {phase} - SESSION {session_num}: {session_type}")
    print("=" * 70)
    print()


def print_progress_bar(passing: int, total: int, width: int = 30) -> str:
    """Create a progress bar string."""
    if total == 0:
        return "[" + "-" * width + "]"

    filled = int(width * passing / total)
    empty = width - filled
    return "[" + "#" * filled + "-" * empty + "]"


def print_progress_summary(project_dir: Path, phase: str) -> None:
    """Print a summary of current progress."""
    passing, total = count_passing_features(project_dir, phase)

    print("\n" + "-" * 40)
    if total > 0:
        percentage = (passing / total) * 100
        bar = print_progress_bar(passing, total)
        print(f"  Sprint {phase} Progress: {passing}/{total} features ({percentage:.1f}%)")
        print(f"  Remaining: {total - passing}")
        print(f"  {bar}")
    else:
        print(f"  Sprint {phase}: feature_list.json not yet created")
    print("-" * 40)


def print_session_history(project_dir: Path, phase: str, max_sessions: int = 10) -> None:
    """Print recent session history."""
    history = get_session_history(project_dir, phase)

    if not history:
        print("  No session history yet")
        return

    print("\n" + "=" * 60)
    print(f"  SESSION HISTORY - Sprint {phase}")
    print("=" * 60)

    # Show last N sessions
    recent = history[-max_sessions:]
    for session in recent:
        num = session["session_num"]
        start = session["start_features"]
        end = session["end_features"]
        completed = session["features_completed"]
        status = session.get("status", "unknown")

        icon = "[OK]" if status == "completed" else "[..]"
        print(f"  {icon} Session {num}: {start} -> {end} (+{completed})")

    print("=" * 60)
