import type { PluginNoticeComponent } from 'obsidian-dev-utils/obsidian/components/plugin-notice-component';
import type { PluginSettingsTabBaseConstructorParams } from 'obsidian-dev-utils/obsidian/plugin/plugin-settings-tab';

import { PluginSettingsTabBase } from 'obsidian-dev-utils/obsidian/plugin/plugin-settings-tab';
import { SettingEx } from 'obsidian-dev-utils/obsidian/setting-ex';

import type { PluginSettings } from './plugin-settings.ts';

import { TypedItem } from './plugin-settings.ts';

interface PluginSettingsTabConstructorParams extends PluginSettingsTabBaseConstructorParams<PluginSettings> {
  readonly pluginNoticeComponent: PluginNoticeComponent;
}

export class PluginSettingsTab extends PluginSettingsTabBase<PluginSettings> {
  private readonly pluginNoticeComponent: PluginNoticeComponent;

  public constructor(params: PluginSettingsTabConstructorParams) {
    super(params);
    this.pluginNoticeComponent = params.pluginNoticeComponent;
  }

  public override displayLegacy(): void {
    super.displayLegacy();
    this.containerEl.empty();

    new SettingEx(this.containerEl)
      .setName('Button setting name')
      .setDesc('Button setting description.')
      .addButton((button) => {
        button.setButtonText('Button text')
          .onClick(() => {
            this.pluginNoticeComponent.showNotice('Button clicked');
          });
      });

    new SettingEx(this.containerEl)
      .setName('Checkbox setting name')
      .setDesc('Checkbox setting description.')
      .addCheckbox((checkbox) => {
        this.bind({ propertyName: 'checkboxSetting', valueComponent: checkbox });
      });

    new SettingEx(this.containerEl)
      .setName('Code highlighter setting name')
      .setDesc('Code highlighter setting description.')
      .addCodeHighlighter((codeHighlighter) => {
        codeHighlighter.setLanguage('javascript');
        this.bind({ propertyName: 'codeHighlighterSetting', valueComponent: codeHighlighter });
      });

    new SettingEx(this.containerEl)
      .setName('Color setting name')
      .setDesc('Color setting description.')
      .addColorPicker((color) => {
        this.bind({ propertyName: 'colorSetting', valueComponent: color });
      });

    new SettingEx(this.containerEl)
      .setName('Date setting name')
      .setDesc('Date setting description.')
      .addDate((date) => {
        this.bind({ propertyName: 'dateSetting', valueComponent: date });
      });

    new SettingEx(this.containerEl)
      .setName('Date time setting name')
      .setDesc('Date time setting description.')
      .addDateTime((dateTime) => {
        this.bind({ propertyName: 'dateTimeSetting', valueComponent: dateTime });
      });

    new SettingEx(this.containerEl)
      .setName('Dropdown setting name')
      .setDesc('Dropdown setting description.')
      .addDropdown((dropdown) => {
        dropdown.addOptions({
          Value1: 'Display 1',
          Value2: 'Display 2',
          Value3: 'Display 3'
        });
        this.bind({ propertyName: 'dropdownSetting', valueComponent: dropdown });
      });

    new SettingEx(this.containerEl)
      .setName('Email setting name')
      .setDesc('Email setting description.')
      .addEmail((email) => {
        this.bind({ propertyName: 'emailSetting', valueComponent: email });
      });

    new SettingEx(this.containerEl)
      .setName('Extra button setting name')
      .setDesc('Extra button setting description.')
      .addExtraButton((extraButton) => {
        extraButton
          .onClick(() => {
            this.pluginNoticeComponent.showNotice('Extra button clicked');
          });
      });

    new SettingEx(this.containerEl)
      .setName('File setting name')
      .setDesc('File setting description.')
      .addFile((file) => {
        file.onChange((value) => {
          this.pluginNoticeComponent.showNotice(`File selected: ${value?.name ?? '(None)'}`);
        });
      });

    new SettingEx(this.containerEl)
      .setName('Moment format setting name')
      .setDesc('Moment format setting description.')
      .addMomentFormat((momentFormat) => {
        this.bind({ propertyName: 'momentFormatSetting', valueComponent: momentFormat });
      });

    new SettingEx(this.containerEl)
      .setName('Month setting name')
      .setDesc('Month setting description.')
      .addMonth((month) => {
        this.bind({ propertyName: 'monthSetting', valueComponent: month });
      });

    new SettingEx(this.containerEl)
      .setName('Multiple dropdown setting name')
      .setDesc('Multiple dropdown setting description.')
      .addMultipleDropdown((multipleDropdown) => {
        multipleDropdown.addOptions({
          Value1: 'Display 1',
          Value2: 'Display 2',
          Value3: 'Display 3',
          Value4: 'Display 4',
          Value5: 'Display 5'
        });

        this.bind({ propertyName: 'multipleDropdownSetting', valueComponent: multipleDropdown });
      });

    new SettingEx(this.containerEl)
      .setName('Multiple email setting name')
      .setDesc('Multiple email setting description.')
      .addMultipleEmail((multipleEmail) => {
        this.bind({ propertyName: 'multipleEmailSetting', valueComponent: multipleEmail });
      });

    new SettingEx(this.containerEl)
      .setName('Multiple file setting name')
      .setDesc('Multiple file setting description.')
      .addMultipleFile((multipleFile) => {
        multipleFile.onChange((value) => {
          const fileNames = value.map((file) => file.name);
          this.pluginNoticeComponent.showNotice(`Files selected: ${fileNames.join(', ')}`);
        });
      });

    new SettingEx(this.containerEl)
      .setName('Multiple text setting name')
      .setDesc('Multiple text setting description.')
      .addMultipleText((multipleText) => {
        this.bind({ propertyName: 'multipleTextSetting', valueComponent: multipleText });
      });

    new SettingEx(this.containerEl)
      .setName('Number setting name')
      .setDesc('Number setting description.')
      .addNumber((number) => {
        this.bind({ propertyName: 'numberSetting', valueComponent: number });
      });

    new SettingEx(this.containerEl)
      .setName('Progress bar setting name')
      .setDesc('Progress bar setting description.')
      .addProgressBar((progressBar) => {
        progressBar.setValue(this.pluginSettingsComponent.settings.progressBarSetting);
      });

    new SettingEx(this.containerEl)
      .setName('Search setting name')
      .setDesc('Search setting description.')
      .addSearch((search) => {
        this.bind({ propertyName: 'searchSetting', valueComponent: search });
      });

    new SettingEx(this.containerEl)
      .setName('Slider setting name')
      .setDesc('Slider setting description.')
      .addSlider((slider) => {
        this.bind({ propertyName: 'sliderSetting', valueComponent: slider });
      });

    new SettingEx(this.containerEl)
      .setName('Text setting name')
      .setDesc('Text setting description.')
      .addText((text) => {
        this.bind({ propertyName: 'textSetting', valueComponent: text });
      });

    new SettingEx(this.containerEl)
      .setName('Text area setting name')
      .setDesc('Text area setting description.')
      .addTextArea((textArea) => {
        this.bind({ propertyName: 'textAreaSetting', valueComponent: textArea });
      });

    new SettingEx(this.containerEl)
      .setName('Time setting name')
      .setDesc('Time setting description.')
      .addTime((time) => {
        this.bind({ propertyName: 'timeSetting', valueComponent: time });
      });

    new SettingEx(this.containerEl)
      .setName('Toggle setting name')
      .setDesc('Toggle setting description.')
      .addToggle((toggle) => {
        this.bind({ propertyName: 'toggleSetting', valueComponent: toggle });
      });

    new SettingEx(this.containerEl)
      .setName('Tri-state checkbox setting name')
      .setDesc('Tri-state checkbox setting description.')
      .addTriStateCheckbox((triStateCheckbox) => {
        this.bind({ propertyName: 'triStateCheckboxSetting', valueComponent: triStateCheckbox });
      });

    new SettingEx(this.containerEl)
      .setName('Typed dropdown setting name')
      .setDesc('Typed dropdown setting description.')
      .addTypedDropdown((typedDropdown) => {
        const map = new Map<TypedItem, string>();
        map.set(TypedItem.Foo, 'Display Foo');
        map.set(TypedItem.Bar, 'Display Bar');
        map.set(TypedItem.Baz, 'Display Baz');
        typedDropdown.addOptions(map);
        this.bind({
          onChanged(newValue, oldValue) {
            console.warn('Typed Dropdown setting changed', { newValue, oldValue });
          },
          propertyName: 'typedDropdownSetting',
          valueComponent: typedDropdown
        });
      });

    new SettingEx(this.containerEl)
      .setName('Typed multiple dropdown setting name')
      .setDesc('Typed multiple dropdown setting description.')
      .addTypedMultipleDropdown((typedMultipleDropdown) => {
        const map = new Map<TypedItem, string>();
        map.set(TypedItem.Foo, 'Display Foo');
        map.set(TypedItem.Bar, 'Display Bar');
        map.set(TypedItem.Baz, 'Display Baz');
        typedMultipleDropdown.addOptions(map);
        this.bind({
          onChanged(newValue, oldValue) {
            console.warn('Typed Multiple Dropdown setting changed', { newValue, oldValue });
          },
          propertyName: 'typedMultipleDropdownSetting',
          valueComponent: typedMultipleDropdown
        });
      });

    new SettingEx(this.containerEl)
      .setName('URL setting name')
      .setDesc('URL setting description.')
      .addUrl((url) => {
        this.bind({ propertyName: 'urlSetting', valueComponent: url });
      });

    new SettingEx(this.containerEl)
      .setName('Week setting name')
      .setDesc('Week setting description.')
      .addWeek((week) => {
        this.bind({ propertyName: 'weekSetting', valueComponent: week });
      });

    new SettingEx(this.containerEl)
      .setName('Advanced text setting name')
      .setDesc('Advanced text setting description.')
      .addText((text) => {
        this.bind({
          componentToPluginSettingsValueConverter: (uiValue: string) => uiValue.replace(' (converted)', ''),
          onChanged: () => {
            this.pluginNoticeComponent.showNotice('Advanced text setting changed');
          },
          pluginSettingsToComponentValueConverter: (pluginSettingsValue: string) => `${pluginSettingsValue} (converted)`,
          propertyName: 'textSetting',
          valueComponent: text
        })
          .setPlaceholder('Enter a value');
      });
  }
}
