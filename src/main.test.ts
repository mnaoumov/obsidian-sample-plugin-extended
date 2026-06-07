import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

vi.mock('obsidian-dev-utils/obsidian/plugin/plugin', () => ({
  PluginBase: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/components/plugin-settings-tab-component', () => ({
  PluginSettingsTabComponent: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/components/plugin-settings-component', () => ({
  PluginSettingsComponentBase: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/plugin/plugin-settings-tab', () => ({
  PluginSettingsTabBase: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/setting-ex', () => ({
  SettingEx: vi.fn()
}));

vi.mock('obsidian', () => ({
  EditorSuggest: vi.fn(),
  ItemView: vi.fn(),
  MarkdownView: vi.fn(),
  Modal: vi.fn(),
  Notice: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/data-handler', () => ({
  PluginDataHandler: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/plugin/plugin-event-source', () => ({
  PluginEventSourceImpl: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/modals/alert', () => ({
  alert: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/modals/confirm', () => ({
  confirm: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/modals/prompt', () => ({
  prompt: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/modals/select-item', () => ({
  selectItem: vi.fn()
}));

vi.mock('obsidian-dev-utils/async', () => ({
  convertAsyncToSync: vi.fn()
}));

vi.mock('obsidian-dev-utils/debug', () => ({
  getDebugger: vi.fn()
}));

vi.mock('obsidian-dev-utils/function', () => ({
  noopAsync: vi.fn()
}));

vi.mock('svelte', () => ({
  mount: vi.fn(),
  unmount: vi.fn()
}));

vi.mock('./svelte-components/sample-svelte-component.svelte', () => ({
  default: vi.fn()
}));

vi.mock('@codemirror/state', () => ({
  RangeSetBuilder: vi.fn(),
  StateField: { define: vi.fn() },
  Transaction: vi.fn()
}));

vi.mock('@codemirror/view', () => ({
  Decoration: { none: null, replace: vi.fn() },
  EditorView: { decorations: { from: vi.fn() } },
  ViewPlugin: { fromClass: vi.fn() },
  WidgetType: vi.fn()
}));

vi.mock('@codemirror/language', () => ({
  syntaxTree: vi.fn()
}));

vi.mock('./styles/main.scss', () => ({}));

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import Plugin from './main.ts';
// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { Plugin as PluginClass } from './plugin.ts';

describe('main', () => {
  it('should export Plugin as default export', () => {
    expect(Plugin).toBe(PluginClass);
  });
});
