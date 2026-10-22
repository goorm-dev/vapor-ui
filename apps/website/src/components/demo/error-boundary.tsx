'use client';

import { ErrorBoundary } from 'react-error-boundary';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Fallback({ error }: { error: any }) {
    return (
        <div role="alert">
            <p>Something went wrong:</p>
            <pre style={{ color: 'red' }}>{error.message}</pre>
        </div>
    );
}

interface Props {
    children: React.ReactNode;
}

export default function ErrorBoundaryImpl(props: Props) {
    const { children } = props;
    return <ErrorBoundary FallbackComponent={Fallback}>{children}</ErrorBoundary>;
}
