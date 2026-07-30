"""
fetch_news.py — Multi-section RSS aggregator for CDTU Applied Statistics
Updates: announcements.json + tech-news.json + learning.json
Runs via GitHub Actions every 6 hours.
"""
import json, re, os, hashlib
from datetime import datetime, timedelta, timezone
from xml.etree import ElementTree as ET
import urllib.request

# ── RSS Feeds with target sections ──
FEEDS = [
    # Domestic (Chinese)
    {"url": "https://cosx.org/feed",                        "section": "all",     "cat": "技术", "lang": "zh"},
    {"url": "https://www.r-bloggers.com/feed",               "section": "tech",    "cat": "技术", "lang": "en"},
    # International
    {"url": "https://www.kdnuggets.com/feed",                "section": "all",     "cat": "技术", "lang": "en"},
    {"url": "http://export.arxiv.org/rss/stat",              "section": "tech",    "cat": "学术", "lang": "en"},
    {"url": "https://flowingdata.com/feed",                  "section": "tech",    "cat": "技术", "lang": "en"},
    {"url": "https://simplystatistics.org/feed",             "section": "learn",   "cat": "学术", "lang": "en"},
]

# Keyword category rules (applied to title + description)
CAT_RULES = [
    (r"竞赛|比赛|建模|kaggle|competition|challenge|contest|cup", "竞赛"),
    (r"实习|招聘|岗位|校招|intern|hiring|job|career|salary|薪资", "实习"),
    (r"讲座|沙龙|分享会|会议|seminar|webinar|conference|talk|workshop", "讲座"),
    (r"考研|保研|硕士|博士|申请|admission|graduate|phd|master|gre|toefl|cet", "考研"),
    (r"证书|考试|certification|cda|sas|spss", "考研"),
    (r"书单|推荐书|必读|book|reading|教材|textbook", "书单"),
    (r"课程|教程|tutorial|course|mooc|学习|入门|guide|cheatsheet", "资源"),
]

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
MAX_AGE_DAYS = 30
MAX_PER_FILE = 20

# ── Section definitions ──
# "all" goes to announcements, "tech" goes to tech-news, "learn" goes to learning
SECTION_FILES = {
    "all":   "announcements.json",
    "tech":  "tech-news.json",
    "learn": "learning.json",
}

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
        print(f"  ⚠ {url[:50]}... — {e}")
        return []

def clean_html(text):
    return re.sub(r"<[^>]*>", "", text).replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"').strip()

def parse_date(date_str):
    if not date_str: return None
    for fmt in ["%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z",
                "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%SZ",
                "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"]:
        try: return datetime.strptime(date_str.strip(), fmt)
        except: continue
    return None

def classify(title, description, default_cat):
    text = f"{title} {description}".lower()
    for pattern, cat in CAT_RULES:
        if re.search(pattern, text, re.IGNORECASE):
            return cat
    return default_cat

def process_items(items, default_section):
    """Filter, deduplicate, sort items."""
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=MAX_AGE_DAYS)
    valid = []
    for item in items:
        dt = parse_date(item.get("pubDate", ""))
        if dt:
            if dt.tzinfo is None: dt = dt.replace(tzinfo=timezone.utc)
            if dt < cutoff: continue
            item["date"] = dt.strftime("%Y-%m-%d")
        else:
            item["date"] = now.strftime("%Y-%m-%d")
        valid.append(item)

    seen = set()
    deduped = []
    for item in sorted(valid, key=lambda x: x.get("date", ""), reverse=True):
        h = hashlib.md5(item["title"].encode()).hexdigest()
        if h not in seen:
            seen.add(h)
            deduped.append(item)
    return deduped[:MAX_PER_FILE]

def main():
    print("📡 Fetching RSS feeds for multi-section update...\n")

    # Collect items per section
    section_items = {k: [] for k in SECTION_FILES}

    for feed in FEEDS:
        url = feed["url"]
        section = feed["section"]
        default_cat = feed["cat"]
        lang = feed["lang"]
        print(f"  → [{section}] {url[:55]}...")
        items = fetch_feed(url)
        for item in items:
            item["cat"] = classify(item["title"], item["description"], default_cat)
            item["lang"] = lang
            item["section"] = section
        section_items[section].extend(items)
        print(f"    {len(items)} items")

    # Process and write each section
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Add static manual entries for announcements (always included)
    static_announcements = [
        {"title": "2026 年全国大学生数学建模竞赛报名通知——校内选拔7月30日截止", "url": "skills.html", "description": "CUMCM 国内规模最大的建模竞赛", "date": "2026-07-28", "cat": "竞赛", "lang": "zh"},
        {"title": "暑期数据分析实习岗位汇总（成都地区）——持续更新中", "url": "career.html", "description": "涵盖互联网/金融/咨询行业实习机会", "date": "2026-07-20", "cat": "实习", "lang": "zh"},
        {"title": ""统计学在工业界的应用"——优秀校友经验分享会（8月5日）", "url": "plan.html", "description": "校友分享工业界实战经验", "date": "2026-07-15", "cat": "讲座", "lang": "zh"},
    ]

    for section, filename in SECTION_FILES.items():
        items = section_items.get(section, [])
        processed = process_items(items, section)

        # Merge static entries for announcements
        if section == "all":
            seen_titles = {item["title"] for item in processed}
            for s in static_announcements:
                if s["title"] not in seen_titles:
                    processed.append(s)
            processed.sort(key=lambda x: x.get("date", ""), reverse=True)
            processed = processed[:MAX_PER_FILE]

        output = []
        for item in processed:
            output.append({
                "title": item["title"],
                "url": item["link"],
                "description": item.get("description", "")[:150],
                "date": item.get("date", ""),
                "cat": item.get("cat", "技术"),
                "lang": item.get("lang", "zh"),
            })

        filepath = os.path.join(OUTPUT_DIR, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        print(f"\n✅ {filename}: {len(output)} items → {filepath}")
        for item in output[:5]:
            print(f"  [{item['cat']}] {item['date']} — {item['title'][:60]}")

    print(f"\n🎯 All sections updated. Output: {OUTPUT_DIR}/")

if __name__ == "__main__":
    main()
