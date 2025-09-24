'use client';

import * as React from 'react';
import { Suspense } from 'react';

import { Text } from '@vapor-ui/core';

interface PreviewPageProps {
    searchParams: Promise<{
        path?: string;
    }>;
}

const ComponentError = ({
    componentPath,
    error,
}: {
    componentPath: string | undefined;
    error: string;
}) => {
    return (
        <div className="p-5 text-center text-v-danger">
            <Text typography="heading1" foreground="danger" render={<h1 />} className="mb-4">
                Component not found
            </Text>
            <Text typography="body2" foreground="danger">
                {error}
            </Text>
            {componentPath && (
                <Text typography="body2" foreground="danger">
                    {componentPath}
                </Text>
            )}
        </div>
    );
};

function ComponentLoading() {
    return (
        <div className="p-5 text-center text-gray-500">
            <div className="animate-spin w-6 h-6 border-2 border-v-gray-300 border-t-v-blue-500 rounded-full mx-auto mb-2" />
            <p>Loading component...</p>
        </div>
    );
}

function useDynamicComponent(componentPath?: string) {
    const [component, setComponent] = React.useState<React.ComponentType | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (!componentPath) {
            setError('No component path provided');
            setIsLoading(false);
            return;
        }

        const loadComponent = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const componentModule = await import(
                    `~/components/demo/examples/${componentPath}.tsx`
                );

                if (componentModule.default) {
                    setComponent(() => componentModule.default);
                } else {
                    setError(`Component "${componentPath}" does not have a default export`);
                }
            } catch (err) {
                console.error('Error loading component:', err);
                setError(`Could not load component: ${componentPath}`);
            } finally {
                setIsLoading(false);
            }
        };

        loadComponent();
    }, [componentPath]);

    return { component, error, isLoading };
}

function DynamicComponent({ componentPath }: { componentPath?: string }) {
    const { component: Component, error, isLoading } = useDynamicComponent(componentPath);

    if (error) {
        return <ComponentError componentPath={componentPath} error={error} />;
    }

    if (isLoading || !Component) {
        return <ComponentLoading />;
    }

    return <Component />;
}
export default function Page({ searchParams }: PreviewPageProps) {
    const resolvedSearchParams = React.use(searchParams);
    const componentPath = resolvedSearchParams.path;

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DynamicComponent componentPath={componentPath} />
        </Suspense>
    );
}
