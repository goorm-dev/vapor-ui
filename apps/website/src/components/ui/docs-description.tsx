import React from 'react';

import { DocsDescription as FumadocsDocsDescription } from 'fumadocs-ui/page';

const DocsDescription = ({ children }: { children: React.ReactNode }) => {
    return (
        <FumadocsDocsDescription className="mb-0 whitespace-pre-wrap text-md">
            {children}
        </FumadocsDocsDescription>
    );
};

export default DocsDescription;
