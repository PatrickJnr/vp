# PatrickJr's Virtual Photography

Source for <https://vp.grimtech.co.uk/>, a Jekyll site hosted on GitHub Pages. Photographs are generated locally as WebP files and served from this repository. There is no external image host.

## Requirements

- Ruby 3.3 or newer (CI uses 3.4) and Bundler 2.5 or newer
- Python 3.10 or newer with Pillow, for the gallery generator only

On Windows, `winget install RubyInstallerTeam.Ruby.3.4` installs Ruby. Open a new terminal afterwards so `ruby` is on the PATH.

## Local preview

```powershell
bundle install
bundle exec jekyll serve --livereload
```

The site is served at <http://localhost:4000>. Production build, as CI runs it:

```powershell
$env:JEKYLL_ENV = "production"; bundle exec jekyll build --trace
```

`Gemfile.lock` is committed and lists the Windows and Linux platforms, so installs are reproducible on both.

## Typography

All text uses self-hosted Poppins (400, 500 and 600, latin subset, SIL Open Font License in `assets/fonts/Poppins-OFL.txt`). Icons use a subset of Material Symbols. Nothing is loaded from a font service.

## Tests

Browser tests use Playwright against a production build in `_site`. Install `playwright` once, build with `JEKYLL_ENV=production`, then run:

```powershell
node tests/pages.mjs       # layout, sticky footer and privacy controls at 8 viewports
node tests/viewer.mjs      # fullscreen viewer
node tests/analytics.mjs   # consent and events, Google is mocked
```

Set `PLAYWRIGHT_MODULE` to the path of `playwright/index.mjs` if it is not installed in this folder.

## Analytics

Google Analytics 4 is opt in and loads only in production builds. Events, GA4 setup, reports and the privacy decisions still open are in [docs/analytics.md](docs/analytics.md). Browser tests (Google is mocked, nothing is sent): build with `JEKYLL_ENV=production`, then `node tests/analytics.mjs` (needs `playwright`).

## Adding photographs

Originals live outside this repository, in a folder with one sub folder per album (currently `D:\Grimtech\tools`).

```powershell
pip install -r tools/requirements.txt
python tools/gallery.py build
```

1. Drop new images into `<source>\<Album-Name>\`. A new folder creates a new album and a stub post in `_posts/`; open that post and set the real title and developer.
2. Run `python tools/gallery.py build`. Only new or changed images are processed.
3. Preview, then commit `assets/gallery/`, `_data/virtual-photography/` and `tools/gallery-manifest.json`.

Use `--source <path>` or the `GALLERY_SOURCE` environment variable for a different source folder.

What the generator does:

- Writes `assets/gallery/<Album>/<name>-<width>.webp` at 480, 960, 1600 and 2560 px wide, plus `<name>-full.webp` at the original resolution. It never upscales.
- Applies EXIF orientation, keeps the colour profile, and does no sharpening or denoising.
- Detects duplicates by SHA-256, and detects renamed files so captions and order survive.
- Keeps existing order, `title`, `caption` and `alt` values in `_data/virtual-photography/<Album>.json`. New photographs are appended. The album page shows the newest first.
- Writes social preview images (`og.jpg`) for each album and the homepage.

Useful options:

| Command | Purpose |
|---|---|
| `build --dry-run` | Show what would change, write nothing |
| `build --album Control` | Only one album |
| `build --force` | Regenerate everything, for example after changing quality |
| `build --prune` | Remove entries and files whose source image was deleted |
| `validate` | Check JSON, files, decodability, alt text and legacy host references. CI runs this. |

Edit `alt` and `caption` directly in the album JSON. They are kept on later runs.

### Image quality

Settings are in `tools/gallery.config.json`: `widths`, `quality` (resized files, default 90), `full_quality` (full size, default 92) and `method` (WebP effort, default 6). Changing them regenerates everything on the next `build`. On representative dark, cinematic frames q92 measured roughly 39 to 48 dB PSNR against the originals at 5 to 20 times smaller than the PNGs.

### Album covers and homepage

- The cover for an album is `card-image` (an index into the album JSON) in its post front matter.
- The homepage selected photographs are listed in `_data/featured.yml`, in display order. The first one also becomes the default social preview.
- Optional `card-pos` in a post (for example `card-pos: 50% 30%`) moves the cover crop on album tiles.

## Dependencies

Direct gems: `jekyll`, `jekyll-feed`, `jekyll-seo-tag`, `jekyll-sitemap`, plus `webrick` and `wdm` for local serving and `tzinfo` and `tzinfo-data` on Windows (Jekyll fails without them there). Sass is used only through Jekyll itself; the stylesheet is plain CSS in `assets/css/site.css`.

## Deployment

Pushing to `main` runs `.github/workflows/jekyll.yml`: validate the gallery, build with Bundler and Jekyll 4.4, deploy to GitHub Pages. This needs Pages configured with the "GitHub Actions" source. The `CNAME` file keeps the custom domain.

GitHub Pages limits: published site under 1 GB, repository ideally under 1 GB (soft), 100 MB per file, 10 minute deploys, soft bandwidth limit of 100 GB per month. The gallery is about 128 MB.

## Troubleshooting

- `cannot load such file -- tzinfo` on Windows: run `bundle install`.
- `ruby` is not recognised after installing: open a new terminal.
- `jekyll serve` fails with webrick errors: `bundle install` and use `bundle exec`.
- `validate` reports a missing file: run `python tools/gallery.py build` with the original images available.
- Gallery images do not update in the browser: GitHub Pages caches for 10 minutes, hard refresh.

## Migration record

`tools/migration/` holds the pre-migration JSON backup and `lensdump-migration.json`, which maps every old Lensdump URL to its new local file. The Lensdump originals were left untouched.

## Licence

Code: [MIT](LICENSE). Photographs: [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/), by PatrickJr.
