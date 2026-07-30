"""
fetch_news.py — RSS aggregator for CDTU Applied Statistics
Fetches from domestic + international feeds, deduplicates, writes JSON.
Runs via GitHub Actions every 6 hours.
"""
import json, re, os, sys, hashlib
from datetime import datetime, timedelta, timezone
from xml.etree import ElementTree as ET
import urllib.request

# ── RSS Feeds ──
FEEDS = [
    # Domestic (Chinese)
    {"url": "https://cosx.org/feed",                        "cat": "技术", "lang": "zh"},
    {"url": "https://www.r-bloggers.com/feed",               "cat": "技术", "lang": "en"},
    # International
    {"url": "https://www.kdnuggets.com/feed",                "cat": "技术", "lang": "en"},
    {"url": "http://export.arxiv.org/rss/stat",              "cat": "学术", "lang": "en"},
    {"url": "https://flowingdata.com/feed",                  "cat": "技术", "lang": "en"},
]

# Keyword-based category overrides (checked against title+summary)
CAT_RULES = [
    (r"竞赛|比赛|建模|kaggle|competition|challenge|contest|cup", "竞赛"),
    (r"实习|招聘|岗位|校招|intern|hiring|job|career|salary", "实习"),
    (r"讲座|沙龙|分享会|会议|seminar|webinar|conference|talk|workshop", "讲座"),
    (r"考研|保研|硕士|博士|申请|admission|graduate|phd|master|gre|toefl", "考研"),
    (r"证书|考试|cet|toefl|ielts|certification|cda|sas", "考研"),
]

OUTPUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "announcements.json")
MAX_AGE_DAYS = 30
MAX_ITEMS = 30

def fetch_feed(url, timeout=15):
    """Fetch and parse RSS/Atom feed."""
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "CDTU-Stat-Plan/1.0 (RSS Aggregator; educational use)"
        })
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = resp.read()
        root = ET.fromstring(data)

        items = []
        # RSS 2.0
        for item in root.iter("item"):
            title = item.findtext("title", "").strip()
            link = item.findtext("link", "").strip()
            desc = item.findtext("description", "").strip()
            pub = item.findtext("pubDate", "") or item.findtext("dc:date", "")
            if title and link:
                items.append({"title": clean_html(title), "link": link, "description": clean_html(desc)[:200], "pubDate": pub, "source": url})
        # Atom
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        for entry in root.iter("{http://www.w3.org/2005/Atom}entry"):
            title = entry.findtext("{http://www.w3.org/2005/Atom}title", "").strip()
            link_el = entry.find("{http://www.w3.org/2005/Atom}link")
            link = link_el.get("href", "") if link_el is not None else ""
            desc = entry.findtext("{http://www.w3.org/2005/Atom}summary", "").strip()
            pub = entry.findtext("{http://www.w3.org/2005/Atom}published", "") or entry.findtext("{http://www.w3.org/2005/Atom}updated", "")
            if title and link:
                items.append({"title": clean_html(title), "link": link, "description": clean_html(desc)[:200], "pubDate": pub, "source": url})

        return items
    except Exception as e:
        print(f"  ⚠ Failed: {url} — {e}")
        return []

def clean_html(text):
    """Strip HTML tags."""
    return re.sub(r"<[^>]*>", "", text).replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"').strip()

def parse_date(date_str):
    """Try to parse various date formats."""
    if not date_str:
        return None
    formats = [
        "%a, %d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S %Z",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except:
            continue
    return None

def classify(title, description, default_cat):
    """Apply keyword rules to determine category."""
    text = f"{title} {description}".lower()
    for pattern, cat in CAT_RULES:
        if re.search(pattern, text, re.IGNORECASE):
            return cat
    return default_cat

def main():
    print("📡 Fetching RSS feeds...")
    all_items = []
    for feed in FEEDS:
        print(f"  → {feed['url'][:60]}...")
        items = fetch_feed(feed["url"])
        for item in items:
            item["cat"] = classify(item["title"], item["description"], feed["cat"])
            item["lang"] = feed["lang"]
        all_items.extend(items)
        print(f"    Got {len(items)} items")

    # Parse dates and filter old
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=MAX_AGE_DAYS)
    valid = []
    for item in all_items:
        dt = parse_date(item.get("pubDate", ""))
        if dt:
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            if dt < cutoff:
                continue
            item["date"] = dt.strftime("%Y-%m-%d")
        else:
            item["date"] = now.strftime("%Y-%m-%d")  # today if unparseable
        valid.append(item)

    # Deduplicate by title hash
    seen = set()
    deduped = []
    for item in sorted(valid, key=lambda x: x.get("date", ""), reverse=True):
        h = hashlib.md5(item["title"].encode()).hexdigest()
        if h not in seen:
            seen.add(h)
            deduped.append(item)

    # Trim
    deduped = deduped[:MAX_ITEMS]

    # Build output
    output = []
    for item in deduped:
        output.append({
            "title": item["title"],
            "url": item["link"],
            "description": item.get("description", "")[:150],
            "date": item.get("date", ""),
            "cat": item.get("cat", "技术"),
            "lang": item.get("lang", "zh"),
        })

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Written {len(output)} announcements to {OUTPUT}")
    for item in output[:8]:
        print(f"  [{item['cat']}] {item['date']} — {item['title'][:60]}")

if __name__ == "__main__":
    main()
