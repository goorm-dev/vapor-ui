'use client';

import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface PreviewPaneProps {
    iframeRef: RefObject<HTMLIFrameElement | null>;
    iframeSrc: string;
    iframeTitle: string;
    iframeLoaded: boolean;
    iframeError: boolean;
    handleIframeLoad: () => void;
    handleIframeError: () => void;
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

    const iframeTitle = useMemo(
        () => `Component Explorer - ${componentName}`,
        [componentName],
    );

    useEffect(() => {
        setIframeLoaded(false);
        setIframeError(false);
    }, [iframeSrc]);

    const handleIframeLoad = useCallback(() => {
        setIframeLoaded(true);
        setIframeError(false);
    }, []);

    const handleIframeError = useCallback(() => {
        setIframeLoaded(false);
        setIframeError(true);
    }, []);

    const handleRetry = useCallback(() => {
        setReloadNonce((prev) => prev + 1);
    }, []);

    return {
        iframeRef,
        iframeSrc,
        iframeTitle,
        iframeLoaded,
        iframeError,
        handleIframeLoad,
        handleIframeError,
        handleRetry,
    };
}
