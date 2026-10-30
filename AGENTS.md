# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Filing an issue (for AI agents and humans)

Open issues through the [issue forms](https://github.com/mnaoumov/obsidian-sample-plugin-extended/issues/new/choose), not as blank issues.

Filing from the CLI or the API (`gh issue create --body`, or an AI agent filing for you) skips the form, and `gh issue create --template` cannot load an issue form. In that case, open the matching form in [`.github/ISSUE_TEMPLATE/`](https://github.com/mnaoumov/obsidian-sample-plugin-extended/tree/HEAD/.github/ISSUE_TEMPLATE), copy every field as a `### <label>` heading in the form's order, and fill in each one. Always state the plugin version, the Obsidian version and your operating system.

## Overview

`Sample Plugin Extended` is a showcase/template plugin demonstrating the plugin setup built on `@mnaoumov/obsidian-lib` and the `@mnaoumov` toolkits, including a sample Svelte UI component.

## Deviations from the standard plugin architecture

The workspace convention is that all plugins share the same architecture; intentional deviations are documented here.

- **Uses Svelte** — the only workspace plugin that does. It declares a `svelte` devDependency and ships a sample component at `src/svelte-components/sample-svelte-component.svelte`, included to demonstrate a Svelte UI inside an Obsidian plugin. `.svelte` files are bundled by the esbuild `build` step (`scripts/build.ts`); there is no separate `build:compile:svelte` script, so `build:compile` falls through to `@mnaoumov/typescript-dev-toolkit`'s own `buildCompileSvelte()`, which runs `svelte-check --tsconfig tsconfig.json` over the project. That step reads this repo's `package.json` and **throws** unless `svelte-check` is declared here, so the `svelte-check` devDependency is load-bearing even though no file imports it — which is also why `.depcheckrc.json` has to ignore it, with the reasoning recorded there.
- **The only plugin whose `scripts/version.ts` is not the canonical file** — every other plugin in the workspace ships a byte-identical 10-line `version.ts`. This one adds a guard that refuses to release while the root `.template` marker file exists, so the template cannot release itself. The guard is keyed to that **file** rather than to the template's plugin id on purpose: scaffolding a new plugin renames the id globally, which re-targets an id-keyed guard at the new plugin and blocks *its* releases instead — the defect `alias-quick-switcher` and `advanced-markdown-export` both shipped with. A file's existence survives any text rename. Scaffolding a copy therefore has one extra step: delete `.template`.
