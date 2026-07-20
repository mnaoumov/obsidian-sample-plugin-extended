[Docs](https://github.com/mnaoumov/obsidian-sample-plugin-extended/)

# Settings

Open **Settings -> Community plugins -> Sample Plugin Extended** to see the settings tab. It exists to demonstrate every setting component that `obsidian-dev-utils` provides via `SettingEx`, so it is deliberately exhaustive. Each option below lists the setting key stored in the plugin's `data.json`.

The tab also shows a few **action-only** rows with no stored value - a button, an extra button, a file picker, and a multiple-file picker - which just fire a notice when used.

## Text-like values

- `textSetting` - a plain text field (also reused by the advanced text row that converts its value on save).
- `textAreaSetting` - a multi-line text area.
- `multipleTextSetting` - a list of text values.
- `searchSetting` - a search field.
- `emailSetting` - a single email address.
- `multipleEmailSetting` - a list of email addresses.
- `urlSetting` - a URL field.
- `codeHighlighterSetting` - a syntax-highlighted code editor (JavaScript).

## Numbers and ranges

- `numberSetting` - a numeric field.
- `sliderSetting` - a slider.
- `progressBarSetting` - a read-only progress bar.

## Toggles and checkboxes

- `checkboxSetting` - a checkbox.
- `toggleSetting` - a toggle switch.
- `triStateCheckboxSetting` - a checkbox with an indeterminate (null) state.

## Choices

- `dropdownSetting` - a single-select dropdown.
- `multipleDropdownSetting` - a multi-select dropdown.
- `typedDropdownSetting` - a single-select dropdown backed by typed objects.
- `typedMultipleDropdownSetting` - a multi-select dropdown backed by typed objects.

## Dates and time

- `dateSetting` - a date picker.
- `dateTimeSetting` - a date-and-time picker.
- `timeSetting` - a time/duration picker.
- `monthSetting` - a month picker.
- `weekSetting` - a week picker.
- `momentFormatSetting` - a `moment` format string with a live preview.

## Other

- `colorSetting` - a color picker.
