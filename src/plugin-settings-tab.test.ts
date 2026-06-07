import type { Plugin } from 'obsidian';
import type { PluginSettingsComponentBase } from 'obsidian-dev-utils/obsidian/components/plugin-settings-component';

import { castTo } from 'obsidian-dev-utils/object-utils';
import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import type { PluginSettings } from './plugin-settings.ts';

interface MockBindOptions {
  componentToPluginSettingsValueConverter?(v: string): string;
  onChanged?(newValue: unknown, oldValue: unknown): void;
  pluginSettingsToComponentValueConverter?(v: string): string;
}

interface MockButtonComponent {
  onClick(cb: () => void): MockButtonComponent;
  setButtonText(text: string): MockButtonComponent;
}

interface MockCodeHighlighterComponent {
  setLanguage(lang: string): MockCodeHighlighterComponent;
}

interface MockDropdownComponent {
  addOptions(options: Record<string, string>): MockDropdownComponent;
}

interface MockExtraButtonComponent {
  onClick(cb: () => void): MockExtraButtonComponent;
}

interface MockFileComponent {
  onChange(cb: (value: File | null) => void): MockFileComponent;
}

interface MockMapDropdownComponent {
  addOptions(map: Map<unknown, string>): MockMapDropdownComponent;
}

interface MockMultipleFileComponent {
  onChange(cb: (value: File[]) => void): MockMultipleFileComponent;
}

interface MockProgressBarComponent {
  setValue(value: number): MockProgressBarComponent;
}

interface MockSettingInstance {
  addButton(cb: (btn: MockButtonComponent) => void): MockSettingInstance;
  addCheckbox(cb: (comp: unknown) => void): MockSettingInstance;
  addCodeHighlighter(cb: (comp: MockCodeHighlighterComponent) => void): MockSettingInstance;
  addColorPicker(cb: (comp: unknown) => void): MockSettingInstance;
  addDate(cb: (comp: unknown) => void): MockSettingInstance;
  addDateTime(cb: (comp: unknown) => void): MockSettingInstance;
  addDropdown(cb: (comp: MockDropdownComponent) => void): MockSettingInstance;
  addEmail(cb: (comp: unknown) => void): MockSettingInstance;
  addExtraButton(cb: (comp: MockExtraButtonComponent) => void): MockSettingInstance;
  addFile(cb: (comp: MockFileComponent) => void): MockSettingInstance;
  addMomentFormat(cb: (comp: unknown) => void): MockSettingInstance;
  addMonth(cb: (comp: unknown) => void): MockSettingInstance;
  addMultipleDropdown(cb: (comp: MockDropdownComponent) => void): MockSettingInstance;
  addMultipleEmail(cb: (comp: unknown) => void): MockSettingInstance;
  addMultipleFile(cb: (comp: MockMultipleFileComponent) => void): MockSettingInstance;
  addMultipleText(cb: (comp: unknown) => void): MockSettingInstance;
  addNumber(cb: (comp: unknown) => void): MockSettingInstance;
  addProgressBar(cb: (comp: MockProgressBarComponent) => void): MockSettingInstance;
  addSearch(cb: (comp: unknown) => void): MockSettingInstance;
  addSlider(cb: (comp: unknown) => void): MockSettingInstance;
  addText(cb: (comp: MockTextComponent) => void): MockSettingInstance;
  addTextArea(cb: (comp: unknown) => void): MockSettingInstance;
  addTime(cb: (comp: unknown) => void): MockSettingInstance;
  addToggle(cb: (comp: unknown) => void): MockSettingInstance;
  addTriStateCheckbox(cb: (comp: unknown) => void): MockSettingInstance;
  addTypedDropdown(cb: (comp: MockMapDropdownComponent) => void): MockSettingInstance;
  addTypedMultipleDropdown(cb: (comp: MockMapDropdownComponent) => void): MockSettingInstance;
  addUrl(cb: (comp: unknown) => void): MockSettingInstance;
  addWeek(cb: (comp: unknown) => void): MockSettingInstance;
  setDesc(desc: string): MockSettingInstance;
  setName(name: string): MockSettingInstance;
}

interface MockTextComponent {
  setPlaceholder(text: string): MockTextComponent;
}

const settingInstances: MockSettingInstance[] = [];
const boundKeys: string[] = [];

const hoisted = vi.hoisted(() => {
  class PluginSettingsTabBaseMock {
    public containerEl = activeDocument.createElement('div');
    public pluginSettingsComponent = {
      settings: {
        progressBarSetting: 50
      }
    };

    public bind(component: unknown, key: string, options?: MockBindOptions): unknown {
      boundKeys.push(key);
      if (options) {
        options.onChanged?.(undefined, undefined);
        options.componentToPluginSettingsValueConverter?.('test (converted)');
        options.pluginSettingsToComponentValueConverter?.('test');
      }

      return component;
    }

    public display(): void {
      /* Base no-op */
    }
  }

  const mockNotice = vi.fn();

  return { mockNotice, PluginSettingsTabBaseMock };
});

vi.mock('obsidian-dev-utils/obsidian/plugin/plugin-settings-tab', () => ({
  PluginSettingsTabBase: hoisted.PluginSettingsTabBaseMock
}));

vi.mock('obsidian', () => ({
  Notice: hoisted.mockNotice
}));

vi.mock('obsidian-dev-utils/obsidian/setting-ex', () => {
  function makeComponent(changeValue: unknown): Record<string, unknown> {
    const comp: Record<string, unknown> = {};
    comp['addOptions'] = vi.fn().mockReturnValue(comp);
    comp['onClick'] = vi.fn().mockImplementation((cb: () => void) => {
      cb();
      return comp;
    });
    comp['onChange'] = vi.fn().mockImplementation((cb: (v: unknown) => void) => {
      cb(changeValue);
      return comp;
    });
    comp['setButtonText'] = vi.fn().mockReturnValue(comp);
    comp['setLanguage'] = vi.fn().mockReturnValue(comp);
    comp['setMin'] = vi.fn().mockReturnValue(comp);
    comp['setPlaceholder'] = vi.fn().mockReturnValue(comp);
    comp['setValue'] = vi.fn().mockReturnValue(comp);
    return comp;
  }

  function makeSetting(el: HTMLElement): MockSettingInstance {
    el.appendChild(activeDocument.createElement('div'));

    function makeAdder(changeValue?: unknown): (cb: (comp: unknown) => void) => MockSettingInstance {
      return function adder(this: MockSettingInstance, cb: (comp: unknown) => void) {
        cb(makeComponent(changeValue));
        return this;
      };
    }

    const instance: MockSettingInstance = {
      addButton: makeAdder() as MockSettingInstance['addButton'],
      addCheckbox: makeAdder(),
      addCodeHighlighter: makeAdder() as MockSettingInstance['addCodeHighlighter'],
      addColorPicker: makeAdder(),
      addDate: makeAdder(),
      addDateTime: makeAdder(),
      addDropdown: makeAdder() as MockSettingInstance['addDropdown'],
      addEmail: makeAdder(),
      addExtraButton: makeAdder() as MockSettingInstance['addExtraButton'],
      addFile: makeAdder(null) as MockSettingInstance['addFile'],
      addMomentFormat: makeAdder(),
      addMonth: makeAdder(),
      addMultipleDropdown: makeAdder() as MockSettingInstance['addMultipleDropdown'],
      addMultipleEmail: makeAdder(),
      addMultipleFile: makeAdder([{ name: 'test.md' }]) as MockSettingInstance['addMultipleFile'],
      addMultipleText: makeAdder(),
      addNumber: makeAdder(),
      addProgressBar: makeAdder() as MockSettingInstance['addProgressBar'],
      addSearch: makeAdder(),
      addSlider: makeAdder(),
      addText: makeAdder() as MockSettingInstance['addText'],
      addTextArea: makeAdder(),
      addTime: makeAdder(),
      addToggle: makeAdder(),
      addTriStateCheckbox: makeAdder(),
      addTypedDropdown: makeAdder() as MockSettingInstance['addTypedDropdown'],
      addTypedMultipleDropdown: makeAdder() as MockSettingInstance['addTypedMultipleDropdown'],
      addUrl: makeAdder(),
      addWeek: makeAdder(),
      setDesc: vi.fn().mockReturnThis(),
      setName: vi.fn().mockReturnThis()
    };

    for (const key of Object.keys(instance) as (keyof MockSettingInstance)[]) {
      const method = instance[key];
      if (typeof method === 'function') {
        const original = method;
        // Bind each adder to the instance so `this` works correctly.
        const bound = (original as (...args: unknown[]) => unknown).bind(instance);

        (instance[key] as unknown) = bound;
      }
    }

    settingInstances.push(instance);
    return instance;
  }

  return {
    SettingEx: function SettingEx(this: MockSettingInstance, el: HTMLElement): void {
      Object.assign(this, makeSetting(el));
    }
  };
});

// eslint-disable-next-line import-x/first, import-x/imports-first -- vi.mock must precede imports.
import { PluginSettingsTab } from './plugin-settings-tab.ts';

describe('PluginSettingsTab', () => {
  function createTab(): PluginSettingsTab {
    return new PluginSettingsTab({
      plugin: castTo<Plugin>({}),
      pluginSettingsComponent: castTo<PluginSettingsComponentBase<PluginSettings>>({})
    });
  }

  function callDisplay(tab: PluginSettingsTab): void {
    settingInstances.length = 0;
    boundKeys.length = 0;
    hoisted.mockNotice.mockClear();
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Testing display() which is deprecated but still used by PluginSettingsTabBase.
    tab.display();
  }

  it('should create an instance', () => {
    const tab = createTab();
    expect(tab).toBeInstanceOf(PluginSettingsTab);
  });

  it('should call super.display() on display()', () => {
    const tab = createTab();
    const spy = vi.spyOn(hoisted.PluginSettingsTabBaseMock.prototype, 'display');
    callDisplay(tab);
    expect(spy).toHaveBeenCalled();
  });

  it('should render setting elements in containerEl', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(tab.containerEl.children.length).toBeGreaterThan(0);
  });

  it('should create 30 setting instances', () => {
    const tab = createTab();
    callDisplay(tab);
    const EXPECTED_SETTING_COUNT = 30;
    expect(settingInstances.length).toBe(EXPECTED_SETTING_COUNT);
  });

  it('should bind checkboxSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('checkboxSetting');
  });

  it('should bind codeHighlighterSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('codeHighlighterSetting');
  });

  it('should bind colorSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('colorSetting');
  });

  it('should bind dateSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('dateSetting');
  });

  it('should bind dateTimeSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('dateTimeSetting');
  });

  it('should bind dropdownSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('dropdownSetting');
  });

  it('should bind emailSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('emailSetting');
  });

  it('should bind momentFormatSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('momentFormatSetting');
  });

  it('should bind monthSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('monthSetting');
  });

  it('should bind multipleDropdownSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('multipleDropdownSetting');
  });

  it('should bind multipleEmailSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('multipleEmailSetting');
  });

  it('should bind multipleTextSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('multipleTextSetting');
  });

  it('should bind numberSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('numberSetting');
  });

  it('should bind searchSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('searchSetting');
  });

  it('should bind sliderSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('sliderSetting');
  });

  it('should bind textSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('textSetting');
  });

  it('should bind textAreaSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('textAreaSetting');
  });

  it('should bind timeSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('timeSetting');
  });

  it('should bind toggleSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('toggleSetting');
  });

  it('should bind triStateCheckboxSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('triStateCheckboxSetting');
  });

  it('should bind typedDropdownSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('typedDropdownSetting');
  });

  it('should bind typedMultipleDropdownSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('typedMultipleDropdownSetting');
  });

  it('should bind urlSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('urlSetting');
  });

  it('should bind weekSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(boundKeys).toContain('weekSetting');
  });

  it('should show Notice when button is clicked', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(hoisted.mockNotice).toHaveBeenCalledWith('Button clicked');
  });

  it('should show Notice when extra button is clicked', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(hoisted.mockNotice).toHaveBeenCalledWith('Extra button clicked');
  });

  it('should show Notice when file is selected with null', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(hoisted.mockNotice).toHaveBeenCalledWith('File selected: (None)');
  });

  it('should show Notice when multiple files are selected', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(hoisted.mockNotice).toHaveBeenCalledWith('Files selected: test.md');
  });
});
