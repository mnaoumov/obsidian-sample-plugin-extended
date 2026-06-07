import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

vi.mock('obsidian', () => ({
  moment: {
    duration: vi.fn(() => ({ hours: 12, minutes: 34 }))
  }
}));

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import {
  PluginSettings,
  TypedItem
} from './plugin-settings.ts';

describe('TypedItem', () => {
  it('should have static Foo instance', () => {
    expect(TypedItem.Foo.name).toBe('Foo');
  });

  it('should have static Bar instance', () => {
    expect(TypedItem.Bar.name).toBe('Bar');
  });

  it('should have static Baz instance', () => {
    expect(TypedItem.Baz.name).toBe('Baz');
  });

  it('should deserialize Foo', () => {
    expect(TypedItem.deserialize('Foo')).toBe(TypedItem.Foo);
  });

  it('should deserialize Bar', () => {
    expect(TypedItem.deserialize('Bar')).toBe(TypedItem.Bar);
  });

  it('should deserialize Baz', () => {
    expect(TypedItem.deserialize('Baz')).toBe(TypedItem.Baz);
  });

  it('should throw for unknown item name', () => {
    expect(() => TypedItem.deserialize('Unknown')).toThrow('Unknown item: Unknown');
  });
});

describe('PluginSettings', () => {
  it('should have checkboxSetting defaulting to true', () => {
    const settings = new PluginSettings();
    expect(settings.checkboxSetting).toBe(true);
  });

  it('should have colorSetting default', () => {
    const settings = new PluginSettings();
    expect(settings.colorSetting).toBe('#123456');
  });

  it('should have dropdownSetting default', () => {
    const settings = new PluginSettings();
    expect(settings.dropdownSetting).toBe('Value2');
  });

  it('should have emailSetting default', () => {
    const settings = new PluginSettings();
    expect(settings.emailSetting).toBe('defaultEmail@example.com');
  });

  it('should have momentFormatSetting default', () => {
    const settings = new PluginSettings();
    expect(settings.momentFormatSetting).toBe('YYYY-MM-DD');
  });

  it('should have monthSetting default', () => {
    const settings = new PluginSettings();
    expect(settings.monthSetting).toEqual({ month: 2, year: 2025 });
  });

  it('should have weekSetting default', () => {
    const settings = new PluginSettings();
    expect(settings.weekSetting).toEqual({ weekNumber: 6, year: 2025 });
  });

  it('should have multipleDropdownSetting default', () => {
    const settings = new PluginSettings();
    expect(settings.multipleDropdownSetting).toEqual(['Value2', 'Value5']);
  });

  it('should have numberSetting default', () => {
    const settings = new PluginSettings();
    const EXPECTED_NUMBER = 123;
    expect(settings.numberSetting).toBe(EXPECTED_NUMBER);
  });

  it('should have textSetting default', () => {
    const settings = new PluginSettings();
    expect(settings.textSetting).toBe('defaultText');
  });

  it('should have textAreaSetting default', () => {
    const settings = new PluginSettings();
    expect(settings.textAreaSetting).toBe('defaultTextArea');
  });

  it('should have toggleSetting defaulting to true', () => {
    const settings = new PluginSettings();
    expect(settings.toggleSetting).toBe(true);
  });

  it('should have triStateCheckboxSetting defaulting to null', () => {
    const settings = new PluginSettings();
    expect(settings.triStateCheckboxSetting).toBeNull();
  });

  it('should have typedDropdownSetting defaulting to Foo', () => {
    const settings = new PluginSettings();
    expect(settings.typedDropdownSetting).toBe(TypedItem.Foo);
  });

  it('should have typedMultipleDropdownSetting defaulting to Bar and Baz', () => {
    const settings = new PluginSettings();
    expect(settings.typedMultipleDropdownSetting).toEqual([TypedItem.Bar, TypedItem.Baz]);
  });

  it('should have urlSetting default', () => {
    const settings = new PluginSettings();
    expect(settings.urlSetting).toBe('https://example.com');
  });

  it('should have searchSetting default', () => {
    const settings = new PluginSettings();
    expect(settings.searchSetting).toBe('defaultSearch');
  });

  it('should have dateSetting as a Date', () => {
    const settings = new PluginSettings();
    expect(settings.dateSetting).toBeInstanceOf(Date);
  });

  it('should have dateTimeSetting as a Date', () => {
    const settings = new PluginSettings();
    expect(settings.dateTimeSetting).toBeInstanceOf(Date);
  });

  it('should have progressBarSetting default', () => {
    const settings = new PluginSettings();
    const EXPECTED_PROGRESS = 50;
    expect(settings.progressBarSetting).toBe(EXPECTED_PROGRESS);
  });

  it('should have sliderSetting default', () => {
    const settings = new PluginSettings();
    const EXPECTED_SLIDER = 50;
    expect(settings.sliderSetting).toBe(EXPECTED_SLIDER);
  });

  it('should have multipleEmailSetting default', () => {
    const settings = new PluginSettings();
    expect(settings.multipleEmailSetting).toEqual(['defaultEmail@example.com', 'defaultEmail2@example.com']);
  });

  it('should have multipleTextSetting default', () => {
    const settings = new PluginSettings();
    expect(settings.multipleTextSetting).toEqual(['defaultText1', 'defaultText2', 'defaultText3']);
  });
});
