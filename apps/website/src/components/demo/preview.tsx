'use client';

import * as React from 'react';

interface PreviewProps {
    file: string;
}

export function Preview({ file }: PreviewProps) {
    const Preview = React.useMemo(() => {
        const rest = file.replace(/^\/?content\//, '');
        const Component = React.lazy(() => import(`../../../content/${rest}`));

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
