'use client';

import * as React from 'react';

import clsx from 'clsx';

interface PreviewProps {
    name: string;
    className?: string;
}

export function Preview(props: PreviewProps) {
    const { name, className } = props;

    const Preview = React.useMemo(() => {
        const Component = React.lazy(() => import(`./examples/${name}.tsx`));

        if (!Component) {
            return <div>Component({name}) Not Found</div>;
        }

        return <Component />;
    }, [name]);

    return (
        <React.Suspense fallback={null}>
            <div
                className={clsx(
                    'not-prose example-reset example-enter min-h-[300px] flex flex-col justify-center items-center',
                    className,
                )}
            >
                {Preview}
            </div>
        </React.Suspense>
    );
}
