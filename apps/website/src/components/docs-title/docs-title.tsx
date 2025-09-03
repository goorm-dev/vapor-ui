import React from 'react';

import { Text } from '@vapor-ui/core';

const DocsTitle = ({ children }: { children: React.ReactNode }) => {
    return (
        <Text typography="heading1" foreground="contrast" asChild>
            <h1>{children}</h1>
        </Text>
    );
};

export default DocsTitle;
