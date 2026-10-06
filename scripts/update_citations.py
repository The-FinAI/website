#!/usr/bin/env python3
"""Build citations.json for the homepage ticker.

Reads every arXiv paper linked from research.html, asks Semantic Scholar for its
total citation count, and counts citing papers published in the previous
calendar month. Run monthly (see .github/workflows/citations.yml).

Usage: python3 scripts/update_citations.py [path/to/research.html]
"""
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.request

API = 'https://api.semanticscholar.org/graph/v1'
KEY = os.environ.get('S2_API_KEY')  # optional, raises rate limits
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def call(url, body=None):
    headers = {'Content-Type': 'application/json'}
    if KEY:
        headers['x-api-key'] = KEY
    for attempt in range(6):
        try:
            req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None, headers=headers)
            return json.load(urllib.request.urlopen(req, timeout=60))
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            time.sleep(5 * (attempt + 1))
    raise RuntimeError('rate limited: ' + url)


def short_name(title):
    head = re.split(r'[:?]', title)[0].strip()
    return head if len(head) <= 28 else ' '.join(head.split()[:3]) + '…'


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'research.html')
    html = urllib.request.urlopen(src).read().decode() if src.startswith('http') else open(src).read()
    ids = sorted(set(re.findall(r'arxiv\.org/(?:abs|pdf)/(\d{4}\.\d{4,5})', html)))

    today = dt.date.today()
    end = today.replace(day=1)                       # first day of this month
    start = (end - dt.timedelta(days=1)).replace(day=1)  # first day of last month

    meta = call(f'{API}/paper/batch?fields=title,citationCount', {'ids': ['ARXIV:' + i for i in ids]})
    papers = []
    for arxiv, m in zip(ids, meta):
        if not m:
            continue
        monthly, offset = 0, 0
        while True:
            page = call(f"{API}/paper/{m['paperId']}/citations?fields=publicationDate&limit=1000&offset={offset}")
            for c in page.get('data', []):
                d = (c.get('citingPaper') or {}).get('publicationDate')
                if d and start.isoformat() <= d < end.isoformat():
                    monthly += 1
            if 'next' not in page:
                break
            offset = page['next']
        papers.append({'name': short_name(m['title']), 'title': m['title'], 'arxiv': arxiv,
                       'total': m['citationCount'], 'monthly': monthly})
        time.sleep(0 if KEY else 1.1)

    papers.sort(key=lambda p: (-p['monthly'], -p['total']))
    out = {'updated': today.isoformat(), 'month': start.strftime('%b %Y'), 'source': 'Semantic Scholar',
           'total': sum(p['total'] for p in papers), 'papers': papers}
    with open(os.path.join(ROOT, 'citations.json'), 'w') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"{len(papers)} papers · {out['total']} citations · +{sum(p['monthly'] for p in papers)} in {out['month']}")


if __name__ == '__main__':
    main()
