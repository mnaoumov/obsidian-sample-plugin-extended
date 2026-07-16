<script lang="ts">
  import type { SampleSvelteComponentProps } from './sample-svelte-component.d.ts';

  import { untrack } from 'svelte';

  let { startCount }: SampleSvelteComponentProps = $props();

  // Seed local `count` from the initial `startCount` prop; `increment` mutates it and it intentionally does not track later prop changes.
  let count = $state(untrack(() => startCount));

  export function increment() {
    count += 1;
  }
</script>

<h4>Sample Svelte Component!</h4>

<div>
  <span>My number is {count}!</span>
</div>

<button onclick={increment}>Increment</button>