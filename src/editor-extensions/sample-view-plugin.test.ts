import { castTo } from 'obsidian-dev-utils/object-utils';
import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

interface MockBuilder {
  add(from: number, to: number, decoration: unknown): void;
  finish(): MockDecorationSet;
}

interface MockDecoration {
  range(from: number, to: number): unknown;
}

interface MockDecorationSet {
  readonly _type: 'decorationSet';
}

interface MockEditorView {
  state: MockState;
  visibleRanges: MockVisibleRange[];
}

interface MockIterateParams {
  enter(node: MockNode): void;
  readonly from?: number;
  readonly to?: number;
}

interface MockNode {
  from: number;
  type: MockNodeType;
}

interface MockNodeType {
  name: string;
}

interface MockPluginCapture {
  pluginClass: new (view: MockEditorView) => unknown;
  spec: unknown;
}

interface MockPluginInstance {
  update(u: MockViewUpdate): void;
}

interface MockPluginSpec {
  decorations(value: MockPluginWithDecorations): string;
}

interface MockPluginWithDecorations {
  decorations: string;
}

interface MockSpecCapture {
  spec: unknown;
}

type MockState = object;

interface MockTree {
  iterate(params: MockIterateParams): void;
}

interface MockViewUpdate {
  docChanged: boolean;
  view: MockEditorView;
  viewportChanged: boolean;
}

interface MockVisibleRange {
  from: number;
  to: number;
}

const mockDecorationSet: MockDecorationSet = { _type: 'decorationSet' };

const hoisted = vi.hoisted(() => {
  const mockBuilder: MockBuilder = {
    add: vi.fn(),
    finish: vi.fn(() => mockDecorationSet)
  };

  const mockDecoration: MockDecoration = {
    range: vi.fn()
  };

  const mockCaptures: MockPluginCapture[] = [];

  return { mockBuilder, mockCaptures, mockDecoration };
});

vi.mock('@codemirror/view', () => ({
  Decoration: {
    none: null,
    replace: vi.fn(() => hoisted.mockDecoration)
  },
  EditorView: {
    decorations: {
      from: vi.fn()
    }
  },
  ViewPlugin: {
    fromClass: vi.fn((cls: new (view: MockEditorView) => unknown, spec: unknown) => {
      hoisted.mockCaptures.push({ pluginClass: cls, spec });
      return { cls, spec };
    })
  }
}));

vi.mock('@codemirror/state', () => ({
  RangeSetBuilder: class {
    public add = hoisted.mockBuilder.add;
    public finish = hoisted.mockBuilder.finish;
  }
}));

vi.mock('@codemirror/language', () => ({
  syntaxTree: vi.fn((_state: MockState): MockTree => ({
    iterate: (params: MockIterateParams): void => {
      const listNode: MockNode = { from: 5, type: { name: 'list-item' } };
      const otherNode: MockNode = { from: 3, type: { name: 'paragraph' } };
      params.enter(listNode);
      params.enter(otherNode);
    }
  }))
}));

vi.mock('./sample-widget.ts', () => ({
  SampleWidget: vi.fn()
}));

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { syntaxTree } from '@codemirror/language';

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { sampleViewPlugin } from './sample-view-plugin.ts';

describe('sampleViewPlugin', () => {
  it('should be created via ViewPlugin.fromClass', () => {
    expect(sampleViewPlugin).toBeDefined();
    expect(hoisted.mockCaptures.length).toBeGreaterThan(0);
  });

  describe('pluginSpec.decorations', () => {
    it('should return the decorations from the plugin instance', () => {
      const capturedCapture = hoisted.mockCaptures[0];
      const capturedSpec = capturedCapture?.spec as MockPluginSpec & MockSpecCapture | undefined;
      const mockDecorations = 'test-decorations';
      const result = capturedSpec?.decorations({ decorations: mockDecorations });
      expect(result).toBe(mockDecorations);
    });
  });

  describe('SampleViewPlugin class', () => {
    function createView(visibleRanges: MockVisibleRange[]): MockEditorView {
      return {
        state: {},
        visibleRanges
      };
    }

    function createPlugin(view: MockEditorView): MockPluginInstance {
      const capture = hoisted.mockCaptures[0];
      if (!capture) {
        throw new Error('No plugin class captured');
      }

      return new capture.pluginClass(view) as MockPluginInstance;
    }

    it('should build decorations on construction', () => {
      vi.mocked(hoisted.mockBuilder.finish).mockClear();
      const view = createView([{ from: 0, to: 100 }]);
      createPlugin(view);
      expect(hoisted.mockBuilder.finish).toHaveBeenCalled();
    });

    it('should add decoration for list node', () => {
      vi.mocked(hoisted.mockBuilder.add).mockClear();
      const view = createView([{ from: 0, to: 100 }]);
      createPlugin(view);
      expect(hoisted.mockBuilder.add).toHaveBeenCalled();
    });

    it('should not add decoration for non-list node', () => {
      vi.mocked(hoisted.mockBuilder.add).mockClear();
      vi.mocked(syntaxTree).mockImplementation(castTo<typeof syntaxTree>((_state: MockState): MockTree => ({
        iterate: (params: MockIterateParams): void => {
          params.enter({ from: 3, type: { name: 'paragraph' } });
        }
      })));

      const view = createView([{ from: 0, to: 100 }]);
      createPlugin(view);
      expect(hoisted.mockBuilder.add).not.toHaveBeenCalled();
    });

    it('should update decorations when docChanged', () => {
      vi.mocked(hoisted.mockBuilder.finish).mockClear();
      const view = createView([{ from: 0, to: 100 }]);
      const plugin = createPlugin(view);
      const update: MockViewUpdate = { docChanged: true, view, viewportChanged: false };
      plugin.update(update);
      expect(hoisted.mockBuilder.finish).toHaveBeenCalledTimes(2);
    });

    it('should update decorations when viewportChanged', () => {
      vi.mocked(hoisted.mockBuilder.finish).mockClear();
      const view = createView([{ from: 0, to: 100 }]);
      const plugin = createPlugin(view);
      const update: MockViewUpdate = { docChanged: false, view, viewportChanged: true };
      plugin.update(update);
      expect(hoisted.mockBuilder.finish).toHaveBeenCalledTimes(2);
    });

    it('should not update decorations when neither docChanged nor viewportChanged', () => {
      vi.mocked(hoisted.mockBuilder.finish).mockClear();
      const view = createView([{ from: 0, to: 100 }]);
      const plugin = createPlugin(view);
      const initialCallCount = vi.mocked(hoisted.mockBuilder.finish).mock.calls.length;
      const update: MockViewUpdate = { docChanged: false, view, viewportChanged: false };
      plugin.update(update);
      expect(hoisted.mockBuilder.finish).toHaveBeenCalledTimes(initialCallCount);
    });
  });
});
