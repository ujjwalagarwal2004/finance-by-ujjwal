#!/usr/bin/env python3
"""
Finance by Ujjwal — Morning Digest
------------------------------------
Runs every morning at 8am IST via GitHub Actions.
Fetches today's top finance news from free RSS feeds,
formats 5 topic ideas, and sends them to your Telegram.

Environment variables required (set as GitHub Secrets):
  TELEGRAM_BOT_TOKEN  — from BotFather
  TELEGRAM_CHAT_ID    — your personal chat ID with the bot
"""

import os
import sys
import re
import json
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta

# ─── Config ───────────────────────────────────────────────────────────────────

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")

# Free RSS feeds — no API key needed
RSS_FEEDS = [
    # India finance
    ("Economic Times Markets", "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms"),
    ("Moneycontrol Top News", "https://www.moneycontrol.com/rss/MCtopnews.xml"),
    ("Business Standard Markets", "https://www.business-standard.com/rss/markets-106.rss"),
    # Global finance
    ("Reuters Business", "https://feeds.reuters.com/reuters/businessNews"),
    ("Financial Times World", "https://www.ft.com/world?format=rss"),
    ("Bloomberg Markets (via Yahoo)", "https://finance.yahoo.com/news/rssindex"),
    # RBI / Policy
    ("Mint Economy", "https://www.livemint.com/rss/economy"),
]

IST = timezone(timedelta(hours=5, minutes=30))

# ─── RSS Fetching ─────────────────────────────────────────────────────────────

def fetch_feed(name: str, url: str) -> list[dict]:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read()
        root = ET.fromstring(raw)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        items = []

        # Standard RSS
        for item in root.findall(".//item")[:5]:
            title = (item.findtext("title") or "").strip()
            desc = (item.findtext("description") or "").strip()
            link = (item.findtext("link") or "").strip()
            pub = (item.findtext("pubDate") or "").strip()
            if title:
                items.append({"title": title, "desc": clean_html(desc)[:200], "link": link, "source": name, "pub": pub})

        # Atom feeds
        if not items:
            for entry in root.findall(".//atom:entry", ns)[:5]:
                title = (entry.findtext("atom:title", namespaces=ns) or "").strip()
                link_el = entry.find("atom:link", ns)
                link = (link_el.get("href", "") if link_el is not None else "").strip()
                summary = (entry.findtext("atom:summary", namespaces=ns) or "").strip()
                if title:
                    items.append({"title": title, "desc": clean_html(summary)[:200], "link": link, "source": name, "pub": ""})

        return items
    except Exception as e:
        print(f"  [warn] Could not fetch {name}: {e}", file=sys.stderr)
        return []

def clean_html(text: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'&amp;', '&', text)
    text = re.sub(r'&lt;', '<', text)
    text = re.sub(r'&gt;', '>', text)
    text = re.sub(r'&nbsp;', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

# ─── Topic Suggestion Logic ───────────────────────────────────────────────────

FINANCE_KEYWORDS = [
    'rbi', 'sebi', 'rate', 'inflation', 'gdp', 'market', 'stock', 'nifty', 'sensex',
    'rupee', 'dollar', 'fed', 'bank', 'budget', 'economy', 'invest', 'fund', 'trade',
    'tariff', 'bond', 'equity', 'ipo', 'merger', 'crypto', 'gold', 'oil', 'fiscal',
    'deficit', 'export', 'import', 'policy', 'growth', 'recession', 'yield',
    'earnings', 'profit', 'loss', 'quarter', 'results', 'revenue', 'tax'
]

def score_item(item: dict) -> int:
    text = (item["title"] + " " + item["desc"]).lower()
    return sum(1 for kw in FINANCE_KEYWORDS if kw in text)

def deduplicate(items: list[dict]) -> list[dict]:
    seen_words: set[str] = set()
    unique = []
    for item in items:
        words = set(item["title"].lower().split())
        overlap = words & seen_words
        if len(overlap) < 3:
            unique.append(item)
            seen_words.update(words)
    return unique

def pick_top_stories(all_items: list[dict], n: int = 5) -> list[dict]:
    scored = sorted(all_items, key=score_item, reverse=True)
    deduped = deduplicate(scored)
    return deduped[:n]

# ─── Telegram ────────────────────────────────────────────────────────────────

def send_telegram(message: str) -> bool:
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("❌ TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set.", file=sys.stderr)
        return False
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = json.dumps({
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }).encode()
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.load(resp)
            return result.get("ok", False)
    except Exception as e:
        print(f"❌ Telegram send failed: {e}", file=sys.stderr)
        return False

# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    now = datetime.now(IST)
    date_str = now.strftime("%A, %d %B %Y")
    print(f"Running morning digest for {date_str}...")

    # Fetch all feeds
    all_items = []
    for name, url in RSS_FEEDS:
        items = fetch_feed(name, url)
        all_items.extend(items)
        print(f"  {name}: {len(items)} items")

    if not all_items:
        send_telegram("⚠️ <b>Finance by Ujjwal</b>\n\nCould not fetch news today. Please check manually.")
        return

    top = pick_top_stories(all_items, n=5)

    # Build message
    lines = [
        f"🌅 <b>Good morning, Ujjwal!</b>",
        f"📅 {date_str}",
        f"",
        f"Here are today's top 5 finance story ideas:",
        f"Reply to this message with the <b>number</b> you want to write about,",
        f"then open Claude Code and say: <i>'Write a full report on topic [number] from my morning digest'</i>",
        f"",
    ]
    for i, item in enumerate(top, 1):
        source_tag = f" <i>({item['source']})</i>" if item.get('source') else ""
        desc = f"\n   └ {item['desc']}" if item.get('desc') else ""
        link = f"\n   🔗 {item['link']}" if item.get('link') else ""
        lines.append(f"<b>{i}.</b> {item['title']}{source_tag}{desc}{link}")
        lines.append("")

    lines.append("─────────────────────")
    lines.append("Finance by Ujjwal | Daily Digest")

    message = "\n".join(lines)

    # Print to stdout for debugging in GitHub Actions logs
    print("\n" + "="*60)
    print(message)
    print("="*60)

    ok = send_telegram(message)
    if ok:
        print("\n✅ Telegram message sent successfully.")
    else:
        print("\n❌ Failed to send Telegram message.")
        sys.exit(1)

if __name__ == "__main__":
    main()
