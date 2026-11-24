#!/usr/bin/env python3
"""Check a built Jekyll site: internal links, images and #anchors resolve; <img> has alt, width, height; ids are unique.

Absolute og:image / twitter:image URLs on this site's own origin (the page's canonical link) are checked against the
build folder. Nothing is fetched, so images on other origins are only required to be absolute http(s) URLs.

Usage: python tools/check_site.py [_site] [--baseurl /prefix]

Pass the same --baseurl the site was built with. Root-relative links (/x) must then start with it, and are
looked up in the build folder without it, as GitHub Pages serves them.
"""
import argparse
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ap = argparse.ArgumentParser()
ap.add_argument("site", nargs="?", default="_site")
ap.add_argument("--baseurl", default="", help="baseurl the site was built with, for example /vp")
args = ap.parse_args()
root = Path(args.site).resolve()
base_url = args.baseurl.strip().rstrip("/")


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs, self.ids, self.problems = [], set(), []
        self.social_images, self.canonical = [], None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            if a["id"] in self.ids:
                self.problems.append(f"duplicate id {a['id']!r}")
            self.ids.add(a["id"])
        if tag == "meta" and (a.get("property") == "og:image" or a.get("name") == "twitter:image"):
            self.social_images.append(a.get("content") or "")
        if tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href")
        if tag == "img":
            for k in ("alt", "width", "height"):
                if k not in a:
                    self.problems.append(f"<img> without {k}: {a.get('src')}")
        for k in ("href", "src"):
            if a.get(k):
                self.refs.append(a[k])
        for part in (a.get("srcset") or "").split(","):
            if part.strip():
                self.refs.append(part.split()[0])


def target(page: Path, ref: str):
    u = urlsplit(ref)
    if u.scheme or u.netloc or ref.startswith(("#", "mailto:", "tel:", "data:")) and not u.path:
        return None, u.fragment if not u.scheme and not u.netloc else None
    path = unquote(u.path)
    if path.startswith("/"):
        if base_url and path != base_url and not path.startswith(base_url + "/"):
            return False, u.fragment  # root-relative link that ignores the baseurl
        path, base = path[len(base_url):], root
    else:
        base = page.parent
    p = (base / path.lstrip("/")).resolve()
    # GitHub Pages serves /about for about.html and /dir/ for dir/index.html
    for c in (p, p / "index.html", p.with_name(p.name + ".html")):
        if c.is_file():
            return c, u.fragment
    return False, u.fragment


def origin(u):
    s = urlsplit(u or "")
    return (s.scheme.lower(), s.netloc.lower())


pages = {}
for f in sorted(root.rglob("*.html")):
    p = Page()
    p.feed(f.read_text(encoding="utf8"))
    pages[f] = p

errors = []
for f, p in pages.items():
    rel = f.relative_to(root)
    errors += [f"{rel}: {m}" for m in p.problems]
    for ref in p.refs:
        t, frag = target(f, ref)
        if t is False:
            errors.append(f"{rel}: broken link {ref}")
        elif frag and (t or f) in pages and frag not in pages[t or f].ids:
            errors.append(f"{rel}: missing anchor {ref}")

    for img in p.social_images:
        u = urlsplit(img)
        if u.scheme not in ("http", "https") or not u.netloc:
            errors.append(f"{rel}: social image is not an absolute URL: {img!r}")
        elif p.canonical and origin(img) == origin(p.canonical) and target(f, u.path)[0] is False:
            errors.append(f"{rel}: broken social image {img}")

print(f"checked {len(pages)} pages")
if errors:
    print("\n".join(errors[:50]))
    sys.exit(1)
print("OK")
