import type { MockInstance } from 'vitest';

import { castTo } from 'obsidian-dev-utils/object-utils';
import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

interface MockExtension {
  readonly _type: 'extension';
}

interface MockIterateParams {
  enter(node: MockNode): void;
}

interface MockNode {
  from: number;
  type: MockNodeType;
}

interface MockNodeType {
  name: string;
}

interface MockSpecCapture {
  spec: unknown;
}

type MockState = object;

interface MockStateFieldSpec {
  create(): unknown;
  provide(field: unknown): unknown;
  update(oldState: unknown, transaction: MockTransaction): unknown;
}

interface MockTransaction {
  state: MockState;
}

interface MockTree {
  iterate(params: MockIterateParams): void;
}

const mockExtension: MockExtension = { _type: 'extension' };

const hoisted = vi.hoisted(() => {
  const mockBuilder = {
    add: vi.fn(),
    finish: vi.fn<() => string>(() => 'built-decoration-set')
  };

  const mockCaptures: MockSpecCapture[] = [];

  return { mockBuilder, mockCaptures };
});

vi.mock('@codemirror/state', () => ({
  RangeSetBuilder: class {
    public add = hoisted.mockBuilder.add;
    public finish = hoisted.mockBuilder.finish;
  },
  StateField: {
    define: vi.fn((spec: unknown) => {
      hoisted.mockCaptures.push({ spec });
      return { spec };
    })
  },
  Transaction: vi.fn()
}));

vi.mock('@codemirror/view', () => ({
  Decoration: {
    none: 'none',
    replace: vi.fn(() => 'replace-decoration')
  },
  EditorView: {
    decorations: {
      from: vi.fn(() => mockExtension)
    }
  }
}));

vi.mock('@codemirror/language', () => ({
  syntaxTree: vi.fn((_state: MockState): MockTree => ({
    iterate: (params: MockIterateParams): void => {
      params.enter({ from: 5, type: { name: 'list-item' } });
      params.enter({ from: 3, type: { name: 'paragraph' } });
    }
  }))
}));

vi.mock('./sample-widget.ts', () => ({
  SampleWidget: vi.fn()
}));

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { syntaxTree } from '@codemirror/language';
// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { EditorView } from '@codemirror/view';

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { sampleStateField } from './sample-state-field.ts';

describe('sampleStateField', () => {
  it('should be defined', () => {
    expect(sampleStateField).toBeDefined();
  });

  it('should be created via StateField.define', () => {
    expect(hoisted.mockCaptures.length).toBeGreaterThan(0);
  });

  describe('StateFieldSpec', () => {
    function getSpec(): MockStateFieldSpec {
      const capture = hoisted.mockCaptures[0];
      return capture?.spec as MockStateFieldSpec;
    }

    it('should return Decoration.none from create()', () => {
      const spec = getSpec();
      const result = spec.create();
      expect(result).toBe('none');
    });

    it('should call EditorView.decorations.from in provide()', () => {
      vi.mocked(castTo<MockInstance>(EditorView.decorations.from)).mockClear();
      const spec = getSpec();
      const field = {};
      spec.provide(field);
      expect(vi.mocked(castTo<MockInstance>(EditorView.decorations.from))).toHaveBeenCalledWith(field);
    });

    it('should build decorations with list nodes in update()', () => {
      vi.mocked(hoisted.mockBuilder.add).mockClear();
      vi.mocked(hoisted.mockBuilder.finish).mockClear();
      const spec = getSpec();
      const transaction: MockTransaction = { state: {} };
      spec.update('oldState', transaction);
      expect(hoisted.mockBuilder.add).toHaveBeenCalled();
      expect(hoisted.mockBuilder.finish).toHaveBeenCalled();
    });

    it('should not add decorations for non-list nodes in update()', () => {
      vi.mocked(hoisted.mockBuilder.add).mockClear();
      vi.mocked(syntaxTree).mockImplementation(castTo<typeof syntaxTree>((_state: MockState): MockTree => ({
        iterate: (params: MockIterateParams): void => {
          params.enter({ from: 3, type: { name: 'paragraph' } });
        }
      })));
      const spec = getSpec();
      const transaction: MockTransaction = { state: {} };
      spec.update('oldState', transaction);
      expect(hoisted.mockBuilder.add).not.toHaveBeenCalled();
    });
  });
});
