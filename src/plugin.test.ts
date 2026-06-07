import type {
  App,
  Component,
  PluginManifest
} from 'obsidian';

import { castTo } from 'obsidian-dev-utils/object-utils';
import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

interface MockAsyncCommand {
  callback(): Promise<void>;
  id: string;
}

interface MockCheckCommand {
  checkCallback(checking: boolean): boolean;
  id: string;
}

type MockCodeBlockCallback = (source: string, el: HTMLElement, ctx: unknown) => void;

interface MockCommand {
  callback(): void;
  id: string;
}

type MockDomEventCallback = (evt: MouseEvent) => void;

interface MockEditorCommand {
  editorCallback(editor: MockEditorForCommand): void;
  id: string;
}

interface MockEditorForCommand {
  replaceSelection(text: string): void;
}

interface MockItemTextParams {
  itemTextFunc?(item: string): string;
}

interface MockLayoutApp {
  workspace: MockWorkspaceLayout;
}

type MockMarkdownPostProcessCallback = (el: HTMLElement, ctx: unknown) => void;

type MockObsidianProtocolCallback = (params: MockObsidianProtocolParams) => void;

interface MockObsidianProtocolParams {
  readonly action: string;
}

interface MockPromptParams {
  valueValidator?(v: string): string | undefined;
}

type MockRibbonCallback = () => void;
interface MockVaultApp {
  vault: MockVaultWithOn;
}
type MockVaultCallback = (file: MockVaultFile) => void;
interface MockVaultFile {
  name: string;
}
interface MockVaultWithOn {
  on: ReturnType<typeof vi.fn>;
}
type MockViewFactory = (leaf: unknown) => unknown;
interface MockWorkspaceLayout {
  layoutReady: boolean;
}

const addedChildren: Component[] = [];

const hoisted = vi.hoisted(() => ({
  mockAddCommand: vi.fn(),
  mockAddRibbonIcon: vi.fn(),
  mockAddStatusBarItem: vi.fn(() => ({ setText: vi.fn() })),
  mockConvertAsyncToSync: vi.fn((fn: unknown) => fn),
  mockEnsureSideLeaf: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  mockGetActiveViewOfType: vi.fn(),
  mockLayoutReady: false,
  mockNotice: vi.fn(),
  mockOnLayoutReady: vi.fn(),
  mockRegisterDomEvent: vi.fn(),
  mockRegisterEditorExtension: vi.fn(),
  mockRegisterEditorSuggest: vi.fn(),
  mockRegisterEvent: vi.fn(),
  mockRegisterExtensions: vi.fn(),
  mockRegisterHoverLinkSource: vi.fn(),
  mockRegisterInterval: vi.fn(),
  mockRegisterMarkdownCodeBlockProcessor: vi.fn(),
  mockRegisterMarkdownPostProcessor: vi.fn(),
  mockRegisterObsidianProtocolHandler: vi.fn(),
  mockRegisterView: vi.fn()
}));

const PluginBaseMock = vi.hoisted(() => {
  return class {
    public addCommand = hoisted.mockAddCommand;
    public addRibbonIcon = hoisted.mockAddRibbonIcon;

    public addStatusBarItem = hoisted.mockAddStatusBarItem;

    public app: unknown;
    public manifest: unknown;
    public registerDomEvent = hoisted.mockRegisterDomEvent;
    public registerEditorExtension = hoisted.mockRegisterEditorExtension;
    public registerEditorSuggest = hoisted.mockRegisterEditorSuggest;
    public registerEvent = hoisted.mockRegisterEvent;
    public registerExtensions = hoisted.mockRegisterExtensions;
    public registerHoverLinkSource = hoisted.mockRegisterHoverLinkSource;
    public registerInterval = hoisted.mockRegisterInterval;
    public registerMarkdownCodeBlockProcessor = hoisted.mockRegisterMarkdownCodeBlockProcessor;
    public registerMarkdownPostProcessor = hoisted.mockRegisterMarkdownPostProcessor;
    public registerObsidianProtocolHandler = hoisted.mockRegisterObsidianProtocolHandler;
    public registerView = hoisted.mockRegisterView;
    public constructor(app: unknown, manifest: unknown) {
      this.app = app;
      this.manifest = manifest;
    }

    public addChild<T extends Component>(child: T): T {
      addedChildren.push(child);
      return child;
    }

    public async onload(): Promise<void> {
      /* No-op */
    }

    public onunload(): void {
      /* No-op */
    }
  };
});

vi.mock('obsidian-dev-utils/obsidian/plugin/plugin', () => ({
  PluginBase: PluginBaseMock
}));

vi.mock('obsidian-dev-utils/obsidian/components/plugin-settings-tab-component', () => ({
  PluginSettingsTabComponent: class MockPluginSettingsTabComponent {
    public constructor(public _params: unknown) {}
  }
}));

vi.mock('obsidian-dev-utils/obsidian/components/plugin-settings-component', () => ({
  PluginSettingsComponentBase: class MockPluginSettingsComponentBase {
    public constructor(public _params: unknown) {}
  }
}));

vi.mock('obsidian-dev-utils/obsidian/plugin/plugin-event-source', () => ({
  PluginEventSourceImpl: class MockPluginEventSourceImpl {
    public constructor(public _plugin: unknown) {}
  }
}));

vi.mock('obsidian-dev-utils/obsidian/plugin/plugin-settings-tab', () => ({
  PluginSettingsTabBase: class MockPluginSettingsTabBase {
    public constructor(public _params: unknown) {}
  }
}));

vi.mock('obsidian-dev-utils/obsidian/setting-ex', () => ({
  SettingEx: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/data-handler', () => ({
  PluginDataHandler: class MockPluginDataHandler {
    public constructor(public _plugin: unknown) {}
  }
}));

vi.mock('obsidian-dev-utils/async', () => ({
  convertAsyncToSync: hoisted.mockConvertAsyncToSync
}));

vi.mock('obsidian-dev-utils/debug', () => ({
  getDebugger: vi.fn(() => vi.fn())
}));

vi.mock('obsidian-dev-utils/obsidian/modals/alert', () => ({
  alert: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
}));

vi.mock('obsidian-dev-utils/obsidian/modals/confirm', () => ({
  confirm: vi.fn<() => Promise<boolean>>().mockResolvedValue(true)
}));

vi.mock('obsidian-dev-utils/obsidian/modals/prompt', () => ({
  prompt: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
}));

vi.mock('obsidian-dev-utils/obsidian/modals/select-item', () => ({
  selectItem: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
}));

vi.mock('obsidian-dev-utils/function', () => ({
  noopAsync: vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
}));

vi.mock('obsidian', () => ({
  EditorSuggest: vi.fn(),
  ItemView: vi.fn(),
  MarkdownView: vi.fn(),
  Modal: class {
    public open(): void {
      /* No-op */
    }
  },
  Notice: hoisted.mockNotice
}));

vi.mock('@codemirror/state', () => ({
  RangeSetBuilder: vi.fn(),
  StateField: { define: vi.fn(() => 'stateField') },
  Transaction: vi.fn()
}));

vi.mock('@codemirror/view', () => ({
  Decoration: { none: null, replace: vi.fn() },
  EditorView: { decorations: { from: vi.fn() } },
  ViewPlugin: { fromClass: vi.fn(() => 'viewPlugin') },
  WidgetType: vi.fn()
}));

vi.mock('@codemirror/language', () => ({
  syntaxTree: vi.fn()
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

function createPlugin(): Plugin {
  addedChildren.length = 0;

  const app = {
    vault: {
      on: vi.fn()
    },
    workspace: {
      ensureSideLeaf: hoisted.mockEnsureSideLeaf,
      getActiveViewOfType: hoisted.mockGetActiveViewOfType,
      layoutReady: hoisted.mockLayoutReady,
      onLayoutReady: hoisted.mockOnLayoutReady
    }
  };

  const manifest = castTo<PluginManifest>({ id: 'test', name: 'Test Plugin' });

  return new Plugin(castTo<App>(app), manifest);
}

describe('Plugin', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a plugin instance', () => {
      const plugin = createPlugin();
      expect(plugin).toBeInstanceOf(Plugin);
    });

    it('should add two child components', () => {
      addedChildren.length = 0;
      createPlugin();
      const EXPECTED_CHILD_COUNT = 2;
      expect(addedChildren).toHaveLength(EXPECTED_CHILD_COUNT);
    });
  });

  describe('onload', () => {
    it('should register workspace layout ready callback', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      expect(hoisted.mockOnLayoutReady).toHaveBeenCalled();
    });

    it('should add sample command', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const commandIds = hoisted.mockAddCommand.mock.calls.map((c: unknown[]) => (c[0] as MockCommand).id);
      expect(commandIds).toContain('sample');
    });

    it('should add sample-editor command', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const commandIds = hoisted.mockAddCommand.mock.calls.map((c: unknown[]) => (c[0] as MockCommand).id);
      expect(commandIds).toContain('sample-editor');
    });

    it('should add sample-with-check command', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const commandIds = hoisted.mockAddCommand.mock.calls.map((c: unknown[]) => (c[0] as MockCommand).id);
      expect(commandIds).toContain('sample-with-check');
    });

    it('should add show-sample-modal command', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const commandIds = hoisted.mockAddCommand.mock.calls.map((c: unknown[]) => (c[0] as MockCommand).id);
      expect(commandIds).toContain('show-sample-modal');
    });

    it('should add ribbon icon', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      expect(hoisted.mockAddRibbonIcon).toHaveBeenCalledWith('dice', 'Sample ribbon icon', expect.any(Function));
    });

    it('should add status bar item with text', async () => {
      const plugin = createPlugin();
      const setText = vi.fn();
      hoisted.mockAddStatusBarItem.mockReturnValue({ setText });
      await plugin.onload();
      expect(setText).toHaveBeenCalledWith('Sample status bar item');
    });

    it('should register DOM event for dblclick', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      expect(hoisted.mockRegisterDomEvent).toHaveBeenCalledWith(
        expect.anything(),
        'dblclick',
        expect.any(Function)
      );
    });

    it('should register editor extensions', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      expect(hoisted.mockRegisterEditorExtension).toHaveBeenCalled();
    });

    it('should register editor suggest', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      expect(hoisted.mockRegisterEditorSuggest).toHaveBeenCalled();
    });

    it('should register vault create event', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      expect(hoisted.mockRegisterEvent).toHaveBeenCalled();
    });

    it('should register file extensions', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      expect(hoisted.mockRegisterExtensions).toHaveBeenCalledWith(
        ['sample-extension-1', 'sample-extension-2'],
        expect.any(String)
      );
    });

    it('should register hover link source', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      expect(hoisted.mockRegisterHoverLinkSource).toHaveBeenCalled();
    });

    it('should register interval', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      expect(hoisted.mockRegisterInterval).toHaveBeenCalled();
    });

    it('should register markdown code block processor', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      expect(hoisted.mockRegisterMarkdownCodeBlockProcessor).toHaveBeenCalledWith(
        'sample-code-block-processor',
        expect.any(Function)
      );
    });

    it('should register markdown post processor', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      expect(hoisted.mockRegisterMarkdownPostProcessor).toHaveBeenCalled();
    });

    it('should register obsidian protocol handler', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      expect(hoisted.mockRegisterObsidianProtocolHandler).toHaveBeenCalledWith(
        'sample-action',
        expect.any(Function)
      );
    });

    it('should register views', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const EXPECTED_VIEW_COUNT = 3;
      expect(hoisted.mockRegisterView).toHaveBeenCalledTimes(EXPECTED_VIEW_COUNT);
    });

    it('should call SampleView factory with leaf when registering SampleView', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const viewFactory = hoisted.mockRegisterView.mock.calls[0]?.[1] as MockViewFactory | undefined;
      const view = viewFactory?.({});
      expect(view).toBeDefined();
    });

    it('should call SampleSvelteView factory with leaf when registering SampleSvelteView', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const viewFactory = hoisted.mockRegisterView.mock.calls[1]?.[1] as MockViewFactory | undefined;
      const view = viewFactory?.({});
      expect(view).toBeDefined();
    });

    it('should call SampleReactView factory with leaf when registering SampleReactView', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const viewFactory = hoisted.mockRegisterView.mock.calls[2]?.[1] as MockViewFactory | undefined;
      const view = viewFactory?.({});
      expect(view).toBeDefined();
    });
  });

  describe('onunload', () => {
    it('should show "Sample plugin is being unloaded" notice', () => {
      const plugin = createPlugin();
      plugin.onunload();
      expect(hoisted.mockNotice).toHaveBeenCalledWith('Sample plugin is being unloaded');
    });
  });

  describe('private handlers (via registered callbacks)', () => {
    it('should show "Sample command" notice when sample command runs', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      hoisted.mockNotice.mockClear();
      const sampleCmd = hoisted.mockAddCommand.mock.calls.find(
        (c: unknown[]) => (c[0] as MockCommand).id === 'sample'
      );
      (sampleCmd?.[0] as MockCommand | undefined)?.callback();
      expect(hoisted.mockNotice).toHaveBeenCalledWith('Sample command');
    });

    it('should call editor.replaceSelection in sample-editor command', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const editorCmd = hoisted.mockAddCommand.mock.calls.find(
        (c: unknown[]) => (c[0] as MockCommand).id === 'sample-editor'
      );
      const replaceSelection = vi.fn();
      (editorCmd?.[0] as MockEditorCommand | undefined)?.editorCallback({ replaceSelection });
      expect(replaceSelection).toHaveBeenCalledWith('Sample Editor Command');
    });

    it('should return false for sample-with-check command when no MarkdownView', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      hoisted.mockGetActiveViewOfType.mockReturnValue(null);
      const checkCmd = hoisted.mockAddCommand.mock.calls.find(
        (c: unknown[]) => (c[0] as MockCommand).id === 'sample-with-check'
      );
      const result = (checkCmd?.[0] as MockCheckCommand | undefined)?.checkCallback(true);
      expect(result).toBe(false);
    });

    it('should return true for sample-with-check command when MarkdownView exists', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      hoisted.mockGetActiveViewOfType.mockReturnValue({ type: 'markdown' });
      const checkCmd = hoisted.mockAddCommand.mock.calls.find(
        (c: unknown[]) => (c[0] as MockCommand).id === 'sample-with-check'
      );
      const result = (checkCmd?.[0] as MockCheckCommand | undefined)?.checkCallback(true);
      expect(result).toBe(true);
    });

    it('should show Notice when sample-with-check command runs (checking=false)', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      hoisted.mockGetActiveViewOfType.mockReturnValue({ type: 'markdown' });
      hoisted.mockNotice.mockClear();
      const checkCmd = hoisted.mockAddCommand.mock.calls.find(
        (c: unknown[]) => (c[0] as MockCommand).id === 'sample-with-check'
      );
      (checkCmd?.[0] as MockCheckCommand | undefined)?.checkCallback(false);
      expect(hoisted.mockNotice).toHaveBeenCalledWith('Sample command with check');
    });

    it('should show "Sample ribbon icon command" notice when ribbon icon clicked', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      hoisted.mockNotice.mockClear();
      const ribbonCallback = hoisted.mockAddRibbonIcon.mock.calls[0]?.[2] as MockRibbonCallback | undefined;
      ribbonCallback?.();
      expect(hoisted.mockNotice).toHaveBeenCalledWith('Sample ribbon icon command');
    });

    it('should show "Sample DOM event" notice on dblclick', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      hoisted.mockNotice.mockClear();
      const domCallback = hoisted.mockRegisterDomEvent.mock.calls[0]?.[2] as MockDomEventCallback | undefined;
      const el = activeDocument.createElement('div');
      const evt = new MouseEvent('dblclick', { bubbles: true });
      Object.defineProperty(evt, 'target', { value: el });
      domCallback?.(evt);
      expect(hoisted.mockNotice).toHaveBeenCalledWith(expect.stringContaining('Sample DOM event'));
    });

    it('should show "Sample DOM event" notice with empty tagname for non-element target', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      hoisted.mockNotice.mockClear();
      const domCallback = hoisted.mockRegisterDomEvent.mock.calls[0]?.[2] as MockDomEventCallback | undefined;
      const evt = new MouseEvent('dblclick');
      domCallback?.(evt);
      expect(hoisted.mockNotice).toHaveBeenCalledWith('Sample DOM event: ');
    });

    it('should show "Sample obsidian protocol handler" notice', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      hoisted.mockNotice.mockClear();
      const protocolCallback = hoisted.mockRegisterObsidianProtocolHandler.mock.calls[0]?.[1] as
        | MockObsidianProtocolCallback
        | undefined;
      protocolCallback?.({ action: 'test-action' });
      expect(hoisted.mockNotice).toHaveBeenCalledWith('Sample obsidian protocol handler: test-action');
    });

    it('should show "Sample interval tick" notice', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      hoisted.mockNotice.mockClear();
      const setIntervalSpy = vi.spyOn(window, 'setInterval').mockImplementation(castTo<typeof setInterval>((fn: TimerHandler) => {
        if (typeof fn === 'function') {
          (fn as () => void)();
        }

        return 0;
      }));
      await plugin.onload();
      expect(hoisted.mockNotice).toHaveBeenCalledWith('Sample interval tick');
      setIntervalSpy.mockRestore();
    });

    it('should handle vault create event showing Notice when layout is ready', async () => {
      const plugin = createPlugin();
      await plugin.onload();

      const vaultOn = castTo<MockVaultApp>(plugin.app).vault.on;
      const vaultCallback = vaultOn.mock.calls[0]?.[1] as MockVaultCallback | undefined;
      hoisted.mockNotice.mockClear();

      // Set layoutReady to true via app
      const appWithLayout = castTo<MockLayoutApp>(plugin.app);
      appWithLayout.workspace.layoutReady = true;

      vaultCallback?.({ name: 'test.md' });
      expect(hoisted.mockNotice).toHaveBeenCalledWith('Sample event: test.md');
    });

    it('should not show Notice on vault create event when layout is not ready', async () => {
      const plugin = createPlugin();
      await plugin.onload();

      const vaultOn = castTo<MockVaultApp>(plugin.app).vault.on;
      const vaultCallback = vaultOn.mock.calls[0]?.[1] as MockVaultCallback | undefined;
      hoisted.mockNotice.mockClear();

      // LayoutReady is false by default
      vaultCallback?.({ name: 'test.md' });
      expect(hoisted.mockNotice).not.toHaveBeenCalled();
    });

    it('should handle code block processor', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const cbpCallback = hoisted.mockRegisterMarkdownCodeBlockProcessor.mock.calls[0]?.[1] as
        | MockCodeBlockCallback
        | undefined;
      const el = activeDocument.createElement('div');
      cbpCallback?.('source code', el, {});
      expect(el.textContent).toBe('Sample code block processor');
    });

    it('should handle markdown post processor when el has el-h6 class', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const mppCallback = hoisted.mockRegisterMarkdownPostProcessor.mock.calls[0]?.[0] as
        | MockMarkdownPostProcessCallback
        | undefined;
      const el = activeDocument.createElement('div');
      el.addClass('el-h6');
      mppCallback?.(el, {});
      expect(el.textContent).toBe('Sample markdown post processor');
    });

    it('should not change text in markdown post processor when el does not have el-h6 class', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const mppCallback = hoisted.mockRegisterMarkdownPostProcessor.mock.calls[0]?.[0] as
        | MockMarkdownPostProcessCallback
        | undefined;
      const el = activeDocument.createElement('div');
      mppCallback?.(el, {});
      expect(el.textContent).toBe('');
    });
  });

  describe('modal commands', () => {
    it('should call showSampleModal when show-sample-modal runs', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const modalCmd = hoisted.mockAddCommand.mock.calls.find(
        (c: unknown[]) => (c[0] as MockCommand).id === 'show-sample-modal'
      );
      // Should not throw when called
      expect(() => {
        (modalCmd?.[0] as MockCommand | undefined)?.callback();
      }).not.toThrow();
    });

    it('should call alert when show-alert-modal command runs', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const alertCmd = hoisted.mockAddCommand.mock.calls.find(
        (c: unknown[]) => (c[0] as MockCommand).id === 'show-alert-modal'
      );
      vi.mocked(mockAlert).mockClear();
      await (alertCmd?.[0] as MockAsyncCommand | undefined)?.callback();
      expect(vi.mocked(mockAlert)).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Sample alert message', title: 'Sample alert title' })
      );
    });

    it('should call confirm when show-confirm-modal command runs', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const confirmCmd = hoisted.mockAddCommand.mock.calls.find(
        (c: unknown[]) => (c[0] as MockCommand).id === 'show-confirm-modal'
      );
      vi.mocked(mockConfirm).mockClear();
      await (confirmCmd?.[0] as MockAsyncCommand | undefined)?.callback();
      expect(vi.mocked(mockConfirm)).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Sample confirm message', title: 'Sample confirm title' })
      );
    });

    it('should show confirm result notice after confirm-modal runs', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const confirmCmd = hoisted.mockAddCommand.mock.calls.find(
        (c: unknown[]) => (c[0] as MockCommand).id === 'show-confirm-modal'
      );
      hoisted.mockNotice.mockClear();
      await (confirmCmd?.[0] as MockAsyncCommand | undefined)?.callback();
      expect(hoisted.mockNotice).toHaveBeenCalledWith(expect.stringContaining('Sample confirm result:'));
    });

    it('should call prompt when show-prompt-modal command runs', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const promptCmd = hoisted.mockAddCommand.mock.calls.find(
        (c: unknown[]) => (c[0] as MockCommand).id === 'show-prompt-modal'
      );
      vi.mocked(mockPrompt).mockClear();
      await (promptCmd?.[0] as MockAsyncCommand | undefined)?.callback();
      expect(vi.mocked(mockPrompt)).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Sample prompt title' })
      );
    });

    it('should have valueValidator that rejects short values in prompt', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const promptCmd = hoisted.mockAddCommand.mock.calls.find(
        (c: unknown[]) => (c[0] as MockCommand).id === 'show-prompt-modal'
      );
      vi.mocked(mockPrompt).mockImplementation(castTo<typeof mockPrompt>((params: MockPromptParams) => {
        params.valueValidator?.('short');
        return vi.fn<() => Promise<void>>().mockResolvedValue(undefined)();
      }));
      await (promptCmd?.[0] as MockAsyncCommand | undefined)?.callback();
      const promptCalls = vi.mocked(mockPrompt).mock.calls;
      const lastParams = promptCalls[promptCalls.length - 1]?.[0] as MockPromptParams | undefined;
      const result = lastParams?.valueValidator?.('short');
      expect(result).toContain('at least 30 characters');
    });

    it('should have valueValidator that allows long values in prompt', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const promptCmd = hoisted.mockAddCommand.mock.calls.find(
        (c: unknown[]) => (c[0] as MockCommand).id === 'show-prompt-modal'
      );
      await (promptCmd?.[0] as MockAsyncCommand | undefined)?.callback();
      const promptCalls = vi.mocked(mockPrompt).mock.calls;
      const lastParams = promptCalls[promptCalls.length - 1]?.[0] as MockPromptParams | undefined;
      const result = lastParams?.valueValidator?.('this is a long enough value for the validator');
      expect(result).toBeUndefined();
    });

    it('should call selectItem when show-select-item-modal command runs', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const selectCmd = hoisted.mockAddCommand.mock.calls.find(
        (c: unknown[]) => (c[0] as MockCommand).id === 'show-select-item-modal'
      );
      vi.mocked(mockSelectItem).mockClear();
      await (selectCmd?.[0] as MockAsyncCommand | undefined)?.callback();
      expect(vi.mocked(mockSelectItem)).toHaveBeenCalledWith(
        expect.objectContaining({ items: ['Item 1', 'Item 2', 'Item 3'] })
      );
    });

    it('should have itemTextFunc that returns item in selectItem', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      const selectCmd = hoisted.mockAddCommand.mock.calls.find(
        (c: unknown[]) => (c[0] as MockCommand).id === 'show-select-item-modal'
      );
      await (selectCmd?.[0] as MockAsyncCommand | undefined)?.callback();
      const selectCalls = vi.mocked(mockSelectItem).mock.calls;
      const lastParams = selectCalls[selectCalls.length - 1]?.[0] as MockItemTextParams | undefined;
      expect(lastParams?.itemTextFunc?.('Item 1')).toBe('Item 1');
    });
  });

  describe('onLayoutReady', () => {
    it('should call ensureSideLeaf for three views', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      hoisted.mockEnsureSideLeaf.mockClear();
      const layoutReadyCallback = hoisted.mockOnLayoutReady.mock.calls[0]?.[0] as (() => Promise<void>) | undefined;
      await layoutReadyCallback?.();
      const EXPECTED_CALLS = 3;
      expect(hoisted.mockEnsureSideLeaf).toHaveBeenCalledTimes(EXPECTED_CALLS);
    });

    it('should show notice that all plugins are loaded', async () => {
      const plugin = createPlugin();
      await plugin.onload();
      hoisted.mockNotice.mockClear();
      const layoutReadyCallback = hoisted.mockOnLayoutReady.mock.calls[0]?.[0] as (() => Promise<void>) | undefined;
      await layoutReadyCallback?.();
      expect(hoisted.mockNotice).toHaveBeenCalledWith('This is executed after all plugins are loaded');
    });
  });
});
