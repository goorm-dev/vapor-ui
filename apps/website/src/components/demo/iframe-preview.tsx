'use client';

import * as React from 'react';

import { useTheme } from '@vapor-ui/core';

import { normalizeFile } from '~/utils/paths';

import type { DeviceType } from './constants';
import { DEVICE_WIDTH_MAP } from './constants';

interface IframePreviewProps {
    file: string;
    className?: string;
    device: DeviceType;
}

const getIframeWidth = (device: DeviceType) => DEVICE_WIDTH_MAP[device] || '100%';

export function IframePreview({ file, device }: IframePreviewProps) {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const { resolvedTheme } = useTheme();
    const normalized = normalizeFile(file);

    React.useEffect(() => {
        if (iframeRef.current && resolvedTheme) {
            iframeRef.current.src = `/preview/component?file=${encodeURIComponent(normalized)}&theme=${resolvedTheme}`;
        }
    }, [normalized, resolvedTheme]);

    return (
        <div className="iframe-preview-container flex justify-center p-v-300">
            <iframe
                ref={iframeRef}
                width={getIframeWidth(device)}
                height="400px"
                className="transition-[width] duration-200 ease-in-out max-w-full flex justify-center items-center"
                title={`Preview of ${normalized}`}
                sandbox="allow-scripts allow-same-origin"
            />
        </div>
    );
}
