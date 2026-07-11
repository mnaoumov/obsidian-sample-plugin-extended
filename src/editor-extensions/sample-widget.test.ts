import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

const WidgetTypeMock = vi.hoisted(() => {
  return class {
    public toDOM(): HTMLElement {
      return activeWindow.createSpan();
    }
  };
});

vi.mock('@codemirror/view', () => ({
  WidgetType: WidgetTypeMock
}));

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { SampleWidget } from './sample-widget.ts';

describe('SampleWidget', () => {
  it('should create an instance', () => {
    const widget = new SampleWidget();
    expect(widget).toBeInstanceOf(SampleWidget);
  });

  it('should return a span element from toDOM', () => {
    const widget = new SampleWidget();
    const el = widget.toDOM();
    expect(el.tagName.toLowerCase()).toBe('span');
  });

  it('should have emoji text content in toDOM result', () => {
    const widget = new SampleWidget();
    const el = widget.toDOM();
    expect(el.textContent).toBe('👉');
  });
});
