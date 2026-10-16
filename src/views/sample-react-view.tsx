import type { Root } from 'react-dom/client';

import { AppContext } from '@mnaoumov/obsidian-lib/react/app-context';
import { noopAsync } from '@mnaoumov/typescript-lib/function';
import { ItemView } from 'obsidian';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import type { SampleReactComponentProps } from '../react-components/sample-react-component.tsx';

import { SampleReactComponent } from '../react-components/sample-react-component.tsx';

export const SAMPLE_REACT_VIEW_TYPE = 'sample-plugin-extended-SampleReactView';

export class SampleReactView extends ItemView {
  private root: null | Root = null;

  public override getDisplayText(): string {
    return 'Sample React view';
  }

  public override getViewType(): string {
    return SAMPLE_REACT_VIEW_TYPE;
  }

  public override async onClose(): Promise<void> {
    this.root?.unmount();
    await noopAsync();
  }

  public override async onOpen(): Promise<void> {
    const START_COUNT = 10;
    const props: SampleReactComponentProps = {
      startCount: START_COUNT
    };

    this.root = createRoot(this.contentEl);
    this.root.render(
      <StrictMode>
        <AppContext.Provider value={this.app}>
          <SampleReactComponent {...props} />
        </AppContext.Provider>
      </StrictMode>
    );

    await noopAsync();
  }
}
