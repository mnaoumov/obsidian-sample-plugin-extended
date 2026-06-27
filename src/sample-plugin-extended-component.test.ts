import type { Extension } from '@codemirror/state';
import type {
  Command,
  EditorSuggest,
  EditorSuggestContext,
  MarkdownPostProcessorContext,
  MarkdownView,
  ObsidianProtocolData,
  PluginManifest
} from 'obsidian';
import type { CommandRegistrar } from 'obsidian-dev-utils/obsidian/command-registrar';
import type { PluginNoticeComponent } from 'obsidian-dev-utils/obsidian/components/plugin-notice-component';
import type { EditorExtensionRegistrar } from 'obsidian-dev-utils/obsidian/editor-extension-registrar';
import type { EditorSuggestRegistrar } from 'obsidian-dev-utils/obsidian/editor-suggest-registrar';
import type { ExtensionsRegistrar } from 'obsidian-dev-utils/obsidian/extensions-registrar';
import type { HoverLinkSourceRegistrar } from 'obsidian-dev-utils/obsidian/hover-link-source-registrar';
import type { MarkdownCodeBlockProcessorRegistrar } from 'obsidian-dev-utils/obsidian/markdown-code-block-processor-registrar';
import type { MarkdownPostProcessorRegistrar } from 'obsidian-dev-utils/obsidian/markdown-post-processor-registrar';
import type { ObsidianProtocolHandlerRegistrar } from 'obsidian-dev-utils/obsidian/obsidian-protocol-handler-registrar';
import type { RibbonIconRegistrar } from 'obsidian-dev-utils/obsidian/ribbon-icon-registrar';
import type { StatusBarItemRegistrar } from 'obsidian-dev-utils/obsidian/status-bar-item-registrar';
import type { ViewRegistrar } from 'obsidian-dev-utils/obsidian/view-registrar';
import type { Mock } from 'vitest';

import { castTo } from 'obsidian-dev-utils/object-utils';
import { strictProxy } from 'obsidian-dev-utils/strict-proxy';
import {
  App,
  WorkspaceLeaf
} from 'obsidian-test-mocks/obsidian';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { SAMPLE_REACT_VIEW_TYPE } from './views/sample-react-view.tsx';
import { SAMPLE_SVELTE_VIEW_TYPE } from './views/sample-svelte-view.ts';
import { SAMPLE_VIEW_TYPE } from './views/sample-view.ts';

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
import { SamplePluginExtendedComponent } from './sample-plugin-extended-component.ts';

interface CheckCommand extends Command {
  checkCallback(checking: boolean): boolean;
}

interface EditorCommand extends Command {
  editorCallback(editor: EditorForCommand): void;
}

interface EditorForCommand {
  replaceSelection(text: string): void;
}

interface LayoutReadyComponentInternals {
  onLayoutReady(): Promise<void>;
}

interface PromptParams {
  valueValidator?(value: string): string | undefined;
}

// These registration methods are Obsidian `Component` methods that the test-mocks
// `Component` either does not record (`registerDomEvent`, `registerInterval`) or whose
// Callback we need to capture, so they are seeded with a `vi.fn` before `onload()` to
// Capture the really-registered callbacks.
interface SeedableComponent {
  registerDomEvent: ReturnType<typeof vi.fn>;
  registerInterval: ReturnType<typeof vi.fn>;
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
let component: SamplePluginExtendedComponent;
let showNoticeMock: PluginNoticeComponent['showNotice'];
let statusBarItemEl: HTMLElement;

let addCommandSpy: Mock<CommandRegistrar['addCommand']>;
let addRibbonIconSpy: Mock<RibbonIconRegistrar['addRibbonIcon']>;
let registerEditorExtensionSpy: Mock<EditorExtensionRegistrar['registerEditorExtension']>;
let registerEditorSuggestSpy: Mock<EditorSuggestRegistrar['registerEditorSuggest']>;
let registerExtensionsSpy: Mock<ExtensionsRegistrar['registerExtensions']>;
let registerHoverLinkSourceSpy: Mock<HoverLinkSourceRegistrar['registerHoverLinkSource']>;
let registerMarkdownCodeBlockProcessorSpy: Mock<MarkdownCodeBlockProcessorRegistrar['registerMarkdownCodeBlockProcessor']>;
let registerMarkdownPostProcessorSpy: Mock<MarkdownPostProcessorRegistrar['registerMarkdownPostProcessor']>;
let registerObsidianProtocolHandlerSpy: Mock<ObsidianProtocolHandlerRegistrar['registerObsidianProtocolHandler']>;
let registerViewSpy: Mock<ViewRegistrar['registerView']>;
let domEventSpy: ReturnType<typeof vi.fn>;
let intervalSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  appMock = App.createConfigured__();
  showNoticeMock = vi.fn<PluginNoticeComponent['showNotice']>();
  statusBarItemEl = createDiv();

  addCommandSpy = vi.fn<CommandRegistrar['addCommand']>((command) => command);
  addRibbonIconSpy = vi.fn<RibbonIconRegistrar['addRibbonIcon']>(() => createDiv());
  registerEditorExtensionSpy = vi.fn<EditorExtensionRegistrar['registerEditorExtension']>();
  registerEditorSuggestSpy = vi.fn<EditorSuggestRegistrar['registerEditorSuggest']>();
  registerExtensionsSpy = vi.fn<ExtensionsRegistrar['registerExtensions']>();
  registerHoverLinkSourceSpy = vi.fn<HoverLinkSourceRegistrar['registerHoverLinkSource']>();
  registerMarkdownCodeBlockProcessorSpy = vi.fn<MarkdownCodeBlockProcessorRegistrar['registerMarkdownCodeBlockProcessor']>();
  registerMarkdownPostProcessorSpy = vi.fn<MarkdownPostProcessorRegistrar['registerMarkdownPostProcessor']>();
  registerObsidianProtocolHandlerSpy = vi.fn<ObsidianProtocolHandlerRegistrar['registerObsidianProtocolHandler']>();
  registerViewSpy = vi.fn<ViewRegistrar['registerView']>();

  component = new SamplePluginExtendedComponent({
    app: appMock.asOriginalType__(),
    commandRegistrar: strictProxy<CommandRegistrar>({ addCommand: addCommandSpy }),
    editorExtensionRegistrar: strictProxy<EditorExtensionRegistrar>({ registerEditorExtension: registerEditorExtensionSpy }),
    editorSuggestRegistrar: strictProxy<EditorSuggestRegistrar>({ registerEditorSuggest: registerEditorSuggestSpy }),
    extensionsRegistrar: strictProxy<ExtensionsRegistrar>({ registerExtensions: registerExtensionsSpy }),
    hoverLinkSourceRegistrar: strictProxy<HoverLinkSourceRegistrar>({ registerHoverLinkSource: registerHoverLinkSourceSpy }),
    markdownCodeBlockProcessorRegistrar: strictProxy<MarkdownCodeBlockProcessorRegistrar>({
      registerMarkdownCodeBlockProcessor: registerMarkdownCodeBlockProcessorSpy
    }),
    markdownPostProcessorRegistrar: strictProxy<MarkdownPostProcessorRegistrar>({ registerMarkdownPostProcessor: registerMarkdownPostProcessorSpy }),
    obsidianProtocolHandlerRegistrar: strictProxy<ObsidianProtocolHandlerRegistrar>({ registerObsidianProtocolHandler: registerObsidianProtocolHandlerSpy }),
    pluginName: manifest.name,
    pluginNoticeComponent: strictProxy<PluginNoticeComponent>({ showNotice: showNoticeMock }),
    ribbonIconRegistrar: strictProxy<RibbonIconRegistrar>({ addRibbonIcon: addRibbonIconSpy }),
    statusBarItemRegistrar: strictProxy<StatusBarItemRegistrar>({ addStatusBarItem: vi.fn<StatusBarItemRegistrar['addStatusBarItem']>(() => statusBarItemEl) }),
    viewRegistrar: strictProxy<ViewRegistrar>({ registerView: registerViewSpy })
  });

  // `registerDomEvent` / `registerInterval` are Obsidian `Component` methods. Seeding them
  // With a `vi.fn` captures the really-registered callbacks so they can be invoked later.
  domEventSpy = vi.fn();
  intervalSpy = vi.fn((id: number) => id);

  const seedableComponent = castTo<SeedableComponent>(component);
  seedableComponent.registerDomEvent = domEventSpy;
  seedableComponent.registerInterval = intervalSpy;
});

function getCommand(id: string): Command {
  const command = addCommandSpy.mock.calls.map((call) => call[0]).find((cmd) => cmd.id === id);
  if (!command) {
    throw new Error(`Command ${id} not registered`);
  }

  return command;
}

function internals(): LayoutReadyComponentInternals {
  return castTo<LayoutReadyComponentInternals>(component);
}

describe('SamplePluginExtendedComponent', () => {
  describe('onload', () => {
    it('should register the layout ready callback', () => {
      const onLayoutReadySpy = vi.spyOn(appMock.workspace, 'onLayoutReady');
      component.onload();
      expect(onLayoutReadySpy).toHaveBeenCalled();
    });

    it('should add the sample commands', () => {
      component.onload();
      const ids = addCommandSpy.mock.calls.map((call) => call[0].id);
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

    it('should add ribbon icon', () => {
      component.onload();
      const params = addRibbonIconSpy.mock.calls[0]?.[0];
      expect(params?.icon).toBe('dice');
      expect(params?.title).toBe('Sample ribbon icon');
      expect(params?.callback).toBeTypeOf('function');
    });

    it('should add status bar item with text', () => {
      component.onload();
      expect(statusBarItemEl.textContent).toBe('Sample status bar item');
    });

    it('should register DOM event for dblclick', () => {
      component.onload();
      expect(domEventSpy).toHaveBeenCalledWith(activeDocument, 'dblclick', expect.any(Function));
    });

    it('should register editor extensions', () => {
      component.onload();
      const extensions = registerEditorExtensionSpy.mock.calls[0]?.[0] as Extension[] | undefined;
      expect(extensions).toHaveLength(2);
    });

    it('should register editor suggest', () => {
      component.onload();
      expect(registerEditorSuggestSpy).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should register vault create event', () => {
      component.onload();
      appMock.workspace.layoutReady = false;
      expect(() => {
        appMock.vault.trigger('create', strictProxy({ name: 'test.md' }));
      }).not.toThrow();
    });

    it('should register file extensions', () => {
      component.onload();
      expect(registerExtensionsSpy).toHaveBeenCalledWith({
        extensions: ['sample-extension-1', 'sample-extension-2'],
        viewType: SAMPLE_VIEW_TYPE
      });
    });

    it('should register hover link source', () => {
      component.onload();
      expect(registerHoverLinkSourceSpy).toHaveBeenCalledWith({
        id: SAMPLE_VIEW_TYPE,
        info: { defaultMod: true, display: manifest.name }
      });
    });

    it('should register interval', () => {
      component.onload();
      expect(intervalSpy).toHaveBeenCalledWith(expect.anything());
    });

    it('should register markdown code block processor', () => {
      component.onload();
      const params = registerMarkdownCodeBlockProcessorSpy.mock.calls[0]?.[0];
      expect(params?.language).toBe('sample-code-block-processor');
      expect(params?.handler).toBeTypeOf('function');
    });

    it('should register markdown post processor', () => {
      component.onload();
      const params = registerMarkdownPostProcessorSpy.mock.calls[0]?.[0];
      expect(params?.postProcessor).toBeTypeOf('function');
    });

    it('should register obsidian protocol handler', () => {
      component.onload();
      const params = registerObsidianProtocolHandlerSpy.mock.calls[0]?.[0];
      expect(params?.action).toBe('sample-action');
      expect(params?.handler).toBeTypeOf('function');
    });

    it('should register three views with factories', () => {
      component.onload();
      const EXPECTED_VIEW_COUNT = 3;
      expect(registerViewSpy).toHaveBeenCalledTimes(EXPECTED_VIEW_COUNT);

      const registeredTypes = registerViewSpy.mock.calls.map((call) => call[0].type);
      expect(registeredTypes).toEqual([SAMPLE_VIEW_TYPE, SAMPLE_SVELTE_VIEW_TYPE, SAMPLE_REACT_VIEW_TYPE]);

      const leaf = WorkspaceLeaf.create2__(appMock).asOriginalType3__();
      for (const call of registerViewSpy.mock.calls) {
        expect(call[0].viewCreator(leaf)).toBeDefined();
      }
    });
  });

  describe('private handlers (via really-registered callbacks)', () => {
    it('should show "Sample command" notice when sample command runs', () => {
      component.onload();
      getCommand('sample').callback?.();
      expect(showNoticeMock).toHaveBeenCalledWith('Sample command');
    });

    it('should call editor.replaceSelection in sample-editor command', () => {
      component.onload();
      const replaceSelection = vi.fn();
      (getCommand('sample-editor') as EditorCommand).editorCallback({ replaceSelection });
      expect(replaceSelection).toHaveBeenCalledWith('Sample Editor Command');
    });

    it('should return false for sample-with-check command when no MarkdownView', () => {
      component.onload();
      appMock.workspace.getActiveViewOfType = (): null => null;
      const result = (getCommand('sample-with-check') as CheckCommand).checkCallback(true);
      expect(result).toBe(false);
    });

    it('should return true for sample-with-check command when MarkdownView exists', () => {
      component.onload();
      const markdownView = strictProxy<MarkdownView>({});
      appMock.workspace.getActiveViewOfType = (() => markdownView) as typeof appMock.workspace.getActiveViewOfType;
      const result = (getCommand('sample-with-check') as CheckCommand).checkCallback(true);
      expect(result).toBe(true);
    });

    it('should show notice for sample-with-check command when checking is false', () => {
      component.onload();
      const markdownView = strictProxy<MarkdownView>({});
      appMock.workspace.getActiveViewOfType = (() => markdownView) as typeof appMock.workspace.getActiveViewOfType;
      (getCommand('sample-with-check') as CheckCommand).checkCallback(false);
      expect(showNoticeMock).toHaveBeenCalledWith('Sample command with check');
    });

    it('should show notice when ribbon icon clicked', () => {
      component.onload();
      const ribbonCallback = addRibbonIconSpy.mock.calls[0]?.[0].callback;
      ribbonCallback?.(new MouseEvent('click'));
      expect(showNoticeMock).toHaveBeenCalledWith('Sample ribbon icon command');
    });

    it('should show notice on dblclick DOM event with element target', () => {
      component.onload();
      const domCallback = domEventSpy.mock.calls[0]?.[2] as ((evt: MouseEvent) => void) | undefined;
      const el = activeDocument.createElement('div');
      const evt = new MouseEvent('dblclick', { bubbles: true });
      Object.defineProperty(evt, 'target', { value: el });
      domCallback?.(evt);
      expect(showNoticeMock).toHaveBeenCalledWith('Sample DOM event: DIV');
    });

    it('should show notice on dblclick DOM event with non-element target', () => {
      component.onload();
      const domCallback = domEventSpy.mock.calls[0]?.[2] as ((evt: MouseEvent) => void) | undefined;
      const evt = new MouseEvent('dblclick');
      domCallback?.(evt);
      expect(showNoticeMock).toHaveBeenCalledWith('Sample DOM event: ');
    });

    it('should show notice on obsidian protocol handler', async () => {
      component.onload();
      const protocolCallback = registerObsidianProtocolHandlerSpy.mock.calls[0]?.[0].handler;
      await protocolCallback?.(strictProxy<ObsidianProtocolData>({ action: 'test-action' }));
      expect(showNoticeMock).toHaveBeenCalledWith('Sample obsidian protocol handler: test-action');
    });

    it('should show notice on interval tick', () => {
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

      component.onload();
      intervalCallback?.();
      expect(showNoticeMock).toHaveBeenCalledWith('Sample interval tick');
      setIntervalSpy.mockRestore();
    });

    it('should show notice on vault create event when layout is ready', () => {
      component.onload();
      appMock.workspace.layoutReady = true;
      appMock.vault.trigger('create', strictProxy({ name: 'test.md' }));
      expect(showNoticeMock).toHaveBeenCalledWith('Sample event: test.md');
    });

    it('should not show notice on vault create event when layout is not ready', () => {
      component.onload();
      appMock.workspace.layoutReady = false;
      appMock.vault.trigger('create', strictProxy({ name: 'test.md' }));
      expect(showNoticeMock).not.toHaveBeenCalled();
    });

    it('should set text in code block processor', async () => {
      component.onload();
      const cbpCallback = registerMarkdownCodeBlockProcessorSpy.mock.calls[0]?.[0].handler;
      const el = activeDocument.createElement('div');
      await cbpCallback?.('source code', el, strictProxy<MarkdownPostProcessorContext>({}));
      expect(el.textContent).toBe('Sample code block processor');
    });

    it('should set text in markdown post processor when el has el-h6 class', async () => {
      component.onload();
      const mppCallback = registerMarkdownPostProcessorSpy.mock.calls[0]?.[0].postProcessor;
      const el = activeDocument.createElement('div');
      el.addClass('el-h6');
      await mppCallback?.(el, strictProxy<MarkdownPostProcessorContext>({}));
      expect(el.textContent).toBe('Sample markdown post processor');
    });

    it('should not change text in markdown post processor when el does not have el-h6 class', async () => {
      component.onload();
      const mppCallback = registerMarkdownPostProcessorSpy.mock.calls[0]?.[0].postProcessor;
      const el = activeDocument.createElement('div');
      await mppCallback?.(el, strictProxy<MarkdownPostProcessorContext>({}));
      expect(el.textContent).toBe('');
    });

    it('should register a usable editor suggest instance', () => {
      component.onload();
      const suggest = registerEditorSuggestSpy.mock.calls[0]?.[0] as EditorSuggest<string> | undefined;
      expect(suggest?.getSuggestions(strictProxy<EditorSuggestContext>({ query: 'Sample' }))).toEqual([
        'Sample 1',
        'Sample 2',
        'Sample 3'
      ]);
    });
  });

  describe('modal commands', () => {
    it('should not throw when show-sample-modal runs', () => {
      component.onload();
      expect(() => {
        getCommand('show-sample-modal').callback?.();
      }).not.toThrow();
    });

    it('should call alert when show-alert-modal command runs', async () => {
      component.onload();
      await getCommand('show-alert-modal').callback?.();
      expect(vi.mocked(mockAlert)).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Sample alert message', title: 'Sample alert title' })
      );
    });

    it('should call confirm when show-confirm-modal command runs', async () => {
      component.onload();
      await getCommand('show-confirm-modal').callback?.();
      expect(vi.mocked(mockConfirm)).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Sample confirm message', title: 'Sample confirm title' })
      );
    });

    it('should call prompt when show-prompt-modal command runs', async () => {
      component.onload();
      await getCommand('show-prompt-modal').callback?.();
      expect(vi.mocked(mockPrompt)).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Sample prompt title' })
      );
    });

    it('should have valueValidator that rejects short values in prompt', async () => {
      component.onload();
      await getCommand('show-prompt-modal').callback?.();
      const params = vi.mocked(mockPrompt).mock.calls.at(-1)?.[0] as PromptParams | undefined;
      expect(params?.valueValidator?.('short')).toContain('at least 30 characters');
    });

    it('should have valueValidator that allows long values in prompt', async () => {
      component.onload();
      await getCommand('show-prompt-modal').callback?.();
      const params = vi.mocked(mockPrompt).mock.calls.at(-1)?.[0] as PromptParams | undefined;
      expect(params?.valueValidator?.('this is a long enough value for the validator')).toBeUndefined();
    });

    it('should call selectItem when show-select-item-modal command runs', async () => {
      component.onload();
      await getCommand('show-select-item-modal').callback?.();
      expect(vi.mocked(mockSelectItem)).toHaveBeenCalledWith(
        expect.objectContaining({ items: ['Item 1', 'Item 2', 'Item 3'] })
      );
    });

    it('should have itemTextFunc that returns item in selectItem', async () => {
      component.onload();
      await getCommand('show-select-item-modal').callback?.();
      const params = vi.mocked(mockSelectItem).mock.calls.at(-1)?.[0] as SelectItemParams | undefined;
      expect(params?.itemTextFunc?.('Item 1')).toBe('Item 1');
    });

    it('should show confirm result notice when show-confirm-modal command runs', async () => {
      component.onload();
      await getCommand('show-confirm-modal').callback?.();
      expect(showNoticeMock).toHaveBeenCalledWith('Sample confirm result: true');
    });
  });

  describe('onLayoutReady', () => {
    it('should show notice and call ensureSideLeaf for three views', async () => {
      const ensureSideLeafSpy = vi.spyOn(appMock.workspace, 'ensureSideLeaf');
      await internals().onLayoutReady.call(component);

      expect(showNoticeMock).toHaveBeenCalledWith('This is executed after all plugins are loaded');

      const EXPECTED_CALLS = 3;
      expect(ensureSideLeafSpy).toHaveBeenCalledTimes(EXPECTED_CALLS);
      expect(ensureSideLeafSpy.mock.calls.map((call) => call[0])).toEqual([
        SAMPLE_VIEW_TYPE,
        SAMPLE_SVELTE_VIEW_TYPE,
        SAMPLE_REACT_VIEW_TYPE
      ]);
    });
  });
});
