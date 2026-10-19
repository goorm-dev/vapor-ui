import * as React from 'react';

import { Text } from '@vapor-ui/core';

import { PreviewWrapper } from './preview-wrapper';

interface PreviewPageProps {
    searchParams: Promise<{
        path?: string;
        theme?: string;
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
            <Text typography="heading1" foreground="danger-100" render={<h1 />} className="mb-4">
                Component not found
            </Text>
            <Text typography="body2" foreground="danger-100">
                {error}
            </Text>
            {componentPath && (
                <Text typography="body2" foreground="danger-100">
                    {componentPath}
                </Text>
            )}
        </div>
    );
};

function isValidComponentPath(path?: string): boolean {
    if (!path) return false;

    const pathTraversalPattern = /\.\./;
    if (pathTraversalPattern.test(path)) return false;

    const validPathPattern = /^[a-zA-Z0-9/_-]+$/;
    return validPathPattern.test(path);
}

export default async function Page({ searchParams }: PreviewPageProps) {
    const resolvedSearchParams = await searchParams;
    const componentPath = resolvedSearchParams.path;
    const theme = resolvedSearchParams.theme || 'light';

    if (!isValidComponentPath(componentPath)) {
        return <ComponentError componentPath={componentPath} error="Invalid component path" />;
    }

    return <PreviewWrapper theme={theme} componentPath={componentPath} />;
}
