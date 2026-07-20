import type { App } from 'obsidian';

import { Notice } from 'obsidian';
import {
  enableCommunityPlugin,
  installCommunityPlugin
} from 'obsidian-dev-utils/obsidian/community-plugins';

// Sample Plugin Extended demonstrates its features through commands, a ribbon icon, a status
// bar item, modals, editor extensions, and side views - all driven from the Obsidian UI, so
// there is nothing for a code-button to drive; the demo notes walk through them manually. The
// only helper the vault needs is the shared CodeScript Toolkit installer used by the
// prerequisite note's button.
export async function installAndEnable(app: App, pluginId: string): Promise<void> {
  await installCommunityPlugin({ app, pluginId });
  await enableCommunityPlugin({ app, pluginId });
  new Notice(`Installed and enabled: ${pluginId}`);
}
