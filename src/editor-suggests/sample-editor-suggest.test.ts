import type {
  Editor,
  EditorPosition,
  EditorSuggestContext,
  TFile
} from 'obsidian';

import { castTo } from 'obsidian-dev-utils/object-utils';
import { strictProxy } from 'obsidian-dev-utils/strict-proxy';
import { App } from 'obsidian-test-mocks/obsidian';
import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { SampleEditorSuggest } from './sample-editor-suggest.ts';

describe('SampleEditorSuggest', () => {
  function createSuggest(): SampleEditorSuggest {
    return new SampleEditorSuggest(App.createConfigured__().asOriginalType__());
  }

  it('should create an instance', () => {
    const suggest = createSuggest();
    expect(suggest).toBeInstanceOf(SampleEditorSuggest);
  });

  describe('getSuggestions', () => {
    it('should return three suggestions based on query', () => {
      const suggest = createSuggest();
      const context = strictProxy<EditorSuggestContext>({ query: 'test' });
      const suggestions = suggest.getSuggestions(context);
      expect(suggestions).toEqual(['test 1', 'test 2', 'test 3']);
    });

    it('should prefix each suggestion with query', () => {
      const suggest = createSuggest();
      const context = strictProxy<EditorSuggestContext>({ query: 'hello' });
      const suggestions = castTo<string[]>(suggest.getSuggestions(context));
      expect(suggestions[0]).toBe('hello 1');
      expect(suggestions[1]).toBe('hello 2');
      expect(suggestions[2]).toBe('hello 3');
    });
  });

  describe('onTrigger', () => {
    it('should return null when line is not "Sample"', () => {
      const suggest = createSuggest();
      const cursor: EditorPosition = { ch: 0, line: 0 };
      const editor = strictProxy<Editor>({
        getLine: vi.fn().mockReturnValue('Other')
      });
      const result = suggest.onTrigger(cursor, editor, null);
      expect(result).toBeNull();
    });

    it('should return trigger info when line is "Sample"', () => {
      const suggest = createSuggest();
      const cursor: EditorPosition = { ch: 0, line: 0 };
      const editor = strictProxy<Editor>({
        getLine: vi.fn().mockReturnValue('Sample')
      });
      const result = suggest.onTrigger(cursor, editor, null);
      expect(result).not.toBeNull();
      expect(result?.start).toBe(cursor);
      expect(result?.end).toBe(cursor);
    });

    it('should include filename in query when file is provided', () => {
      const suggest = createSuggest();
      const cursor: EditorPosition = { ch: 0, line: 0 };
      const editor = strictProxy<Editor>({
        getLine: vi.fn().mockReturnValue('Sample')
      });
      const file = strictProxy<TFile>({ name: 'test.md' });
      const result = suggest.onTrigger(cursor, editor, file);
      expect(result?.query).toBe('Query test.md');
    });

    it('should use empty string when file is null', () => {
      const suggest = createSuggest();
      const cursor: EditorPosition = { ch: 0, line: 0 };
      const editor = strictProxy<Editor>({
        getLine: vi.fn().mockReturnValue('Sample')
      });
      const result = suggest.onTrigger(cursor, editor, null);
      expect(result?.query).toBe('Query ');
    });
  });

  describe('renderSuggestion', () => {
    it('should create strong element with suggestion text', () => {
      const suggest = createSuggest();
      const el = activeDocument.createElement('div');
      suggest.renderSuggestion('test value', el);
      const strong = el.querySelector('strong');
      expect(strong).not.toBeNull();
      expect(strong?.textContent).toBe('test value');
    });
  });

  describe('selectSuggestion', () => {
    it('should call close', () => {
      const suggest = createSuggest();
      const closeSpy = vi.spyOn(suggest, 'close');
      const evt = new MouseEvent('click');
      suggest.selectSuggestion('value', evt);
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should replace range in editor when cursor and editor are set', () => {
      const suggest = createSuggest();
      vi.spyOn(suggest, 'close').mockImplementation(() => undefined);
      const cursor: EditorPosition = { ch: 0, line: 0 };
      const replaceRange = vi.fn();
      const editor = strictProxy<Editor>({
        getLine: vi.fn().mockReturnValue('Sample'),
        replaceRange
      });

      suggest.onTrigger(cursor, editor, null);

      const evt = new MouseEvent('click');
      suggest.selectSuggestion('value', evt);

      expect(replaceRange).toHaveBeenCalledWith(
        expect.stringContaining('Transformed value'),
        cursor
      );
    });

    it('should not replace range when editor is not set', () => {
      const suggest = createSuggest();
      const closeSpy = vi.spyOn(suggest, 'close');
      const evt = new MouseEvent('click');
      suggest.selectSuggestion('value', evt);
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should include event type in replacement text', () => {
      const suggest = createSuggest();
      vi.spyOn(suggest, 'close').mockImplementation(() => undefined);
      const cursor: EditorPosition = { ch: 0, line: 0 };
      const replaceRange = vi.fn();
      const editor = strictProxy<Editor>({
        getLine: vi.fn().mockReturnValue('Sample'),
        replaceRange
      });
      suggest.onTrigger(cursor, editor, null);

      const evt = new KeyboardEvent('keydown');
      suggest.selectSuggestion('test', evt);
      expect(replaceRange).toHaveBeenCalledWith('Transformed test keydown', cursor);
    });
  });
});
