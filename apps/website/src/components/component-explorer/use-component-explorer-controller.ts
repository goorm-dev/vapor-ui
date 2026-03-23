'use client';

import { useEffect, useMemo } from 'react';

import { useTheme } from '@vapor-ui/core';

import { type AnatomyPanelProps } from './anatomy-panel';
import { useExplorerCommunication } from './use-explorer-communication';
import { usePartSelection } from './use-part-selection';
import { usePreviewIframe } from './use-preview-iframe';

interface UseComponentExplorerControllerOptions {
    name: string;
    componentName: string;
}

function toDisplayName(value: string) {
    return value
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

export function useComponentExplorerController({
    name,
    componentName,
}: UseComponentExplorerControllerOptions) {
    const { resolvedTheme } = useTheme();
    const displayName = useMemo(() => toDisplayName(componentName), [componentName]);
    const previewPaneProps = usePreviewIframe({
        name,
        theme: resolvedTheme || 'light',
        componentName,
    });
    const { highlightPart, availableParts, resetAvailableParts } = useExplorerCommunication(
        previewPaneProps.iframeRef,
    );
    const {
        activePart,
        selectedPart,
        liveAnnouncement,
        handlePartHover,
        handlePartSelect,
        handleClearSelection,
    } = usePartSelection({
        componentName,
        displayName,
        availableParts,
    });

    useEffect(() => {
        resetAvailableParts();
    }, [previewPaneProps.iframeSrc, resetAvailableParts]);

    useEffect(() => {
        highlightPart(activePart);
    }, [activePart, highlightPart]);

    const panelProps: AnatomyPanelProps = useMemo(
        () => ({
            componentName: displayName,
            parts: availableParts ?? [],
            selectedPart,
            onPartHover: handlePartHover,
            onPartSelect: handlePartSelect,
            showPrimitives: true,
            onClearSelection: handleClearSelection,
        }),
        [
            availableParts,
            displayName,
            handleClearSelection,
            handlePartHover,
            handlePartSelect,
            selectedPart,
        ],
    );

    return {
        liveAnnouncement,
        panelProps,
        previewPaneProps,
    };
}
