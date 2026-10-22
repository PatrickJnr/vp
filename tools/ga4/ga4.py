"""Local GA4 administration for the virtual photography site.

Reads the desired configuration from DESIRED below, compares it with the live
property and applies the difference. Never runs against a property whose web
stream is not vp.grimtech.co.uk. Credentials come from Google Application
Default Credentials and are never stored in this repository.

    python tools/ga4/ga4.py audit     read only, writes a report
    python tools/ga4/ga4.py plan      compare and print the changes (dry run)
    python tools/ga4/ga4.py apply     apply the changes, then verify
    python tools/ga4/ga4.py verify    read back and check against DESIRED
"""
import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from google.analytics.admin_v1alpha import AnalyticsAdminServiceClient
from google.analytics.admin_v1alpha import types as t
from google.protobuf import field_mask_pb2

ROOT = Path(__file__).resolve().parents[2]
MEASUREMENT_ID = "G-XXPKD9SFHL"
HOST = "vp.grimtech.co.uk"

DESIRED = {
    "dimensions": [
        ("game_name", "Game name", "Title of the game being viewed"),
        ("album_slug", "Album slug", "Stable album identifier"),
        ("screenshot_id", "Screenshot ID", "album_slug/screenshot id"),
        ("screenshot_name", "Screenshot name", "Original screenshot file name"),
        ("view_source", "View source", "album, home, direct or navigation"),
        ("platform", "Platform", "Outbound link platform"),
        ("destination_category", "Destination category", "Outbound link category"),
        ("link_location", "Link location", "footer, header or content"),
    ],
    "enhanced": {"page_changes_enabled": False, "outbound_clicks_enabled": False},
    "event_retention": t.DataRetentionSettings.RetentionDuration.FOURTEEN_MONTHS,
    "signals": t.GoogleSignalsState.GOOGLE_SIGNALS_DISABLED,
    "key_events": ["screenshot_download"],
}


def emitted_parameters():
    src = (ROOT / "assets/js/analytics.js").read_text(encoding="utf8")
    block = re.search(r"var EVENTS = \{(.*?)\n  \};", src, re.S).group(1)
    events = {}
    for name, params in re.findall(r"(\w+): \[(.*?)\]", block, re.S):
        events[name] = re.findall(r"'(\w+)'", params)
    return events


def find_property(client):
    hits = []
    for acc in client.list_account_summaries():
        for ps in acc.property_summaries:
            for s in client.list_data_streams(parent=ps.property):
                if s.type_ == t.DataStream.DataStreamType.WEB_DATA_STREAM and s.web_stream_data.measurement_id == MEASUREMENT_ID:
                    hits.append((acc, ps, s))
    if len(hits) != 1:
        sys.exit(f"expected exactly one stream for {MEASUREMENT_ID}, found {len(hits)}")
    acc, ps, s = hits[0]
    host = urlparse(s.web_stream_data.default_uri if "//" in s.web_stream_data.default_uri else "//" + s.web_stream_data.default_uri).hostname
    if host != HOST:
        sys.exit(f"stream default URI host is {host!r}, expected {HOST!r}; refusing to continue")
    return acc, ps, s


def read_state(client, prop, stream):
    dims = {d.parameter_name: d for d in client.list_custom_dimensions(parent=prop)}
    em = client.get_enhanced_measurement_settings(name=f"{stream.name}/enhancedMeasurementSettings")
    ret = client.get_data_retention_settings(name=f"{prop}/dataRetentionSettings")
    sig = client.get_google_signals_settings(name=f"{prop}/googleSignalsSettings")
    keys = {k.event_name: k for k in client.list_key_events(parent=prop)}
    return dims, em, ret, sig, keys


def describe(dims, em, ret, sig, keys):
    return {
        "custom_dimensions": {k: {"display_name": d.display_name, "scope": d.scope.name, "resource": d.name} for k, d in sorted(dims.items())},
        "enhanced_measurement": {
            "stream_enabled": em.stream_enabled,
            "page_views": True,
            "scrolls_enabled": em.scrolls_enabled,
            "outbound_clicks_enabled": em.outbound_clicks_enabled,
            "site_search_enabled": em.site_search_enabled,
            "video_engagement_enabled": em.video_engagement_enabled,
            "file_downloads_enabled": em.file_downloads_enabled,
            "page_changes_enabled": em.page_changes_enabled,
            "form_interactions_enabled": em.form_interactions_enabled,
        },
        "data_retention": {
            "event_data_retention": ret.event_data_retention.name,
            "user_data_retention": ret.user_data_retention.name,
            "reset_user_data_on_new_activity": ret.reset_user_data_on_new_activity,
        },
        "google_signals": {"state": sig.state.name, "consent": sig.consent.name},
        "key_events": sorted(keys),
    }


def plan_changes(dims, em, ret, sig, keys):
    changes = []
    for param, display, desc in DESIRED["dimensions"]:
        d = dims.get(param)
        if d is None:
            changes.append(("create_dimension", param, f"create '{display}' (event scope)"))
        elif d.scope != t.CustomDimension.DimensionScope.EVENT:
            changes.append(("conflict", param, f"exists with scope {d.scope.name}; not modified"))
    for field, want in DESIRED["enhanced"].items():
        have = getattr(em, field)
        if have != want:
            changes.append(("enhanced", field, f"{have} -> {want}"))
    if ret.event_data_retention != DESIRED["event_retention"]:
        changes.append(("retention", "event_data_retention", f"{ret.event_data_retention.name} -> {DESIRED['event_retention'].name}"))
    if sig.state != DESIRED["signals"]:
        changes.append(("signals", "state", f"{sig.state.name} -> {DESIRED['signals'].name}"))
    for name in DESIRED["key_events"]:
        if name not in keys:
            changes.append(("key_event", name, f"mark {name} as a key event"))
    return changes


def apply_changes(client, prop, stream, changes, em):
    results = []
    for kind, key, text in changes:
        try:
            if kind == "create_dimension":
                param, display, desc = next(x for x in DESIRED["dimensions"] if x[0] == key)
                client.create_custom_dimension(parent=prop, custom_dimension=t.CustomDimension(
                    parameter_name=param, display_name=display, description=desc,
                    scope=t.CustomDimension.DimensionScope.EVENT))
            elif kind == "enhanced":
                setattr(em, key, DESIRED["enhanced"][key])
                client.update_enhanced_measurement_settings(
                    enhanced_measurement_settings=em,
                    update_mask=field_mask_pb2.FieldMask(paths=[key]))
            elif kind == "retention":
                client.update_data_retention_settings(
                    data_retention_settings=t.DataRetentionSettings(name=f"{prop}/dataRetentionSettings", event_data_retention=DESIRED["event_retention"]),
                    update_mask=field_mask_pb2.FieldMask(paths=["event_data_retention"]))
            elif kind == "signals":
                client.update_google_signals_settings(
                    google_signals_settings=t.GoogleSignalsSettings(name=f"{prop}/googleSignalsSettings", state=DESIRED["signals"]),
                    update_mask=field_mask_pb2.FieldMask(paths=["state"]))
            elif kind == "key_event":
                client.create_key_event(parent=prop, key_event=t.KeyEvent(event_name=key))
            else:
                results.append({"change": text, "key": key, "status": "skipped"})
                continue
            results.append({"change": text, "key": key, "status": "applied"})
        except Exception as e:
            results.append({"change": text, "key": key, "status": "failed", "error": f"{type(e).__name__}: {str(e)[:300]}"})
    return results


def verify(state_dims, em, ret, sig, keys):
    checks = {}
    for param, display, _ in DESIRED["dimensions"]:
        d = state_dims.get(param)
        checks[f"dimension {param}"] = bool(d and d.scope == t.CustomDimension.DimensionScope.EVENT and d.display_name == display)
    for field, want in DESIRED["enhanced"].items():
        checks[f"enhanced {field}={want}"] = getattr(em, field) == want
    checks["event retention 14 months"] = ret.event_data_retention == DESIRED["event_retention"]
    checks["google signals disabled"] = sig.state == DESIRED["signals"]
    for name in DESIRED["key_events"]:
        checks[f"key event {name}"] = name in keys
    return checks


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mode", choices=["audit", "plan", "apply", "verify"])
    args = ap.parse_args()

    client = AnalyticsAdminServiceClient()
    acc, ps, stream = find_property(client)
    prop = ps.property
    print(f"account   : {acc.display_name} ({acc.account})")
    print(f"property  : {ps.display_name} ({prop})")
    print(f"stream    : {stream.display_name} {stream.web_stream_data.default_uri} {stream.web_stream_data.measurement_id}")

    emitted = emitted_parameters()
    all_params = {p for ps_ in emitted.values() for p in ps_}
    wanted = {d[0] for d in DESIRED["dimensions"]}
    print("parameters emitted by analytics.js and not registered as dimensions (no action needed):", sorted(all_params - wanted))
    missing = sorted(wanted - all_params)
    print("desired dimensions the site never emits:", missing or "none")
    if missing:
        sys.exit("refusing: a desired dimension has no matching emitted parameter")

    dims, em, ret, sig, keys = read_state(client, prop, stream)
    report = {"time": datetime.now(timezone.utc).isoformat(), "account": acc.account, "property": prop, "stream": stream.name, "mode": args.mode, "before": describe(dims, em, ret, sig, keys)}
    changes = plan_changes(dims, em, ret, sig, keys)
    report["changes"] = [{"kind": k, "key": key, "text": txt} for k, key, txt in changes]

    if args.mode in ("plan", "apply"):
        print("\nchanges:" if changes else "\nno changes needed")
        for k, key, txt in changes:
            print(f"  [{k}] {key}: {txt}")

    if args.mode == "apply" and changes:
        report["results"] = apply_changes(client, prop, stream, changes, em)
        for r in report["results"]:
            print(f"  {r['status']:8} {r['change']}" + (f"  ({r['error']})" if "error" in r else ""))
        dims, em, ret, sig, keys = read_state(client, prop, stream)
        report["after"] = describe(dims, em, ret, sig, keys)

    if args.mode in ("apply", "verify"):
        report["verification"] = verify(dims, em, ret, sig, keys)
        print("\nverification:")
        for k, v in report["verification"].items():
            print(f"  {'PASS' if v else 'FAIL'} {k}")

    if args.mode == "audit":
        print(json.dumps(report["before"], indent=2))

    out = ROOT / "tools/ga4/reports"
    out.mkdir(exist_ok=True)
    path = out / f"{datetime.now().strftime('%Y%m%d-%H%M%S')}-{args.mode}.json"
    path.write_text(json.dumps(report, indent=2), encoding="utf8")
    print(f"\nreport: {path.relative_to(ROOT)}")
    if args.mode in ("apply", "verify") and not all(report["verification"].values()):
        sys.exit(1)


if __name__ == "__main__":
    main()
