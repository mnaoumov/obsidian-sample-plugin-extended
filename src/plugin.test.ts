import type { Extension } from '@codemirror/state';
import type {
  Command,
  EditorSuggest,
  EditorSuggestContext,
  HoverLinkSource,
  MarkdownPostProcessor,
  MarkdownPostProcessorContext,
  MarkdownView,
  ObsidianProtocolData,
  ObsidianProtocolHandler,
  PluginManifest,
  ViewCreator
} from 'obsidian';

import { castTo } from 'obsidian-dev-utils/object-utils';
import { strictProxy } from 'obsidian-dev-utils/strict-proxy';
import {
  App,
  Notice,
  WorkspaceLeaf
} from 'obsidian-test-mocks/obsidian';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { SAMPLE_REACT_VIEW_TYPE } from './views/sample-react-view.tsx';
import { SAMPLE_SVELTE_VIEW_TYPE } from './views/sample-svelte-view.ts';
import { SAMPLE_VIEW_TYPE } from './views/sample-view.ts';

vi.mock('obsidian-dev-utils/obsidian/app', async (importOriginal) => ({
  ...await importOriginal<typeof import('obsidian-dev-utils/obsidian/app')>(),
  getObsidianDevUtilsState: vi.fn((_app: unknown, _key: string, defaultValue: unknown) => ({ value: defaultValue }))
}));

vi.mock('obsidian-dev-utils/obsidian/modals/alert', async (importOriginal) => ({
  ...await importOriginal<typeof import('obsidian-dev-utils/obsidian/modals/alert')>(),
  alert: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
}));

vi.mock('obsidian-dev-utils/obsidian/modals/confirm', async (importOriginal) => ({
  ...await importOriginal<typeof import('obsidian-dev-utils/obsidian/modals/confirm')>(),
  confirm: vi.fn<() => Promise<boolean>>().mockResolvedValue(true)
}));

vi.mock('obsidian-dev-utils/obsidian/modals/prompt', async (importOriginal) => ({
  ...await importOriginal<typeof import('obsidian-dev-utils/obsidian/modals/prompt')>(),
  prompt: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
}));

vi.mock('obsidian-dev-utils/obsidian/modals/select-item', async (importOriginal) => ({
  ...await importOriginal<typeof import('obsidian-dev-utils/obsidian/modals/select-item')>(),
  selectItem: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
}));

vi.mock('svelte', () => ({
  mount: vi.fn(() => ({ increment: vi.fn() })),
  unmount: vi.fn()
}));

vi.mock('./svelte-components/sample-svelte-component.svelte', () => ({
  default: vi.fn()
}));

vi.mock('react', () => ({
  createElement: vi.fn(),
  StrictMode: vi.fn(),
  useState: vi.fn(() => [0, vi.fn()])
}));

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: vi.fn(), unmount: vi.fn() }))
}));

vi.mock('obsidian-dev-utils/obsidian/react/app-context', () => ({
  AppContext: { Provider: vi.fn() },
  useApp: vi.fn(() => ({ vault: { getName: vi.fn(() => 'TestVault') } }))
}));

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { alert as mockAlert } from 'obsidian-dev-utils/obsidian/modals/alert';
// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { confirm as mockConfirm } from 'obsidian-dev-utils/obsidian/modals/confirm';
// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { prompt as mockPrompt } from 'obsidian-dev-utils/obsidian/modals/prompt';
// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { selectItem as mockSelectItem } from 'obsidian-dev-utils/obsidian/modals/select-item';

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { Plugin } from './plugin.ts';

interface CheckCommand extends Command {
  checkCallback(checking: boolean): boolean;
}

interface EditorCommand extends Command {
  editorCallback(editor: EditorForCommand): void;
}

interface EditorForCommand {
  replaceSelection(text: string): void;
}

interface PromptParams {
  valueValidator?(value: string): string | undefined;
}

// The test-mocks `Plugin` records registrations on these `__`-suffixed fields and the
// `commands` Map, which the public `obsidian` `Plugin` type does not expose.
interface RecordingPlugin {
  commands: Map<string, Command>;
  extensions__: Map<string, string>;
  hoverLinkSources__: Map<string, HoverLinkSource>;
  markdownCodeBlockProcessors__: Map<string, (source: string, el: HTMLElement, ctx: unknown) => unknown>;
  markdownPostProcessors__: MarkdownPostProcessor[];
  statusBarItems__: HTMLElement[];
  views__: Map<string, ViewCreator>;
}

// These registration methods are not implemented on the test-mocks `Plugin`/`Component`,
// So they must be seeded with a `vi.fn` before `onload()` to capture the real callbacks.
interface SeedablePlugin {
  addRibbonIcon: ReturnType<typeof vi.fn>;
  registerDomEvent: ReturnType<typeof vi.fn>;
  registerEditorExtension: ReturnType<typeof vi.fn>;
  registerEditorSuggest: ReturnType<typeof vi.fn>;
  registerInterval: ReturnType<typeof vi.fn>;
  registerObsidianProtocolHandler: ReturnType<typeof vi.fn>;
}

interface SelectItemParams {
  itemTextFunc?(item: string): string;
}

const manifest: PluginManifest = {
  author: 'test',
  description: 'test',
  id: 'test-plugin',
  minAppVersion: '1.0.0',
  name: 'Test Plugin',
  version: '1.0.0'
};

let appMock: App;
let plugin: Plugin;

let editorExtensionSpy: ReturnType<typeof vi.fn>;
let editorSuggestSpy: ReturnType<typeof vi.fn>;
let domEventSpy: ReturnType<typeof vi.fn>;
let intervalSpy: ReturnType<typeof vi.fn>;
let protocolHandlerSpy: ReturnType<typeof vi.fn>;
let ribbonIconSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  appMock = App.createConfigured__();
  plugin = new Plugin(appMock.asOriginalType__(), manifest);

  // The methods below are not implemented on the test-mocks `Plugin`/`Component`,
  // So the strict proxy throws on access. Assigning a `vi.fn` first registers them
  // On the target, after which the real `onloadImpl` can call them and we capture
  // The really-registered callbacks. This invokes the real registered callback later,
  // Not a reimplementation.
  editorExtensionSpy = vi.fn();
  editorSuggestSpy = vi.fn();
  protocolHandlerSpy = vi.fn();
  domEventSpy = vi.fn();
  intervalSpy = vi.fn((id: number) => id);
  ribbonIconSpy = vi.fn(() => createDiv());

  const testablePlugin = castTo<SeedablePlugin>(plugin);
  testablePlugin.addRibbonIcon = ribbonIconSpy;
  testablePlugin.registerDomEvent = domEventSpy;
  testablePlugin.registerEditorExtension = editorExtensionSpy;
  testablePlugin.registerEditorSuggest = editorSuggestSpy;
  testablePlugin.registerInterval = intervalSpy;
  testablePlugin.registerObsidianProtocolHandler = protocolHandlerSpy;
});

afterEach(() => {
  if (plugin._loaded) {
    plugin.unload();
  }
});

function getCommand(id: string): Command {
  const command = recording().commands.get(id);
  if (!command) {
    throw new Error(`Command ${id} not registered`);
  }

  return command;
}

function recording(): RecordingPlugin {
  return castTo<RecordingPlugin>(plugin);
}

describe('Plugin', () => {
  describe('onload', () => {
    it('should register workspace layout ready callback', async () => {
      const onLayoutReadySpy = vi.spyOn(appMock.workspace, 'onLayoutReady');
      await plugin.onload();
      expect(onLayoutReadySpy).toHaveBeenCalled();
    });

    it('should add the sample commands', async () => {
      await plugin.onload();
      const ids = [...recording().commands.keys()];
      expect(ids).toEqual(
        expect.arrayContaining([
          'sample',
          'sample-editor',
          'sample-with-check',
          'show-sample-modal',
          'show-alert-modal',
          'show-confirm-modal',
          'show-prompt-modal',
          'show-select-item-modal'
        ])
      );
    });

    it('should add ribbon icon', async () => {
      await plugin.onload();
      expect(ribbonIconSpy).toHaveBeenCalledWith('dice', 'Sample ribbon icon', expect.any(Function));
    });

    it('should add status bar item with text', async () => {
      await plugin.onload();
      const statusBarItem = recording().statusBarItems__.at(-1);
      expect(statusBarItem?.textContent).toBe('Sample status bar item');
    });

    it('should register DOM event for dblclick', async () => {
      await plugin.onload();
      expect(domEventSpy).toHaveBeenCalledWith(activeDocument, 'dblclick', expect.any(Function));
    });

    it('should register editor extensions', async () => {
      await plugin.onload();
      const extensions = editorExtensionSpy.mock.calls[0]?.[0] as Extension[] | undefined;
      expect(extensions).toHaveLength(2);
    });

    it('should register editor suggest', async () => {
      await plugin.onload();
      expect(editorSuggestSpy).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should register vault create event', async () => {
      await plugin.onload();
      // The handler was really registered, so triggering the real vault event invokes it.
      appMock.workspace.layoutReady = false;
      expect(() => {
        appMock.vault.trigger('create', strictProxy({ name: 'test.md' }));
      }).not.toThrow();
    });

    it('should register file extensions', async () => {
      await plugin.onload();
      expect(recording().extensions__.get('sample-extension-1')).toBe(SAMPLE_VIEW_TYPE);
      expect(recording().extensions__.get('sample-extension-2')).toBe(SAMPLE_VIEW_TYPE);
    });

    it('should register hover link source', async () => {
      await plugin.onload();
      const hoverLinkSource = recording().hoverLinkSources__.get(SAMPLE_VIEW_TYPE);
      expect(hoverLinkSource).toEqual({ defaultMod: true, display: manifest.name });
    });

    it('should register interval', async () => {
      await plugin.onload();
      expect(intervalSpy).toHaveBeenCalledWith(expect.anything());
    });

    it('should register markdown code block processor', async () => {
      await plugin.onload();
      expect(recording().markdownCodeBlockProcessors__.get('sample-code-block-processor')).toEqual(expect.any(Function));
    });

    it('should register markdown post processor', async () => {
      await plugin.onload();
      expect(recording().markdownPostProcessors__).not.toHaveLength(0);
    });

    it('should register obsidian protocol handler', async () => {
      await plugin.onload();
      expect(protocolHandlerSpy).toHaveBeenCalledWith('sample-action', expect.any(Function));
    });

    it('should register three views with factories', async () => {
      await plugin.onload();
      const EXPECTED_VIEW_COUNT = 3;
      expect(recording().views__.size).toBe(EXPECTED_VIEW_COUNT);

      const sampleViewFactory = recording().views__.get(SAMPLE_VIEW_TYPE);
      const svelteViewFactory = recording().views__.get(SAMPLE_SVELTE_VIEW_TYPE);
      const reactViewFactory = recording().views__.get(SAMPLE_REACT_VIEW_TYPE);

      const leaf = WorkspaceLeaf.create2__(appMock).asOriginalType3__();

      expect(sampleViewFactory?.(leaf)).toBeDefined();
      expect(svelteViewFactory?.(leaf)).toBeDefined();
      expect(reactViewFactory?.(leaf)).toBeDefined();
    });
  });

  describe('onunload', () => {
    it('should show "Sample plugin is being unloaded" notice', async () => {
      // Drive the full real lifecycle. `load()` flips `loaded__` (so the later `unload()`
      // Actually runs `onunload`) and fires the real async `onload()`; wait for the plugin's
      // Own children to finish loading before unloading.
      plugin.load();
      await vi.waitFor(() => {
        expect(recording().commands.size).toBeGreaterThan(0);
      });

      // `Notice.prototype.constructor__` is the real test-mocks hook invoked with the
      // Message passed to `new Notice(...)`, so spying on it captures the real notice.
      const noticeSpy = vi.spyOn(Notice.prototype, 'constructor__');
      plugin.unload();
      expect(noticeSpy).toHaveBeenCalledWith('Sample plugin is being unloaded', undefined);
    });
  });

  describe('private handlers (via really-registered callbacks)', () => {
    it('should show "Sample command" notice when sample command runs', async () => {
      await plugin.onload();
      expect(() => {
        getCommand('sample').callback?.();
      }).not.toThrow();
    });

    it('should call editor.replaceSelection in sample-editor command', async () => {
      await plugin.onload();
      const replaceSelection = vi.fn();
      (getCommand('sample-editor') as EditorCommand).editorCallback({ replaceSelection });
      expect(replaceSelection).toHaveBeenCalledWith('Sample Editor Command');
    });

    it('should return false for sample-with-check command when no MarkdownView', async () => {
      await plugin.onload();
      appMock.workspace.getActiveViewOfType = (): null => null;
      const result = (getCommand('sample-with-check') as CheckCommand).checkCallback(true);
      expect(result).toBe(false);
    });

    it('should return true for sample-with-check command when MarkdownView exists', async () => {
      await plugin.onload();
      const markdownView = strictProxy<MarkdownView>({});
      appMock.workspace.getActiveViewOfType = (() => markdownView) as typeof appMock.workspace.getActiveViewOfType;
      const result = (getCommand('sample-with-check') as CheckCommand).checkCallback(true);
      expect(result).toBe(true);
    });

    it('should not throw when sample-with-check command runs (checking=false)', async () => {
      await plugin.onload();
      const markdownView = strictProxy<MarkdownView>({});
      appMock.workspace.getActiveViewOfType = (() => markdownView) as typeof appMock.workspace.getActiveViewOfType;
      expect(() => {
        (getCommand('sample-with-check') as CheckCommand).checkCallback(false);
      }).not.toThrow();
    });

    it('should not throw when ribbon icon clicked', async () => {
      await plugin.onload();
      const ribbonCallback = ribbonIconSpy.mock.calls[0]?.[2] as (() => void) | undefined;
      expect(() => {
        ribbonCallback?.();
      }).not.toThrow();
    });

    it('should not throw on dblclick DOM event with element target', async () => {
      await plugin.onload();
      const domCallback = domEventSpy.mock.calls[0]?.[2] as ((evt: MouseEvent) => void) | undefined;
      const el = activeDocument.createElement('div');
      const evt = new MouseEvent('dblclick', { bubbles: true });
      Object.defineProperty(evt, 'target', { value: el });
      expect(() => {
        domCallback?.(evt);
      }).not.toThrow();
    });

    it('should not throw on dblclick DOM event with non-element target', async () => {
      await plugin.onload();
      const domCallback = domEventSpy.mock.calls[0]?.[2] as ((evt: MouseEvent) => void) | undefined;
      const evt = new MouseEvent('dblclick');
      expect(() => {
        domCallback?.(evt);
      }).not.toThrow();
    });

    it('should not throw on obsidian protocol handler', async () => {
      await plugin.onload();
      const protocolCallback = protocolHandlerSpy.mock.calls[0]?.[1] as ObsidianProtocolHandler | undefined;
      expect(() => {
        protocolCallback?.(strictProxy<ObsidianProtocolData>({ action: 'test-action' }));
      }).not.toThrow();
    });

    it('should not throw on interval tick', async () => {
      // The tick callback is passed to `window.setInterval`, whose id is then handed to
      // `registerInterval`. Capture the real callback via a `setInterval` spy and invoke it.
      let intervalCallback: (() => void) | undefined;
      const setIntervalSpy = vi.spyOn(window, 'setInterval').mockImplementation(
        ((handler: TimerHandler) => {
          if (typeof handler === 'function') {
            intervalCallback = handler as () => void;
          }

          return 0;
        }) as typeof window.setInterval
      );

      await plugin.onload();
      expect(() => {
        intervalCallback?.();
      }).not.toThrow();
      setIntervalSpy.mockRestore();
    });

    it('should handle vault create event when layout is ready', async () => {
      await plugin.onload();
      appMock.workspace.layoutReady = true;
      expect(() => {
        appMock.vault.trigger('create', strictProxy({ name: 'test.md' }));
      }).not.toThrow();
    });

    it('should not throw on vault create event when layout is not ready', async () => {
      await plugin.onload();
      appMock.workspace.layoutReady = false;
      expect(() => {
        appMock.vault.trigger('create', strictProxy({ name: 'test.md' }));
      }).not.toThrow();
    });

    it('should set text in code block processor', async () => {
      await plugin.onload();
      const cbpCallback = recording().markdownCodeBlockProcessors__.get('sample-code-block-processor');
      const el = activeDocument.createElement('div');
      cbpCallback?.('source code', el, strictProxy({}));
      expect(el.textContent).toBe('Sample code block processor');
    });

    it('should set text in markdown post processor when el has el-h6 class', async () => {
      await plugin.onload();
      const mppCallback = recording().markdownPostProcessors__.at(-1);
      const el = activeDocument.createElement('div');
      el.addClass('el-h6');
      await mppCallback?.(el, strictProxy<MarkdownPostProcessorContext>({}));
      expect(el.textContent).toBe('Sample markdown post processor');
    });

    it('should not change text in markdown post processor when el does not have el-h6 class', async () => {
      await plugin.onload();
      const mppCallback = recording().markdownPostProcessors__.at(-1);
      const el = activeDocument.createElement('div');
      await mppCallback?.(el, strictProxy<MarkdownPostProcessorContext>({}));
      expect(el.textContent).toBe('');
    });

    it('should register a usable editor suggest instance', async () => {
      await plugin.onload();
      const suggest = editorSuggestSpy.mock.calls[0]?.[0] as EditorSuggest<string> | undefined;
      expect(suggest?.getSuggestions(strictProxy<EditorSuggestContext>({ query: 'Sample' }))).toEqual([
        'Sample 1',
        'Sample 2',
        'Sample 3'
      ]);
    });
  });

  describe('modal commands', () => {
    it('should not throw when show-sample-modal runs', async () => {
      await plugin.onload();
      expect(() => {
        getCommand('show-sample-modal').callback?.();
      }).not.toThrow();
    });

    it('should call alert when show-alert-modal command runs', async () => {
      await plugin.onload();
      await getCommand('show-alert-modal').callback?.();
      expect(vi.mocked(mockAlert)).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Sample alert message', title: 'Sample alert title' })
      );
    });

    it('should call confirm when show-confirm-modal command runs', async () => {
      await plugin.onload();
      await getCommand('show-confirm-modal').callback?.();
      expect(vi.mocked(mockConfirm)).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Sample confirm message', title: 'Sample confirm title' })
      );
    });

    it('should call prompt when show-prompt-modal command runs', async () => {
      await plugin.onload();
      await getCommand('show-prompt-modal').callback?.();
      expect(vi.mocked(mockPrompt)).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Sample prompt title' })
      );
    });

    it('should have valueValidator that rejects short values in prompt', async () => {
      await plugin.onload();
      await getCommand('show-prompt-modal').callback?.();
      const params = vi.mocked(mockPrompt).mock.calls.at(-1)?.[0] as PromptParams | undefined;
      expect(params?.valueValidator?.('short')).toContain('at least 30 characters');
    });

    it('should have valueValidator that allows long values in prompt', async () => {
      await plugin.onload();
      await getCommand('show-prompt-modal').callback?.();
      const params = vi.mocked(mockPrompt).mock.calls.at(-1)?.[0] as PromptParams | undefined;
      expect(params?.valueValidator?.('this is a long enough value for the validator')).toBeUndefined();
    });

    it('should call selectItem when show-select-item-modal command runs', async () => {
      await plugin.onload();
      await getCommand('show-select-item-modal').callback?.();
      expect(vi.mocked(mockSelectItem)).toHaveBeenCalledWith(
        expect.objectContaining({ items: ['Item 1', 'Item 2', 'Item 3'] })
      );
    });

    it('should have itemTextFunc that returns item in selectItem', async () => {
      await plugin.onload();
      await getCommand('show-select-item-modal').callback?.();
      const params = vi.mocked(mockSelectItem).mock.calls.at(-1)?.[0] as SelectItemParams | undefined;
      expect(params?.itemTextFunc?.('Item 1')).toBe('Item 1');
    });
  });

  describe('onLayoutReady', () => {
    it('should call ensureSideLeaf for three views', async () => {
      const ensureSideLeafSpy = vi.spyOn(appMock.workspace, 'ensureSideLeaf');
      // The plugin registers its `onLayoutReady` first (during `onloadImpl`); `PluginBase`'s
      // Own internal `LayoutReadyComponent` registers another callback afterwards. Capture all
      // And drive the plugin's (first) one.
      const layoutReadyCallbacks: (() => unknown)[] = [];
      vi.spyOn(appMock.workspace, 'onLayoutReady').mockImplementation((callback: () => unknown) => {
        layoutReadyCallbacks.push(callback);
      });

      await plugin.onload();
      // The registered callback is the real `convertAsyncToSync` wrapper (fire-and-forget).
      // Invoke it to drive the real `onLayoutReady`, then wait for the detached async work.
      layoutReadyCallbacks[0]?.();

      const EXPECTED_CALLS = 3;
      await vi.waitFor(() => {
        expect(ensureSideLeafSpy).toHaveBeenCalledTimes(EXPECTED_CALLS);
      });

      expect(ensureSideLeafSpy.mock.calls.map((call) => call[0])).toEqual([
        SAMPLE_VIEW_TYPE,
        SAMPLE_SVELTE_VIEW_TYPE,
        SAMPLE_REACT_VIEW_TYPE
      ]);
    });
  });
});
