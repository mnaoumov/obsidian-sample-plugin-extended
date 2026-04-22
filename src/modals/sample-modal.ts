import { Modal } from 'obsidian';

// eslint-disable-next-line obsidianmd/sample-names -- This IS the sample plugin.
export class SampleModal extends Modal {
  public override onOpen(): void {
    this.contentEl.setText('Sample modal');
  }
}
