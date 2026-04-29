'use client';

import { AnatomyPanel } from './anatomy-panel';
import { ExplorerPreviewPane } from './explorer-preview-pane';
import { useComponentExplorerController } from './use-component-explorer-controller';

interface ComponentExplorerProps {
    name: string;
    componentName: string;
}

export function ComponentExplorer({ name, componentName }: ComponentExplorerProps) {
    const { liveAnnouncement, panelProps, previewPaneProps } = useComponentExplorerController({
        name,
        componentName,
    });

    return (
        <div className="not-prose rounded-xl overflow-hidden border border-v-normal-200 bg-v-canvas-100">
            <p className="sr-only" role="status" aria-live="polite">
                {liveAnnouncement}
            </p>
            <div className="flex flex-col md:flex-row min-h-[320px] md:min-h-[420px]">
                <AnatomyPanel {...panelProps} />
                <ExplorerPreviewPane {...previewPaneProps} />
            </div>
        </div>
    );
}
