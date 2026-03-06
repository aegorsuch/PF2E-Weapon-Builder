# PF2e Weapon Builder

![Codecov Coverage](https://codecov.io/gh/aegorsuch/PF2E-Weapon-Builder/branch/main/graph/badge.svg)

A Vue-based web app for designing custom Pathfinder 2e weapons using point-budget rules. It supports melee, ranged, and combination weapons with live validation and trait filtering.

## Features


## Usage

### Quick Start

1. Run `npm install` to install dependencies.
2. Run `npm run serve` to start the local development server.
3. Open your browser to `http://localhost:8080`.
4. Select a weapon mode (Melee, Ranged, Combination).
5. Choose traits and options, watch the budget bar update.
6. Use the warnings drawer for validation feedback.
7. Click "Copy Visible" to copy trait summaries.
8. Use "Clear All" to reset.

### Example Screenshot

![Weapon Builder Screenshot](docs/screenshot-placeholder.png)

> Replace this placeholder with a real screenshot for better documentation.

## Project Setup

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to help improve this project.

Prerequisites:

- Node.js 16+ (Node.js 18 LTS recommended)
- npm

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run serve
```

Build production bundle:

```bash
npm run build
```

Lint source files:

```bash
npm run lint
```

Alternative production build script (same output target, explicit `NODE_ENV=production`):

```bash
npm run prod
```

Deploy `dist/` to GitHub Pages (requires repo/pages setup):

```bash
npm run deploy
```

## Quality Policy

- Every change targeting `main` must pass automated CI quality checks.
- The `Quality Gate` workflow runs `npm ci`, `npm run lint`, and `npm run build` on PRs and pushes to `main`.
- The `README Guard` workflow enforces README review when docs-sensitive files change.
- If README updates are intentionally unnecessary, use the PR label `docs-not-needed`.

## Balancing Sources

The balancing model is based on community guides:

- Primary: [Emboar Bof's Custom Weapon Forge for PF2](https://docs.google.com/document/u/1/d/1NXkYl-TsPU16S7EnFhMtBhkj6dkbbQD7LhO_ch2MZPw/mobilebasic)
- Supplementary: [Pronate's Guide to Custom Weapons](https://docs.google.com/document/d/1j0uUtVcTgvn2a0oMYFKMwe_-tAPOdnFY21_0FOiX2DI/edit?usp=sharing)

## Notes

- This is a homebrew aid, not official Paizo tooling.
- Final balance decisions should be reviewed by your GM.

## Recent Changes

- Added mobile-first UX polish across trait/category workflows (collapsible sections, sticky quick actions/footer, and mobile warnings drawer).
- Improved accessibility: keyboard support for the warnings drawer (`Esc`, focus trap, and focus restore) and reduced-motion handling.
- Added trait search/filter and selected-trait chip management for faster editing on small screens.
- Optimized `public/android-chrome-512x512.png` to reduce asset size and remove production build size warnings.

## Accessibility & Mobile Controls

The mobile warnings drawer supports keyboard and reduced-motion use:

- `Esc` closes the warnings drawer.
- `Tab` and `Shift+Tab` stay trapped inside the drawer while it is open.
- Focus is moved into the drawer when opened and restored to the trigger when closed.
- Drawer trigger reports open state with ARIA attributes.
- Motion-heavy transitions are disabled when `prefers-reduced-motion: reduce` is enabled.

Mobile quick actions in the sticky footer:

- `Reset` clears the current build state.
- `Melee` and `Ranged` jump to the relevant form section.
- `Copy Visible` copies traits from the currently visible form(s).
- `No Issues` / `N Issues` opens the warnings drawer.
