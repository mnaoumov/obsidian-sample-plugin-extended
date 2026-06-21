import {
  App,
  WorkspaceLeaf
} from 'obsidian-test-mocks/obsidian';
import {
  describe,
  expect,
  it
} from 'vitest';

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
    const app = App.createConfigured__();
    const leaf = WorkspaceLeaf.create2__(app);
    return new SampleView(leaf.asOriginalType3__());
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
