---
name: release
description: Cut a new release of the knowledger-token-updater addon — bump version, build both targets, sign the Firefox xpi via AMO, and publish a GitHub release. Use when the user says "do the release", "release this", or "publish a new version".
---

# Release Skill

Cuts a full release of this addon: version bump, Chrome + Firefox build, AMO signing, GitHub release.

## Distribution model

| Target | Method |
|---|---|
| Firefox | Signed `.xpi` via `pnpm sign:firefox` → AMO unlisted listing (`knowledger-token-updater@guidodinello.dev`) |
| Chrome | Zip attached to GitHub release → load unpacked at work |

Firefox users install straight from AMO; there is no Chrome Web Store account, so GitHub is Chrome's only distribution channel. **Never attach the signed `.xpi` to the GitHub release** — AMO is already the authoritative, signed copy, and a second copy on GitHub risks someone installing a stale build after a future AMO-side change. (Re-litigated once already — don't redo this.)

## When invoked

The user says "let's do the release", "release this", "cut a new version", etc.

## Step 1 — Pre-flight

- `git status` — working tree must be clean. If not, stop and ask the user to commit first.
- Confirm on `main` and in sync with `origin/main`.
- `gh auth status` — the **active account must be `guidodinello`** (personal), not the `gdinlightit` work default. This repo's `.envrc` supplies `GH_TOKEN` via direnv; if the wrong account shows, stop and ask the user to check `direnv allow`.
- Read the current version from `package.json`.

## Step 2 — Choose the version

Show `git log v<prev>..HEAD --oneline` and propose a bump (patch by default). Confirm patch vs. minor/major with the user via AskUserQuestion if the changes look more than trivial.

## Step 3 — Guard against a burned version

**AMO version numbers are consumed permanently — a failed/duplicate submission cannot be retried under the same number.** Before doing anything else, check whether the target version already exists on AMO (see the polling snippet under Fallback below, `GET /versions/`). If it does, **do not sign again** — poll for its current status instead and pick up from there.

## Step 4 — Bump, but do not commit yet

Edit only the `"version"` field in `package.json`. WXT derives the manifest version from this file directly — no other file needs touching.

## Step 5 — Build and zip

```bash
pnpm build && pnpm build:firefox
pnpm zip && pnpm zip:firefox
```

Output in `.output/`: `<addon>-<version>-chrome.zip`, `-firefox.zip`, `-sources.zip`.

## Step 6 — Sign Firefox

Load credentials — **plain `source .env` does not export variables**, `web-ext` will see them as empty and AMO will reject with "No credentials provided":

```bash
set -a; source .env; set +a
```

Run signing **in the background** (`run_in_background: true`), since AMO approval has taken 1.5–7 minutes historically and any tool-level timeout that kills the process mid-wait will not cancel the upload server-side — a naive retry then fails with `"This upload has already been submitted."`:

```bash
pnpm sign:firefox
```

`sign:firefox` now includes `--approval-timeout=900000` (15 min), so `web-ext` itself waits for approval and downloads the signed `.xpi` to `web-ext-artifacts/` — this is verified behavior (all prior releases' xpis were written by `web-ext`, timestamped just after AMO's `file.created`).

Once it completes, sanity-check the signature:

```bash
unzip -l web-ext-artifacts/*<version>*.xpi | grep -i "META-INF/mozilla"
```

Never echo, `cat`, or `grep` the `.env` file in a way that could print `MOZILLA_JWT_SECRET` to output — redact if any inspection is unavoidable.

If signing fails outright (not a timeout — an actual rejection before submission), fix the issue and retry; nothing has been consumed yet. If it fails *after* submission (confirmed via the AMO polling check), treat the version as burned — bump to the next patch and start over from Step 4.

## Step 7 — Commit, tag, push

Only after signing succeeds — this ordering means a signing failure never leaves a public tag behind:

```bash
git add package.json && git commit -m "chore(release): bump version to <version>"
git tag v<version>
git push && git push --tags
```

## Step 8 — Create the GitHub release

Attach **only the Chrome zip**. Summarize commits since the last tag in the notes, and include install instructions for both targets:

```bash
gh release create v<version> \
  ".output/knowledger-token-updater-<version>-chrome.zip#Chrome Extension" \
  --title "v<version>" \
  --notes "## Changes
- <bullet summary from git log>

## Installation

### Firefox
Install via [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/knowledger-token-updater/) (unlisted — use the direct link).

### Chrome (load unpacked)
1. Download \`knowledger-token-updater-<version>-chrome.zip\` and extract it
2. Go to \`chrome://extensions\` → enable **Developer mode**
3. Click **Load unpacked** → select the extracted folder"
```

## Rules

- Never attach the `.xpi` to the GitHub release — AMO is the authoritative Firefox channel (see Distribution model above).
- Never echo/print `MOZILLA_JWT_SECRET` in any tool output.
- Never blindly retry a timed-out `sign` — check AMO first (Step 3 / Fallback).
- Recovery from a failed-after-submission sign is a new patch version and a new tag — never force-push or delete a tag.
- `web-ext-artifacts/` is gitignored — signed xpis stay local, never committed.
- Don't update `README.md` for a release — it's dev-setup focused and carries no version references.

## Fallback: poll AMO directly

Only needed if signing was interrupted or a version's status needs checking before deciding whether to sign. Generates a short-lived HS256 JWT inline — do not persist it to a file with the secret embedded, and never print `MOZILLA_JWT_SECRET` in the process:

```bash
set -a; source .env; set +a
JWT=$(node -e '
const crypto=require("crypto");
function b64(b){return b.toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
const now=Math.floor(Date.now()/1000);
const h=b64(Buffer.from(JSON.stringify({alg:"HS256",typ:"JWT"})));
const p=b64(Buffer.from(JSON.stringify({iss:process.env.MOZILLA_JWT_ISSUER,jti:String(now)+Math.random(),iat:now,exp:now+60})));
console.log(h+"."+p+"."+b64(crypto.createHmac("sha256",process.env.MOZILLA_JWT_SECRET).update(h+"."+p).digest()));
')
curl -s -H "Authorization: JWT $JWT" \
  "https://addons.mozilla.org/api/v5/addons/addon/knowledger-token-updater@guidodinello.dev/versions/?filter=all_with_unlisted"
```

Each version entry has `file.status` (`unreviewed` = still pending, `public` = signed and live) and `file.url` (authenticated download link — reuse the same `JWT` header to fetch it).
