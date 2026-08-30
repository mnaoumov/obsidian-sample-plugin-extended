import { existsSync } from 'node:fs';
import process from 'node:process';
import { wrapCliTask } from 'obsidian-dev-utils/script-utils/cli-utils';
import {
  parseVersionArguments,
  updateVersion
} from 'obsidian-dev-utils/script-utils/version';

/*
 * This repo is the template that plugins are scaffolded from, and it must not release itself.
 * The guard below is keyed to a marker FILE, deliberately not to the template's own plugin id.
 * Scaffolding renames that id globally, which would re-target an id-keyed guard at the new plugin.
 * A file's existence survives any text rename, so the trap cannot be reproduced.
 * Delete `.template` in your own copy to enable releases.
 */
const TEMPLATE_MARKER_FILE = '.template';

await wrapCliTask(() => {
  if (existsSync(TEMPLATE_MARKER_FILE)) {
    throw new Error(
      `Releasing is disabled while the ${TEMPLATE_MARKER_FILE} marker file exists. `
        + `Delete ${TEMPLATE_MARKER_FILE} to enable releases for your plugin.`
    );
  }

  const [, , ...$arguments] = process.argv;
  const { options, versionUpdateType } = parseVersionArguments($arguments);
  return updateVersion(versionUpdateType, options);
});
