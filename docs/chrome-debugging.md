● Build succeeded. The LSP warning about Timeout vs number is a tsconfig issue (Node types leaking in), not a runtime problem —
in Chrome, setTimeout always returns a number. The extension is ready to load.

To test it:

1. Open Chrome → chrome://extensions/ → enable Developer mode
2. Click Load unpacked → select /home/guido/projects/browser_addon/knowledger-token-updater/.output/chrome-mv3
3. Click the extension icon → enter your shared secret → click Save
4. Log out and back into claude.ai — the sessionKey cookie will be set on login, triggering the background script to POST the new token to the bot endpoint

You can watch the background script's logs in Inspect views → Service worker on the extensions page to see the
[KnowledgerTokenUpdater] log lines.