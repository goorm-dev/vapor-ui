'use client';

import * as React from 'react';

import { HighlightOverlay } from '~/components/component-explorer/iframe/highlight-overlay';
import { useAvailablePartsReporter } from '~/components/component-explorer/iframe/use-available-parts-reporter';
import { EXPLORER_MESSAGES } from '~/components/component-explorer/types';

import { DynamicComponent } from './dynamic-component';

interface PreviewWrapperProps {
    theme: string;
    componentPath?: string;
    explorer?: boolean;
    children?: React.ReactNode;
}

export function PreviewWrapper({
    theme,
    componentPath,
    explorer = false,
    children,
}: PreviewWrapperProps) {
    useAvailablePartsReporter({ enabled: explorer && Boolean(componentPath) });

    // Notify parent frame that the preview has successfully rendered
    React.useEffect(() => {
        if (window.parent !== window) {
            window.parent.postMessage(
                { type: EXPLORER_MESSAGES.PREVIEW_READY },
                window.location.origin,
            );
        }
    }, []);

    // Sync theme changes (e.g., when user switches theme while iframe is open)
    React.useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            root.setAttribute('data-vapor-theme', 'dark');
        } else {
            root.classList.remove('dark');
            root.setAttribute('data-vapor-theme', 'light');
        }
    }, [theme]);

    if (componentPath) {
        if (!explorer) {
            return <DynamicComponent componentPath={componentPath} />;
        }

        return (
            <>
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DynamicComponent componentPath={componentPath} />
                </div>
                <HighlightOverlay />
            </>
        );
    }

    return <>{children}</>;
}
