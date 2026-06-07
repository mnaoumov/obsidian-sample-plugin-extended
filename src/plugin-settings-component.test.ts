import type { PluginSettingsState } from 'obsidian-dev-utils/obsidian/components/plugin-settings-component';
import type { DataHandler } from 'obsidian-dev-utils/obsidian/data-handler';
import type { PluginEventSource } from 'obsidian-dev-utils/obsidian/plugin/plugin-event-source';

import { castTo } from 'obsidian-dev-utils/object-utils';
import { strictProxy } from 'obsidian-dev-utils/strict-proxy';
import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

interface MockPluginSettingsComponentBaseConstructorParams {
  readonly pluginSettingsClass: new () => unknown;
}

interface MockRegisteredValidator {
  key: string;
  validator(value: string): string | undefined;
}

const PluginSettingsComponentBaseMock = vi.hoisted(() =>
  class {
    public defaultSettings: unknown;

    public constructor(params: MockPluginSettingsComponentBaseConstructorParams) {
      this.defaultSettings = new params.pluginSettingsClass();
    }

    public async onLoadRecord(_record: unknown): Promise<void> {
      /* No-op */
    }

    public async onLoadSettings(_loadedState: unknown, _isInitialLoad: boolean): Promise<void> {
      /* No-op */
    }

    public async onSaveSettings(_newState: unknown, _oldState: unknown, _context: unknown): Promise<void> {
      /* No-op */
    }

    public async onSavingRecord(_record: unknown): Promise<void> {
      /* No-op */
    }

    public registerValidator(_key: string, _validator: unknown): void {
      /* No-op */
    }

    public registerValidators(): void {
      /* No-op */
    }
  }
);

const hoisted = vi.hoisted(() => ({
  mockNotice: vi.fn()
}));

vi.mock('obsidian-dev-utils/obsidian/components/plugin-settings-component', () => ({
  PluginSettingsComponentBase: PluginSettingsComponentBaseMock
}));

vi.mock('obsidian', () => ({
  moment: {
    duration: vi.fn(() => ({ hours: 12, minutes: 34 }))
  },
  Notice: hoisted.mockNotice
}));

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { PluginSettingsComponent } from './plugin-settings-component.ts';
// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import {
  PluginSettings,
  TypedItem
} from './plugin-settings.ts';

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
      const superSpy = vi.spyOn(PluginSettingsComponentBaseMock.prototype, 'onLoadRecord');
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
      hoisted.mockNotice.mockClear();
      const component = createComponent();
      const state = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'bar' } });
      await component['onLoadSettings'](state, false);
      expect(hoisted.mockNotice).toHaveBeenCalledWith('Sample text setting is bar');
    });

    it('should not show notice when textSetting is not bar', async () => {
      hoisted.mockNotice.mockClear();
      const component = createComponent();
      const state = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'other' } });
      await component['onLoadSettings'](state, false);
      expect(hoisted.mockNotice).not.toHaveBeenCalled();
    });

    it('should call super.onLoadSettings', async () => {
      const component = createComponent();
      const superSpy = vi.spyOn(PluginSettingsComponentBaseMock.prototype, 'onLoadSettings');
      const state = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'other' } });
      await component['onLoadSettings'](state, true);
      expect(superSpy).toHaveBeenCalledWith(state, true);
    });
  });

  describe('onSaveSettings', () => {
    it('should show notice when changed from bar to baz', async () => {
      hoisted.mockNotice.mockClear();
      const component = createComponent();
      const newState = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'baz' } });
      const oldState = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'bar' } });
      await component['onSaveSettings'](newState, oldState, undefined);
      expect(hoisted.mockNotice).toHaveBeenCalledWith('Sample text setting is changed from bar to baz');
    });

    it('should not show notice when changed from something else to baz', async () => {
      hoisted.mockNotice.mockClear();
      const component = createComponent();
      const newState = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'baz' } });
      const oldState = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'other' } });
      await component['onSaveSettings'](newState, oldState, undefined);
      expect(hoisted.mockNotice).not.toHaveBeenCalled();
    });

    it('should not show notice when baz to bar', async () => {
      hoisted.mockNotice.mockClear();
      const component = createComponent();
      const newState = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'bar' } });
      const oldState = castTo<PluginSettingsState<PluginSettings>>({ effectiveValues: { textSetting: 'baz' } });
      await component['onSaveSettings'](newState, oldState, undefined);
      expect(hoisted.mockNotice).not.toHaveBeenCalled();
    });

    it('should call super.onSaveSettings', async () => {
      const component = createComponent();
      const superSpy = vi.spyOn(PluginSettingsComponentBaseMock.prototype, 'onSaveSettings');
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
      const superSpy = vi.spyOn(PluginSettingsComponentBaseMock.prototype, 'onSavingRecord');
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
    it('should register textSetting validator that rejects foo', () => {
      const component = createComponent();
      const registeredValidators: MockRegisteredValidator[] = [];
      vi.spyOn(PluginSettingsComponentBaseMock.prototype, 'registerValidator').mockImplementation(
        (key: string, validator: unknown) => {
          registeredValidators.push({ key, validator: validator as (value: string) => string | undefined });
        }
      );
      component['registerValidators']();
      const textValidator = registeredValidators.find((v) => v.key === 'textSetting');
      expect(textValidator).toBeDefined();
      expect(textValidator?.validator('foo')).toBe('Foo is not allowed');
    });

    it('should register textSetting validator that allows other values', () => {
      const component = createComponent();
      const registeredValidators: MockRegisteredValidator[] = [];
      vi.spyOn(PluginSettingsComponentBaseMock.prototype, 'registerValidator').mockImplementation(
        (key: string, validator: unknown) => {
          registeredValidators.push({ key, validator: validator as (value: string) => string | undefined });
        }
      );
      component['registerValidators']();
      const textValidator = registeredValidators.find((v) => v.key === 'textSetting');
      expect(textValidator?.validator('bar')).toBeUndefined();
    });

    it('should call super.registerValidators', () => {
      const component = createComponent();
      const superSpy = vi.spyOn(PluginSettingsComponentBaseMock.prototype, 'registerValidators');
      component['registerValidators']();
      expect(superSpy).toHaveBeenCalled();
    });
  });
});
