[Docs](https://github.com/mnaoumov/obsidian-sample-plugin-extended/)

# Views

Sample Plugin Extended registers three custom side views, each built with a different UI approach, to show how a plugin can render its own panes.

## Where to find them

When the plugin finishes loading, it opens all three views in the **right sidebar** automatically. If you close them, you can reopen each from the Command Palette by searching for its name:

- **Sample view** - a plain `ItemView` that renders a heading.
- **Sample svelte view** - the same idea implemented with a [Svelte](https://svelte.dev/) component.
- **Sample react view** - implemented with a [React](https://react.dev/) component.

On first load you will also see a `This is executed after all plugins are loaded` notice - that is the plugin's *layout ready* hook firing once Obsidian has finished starting up.

## Hover links

The plugin registers itself as a hover-link source, so its view type participates in Obsidian's link-preview system - another integration point a real plugin often needs.
