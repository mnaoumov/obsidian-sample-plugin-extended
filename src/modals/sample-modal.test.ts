import type { App } from 'obsidian';

import { castTo } from 'obsidian-dev-utils/object-utils';
import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

const ModalMock = vi.hoisted(() => {
  return class {
    public contentEl: HTMLElement = activeDocument.createElement('div');

    public open(): void {
      /* No-op */
    }
  };
});

vi.mock('obsidian', () => ({
  Modal: ModalMock
}));

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { SampleModal } from './sample-modal.ts';

describe('SampleModal', () => {
  it('should create an instance', () => {
    const modal = new SampleModal(castTo<App>({}));
    expect(modal).toBeInstanceOf(SampleModal);
  });

  it('should set text to "Sample modal" on open', () => {
    const modal = new SampleModal(castTo<App>({}));
    modal.onOpen();
    expect(modal.contentEl.textContent).toBe('Sample modal');
  });
});
