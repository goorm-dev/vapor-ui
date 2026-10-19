'use client';

import * as React from 'react';

import { fileToComponentPath } from './paths';

interface PreviewProps {
    file: string;
}

export function Preview({ file }: PreviewProps) {
    const Component = React.useMemo(() => {
        const componentPath = fileToComponentPath(file);
        return React.lazy(() => import(`./examples/${componentPath}.tsx`));
    }, [file]);

    return (
        <React.Suspense fallback={null}>
            <div className="not-prose p-v-300 min-h-75 flex flex-col justify-center items-center">
                <Component />
            </div>
        </React.Suspense>
    );
}
