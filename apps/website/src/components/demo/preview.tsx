'use client';

import * as React from 'react';

import { normalizeFile } from './paths';

interface PreviewProps {
    file: string;
}

export function Preview({ file }: PreviewProps) {
    const Component = React.useMemo(() => {
        const normalized = normalizeFile(file);
        // Climb back to `apps/website/` and resolve the author-provided path verbatim.
        // `webpackInclude` keeps the generated chunk set to `.tsx` so the bundler does not
        // try to import MDX or other content assets co-located with the example.
        return React.lazy(() =>
            import(/* webpackInclude: /\.tsx$/ */ `../../../${normalized}`),
        );
    }, [file]);

    return (
        <React.Suspense fallback={null}>
            <div className="not-prose p-v-300 min-h-75 flex flex-col justify-center items-center">
                <Component />
            </div>
        </React.Suspense>
    );
}
