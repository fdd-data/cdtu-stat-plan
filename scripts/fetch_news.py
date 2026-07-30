"""
fetch_news.py — Multi-section RSS aggregator for CDTU Applied Statistics
Updates: announcements.json + tech-news.json + learning.json
Runs via GitHub Actions every 6 hours.
"""
import json, re, os, hashlib
from datetime import datetime, timedelta, timezone
from xml.etree import ElementTree as ET
import urllib.request

FEEDS = [
    {"url": "https://www.kdnuggets.com/feed",                "section": "all",   "cat": "技术", "lang": "en"},
    {"url": "http://export.arxiv.org/rss/stat",              "section": "tech",  "cat": "学术", "lang": "en"},
    {"url": "https://flowingdata.com/feed",                  "section": "tech",  "cat": "技术", "lang": "en"},
    {"url": "https://www.r-bloggers.com/feed",               "section": "tech",  "cat": "技术", "lang": "en"},
]

CAT_RULES = [
    (r"竞赛|比赛|建模|kaggle|competition|challenge|contest|cup", "竞赛"),
    (r"实习|招聘|岗位|校招|intern|hiring|job|career|salary|薪资", "实习"),
    (r"讲座|沙龙|分享会|会议|seminar|webinar|conference|talk|workshop", "讲座"),
    (r"考研|保研|硕士|博士|申请|admission|graduate|phd|master|gre|toefl|cet", "考研"),
    (r"证书|考试|certification|cda|sas|spss", "考研"),
    (r"书单|推荐书|必读|book|reading|教材|textbook", "书单"),
    (r"课程|教程|tutorial|course|mooc|学习|入门|guide|cheatsheet", "资源"),
]

OUTPUT_DIR = None
MAX_AGE_DAYS = 30
MAX_PER_FILE = 15

STATIC_ANNOUNCEMENTS = [
    {"title": "2026 年全国大学生数学建模竞赛报名通知——校内选拔7月30日截止", "url": "skills.html", "description": "CUMCM 国内规模最大的建模竞赛，大二大三同学重点关注", "date": "2026-07-28", "cat": "竞赛", "lang": "zh"},
    {"title": "暑期数据分析实习岗位汇总（成都地区）——持续更新中", "url": "career.html", "description": "涵盖互联网/金融/咨询行业实习机会", "date": "2026-07-20", "cat": "实习", "lang": "zh"},
    {"title": "「统计学在工业界的应用」——优秀校友经验分享会（8月5日）", "url": "plan.html", "description": "校友分享工业界实战经验，线上线下同步", "date": "2026-07-15", "cat": "讲座", "lang": "zh"},
]


def fetch_feed(url, timeout=15):
    """Fetch and parse RSS/Atom, return list of dicts."""
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "CDTU-Stat-Plan/1.0 (educational RSS aggregator)"
        })
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read()

        # Try parsing as XML
        try:
            root = ET.fromstring(raw)
        except ET.ParseError as e:
            # Try cleaning XML: remove control characters
            clean = re.sub(rb'[\x00-\x08\x0b\x0c\x0e-\x1f]', b'', raw)
            root = ET.fromstring(clean)

        items = []
        # RSS 2.0
        for item in root.iter("item"):
            title = item.findtext("title", "").strip()
            link = item.findtext("link", "").strip()
            desc = item.findtext("description", "").strip()
            pub = item.findtext("pubDate", "") or item.findtext("dc:date", "")
            if title and link:
                items.append({"title": clean_html(title), "link": link,
                              "description": clean_html(desc)[:200], "pubDate": pub})

        # Atom
        ns = "{http://www.w3.org/2005/Atom}"
        for entry in root.iter(ns + "entry"):
            title = entry.findtext(ns + "title", "").strip()
            link_el = entry.find(ns + "link")
            link = link_el.get("href", "") if link_el is not None else ""
            desc = entry.findtext(ns + "summary", "").strip()
            pub = entry.findtext(ns + "published", "") or entry.findtext(ns + "updated", "")
            if title and link:
                items.append({"title": clean_html(title), "link": link,
                              "description": clean_html(desc)[:200], "pubDate": pub})
        return items
    except Exception as e:
        print(f"  [SKIP] {url[:55]}... — {e}")
        return []


def clean_html(text):
    return re.sub(r"<[^>]*>", "", text).replace("&nbsp;", " ").replace("&amp;", "&") \
           .replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"').strip()


def parse_date(s):
    if not s: return None
    for fmt in ["%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z",
                "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%SZ",
                "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"]:
        try: return datetime.strptime(s.strip(), fmt)
        except: continue
    return None


def classify(title, desc, default_cat):
    text = f"{title} {desc}".lower()
    for pat, cat in CAT_RULES:
        if re.search(pat, text, re.IGNORECASE):
            return cat
    return default_cat


def process(items):
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
    out = []
    for item in sorted(valid, key=lambda x: x["date"], reverse=True):
        h = hashlib.md5(item["title"].encode()).hexdigest()
        if h not in seen:
            seen.add(h)
            out.append(item)
    return out[:MAX_PER_FILE]


def main():
    global OUTPUT_DIR
    script_dir = os.path.dirname(os.path.abspath(__file__))
    OUTPUT_DIR = os.path.join(os.path.dirname(script_dir), "data")
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("RSS feeds for multi-section update...\n")

    sections = {"all": [], "tech": [], "learn": []}
    for feed in FEEDS:
        sec = feed["section"]
        print(f"  [{sec}] {feed['url'][:55]}...")
        items = fetch_feed(feed["url"])
        for item in items:
            item["cat"] = classify(item["title"], item.get("description", ""), feed["cat"])
            item["lang"] = feed["lang"]
        sections.setdefault(sec, []).extend(items)
        print(f"    {len(items)} items")

    section_files = {
        "all":  "announcements.json",
        "tech": "tech-news.json",
        "learn":"learning.json",
    }

    for sec, fname in section_files.items():
        items = sections.get(sec, [])
        processed = process(items)

        # Merge static entries for announcements
        if sec == "all":
            exist = {it["title"] for it in processed}
            for s in STATIC_ANNOUNCEMENTS:
                if s["title"] not in exist:
                    processed.append(s)
            processed.sort(key=lambda x: x.get("date", ""), reverse=True)
            processed = processed[:MAX_PER_FILE]

        output = []
        for item in processed:
            url = item.get("link") or item.get("url", "")
            if not url: continue
            output.append({
                "title": item["title"],
                "url": url,
                "description": item.get("description", "")[:150],
                "date": item.get("date", ""),
                "cat": item.get("cat", "技术"),
                "lang": item.get("lang", "zh"),
            })

        path = os.path.join(OUTPUT_DIR, fname)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        print(f"\n  {fname}: {len(output)} items")
        for it in output[:4]:
            print(f"    [{it['cat']}] {it['date']} — {it['title'][:60]}")

    print(f"\nDone. Output: {OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
