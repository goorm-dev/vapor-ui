'use client';

import type { PropsWithChildren } from 'react';
import { type FallbackProps, ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

function Fallback({ error }: FallbackProps) {
    const message = error instanceof Error ? error.message : String(error);
    return (
        <div role="alert" className="not-prose">
            <p>Something went wrong:</p>
            <pre className="text-v-danger-500 whitespace-pre-wrap">{message}</pre>
        </div>
    );
}

export function ErrorBoundary({ children }: PropsWithChildren) {
    return <ReactErrorBoundary FallbackComponent={Fallback}>{children}</ReactErrorBoundary>;
}
