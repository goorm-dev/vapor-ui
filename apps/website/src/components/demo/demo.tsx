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
            <Tabs items={['preview', 'code']} defaultValue="preview">
                <Tab value="preview" className="rounded-t-none">
                    <Preview name={name} />
                </Tab>
                <Tab value="code" className="rounded-t-none [&>figure]:bg-inherit">
                    {children}
                </Tab>
            </Tabs>
        </ErrorBoundary>
    );
}
