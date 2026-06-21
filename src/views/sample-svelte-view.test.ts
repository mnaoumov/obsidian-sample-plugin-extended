import {
  App,
  WorkspaceLeaf
} from 'obsidian-test-mocks/obsidian';
import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

type MockMountCall = [unknown, MockMountOptions];

interface MockMountOptions {
  readonly props: MockMountProps;
}

interface MockMountProps {
  startCount: number;
}

const hoisted = vi.hoisted(() => {
  const mockIncrement = vi.fn();
  const mockMount = vi.fn(() => ({ increment: mockIncrement }));
  const mockUnmount = vi.fn();

  return { mockIncrement, mockMount, mockUnmount };
});

vi.mock('svelte', () => ({
  mount: hoisted.mockMount,
  unmount: hoisted.mockUnmount
}));

vi.mock('../svelte-components/sample-svelte-component.svelte', () => ({
  default: vi.fn()
}));

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import {
  SAMPLE_SVELTE_VIEW_TYPE,
  SampleSvelteView
} from './sample-svelte-view.ts';

describe('SAMPLE_SVELTE_VIEW_TYPE', () => {
  it('should equal sample-plugin-extended-SampleSvelteView', () => {
    expect(SAMPLE_SVELTE_VIEW_TYPE).toBe('sample-plugin-extended-SampleSvelteView');
  });
});

describe('SampleSvelteView', () => {
  function createView(): SampleSvelteView {
    const app = App.createConfigured__();
    const leaf = WorkspaceLeaf.create2__(app);
    return new SampleSvelteView(leaf.asOriginalType3__());
  }

  it('should create an instance', () => {
    const view = createView();
    expect(view).toBeInstanceOf(SampleSvelteView);
  });

  it('should return correct view type', () => {
    const view = createView();
    expect(view.getViewType()).toBe(SAMPLE_SVELTE_VIEW_TYPE);
  });

  it('should return "Sample Svelte view" as display text', () => {
    const view = createView();
    expect(view.getDisplayText()).toBe('Sample Svelte view');
  });

  it('should mount svelte component on open', async () => {
    hoisted.mockMount.mockClear();
    const view = createView();
    await view.onOpen();
    expect(hoisted.mockMount).toHaveBeenCalled();
  });

  it('should call increment on svelte component after open', async () => {
    hoisted.mockIncrement.mockClear();
    const view = createView();
    await view.onOpen();
    expect(hoisted.mockIncrement).toHaveBeenCalled();
  });

  it('should unmount svelte component on close when mounted', async () => {
    hoisted.mockUnmount.mockClear();
    const view = createView();
    await view.onOpen();
    await view.onClose();
    expect(hoisted.mockUnmount).toHaveBeenCalled();
  });

  it('should not unmount when component was never mounted', async () => {
    hoisted.mockUnmount.mockClear();
    const view = createView();
    await view.onClose();
    expect(hoisted.mockUnmount).not.toHaveBeenCalled();
  });

  it('should pass startCount of 10 to svelte component', async () => {
    hoisted.mockMount.mockClear();
    const view = createView();
    await view.onOpen();
    const START_COUNT = 10;
    const mountCall = hoisted.mockMount.mock.calls[0] as MockMountCall | undefined;
    expect(mountCall?.[1].props.startCount).toBe(START_COUNT);
  });
});
