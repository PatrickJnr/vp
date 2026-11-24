"""Tests for tools/check_site.py on tiny fake sites, with and without a baseurl.

Run: python tests/check_site_test.py
"""
import subprocess
import sys
import tempfile
from pathlib import Path

CHECK = Path(__file__).resolve().parent.parent / "tools" / "check_site.py"
IMG = '<img src="{p}/a.webp" srcset="{p}/a.webp 1w" alt="x" width="1" height="1">'


def site(prefix: str, bad: str = "") -> Path:
    """Build a two page site whose root-relative links carry `prefix`; `bad` adds one extra link to index."""
    d = Path(tempfile.mkdtemp())
    (d / "a.webp").write_bytes(b"x")
    (d / "about.html").write_text(f'<h2 id="top">T</h2><a href="{prefix}/">home</a>', encoding="utf8")
    (d / "index.html").write_text(
        f'<a href="{prefix}/about#top">a</a><a href="{prefix}/about.html">b</a><a href="{prefix}/">c</a>'
        f'<a href="#here" id="here">d</a><a href="https://example.com/x">e</a>{IMG.format(p=prefix)}{bad}',
        encoding="utf8",
    )
    return d


def social(origin: str, path: str, image: str = "") -> str:
    """Canonical link plus og:image and twitter:image; `image` overrides the og:image URL."""
    return (
        f'<link rel="canonical" href="{origin}/">'
        f'<meta property="og:image" content="{image or origin + path}">'
        f'<meta name="twitter:image" content="{image or origin + path}">'
    )


def run(d: Path, *extra: str) -> tuple[int, str]:
    r = subprocess.run([sys.executable, str(CHECK), str(d), *extra], capture_output=True, text=True)
    return r.returncode, r.stdout


def case(name, d, extra, ok, needle=""):
    code, out = run(d, *extra)
    good = (code == 0) == ok and needle in out
    print(("PASS " if good else "FAIL ") + name + ("" if good else f"\n{out}"))
    return good


results = [
    case("no baseurl, good site", site(""), [], True),
    case("baseurl, good site", site("/vp"), ["--baseurl", "/vp"], True),
    case("baseurl with trailing slash", site("/vp"), ["--baseurl", "/vp/"], True),
    case("no baseurl, broken link", site("", '<a href="/nope">x</a>'), [], False, "broken link /nope"),
    case("baseurl, broken link", site("/vp", '<a href="/vp/nope">x</a>'), ["--baseurl", "/vp"], False, "broken link /vp/nope"),
    case("baseurl, missing anchor", site("/vp", '<a href="/vp/about#gone">x</a>'), ["--baseurl", "/vp"], False, "missing anchor /vp/about#gone"),
    case("no baseurl, missing anchor", site("", '<a href="/about#gone">x</a>'), [], False, "missing anchor /about#gone"),
    case("baseurl, link ignoring the baseurl", site("/vp", '<a href="/about">x</a>'), ["--baseurl", "/vp"], False, "broken link /about"),
    case("baseurl, broken image", site("/vp", '<img src="/vp/missing.webp" alt="x" width="1" height="1">'), ["--baseurl", "/vp"], False, "missing.webp"),
    case("baseurl given but site built without", site(""), ["--baseurl", "/vp"], False, "broken link"),
    case("social image ok", site("", social("https://x.test", "/a.webp")), [], True),
    case("social image ok under baseurl", site("/vp", social("https://x.test/vp", "/a.webp")), ["--baseurl", "/vp"], True),
    case("social image broken", site("", social("https://x.test", "/gone.jpg")), [], False, "broken social image https://x.test/gone.jpg"),
    case("social image broken under baseurl", site("/vp", social("https://x.test/vp", "/gone.jpg")), ["--baseurl", "/vp"], False, "broken social image"),
    case("social image ignores baseurl", site("/vp", social("https://x.test", "/a.webp")), ["--baseurl", "/vp"], False, "broken social image"),
    case("social image relative", site("", '<meta property="og:image" content="/a.webp">'), [], False, "not an absolute URL"),
    case("social image on another origin is not fetched", site("", social("https://x.test", "/a.webp", "https://cdn.test/nope.jpg")), [], True),
    case("img without alt", site("", '<img src="/a.webp" width="1" height="1">'), [], False, "without alt"),
]
sys.exit(0 if all(results) else 1)
