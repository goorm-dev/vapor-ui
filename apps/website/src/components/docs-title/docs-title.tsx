import React from 'react';

import { Text } from '@vapor-ui/core';

const DocsTitle = ({ children }: { children: React.ReactNode }) => {
    return (
        <Text typography="heading1" foreground="contrast-100" render={<h1 />}>
            {children}
        </Text>
    );
};

export default DocsTitle;
