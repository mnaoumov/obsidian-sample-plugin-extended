# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Sample Plugin Extended is a showcase/template plugin demonstrating the `obsidian-dev-utils`-based plugin setup, including a sample Svelte UI component.

## Deviations from the standard plugin architecture

The workspace convention is that all plugins share the same architecture; intentional deviations are documented here.

- **Uses Svelte** — the only workspace plugin that does. It declares a `svelte` devDependency (`svelte@^5.56.4`) and ships a sample component at `src/svelte-components/sample-svelte-component.svelte`, included to demonstrate a Svelte UI inside an Obsidian plugin. `.svelte` files are bundled by the esbuild `build` step (`scripts/build.ts`); there is no separate `build:compile:svelte` script.
