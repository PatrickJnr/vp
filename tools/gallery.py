#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import time
from concurrent.futures import ProcessPoolExecutor
from datetime import date
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / "tools" / "gallery.config.json"
MANIFEST_PATH = ROOT / "tools" / "gallery-manifest.json"
DATA_DIR = ROOT / "_data" / "virtual-photography"
OUT_DIR = ROOT / "assets" / "gallery"
POSTS_DIR = ROOT / "_posts"
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}
SKIP_DIRS = {"node_modules", "test", "tests", "uploads", "thumbnails", "output", "dist", "build"}
OG_SIZE = (1200, 630)

Image.MAX_IMAGE_PIXELS = None


def load_config() -> dict:
    return json.loads(CONFIG_PATH.read_text(encoding="utf8"))


def settings_fingerprint(cfg: dict) -> str:
    keys = ("widths", "quality", "full_quality", "method")
    return hashlib.sha256(json.dumps({k: cfg[k] for k in keys}, sort_keys=True).encode()).hexdigest()[:16]


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-") or "image"


def read_json(path: Path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf8"))


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf8", newline="\n") as f:
        f.write(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def flatten(im: Image.Image) -> Image.Image:
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        im = im.convert("RGBA")
        if im.getchannel("A").getextrema()[0] < 255:
            bg = Image.new("RGBA", im.size, (0, 0, 0, 255))
            im = Image.alpha_composite(bg, im)
    if im.mode in ("I;16", "I", "F"):
        im = im.point(lambda v: v / 256).convert("L")
    return im.convert("RGB")


def process_image(job: dict) -> dict:
    src = Path(job["src"])
    out_dir = Path(job["out_dir"])
    out_dir.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as raw:
        icc = raw.info.get("icc_profile")
        im = flatten(raw)
    w, h = im.size
    small = im.resize((1, 1), Image.Resampling.BOX).getpixel((0, 0))
    stem = job["stem"]
    save = {"method": job["method"], "sharp_yuv": True}
    if icc:
        save["icc_profile"] = icc

    outputs = {}
    variants = []
    for vw in job["widths"]:
        if vw >= w:
            continue
        vh = round(h * vw / w)
        name = f"{stem}-{vw}.webp"
        im.resize((vw, vh), Image.Resampling.LANCZOS).save(out_dir / name, "WEBP", quality=job["quality"], **save)
        variants.append({"width": vw, "height": vh, "path": f"{job['rel_dir']}/{name}"})
        outputs[name] = (out_dir / name).stat().st_size
    full = f"{stem}-full.webp"
    im.save(out_dir / full, "WEBP", quality=job["full_quality"], **save)
    outputs[full] = (out_dir / full).stat().st_size
    return {
        "width": w,
        "height": h,
        "color": "#%02x%02x%02x" % small,
        "variants": variants,
        "full": {"width": w, "height": h, "path": f"{job['rel_dir']}/{full}"},
        "outputs": outputs,
    }


def make_og(album_dir: Path, full_webp: Path) -> Path:
    with Image.open(full_webp) as im:
        im = ImageOps.fit(im.convert("RGB"), OG_SIZE, Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    path = album_dir / "og.jpg"
    im.save(path, "JPEG", quality=86, optimize=True, progressive=True)
    return path


def discover(source: Path) -> dict[str, list[Path]]:
    albums = {}
    for d in sorted(p for p in source.iterdir() if p.is_dir()):
        if d.name.lower() in SKIP_DIRS or d.name.startswith((".", "_")):
            continue
        files = sorted(
            (p for p in d.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTS),
            key=lambda p: p.name.lower(),
        )
        if files:
            albums[d.name] = files
    return albums


def post_for(slug: str) -> Path | None:
    hits = sorted(POSTS_DIR.glob(f"*-{slug}.md"))
    return hits[0] if hits else None


def titleize(slug: str) -> str:
    return slug.replace("-", " ")


def ensure_post(slug: str, dry: bool, log) -> None:
    if post_for(slug):
        return
    today = date.today()
    path = POSTS_DIR / f"{today.isoformat()}-{slug}.md"
    log(f"  new album: creating {path.relative_to(ROOT)} (edit title/developer by hand)")
    if not dry:
        with open(path, "w", encoding="utf8", newline="\n") as f:
            f.write(f"---\nlayout: album\ndate: {today.isoformat()}\ntitle: {titleize(slug)}\ncard-image: 0\n---\n")


LEGACY_ALT_RE = re.compile(r"^Virtual photograph \d+ from ")
PLACEHOLDER_ALT_RE = re.compile(r"^(Screenshot from |Virtual photograph \d+ from )")


def album_title(slug: str) -> str:
    post = post_for(slug)
    m = post and re.search(r"^title:\s*(.+)$", post.read_text(encoding="utf8"), re.M)
    return m.group(1).strip().strip("\"'") if m else titleize(slug)


def default_alt(game: str) -> str:
    """What `build` writes for a new photo. It is a placeholder: `validate` fails until it is replaced."""
    return f"Screenshot from {game}"


def _norm(text: str) -> str:
    return re.sub(r"[\W_]+", " ", re.sub(r"([a-z])([A-Z])", r"\1 \2", text)).lower().strip()


def is_placeholder_alt(alt: str, file_name: str, game: str) -> bool:
    """True for "Screenshot from <game>" and for alt text that only restates the file name or the game name
    ("Brutalism", "Brutalism, Control", "Control 3"). Short alt text that describes the picture is fine."""
    if PLACEHOLDER_ALT_RE.match(alt):
        return True
    a, stem, g = _norm(alt), _norm(Path(file_name).stem), _norm(game)
    return a in {stem, f"{stem} {g}", f"{g} {stem}", g} or bool(re.fullmatch(re.escape(g) + r"( \d+)+( and \d+)*", a))


def legacy_order(entries: list[dict]) -> list[str]:
    return [e["file_name"] for e in entries]


def build(args, cfg) -> int:
    source = Path(args.source).resolve()
    if not source.is_dir():
        print(f"error: source folder not found: {source}", file=sys.stderr)
        return 2
    log = print
    dry = args.dry_run
    fp = settings_fingerprint(cfg)
    manifest = read_json(MANIFEST_PATH, {"settings": None, "albums": {}})
    stale_settings = manifest.get("settings") != fp or args.force
    albums = discover(source)
    if args.album:
        albums = {k: v for k, v in albums.items() if k in args.album}
        if not albums:
            print(f"error: no matching albums: {args.album}", file=sys.stderr)
            return 2

    errors, warnings = [], []
    totals = {"processed": 0, "skipped": 0, "removed": 0, "kept_missing": 0}
    jobs, plan = [], {}

    for slug, files in albums.items():
        log(f"{slug}: {len(files)} source files")
        ensure_post(slug, dry, log)
        data_path = DATA_DIR / f"{slug}.json"
        existing = read_json(data_path, [])
        by_name = {e["file_name"]: e for e in existing}
        m_album = manifest["albums"].setdefault(slug, {"images": {}})
        m_imgs = m_album["images"]
        seen_hash: dict[str, str] = {}
        stems_used = {e.get("id") for e in existing if e.get("id")}
        kept: dict[str, dict] = {}
        present = {p.name for p in files}

        orphans = {n: e for n, e in by_name.items() if n not in present and e.get("sha256")}

        for p in files:
            try:
                st = p.stat()
                m = m_imgs.get(p.name, {})
                unchanged = (
                    not stale_settings
                    and m.get("size") == st.st_size
                    and m.get("mtime_ns") == st.st_mtime_ns
                    and m.get("sha256")
                )
                digest = m["sha256"] if unchanged else sha256_of(p)
                if digest in seen_hash:
                    warnings.append(f"{slug}/{p.name}: duplicate of {seen_hash[digest]} (same SHA-256), skipped")
                    continue
                seen_hash[digest] = p.name

                entry = by_name.get(p.name)
                if entry is None:
                    for old_name, old in list(orphans.items()):
                        if old.get("sha256") == digest:
                            entry = dict(old, file_name=p.name)
                            del orphans[old_name]
                            log(f"  renamed: {old_name} -> {p.name} (metadata kept)")
                            break
                outs_ok = entry is not None and all(
                    (ROOT / v["path"]).exists() for v in (entry.get("variants", []) + [entry.get("full", {"path": "-"})])
                )
                if entry and entry.get("sha256") == digest and outs_ok and not stale_settings and entry.get("id"):
                    m_imgs[p.name] = {**m, "size": st.st_size, "mtime_ns": st.st_mtime_ns, "sha256": digest}
                    kept[p.name] = entry
                    totals["skipped"] += 1
                    continue
                stem = (entry or {}).get("id") or slugify(p.stem)
                if stem in stems_used and not (entry and entry.get("id") == stem):
                    stem = f"{stem}-{digest[:6]}"
                stems_used.add(stem)
                jobs.append({
                    "slug": slug, "name": p.name, "src": str(p), "stem": stem, "digest": digest,
                    "size": st.st_size, "mtime_ns": st.st_mtime_ns,
                    "out_dir": str(OUT_DIR / slug), "rel_dir": f"assets/gallery/{slug}",
                    "widths": cfg["widths"], "quality": cfg["quality"],
                    "full_quality": cfg["full_quality"], "method": cfg["method"],
                })
                log(f"  {'would process' if dry else 'queue'}: {p.name}")
            except Exception as e:
                errors.append(f"{slug}/{p.name}: {type(e).__name__}: {e}")

        for old_name, old in orphans.items():
            if args.prune:
                for v in old.get("variants", []) + [old.get("full", {})]:
                    target = (ROOT / v["path"]).resolve() if v.get("path") else None
                    if target and target.is_relative_to(OUT_DIR.resolve()) and not dry:
                        target.unlink(missing_ok=True)
                totals["removed"] += 1
                log(f"  pruned: {old_name} (source file gone)")
            else:
                kept[old_name] = old
                totals["kept_missing"] += 1
                warnings.append(f"{slug}/{old_name}: source file missing, entry kept (use --prune to remove)")
        for n in list(m_imgs):
            if n not in present and args.prune:
                m_imgs.pop(n, None)
        plan[slug] = {"existing_order": [e["file_name"] for e in existing], "kept": kept, "files": files, "by_name": by_name}

    if dry:
        print(f"\ndry run: {len(jobs)} to process, {totals['skipped']} unchanged, "
              f"{totals['kept_missing']} missing-but-kept, {totals['removed']} to prune")
        for w in warnings:
            print("warning:", w)
        for e in errors:
            print("error:", e)
        return 1 if errors else 0

    t0 = time.time()
    results = {}
    if jobs:
        with ProcessPoolExecutor() as pool:
            for job, res in zip(jobs, pool.map(_safe_process, jobs)):
                if isinstance(res, str):
                    errors.append(f"{job['slug']}/{job['name']}: {res}")
                else:
                    results[(job["slug"], job["name"])] = (job, res)
                    totals["processed"] += 1
                    print(f"  done {job['slug']}/{job['name']} ({res['width']}x{res['height']})")

    for slug, info in plan.items():
        new_entries = []
        order = info["existing_order"]
        for name in order:
            pick = _entry_for(name, info, results, slug)
            if pick:
                new_entries.append(pick)
        for p in info["files"]:
            if p.name not in order:
                pick = _entry_for(p.name, info, results, slug)
                if pick:
                    new_entries.append(pick)
        game = album_title(slug)
        for e in new_entries:
            if not e.get("alt") or LEGACY_ALT_RE.match(e["alt"]):
                e["alt"] = default_alt(game)
            if is_placeholder_alt(e["alt"], e["file_name"], game):
                warnings.append(f"{slug}/{e['file_name']}: needs real alt text in _data/virtual-photography/{slug}.json (validate fails until it is written)")
        for (s, n), (job, res) in results.items():
            if s == slug:
                m_imgs = manifest["albums"][slug]["images"]
                m_imgs[n] = {"sha256": job["digest"], "size": job["size"], "mtime_ns": job["mtime_ns"], "outputs": res["outputs"]}
        write_json(DATA_DIR / f"{slug}.json", new_entries)
        _write_og(slug, new_entries)

    _write_site_og()
    manifest["settings"] = fp
    manifest["updated"] = date.today().isoformat()
    write_json(MANIFEST_PATH, manifest)
    print(f"\nprocessed {totals['processed']}, unchanged {totals['skipped']}, "
          f"missing-but-kept {totals['kept_missing']}, pruned {totals['removed']} in {time.time() - t0:.1f}s")
    for w in warnings:
        print("warning:", w)
    for e in errors:
        print("error:", e)
    return 1 if errors else 0


def _safe_process(job):
    try:
        return process_image(job)
    except Exception as e:
        return f"{type(e).__name__}: {e}"


def _entry_for(name, info, results, slug):
    old = info["kept"].get(name) or info["by_name"].get(name)
    r = results.get((slug, name))
    if r is None:
        return old if name in info["kept"] else None
    job, res = r
    base = {k: old.get(k) for k in ("title", "caption", "alt")} if old else {}
    return {
        "id": job["stem"],
        "file_name": name,
        "title": base.get("title") or "",
        "caption": base.get("caption") or "",
        "alt": base.get("alt") or "",
        "sha256": job["digest"],
        "width": res["width"],
        "height": res["height"],
        "aspect-ratio": round(res["width"] / res["height"], 5),
        "color": res["color"],
        "variants": res["variants"],
        "full": res["full"],
    }


def _write_site_og():
    feat = ROOT / "_data" / "featured.yml"
    if not feat.exists():
        return
    m = re.search(r"\{album:\s*([\w-]+),\s*index:\s*(\d+)\}", feat.read_text(encoding="utf8"))
    data = DATA_DIR / f"{m.group(1)}.json" if m else None
    if data and data.exists():
        entries = json.loads(data.read_text(encoding="utf8"))
        i = int(m.group(2))
        if i < len(entries):
            path = make_og(OUT_DIR, ROOT / entries[i]["full"]["path"])


def _write_og(slug, entries):
    post = post_for(slug)
    idx = 0
    if post:
        m = re.search(r"^card-image:\s*(\d+)", post.read_text(encoding="utf8"), re.M)
        idx = int(m.group(1)) if m else 0
    if not entries:
        return
    idx = min(idx, len(entries) - 1)
    make_og(OUT_DIR / slug, ROOT / entries[idx]["full"]["path"])


LEGACY_RE = re.compile(r"l3n\.co|lensdump|imgur", re.I)


def validate(args, cfg) -> int:
    errors, warns = [], []
    n_albums = n_images = 0
    bytes_total = 0
    files = sorted(DATA_DIR.glob("*.json"))
    if not files:
        errors.append(f"no album data found in {DATA_DIR}")
    for f in files:
        slug = f.stem
        n_albums += 1
        try:
            entries = json.loads(f.read_text(encoding="utf8"))
        except json.JSONDecodeError as e:
            errors.append(f"{f.name}: invalid JSON ({e})")
            continue
        if not post_for(slug):
            errors.append(f"{slug}: no matching post in _posts (album would have no page)")
        else:
            m = re.search(r"^card-image:\s*(\d+)", post_for(slug).read_text(encoding="utf8"), re.M)
            if m and int(m.group(1)) >= len(entries):
                errors.append(f"{slug}: card-image {m.group(1)} out of range ({len(entries)} images)")
        if not entries:
            errors.append(f"{slug}: album has no images")
        ids = set()
        for i, e in enumerate(entries):
            n_images += 1
            tag = f"{slug}[{i}] {e.get('file_name', '?')}"
            for k in ("id", "file_name", "alt", "width", "height", "aspect-ratio", "sha256", "variants", "full"):
                if k not in e:
                    errors.append(f"{tag}: missing field '{k}'")
            if e.get("id") in ids:
                errors.append(f"{tag}: duplicate id {e.get('id')}")
            ids.add(e.get("id"))
            if LEGACY_RE.search(json.dumps(e)):
                errors.append(f"{tag}: external/legacy image host reference")
            if not e.get("alt"):
                errors.append(f"{tag}: empty alt text")
            refs = list(e.get("variants", [])) + ([e["full"]] if "full" in e else [])
            for v in refs:
                p = ROOT / v.get("path", "")
                if not p.is_file():
                    errors.append(f"{tag}: missing file {v.get('path')}")
                    continue
                bytes_total += p.stat().st_size
                try:
                    with Image.open(p) as im:
                        im.load()
                        if im.size != (v["width"], v["height"]):
                            errors.append(f"{tag}: {v['path']} is {im.size}, JSON says {v['width']}x{v['height']}")
                except Exception as ex:
                    errors.append(f"{tag}: cannot decode {v['path']} ({ex})")
            if e.get("width") and e.get("height") and abs(e["width"] / e["height"] - e.get("aspect-ratio", 0)) > 0.001:
                errors.append(f"{tag}: aspect-ratio does not match width/height")
        og = OUT_DIR / slug / "og.jpg"
        if not og.is_file():
            warns.append(f"{slug}: no og.jpg social preview")
    referenced = set()
    for f in files:
        for e in json.loads(f.read_text(encoding="utf8")):
            for v in e.get("variants", []) + [e.get("full", {})]:
                referenced.add(v.get("path"))
    for p in OUT_DIR.rglob("*"):
        rel = p.relative_to(ROOT).as_posix()
        if p.is_file() and p.name != "og.jpg" and rel not in referenced:
            warns.append(f"unreferenced file: {rel}")
    scan = [ROOT / d for d in ("_data", "_posts", "_layouts", "_includes", "assets/css", "assets/js", "pages")]
    for base in scan:
        for p in base.rglob("*"):
            if p.is_file() and p.suffix in {".json", ".md", ".html", ".yml", ".css", ".js"} and LEGACY_RE.search(p.read_text(encoding="utf8", errors="ignore")):
                if "imgur" in p.read_text(encoding="utf8", errors="ignore").lower() and p.suffix == ".md" and p.parent.name == "pages":
                    continue
                errors.append(f"legacy image host reference in {p.relative_to(ROOT).as_posix()}")
    for f in files:
        game = album_title(f.stem)
        for e in json.loads(f.read_text(encoding="utf8")):
            if is_placeholder_alt(e.get("alt", ""), e.get("file_name", ""), game):
                errors.append(f"{f.stem}/{e.get('file_name')}: placeholder alt text {e['alt']!r}; describe the photograph in {f.relative_to(ROOT).as_posix()}")
    print(f"validated {n_albums} albums, {n_images} images, {bytes_total / 1e6:.1f} MB of gallery assets")
    for w in warns:
        print("warning:", w)
    for e in errors:
        print("error:", e)
    print("OK" if not errors else f"FAILED with {len(errors)} error(s)")
    return 1 if errors else 0


def main(argv=None) -> int:
    cfg = load_config()
    default_source = os.environ.get("GALLERY_SOURCE", str(ROOT.parent / "tools"))
    ap = argparse.ArgumentParser(description="Offline gallery generator for the vp Jekyll site")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sp = sub.add_parser("build")
    sp.add_argument("--source", default=default_source, help=f"folder holding one sub folder per album (default: {default_source})")
    sp.add_argument("--dry-run", action="store_true", help="report what would change, write nothing")
    sp.add_argument("--force", action="store_true", help="regenerate every image")
    sp.add_argument("--prune", action="store_true", help="remove gallery entries whose source file is gone")
    sp.add_argument("--album", nargs="+", help="only these albums")
    sub.add_parser("validate")
    args = ap.parse_args(argv)
    return {"build": build, "validate": validate}[args.cmd](args, cfg)


if __name__ == "__main__":
    sys.exit(main())
