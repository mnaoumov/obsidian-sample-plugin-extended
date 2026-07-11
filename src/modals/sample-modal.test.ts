import { App } from 'obsidian-test-mocks/obsidian';
import {
  describe,
  expect,
  it
} from 'vitest';

import { SamplePluginModal } from './sample-modal.ts';

describe('SamplePluginModal', () => {
  function createModal(): SamplePluginModal {
    return new SamplePluginModal(App.createConfigured__().asOriginalType__());
  }

  it('should create an instance', () => {
    const modal = createModal();
    expect(modal).toBeInstanceOf(SamplePluginModal);
  });

  it('should set text to "Sample modal" on open', () => {
    const modal = createModal();
    modal.onOpen();
    expect(modal.contentEl.textContent).toBe('Sample modal');
  });
});
