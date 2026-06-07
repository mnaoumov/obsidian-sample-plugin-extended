import type { ReadonlyPluginSettingsState } from 'obsidian-dev-utils/obsidian/components/plugin-settings-component';
import type { DataHandler } from 'obsidian-dev-utils/obsidian/data-handler';
import type { PluginEventSource } from 'obsidian-dev-utils/obsidian/plugin/plugin-event-source';
import type { MaybeReturn } from 'obsidian-dev-utils/type';
import type { GenericObject } from 'obsidian-dev-utils/type-guards';

import { Notice } from 'obsidian';
import { PluginSettingsComponentBase } from 'obsidian-dev-utils/obsidian/components/plugin-settings-component';

import {
  PluginSettings,
  TypedItem
} from './plugin-settings.ts';

interface PluginSettingsComponentConstructorParams {
  readonly dataHandler: DataHandler;
  readonly pluginEventSource: PluginEventSource;
}

interface SerializedSettings {
  typedDropdownSetting: string;
  typedMultipleDropdownSetting: string[];
}

export class PluginSettingsComponent extends PluginSettingsComponentBase<PluginSettings> {
  public constructor(params: PluginSettingsComponentConstructorParams) {
    super({
      ...params,
      pluginSettingsClass: PluginSettings
    });
  }

  protected override async onLoadRecord(record: GenericObject): Promise<void> {
    await super.onLoadRecord(record);
    const serializedSettings = record as Partial<SerializedSettings>;
    const pluginSettings = record as Partial<PluginSettings>;

    if (serializedSettings.typedDropdownSetting) {
      pluginSettings.typedDropdownSetting = TypedItem.deserialize(serializedSettings.typedDropdownSetting);
    }

    if (serializedSettings.typedMultipleDropdownSetting) {
      pluginSettings.typedMultipleDropdownSetting = serializedSettings.typedMultipleDropdownSetting.map((name) => TypedItem.deserialize(name));
    }
  }

  protected override async onLoadSettings(
    loadedState: ReadonlyPluginSettingsState<PluginSettings>,
    isInitialLoad: boolean
  ): Promise<void> {
    await super.onLoadSettings(loadedState, isInitialLoad);
    if (loadedState.effectiveValues.textSetting === 'bar') {
      new Notice('Sample text setting is bar');
    }
  }

  protected override async onSaveSettings(
    newState: ReadonlyPluginSettingsState<PluginSettings>,
    oldState: ReadonlyPluginSettingsState<PluginSettings>,
    context: unknown
  ): Promise<void> {
    await super.onSaveSettings(newState, oldState, context);
    if (newState.effectiveValues.textSetting === 'baz' && oldState.effectiveValues.textSetting === 'bar') {
      new Notice('Sample text setting is changed from bar to baz');
    }
  }

  protected override async onSavingRecord(record: GenericObject): Promise<void> {
    await super.onSavingRecord(record);
    const serializedSettings = record as Partial<SerializedSettings>;
    const pluginSettings = record as Partial<PluginSettings>;

    if (pluginSettings.typedDropdownSetting) {
      serializedSettings.typedDropdownSetting = pluginSettings.typedDropdownSetting.name;
    }

    if (pluginSettings.typedMultipleDropdownSetting) {
      serializedSettings.typedMultipleDropdownSetting = pluginSettings.typedMultipleDropdownSetting.map((item) => item.name);
    }
  }

  protected override registerValidators(): void {
    super.registerValidators();
    this.registerValidator('textSetting', (value): MaybeReturn<string> => {
      if (value === 'foo') {
        return 'Foo is not allowed';
      }
    });
  }
}
