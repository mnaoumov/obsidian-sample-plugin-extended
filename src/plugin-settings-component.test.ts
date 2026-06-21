import type { PluginSettingsState } from 'obsidian-dev-utils/obsidian/components/plugin-settings-component';
import type { DataHandler } from 'obsidian-dev-utils/obsidian/data-handler';
import type { PluginEventSource } from 'obsidian-dev-utils/obsidian/plugin/plugin-event-source';

import { Notice } from 'obsidian';
import { castTo } from 'obsidian-dev-utils/object-utils';
import { PluginSettingsComponentBase } from 'obsidian-dev-utils/obsidian/components/plugin-settings-component';
import { strictProxy } from 'obsidian-dev-utils/strict-proxy';
import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { PluginSettingsComponent } from './plugin-settings-component.ts';
import {
  PluginSettings,
  TypedItem
} from './plugin-settings.ts';

interface ProtectedBase {
  onLoadRecord(record: unknown): Promise<void>;
  onLoadSettings(loadedState: unknown, isInitialLoad: boolean): Promise<void>;
  onSaveSettings(newState: unknown, oldState: unknown, context: unknown): Promise<void>;
  onSavingRecord(record: unknown): Promise<void>;
  registerValidator(key: string, validator: unknown): void;
  registerValidators(): void;
}

interface RegisteredValidator {
  key: string;
  validator(value: string): string | undefined;
}

const protectedBasePrototype = castTo<ProtectedBase>(PluginSettingsComponentBase.prototype);

vi.mock('obsidian', async (importOriginal) => ({
  ...await importOriginal<typeof import('obsidian')>(),
  Notice: vi.fn()
}));

describe('PluginSettingsComponent', () => {
  function createComponent(): PluginSettingsComponent {
    return new PluginSettingsComponent({
      dataHandler: strictProxy<DataHandler>({}),
      pluginEventSource: strictProxy<PluginEventSource>({})
    });
  }

  it('should create an instance', () => {
    const component = createComponent();
    expect(component).toBeInstanceOf(PluginSettingsComponent);
  });

  it('should create default PluginSettings as defaultSettings', () => {
    const component = createComponent();
    expect(component.defaultSettings).toBeInstanceOf(PluginSettings);
  });

  describe('onLoadRecord', () => {
    it('should deserialize typedDropdownSetting from string', async () => {
      const component = createComponent();
      const record: Record<string, unknown> = {
        typedDropdownSetting: 'Bar'
      };
      await component['onLoadRecord'](record);
      expect(record['typedDropdownSetting']).toBe(TypedItem.Bar);
    });

    it('should deserialize typedMultipleDropdownSetting from string array', async () => {
      const component = createComponent();
      const record: Record<string, unknown> = {
        typedMultipleDropdownSetting: ['Foo', 'Baz']
      };
      await component['onLoadRecord'](record);
      const result = record['typedMultipleDropdownSetting'] as TypedItem[];
      expect(result).toEqual([TypedItem.Foo, TypedItem.Baz]);
    });

    it('should call super.onLoadRecord', async () => {
      const component = createComponent();
      const superSpy = vi.spyOn(protectedBasePrototype, 'onLoadRecord');
      const record: Record<string, unknown> = {};
      await component['onLoadRecord'](record);
      expect(superSpy).toHaveBeenCalledWith(record);
    });

    it('should not deserialize when typedDropdownSetting is absent', async () => {
      const component = createComponent();
      const record: Record<string, unknown> = {};
      await component['onLoadRecord'](record);
      expect(record['typedDropdownSetting']).toBeUndefined();
    });

    it('should not deserialize when typedMultipleDropdownSetting is absent', async () => {
      const component = createComponent();
      const record: Record<string, unknown> = {};
      await component['onLoadRecord'](record);
      expect(record['typedMultipleDropdownSetting']).toBeUndefined();
    });
  });

  describe('onLoadSettings', () => {
    it('should show notice when textSetting is bar', async () => {
      vi.mocked(Notice).mockClear();
      const component = createComponent();
      const state = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'bar' } });
      await component['onLoadSettings'](state, false);
      expect(Notice).toHaveBeenCalledWith('Sample text setting is bar');
    });

    it('should not show notice when textSetting is not bar', async () => {
      vi.mocked(Notice).mockClear();
      const component = createComponent();
      const state = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'other' } });
      await component['onLoadSettings'](state, false);
      expect(Notice).not.toHaveBeenCalled();
    });

    it('should call super.onLoadSettings', async () => {
      const component = createComponent();
      const superSpy = vi.spyOn(protectedBasePrototype, 'onLoadSettings');
      const state = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'other' } });
      await component['onLoadSettings'](state, true);
      expect(superSpy).toHaveBeenCalledWith(state, true);
    });
  });

  describe('onSaveSettings', () => {
    it('should show notice when changed from bar to baz', async () => {
      vi.mocked(Notice).mockClear();
      const component = createComponent();
      const newState = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'baz' } });
      const oldState = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'bar' } });
      await component['onSaveSettings'](newState, oldState, undefined);
      expect(Notice).toHaveBeenCalledWith('Sample text setting is changed from bar to baz');
    });

    it('should not show notice when changed from something else to baz', async () => {
      vi.mocked(Notice).mockClear();
      const component = createComponent();
      const newState = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'baz' } });
      const oldState = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'other' } });
      await component['onSaveSettings'](newState, oldState, undefined);
      expect(Notice).not.toHaveBeenCalled();
    });

    it('should not show notice when baz to bar', async () => {
      vi.mocked(Notice).mockClear();
      const component = createComponent();
      const newState = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'bar' } });
      const oldState = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'baz' } });
      await component['onSaveSettings'](newState, oldState, undefined);
      expect(Notice).not.toHaveBeenCalled();
    });

    it('should call super.onSaveSettings', async () => {
      const component = createComponent();
      const superSpy = vi.spyOn(protectedBasePrototype, 'onSaveSettings');
      const newState = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'other' } });
      const oldState = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'other' } });
      await component['onSaveSettings'](newState, oldState, undefined);
      expect(superSpy).toHaveBeenCalledWith(newState, oldState, undefined);
    });
  });

  describe('onSavingRecord', () => {
    it('should serialize typedDropdownSetting to string', async () => {
      const component = createComponent();
      const record: Record<string, unknown> = {
        typedDropdownSetting: TypedItem.Bar
      };
      await component['onSavingRecord'](record);
      expect(record['typedDropdownSetting']).toBe('Bar');
    });

    it('should serialize typedMultipleDropdownSetting to string array', async () => {
      const component = createComponent();
      const record: Record<string, unknown> = {
        typedMultipleDropdownSetting: [TypedItem.Foo, TypedItem.Baz]
      };
      await component['onSavingRecord'](record);
      expect(record['typedMultipleDropdownSetting']).toEqual(['Foo', 'Baz']);
    });

    it('should call super.onSavingRecord', async () => {
      const component = createComponent();
      const superSpy = vi.spyOn(protectedBasePrototype, 'onSavingRecord');
      const record: Record<string, unknown> = {};
      await component['onSavingRecord'](record);
      expect(superSpy).toHaveBeenCalledWith(record);
    });

    it('should not serialize when typedDropdownSetting is absent', async () => {
      const component = createComponent();
      const record: Record<string, unknown> = {};
      await component['onSavingRecord'](record);
      expect(record['typedDropdownSetting']).toBeUndefined();
    });

    it('should not serialize when typedMultipleDropdownSetting is absent', async () => {
      const component = createComponent();
      const record: Record<string, unknown> = {};
      await component['onSavingRecord'](record);
      expect(record['typedMultipleDropdownSetting']).toBeUndefined();
    });
  });

  describe('registerValidators', () => {
    function captureRegisteredValidators(): RegisteredValidator[] {
      const registeredValidators: RegisteredValidator[] = [];
      vi.spyOn(protectedBasePrototype, 'registerValidator').mockImplementation(
        (key, validator) => {
          registeredValidators.push({ key, validator: castTo<(value: string) => string | undefined>(validator) });
        }
      );
      return registeredValidators;
    }

    it('should register textSetting validator that rejects foo', () => {
      const component = createComponent();
      const registeredValidators = captureRegisteredValidators();
      component['registerValidators']();
      const textValidator = registeredValidators.find((v) => v.key === 'textSetting');
      expect(textValidator).toBeDefined();
      expect(textValidator?.validator('foo')).toBe('Foo is not allowed');
    });

    it('should register textSetting validator that allows other values', () => {
      const component = createComponent();
      const registeredValidators = captureRegisteredValidators();
      component['registerValidators']();
      const textValidator = registeredValidators.find((v) => v.key === 'textSetting');
      expect(textValidator?.validator('bar')).toBeUndefined();
    });

    it('should call super.registerValidators', () => {
      const component = createComponent();
      const superSpy = vi.spyOn(protectedBasePrototype, 'registerValidators');
      component['registerValidators']();
      expect(superSpy).toHaveBeenCalled();
    });
  });
});
