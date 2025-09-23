import * as React from 'react';

import { Tab, Tabs } from 'fumadocs-ui/components/tabs';

import ErrorBoundary from './error-boundary';
import { Preview } from './preview';

interface DemoProps {
    name: string;

    children?: React.ReactNode;
}

export function Demo(props: DemoProps) {
    const { name, children } = props;

    if (!children) {
        return (
            <React.Suspense fallback={null}>
                <Preview name={name} />
            </React.Suspense>
        );
    }

    return (
        <ErrorBoundary>
            <Tabs
                items={['Preview', 'Code']}
                defaultIndex={0}
                className="my-0 w-full bg-[var(--vapor-color-background-normal-lighter)] ]"
            >
                <Tab value="Preview" className="rounded-t-none">
                    <Preview name={name} />
                </Tab>
                <Tab value="Code" className="rounded-t-none [&>figure]:bg-inherit">
                    {children}
                </Tab>
            </Tabs>
        </ErrorBoundary>
    );
}
