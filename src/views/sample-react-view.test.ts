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

const hoisted = vi.hoisted(() => {
  const mockRender = vi.fn();
  const mockUnmount = vi.fn();
  const mockCreateRoot = vi.fn(() => ({ render: mockRender, unmount: mockUnmount }));

  return { mockCreateRoot, mockRender, mockUnmount };
});

vi.mock('react-dom/client', () => ({
  createRoot: hoisted.mockCreateRoot
}));

vi.mock('../react-components/sample-react-component.tsx', () => ({
  SampleReactComponent: vi.fn()
}));

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import {
  SAMPLE_REACT_VIEW_TYPE,
  SampleReactView
} from './sample-react-view.tsx';

describe('SAMPLE_REACT_VIEW_TYPE', () => {
  it('should equal sample-plugin-extended-SampleReactView', () => {
    expect(SAMPLE_REACT_VIEW_TYPE).toBe('sample-plugin-extended-SampleReactView');
  });
});

describe('SampleReactView', () => {
  function createView(): SampleReactView {
    const app = App.createConfigured__();
    const leaf = WorkspaceLeaf.create2__(app);
    return new SampleReactView(leaf.asOriginalType3__());
  }

  it('should create an instance', () => {
    const view = createView();
    expect(view).toBeInstanceOf(SampleReactView);
  });

  it('should return correct view type', () => {
    const view = createView();
    expect(view.getViewType()).toBe(SAMPLE_REACT_VIEW_TYPE);
  });

  it('should return "Sample React view" as display text', () => {
    const view = createView();
    expect(view.getDisplayText()).toBe('Sample React view');
  });

  it('should create root and render on open', async () => {
    hoisted.mockCreateRoot.mockClear();
    hoisted.mockRender.mockClear();
    const view = createView();
    await view.onOpen();
    expect(hoisted.mockCreateRoot).toHaveBeenCalled();
    expect(hoisted.mockRender).toHaveBeenCalled();
  });

  it('should unmount root on close after open', async () => {
    hoisted.mockUnmount.mockClear();
    const view = createView();
    await view.onOpen();
    await view.onClose();
    expect(hoisted.mockUnmount).toHaveBeenCalled();
  });

  it('should not unmount when close called before open', async () => {
    hoisted.mockUnmount.mockClear();
    const view = createView();
    await view.onClose();
    expect(hoisted.mockUnmount).not.toHaveBeenCalled();
  });

  it('should render component on open (verifying onOpen executes render)', async () => {
    hoisted.mockRender.mockClear();
    const view = createView();
    await view.onOpen();
    expect(hoisted.mockRender).toHaveBeenCalledTimes(1);
  });
});
