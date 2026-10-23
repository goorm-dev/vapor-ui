'use client';

import * as React from 'react';

import { loadContentModule } from '~/utils/content-loader';

interface PreviewProps {
    file: string;
}

export function Preview({ file }: PreviewProps) {
    const Preview = React.useMemo(() => {
        const Component = React.lazy(() => loadContentModule(file));

        if (!Component) {
            return <div>Component({file}) Not Found</div>;
        }

        return <Component />;
    }, [file]);

    return (
        <React.Suspense fallback={null}>
            <div className="not-prose p-v-300 min-h-75 flex flex-col justify-center items-center">
                {Preview}
            </div>
        </React.Suspense>
    );
}
