'use client';

import { Text } from '@vapor-ui/core';

import { type PreviewPaneProps } from './use-preview-iframe';

export function ExplorerPreviewPane({
    iframeRef,
    iframeSrc,
    iframeTitle,
    iframeLoaded,
    iframeError,
    handleRetry,
}: PreviewPaneProps) {
    return (
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
                src={iframeSrc}
                className="border-0 block w-full h-[320px] md:h-full min-h-[320px] md:min-h-[420px]"
                title={iframeTitle}
            />
        </div>
    );
}