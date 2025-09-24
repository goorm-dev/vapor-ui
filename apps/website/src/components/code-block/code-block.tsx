import React from 'react';

import clsx from 'clsx';
import { CodeBlock as FDCodeBlock } from 'fumadocs-ui/components/codeblock';

const CodeBlock = ({
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
                'm-0 border-0 rounded-none rounded-b-[var(--vapor-size-borderRadius-300)] bg-[var(--vapor-color-background-normal-darker)]',
                className,
            )}
            {...props}
        >
            {children}
        </FDCodeBlock>
    );
};

export default CodeBlock;
