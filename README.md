# Knowledger Token Updater

> Automatically updates the knowledger bot token when you log into claude.ai.

## Features

- <!-- TODO: describe key features -->

## Installation

### From Source

1. Clone the repository:

```bash
git clone https://github.com/guidodinello/knowledger-token-updater.git
cd knowledger-token-updater
```

2. Install dependencies:

```bash
pnpm install
```

3. Build for your browser:

```bash
# Chrome/Chromium
pnpm build

# Firefox
pnpm build:firefox
```

4. Load the extension:
    - **Chrome**: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", select `.output/chrome-mv3`
    - **Firefox**: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", select any file in `.output/firefox-mv2`

### Development Mode

```bash
pnpm dev           # Chrome with hot reload
pnpm dev:firefox   # Firefox with hot reload
```

## Technology Stack

- **[WXT](https://wxt.dev/)** — Cross-browser extension framework
- **[Svelte 5](https://svelte.dev/)** — Reactive UI with runes API
- **[TypeScript](https://www.typescriptlang.org/)** — Type-safe development
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first styling
- **[Vite](https://vitejs.dev/)** — Fast build tool

## License

MIT License — see [LICENSE](LICENSE) for details

## Author

**Guido Dinello** — [@guidodinello](https://github.com/guidodinello)
