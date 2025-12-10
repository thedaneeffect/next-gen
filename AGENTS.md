# AGENTS.md

## Commands
- `pnpm install` - Install dependencies (requires pnpm 9.x)
- `pnpm dev` - Start dev server with type watching
- `pnpm test` - Run all tests (vitest in watch mode)
- `pnpm test -- --run` - Run tests once without watch
- `pnpm test -- Accordion` - Run tests matching "Accordion"
- `pnpm lint` - Prettier check + ESLint
- `pnpm check` - Run svelte-check for type errors

## Code Style
- Tabs, double quotes, 100 char width (handled by prettier)
- Prefix unused vars with `_` to satisfy ESLint
- Use `$lib/` alias for imports within packages/melt
- Builders: PascalCase classes in `PascalCase.svelte.ts` files
- Utils: camelCase functions in `kebab-case.ts` files
- Type guards (`isHtmlElement`, `isFunction`) over try/catch

## Svelte 5 Patterns
- Runes: `$state`, `$derived`, `$effect` (no stores)
- Class builders with `#props` private field, expose spread attrs (`builder.root`)
- Use `extract()` to unwrap `MaybeGetter<T>` props with defaults
- Tests: `*.spec.svelte.ts` (browser/vitest), `*.test.ts` (unit)
