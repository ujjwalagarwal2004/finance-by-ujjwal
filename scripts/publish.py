#!/usr/bin/env python3
"""
Finance by Ujjwal — Article Publisher
--------------------------------------
Usage:
  python3 scripts/publish.py

This script asks you for:
  1. The article text (paste from Claude)
  2. The title
  3. The category
  4. A short summary (1-2 sentences)
  5. Tags (optional)

Then it saves the article, commits it to git, and pushes to GitHub.
Vercel will auto-deploy within ~60 seconds.
"""

import subprocess
import sys
import re
from datetime import date
from pathlib import Path

CATEGORIES = {
    "1": ("market-analysis", "Market Analysis"),
    "2": ("india-finance", "India Finance"),
    "3": ("global-finance", "Global Finance"),
    "4": ("investment-basics", "Investment Basics"),
    "5": ("explainers", "Explainers"),
}

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text[:80]

def run(cmd: str) -> tuple[int, str]:
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.returncode, result.stdout + result.stderr

def check_git():
    code, _ = run("git rev-parse --is-inside-work-tree")
    if code != 0:
        print("\n❌ Not a git repository. Please run 'git init' and connect to GitHub first.")
        print("   See SETUP.md for instructions.")
        sys.exit(1)

def main():
    print("\n" + "="*60)
    print("  Finance by Ujjwal — Article Publisher")
    print("="*60)

    check_git()

    # Step 1: Title
    print("\nStep 1/5: Article title")
    title = input("  Enter the article title: ").strip()
    if not title:
        print("❌ Title cannot be empty.")
        sys.exit(1)

    slug = slugify(title)
    print(f"  → Slug will be: {slug}")

    # Step 2: Category
    print("\nStep 2/5: Category")
    for key, (_, label) in CATEGORIES.items():
        print(f"  {key}. {label}")
    cat_choice = input("  Enter number (1-5): ").strip()
    if cat_choice not in CATEGORIES:
        print("❌ Invalid choice.")
        sys.exit(1)
    category_slug, category_label = CATEGORIES[cat_choice]

    # Step 3: Summary
    print("\nStep 3/5: Summary (1-2 sentences shown under the title)")
    summary = input("  Enter summary: ").strip()
    if not summary:
        print("❌ Summary cannot be empty.")
        sys.exit(1)

    # Step 4: Tags
    print("\nStep 4/5: Tags (optional, comma-separated, e.g. 'RBI, inflation, India')")
    tags_raw = input("  Enter tags (or press Enter to skip): ").strip()
    tags = [t.strip() for t in tags_raw.split(',') if t.strip()] if tags_raw else []

    # Step 5: Article body
    print("\nStep 5/5: Article body")
    print("  Paste the full article text below.")
    print("  When done, type '---END---' on a new line and press Enter:")
    print()
    lines = []
    while True:
        try:
            line = input()
        except EOFError:
            break
        if line.strip() == "---END---":
            break
        lines.append(line)
    body = "\n".join(lines).strip()
    if not body:
        print("❌ Article body cannot be empty.")
        sys.exit(1)

    # Build frontmatter
    today = date.today().isoformat()
    tags_yaml = "[" + ", ".join(f'"{t}"' for t in tags) + "]" if tags else "[]"
    content = f"""---
title: "{title}"
summary: "{summary}"
date: "{today}"
tags: {tags_yaml}
---

{body}
"""

    # Save file
    project_root = Path(__file__).parent.parent
    output_dir = project_root / "content" / category_slug
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{slug}.md"

    if output_path.exists():
        overwrite = input(f"\n⚠️  File already exists: {output_path.name}\n  Overwrite? (y/n): ")
        if overwrite.lower() != 'y':
            print("Cancelled.")
            sys.exit(0)

    output_path.write_text(content, encoding='utf-8')
    print(f"\n✅ Article saved to: content/{category_slug}/{slug}.md")

    # Git commit and push
    print("\nPublishing to GitHub...")
    code, out = run(f'git add content/{category_slug}/{slug}.md')
    if code != 0:
        print(f"❌ git add failed:\n{out}")
        sys.exit(1)

    commit_msg = f"Add article: {title}"
    code, out = run(f'git commit -m "{commit_msg}"')
    if code != 0:
        print(f"❌ git commit failed:\n{out}")
        sys.exit(1)

    code, out = run("git push")
    if code != 0:
        print(f"❌ git push failed:\n{out}")
        print("\nTip: Make sure you've connected your GitHub repo. See SETUP.md.")
        sys.exit(1)

    print("\n" + "="*60)
    print("  🎉 Published successfully!")
    print(f"  Category: {category_label}")
    print(f"  Article:  {title}")
    print(f"  Live in ~60 seconds on your Vercel URL.")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
