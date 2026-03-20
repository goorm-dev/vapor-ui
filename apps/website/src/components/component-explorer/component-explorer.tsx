'use client';

import * as React from 'react';

import { Text, useTheme } from '@vapor-ui/core';

import { AnatomyPanel } from './anatomy-panel';
import { useExplorerCommunication } from './use-explorer-communication';

interface ComponentExplorerProps {
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

export function ComponentExplorer({ name, componentName }: ComponentExplorerProps) {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const [hoveredPart, setHoveredPart] = React.useState<string | null>(null);
    const [selectedPart, setSelectedPart] = React.useState<string | null>(null);
    const [iframeLoaded, setIframeLoaded] = React.useState(false);
    const [iframeError, setIframeError] = React.useState(false);
    const [liveAnnouncement, setLiveAnnouncement] = React.useState('');
    const { highlightPart, availableParts, resetAvailableParts } =
        useExplorerCommunication(iframeRef);
    const { resolvedTheme } = useTheme();

    React.useEffect(() => {
        setSelectedPart(null);
        setHoveredPart(null);
        setLiveAnnouncement('');
    }, [componentName]);

    React.useEffect(() => {
        if (iframeRef.current) {
            resetAvailableParts();
            setIframeLoaded(false);
            const theme = resolvedTheme || 'light';
            iframeRef.current.src = `/preview/component?path=${encodeURIComponent(name)}&theme=${theme}&explorer=true`;
        }
    }, [name, resetAvailableParts, resolvedTheme]);

    React.useEffect(() => {
        if (!availableParts) return;

        setSelectedPart((prev) => (prev && !availableParts.includes(prev) ? null : prev));
        setHoveredPart((prev) => (prev && !availableParts.includes(prev) ? null : prev));
    }, [availableParts]);

    const activePart = hoveredPart ?? selectedPart;

    React.useEffect(() => {
        highlightPart(activePart);
    }, [activePart, highlightPart]);

    const handlePartHover = React.useCallback((partName: string | null) => {
        setHoveredPart(partName);
    }, []);

    const displayName = React.useMemo(() => toDisplayName(componentName), [componentName]);

    const handlePartSelect = React.useCallback(
        (value: unknown) => {
            const partName = typeof value === 'string' && value.length > 0 ? value : null;
            setSelectedPart(partName || null);
            setLiveAnnouncement(
                partName ? `${displayName}.${partName} 선택됨` : '파트 선택이 해제되었습니다.',
            );
        },
        [displayName],
    );

    const handleClearSelection = React.useCallback(() => {
        setSelectedPart(null);
        setHoveredPart(null);
        setLiveAnnouncement('파트 선택이 해제되었습니다.');
    }, []);

    const handleIframeLoad = React.useCallback(() => {
        setIframeLoaded(true);
        setIframeError(false);
    }, []);

    const handleIframeError = React.useCallback(() => {
        setIframeLoaded(false);
        setIframeError(true);
    }, []);

    const handleRetry = React.useCallback(() => {
        setIframeError(false);
        setIframeLoaded(false);
        if (iframeRef.current) {
            const { src } = iframeRef.current;
            iframeRef.current.src = '';
            iframeRef.current.src = src;
        }
    }, []);

    return (
        <div className="rounded-xl overflow-hidden border border-v-normal-200 bg-v-canvas-100 shadow-lg shadow-v-normal-900/5">
            <p className="sr-only" role="status" aria-live="polite">
                {liveAnnouncement}
            </p>
            <div className="flex flex-col md:flex-row min-h-[320px] md:min-h-[420px]">
                <AnatomyPanel
                    componentName={displayName}
                    parts={availableParts ?? []}
                    selectedPart={selectedPart}
                    onPartHover={handlePartHover}
                    onPartSelect={handlePartSelect}
                    showPrimitives
                    onClearSelection={handleClearSelection}
                />
                <div className="flex-1 relative bg-v-canvas border-t md:border-t-0 md:border-l border-v-normal-200 min-h-[320px] md:min-h-0">
                    {!iframeLoaded && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-v-canvas/90 backdrop-blur-sm z-10"
                            role="status"
                        >
                            <div className="flex flex-col items-center gap-3">
                                {iframeError ? (
                                    <>
                                        <Text
                                            typography="body3"
                                            foreground="normal-100"
                                            className="opacity-60"
                                        >
                                            Failed to load preview.
                                        </Text>
                                        <button
                                            type="button"
                                            onClick={handleRetry}
                                            aria-label="Retry loading component preview"
                                            className="px-3 py-1.5 rounded-md text-sm bg-v-primary-500 text-white cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v-primary-500"
                                        >
                                            Retry
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <div className="w-10 h-10 border-2 border-v-normal-200 rounded-full" />
                                            <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-t-v-primary-500 rounded-full animate-spin" />
                                        </div>
                                        <Text
                                            typography="body3"
                                            foreground="normal-100"
                                            className="opacity-60"
                                        >
                                            Loading preview…
                                        </Text>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    <iframe
                        ref={iframeRef}
                        className="border-0 block w-full h-[320px] md:h-full min-h-[320px] md:min-h-[420px]"
                        title={`Component Explorer - ${componentName}`}
                        sandbox="allow-scripts allow-same-origin"
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                    />
                </div>
            </div>
        </div>
    );
}
