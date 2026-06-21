import type {
  Editor,
  MarkdownPostProcessorContext,
  ObsidianProtocolData,
  TAbstractFile
} from 'obsidian';
import type { MaybeReturn } from 'obsidian-dev-utils/type';

import {
  MarkdownView,
  Notice
} from 'obsidian';
import { convertAsyncToSync } from 'obsidian-dev-utils/async';
import { getDebugger } from 'obsidian-dev-utils/debug';
import { PluginSettingsTabComponent } from 'obsidian-dev-utils/obsidian/components/plugin-settings-tab-component';
import { PluginDataHandler } from 'obsidian-dev-utils/obsidian/data-handler';
import { alert } from 'obsidian-dev-utils/obsidian/modals/alert';
import { confirm } from 'obsidian-dev-utils/obsidian/modals/confirm';
import { prompt } from 'obsidian-dev-utils/obsidian/modals/prompt';
import { selectItem } from 'obsidian-dev-utils/obsidian/modals/select-item';
import { PluginBase } from 'obsidian-dev-utils/obsidian/plugin/plugin';
import { PluginEventSourceImpl } from 'obsidian-dev-utils/obsidian/plugin/plugin-event-source';

import { sampleStateField } from './editor-extensions/sample-state-field.ts';
import { sampleViewPlugin } from './editor-extensions/sample-view-plugin.ts';
import { SampleEditorSuggest } from './editor-suggests/sample-editor-suggest.ts';
import { SampleModal } from './modals/sample-modal.ts';
import { PluginSettingsComponent } from './plugin-settings-component.ts';
import { PluginSettingsTab } from './plugin-settings-tab.ts';
import {
  SAMPLE_REACT_VIEW_TYPE,
  SampleReactView
} from './views/sample-react-view.tsx';
import {
  SAMPLE_SVELTE_VIEW_TYPE,
  SampleSvelteView
} from './views/sample-svelte-view.ts';
import {
  SAMPLE_VIEW_TYPE,
  SampleView
} from './views/sample-view.ts';

export class Plugin extends PluginBase {
  private pluginSettingsComponent!: PluginSettingsComponent;

  protected override onloadImpl(): void {
    this.pluginSettingsComponent = this.addChild(
      new PluginSettingsComponent({
        dataHandler: new PluginDataHandler(this),
        pluginEventSource: new PluginEventSourceImpl(this)
      })
    );
    this.addChild(
      new PluginSettingsTabComponent({
        plugin: this,
        pluginSettingsTab: new PluginSettingsTab({
          plugin: this,
          pluginSettingsComponent: this.pluginSettingsComponent
        })
      })
    );

    this.app.workspace.onLayoutReady(convertAsyncToSync(this.onLayoutReady.bind(this)));
    this.addCommand({
      callback: this.runSampleCommand.bind(this),
      id: 'sample',
      name: 'Sample'
    });

    this.addCommand({
      editorCallback: this.runSampleEditorCommand.bind(this),
      id: 'sample-editor',
      name: 'Sample editor'
    });

    this.addCommand({
      checkCallback: this.runSampleCommandWithCheck.bind(this),
      id: 'sample-with-check',
      name: 'Sample with check'
    });

    this.addRibbonIcon('dice', 'Sample ribbon icon', this.runSampleRibbonIconCommand.bind(this));

    this.addStatusBarItem().setText('Sample status bar item');

    this.registerDomEvent(activeDocument, 'dblclick', this.handleSampleDomEvent.bind(this));

    this.registerEditorExtension([sampleViewPlugin, sampleStateField]);

    this.registerEditorSuggest(new SampleEditorSuggest(this.app));

    this.registerEvent(this.app.vault.on('create', this.handleSampleEvent.bind(this)));

    this.registerExtensions(['sample-extension-1', 'sample-extension-2'], SAMPLE_VIEW_TYPE);

    this.registerHoverLinkSource(SAMPLE_VIEW_TYPE, {
      defaultMod: true,
      display: this.manifest.name
    });

    const INTERVAL_IN_MILLISECONDS = 60_000;
    this.registerInterval(window.setInterval(this.handleSampleIntervalTick.bind(this), INTERVAL_IN_MILLISECONDS));

    this.registerMarkdownCodeBlockProcessor('sample-code-block-processor', this.handleSampleCodeBlockProcessor.bind(this));

    this.registerMarkdownPostProcessor(this.handleSampleMarkdownPostProcessor.bind(this));

    this.registerObsidianProtocolHandler('sample-action', this.handleSampleObsidianProtocolHandler.bind(this));

    this.registerView(SAMPLE_VIEW_TYPE, (leaf) => new SampleView(leaf));
    this.registerView(SAMPLE_SVELTE_VIEW_TYPE, (leaf) => new SampleSvelteView(leaf));
    this.registerView(SAMPLE_REACT_VIEW_TYPE, (leaf) => new SampleReactView(leaf));

    this.registerModalCommands();
  }

  public override onunload(): void {
    super.onunload();
    new Notice('Sample plugin is being unloaded');
  }

  private handleSampleCodeBlockProcessor(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    getDebugger('handleSampleCodeBlockProcessor')(source, el, ctx);
    el.setText('Sample code block processor');
  }

  private handleSampleDomEvent(evt: MouseEvent): void {
    const tagName = evt.target instanceof HTMLElement ? evt.target.tagName : '';
    new Notice(`Sample DOM event: ${tagName}`);
  }

  private handleSampleEvent(file: TAbstractFile): void {
    if (!this.app.workspace.layoutReady) {
      return;
    }

    new Notice(`Sample event: ${file.name}`);
  }

  private handleSampleIntervalTick(): void {
    new Notice('Sample interval tick');
  }

  private handleSampleMarkdownPostProcessor(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    getDebugger('handleSampleMarkdownPostProcessor')(el, ctx);
    if (el.hasClass('el-h6')) {
      el.setText('Sample markdown post processor');
    }
  }

  private handleSampleObsidianProtocolHandler(params: ObsidianProtocolData): void {
    new Notice(`Sample obsidian protocol handler: ${params.action}`);
  }

  private async onLayoutReady(): Promise<void> {
    new Notice('This is executed after all plugins are loaded');
    await this.openView(SAMPLE_VIEW_TYPE);
    await this.openView(SAMPLE_SVELTE_VIEW_TYPE);
    await this.openView(SAMPLE_REACT_VIEW_TYPE);
  }

  private async openView(viewType: string): Promise<void> {
    await this.app.workspace.ensureSideLeaf(viewType, 'right');
  }

  private registerModalCommands(): void {
    this.addCommand({
      callback: this.showSampleModal.bind(this),
      id: 'show-sample-modal',
      name: 'Show sample modal'
    });

    this.addCommand({
      callback: convertAsyncToSync(this.showAlert.bind(this)),
      id: 'show-alert-modal',
      name: 'Show alert modal'
    });

    this.addCommand({
      callback: convertAsyncToSync(this.showConfirm.bind(this)),
      id: 'show-confirm-modal',
      name: 'Show confirm modal'
    });

    this.addCommand({
      callback: convertAsyncToSync(this.showPrompt.bind(this)),
      id: 'show-prompt-modal',
      name: 'Show prompt modal'
    });

    this.addCommand({
      callback: convertAsyncToSync(this.showSelectItem.bind(this)),
      id: 'show-select-item-modal',
      name: 'Show select item modal'
    });
  }

  private runSampleCommand(): void {
    new Notice('Sample command');
  }

  private runSampleCommandWithCheck(checking: boolean): boolean {
    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!markdownView) {
      return false;
    }

    if (!checking) {
      new Notice('Sample command with check');
    }

    return true;
  }

  private runSampleEditorCommand(editor: Editor): void {
    editor.replaceSelection('Sample Editor Command');
  }

  private runSampleRibbonIconCommand(): void {
    new Notice('Sample ribbon icon command');
  }

  private async showAlert(): Promise<void> {
    await alert({
      app: this.app,
      message: 'Sample alert message',
      title: 'Sample alert title'
    });
  }

  private async showConfirm(): Promise<void> {
    const result = await confirm({
      app: this.app,
      message: 'Sample confirm message',
      title: 'Sample confirm title'
    });

    new Notice(`Sample confirm result: ${String(result)}`);
  }

  private async showPrompt(): Promise<void> {
    await prompt({
      app: this.app,
      defaultValue: 'Sample prompt default value',
      placeholder: 'Sample prompt placeholder',
      title: 'Sample prompt title',
      valueValidator: (value): MaybeReturn<string> => {
        const MIN_LENGTH = 30;
        if (value.length < MIN_LENGTH) {
          return `Value must be at least ${String(MIN_LENGTH)} characters long`;
        }
      }
    });
  }

  private showSampleModal(): void {
    new SampleModal(this.app).open();
  }

  private async showSelectItem(): Promise<void> {
    await selectItem({
      app: this.app,
      items: ['Item 1', 'Item 2', 'Item 3'],
      itemTextFunc: (item) => item,
      placeholder: 'Sample select item placeholder'
    });
  }
}
