import type { Linter } from 'eslint';

import { defineConfig } from 'eslint/config';
import { ObsidianPluginRepoPaths } from 'obsidian-dev-utils/obsidian/plugin/obsidian-plugin-repo-paths';
import { defineEslintConfigs } from 'obsidian-dev-utils/script-utils/linters/eslint-config';

export const configs: Linter.Config[] = defineEslintConfigs({
  customConfigs() {
    return defineConfig([
      {
        rules: {
          'obsidianmd/ui/sentence-case': [
            'error',
            {
              brands: [
                'React',
                'Svelte'
              ]
            }
          ]
        }
      },
      {
        files: [ObsidianPluginRepoPaths.ManifestJson],
        rules: {
          /**
           * The community directory forbids `Plugin` inside a plugin `name`, and this one carries it.
           * This repo is a TEMPLATE rather than a published plugin — it is never listed and never
           * released — and `Sample Plugin Extended` says exactly that to anyone copying it, so the word
           * is the point rather than an oversight. The other three manifest rules stay on, which is why
           * the checks are separate rules rather than one.
           */
          'obsidian-dev-utils/manifest-name': 'off'
        }
      }
    ]);
  }
});
