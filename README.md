# Sample Plugin Extended

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/mnaoumov)
[![GitHub release](https://img.shields.io/github/v/release/mnaoumov/obsidian-sample-plugin-extended)](https://github.com/mnaoumov/obsidian-sample-plugin-extended/releases)
[![GitHub downloads](https://img.shields.io/github/downloads/mnaoumov/obsidian-sample-plugin-extended/total)](https://github.com/mnaoumov/obsidian-sample-plugin-extended/releases)
[![Coverage: 100%](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/mnaoumov/obsidian-sample-plugin-extended)

The official [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin/) shows you
one command and a modal, and leaves the rest of a plugin to you: a settings tab, custom views, editor
extensions, tests, linting, releases. Every plugin then reinvents them slightly differently.

This is a **template plugin** for [Obsidian](https://obsidian.md/) with all of that already wired up.
Each feature it ships is a working sample of one building block — so you delete what you do not need
instead of researching what you do.

## Demo vault

**The documentation is a demo vault.** Every sample feature has a note that explains what it does and
how it is wired, so you can see each building block working before you start deleting.

**[Start reading here](<./demo-vault/00 Start.md>)** — it is plain markdown, so it works on GitHub with
nothing installed.

A copy of the vault ships with every release. You can access it via any of the following:

1. Running the **Sample Plugin Extended: Open demo vault** command.
2. Downloading `sample-plugin-extended-demo-vault-<version>.zip` (`<version>` is the release version) from the [Releases](https://github.com/mnaoumov/obsidian-sample-plugin-extended/releases).
3. Browsing its source in [`demo-vault/`](./demo-vault/README.md) in this repository.

## What it demonstrates

- **Commands, ribbon icon, status bar and the `obsidian-dev-utils` modals** — plain, editor-scoped and
  checked commands, plus alert, confirm, prompt and select-item dialogs.
  [01 Commands and modals](<./demo-vault/01 Commands and modals.md>)
- **Editor and renderer extensions** — an editor suggest, a CodeMirror widget, a code-block processor,
  a Markdown post-processor and an `obsidian://` protocol handler.
  [02 Editor features](<./demo-vault/02 Editor features.md>)
- **Custom views** — the same side view built three ways: a plain `ItemView`, a
  [Svelte](https://svelte.dev/) component and a [React](https://react.dev/) component.
  [03 Views](<./demo-vault/03 Views.md>)
- **A settings tab covering every `SettingEx` component** — text, numbers, toggles, dropdowns, dates
  and colors, each with the key it stores.
  [04 Settings](<./demo-vault/04 Settings.md>)

Around the samples sits the toolchain a released plugin needs: TypeScript build, unit and integration
tests, ESLint, dprint, cspell, and the release scripts from
[`obsidian-dev-utils`](https://github.com/mnaoumov/obsidian-dev-utils).

## Installation

This is a template to start a plugin **from**, not a plugin to install into a vault. Two ways to use
it:

### Generator (recommended)

Use the [Obsidian Plugin Yeoman Generator](https://github.com/mnaoumov/generator-obsidian-plugin) to
generate a customized copy — it fills in your plugin's name, id and author for you.

### Template

Use `GitHub`'s `Use this template` button to create your own copy of this repository.

Don't forget to text search for all `Sample` words and replace them accordingly.

## Debugging

By default, debug messages for this plugin are hidden.

To show them, run the following command:

```js
window.DEBUG.enable('sample-plugin-extended');
```

Replace `sample-plugin-extended` with your own plugin id once you have renamed it.

For more details, refer to the [documentation](https://mnaoumov.dev/obsidian-dev-utils/guides/debugging/).

## Contributing

Contributions are welcome — see [CONTRIBUTING](./CONTRIBUTING.md) to get set up.

## Support

<!-- markdownlint-disable MD033 -->

<a href="https://www.buymeacoffee.com/mnaoumov" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60" width="217"></a>

<!-- markdownlint-enable MD033 -->

## My other Obsidian resources

[See my other Obsidian resources](https://github.com/mnaoumov/obsidian-resources).

## License

© SampleFirstName SampleLastName
