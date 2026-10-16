import type { Linter } from 'eslint';

import { defineEslintConfigs } from '@mnaoumov/obsidian-dev-toolkit/linters/eslint-config';
import { ObsidianPluginRepoPaths } from '@mnaoumov/obsidian-dev-toolkit/obsidian-plugin-repo-paths';
import { defineConfig } from 'eslint/config';

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
          'obsidian-dev-toolkit/manifest-name': 'off'
        }
      }
    ]);
  }
});
