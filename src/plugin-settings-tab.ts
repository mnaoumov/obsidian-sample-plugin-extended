import type { SettingDefinitionItem } from 'obsidian';
import type { PluginNoticeComponent } from 'obsidian-dev-utils/obsidian/components/plugin-notice-component';
import type { PluginSettingsTabBaseConstructorParams } from 'obsidian-dev-utils/obsidian/plugin/plugin-settings-tab';

import { PluginSettingsTabBase } from 'obsidian-dev-utils/obsidian/plugin/plugin-settings-tab';

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

  protected override getSettingDefinitionItems(): SettingDefinitionItem[] {
    return [
      this.settingEx({
        desc: 'Button setting description.',
        name: 'Button setting name',
        render: (setting) => {
          setting.addButton((button) => {
            button.setButtonText('Button text')
              .onClick(() => {
                this.pluginNoticeComponent.showNotice('Button clicked');
              });
          });
        }
      }),
      this.settingEx({
        desc: 'Checkbox setting description.',
        name: 'Checkbox setting name',
        render: (setting) => {
          setting.addCheckbox((checkbox) => {
            this.bind({ propertyName: 'checkboxSetting', valueComponent: checkbox });
          });
        }
      }),
      this.settingEx({
        desc: 'Code highlighter setting description.',
        name: 'Code highlighter setting name',
        render: (setting) => {
          setting.addCodeHighlighter((codeHighlighter) => {
            codeHighlighter.setLanguage('javascript');
            this.bind({ propertyName: 'codeHighlighterSetting', valueComponent: codeHighlighter });
          });
        }
      }),
      this.settingEx({
        desc: 'Color setting description.',
        name: 'Color setting name',
        render: (setting) => {
          setting.addColorPicker((color) => {
            this.bind({ propertyName: 'colorSetting', valueComponent: color });
          });
        }
      }),
      this.settingEx({
        desc: 'Date setting description.',
        name: 'Date setting name',
        render: (setting) => {
          setting.addDate((date) => {
            this.bind({ propertyName: 'dateSetting', valueComponent: date });
          });
        }
      }),
      this.settingEx({
        desc: 'Date time setting description.',
        name: 'Date time setting name',
        render: (setting) => {
          setting.addDateTime((dateTime) => {
            this.bind({ propertyName: 'dateTimeSetting', valueComponent: dateTime });
          });
        }
      }),
      this.settingEx({
        desc: 'Dropdown setting description.',
        name: 'Dropdown setting name',
        render: (setting) => {
          setting.addDropdown((dropdown) => {
            dropdown.addOptions({
              Value1: 'Display 1',
              Value2: 'Display 2',
              Value3: 'Display 3'
            });
            this.bind({ propertyName: 'dropdownSetting', valueComponent: dropdown });
          });
        }
      }),
      this.settingEx({
        desc: 'Email setting description.',
        name: 'Email setting name',
        render: (setting) => {
          setting.addEmail((email) => {
            this.bind({ propertyName: 'emailSetting', valueComponent: email });
          });
        }
      }),
      this.settingEx({
        desc: 'Extra button setting description.',
        name: 'Extra button setting name',
        render: (setting) => {
          setting.addExtraButton((extraButton) => {
            extraButton
              .onClick(() => {
                this.pluginNoticeComponent.showNotice('Extra button clicked');
              });
          });
        }
      }),
      this.settingEx({
        desc: 'File setting description.',
        name: 'File setting name',
        render: (setting) => {
          setting.addFile((file) => {
            file.onChange((value) => {
              this.pluginNoticeComponent.showNotice(`File selected: ${value?.name ?? '(None)'}`);
            });
          });
        }
      }),
      this.settingEx({
        desc: 'Moment format setting description.',
        name: 'Moment format setting name',
        render: (setting) => {
          setting.addMomentFormat((momentFormat) => {
            this.bind({ propertyName: 'momentFormatSetting', valueComponent: momentFormat });
          });
        }
      }),
      this.settingEx({
        desc: 'Month setting description.',
        name: 'Month setting name',
        render: (setting) => {
          setting.addMonth((month) => {
            this.bind({ propertyName: 'monthSetting', valueComponent: month });
          });
        }
      }),
      this.settingEx({
        desc: 'Multiple dropdown setting description.',
        name: 'Multiple dropdown setting name',
        render: (setting) => {
          setting.addMultipleDropdown((multipleDropdown) => {
            multipleDropdown.addOptions({
              Value1: 'Display 1',
              Value2: 'Display 2',
              Value3: 'Display 3',
              Value4: 'Display 4',
              Value5: 'Display 5'
            });

            this.bind({ propertyName: 'multipleDropdownSetting', valueComponent: multipleDropdown });
          });
        }
      }),
      this.settingEx({
        desc: 'Multiple email setting description.',
        name: 'Multiple email setting name',
        render: (setting) => {
          setting.addMultipleEmail((multipleEmail) => {
            this.bind({ propertyName: 'multipleEmailSetting', valueComponent: multipleEmail });
          });
        }
      }),
      this.settingEx({
        desc: 'Multiple file setting description.',
        name: 'Multiple file setting name',
        render: (setting) => {
          setting.addMultipleFile((multipleFile) => {
            multipleFile.onChange((value) => {
              const fileNames = value.map((file) => file.name);
              this.pluginNoticeComponent.showNotice(`Files selected: ${fileNames.join(', ')}`);
            });
          });
        }
      }),
      this.settingEx({
        desc: 'Multiple text setting description.',
        name: 'Multiple text setting name',
        render: (setting) => {
          setting.addMultipleText((multipleText) => {
            this.bind({ propertyName: 'multipleTextSetting', valueComponent: multipleText });
          });
        }
      }),
      this.settingEx({
        desc: 'Number setting description.',
        name: 'Number setting name',
        render: (setting) => {
          setting.addNumber((number) => {
            this.bind({ propertyName: 'numberSetting', valueComponent: number });
          });
        }
      }),
      this.settingEx({
        desc: 'Progress bar setting description.',
        name: 'Progress bar setting name',
        render: (setting) => {
          setting.addProgressBar((progressBar) => {
            progressBar.setValue(this.pluginSettingsComponent.settings.progressBarSetting);
          });
        }
      }),
      this.settingEx({
        desc: 'Search setting description.',
        name: 'Search setting name',
        render: (setting) => {
          setting.addSearch((search) => {
            this.bind({ propertyName: 'searchSetting', valueComponent: search });
          });
        }
      }),
      this.settingEx({
        desc: 'Slider setting description.',
        name: 'Slider setting name',
        render: (setting) => {
          setting.addSlider((slider) => {
            this.bind({ propertyName: 'sliderSetting', valueComponent: slider });
          });
        }
      }),
      this.settingEx({
        desc: 'Text setting description.',
        name: 'Text setting name',
        render: (setting) => {
          setting.addText((text) => {
            this.bind({ propertyName: 'textSetting', valueComponent: text });
          });
        }
      }),
      this.settingEx({
        desc: 'Text area setting description.',
        name: 'Text area setting name',
        render: (setting) => {
          setting.addTextArea((textArea) => {
            this.bind({ propertyName: 'textAreaSetting', valueComponent: textArea });
          });
        }
      }),
      this.settingEx({
        desc: 'Time setting description.',
        name: 'Time setting name',
        render: (setting) => {
          setting.addTime((time) => {
            this.bind({ propertyName: 'timeSetting', valueComponent: time });
          });
        }
      }),
      this.settingEx({
        desc: 'Toggle setting description.',
        name: 'Toggle setting name',
        render: (setting) => {
          setting.addToggle((toggle) => {
            this.bind({ propertyName: 'toggleSetting', valueComponent: toggle });
          });
        }
      }),
      this.settingEx({
        desc: 'Tri-state checkbox setting description.',
        name: 'Tri-state checkbox setting name',
        render: (setting) => {
          setting.addTriStateCheckbox((triStateCheckbox) => {
            this.bind({ propertyName: 'triStateCheckboxSetting', valueComponent: triStateCheckbox });
          });
        }
      }),
      this.settingEx({
        desc: 'Typed dropdown setting description.',
        name: 'Typed dropdown setting name',
        render: (setting) => {
          setting.addTypedDropdown((typedDropdown) => {
            const map = new Map<TypedItem, string>([[TypedItem.Bar, 'Display Bar'], [TypedItem.Baz, 'Display Baz'], [TypedItem.Foo, 'Display Foo']]);
            typedDropdown.addOptions(map);
            this.bind({
              onChanged(newValue, oldValue) {
                console.warn('Typed Dropdown setting changed', { newValue, oldValue });
              },
              propertyName: 'typedDropdownSetting',
              valueComponent: typedDropdown
            });
          });
        }
      }),
      this.settingEx({
        desc: 'Typed multiple dropdown setting description.',
        name: 'Typed multiple dropdown setting name',
        render: (setting) => {
          setting.addTypedMultipleDropdown((typedMultipleDropdown) => {
            const map = new Map<TypedItem, string>([[TypedItem.Bar, 'Display Bar'], [TypedItem.Baz, 'Display Baz'], [TypedItem.Foo, 'Display Foo']]);
            typedMultipleDropdown.addOptions(map);
            this.bind({
              onChanged(newValue, oldValue) {
                console.warn('Typed Multiple Dropdown setting changed', { newValue, oldValue });
              },
              propertyName: 'typedMultipleDropdownSetting',
              valueComponent: typedMultipleDropdown
            });
          });
        }
      }),
      this.settingEx({
        desc: 'URL setting description.',
        name: 'URL setting name',
        render: (setting) => {
          setting.addUrl((url) => {
            this.bind({ propertyName: 'urlSetting', valueComponent: url });
          });
        }
      }),
      this.settingEx({
        desc: 'Week setting description.',
        name: 'Week setting name',
        render: (setting) => {
          setting.addWeek((week) => {
            this.bind({ propertyName: 'weekSetting', valueComponent: week });
          });
        }
      }),
      this.settingEx({
        desc: 'Advanced text setting description.',
        name: 'Advanced text setting name',
        render: (setting) => {
          setting.addText((text) => {
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
      })
    ];
  }
}
