import type { Duration } from 'moment';
import type { IsoMonth } from 'obsidian-dev-utils/obsidian/Components/MonthComponent';
import type { IsoWeek } from 'obsidian-dev-utils/obsidian/Components/WeekComponent';

import { duration } from 'moment';
import { PluginSettingsBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginSettingsBase';

export class SamplePluginExtendedPluginSettings extends PluginSettingsBase {
  /* eslint-disable no-magic-numbers */
  public colorSetting = '#123456';
  public dateSetting = new Date();
  public dateTimeSetting = new Date();
  public dropdownSetting = 'Value2';
  public emailSetting = 'defaultEmail@example.com';
  public momentFormatSetting = 'YYYY-MM-DD';
  public monthSetting: IsoMonth = {
    month: 2,
    year: 2025
  };

  public multipleDropdownSetting: string[] = ['Value2', 'Value5'];
  public multipleEmailSetting: string[] = ['defaultEmail@example.com', 'defaultEmail2@example.com'];
  public multipleTextSetting: string[] = ['defaultText1', 'defaultText2', 'defaultText3'];
  public numberSetting = 123;
  public progressBarSetting = 50;
  public searchSetting = 'defaultSearch';
  public sliderSetting = 50;
  public textAreaSetting = 'defaultTextArea';
  public textSetting = 'defaultText';
  public timeSetting: Duration = duration({ hours: 12, minutes: 34 });
  public toggleSetting = true;
  public urlSetting = 'https://example.com';

  public weekSetting: IsoWeek = {
    weekNumber: 6,
    year: 2025
  };

  /* eslint-enable no-magic-numbers */

  public constructor(data: unknown) {
    super();
    this.init(data);
  }
}
