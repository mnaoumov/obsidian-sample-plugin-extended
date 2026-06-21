import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

// The Svelte single-file component cannot be parsed by Vite's import analysis in
// This unit-test context, so stub the asset import. This is a non-dev-utils asset
// Mock, not a mock of any test-mocks / dev-utils behavior.
vi.mock('./svelte-components/sample-svelte-component.svelte', () => ({
  default: vi.fn()
}));

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import Plugin from './main.ts';
// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { Plugin as PluginClass } from './plugin.ts';

describe('main', () => {
  it('should export Plugin as default export', () => {
    expect(Plugin).toBe(PluginClass);
  });
});
