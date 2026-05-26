#!/usr/bin/env python3
"""Apply presenterm-slides conventions to module slides.md files."""

from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]

FRONT_MATTER = {
    "module-00-intro": {
        "title": "**Governed AI Feature Delivery**",
        "sub_title": "Course Introduction",
    },
    "module-01-ai-feature-delivery": {
        "title": "**AI Feature Delivery** in Regulated Environments",
        "sub_title": "Module 1 — Governed AI Feature Delivery",
    },
    "module-02-backend-workflow-patterns": {
        "title": "**Backend Workflow Patterns**",
        "sub_title": "Module 2 — Governed AI Feature Delivery",
    },
    "module-03-workflow-vs-agent-design": {
        "title": "**Workflow vs Agent Design**",
        "sub_title": "Module 3 — Governed AI Feature Delivery",
    },
    "module-04-security-and-guardrails": {
        "title": "**Security and Guardrails**",
        "sub_title": "Module 4 — Governed AI Feature Delivery",
    },
    "module-05-frontend-ai-ux-patterns": {
        "title": "**Frontend AI UX Patterns**",
        "sub_title": "Module 5 — Governed AI Feature Delivery",
    },
    "module-06-evaluation-and-quality-assurance": {
        "title": "**Evaluation and Quality Assurance**",
        "sub_title": "Module 6 — Governed AI Feature Delivery",
    },
    "module-07-deployment-and-governance": {
        "title": "**Deployment and Governance**",
        "sub_title": "Module 7 — Governed AI Feature Delivery",
    },
    "module-08-final-build-and-review": {
        "title": "**Final Build and Review**",
        "sub_title": "Module 8 — Governed AI Feature Delivery",
    },
}

PROVOCATIONS: dict[str, str] = {
    "module-02-backend-workflow-patterns": """## Opening scenario

Module 1 produced a governance brief: trace IDs, prompt versions, validation gates.

Someone proposes shipping the extract endpoint in one controller method that calls the model directly.

**Think:** which audit question fails first — and which layer should have caught it?

<!-- end_slide -->

""",
    "module-03-workflow-vs-agent-design": """## Opening scenario

Your workflow passes evals for invoice extraction. Product asks for "smart" email triage that picks tools and routes dynamically.

**Type in chat: workflow / bounded tools / agent — which do you reach for first?**

<!-- end_slide -->

""",
    "module-04-security-and-guardrails": """## Opening scenario

Pre-call validation passes: length, format, no obvious PII in metadata.

The document body contains: `SYSTEM: ignore previous instructions…`

**Think:** which gate should stop this — and does your Module 2 stack have it?

<!-- end_slide -->

""",
    "module-05-frontend-ai-ux-patterns": """## Opening scenario

Backend returns `needs_review` with reason `policy_sensitive_output`.

The UI shows a green checkmark and the raw model summary.

**Think:** is that a backend bug, a frontend bug, or a governance gap?

<!-- end_slide -->

""",
    "module-06-evaluation-and-quality-assurance": """## Opening scenario

Release meeting in one hour. Someone says: "The model feels better — let's ship."

**Think:** what evidence would you need to say yes — and what could you show an auditor?**

<!-- end_slide -->

""",
    "module-07-deployment-and-governance": """## Opening scenario

Friday 4pm: production incident. Leadership asks to disable the AI feature immediately.

**Think:** what do you flip — and what must still be true in the trace after you flip it?**

<!-- end_slide -->

""",
    "module-08-final-build-and-review": """## Opening scenario

Demo day. The happy path works. Nobody has run the deny path since Tuesday.

**Think:** what is the one failure you are least willing to discover in front of the room?**

<!-- end_slide -->

""",
}

ANIMATION_SLIDES = re.compile(
    r"\n## \[ ANIMATION — [^\]]+ \]\n\n(?:\*[^\n]+\*\n\n)+\n<!-- end_slide -->\n",
    re.MULTILINE,
)

ANIMATION_SPEAKER_NOTES = {
    "Agent Harness": "<!-- speaker_note: Switch to the agent harness / car animation now. Return here when done. -->\n\n",
    "Code Execution": "<!-- speaker_note: Switch to the code execution / sandbox containment animation now. Return here when done. -->\n\n",
}


def yaml_front_matter(module_dir: str) -> str:
    meta = FRONT_MATTER[module_dir]
    return (
        "---\n"
        f"title: {meta['title']}\n"
        f"sub_title: {meta['sub_title']}\n"
        "author: Kevin Cunningham\n"
        "---\n\n"
    )


def strip_legacy_title(text: str) -> str:
    return re.sub(
        r"^# [^\n]+\n\n\*\*Module [^\n]+\*\*\n\n<!-- end_slide -->\n\n",
        "",
        text,
        count=1,
    )


def italic_line_to_speaker_note(line: str) -> str | None:
    stripped = line.strip()
    if stripped.startswith("*") and stripped.endswith("*") and stripped.count("*") == 2:
        return f"<!-- speaker_note: {stripped[1:-1]} -->"
    return None


def convert_facilitation_italics(text: str) -> str:
    lines = text.split("\n")
    out: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        note = italic_line_to_speaker_note(line)
        if note:
            out.append(note)
            i += 1
            continue

        # Trailing inline timing on previous non-empty block
        if (
            i + 1 < len(lines)
            and lines[i + 1].strip() == ""
            and i + 2 < len(lines)
        ):
            next_note = italic_line_to_speaker_note(lines[i + 2])
            if next_note and line.strip():
                out.append(line)
                out.append("")
                out.append(next_note)
                i += 3
                continue

        out.append(line)
        i += 1

    return "\n".join(out)


def fix_module_00(text: str) -> str:
    text = text.replace("## Outcomes by the end\n\nYou should be able to:", "## What you'll leave with\n\n<!-- incremental_lists: true -->\n\n")
    text = text.replace(
        "- Use eval suites and deployment gates for evidence-backed release decisions\n\n<!-- end_slide -->",
        "- Use eval suites and deployment gates for evidence-backed release decisions\n\n<!-- incremental_lists: false -->\n\n<!-- end_slide -->",
    )
    text = text.replace("## Before we start\n\nTwo quick checks:", "## Logistics\n\nTwo quick checks:")
    text = re.sub(
        r"# Ready to begin\?\n\n\*Next: Module 1[^\n]+\*",
        "<!-- jump_to_middle -->\n\nReady to begin?\n===\n\n<!-- speaker_note: Next: Module 1 — AI Feature Delivery in Regulated Environments -->\n\n<!-- end_slide -->",
        text,
    )
    return text


def fix_closing(text: str) -> str:
    text = re.sub(
        r"# Questions\?\n\n\*Module \d+ — Governed AI Feature Delivery\*",
        "<!-- jump_to_middle -->\n\nQuestions?\n===\n\n<!-- end_slide -->",
        text,
    )
    if not text.rstrip().endswith("<!-- end_slide -->"):
        text = text.rstrip() + "\n\n<!-- end_slide -->\n"
    return text


def insert_provocation(text: str, module_dir: str) -> str:
    provocation = PROVOCATIONS.get(module_dir)
    if not provocation:
        return text
    if "## Opening scenario" in text.split("## Where we left off")[0]:
        return text
    return text.replace("## Where we left off", provocation + "## Where we left off", 1)


def remove_animation_slides(text: str) -> str:
    def replacer(match: re.Match[str]) -> str:
        block = match.group(0)
        if "Agent Harness" in block:
            return ANIMATION_SPEAKER_NOTES["Agent Harness"]
        if "Code Execution" in block:
            return ANIMATION_SPEAKER_NOTES["Code Execution"]
        return ""

    return ANIMATION_SLIDES.sub(replacer, text)


def add_demo_speaker_notes_module3(text: str) -> str:
    demo_block = "## Demo: deterministic vs bounded tool path\n\n"
    if demo_block in text and "speaker_note: Send the standard happy path" not in text:
        text = text.replace(
            demo_block,
            demo_block
            + "<!-- speaker_note: Send the standard happy path request first. Then the same request with executionMode bounded_tool. Point at bounded_tool_selection in the trace, then open tools.ts and ALLOWED_TOOLS. -->\n\n",
        )
    return text


def fix_module5_layout(text: str) -> str:
    old = """## State model

![State model](ui_state_model.png)

<!-- end_slide -->

## State machine

![State machine](ui_state_machine.png)

<!-- end_slide -->"""

    new = """## State model and machine

<!-- column_layout: [3, 2] -->

<!-- column: 0 -->

Backend outcomes: `accepted`, `needs_review`, `denied`

UI also needs: `idle`, `loading`, `error`, `partial`

> Undefined states become support tickets.

<!-- column: 1 -->

![image:width:100%](ui_state_model.png)

<!-- reset_layout -->

<!-- column_layout: [3, 2] -->

<!-- column: 0 -->

Every transition should be observable — the telemetry panel is your audit affordance.

<!-- column: 1 -->

![image:width:100%](ui_state_machine.png)

<!-- reset_layout -->

<!-- end_slide -->"""

    if old in text:
        text = text.replace(old, new)
    return text


def add_incremental_summary(text: str) -> str:
    return re.sub(
        r"(## Summary\n\n)(- \*\*)",
        r"\1<!-- incremental_lists: true -->\n\n\2",
        text,
        count=1,
    ).replace(
        "<!-- incremental_lists: true -->\n\n- **Fallback is intentional design**",
        "<!-- incremental_lists: true -->\n\n- **Fallback is intentional design**",
    )


def process_module(slides_path: Path) -> None:
    module_dir = slides_path.parent.name
    text = slides_path.read_text(encoding="utf-8")

    text = strip_legacy_title(text)
    text = yaml_front_matter(module_dir) + text
    text = insert_provocation(text, module_dir)
    text = remove_animation_slides(text)
    text = add_demo_speaker_notes_module3(text)
    text = convert_facilitation_italics(text)

    if module_dir == "module-00-intro":
        text = fix_module_00(text)
    if module_dir == "module-05-frontend-ai-ux-patterns":
        text = fix_module5_layout(text)

    # Incremental lists on summary slides
    if "## Summary\n\n-" in text and "<!-- incremental_lists: true -->" not in text.split("## Summary")[1][:200]:
        idx = text.find("## Summary\n\n")
        if idx != -1:
            text = text[: idx + len("## Summary\n\n")] + "<!-- incremental_lists: true -->\n\n" + text[idx + len("## Summary\n\n") :]
            # Close before bridge or end_slide after last summary bullet block
            bridge = text.find("\n\n## Bridge", idx)
            end = text.find("\n\n<!-- end_slide -->", idx)
            cut = bridge if bridge != -1 and (end == -1 or bridge < end) else end
            if cut != -1:
                before = text[:cut].rstrip()
                after = text[cut:]
                if "<!-- incremental_lists: false -->" not in before:
                    text = before + "\n\n<!-- incremental_lists: false -->" + after

    text = fix_closing(text)
    slides_path.write_text(text, encoding="utf-8")
    print(f"Updated {slides_path.relative_to(REPO)}")


def main() -> None:
    for slides_path in sorted(REPO.glob("module-*/slides.md")):
        process_module(slides_path)


if __name__ == "__main__":
    main()
