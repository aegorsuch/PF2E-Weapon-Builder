# PF2e Weapon Builder

A Vue-based web app for designing custom Pathfinder 2e weapons using point-budget rules. It supports melee, ranged, and combination weapons with live validation and trait filtering.

## Features

- `Melee`, `Ranged`, and `Combination` modes.
- Live total budget progress bar and per-form quota bars in combination mode.
- Mode state memory: switching modes restores the last build for that mode.
- `Clear All` button to reset all modes back to defaults.
- Group whitelist and rule checks that disable illegal trait choices.
- Trait label expansion in summary for traits like `Deadly`, `Fatal`, `Fatal Aim`, and `Two-Hand`.
- Combination summary handling for `Combination` and `Critical Fusion` traits.
- Warnings panel for invalid selections and quota failures.
- Copy-to-clipboard actions for melee and ranged trait summaries.
- Optional ancestry tag added to output traits.

## Project Setup

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
