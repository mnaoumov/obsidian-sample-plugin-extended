import type {
  App as AppType,
  PluginManifest
} from 'obsidian';

import { Component } from 'obsidian';
import { PluginNoticeComponent } from 'obsidian-dev-utils/obsidian/components/plugin-notice-component';
import { PluginSettingsTabComponent } from 'obsidian-dev-utils/obsidian/components/plugin-settings-tab-component';
import { ensureGenericObject } from 'obsidian-dev-utils/type-guards';
import { App } from 'obsidian-test-mocks/obsidian';
import {
  afterEach,
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
 * The real `PluginBase` (from `obsidian-dev-utils`) drives the lifecycle here —
 * it is NOT mocked. `await plugin.onload()` registers the base's universal
 * components, runs the plugin's `onloadImpl`, then loads every queued child via
 * the real children-first lifecycle. Each child the plugin adds must therefore
 * be a real loadable `Component`, so every sibling/collaborator stub below that
 * is added as a child returns a real `Component`.
 */

vi.mock('obsidian-dev-utils/obsidian/data-handler', () => ({
  PluginDataHandler: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/plugin/plugin-event-source', () => ({
  PluginEventSourceImpl: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/command-registrar', () => ({
  PluginCommandRegistrar: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/ribbon-icon-registrar', () => ({
  PluginRibbonIconRegistrar: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/status-bar-item-registrar', () => ({
  PluginStatusBarItemRegistrar: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/editor-extension-registrar', () => ({
  PluginEditorExtensionRegistrar: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/editor-suggest-registrar', () => ({
  PluginEditorSuggestRegistrar: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/extensions-registrar', () => ({
  PluginExtensionsRegistrar: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/hover-link-source-registrar', () => ({
  PluginHoverLinkSourceRegistrar: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/markdown-code-block-processor-registrar', () => ({
  PluginMarkdownCodeBlockProcessorRegistrar: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/markdown-post-processor-registrar', () => ({
  PluginMarkdownPostProcessorRegistrar: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/obsidian-protocol-handler-registrar', () => ({
  PluginObsidianProtocolHandlerRegistrar: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/view-registrar', () => ({
  PluginViewRegistrar: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/components/plugin-settings-tab-component', () => ({
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
  let savedGlobalApp: AppType;

  beforeEach(() => {
    vi.clearAllMocks();
    app = App.createConfigured__();
    const appOriginal = app.asOriginalType__();

    /*
     * The real base loads `PluginNoticeComponent` and friends, which read
     * `obsidianDevUtilsState` off the app (and off the global `app` when resolved
     * implicitly). Seed it on the same holder the base uses.
     */
    ensureGenericObject(appOriginal)['obsidianDevUtilsState'] = {};
    // eslint-disable-next-line @typescript-eslint/dot-notation, @typescript-eslint/no-deprecated -- Test setup: window.app is deprecated but required so implicitly-resolved app lookups share the configured app.
    savedGlobalApp = ensureGenericObject(window)['app'];
    // eslint-disable-next-line @typescript-eslint/dot-notation, @typescript-eslint/no-deprecated -- Test setup: window.app is deprecated but required so implicitly-resolved app lookups share the configured app.
    ensureGenericObject(window)['app'] = appOriginal;

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

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/dot-notation, @typescript-eslint/no-deprecated -- Test teardown: restoring window.app.
    ensureGenericObject(window)['app'] = savedGlobalApp;
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

  it('should show a notice on unload', async () => {
    const plugin = new Plugin(app.asOriginalType__(), manifest);
    await plugin.onload();

    const showNoticeSpy = vi.spyOn(PluginNoticeComponent.prototype, 'showNotice');
    plugin.onunload();
    expect(showNoticeSpy).toHaveBeenCalledWith('Sample plugin is being unloaded');
  });
});
