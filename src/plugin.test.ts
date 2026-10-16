import type { PluginManifest } from 'obsidian';

import { OpenDemoVaultCommandHandler } from '@mnaoumov/obsidian-lib/command-handlers/open-demo-vault-command-handler';
import { PluginNoticeComponent } from '@mnaoumov/obsidian-lib/components/plugin-notice-component';
import { PluginSettingsTabComponent } from '@mnaoumov/obsidian-lib/components/plugin-settings-tab-component';
import { castTo } from '@mnaoumov/typescript-lib/object-utils';
import { Component } from 'obsidian';
import { App } from 'obsidian-test-mocks/obsidian';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { PluginSettingsComponent } from './plugin-settings-component.ts';
import { PluginSettingsTab } from './plugin-settings-tab.ts';
import { SamplePluginExtendedComponent } from './sample-plugin-extended-component.ts';

/*
 * The real `PluginBase` (from `@mnaoumov/obsidian-lib`) drives the lifecycle here —
 * it is NOT mocked. `await plugin.onload()` registers the base's universal
 * components, runs the plugin's `onloadImpl`, then loads every queued child via
 * the real children-first lifecycle. Each child the plugin adds must therefore
 * be a real loadable `Component`, so every sibling/collaborator stub below that
 * is added as a child returns a real `Component`.
 */

// The shared command handler component is now constructed and registered by PluginBase itself, so the mock exposes the registerCommandHandlers spy the base calls at load.
const { registerCommandHandlers } = vi.hoisted(() => ({ registerCommandHandlers: vi.fn() }));

vi.mock('@mnaoumov/obsidian-lib/command-handlers/command-handler-component', () => ({
  // eslint-disable-next-line prefer-arrow-callback, func-names -- mock must be constructable with `new` and return a loadable Component exposing registerCommandHandlers.
  CommandHandlerComponent: vi.fn(function (): Component {
    return Object.assign(new Component(), { registerCommandHandlers });
  })
}));

vi.mock('@mnaoumov/obsidian-lib/components/menu-event-registrar-component', () => ({
  // eslint-disable-next-line prefer-arrow-callback, func-names -- mock must be constructable with `new` and return a loadable Component.
  MenuEventRegistrarComponent: vi.fn(function (): Component {
    return new Component();
  })
}));

vi.mock('@mnaoumov/obsidian-lib/active-file-provider', () => ({
  AppActiveFileProvider: vi.fn()
}));

// `PluginDataHandler` and `PluginEventSourceImpl` are NOT stubbed: since obsidian-dev-utils 93.2 the base
// builds its own settings component out of them during `onload`, and that component really calls
// `pluginEventSource.on`, so a bare `vi.fn()` double makes the base throw before `onloadImpl` runs.

vi.mock('@mnaoumov/obsidian-lib/command-registrar', () => ({
  PluginCommandRegistrar: vi.fn()
}));

vi.mock('@mnaoumov/obsidian-lib/ribbon-icon-registrar', () => ({
  PluginRibbonIconRegistrar: vi.fn()
}));

vi.mock('@mnaoumov/obsidian-lib/status-bar-item-registrar', () => ({
  PluginStatusBarItemRegistrar: vi.fn()
}));

vi.mock('@mnaoumov/obsidian-lib/editor-extension-registrar', () => ({
  PluginEditorExtensionRegistrar: vi.fn()
}));

vi.mock('@mnaoumov/obsidian-lib/editor-suggest-registrar', () => ({
  PluginEditorSuggestRegistrar: vi.fn()
}));

vi.mock('@mnaoumov/obsidian-lib/extensions-registrar', () => ({
  PluginExtensionsRegistrar: vi.fn()
}));

vi.mock('@mnaoumov/obsidian-lib/hover-link-source-registrar', () => ({
  PluginHoverLinkSourceRegistrar: vi.fn()
}));

vi.mock('@mnaoumov/obsidian-lib/markdown-code-block-processor-registrar', () => ({
  PluginMarkdownCodeBlockProcessorRegistrar: vi.fn()
}));

vi.mock('@mnaoumov/obsidian-lib/markdown-post-processor-registrar', () => ({
  PluginMarkdownPostProcessorRegistrar: vi.fn()
}));

vi.mock('@mnaoumov/obsidian-lib/obsidian-protocol-handler-registrar', () => ({
  PluginObsidianProtocolHandlerRegistrar: vi.fn()
}));

vi.mock('@mnaoumov/obsidian-lib/view-registrar', () => ({
  PluginViewRegistrar: vi.fn()
}));

vi.mock('@mnaoumov/obsidian-lib/components/plugin-settings-tab-component', () => ({
  // eslint-disable-next-line prefer-arrow-callback, func-names -- mock must be constructable with `new` and return a real loadable Component.
  PluginSettingsTabComponent: vi.fn(function () {
    return new Component();
  })
}));

vi.mock('./plugin-settings-component.ts', () => ({
  // eslint-disable-next-line prefer-arrow-callback, func-names -- mock must be constructable with `new` and return a real loadable Component.
  PluginSettingsComponent: vi.fn(function () {
    return new Component();
  })
}));

vi.mock('./plugin-settings-tab.ts', () => ({
  PluginSettingsTab: vi.fn()
}));

vi.mock('./sample-plugin-extended-component.ts', () => ({
  // eslint-disable-next-line prefer-arrow-callback, func-names -- mock must be constructable with `new` and return a real loadable Component.
  SamplePluginExtendedComponent: vi.fn(function () {
    return new Component();
  })
}));

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { Plugin } from './plugin.ts';

describe('Plugin', () => {
  let app: App;
  let manifest: PluginManifest;

  beforeEach(() => {
    vi.clearAllMocks();
    app = App.createConfigured__();
    const appOriginal = app.asOriginalType__();

    // Fire layout-ready synchronously so the real lifecycle completes within the test.
    appOriginal.workspace.onLayoutReady = vi.fn((callback: () => void) => {
      callback();
    });

    manifest = {
      author: 'test',
      description: 'test',
      id: 'test-plugin',
      minAppVersion: '0.0.0',
      name: 'Test Plugin',
      version: '1.0.0'
    };
  });

  it('should wire up all child components on load', async () => {
    const appOriginal = app.asOriginalType__();
    const plugin = new Plugin(appOriginal, manifest);
    await plugin.onload();

    expect(plugin).toBeInstanceOf(Plugin);
    expect(PluginSettingsComponent).toHaveBeenCalledOnce();
    expect(PluginSettingsTab).toHaveBeenCalledOnce();
    expect(PluginSettingsTabComponent).toHaveBeenCalledOnce();
    expect(SamplePluginExtendedComponent).toHaveBeenCalledOnce();
  });

  it('should register the open demo vault command handler', async () => {
    const plugin = new Plugin(app.asOriginalType__(), manifest);
    await plugin.onload();

    // Since obsidian-dev-utils 89.0.0 the handlers are built lazily by a factory, and the base registers
    // its own batch through the same spy - so build every batch and look across them.
    const commandHandlers = registerCommandHandlers.mock.calls
      .flatMap(([commandHandlerFactory]) => castTo<() => unknown[]>(commandHandlerFactory)());
    expect(commandHandlers).toEqual(expect.arrayContaining([expect.any(OpenDemoVaultCommandHandler)]));
  });

  it('should show a notice on unload', async () => {
    const plugin = new Plugin(app.asOriginalType__(), manifest);
    await plugin.onload();

    const showNoticeSpy = vi.spyOn(PluginNoticeComponent.prototype, 'showNotice');
    plugin.onunload();
    expect(showNoticeSpy).toHaveBeenCalledWith('Sample plugin is being unloaded');
  });
});
