'use client';

import * as React from 'react';

import clsx from 'clsx';

import type { DeviceType } from '~/constants/code-block';
import { DEVICE_WIDTH_MAP } from '~/constants/code-block';

interface IframePreviewProps {
    name: string;
    className?: string;
    device: DeviceType;
}
const getIframeWidth = (device: DeviceType) => {
    return DEVICE_WIDTH_MAP[device] || '100%';
};

export function IframePreview(props: IframePreviewProps) {
    const { name, className, device } = props;
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    React.useEffect(() => {
        if (iframeRef.current) {
            // Set the iframe src to the dedicated preview page
            iframeRef.current.src = `/preview/component?path=${encodeURIComponent(name)}`;
        }
    }, [name]);

    return (
        <div className={clsx('iframe-preview-container flex justify-center', className)}>
            <iframe
                ref={iframeRef}
                width={getIframeWidth(device)}
                height="400px"
                className="transition-[width] duration-200 ease-in-out max-w-full flex justify-center items-center"
                title={`Preview of ${name}`}
                sandbox="allow-scripts allow-same-origin"
            />
        </div>
    );
}
