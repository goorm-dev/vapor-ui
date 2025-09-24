import React from 'react';

import { CodeBlock as FDCodeBlock } from 'fumadocs-ui/components/codeblock';

const CodeBlock = ({ children, ...props }: { children: React.ReactNode }) => {
    return (
        <FDCodeBlock className="m-0 bg-[var(--vapor-color-background-normal-darker)]" {...props}>
            {children}
        </FDCodeBlock>
    );
};

export default CodeBlock;
