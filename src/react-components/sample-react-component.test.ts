import { sleep } from 'obsidian-dev-utils/async';
import { AppContext } from 'obsidian-dev-utils/obsidian/react/app-context';
import { App } from 'obsidian-test-mocks/obsidian';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import {
  describe,
  expect,
  it
} from 'vitest';

import { SampleReactComponent } from './sample-react-component.tsx';

const START_COUNT = 5;
const VAULT_NAME = 'TestVault';

function createAppWithVaultName(): App {
  const app = App.createConfigured__();
  app.vault.getName = (): string => VAULT_NAME;
  return app;
}

describe('SampleReactComponent', () => {
  it('should be a function', () => {
    expect(typeof SampleReactComponent).toBe('function');
  });

  it('should render to the DOM with start count', async () => {
    const container = activeDocument.createElement('div');
    activeDocument.body.appendChild(container);
    const root = createRoot(container);
    const app = createAppWithVaultName();

    root.render(
      createElement(
        AppContext.Provider,
        { value: app.asOriginalType__() },
        createElement(SampleReactComponent, { startCount: START_COUNT })
      )
    );
    await sleep(0);

    expect(container.textContent).toContain(String(START_COUNT));
    root.unmount();
    activeDocument.body.removeChild(container);
  });

  it('should show vault name in rendered output', async () => {
    const container = activeDocument.createElement('div');
    activeDocument.body.appendChild(container);
    const root = createRoot(container);
    const app = createAppWithVaultName();

    root.render(
      createElement(
        AppContext.Provider,
        { value: app.asOriginalType__() },
        createElement(SampleReactComponent, { startCount: START_COUNT })
      )
    );
    await sleep(0);

    expect(container.textContent).toContain(VAULT_NAME);
    root.unmount();
    activeDocument.body.removeChild(container);
  });

  it('should increment count when button is clicked', async () => {
    const container = activeDocument.createElement('div');
    activeDocument.body.appendChild(container);
    const root = createRoot(container);
    const app = createAppWithVaultName();

    root.render(
      createElement(
        AppContext.Provider,
        { value: app.asOriginalType__() },
        createElement(SampleReactComponent, { startCount: START_COUNT })
      )
    );
    await sleep(0);

    const button = container.querySelector('button');
    expect(button).not.toBeNull();

    button?.click();

    await sleep(0);

    const EXPECTED_COUNT = START_COUNT + 1;
    expect(container.textContent).toContain(String(EXPECTED_COUNT));
    root.unmount();
    activeDocument.body.removeChild(container);
  });
});
