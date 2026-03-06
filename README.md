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
