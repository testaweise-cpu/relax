# Mona Roses 2.0

Relaunch von mona-roses.com – Next.js (App Router), TypeScript, Tailwind CSS,
next-intl (DE/EN), Keystatic. Daten zu Mieterinnen, Schichten und Anwesenheit
kommen aus VyceON (bis zur Fertigstellung der API aus fiktiven Mock-Daten).

> Ausführliche Betriebs- und Redaktionsanleitung folgt in Phase 9.

## Entwicklung

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev            # http://localhost:3000, Admin unter /keystatic
```

| Befehl           | Zweck                                       |
| ---------------- | ------------------------------------------- |
| `pnpm lint`      | ESLint                                      |
| `pnpm typecheck` | TypeScript (strict)                         |
| `pnpm test`      | Unit-Tests (Vitest)                         |
| `pnpm test:e2e`  | Smoke-Tests (Playwright, nach `pnpm build`) |
| `pnpm format`    | Prettier                                    |

## Docker

```bash
docker build -t mona-roses .
docker run --env-file .env.local -p 3000:3000 mona-roses
```

Siehe `docs/` für offene Fragen an Kunde und VyceON.
