# Analytics

The site uses the existing Google Analytics 4 property, measurement ID `G-XXPKD9SFHL` (`google_analytics` in `_config.yml`). No new property, no Google Tag Manager.

Analytics is opt in. A visitor who rejects, ignores the banner, or sends Global Privacy Control or Do Not Track never loads anything from Google.

## How it works

| File | Role |
|---|---|
| `assets/js/analytics.js` | Consent, loading the Google tag, event validation and every `gtag()` call. Production builds only. |
| `assets/js/viewer.js` | Dispatches `viewer:view`, `viewer:zoom`, `viewer:fullscreen` and `viewer:download` DOM events. It knows nothing about Google and works unchanged without analytics. |
| `_layouts/default.html` | Sets `window.VP_ANALYTICS` and loads `analytics.js` (deferred, before the viewer) in production only. |
| `_layouts/album.html` | Puts `data-album`, `data-game` and `data-count` on the gallery list. |
| `pages/privacy.md` | Privacy page with the preference button. |

Local builds (`jekyll serve`) contain no analytics code at all. Production builds contain it.

## Consent

1. Page loads with Consent Mode v2 defaults: `ad_storage`, `ad_user_data`, `ad_personalization` and `analytics_storage` all `denied`. Nothing is sent and the Google script is not requested.
2. No stored choice: a compact Accept / Reject banner appears. Both buttons look the same.
3. Accept: `analytics_storage` is updated to `granted`, `gtag.js` is loaded 1.5 seconds after the page `load` event so it never competes with the photographs, and `config` runs with `cookie_domain` pinned to the current hostname and `allow_google_signals` and `allow_ad_personalization_signals` set to `false`. The ad signals stay `denied` permanently.
4. Reject, or revoking later: `ga-disable-G-XXPKD9SFHL` is set, `analytics_storage` is set to `denied`, and the `_ga` and `_ga_XXPKD9SFHL` cookies for this hostname are deleted. Cookies on `grimtech.co.uk` or other subdomains are never written or removed by this site.
5. The choice is stored in `localStorage` under `vp-consent` and expires after 12 months.
6. Visitors reopen the choice from Privacy (footer) and "Change analytics preference".

Turn analytics off in your own browser, so your visits do not pollute the stats: open any page with `?analytics=off`. Use `?analytics=on` to undo it. This sets `vp-analytics-off` in that browser only.

## Events

Event counts are not visitors. One person opening ten screenshots creates ten `screenshot_view` events and counts as one user. Use **Users** for people, **Sessions** for visits, **Event count** for activity.

| Event | Sent when | Parameters |
|---|---|---|
| `page_view` | GA4 default, once per page load | Standard. Not customised. |
| `album_view` | Once per album page load, after consent. Not sent on the homepage. | `game_name`, `album_slug`, `screenshot_count` |
| `screenshot_view` | A screenshot is opened (click, deep link) or the viewer moves to another one (arrows, Home, End, swipe, Previous, Next). | `game_name`, `album_slug`, `screenshot_id`, `screenshot_name`, `view_source` |
| `screenshot_zoom` | First zoom beyond 1.2x on a screenshot view. Moving to another screenshot re-arms it. | `game_name`, `album_slug`, `screenshot_id` |
| `screenshot_fullscreen` | The viewer actually enters fullscreen. A refused request sends nothing. | `game_name`, `album_slug`, `screenshot_id` |
| `screenshot_download` | The Download button in the viewer is clicked. Counts the click, not a confirmed completed download. | `game_name`, `album_slug`, `screenshot_id`, `file_format` |
| `outbound_click` | A link to another site is clicked (footer, header or page content). Internal and `mailto:` links are ignored. | `platform`, `destination_category`, `link_location` |

Parameter values:

- `screenshot_id` is `<album_slug>/<id>`, for example `Fallout-4/brutalism`. It comes from the file name, so it survives regeneration. GA4 caps values at 100 characters. The two long Horizon Forbidden West IDs are cut to 91 characters plus `-` and an 8 character FNV-1a hash of the full ID, so they stay deterministic and distinct. Gallery URLs and anchors keep the full ID.
- `screenshot_name` is the original file name.
- `view_source`: `album` (clicked on the album page), `home` (opened from Selected Work), `direct` (shared or bookmarked link, or any other referrer), `navigation` (moved within the viewer).
- `platform`: `x`, `flickr`, `steam`, `github`, `reddit`, `creativecommons`, or the bare hostname.
- `destination_category`: `social`, `photo_sharing`, `gaming`, `code`, `license`, `other`.
- `link_location`: `footer`, `header` or `content`.

Counting rules:

- Scrolling past an image never counts. Only the viewer opening or moving does.
- Zoom, pan, resize and re-render never create a `screenshot_view`.
- Browser Back then Forward to the same screenshot is not counted twice. Reloading a page that has `#screenshot` in the URL is not counted again.
- Opening the same screenshot again after closing the viewer is a new view.
- Events are dropped, not queued, while consent is missing.

## GA4 configuration

The property is `vp.grimtech.co.uk` (stream `Virtual Photography`, `G-XXPKD9SFHL`). Its configuration is applied and checked by a local tool, not by hand:

```powershell
tools\ga4\.venv\Scripts\python.exe tools\ga4\ga4.py audit    # read only
tools\ga4\.venv\Scripts\python.exe tools\ga4\ga4.py plan     # compare, dry run
tools\ga4\.venv\Scripts\python.exe tools\ga4\ga4.py apply    # apply, then read back
tools\ga4\.venv\Scripts\python.exe tools\ga4\ga4.py verify   # read back only
```

The desired state is the `DESIRED` block in `tools/ga4/ga4.py`. The tool refuses to run unless exactly one web stream matches the measurement ID and its host is `vp.grimtech.co.uk`, and refuses to register a dimension that `assets/js/analytics.js` does not emit. Reports are written to `tools/ga4/reports/` (ignored by Git). The tool uses Google Application Default Credentials; nothing secret lives in this repository, and `tools/` is excluded from the site build.

Applied on 2026-10-22 and read back:

| Setting | Before | Now |
|---|---|---|
| Custom dimensions (event scope): `game_name`, `album_slug`, `screenshot_id`, `screenshot_name`, `view_source`, `platform`, `destination_category`, `link_location` | none | all eight |
| Enhanced measurement: page changes based on browser history events | on | off |
| Enhanced measurement: outbound clicks | on | off |
| Enhanced measurement: scrolls, site search, video, file downloads, form interactions | on | unchanged |
| Event data retention | 2 months | 14 months |
| User data retention | 14 months | unchanged |
| Google signals | disabled | unchanged |
| Key events | defaults only | `screenshot_download` added |

`screenshot_count` and `file_format` have no dimension on purpose. Dimensions only fill from events received after they were created and can take up to 24 hours to appear.

Setup from scratch (only needed on a new machine or account):

1. Install the Google Cloud CLI (`winget install Google.CloudSDK`) and sign in with `gcloud auth login`.
2. Use a Cloud project with the Google Analytics Admin API and Data API enabled (currently `vp-grimtech-ga4-admin`).
3. In that project, create an OAuth consent screen (External, Testing, your account as a test user) with the `analytics.edit` and `analytics.readonly` scopes, and a Desktop app OAuth client. Keep the client JSON outside the repository.
4. `gcloud auth application-default login --client-id-file=<client.json> --scopes=https://www.googleapis.com/auth/analytics.edit,https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/cloud-platform`
5. `uv venv tools/ga4/.venv` and `uv pip install --python tools/ga4/.venv/Scripts/python.exe google-analytics-admin google-analytics-data google-auth`.

Google's official read-only `analytics-mcp` server is registered in Claude Code (user scope, `uv tool run analytics-mcp`) for questions like "what are my top screenshots". It reads the same credentials.

`screenshot_download` is marked as a key event (applied by the tool). Nothing in the account setup is manual. Google's Data Processing Terms for the account were accepted on 17 January 2021.

## Reports

All standard GA4. No backend.

**Most popular screenshots.** Explore > Blank > Free form. Rows: Screenshot ID, Game name. Values: Event count. Filter: Event name exactly `screenshot_view`. Sort by Event count. Add Total users as a second value to see how many different people looked.

**Most popular screenshot per game.** Same exploration. Rows: Game name, then Screenshot ID. Filter on one Game name, or use the Nested rows option.

**Most popular games.** Same exploration. Rows: Game name. Values: Event count. Two copies of the table: one filtered to `album_view` (album visits), one to `screenshot_view` (screenshots looked at). Compare them.

**Homepage featured work.** Free form. Rows: Screenshot ID. Filter: Event name `screenshot_view` and View source exactly `home`. The same chart with `album` shows how many are opened from album pages instead.

**Viewer engagement.** Free form. Rows: Event name. Filter: Event name matches regex `screenshot_(zoom|fullscreen|download)`. Add Screenshot ID as a row to see which screenshots get zoomed or downloaded.

**External links.** Free form. Rows: Platform. Values: Event count. Filter: Event name `outbound_click`.

**Visitor acquisition.** Reports > Acquisition > Traffic acquisition (Session source / medium). Direct is `(direct) / (none)`, search is `google / organic`, Reddit is `reddit.com / referral`, Steam is `steamcommunity.com / referral`. Tag campaigns with `?utm_source=...&utm_medium=...&utm_campaign=...` and they appear in the same report. Reports > Tech > Tech details gives device category, browser and OS. Reports > User > Demographics > Demographic details gives country. Nothing custom is needed for any of these.

## Testing

```powershell
$env:JEKYLL_ENV = "production"; bundle exec jekyll build
$env:PLAYWRIGHT_MODULE = "<path to playwright\index.mjs>"   # only if playwright is not installed locally
node tests/analytics.mjs
node tests/viewer.mjs
```

The test script serves `_site`, intercepts every request to Google, and reads the events from `window.dataLayer`. It never contacts Google. It covers consent (blocked before consent, accept, reject, revoke, persistence, expiry, GPC, the opt-out switch, keyboard), each event, duplicate prevention (zoom, resize, Back and Forward, reload, deep link), outbound links, Google blocked, `analytics.js` missing, the 179 unique screenshot IDs, shortened long IDs, and cookie scoping on a `vp.example.localhost` host. `tests/viewer.mjs` checks the viewer itself (keys, hash, history, focus, fit).

Verify against the live property yourself:

1. Open the live site in a fresh private window, accept the banner, open a screenshot.
2. GA4 > Reports > Realtime. The event count card should list `screenshot_view`.
3. For parameters, install the Chrome extension "Google Analytics Debugger", then Admin > DebugView. Select your device and inspect each event.

Nothing here has been verified against the live property.

## Open decisions

- **Legal basis.** Google Analytics sets cookies and sends data to Google, so this site treats it as needing consent. UK rules are changing (the Data (Use and Access) Act 2025 adds an exemption for some statistical cookies). Check current ICO guidance before relaxing the opt-in. The privacy page is a plain-language draft, not legal advice. Read it and edit it.
- **International transfers.** The Data Processing Terms are already accepted. Check the international transfer position for your own records.
- **Existing history.** Data before this change was collected without consent. Nothing is changed in the property. Consider whether to keep it.
- **Cookie domain.** Cookies are scoped to `vp.grimtech.co.uk`. Visitors who already have a `_ga` cookie on `grimtech.co.uk` from earlier will keep it, and Google may still read it, so the client ID can carry over. This site never removes it.
- **Short visits.** Because the Google script waits 1.5 seconds after load, a consenting visitor who leaves sooner is not counted. Events before then queue and are sent once it loads.
- **Pageview timing.** After the first Accept on a page, `page_view` and `album_view` are sent for that page. The screenshot a visitor already opened before accepting is not counted.
