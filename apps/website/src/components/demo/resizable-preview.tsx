'use client';

import * as React from 'react';
import clsx from 'clsx';

interface ResizablePreviewProps {
    name: string;
    className?: string;
    device: string;
}

export function ResizablePreview(props: ResizablePreviewProps) {
    const { name, className, device } = props;
    const [containerWidth, setContainerWidth] = React.useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const Preview = React.useMemo(() => {
        const Component = React.lazy(() => import(`./examples/${name}.tsx`));

        if (!Component) {
            return <div>Component({name}) Not Found</div>;
        }

        return <Component />;
    }, [name]);

    const getInitialWidth = () => {
        switch (device) {
            case 'mobile':
                return 375;
            case 'tablet':
                return 768;
            case 'desktop':
            default:
                return 1200;
        }
    };

    React.useEffect(() => {
        if (containerRef.current) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    setContainerWidth(entry.contentRect.width);
                }
            });

            resizeObserver.observe(containerRef.current);
            return () => resizeObserver.disconnect();
        }
    }, []);

    return (
        <React.Suspense fallback={null}>
            <div className={clsx('resizable-preview-wrapper', className)}>
                <div className="resize-handle-container" style={{ width: '100%', maxWidth: '100%' }}>
                    <div
                        ref={containerRef}
                        className="resizable-preview-container"
                        style={{
                            width: `${getInitialWidth()}px`,
                            maxWidth: '100%',
                            minWidth: '320px',
                            margin: '0 auto',
                            resize: 'horizontal',
                            overflow: 'hidden',
                            border: '2px dashed #e5e7eb',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            position: 'relative',
                        }}
                    >
                        {/* Width indicator */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                background: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                zIndex: 10,
                            }}
                        >
                            {Math.round(containerWidth)}px
                        </div>

                        <div
                            className={clsx(
                                'not-prose example-reset example-enter min-h-[300px] flex flex-col justify-center items-center',
                                'w-full overflow-hidden',
                            )}
                            style={{
                                width: '100%',
                            }}
                        >
                            {Preview}
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '8px',
                        fontSize: '14px',
                        color: '#6b7280',
                    }}
                >
                    Drag the right edge to resize and test responsiveness
                </div>
            </div>
        </React.Suspense>
    );
}