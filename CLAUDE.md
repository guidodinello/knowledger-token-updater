# Claude Code Guidelines for Knowledger Token Updater

## Git Workflow

### Branch Naming

- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-change` - Documentation updates
- `refactor/refactor-description` - Code refactoring
- `style/style-change` - Code style changes
- `test/test-description` - Test additions or changes
- `chore/chore-description` - Build process or auxiliary tool changes

**Always create a new branch from `main` before starting work.**

### Commit Messages

Use Conventional Commits format with single-line messages (no description):

```
<type>: <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pre-commit and Pre-push Hooks

**Pre-commit:** lint-staged — formats and lints `.js`, `.ts`, `.svelte` files; formats `.json`, `.md`, `.css`, `.html`

**Pre-push:** `pnpm check` (type checking) + `pnpm build` (build verification)

**Never bypass hooks.** If hooks fail, fix the issues before committing.

## Code Organization

### Project Structure

```
src/
├── entrypoints/          # Extension entry points (background, content, popup, options)
├── lib/
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions (logger, cn, etc.)
│   ├── components/       # Shared Svelte components
│   ├── storage.ts        # Browser storage wrapper (get/set/watch)
│   └── constants.ts      # Storage keys, defaults, app constants
└── public/
    └── icons/            # Extension icons: 16, 32, 48, 128 px PNGs
```

### File Naming Conventions

- **Components:** PascalCase — `Toast.svelte`, `SettingsPanel.svelte`
- **Utilities:** kebab-case — `logger.ts`, `validation.ts`
- **Types:** kebab-case — `format.ts`, `messages.ts`

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Explicit types for function parameters and return values
- `interface` for object shapes, `type` for unions/intersections
- Use `satisfies` for type checking without widening

### Svelte 5 (Runes API)

- Use runes exclusively: `$state`, `$derived`, `$effect`
- Keep components focused and single-responsibility
- Clean up `$effect` side effects with a return function

```svelte
<script lang="ts">
    let value = $state(false);

    $effect(() => {
        const unwatch = watchSomething((v) => (value = v));
        return () => unwatch();
    });
</script>
```

### State Management

- All persistent state goes through `storage.ts`
- Expose `get*`, `set*`, `watch*` functions — never call WXT storage directly from components
- Define all storage keys in `constants.ts`

### Styling

- Tailwind CSS 4, utility-first
- Use `@/lib/utils/cn.ts` for conditional class names
- Dark mode via `dark:` variants; `:root { color-scheme: light dark }` already set in `app.css`

### Logging

- Use the centralized logger from `@/lib/utils/logger.ts`
- Log levels: `debug`, `info`, `warn`, `error`
- `debug` is stripped in production builds automatically

## Coding Philosophy

**Keep it minimal:** Only make changes directly requested or clearly necessary. Don't add features or abstractions beyond what was asked.

**Don't be defensive:** Don't handle theoretical edge cases that won't happen. Only validate at system boundaries (user input, external APIs). Trust internal code and framework guarantees.

**No dead code:** If something is unused, delete it completely — no commented-out code or deprecation wrappers.

## Testing

Before pushing:

1. Test in Chrome (primary target)
2. Test in Firefox (secondary target)
3. Verify all extension contexts work (popup, content script, options page if applicable)

## Available Scripts

```bash
pnpm dev              # Development mode (Chrome, hot reload)
pnpm dev:firefox      # Development mode (Firefox)
pnpm build            # Production build (Chrome MV3)
pnpm build:firefox    # Production build (Firefox MV2)
pnpm zip              # Create Chrome Web Store zip
pnpm zip:firefox      # Create Firefox AMO zip
pnpm check            # Type checking with svelte-check
pnpm lint             # ESLint
pnpm lint:fix         # ESLint with auto-fix
pnpm format           # Prettier
pnpm fix              # lint:fix + format + check in one go
pnpm generate-icons   # Render SVG source into 16/32/48/128 PNGs
```

## Key Principles

1. **Cross-browser** — always test Chrome and Firefox before pushing
2. **Type safety** — leverage TypeScript; avoid `any`
3. **Performance** — debounce expensive handlers, scope MutationObservers tightly
4. **Consistency** — follow existing patterns; don't invent new ones mid-project
