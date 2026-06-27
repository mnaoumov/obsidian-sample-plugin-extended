import type {
  App as AppOriginal,
  Plugin
} from 'obsidian';
import type { PluginNoticeComponent } from 'obsidian-dev-utils/obsidian/components/plugin-notice-component';
import type { PluginSettingsComponentBase } from 'obsidian-dev-utils/obsidian/components/plugin-settings-component';
import type { MockInstance } from 'vitest';

import {
  ButtonComponent,
  ExtraButtonComponent
} from 'obsidian';
import { castTo } from 'obsidian-dev-utils/object-utils';
import { PluginSettingsTabBase } from 'obsidian-dev-utils/obsidian/plugin/plugin-settings-tab';
import { FileComponent } from 'obsidian-dev-utils/obsidian/setting-components/file-component';
import { MultipleFileComponent } from 'obsidian-dev-utils/obsidian/setting-components/multiple-file-component';
import { SettingEx } from 'obsidian-dev-utils/obsidian/setting-ex';
import { strictProxy } from 'obsidian-dev-utils/strict-proxy';
import { App } from 'obsidian-test-mocks/obsidian';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import type { PluginSettings } from './plugin-settings.ts';

import { PluginSettingsTab } from './plugin-settings-tab.ts';

interface BindOptionsExt {
  componentToPluginSettingsValueConverter?(uiValue: string): unknown;
  onChanged?(newValue: unknown, oldValue: unknown): void;
  pluginSettingsToComponentValueConverter?(pluginSettingsValue: string): unknown;
}

describe('PluginSettingsTab', () => {
  let app: AppOriginal;
  let bindSpy: MockInstance<PluginSettingsTab['bind']>;
  let setNameSpy: MockInstance;
  let buttonOnClickSpy: MockInstance;
  let extraButtonOnClickSpy: MockInstance;
  let fileOnChangeSpy: MockInstance;
  let multipleFileOnChangeSpy: MockInstance;
  let showNoticeMock: PluginNoticeComponent['showNotice'];

  beforeEach(() => {
    vi.clearAllMocks();
    app = App.createConfigured__().asOriginalType__();

    // `PluginSettingsTabBase.bind` duck-types components via a strict-proxy property probe
    // That the real test-mocks components throw on, so neutralize only `bind`'s return value
    // While keeping the real base + real `SettingEx` + real rendered components. The stub also
    // Drives the source-provided option callbacks (converters / onChanged) the way the real
    // `bind` would, so those closures stay exercised.
    bindSpy = vi.spyOn(PluginSettingsTabBase.prototype, 'bind').mockImplementation((params) => {
      const paramsExt = castTo<BindOptionsExt>(params);
      paramsExt.onChanged?.(undefined, undefined);
      paramsExt.componentToPluginSettingsValueConverter?.('test (converted)');
      paramsExt.pluginSettingsToComponentValueConverter?.('test');
      return params.valueComponent;
    });

    setNameSpy = vi.spyOn(SettingEx.prototype, 'setName');
    buttonOnClickSpy = vi.spyOn(ButtonComponent.prototype, 'onClick');
    extraButtonOnClickSpy = vi.spyOn(ExtraButtonComponent.prototype, 'onClick');
    fileOnChangeSpy = vi.spyOn(FileComponent.prototype, 'onChange');
    multipleFileOnChangeSpy = vi.spyOn(MultipleFileComponent.prototype, 'onChange');
  });

  function createTab(): PluginSettingsTab {
    const plugin = strictProxy<Plugin>({
      app,
      manifest: { id: 'test-plugin' }
    });

    const pluginSettingsComponent = strictProxy<PluginSettingsComponentBase<PluginSettings>>({
      defaultSettings: castTo<PluginSettings>({}),
      on: castTo<PluginSettingsComponentBase<PluginSettings>['on']>(vi.fn(() => ({
        asyncEventSource: { offref: vi.fn() }
      }))),
      settings: castTo<PluginSettings>({ progressBarSetting: 50 }),
      settingsState: castTo<PluginSettingsComponentBase<PluginSettings>['settingsState']>({
        effectiveValues: {},
        inputValues: {},
        validationMessages: {}
      })
    });

    showNoticeMock = vi.fn<PluginNoticeComponent['showNotice']>();

    return new PluginSettingsTab({
      plugin,
      pluginNoticeComponent: strictProxy<PluginNoticeComponent>({ showNotice: showNoticeMock }),
      pluginSettingsComponent
    });
  }

  function callDisplay(tab: PluginSettingsTab): void {
    tab.displayLegacy();
  }

  function getBoundKeys(): unknown[] {
    return bindSpy.mock.calls.map((call): unknown => call[0].propertyName);
  }

  it('should create an instance', () => {
    const tab = createTab();
    expect(tab).toBeInstanceOf(PluginSettingsTab);
  });

  it('should call super.displayLegacy() on displayLegacy()', () => {
    const tab = createTab();
    const spy = vi.spyOn(PluginSettingsTabBase.prototype, 'displayLegacy');
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
    expect(setNameSpy).toHaveBeenCalledTimes(EXPECTED_SETTING_COUNT);
  });

  it('should bind checkboxSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('checkboxSetting');
  });

  it('should bind codeHighlighterSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('codeHighlighterSetting');
  });

  it('should bind colorSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('colorSetting');
  });

  it('should bind dateSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('dateSetting');
  });

  it('should bind dateTimeSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('dateTimeSetting');
  });

  it('should bind dropdownSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('dropdownSetting');
  });

  it('should bind emailSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('emailSetting');
  });

  it('should bind momentFormatSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('momentFormatSetting');
  });

  it('should bind monthSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('monthSetting');
  });

  it('should bind multipleDropdownSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('multipleDropdownSetting');
  });

  it('should bind multipleEmailSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('multipleEmailSetting');
  });

  it('should bind multipleTextSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('multipleTextSetting');
  });

  it('should bind numberSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('numberSetting');
  });

  it('should bind searchSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('searchSetting');
  });

  it('should bind sliderSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('sliderSetting');
  });

  it('should bind textSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('textSetting');
  });

  it('should bind textAreaSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('textAreaSetting');
  });

  it('should bind timeSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('timeSetting');
  });

  it('should bind toggleSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('toggleSetting');
  });

  it('should bind triStateCheckboxSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('triStateCheckboxSetting');
  });

  it('should bind typedDropdownSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('typedDropdownSetting');
  });

  it('should bind typedMultipleDropdownSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('typedMultipleDropdownSetting');
  });

  it('should bind urlSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('urlSetting');
  });

  it('should bind weekSetting', () => {
    const tab = createTab();
    callDisplay(tab);
    expect(getBoundKeys()).toContain('weekSetting');
  });

  it('should show Notice when button is clicked', () => {
    const tab = createTab();
    callDisplay(tab);
    const onClickHandler = castTo<() => void>(buttonOnClickSpy.mock.calls[0]?.[0]);
    onClickHandler();
    expect(showNoticeMock).toHaveBeenCalledWith('Button clicked');
  });

  it('should show Notice when extra button is clicked', () => {
    const tab = createTab();
    callDisplay(tab);
    const onClickHandler = castTo<() => void>(extraButtonOnClickSpy.mock.calls[0]?.[0]);
    onClickHandler();
    expect(showNoticeMock).toHaveBeenCalledWith('Extra button clicked');
  });

  it('should show Notice when file is selected with null', () => {
    const tab = createTab();
    callDisplay(tab);
    const onChangeHandler = castTo<(value: File | null) => void>(fileOnChangeSpy.mock.calls[0]?.[0]);
    onChangeHandler(null);
    expect(showNoticeMock).toHaveBeenCalledWith('File selected: (None)');
  });

  it('should show Notice when multiple files are selected', () => {
    const tab = createTab();
    callDisplay(tab);
    const onChangeHandler = castTo<(value: File[]) => void>(multipleFileOnChangeSpy.mock.calls[0]?.[0]);
    onChangeHandler(castTo<File[]>([{ name: 'test.md' }]));
    expect(showNoticeMock).toHaveBeenCalledWith('Files selected: test.md');
  });
});
