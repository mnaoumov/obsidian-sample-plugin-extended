import type { WorkspaceLeaf } from 'obsidian';

import { castTo } from 'obsidian-dev-utils/object-utils';
import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

const ItemViewMock = vi.hoisted(() => {
  return class {
    public contentEl: HTMLElement = activeDocument.createElement('div');
    public leaf: unknown;

    public constructor(leaf: unknown) {
      this.leaf = leaf;
    }
  };
});

vi.mock('obsidian', () => ({
  ItemView: ItemViewMock
}));

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import {
  SAMPLE_VIEW_TYPE,
  SampleView
} from './sample-view.ts';

describe('SAMPLE_VIEW_TYPE', () => {
  it('should equal SamplePluginExtended-SampleView', () => {
    expect(SAMPLE_VIEW_TYPE).toBe('SamplePluginExtended-SampleView');
  });
});

describe('SampleView', () => {
  function createView(): SampleView {
    return new SampleView(castTo<WorkspaceLeaf>({}));
  }

  it('should create an instance', () => {
    const view = createView();
    expect(view).toBeInstanceOf(SampleView);
  });

  it('should return correct view type', () => {
    const view = createView();
    expect(view.getViewType()).toBe(SAMPLE_VIEW_TYPE);
  });

  it('should return "Sample view" as display text', () => {
    const view = createView();
    expect(view.getDisplayText()).toBe('Sample view');
  });

  it('should create an h4 element with "Sample view" text on open', async () => {
    const view = createView();
    await view.onOpen();
    const h4 = view.contentEl.querySelector('h4');
    expect(h4).not.toBeNull();
    expect(h4?.textContent).toBe('Sample view');
  });
});
