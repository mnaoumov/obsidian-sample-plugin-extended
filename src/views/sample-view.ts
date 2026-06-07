import { ItemView } from 'obsidian';
import { noopAsync } from 'obsidian-dev-utils/function';

export const SAMPLE_VIEW_TYPE = 'SamplePluginExtended-SampleView';

export class SampleView extends ItemView {
  public override getDisplayText(): string {
    return 'Sample view';
  }

  public override getViewType(): string {
    return SAMPLE_VIEW_TYPE;
  }

  public override async onOpen(): Promise<void> {
    this.contentEl.empty();
    this.contentEl.createEl('h4', { text: 'Sample view' });
    await noopAsync();
  }
}
