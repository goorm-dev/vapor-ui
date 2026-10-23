import * as React from 'react';

import { Text } from '@vapor-ui/core';

import { PreviewWrapper } from './preview-wrapper';

interface PreviewPageProps {
    searchParams: Promise<{
        file?: string;
        theme?: string;
    }>;
}

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

function isValidFile(file?: string): boolean {
    if (!file) return false;
    if (/\.\./.test(file)) return false;
    return /^[\w./()-]+\.tsx$/.test(file);
}

export default async function Page({ searchParams }: PreviewPageProps) {
    const resolvedSearchParams = await searchParams;
    const file = resolvedSearchParams.file;
    const theme = resolvedSearchParams.theme || 'light';

    if (!isValidFile(file)) {
        return <ComponentError file={file} error="Invalid file path" />;
    }

    return <PreviewWrapper theme={theme} file={file} />;
}
