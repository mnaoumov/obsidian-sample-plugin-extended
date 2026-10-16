import { OpenDemoVaultCommandHandler } from '@mnaoumov/obsidian-lib/command-handlers/open-demo-vault-command-handler';
import { PluginCommandRegistrar } from '@mnaoumov/obsidian-lib/command-registrar';
import { PluginSettingsTabComponent } from '@mnaoumov/obsidian-lib/components/plugin-settings-tab-component';
import { PluginDataHandler } from '@mnaoumov/obsidian-lib/data-handler';
import { PluginEditorExtensionRegistrar } from '@mnaoumov/obsidian-lib/editor-extension-registrar';
import { PluginEditorSuggestRegistrar } from '@mnaoumov/obsidian-lib/editor-suggest-registrar';
import { PluginExtensionsRegistrar } from '@mnaoumov/obsidian-lib/extensions-registrar';
import { PluginHoverLinkSourceRegistrar } from '@mnaoumov/obsidian-lib/hover-link-source-registrar';
import { PluginMarkdownCodeBlockProcessorRegistrar } from '@mnaoumov/obsidian-lib/markdown-code-block-processor-registrar';
import { PluginMarkdownPostProcessorRegistrar } from '@mnaoumov/obsidian-lib/markdown-post-processor-registrar';
import { PluginObsidianProtocolHandlerRegistrar } from '@mnaoumov/obsidian-lib/obsidian-protocol-handler-registrar';
import { PluginBase } from '@mnaoumov/obsidian-lib/plugin/plugin';
import { PluginEventSourceImpl } from '@mnaoumov/obsidian-lib/plugin/plugin-event-source';
import { PluginRibbonIconRegistrar } from '@mnaoumov/obsidian-lib/ribbon-icon-registrar';
import { PluginStatusBarItemRegistrar } from '@mnaoumov/obsidian-lib/status-bar-item-registrar';
import { PluginViewRegistrar } from '@mnaoumov/obsidian-lib/view-registrar';

import { PluginSettingsComponent } from './plugin-settings-component.ts';
import { PluginSettingsTab } from './plugin-settings-tab.ts';
import { SamplePluginExtendedComponent } from './sample-plugin-extended-component.ts';

export class Plugin extends PluginBase {
  public override onunload(): void {
    super.onunload();
    this.pluginNoticeComponent.showNotice('Sample plugin is being unloaded');
  }

  protected override async onloadImpl(): Promise<void> {
    const pluginSettingsComponent = this.addChild(
      new PluginSettingsComponent({
        dataHandler: new PluginDataHandler(this),
        pluginEventSource: new PluginEventSourceImpl(this),
        pluginNoticeComponent: this.pluginNoticeComponent
      })
    );
    this.pluginSettingsComponent = pluginSettingsComponent;
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

    await this.commandHandlerComponent.registerCommandHandlers(() => [
      new OpenDemoVaultCommandHandler({
        app: this.app,
        pluginId: this.manifest.id,
        pluginNoticeComponent: this.pluginNoticeComponent,
        pluginVersion: this.manifest.version
      })
    ]);
  }
}
