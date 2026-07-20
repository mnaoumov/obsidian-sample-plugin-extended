[Docs](https://github.com/mnaoumov/obsidian-sample-plugin-extended/)

# Commands and modals

Sample Plugin Extended registers a handful of sample commands, a ribbon icon, and a status bar item. Each one shows a **notice** so you can see it fired.

## Palette commands

Open the Command Palette (`Ctrl/Cmd + P`) and run any of these:

- **Sample Plugin Extended: Sample** - shows a `Sample command` notice.
- **Sample Plugin Extended: Sample editor** - inserts the text `Sample Editor Command` at the cursor (works only while editing a note).
- **Sample Plugin Extended: Sample with check** - a *checked* command: it is only available when a Markdown note is the active view. Open this note in editing mode, then run it to see the `Sample command with check` notice.

## Ribbon icon and status bar

- Click the **dice** icon in the left ribbon (its tooltip reads *Sample ribbon icon*) - a `Sample ribbon icon command` notice appears.
- Look at the bottom status bar: it shows a **Sample status bar item**.

## Double-click event

Double-click anywhere in the app. The plugin listens for the DOM `dblclick` event and shows a `Sample DOM event: ...` notice naming the element you clicked.

## Modals

These commands open the modal helpers shipped by `obsidian-dev-utils`:

- **Show sample modal** - a bare modal that displays `Sample modal`.
- **Show alert modal** - an alert dialog with a title and message.
- **Show confirm modal** - a yes/no dialog; the result is reported in a notice.
- **Show prompt modal** - a text prompt that validates its input (it requires at least 30 characters).
- **Show select item modal** - a fuzzy picker over `Item 1`, `Item 2`, `Item 3`.
