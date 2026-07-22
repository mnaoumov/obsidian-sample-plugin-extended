import process from 'node:process';
import { wrapCliTask } from 'obsidian-dev-utils/script-utils/cli-utils';
import { readJson } from 'obsidian-dev-utils/script-utils/json';
import {
  parseVersionArgs,
  updateVersion
} from 'obsidian-dev-utils/script-utils/version';

/*
 * This repo is a template. Releasing the template itself is disabled, but the guard below is keyed to the
 * template's own plugin id: the moment you fork this repo and set your own id in manifest.json it becomes
 * inert, so clones release normally (you can also just delete this guard).
 */
const TEMPLATE_PLUGIN_ID = 'sample-plugin-extended';

interface Manifest {
  id: string;
}

await wrapCliTask(async () => {
  const manifest = await readJson<Manifest>('manifest.json');
  if (manifest.id === TEMPLATE_PLUGIN_ID) {
    throw new Error(
      `Releasing is disabled for the template repo (plugin id "${TEMPLATE_PLUGIN_ID}"). `
        + 'Set your own id in manifest.json to enable releases, or remove this guard in scripts/version.ts.'
    );
  }

  const [, , ...args] = process.argv;
  const { options, versionUpdateType } = parseVersionArgs(args);
  await updateVersion(versionUpdateType, options);
});
