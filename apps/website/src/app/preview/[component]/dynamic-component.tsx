'use client';

import * as React from 'react';

import { Text } from '@vapor-ui/core';

import { EXAMPLE_LOADERS } from '~/components/demo/_examples.generated';

const ComponentError = ({ file, error }: { file: string | undefined; error: string }) => {
    return (
        <div className="p-5 text-center text-v-danger">
            <Text typography="heading1" foreground="danger-100" render={<h1 />} className="mb-4">
                Component not found
            </Text>
            <Text typography="body2" foreground="danger-100">
                {error}
            </Text>
            {file && (
                <Text typography="body2" foreground="danger-100">
                    {file}
                </Text>
            )}
        </div>
    );
};

function ComponentLoading() {
    return (
        <div className="p-5 text-center text-gray-500 bg-transparent">
            <div className="animate-spin w-6 h-6 border-2 border-v-gray-300 border-t-v-blue-500 rounded-full mx-auto mb-2" />
            <p>Loading component...</p>
        </div>
    );
}

function useDynamicComponent(file?: string) {
    const [component, setComponent] = React.useState<React.ComponentType | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (!file) {
            setError('No file provided');
            setIsLoading(false);
            return;
        }

        const key = file.startsWith('/') ? file : `/${file.replace(/^\.\//, '')}`;
        const loader = EXAMPLE_LOADERS[key];
        if (!loader) {
            setError(`Example not registered: ${key}`);
            setIsLoading(false);
            return;
        }

        const loadComponent = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const componentModule = await loader();
                if (componentModule.default) {
                    setComponent(() => componentModule.default);
                } else {
                    setError(`Component "${file}" does not have a default export`);
                }
            } catch (err) {
                setError(`Could not load component: ${file}. ${(err as Error).message}`);
            } finally {
                setIsLoading(false);
            }
        };

        loadComponent();
    }, [file]);

    return { component, error, isLoading };
}

export function DynamicComponent({ file }: { file?: string }) {
    const { component: Component, error, isLoading } = useDynamicComponent(file);

    if (error) {
        return <ComponentError file={file} error={error} />;
    }

    if (isLoading || !Component) {
        return <ComponentLoading />;
    }

    return <Component />;
}
