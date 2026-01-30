import React from 'react';

import clsx from 'clsx';
import { CodeBlock as FDCodeBlock } from 'fumadocs-ui/components/codeblock';

export const CodeBlock = ({
    children,
    className,
    ...props
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <FDCodeBlock className={clsx('bg-v-canvas-200', className)} {...props}>
            {children}
        </FDCodeBlock>
    );
};
