import { PluginCommandRegistrar } from 'obsidian-dev-utils/obsidian/command-registrar';
import { PluginSettingsTabComponent } from 'obsidian-dev-utils/obsidian/components/plugin-settings-tab-component';
import { PluginDataHandler } from 'obsidian-dev-utils/obsidian/data-handler';
import { PluginEditorExtensionRegistrar } from 'obsidian-dev-utils/obsidian/editor-extension-registrar';
import { PluginEditorSuggestRegistrar } from 'obsidian-dev-utils/obsidian/editor-suggest-registrar';
import { PluginExtensionsRegistrar } from 'obsidian-dev-utils/obsidian/extensions-registrar';
import { PluginHoverLinkSourceRegistrar } from 'obsidian-dev-utils/obsidian/hover-link-source-registrar';
import { PluginMarkdownCodeBlockProcessorRegistrar } from 'obsidian-dev-utils/obsidian/markdown-code-block-processor-registrar';
import { PluginMarkdownPostProcessorRegistrar } from 'obsidian-dev-utils/obsidian/markdown-post-processor-registrar';
import { PluginObsidianProtocolHandlerRegistrar } from 'obsidian-dev-utils/obsidian/obsidian-protocol-handler-registrar';
import { PluginBase } from 'obsidian-dev-utils/obsidian/plugin/plugin';
import { PluginEventSourceImpl } from 'obsidian-dev-utils/obsidian/plugin/plugin-event-source';
import { PluginRibbonIconRegistrar } from 'obsidian-dev-utils/obsidian/ribbon-icon-registrar';
import { PluginStatusBarItemRegistrar } from 'obsidian-dev-utils/obsidian/status-bar-item-registrar';
import { PluginViewRegistrar } from 'obsidian-dev-utils/obsidian/view-registrar';

import { PluginSettingsComponent } from './plugin-settings-component.ts';
import { PluginSettingsTab } from './plugin-settings-tab.ts';
import { SamplePluginExtendedComponent } from './sample-plugin-extended-component.ts';

export class Plugin extends PluginBase {
  public override onunload(): void {
    super.onunload();
    this.pluginNoticeComponent.showNotice('Sample plugin is being unloaded');
  }

  protected override onloadImpl(): void {
    const pluginSettingsComponent = this.addChild(
      new PluginSettingsComponent({
        dataHandler: new PluginDataHandler(this),
        pluginEventSource: new PluginEventSourceImpl(this),
        pluginNoticeComponent: this.pluginNoticeComponent
      })
    );
    this.addChild(
      new PluginSettingsTabComponent({
        plugin: this,
        pluginSettingsTab: new PluginSettingsTab({
          plugin: this,
          pluginNoticeComponent: this.pluginNoticeComponent,
          pluginSettingsComponent
        })
      })
    );

    this.addChild(
      new SamplePluginExtendedComponent({
        app: this.app,
        commandRegistrar: new PluginCommandRegistrar(this),
        editorExtensionRegistrar: new PluginEditorExtensionRegistrar(this),
        editorSuggestRegistrar: new PluginEditorSuggestRegistrar(this),
        extensionsRegistrar: new PluginExtensionsRegistrar(this),
        hoverLinkSourceRegistrar: new PluginHoverLinkSourceRegistrar(this),
        markdownCodeBlockProcessorRegistrar: new PluginMarkdownCodeBlockProcessorRegistrar(this),
        markdownPostProcessorRegistrar: new PluginMarkdownPostProcessorRegistrar(this),
        obsidianProtocolHandlerRegistrar: new PluginObsidianProtocolHandlerRegistrar(this),
        pluginName: this.manifest.name,
        pluginNoticeComponent: this.pluginNoticeComponent,
        ribbonIconRegistrar: new PluginRibbonIconRegistrar(this),
        statusBarItemRegistrar: new PluginStatusBarItemRegistrar(this),
        viewRegistrar: new PluginViewRegistrar(this)
      })
    );
  }
}
