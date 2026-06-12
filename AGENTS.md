# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository.

## Project

**Therra** — an MVP web application built with TypeScript and
[TanStack Start](https://tanstack.com/start). Currently a clean,
domain-agnostic starter; product features are built on top of it.

## Stack

| Concern        | Choice                                                  |
| -------------- | ------------------------------------------------------- |
| Language       | TypeScript (strict)                                     |
| Framework      | TanStack Start (full-stack React, file-based routing)   |
| Router         | TanStack Router                                         |
| Build / dev    | Vite                                                    |
| Package manager | **pnpm** (do not use npm or yarn)                       |
| Runtime        | Node.js 24                                              |
| E2E testing    | Playwright                                              |
| Environment    | Nix flake (`flake.nix`) — `devShells.default`           |

## Getting started

The development environment is pinned with Nix. Enter the shell before
running anything:

```bash
nix develop          # provides node 24, pnpm, typescript, playwright deps
pnpm install
pnpm dev             # start the dev server
```

If you use direnv, add `use flake` to `.envrc` to load the shell
automatically.

> **NixOS note:** Playwright's bundled Chromium needs `nix-ld`. The flake
> sets `NIX_LD`/`NIX_LD_LIBRARY_PATH` automatically and warns if
> `programs.nix-ld.enable = true;` is missing from your system config.

## Commands

Run these from inside `nix develop`:

| Task            | Command          |
| --------------- | ---------------- |
| Install deps    | `pnpm install`   |
| Dev server      | `pnpm dev`       |
| Production build | `pnpm build`    |
| Start (prod)    | `pnpm start`     |
| Typecheck       | `pnpm typecheck` |
| Lint            | `pnpm lint`      |
| Format          | `pnpm format`    |
| E2E tests       | `pnpm test:e2e`  |

> Some scripts above are added as the project grows. Check `package.json`
> for the current source of truth before assuming a script exists.

## Conventions

- **TypeScript strict mode** is on. No `any` without a written reason; no
  unchecked `// @ts-ignore`.
- **File-based routing**: route files live under `src/routes/`. Keep route
  components thin — push data loading into loaders and logic into modules
  under `src/lib/` or feature folders.
- **Server functions** (`createServerFn`) are the boundary to the backend.
  Validate all inputs at this boundary.
- Prefer **small, composable modules** over large files.
- Co-locate component, styles, and tests where it aids discovery.
- Keep imports absolute via the configured path alias (e.g. `~/`) rather
  than long relative chains, once configured.

## Project layout

```
.
├── flake.nix          # Nix dev environment
├── AGENTS.md          # this file
├── package.json       # scripts & deps (pnpm)
├── vite.config.ts     # Vite + TanStack Start plugin
├── tsconfig.json      # TypeScript config (strict)
└── src/
    ├── routes/        # file-based routes
    ├── components/    # shared UI components
    ├── lib/           # framework-agnostic logic, utilities
    └── styles/        # global styles
```

## Working agreements for agents

- Always work inside `nix develop`; do not install global tooling.
- Use **pnpm** for every dependency operation (`pnpm add`, `pnpm remove`).
  Never create a `package-lock.json` or `yarn.lock`.
- Run `pnpm typecheck` and `pnpm lint` before declaring a change done.
- Don't commit secrets. Use a `.env` file (gitignored) for local config.
- Keep this file up to date when stack, commands, or conventions change.
