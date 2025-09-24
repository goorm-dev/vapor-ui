'use client';

import * as React from 'react';

import clsx from 'clsx';

interface IframePreviewProps {
    name: string;
    className?: string;
    device: string;
}

export function IframePreview(props: IframePreviewProps) {
    const { name, className, device } = props;
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    const getIframeWidth = () => {
        switch (device) {
            case 'mobile':
                return '375px';
            case 'tablet':
                return '768px';
            case 'desktop':
            default:
                return '100%';
        }
    };

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
                width={getIframeWidth()}
                height="400px"
                style={{
                    transition: 'width 0.2s ease',
                    maxWidth: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                title={`Preview of ${name}`}
                sandbox="allow-scripts allow-same-origin"
            />
        </div>
    );
}
