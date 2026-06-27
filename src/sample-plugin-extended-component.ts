import type {
  App,
  Editor,
  MarkdownPostProcessorContext,
  ObsidianProtocolData,
  TAbstractFile
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
import type { MaybeReturn } from 'obsidian-dev-utils/type';

import { MarkdownView } from 'obsidian';
import { convertAsyncToSync } from 'obsidian-dev-utils/async';
import { getDebugger } from 'obsidian-dev-utils/debug';
import { LayoutReadyComponent } from 'obsidian-dev-utils/obsidian/components/layout-ready-component';
import { alert } from 'obsidian-dev-utils/obsidian/modals/alert';
import { confirm } from 'obsidian-dev-utils/obsidian/modals/confirm';
import { prompt } from 'obsidian-dev-utils/obsidian/modals/prompt';
import { selectItem } from 'obsidian-dev-utils/obsidian/modals/select-item';

import { sampleStateField } from './editor-extensions/sample-state-field.ts';
import { sampleViewPlugin } from './editor-extensions/sample-view-plugin.ts';
import { SampleEditorSuggest } from './editor-suggests/sample-editor-suggest.ts';
import { SampleModal } from './modals/sample-modal.ts';
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

interface SamplePluginExtendedComponentConstructorParams {
  readonly app: App;
  readonly commandRegistrar: CommandRegistrar;
  readonly editorExtensionRegistrar: EditorExtensionRegistrar;
  readonly editorSuggestRegistrar: EditorSuggestRegistrar;
  readonly extensionsRegistrar: ExtensionsRegistrar;
  readonly hoverLinkSourceRegistrar: HoverLinkSourceRegistrar;
  readonly markdownCodeBlockProcessorRegistrar: MarkdownCodeBlockProcessorRegistrar;
  readonly markdownPostProcessorRegistrar: MarkdownPostProcessorRegistrar;
  readonly obsidianProtocolHandlerRegistrar: ObsidianProtocolHandlerRegistrar;
  readonly pluginName: string;
  readonly pluginNoticeComponent: PluginNoticeComponent;
  readonly ribbonIconRegistrar: RibbonIconRegistrar;
  readonly statusBarItemRegistrar: StatusBarItemRegistrar;
  readonly viewRegistrar: ViewRegistrar;
}

export class SamplePluginExtendedComponent extends LayoutReadyComponent {
  private readonly commandRegistrar: CommandRegistrar;
  private readonly editorExtensionRegistrar: EditorExtensionRegistrar;
  private readonly editorSuggestRegistrar: EditorSuggestRegistrar;
  private readonly extensionsRegistrar: ExtensionsRegistrar;
  private readonly hoverLinkSourceRegistrar: HoverLinkSourceRegistrar;
  private readonly markdownCodeBlockProcessorRegistrar: MarkdownCodeBlockProcessorRegistrar;
  private readonly markdownPostProcessorRegistrar: MarkdownPostProcessorRegistrar;
  private readonly obsidianProtocolHandlerRegistrar: ObsidianProtocolHandlerRegistrar;
  private readonly pluginName: string;
  private readonly pluginNoticeComponent: PluginNoticeComponent;
  private readonly ribbonIconRegistrar: RibbonIconRegistrar;
  private readonly statusBarItemRegistrar: StatusBarItemRegistrar;
  private readonly viewRegistrar: ViewRegistrar;

  public constructor(params: SamplePluginExtendedComponentConstructorParams) {
    super(params.app);
    this.commandRegistrar = params.commandRegistrar;
    this.editorExtensionRegistrar = params.editorExtensionRegistrar;
    this.editorSuggestRegistrar = params.editorSuggestRegistrar;
    this.extensionsRegistrar = params.extensionsRegistrar;
    this.hoverLinkSourceRegistrar = params.hoverLinkSourceRegistrar;
    this.pluginName = params.pluginName;
    this.pluginNoticeComponent = params.pluginNoticeComponent;
    this.ribbonIconRegistrar = params.ribbonIconRegistrar;
    this.statusBarItemRegistrar = params.statusBarItemRegistrar;
    this.markdownCodeBlockProcessorRegistrar = params.markdownCodeBlockProcessorRegistrar;
    this.markdownPostProcessorRegistrar = params.markdownPostProcessorRegistrar;
    this.obsidianProtocolHandlerRegistrar = params.obsidianProtocolHandlerRegistrar;
    this.viewRegistrar = params.viewRegistrar;
  }

  public override onload(): void {
    super.onload();
    this.commandRegistrar.addCommand({
      callback: this.runSampleCommand.bind(this),
      id: 'sample',
      name: 'Sample'
    });

    this.commandRegistrar.addCommand({
      editorCallback: this.runSampleEditorCommand.bind(this),
      id: 'sample-editor',
      name: 'Sample editor'
    });

    this.commandRegistrar.addCommand({
      checkCallback: this.runSampleCommandWithCheck.bind(this),
      id: 'sample-with-check',
      name: 'Sample with check'
    });

    this.ribbonIconRegistrar.addRibbonIcon({
      callback: this.runSampleRibbonIconCommand.bind(this),
      icon: 'dice',
      title: 'Sample ribbon icon'
    });

    this.statusBarItemRegistrar.addStatusBarItem().setText('Sample status bar item');

    this.registerDomEvent(activeDocument, 'dblclick', this.handleSampleDomEvent.bind(this));

    this.editorExtensionRegistrar.registerEditorExtension([sampleViewPlugin, sampleStateField]);

    this.editorSuggestRegistrar.registerEditorSuggest(new SampleEditorSuggest(this.app));

    this.registerEvent(this.app.vault.on('create', this.handleSampleEvent.bind(this)));

    this.extensionsRegistrar.registerExtensions({
      extensions: ['sample-extension-1', 'sample-extension-2'],
      viewType: SAMPLE_VIEW_TYPE
    });

    this.hoverLinkSourceRegistrar.registerHoverLinkSource({
      id: SAMPLE_VIEW_TYPE,
      info: {
        defaultMod: true,
        display: this.pluginName
      }
    });

    const INTERVAL_IN_MILLISECONDS = 60_000;
    this.registerInterval(window.setInterval(this.handleSampleIntervalTick.bind(this), INTERVAL_IN_MILLISECONDS));

    this.markdownCodeBlockProcessorRegistrar.registerMarkdownCodeBlockProcessor({
      handler: this.handleSampleCodeBlockProcessor.bind(this),
      language: 'sample-code-block-processor'
    });

    this.markdownPostProcessorRegistrar.registerMarkdownPostProcessor({
      postProcessor: this.handleSampleMarkdownPostProcessor.bind(this)
    });

    this.obsidianProtocolHandlerRegistrar.registerObsidianProtocolHandler({
      action: 'sample-action',
      handler: this.handleSampleObsidianProtocolHandler.bind(this)
    });

    this.viewRegistrar.registerView({
      type: SAMPLE_VIEW_TYPE,
      viewCreator(leaf) {
        return new SampleView(leaf);
      }
    });
    this.viewRegistrar.registerView({
      type: SAMPLE_SVELTE_VIEW_TYPE,
      viewCreator(leaf) {
        return new SampleSvelteView(leaf);
      }
    });
    this.viewRegistrar.registerView({
      type: SAMPLE_REACT_VIEW_TYPE,
      viewCreator(leaf) {
        return new SampleReactView(leaf);
      }
    });

    this.registerModalCommands();
  }

  protected override async onLayoutReady(): Promise<void> {
    this.pluginNoticeComponent.showNotice('This is executed after all plugins are loaded');
    await this.openView(SAMPLE_VIEW_TYPE);
    await this.openView(SAMPLE_SVELTE_VIEW_TYPE);
    await this.openView(SAMPLE_REACT_VIEW_TYPE);
  }

  private handleSampleCodeBlockProcessor(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    getDebugger('handleSampleCodeBlockProcessor')(source, el, ctx);
    el.setText('Sample code block processor');
  }

  private handleSampleDomEvent(evt: MouseEvent): void {
    const tagName = evt.target instanceof HTMLElement ? evt.target.tagName : '';
    this.pluginNoticeComponent.showNotice(`Sample DOM event: ${tagName}`);
  }

  private handleSampleEvent(file: TAbstractFile): void {
    if (!this.app.workspace.layoutReady) {
      return;
    }

    this.pluginNoticeComponent.showNotice(`Sample event: ${file.name}`);
  }

  private handleSampleIntervalTick(): void {
    this.pluginNoticeComponent.showNotice('Sample interval tick');
  }

  private handleSampleMarkdownPostProcessor(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    getDebugger('handleSampleMarkdownPostProcessor')(el, ctx);
    if (el.hasClass('el-h6')) {
      el.setText('Sample markdown post processor');
    }
  }

  private handleSampleObsidianProtocolHandler(params: ObsidianProtocolData): void {
    this.pluginNoticeComponent.showNotice(`Sample obsidian protocol handler: ${params.action}`);
  }

  private async openView(viewType: string): Promise<void> {
    await this.app.workspace.ensureSideLeaf(viewType, 'right');
  }

  private registerModalCommands(): void {
    this.commandRegistrar.addCommand({
      callback: this.showSampleModal.bind(this),
      id: 'show-sample-modal',
      name: 'Show sample modal'
    });

    this.commandRegistrar.addCommand({
      callback: convertAsyncToSync(this.showAlert.bind(this)),
      id: 'show-alert-modal',
      name: 'Show alert modal'
    });

    this.commandRegistrar.addCommand({
      callback: convertAsyncToSync(this.showConfirm.bind(this)),
      id: 'show-confirm-modal',
      name: 'Show confirm modal'
    });

    this.commandRegistrar.addCommand({
      callback: convertAsyncToSync(this.showPrompt.bind(this)),
      id: 'show-prompt-modal',
      name: 'Show prompt modal'
    });

    this.commandRegistrar.addCommand({
      callback: convertAsyncToSync(this.showSelectItem.bind(this)),
      id: 'show-select-item-modal',
      name: 'Show select item modal'
    });
  }

  private runSampleCommand(): void {
    this.pluginNoticeComponent.showNotice('Sample command');
  }

  private runSampleCommandWithCheck(checking: boolean): boolean {
    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!markdownView) {
      return false;
    }

    if (!checking) {
      this.pluginNoticeComponent.showNotice('Sample command with check');
    }

    return true;
  }

  private runSampleEditorCommand(editor: Editor): void {
    editor.replaceSelection('Sample Editor Command');
  }

  private runSampleRibbonIconCommand(): void {
    this.pluginNoticeComponent.showNotice('Sample ribbon icon command');
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

    this.pluginNoticeComponent.showNotice(`Sample confirm result: ${String(result)}`);
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
