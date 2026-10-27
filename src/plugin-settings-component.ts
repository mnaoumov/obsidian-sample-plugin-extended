import type { PluginNoticeComponent } from '@mnaoumov/obsidian-lib/components/plugin-notice-component';
import type {
  PluginSettingsComponentBaseOnSaveSettingsParams,
  ReadonlyPluginSettingsState
} from '@mnaoumov/obsidian-lib/components/plugin-settings-component';
import type { DataHandler } from '@mnaoumov/obsidian-lib/data-handler';
import type { PluginEventSource } from '@mnaoumov/obsidian-lib/plugin/plugin-event-source';
import type { MaybeReturn } from '@mnaoumov/typescript-lib/type';
import type { GenericObject } from '@mnaoumov/typescript-lib/type-guards';

import { PluginSettingsComponentBase } from '@mnaoumov/obsidian-lib/components/plugin-settings-component';

import {
  PluginSettings,
  TypedItem
} from './plugin-settings.ts';

interface PluginSettingsComponentConstructorParams {
  readonly dataHandler: DataHandler;
  readonly pluginEventSource: PluginEventSource;
  readonly pluginNoticeComponent: PluginNoticeComponent;
}

type PluginSettingsComponentOnSaveSettingsParams = PluginSettingsComponentBaseOnSaveSettingsParams<PluginSettings>;

interface SerializedSettings {
  // eslint-disable-next-line typescript-dev-toolkit/readonly-interface-members -- Saving converts the in-place record to serialized setting values.
  typedDropdownSetting: string;
  // eslint-disable-next-line typescript-dev-toolkit/readonly-interface-members -- Saving converts the in-place record to serialized setting values.
  typedMultipleDropdownSetting: string[];
}

export class PluginSettingsComponent extends PluginSettingsComponentBase<PluginSettings> {
  private readonly pluginNoticeComponent: PluginNoticeComponent;

  public constructor(params: PluginSettingsComponentConstructorParams) {
    super({
      ...params,
      pluginSettingsClass: PluginSettings
    });
    this.pluginNoticeComponent = params.pluginNoticeComponent;
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
      this.pluginNoticeComponent.showNotice('Sample text setting is bar');
    }
  }

  protected override async onSaveSettings(params: PluginSettingsComponentOnSaveSettingsParams): Promise<void> {
    await super.onSaveSettings(params);
    const { newState, oldState } = params;
    if (newState.effectiveValues.textSetting === 'baz' && oldState.effectiveValues.textSetting === 'bar') {
      this.pluginNoticeComponent.showNotice('Sample text setting is changed from bar to baz');
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
