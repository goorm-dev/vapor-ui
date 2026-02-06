'use client';

import * as React from 'react';

import { Button, Text, useTheme } from '@vapor-ui/core';
import { ErrorCircleOutlineIcon } from '@vapor-ui/icons';

import { AnatomyPanel } from './anatomy-panel';
import type { AnatomyData, Part } from './types';
import { useExplorerCommunication } from './use-explorer-communication';

interface ComponentExplorerProps {
    name: string;
    componentName: string;
}

export function ComponentExplorer({ name, componentName }: ComponentExplorerProps) {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const [hoveredPart, setHoveredPart] = React.useState<string | null>(null);
    const [parts, setParts] = React.useState<Part[]>([]);
    const [anatomyData, setAnatomyData] = React.useState<AnatomyData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [retryCount, setRetryCount] = React.useState(0);
    const [iframeLoaded, setIframeLoaded] = React.useState(false);
    const { highlightPart } = useExplorerCommunication(iframeRef);
    const { resolvedTheme } = useTheme();

    React.useEffect(() => {
        const abortController = new AbortController();

        setIsLoading(true);
        setError(null);

        fetch(`/components/anatomy/${componentName}.json`, {
            signal: abortController.signal,
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: Failed to load anatomy data`);
                }
                return res.json();
            })
            .then((data: AnatomyData) => {
                setAnatomyData(data);
                setParts(data.parts);
                setError(null);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    console.error(`Failed to load anatomy data for ${componentName}:`, err);
                    setError(err.message || 'Failed to load anatomy data');
                }
            })
            .finally(() => {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            });

        return () => {
            abortController.abort();
        };
    }, [componentName, retryCount]);

    const handleRetry = React.useCallback(() => {
        setRetryCount((prev) => prev + 1);
    }, []);

    React.useEffect(() => {
        if (iframeRef.current) {
            setIframeLoaded(false);
            const theme = resolvedTheme || 'light';
            iframeRef.current.src = `/preview/component?path=${encodeURIComponent(name)}&theme=${theme}&explorer=true`;
        }
    }, [name, resolvedTheme]);

    const handlePartHover = React.useCallback(
        (partName: string | null) => {
            setHoveredPart(partName);
            highlightPart(partName);
        },
        [highlightPart],
    );

    const handleIframeLoad = React.useCallback(() => {
        setIframeLoaded(true);
    }, []);

    const displayName = anatomyData?.displayNamePrefix || componentName;

    return (
        <div className="rounded-xl overflow-hidden border border-v-normal-200 bg-v-canvas-100 shadow-lg shadow-v-normal-900/5">
            <div className="flex min-h-[420px]">
                {isLoading ? (
                    <div className="w-64 flex-shrink-0 bg-v-canvas-100 p-4 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-v-normal-200 border-t-v-primary-500 rounded-full animate-spin" />
                            <Text typography="body3" foreground="normal-100" className="opacity-60">
                                Loading…
                            </Text>
                        </div>
                    </div>
                ) : error ? (
                    <div className="w-64 flex-shrink-0 bg-v-canvas-100 p-4 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 text-center px-4">
                            <ErrorCircleOutlineIcon className="w-10 h-10 text-v-danger-500" />
                            <div className="flex flex-col gap-2">
                                <Text
                                    typography="body2"
                                    foreground="danger-100"
                                    className="font-semibold"
                                >
                                    Failed to load anatomy
                                </Text>
                                <Text
                                    typography="body3"
                                    foreground="normal-100"
                                    className="opacity-80"
                                >
                                    {error}
                                </Text>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                color="neutral"
                                onClick={handleRetry}
                            >
                                Retry
                            </Button>
                        </div>
                    </div>
                ) : (
                    <AnatomyPanel
                        componentName={displayName}
                        parts={parts}
                        hoveredPart={hoveredPart}
                        onPartHover={handlePartHover}
                        showPrimitives
                    />
                )}
                <div className="flex-1 relative bg-v-canvas border-l border-v-normal-200">
                    {!iframeLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-v-canvas/90 backdrop-blur-sm z-10">
                            <div className="flex flex-col items-center gap-3">
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
                            </div>
                        </div>
                    )}
                    <iframe
                        ref={iframeRef}
                        width="100%"
                        height="100%"
                        className="border-0 block"
                        style={{ minHeight: '420px' }}
                        title={`Component Explorer - ${componentName}`}
                        sandbox="allow-scripts allow-same-origin"
                        onLoad={handleIframeLoad}
                    />
                </div>
            </div>
        </div>
    );
}
