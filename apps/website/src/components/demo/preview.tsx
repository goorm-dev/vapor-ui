'use client';

import * as React from 'react';

import { EXAMPLE_LOADERS } from './_examples.generated';

interface PreviewProps {
    file: string;
}

const MissingExample = ({ file }: { file: string }) => (
    <div className="not-prose text-v-danger-500">Example not registered: {file}</div>
);

export function Preview({ file }: PreviewProps) {
    const Component = React.useMemo(() => {
        const loader = EXAMPLE_LOADERS[file];
        if (!loader) {
            const Fallback = () => <MissingExample file={file} />;
            Fallback.displayName = 'MissingExample';
            return Fallback;
        }
        return React.lazy(loader);
    }, [file]);

    return (
        <React.Suspense fallback={null}>
            <div className="not-prose p-v-300 min-h-75 flex flex-col justify-center items-center">
                <Component />
            </div>
        </React.Suspense>
    );
}
