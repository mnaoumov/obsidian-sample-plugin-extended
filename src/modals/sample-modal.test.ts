import { App } from 'obsidian-test-mocks/obsidian';
import {
  describe,
  expect,
  it
} from 'vitest';

import { SampleModal } from './sample-modal.ts';

describe('SampleModal', () => {
  function createModal(): SampleModal {
    return new SampleModal(App.createConfigured__().asOriginalType__());
  }

  it('should create an instance', () => {
    const modal = createModal();
    expect(modal).toBeInstanceOf(SampleModal);
  });

  it('should set text to "Sample modal" on open', () => {
    const modal = createModal();
    modal.onOpen();
    expect(modal.contentEl.textContent).toBe('Sample modal');
  });
});
