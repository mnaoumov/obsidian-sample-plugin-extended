import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

vi.mock('obsidian-dev-utils/obsidian/react/app-context', () => ({
  AppContext: { Provider: vi.fn() },
  useApp: vi.fn(() => ({ vault: { getName: vi.fn(() => 'TestVault') } }))
}));

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { createElement } from 'react';
// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { createRoot } from 'react-dom/client';

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { SampleReactComponent } from './sample-react-component.tsx';

const START_COUNT = 5;

describe('SampleReactComponent', () => {
  it('should be a function', () => {
    expect(typeof SampleReactComponent).toBe('function');
  });

  it('should render to the DOM with start count', async () => {
    const container = activeDocument.createElement('div');
    activeDocument.body.appendChild(container);
    const root = createRoot(container);

    await new Promise<void>((resolve) => {
      root.render(createElement(SampleReactComponent, { startCount: START_COUNT }));
      window.setTimeout(resolve, 0);
    });

    expect(container.textContent).toContain(String(START_COUNT));
    root.unmount();
    activeDocument.body.removeChild(container);
  });

  it('should show vault name in rendered output', async () => {
    const container = activeDocument.createElement('div');
    activeDocument.body.appendChild(container);
    const root = createRoot(container);

    await new Promise<void>((resolve) => {
      root.render(createElement(SampleReactComponent, { startCount: START_COUNT }));
      window.setTimeout(resolve, 0);
    });

    expect(container.textContent).toContain('TestVault');
    root.unmount();
    activeDocument.body.removeChild(container);
  });

  it('should increment count when button is clicked', async () => {
    const container = activeDocument.createElement('div');
    activeDocument.body.appendChild(container);
    const root = createRoot(container);

    await new Promise<void>((resolve) => {
      root.render(createElement(SampleReactComponent, { startCount: START_COUNT }));
      window.setTimeout(resolve, 0);
    });

    const button = container.querySelector('button');
    expect(button).not.toBeNull();

    button?.click();

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 0);
    });

    const EXPECTED_COUNT = START_COUNT + 1;
    expect(container.textContent).toContain(String(EXPECTED_COUNT));
    root.unmount();
    activeDocument.body.removeChild(container);
  });
});
