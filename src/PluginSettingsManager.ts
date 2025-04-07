import type { MaybeReturn } from 'obsidian-dev-utils/Type';

import { PluginSettingsManagerBase } from 'obsidian-dev-utils/obsidian/Plugin/PluginSettingsManagerBase';

import type { PluginTypes } from './PluginTypes.ts';

import { PluginSettings } from './PluginSettings.ts';

export class PluginSettingsManager extends PluginSettingsManagerBase<PluginTypes> {
  protected override addValidators(): void {
    this.addValidator('textSetting', (value): MaybeReturn<string> => {
      if (value === 'foo') {
        return 'Foo is not allowed';
      }
    });
  }

  protected override createDefaultSettings(): PluginSettings {
    return new PluginSettings();
  }
}
