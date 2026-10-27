'use client';

import * as React from 'react';

interface PreviewProps {
    file: string;
}

export function Preview({ file }: PreviewProps) {
    const Preview = React.useMemo(() => {
        // NOTE: If the demo root moves, update `CONTENT_PATH` (src/constants/demo.ts) and the same
        // literal in src/app/preview/[component]/dynamic-component.tsx together.
        const Component = React.lazy(() => import(`~content/docs/${file}`));

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
