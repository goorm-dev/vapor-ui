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

const PROPS_TARGET_OVERRIDES: Record<string, Record<string, string[]>> = {
    'floating-bar': {
        PortalPrimitive: ['floating-bar-portal'],
        PositionerPrimitive: ['floating-bar-positioner'],
        PopupPrimitive: ['floating-bar-popup'],
    },
};

function toKebabCase(value: string) {
    return value
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .toLowerCase();
}

function getPropsTargetCandidates(componentName: string, partName: string) {
    const defaultCandidates = [`${componentName}-${toKebabCase(partName)}`];

    if (partName.endsWith('Primitive')) {
        defaultCandidates.push(
            `${componentName}-${toKebabCase(partName.replace(/Primitive$/, ''))}`,
        );
    }

    const overrideCandidates = PROPS_TARGET_OVERRIDES[componentName]?.[partName] ?? [];

    return Array.from(new Set([...overrideCandidates, ...defaultCandidates]));
}

export function ComponentExplorer({ name, componentName }: ComponentExplorerProps) {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const [hoveredPart, setHoveredPart] = React.useState<string | null>(null);
    const [pinnedPart, setPinnedPart] = React.useState<string | null>(null);
    const [parts, setParts] = React.useState<Part[]>([]);
    const [anatomyData, setAnatomyData] = React.useState<AnatomyData | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [retryCount, setRetryCount] = React.useState(0);
    const [iframeLoaded, setIframeLoaded] = React.useState(false);
    const [propsTargetComponentName, setPropsTargetComponentName] = React.useState<string | null>(
        null,
    );
    const [liveAnnouncement, setLiveAnnouncement] = React.useState('');
    const { highlightPart, availableParts } = useExplorerCommunication(iframeRef);
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

    React.useEffect(() => {
        setPinnedPart(null);
        setHoveredPart(null);
        setPropsTargetComponentName(null);
        setLiveAnnouncement('');
    }, [componentName]);

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

    const activePart = hoveredPart ?? pinnedPart;

    React.useEffect(() => {
        highlightPart(activePart);
    }, [activePart, highlightPart]);

    const handlePartHover = React.useCallback((partName: string | null) => {
        setHoveredPart(partName);
    }, []);

    const displayName = anatomyData?.displayNamePrefix || componentName;

    const handlePartClick = React.useCallback(
        (partName: string) => {
            setPinnedPart((prev) => {
                const nextPinnedPart = prev === partName ? null : partName;
                setLiveAnnouncement(
                    nextPinnedPart
                        ? `${displayName}.${nextPinnedPart} 선택됨`
                        : '파트 선택이 해제되었습니다.',
                );
                return nextPinnedPart;
            });
        },
        [displayName],
    );

    const handleClearSelection = React.useCallback(() => {
        setPinnedPart(null);
        setHoveredPart(null);
        setLiveAnnouncement('파트 선택이 해제되었습니다.');
    }, []);

    const handleIframeLoad = React.useCallback(() => {
        setIframeLoaded(true);
    }, []);

    const hasPrimitivePart = parts.some((part) => part.isPrimitive);

    React.useEffect(() => {
        if (!pinnedPart || typeof document === 'undefined') {
            setPropsTargetComponentName(null);
            return;
        }

        const candidates = getPropsTargetCandidates(componentName, pinnedPart);
        const matched = candidates.find((candidate) =>
            Boolean(document.querySelector(`[data-component-props="${candidate}"]`)),
        );

        setPropsTargetComponentName(matched ?? null);
    }, [componentName, pinnedPart]);

    const handleMoveToProps = React.useCallback(() => {
        if (!pinnedPart || typeof document === 'undefined') return;

        const candidates = getPropsTargetCandidates(componentName, pinnedPart);
        const targetComponentName =
            candidates.find((candidate) =>
                Boolean(document.querySelector(`[data-component-props="${candidate}"]`)),
            ) ?? null;

        if (!targetComponentName) {
            setLiveAnnouncement(`${displayName}.${pinnedPart} Props Table을 찾을 수 없습니다.`);
            return;
        }

        const target = document.querySelector<HTMLElement>(
            `[data-component-props="${targetComponentName}"]`,
        );

        if (!target) {
            setLiveAnnouncement(`${displayName}.${pinnedPart} Props Table을 찾을 수 없습니다.`);
            return;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setLiveAnnouncement(`${displayName}.${pinnedPart} Props Table로 이동했습니다.`);
    }, [componentName, displayName, pinnedPart]);

    if (!isLoading && !error && !hasPrimitivePart) {
        return null;
    }

    return (
        <div className="rounded-xl overflow-hidden border border-v-normal-200 bg-v-canvas-100 shadow-lg shadow-v-normal-900/5">
            <p className="sr-only" role="status" aria-live="polite">
                {liveAnnouncement}
            </p>
            <div className="flex flex-col md:flex-row min-h-[320px] md:min-h-[420px]">
                {isLoading ? (
                    <div
                        className="w-full md:w-64 flex-shrink-0 bg-v-canvas-100 p-4 flex items-center justify-center"
                        role="status"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-v-normal-200 border-t-v-primary-500 rounded-full animate-spin" />
                            <Text typography="body3" foreground="normal-100" className="opacity-60">
                                Loading…
                            </Text>
                        </div>
                    </div>
                ) : error ? (
                    <div
                        className="w-full md:w-64 flex-shrink-0 bg-v-canvas-100 p-4 flex items-center justify-center"
                        role="alert"
                    >
                        <div className="flex flex-col items-center gap-4 text-center px-4">
                            <ErrorCircleOutlineIcon
                                className="w-10 h-10 text-v-danger-500"
                                aria-hidden="true"
                            />
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
                        availableParts={availableParts}
                        componentName={displayName}
                        parts={parts}
                        hoveredPart={hoveredPart}
                        pinnedPart={pinnedPart}
                        onPartHover={handlePartHover}
                        onPartClick={handlePartClick}
                        showPrimitives
                        selectedPart={pinnedPart}
                        canMoveToProps={Boolean(propsTargetComponentName)}
                        onMoveToProps={handleMoveToProps}
                        onClearSelection={handleClearSelection}
                    />
                )}
                <div className="flex-1 relative bg-v-canvas border-t md:border-t-0 md:border-l border-v-normal-200 min-h-[320px] md:min-h-0">
                    {!iframeLoaded && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-v-canvas/90 backdrop-blur-sm z-10"
                            role="status"
                        >
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
                        className="border-0 block w-full h-[320px] md:h-full min-h-[320px] md:min-h-[420px]"
                        title={`Component Explorer - ${componentName}`}
                        sandbox="allow-scripts allow-same-origin"
                        onLoad={handleIframeLoad}
                    />
                </div>
            </div>
        </div>
    );
}
