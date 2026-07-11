import { Modal } from 'obsidian';

export class SamplePluginModal extends Modal {
  public override onOpen(): void {
    this.contentEl.setText('Sample modal');
  }
}
