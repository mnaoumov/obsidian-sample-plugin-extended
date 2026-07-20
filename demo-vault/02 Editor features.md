[Docs](https://github.com/mnaoumov/obsidian-sample-plugin-extended/)

# Editor features

Beyond commands, the plugin extends the editor and the Markdown renderer. Try these in this note (switch between editing and reading views where noted).

## Editor suggest

Put your cursor on an empty line, type the single word `Sample`, and an autocomplete popup appears with three entries. Pick one and the plugin replaces it with `Transformed ...` text. The suggest only triggers when the line is exactly `Sample`.

## Inline widget

The plugin adds a CodeMirror editor extension that decorates the editor with a small 👉 widget. It is a sample decoration showing how a view plugin and a state field cooperate - you will see it rendered by the editor extension while editing.

## Sample code block

In **reading view**, the fenced block below is replaced by the text `Sample code block processor`, because the plugin registers a handler for the `sample-code-block-processor` language:

```sample-code-block-processor
This raw content is replaced when the note is rendered.
```

## Heading post-processor

The plugin also registers a Markdown post-processor that rewrites level-6 headings. In **reading view**, the heading below renders as `Sample markdown post processor`:

<!-- markdownlint-disable-next-line MD001 -->
###### This heading text is replaced on render

## Protocol handler

The plugin handles `obsidian://sample-action` URLs. Trigger one from outside Obsidian (or paste it into your browser) and a `Sample obsidian protocol handler: sample-action` notice appears.
