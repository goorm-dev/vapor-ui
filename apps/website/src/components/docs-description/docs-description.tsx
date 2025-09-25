import React from 'react';

import { Text } from '@vapor-ui/core';

const DocsDescription = ({ children }: { children: React.ReactNode }) => {
    return (
        <Text typography="body1" foreground="contrast-100" className="mb-0 whitespace-pre-line">
            {typeof children === 'string' ? children.replace(/\./g, '.\n') : children}
        </Text>
    );
};

export default DocsDescription;
