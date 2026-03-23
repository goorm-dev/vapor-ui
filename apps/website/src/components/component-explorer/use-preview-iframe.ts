'use client';

import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EXPLORER_MESSAGES } from './types';

const PREVIEW_LOAD_TIMEOUT_MS = 15_000;

export interface PreviewPaneProps {
    iframeRef: RefObject<HTMLIFrameElement | null>;
    iframeSrc: string;
    iframeTitle: string;
    iframeLoaded: boolean;
    iframeError: boolean;
    handleRetry: () => void;
}

interface UsePreviewIframeOptions {
    name: string;
    theme: string;
    componentName: string;
}

export function usePreviewIframe({
    name,
    theme,
    componentName,
}: UsePreviewIframeOptions): PreviewPaneProps {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [iframeError, setIframeError] = useState(false);
    const [reloadNonce, setReloadNonce] = useState(0);

    const iframeSrc = useMemo(
        () =>
            `/preview/component?path=${encodeURIComponent(name)}&theme=${theme}&explorer=true&reload=${reloadNonce}`,
        [name, reloadNonce, theme],
    );

    const iframeTitle = useMemo(() => `Component Explorer - ${componentName}`, [componentName]);

    // Reset state when iframe src changes
    useEffect(() => {
        setIframeLoaded(false);
        setIframeError(false);
    }, [iframeSrc]);

    // Listen for preview-ready postMessage from iframe content and use a timeout fallback
    useEffect(() => {
        let loaded = false;

        const handleMessage = (event: MessageEvent<unknown>) => {
            if (event.origin !== window.location.origin) return;
            if (event.source !== iframeRef.current?.contentWindow) return;
            if (
                !event.data ||
                typeof event.data !== 'object' ||
                !('type' in event.data) ||
                (event.data as { type: string }).type !== EXPLORER_MESSAGES.PREVIEW_READY
            ) {
                return;
            }

            loaded = true;
            setIframeLoaded(true);
            setIframeError(false);
        };

        window.addEventListener('message', handleMessage);

        const timeoutId = setTimeout(() => {
            if (!loaded) {
                setIframeError(true);
            }
        }, PREVIEW_LOAD_TIMEOUT_MS);

        return () => {
            window.removeEventListener('message', handleMessage);
            clearTimeout(timeoutId);
        };
    }, [iframeSrc]);

    const handleRetry = useCallback(() => {
        setReloadNonce((prev) => prev + 1);
    }, []);

    return {
        iframeRef,
        iframeSrc,
        iframeTitle,
        iframeLoaded,
        iframeError,
        handleRetry,
    };
}