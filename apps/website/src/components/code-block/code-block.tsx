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
        <FDCodeBlock
            className={clsx(
                'm-0 border-0 rounded-none rounded-b-v-300 bg-v-normal-darker',
                className,
            )}
            {...props}
        >
            {children}
        </FDCodeBlock>
    );
};
